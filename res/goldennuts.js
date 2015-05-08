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
