//This functions provices wrappers for ajax calls.
function ajaxRequest(url, callback) {
    var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(false, xmlhttp.responseText);
        }
        else if (xmlhttp.readyState == 4 && xmlhttp.status == 404) {
            callback(true, xmlhttp.responseText);
        }
        return;
    }
    if (is_firefox) {
        xmlhttp.timeout = 2000;
        xmlhttp.ontimeout = function () {
            callback(true, "Server not responding");
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    return;
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

function db_add_new_item(name, callback) {
    var url = "/api/add_item?name=" + name;
    ajaxRequest(url, function (error, data) {
        if (error == true) {
            callback(true, name + " already exists");
            return;
        }
        callback(false, name);
    });
}

function db_get_all_items(callback) {
    ajaxRequest("/api/get_item_list", function (error, data) {
        if (error == true) {
            callback(true, "Unable to get item list");
            return;
        }
        var obj = JSON.parse(data);
        callback(false, obj);
    });
}

function get_item_table_from_json_ui(rows) {
    var table = "<table class='TColor'><tr><th>Name(total:"+rows.length+")</th><th>Added On</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        table += "<tr><td>" + rows[i].name +
                                 "</td><td>" + rows[i].dt + "</td></tr>";
    }
    table += "</table>";
    return table;
}

function db_get_items_table_ui(callback) {
    db_get_all_items(function (error, rows) {
        var data;
        if (error) {
            data = "Error '" + rows + "'";
        } else {
            data = get_item_table_from_json_ui(rows);
        }
        callback(error, data);
    });
}

function db_add_stock(name, quantity, price, callback) {
    var url = "/api/add_stock?name=" + name + "&quantity=" + quantity + "&price=" + price;
    ajaxRequest(url, function (error, data) {
        if (error == true) {
            callback(true, "unable to add stock to database");
            return;
        }
        callback(false, "added " + (quantity/1000) + "kgs of item '" + name + "' to database");
    });
}

function get_incoming_stocks_from_json_ui(rows) {
    var total_cost = 0, total_stocks = 0;
    for (var i = 0; i < rows.length; i++) {
        total_cost += rows[i].price;
        total_stocks += rows[i].quantity;
    }
    total_stocks = total_stocks / 1000;
    var table = "<table class='TColor'><tr><th>Name (total: " + rows.length + ")</th>";
    table += "<th>Quantity (" + total_stocks + " Kg)</th><th>Paid (Rs " + total_cost + ")</th><th>Date</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].quantity < 1000) {
            weight = "" + rows[i].quantity + " gms";
        } else {
            weight = "" + (rows[i].quantity / 1000) + " kg";
        }
        table += "<tr><td>" + rows[i].name + "</td><td>" + (weight) + "</td><td>";
        table += rows[i].price + "</td><td>" + rows[i].dt + "</td></tr>";
    }
    table += "</table>";
    return table;
}

function db_get_incoming_stocks(date, callback) {
    ajaxRequest("/api/get_incoming_stocks_on?date="+date, function (error, data) {
        if (error == true) {
            callback(true, "Unable to get incoming stocks");
            return;
        }

        var obj = JSON.parse(data);
        callback(false, obj);
    });
}

function db_get_incoming_stocks_ui(date, callback) {
    db_get_incoming_stocks(date, function (error, rows) {
        var data;
        if (error) {
            data = "Error '" + rows + "'";
        } else {
            data = get_incoming_stocks_from_json_ui(rows);
        }
        callback(error, data);
    });
}

function get_incoming_stocks_range_from_json_ui(rows) {
    var total_cost = 0, total_stocks = 0;
    for (var i = 0; i < rows.length; i++) {
        total_cost += rows[i].price;
        total_stocks += rows[i].quantity;
    }
    total_stocks = total_stocks / 1000;
    var table = "<table class='TColor'><tr><th>OrderID (total: " + rows.length + ")</th><th>Name</th>";
    table += "<th>Quantity ( " + total_stocks + " Kg )</th><th>Paid (Rs " + total_cost + ")</th><th>Date</th><th>Time</th></tr>";
    for (var i = 0; i < rows.length; i++) {

        var weight = 0;
        if (rows[i].quantity < 1000) {
            weight = "" + rows[i].quantity + " gms";
        } else {
            weight = "" + (rows[i].quantity / 1000) + " kg";
        }
        table += "<tr><td>" + rows[i].transaction_id + "</td><td>" + rows[i].name + "</td><td>" + (weight) + "</td><td>";
        table += rows[i].price + "</td><td>" + rows[i].dt + "</td><td>" + rows[i].tm + "</td></tr>";
    }
    table += "</table>";
    return table;
}

function db_get_incoming_stocks_range(range, callback) {

    ajaxRequest("/api/get_incoming_stocks_range?range=" + range, function (error, data) {
        if (error == true) {
            callback(true, "Unable to get incoming stocks for 7 days");
            return;
        }

        var obj = JSON.parse(data);
        var d = get_incoming_stocks_range_from_json_ui(obj);
        callback(false, d);
    });
}

