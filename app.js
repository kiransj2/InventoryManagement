var app = require('express')(),
    http = require('http').Server(app),
    db = require('./db'),
    db_logic = require('./db_logic'),
    os = require('os'),
    url = require('url');

var hostname = os.hostname();

if(!db.db_init(false)) {
    console.error("unable to open database file");
    process.exit(1);
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/res/*', function(req, res) {
    res.sendFile(__dirname + '/res/' + req.params[0]);
});

http.listen(80, function(){
    console.log("listening on http://%s:80", hostname);
});
