

var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.CMHandler = function(forceUpdate, filterExchanges)
	{
		var handler = this;
		var marketExchanges = filterExchanges;
		var market = handler.handlerType == "coin" ? handler.coin : handler.market;
		var retDFD =  new $.Deferred();
		var dfds = [];
		var exchangeUpdaterKey = handler.exchangeUpdaterKey;
		var exchangeUpdaterMethod = handler.exchangeUpdaterMethod;
		
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		for (var i = 0; i < marketExchanges.length; i++)
		{
			var exchange = marketExchanges[i];
			var exchangeHandler = IDEX.allExchanges[exchange];
			var exSubHandler = exchangeHandler[exchangeUpdaterKey];
			dfds.push(exSubHandler[exchangeUpdaterMethod](market, forceUpdate));
		}
		

		$.when.apply($, dfds).done(function()
		{
			retDFD.resolve();
		}).fail(function()
		{
			retDFD.reject();
		})
		
		return retDFD.promise();
	}
	
	
	IDEX.parseArray = function(arrA, arrB)
	{
		var parsedArray = [];
		
		if (arrB.length)
		{
			for (var i = 0; i < arrB.length; i++)
			{
				var itemB = arrB[i];
				var isInArray = (arrA.indexOf(itemB) != -1)
				
				if (isInArray)
					parsedArray.push(itemB);
			}
		}
		else
		{
			parsedArray = arrA;
		}
		
		return parsedArray;
	}
	
	
	/******************	  OVERLORD   *****************/

	
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
			var baseRet = IDEX.searchListOfObjectsByKeys(allCoins, market.base, ["name", "isAsset", "assetID"]);
			market.base = baseRet.item;
			var relRet = IDEX.searchListOfObjectsByKeys(allCoins, market.rel, ["name", "isAsset", "assetID"]);
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

	IDEX.MarketOverlord.prototype.makeVirtual = function(baseCoin, relCoin)
	{
		var marketOverlord = this;
		var coinOverlord = IDEX.coinOverlord;

		var marketObj = new IDEX.Market({});
		marketObj.marketName = baseCoin.name + "_" + relCoin.name;
		marketObj.base = baseCoin;
		marketObj.rel = relCoin;
		marketObj.pairID = baseCoin.assetID + "_" + relCoin.assetID;
		marketObj.exchanges = [];
		marketObj.exchangeSettings = {};
		marketObj.marketKey = baseCoin.assetID + "_" + relCoin.assetID;

		return marketObj;
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

			if (ret)
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
	
	
	
	
	/******************	  MARKET   *****************/

	
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
	
	
	
	
	/******************	  MARKET HISTORY HANDLER   *****************/

	
	
	IDEX.MMarketHistoryHandler = function(market) 
	{	
		var mMarketHistoryHandler = this;
		mMarketHistoryHandler.market = market;
		mMarketHistoryHandler.handlerType = "market";
		
		mMarketHistoryHandler.isUpdating = false;
		mMarketHistoryHandler.postDFD = false;
		mMarketHistoryHandler.exchangeUpdaterKey = "marketTrades";
		mMarketHistoryHandler.exchangeUpdaterMethod = "getMarketTrades";
		
		mMarketHistoryHandler.byExchange = {};
		mMarketHistoryHandler.marketHistory = [];
	};
	
	
	
	IDEX.MMarketHistoryHandler.prototype.update = function(forceUpdate, filterExchanges)
	{
		var mMarketHistoryHandler = this;
		var dfd = new $.Deferred();
		var market = mMarketHistoryHandler.market;
		var marketExchanges = market.exchanges;
		
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		filterExchanges = typeof filterExchanges == "undefined" ? [] : filterExchanges;
		var exchangesToUpdate = IDEX.parseArray(marketExchanges, filterExchanges);
		
		mMarketHistoryHandler.updateExchanges(forceUpdate, exchangesToUpdate).done(function()
		{
			var marketHistory = [];
			var byExchange = mMarketHistoryHandler.byExchange;

			for (var exchangeName in byExchange)
			{
				var exchangeMarketHistory = byExchange[exchangeName].marketHistory;
				marketHistory = marketHistory.concat(exchangeMarketHistory);
			}
			
			marketHistory.sort(IDEX.compareProp('timestamp')).reverse();
			mMarketHistoryHandler.marketHistory = marketHistory;
			
			dfd.resolve();
		})
		
				
		return dfd.promise();
	}
	
	
	
	IDEX.MMarketHistoryHandler.prototype.updateExchanges = IDEX.CMHandler;
	
	

	
	/******************	  TRADE HISTORY HANDLER   *****************/

	
	IDEX.MTradeHistoryHandler = function(market) 
	{	
		var mTradeHistoryHandler = this;
		mTradeHistoryHandler.market = market;
		mTradeHistoryHandler.handlerType = "market";
		
		mTradeHistoryHandler.postDFD = false;
		mTradeHistoryHandler.exchangeUpdaterKey = "accountTrades";
		mTradeHistoryHandler.exchangeUpdaterMethod = "updateTrades";
		
		mTradeHistoryHandler.tradeHistory = [];
	};
	

	
	
	IDEX.MTradeHistoryHandler.prototype.update = function(forceUpdate, filterExchanges)
	{
		var mTradeHistoryHandler = this;
		var market = mTradeHistoryHandler.market;
		var marketExchanges = market.exchanges;
		mTradeHistoryHandler.postDFD = new $.Deferred();
		filterExchanges = typeof filterExchanges == "undefined" ? [] : filterExchanges;
		var exchangesToUpdate = filterExchanges.length ? filterExchanges : marketExchanges;


		mTradeHistoryHandler.updateExchanges(forceUpdate, marketExchanges).done(function()
		{
			mTradeHistoryHandler.tradeHistory = [];
			
			mTradeHistoryHandler.postDFD.resolve();
		})

		
		
		return mTradeHistoryHandler.postDFD.promise();
	}
	
	
	
	IDEX.MTradeHistoryHandler.prototype.updateExchanges = IDEX.CMHandler;

	

	/******************	  WATCHLIST HANDLER   *****************/

	
	
	IDEX.WatchlistMarket = function(market) 
	{	
		var watchlistMarket = this;
		watchlistMarket.market = market;
		
		watchlistMarket.lastUpdated = -1;
		watchlistMarket.isUpdating = false;
		watchlistMarket.xhr = false;
		watchlistMarket.postDFD = false;
		
		watchlistMarket.marketInfo = 
		{
			lastBid: -1,
			lastAsk: -1
		};
	};
	
	
	IDEX.WatchlistMarket.prototype.update = function(forceUpdate)
	{
		var watchlistMarket = this;
		watchlistMarket.postDFD = new $.Deferred();
		var market = watchlistMarket.market;
		var time = new Date().getTime()
		var lastUpdatedTime = watchlistMarket.lastUpdated;

		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		if (!forceUpdate && ((time - lastUpdatedTime < 10000) && (lastUpdatedTime != -1)))
		{
			watchlistMarket.postDFD.resolve();
		}
		else
		{
			var isNxtAE = market.isNxtAE;
			var base = market.base;
			var rel = market.rel;
			
			var params = 
			{
				'plugin':"InstantDEX",
				'method':"orderbook", 
				'allfields':1,
				'exchange':market.exchanges[0],
				'tradeable':0,
				//'baseid':fav.base.assetID,
				//'relid':"5527630",
				'maxdepth':1
			};
			
			if (isNxtAE)
			{
				params.baseid = base.assetID;
				params.relid = "5527630";
				//params.exchange = "nxtae";
			}
			else
			{
				params.base = base.name;
				params.rel = rel.name;
			}
			
			watchlistMarket.isUpdating = true;
			IDEX.sendPost(params, false).done(function(data)
			{
				var lastBid = data.lastbid;
				var lastAsk = data.lastask;
				
				watchlistMarket.marketInfo.lastBid = lastBid;
				watchlistMarket.marketInfo.lastAsk = lastAsk;
				
				watchlistMarket.isUpdating = false;
				watchlistMarket.postDFD.resolve();
			}).fail(function()
			{
				watchlistMarket.isUpdating = false;
				watchlistMarket.postDFD.reject();
			})
		}
		
		watchlistMarket.lastUpdated = time;
		
		return watchlistMarket.postDFD.promise();
	}
	
	
	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));


/*

	function check()
	{
		//if (filterExchanges.length && (filterExchanges.indexOf(exchange) == -1))
		//	continue;
	}
	
*/

