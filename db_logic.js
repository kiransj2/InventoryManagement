"use strict";
var db = require("./db");
var util = require("util");
var moment = require('moment');

var format = util.format;
var verbose = 0;

function log(msg) {
    if (verbose) {
        console.error(msg);
    }
}
function create_tables(client_callback) {
    var create_items_table =  
                "CREATE TABLE Items( " + 
                "item_id integer PRIMARY KEY autoincrement, " +
                "name varchar(255) NOT NULL," +
                "dt date NOT NULL default (date('now', 'localtime'))," +
                "tm time NOT NULL default (time('now', 'localtime'))," +
                "UNIQUE (name));";

    var create_incoming_stock_table = 
                "CREATE TABLE incoming_stocks("+
                "transaction_id integer PRIMARY KEY autoincrement,"+
                "item_id integer NOT NULL,"+
                "quantity integer NOT NULL," +
                "price integer NOT NULL," +
                "dt date  NOT NULL default (date('now', 'localtime'))," +
                "tm time  NOT NULL default (time('now', 'localtime'))," +
                "FOREIGN KEY (item_id) REFERENCES Items(item_id));";

    var create_incoming_stocks_view = 
                "CREATE VIEW incoming_stocks_view AS " +
                "SELECT stocks.item_id AS item_id, name, SUM(quantity) AS quantity, SUM(price) AS price, stocks.dt AS dt " +
                "FROM incoming_stocks AS stocks " +
                "JOIN Items AS items " +
                "ON stocks.item_id = items.item_id " +
                "GROUP BY name, stocks.item_id, stocks.dt " +
                "ORDER BY dt DESC;";
    
    var create_total_incoming_stocks_view = 
                "CREATE VIEW total_incoming_stocks_view AS " +
                "SELECT item_id, name, SUM(quantity) AS quantity, SUM(price) AS price " +
                "FROM incoming_stocks_view " +
                "GROUP BY item_id ";

    var create_outgoing_stocks_table = 
                "CREATE TABLE outgoing_stocks(" +
                "transaction_id INTEGER PRIMARY KEY autoincrement," +
                "transaction_type VARCHAR," +
                "item_id INTEGER NOT NULL," +
                "quantity INTEGER NOT NULL," +
                "price INTEGER NOT NULL," +
                "reason VARCHAR," +
                "dt date  NOT NULL default (date('now', 'localtime'))," +
                "tm time  NOT NULL default (time('now', 'localtime'))," +
                "FOREIGN KEY (item_id) REFERENCES Items(item_id));";
    
    var create_outgoing_stocks_view = 
                "CREATE VIEW outgoing_stocks_view AS " +
                "SELECT stocks.item_id as item_id, name, SUM(quantity) as quantity, SUM(price) as price, stocks.dt as dt " +
                "FROM outgoing_stocks as stocks " +
                "JOIN Items as items " +
                "ON stocks.item_id = items.item_id " +
                "group by name, stocks.item_id, stocks.dt " +
                "order by dt DESC ";

    var create_total_outgoing_stock_view = 
                "CREATE VIEW total_outgoing_stocks_view as " +
                "SELECT item_id, name, SUM(quantity) as quantity, SUM(price) as price " +
                "from outgoing_stocks_view " +
                "group by item_id";
    
    var create_cur_stocks_levels_view = 
                "CREATE VIEW current_stocks as " +
                "SELECT incoming.item_id, incoming.name, " +
                "(SUM(incoming.quantity) - SUM(outgoing.quantity)) as quantity " + 
                "from total_incoming_stocks_view as incoming " +
                "join total_outgoing_stocks_view as outgoing on incoming.item_id = outgoing.item_id " +
                "group by incoming.item_id " +
                "union " +
                "SELECT item_id, name, quantity " +
                "from total_incoming_stocks_view " +
                "where item_id NOT in(SELECT item_id from total_outgoing_stocks_view) ";
    
    var create_transaction_history_view = 
                 "CREATE VIEW transaction_history AS " +
                 "SELECT name, 'incoming' as type, quantity, price, dt "+
                 "from incoming_stocks_view " +
                 "where dt = date('now') " +
                 "union " +
                 "SELECT name, 'outgoing' as type, quantity, price, dt " +
                 "from outgoing_stocks_view " +                 
                 "order by name ";
    
    function callback(error_count) {
        if (error_count) {
            console.error("Some table were not created");
            client_callback(error_count);
            return;
        }
        
        var table = 2;
        db.db_new_table(create_cur_stocks_levels_view, function (err) {
            table--;
            if (err) {
                err++;
                console.error("Error creating cur_stocks_levels view");
                client_callback(err);
                return;
            }
            if(!table)
                client_callback(0);
            return;
        });

        db.db_new_table(create_transaction_history_view, function (err) {
            table--;
            if (err) {
                err++;
                console.error("Error creating cur_stocks_levels view");
                client_callback(err);
                return;
            }
            if(!table)
                client_callback(0);
            return;
        });
    }

    var table_count = 7, error_count = 0;
    
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
    
    db.db_new_table(create_outgoing_stocks_table, function (err) {
        table_count--;
        if (err) {
            error_count++;
            console.error("Error creating outgoing stocks table");
            callback(error_count);
        } else {
            db.db_new_table(create_outgoing_stocks_view, function (err) {
                table_count--;
                if (err) {
                    error_count++;
                    console.error("Error creating outgoing_stocks view");
                    callback(error_count);
                } else {
                    db.db_new_table(create_total_outgoing_stock_view, function (err) {
                        table_count--;
                        if (err) {
                            error_count++;
                            console.error("Error creating total_outgoing_stock view");
                        }
                        if (!table_count) {
                            callback(error_count);
                        }
                    });
                }                
            });
        }
    });

    db.db_new_table(create_incoming_stock_table, function (err) {
        table_count--;
        if (err) {
            error_count++;
            console.error("Error creating incoming_stock table");
            callback(error_count);
        }
        else {
            db.db_new_table(create_incoming_stocks_view, function (err) {
                table_count--;
                if (err) {
                    error_count++;
                    console.error("Error creating incoming_stock view");
                    allback(error_count);
                } else {
                    db.db_new_table(create_total_incoming_stocks_view, function (err) {
                        table_count--;
                        if (err) {
                            error_count++;
                            console.error("Error creating total_incoming_stocks view");
                        }
                        if (!table_count) {
                            callback(error_count);
                        }
                    });
                }
            });
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
        var stmt = format("INSERT INTO ITEMS(name,dt,tm) VALUES('%s','%s', '%s');", name, db.db_date(), db.db_time());
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
    var stmt = format("SELECT name FROM ITEMS WHERE item_id = %d", id);
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
    var stmt = format("SELECT item_id FROM ITEMS WHERE name = '%s'", name);
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            callback(true, "Invalid id=" + id + ".");
            return;
        }
        if (rows.length == 1) {            
            callback(false, rows[0].item_id);
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
    var stmt = format("SELECT item_id, name, dt FROM ITEMS");
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

function insert_incoming_stocks(name, quantity, price, when, callback) {
    log(format("%s ---> %s", name, quantity));
    if (typeof quantity !== "number") {
        log(format("quantity is not numeric insted it is %s", typeof quantity));
        process.nextTick(function () {
            callback(true, "quantity is not numeric value");
        });
        return;
    }
   
    // Min of 1 gm and max of 250KG
    if ((quantity < 1) || (quantity > 2500000)) {
        log("quantity is not in range of 1gm to 2500KG");
        process.nextTick(function () {
            callback(true, "quantity is not in range of 1gm to 250KG");
        });
        return;
    }
    
    if (typeof price !== "number") {
        log(format("price is not numeric insted it is %s", typeof quantity));
        process.nextTick(function () {
            callback(true, "price is not numeric value");
        });
        return;
    }
    
    // Min of 1 gm and max of 250KG
    if ((price < 1) || (price > 500000)) {
        log("price is not in range of Rs 1 to 500000");
        process.nextTick(function () {
            callback(true, "500000 is not in range of Rs 1 to 500000");
        });
        return;
    }
    
  
    if ((null !== when) && !moment(when, "YYYY-MM-DD").isValid()) {
        log(format("date '%s' is not in the correct format", when));
        callback(true, format("date '%s' is not in the correct format", when));
        return;
    }
 
    get_item_id(name, function (err, id) {
        if (err) {
            var msg = format("item name '%s' is invalid.", name);
            log(msg);
            callback(true, msg);
            return;
        }
        var stmt;
        var d = (when === null) ? db.db_date() : db.format_user_date(when);
        stmt = format("INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(%d, %d, %d, '%s', '%s');", 
                       id, quantity, price, d, db.db_time());
        log(stmt);
        db.db_execute_query(stmt, function (err, rows) {
            if (err) {
                var text = "Failed to insert incoming stocks of " + quantity + " gms of item " + name + "failed due to " + err;
                console.error(text);
                callback(true, text);
                return;
            }
            callback(false, format("Added %d gms of item %s to db.", quantity, name));
            return;
        });
    });
}

function get_all_incoming_stock_on(when, callback) {
    var date = moment(when, "YYYY-MM-DD").format("YYYY-MM-DD");
    var stmt = format("SELECT * from incoming_stocks_view where dt = '%s'", date);
    log(stmt);

    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            console.error("Query operation to fetch incoming_stocks failed %s", err);
            callback(true, "Query operation to fetch incoming_stocks failed");
            return;
        }

        log(format("rows.length = %d", rows.length));
        callback(false, rows);
        return;
    });
    return;
}

function get_all_incoming_stock_summary_range(when, callback) {
    var date;
    if (when == 'week')
        date = moment().subtract(7, 'days');
    else if (when == 'month')
        date = moment().subtract(30, 'days');
    else if (when == 'today')
        date = moment().subtract(1, 'days');
    
    var stmt = format("SELECT * from incoming_stocks_view where dt > '%s'", date.format('YYYY-MM-DD'));
    log(stmt);
    
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            console.error("Query operation to fetch incoming_stocks failed %s", err);
            callback(true, "Query operation to fetch incoming_stocks failed");
            return;
        }
        log(format("rows.length = %d", rows.length));
        callback(false, rows);
        return;
    });
    return;
}

