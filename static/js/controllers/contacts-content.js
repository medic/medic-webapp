var _ = require('underscore'),
    moment = require('moment');

angular.module('inboxControllers').controller('ContactsContentCtrl',
  function(
    $log,
    $q,
    $scope,
    $state,
    $stateParams,
    $translate,
    Auth,
    Changes,
    ContactViewModelGenerator,
    Snackbar,
    TasksForContact,
    TranslateFrom,
    UserSettings,
    ContactChangeFilter,
    Debounce
  ) {

    'use strict';
    'ngInject';

    var taskEndDate,
        reportStartDate,
        debounceWait = 1000,
        debouncedReloadContact;

    $scope.filterTasks = function(task) {
      return !taskEndDate || taskEndDate.isAfter(task.date);
    };
    $scope.filterReports = function(report) {
      return !reportStartDate || reportStartDate.isBefore(report.reported_date);
    };

    $scope.setReportsTimeWindowMonths = function(months) {
      $scope.reportsTimeWindowMonths = months;
      reportStartDate = months ? moment().subtract(months, 'months') : null;
    };

    $scope.setTasksTimeWindowWeeks = function(weeks) {
      $scope.tasksTimeWindowWeeks = weeks;
      taskEndDate = weeks ? moment().add(weeks, 'weeks') : null;
    };

    $scope.setTasksTimeWindowWeeks(1);
    $scope.setReportsTimeWindowMonths(3);

    var getHomePlaceId = function() {
      return UserSettings()
        .then(function(user) {
          return user && user.facility_id;
        })
        .catch(function(err) {
          $log.error('Error fetching user settings', err);
        });
    };

    var getTasks = function() {
      return Auth('can_view_tasks')
        .then(function() {
          $scope.selected.tasks = [];
          var children = $scope.selected.children.persons || [];
          TasksForContact(
            $scope.selected.doc._id,
            $scope.selected.doc.type,
            _.pluck(children, 'id'),
            'ContactsContentCtrl',
            function(areTasksEnabled, tasks) {
              if ($scope.selected) {
                tasks.forEach(function(task) {
                  if (_.isString(task.title)) {
                    // new translation key style
                    task.title = $translate.instant(task.title, task);
                  } else {
                    // old message array style
                    task.title = TranslateFrom(task.title, task);
                  }
                });
                $scope.selected.areTasksEnabled = areTasksEnabled;
                $scope.selected.tasks = tasks;
                children.forEach(function(child) {
                  child.taskCount = tasks.filter(function(task) {
                    return task.doc &&
                           task.doc.contact &&
                           task.doc.contact._id === child.doc._id;
                  }).length;
                });
                if (!$scope.$$phase) {
                  $scope.$apply();
                }
              }
            });
        })
        .catch(function() {
          $log.debug('Not authorized to view tasks');
        });
    };

    var selectContact = function(id, silent) {
      if (!silent) {
        $scope.setLoadingContent(id);
      }
      return ContactViewModelGenerator(id)
        .then(function(model) {
          var refreshing = ($scope.selected && $scope.selected.doc._id) === id;
          $scope.setSelected(model);
          $scope.settingSelected(refreshing);
          return getTasks();
        })
        .catch(function(err) {
          if (err.code === 404 && !silent) {
            $translate('error.404.title').then(Snackbar);
          }
          $scope.clearSelected();
          $log.error('Error generating contact view model', err, err.message);
        });
    };

    // exposed solely for testing purposes
    this.setupPromise = $q.resolve().then(function() {
      if ($stateParams.id) {
        return selectContact($stateParams.id);
      }
      $scope.clearSelected();
      if ($scope.isMobile()) {
        return;
      }
      return getHomePlaceId().then(function(id) {
        if (id) {
          return selectContact(id, true);
        }
      });
    });

    var reloadContact = function() {
      return selectContact($scope.selected.doc._id, true);
    };
    debouncedReloadContact = Debounce(reloadContact, debounceWait);

    var changeListener = Changes({
      key: 'contacts-content',
      filter: function(change) {
        return ContactChangeFilter.matchContact(change, $scope.selected) ||
               ContactChangeFilter.isRelevantContact(change, $scope.selected) ||
               ContactChangeFilter.isRelevantReport(change, $scope.selected);
      },
      callback: function(change) {
        if (ContactChangeFilter.matchContact(change, $scope.selected) && ContactChangeFilter.isDeleted(change)) {
          var parentId = $scope.selected.doc.parent && $scope.selected.doc.parent._id;
          debouncedReloadContact.cancel();
          if (parentId) {
            // redirect to the parent
            $state.go($state.current.name, {id: parentId});
          } else {
            // top level contact deleted - clear selection
            $scope.clearSelected();
          }
          return;
        }

        return debouncedReloadContact();
      }
    });

    $scope.$on('$destroy', function() {
      changeListener.unsubscribe();
      debouncedReloadContact.cancel();
    });
  }
);
