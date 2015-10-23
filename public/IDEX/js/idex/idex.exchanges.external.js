


var IDEX = (function(IDEX, $, undefined)
{
	

	
	var Exchange = IDEX.Exchange = function()
	{
		this.init.apply(this, arguments)
	}
	
	Exchange.prototype = 
	{
		init: function(exchangeName)
		{
			var exchange = this;
			
			exchange.exchangeName = exchangeName;
			exchange.markets = [];
			exchange.coins = [];

			exchange.balances = new IDEX.Exchange.Balances(exchange);
			exchange.marketTrades = new IDEX.Exchange.MarketTrades(exchange);

		},
		
		
		initState: function()
		{
			var exchange = this;
			var retDFD = new $.Deferred();
			
			retDFD.resolve();
			
			return retDFD.promise();
		},
	}
	
	
	var Balances = Exchange.Balances = function()
	{
		this.init.apply(this, arguments)
	}
	
	Balances.prototype = 
	{
		init: function(exchangeHandler)
		{
			var balancesHandler = this;
			balancesHandler.exchangeHandler = exchangeHandler;
			
			balancesHandler.balancesLastUpdated = -1;
			balancesHandler.balances = {};
			balancesHandler.asyncDFD = false;
			balancesHandler.isUpdating = false;
		},
		
		
		getBalance: function(coin)
		{
			var balancesHandler = this;
			var balances = balancesHandler.balances;
			var exchangeHandler = balancesHandler.exchangeHandler;
			var balance = {};
			var coinName = coin.name;
			
			if (coinName in balances)
			{
				balance = balances[coinName];
			}
			else
			{
				balance.exchange = exchangeHandler.exchangeName;
				balance.available = 0;
				balance.unavailable = 0;
				balance.total = 0;
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
				var exchangeCoinName = exchangeCoin.name;
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
		
		
		
		updateBalances: function(coin, forceUpdate)
		{
			var balancesHandler = this;			
			var dfd = new $.Deferred();
			var time = new Date().getTime()

			var exchangeHandler = balancesHandler.exchangeHandler;
			var exchangeName = exchangeHandler.exchangeName;
			var lastUpdated = balancesHandler.balancesLastUpdated;
			var params = {"method":"balance","exchange":exchangeName};			

			
			if (!balancesHandler.isUpdating)
			{
				balancesHandler.isUpdating = true;
				balancesHandler.asyncDFD = new $.Deferred();
				
				if (!forceUpdate && ((time - lastUpdated < 15000) && (lastUpdated != -1)))
				{
					balancesHandler.isUpdating = false;
					balancesHandler.asyncDFD.resolve();
				}
				else
				{				
					IDEX.sendPost(params, false).done(function(data)
					{
						var balances = normalizeBalances(data, exchangeName);
						balancesHandler.setBalances(balances);
						balancesHandler.balancesLastUpdated = time;

						balancesHandler.isUpdating = false;
						balancesHandler.asyncDFD.resolve()
					})
				}
			}

			return balancesHandler.asyncDFD.promise();
		}
	}
	
	var MarketTrades = Exchange.MarketTrades = function()
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
		
			tradesHandler.lastUpdated = -1;
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
				
				var timestamp = trade.timestamp;
				var price = trade.price;
				var amount = trade.amount;
				var volume = trade.volume;
				var tradeType = "bid";
				
				formattedTrade.timestamp = timestamp;
				formattedTrade.time = IDEX.formatTime(timestamp, "HMS");
				formattedTrade.price = price;
				formattedTrade.amount = amount;
				formattedTrade.exchange = exchangeName;
				formattedTrade.tradeType = tradeType;
				
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
				dfd.resolve([]);
			}
			else
			{
				var params = {}
				params.key = "beta_test";

				var format = {};
				format.rnum = 30;
				format.sort = "des";
				
				var query = {};
				query.section = "dat";
				query.segment = "qts";
				query.target = "qts_tck";
				query.params = {};
				query.params.exchange = exchangeName;
				query.params.source = "crypto";
				query.params.symbol = IDEX.flipCheckMarket(market, exchangeName);
				params.format = format;
				params.query = query;

				IDEX.sendSkynetPost(params).done(function(data)
				{
					var trades = data.results;
					var formattedMarketHistory = tradesHandler.formatMarketHistory(trades);
					tradesHandler.setMarketHistory(market, formattedMarketHistory);
					dfd.resolve(formattedMarketHistory);
				}).fail(function()
				{
					tradesHandlerMarket.trades = [];
					dfd.resolve([])
				})
			}
			
			
			byExchange[exchangeName].lastUpdated = time;
			
			return dfd.promise();
		},
	
	}


	
	var AccountTrades = Exchange.AccountTrades = function()
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

			
			tradesHandler.lastUpdated = time;
			
			return dfd.promise();
		},
	}
		
	
		
	function normalizeBalances(rawBalances, exchangeName)
	{
		var balances = {};
		
		if (exchangeName == "poloniex")
		{
			for (key in rawBalances)
			{
				var balance = {};
				var rawBalance = rawBalances[key];
				
				balance.available = rawBalance.available;
				balance.unavailable = rawBalance.onOrders;
				balance.total = IDEX.toSatoshi(Number(balance.available) + Number(balance.unavailable));
				balance.name = key;
				balance.exchange = exchangeName;

				balances[key] = balance;
			}
		}
		else if (exchangeName == "bittrex")
		{
			if ("result" in rawBalances)
			{
				var result = rawBalances.result;

				for (var i = 0; i < result.length; i++)
				{
					var rawBalance = result[i];
					var balance = {};
					balance.available = rawBalance.Available;
					balance.total = rawBalance.Balance
					balance.unavailable = IDEX.toSatoshi(balance.total - balance.available);
					balance.name = rawBalance.Currency;
					balance.exchange = exchangeName;
					
					balances[rawBalance.Currency] = balance;
				}
			}
		}
				
		return balances;
	}

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


	