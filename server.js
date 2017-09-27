const mongo = require('mongodb').MongoClient;
const mongoStr = 'mongodb://fccUser:fccPassword@ds149934.mlab.com:49934/fcc-imgabstraction';
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/api/history', function(req,res){
  mongo.connect(mongoStr, function(err,db){
    if(err) throw err;
    var queries = db.collection('queries');
    var recents = "";
    queries.find().sort({_id:-1}).limit(15).toArray(function(err,docs){
      if(err) throw err;
      console.log(docs);
      for(var i=0;i<docs.length;i++){
        var q = decodeURIComponent(docs[i]['query']);
        recents += q + "\n";
      }
      db.close();
      res.end(recents);
    })
  });
  
  
  
})

app.get('/api/search/*', function(req,res){
  var qStr = req.url.slice(12);
  var qObj = {};
  qObj['query'] = qStr;
  mongo.connect(mongoStr, function(err,db){
    if(err) throw err;
    var queries = db.collection('queries');
    queries.insert(qObj, function(err,data){
      if(err) throw err;
      db.close();
    });
  });
  
  res.end(qStr);
})

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
