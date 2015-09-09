var Sleuthcharts = {};


Sleuthcharts = (function(Sleuthcharts) 
{
	
	Sleuthcharts.allCharts = [];
	
	
	$.fn.sleuthcharts = function () 
	{
		var args = arguments;
		var options;
		var ret;
		var chart;
		
		
		if (this[0]) 
		{


			options = args[0];

			// Create the chart
			if (typeof options !== "undefined") 
			{
				//console.log(options);
				chart = new Sleuthcharts.Chart(options);
				ret = chart;
			}

			if (typeof options === "undefined") 
			{
				var index = $(this).attr('data-sleuthcharts');
				ret = Sleuthcharts.allCharts[index];
			}
		}
		
		return ret;
	};
	
	
	
	Sleuthcharts.getChart = function($node)
	{
		var allCharts = this.allCharts;
		var len = allCharts.length;
		var ret = false;
		
		for (var i = 0; i < len; i++)
		{
			var chart = allCharts[i];
			
			if (chart.node.is($node))
			{
				ret = chart;
				break;
			}
		}
		
		return ret;
	};
	

	
	var Chart = Sleuthcharts.Chart = function()
	{
		this.init.apply(this, arguments)
	}
	
	Chart.prototype = 
	{
		
		init: function(userOptions)
		{
			
			var chart = this;
			chart.prevHeight = -1;
			chart.prevWidth = -1;
			chart.userOptions = userOptions;
			chart.chartOptions = userOptions.chart;
			
			chart.node = chart.userOptions.chart.node;
			chart.pointInfoDOM = chart.node.find(".chart-marketInfo");
			
			chart.initCanvas();
			
			
			chart.allPoints = [];
			chart.visiblePhases = [];
			chart.DOMPosition = {};
			chart.padding = new Sleuthcharts.Padding();
			chart.padding = Sleuthcharts.extend(chart.padding, chart.chartOptions.padding);
			
			chart.isDragging = false;
			chart.isCrosshair = true;
			chart.prevIndex = -2;
			chart.needsResize = false;
			chart.hasRenderedOnce = false;
			
			
			chart.DOMEventHandler;
			chart.marketHandler
			chart.series = [];
			chart.axes = [];
			chart.xAxis = [];
			chart.yAxis = [];
							
			
			chart.setContainerSize();
			chart.initMarketHandler();
			chart.initAxes();
			chart.initSeries();
			chart.initDOMEventHandler();


			chart.node.attr("data-sleuthcharts", Sleuthcharts.allCharts.length)

			Sleuthcharts.allCharts.push(chart);
			
			var load = "marketSettings" in chart.userOptions;
			
			if (load)
			{
				//chart.updateChart();
			}
			
			return chart;
		},
		
		
		
		getAllSeriesData: function()
		{
			var dfd = new $.Deferred();
			var chart = this;
			var allSeries = chart.series;
			var len = allSeries.length;
			
			chart.getAllSeriesDataLoop(0, function(ret)
			{
				if (ret)
					dfd.resolve();
				else
					dfd.reject();
			})
			
			return dfd.promise();
		},
		
		
		getAllSeriesDataLoop: function(index, callback)
		{
			var chart = this;
			var allSeries = chart.series;
			var len = allSeries.length;
			var series = allSeries[index];
			
			series.getSeriesData().done(function()
			{
				if (index == len - 1)
				{
					callback(true);
				}
				else
				{
					chart.getAllSeriesDataLoop(index + 1, callback)
				}
			}).fail(function()
			{
				callback(false);
			})
			
		},
		
		
		
		initCanvas: function()
		{
			var chart = this;
			
			var canvas = document.createElement('canvas');
			canvas.width = chart.node.width();
			canvas.height = chart.node.height();
			canvas.style.position = "absolute";
			canvas.style.top = 0;
			canvas.style.left = 0;
			//canvas.style.zIndex = 2;
			
			chart.node.append(canvas);

			chart.canvas = canvas;
			chart.canvasJQ = $(canvas);
			chart.ctx = canvas.getContext("2d");
			chart.ctx.translate(0.5, 0.5);
			
			
			var infoCanvas = document.createElement('canvas');
			infoCanvas.width = chart.node.width();
			infoCanvas.height = chart.node.height();
			infoCanvas.style.position = "absolute";
			infoCanvas.style.top = 0;
			infoCanvas.style.left = 0;
			
			
			chart.node.append(infoCanvas);

			chart.infoCanvas = infoCanvas;
			chart.infoCTX = infoCanvas.getContext("2d");
			chart.infoCTX.translate(0.5, 0.5);
			
			
			var crosshairCanvas = document.createElement('canvas');
			crosshairCanvas.width = chart.node.width();
			crosshairCanvas.height = chart.node.height();
			crosshairCanvas.style.position = "absolute";
			crosshairCanvas.style.top = 0;
			crosshairCanvas.style.left = 0;
			
			
			chart.node.append(crosshairCanvas);

			chart.crosshairCanvas = crosshairCanvas;
			chart.crosshairCTX = crosshairCanvas.getContext("2d");
			chart.crosshairCTX.translate(0.5, 0.5);
		},
		
		
		
		initMarketHandler: function()
		{
			var chart = this;
			var marketSettings = chart.userOptions.marketSettings || {};			
			var marketHandler = new Sleuthcharts.MarketHandler(chart, marketSettings);
			chart.marketHandler = marketHandler;
		},
		
	
		
		initSeries: function()
		{
			var chart = this;
			var seriesOptions = chart.userOptions.series;
			
			for (var i = 0; i < seriesOptions.length; i++)
			{
				var opt = seriesOptions[i];
				opt.index = i;
				var seriesType = opt.seriesType;
				var seriesClass = Sleuthcharts.seriesTypes[seriesType];
				var series = new seriesClass();
				series.init(chart, opt);
				chart.series.push(series);
			}
		},
		
		
		
		initAxes: function()
		{
			var chart = this;
			var xAxisOptions = chart.userOptions.xAxis;
			var yAxisOptions = chart.userOptions.yAxis;
			
			for (var i = 0; i < xAxisOptions.length; i++)
			{
				var opt = xAxisOptions[i];
				opt.isXAxis = true;
				opt.index = i;
				
				var axis = new Sleuthcharts.Axis(chart, opt)
				chart.xAxis.push(axis)

			}
			
			for (var i = 0; i < yAxisOptions.length; i++)
			{
				var opt = yAxisOptions[i];
				opt.isXAxis = false;
				opt.index = i;
				
				var axis = new Sleuthcharts.Axis(chart, opt)
				chart.yAxis.push(axis)
			}
			
			chart.axes = chart.xAxis.concat(chart.yAxis);
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].initAxisHeightWidth();
			}
			
		},
		
		
		
		initDOMEventHandler: function()
		{
			var chart = this;
			var DOMEventHandler = new Sleuthcharts.DOMEventHandler(chart);
			DOMEventHandler.setDOMEvents();
			
			chart.DOMEventHandler = DOMEventHandler;
		},
		
		
		
		setContainerSize: function()
		{
			var chart = this;
			var chartPadding = chart.padding;
			var $chartNode = chart.node;
			
			var temp = "plotHeight" in chart;
			
			if ("plotHeight" in chart)
			{
				chart.prevHeight = chart.plotHeight;
				chart.prevWidth = chart.plotWidth;
			}
			
			
			//console.log(chart.canvas.getBoundingClientRect());

			var $copied_elem = chart.canvasJQ.clone()
							  .attr("id", false)
							  .css({visibility:"hidden", display:"block", 
									   position:"absolute"});
			$("body").append($copied_elem);
			
			var DOMPosition = Sleuthcharts.getDOMPosition($copied_elem);
			$copied_elem.remove();

			chart.DOMPosition = DOMPosition;
			
			chart.plotTop = DOMPosition.top + chartPadding.top;
			chart.plotBottom = DOMPosition.bottom - chartPadding.bottom;
			chart.plotLeft = DOMPosition.left + chartPadding.left;
			chart.plotRight = DOMPosition.right - chartPadding.right;
			
			chart.plotHeight = chart.plotBottom - chart.plotTop;
			chart.plotWidth = chart.plotRight - chart.plotLeft;
			

			var height = chart.node.height();
			var width = chart.node.width();

			
			chart.canvas.height = height;
			chart.canvas.width = width;
			chart.infoCanvas.height = height;
			chart.infoCanvas.width = width;
			chart.crosshairCanvas.height = height;
			chart.crosshairCanvas.width = width;
			
			/*if (chart.prevHeight <= 0)
				chart.prevHeight = chart.plotHeight
			
			if (chart.prevWidth <= 0)
				chart.prevWidth = chart.plotWidth;*/
			

			//chart.canvas.height = DOMPosition.height;
			//chart.canvas.width = DOMPosition.width;
		},
		
		
		
		addSeries: function(settings)
		{			
			var chart = this;
			var seriesOptions = chart.userOptions.series;

			var addedHeightInit = settings.yAxis.heightInit;
			
			var addedHeightPerc = parseFloat(addedHeightInit);

			var numYAxis = chart.yAxis.length;
			//var running = 0 + ((addedHeightPerc/100) * chart.plotHeight)
			//console.log(running);
			
			for (var i = 0; i < chart.yAxis.length; i++)
			{
				var loopYAxis = chart.yAxis[i];
				
				var minus = (loopYAxis.fullHeight * (addedHeightPerc / 100))
				loopYAxis.fullHeight = loopYAxis.fullHeight - minus;
				loopYAxis.height = loopYAxis.fullHeight - (loopYAxis.padding.top + loopYAxis.padding.bottom);
				
				//running += (loopYAxis.fullHeight - minus);
				//console.log(loopYAxis.fullHeight - minus)
				//console.log(running)
			}
			
			//console.log(running);
			var yAxisOptions = settings.yAxis;
			yAxisOptions.isXAxis = false;
			yAxisOptions.index = chart.yAxis.length;
			
			var axis = new Sleuthcharts.Axis(chart, yAxisOptions);
			chart.yAxis.push(axis);
			
			//axis.initAxisHeightWidth();
			axis.fullHeight = ((addedHeightPerc/100) * (chart.plotHeight - chart.xAxis[0].fullHeight));
			axis.height = axis.fullHeight - (axis.padding.top + axis.padding.bottom);
			axis.width = chart.yAxis[0].width;
			axis.fullWidth = chart.yAxis[0].fullWidth;
			
			chart.axes = chart.xAxis.concat(chart.yAxis);

			
			var seriesOptions = settings.series;
			seriesOptions.index = chart.series.length;
			var seriesType = seriesOptions.seriesType;
			var seriesClass = Sleuthcharts.seriesTypes[seriesType];
			
			var series = new seriesClass();
			series.init(chart, seriesOptions);
			chart.series.push(series);
	
	
			chart.updateChart().done(function()
			{
				//chart.redraw();
			})
			
		},
		
		
		
		updateChart: function()
		{
			var dfd = new $.Deferred();
			var chart = this;
			var marketHandler = chart.marketHandler;
			
			chart.toggleLoading(true);
			chart.editLoading();
			chart.prevIndex = -2;


			chart.ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

			chart.getAllSeriesData().done(function()
			{
				var tempSeries = chart.series[0];
				
				chart.resizeAxis();
				chart.setContainerSize();
				chart.updateAxisPos();
				
				chart.drawMarketName();

				tempSeries.setDefaultMarketDataRange();
				tempSeries.getPointPositions();
				
				chart.equalizeYAxisWidth();
				
				chart.resizeAxis();
				chart.updateAxisPos();
				
				tempSeries.setDefaultMarketDataRange();
				tempSeries.getPointPositions();
								
				//chart.updateAxisMinMax(chart.visiblePhases, chart.xAxis[0].minIndex, chart.xAxis[0].maxIndex);

				chart.updateAxisTicks();
				chart.drawAxisLines();
				
				for (var i = 0; i < chart.series.length; i++)
				{
					var series = chart.series[i];
					series.drawPoints();
					series.seriesTab.updatePositions();

				}
				
				//chart.drawBothInds();


				
				chart.hasRenderedOnce = true;
				chart.toggleLoading(false);
				
				dfd.resolve();
				
				//highLowPrice(chart);
				
			}).fail(function()
			{
				chart.editLoading("Error loading market " + marketHandler.marketSettings.market.marketName);
			})
			
			
			
			return dfd.promise()
		},
		
		

		
		redraw: function()
		{
			var chart = this;
			
			chart.ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

			if (chart.hasRenderedOnce)
			{
				var tempSeries = chart.series[0];
				
				chart.setContainerSize();
				
				chart.resizeAxis();
				chart.setContainerSize();

				chart.updateAxisPos();
				chart.recalcPointWidth(); //hack
				tempSeries.getPointPositions();
				
				chart.equalizeYAxisWidth();
				
				chart.resizeAxis();
				chart.updateAxisPos();
				chart.recalcPointWidth(); //hack
				tempSeries.getPointPositions();
				
				
				chart.updateAxisTicks();
				chart.drawAxisLines();
				
				for (var i = 0; i < chart.series.length; i++)
				{
					var series = chart.series[i];
					series.drawPoints();
					series.seriesTab.updatePositions();

				}
				

			}
			
		},
		
		
		
		recalcPointWidth: function()
		{
			var chart = this;
			var series = chart.series[0];
			var xAxis = chart.xAxis[0];
			
			var startIndex = xAxis.minIndex;
			var endIndex = xAxis.maxIndex;
			var visiblePhases = chart.visiblePhases;

			series.calcPointWidth();
		},
		
		
		
		equalizeYAxisWidth: function()
		{
			var chart = this;
			var allSeries = chart.series;
			var biggestWidth = 0;
			var oldw = chart.yAxis[0].fullWidth;
			
			for (var i = 0; i < allSeries.length; i++)
			{
				var yAxis = allSeries[i].yAxis;
				
				var paddedMax = yAxis.max + (yAxis.max * (yAxis.maxPadding))
				var paddedMin = yAxis.min - (yAxis.min * (yAxis.minPadding))
				
				var scale = d3.scale.linear()
				.domain([paddedMin, paddedMax])
				.range([yAxis.height, yAxis.pos.top])
				
				var tickVals = scale.ticks(yAxis.numTicks) //.map(o.tickFormat(8))
				
				
				var maxTextWidth = Sleuthcharts.getMaxTextWidth(tickVals, yAxis.labels.fontSize, yAxis.ctx)
				var textPadding = yAxis.labels.textPadding;
				var combinedWidth = maxTextWidth + (yAxis.tickLength * 2) + (textPadding * 2);
				var newAxisWidth = combinedWidth;

				biggestWidth = newAxisWidth > biggestWidth ? newAxisWidth : biggestWidth;
			}
			for (var i = 0; i < allSeries.length; i++)
			{
				var yAxis = allSeries[i].yAxis
				//yAxis.widthInit = biggestWidth
				yAxis.width = biggestWidth;
				yAxis.fullWidth = yAxis.width + yAxis.padding.left + yAxis.padding.right;
			}
			
			var xAxis = chart.xAxis[0];
			var diff = oldw - biggestWidth;
			xAxis.width = xAxis.width + diff;
			xAxis.fullWidth = xAxis.width + xAxis.padding.left + xAxis.padding.right;
		},
		
		
		
		shiftXAxis: function(shifts, direction)
		{
			var chart = this;
			var xAxis = chart.xAxis[0];
			var vis = [];
			var marketHandler = chart.marketHandler;
			var allPhases = marketHandler.marketData.ohlc;
			allPhasesLength = allPhases.length;

			
			shifts = direction ? shifts : shifts * -1;
			var startIndex = xAxis.minIndex;
			var endIndex = xAxis.maxIndex;

			
			
			if (direction == false)
			{
				if (startIndex > 0)
				{
					var diff = startIndex + shifts;
					var fixedShifts = diff < 0 ? diff : 0;
					fixedShifts = shifts - fixedShifts;
					var newStartIndex = startIndex + fixedShifts;
					var newEndIndex = endIndex + fixedShifts;
					vis = allPhases.slice(newStartIndex, newEndIndex+1);
				}
			}
			else
			{

				if (endIndex < allPhasesLength - 1)
				{
					var diff = endIndex + shifts;
					var fixedShifts = diff > allPhasesLength-1 ? diff - (allPhasesLength-1) : 0;
					fixedShifts = shifts - fixedShifts;
					var newStartIndex = startIndex + fixedShifts;
					var newEndIndex = endIndex + fixedShifts;
					vis = allPhases.slice(newStartIndex, newEndIndex+1);
				}
				/*else
				{
					var startIndex = xAxis.minIndex + shifts;
					var endIndex = xAxis.maxIndex;
					vis = allPhases.slice(startIndex, endIndex+1);
				}*/
			}


			if (vis.length)
			{
				var series = chart.series[0];

				//var allPhases = chart.marketHandler.marketData.ohlc;
				//visiblePhases = allPhases.slice(startIndex, endIndex);

				chart.visiblePhases = vis;
				series.updateAxisMinMax(newStartIndex, newEndIndex);
				series.calcPointWidth();
			}
		},
		
		
		
		zoomChart: function(isZoomOut)
		{
			var chart = this;
			var xAxis = chart.xAxis[0]
			
			var marketHandler = chart.marketHandler;
			var allPhases = marketHandler.marketData.ohlc;
			
			var curMax = xAxis.max;
			var curMin = xAxis.min;
			var dataMax = xAxis.dataMax;
			var dataMin = xAxis.dataMin;
			var diff = (curMax - curMin) / 10;
			   
			var newMax = curMax;
			
			if (isZoomOut)
				var newMin = (curMin-diff > dataMin) ? curMin-diff : dataMin;
			else
				var newMin = (curMin + diff < curMax) ? curMin + diff : curMin;
			
				
			var startIndex = 0;
			
			for (startIndex = 0; startIndex < allPhases.length; startIndex++)
			{
				var phase = allPhases[startIndex];
				
				if (phase.startTime >= newMin)
				{
					if (startIndex != 0)
						startIndex--;
					
					break;
				}
			}
			
			var endIndex = xAxis.maxIndex;
			

			var vis = allPhases.slice(startIndex, endIndex + 1);
			
			var series = chart.series[0];

			
			series.changeZoomState(isZoomOut);


			chart.redraw()
		},
		
		
		
		resizeAxis: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].resizeAxis();
			}
		},
		
		updateAxisPos: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].updateAxisPos();
			}
		},
		
		updateAxisTicks: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].makeAxis();
			}
		},
		
		drawAxisLines: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].drawAxisLines();
			}
		},
		
		
	
		isInsidePlot: function(mouseX, mouseY)
		{
			var chart = this;
			
			var isInsideX = mouseX > chart.plotLeft && mouseX < chart.plotRight;
			var isInsideY = mouseY > chart.plotTop && mouseY < chart.plotBottom;
			
			var isInside = isInsideX && isInsideY;
			
			return isInside
		},
		
		
		
		getPoint: function(points, value) 
		{
			var chart = this;
			var val = null;

			if (value >= points[points.length-1].pos.left)
			{
				val = points[points.length-1]
			}
			else if (value <= points[0].pos.left)
			{
				val = points[0]
			}
			else
			{
				for (var i = 0; i < points.length; i++) 
				{
					point = points[i]
					if ( point.pos.left >= value) 
					{
						val = points[i-1]
						break;
					}
				}
			}
			
			return val;
		},
		
	

		toggleLoading: function(isLoading)
		{
			var chart = this;
			var $node  = chart.node;
			var $loading = $node.find(".chart-loading");
			
			if (isLoading)
			{
				$loading.show();
			}
			else
			{
				$loading.hide()
			}
		},
		
		
		
		editLoading: function(text)
		{
			var chart = this;
			var $node  = chart.node;
			var $loading = $node.find(".chart-loading");
			
			text = typeof text === "undefined" ? "Loading..." : text;
			$loading.find("span").text(text);
		},
		
		
		
		drawMarketName: function()
		{
			var chart = this;
			var marketHandler = chart.marketHandler;
			var marketSettings = marketHandler.marketSettings;
			
			var pair = marketSettings.market.marketName;
			var exchange = marketSettings.exchange;
			
			var $el = chart.node.find(".chart-marketName span");
			
			$el.text(pair.toUpperCase() + " - " + exchange.toUpperCase());
		},
		
		
		
		drawMarketInfo: function(closestPoint)
		{
			var chart = this;
			var $node = chart.node;

			var openStr = "O: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.open))
			var highStr = " H: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.high))
			var lowStr = " L: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.low))
			var closeStr = " C: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.close))
			var volStr = " V: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.vol))
			
			var str = ""
			str += openStr
			str += highStr
			str += lowStr
			str += closeStr
			str += volStr

			
			var $candleInfoWrap = chart.pointInfoDOM.find(".chart-candleInfo");
			var $candleInfoText = $candleInfoWrap.find("span");
			$candleInfoText.text(str);
			
			$candleInfoWrap.addClass("active");
		},
		
		
		
		drawCrosshairX: function(yPos)
		{
			var chart = this;
			var canvas = chart.crosshairCanvas
			var ctx = chart.crosshairCTX;
			
			if (!chart.isCrosshair)
				return;
			
			var lineLeft = chart.xAxis[0].pos.left;
			var lineRight = chart.yAxis[0].pos.left;
			
			//ctx.clearRect(0, 0, canvas.width, canvas.height);

			
			var d = 
			[
				"M", lineLeft, yPos + 0.5, 
				"L", lineRight, yPos + 0.5,  
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
		
		
		drawCrosshairY: function(closestPoint)
		{
			var chart = this;
			var canvas = chart.crosshairCanvas
			var ctx = chart.crosshairCTX;
			
			if (!chart.isCrosshair)
				return;
			
			
			var xAxis = chart.xAxis[0];
			var lineTop = 0;
			var lineBottom = chart.xAxis[0].pos.top;
			
			var d = 
			[
				"M", closestPoint.pos.middle, lineTop, 
				"L", closestPoint.pos.middle, lineBottom,  
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
		
		
		hideRenders: function()
		{
			var chart = this;
			
			var $candleInfoWrap = chart.pointInfoDOM.find(".chart-candleInfo");
			$candleInfoWrap.removeClass("active");
			
			chart.crosshairCTX.clearRect(0, 0, chart.crosshairCanvas.width, chart.crosshairCanvas.height);
			chart.infoCTX.clearRect(0, 0, chart.infoCanvas.width, chart.infoCanvas.height);
		}
		
	}
	
	

	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));



$(window).resize(function(e)
{	
	var prevWindowHeight = $(window).height();
	var prevWindowWidth = $(window).width();
	
	
	setTimeout(function()
	{
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		
		//console.log([prevWindowHeight, windowHeight])
		
		if (windowHeight != prevWindowHeight || windowWidth != prevWindowWidth)
		{

		}
		else
		{
			var allCharts = Sleuthcharts.allCharts;
			var len = allCharts.length;
			
			for (var i = 0; i < len; i++)
			{
				var chart = allCharts[i]

				var $chartNode = chart.node;
				var isVisible = $chartNode.is(":visible")

				if (!isVisible)
				{
					chart.needsResize = true;
				}
				else
				{
					chart.redraw();
				}
			}
		}
	}, 300)
})



