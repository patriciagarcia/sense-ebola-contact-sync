'use strict';

/**
 * @ngdoc function
 * @name secsApp.controller:ContactsCtrl
 * @description
 * # ContactsCtrl
 * Controller of secsApp
 */
angular.module('secsApp')
  .controller('ContactsCtrl',
      ['$scope', '$filter', 'ngTableParams', 'contactFactory',
      function ($scope, $filter, ngTableParams, contactFactory) {
    $scope.contacts = [];

    $scope.tableParams = new ngTableParams({
        sorting: {
          lastName: 'asc'
        }
      }, {
        total: $scope.contacts.length,
        getData: function($defer, params) {
          var data = $scope.contacts;
          var orderedData = params.sorting() ?
                    $filter('orderBy')(data, params.orderBy()) : data;
          $defer.resolve(orderedData);
        }
      });

    contactFactory.orderedByName().then(function(contacts) {
      $scope.contacts = contacts;
      $scope.tableParams.reload();
    });

    function toggleStatus(contact) {
      var newStatus = (contact.status === 'active' ? 'inactive' : 'active');
      contactFactory.update(contact._id, { 'status': newStatus})
        .then(function(updatedContact) {
            contact.status = updatedContact.status;
        });
    };

    $scope.toggleStatus = toggleStatus;
  }]);
