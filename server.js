const request = require('request');
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
      for(var i=0;i<docs.length;i++){
        var q = decodeURIComponent(docs[i]['query']);
        recents += q + "\n";
      }
      db.close();
      res.end(recents);
    })
  });
})

app.get('/api/search/:query', function(req,res){
  //extract search query & make an object to enter into MongoDB
  var qStr = encodeURIComponent(req.params.query);
  var offset = req.query.offset;
  var qObj = {};
  qObj['query'] = qStr;
  //Insert query into MongoDB
  mongo.connect(mongoStr, function(err,db){
    if(err) throw err;
    var queries = db.collection('queries');
    queries.insert(qObj, function(err,data){
      if(err) throw err;
      db.close();
    });
  });
  //Query the Google Images API
  var apiKey = 'AIzaSyBekVEsCm3o73VRtxdWeUIh3hoiur0MOiE';
  var url = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey + '&cx=001441806295693258836:zo_sci2c42w&searchType=image&q=' + qStr;
if(offset != undefined){
  url += '&start=' + offset;
}
  
  
  var options = {
    uri: url,
    method: 'GET',
  }
  
  request(options, function(err, response, body){
    if(err) {
      console.log(err);
    }
    var arr = [];
    var result = JSON.parse(body);
    
    console.log(result.items[0]);
    for(var i=0;i<result.items.length;i++){
      var picInfo = {
        'url' : result.items[i]['link'],
        'alt-text' : result.items[i]['snippet'],
        'page-url' : result.items[i]['image']['contextLink']
      }
      
      arr.push(picInfo);
    }
    
    res.end(JSON.stringify(arr));
  });
  
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});