'use strict';

describe('Filter: name', function () {

  // load the filter's module
  beforeEach(module('secsApp'));

  // initialize a new instance of the filter before each test
  var name;
  beforeEach(inject(function ($filter) {
    name = $filter('name');
  }));

  it('should capitalize the first letter of the input, leaving the rest as lowercase', function () {
    var text = 'angularjs';
    expect(name(text)).toBe('Angularjs');
    text = 'ANGULARJS';
    expect(name(text)).toBe('Angularjs');
  });

  it('should return an empty string if the input is empty', function() {
    var text = '';
    expect(name(text)).toBe('');
  });
});
