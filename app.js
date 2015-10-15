
/**
 * Module dependencies.
 */


var count = 0;
function timeout() {
    setTimeout(function () {
        count += 1;
  //console.log(count);
  if (process.platform == 'darwin') { //If Mac OS X
    ExecuteProcess('sh','./scripts/check.sh');
    } else if (process.platform == 'linux') { //If Linux
    ExecuteProcess('sh','./scripts/check.sh');
    } else { //Else it's Windows
    ExecuteProcess('check.bat','');
}
  if (count <= 9) {
        timeout();
  } else {
btcdapp();
  }
    }, 5000);
}

timeout();


//Start Process by passing executable and its attribute.
function ExecuteProcess(prcs,atrbs) {
  var spawn = require('child_process').spawn,
  BitcoinDarkExec = spawn(prcs, [atrbs]);
  BitcoinDarkExec.stdout.on('data', function (data) {
    //console.log('stdout: ' + data);
  if ( data == 0 ) {
  console.log('no process is running...');
  } else {
  console.log('PROCESS IS RUNNING!...');
  count = 10;
  }
  });
  
  BitcoinDarkExec.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  
  BitcoinDarkExec.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}


function btcdapp() {
//------- app.js CODE GOES HERE -------

var pretty = true;

var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var btcd=require("./btcdapi");
var socketio = require("socket.io");
var querystring = require('querystring');
var prettyui = require("./pretty-ui/server/pretty-ui-server")

var io;

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(bodyParser.json());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/pretty-ui", express.static(path.join(__dirname, './pretty-ui/client')));
app.use("/pretty-table/images", express.static(path.join(__dirname, './pretty-ui/client/images')));
app.use(express.static(path.join(__dirname,'/pretty-ui/client')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
console.log('BitcoinDark Node Starting');

var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(err, result){
    console.log('Express server listening on port ' + app.get('port'));
});

prettyui.init(io);

Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};
        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);
        return alt;
    },
    configurable: true
});

function callBtcd(command, res, handler) {
    var args = Array.prototype.slice.call(arguments, 3);
    var callargs = args.concat([handler.bind({res:res})]);
    return btcd[command].apply(btcd, callargs);
}

function btcdHandler(err, result){
    console.log("err:"+err+" result:"+result);
    var response = {
        error: JSON.parse(err ? err.message : null),
        result: result
    };
    this.res.send(JSON.stringify(response));
}

app.get('/getinfo', function(req,res){ callBtcd('getInfo', res, btcdHandler); } );
app.get('/getblockcount', function(req,res){ callBtcd('getBlockCount', res, btcdHandler); } );
app.get('/getstakinginfo', function(req,res) { callBtcd('getStakingInfo', res, btcdHandler); } );
app.get('/getpeerinfo', function(req,res) { callBtcd('getPeerInfo', res, btcdHandler); });

app.get('/getnewaddress/:account?', function(req, res){ 
    var accountName = req.params.account || '';
    callBtcd('getnewaddress', res, btcdHandler, accountName) 
});

app.get('/listtransactions', function(req, res){ callBtcd('listtransactions', res, btcdHandler, '*', 99999999999999999) } );

app.get('/listreceivedbyaddress/:minconf?/:includeempty?', function(req, res){
    var includeEmpty = (req.params.includeempty || false) === 'true', 
        minConf = parseInt(req.params.minconf || 1);
	callBtcd('listreceivedbyaddress', res, btcdHandler, minConf, includeEmpty);
});

app.get('/sendtoaddress/:toaddress/:amount', function(req, res){
    var amount = parseFloat(req.params.amount);
    callBtcd('sendtoaddress', res, btcdHandler, req.params.toaddress, amount);
});

app.get('/encryptwallet/:passphrase', function(req,res){
    callBtcd('encryptwallet', res, btcdHandler, req.params.passphrase);
});


/*Object {error: null, result: "wallet encrypted; BitcoinDark server stopping, res… has been flushed, you need to make a new backup."}error: nullresult: "wallet encrypted; BitcoinDark server stopping, restart to run with encrypted wallet.  The keypool has been flushed, you need to make a new backup."__proto__: Object
btcd-wallet.js:85 wallet encrypted; BitcoinDark server stopping, restart to run with encrypted wallet.  The keypool has been flushed, you need to make a new backup.
modal.js:22 update modal bindinghandler*/

/*err:Error: {"result":null,"error":{"code":-17,"message":"Error: Wallet is already unlocked, use walletlock first if need to change unlock settings."},"id":1437436583797} result:undefined*/

app.get('/walletpassphrase/:passphrase?/:timeout?/:stakingonly?', function(req,res){
    var stakingOnly = req.params.stakingonly === 'true',
        passphrase = decodeURIComponent(req.params.passphrase),
        timeout = parseInt(req.params.timeout);
    callBtcd('walletpassphrase', res, btcdHandler, req.params.passphrase, timeout, stakingOnly);
});

app.get('/walletlock', function(req,res){ callBtcd('walletlock', res, btcdHandler); });

