
var Q = require("q");
var Q_HTTP = require("q-http");

module.exports = function RateLimit(app, interval) {
    var pending = [];
    var inProgress = false;
    function next() {
        if (!inProgress) {
            var p = pending.shift();
            if (p) {
                inProgress = true;
                Q.when(app(p.request), function(response) {
                    p.deferred.resolve(response);
                    setTimeout(function() {
                        inProgress = false;
                        next();
                    }, interval);
                });
            }
        }
    }
    return function(request) {
        var deferred = Q.defer();
        pending.push({ request: request, deferred: deferred });
        next();
        return deferred.promise;
    }
}
