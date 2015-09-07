#!/bin/sh

if [ `uname -s` == "Darwin" ]; then
type brew >/dev/null 2>&1 || { echo >&2 "Homebrew not installed. Installing Homebrew..."; ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"; }
brew list boost >/dev/null 2>&1 || { echo >&2 "Dependency BOOST not installed. Installing BOOST..."; brew install boost; }
brew list berkeley-db4 >/dev/null 2>&1 || { echo >&2 "Dependency Berkeley-DB4 not installed. Installing Berkeley-DB4..."; brew install berkeley-db4; }
brew list openssl >/dev/null 2>&1 || { echo >&2 "Dependency OpenSSL not installed. Installing OpenSSL..."; brew install openssl; }
brew list miniupnpc >/dev/null 2>&1 || { echo >&2 "Dependency MiniUPNPc not installed. Installing MiniUPNPc..."; brew install miniupnpc; }
fi

#if [ `uname -s` == "Linux" ]; then
#	echo ""
#fi

btcd=$(ps aux | grep BitcoinDarkd | grep -v 'grep' | grep -c 'BitcoinDarkd')
btcdqt=$(ps aux | grep BitcoinDark-Qt | grep -v 'grep' | grep -c 'BitcoinDark-Qt')
if  [ "$btcd" = "1" -o $btcdqt = "1" ]; then
echo "1"
else
echo "0"
fi