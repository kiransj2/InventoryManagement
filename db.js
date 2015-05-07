"use strict";

var fs = require("fs"),
    sqlite3 = require("sqlite3").verbose();

// Global Variables
var db;
var repository = "./mydb.db";

function db_open() {
    if (typeof db === 'undefined') {
        if (fs.existsSync(repository)) {
            db = new sqlite3.Database(repository);
            return true;
        }
    } else {
        console.error("Trying to open DB file twice");
    }
    return false;
}

function db_close() {
    if (typeof db === 'undefined') {
        console.error("trying to close a unopened file");
        return;
    }
    db.close();
}

function db_status() {
    if(typeof db === 'undefined') {
        return false;
    }
    return true;
}

function db_execute_query(query, callback) {
    db.all(query, callback);
    return;
}

function db_create_table(query, callback) {
    if(!db_status()) {
        console.error("trying to create table without opening database");
        return false;
    }
    db_execute_query(query, function (err, rows) {
        if (err) {
            console.error("Error Executing stmt '%s' error : %s", query, err);
            callback(true);
            return;
        }
        if (rows.length === 0) {
            callback(false);
            return;
        } else {
            console.warn("Was not expecting '%d' rows", rows.length);
            callback(true);        
        }
        return;
        
    });
}

module.exports = {
    db_init: db_open,
    db_exit: db_close,
};

if (!db_open()) {
    console.error("Unable to open database file");
    process.exit(1);
}

var stmt =  "CREATE TABLE Items( " + 
            "id integer PRIMARY KEY autoincrement, " +
            "name varchar(255) NOT NULL," +
            "dt datetime NOT NULL default (datetime('now'))," +
            "UNIQUE (name));";

db_create_table(stmt, function (err) {
    if (err) {
        console.error("Error creating table");
        return;
    }
    console.log("Created table");
});

db_close();
