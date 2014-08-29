'use strict';

describe('Service: dateParser', function () {

  // load the service's module
  beforeEach(module('secsApp'));

  // instantiate service
  var dateParser;
  beforeEach(inject(function (_dateParser_) {
    dateParser = _dateParser_;
  }));

  xit('should do something', function () {
    expect(!!dateParser).toBe(true);
  });

});
