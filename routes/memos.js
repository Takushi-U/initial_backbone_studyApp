var mongo = require('mongodb');

var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('memodb', server);

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'memodb' database");
    db.collection('memos', {strict: true}, function(err, collection){
      if(err){
        console.log("The 'memos' collection doesn't exist. Creating it with sample data...");
        populateDB();
      }
    });
  }
});

exports.findById = function(req, res){
  var id = req.params.id;
  console.log('Retrieving memo: ' + id);
  db.collection('memos', function(err, collection){
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item){
      res.send(item);
    });
  });
};


exports.findAll = function(req, res){
  db.collection('memos', function(err, collection){
    collection.find().toArray(function(err, items){
      res.send(items);
    });
  });
};

exports.addMemo = function(req, res){
  var memo = req.body;
  console.log('Adding memo: ' + JSON.stringify(memo));
  db.collection('memos', function(err, collection){
    collection.insert(memo, {safe: true}, function(err, result){
      if(err){
        res.send({'error':'An error has occurred'});
      }else{
        console.log('Success: ' + JSON.stringify(result[0]));
        res.send(result[0]);
      }
    });
  });
};

exports.updateMemo = function(req, res){
  var id = req.params.id;
  var memo = req.body;
  console.log('Updating memo: ' + id);
  console.log(JSON.stringify(memo));
  db.collection('memos', function(err, collection){
    collection.update({'_id': new BSON.ObjectID(id)}, memo, {safe:true}, function(err, result){
      if(err){
        console.log('Error updating memo: ' + err);
        res.send({'error':'An error has occurred'});
      }else{
        console.log('' + result + ' document(s) updated');
        res.send(memo);
      }
    });
  });
};

exports.deleteMemo = function(req, res){
  var id = req.params.id;
  console.log('Deleting memos: ' + id);
  db.collection('memos', function(err, collection){
    collection.remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result){
      if(err){
        res.send({'error': 'An error has occurred - ' + err});
      }else{
        console.log('' + result + ' document(s) deleted');
        res.send(req.body);
      }
    });
  });
};

// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
    var memos = [
    {
      content: "aaaaaaaaaaaaaメモ"
    },
    {
      content: "bbbbbbbbbbbbbbメモ"
    }];
    db.collection('memos', function(err, collection) {
        collection.insert(memos, {safe:true}, function(err, result) {});
    });
};


