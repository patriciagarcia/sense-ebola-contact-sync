'use strict';

describe('SECS homepage', function() {
  beforeEach(function() {
    // XXX: Protractor will wait until `$http` calls have resolved on first page
    // load. App makes multiple calls to API which fail until user has logged
    // in, hence Protractor will never synchronise. Blocked on item:71
    browser.ignoreSynchronization = true;

    browser.get('/');
  });

  xit('should have a title', function() {
  });
});
