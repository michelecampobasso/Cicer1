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
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

// enable CORS
app.use(function (req, res, next) {
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
MongoClient.connect(url, function (err, mongoClient) {
    if (!mongoClient) {
        console.error("Error! Exiting... Must start MongoDB first");
        process.exit(1);
    }
    // Connected...
    var db = mongoClient.db("production");
    collectionDriver = new CollectionDriver(db); // Instancing the driver to communicate with the DB
    console.log("Connected!")
});

// The static handler for express allows anything present in public to be accessed.
app.use(express.static(path.join(__dirname, 'public')));

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAUQ8f8PQ9fwHl2O83RkLUz3zjNn4bHu30'
});

app.get('/:collection/insertRatings', function (req, res) {
    var params = req.params;
    collectionDriver.findAll(params.collection, function (error, objs) {
        if (error) {
            console.log("error!");
        } else {
            console.log("Objects retrieved");
            objs.forEach(function (item) {
                if (item.rating==0 && !item.added) {
                    googleMapsClient.placesNearby({
                        location: [item.coordinates[1], item.coordinates[0]],
                        radius: 30
                    }, function (err, response) {
                        var rating = 0;
                        if (response.json) {
                            response.json.results.forEach(function (element) {
                                if (element.rating) {
                                    if (element.rating > rating) {
                                        rating = element.rating;
                                    }
                                }
                            });
                            console.log(rating);
                            collectionDriver.insertRatings(item.id, rating, function (err, res) {
                                if (!err) {
                                    console.log("okkei");
                                } else {
                                    console.log("porcoddio");
                                }
                            })
                        } else {
                            console.log("error!");
                        }
                    });
                };
            });
        }
    });
});

app.get('/:collection/insertProva', function (req, res) {
    var params = req.params;
    collectionDriver.get(params.collection, '590a37db44367d32f45dcc68', function (error, obj) {
        if (error) {
            console.log("error!");
        } else {
            googleMapsClient.placesNearby({
                location: [obj.coordinates[1], obj.coordinates[0]],
                radius: 10
            }, function (err, response) {
                var rating = 0;
                if (!err) {
                    response.json.results.forEach(function (element) {
                        if (element.rating) {
                            if (element.rating > rating) {
                                rating = element.rating;
                            }
                        }
                    });
                    console.log(rating);
                    collectionDriver.insertRatings(obj.id, rating, function (err, res) {
                        console.log(res);
                    })
                } else {
                    console.log("error!");
                }

            });
        }
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});