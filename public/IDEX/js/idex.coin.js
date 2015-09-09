

var IDEX = (function(IDEX, $, undefined) 
{
	
	
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