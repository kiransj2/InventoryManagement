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
            callback(false, "Unablet to get item list");
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
        callback(data);
    });
}

function db_add_stock(name, quantity, callback) {
    var url = "/api/add_stock?name=" + name + "&quantity=" + quantity;
    ajaxRequest(url, function (error, data) {
        if (error == true) {
            callback(true, "unable to add stock to database");
            return;
        }
        callback(false, "added " + (quantity/1000) + "kgs of item '" + name + "' to database");
    });
}

function get_incoming_stocks_from_json_ui(rows) {
    var table = "<table class='TColor'><tr><th>Item Name</th><th>Quantity in KG</th><th>date</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        table += "<tr><td>" + rows[i].name + "</td><td>" + (rows[i].sum/1000) + "</td><td>" + rows[i].dt + "</td></tr>";
    }
    table += "</table>";
    return table;
}

function db_get_incoming_stocks(date, callback) {    
    ajaxRequest("/api/get_incoming_stocks?date="+date, function (error, data) {
        if (error == true) {
            callback(false, "Unablet to get incoming stocks");
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
        callback(data);
    });
}