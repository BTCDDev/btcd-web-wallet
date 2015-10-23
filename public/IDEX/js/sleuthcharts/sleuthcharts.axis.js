

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthcharts = (function(Sleuthcharts) 
{
	
	var tickAttr = 
	{
		"stroke": "white",
		"stroke-width": 0.5
	};
	
	var gridLineAttr = 
	{
		"stroke": "#404040",
		"stroke-dasharray": "1,3",
		"stroke-width": 1
	};
	




	var Axis = Sleuthcharts.Axis = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	Axis.prototype = 
	{
		
		defaultXAxisOptions:
		{	
			//"heightInit":20,
			//"widthInit":"100%",
			
			"range":40,
			"minRange":40,
			
			"padding":{
				"top":0,
				"bottom":0,
				"left":0,
				"right":0,
			},
			
			"numTicks":8,
			"tickLength":4,
			"tickStep":6,

			"labels":{
				"fontSize":"12px",	
			},
		},
		
		defaultYAxisOptions:
		{
			
			"padding":
			{
				"top":0,
				"bottom":0,
				"left":0,
				"right":0,
			},
			
			"minPadding":0.05,
			"maxPadding":0.05,
			
			"numTicks":10,
			"tickLength":7,
			
			"labels":
			{
				"textPadding":5,
				"fontSize":"13px",
				"fontColor":"#8C8C8C",
			},
		},
		
		
		init: function(chart, options)
		{
			var axis = this;
			axis.chart = chart;
			axis.series;
			axis.options = options;
			

			
			axis.height = 0;
			axis.width = 0;
			
			axis.dataMin = 0;
			axis.dataMax = 0;
			axis.min = 0;
			axis.max = 0;
			axis.paddedMin = 0;
			axis.paddedMax = 0;
			
			axis.numTicks = 0;
			axis.tickLength = 0;
			axis.tickStep = 0;
			
			axis.ticks = [];
			
			
			axis.isXAxis = options.isXAxis;
			axis.index = options.index;
			
			axis.heightInit = options.heightInit;
			axis.widthInit = options.widthInit;
			
			axis.minPadding = options.minPadding || 0;
			axis.maxPadding = options.maxPadding || 0;
			
			axis.numTicks = options.numTicks;
			axis.tickLength = options.tickLength;
			
			axis.pos = new Sleuthcharts.Positions();
			axis.padding = new Sleuthcharts.Padding();
			axis.padding = Sleuthcharts.extend(axis.padding, options.padding);
			
			axis.labels = options.labels;
			
			if (axis.isXAxis)
			{
				axis.fullPointWidth = 10;
				axis.pointPadding = 4;
				axis.pointWidth = 6;
				axis.numPoints = 0;
				axis.pixelWidthUnder = 0;
				axis.missingPixelWidth = 0;
				axis.range = options.range;
				axis.minRange = options.minRange;
				
				axis.tickStep = options.tickStep;
			}
				
			axis.canvas = document.createElement('canvas');
			axis.ctx = axis.canvas.getContext("2d");
			axis.ctx.font = axis.labels.fontSize + " Monospace"; 
		},
		

		
		updateMinMax: function()
		{	
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;
			var marketHandler = chart.marketHandler;
			var allPhases = marketHandler.marketData.ohlc;
			var visiblePhases = chart.visiblePhases;
			
			if (isXAxis)
			{
				axis.dataMin = allPhases[0].startTime;
				axis.dataMax = allPhases[allPhases.length-1].startTime;

				axis.min = visiblePhases[0].startTime;
				axis.max = visiblePhases[visiblePhases.length-1].startTime;
			}
			else
			{
				if (axis.series.usesMainData || axis.series.isMainSeries)
				{
					var minMax = Sleuthcharts.getMinMax(visiblePhases, axis.index == 0);

					axis.min = minMax[0];
					axis.max = minMax[1];
				}
				else
				{
					axis.min = axis.series.marketHandler.formattedData.min;
					axis.max = axis.series.marketHandler.formattedData.max;
				}
			}
			
			axis.paddedMax = axis.max + (axis.max * (axis.maxPadding));
			axis.paddedMin = axis.min - (axis.min * (axis.minPadding));
		},
		

		
		initAxisHeightWidth: function()
		{
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;
			
			var wrapWidth = chart.plotWidth;
			var wrapHeight = chart.plotHeight;

			
			if (isXAxis)
			{
				var yAxis = chart.yAxis[0];
				
				var convertedHeight = Sleuthcharts.convertPercent(axis.heightInit, wrapHeight);
				
				var convertedWidth = Sleuthcharts.convertPercent("100%", wrapWidth);
				convertedWidth = convertedWidth - (50 + axis.padding.left + axis.padding.right);
			}
			else
			{
				var xAxis = chart.xAxis[0];
				var numYAxis = chart.yAxis.length;
				
				var convertedHeight = Sleuthcharts.convertPercent(axis.heightInit, wrapHeight);
				convertedHeight = (convertedHeight - (xAxis.fullHeight / numYAxis)) - (axis.padding.top + axis.padding.bottom);
				
				var convertedWidth = Sleuthcharts.convertPercent(axis.widthInit, wrapWidth);
			}

			
			axis.height = convertedHeight;
			axis.width = convertedWidth;
			axis.fullWidth = convertedWidth + axis.padding.left + axis.padding.right;
			axis.fullHeight = convertedHeight + axis.padding.top + axis.padding.bottom;
		},
		
		
		
		resizeAxis: function()
		{
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;

			var prevHeight = chart.prevHeight;
			var prevWidth = chart.prevWidth;
			var plotHeight = chart.plotHeight;
			var plotWidth = chart.plotWidth;
			var diffHeight = plotHeight - prevHeight;
			var diffWidth = plotWidth - prevWidth;
			
			
			if (!isXAxis)
			{
				var xAxis = chart.xAxis[0];
				axis.fullHeight = axis.fullHeight + ((axis.fullHeight / (prevHeight - xAxis.fullHeight)) * diffHeight);
				axis.height = axis.fullHeight - (axis.padding.top + axis.padding.bottom);
			}
			else
			{
				axis.fullWidth = axis.fullWidth + diffWidth;
				axis.width = axis.fullWidth - (axis.padding.left + axis.padding.right);
			}

		},
		
		
	
		updateAxisPos: function()
		{
			var axis = this;
			var chart = axis.chart;
			var chartPadding = chart.padding;
			var isXAxis = axis.isXAxis;
			
			if (isXAxis)
			{
				var chartPositions = chart.positions;
				var yAxis = chart.yAxis[chart.yAxis.length-1];
				axis.pos.top = (chartPositions.bottom - chartPositions.top) - axis.height;
				axis.pos.bottom = axis.pos.top + axis.height;
				
				//axis.pos.top = yAxis.pos.bottom + axis.padding.top;
				//axis.pos.bottom = axis.pos.top + axis.height;
				axis.pos.left = axis.padding.left + chartPadding.left;
				axis.pos.right = axis.pos.left + axis.width;
			}
			else
			{
				var xAxis = chart.xAxis[0];
				var axisIndex = axis.index;
				
				var leftAdd = xAxis.padding.left + xAxis.width;
				var topAdd = 0;
				
				if (axisIndex > 0)
				{
					var otherAxis = chart.yAxis[axisIndex-1];
					topAdd += otherAxis.pos.bottom;
				}
				
				axis.pos.top = axis.padding.top + topAdd + (chartPadding.top / chart.yAxis.length);
				axis.pos.bottom = axis.pos.top + axis.height;
				axis.pos.left = xAxis.fullWidth + chartPadding.left + axis.padding.left;
				axis.pos.right = axis.pos.left + axis.width;
			}			
		},
		
		
		
		makeAxis: function()
		{
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;
			
			var ticksLeft = [];
			var ticksRight = [];
			var labels = [];
			var gridLines = [];

			
			if (isXAxis)
			{
				var ticksDom = [];
				
				var ticks = axis.getXAxisTicks();
				var yPos = axis.pos.top;
				
				for (var i = 0; i < ticks.length; i++)
				{
					var tick = ticks[i];
					var xPos = tick.position;
					
					var label = {};
					label.text = Sleuthcharts.formatTime(new Date(tick.val))
					label.x = xPos
					label.y = yPos;
					labels.push(label);
					
					var tickDom = {};
					tickDom.x = xPos;
					tickDom.y = yPos;
					ticksDom.push(tickDom);
				}
				
			}
			else
			{
				var ticks = axis.getYAxisTicks();
				var xPos = axis.pos.left;

				for (var i = 0; i < ticks.length; i++)
				{	
					var tick = ticks[i];
					var yPos = tick.position + 0.5;
					var text = String(tick.val);
					
					var label = axis.calcLabelPosition(xPos, yPos, text)
					labels.push(label);
					
					var tickLeft = axis.calcLeftTickPosition(xPos, yPos);
					ticksLeft.push(tickLeft);
					
					var tickRight = axis.calcRightTickPosition(xPos, yPos);
					ticksRight.push(tickRight);
					
					var gridLine = axis.calcGridlinePosition(xPos, yPos);
					gridLines.push(gridLine);
				}
			}

			
	

			var canvas = chart.canvas;
			var ctx = chart.ctx;
			
			var tickLength = axis.tickLength;

			var tickPathStyle = {};
			tickPathStyle.strokeColor = "#8E909C";
			tickPathStyle.lineWidth = 0.5;
			
			var fontLabelAttr = {
				"fill": axis.labels.fontColor,
				"font-family": "Roboto",
				"font-size": axis.labels.fontSize
			}
			
			
			if (isXAxis)
			{
				for (var i = 0; i < labels.length; i++)
				{
					var label = labels[i];
					
					ctx.font = axis.labels.fontSize + " Roboto";
					ctx.fillStyle = axis.labels.fontColor;
					ctx.fillText(label.text, label.x - 20, label.y + 16);
				}
				
				for (var i = 0; i < ticksDom.length; i++)
				{
					var tickDom = ticksDom[i];
					var pathStyle = tickPathStyle;
					
					var d = 
					[
						"M", tickDom.x, tickDom.y, 
						"L", tickDom.x, tickDom.y + tickLength, 
					]
					
					Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				}

				//axis.ticks = [];
			}
			else
			{
				
				for (var i = 0; i < labels.length; i++)
				{
					var label = labels[i];
					
					ctx.font = axis.labels.fontSize + " Roboto";
					ctx.fillStyle = axis.labels.fontColor;
					ctx.fillText(label.text, label.x, label.y + 4);
				}

				
				for (var i = 0; i < ticksLeft.length; i++)
				{
					var tickLeft = ticksLeft[i];
					var pathStyle = tickPathStyle;
					
					var d = 
					[
						"M", tickLeft.x, tickLeft.y, 
						"L", tickLeft.x + tickLength, tickLeft.y, 
					]
					
					Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				}
				
				for (var i = 0; i < ticksRight.length; i++)
				{
					var tickRight = ticksRight[i];
					var pathStyle = tickPathStyle;
					
					var d = 
					[
						"M", tickRight.x, tickRight.y, 
						"L", tickRight.x - tickLength, tickRight.y, 
					]
					
					Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				}
				
				//return;
				for (var i = 0; i < gridLines.length; i++)
				{
					var gridLine = gridLines[i];
					var pathStyle = {};
					pathStyle.strokeColor = "#404040";
					pathStyle.lineWidth = "1";
					pathStyle.lineDash = [1,3];

					var d = 
					[
						"M", 0, gridLine.y, 
						"L", gridLine.x, gridLine.y, 
					]
					
					Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				}
			}
			
		},
		
		
		
		getXAxisTicks: function()
		{
			var axis = this;
			var chart = axis.chart;

			var tickStep = axis.tickStep;
			var tickStepStart = 0;
						
			var allPoints = chart.allPoints;
			var allPointsLength = allPoints.length;
			
			var ticks = axis.ticks;
			var ticksLength = ticks.length;
			
			var numTicks =  Math.floor(axis.width / tickStep);
			var tickJump = Math.floor(numTicks / axis.fullPointWidth);

			if (tickJump < 1)
				tickJump = 1
			

			//var a = axis.normalizeTimeTickInterval(chart.marketHandler.marketSettings.barWidth * 1000)
			//console.log(a);
			
			var index = -1;
				
			for (var i = 0; i < ticksLength; i++)
			{
				var tick = ticks[i];
				
				for (var j = 0; j < allPointsLength; j++)
				{
					var point = allPoints[j]
					
					if (point.phase.startTime == tick.val)
					{
						index = j;
						break;
					}
				}
				
				if (index != -1)
				{
					//tickStepStart = index % tickStep;
					tickStepStart = index - tickJump < 0 ? index : index - tickJump;

					break;
				}
			}
			
			
			ticks = [];
			axis.ticks = [];	
			
			var showTicks = [];

			if (tickStep >= allPointsLength)
			{
				var index = Math.floor((allPointsLength - 1) / 2);
				showTicks.push(allPoints[index]);
			}
			else
			{
				var tickStepPos = tickStepStart;	

				while (tickStepPos < allPointsLength)
				{
					showTicks.push(allPoints[tickStepPos]);
					tickStepPos += tickJump;
				}
			}
			
			for (var i = 0; i < showTicks.length; i++)
			{
				var showTick = showTicks[i];
				ticks.push({"position":showTick.pos.middle, "val":showTick.phase.startTime, "point":showTick})
			}
			
			axis.ticks = ticks;
			
			return ticks;
		

		},
		
		
		
		getYAxisTicks: function()
		{
			var axis = this;
			var ticks = [];
			
			var paddedMax = axis.paddedMax;
			var paddedMin = axis.paddedMin;
			
			var scale = d3.scale.linear()
			.domain([paddedMin, paddedMax])
			.range([axis.height, axis.pos.top])
			
			
			//var range = paddedMax - paddedMin
			//var tickInterval = range/4;
			//var mag = axis.getMagnitude(tickInterval);
			//console.log([tickInterval, mag]);
			//console.log(axis.norm(mag, tickInterval));
			
			var tickVals = scale.ticks(axis.numTicks) //.map(o.tickFormat(8))
							
			for (var i = 0; i < tickVals.length; i++)
			{
				var val = tickVals[i];
				val = Sleuthcharts.formatExponent(val);
				var position = axis.getPositionFromValue(val)
				
				ticks.push({"position":position, "val":val})
			}
			
			axis.ticks = ticks;

			
			return ticks;
		},
		

		
		
		calcLabelPosition: function(xPos, yPos, text)
		{
			var axis = this;
			var ticks = axis.ticks;
			var maxTextWidth = 0
			
			for (var i = 0; i < ticks.length; i++)
			{
				var loopText = String(Number(ticks[i].val.toPrecision(3)));
				var wid = axis.ctx.measureText(loopText).width;
				maxTextWidth = wid > maxTextWidth ? wid : maxTextWidth;
			}
			

			var label = {};
			
			var axisWidth = axis.width;
			var tickLength = axis.tickLength;
			var fixedTextPadding = axis.labels.textPadding
			
			var textWidth =  axis.ctx.measureText(text).width;
			var diff = maxTextWidth - textWidth 
			var shift = 0
			
			var wrapWidth = (tickLength * 2) + (fixedTextPadding * 2)
			var pad = ((axis.width - wrapWidth) / 2) - (maxTextWidth / 2)
			
			if (diff >= 1)
				shift = diff/2
			
			if (pad >= 0.5)
				shift += pad

			label.text = text;
			label.y = yPos;
			
			label.x = xPos + shift + fixedTextPadding + tickLength;
			
			return label;
		},
		
		
		
		calcLeftTickPosition: function(xPos, yPos)
		{
			var tick = {};
			
			tick.x = xPos;
			tick.y = yPos;
			
			return tick;
		},
	
		
		calcRightTickPosition: function(xPos, yPos)
		{
			var axis = this;
			var tickRight = {};
			
			tickRight.y = yPos;
			tickRight.x = xPos + axis.width;
			
			return tickRight;
		},
		
		
		calcGridlinePosition: function(xPos, yPos)
		{
			var gridLine = {};
			
			gridLine.y = yPos;
			gridLine.x = xPos;
			
			return gridLine;	
		},
		
		

		drawAxisLines: function()
		{
			var axis = this;
			var chart = axis.chart;
			var isXAxis = axis.isXAxis;
			var ctx = chart.ctx;
			
			var pathStyle = {};
			pathStyle.strokeColor = "#555555";
			pathStyle.lineWidth = 1;
			
			var bbox = chart.node[0].getBoundingClientRect()			
			

			var d = [];
			
			if (isXAxis)
			{
				d = 
				[
					"M", 0, axis.pos.top + 0.5, 
					"L", bbox.right, axis.pos.top + 0.5, 
				]
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				
				d = 
				[
					"M", 0, axis.pos.bottom + 0.5, 
					"L", bbox.right, axis.pos.bottom + 0.5, 
				]
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
			}
			else
			{
				d = 
				[
					"M", 0, axis.pos.bottom + 0.5, 
					"L", bbox.right, axis.pos.bottom + 0.5, 
				]
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
				
				d = 
				[
					"M", axis.pos.left + 0.5, 0, 
					"L", axis.pos.left + 0.5, axis.pos.bottom, 
				]
				
				Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
			}
		},
		
		
		
		drawYAxisFollow: function(mousePosY)
		{
			var axis = this;
			var chart = axis.chart;
			var canvas = chart.infoCanvas
			var ctx = chart.infoCTX;
			//ctx.clearRect(0, 0, canvas.width, canvas.height);
			

			var rightPos = axis.pos.right - 1;
			var leftPos = axis.pos.left;
			var topPos = mousePosY - 8;
			var bottomPos = topPos + 18;
			var yMiddlePos = topPos + ((bottomPos - topPos) / 2) + 0.5;
			var leftPosPad = leftPos + 7;
			
			
			var d = 
			[
				"M", rightPos, topPos, 
				"L", leftPosPad, topPos, 
				"L", leftPos, yMiddlePos, 
				"L", leftPosPad, bottomPos, 
				"L", rightPos, bottomPos, 
				"L", rightPos, topPos, 
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#D3D3D3";
			pathStyle.lineWidth = 1;
			pathStyle.fillColor = "black";

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
			
			
			
			var leftPos = axis.pos.left;
			var width = axis.width;
			
			var insideY = mousePosY - axis.pos.top;
			var val = axis.getValueFromPosition(insideY);
			val = Sleuthcharts.formatNumWidth(Number(val));
			
			var textWidth = axis.ctx.measureText(val).width;
			var move = (width - textWidth) / 2;
			

			ctx.font = "12px Roboto";
			ctx.fillStyle = "#D3D3D3";
			
			ctx.fillText(String(val), leftPos + move, mousePosY + 6);
			
		},
		
		
		
		drawTimeBox: function(mousePosX, time)
		{	
			var axis = this;
			var chart = axis.chart;
			var canvas = chart.infoCanvas
			var ctx = chart.infoCTX;
			time = Sleuthcharts.formatTime(new Date(time), true)

			
			var leftPos = mousePosX - 55;
			var rightPos = leftPos + 110;
			var topPos = axis.pos.top;
			var bottomPos = topPos + axis.height;
			
			var d = 
			[
				"M", leftPos, topPos, 
				"L", rightPos, topPos, 
				"L", rightPos, bottomPos, 
				"L", leftPos, bottomPos, 
				"Z"
			]
			
			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;
			pathStyle.fillColor = "black";

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
			
		
			
			ctx.font = "13px Roboto";
			ctx.fillStyle = "#D3D3D3";
			
			ctx.fillText(String(time), mousePosX - 37, topPos + 15);
		},
		
		
		getPositionFromValue: function(pointValue)
		{
			var axis = this;
			
			var paddedMax = axis.max + (axis.max * axis.maxPadding)
			var paddedMin = axis.min - (axis.min * axis.minPadding)

			var num = pointValue - paddedMin;
			var range = paddedMax - paddedMin;
			var ratio = num / range;
			var pos = Number((axis.pos.bottom - (ratio * axis.height)).toFixed(4));
			
			return pos
		},
		
		
		
		getValueFromPosition: function(pos)
		{
			var axis = this;
			
			var isXAxis = axis.isXAxis
			var paddedMax = axis.max + (axis.max * axis.maxPadding)
			var paddedMin = axis.min - (axis.min * axis.minPadding)
			
			
			var range = paddedMax - paddedMin;
			var ratio = isXAxis ? pos / axis.width : pos / axis.height;
			var num = ratio * range
			var val = isXAxis ? paddedMin + num : paddedMax - num

			return val
		},
		
		
	}
	
	
	
	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));





/*
		
		getMagnitude: function(num) 
		{
			return Math.pow(10, Math.floor(Math.log(num) / Math.LN10));
		},

		
		norm: function(magnitude, interval)
		{
			var retInterval;
			var multiples = [1, 2, 2.5, 5, 10];
			var preventExceed = false;

			//magnitude = pick(magnitude, 1);
			normalized = interval / magnitude;


			for (var i = 0; i < multiples.length; i++) 
			{
				retInterval = multiples[i];
				
				if ((preventExceed && retInterval * magnitude >= interval) || // only allow tick amounts smaller than natural
					(!preventExceed && (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2))) 
				{
					break;
				}
			}

			// multiply back to the correct magnitude
			retInterval *= magnitude;
			
			return retInterval;
		},
		



		// highcharts
		normalizeTimeTickInterval: function(tickInterval, unitsOption)
		{
			var timeUnits = 
			{
				millisecond: 1,
				second: 1000,
				minute: 60000,
				hour: 3600000,
				day: 24 * 3600000,
				week: 7 * 24 * 3600000,
				month: 28 * 24 * 3600000,
				year: 364 * 24 * 3600000
			};
			var units = unitsOption || 
			[[
					'millisecond', // unit name
					[1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
				], [
					'second',
					[1, 2, 5, 10, 15, 30]
				], [
					'minute',
					[1, 2, 5, 10, 15, 30]
				], [
					'hour',
					[1, 2, 3, 4, 6, 8, 12]
				], [
					'day',
					[1, 2]
				], [
					'week',
					[1, 2]
				], [
					'month',
					[1, 2, 3, 4, 6]
				], [
					'year',
					null
			]];
			
			var unit = units[units.length - 1];
			var interval = timeUnits[unit[0]];
			var multiples = unit[1];
			var count;
				
			// loop through the units to find the one that best fits the tickInterval
			for (i = 0; i < units.length; i++)
			{
				unit = units[i];
				interval = timeUnits[unit[0]];
				multiples = unit[1];


				if (units[i + 1])
				{
					// lessThan is in the middle between the highest multiple and the next unit.
					var lessThan = (interval * multiples[multiples.length - 1] +
								timeUnits[units[i + 1][0]]) / 2;

					// break and keep the current unit
					if (tickInterval <= lessThan)
						break;
				}
			}
			
			// prevent 2.5 years intervals, though 25, 250 etc. are allowed
			if (interval === timeUnits.year && tickInterval < 5 * interval)
			{
				multiples = [1, 2, 5];
			}

			return {unitRange: interval, unitName: unit[0]};
			// get the count
			/*count = normalizeTickInterval(
				tickInterval / interval, 
				multiples,
				unit[0] === 'year' ? Math.max(axis.getMagnitude(tickInterval / interval), 1) : 1 // #1913, #2360
			);
			
			return {
				unitRange: interval,
				count: count,
				unitName: unit[0]
			};*
		},
		


		
		normalizeTickInterval: function(interval, multiples, magnitude, allowDecimals, preventExceed)
		{
			var normalized;
			var i;
			var retInterval = interval;

			// round to a tenfold of 1, 2, 2.5 or 5
			magnitude = pick(magnitude, 1);
			normalized = interval / magnitude;

			// multiples for a linear scale
			if (!multiples) 
			{
				multiples = [1, 2, 2.5, 5, 10];

				// the allowDecimals option
				if (allowDecimals === false) 
				{
					if (magnitude === 1) 
					{
						multiples = [1, 2, 5, 10];
					} 
					else if (magnitude <= 0.1) 
					{
						multiples = [1 / magnitude];
					}
				}
			}

			// normalize the interval to the nearest multiple
			for (i = 0; i < multiples.length; i++) 
			{
				retInterval = multiples[i];
				
				if ((preventExceed && retInterval * magnitude >= interval) || // only allow tick amounts smaller than natural
					(!preventExceed && (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2))) 
				{
					break;
				}
			}

			// multiply back to the correct magnitude
			retInterval *= magnitude;
			
			return retInterval;
		},
*/

				