/* IMPORT AND DECLARATION AREA BEGIN */

var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

// Importing MongoClient and Server objects from the module CollectionDriver (note ',' instead of ';')
MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;

// Express is a routing middleware. Instead of using http, it helps offering methods for
// directly handling REST calls and provides appropriate callbacks for every case.
var app = express();

app.set('port', 3000);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/* IMPORT AND DECLARATION AREA END */

/* INITIALIZING AND INSTANCING OBJECTS BEGIN */

// Those two lines specify where views are present and what will be the view engine that
// will render them.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var collectionDriver;
var url = 'mongodb://localhost:27017/test';

var mongoClient = new MongoClient(new Server(url));
mongoClient.connect(url, function(err, mongoClient) { // Trying to establish connection to the MongoDB server
  if (!MongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1);
  }
  // Connected...
  var db = mongoClient.db("production");
  collectionDriver = new CollectionDriver(db); // Instancing the driver to communicate with the DB
});

// The static handler for express allows anything present in public to be accessed.
app.use(express.static(path.join(__dirname, 'public')));

/* INITIALIZING AND INSTANCING OBJECTS END */

/* API Declaration */
/* Creating routes here */

app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});

/*
 * Given a collection name (poi, paths, ...) it returns all entities
 * of this collection present in the DB.
 *
 * Error codes:
 *     -400: The collection doesn't exist.
 */

app.get('/:collection', function(req, res) {
  var params = req.params;
  collectionDriver.findAll(req.params.collection, function(error, objs) {
    if (error) { res.send(400, error); }
    else {
      res.set('Content-Type','application/json');
      res.send(200, objs);
    }
  });
});

/*
 * Given a collection name (poi, paths, ...) and an ObjectID,
 * it returns the specified object if present in DB.
 *
 * Error codes:
 *     -400: The collection and/or the ObjectID doesn't exist.
 */

app.get('/:collection/:entity', function(req, res) {
  var params = req.params;
  var entity = params.entity;
  var collection = params.collection;
  if (entity) {
    collectionDriver.get(collection, entity, function(error, objs) {
      if (error) { res.send(400, error); }
      else { res.send(200, objs); }
    });
  } else {
    res.send(400, {error: 'bad url', url: req.url});
  }
});

/*
 * Given a prefix (case insensitive), it returns an array with all the cities that match with it.
 */

app.get('/city/:collection/:city_prefix', function(req, res) {
  var params = req.params;
  var city = params.city_prefix;
  var collection = params.collection;
  if (city && collection) {
    collectionDriver.getCities(collection, city, function(error, objs) {
      if (error) { res.send(400, error); }
      else { res.send(200, objs); }
    });
  } else {
    res.send(400, {error: 'bad url', url: req.url});
  }
});


/*
 * Given a collection name (poi), the array of the coordinates, 
 * the array of the categories required, a radius in km and the
 * maximum number of results, it returns a list of PoI.
 *
 * Error codes:
 *     -400: Missing body.
 *     -500: Something broke in the server. Bad story.
 */

app.post('/poi', function(req, res) {
  try {
    var body = req.body;
    if (body) {
      // Please, check if params are ok
      collectionDriver.getPoiByParams(body.collection_name, body.coordinates, body.categories, body.radius, body.max_results, function(error, objs) {
        if (error) { res.send(500, error); }
        else { res.send(200, objs); }
      });
    } else {
      res.send(400, {error: 'missing body', url: req.url});
    }
  } catch (e) {
    console.log(e);
  }
});

/*
 * Given a collection name (poi) and an array of IDs, 
 * it updates their popularity.
 *
 * Error codes:
 *     -400: Missing body.
 *     -500: Something broke in the server. Bad story.
 */

app.post('/popularity', function(req, res) {
  try {
    var body = req.body;
    if (body) {
      // Please, check if params are ok
      if (body.rating == 1 || body.rating == -1) {
        collectionDriver.updatePopularity(body.id, body.collection_name, body.rating, function(error, fine) {
          if (error) { res.send(500, error); }
          else { res.send(200, {}); }
        });
      } else {
        res.send(400, {error: 'wrong params', url: req.url});
      }
    } else {
      res.send(400, {error: 'missing body', url: req.url});
    }
  } catch (e) {
    console.log(e);
  }
});

/*
 * Given a collection name (poi) a tag name and a PoI's ID, 
 * it increases that field.
 *
 * Error codes:
 *     -400: Malformed body or wrong params.
 *     -500: Something broke in the server. Bad story.
 */

app.post('/tags', function(req, res) {
  try {
    var body = req.body;
    if (body) {
      // Please, check if params are ok
      collectionDriver.updateTags(body.id, body.collection_name, body.tag, function(error, fine) {
        if (error) { res.send(500, error); }
        else { res.send(200, {}); }
      });
    } else {
      res.send(400, {error: 'missing body', url: req.url});
    }
  } catch (e) {
    console.log(e);
  }
});

// Default "catch-all" non available requests
app.use(function(req, res) {
  res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});