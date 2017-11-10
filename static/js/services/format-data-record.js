var _ = require('underscore'),
    messages = require('../modules/message-utils');

angular.module('inboxServices').factory('FormatDataRecord',
  function(
    $log,
    $q,
    AppInfo,
    DB,
    Language
  ) {

    'ngInject';
    'use strict';

    var getRegistrations = function(patientId) {
      var options = {
        key: patientId,
        include_docs: true
      };
      return DB().query('medic-client/registered_patients', options)
        .then(function(result) {
          return result.rows.map(function(row) {
            return row.doc;
          });
        });
    };

    var getPatient = function(patientId) {
      var options = {
        key: [ 'shortcode', patientId ],
        include_docs: true
      };
      return DB().query('medic-client/contacts_by_reference', options)
        .then(function(result) {
          if (!result.rows.length) {
            return;
          }
          if (result.rows.length > 1) {
            $log.warn('More than one patient person document for shortcode "' + patientId + '"');
          }
          return result.rows[0].doc;
        });
    };

    var getLabel = function(appinfo, field, locale) {
      return appinfo.getMessage(field.labels && field.labels.short, locale);
    };

    var fieldsToHtml = function(appinfo, keys, labels, data_record, def, locale) {

      if (!def && data_record && data_record.form) {
        def = appinfo.getForm(data_record.form);
      }

      if (_.isString(def)) {
        def = appinfo.getForm(def);
      }

      var fields = {
        headers: [],
        data: []
      };

      var data = _.extend({}, data_record, data_record.fields);

      _.each(keys, function(key) {
        if(_.isArray(key)) {
          fields.headers.push({head: titleize(key[0])});
          fields.data.push(_.extend(
            fieldsToHtml(key[1], labels, data[key[0]], def, locale),
            {isArray: true}
          ));
        } else {
          var label = labels.shift();
          fields.headers.push({head: appinfo.getMessage(label)});
          if (def && def[key]) {
            def = def[key];
          }
          fields.data.push({
            isArray: false,
            value: prettyVal(appinfo, data, key, def, locale),
            label: label
          });
        }
      });

      return fields;
    };

    /*
     * Get an array of keys from the form.  If dot notation is used it will be an
     * array of arrays.
     *
     * @param Object def - form definition
     *
     * @return Array  - form field keys based on forms definition
     */
    var getFormKeys = function(def) {

      var keys = {};

      var getKeys = function(key, hash) {
        if(key.length > 1) {
          var tmp = key.shift();
          if(!hash[tmp]) {
            hash[tmp] = {};
          }
          getKeys(key, hash[tmp]);
        } else {
          hash[key[0]] = '';
        }
      };

      var hashToArray = function(hash) {
        var array = [];

        _.each(hash, function(value, key) {
          if(typeof value === 'string') {
            array.push(key);
          } else {
            array.push([key, hashToArray(hash[key])]);
          }
        });

        return array;
      };

      if (def) {
        Object.keys(def.fields).forEach(function(key) {
          getKeys(key.split('.'), keys);
        });
      }

      return hashToArray(keys);
    };

    var translateKey = function(appinfo, key, field, locale) {
      var label;

      if (field) {
        label = getLabel(appinfo, field, locale);
      } else {
        label = appinfo.translate(key, locale);
      }
      // still haven't found a proper label; then titleize
      if (key === label) {
        return titleize(key);
      } else {
        return label;
      }
    };

    // returns the deepest array from `key`
    var unrollKey = function(array) {
      var target = [].concat(array),
          root = [];

      while (_.isArray(_.last(target))) {
        root.push(_.first(target));
        target = _.last(target);
      }

      return _.map(target, function(item) {
        return root.concat([item]).join('.');
      });
    };

    /**
     * Return a title-case version of the supplied string.
     * @name titleize(str)
     * @param str The string to transform.
     * @returns {String}
     */
    var titleize = function(s) {
      return s.trim()
              .toLowerCase()
              .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
              .replace(/[-\s]+/g, '_')
              .replace(/_/g, ' ')
              .replace(/(?:^|\s|-)\S/g, function(c) {
                return c.toUpperCase();
              });
    };

    /*
     * @param {Object} data_record - typically a data record or portion (hash)
     * @param {String} key - key for field
     * @param {Object} def - form or field definition
     */
    var prettyVal = function(appinfo, data_record, key, def, locale) {

      if (!data_record || _.isUndefined(key) || _.isUndefined(data_record[key])) {
        return;
      }

      var val = data_record[key];

      if (!def) {
        return val;
      }

      if (def.fields && def.fields[key]) {
        def = def.fields[key];
      }

      if (def.type === 'boolean') {
        return val === true ? 'True' : 'False';
      }
      if (def.type === 'date') {
        return appinfo.formatDate(data_record[key]);
      }
      if (def.type === 'integer') {
        // use list value for month
        if (def.validate && def.validate.is_numeric_month) {
          if (def.list) {
            for (var i in def.list) {
              if (def.list.hasOwnProperty(i)) {
                var item = def.list[i];
                if (item[0] === val) {
                  return appinfo.translate(item[1], locale);
                }
              }
            }
          }
        }
      }
      return val;

    };


    /*
     * With some forms like ORPT (patient registration), we add additional data to
     * it based on other form submissions.  Form data from other reports is used to
     * create these fields and it is useful to show these new fields in the data
     * records screen/render even though they are not defined in the form.
     */
    var includeNonFormFields = function(appinfo, doc, form_keys, locale) {

      var fields = [
        'mother_outcome',
        'child_birth_outcome',
        'child_birth_weight',
        'child_birth_date',
        'expected_date',
        'birth_date',
        'patient_id'
      ];

      var dateFields = [
        'child_birth_date',
        'expected_date',
        'birth_date'
      ];

      _.each(fields, function(field) {
        var label = appinfo.translate(field, locale),
            value = doc[field];

        // Only include the property if we find it on the doc and not as a form
        // key since then it would be duplicated.
        if (!value || form_keys.indexOf(field) !== -1) {
          return;
        }

        if (_.contains(dateFields, field)) {
          value = appinfo.formatDate(value);
        }

        doc.fields.data.unshift({
          label: label,
          value: value,
          isArray: false,
          generated: true
        });

        doc.fields.headers.unshift({
          head: label
        });

      });
    };

    var getGroupName = function(task) {
      if (task.group) {
        return task.type + ':' + task.group;
      }
      return task.type;
    };

    var getGroupDisplayName = function(appinfo, task, language) {
      if (task.translation_key) {
        return appinfo.translate(
          task.translation_key, language, { group: task.group }
        );
      }
      return getGroupName(task);
    };

    /*
     * Fetch labels from translation strings or jsonform object, maintaining order
     * in the returned array.
     *
     * @param Array keys - keys we want to resolve labels for
     * @param String form - form code string
     * @param String locale - locale string, e.g. 'en', 'fr', 'en-gb'
     *
     * @return Array  - form field labels based on forms definition.
     *
     * @api private
     */
    var getLabels = function(appinfo, keys, form, locale) {

      var def = appinfo.getForm(form),
          fields = def && def.fields;

      return _.reduce(keys, function(memo, key) {
        var field = fields && fields[key];

        if (_.isString(key)) {
          memo.push(translateKey(appinfo, key, field, locale));
        } else if (_.isArray(key)) {
          _.each(unrollKey(key), function(key) {
            var field = fields && fields[key];
            memo.push(translateKey(appinfo, key, field, locale));
          });
        }

          return memo;
      }, []);
    };


    /*
     * Take data record document and return nice formated JSON object.
     */
    var makeDataRecordReadable = function(doc, appinfo, language, options) {

      var data_record = doc;

      // adding a fields property for ease of rendering code
      if(data_record.form && data_record.content_type !== 'xml') {
        var keys = getFormKeys(appinfo.getForm(data_record.form));
        var labels = getLabels(appinfo, keys, data_record.form, language);
        data_record.fields = fieldsToHtml(appinfo, keys, labels, data_record, language);
        includeNonFormFields(appinfo, data_record, keys, language);
      }

      if(data_record.scheduled_tasks) {
        console.log('doc', doc);
        data_record.scheduled_tasks_by_group = [];
        var groups = {};
        data_record.scheduled_tasks.forEach(function(t) {
          // avoid crash if item is falsey
          if (!t) {
            return;
          }

          var copy = _.clone(t);

          if (copy.state === 'scheduled' && // not yet sent
            !copy.messages) { // backwards compatibility
            copy.messages = messages.generate(appinfo, data_record, copy, options);
          }
          console.log('copy', copy);
          if (t.due) {
            copy.due = t.due;
          }

          // timestamp is used for sorting in the frontend
          if (t.timestamp) {
            copy.timestamp = t.timestamp;
          } else if (t.due) {
            copy.timestamp = t.due;
          }

          // setup scheduled groups

          var groupName = getGroupName(t);
          var displayName = getGroupDisplayName(appinfo, t, language);
          var group = groups[groupName];
          if (!group) {
            groups[groupName] = group = {
              group: groupName,
              name: displayName,
              type: t.type,
              number: t.group,
              rows: []
            };
          }
          group.rows.push(copy);
        });
        Object.keys(groups).forEach(function(key) {
          data_record.scheduled_tasks_by_group.push(groups[key]);
        });
      }

      /*
       * Prepare outgoing messages for render. Reduce messages to organize by
       * properties: sent_by, from, state and message.  This helps for easier
       * display especially in the case of bulk sms.
       *
       * messages = [
       *    {
       *       recipients: [
       *          {
       *              to: '+123',
       *              facility: <facility>,
       *              timestamp: <timestamp>,
       *              uuid: <uuid>,
       *          },
       *          ...
       *        ],
       *        sent_by: 'admin',
       *        from: '+998',
       *        state: 'sent',
       *        message: 'good morning'
       *    }
       *  ]
       */
      if (data_record.kujua_message) {
        var outgoing_messages = [],
            outgoing_messages_recipients = [];
        _.each(data_record.tasks, function(task) {
          _.each(task.messages, function(msg) {
            var recipient = {
              to: msg.to,
              facility: msg.facility,
              timestamp: task.timestamp,
              uuid: msg.uuid
            };
            var done = false;
            // append recipient to existing
            _.each(outgoing_messages, function(m) {
              if (msg.message === m.message &&
                  msg.sent_by === m.sent_by &&
                  msg.from === m.from &&
                  task.state === m.state) {
                m.recipients.push(recipient);
                outgoing_messages_recipients.push(recipient);
                done = true;
              }
            });
            // create new entry
            if (!done) {
              outgoing_messages.push({
                recipients: [recipient],
                sent_by: msg.sent_by,
                from: msg.from,
                state: task.state,
                message: msg.message
              });
              outgoing_messages_recipients.push(recipient);
            }
          });
        });
        data_record.outgoing_messages = outgoing_messages;
        data_record.outgoing_messages_recipients = outgoing_messages_recipients;
      }

      return data_record;
    };

    return function(doc) {
      var promises = [ AppInfo(), Language() ];
      var patientId = doc.patient_id || (doc.fields && doc.fields.patient_id);
      if (doc.scheduled_tasks && patientId) {
        promises.push(getPatient(patientId));
        promises.push(getRegistrations(patientId));
      }
      console.log('patient id', patientId);
      return $q.all(promises)
        .then(function(results) {
          var appInfo = results[0];
          var language = results[1];
          var options = {};
          if (results.length === 4) {
            options.patient = results[2];
            options.registrations = results[3];
          }
          console.log('options', options);
          return makeDataRecordReadable(doc, appInfo, language, options);
        });
    };
  }
);
