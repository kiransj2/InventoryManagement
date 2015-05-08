"use strict";
var db = require("../db");
var db_logic = require("../db_logic");
var util = require("util");
var fs = require("fs");


var test_db_path = "db/test_db.db";
db.db_set_path(test_db_path);

if (fs.existsSync(test_db_path)) {
    fs.unlinkSync(test_db_path);
}


if (db.db_status()) {
    console.error("db is open even before we initialized");
    process.exit(1);
}

if (!db.db_init(true)) {
    console.error("unable open/create db file %s", test_db_path);
    process.exit(1);
}

if (!db.db_status()) {
    console.error("db_failure!");
    process.exit(1);
}

db_logic.build_tables(function (error_count) {
    if (!error_count) {
        add_entries();
    } else {
        console.log("error :(");
    }
});

var name = "cashew";
var num_entries = 10;
function add_entries() {
    var error_count = 0, entry_count = 0;
    console.log("adding %d entries to db", num_entries);
    for (var i = 0; i < num_entries; i++) {
        db_logic.new_item(name + i + "_" + "-", function (err, msg) {
            entry_count++;
            if (err) {
                console.error("error inserting item");
                process.exit(1);
                error_count++;
            }

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
    for (i = 0; i < str.length; i++) {
        db_logic.new_item(str[i], function (err, msg) {
            if (!err) {
                console.error("negative test failed for adding name which doesn't match requirement");
                process.exit(1);
            }
        });
    }
}

function test_get_name_id(name, id) {
    db_logic.item_id(name, function (err, id1) {
        if (err) {
            console.error("item_id() function failed");
            process.exit(1);
        }
        if (id != id1) {
            console.error("expected %d != %d for item %s", id, id1, name);
            process.exit(1);
        }
    });

    db_logic.item_name(id, function (err, name1) {
        if (err) {
            console.error("item_id() function failed on %s %d", name, id);
            process.exit(1);
        }
        if (name != name1) {
            console.error("expected %s != %s for item %d", name, name1, id);
            process.exit(1);
        }
    });
}

function get_entries_and_check() {
    console.log("get entries from db and check");
    db_logic.item_list(function (err, rows) {
        if (err) {
            console.error("get_entries_and_check failed");
            process.exit(1);
        }
        if (rows.length != num_entries) {
            console.error("number of entries %d does not match with %d", rows.length, num_entries);
            process.exit(1);
        }
        console.log("check getting id and getting name functions on each values");
        for (var i = 0; i < rows.length; i++) {
            test_get_name_id(rows[i].name, rows[i].id);
        }
    });
}
