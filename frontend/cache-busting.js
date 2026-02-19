// Cache-Busting Script
// Forces the browser to refresh the cache on page load by appending a timestamp to all requests.

(function(){
    var timestamp = new Date().getTime();
    var links = document.getElementsByTagName('link');
    var scripts = document.getElementsByTagName('script');

    for (var i = 0; i < links.length; i++) {
        if (links[i].rel === 'stylesheet') {
            links[i].href += '?v=' + timestamp;
        }
    }

    for (var j = 0; j < scripts.length; j++) {
        scripts[j].src += '?v=' + timestamp;
    }
})();