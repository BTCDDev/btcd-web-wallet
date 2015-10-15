/**
 * Created by _mr_e on 05/10/15.
 */

var doge = require("../../btcdapi");

module.exports.startTable = function(callback){
    doge.SuperNET('{"plugin":"InstantDEX","method":"orderbook","base":"BTCD","exchange":"pangea","allfields":1}', function(err, data){
        console.log(data);
        callback(data);
    });
};

module.exports.buyin = function(tableid, amount, callback){
    doge.SuperNET( '{"plugin":"pangea","method":"buyin","tableid":"'+tableid+'","amount":"'+amount+'"}', function(err, data){
        console.log("returned " + JSON.stringify(data));
        callback(data);
    });
};

//module.exports.getStatus = function(data, callback){
//        doge.SuperNET('{"plugin":"pangea","method":"status", "tableid": "' + data.tableid + '", "timeout":100}', function(err, data){
//            socket.emit('pangeaStatusRes', data);
//
//        });
//    }
//});

