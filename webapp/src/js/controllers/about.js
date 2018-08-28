angular.module('inboxControllers').controller('AboutCtrl',
  function (
    $interval,
    $log,
    $scope,
    DB,
    Debug,
    Session
  ) {
    'use strict';
    'ngInject';

    $scope.url = window.location.hostname;
    $scope.userCtx = Session.userCtx();

    DB({remote: true}).allDocs({ key: '_design/medic' })
      .then(function(info) {
        $scope.ddocVersion = info.rows[0].value.rev.split('-')[0];
      })
      .catch(function(err) {
        $log.debug('Couldnt access _design/medic for about section', err);
        $scope.ddocVersion = 'offline'; // TODO translate?
      });

    var getDeployVersion = function(buildInfo) {
      if (!buildInfo || !buildInfo.version) {
        return false;
      }

      if (buildInfo.version === buildInfo.base_version || !buildInfo.base_version) {
        return buildInfo.version;
      } else {
        return buildInfo.version + ' (~' + buildInfo.base_version + ')';
      }
    };

    DB().allDocs({ key: '_design/medic-client', include_docs: true })
      .then(function(info) {
        $scope.version = getDeployVersion(info.rows[0].doc.deploy_info) || $scope.version;
        $scope.clientDdocVersion = info.rows[0].value.rev.split('-')[0];
      })
      .catch(function(err) {
        $log.error('Couldnt access _design/medic-client for about section', err);
      });

    DB()
      .get('medic-deploy-info')
      .then(function(doc) {
        var getDeployVersion = function(deployInfo) {
          if (!deployInfo || !deployInfo.version) {
            return false;
          }

          if (deployInfo.version === deployInfo.base_version || !deployInfo.base_version) {
            return deployInfo.version;
          } else {
            return deployInfo.version + ' (~' + deployInfo.base_version + ')';
          }
        };

        $scope.version = getDeployVersion(doc.deploy_info) || $scope.version;
      });

    $scope.reload = function() {
      window.location.reload(false);
    };
    $scope.enableDebugModel = {
      val: Debug.get()
    };
    $scope.$watch('enableDebugModel.val', Debug.set);

    if (window.medicmobile_android && typeof window.medicmobile_android.getDataUsage === 'function') {
      $scope.androidDataUsage = JSON.parse(window.medicmobile_android.getDataUsage());

      var dataUsageUpdate = $interval(function() {
        $scope.androidDataUsage = JSON.parse(window.medicmobile_android.getDataUsage());
      }, 2000);

      $scope.$on('$destroy', function() {
        $interval.cancel(dataUsageUpdate);
      });
    }

    DB().info().then(function (result) {
      $scope.dbInfo = result;
    }).catch(function (err) {
      $log.error('Failed to fetch DB info', err);
    });
  }
);
