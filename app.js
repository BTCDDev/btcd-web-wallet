
/**
 * Module dependencies.
 */


var count = 0;
function timeout() {
    setTimeout(function () {
        count += 1;
  //console.log(count);
  if (process.platform == 'darwin') { //If Mac OS X
    ExecuteProcess('sh','./check.sh');
    } else if (process.platform == 'linux') { //If Linux
    ExecuteProcess('sh','./check.sh');
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

var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var btcd=require("./btcdapi");
var querystring = require('querystring');

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

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
console.log('BitcoinDark Node Starting');

var server = http.createServer(app).listen(app.get('port'), function(err, result){
    console.log('Express server listening on port ' + app.get('port'));
});

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

app.get('/getpeers', function(req, res){
	btcd.SuperNET('{"requestType":"getpeers"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('getpeers',{peers:JSON.parse(data).peers});
	});
});

app.get('/ramstatus', function(req, res){
	btcd.SuperNET('{"requestType":"ramstatus", "coin":"BTCD"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramstatus', {status: data});
	});
});

app.get('/getaddr/:addr', function(req, res){
	btcd.SuperNET('{"requestType":"ramrawind", "type": "addr", "string": "' + req.params.addr + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('getaddr', {addr: JSON.stringify(data)});
	});
});

app.get('/getRamtx/:txid', function(req, res){
	btcd.SuperNET('{"requestType":"ramrawind", "destip":"127.0.0.1", "port": "14632", "coin":"BTCD", "type": "txid", "string": "' + req.params.txid + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('getramtx', {tx: JSON.stringify(data)});
	});
});

var unspent = 0;
app.get('/ramtxlist/:addr/:unspent', function(req, res){
	if(req.params.unspent == "true")
		unspent = 1;
	else
		unspent = 0;
	btcd.SuperNET('{"requestType":"ramtxlist", "coin":"BTCD", "address": "' + req.params.addr + '", "unspent": "' + unspent + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramtxlist', {txlist: JSON.stringify(data)});
	});
});

app.get('/getramblock/:blocknum', function(req, res){
	btcd.SuperNET('{"requestType":"ramblock", "coin":"BTCD", "blocknum": "' + req.params.blocknum + '"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramblock', {block: JSON.stringify(data)});
	});
});

app.get('/ramrichlist/:numwhales', function(req, res){
if(req.params.numwhales <= 200){
	btcd.SuperNET('{"requestType":"ramrichlist", "coin":"BTCD", "numwhales": "'+ req.params.numwhales +'"}', function(err, data){
		if(err)
			console.log("err: " + err);
		else
			res.render('ramrichlist', {richlist: JSON.stringify(data)});
	});
}
else
    res.render('ramrichlist', {richlist: "Please specify a number less than 200 for the top addresses"});
});

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

//------- app.js CODE ENDS -------
}
