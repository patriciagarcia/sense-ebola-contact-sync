'use strict';

/**
 * @ngdoc function
 * @name secsApp.controller:ContactsCtrl
 * @description
 * # ContactsCtrl
 * Controller of secsApp
 */
angular.module('secsApp')
  .controller('ContactsCtrl', function ($scope, $filter, ngTableParams, contactFactory) {
    $scope.contacts = [];

    var locals = $scope.locals = {
      tableParams: new ngTableParams({
        sorting: {
          lastName: 'asc'
        }
      }, {
        total: 0,
        getData: function($defer, params) {
          var orderedData = params.sorting() ?
                    $filter('orderBy')($scope.contacts, params.orderBy()) : $scope.contacts;
          $defer.resolve(orderedData);
        }
      })
    };

    contactFactory.orderedByName().then(function(contacts) {
      $scope.contacts = contacts;
      locals.tableParams.reload();
    });

    function toggleStatus(contact) {
      var newStatus = (contact.status === 'active' ? 'inactive' : 'active');
      contactFactory.update(contact._id, { 'status': newStatus})
        .then(function(updatedContact) {
            contact.status = updatedContact.status;
        });
    };

    $scope.toggleStatus = toggleStatus;
  });
