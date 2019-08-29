const config = require('../config');
const messages = config.getTransitionsLib().messages;
const later = require('later');
const moment = require('moment');
const db = require('../db');
const lineage = require('@medic/lineage')(Promise, db.medic);

// set later to use local time
later.date.localTime();

const getReminderId = ({ reminder, date, placeId }) => `reminder:${reminder.form}:${date.valueOf()}:${placeId}`;

const getLeafPlaceIds = () => {
  const types = config.get('contact_types') || [];
  const placeTypes = types.filter(type => !type.person);
  const leafPlaceTypes = placeTypes.filter(type => {
    return placeTypes.every(inner => !inner.parents || !inner.parents.includes(type.id));
  });
  const keys = leafPlaceTypes.map(type => [ type.id ]);
  return db.medic
    .query('medic-client/contacts_by_type', { keys: keys })
    .then(result => result.rows.map(row => row.id));
};

const filterReminderPlaces = ({ reminder, date }, placeIds) => {
  const ids = placeIds.map(id => getReminderId({ reminder, date, id }));
  return db.medic.allDocs({ keys: ids }).then(result => {
    if (!result.rows) {
      return placeIds;
    }
    const exists = (row) => row.id && row.value && !row.value.deleted;
    return placeIds.filter((id, idx) => !exists(result.rows[idx]));
  });
};

const isConfigValid = (config) => {
  return Boolean(
    config &&
    config.form &&
    (config.message || config.translation_key) &&
    (config.text_expression || config.cron)
  );
};

const getSchedule = (config) => {
  // fetch a schedule based on the configuration, parsing it as a "cron"
  // or "text" statement see:
  // http://bunkat.github.io/later/parsers.html
  if (!config) {
    return;
  }
  if (config.text_expression) {
    // text expression takes precedence over cron
    return later.schedule(later.parse.text(config.text_expression));
  }
  if (config.cron) {
    return later.schedule(later.parse.cron(config.cron));
  }
};

const getReminderWindow = (reminder) => {
  const now = moment();
  // at the most, look a day back
  const since = now.clone().startOf('hour').subtract(1, 'day');
  const form = reminder && reminder.form;

  const options = {
    descending: true,
    limit: 1,
    startkey: `reminder:${form}:${now.valueOf()}:\ufff0`,
    endkey: `reminder:${form}:${since.valueOf()}:`
  };

  return db.medic.allDocs(options).then(result => {
    if (!result.rows || !result.rows.length) {
      return since;
    }
    return moment(parseInt(result.rows[0].id.split(':')[2]));
  });
};

// matches from "now" to the start of the last hour
// later reverses time ranges fro later#prev searches
const matchReminder = (reminder) => {
  const schedule = getSchedule(reminder);
  // this will return a moment sometime between the start of the hour and 24 hours ago
  // this is purely for efficiency so we're not always examining a 24 hour stretch
  return getReminderWindow(reminder)
    .then(end => {
      // this will return either the previous time the schedule should have run
      // or null if it should not have run in that window.
      const start = moment();
      const previous = schedule.prev(1, start.toDate(), end.toDate());
      return (previous instanceof Date) ? moment(previous) : false;
    });
};

const canSend = ({ reminder, date }, place) => {
  if (!place.contact) {
    // nobody to send to
    return false;
  }

  // if send, check for mute on reminder, and place has sent_forms for the reminder
  // sent_forms is maintained by the update_sent_forms transition
  if (reminder.mute_after_form_for && place.sent_forms && place.sent_forms[reminder.form]) {
    const lastReceived = moment(place.sent_forms[reminder.form]);
    const muteDuration = parseDuration(reminder.mute_after_form_for);

    if (lastReceived && muteDuration) {
      // if it should mute due to being in the mute duration
      return date.isAfter(lastReceived.add(muteDuration));
    }
  }

  return true;
};

// returns strings like "1 day" as a moment.duration
const durationRegex = /^\d+ (minute|day|hour|week)s?$/;
const parseDuration = (format) => {
  if (!durationRegex.test(format)) {
    return;
  }

  const tokens = format.split(' ');
  return moment.duration(Number(tokens[0]), tokens[1]);
};

const getLeafPlaces = (options) => {
  return getLeafPlaceIds()
  // filter places that do not have this reminder
    .then(placeIds => filterReminderPlaces(options, placeIds))
    .then(placeIds => db.medic.allDocs({ keys: placeIds, include_docs: true }))
    .then(response => {
      // filter them by the canSend function (not on cooldown from having received a form)
      const leafPlaces = response.rows
        .map(row => row.doc)
        .filter(doc => canSend(options, doc));
      return lineage.hydrateDocs(leafPlaces);
    });
};

const createReminder = ({ reminder, date, place }) => {
  const context = {
    templateContext: {
      week: date.format('w'),
      year: date.format('YYYY')
    },
    patient: place
  };

  const doc = {
    _id: getReminderId({ reminder, date, placeId: place._id }),
    type: 'reminder',
    contact: lineage.minifyLineage(place.contact),
    place: { _id: place._id, parent: lineage.minifyLineage(place.parent) },
    form: reminder.form,
    reported_date: new Date().getTime(),
  };
  const task = messages.addMessage(doc, reminder, 'reporting_unit', context);
  if (!task || task.messages[0].to === 'reporting_unit') {
    return;
  }
  task.form = reminder.form;
  task.timestamp = date.toISOString();
  task.type = 'reminder';

  return doc;
};

const sendReminders = ({ reminder, date }) => {
  return getLeafPlaces({ reminder, date }).then(places => {
    const docs = places
      .map(place => createReminder({ reminder, date, place }))
      .filter(doc => doc);

    return db.medic.bulkDocs(docs);
  });
};

const runReminder = (reminder = {}) => {
  // see if the reminder should run in the given window
  return matchReminder(reminder).then(date => {
    if (!date) {
      return;
    }
    return sendReminders({ reminder, date });
  });
};

module.exports = {
  // called from schedule/index.js every 5 minutes, for now
  execute: callback => {
    const reminders = config.get('reminders') || [];
    return reminders
      .filter(reminder => isConfigValid(reminder))
      .reduce((p, reminder) => p.then(() => runReminder(reminder)), Promise.resolve())
      .then(() => callback())
      .catch(callback);
  },
};
