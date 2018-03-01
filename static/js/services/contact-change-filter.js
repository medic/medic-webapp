/**
 * Service to identify relevant changes from Changes feed for contacts
 */
var _ = require('underscore');

angular.module('inboxServices').factory('ContactChangeFilter',
  function(ContactSchema) {
    'ngInject';
    'use strict';

    var isValidInput = function(change, contact) {
      return !!change && !!change.doc && !!contact && !!contact.doc;
    };

    var isContact = function(change) {
      var isValidDocType = function() {
        return ContactSchema.getTypes().indexOf(change.doc.type) !== -1;
      };
      return !!change.doc.type && isValidDocType();
    };

    var isReport = function(change) {
      return change.doc.form && change.doc.type === 'data_record';
    };

    var matchReportSubject = function(report, contact) {
      if (report.doc.fields && (
          (report.doc.fields.patient_uuid && report.doc.fields.patient_uuid === contact.doc._id) ||
          (report.doc.fields.patient_id && report.doc.fields.patient_id === contact.doc.patient_id) ||
          (report.doc.fields.place_id && report.doc.fields.place_id === contact.doc._id) ||
          (report.doc.fields.place_id && report.doc.fields.place_id === contact.doc.place_id)
        )) {
        return true;
      }

      if ((report.doc.patient_id && report.doc.patient_id === contact.doc.patient_id) ||
        (report.doc.place_id && report.doc.place_id === contact.doc.place_id)) {
        return true;
      }

      return false;
    };

    var isChild = function(change, contact) {
      return !!change.doc.parent && change.doc.parent._id === contact.doc._id;
    };

    var wasChild = function(change, contact) {
      if (!contact.children) {
        return false;
      }
      return !!_.find(contact.children, function(children) {
        return children instanceof Array && _.find(children, function(child) {
          return child.doc._id === change.doc._id;
        });
      });
    };

    var isAncestor = function(change, contact) {
      if (!contact.lineage || !contact.lineage.length) {
        return false;
      }

      return !!_.find(contact.lineage, function(lineage) {
        return lineage._id === change.doc._id;
      });
    };


    return {
      matchContact: function(change, contact) {
        if (!isValidInput(change, contact)) {
          return false;
        }

        return contact.doc._id === change.doc._id;
      },
      isRelevantReport: function(change, contact) {
        if (!isValidInput(change, contact) || !isReport(change)) {
          return false;
        }

        if (matchReportSubject(change, contact)) {
          return true;
        }

        if (!contact.children) {
          return false;
        }

        return !!_.find(contact.children, function(children) {
          return children instanceof Array && _.find(children, function(child) {
            return matchReportSubject(change, child);
          });
        });
      },
      isRelevantContact: function(change, contact) {
        if (!isValidInput(change, contact)) {
          return false;
        }

        return isContact(change) &&
          (isAncestor(change, contact) || isChild(change, contact) || wasChild(change, contact));
      },
      isDeleted: function(change) {
        return !!change && !!change.deleted;
      }
    };
  }
);
