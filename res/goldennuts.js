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

function get_item_table_from_json(rows) {
    var table = "<table class='TColor'><tr><th>Item Number</th><th>Item Name</th><th>Added On</th></tr>";
    for (var i = 0; i < rows.length; i++) {
        table += "<tr><td>" + rows[i].id + "</td><td>" + rows[i].name +
                                 "</td><td>" + rows[i].dt + "</td></tr>";
    }
    table += "</table>";
    return table;
}

function db_get_items_table(callback) {
    db_get_all_items(function (error, rows) {
        var data;
        if (error) {
            data = "Error '" + rows + "'";            
        } else {
            data = get_item_table_from_json(rows);
        }
        callback(data);
    });
}