"use strict";

var fs      = require("fs"),
    util    = require('util'),
    moment  = require('moment'),
    debug   = require('debug'),
    events  = require('events'),
    db      = require('./db');

var INFO  = debug('APP:INFO');
var ERROR = debug('APP:ERR');
var WARN  = debug('APP:WARN');
var ASSERT = debug('APP:ASSERT');

var eventEmitter = new events.EventEmitter(); 
eventEmitter.setMaxListeners(1);

var num_checks = 0;
function assert(cond, msg) {
    num_checks++;
    if (cond) {
        ASSERT("====================================");
        ASSERT(msg);
        ASSERT("====================================");
        console.assert(!(cond), msg);
    }
}

function print_stats() {
    INFO("====================================");
    INFO("Number of tests : %d", num_checks);
    INFO("====================================");
}

var test_db_path = '../db/goldennuts.db';

if (fs.existsSync(test_db_path)) {
    fs.unlinkSync(test_db_path);
}

function create_database_build_tables() {

    INFO("open databse");
    assert(db.status(), "db_status is open before call to db.open()");
    assert(db.open(test_db_path, true) == false, "unable to open database file");
    assert(!db.status(), "db_status is closed as a call to db.open()");

    INFO("build sql tables");
    db.build_db(function(err) {
        assert(err, "Failed to create some tables");
        eventEmitter.emit("next_test");
        return;
    });
}

function insert_items_check_itemid() {
    INFO("Adding Item to items tables both valid and invalid values");
    var items = [ 
        { "name": "cashew",       "err_status": true,  "id":1,  "msg":"failed to insert cashew" },
        { "name": "kiss-miss",    "err_status": true,  "id":2,  "msg":"failed to insert kiss-miss" },
        { "name": "cashew-round", "err_status": true,  "id":3,  "msg":"failed to insert cashew-round" },
        { "name": "cashew-JH",    "err_status": true,  "id":4,  "msg":"failed to insert cashew-JH" },
        { "name": "pepper",       "err_status": true,  "id":5,  "msg":"failed to insert pepper" },
        { "name": "pepper",       "err_status": false, "id":5,  "msg":"Insert should fail as pepper is added again" },
        { "name": "Pepper",       "err_status": false, "id":5,  "msg":"Insert should fail as Pepper is added again with different case" },
        { "name": "cashew round", "err_status": false, "id":-1, "msg":"Inserting 'cashew round' should fail due to space in name"},
        { "name": "cashew.round", "err_status": false, "id":-1, "msg":"Inserting 'cashew.round' should fail due to '.' in name"},
        { "name": "cashew#round", "err_status": false, "id":-1, "msg":"Inserting 'cashew#round' should fail due to '#' in name"},
        { "name": "cashew$round", "err_status": false, "id":-1, "msg":"Inserting 'cashew$round' should fail due to '$' in name"},
        { "name": "cashew!round", "err_status": false, "id":-1, "msg":"Inserting 'cashew!round' should fail due to '!' in name"},
        { "name": "cas",          "err_status": false, "id":-1, "msg":"Inserting 'cas' should fail as name has only 3 letters"},
        { "name": "CASHEW-round", "err_status": false, "id":3,  "msg":"Insert should fail as cashew-round exists already" },
        { "name": "casa",         "err_status": false, "id":-1, "msg":"Inserting 'casa' should fail as name has only 4 letters"}
    ];
    var num_items = -1;

    function add_item_and_check(name, err_status, id, assert_msg) {
        db.new_item(name, function(err, msg) {
            assert(err == err_status, assert_msg);
            db.item_id(name, function(err, item_id) {
                if(id != -1) {
                    assert(err, "item_id failed for item " + name);
                    assert(item_id != id, "item_id does not match for " + name + " expected: " + id + " got: " + item_id);
                } else {
                    assert(!err, "item_id should have failed as item " + name + " does not exists");
                }
                eventEmitter.emit("next_element");
                return;
            });
            return;
        });
        return;
    }

    eventEmitter.on('next_element', function() {
        num_items++;
        if(num_items < items.length) {
            add_item_and_check(items[num_items].name, 
                               items[num_items].err_status, 
                               items[num_items].id, 
                               items[num_items].msg); 
        } else {
            eventEmitter.removeAllListeners('next_element');
            eventEmitter.emit("next_test");
        }
        return;
    });
    eventEmitter.emit("next_element");
    return;
}

function get_item_list() {
    db.item_list(function(err, rows) {
        assert(err, "Getting item list should not fail");
        assert(rows.length != 5, "Number of elements should be 5 insted it is " + rows.length);
        if(typeof rows[0].name === 'undefined'    ||
           typeof rows[0].item_id === 'undefined' ||
           typeof rows[0].dt === 'undefined'      ||
           typeof rows[0].tm === 'undefined') {
            assert(1, "Coloumns missing in item_list"); 
        }
        eventEmitter.emit("next_test");
        return;
    });
    return;
}

function add_stocks_to_db() {
    var obj = { };
    obj.name = "cashew";
    obj.quantity = 1500;
    obj.price = 730;
    db.new_stock(obj, function(err, msg) {
        assert(err == true, "failed to insert stocks for cashew"); 
        eventEmitter.emit("next_test");
    });

}

function main() {
    var tests = [
                    create_database_build_tables,
                    insert_items_check_itemid,
                    get_item_list,
                    add_stocks_to_db
                ];
    var count = -1;

    eventEmitter.on('next_test', function() {
        count++;
        if(count < tests.length) {
            tests[count]();
        } else{
            eventEmitter.removeAllListeners('next_element');
            print_stats();
            process.exit(0);
        }
    });
    eventEmitter.emit("next_test");
}

main();
