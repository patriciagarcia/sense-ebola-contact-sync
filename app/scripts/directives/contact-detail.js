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
      // Allow nesting of contactDetail directives,
      // used when a duplicate contact has duplicates itself
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
