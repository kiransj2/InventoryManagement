function ajaxRequest(url, callback) {
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
    xmlhttp.timeout = 2000;
    xmlhttp.onerror = function () { alert("Server not responding"); }
    xmlhttp.ontimeout = function() { callback(true, "Server not responding"); }
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
    var table = "<table class='TColor'><tr><th>Item Number</th><th>Item Name</th><th>Added On</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        table += "<tr><td>" + rows[i].item_id + "</td><td>" + rows[i].name +
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
    var table = "<table class='TColor'><tr><th>Item Name</th><th>Incoming Quantity</th><th>Cost Paid</th><th>date</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].sum < 1000) {
            weight = "" + rows[i].sum + " gms";
        } else {
            weight = "" + (rows[i].sum / 1000) + " kg";
        }  
        table += "<tr><td>" + rows[i].name + "</td><td>" + (weight) + "</td><td>";
        table += rows[i].cost + "</td><td>" + rows[i].dt + "</td></tr>";
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
    
    var table = "<table class='TColor'><tr><th>Transaction ID ( total: " + rows.length + " )</th><th>Item Name</th>";
    table += "<th>IncomingQuantity</th><th>Cost Paid</th><th>date</th><th>Time</th></tr>";
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
    var table = "<table class='TColor'><tr><th>Item Name</th><th>Sold Quantity</th><th>Cost Paid</th><th>date</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].sum < 1000) {
            weight = "" + rows[i].sum + " gms";
        } else {
            weight = "" + rows[i].sum / 1000 + " kgs";
        }  
        table += "<tr><td>" + rows[i].name + "</td><td>" + weight + "</td><td>";
        table += rows[i].cost + "</td><td>" + rows[i].dt + "</td></tr>";
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
    var table = "<table class='TColor'><tr><th>Item Name</th><th>Sold Quantity</th><th>Cost Paid</th><th>Date</th><th>Time</th>";
    table += "<th>Transaction type</th><th>Reason</th></tr>";
    
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].quantity < 1000) {
            weight = "" + rows[i].quantity + " gms";
        } else {
            weight = "" + rows[i].quantity / 1000 + " kgs";
        }
        table += "<tr><td>" + rows[i].name + "</td><td>" + weight + "</td><td>";
        table += rows[i].price + "</td><td>" + rows[i].dt + "</td><td>" + rows[i].tm;
        table += "</td><td>" + rows[i].transaction_type + "</td><td>" + rows[i].reason + "</td></tr>";
    }
    
    table += "</table>";
    return table;
}


function db_get_outgoing_stocks_range(range, callback) {
    
    ajaxRequest("/api/get_outgoing_stocks_range?range=" + range, function (error, data) {
        if (error == true) {
            callback(false, "Unable to get outgoing stocks for %s days", range);
            return;
        }
        //alert(data);
        var obj = JSON.parse(data);
        var d = get_outgoing_stocks_range_from_json_ui(obj);
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

function get_current_stocks_from_json_ui(rows) {
    var table = "<table class='TColor'><tr><th>Item Name</th><th>Current Stocks</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        var weight = 0;
        if (rows[i].cur_stocks < 1000) {
            weight = "" + rows[i].cur_stocks + " gms";
        } else {
            weight = "" + rows[i].cur_stocks / 1000 + " Kgs";
        }
        var td = "<td>";
        if (rows[i].cur_stocks == 0) {
            td = "<td bgcolor='#FF0000'>";
        } 

        table += "<tr>" + td + rows[i].name + "</td>" + td + (weight) + "</td></tr>";
    }
    table += "</table>";
    return table;
}


function db_list_currents_stocks_ui(callback) {
    db_list_current_stocks(function (error, rows) {
        var data;
        if (error) {
            data = "Error '" + rows + "'";
        } else {            
            data = get_current_stocks_from_json_ui(rows);
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
