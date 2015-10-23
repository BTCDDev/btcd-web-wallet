

var IDEX = (function(IDEX, $, undefined) 
{


	/******************	  OVERLORD   *****************/

	
	IDEX.CoinOverlord = function()
	{
		var overlord = this;
		overlord.allCoins = [];
	}
	
	
	
	IDEX.CoinOverlord.prototype.loadLocalStorage = function()
	{
		var overlord = this;
		var allCoinsRaw = JSON.parse(localStorage.getItem('allCoins'));

		for (var i = 0; i < allCoinsRaw.length; i++)
		{
			var coinRaw = allCoinsRaw[i];
			var coin = new IDEX.Coin(coinRaw);
			
			overlord.allCoins.push(coin);
		}
		
		return overlord.allCoins;
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
	
	
	
	
	/******************	  COIN   *****************/

	
	IDEX.Coin = function(coinObj)
	{
		var coin = this;
		coin.isAsset = coinObj.isAsset;
		coin.name = coinObj.name;
		coin.assetID = coinObj.assetID;
		coin.exchanges = coinObj.exchanges;
		
		coin.balanceHandler = new IDEX.CBalanceHandler(coin);		
	}
	
	

	IDEX.Coin.prototype.minimizeSelf = function()
	{
		var coin = this;
		var coinKeys = ["name", "isAsset", "assetID", "exchanges"];

		var minCoin = IDEX.minObject(coin, coinKeys);

		return minCoin;
	}

	
	
	
	/******************	  BALANCE HANDLER   *****************/

	
	IDEX.CBalanceHandler = function(coin) 
	{	
		var cBalanceHandler = this;
		cBalanceHandler.coin = coin;
		cBalanceHandler.handlerType = "coin";
		
		cBalanceHandler.postDFD = false;
		cBalanceHandler.exchangeUpdaterKey = "balances";
		cBalanceHandler.exchangeUpdaterMethod = "updateBalances";
		cBalanceHandler.byExchange = {};
		
		cBalanceHandler.balance = [];
	}
	

	
	IDEX.CBalanceHandler.prototype.update = function(forceUpdate, filterExchanges)
	{
		var cBalanceHandler = this;
		var coin = cBalanceHandler.coin;
		var coinExchanges = coin.exchanges;
		var dfd = new $.Deferred();
		var dfds = [];
		cBalanceHandler.postDFD = new $.Deferred();
		
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		filterExchanges = typeof filterExchanges == "undefined" ? [] : filterExchanges;
		var exchangesToUpdate = IDEX.parseArray(coinExchanges, filterExchanges);


		cBalanceHandler.updateExchanges(forceUpdate, exchangesToUpdate).done(function()
		{
			cBalanceHandler.balance = [];
			for (var key in cBalanceHandler.byExchange)
			{
				var exchangeBalance = cBalanceHandler.byExchange[key];
				cBalanceHandler.balance.push(exchangeBalance);
			}
			
			dfd.resolve();
		})

				
		return dfd.promise();
	}
	
	
	
	IDEX.CBalanceHandler.prototype.updateExchanges = IDEX.CMHandler;

	

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

