'use strict';
var db = require("org/arangodb").db;

function dropCollection(name) {
  var collectionName = applicationContext.collectionName(name);
  db._drop(collectionName);
}

dropCollection("hll");
