'use strict';

angular.module('secsApp')
  .factory('contactFactory', function contactFactory($q, $window, couchdb) {

    var DB_NAME = 'sense_contacts';

    function getContactsViewWithStatusByName() {
      var d = $q.defer();

      couchdb.view({_db: DB_NAME, _param:'contacts', _sub_param: 'withStatusByName'}).$promise
        .then(function(response) {
          var data = $window._.map(response.rows,
                                    function(row) {
                                      return {
                                        lastName: row.key[0],
                                        otherNames: row.key[1],
                                        status: row.key[2],
                                        _id: row.value._id,
                                        lastVisit: row.value.lastVisit,
                                        age: row.value.age}});
          d.resolve(data);
        })
        .catch(function(error) {
          d.reject(error);
        });

      return d.promise;
    }

    function update(id, data) {
      var d = $q.defer();

      get(id)
        .then(function(contact) {
          angular.forEach(data, function(value, key) {
            contact[key] = value;
          });
          couchdb.update({_db: DB_NAME, _param: contact._id}, contact).$promise
            .then(function(response) {
              contact._rev = response.rev
              d.resolve(contact);
            })
            .catch(function(error) {
              d.reject(error);
            });
        })
        .catch(function(error) {
          d.reject(error);
        });

      return d.promise;
    }

    function get(id) {
      return couchdb.get({_db: DB_NAME, _param: id}).$promise
    }

    return {
      orderedByName: getContactsViewWithStatusByName,
      update: update,
      get: get
    };
  });
