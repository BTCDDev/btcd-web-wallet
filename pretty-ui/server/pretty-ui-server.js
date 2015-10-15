/**
 * Created by _mr_e on 05/10/15.
 */
var http = require('http');

var supernet = require("./supernet-api");

var doge=require("../../btcdapi");

var socket;

var self = this;

module.exports.Table = {
    tableId: ""
};

module.exports.init = function(io){
    io.sockets.on('connection', function(socket){
        self.socket = socket;

        console.log("server connected");

        socket.emit("connection");

        //listen for client messages
        socket.on("message", function(message){
            console.log(message);

            var action = Object.keys(message.action)[0];
            var playerId = message.playerId;
            apiHandlers[action](message.action[action], playerId);
        });

        socket.on('pangeaStatus2', function(data) {
            doge.SuperNET('{"plugin":"pangea","method":"status", "tableid": "' + data.tableid + '", "timeout":100, "threadid": ' + data.playerId + '}', function (err, data) {
                socket.emit('pangeaStatusRes', data);

            });
        });
    });
};

function setup(){

}

module.exports.startGame = function(params){
    supernet.buyin(self.Table.tableId, 15000000000, function(result){
        var game = {"game": {
                bigblind: 3,
                gametype: "NL Holdem<br /> Blinds 3/6"
            }
        };

        self.socket.emit("message", game);

        //supernet.
        //var seats = [
        //    {
        //        empty: 0,
        //        name:
        //    }
        //]
    });
};

var apiHandlers = {
    "ready": function(){
        //self.startGame();
    },
    "bet": function(amount, playerId){
        if (amount == 0) {
            doge.SuperNET('{"plugin":"pangea","method":"turn", "action":"check", "threadid":' + playerId + '}', function (err, data) {
                var result = "";
            });
        }
        else{
            doge.SuperNET('{"plugin":"pangea","method":"turn", "action":"bet", "amount":"' + amount * 100000000 + '", "threadid":' + playerId + '}', function (err, data) {
                var result = "";
            });
        }
    },
    "fold": function(fold, playerId){
        doge.SuperNET('{"plugin":"pangea","method":"turn", "action":"fold", "threadid":' + playerId + '}', function (err, data) {
            var result = "";
        });
    }
};