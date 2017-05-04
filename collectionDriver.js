Utils = require('./utils').Utils;

var ObjectID = require('mongodb').ObjectID;
var utils = new Utils();

// Constructor of an instance of MongoDB
CollectionDriver = function(db) {
  this.db = db;
};

// Definition of a DB helper getCollection to obtain a Mongo collection by name.
// NOTE: Class methods are defined adding fucntions to prototype!
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  // Fetching the collection and returning it to the callback
  this.db.collection(collectionName, function(error, the_collection) {
    if (error) callback(error);
    else callback(null, the_collection);
  });
};

// Definition of a DB helper that allows to read results of a query from the DB.
CollectionDriver.prototype.findAll = function(collectionName, callback) {
  this.getCollection(collectionName, function(error, the_collection) {
    // If the DB is reachable
    if (error) callback(error);
    // 'the_callback' is kinda an iterator that can be used to match objects through the use of find()
    else {
      // Finally, toArray organizes the results into an array and passes it to the callback
      the_collection.find().toArray(function(error, results) {
        if (error) callback(error);
        else callback(null, results);
      });
    }
  });
};

// Definition of a DB helper that obtains a single item from a collection by its _id.
CollectionDriver.prototype.get = function(collectionName, id, callback) {
  this.getCollection(collectionName, function(error, the_collection) {
    if (error) callback(error);
    else {
      // Obtained the collection via getCollection,
      // it checks with a findOne if collection has at least one element and then returns it.
      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
      if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
      else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) {
        if (error) callback(error);
        else callback(null, doc);
      });
    }
  });
};

CollectionDriver.prototype.getPoiByCategories = function(collectionName, categories, callback) {
  this.getCollection(collectionName, function(error, the_collection) {
    if (error) callback(error);
    else {
      the_collection.find({'properties.categoria': {$in :categories}}).toArray(function(error,results) {
        if (error) callback(error);
        else callback(null, results);
      })
    }
  });
};

CollectionDriver.prototype.getPoiByParams = function(collectionName, coordinates, categories, radius, callback) {
  this.getPoiByCategories(collectionName, categories, function(error, the_collection) {
    if (error) callback(error);
    else {
      the_collection.forEach(function(element) {
        if (utils.calculateDistance(coordinates[0],coordinates[1],element.coordinates[1],element.coordinates[0])>radius) {
          the_collection = the_collection.filter(function(item) { 
            return item !== element
          });
        }
      });
      callback(null, the_collection);
    }
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