function get_all_incoming_stock_range(when, callback) {
    var date;
    if (when == 'week')
        date = moment().subtract(7, 'days');
    else if(when == 'month')
        date = moment().subtract(30, 'days');
    else if(when == 'today')
        date = moment().subtract(1, 'days');

    var stmt = format("SELECT stocks.transaction_id, stocks.item_id, items.name, stocks.quantity, stocks.price, stocks.dt, stocks.tm " +
                       "from incoming_stocks as stocks " +
                       "join items as items " +
                       "on items.item_id = stocks.item_id " +
                       "where stocks.dt > date('%s') " +
                       "order by stocks.transaction_id DESC;" , date.format('YYYY-MM-DD'));
    log(stmt);
    
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            console.error("Query operation to fetch incoming_stocks failed %s", err);
            callback(true, "Query operation to fetch incoming_stocks failed");
            return;
        }
        log(format("rows.length = %d", rows.length));
        callback(false, rows);
        return;
    });
    return;
}

function insert_outgoing_stocks(obj, callback) {

    if (typeof obj.quantity !== "number") {
        log(format("quantity is not numeric insted it is %s", typeof quantity));
        process.nextTick(function () {
            callback(true, "quantity is not numeric value");
        });
        return;
    }
    
    if (typeof obj.price !== "number") {
        log(format("price is not numeric insted it is %s", typeof quantity));
        process.nextTick(function () {
            callback(true, "price is not numeric value");
        });
        return;
    }

    if ((null !== obj.when) && !moment(obj.when, "YYYY-MM-DD").isValid()) {
        log(format("date '%s' is not in the correct format", obj.when));
        callback(true, format("date '%s' is not in the correct format", obj.when));
        return;
    }
    
    //TODO: Validate the stocks is not greater than Current Available stocks

    get_item_id(obj.name, function (err, id) {
        if (err) {
            var msg = format("item name '%s' is invalid.", obj.name);
            log(msg);
            callback(true, msg);
            return;
        }
        var stmt;
        var d = (obj.when === null) ? db.db_date() : db.format_user_date(obj.when);
        stmt = format("INSERT INTO outgoing_stocks (transaction_type, item_id, quantity, price, reason, dt, tm) " +
                      "values('%s', %d, %d, %d, '%s', '%s', '%s'); ", 
                      obj.option, id, obj.quantity, obj.price, obj.reason, d, db.db_time());
        log(stmt);
        db.db_execute_query(stmt, function (err, rows) {
            if (err) {
                var str = format("Failed to insert outgoing stocks of %d gms of item %s failed due to %s",
                                  obj.quantity, obj.name, err);
                console.error(str);
                callback(true, str);
                return;
            }
            callback(false, format("Sold %d gms of item %s to %s.", obj.quantity, obj.name, obj.option));
            return;
        });
    });
}

