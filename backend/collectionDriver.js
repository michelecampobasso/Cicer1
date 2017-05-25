Utils = require('./utils').Utils;

var ObjectID = require('mongodb').ObjectID;
var utils = new Utils();

// Constructor of an instance of MongoDB
CollectionDriver = function (db) {
  this.db = db;
};

// Definition of a DB helper getCollection to obtain a Mongo collection by name.
// NOTE: Class methods are defined adding fucntions to prototype!
CollectionDriver.prototype.getCollection = function (collectionName, callback) {
  // Fetching the collection and returning it to the callback
  this.db.collection(collectionName, function (error, the_collection) {
    if (error) callback(error);
    else callback(null, the_collection);
  });
};

// Definition of a DB helper that allows to read results of a query from the DB.
CollectionDriver.prototype.findAll = function (collectionName, callback) {
  this.getCollection(collectionName, function (error, the_collection) {
    // If the DB is reachable
    if (error) callback(error);
    // 'the_callback' is kinda an iterator that can be used to match objects through the use of find()
    else {
      // Finally, toArray organizes the results into an array and passes it to the callback
      the_collection.find().toArray(function (error, results) {
        if (error) callback(error);
        else callback(null, results);
      });
    }
  });
};

// Definition of a DB helper that allows to read all the not updated by maps API documents yet.
/*CollectionDriver.prototype.findAll = function(collectionName, callback) {
  this.getCollection(collectionName, function(error, the_collection) {
    // If the DB is reachable
    if (error) callback(error);
    // 'the_callback' is kinda an iterator that can be used to match objects through the use of find()
    else {
      // Finally, toArray organizes the results into an array and passes it to the callback
      the_collection.find({'added':false}).toArray(function(error, results) {
        if (error) callback(error);
        else callback(null, results);
      });
    }
  });
};*/

// Definition of a DB helper that obtains a single item from a collection by its _id.
CollectionDriver.prototype.get = function (collectionName, id, callback) {
  this.getCollection(collectionName, function (error, the_collection) {
    if (error) callback(error);
    else {
      // Obtained the collection via getCollection,
      // it checks with a findOne if collection has at least one element and then returns it.
      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
      if (!checkForHexRegExp.test(id)) callback({
        error: "invalid id"
      });
      else the_collection.findOne({
        '_id': ObjectID(id)
      }, function (error, doc) {
        if (error) callback(error);
        else callback(null, doc);
      });
    }
  });
};

// Definition of a DB helper that obtains a single item from a collection by its _id.
CollectionDriver.prototype.getById = function (collectionName, id, callback) {
  this.getCollection(collectionName, function (error, the_collection) {
    if (error) callback(error);
    else {
      // Obtained the collection via getCollection,
      // it checks with a findOne if collection has at least one element and then returns it.
      the_collection.findOne({
        'id': id
      }, function (error, doc) {
        if (error) callback(error);
        else callback(null, doc);
      });
    }
  });
};


// Definition of a DB helper that allows get all PoI by an array of categories
CollectionDriver.prototype.getPoiByCategories = function (collectionName, categories, callback) {
  this.getCollection(collectionName, function (error, the_collection) {
    if (error) callback(error);
    else {
      the_collection.find({
        'properties.categoria': {
          $in: categories
        }
      }).toArray(function (error, results) {
        if (error) callback(error);
        else callback(null, results);
      })
    }
  });
};

// Definition of a DB helper that allows to read all the documents that match all the parameters
CollectionDriver.prototype.getPoiByParams = function (collectionName, coordinates, categories, radius, maxResults, callback) {
  this.getPoiByCategories(collectionName, categories, function (error, the_collection) {
    if (error) callback(error);
    else {
      the_collection.forEach(function (element) {
        // Coordinates are inverted since in the DB they're set this way...
        var calculatedRadius = utils.calculateDistance(coordinates[0], coordinates[1], element.coordinates[1], element.coordinates[0]);
        if (calculatedRadius > radius) {
          the_collection = the_collection.filter(function (item) {
            return item !== element
          });
        } else {
          element.distance = calculatedRadius;
        }
      });
      the_collection.sort(function (a, b) {
        return a.distance - b.distance
      });
      callback(null, the_collection.slice(0, maxResults));
    }
  });
};

// Definition of a DB helper that allows to get all the PoIs that match with name and city
CollectionDriver.prototype.getPoiByName = function (collectionName, city, pattern, callback) {
  this.getCollection(collectionName, function (error, the_collection) {
    if (error) callback(error);
    else {
      //the_collection.find({'properties.comune': city});
      the_collection.distinct('properties.nome', {
        'properties.nome': new RegExp(pattern, 'i'),
        'properties.comune': new RegExp('^' + city + '$', 'i'),
      }, function (error, pois) {
        callback(null, pois);
      });
    }
  })
};

// Definition of a DB helper that allows to get all the cities that begin with a specified prefix
CollectionDriver.prototype.getCities = function (collectionName, city, callback) {
  this.getCollection(collectionName, function (error, the_collection) {
    if (error) callback(error);
    else {
      the_collection.distinct('properties.comune', {
        'properties.comune': new RegExp('^' + city, 'i')
      }, function (error, cities) {
        callback(null, cities);
      });
    }
  })
};

// Definition of a DB helper that allows to insert a rating for a specified PoI
CollectionDriver.prototype.insertRatings = function (objectId, rating, callback) {
  this.db.collection('poi').updateOne({
      "id": objectId
    }, {
      $set: {
        "rating": rating,
        "added": true
      }
    },
    function (err, results) {
      if (!err) {
        callback(null, results);
      } else {
        callback(err, null);
      }
    });
};

// Definition of a DB helper that allows to update the popularity of a specified PoI
CollectionDriver.prototype.updatePopularity = function (objectID, collectionName, rating, callback) {
  var barbatrucco = this;
  this.getById(collectionName, objectID, function(error, elem) {
    if (error) {
      callback(error, null);
    } else {
      barbatrucco.db.collection(collectionName).updateOne({
        "id": objectID
      }, {
        $set: {
          "popularity": elem.popularity + rating
        }
      }, function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, true);
        }
      });
      callback(null, true);
    };
  });
};

// Definition of a DB helper that allows to increase by one the value of a tag of a specified PoI
CollectionDriver.prototype.updateTags = function (objectID, collectionName, tagName, callback) {
  var barbatrucco = this;
  this.getById(collectionName, objectID, function(error, elem) {
    if (error) {
      callback(error, null);
      var currentTagValue = elem.tags.tagName;
    } else {
      barbatrucco.db.collection(collectionName).updateOne({
        "id": objectID
      }, {
        $set: {
          ["tags."+tagName]: elem.tags[tagName] +1
        }
      }, function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, true);
        }
      });
      callback(null, true);
    };
  });
};


/*CollectionDriver.prototype.getPoiByParams = function(coordinates, type, radius, callback) {
  this.getPoiByType('poi', function(error, type, the_collection) {
    if (error) callback(error);
    else {
      // Obtained the collection via getCollection,
      // it checks with a findOne if collection has at least one element and then returns it.
      path.forEach({
        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
        else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) {
          if (error) callback(error);
          else callback(null, doc);
        });
      });
    }
  });
};*/


// I'm declaring that the driver build is visible externally as a module.
exports.CollectionDriver = CollectionDriver;