app.get('/help/:commandname?', function(req, res){
    req.params.commandname ? callBtcd('help', res, btcdHandler, req.params.commandname) :
        callBtcd('help',res,btcdHandler);
});


//app.get('/', function(req,res){
//	res.render('index');
//	});

// RPC functions //////////////

// encryptwallet not recommended
//app.get('/encryptwallet/:passphrase', function(req, res){
//	btcd.encryptwallet(req.params.passphrase, function(err, result){
//		console.log("err:"+err+" result:"+result);
//		if(err)
//			res.send(err);
//		else
//			res.send(JSON.stringify(result));
//	});
//});

app.get('/getaccount/:address', function(req, res){
	btcd.getaccount(req.params.address, function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});

app.get('/getbalance', function(req, res){
	btcd.getbalance(function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});


app.get('/getnewaddress', function(req, res){
	btcd.getnewaddress(function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});

// listaccounts is broken. use listaddressgroupings
//app.get('/listaccounts', function(req, res){
//	btcd.listaccounts(function(err, result){
//		console.log("err:"+err+" result:"+result);
//		if(err)
//			res.send(err);
//		else
//			res.send(JSON.stringify(result));
//	});
//});

app.get('/listaddressgroupings', function(req, res){
	btcd.listaddressgroupings(function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});
/*
app.get('/listreceivedbyaddress/:minconf/:includeempty', function(req, res){
	btcd.listreceivedbyaddress(parseInt(req.params.minconf),req.params.includeempty === "true", function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});*/

/*
app.get('/listtransactions', function(req, res){
	btcd.listtransactions(function(err, result){
		console.log("err:"+err+" result:"+result);
        res.send(JSON.stringify(packageResponse(err, result)));
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});*/

app.get('/sendfrom/:fromaccount/:toaddress/:amount', function(req, res){
	btcd.sendfrom(req.params.fromaccount, req.params.toaddress, parseInt(req.params.amount), function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});

//sendtoaddress <BitcoinDarkaddress> <amount> [comment] [comment-to]
// TODO: Add optional comments
/*app.get('/sendtoaddress/:toaddress/:amount', function(req, res){
    function formatError(err){
        return err.substr(err.indexOf('{'));
    }

	btcd.sendtoaddress(req.params.toaddress, parseInt(req.params.amount), function(err, result){
		console.log("err:"+err+" result:"+result);
        res.send(JSON.stringify(packageResponse(err, result)));
		if(err){
			res.send(err.message);
        }
		else
			res.send(JSON.stringify(result));
        
	});
});*/

app.get('/setaccount/:address/:account', function(req, res){
	btcd.setaccount(req.params.address, req.params.account, function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});

app.get('/setadressbookname/:address/:label', function(req, res){
	btcd.setadressbookname(req.params.address, req.params.label, function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(JSON.stringify(result));
	});
});


// Custom functions ////////////

app.get('/totalbtcd', function(req, res){
	btcd.getinfo(function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else{
			var money = result.moneysupply.toString();	
			res.send(money);
		}
	});
});

app.get('/blockcount', function(req,res){
	btcd.getinfo(function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else{
			var blocks = result.blocks.toString();
			res.send(blocks);
		}
	});
});

app.get('/difficulty', function(req,res){
	btcd.getDifficulty(function(err, result){
		console.log("err:"+err+" result:"+result);
		if(err)
			res.send(err);
		else
			res.send(result);
	});
});	

app.get('/getblockhash/:index', function(req, res){
	btcd.getblockhash(parseInt(req.params.index), function(err, hash){
		if(err)
			res.send(err);
		else
			res.send(hash);
	});
});

app.get('/getblock/:hash', function(req, res){
	btcd.getblock(req.params.hash, function(err, data){
		if(err)
			res.send(err);
		else
			res.render('block', data);
	});
});


app.get('/gettx/:txid', function(req, res){
	btcd.gettransaction(req.params.txid, function(err, data){
		if(err)
			res.send("Error parsing transaction id");
		else
			res.render('tx', data);
	});
});


//SuperNET functions///////////////

app.post('/supernet', function(req, res){
    console.log(JSON.stringify(req.body));
    btcd.supernet(JSON.stringify(req.body), function(err,data){
        var response = {
            error: JSON.parse(err ? err.message : null),
            result: data
        };
        console.log(JSON.stringify(data));
        res.send(JSON.stringify(response));
    });
});

app.post('/IDEXsupernet', function(req, res){
    console.log("received " + JSON.stringify(req.body));
    btcd.supernet(JSON.stringify(req.body), function(err,data){
		console.log("error: " + err)
        var response = {
            error: JSON.parse(err ? err.message : null),
            result: data
        };
        console.log("done");
        console.log("returns " + JSON.stringify(data));
        res.send((data));
    });
});

/*
 *    Pangea
 */

/*
 *
 * Ugly Pangea GUI Routes
 *
*/

app.get('/Pangea', function(req,res){
	res.render('pangea-index', {
            pretty: pretty
        });
	});	

app.get('/rosetta', function(req,res){
	res.render('rosetta');
	});	

app.get('/cashier', function(req,res){
	res.render('cashier');
	});



app.get('/table/:tableID', function(req,res){
	    res.render('table', {tableid: req.params.tableID});
	});

app.get('/pretty-table/:tableID', function(req, res, next){
    prettyui.Table.tableId = req.params.tableID;
    var playerId = 0;

    if (req.query.playerId)
        playerId = req.query.playerId;;

    res.render('pretty-table', {tableid: req.params.tableID, playerId: playerId});
    //express.static(path.join('./pretty-ui/client/index.html'))(req, res, next);
});
 
 
app.post('/nxt', function(req,res){
    var reqBody = querystring.stringify(req.body);
    var postOptions = {
        host: '127.0.0.1',
        port: '7876',
        path: '/nxt',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': reqBody.length
        }
    };
    var postReq = http.request(postOptions, function(nxtRes){ 
        if(nxtRes.statusCode !== 200){
            console.log("NXT Response Error: " + nxtRes.statusMessage);
        }
        else{
            var data = '';
            nxtRes.setEncoding('utf8');
            nxtRes.on('data', function(chunk){
                console.log(chunk);
                data += chunk;
            });

            nxtRes.on('end', function(){
                res.send(data);
            });
        }
    });

    postReq.on('error', function(e){
        console.log("NXT Error: " + e.message);
    });

    postReq.write(reqBody);
    postReq.end();
});

/*
 *	Socket.io
 */
/*
 *
 *  socket.io
 *
*/

io.sockets.on('connection', function(socket){

    socket.on('pangeaLobby', function(data){
        btcd.SuperNET('{"plugin":"InstantDEX","method":"orderbook","base":"BTCD","exchange":"pangea","allfields":1}', function(err, data){
            socket.emit('pangeaLobbyRes', data);
        });
    });


    socket.on('pangeaJoin', function(data){
        btcd.SuperNET('{"plugin":"InstantDEX","method":"placebid","base":"BTCD","exchange":"pangea","volume":1, "timeout":100}', function(err, data){
            socket.emit('pangeaJoinRes', data);

        });
    });



    socket.on('pangeaStatus', function(data){
        if(data.tableid){
            btcd.SuperNET('{"plugin":"pangea","method":"status", "tableid": "' + data.tableid + '", "timeout":100, "threadid": 0}', function(err, data){
                socket.emit('pangeaStatusRes', data);

            });
        }
        else{
            btcd.SuperNET('{"plugin":"pangea","method":"status", "timeout":100}', function(err, data){
                socket.emit('pangeaStatusRes', data);

            });
        }
    });


    socket.on('pangeaStart', function(data){
        var d = JSON.stringify(data.data);

        btcd.SuperNET(JSON.parse(d), function(err, data){
            socket.emit('pangeaStartRes', data);

        });
    });


    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    socket.on('pangeaTurn', function(data){
        var d = data;
        console.log(JSON.stringify(data));
        var action = d.action;
        var amtFlag = 0;
        var amount;
        if(action=="bet" || action=="raise"){
            if(!isNumeric(d.amount)){
                socket.emit('pangeaError', {message: "Amount is not numeric!"});
                return;
            }
            btcd.SuperNET('{"plugin":"pangea","method":"turn", "action":"'+action+'", "amount":"'+d.amount+'"}', function(err, data){
            });
        }
        else{
            btcd.SuperNET('{"plugin":"pangea","method":"turn", "action":"'+action+'"}', function(err, data){
            });
        }

    });

    socket.on('pangeaRosetta', function(data){
        btcd.SuperNET('{"plugin":"pangea","method":"rosetta"}', function(err, data){
            socket.emit("pangeaRosettaRes", data);
        });

    });

    socket.on('pangeaRosettaWipCoin', function(data){
        btcd.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "wip": "' + data.address + '"}', function(err, data){
            socket.emit("pangeaRosettaRes", data);
        });
    });

    socket.on('pangeaRosettaCoin', function(data){
        if(data.coin == "BTCD"){
            btcd.dumpprivkey(data.address, function(err, d){
                if(err){
                    socket.emit('pangeaError', {message: err.message});
                }
                else{
                btcd.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "wip": "' + d + '"}', function(err, data){
                    socket.emit("pangeaRosettaRes", data);
                });
                }
            });
        }
        else{
                btcd.SuperNET('{"plugin":"pangea","method":"rosetta", "coin": "' + data.coin +'", "addr": "' + data.address + '"}', function(err, data){
                    socket.emit("pangeaRosettaRes", data);
                });
        }



    });


    socket.on('pangeaBuyin', function(data){
		console.log("Buyin: " + JSON.stringify(data));
        btcd.SuperNET( '{"plugin":"pangea","method":"buyin","tableid":"'+data.tableid+'","amount":"'+data.amount+'"}', function(err, data){
            console.log("returned " + JSON.stringify(data));
            socket.emit('pangeaBuyinRes', data);
        });

    });

    socket.on('pangeaRates', function(data){

        btcd.SuperNET('{"plugin":"pangea","method":"rates"}', function(err, data){
            socket.emit('pangeaRatesRes', data);
        });

    });


});

//------- app.js CODE ENDS -------
}
