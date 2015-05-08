"use strict";
var db = require("./db");
var util = require("util");

var format = util.format;
var verbose = 0;

function log(msg) {
    if (verbose) {
        console.error(msg);
    }
}
function create_tables(callback) {
    var create_items_table =  
                "CREATE TABLE Items( " + 
                "id integer PRIMARY KEY autoincrement, " +
                "name varchar(255) NOT NULL," +
                "dt date NOT NULL default (date('now', 'localtime'))," +
                "tm time NOT NULL default (time('now', 'localtime', '+270 minutes'))," +
                "UNIQUE (name));";

    var create_incoming_stock_table = 
                "CREATE TABLE incoming_stocks("+
                "transaction_id integer PRIMARY KEY autoincrement,"+
                "item_id integer NOT NULL,"+
                "quantity integer NOT NULL,"+
                "dt date  NOT NULL default (date('now', 'localtime'))," +
                "tm time  NOT NULL default (time('now', 'localtime', '+270 minutes'))," +
                "FOREIGN KEY (item_id) REFERENCES Items(id));";
    
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
        log("'" + name + "' does not meet the requirements");      
        process.nextTick(function () {
            callback(true, "name'" + name + "' does not meet the requirements");
            return;
        });
        return;
    } else {
        var stmt = format("INSERT INTO ITEMS(name,dt) VALUES('%s','%s');", name, db.db_datetime());
        db.db_execute_query(stmt, function (err, rows) {
            if (err) {
                console.error("Insert operation for name '" + name + "' failed due to " + err);
                callback(true, "Insert operation failed");
                return;
            }
            callback(false, "done");
            return;
        });
    }
    return;
}

function get_item_name(id, callback) {
    var stmt = format("SELECT name FROM ITEMS WHERE id = %d", id);
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
    var stmt = format("SELECT id FROM ITEMS WHERE name = '%s'", name);
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            callback(true, "Invalid id=" + id + ".");
            return;
        }
        if (rows.length == 1) {            
            callback(false, rows[0].id);
        } else if (rows.length == 0) {
            log(format("No Element with name='%s' found in db", name));
            callback(true, "No Element with name='" + name + "' found in db");
        } else {
            console.error("more than 1 id(%d) exists for name = '%s'", rows.length, name);
            callback(true, "more than 1 id exists for name = '" + name + "'");
        }
        return;
    });
}

function get_item_list(callback) {
    var stmt = format("SELECT id, name, dt FROM ITEMS");
    log(stmt);
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

function isDate (date) {
    return ((new Date(date)).toString() !== "Invalid Date") ? true : false;
}

function insert_incoming_stocks(name, quantity, when, callback) {
    log(format("%s ---> %s", name, quantity));
    if (typeof quantity !== "number") {
        log(format("quantity is not numeric insted it is %s", typeof quantity));
        process.nextTick(function () {
            callback(true, "quantity is not numeric value");
        });
        return;
    }
    // Min of 1 gm and max of 250KG
    if ((quantity < 1) || (quantity > 250000)) {
        log("quantity is not in range of 1gm to 250KG");
        process.nextTick(function () {
            callback(true, "quantity is not in range of 1gm to 250KG");            
        });
        return;
    }

/*  TODO: Validate the date input.
    if ((null !== when) && (isDate(when) == false)) {
        console.error("date '%s' is not in the correct format", when);
        callback(true, format("date '%s' is not in the correct format", when));
        return;
    }
*/
    get_item_id(name, function (err, id){
        if (err) {
            var msg = format("item name '%s' is invalid.", name);
            log(msg);
            callback(true, msg);
            return;
        }
        var stmt;
        var d = (when === null) ? db.db_datetime() : when;
        stmt = format("INSERT INTO incoming_stocks(item_id, quantity, dt) values(%d, %d, '%s');", id, quantity, d);
        log(stmt);
        db.db_execute_query(stmt, function (err, rows) {
            if (err) {
                console.error("Failed to insert incoming stocks of " + quantity + " gms of item " + name + "failed due to " + err);
                callback(true, "Failed to insert incoming stocks of " + quantity + " gms of item " + name + "failed due to " + err);
                return;
            }
            callback(false, format("Added %d gms of item %s to db.", quantity, name));
            return;
        });
    })
}

function get_all_incoming_stock_on(when, callback) {
    var stmt = format("SELECT item_id, SUM(quantity) as sum, dt FROM incoming_stocks " +
                      "where (dt == '%s') group by item_id order by item_id ASC", when);
    log(stmt);

    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            console.error("Query operation to fetch item list failed");
            callback(true, "Query operation to fetch item list failed");
            return;
        }
        log(format("rows.length = %d", rows.length));
        callback(false, rows);
        return;
    });
    return;
}



module.exports = {
    build_tables: create_tables,
    new_item: insert_item_name,
    item_id: get_item_id,
    item_name: get_item_name,
    item_list: get_item_list,
    new_stock: insert_incoming_stocks,
    get_all_incoming_stock_on: get_all_incoming_stock_on
};