function get_all_outgoing_stock_on(when, callback) {
    var date = moment(when, "YYYY-MM-DD").format("YYYY-MM-DD");
    var stmt = format("SELECT * FROM outgoing_stocks_view WHERE dt = '%s'", date);
    log(stmt);
    
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            console.error("Query operation to fetch outgoing_stocks failed %s", err);
            callback(true, "Query operation to fetch outgoing_stocks failed");
            return;
        }
        callback(false, rows);
        return;
    });
    return;
}

function get_all_outgoing_stock_range(when, callback) {
    var date;
    if (when == 'week')
        date = moment().subtract(7, 'days');
    else if (when == 'month')
        date = moment().subtract(30, 'days');
    else if (when == 'today')
        date = moment().subtract(1, 'days');
    
    var stmt = format("SELECT stocks.transaction_id, stocks.transaction_type, items.name, stocks.quantity, stocks.reason, stocks.price, stocks.dt, stocks.tm " +
                       "FROM outgoing_stocks AS stocks " +
                       "JOIN items AS items " +
                       "ON items.item_id = stocks.item_id " +
                       "WHERE stocks.dt > date('%s') " +
                       "ORDER BY stocks.transaction_id DESC;" , date.format('YYYY-MM-DD'));
    log(stmt);
    
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            console.error("Query operation to fetch outgoing_stocks_range failed %s", err);
            callback(true, "Query operation to fetch incoming_stocks_range failed");
            return;
        }
        log(format("rows.length = %d", rows.length));
        callback(false, rows);
        return;
    });
    return;
}

