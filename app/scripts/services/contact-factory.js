'use strict';

angular.module('secsApp')
  .factory('contactFactory',
      function contactFactory($q, $sessionStorage, $window, dateParser, couchdb) {

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

    function parseDailyVisits(dailyVisits) {
      var parsedDailyVisits = [];
      angular.forEach(dailyVisits, function(visit) {
        var symptoms = [];

        angular.forEach(visit.symptoms, function(value, key) {
          if (value && key !== 'temperature') {
            symptoms.push(key);
          }
        });

        parsedDailyVisits.push({
          dateOfVisit: visit.dateOfVisit,
          interviewer: visit.interviewer,
          temperature: visit.symptoms.temperature,
          symptoms: symptoms
        });
      });

      return parsedDailyVisits;
    }

    function parseContactDuplicate(contact) {
      return {
        _id: contact._id,
        lastName: contact.Surname,
        otherNames: contact.OtherNames
      };
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
      contact.dailyVisits           = parseDailyVisits(response.dailyVisits);

      // duplicated contacts list
      if (response.duplicatesList && response.duplicatesList.length > 0) {
        contact.duplicatesList = [];

        var promises = [];
        response.duplicatesList.forEach(function(contactDuplicatedId) {
          // get duplicates info
          promises.push(get(contactDuplicatedId)
            .then(function(responseDuplicated) {
              contact.duplicatesList.push(parseContactDuplicate(responseDuplicated));
            }));
        });

        $q.all(promises).then(function() {
          contact.includingDetailedInfo = true;
        });

      } else {
        contact.includingDetailedInfo = true;
      }
    }

    function mergeContacts(parent, children) {
      var d = $q.defer();

      // get parent data
      var parentId = parent._id;
      get(parentId).then(function(parentComplete) {

        // create updates objects
        var parentUpdates = {};
        var childUpdates = {duplicateOf: parentId};
        var parentDuplicates = [];

        // create duplicates list
        parentUpdates.duplicatesList = parentComplete.duplicatesList || [];

        var childrenPromises = [];

        // iterate children
        children.forEach(function(child) {
          var childId = child._id;

          // get child data
          childrenPromises.push(get(childId).then(function(childComplete) {
            if (!isEmpty(childComplete.duplicateOf)) {
              // child has already been merged as duplicated of another contact
              // error or ignore?
              return;
            }

            // include child in parent's duplicates list
            parentUpdates.duplicatesList.push(childId);

            // compare parent fields with child fields
            angular.forEach(parentComplete, function(value, key) {
              if (isBetterChildValue(value, childComplete[key])) {
                parentUpdates[key] = childComplete[key];
              }
            });

            // compare child fields with parent fields
            angular.forEach(childComplete, function(value, key) {
              if (isBetterChildValue(parentComplete[key], value)) {
                parentUpdates[key] = value;
              }
            });

            // merge dailyVisits array
            parentUpdates.dailyVisits = mergeDailyVisits(parentComplete.dailyVisits, childComplete.dailyVisits);

            // set duplicateOf in child
            update(childId, childUpdates);

            parentDuplicates.push(parseContactDuplicate(childComplete));

          })
          .catch(function(error) {
            d.reject(error);
          }));

        });

        $q.all(childrenPromises).then(function() {
          // update parent data
          update(parentId, parentUpdates)
            .then(function(){
              parentUpdates.dailyVisits = parseDailyVisits(parentUpdates.dailyVisits);
              parentUpdates.duplicatesList = parentDuplicates;
              d.resolve({ parentUpdates: parentUpdates, childUpdates: childUpdates}) ;
            })
            .catch(function(error) {
              d.reject(error);
            });
        });

      })
      .catch(function(error) {
        d.reject(error);
      });

      return d.promise;
    }

    function isEmpty(value) {
      return value === null || angular.isUndefined(value) || value === '';
    }

    function isBetterChildValue(parentValue, childValue) {
      return isEmpty(parentValue) && !isEmpty(childValue) && !angular.isArray(childValue);
    }

    function mergeDailyVisits(parentVisits, childVisits) {
      var mergedVisits = [];

      parentVisits = parentVisits || [];
      childVisits = childVisits || [];

      while (parentVisits.length > 0 || childVisits.length > 0) {
        if (parentVisits.length === 0) {
          mergedVisits = mergedVisits.concat(childVisits);
          childVisits = [];
        } else if (childVisits.length === 0) {
          mergedVisits = mergedVisits.concat(parentVisits);
          parentVisits = [];
        } else {
          if ($window.moment(parentVisits[0].dateOfVisit).isBefore(childVisits[0].dateOfVisit)) {
            mergedVisits.push(parentVisits.shift());
          } else if ($window.moment(childVisits[0].dateOfVisit).isBefore(parentVisits[0].dateOfVisit)) {
            mergedVisits.push(childVisits.shift());
          } else { // same date: take parent, discard child
            mergedVisits.push(parentVisits.shift());
            childVisits.shift();
          }
        }
      }

      return mergedVisits;
    }

    return {
      mergeContacts: mergeContacts,
      allOrderedByName: getContactsViewWithStatusByName,
      addDetails: addDetails,
      update: update,
      get: get
    };
  });
