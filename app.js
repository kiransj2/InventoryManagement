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

app.get('/api/get_item_list', function (req, res) {
    console.log("get_item_list --> ");
    
    db_logic.item_list(function (error, json) {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(json);
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(json));
        }
        return;
    });
    return;
});

app.get('/api/add_item', function (req, res) {
    db_logic.new_item(req.query.name, function (error, msg) {
        if (error === true) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end("could not add " + req.query.name + " to db");
            console.log("cound not add element " + req.query.name + " to db due to " + msg);
            return;
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("added item " + req.query.name + " to db");
            console.log("added item " + req.query.name + " to db");
        }
        return;
    });
});

app.get('/api/new_stock', function (req, res) {
    db_logic.new_stock(req.query.name, req.query.quantity, function (error, msg) {
        if (error === true) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(msg);
            console.log(msg);
            return;
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(msg);
            console.log("added item " + req.query.name + " to db");
        }
        return;
    });

});

http.listen(80, function(){
    console.log("listening on http://%s:80", hostname);
});
