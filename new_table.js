"use strict"
var db = require("./db");

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

if (!db.db_init()) {
    console.error("Unable to open database file");
    process.exit(1);
}

db.db_exit();
