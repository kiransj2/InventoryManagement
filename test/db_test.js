﻿"use strict";
var db = require("../db");
var db_logic = require("../db_logic");
var util = require("util");
var fs = require("fs");
var sqlite3 = require("sqlite3");

var format = util.format;

var test_db_path = "db/test_db.db";
db.db_set_path(test_db_path);

function assert(cond, msg) {
    console.assert(!(cond), msg);    
}

if (fs.existsSync(test_db_path)) {
    fs.unlinkSync(test_db_path);
}


assert(db.db_status(), "db is open even before we initialized")
assert(!db.db_init(true), util.format("unable open/create db file %s", test_db_path));
assert(!db.db_status(), "db_failure! not sure why!!");

db_logic.build_tables(function (error_count) {
    assert(error_count, "some tables where not created");
    add_entries();
});

var name = "cashew";
var num_entries = 10; // This should be min 4
function add_entries() {
    var entry_count = 0;
    console.log("adding %d entries to db", num_entries);
    for (var i = 0; i < num_entries; i++) {
        db_logic.new_item(name + i + "_" + "-", function (err, msg) {
            entry_count++;
            assert(err, "Inserting item failed");

            if (entry_count == num_entries) {
                get_entries_and_check();
            }
        });
    }

    console.log("check giving names which does not meet the requirement.")
    var str = [];
    str[0] = "kiran is";
    str[1] = "!kiran";
    str[2] = "#kiran";
    str[3] = "kiranis$";
    str[4] = "kiran%is%";
    str[5] = "kira";
    str[6] = "k";
    for (i = 0; i < str.length; i++) {
        db_logic.new_item(str[i], function (err, msg) {
            assert(!err, "negative test failed for adding name which doesn't match requirement");
        });
    }
}

function test_get_name_id(name, id) {
    db_logic.item_id(name, function (err, id1) {
        assert(err, "item_id() function failed");
        assert(id != id1, util.format("expected %d != %d for item %s", id, id1, name));
    });

    db_logic.item_name(id, function (err, name1) {
        assert(err, util.format("item_id() function failed on %s %d", name, id));
        assert(name != name1, util.format("expected %s != %s for item %d", name, name1, id));
    });
}

function get_entries_and_check() {
    console.log("get entries from db and check");
    db_logic.item_list(function (err, rows) {
        assert(err, "get_entries_and_check failed");
        assert(rows.length != num_entries, util.format("number of entries %d does not match with %d", rows.length, num_entries));
        console.log("check getting id and getting name functions on each values");
        for (var i = 0; i < rows.length; i++) {
            test_get_name_id(rows[i].name, rows[i].item_id);
        }

        add_new_stock_and_check(rows[0].name, rows[1].name, rows[2].name, rows[3].name);
        add_new_sales_and_check(rows[0].name, rows[1].name, rows[2].name, rows[3].name);
    });
}

