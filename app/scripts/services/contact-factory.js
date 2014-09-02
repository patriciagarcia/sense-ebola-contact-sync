'use strict';

angular.module('secsApp')
  .factory('contactFactory',
      ['$q', '$window', '$sessionStorage', 'dateParser', 'couchdb',
      function ($q, $window, $sessionStorage, dateParser, couchdb) {

    var DB_NAME = 'sense_contacts';

    function getContactsViewWithStatusByName() {
      var d = $q.defer();

      /* jshint camelcase: false */
      couchdb.view({_db: DB_NAME, _param:'contacts', _sub_param: 'withStatusByName'}).$promise
        .then(function(response) {
          var data = $window._.map(response.rows,
                        function(row) {
                          return {
                            lastName: row.key[0],
                            otherNames: row.key[1],
                            status: row.key[2],
                            _id: row.value._id,
                            daysSinceLastContact: dateParser.daysFromToday(
                              row.value.dateLastContact, row.value.dateFirstVisit)
                          };
                        });

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
          var change = {
            timestamp: Date.now(),
            author: $sessionStorage.user.username,
            lastRev: contact._rev,
            changes: []
          };
          angular.forEach(data, function(value, key) {
            change.changes.push({
              key: key,
              previousValue: contact[key],
              newValue: value
            });
            contact[key] = value;
          });
          contact.changeHistory = contact.changeHistory || [];
          contact.changeHistory.push(change);

          couchdb.update({_db: DB_NAME, _param: contact._id}, contact).$promise
            .then(function(response) {
              contact._rev = response.rev;
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
      return couchdb.get({_db: DB_NAME, _param: id}).$promise;
    }

    return {
      orderedByName: getContactsViewWithStatusByName,
      update: update,
      get: get
    };
  }]);
