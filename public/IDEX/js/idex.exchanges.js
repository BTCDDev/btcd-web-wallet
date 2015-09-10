	
	
var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.snAssets = 
	{
		'nxt':{'name':"NXT",'assetID':"5527630", 'decimals':8}
	};
	
	
	IDEX.exchangeClasses = {};
	IDEX.exchangeList = ["nxtae", "bitfinex", "btc38", "bitstamp", "btce", "poloniex", "bittrex", "huobi", "coinbase", "okcoin"]; //bityes-broken&flipped lakebtc-no markets?  //exmo bter unconf InstantDEX
	IDEX.activeExchanges = [];
	
	IDEX.allExchanges = {};
	IDEX.allCoins = [];
	IDEX.allMarkets = [];
	
	
	
	IDEX.MarketOverlord = function()
	{
		var overlord = this;
		overlord.allMarkets = [];
	}
	
	
	IDEX.MarketOverlord.prototype.loadLocalStorage = function()
	{
		var overlord = this;
		var allMarkets = overlord.allMarkets;
		var allMarketsRaw = JSON.parse(localStorage.getItem('allMarkets'));
		var allCoins = IDEX.allCoins;
		
		for (var i = 0; i < allMarketsRaw.length; i++)
		{
			var marketRaw = allMarketsRaw[i];
			var market = new IDEX.Market(marketRaw);
			var baseRet = tempSearch(allCoins, market.base, ["name", "isAsset", "assetID"]);
			market.base = baseRet.item;
			var relRet = tempSearch(allCoins, market.rel, ["name", "isAsset", "assetID"]);
			market.rel = relRet.item;
			
			allMarkets.push(market);
		}
		
	
		return allMarkets;
	}
	
	
	IDEX.MarketOverlord.prototype.setLocalStorage = function()
	{
		var overlord = this;
		var allMarkets = overlord.allMarkets;
		var minMarkets = [];

		for (var i = 0; i < allMarkets.length; i++)
		{
			var market = allMarkets[i];
			var minMarket = market.minimizeSelf();
			minMarkets.push(minMarket);
		}
		
		localStorage.setItem('allMarkets', JSON.stringify(minMarkets));
		
		return minMarkets;
	}

	
	
	IDEX.MarketOverlord.prototype.expandMarket = function(minMarket)
	{
		var overlord = this;
		var allMarkets = overlord.allMarkets;
		var keys = ["marketName", "pairID", "isNxtAE"];
		var retMarket = null;
		
		for (var i = 0; i < allMarkets.length; i++)
		{
			var market = allMarkets[i];
			var ret = IDEX.compObjs(market, minMarket, keys);

			if (ret != null)
			{
				retMarket = market;
				break;
			}
		}

		return retMarket;
	}
	
	
	IDEX.MarketOverlord.prototype.getMarket = function(marketKey)
	{
		var overlord = this;
		var allMarkets = overlord.allMarkets;
		var retMarket = null;
		
		for (var i = 0; i < allMarkets.length; i++)
		{
			var market = allMarkets[i];
			if (market.marketKey == marketKey)
			{
				retMarket = market;
				break;
			}
		}

		return retMarket;
	}
	
	
	
	
	IDEX.Market = function(obj)
	{
		var market = this;
		market.marketName;
		market.pairID;
		market.base;
		market.rel;
		market.exchanges;
		market.exchangeSettings;
		market.isNxtAE;
		market.marketKey;
		IDEX.constructFromObject(this, obj);

		market.marketHistoryHandler = new IDEX.MMarketHistoryHandler(market);
		market.tradeHistoryHandler = new IDEX.MTradeHistoryHandler(market);
		market.watchlistHandler = new IDEX.WatchlistMarket(market);
	}
	
	
	IDEX.Market.prototype.minimizeSelf = function()
	{
		var market = this;
		var keys = ["marketName", "pairID", "isNxtAE", "exchangeSettings", "exchanges", "marketKey"];

		var minMarket = IDEX.minObject(market, keys);
		var minBase = market.base.minimizeSelf();
		var minRel = market.rel.minimizeSelf();

		minMarket.base = minBase;
		minMarket.rel = minRel;

		return minMarket;
	}
	
	
	
	IDEX.CoinOverlord = function()
	{
		var overlord = this;
		overlord.allCoins = [];
	}
	
	
	IDEX.CoinOverlord.prototype.loadLocalStorage = function()
	{
		var overlord = this;
		var allCoins = overlord.allCoins;
		var allCoinsRaw = JSON.parse(localStorage.getItem('allCoins'));

		for (var i = 0; i < allCoinsRaw.length; i++)
		{
			var coinRaw = allCoinsRaw[i];
			var coin = new IDEX.Coin(coinRaw);
			
			allCoins.push(coin);
		}
		

		return allCoins;
	}
	
	
	IDEX.CoinOverlord.prototype.setLocalStorage = function()
	{
		var overlord = this;
		var keys = ["name", "isAsset", "assetID", "exchanges"];
		var minCoins = [];
		var allCoins = overlord.allCoins;
	
		for (var i = 0; i < allCoins.length; i++)
		{
			var coin = allCoins[i];
			var minCoin = coin.minimizeSelf();
			minCoins.push(minCoin);
			
		}
		
		localStorage.setItem('allCoins', JSON.stringify(minCoins));

		return minCoins;
	}
	
	
	
	IDEX.Coin = function(coinObj)
	{
		var coin = this;
		coin.isAsset = coinObj.isAsset;
		coin.name = coinObj.name;
		coin.assetID = coinObj.assetID;
		coin.exchanges = coinObj.exchanges;
		
		IDEX.constructFromObject(this, coinObj);

		
		coin.balanceHandler = new IDEX.CBalanceHandler(coin);		
	}
	

	IDEX.Coin.prototype.minimizeSelf = function()
	{
		var coin = this;
		var coinKeys = ["name", "isAsset", "assetID", "exchanges"];

		var minCoin = IDEX.minObject(coin, coinKeys);

		return minCoin;
	}
	
	
	
	IDEX.initExchanges = function()
	{
		var dfd = new $.Deferred();
		
		IDEX.initExchangesLoop(0, function()
		{
			IDEX.nxtae = IDEX.allExchanges.nxtae;
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
				
				dfd.resolve();
			})
		})
		
		return dfd.promise();
	}
	
	
	
	IDEX.initExchangesLoop = function(exchangeListIndex, callback)
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
				IDEX.initExchangesLoop(exchangeListIndex, callback)
			else
				callback();
		});
	}
	
	
	function makeCoinObject(name, exchangeName, allCoins)
	{
		var isNxtAE = exchangeName == "nxtae";

		var coinObj = {};
		coinObj.exchanges = [];
		
		var assetObj = IDEX.nxtae.assets.getAsset("assetID", name);

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
		
								
		var searchRet = tempSearch(allCoins, coinObj, ["name", "isAsset", "assetID"]);
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
		
		return coinObj;
	}
	
	
	
	function tempSearch(arr, obj, keys)
	{
		var retObj = {};
		var ret = false;
		
		for (var i = 0; i < arr.length; i++)
		{
			var item = arr[i];
			
			var ret = IDEX.compObjs(item, obj, keys);
			
			if (ret)
				break;
		}
		
		retObj.ret = ret;
		retObj.index = i;
		retObj.item = item;
		
		return retObj;
	}
	
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
			var coinedMarkets;
			coinedMarketsByExchange[exchangeName] = coinedMarkets = [];
			//coinedMarketsByExchange.markets = [];

			for (var i = 0; i < exchangeMarkets.length; i++)
			{
				var marketName = exchangeMarkets[i];
				var baseRel = marketName.split("_");
				var base = baseRel[0];
				var rel = baseRel[1];
				var baseObj = makeCoinObject(base, exchangeName, allCoins);
				var relObj = makeCoinObject(rel, exchangeName, allCoins);
				
				var marketObj = {};
				marketObj.marketName = marketName;
				marketObj.base = baseObj;
				marketObj.baseRaw = base;
				marketObj.rel = relObj;
				marketObj.relRaw = rel;
			
				coinedMarkets.push(marketObj);
			}
		}
		
		return {'allCoins':allCoins, 'coinedMarketsByExchange':coinedMarketsByExchange};
	}
	
	
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
	
	
	function tempAdd(allMarkets, allCoins)
	{
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
			
			for (var j = 0; j < coin.exchanges.length; j++)
			{
				var exchangeName = coin.exchanges[j];
				var exchange = IDEX.allExchanges[exchangeName];
				exchange.coins.push(coin);
			}
		}	
	}
	
	IDEX.initAllMarkets = function()
	{
		var dfd = new $.Deferred();
		
		if ((localStorage.allCoins && localStorage.allMarkets))
		{
			var allCoins = IDEX.coinOverlord.loadLocalStorage();
			IDEX.allCoins = allCoins;

			var allMarkets = IDEX.marketOverlord.loadLocalStorage();			
			IDEX.allMarkets = allMarkets;
			
			tempAdd(allMarkets, allCoins);
			
			dfd.resolve();
		}
		else
		{
			getExternalExchangeMarkets().done(function(parsedMarkets)
			{
				var marketsByExchange = parsedMarkets.exchanges;
				var nxtaeMarkets = getNxtAEMarkets();
				marketsByExchange.nxtae = nxtaeMarkets;
				
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

				tempAdd(allMarkets, allCoins);
				
				
				dfd.resolve();
			})
		}
		
		return dfd.promise();

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
		var dfd = new $.Deferred();
		

		var obj = {}
		obj.section = "crypto";
		obj.run = "search";
		obj.field = "pair";
		obj.term = "";
		obj.key = "beta_test";
		obj.filter = "";

		var url = IDEX.makeSkynetURL(obj)

		$.getJSON(url, function(data)
		{
			var parsed = parseSkynetSearch(data.results);
			
			dfd.resolve(parsed);
		})
		
		
		return dfd.promise();
	}
	
	
	
	function parseSkynetSearch(data)
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
	
	

    IDEX.makeSkynetURL = function(obj)
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
	


	
	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
