const coap        = require('coap')
    , server      = coap.createServer()
    , ip          = require('ipaddr.js');
    
var last_address;
var last_port;

function isIntNumber(n) {
    return (Math.round(n) == n);
}

function isDefined(n) {
    return !(typeof n === 'undefined');
}

server.on('request', function(req, res) {
    path = req.url;
    method = req.method;
    if (method == 'PUT') {
        var str_payload = req.payload.toString();
        if (path == '/gateway/config/ip') {
            if (ip.IPv4.isValid(str_payload)) {
                var new_addr = ip.parse(str_payload);
                console.log('Changing gateway address to ' + new_addr.toString());
                last_address = new_addr;
            }
        } else if (path == '/gateway/config/port') {
            if (isIntNumber(str_payload)) {
                var new_port = parseInt(str_payload);
                console.log('Changing gateway port to ' + new_port.toString());
                last_port = new_port;
            }
        }
    } else if (isDefined(last_address) &&  isDefined(last_port)) {
        var new_path = 'coap://' + last_address + ':' + last_port + req.url;
        console.log('redirecting to gateway on: ' + new_path);
        var new_req = coap.request(new_path)
        new_req.on('response', function(new_res) {
            console.log(new_res.payload.toString());
            // TODO send a persistent data or HTTP server
        })
        new_req.end()
    }
    res.end()
})

// the default CoAP port is 5683
server.listen(function() {
})
