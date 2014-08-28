'use strict';

describe('Controller: ContactsCtrl', function () {

  // load the controller's module
  beforeEach(module('secsApp'));

  var ContactsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContactsCtrl = $controller('ContactsCtrl', {
      $scope: scope
    });
  }));

  xit('should do something', function () {
  });
});
