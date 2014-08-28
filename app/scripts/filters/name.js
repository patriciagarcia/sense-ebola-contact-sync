'use strict';

/**
 * @ngdoc filter
 * @name secsApp.filter:name
 * @function
 * @description
 * # name
 * Filter in the secsApp.
 */
angular.module('secsApp')
  .filter('name', function ($window) {
    return function (input) {
      if (typeof input !== 'undefined' && input !== null) {
        var names = input.split(' ');
        names = $window._.map(names, function(name) {
          return name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        });
        return names.join(' ');
      } else {
        return '';
      }
    };
  });
