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

    var contactsToMerge = [];
    $scope.selectForMerge = function(contact, event) {
      event.stopPropagation();
      if (event.target.checked) {
        contactsToMerge.push(contact);
        if (contactsToMerge.length === 2) {
          // merge?
          var confirmed = window.confirm('Do you want to merge these contacts?');
          if (confirmed) {
            // merge
            var parent = contactsToMerge.shift();
            contactFactory.mergeContacts(parent, contactsToMerge)
              .then(function(){

                // if parent is detailed then reload detail
                if (parent.includingDetailedInfo) {
                  parent.includingDetailedInfo = false;
                  contactFactory.addDetails(parent);              
                }
                parent.selected = false;
                
                // uncheck
                event.target.checked = false;
                // empty contacts to merge array
                while (contactsToMerge.length > 0) {
                  var c = contactsToMerge.pop();
                  // remove from contacts
                  for (var i=0; i < $scope.contacts.length; i++) {
                    if ($scope.contacts[i]._id === c._id) {
                      $scope.contacts.splice(i, 1);
                      break;
                    }
                  }
                }
                // reload table
                $scope.tableParams.reload();
              });

          } else {
            // uncheck the last one
            event.target.checked = false;
            contactsToMerge.pop();
          }
        }
      } else {
        // remove from array
        removeItemFromArray(contactsToMerge, contact);
      }
    };

    function removeItemFromArray(arr, item){
      var index = arr.indexOf(item);
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }

  }])
  .directive('contactDetail', function($compile) {
    return {
      templateUrl: 'views/_contact-details.html',
      restrict: 'E',
      transclude: true,
      scope: {
        person: '=ngModel'
      },
      compile: function(tElement) {
        var contents = tElement.contents().remove();
        var compiledContents;
        return function(scope, iElement) {
          if (!compiledContents) {
            compiledContents = $compile(contents);
          }
          compiledContents(scope, function(clone) {
            iElement.append(clone); 
          });
        };
      },
      controller: 'ContactsCtrl'
    };
  })
;
