'use strict';

angular.module('secsApp')
  .factory('Auth', ['$rootScope', '$sessionStorage', 'couchdb',
      function ($rootScope, $sessionStorage, couchdb) {
    $rootScope.currentUser = null;
    $rootScope.app = $rootScope.app || {
      init: false
    };

    function set(user) {
      if (user !== $rootScope.currentUser) {
        $rootScope.currentUser = user;
        $sessionStorage.user = user;
        $rootScope.$emit('currentUserChanged', user);
      }
    }

    if ($sessionStorage.user) {
      set($sessionStorage.user);
    }

    // no async operation, so set init to true right away
    $rootScope.app.init = true;

    return {
      /**
       * Authenticate user
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;

        var promise = couchdb.login({
          name: user.username,
          password: user.password
        }).$promise;

        promise
          .then(function(data) {
            if (data.ok) {
              set(user);
            }
            cb();
          })
          .catch(function(err) {
            cb(err);
          });

        return promise;
      },

      /**
       * Unauthenticate user
       *
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      logout: function(callback) {
        var cb = callback || angular.noop;

        var promise = couchdb.logout().$promise;
        promise
          .then(function(data) {
            if (data.ok) {
              set(null);
            }

            cb();
          })
          .catch(function(err) {
            cb(err);
          });

        return promise;
      },

      /**
       * Returns current user
       *
       * @return {Object} user
       */
      currentUser: function() {
        return $rootScope.currentUser;
      },

      /**
       * Simple check to see if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return !!$rootScope.currentUser;
      }
    };
  }]);
