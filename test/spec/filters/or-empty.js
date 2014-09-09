'use strict';

describe('Filter: orEmpty', function () {

  // load the filter's module
  beforeEach(module('secsApp'));

  // initialize a new instance of the filter before each test
  var orEmpty;
  beforeEach(inject(function ($filter) {
    orEmpty = $filter('orEmpty');
  }));

  it('should return the input if there is one', function () {
    var text = 'angularjs';
    expect(orEmpty(text)).toBe(text);
  });

  it('should return an empty string if the input is undefined or null', function () {
    var text;
    expect(orEmpty(text)).toBe('');
    text = null;
    expect(orEmpty(text)).toBe('');
  });
});
