"use strict";
var db = require("./db");
var util = require("util");

var verbose = 0;
function create_tables(callback) {
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
    
    var table_count = 2, error_count = 0;      
    db.db_new_table(create_items_table, function (err) {
        table_count--;
        if (err) {
            error_count++;
            console.error("Error creating Items table");            
        }
        if (!table_count) {
            callback(error_count);
        }
    });

    db.db_new_table(create_incoming_stock_table, function (err) {
        table_count--;
        if (err) {
            error_count++;
            console.error("Error creating incoming_stock table");            
        }
        if (!table_count) {
            callback(error_count);
        }
    });
}

function validate_item_name(name) {
    if (name === "") return false;
    if (name.length < 5) return false;
    var letter = /^[0-9a-zA-Z_\-]+$/;
    if (letter.test(name)) {
        return true;
    }
    else {        
        return false;
    }
    return false;
}

function insert_item_name(name, callback) {
    if (!validate_item_name(name)) {
        if (verbose) {
            console.error("'" + name + "' does not meet the requirements");
        }
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

function get_item_name(id, callback) {
    var stmt = util.format("SELECT name FROM ITEMS WHERE id = %d", id);
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            callback(true, "Invalid id=" + id + ".");
            return;
        }
        if (rows.length == 1) {
            callback(false, rows[0].name);
        }  else if (rows.length == 0) {
            console.error("No Element with id='%d' found in db", id);
            callback(true, "No Element with id='" + id + "' found in db");
        } else {
            console.error("more than 1 name exists for id = %d", id);
            callback(true, "more than 1 name exists for id = " + id);            
        }
        return;
    });
}

function get_item_id(name, callback) {
    var stmt = util.format("SELECT id FROM ITEMS WHERE name = '%s'", name);
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            callback(true, "Invalid id=" + id + ".");
            return;
        }
        if (rows.length == 1) {            
            callback(false, rows[0].id);
        } else if (rows.length == 0) {
            console.error("No Element with name='%s' found in db", name);
            callback(true, "No Element with name='" + name + "' found in db");
        } else {
            console.error("more than 1 id(%d) exists for name = '%s'", rows.length, name);
            callback(true, "more than 1 id exists for name = '" + name + "'");
        }
        return;
    });
}

function get_item_list(callback) {
    var stmt = util.format("SELECT id, name, dt FROM ITEMS");
    db.db_execute_query(stmt, function(err, rows) {
        if(err) {
            console.error("Query operation to fetch item list failed");
            callback(true, "Query operation to fetch item list failed");
            return;
        }
        callback(false, rows);
        return;
    });
    return;
}

var test = 0;
if (test) {
    if (!db.db_init(true)) {
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
    
    get_item_list(function (err, rows) {
        if (err) {
            console.error("get_item_list() failed");
            return;
        }
        console.log("Number of rows : %d", rows.length);
        for (var i = 0; i < rows.length; i++) {
            console.log("%d --> %s --> %s", rows[i].id, rows[i].name, rows[i].dt);
        }
    });
    
    var i_id = 4;
    get_item_name(i_id, function (err, name) {
        if (err) {
            console.error("failed to get name");
        } else {
            console.log("Item name = %s, id = %d", name, i_id);
        }
    });

    get_item_id("B_flower", function (err, id) {
        if (err) {
            console.error("failed to get id");
        } else {
            console.log("Item name = %s, id = %d", "B_flower", id);
        }
    });

    db.db_exit();
}



module.exports = {
    build_tables: create_tables,
    new_item: insert_item_name,
    item_id: get_item_id,
    item_name: get_item_name,
    item_list: get_item_list,
};