function get_current_stocks(callback) {
    var stmt = format("SELECT * FROM current_stocks");
    log(stmt);
    
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            var msg = format("Query operation to fetch current stocks failed %s", err);
            console.error(msg);
            callback(true, msg);
            return;
        }
        console.log("current_stocks rows.length : %d", rows.length);
        callback(false, rows);
        return;
    });
    return;
}

function get_stocks_of(item_name, callback) {
    var stmt = format("SELECT * FROM current_stocks WHERE name = '%s'", item_name);
    console.log(stmt);
    
    db.db_execute_query(stmt, function (err, rows) {
        if (err) {
            var msg = format("Query operation to fetch stocks of '%s' failed due to %s", item_name, err);
            console.error(msg);
            callback(true, msg);
        } else if (rows.length == 0) {
            var msg = format("Query operation to fetch stocks of '%s' returned nothing.", item_name);
            console.error(msg);
            callback(true, msg);            
        } else {
            console.log("current_stocks rows.length : %d", rows.length);
            callback(false, rows);
        }
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
    get_all_incoming_stock_on: get_all_incoming_stock_on,
    get_all_incoming_stock_range: get_all_incoming_stock_range, 
    get_all_incoming_stock_summary_range: get_all_incoming_stock_summary_range,

    sell_stock: insert_outgoing_stocks,
    get_all_outgoing_stock_on: get_all_outgoing_stock_on,
    get_all_outgoing_stock_range: get_all_outgoing_stock_range,

    current_stocks: get_current_stocks,
    get_stock_of: get_stocks_of
};
