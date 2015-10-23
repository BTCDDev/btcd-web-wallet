

var IDEX = (function(IDEX, $, undefined)
{


	IDEX.initMarketList = function()
	{
		var retDFD = new $.Deferred();
		var dfd = new $.Deferred();
		
		if ((localStorage.allCoins && localStorage.allMarkets))
		{
			IDEX.allCoins = IDEX.coinOverlord.loadLocalStorage();
			IDEX.allMarkets = IDEX.marketOverlord.loadLocalStorage();			
						
			dfd.resolve();
		}
		else
		{
			getAllMarkets().done(function(marketsByExchange)
			{	
				var allCoinsRet = initCoins(marketsByExchange);
				var allCoins = allCoinsRet.allCoins;
				var coinedMarketsByExchange = allCoinsRet.coinedMarketsByExchange;
				var allMarkets = initMarkets(coinedMarketsByExchange);
				IDEX.coinOverlord.allCoins = allCoins;
				IDEX.marketOverlord.allMarkets = allMarkets;
				
				IDEX.allCoins = allCoins;
				IDEX.allMarkets = allMarkets;
				IDEX.coinOverlord.setLocalStorage();
				IDEX.marketOverlord.setLocalStorage();
				
				
				dfd.resolve();
			})
		}
		
		
		dfd.done(function()
		{
			IDEX.addExchangeMarkets();
			retDFD.resolve();
		})
		
		
		return retDFD.promise();
	}
	
	
	
	
	
	/***************** 		GET THE LIST 	******************/
	
	
	function getAllMarkets()
	{
		var retDFD = new $.Deferred();
		
		getExternalExchangeMarkets().done(function(parsedMarkets)
		{
			var nxtaeMarkets = getNxtAEMarkets();
			var marketsByExchange = parsedMarkets.exchanges;
			marketsByExchange.nxtae = nxtaeMarkets;			
			
			retDFD.resolve(marketsByExchange);
		})
		
		return retDFD.promise();
	}
	

	function getNxtAEMarkets()
	{
		var nxtae = IDEX.allExchanges.nxtae;
		var allAssets = nxtae.assets.allAssets;
		var markets = [];
		
		for (var i = 0; i < allAssets.length; i++)
		{
			var asset = allAssets[i];
			
			markets.push(asset.assetID + "_" + "nxt");
		}
		
		return markets;
	}

	
	
	function getExternalExchangeMarkets()
	{
		var retDFD = new $.Deferred();
		
		var obj = {}
		obj.section = "crypto";
		obj.run = "search";
		obj.field = "pair";
		obj.term = "";
		obj.key = "beta_test";
		obj.filter = "";

		var url = makeSkynetURL(obj);

		$.getJSON(url, function(data)
		{
			var parsedMarkets = parseSkynetMarkets(data.results);
			
			retDFD.resolve(parsedMarkets);
		})
		
		
		return retDFD.promise();
	}
	
	
	
	function parseSkynetMarkets(data)
	{
		var markets = {};
		var exchanges = {};
		
		for (pair in data)
		{
			var pairExchanges = data[pair].split('|');
			var marketObj = {};
			
			marketObj.marketName = pair;
			marketObj.exchanges = [];
			
			for (var i = 0; i < pairExchanges.length; i++)
			{
				var exchange = pairExchanges[i];
				
				if (!(exchange in exchanges))
					exchanges[exchange] = [];
				
				exchanges[exchange].push(pair);
				marketObj.exchanges.push(exchange);
			}
			
			markets[pair] = marketObj;
		}

		return {"exchanges":exchanges, "markets":markets};
	}
	
	

    function makeSkynetURL(obj)
    {
		var baseurl = "http://api.finhive.com/v1.0/run.cgi?"
        var arr = []
		
        for (key in obj)
        {
			arr.push(key+"="+obj[key])
        }
        var s = arr.join("&")

        return baseurl+s
    }
	
	
	

	/***************** 		FORMAT COINS 	******************/
	
	
	
	function initCoins(marketsByExchange)
	{
		var allCoins = [];
		var coinedMarketsByExchange = {};
		
		for (exchangeName in marketsByExchange)
		{
			var isSupportedExchange = IDEX.exchangeList.indexOf(exchangeName) != -1;
			if (!isSupportedExchange)
				continue;

			var exchangeMarkets = marketsByExchange[exchangeName];
			coinedMarketsByExchange[exchangeName] = [];

			for (var i = 0; i < exchangeMarkets.length; i++)
			{
				var marketName = exchangeMarkets[i];
				var baseRel = marketName.split("_");
				var baseName = baseRel[0];
				var relName = baseRel[1];
				
				var baseObj = makeCoinObject(baseName, exchangeName);
				addCoinObject(baseObj, exchangeName, allCoins);
				
				var relObj = makeCoinObject(relName, exchangeName);
				addCoinObject(relObj, exchangeName, allCoins);
				
				
				var marketObj = {};
				marketObj.marketName = marketName;
				marketObj.base = baseObj;
				marketObj.baseRaw = baseName;
				marketObj.rel = relObj;
				marketObj.relRaw = relName;		

				coinedMarketsByExchange[exchangeName].push(marketObj);	
			}
		}
		
		return {'allCoins':allCoins, 'coinedMarketsByExchange':coinedMarketsByExchange};
	}
	
	
	function makeCoinObject(name, exchangeName)
	{
		var isNxtAE = exchangeName == "nxtae";

		var coinObj = {};
		coinObj.exchanges = [];
		
		var assetObj = IDEX.allExchanges.nxtae.assets.getAsset("assetID", name);

		if (isNxtAE && !($.isEmptyObject(assetObj)))
		{
			coinObj.name = assetObj.name;
			coinObj.isAsset = true;
			coinObj.assetID = assetObj.assetID;

		}
		else
		{
			coinObj.name = name.toUpperCase();
			coinObj.isAsset = false;
			coinObj.assetID = "";
		}
				
		coinObj = new IDEX.Coin(coinObj);


		return coinObj;
	}
	
	
	
	function addCoinObject(coinObj, exchangeName, allCoins)
	{
		var searchRet = IDEX.searchListOfObjectsByKeys(allCoins, coinObj, ["name", "isAsset", "assetID"]);
		
		if (searchRet.ret)
		{
			coinObj = allCoins[searchRet.index];
			if (coinObj.exchanges.indexOf(exchangeName) == -1)
			{
				coinObj.exchanges.push(exchangeName);
			}
		}
		else
		{
			coinObj = new IDEX.Coin(coinObj);
			coinObj.exchanges.push(exchangeName);
			allCoins.push(coinObj);
		}
	}
	
	
	

	/***************** 		FORMAT MARKETS 	******************/

	
	
	function initMarkets(marketsByExchange)
	{
		var allMarkets = [];
		
		for (exchangeName in marketsByExchange)
		{
			var exchangeMarkets = marketsByExchange[exchangeName];
			
			for (var i = 0; i < exchangeMarkets.length; i++)
			{
				var market = exchangeMarkets[i];
				var marketKey = market.marketName;
				var baseObj = market.base;
				var baseRaw = market.baseRaw;
				var relObj = market.rel;
				var relRaw = market.relRaw;
				
				var skynetFlipped = false;
				var isNxtAE = exchangeName == "nxtae";

				if (exchangeName == "poloniex" || exchangeName == "bittrex")
				{
					baseObj = [relObj, relObj = baseObj][0];
					baseRaw = [relRaw, relRaw = baseRaw][0];

					skynetFlipped = true;
					marketKey = baseRaw + "_" + relRaw;
				}
				
				var searchMarket = IDEX.searchListOfObjects(allMarkets, "marketKey", marketKey)
				
				if (searchMarket)
				{
					var marketObj = searchMarket.obj;
				}
				else
				{
					var marketObj = new IDEX.Market({});
					allMarkets.push(marketObj);
					marketObj.marketName = baseObj.name + "_" + relObj.name;
					marketObj.base = baseObj;
					marketObj.rel = relObj;
					marketObj.pairID = baseObj.name + "_" + relObj.name;
					marketObj.exchanges = [];
					marketObj.exchangeSettings = {};
					marketObj.marketKey = marketKey;
				}
				
				if (isNxtAE)
				{
					marketObj.pairID = marketObj.base.assetID + "_" + marketObj.rel.name;
				}
				
				var exchangeFormat = {};
				exchangeFormat.skynetFlipped = skynetFlipped;
				
				marketObj.exchanges.push(exchangeName);
				marketObj.exchangeSettings[exchangeName] = exchangeFormat;
				
				var marketNxtAE = marketObj.exchanges.length == 1 && marketObj.exchanges[0] == "nxtae";
				marketObj.isNxtAE = marketNxtAE;
			}
		}
		
		
		return allMarkets
	}
	
	

	
	return IDEX;
		

}(IDEX || {}, jQuery));


