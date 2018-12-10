var _ = require('underscore');

/**
 * Gets data records by the given array of ids.
 *
 * If options.include_docs is false, returns the summary, eg:
 *    {
 *      _id: 'myuuid',
 *      name: 'John Smith',
 *      type: 'person',
 *      lineage: [ 'Dunedin' ]
 *    }
 * The summary will contain different data based on the doc type,
 * as defined in the doc_summaries_by_id view.
 *
 * If options.include_docs is true, returns the full doc.
 */

angular.module('inboxServices').factory('GetDataRecords',
  function(
    $q,
    DB,
    HydrateContactNames,
    GetSubjectSummaries,
    GetSummaries
  ) {

    'use strict';
    'ngInject';

    var getDocs = function(ids) {
      return DB()
        .allDocs({ keys: ids, include_docs: true })
        .then(function(response) {
          return _.pluck(response.rows, 'doc');
        });
    };

    const getSummaries = function(ids, options) {
      return GetSummaries(ids)
        .then(summaries => {
          // REVIEWER: Suspect a better interface for this is hydrateContactNames defaulting as false. Consumer should explicitly ask for hydration.
          const promiseToSummary = options.hydrateContactNames ? HydrateContactNames(summaries) : Promise.resolve(summaries);
          return promiseToSummary.then(GetSubjectSummaries);
        });
    };

    return function(ids, options) {
      options = _.defaults(options || {}, {
        hydrateContactNames: true,
        include_docs: false,
      });
      
      if (!ids) {
        return $q.resolve([]);
      }
      var arrayGiven = _.isArray(ids);
      if (!arrayGiven) {
        ids = [ ids ];
      }
      if (!ids.length) {
        return $q.resolve([]);
      }
      const getFn = options.include_docs ? getDocs : ids => getSummaries(ids, options);
      return getFn(ids)
        .then(function(response) {
          if (!arrayGiven) {
            response = response.length ? response[0] : null;
          }
          return response;
        });
    };
  }
);
