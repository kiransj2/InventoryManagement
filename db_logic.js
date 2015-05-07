"use strict";
var db = require("./db");
var util = require("util");

function create_tables() {
    var create_items_table =  
                "CREATE TABLE Items( " + 
                "id integer PRIMARY KEY autoincrement, " +
                "name varchar(255) NOT NULL," +
                "dt datetime NOT NULL default (datetime('now'))," +
                "UNIQUE (name));";

    var create_incoming_stock_table = 
                "CREATE TABLE incoming_stocks("+
                "id integer primary key,"+
                "quantity integer NOT NULL,"+
                "dt datetime  NOT NULL default (datetime('now')),"+
                "FOREIGN KEY (ID) REFERENCES Items(id));";

    db.db_new_table(create_items_table, function (err) {
        if (err) {
            console.error("Error creating Items table");
            return;
        }
        console.log("Created Items table");
    });

    db.db_new_table(create_incoming_stock_table, function(err) {
        if (err) {
            console.error("Error creating incoming_stock table");
            return;
        }
        console.log("Created incoming_stocks table");
    });
}

function validate_item_name(name) {
    if (name === "") return false;
    var letter = /^[0-9a-zA-Z_\-]+$/;
    if (letter.test(name)) {
        return true;
    }
    else {
        console.error("only characters, _ and - are allowed in item name");
        return false;
    }
    return false;
}

function insert_item_name(name, callback) {
    if (!validate_item_name(name)) {
        console.error("'" + name + "' does not meet the requirements");
        process.nextTick(function () {
            callback(true, "name'" + name + "' does not meet the requirements");
            return;
        });
        return;
    } else {
        var stmt = util.format("INSERT INTO ITEMS(name,dt) VALUES('%s','%s');", name, db.db_date_now());
        db.db_execute_query(stmt, function (err, rows) {
            if (err) {
                console.error("Insert operation for name '" + name + "' failed due to " + err);
                callback(true, "Insert operation failed");
                return;
            }
            callback(false);
            return;
        });
    }
    return;
}

if (!db.db_init()) {
    console.error("Unable to open database file");
    process.exit(1);
}

insert_item_name("kiran", function (err) {
    if (err) {
        console.error("failed to insert name");
    }
    else {
        console.log("Inserted name")
    }
});

db.db_exit();
