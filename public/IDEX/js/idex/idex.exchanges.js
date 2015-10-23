

	
var IDEX = (function(IDEX, $, undefined) 
{
	

	IDEX.exchangeClasses = {};
	IDEX.exchangeList = ["nxtae", "bitfinex", "btc38", "bitstamp", "btce", "poloniex", "bittrex", "huobi", "coinbase", "okcoin"]; //bityes-broken&flipped lakebtc-no markets?  //exmo bter unconf InstantDEX
	IDEX.activeExchanges = [];
	//IDEX.activeExchanges = ["nxtae", "bitfinex", "btc38", "bitstamp", "btce", "poloniex", "bittrex", "huobi", "coinbase", "okcoin"]; //bityes-broken&flipped lakebtc-no markets?  //exmo bter unconf InstantDEX

	IDEX.allExchanges = {};
	IDEX.allCoins = [];
	IDEX.allMarkets = [];
	
	
	
	IDEX.initExchanges = function()
	{
		var dfd = new $.Deferred();
		
		initExchangesLoop(0, function()
		{
			getActiveExchanges().done(function()
			{
				dfd.resolve();
			})
		})
		
		return dfd.promise();
	}
	
	
	
	function initExchangesLoop(exchangeListIndex, callback)
	{
		var exchangeListLength = IDEX.exchangeList.length;
		var exchangeName = IDEX.exchangeList[exchangeListIndex];
		
		if (exchangeName == "nxtae")
		{
			var exchangeToInit = new IDEX.exchangeClasses[exchangeName]();
		}
		else
		{
			var exchangeToInit = new IDEX.Exchange(exchangeName);
		}
		
		IDEX.allExchanges[exchangeName] = exchangeToInit;
		
		exchangeToInit.initState().done(function()
		{
			exchangeListIndex++;
			
			if (exchangeListIndex < exchangeListLength)
				initExchangesLoop(exchangeListIndex, callback);
			else
				callback();
		});
	}
	
	
	
	function getActiveExchanges()
	{
		var retDFD = new $.Deferred();
		var params = {'method':"allexchanges"};

		IDEX.sendPost(params, false).done(function(activeExchanges)
		{
			for (var i = 0; i < activeExchanges.length; i++)
			{
				var activeExchange = activeExchanges[i];
				var activeExchangeName = activeExchange.name;
				var tradeable =  "trade" in activeExchange && activeExchange.trade.length;
				var isInArray = IDEX.exchangeList.indexOf(activeExchangeName) >= 0;
				
				if ((isInArray && tradeable) || activeExchangeName == "nxtae")
				{
					IDEX.activeExchanges.push(activeExchangeName);
				}
			}
			
		}).always(function()
		{
			retDFD.resolve();
		})
		
		return retDFD.promise();
	}
	
	
	
	IDEX.addExchangeMarkets = function()
	{
		var allMarkets = IDEX.allMarkets;
		var allCoins = IDEX.allCoins;
		
		for (var i = 0; i < allMarkets.length; i++)
		{
			var market = allMarkets[i];
			
			for (var j = 0; j < market.exchanges.length; j++)
			{
				var exchangeName = market.exchanges[j];
				var exchange = IDEX.allExchanges[exchangeName];
				exchange.markets.push(market);
				
				var isSupportedExchange = IDEX.exchangeList.indexOf(exchangeName) != -1; 
				if (isSupportedExchange)
				{

				}
			}
		}
		

		for (var i = 0; i < allCoins.length; i++)
		{
			var coin = allCoins[i];
			console.log(coin);
			for (var j = 0; j < coin.exchanges.length; j++)
			{
				var exchangeName = coin.exchanges[j];
				var exchange = IDEX.allExchanges[exchangeName];
				exchange.coins.push(coin);
			}
		}	
	}
	
	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
