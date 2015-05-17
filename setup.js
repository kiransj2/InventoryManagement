"use strict";
var db = require("./db");
var db_logic = require("./db_logic");
var util = require("util");
var fs = require("fs");

var db_file = "../db/goldennuts.db";
var db_log_file = "../db/goldennuts.sql";


var format = util.format;
function assert(cond, msg) {
    if (cond) {
        console.error(msg);
        console.assert(!(cond), msg);
    }
}

assert(fs.existsSync(db_file), format("db file '%s' already exists. Delete it and run this script again", db_file));
assert(fs.existsSync(db_log_file), format("db log file '%s' already exists. Delete it and run this script again", db_log_file));

db.db_set_path(db_file);
db.db_set_logfile_path(db_log_file);

var create_db = true;
db.db_init(create_db);

assert(!db.db_status(), "unable to initialize db files");

db_logic.build_tables(function (error_count) {
    assert(error_count, "some tables where not created");
    db.db_exit();
    console.log("built all the tables.");
});


