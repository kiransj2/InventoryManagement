var app = require('express')(),
    http = require('http').Server(app),
    db = require('./db'),
    db_logic = require('./db_logic'),
    os = require('os'),
    url = require('url'),
    util = require('util');

var hostname = os.hostname();
var port = 80;
var server;

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

app.get('/api/get_incoming_stocks_on', function (req, res) {
    console.log("get_incoming_stocks_on --> %s", req.query.date);
    db_logic.get_all_incoming_stock_on(req.query.date, function (error, json) {
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

app.get('/api/get_all_incoming_stock_summary_range', function (req, res) {
    console.log("get_all_incoming_stock_summary_range --> ", req.query.range);
    db_logic.get_all_incoming_stock_summary_range(req.query.range, function (error, json) {
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

app.get('/api/get_incoming_stocks_range', function (req, res) {
    console.log("get_incoming_stocks_range --> ", req.query.range);
    db_logic.get_all_incoming_stock_range(req.query.range, function (error, json) {
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

app.get('/api/get_outgoing_stocks_range', function (req, res) {
    console.log("get_outgoing_stocks_range --> ", req.query.range);
    db_logic.get_all_outgoing_stock_range(req.query.range, function (error, json) {
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

app.get('/api/add_stock', function (req, res) {
    console.log("add stock %d gm of %s at Rs %d", req.query.quantity, req.query.name, req.query.price);
    db_logic.new_stock(req.query.name, parseInt(req.query.quantity), parseInt(req.query.price),
                       db.db_date(), function (error, msg) {
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

app.get('/api/sell_stock', function (req, res) {
    var obj = {};
    obj.price = parseInt(req.query.price);
    obj.quantity = parseInt(req.query.quantity);
    obj.name = req.query.name;
    obj.option = req.query.option;
    obj.reason = req.query.reason;
    obj.when = db.db_date();

    console.log("sell stock %s", util.inspect(obj));
    db_logic.sell_stock(obj, function (error, msg) {
        if (error === true) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(msg);
            console.log(msg);
            return;
        } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(msg);
            console.log("Sold item " + req.query.name + ".");
        }
        return;
    });
});

app.get('/api/get_outgoing_stocks', function (req, res) {
    console.log("get_outgoing_stocks --> %s", req.query.date);
    db_logic.get_all_outgoing_stock_on(req.query.date, function (error, json) {
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

app.get('/api/get_current_stocks', function (req, res) {
    console.log("get_current_stocks --> %s", req.query.date);
    db_logic.current_stocks(function (error, json) {
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

app.get('/api/get_stock_of', function (req, res) {
    console.log("get_stock_of --> %s", req.query.name);
    db_logic.get_stock_of(req.query.name, function (error, json) {
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

app.get('/exit', function (req, res) {
    console.log("closing server on request. Wait for 2 seconds to close after shutting down server");
    res.writeHead(200, { 'Content-Type': 'application/text' });
    res.end('done');
    db.db_exit();
    setTimeout(function () {        
        process.exit(0);
    }, 2000);
});
    
server = http.listen(port, function(){
    console.log("listening on http://%s:%d", hostname, port);
});

process.on('SIGTERM', function () {
    http.close(function () {
        process.exit(0);
    });
});

process.on('SIGINT', function () {
    http.close(function () {
        process.exit(0);
    });
});
