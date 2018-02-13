angular.module('inboxServices').factory('RecurringProcessManager',
  function(
    $interval,
    RelativeDate
  ) {
    'use strict';
    'ngInject';

    var recurringProcesses = {
      updateRelativeDates: false
    };

    return {
      startUpdateRelativeDate: function() {
        if (recurringProcesses.updateRelativeDates) {
          $interval.cancel(recurringProcesses.updateRelativeDates);
        }

        recurringProcesses.updateRelativeDates = $interval(
          RelativeDate.updateRelativeDates,
          10 * 60 * 1000,
          false //don't digest
        );
      },
      stopUpdateRelativeDate: function() {
        if (recurringProcesses.updateRelativeDates) {
          $interval.cancel(recurringProcesses.updateRelativeDates);
          recurringProcesses.updateRelativeDates = false;
        }
      }
    };
  }
);
