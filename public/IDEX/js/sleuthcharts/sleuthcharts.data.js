
// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthcharts = (function(Sleuthcharts) 
{
	var skynetKeys = {
		"startTime":0,
		"endTime":1,
		"open":3,
		"high":4,
		"low":5,
		"close":6,
		"vol":7
	}

	var skynetKeysTime = {
		"startTime":0,
		"endTime":1,
		"open":2,
		"high":3,
		"low":4,
		"close":5,
		"vol":6
	}

	
	Sleuthcharts.SkyNETParams = function(obj) 
	{
		this.baseurl = "http://api.finhive.com/v1.0/run.cgi?";
		//this.key = "9cf373ead4858e19bf93ae5ea238c4c796819cc883c877513f528b95721a1085";
		this.key = "beta_test";

		this.section = "";
		this.run = "";
		this.mode = "";
		this.exchg = "";
		this.pair = "";
		this.num = "";
		this.bars = "";
		this.len = "";
		
		Sleuthcharts.constructFromObject(this, obj);
	}


	Sleuthcharts.SkyNETParams.prototype.makeURL = function()
	{
		var arr = []
		for (key in this)
		{
			if (this.hasOwnProperty(key))
				if (key != "baseurl" && String(this[key]).length)
					arr.push(key+"="+this[key])
		}
		var s = arr.join("&")

		return this.baseurl+s
	}

	
	var MarketHandler = Sleuthcharts.MarketHandler = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	MarketHandler.prototype = 
	{
		
		init: function(chart, userOptions)
		{
			var marketHandler = this;
			marketHandler.marketSettings =
			{
				pair: "6932037131189568014_NXT",

				barType: "tick",
				barWidth: "25",

				exchange: "nxtae",

				isVirtual: false,
				isFlipped: false,
				market: {}
			};
			
			marketHandler.market = {};
			
			marketHandler.chart = chart;
			
			marketHandler.phases = [];
			marketHandler.tradeData = [];
			marketHandler.marketData = {};
			
			
			marketHandler.marketSettings = Sleuthcharts.extend(marketHandler.marketSettings, userOptions);
		},
		
		
		
		changeMarket: function(newMarket, exchange)
		{
			var marketHandler = this;
			var chart = marketHandler.chart;
			var settings = {};
			
			var isNxtAE = newMarket.isNxtAE;
			var pair = newMarket.pairID;
			var pairName = newMarket.marketName;

			var isFlipped = newMarket.exchangeSettings[exchange].skynetFlipped;
			
			if (isFlipped)
			{
				var both = pair.split("_");
				pair = both[1] + "_" + both[0];
			}
			
			marketHandler.market = newMarket;
			settings.pair = pair;
			settings.pairName = pairName;
			settings.exchange = exchange;
			settings.skynetFlipped = newMarket.skynetFlipped;
			
			marketHandler.marketSettings = Sleuthcharts.extend(marketHandler.marketSettings, settings);
			marketHandler.marketSettings.market = newMarket;
			chart.drawMarketName();
			//marketHandler.marketSettings = settings;
		},
		
		
		
		changeSettings: function(newSettings)
		{
			var marketHandler = this;
			var chart = marketHandler.chart;
			var settings = marketHandler.marketSettings;
			
			var configType = newSettings.configType;
			
			if (configType == "time")
			{
				settings.barType = newSettings.configVal;
				settings.barWidth = newSettings.val;
				chart.updateChart();
			}
			else if (configType == "charttype")
			{
				var opt = chart.userOptions.series[0];
				opt.seriesType = newSettings.configVal;
				opt.index = 0;
				var seriesType = opt.seriesType;
				var seriesClass = Sleuthcharts.seriesTypes[seriesType];
				var series = new seriesClass();
				series.init(chart, opt);
				chart.series[0] = series;
				chart.redraw();
			}
			else if (configType == "depth")
			{
				chart.yAxis[0].minPadding = newSettings.configVal;
				chart.yAxis[0].maxPadding = newSettings.configVal;
				chart.redraw();
			}
			else if (configType == "indicator")
			{
				return;
				
				var indicatorType = newSettings.configVal;

			}
		},
		
		
		
		

		
		getMarketData: function()
		{
			var marketHandler = this;
			var dfd = new $.Deferred();
			
			var isTime = marketHandler.marketSettings.barType == "time";

			marketHandler.getSkynetMarketData().done(function(data)
			{
				if ("results" in data)
				{
					data = data.results;
					
					if (!data.length)
					{
						dfd.reject();
					}
					else
					{
						marketHandler.formatMarketData(data, isTime);
						//var formattedData = marketHandler.marketData;

						dfd.resolve();
					}
				}
				else
				{
					marketHandler.formatMarketData([], isTime);
					dfd.resolve();
				}
			
			}).fail(function(data)
			{
				dfd.reject(data);
			})
		
			
			return dfd.promise();
		},
		
		
		
		getSeriesData: function()
		{
			var marketHandler = this;
			var dfd = new $.Deferred();
			var series = marketHandler.series;
			
			
			marketHandler.getSkynetIndicatorData().done(function(data)
			{
				data = data.results.data;
				var formattedData = marketHandler.formatIndicatorData(data);
				marketHandler.formattedData = formattedData;
				
				dfd.resolve(formattedData);
			});

			return dfd.promise();
		},
		
		
		
		
		
		getSkynetMarketData: function()
		{
			var dfd = new $.Deferred();
			var marketHandler = this;
			
			var settings = marketHandler.marketSettings;
			
			var obj = {}
			obj.run = "quotes";
			obj.section = "crypto";
			obj.mode = "bars";
			obj.exchg = settings.exchange;
			obj.pair = settings.pair
			obj.num = "500"
			obj.bars = settings.barType
			obj.len = settings.barWidth
			obj.order = "asc"
			

			var params = new Sleuthcharts.SkyNETParams(obj)
			var url = params.makeURL()

			$.getJSON(url, function(data)
			{
				dfd.resolve(data)	
			}).fail(function(data)
			{
				dfd.reject(data);
			})
			
			return dfd.promise()
		},
		
		
		
		formatIndicatorData: function(rawData)
		{
			var marketHandler = this;
			var icode = marketHandler.indicatorSettings.icode;
			
			var formattedData = {};
			var inds = [];
			
			if (icode == "storsi")
			{
				var obj = {};
				obj.drawType = "line";
				obj.data = rawData;
				
				formattedData.max = 100;
				formattedData.min = 0;
				
				inds.push(obj);
				
				//obj.max = Math.max.apply(Math, obj.data);
				//obj.min = Math.max.apply(Math, obj.data);
				
			}
			else if (icode == "macd")
			{
				var obj = {};
				
				obj.data = rawData.macd;
				obj.drawType = "column-middle";
				
				inds.push(obj);
				
				obj = {};
				
				obj.data = rawData.signal;
				obj.drawType = "line";
				
				inds.push(obj);
				
				var all = marketHandler.getAll(inds);
				
				formattedData.max = Math.max.apply(Math, all);
				formattedData.min = Math.min.apply(Math, all);

			}
			
			
			formattedData.inds = inds;
			
			return formattedData;
			
		},
		
		
		getAll: function(arr)
		{
			var all = [];
			for (var i = 0; i < arr.length; i++)
			{
				all = all.concat(arr[i].data);
			}
			return all;
		},
		
		
		getMinMax: function(arr)
		{
			var min = 0;
			var max = 0;
			
			for (var i = 0; i < arr.length; i++)
			{
				var point = arr[i];
				
				min = point > min ? point : min;
			}
			
		},
		
		
		
		getSkynetIndicatorData: function()
		{
			var dfd = new $.Deferred();
			
			var marketHandler = this;
			var settings = marketHandler.marketSettings;
			var indSettings = marketHandler.indicatorSettings;
			
			//var indCode = "storsi";
			//var indType = "cl";
			//var indLen = 14;
			
			//http://api.finhive.com/v1.0/run.cgi?section=crypto&run=indicator&exchg=coinbase&pair=btc_usd&bars=tick&len=1000&icode=ind_storsi&ion=cl&ilen=14&inum=100&iret=solo&key=beta_test
			
			//var iret = (indSettings.type == "bollin") ? "solo" : "merge";

	
			var obj = {}
			obj.run = "indicator";
			obj.section = "crypto";
			obj.mode = "bars";
			obj.exchg = settings.exchange;
			obj.pair = settings.pair
			obj.num = "500"
			obj.bars = settings.barType
			obj.len = settings.barWidth
			obj.order = "asc"
			
			obj.icode = "ind_" + indSettings.icode;
			obj.ion = indSettings.ion;
			obj.ilen = indSettings.ilen;
			obj.inum = "500"
			obj.iret = "solo";
			obj.order = "asc";

			var params = new Sleuthcharts.SkyNETParams(obj)
			var url = params.makeURL()
			//console.log(url)
			
			$.getJSON(url, function(data)
			{
				//console.log(data);
				dfd.resolve(data)	
			})
			
			return dfd.promise()
		},
		

		
		
		formatMarketData: function(data, isTime)
		{
			var marketHandler = this;
			
			var ohlc = [];
			var volume = [];
			var dataLength = data.length;
			
			var keys = isTime ? skynetKeysTime : skynetKeys;

			
			for (var i = 0; i < dataLength; i++) 
			{
				var obj = {}
				
				for (key in keys)
				{
					obj[key] = data[i][keys[key]]
				}

				obj.startTime *= 1000;
				obj.endTime *= 1000;
				
				
				ohlc.push(obj)
				volume.push({x:obj.startTime, y:obj.vol});
			}

			marketHandler.marketData.ohlc = ohlc;
			marketHandler.marketData.volume = volume;
		}
		
	}

	
	
	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));





/*



function fixSpikes()
{
	if (i != 0 && (obj['high'] > ohlc[ohlc.length-1].close * 5 ))
	{
		console.log('no')
		point = data[i-1]
		
		obj = {}
		
		for (key in keys)
		{
			obj[key] = data[i-1][keys[key]]
		}
		
		obj = ohlc[ohlc.length-1]
		
	}
}

function invert()
{
	data[i][keys[0]] =  Number((1 / close).toFixed(6))
	data[i][keys[1]] =  Number((1 / low).toFixed(6))
	data[i][keys[2]] =  Number((1 / high).toFixed(6))
	data[i][keys[3]] =  Number((1 / open).toFixed(6))
	data[i][keys[4]] =  Number((close * vol).toFixed(6))

	data[i] = ((i!= 0) && (data[i][keys[2]] < data[i-1][keys[2]]/5)) ? data[i-1] : data[i] // spike
	
		var startTime = data[i][keys['start']] * 1000;
		var endTime = data[i][keys['end']] * 1000;
		var open = data[i][keys['open']]
		var high = data[i][keys['high']]
		var low = data[i][keys['low']]
		var close = data[i][keys['close']]
		var vol = data[i][keys['volume']]
	
}
*/