function db_sell_stock(obj, callback) {

    var url = "/api/sell_stock?name=" + obj.name + "&quantity=" + obj.quantity + "&price=" + obj.price;
    url += "&option=" + obj.option + "&reason=" + obj.reason;

    ajaxRequest(url, function (error, data) {
        if (error) {
            callback(true, "unable to Sell stock");
            return;
        }

        callback(false, "Sold " + (obj.quantity / 1000) + "kgs of item '" + name + "' to " + obj.option);
    });
}

function db_get_outgoing_stocks(date, callback) {
    ajaxRequest("/api/get_outgoing_stocks?date=" + date, function (error, data) {
        if (error == true) {
            callback(true, "Unable to get outgoing stocks");
            return;
        }
        var obj = JSON.parse(data);
        callback(false, obj);
    });
}

function get_outgoing_stocks_from_json_ui(rows) {
    var total_cost = 0, total_quantity = 0;
    for (var i = 0; i < rows.length; i++) {
        total_cost += rows[i].price;
        total_quantity += rows[i].quantity;
    }
    total_quantity = total_quantity/1000;
    var table = "<table class='TColor'><tr><th>Item Name (total: " + rows.length + ")</th>";
    table += "<th>Quantity (" + total_quantity + " Kg)</th><th>Paid (Rs " + total_cost + ")</th><th>Date</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].quantity < 1000) {
            weight = "" + rows[i].quantity + " gms";
        } else {
            weight = "" + rows[i].quantity / 1000 + " kgs";
        }
        table += "<tr><td>" + rows[i].name + "</td><td>" + weight + "</td><td>";
        table += rows[i].price + "</td><td>" + rows[i].dt + "</td></tr>";
    }
    table += "</table>";
    return table;
}

function db_get_outgoing_stocks_ui(date, callback) {
    db_get_outgoing_stocks(date, function (error, rows) {
        var data;
        if (error) {
            data = "Error '" + rows + "'";
        } else {
            data = get_outgoing_stocks_from_json_ui(rows);
        }
        callback(error, data);
    });
}


function get_outgoing_stocks_range_from_json_ui(rows) {
    var total_cost = 0, total_stocks = 0;
    for (var i = 0; i < rows.length; i++) {
        total_cost += rows[i].price;
        total_stocks += rows[i].quantity;
    }
    total_stocks = total_stocks / 1000;

    var table = "<table class='TColor'>"
    table += "<tr><th> OrderId (total:"+ rows.length +")</th><th>Name</th><th>Quantity(" + total_stocks + " Kg)</th>";
    table += "<th>Paid(Rs " + total_cost +")</th><th>Date</th><th>Time</th><th>Order type</th><th>Reason</th></tr>";

    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].quantity < 1000) {
            weight = "" + rows[i].quantity + " gms";
        } else {
            weight = "" + rows[i].quantity / 1000 + " kgs";
        }
        table += "<tr><td>" + rows[i].transaction_id + "</td><td>" + rows[i].name + "</td><td>" + weight + "</td><td>";
        table += rows[i].price + "</td><td>" + rows[i].dt + "</td><td>" + rows[i].tm;
        table += "</td><td>" + rows[i].transaction_type + "</td><td>" + rows[i].reason + "</td></tr>";
    }

    table += "</table>";
    return table;
}


function db_get_outgoing_stocks_range(range, callback) {

    ajaxRequest("/api/get_outgoing_stocks_range?range=" + range, function (error, data) {
        if (error == true) {
            callback(false, "Unable to get outgoing stocks range for last %s ", range);
            return;
        }

        var obj = JSON.parse(data);
        var d = get_outgoing_stocks_range_from_json_ui(obj);
        callback(false, d);
    });
}

function get_outgoing_stocks_summary_from_json_ui(rows) {
    var total_cost = 0, total_stocks = 0;
    for (var i = 0; i < rows.length; i++) {
        total_cost += rows[i].price;
        total_stocks += rows[i].quantity;
    }
    total_stocks = total_stocks / 1000;
    
    var table = "<table class='TColor'>"
    table += "<tr><th>Name ("+rows.length+" items)</th><th>Quantity(" + total_stocks + " Kg)</th>";
    table += "<th>Paid(Rs " + total_cost + ")</th></tr>";
    
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].quantity < 1000) {
            weight = "" + rows[i].quantity + " gms";
        } else {
            weight = "" + rows[i].quantity / 1000 + " kgs";
        }
        table += "<tr><td>" + rows[i].name + "</td><td>" + weight + "</td><td>";
        table += rows[i].price + "</td></tr>";
    }
    
    table += "</table>";
    return table;
}

