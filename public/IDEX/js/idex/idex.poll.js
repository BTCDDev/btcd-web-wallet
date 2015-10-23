


var IDEX = (function(IDEX, $, undefined) 
{

	IDEX.OK = 0;
	IDEX.AJAX_FAILED = 1;
	IDEX.TIMEOUT_CLEARED = 2;
	IDEX.AJAX_ABORT = 3;
	
	

	IDEX.PollHandler = function(pollInterval, getDataFunc, pollCallback, $lastUpdatedDOM)
	{
		var pollHandler = this;
	
		
		pollHandler.counter = false;
		pollHandler.isStoppingPolling = false;
		pollHandler.isWaitingForData = false;
		
		pollHandler.lastUpdatedDFD = false;
		pollHandler.timeoutDFD = false;
		pollHandler.timeout;
		pollHandler.lastUpdatedTimeout
		
		pollHandler.pollInterval = pollInterval;
		
		pollHandler.getDataFunc = getDataFunc;
		pollHandler.pollCallback = pollCallback;
		pollHandler.lastUpdatedDOM = $lastUpdatedDOM;
	}


	
	IDEX.PollHandler.prototype.poll = function(pollInterval)
	{
		var pollHandler = this;
		
		pollHandler.getWatchlistData(pollInterval).done(function(data, errorLevel)
		{
			var continuePolling = pollHandler.pollCallback(data, errorLevel);
			
			if (continuePolling)
			{
				if (!(pollHandler.isStoppingPolling))
					pollHandler.poll(pollHandler.pollInterval);
			}
		})
	}
	
	
	IDEX.PollHandler.prototype.getWatchlistData = function(timeout)
	{
		var pollHandler = this;
		var retDFD = new $.Deferred();
		
		pollHandler.counter = true;
		pollHandler.lastUpdatedHandler(0);
		//orderbook.orderbox.updateOrderBoxBalance();

		pollHandler.setTimeout(timeout).done(function(wasCleared)
		{
			if (wasCleared)
			{
				pollHandler.counter = false;
				pollHandler.clearUpdatedTimeout()
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				var dfds = pollHandler.getDataFunc();
				pollHandler.isWaitingForData = true;		

				$.when.apply($, dfds).done(function(data)
				{
					pollHandler.counter = false;
					pollHandler.clearUpdatedTimeout();
					
					pollHandler.isWaitingForData = false;		

					if (data == "fail")
					{
						retDFD.resolve({}, IDEX.AJAX_ERROR);
					}
					else if (pollHandler.isStoppingPolling)
					{
						retDFD.resolve({}, IDEX.AJAX_ABORT);
					}
					else
					{
						retDFD.resolve(data, IDEX.OK);
					}
				}).fail(function()
				{
					pollHandler.isWaitingForData = false;
					retDFD.resolve({}, IDEX.AJAX_ERROR);
				});
				
			}
		})

		return retDFD.promise();
	}
	
	

	
	IDEX.PollHandler.prototype.stopPolling = function(callback)
	{
		var pollHandler = this;
		
		if (pollHandler.isWaitingForData) 
		{
			console.log(pollHandler.isWaitingForData);
			pollHandler.isStoppingPolling = true;
			
			setTimeout(function()
			{ 
				pollHandler.stopPolling(callback);
			}, 100);
			
			return false;
		}
		
		pollHandler.clearTimeout();
		pollHandler.isStoppingPolling = false;
		
		if (callback)
			callback();
	}
	


	IDEX.PollHandler.prototype.setTimeout = function(timeout)
	{
		var pollHandler = this;
		pollHandler.timeoutDFD = new $.Deferred();
		
		pollHandler.timeout = setTimeout(function() 
		{
			pollHandler.timeoutDFD.resolve(false);
			
		}, timeout);
		
		return pollHandler.timeoutDFD.promise();
	}
	
	
	
	IDEX.PollHandler.prototype.clearTimeout = function()
	{
		var pollHandler = this;

		if (pollHandler.timeoutDFD)
		{
			clearTimeout(pollHandler.timeout);
			pollHandler.timeoutDFD.resolve(true);
			pollHandler.timeoutDFD = false;
		}
	}
	
	
	
	IDEX.PollHandler.prototype.lastUpdatedHandler = function(seconds)
	{
		var pollHandler = this;

		pollHandler.lastUpdatedCounter().done(function()
		{			
			if (pollHandler.counter)
			{
				seconds++;
				
				if (pollHandler.isWaitingForData)
					var text = String(seconds) + "s...";
				else
					var text = String(seconds) + "s";
				
				if (pollHandler.lastUpdatedDOM)
					pollHandler.lastUpdatedDOM.text(text);
				
				pollHandler.lastUpdatedHandler(seconds);
			}
			else
			{
				var text = "0s";
				
				if (pollHandler.lastUpdatedDOM)
					pollHandler.lastUpdatedDOM.text(text);
			}
		})
	}
	
	
	IDEX.PollHandler.prototype.lastUpdatedCounter = function()
	{
		var pollHandler = this;
		pollHandler.lastUpdatedDFD = new $.Deferred();
		
		pollHandler.lastUpdatedTimeout = setTimeout(function() 
		{
			if (pollHandler.lastUpdatedDFD != false)
			{
				pollHandler.lastUpdatedDFD.resolve(false);
				//orderbook.lastUpdatedDFD = false;
			}
		}, 1000)
		
		return this.lastUpdatedDFD.promise();
	}
	
	
	IDEX.PollHandler.prototype.clearUpdatedTimeout = function()
	{
		var pollHandler = this;
		
		if (pollHandler.lastUpdatedDFD)
		{
			clearTimeout(pollHandler.lastUpdatedTimeout);
			pollHandler.lastUpdatedDFD.resolve(true);
			pollHandler.lastUpdatedDFD = false;
		}
	}
	


	return IDEX;
	
	
}(IDEX || {}, jQuery));
