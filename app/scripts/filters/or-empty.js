'use strict';

/**
 * @ngdoc filter
 * @name secsApp.filter:orEmpty
 * @function
 * @description
 * # orEmpty
 * Filter in the secsApp.
 */
angular.module('secsApp')
  .filter('orEmpty', function () {
    return function (input) {
      var output = '';

      if ((typeof input !== 'undefined' && input !== null)) {
        output = input;
      }
      return output;
    };
  });
