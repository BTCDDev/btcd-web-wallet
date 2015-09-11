fs = require('fs.extra')

if (process.platform == 'darwin') { //If Mac OS X
    filepath = process.env.HOME + '/Library/Application Support/BitcoinDark/BitcoinDark.conf';
} else if (process.platform == 'linux') { //If Linux
    filepath = process.env.HOME + '/.BitcoinDark/BitcoinDark.conf';
} else { //Else it's Windows
    filepath = process.env.APPDATA + '/BitcoinDark/BitcoinDark.conf';
}

//This code doesn't seems is being used. Just keeping it for future refrences.
/*if (fs.existsSync(filepath) == false) { console.log('Conf file does not exists. Copying default conf file...');
fs.copy('btcd/BitcoinDark.conf', filepath, { replace: false }, function (err) {
  if (err) {
    throw err;
  }
  console.log('Copied btcd/BitcoinDark.conf to ' + filepath);
});
}*/

conf_data = fs.readFileSync(filepath, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
});

arrayFromConf = conf_data.match(/[^\r\n]+/g); //Turn all lines to an array
var rpcuser = arrayFromConf['0'].substring(arrayFromConf['0'].indexOf("=") + 1); //Only get specific line, and get value after '='
var rpcpass = arrayFromConf['1'].substring(arrayFromConf['1'].indexOf("=") + 1); //Only get specific line, and get value after '='

var btcd = require('node-btcd')();
btcd.auth(rpcuser, rpcpass);

module.exports = btcd;

