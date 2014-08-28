'use strict';

angular.module('secsApp')
  .factory('contactFactory', function contactFactory($q, $window, couchdb) {

    var DB_NAME = 'sense_contacts';

    function getContactsViewWithStatusByName() {
      var d = $q.defer()

      couchdb.view({_db: DB_NAME, _param:'contacts', _sub_param: 'withStatusByName'}).$promise
        .then(function(response) {
          var data = $window._.map(response.rows,
                                    function(row) {
                                      return {
                                        lastName: row.key[0],
                                        otherNames: row.key[1],
                                        status: row.key[2],
                                        lastVisit: row.value.lastVisit,
                                        age: row.value.age}});
          d.resolve(data);
        })
        .catch(function(error) {
          d.reject(error);
        });
      return d.promise
    }
    return {
      orderedByName: getContactsViewWithStatusByName
    };
  });
