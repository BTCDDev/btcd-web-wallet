

var IDEX = (function(IDEX, $, undefined) 
{
	

	var nxtURL = "http://127.0.0.1:8080/nxt";
	var snURL = "http://127.0.0.1:8080/IDEXsupernet";
	var strURL = "http://127.0.0.1:8080/IDEXsupernet";
	
	var lastTime = new Date().getTime();
	var q = [];
	
	
	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;

		var time = new Date().getTime()
		var waitTime = 0;

		lastTime = time

		if (time - lastTime < 300)
			waitTime = 300 + (q.length * 300)
		
		if (!isNXT)
		{
			url = snURL;
            params.plugin = "InstantDEX";
		}
		else
		{
			params.plugin = "nxt";
		}
		
		var ajaxSettings = 
		{
			type: "POST",
			url: url,
			data: params,
			contentType: 'application/x-www-form-urlencoded',
			xhrFields: {
				withCredentials: true
			},
		};
		
		
		var obj = {}
		obj.ajaxSettings = ajaxSettings;
		obj.callback = callback;
		obj.dfd = dfd;
		obj.params = params;
		q.push(obj)

		if (isNXT)
			waitTime = 0;

		setTimeout(function()
		{
			var xhr = $.ajax(ajaxSettings);
			
			xhr.done(function(data)
			{
                if (typeof data == "string")
				{
					try
					{
						data = (JSON.parse(data));
					}
					catch(e)
					{
						data = {};
					}
				}				

				dfd.resolve(data);
				
				if (callback)
					callback(data);
				
				q.pop();
			})
			
			xhr.fail(function(data)
			{	
				dfd.reject(data);
				
				if (callback)
					callback(data);
				
				q.pop();
			})
			
		}, waitTime)
		
		
		return dfd.promise();
	}

	/*

	var isWindows = window.jscd.os == "Windows";
	
	if (isWindows)
	{
		var nxtURL = "http://127.0.0.1:7777/nxt.cgi";
		var snURL = "http://127.0.0.1:7777/InstantDEX.cgi";
		var strURL = "http://127.0.0.1:7777/stringified.cgi";
	}
	else
	{
		var nxtURL = "http://127.0.0.1:7876/nxt";
		var snURL = "http://127.0.0.1:7777/InstantDEX";
		var strURL = "http://127.0.0.1:7777/stringified";
		var sleuthURL = "http://127.0.0.1:9728";
	}
	
	var lastTime = new Date().getTime();
	var q = [];

	
	
	

	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;

		var time = new Date().getTime()
		var waitTime = 0;

		lastTime = time

		if (time - lastTime < 300)
			waitTime = 300 + (q.length * 300)

		
		if (!isNXT)
		{
			params = {"stringified":params}
			params = JSON.stringify(params);
			url = strURL;
		}

		var ajaxSettings = 
		{
			type: "POST",
			url: url,
			data: params,
			contentType: 'application/x-www-form-urlencoded',
			xhrFields: {
				withCredentials: true
			},
		};
		
		
		var obj = {}
		obj.ajaxSettings = ajaxSettings;
		obj.callback = callback;
		obj.dfd = dfd;
		obj.params = params;
		q.push(obj)

		if (isNXT)
			waitTime =0;

		setTimeout(function()
		{
			var xhr = $.ajax(ajaxSettings);
			
			xhr.done(function(data)
			{
                if (typeof data == "string")
				{
					try
					{
						data = $.parseJSON(data);
					}
					catch(e)
					{
						data = {};
					}
				}				

				dfd.resolve(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			xhr.fail(function(data)
			{
				console.log(data);
				if (data.statusText == "abort")
				{

				}
				
				dfd.reject(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			
			
		}, waitTime)
		
		return dfd.promise()
	}

	*/
	
	IDEX.sendSkynetPost = function(params) 
	{
		var dfd = new $.Deferred();
		var url = "http://api.finhive.com/v1.0/run.cgi";


		var ajaxSettings = 
		{
			type: "POST",
			url: url,
			data: JSON.stringify(params),
			contentType: 'application/json'
		};
		

		var xhr = $.ajax(ajaxSettings);
		
		xhr.done(function(data)
		{
			//console.log(data);
			dfd.resolve(data);

		})
		
		xhr.fail(function(data)
		{
			//console.log(data);
			dfd.reject(data);
		})

		return dfd.promise()
	}
	

	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));


