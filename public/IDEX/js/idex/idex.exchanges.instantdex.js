

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
			exchange.balances = new IDEX.Exchange.Balances(exchange);
			exchange.marketTrades = new IDEX.Exchange.MarketTrades(exchange);

			exchange.markets = [];
						
		},
		
		
		initState: function()
		{
			var dfd = new $.Deferred();
			var exchange = this;

			dfd.resolve();
			
			
			return dfd.promise();
		},
		
		
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

	