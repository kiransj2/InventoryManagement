"use strict";
var db = require("../db");
var db_logic = require("../db_logic");
var util = require("util");
var fs = require("fs");


var test_db_path = "db/test_db.db";
db.db_set_path(test_db_path);

function assert(cond, msg) {
    if(cond) {
        console.error("=================Fatal====================");
        console.error("Error:" + msg);
        process.exit(1);
    }
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
            test_get_name_id(rows[i].name, rows[i].id);
        }

        add_new_stock_and_check(rows[0].name, rows[1].name, rows[2].name, rows[3].name);
    });
}

function add_new_stock_and_check(name1, name2, name3, name4) {
    console.log("add stocks and run tests")
    db_logic.new_stock(name1, -1, function (err, msg) {
        assert(!err, "quantity is negative and no error reported." + msg);
    });

    db_logic.new_stock(name1, 250001, function (err, msg) {
        assert(!err, "quantity is more than 250KG and no error reported." + msg);
    });

    db_logic.new_stock(name1, "123213", function (err, msg) {
        assert(!err, "quantity is not numeric value and no error reported." + msg);
    });

    db_logic.new_stock(name1, 450, function (err, msg) {
        assert(err, "quantity is not numeric value and no error reported." + msg);
    });

    db_logic.new_stock(name1, 1, function (err, msg) {
        assert(err, "adding 1 gm failed" + msg);
    });

    db_logic.new_stock(name2, 250000, function (err, msg) {
        assert(err, "adding 250KG  failed" + msg);
    });

    db_logic.new_stock(name3, 250, function (err, msg) {
        assert(err, "adding 250gm  failed" + msg);
    });
    
    db_logic.new_stock(name4, 119876, function (err, msg) {
        assert(err, "adding 1 gm failed" + msg);
    });
    
    db_logic.new_stock(name1, 250000, function (err, msg) {
        assert(err, "adding 250KG  failed" + msg);
    });
    
    db_logic.new_stock(name2, 250, function (err, msg) {
        assert(err, "adding 250gm  failed" + msg);
    });

    db_logic.new_stock("invalid", 250, function (err, msg) {
        assert(!err, "item name is not correct but stock got inserted. " + msg);
    });
}


