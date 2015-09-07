var gui = require("nw.gui");

// Get the current window
var win = gui.Window.get();

// Extend application menu for Mac OS
if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  gui.Window.get().menu = menu;
}

window.onload = function() {
  
  console.log("Starting BitcoinDarkd Process...");
  //startBTCD();
  if (process.platform == 'darwin') { //If Mac OS X
  	filepath = process.env.HOME + '/Library/Application Support/BitcoinDark/BitcoinDark.conf';
	ExecuteProcess('btcd/osx/BitcoinDarkd','-conf=' + filepath);
	} else if (process.platform == 'linux') { //If Linux
    filepath = process.env.HOME + '/.BitcoinDark/BitcoinDark.conf';
	ExecuteProcess('btcd/linux/BitcoinDarkd','-conf=' + filepath);
	} else { //Else it's Windows
    filepath = process.env.APPDATA + '/BitcoinDark/BitcoinDark.conf';
    if ( process.arch == 'x64' ) { //If Windows 64bit
      ExecuteProcess('btcd/win64/BitcoinDarkd.exe','-conf=' + filepath);
    }
    else { //Else it's Windows 32bit
     ExecuteProcess('btcd/win32/BitcoinDarkd.exe','-conf=' + filepath); 
    }
	}
  
  console.log("BitcoinDarkd Started.");

var count = 0;
function timeout() {
  setTimeout(function () {
    count += 1;
    console.log('CHECKED BTCD RPC FOR: ' + count);
    check_btcdrpc_connection();
    if (count <= 29) {
      timeout();
    } else {
      console.log ('SEEMS BTCD RPC CONNECTED!!!!....');
      setTimeout(function () { window.location.replace("http://127.0.0.1:8080"); }, 8000);
    }
  }, 3000);
}

timeout();

function check_btcdrpc_connection() {
var btcd=require("./btcdapi");
btcd.getinfo(function(err,result){
  if(err){
    //handle the error
    console.log('ERROR CONNECTING BTCD RPC');
  }
  else{
    //success!
    console.log('BTCD RPC CONNECTED!');
    count = 30;
  }
});
}


  updateContentStyle();
  gui.Window.get().show();
};

win.on('close', function() {
  this.hide(); // Pretend to be closed already
  console.log("Stopping BitcoinDarkd Process...");
  //stopBTCD();
    if (process.platform == 'darwin') { //If Mac OS X
	ExecuteProcess('pkill','BitcoinDarkd');
	} else if (process.platform == 'linux') { //If Linux
	ExecuteProcess('pkill','BitcoinDarkd');
	} else { //Else it's Windows
    ExecuteProcess('taskkill','/im BitcoinDarkd.exe');
	}
  console.log("We're closing...");
  this.close(true);
});

//Start Process by passing executable and its attribute.
function ExecuteProcess(prcs,atrbs) {
  var spawn = require('child_process').spawn,
  BitcoinDarkExec = spawn(prcs, [atrbs]);
  BitcoinDarkExec.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
  
  BitcoinDarkExec.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  
  BitcoinDarkExec.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}
