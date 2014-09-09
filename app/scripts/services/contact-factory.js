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
            row.value.dateLastContact, row.value.dateFirstVisit),
          includingDetailedInfo: false
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

    // Add more detailed info to the contact
    function addDetails(contact) {
      get(contact._id)
        .then(function(response) {
          extendContact(contact, response);
        });
    }

    // Extend/update the contact with the data obtained from couchdb
    function extendContact(contact, response) {
      contact.lastName              = response.Surname;
      contact.otherNames            = response.OtherNames;
      contact.status                = response.status;
      contact.lga                   = response.LGA;
      contact.state                 = response.State;
      contact.dateFirstVisit        = response.dailyVisits[0].dateOfVisit;
      contact.dateLastContact       = dateParser.toISOStringGuessingFormat(
                                        response.DateLastContact, contact.dateFirstVisit);
      contact.daysSinceLastContact  = dateParser.daysFromToday(
                                        contact.dateLastContact, contact.dateFirstVisit);
      contact.address               = response.Address;
      contact.age                   = response.Age;
      contact.gender                = response.Gender;
      contact.phone                 = response.Phone;
      contact.sourceCase            = response.SourceCase;
      contact.contactType           = response.ContactType;
      contact.dailyVisits           = response.dailyVisits;
      contact.includingDetailedInfo = true;

      contact.dailyVisits           = [];
      angular.forEach(response.dailyVisits, function(visit) {
        var symptoms = [];

        angular.forEach(visit.symptoms, function(value, key) {
          if (value && key !== 'temperature') {
            symptoms.push(key);
          }
        });

        contact.dailyVisits.push({
          dateOfVisit: visit.dateOfVisit,
          interviewer: visit.interviewer,
          temperature: visit.symptoms.temperature,
          symptoms: symptoms
        });
      });
    }


    function mergeContacts(parentId, childrenIds){

      // get parent data
      get(parentId).then(function(parentComplete) {

        // iterate children
        childrenIds.forEach(function(childId) {

          // get child data
          get(childId).then(function(childComplete) {
            if (!isEmpty(childComplete.duplicateOf)) {
              // error or ignore?
              return;
            }

            // create updates object for parent
            var updates = {};

            // create duplicates list
            updates.duplicatesList = parentComplete.duplicatesList || [];
            
            // include child in parent's duplicates list
            updates.duplicatesList.push(childId);

            // compare parent fields with child fields
            angular.forEach(parentComplete, function(value, key) {
              if (isEmpty(value) && !isEmpty(childComplete[key]) && !angular.isArray(childComplete[key])) {
                // merge with child data (if exists)
                updates[key] = childComplete[key];
              }
            });

            // compare child fields with parent fields
            angular.forEach(childComplete, function(value, key) {
              if (isEmpty(parentComplete[key]) && !isEmpty(value) && !angular.isArray(value)) {
                // merge with child data (if parent does not have it)
                updates[key] = value;
              }
            });

            // set duplicateOf in child
            update(childId, { "duplicateOf" : parentId });

            //console.log(updates);
            update(parentId, updates);
          });
        })
      });
      
    }

    function isEmpty(value) {
      return value === null || angular.isUndefined(value) || value === "";
    }

    return {
      mergeContacts: mergeContacts,
      allOrderedByName: getContactsViewWithStatusByName,
      addDetails: addDetails,
      update: update,
      get: get
    };
  });
