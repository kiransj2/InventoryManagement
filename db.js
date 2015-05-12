"use strict";

var fs = require("fs"),
    sqlite3 = require("sqlite3").verbose(),
    util = require('util'),
    moment = require('moment');

// Global Variables
var db;
var repository = "./db/mydb.db";
var SQL_LOG_FILE = "./db/log.sql"

function db_set_db_path(path) {
    repository = path;
}

function db_set_logfile_path(path) {
    SQL_LOG_FILE = path;
}

// time_now function is used to get the cur_time 
function date_time() {
    return moment().format('HH-mm-ss');
}

function  format_user_date(date) {
    return moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
}

function date_date() {
    return moment().format('YYYY-MM-DD');
}

function build_date(year, month, day) {
    var str = util.format("%d-%d-%d", year, month, day);
    return str;
}

function db_open(create_new) { 
    if (typeof db === 'undefined') {
        if (fs.existsSync(repository)) {
            db = new sqlite3.Database(repository);                           
            return true;
        } else if (create_new) {
            db = new sqlite3.Database(repository, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);
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
    if (!(query.indexOf('SELECT') == 0)) {
        fs.appendFileSync(SQL_LOG_FILE, query + "\n");
    }
    //todo: Log the query being Executed here
    db.all(query, callback);
    return;
}

function db_create_table(query, callback) {
    if(!db_status()) {
        console.error("trying to create table without opening database");
        callbak(true);
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

function db_execute(query, callback) {
    if (!db_status()) {
        console.error("trying to create table without opening database");
        callbak(true, "db not initialized yet");
        return;
    }
    db_execute_query(query, callback);
    return;
}

module.exports = {
    db_init: db_open,
    db_status: db_status,
    db_set_path: db_set_db_path,
    db_exit: db_close,
    db_new_table: db_create_table,
    db_time: date_time,
    db_date: date_date,
    db_execute_query: db_execute,
    format_user_date: format_user_date,
};


if(0) {
    if (!db_open()) {
        console.error("Unable to open database file");
        process.exit(1);
    }
    db_close();
}
