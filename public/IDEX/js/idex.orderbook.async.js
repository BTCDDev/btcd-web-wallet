

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.Orderbook.prototype.getOrderbookData = function(timeout)
	{
		var retDFD = new $.Deferred();
		var orderbook = this;

		orderbook.counter = true;
		orderbook.lastUpdatedHandler(0);
		
		orderbook.orderbox.updateOrderBoxBalance();
		
		orderbook.setTimeout(timeout).then(function(wasCleared)
		{
			if (wasCleared)
			{
				orderbook.counter = false;
				orderbook.clearUpdatedTimeout()
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				orderbook.orderbookPost().done(function(orderbookData)
				{
					orderbook.orderbox.updateOrderBoxBalance();

					orderbook.counter = false;
					orderbook.clearUpdatedTimeout()
					
					if (orderbookData == "fail")
					{
						retDFD.resolve({}, IDEX.AJAX_ERROR);
					}
					else if (orderbook.isStoppingOrderbook)
					{
						retDFD.resolve({}, IDEX.AJAX_ABORT);
					}
					else
					{
						if ("error" in orderbookData)
							orderbookData = {};
						
						retDFD.resolve(orderbookData, IDEX.OK);
					}
				});
			}
		})

		return retDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.orderbookPost = function()
	{
		var retDFD = new $.Deferred();
		var orderbook = this;
		var base = orderbook.market.base;
		var rel = orderbook.market.rel;
		
		var params = 
		{
			'plugin':"InstantDEX",
			'method':"orderbook", 
			'allfields':1,
			'exchange':orderbook.exchange,
			'tradeable':0
		};
		
		if (orderbook.market.isNxtAE)
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
		
		//params.exchange="basket"
		//params.basket=[{"exchange":"nxtae"},{"exchange":"unconf"}];

		this.isWaitingForOrderbook = true;
		var time = Date.now()
		
		var tdfd = new $.Deferred();
		
		if (false && orderbook.market.isNxtAE)
		{

			
			paramsn = {}
			paramsn.requestType = "getUnconfirmedTransactions";
			
			IDEX.sendPost(paramsn, true).done(function(a)
			{
				tdfd.resolve(a);
			}).fail(function(data)
			{
				tdfd.resolve({})
			})

		}
		else
		{
			tdfd.resolve({})
		}
		
			//tdfd.resolve({});

		tdfd.done(function(tdata)
		{
			console.log("params " + JSON.stringify(params));
			
			IDEX.sendPost(params, false).done(function(orderbookData)
			{
				var addBids = [];
				var addAsks = [];


				orderbook.isWaitingForOrderbook = false;
				retDFD.resolve(orderbookData);
			}).fail(function(data)
			{
				retDFD.resolve("fail")
			})
		})
		
		return retDFD.promise();
	}

	
	IDEX.Orderbook.prototype.clearTimeout = function()
	{
		if (this.timeoutDFD)
		{
			clearTimeout(this.orderbookTimeout);
			this.timeoutDFD.resolve(true);
			this.timeoutDFD = false;
		}
	}
	

	IDEX.Orderbook.prototype.setTimeout = function(timeout)
	{
		this.timeoutDFD = new $.Deferred();
		var orderbook = this;
		
		//console.log("starting setTimeout " + String(timeout));
		this.orderbookTimeout = setTimeout(function() 
		{
			//console.log("finished setTimeout " + String(timeout));
			orderbook.timeoutDFD.resolve(false);
			orderbook.timeoutDFD = false;
		}, timeout)
		
		return this.timeoutDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.lastUpdatedHandler = function(seconds)
	{
		var orderbook = this;
		
		orderbook.lastUpdatedCounter().done(function()
		{			
			if (orderbook.counter)
			{
				seconds++;
				
				if (orderbook.isWaitingForOrderbook)
					var text = String(seconds) + "s..."
				else
					var text = String(seconds) + "s"
				
				orderbook.lastUpdatedDom.text(text)
				
				orderbook.lastUpdatedHandler(seconds)
			}
			else
			{
				var text = "0s"
				orderbook.lastUpdatedDom.text(text)
			}
		})
	}
	
	
	IDEX.Orderbook.prototype.lastUpdatedCounter = function()
	{
		this.lastUpdatedDFD = new $.Deferred();
		var orderbook = this;
		
		this.lastUpdatedTimeout = setTimeout(function() 
		{
			if (orderbook.lastUpdatedDFD != false)
			{
				orderbook.lastUpdatedDFD.resolve(false);
				//orderbook.lastUpdatedDFD = false;
			}
		}, 1000)
		
		return this.lastUpdatedDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.clearUpdatedTimeout = function()
	{
		if (this.lastUpdatedDFD)
		{
			clearTimeout(this.lastUpdatedTimeout);
			this.lastUpdatedDFD.resolve(true);
			this.lastUpdatedDFD = false;
		}
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
