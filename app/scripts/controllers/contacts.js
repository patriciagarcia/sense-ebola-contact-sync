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
  });
