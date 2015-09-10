	
	
var IDEX = (function(IDEX, $, undefined) 
{
	

	var GENESIS_TIMESTAMP = 1385294400000;

	
	IDEX.Asset = function(obj) 
	{
		this.assetID = "";
		this.name = "";
		this.decimals = -1;
		this.quantityQNT = "";
		this.account = "";
		this.accountRS = "";
		this.description = "";
		this.numberOfTrades = 0;
		this.numberOfAccounts = 0;
		this.numberOfTransfers = 0;

		IDEX.constructFromObject(this, obj);
	};
	
	
	
	function convertToNxtTime(timestamp)
	{
		return Math.floor((timestamp - GENESIS_TIMESTAMP) / 1000);
	}
	
	
	var NxtAE = IDEX.exchangeClasses.nxtae = function()
	{
		this.init.apply(this, arguments)
	}
	
	NxtAE.prototype = 
	{	
		init: function()
		{
			var exchangeHandler = this;
			
			exchangeHandler.exchangeName = "nxtae";
			exchangeHandler.nxtRS = "";
			exchangeHandler.nxtID = "";
			
			exchangeHandler.markets = [];
			exchangeHandler.coins = [];
			
			exchangeHandler.assets = new IDEX.exchangeClasses.nxtae.Assets(exchangeHandler);
			exchangeHandler.balances = new IDEX.exchangeClasses.nxtae.Balances(exchangeHandler);
			exchangeHandler.accountTrades = new IDEX.exchangeClasses.nxtae.AccountTrades(exchangeHandler);
			exchangeHandler.accountOpenOrders = new IDEX.exchangeClasses.nxtae.AccountOpenOrders(exchangeHandler);
			exchangeHandler.marketTrades = new IDEX.exchangeClasses.nxtae.MarketTrades(exchangeHandler);

		},
		
		
		initState: function()
		{
			var exchangeHandler = this;
			var retDFD = new $.Deferred();
			var dfds = [];
			
			dfds.push(exchangeHandler.assets.initAllAssets());
			dfds.push(exchangeHandler.updateNXTRS());
			
			$.when.apply($, dfds).done(function(data)
			{
				retDFD.resolve();
			});
			
			
			return retDFD.promise();
		},
		
		
		
		setNXTRS: function(nxtIDAndRS)
		{
			var exchangeHandler = this;

			exchangeHandler.nxtID = "";
			exchangeHandler.nxtRS = "";
			
			if (nxtIDAndRS.length == 2)
			{
				exchangeHandler.nxtID = nxtIDAndRS[0];
				exchangeHandler.nxtRS = nxtIDAndRS[1];
			}
		},
		
		
		
		updateNXTRS: function()
		{
			var dfd = new $.Deferred();
			var nxtIDAndRS = [];
			var exchangeHandler = this;
			var params = {"method":"orderbook"};
			params.baseid = "12071612744977229797";
			params.relid = "5527630";
			params.maxdepth = "1";
			
			
			IDEX.sendPost(params, false, function(data)
			{
				if ('NXT' in data && data['NXT'].length)
				{
					var id = data['NXT']
					var rs = IDEX.toRS(id);
					nxtIDAndRS.push(id);
					nxtIDAndRS.push(rs);
				}

				exchangeHandler.setNXTRS(nxtIDAndRS);
				
				dfd.resolve([exchangeHandler.nxtID, exchangeHandler.nxtRS])
			});
			
			
			return dfd.promise()
		}
	}
	
	
	
	var Assets = NxtAE.Assets = function()
	{
		this.init.apply(this, arguments);
	}
	
	Assets.prototype = 
	{
		
		init: function(exchangeHandler)
		{
			var assetsHandler = this;
			assetsHandler.exchangeHandler = exchangeHandler;
			
			assetsHandler.allAssets = [];
		},
		
		
		
		initAllAssets: function()
		{
			var retDFD = new $.Deferred();
			var dfd = new $.Deferred();
			var assetsHandler = this;
			
			if (localStorage.allAssets)
			{
				var assets = JSON.parse(localStorage.getItem('allAssets'));
				dfd.resolve(assets);
			}
			else
			{
				var firstIndex = 1;
				var lastIndex = 99;
				
				assetsHandler.getAssetsLoop([], 0, 99, function(assets)
				{

					assets = assetsHandler.parseAllAssets(assets);
					localStorage.setItem('allAssets', JSON.stringify(assets));
					dfd.resolve(assets);
				})
			}
			
			
			dfd.done(function(assets)
			{
				assets.sort(IDEX.compareProp('name'));
				assetsHandler.allAssets = assets;
				retDFD.resolve(assets);
			})
			
			return retDFD.promise();
		},
		
		
		
		getAssetsLoop: function(assets, firstIndex, lastIndex, callback)
		{
			var assetsHandler = this;
			var params = {};
			params.requestType = "getAllAssets";
			params.firstIndex = firstIndex;
			params.lastIndex = lastIndex;
			
			IDEX.sendPost(params, true).done(function(data)
			{
				if ("assets" in data)
				{
					if (data.assets.length)
					{
						var addedAssets = assets.concat(data.assets);
						assetsHandler.getAssetsLoop(addedAssets, firstIndex+100, lastIndex+100, callback);
					}
					else
					{
						callback(assets);
					}
				}
				else
				{
					callback(assets);
				}
			})
		},
		
		
		
		parseAllAssets: function(assets)
		{
			var parsed = [];
			var assetsLength = assets.length;
			
			for (var i = 0; i < assetsLength; i++)
			{
				var obj = {};
				
				for (var key in assets[i])
				{
					if (key == "description")
						continue;
					
					if (key == "asset")
						obj['assetID'] = assets[i][key];
					
					obj[key] = assets[i][key];
				}

				parsed.push(obj);
			}
			
			//parsed.push(IDEX.snAssets['nxt']);
			
			return parsed
		},
		
		
		
		getAsset: function(key, val)
		{
			var assetsHandler = this;
			var arr = [];
			var assetInfo = {};
			var len = assetsHandler.allAssets.length;
			
			for (var i = 0; i < len; i++)
			{
				if (assetsHandler.allAssets[i][key] == val)
				{
					arr.push(assetsHandler.allAssets[i]);
				}
			}
			
			if (arr.length)
			{
				var numTrades = -1;
				var index = 0;
				
				for (var i = 0; i < arr.length; ++i)
				{
					if (arr[i].numberOfTrades > numTrades)
					{
						numTrades = arr[i].numberOfTrades;
						index = i;
					}
				}
				
				assetInfo = arr[index];
			}
			
			return assetInfo;
		},
			
	}
	
	
	
	var Balances = NxtAE.Balances = function()
	{
		this.init.apply(this, arguments)
	}
	
	Balances.prototype = 
	{
		
		init: function(exchangeHandler)
		{
			var balancesHandler = this;
			balancesHandler.exchangeHandler = exchangeHandler;
			balancesHandler.lastUpdated = -1;			
			balancesHandler.balances = {};
			balancesHandler.asyncDFD = false;
			balancesHandler.isUpdating = false;
		},
		
		
		
		getBalance: function(coin)
		{
			var balancesHandler = this;
			var exchangeHandler = balancesHandler.exchangeHandler;
			var assetID = coin.assetID;
			var isNxt = coin.isAsset == false && coin.name == "NXT";
			
			var balance = {};
			
			if (isNxt)
				assetID = "5527630";

			if (assetID in balancesHandler.balances)
				balance = balancesHandler.balances[assetID];

			else
			{
				balance.exchange = "nxtae";
				balance.available = 0;
				balance.total = 0;
				balance.unavailable = 0;
			}

			return balance;
		},
		
		
		
		setBalances: function(balances)
		{
			var balancesHandler = this;		
			var exchangeHandler = balancesHandler.exchangeHandler;
			var exchangeName = exchangeHandler.exchangeName;
			var exchangeCoins = exchangeHandler.coins;
			
			for (var i = 0; i < exchangeCoins.length; i++)
			{
				var exchangeCoin = exchangeCoins[i];
				var exchangeCoinName = exchangeCoin.assetID;
				if (exchangeCoin.name == "NXT" || exchangeCoin.name == "nxt")
					exchangeCoinName = "5527630";
				var exchangeCoinBalanceHandler = exchangeCoin.balanceHandler;
				var byExchange = exchangeCoinBalanceHandler.byExchange;
				var exchangeCoinBalance = {};

				if (exchangeName in byExchange)
				{
					exchangeCoinBalance = byExchange[exchangeName];
				}
				else
				{
					byExchange[exchangeName] = {};
				}
				
				var found = false;
				var searchBalance = false;
				
				for (var key in balances)
				{
					var balance = balances[key];
					if (key == exchangeCoinName)
					{
						searchBalance = balance;
						found = true;
						break;
					}
				}
				
				if (found)
				{
					byExchange[exchangeName] = searchBalance;
				}
				else
				{
					//exchangeCoinBalance = {};
					byExchange[exchangeName].exchange = exchangeName;
					byExchange[exchangeName].available = 0;
					byExchange[exchangeName].unavailable = 0;
					byExchange[exchangeName].total = 0;
				}
			}
			
			balancesHandler.balances = balances;
		},
		
		
		normalizeBalances: function(balances)
		{
			var balancesHandler = this;
			var exchangeHandler = balancesHandler.exchangeHandler;
			var normalizedBalances = {};

			for (var i = 0; i < balances.length; i++)
			{
				var balance = balances[i];
				var formattedBalance = {};
				
				var assetID = balance.assetID;
				var asset = exchangeHandler.assets.getAsset("assetID", assetID);

				if (assetID == "5527630")
					asset = IDEX.snAssets.nxt;
				
				if (asset)
				{
					var name = asset.name;
					var avail = name == "NXT" ? balance.balanceNQT : balance.quantityQNT;
					var unconf = name == "NXT" ? balance.unconfirmedBalanceNQT : balance.unconfirmedQuantityQNT;
					
					formattedBalance.total = avail / Math.pow(10, asset.decimals);
					formattedBalance.available = unconf / Math.pow(10, asset.decimals);	
					formattedBalance.unavailable = IDEX.toSatoshi(Number(formattedBalance.total) - Number(formattedBalance.available));
					formattedBalance.exchange = "nxtae";
					
					normalizedBalances[assetID] = formattedBalance;
				}
			}
			
			return normalizedBalances;
		},
		
		
		
		checkBalance: function(assetID, amount)
		{
			var balancesHandler = this;
			var retBool = false;

			if (assetID in balancesHandler.balances && Number(balancesHandler.balances[assetID].unconfirmedBalance) >= amount)
				retBool = true;
				
			return retBool;
		},
	
		
		
		updateBalances: function(coin, forceUpdate)
		{
			var balancesHandler = this;
			var exchangeHandler = balancesHandler.exchangeHandler;
			var balances = [];
			var time = new Date().getTime();
			var lastUpdated = balancesHandler.lastUpdated;
			
			if (!balancesHandler.isUpdating)
			{
				balancesHandler.isUpdating = true;
				balancesHandler.asyncDFD = new $.Deferred();

				if (!forceUpdate && ((time - lastUpdated < 5000) && (lastUpdated != -1)))
				{
					balancesHandler.isUpdating = false;
					balancesHandler.asyncDFD.resolve();
				}
				else
				{

					//var postObj = {'requestType':"getAccount",'account':IDEX.account.nxtID, 'includeAssets':true};
					var postObj = {'requestType':"getAccountAssets",'account':exchangeHandler.nxtID};
					
					IDEX.sendPost(postObj, true).done(function(data)
					{
						if (!("errorCode" in data) && ("accountAssets" in data))
						{
							balances = data['accountAssets'];
						}
							
						IDEX.sendPost({'requestType':"getBalance", 'account':exchangeHandler.nxtID}, 1).done(function(nxtBal)
						{
							if (!("errorCode" in nxtBal))
							{
								nxtBal['assetID'] = IDEX.snAssets['nxt']['assetID'];
								balances.push(nxtBal);
							}
												
							balances = addAssetID(balances);
							balances = balancesHandler.normalizeBalances(balances);
							balancesHandler.setBalances(balances);
							balancesHandler.isUpdating = false;
							balancesHandler.lastUpdated = time;

							balancesHandler.asyncDFD.resolve();
						})
					})
				}
			}
			
			return balancesHandler.asyncDFD.promise();
		}
			
	}
	
	
	
	var AccountOpenOrders = NxtAE.AccountOpenOrders = function()
	{
		this.init.apply(this, arguments)
	}
	
	AccountOpenOrders.prototype = 
	{
		
		init: function(exchangeHandler)
		{
			var openOrdersHandler = this;
			
			openOrdersHandler.openOrders = {};
			openOrdersHandler.openOrdersLastUpdated = new Date().getTime();
			
			
			openOrdersHandler.exchangeHandler = exchangeHandler;
		},
		
		
		
		updateOpenOrders: function(market, forceUpdate)
		{
			var openOrdersHandler = this;
			var exchangeHandler = openOrdersHandler.exchangeHandler;
			var dfd = new $.Deferred();
			var time = new Date().getTime();
			var base = market.base;
					
			if (!forceUpdate && time - this.openOrdersLastUpdated < 1000)
			{
				dfd.resolve([]);
			}
			else
			{
				var assetInfo = exchangeHandler.assets.getAsset("assetID", base.assetID);
				var decimals = assetInfo.decimals;
				var params = {}
				params.requestType = "getAccountCurrentBidOrders";
				params.account = exchangeHandler.nxtRS;
				params.asset = base.assetID;
				
				IDEX.sendPost(params, true).done(function(bidOrders)
				{
					bidOrders = bidOrders.bidOrders;
					
					params = {}
					params.requestType = "getAccountCurrentAskOrders";
					params.account = exchangeHandler.nxtRS;
					params.asset = base.assetID;

				
					IDEX.sendPost(params, true).done(function(askOrders)
					{
						askOrders = askOrders.askOrders;
						
						var allOpenOrders = bidOrders.concat(askOrders);
						var formattedOpenOrders = [];
						
						for (var i = 0; i < allOpenOrders.length; i++)
						{
							var openOrder = allOpenOrders[i];
							
							var formattedOpenOrder = {};
							
							//var timestamp = IDEX.convertNXTTime(openOrder.timestamp);
							var price = openOrder.priceNQT / Math.pow(10, 8);
							var amount = openOrder.quantityQNT / Math.pow(10, decimals);
							var exchange = "nxtae";
							
							//formattedOpenOrder.timestamp = timestamp;
							formattedOpenOrder.price = price;
							formattedOpenOrder.amount = amount;
							formattedOpenOrder.exchange = exchange;
							formattedOpenOrder.tradeType = openOrder.type;
							formattedOpenOrder.total = IDEX.toSatoshi(Number(price) * Number(amount));
							formattedOpenOrder.status = "Open";
							formattedOpenOrders.push(formattedOpenOrder);
						}

						openOrdersHandler.openOrders[market.marketName] = formattedOpenOrders;
						dfd.resolve(formattedOpenOrders);
					})
				})
			}
			
			
			openOrdersHandler.openOrdersLastUpdated = time;
			
			return dfd.promise();
		}

	}
	
	
	
	var AccountTrades = NxtAE.AccountTrades = function()
	{
		this.init.apply(this, arguments)
	}
	
	AccountTrades.prototype = 
	{
		
		init: function(exchangeHandler)
		{
			var tradesHandler = this;
			
			tradesHandler.lastUpdated = new Date().getTime();

			tradesHandler.exchangeHandler = exchangeHandler;
			tradesHandler.trades = {};
		},
		
		updateTrades: function(market, forceUpdate)
		{
			var tradesHandler = this;
			var exchangeHandler = tradesHandler.exchangeHandler;
			var dfd = new $.Deferred();
			var time = new Date().getTime();
			var base = market.base;

			var params = {}
			params.requestType = "getTrades";
			params.account = exchangeHandler.nxtRS;

			if (market)
				params.asset = base.assetID;

			params.lastIndex = 50;
			
			if (!forceUpdate && time - this.lastUpdated < 1000)
			{
				dfd.resolve()
			}
			else
			{
				IDEX.sendPost(params, true).done(function(data)
				{
					var trades = data.trades;
					
					var formattedTrades = [];
					
					for (var i = 0; i < trades.length; i++)
					{
						var trade = trades[i];
						var formattedTrade = {};
						
						var timestamp = IDEX.convertNXTTime(trade.timestamp);
						var price = trade.priceNQT / Math.pow(10, 8);
						var amount = trade.quantityQNT / Math.pow(10, trade.decimals);
						var exchange = "nxtae";
						
						formattedTrade.timestamp = timestamp;
						formattedTrade.price = price;
						formattedTrade.amount = amount;
						formattedTrade.exchange = exchange;
						formattedTrade.tradeType = trade.tradeType;
						formattedTrade.total = IDEX.toSatoshi(Number(price) * Number(amount));

						formattedTrades.push(formattedTrade);
					}
					
					tradesHandler.trades[market.marketName] = formattedTrades;
					
					dfd.resolve(formattedTrades);
				})
			}
			
			
			tradesHandler.lastUpdated = time;
			
			return dfd.promise();
		},
	}
	
	
	
	var MarketTrades = NxtAE.MarketTrades = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	MarketTrades.prototype = 
	{
		
		init: function(exchangeHandler)
		{
			var tradesHandler = this;
			
			tradesHandler.exchangeHandler = exchangeHandler;
			tradesHandler.markets = {};
			
		},
		
		
		
		setMarketHistory: function(market, marketHistory)
		{
			var tradesHandler = this;		
			var exchangeHandler = tradesHandler.exchangeHandler;
			var exchangeName = exchangeHandler.exchangeName;


			var mMarketHistoryHandler = market.marketHistoryHandler;
			var byExchange = mMarketHistoryHandler.byExchange;

			byExchange[exchangeName].marketHistory = marketHistory;
		},

		
		formatMarketHistory: function(trades)
		{
			var tradesHandler = this;
			var exchangeHandler = tradesHandler.exchangeHandler;
			var exchangeName = exchangeHandler.exchangeName;			
			var formattedTrades = [];
			
			for (var i = 0; i < trades.length; i++)
			{
				var trade = trades[i];
				var formattedTrade = {};
				
				var timestamp = IDEX.convertNXTTime(trade.timestamp);
				var price = trade.priceNQT / Math.pow(10, 8 - trade.decimals);
				var amount = trade.quantityQNT / Math.pow(10, trade.decimals);
				
				formattedTrade.timestamp = timestamp;
				formattedTrade.time = IDEX.formatTime(timestamp, "HMS");
				formattedTrade.price = price;
				formattedTrade.amount = amount;
				formattedTrade.exchange = exchangeName;
				formattedTrade.tradeType = trade.tradeType;
				
				formattedTrades.push(formattedTrade);
			}
			
			return formattedTrades;
		},
		
		
		
		getMarketTrades: function(market, forceUpdate)
		{
			var tradesHandler = this;
			var exchangeHandler = tradesHandler.exchangeHandler;
			var exchangeName = exchangeHandler.exchangeName;
			var dfd = new $.Deferred();
			var time = new Date().getTime();
			var base = market.base;
			
			var mMarketHistoryHandler = market.marketHistoryHandler;
			var byExchange = mMarketHistoryHandler.byExchange;
			
			if (!(exchangeName in byExchange))
			{
				byExchange[exchangeName] = {};
				byExchange[exchangeName].lastUpdated = -1;
			}

			var lastUpdated = byExchange[exchangeName].lastUpdated;

			
			if (!forceUpdate && ((time - lastUpdated < 30000) && (lastUpdated != -1)))
			{
				dfd.resolve();
			}
			else
			{
				var params = {};
				params.requestType = "getTrades";
				params.asset = base.assetID;
				params.lastIndex = 50;
				
				IDEX.sendPost(params, true).then(function(data)
				{
					var trades = data.trades;
					var formattedMarketHistory = tradesHandler.formatMarketHistory(trades);
					tradesHandler.setMarketHistory(market, formattedMarketHistory);
					
					//tradesHandlerMarket.trades = formattedMarketHistory;
					
					dfd.resolve(formattedMarketHistory);
				})
			}
			
			
			byExchange[exchangeName].lastUpdated = time;
			
			return dfd.promise();
		},
		

	}

	
	
	
	function addAssetID(assets)
	{
		for (var i = 0; i < assets.length; i++)
			for (key in assets[i])
				if (key == "asset")
					assets[i]['assetID'] = assets[i][key];
				
		return assets;
	}
	
	

	



	return IDEX;
	
	
}(IDEX || {}, jQuery));

	