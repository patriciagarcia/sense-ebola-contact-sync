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

    $scope.selectParentForMerge = function(contact, event) {
      event.stopPropagation();
      parentToMerge = (event.target.checked)? contact : null;
    };

    $scope.mergeContactIntoParent = function(contact, event){
      event.stopPropagation();
      var parentData = getContactMainData(parentToMerge);
      var childData  = getContactMainData(contact);
      var confirmMsg = 'Do you want to merge this contact\n\n' + 
          childData + '\n\n into this one \n\n' + parentData + '?';

      // merge?
      var confirmed = window.confirm(confirmMsg);
      if (confirmed) {
        // merge
        contactFactory.mergeContacts(parentToMerge, [contact])
          .then(function(){

            // if parent is detailed then reload detail
            if (parentToMerge.includingDetailedInfo) {
              parentToMerge.includingDetailedInfo = false;
              contactFactory.addDetails(parentToMerge);              
            }
            parentToMerge.selected = false;
            parentToMerge = null;
            
            // remove duplicated from contacts
            for (var i=0; i < $scope.contacts.length; i++) {
              if ($scope.contacts[i]._id === contact._id) {
                $scope.contacts.splice(i, 1);
                break;
              }
            }

            // reload table
            $scope.tableParams.reload();
          });
      }
    };

    $scope.isEmptyMerge = function() {
      return parentToMerge === null;
    };

    $scope.isParentMerge = function(contact) {
      return !$scope.isEmptyMerge() && parentToMerge === contact;
    };

    $scope.getMergeCheckboxTooltip = function() {
      return (($scope.isEmptyMerge()) ? 'Select': 'Unselect') +
          ' main duplicated contact to merge';
    };

    $scope.getMergeButtonTooltip = function(contact) {
      return 'Merge<br>' + getContactMainData(contact) + 
          '<br> into<br>' + 
          getContactMainData(parentToMerge);
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
