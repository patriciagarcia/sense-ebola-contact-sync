'use strict';

/**
 * @ngdoc function
 * @name secsApp.controller:ContactsCtrl
 * @description
 * # ContactsCtrl
 * Controller of secsApp
 */
angular.module('secsApp')
  // Note: make ngTableParams -> NgTableParams, to make jshint stop complaining
  .controller('ContactsCtrl',
      ['$scope', '$filter', 'ngTableParams', 'contactFactory', 'SETTINGS',
      function ($scope, $filter, NgTableParams, contactFactory, SETTINGS) {

    $scope.contacts = [];

    $scope.tableParams = new NgTableParams(
      {
        sorting: {
          lastName: 'asc'
        }
      }, {
        total: $scope.contacts.length,
        getData: function($defer, params) {
          var orderedData = params.sorting ?
                    $filter('orderBy')($scope.contacts, params.orderBy()) : $scope.contacts;

          orderedData = params.filter ?
                    $filter('filter')(orderedData, params.filter()) : orderedData;

          $defer.resolve(orderedData);
        }
      });

    $scope.tableParams.settings().$scope = $scope;

    contactFactory.allOrderedByName().then(function(contacts) {
      $scope.contacts = contacts;
      $scope.tableParams.reload();
    });

    $scope.toggleStatus = function(contact, event) {
      event.stopPropagation();
      var newStatus = (contact.status === 'active' ? 'inactive' : 'active');
      contactFactory.update(contact._id, { 'status': newStatus})
        .then(function(updatedContact) {
            contact.status = updatedContact.status;
        });
    };

    $scope.toDeactivate = function(contact) {
      return (contact.status === 'active' &&
        contact.daysSinceLastContact > SETTINGS.incubationPeriod);
    };

    $scope.showDetails = function(contact) {
      if (contact.includingDetailedInfo) {
        contact.includingDetailedInfo = false;
      } else {
        contactFactory.addDetails(contact);
      }
    };

    var parentToMerge = null;

    $scope.toggleSelectParentForMerge = function(contact, event) {
      event.stopPropagation();
      parentToMerge = (parentToMerge)? null : contact;
    };

    $scope.mergeContactIntoParent = function(contact, event){
      event.stopPropagation();
      var parentData = getContactMainData(parentToMerge);
      var childData  = getContactMainData(contact);
      var confirmMsg = 'Do you want to merge\n\n' +
              childData + '\n\n into\n\n' + parentData + '? \n\n' +
              '(Fields from ' + parentData + ' will have priority)';

      // merge?
      var confirmed = window.confirm(confirmMsg);
      if (confirmed) {
        // merge
        contactFactory.mergeContacts(parentToMerge, [contact])
          .then(function(updates){

            angular.forEach(updates.parentUpdates, function(value, key) {
              parentToMerge[key] = value;
            });

            contact.includingDetailedInfo = false;

            angular.forEach(updates.childUpdates, function(value, key) {
              contact[key] = value;
            });

            parentToMerge.selected = false;
            parentToMerge = null;

          });
      }
    };

    $scope.isEmptyMerge = function() {
      return parentToMerge === null;
    };

    $scope.isParentMerge = function(contact) {
      return !$scope.isEmptyMerge() && parentToMerge === contact;
    };

    function getContactMainData(contact) {
      return filterValueByFilter(contact.lastName, 'name') +
          ', ' + filterValueByFilter(contact.otherNames, 'name') +
          ' (' + filterValueByFilter(contact.state, 'name') +
          ', ' + filterValueByFilter(contact.lga, 'name') + ')';
    }

    function filterValueByFilter(value, filter){
      return (value) ? $filter(filter)(value) : '---';
    }

  }]);
