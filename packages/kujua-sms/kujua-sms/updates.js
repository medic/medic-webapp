/**
 * Update functions to be exported from the design doc.
 */

var _ = require('underscore')._,
    logger = require('./utils').logger,
    smsforms = require('views/lib/smsforms'),
    smsparser = require('views/lib/smsparser');


/**
 * Merge fields from the smsforms definition with
 * the form data received through the SMS into
 * a data record.
 *
 * @param {Array}  key          - key of the field separated by '.'
 * @param {Object} data_record  - record into which the data is merged
 * @param {Object} form_data    - data from the SMS
 *                                to be merged into the data record
 * @api private
 */
var merge = function(key, data_record, form_data) {
    if(key.length > 1) {
        var tmp = key.shift();
        if(form_data[tmp]) {
            if(!data_record[tmp]) {
                data_record[tmp] = {};
            }
            merge(key, data_record[tmp], form_data[tmp]);            
        }
    } else {
        data_record[key[0]] = form_data[key[0]][0];
    }
};

/**
 * @param {String} form - smsforms key string
 * @param {Object} form_data - parsed form data
 * @returns {String} - Referral ID value
 * @api private
 */
var getRefID = function(form, form_data) {
    switch(form) {
        case 'MSBC':
            return form_data.cref_rc[0];
        case 'MSBB':
            return form_data.ref_rc[0];
        case 'MSBR':
            return form_data.ref_rc[0];
    }
};

/**
 * @param {String} phone - phone number of the sending phone (from)
 * @param {String} form - smsforms key string
 * @param {Object} form_data - parsed form data
 * @returns {Object} - body for callback
 * @api private
 */
var getCallbackBody = function(phone, form, form_data) {
    logger.debug(['getCallbackBody arguments', arguments]);

    var body = {
        type: 'data_record',
        from: phone,
        form: form,
        form_data: form_data,
        related_entities: {clinic: null},
        errors: [],
        tasks: []
    };

    if (smsforms.isReferralForm(form)) {
        body.refid = getRefID(form, form_data);
    }

    _.each(smsforms[form].fields, function(field) {
        merge(field.key.split('.'), body, form_data);        
    });

    return body;
};

/**
 * @param {String} phone - phone number of the sending phone (from)
 * @param {String} form - smsforms key string
 * @param {Object} form_data - parsed form data
 * @returns {String} - Path for callback
 * @api private
 */
var getCallbackPath = function(phone, form, form_data) {
    logger.debug(['updates.getCallbackPath arguments', arguments]);

    var path = '';

    switch(form) {
        case 'MSBC':
            path = '/%1/data_record/add/refid/%2'
                      .replace('%1', encodeURIComponent(form))
                      .replace('%2', encodeURIComponent(
                          getRefID(form, form_data)));
            break;
        case 'MSBB':
            path = '/%1/data_record/add/health_center/%2'
                      .replace('%1', encodeURIComponent(form))
                      .replace('%2', encodeURIComponent(phone));
            break;
        default:
            path = '/%1/data_record/add/clinic/%2'
                      .replace('%1', encodeURIComponent(form))
                      .replace('%2', encodeURIComponent(phone));
    }

    return path;
};


/*
 * Return Ushahidi SMSSync compatible response message.  Supports custom
 * auto-reply message in the form definition. Also uses callbacks to create
 * 1st phase of tasks_referral doc.
 */
var getRespBody = function(doc, req) {
    logger.debug('getRespBody jsDump.parse(req)');
    logger.debug(req);

    var form = doc.form,
        def = smsforms[form],
        form_data = smsparser.parse(form, def, doc, 1),
        baseURL = require('duality/core').getBaseURL(),
        headers = req.headers.Host.split(":"),
        host = headers[0],
        port = headers[1] || "",
        phone = doc.from, // set by gateway
        autoreply = smsforms.getResponse('success'),
        errormsg = '',
        resp = {
            //smssync gateway response format
            payload: {
                success: true,
                task: "send",
                messages: [{
                    to: phone,
                    message: autoreply}]}};

    if (!doc.message || !doc.message.trim()) {
        errormsg = smsforms.getResponse('error', doc.locale);
    } else if (!form || !def) {
        errormsg = smsforms.getResponse('form_not_found', doc.locale)
                  .replace('%(form)', form || 'NULL');
    }

    if (errormsg) {
        // TODO integrate with kujua notifications
        logger.error({'error':errormsg, 'doc':doc});
        resp.payload.messages[0].message = errormsg;
        logger.debug(resp);
        return JSON.stringify(resp);
    }

    if (def.autoreply) {
        resp.payload.messages[0].message = def.autoreply;
    }

    // provide callback for next part of record creation.
    resp.callback = {
        options: {
            host: host,
            port: port,
            path: baseURL + getCallbackPath(phone, form, form_data),
            method: "POST",
            headers: {'Content-Type': 'application/json; charset=utf-8'}},
        data: getCallbackBody(phone, form, form_data)};

    // pass through Authorization header
    if(req.headers.Authorization) {
        resp.callback.options.headers.Authorization = req.headers.Authorization;
    }

    // keep sms_message part of record
    resp.callback.data.sms_message = doc;

    logger.debug(resp);

    return JSON.stringify(resp);
};
exports.getRespBody = getRespBody;

exports.add_sms = function (doc, req) {
    // TODO add validation if necessary
    var new_doc = _.extend(req.form, {
        _id: req.uuid,
        type: "sms_message",
        locale: req.query.locale || 'en',
        form: smsparser.getForm(req.form.message),
        created: new Date()
    });
    return [new_doc, getRespBody(new_doc, req)];
};

exports.add = function (doc, req) {
};

