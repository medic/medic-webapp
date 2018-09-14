var moment = require('moment');

angular.module('controllers').controller('MessageQueueCtrl',
  function(
    $log,
    $q,
    $scope,
    $state,
    MessageQueue,
    Settings
  ) {

    'use strict';
    'ngInject';

    var delayInterval = 5 * 60 * 1000, // 5 minutes
        tab = $state.current.data.tab,
        descending = $state.current.data.descending;

    var normalizePage = function(page) {
      page = parseInt(page);
      if (isNaN(page) || page <= 0) {
        return 1;
      }
      return page;
    };

    $scope.pagination = {
      page: normalizePage($state.params.page),
      perPage: 25,
      pages: 0
    };
    $scope.displayLastUpdated = tab !== 'scheduled';
    $scope.loading = true;

    var formatMessages = function(messages) {
      if (tab === 'due') {
        var transitionalStates = [ 'pending', 'forwarded-to-gateway', 'forwarded-by-gateway', 'received', 'sent' ],
            now = moment();
        messages.forEach(function (message) {
          if (transitionalStates.indexOf(message.state) !== -1 && message.stateHistory) {
            message.delayed = now.diff(message.stateHistory.timestamp) > delayInterval;
          }
        });
      }

      return messages;
    };

    var query = function() {
      $scope.loading = true;
      $scope.messages = [];
      var skip = ($scope.pagination.page - 1) * $scope.pagination.perPage;
      // change the state without triggering controller reinitialization
      $state.go('.', { page: $scope.pagination.page }, { notify: false });

      return MessageQueue
        .query(tab, skip, $scope.pagination.perPage, descending)
        .then(function(result) {
          if (!result.messages.length && $scope.pagination.page > 1) {
            // we've navigated out of scope, return to page 1
            return $scope.loadPage(1);
          }

          $scope.messages = formatMessages(result.messages);
          $scope.pagination.pages = Math.ceil(result.total / $scope.pagination.perPage);
          $scope.pagination.total = result.total;

          $scope.error = false;
        })
        .catch(function(err) {
          $log.error('Error fetching messages', err);
          $scope.error = true;
        })
        .then(function() {
          $scope.loading = false;
        });
    };

    $scope.loadPage = function(page) {
      page = normalizePage(page);
      if ($scope.pagination.pages && $scope.pagination.pages < page) {
        return;
      }

      $scope.pagination.page = page;
      return query();
    };

    $q.all([
        Settings(),
        MessageQueue.loadTranslations()
      ])
      .then(function(results) {
        $scope.dateFormat = results[0] && results[0].reported_date_format;
        return query();
      })
      .catch(function(err) {
        $log.error('Error fetching settings', err);
      });
  }
);
