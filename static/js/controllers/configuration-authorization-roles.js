angular.module('inboxControllers').controller('ConfigurationAuthorizationRolesCtrl',
  function (
    $log,
    $scope,
    $translate,
    Settings,
    UpdateSettings
  ) {

    'use strict';
    'ngInject';

    $scope.loading = true;
    $scope.newRole = {};
    $scope.validation = {};

    var validate = function() {
      $scope.validation = {};
      if (!$scope.newRole.key) {
        $scope.validation.key = $translate.instant('field is required', {
          field: $translate.instant('configuration.role')
        });
      }
      if (!$scope.newRole.name) {
        $scope.validation.name = $translate.instant('field is required', {
          field: $translate.instant('translation.key')
        });
      }
      return Object.keys($scope.validation).length === 0;
    };

    var save = function(changes) {
      return UpdateSettings({ roles: changes }, { replace: true })
        .then(function() {
          $scope.newRole = {};
          $scope.roles = changes;
        })
        .catch(function(err) {
          $log.error('Error updating settings', err);
          $scope.submitting = false;
          $translate('Error saving settings').then(function(error) {
            $scope.error = error;
          });
        });
    };

    Settings()
      .then(function(settings) {
        $scope.loading = false;
        $scope.roles = settings.roles;
      })
      .catch(function(err) {
        $log.error('Error fetching settings', err);
        $scope.loading = false;
      });

    $scope.delete = function(deleteKey) {
      // clone the roles so the UI doesn't update yet
      var changes = {};
      Object.keys($scope.roles).forEach(function(key) {
        if (key !== deleteKey) {
          changes[key] = $scope.roles[key];
        }
      });
      $scope.deleting = true;
      save(changes).then(function() {
        $scope.deleting = false;
      });
    };

    $scope.add = function() {
      $scope.error = '';
      if (!validate()) {
        return;
      }
      $scope.submitting = true;
      // clone the roles so the UI doesn't update yet
      var changes = {};
      Object.keys($scope.roles).forEach(function(key) {
        changes[key] = $scope.roles[key];
      });
      changes[$scope.newRole.key] = { name: $scope.newRole.name };
      save(changes).then(function() {
        $scope.submitting = false;
      });
    };

  }
);