function db_get_outgoing_summary(range, callback) {
    
    ajaxRequest("/api/get_outgoing_stocks_summary?range=" + range, function (error, data) {
        if (error == true) {
            callback(false, "Unable to get outgoing stocks summar for last %s", range);
            return;
        }
        
        var obj = JSON.parse(data);
        var d = get_outgoing_stocks_summary_from_json_ui(obj);
        callback(false, d);
    });
}


function db_list_current_stocks(callback) {
    ajaxRequest("/api/get_current_stocks", function (error, data) {
        if (error == true) {
            callback(true, "Unable to get current stocks");
            return;
        }
        var obj = JSON.parse(data);
        callback(false, obj);
    });
}

function get_current_stocks_from_json_ui(show_zeros, rows) {
    var total_stocks = 0, total_zero = 0;
    for (var i = 0; i < rows.length; i++) {
        total_stocks += rows[i].quantity;
        if (!rows[i].quantity) {
            total_zero++;
        }
    }
    total_stocks = total_stocks / 1000;
    var table = "<table class='TColor'><tr>";
    table += "<th>Items (total:" + (rows.length - total_zero) + ", zero:"+ total_zero +")</th>";
    table += "<th> Current Stocks (" + total_stocks + " Kg) </th></tr> ";
    for (var i = 0; i < rows.length; i++) {
        if ((rows[i].quantity != 0) || show_zeros) {
            var weight = 0;
            if (rows[i].quantity < 1000) {
                weight = "" + rows[i].quantity + " gms";
            } else {
                weight = "" + rows[i].quantity / 1000 + " Kgs";
            }
            var td = "<td>";
            if (rows[i].quantity == 0) {
                td = "<td bgcolor='#FF0000'>";
            } else if (rows[i].quantity < 3000) {
                td = "<td bgcolor='#F07000'>";
            }

            table += "<tr>" + td + rows[i].name + "</td>" + td + (weight) + "</td></tr>";
        }
    }
    table += "</table>";
    return table;
}


function db_list_currents_stocks_ui(show_zeros, callback) {
    db_list_current_stocks(function (error, rows) {
        var data;
        if (error) {
            data = "Error '" + rows + "'";
        } else {
            data = get_current_stocks_from_json_ui(show_zeros, rows);
        }
        callback(error, data);
    });
}


function db_get_current_stocks_of(item_name, callback) {
    ajaxRequest("/api/get_stock_of?name="+ item_name, function (error, data) {
        if (error == true) {
            callback(true, "Unable to get current stocks of item " + name);
            return;
        }
        var obj = JSON.parse(data);
        callback(false, obj);
    });
}

function shutdown_server() {
    ajaxRequest("/exit", function (error, data) {
        document.getElementById('data').remove();
        document.getElementById('navigation').remove();
        document.getElementById('footer').remove();
        document.getElementById('header').remove();
    });
}

function get_options_with_item_list(stocks, select_id, callback) {

    function handle_data(error, rows) {
        var data;
        if (!error) {
            var x = document.getElementById(select_id);
            // Clear the existings element from the options
            // and then add the new options values.
            x.innerHTML = "";
            for (var i = 0; i < rows.length; i++) {
                if (!stocks || (rows[i].quantity != 0)) {
                    var o = document.createElement('option');
                    o.value = rows[i].name;
                    o.text = rows[i].name;
                    x.options.add(o);
                }
            }
            x.innerHTML = "<option disabled selected> -- choose an item -- </option>" + x.innerHTML;
            //set_data_section(document.getElementById('incoming_stock').innerHTML);
        }
        callback(error);
    }

    if (stocks)
        db_list_current_stocks(handle_data);
    else
        db_get_all_items(handle_data);
}


function db_add_stock_list(obj, callback) {
    var size = obj.size;
    var items_added = 0, failed = 0;
    for (var i = 0; i <= obj.size; i++) {
        var name = obj.item[i].name;
        var quantity = obj.item[i].quantity*1000;
        var price = obj.item[i].price;
        var url = "/api/add_stock?name=" + name + "&quantity=" + quantity + "&price=" + price;
        ajaxRequest(url, function (error, data) {
            if (error == true) {
                failed++;
            } else {
                items_added++;
            }
            if ((failed + items_added) == obj.size) {
                callback(failed, "Added " + items_added + ", failed " + failed);
            }
        });
    }
}

function db_sell_stock_list(obj, callback) {
    var size = obj.size;
    var items_added = 0, failed = 0;
    for (var i = 0; i <= obj.size; i++) {
        var name = obj.item[i].name;
        var quantity = obj.item[i].quantity * 1000;
        var price = obj.item[i].price;
        var url = "/api/sell_stock?name=" + name + "&quantity=" + quantity + "&price=" + price;
        url += "&option=" + obj.option + "&reason=" + obj.reason;
        ajaxRequest(url, function (error, data) {
            if (error == true) {
                failed++;
            } else {
                items_added++;
            }
            if ((failed + items_added) == obj.size) {
                callback(failed, "Sold " + items_added + ", failed " + failed);
            }
        });
    }
}
