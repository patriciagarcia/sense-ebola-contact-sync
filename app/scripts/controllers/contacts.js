'use strict';

/**
 * @ngdoc function
 * @name secsApp.controller:ContactsCtrl
 * @description
 * # ContactsCtrl
 * Controller of secsApp
 */
angular.module('secsApp')
  .controller('ContactsCtrl', function ($scope, contactFactory) {
    contactFactory.orderedByName().then(function(contacts) {
      $scope.contacts = contacts
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
