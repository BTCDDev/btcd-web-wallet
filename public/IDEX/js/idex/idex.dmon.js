

var IDEX = (function(IDEX, $, undefined)
{
	
	
	IDEX.DMonOverlord = function()
	{
		var dMonOverlord = this;
		dMonOverlord.dMons = [];
	}

	
	IDEX.DMonOverlord.prototype.pingSuperNET = function()
	{
		var dfd = new $.Deferred();
		var params = {"method":"openorders","allorders":1};
		//params = {"method":"balance","exchange":"bittrex"}
		//params = {"method":"allexchanges"}
		//params = {"method":"tradehistory"}

		IDEX.sendPost(params, false).done(function(data)
		{
			dfd.resolve()
			
		}).fail(function()
		{
			dfd.reject()
		})
		
		return dfd.promise()
	}
	

	
	
	IDEX.DMonOverlord.prototype.pingNXT = function()
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"getState"};
		
		IDEX.sendPost(params, true).done(function(data)
		{
			console.log(data);
			dfd.resolve()
			
		}).fail(function()
		{
			dfd.reject()
		})
		
		return dfd.promise()
	}
	


	return IDEX;
		

}(IDEX || {}, jQuery));


