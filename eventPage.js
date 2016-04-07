// chrome.extension.onMessage.addListener(

    // function(request, sender, sendResponse) {
        // alert("request");

    // } 
// );
chrome.extension.onRequest.addListener(function(request, sender, callback) {
    if(request.action == "xhttp") {
        var xhttp = new XMLHttpRequest(),
            method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onreadystatechange = function() {
            if(xhttp.readyState == 4){
                callback(xhttp.responseText);
                xhttp.onreadystatechange = xhttp.open = xhttp.send = null;
                xhttp = null;
            }
        }
        if (method == 'POST') {
            xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
            xhttp.setRequestHeader("Content-length", request.data.length);
        }
        xhttp.open(method, request.url, true);
        xhttp.send(request.data);
		alert("hello")
    }
});