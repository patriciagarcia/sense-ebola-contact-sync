'use strict';

angular.module('secsApp')
  .factory('contactFactory',
      function contactFactory($q, $sessionStorage, dateParser, couchdb) {

    var DB_NAME = 'sense_contacts';

    // Creates a changeHistory item for the contact updates
    function changeHistoryItem(contact, changes) {
      return {
        timestamp: Date.now(),
        author: $sessionStorage.user.username,
        lastRev: contact._rev,
        changes: changes
      };
    }

    // Get a contact from DB
    function get(id) {
      return couchdb.get({_db: DB_NAME, _param: id}).$promise;
    }

    // Update a contact with the give changes
    function update(id, updates) {
      var d = $q.defer();

      get(id)
        .then(function(contact) {
          var changes = [];

          angular.forEach(updates, function(value, key) {
            changes.push({
              key: key,
              previousValue: contact[key],
              newValue: value
            });
            contact[key] = value;
          });

          contact.changeHistory = contact.changeHistory || [];
          contact.changeHistory.push(changeHistoryItem(contact, changes));

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

    // Parse contacts from view retrieval response
    function parseContacts(response) {
      return response.rows.map(function(row) {
        return {
          lastName: row.key[0],
          otherNames: row.key[1],
          status: row.key[2],
          lga: row.value.lga,
          state: row.value.state,
          _id: row.value._id,
          daysSinceLastContact: dateParser.daysFromToday(
            row.value.dateLastContact, row.value.dateFirstVisit)
        };
      });
    }

    // Get contacts ordered by name
    function getContactsViewWithStatusByName() {
      var d = $q.defer();

      /* jshint camelcase: false */
      couchdb.view({_db: DB_NAME, _param:'contacts', _sub_param: 'withStatusByName'}).$promise
        .then(function(response) {
          d.resolve(parseContacts(response));
        })
        .catch(function(error) {
          d.reject(error);
        });

      return d.promise;
    }

    return {
      allOrderedByName: getContactsViewWithStatusByName,
      update: update,
      get: get
    };
  });
