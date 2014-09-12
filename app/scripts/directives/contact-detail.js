'use strict';

angular.module('secsApp')
  .directive('contactDetail', function($compile) {
    return {
      templateUrl: 'views/_contact-details.html',
      restrict: 'E',
      transclude: true,
      scope: {
        person: '=ngModel'
      },
      // to allow recursion calls
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
