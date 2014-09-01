'use strict';

/**
 * @ngdoc service
 * @name secsApp.dateParser
 * @description
 * # dateParser
 * Factory in the secsApp.
 */
angular.module('secsApp')
  .factory('dateParser', ['$window', 'SETTINGS', function ($window, SETTINGS) {
    function daysFromToday(date, alternativeDate) {
      var parsedDate = toMomentObjectGuessingFormat(date, alternativeDate);
      if (parsedDate) {
        return $window.moment().diff(parsedDate, 'days');
      }
      return '';
    }

    /*
     * Try to convert the date to moment objects using the formats
     * provided in SETTINGS.dbDataDateFormats.
     * @date: the date to be parsed.
     * @alternativeDate: an alternative date, following the ISO format,
     * that is supposed to be close to @date.
     * Ex: to parse @date = dateLastContact we can provide the date of the first visit
     * as an @alternativeDate.
     * */
    function toMomentObjectGuessingFormat(date, alternativeDate) {
      var parsedAlternativeDate = $window.moment(alternativeDate);
      if (date) {
        // Add default ISO parsing to the array of data formats
        var formats = [$window.moment.ISO_8601].concat(SETTINGS.dbDataDateFormats);
        // Try every format until one of them produces a date which is less than
        // SETTINGS.incubationPeriod days appart from the alternativeDate
        for (var i = 0; i < formats.length; i++) {
          var parsedDate = $window.moment(date, formats[i]);
          if (parsedDate.isValid()) {
            var daysDiffToAlternativeDate = parsedAlternativeDate.diff(parsedDate, 'days');
            if (daysDiffToAlternativeDate < SETTINGS.incubationPeriod) {
              return parsedDate;
            }
          }
        }
      }
      return parsedAlternativeDate;
    }

    function toISOStringGuessingFormat(date, alternativeDate) {
      return toMomentObjectGuessingFormat(date, alternativeDate).toISOString();
    }

    return {
      daysFromToday: daysFromToday,
      toISOStringGuessingFormat: toISOStringGuessingFormat
    };
  }]);
