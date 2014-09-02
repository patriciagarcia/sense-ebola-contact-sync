'use strict';

angular
  .module('secsApp', [
    'config',
    'ngSanitize',
    'ngRoute',
    'ngResource',
    'ngStorage',
    'ngTable',
    'ui.bootstrap'
  ])
  .config(['$httpProvider', '$routeProvider',
      function($httpProvider, $routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/contacts.html',
        controller: 'ContactsCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    // Intercept 401s and redirect user to login
    $httpProvider.interceptors.push([
      '$rootScope', '$q', '$location',
      function($rootScope, $q, $location) {
        return {
          'request': function(config) {
            if ($rootScope.currentUser === null && $location.path() !== '/login') {
              $location.search('back', $location.path()).path('/login');
            }

            return config;
          },
          'responseError': function(response) {
          //    switch (response.status) {
          //        case 401:
          //   //         if ($location.path() !== '/login') {
          //   //             $location.search('back', $location.path()).path('/login');
          //   //         }
          //           console.log('encountered 401');
          //            return;
          //            break;
          //        default:
          //            return $q.reject(response);
          //  }

          return $q.reject(response);
          }
        };
      }
    ]);
  }])
  .run(['$rootScope', '$route', 'SETTINGS', 'Auth', '$location',
      function($rootScope, $route, SETTINGS, Auth, $location) {
    $rootScope.SETTINGS = SETTINGS;

    $rootScope.logout = function() {
      Auth.logout();
      $route.reload();
      $location.path('/login');
    };
  }])
  .controller('NavBar', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function(url) {
      return url === $location.path();
    };
  }]);
