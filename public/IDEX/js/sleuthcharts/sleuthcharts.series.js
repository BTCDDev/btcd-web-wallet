

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthcharts = (function(Sleuthcharts) 
{
	
	Sleuthcharts.seriesTypes = {};
	
	
	
	
	var SeriesTab = Sleuthcharts.SeriesTab = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	SeriesTab.prototype = 
	{
		init: function(series, index)
		{
			var seriesTab = this;
			seriesTab.series = series;
			
			seriesTab.index = index;
			
			seriesTab.seriesTabDOM;
			seriesTab.seriesTabCloseDOM;
			seriesTab.seriesTabTitleDOM;
			

			seriesTab.initDOM();
			seriesTab.initEventListeners();
		},
		
		
		initDOM: function()
		{
			var seriesTab = this;
			var series = seriesTab.series;
			var chart = series.chart;
			var index = seriesTab.index;
			
			seriesTab.seriesTabDOM = $($("#series_tab_template").html());
			seriesTab.seriesTabTitleDOM = seriesTab.seriesTabDOM.find(".series-tab-title span");
			seriesTab.seriesTabCloseDOM = seriesTab.seriesTabDOM.find(".series-tab-close");
			seriesTab.seriesTabSettingsDOM = seriesTab.seriesTabDOM.find(".series-tab-settings");
			
			var seriesTypeTitle = series.seriesType == "column" ? "Volume" : series.seriesType;
			seriesTab.seriesTabTitleDOM.text(seriesTypeTitle);
			
			if (series.isMainSeries)
			{
				seriesTab.seriesTabDOM.addClass("main-series-tab");
			}
			
			chart.node.append(seriesTab.seriesTabDOM);
		},
		
		
		
		initEventListeners: function()
		{
			var seriesTab = this;
			
			seriesTab.seriesTabSettingsDOM.on("click", function(e)
			{
				seriesTab.openSeriesSettings(e);
			})
			
			seriesTab.seriesTabCloseDOM.on("click", function()
			{
				seriesTab.removeSeries();
			})
			
		},
		
		
		
		openSeriesSettings: function(e)
		{
			var seriesTab = this;
			var series = seriesTab.series;
			var isClose = $(e.target).hasClass("series-tab-close");
			
			if (!isClose)
			{
				//console.log('open settings');
			}
		},
		
		
		
		removeSeries: function()
		{
			var seriesTab = this;
			var series = seriesTab.series;
			var chart = series.chart;
			var yAxis = series.yAxis;
			
			var removeHeight = yAxis.fullHeight;

			chart.series.splice(series.index, 1);
			chart.yAxis.splice(yAxis.index, 1);
			chart.axes = chart.xAxis.concat(chart.yAxis);
			
			var numYAxis = chart.yAxis.length;
			var heightPortion = removeHeight/numYAxis;

	
			for (var i = 0; i < chart.yAxis.length; i++)
			{
				var loopYAxis = chart.yAxis[i];;

				loopYAxis.fullHeight = (loopYAxis.fullHeight + heightPortion);
				loopYAxis.height = loopYAxis.fullHeight - (loopYAxis.padding.top + loopYAxis.padding.bottom);
			}

			seriesTab.seriesTabDOM.remove();
			
			Sleuthcharts.updateArrayIndex(chart.series);
			Sleuthcharts.updateArrayIndex(chart.yAxis);
			
			chart.redraw();
		},
		
		
		
		updatePositions: function()
		{
			var seriesTab = this;
			var series = seriesTab.series;
			var yAxis = series.yAxis;
			var xAxis = series.xAxis;
			
			seriesTab.seriesTabDOM.css("left", 0);
			seriesTab.seriesTabDOM.css("top", (yAxis.pos.top - yAxis.padding.top) + 3);
		}
	}

	
	
	
	var Series = Sleuthcharts.Series = function()
	{
		//this.init.apply(this, arguments)
	}
	
	Series.prototype = 
	{

		//defaultOptions: Sleuthcharts.defaultOptions.series
		
		
		init: function(chart, userOptions)
		{
			var series = this;
			series.chart = chart;
			
			
			series.seriesType = userOptions.seriesType;
			series.index = userOptions.index;
			series.isMainSeries = series.index == 0;
			series.usesMainData = series.seriesType == "column";
			


			series.yAxis = chart.yAxis[series.index];
			series.xAxis = chart.xAxis[0];
			series.yAxis.series = series;
			series.xAxis.series = series;

			series.isResizingSeries = false;
			series.height = 0;
			series.width = 0;
			
			
			series.positions = new Sleuthcharts.Positions();
			series.padding = new Sleuthcharts.Padding();
			series.padding = Sleuthcharts.extend(series.padding, userOptions.padding);
			
			series.seriesTab = new Sleuthcharts.SeriesTab(series, series.index);
			series.seriesTab.updatePositions();
			
			if (series.seriesType == "indicator")
			{
				var indSettings = userOptions.indicatorSettings || {};
				var marketSettings = chart.marketHandler.marketSettings || {};
				series.marketHandler = new Sleuthcharts.MarketHandler(chart, marketSettings);
				series.marketHandler.series = series;
				series.marketHandler.indicatorSettings = indSettings;
				series.seriesTab.seriesTabTitleDOM.text(indSettings.icode);
			}
			
		},
		
		
		
		getSeriesData: function()
		{
			var dfd = new $.Deferred();
			var series = this;
			var chart = series.chart;
			
			var isMain = series.isMainSeries
			
			if (isMain)
			{
				chart.marketHandler.getMarketData().done(function()
				{
					dfd.resolve();
				}).fail(function()
				{
					dfd.reject();
				})
			}
			else
			{
				if (series.usesMainData)
				{
					dfd.resolve();
				}
				
				else
				{
					series.marketHandler.getSeriesData().done(function()
					{
						dfd.resolve();
					})
					
				}
			}
			
			return dfd.promise();

		},	
	}
	
	
	
	
	Sleuthcharts.seriesTypes.indicator = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "indicator",
		
		lineColor: "#FFB669",	//FFB669 D4F6FF
		
		closedHigherFill: "#39A033",
		closedHigherStroke: "#19B34C",
		closedLowerFill: "#9C0505",
		closedLowerStroke: "#D12E2E",

		
		
		drawPoints:function()
		{
			var series = this;
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			var ctx = chart.ctx;
			
			var allIndData = series.marketHandler.formattedData.inds;
			var allPoints = chart.allPoints;
			
			
			for (var i = 0; i < allIndData.length; i++)
			{
				var indDataObj = allIndData[i];
				var drawType = indDataObj.drawType;
				var indData = indDataObj.data;
				var visIndData = indData.slice(xAxis.minIndex, xAxis.maxIndex+1);

				//console.log([visIndData.length, allPoints.length]);
				
				if (drawType == "line")
				{
					//console.log(drawType);

					var positions = [];

					for (var j = 0; j < visIndData.length; j++)
					{
						var point = allPoints[j];
						var indPoint = visIndData[j];

						var pixel = Math.floor(yAxis.getPositionFromValue(indPoint));
						positions.push({"x":point.pos.middle, "y":pixel})
					}
					
					
					var lineFunc = d3.svg.line()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
						.interpolate("basis")
						

					var rawPath = lineFunc(positions);
					var d = rawPath.split(/(M|L|Z|C)+/);
					d = d.join(",");
					d = d.split(",");			

					if (d.length && !d[0].length)
					{
						d.shift();
					}
					
					//console.log(d);
					
					var pathStyle = {};
					pathStyle.strokeColor = series.lineColor;
					pathStyle.fillColor = "transparent";
					pathStyle.lineWidth = 1.5;
					
					Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				}
				
				else if (drawType == "column-middle")
				{
					for (var j = 0; j < visIndData.length; j++)
					{
						var point = allPoints[j];
						var indPoint = visIndData[j];

						
						var topPos = yAxis.getPositionFromValue(indPoint);
						var height = yAxis.pos.bottom - topPos;
						var middlePos = yAxis.getPositionFromValue(0);
						
						var strokeColor = indPoint >= 0 ? series.closedHigherStroke : series.closedLowerStroke;
						var fillColor = indPoint >= 0 ? series.closedHigherFill : series.closedLowerFill;
						
						var d = 
						[
							"M", point.pos.left, topPos, 
							"L", point.pos.left, middlePos, 
							"L", point.pos.right, middlePos, 
							"L", point.pos.right, topPos, 
							"Z", 
						]

						var pathStyle = {};
						pathStyle.strokeColor = strokeColor;
						pathStyle.fillColor = fillColor;
						
						Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
					}
				}
				
			}
		},
		
	})
	
	
	
	Sleuthcharts.seriesTypes.candlestick = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "candlestick",
		
		closedHigherFill: "transparent",
		closedHigherStroke: "#19B34C", //49c143 btcw 19B34C
		closedLowerFill: "#990F0F", //990F0F btcw 9C0505
		closedLowerStroke: "#D12E2E",

		
		drawPoints: function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			var ctx = chart.ctx;

			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var pointWidth = xAxis.pointWidth;
			

			
			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var closedHigher = phase.close > phase.open;
				
				var strokeColor = closedHigher ? series.closedHigherStroke : series.closedLowerStroke;
				var fillColor = closedHigher ? series.closedHigherFill : series.closedLowerFill;
				
				var topBody = pos.topBody;
				var bottomBody = pos.bottomBody;
				
				if (pointWidth <= 2 && closedHigher)
				{
					fillColor = "transparent"
				}
				if (pointWidth <= 2)
				{
					//topBody = pos.topLeg;
					//bottomBody = pos.bottomLeg;
				}
	
				if (bottomBody - topBody < 1)
				{
					bottomBody += 0.5;
					topBody -= 0.5;
				}
				
				
				var leftPos = pos.left;
				var rightPos = pos.right;

				/*if (isFullOdd)
				{
					var leftPos = pos.left + 0.5;
					var rightPos = pos.right - 0.5;
				}
				else
				{
					var leftPos = pos.left;
					var rightPos = pos.right;
				}*/
				

				
				
				var d = 
				[
					"M", leftPos, topBody, 
					"L", leftPos, bottomBody, 
					"L", rightPos, bottomBody, 
					"L", rightPos, topBody, 
					"Z", 
					"M", pos.middle, bottomBody, 
					"L", pos.middle, pos.bottomLeg, 
					"M", pos.middle, topBody, 
					"L", pos.middle, pos.topLeg
				];
				
				var pathStyle = {};
				pathStyle.strokeColor = strokeColor;
				pathStyle.fillColor = fillColor;

				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				

			}
			
			
		},
		
		
		
	
	})
	
	
	Sleuthcharts.seriesTypes.ohlc = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "ohlc",

	
		drawPoints:function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var pointWidth = xAxis.pointWidth;
			
			var ctx = chart.ctx;

	
			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var closedHigher = phase.close > phase.open;
				
				
				var topBody = pos.topBody;
				var bottomBody = pos.bottomBody;
				

				if (pointWidth <= 2)
				{
					topBody = pos.topLeg;
					bottomBody = pos.bottomLeg;
				}
			
				var openPos = closedHigher ? pos.bottomBody : pos.topBody
				var closePos = closedHigher ? pos.topBody : pos.bottomBody
				var leftPos = (pos.left - 0.5) - (xAxis.pointPadding/2)
				var rightPos = (pos.right + 0.5) + (xAxis.pointPadding/2)

				var strokeColor = "#66CCCC";
				var fillColor = "transparent";
				
				var d = 
				[
					"M", leftPos, openPos, 
					"L", pos.middle, openPos, 
					"M", pos.middle, pos.bottomLeg, 
					"L", pos.middle, openPos, 
					"M", pos.middle, pos.topLeg, 
					"L", pos.middle, openPos, 
					"M", rightPos, closePos, 
					"L", pos.middle, closePos 
				];
				
				var pathStyle = {};
				pathStyle.strokeColor = strokeColor;
				pathStyle.fillColor = fillColor;
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				
			}
			

			
		},
	
	})
	
	
	
	Sleuthcharts.seriesTypes.column = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "column",
		
		closedHigherFill: "transparent",
		closedHigherStroke: "#19B34C",
		closedLowerFill: "#990F0F",
		closedLowerStroke: "#D12E2E",	

	
		drawPoints:function()
		{
			var dn = Date.now()

			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var pointWidth = xAxis.pointWidth;
			
			var ctx = chart.ctx;

			
			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var volTop = Math.floor(yAxis.getPositionFromValue(phase.vol)) + 0.5;;
				var volHeight = yAxis.pos.bottom - volTop;
				
				var closedHigher = phase.close > phase.open;
				
				var strokeColor = closedHigher ? series.closedHigherStroke : series.closedLowerStroke;
				var fillColor = closedHigher ? series.closedHigherFill : series.closedLowerFill;
				
				var d = 
				[
					"M", pos.left, volTop, 
					"L", pos.left, yAxis.pos.bottom, 
					"L", pos.right, yAxis.pos.bottom, 
					"L", pos.right, volTop, 
					"Z", 
				]

				var pathStyle = {};
				pathStyle.strokeColor = strokeColor;
				pathStyle.fillColor = fillColor;
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
			}
			

		},
	
	})
	
	
	Sleuthcharts.seriesTypes.line = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "line",
		
		lineColor: "#D4F6FF",
		
		
		drawPoints:function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var ctx = chart.ctx;
			
			var positions = [];

			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var price = phase.close;
				var pixel = Math.floor(yAxis.getPositionFromValue(price));
				positions.push({"x":pos.middle, "y":pixel})
			}
			
			
			var lineFunc = d3.svg.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
				.interpolate("basis")
				

			var rawPath = lineFunc(positions);
			var d = rawPath.split(/(M|L|Z|C)+/);
			d = d.join(",");
			d = d.split(",");			

			if (d.length && !d[0].length)
			{
				d.shift();
			}
			
			//console.log(d);
			
			var pathStyle = {};
			pathStyle.strokeColor = series.lineColor;
			pathStyle.fillColor = "transparent";
			pathStyle.lineWidth = 1.5;
			
			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
	})
	
	
	Sleuthcharts.seriesTypes.area = Sleuthcharts.extendClass(Series, 
	{
		seriesType: "area",
		fillColor: "#425A70",
		lineColor: "#6797c5",
		
		drawPoints:function()
		{
			var series = this;
			
			var chart = series.chart;
			var xAxis = series.xAxis;
			var yAxis = series.yAxis;
			var ctx = chart.ctx;
			
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			
			var positions = [];

			for (var i = 0; i < allPointsLength; i++)
			{
				var point = allPoints[i];
				var phase = point.phase;
				var pos = point.pos;
				
				var price = phase.close;
				var pixel = Math.floor(yAxis.getPositionFromValue(price));
				positions.push({"x":pos.middle, "y":pixel})
			}
			
				
				
			var area = d3.svg.area()
				.x(function(d) { return d.x; })
				.y0(yAxis.pos.bottom)
				.y1(function(d) { return d.y; })
				.interpolate("basis");
				
			var rawAreaPath = area(positions);
			var areaPath = rawAreaPath.split(/(M|L|Z|C)+/);
			areaPath = areaPath.join(",");
			areaPath = areaPath.split(",");	
			
			
			if (areaPath.length && !areaPath[0].length)
			{
				areaPath.shift();
			}
			
			//console.log(areaPath);
			
			var areaPathStyle = {};
			areaPathStyle.strokeColor = "transparent";
			areaPathStyle.fillColor = series.fillColor;
			areaPathStyle.fillOpacity = 0.7;
			areaPathStyle.strokeWidth = 0;
			
					
			
			
			var lineFunc = d3.svg.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
				.interpolate("basis")
				
					
			var rawLinePath = lineFunc(positions);
			var linePath = rawLinePath.split(/(M|L|Z|C)+/);
			linePath = linePath.join(",");
			linePath = linePath.split(",");	
			
			
			if (linePath.length && !linePath[0].length)
			{
				linePath.shift();
			}
			
			//console.log(linePath);
			
			var linePathStyle = {};
			linePathStyle.strokeColor = series.lineColor;
			linePathStyle.fillColor = "transparent";
			linePathStyle.lineWidth = 1.5;
			
			
			
			Sleuthcharts.drawCanvasPath(ctx, linePath, linePathStyle);
			Sleuthcharts.drawCanvasPath(ctx, areaPath, areaPathStyle);
		

		},
		
	})
	
	

		

	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));


