"use strict";
var db = require("./db");
var util = require("util");
var db_logic = require("./db_logic");
var fs = require("fs");


var test_db_path = "./test_db.db";
db.db_set_path(test_db_path);

if (fs.existsSync(test_db_path)) {
    fs.unlinkSync(test_db_path);
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
        console.log("no errors!!!");
    } else {
        console.log("error :(");
    }
});

for (var i = 0; i < 10; i++) {
    db_logic.new_item("cashew" + i, function (err, msg) {
        if (err) {
            console.error("error inserting item");
        }
    });
}