function add_new_stock_and_check(name1, name2, name3, name4) {
    console.log("add stocks and run tests")
    db_logic.new_stock(name1, -1, null, function (err, msg) {
        assert(!err, "quantity is negative and no error reported." + msg);
    });

    db_logic.new_stock(name1, 2500001, null,  function (err, msg) {
        assert(!err, "quantity is more than 2500KG and no error reported." + msg);
    });

    db_logic.new_stock(name1, "123213", null,  function (err, msg) {
        assert(!err, "quantity is not numeric value and no error reported." + msg);
    });
    
    db_logic.new_stock("invalid", 250, null, function (err, msg) {
        assert(!err, "item name is not correct but stock got inserted. " + msg);
    });
    
    db_logic.new_stock(name3, 765, ('2015-31-7'), function (err, msg) {
        assert(!err, "1. adding new stock with invalid date worked. " + msg);
    });
    
    db_logic.new_stock(name3, 765, ('1-2015-7'), function (err, msg) {
        assert(!err, "2. adding new stock with invalid date worked. " + msg);
    });
    
    var value1 = 450 + 1 + 250000;
    var value2 = 250000;
    var value3 = 250 + 119876;
    // Insert some correct values to run tests.
    db_logic.new_stock(name1, 450, null, function (err, msg) {
        assert(err, "adding 450 gm failed. " + msg);
    });
        
    db_logic.new_stock(name1, 1, null, function (err, msg) {
        assert(err, "adding 1 gm failed" + msg);
    });
        
    db_logic.new_stock(name1, 250000, null, function (err, msg) {
        assert(err, "adding 250KG  failed" + msg);
    });
        
    db_logic.new_stock(name2, 250000, null, function (err, msg) {
        assert(err, "adding 250KG  failed" + msg);
    });
        
    db_logic.new_stock(name3, 250, null, function (err, msg) {
        assert(err, "adding 250gm  failed" + msg);
    });
        
    db_logic.new_stock(name3, 119876, null, function (err, msg) {
        assert(err, "adding 1 gm failed" + msg);
    });
        
    db_logic.new_stock(name2, 250, db.format_user_date('2014-1-11'), function (err, msg) {
        assert(err, "adding 250gm  failed" + msg);
    // Dont include this in the count.
    });
    
    console.log("sleep for 1.5 second so that all db function are done");
    setTimeout(function () {
        console.log("query and check the stocks inserted")
        db_logic.get_all_incoming_stock_on(db.db_date(), function (err, rows) {
            assert(rows.length != 3, format("num of rows %d != 3 (expected)", rows.length));
            assert(value1 != rows[0].sum, format("1. expected %d != %d", value1, rows[0].sum));
            assert(value2 != rows[1].sum, format("2. expected %d != %d", value2, rows[1].sum));
            assert(value3 != rows[2].sum, format("3. expected %d != %d", value3, rows[2].sum));            
        });

        console.log("query and check the stocks on arbitary date")
        db_logic.get_all_incoming_stock_on('2014-1-11', function (err, rows) {
            assert(rows.length != 1, format("num of rows %d != 1 (expected)", rows.length));
            assert(250 != rows[0].sum, format("expected %d != %d", 250, rows[0].sum));
        });

        add_some_entries_to_db();
    }, 1500);
    
    function add_some_entries_to_db() {
        db_logic.new_stock(name1, 250, db.format_user_date('2014-7-11'), function (err, msg) {
            assert(err, "adding 250gm  failed" + msg);
        });
        
        db_logic.new_stock(name2, 391, db.format_user_date('2015-3-1'), function (err, msg) {
            assert(err, "adding 391gm  failed" + msg);
        });
        db_logic.new_stock(name3, 765, db.format_user_date('2015-3-7'), function (err, msg) {
            assert(err, "adding 765gm failed" + msg);
        });
    }
}

function add_new_sales_and_check(name1, name2, name3, name4) {
        
    console.log("Check for negative tests in outgoing stocks");    
    {
        var obj = { name: name3, option: "Distributor", quantity: 4750, reason: "To Kolar", when: '2014-1-32' };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(!err, "Date is wrong and insert should have failed.");
        });
    }
    
    {
        var obj = { name: name3, option: "Distributor", quantity: 4750, reason: "To Kolar", when: '2014-14-1' };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(!err, "Date is wrong and insert should have failed. " + msg);
        });
    }
    
    {        
        var obj = { name: name3, option: "Distributor", quantity: "kiran", reason: "To Kolar", when: '2014-1-1' };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(!err, "Quantity is not number and insert should have failed");
        });
    }
    
    {
        var obj = { name: "kiran", option: "Distributor", quantity: 4312, reason: "To Kolar", when: '2014-1-1' };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(!err, "Invalid Item name but still insert was successful");
        });
    }
    

    {
        var obj = { name: name1, option: "Hotel", quantity: 4312, reason: "Shanti Sagar", when: db.db_date() };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(err, "Failed to insert 3.5KG sale due to error " + msg);
        });
    }
        
    {
        var obj = { name: name3, option: "LocalSale", quantity: 1500, reason: "Consumer", when: db.db_date() };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(err, "Failed to insert 4.75KG sale due to error " + msg);
        });
    }
    
    {
        var obj = { name: name2, option: "Distributor", quantity: 4750, reason: "To Kolar", when: db.db_date() };
        db_logic.insert_outgoing_stocks(obj, function (err, msg) {
            assert(err, "Failed to insert 4.75KG sale due to error " + msg);
        });
    }
    
    return;
}
