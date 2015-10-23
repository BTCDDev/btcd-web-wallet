

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthcharts = (function(Sleuthcharts) 
{
	
	var PlotHandler = Sleuthcharts.PlotHandler = function()
	{
		this.init.apply(this, arguments)
	}
	
	PlotHandler.prototype = 
	{
		
		init: function(chart)
		{
			var plotHandler = this;
			plotHandler.chart = chart;
		},
		
		
		
		setDefaultMarketDataRange: function()
		{
			var plotHandler = this;
			var chart = plotHandler.chart;
			var marketHandler = chart.marketHandler;
			var xAxis = chart.xAxis[0];
			
			var allPhases = marketHandler.marketData.ohlc;
			var allPhasesLength = allPhases.length;
			var range = xAxis.range;
			var minRange = xAxis.minRange
			
			var startIndex = (allPhasesLength > range) ? (allPhasesLength - range) : 0;
			var endIndex = allPhasesLength - 1;
			//plotHandler.visStartIndex = startIndex;
			//plotHandler.visEndIndex = endIndex;
			
			plotHandler.setVisiblePoints(startIndex, endIndex);
		},
		
		
		
		calcPointWidth: function()
		{
			var plotHandler = this;
			var chart = plotHandler.chart;
			var xAxis = chart.xAxis[0];
			
			var currentEndIndex = plotHandler.visEndIndex;
			var xAxisWidth = xAxis.width;
			var fullPointWidth = xAxis.fullPointWidth;

			var numPhases = Math.floor(xAxisWidth / fullPointWidth);			
			var newStartIndex = (currentEndIndex - numPhases) + 1
			var numMissingPoints = 0;
			
			if (newStartIndex < 0)
			{
				numMissingPoints = Math.abs(newStartIndex);
				newStartIndex = 0;
			}
			
			var missingPixelWidth = numMissingPoints * fullPointWidth;
			var realNumPhases = (currentEndIndex - newStartIndex) + 1;			
			var pixelWidthUnder = (xAxisWidth - (realNumPhases * fullPointWidth)) - missingPixelWidth;

			xAxis.numPoints = Math.ceil(xAxisWidth / fullPointWidth);
			xAxis.pixelWidthUnder = pixelWidthUnder;
			xAxis.missingPixelWidth = missingPixelWidth;
			
			plotHandler.setVisiblePoints(newStartIndex, currentEndIndex);
		},
		
		
			
		setVisiblePoints: function(startIndex, endIndex)
		{
			var plotHandler = this;
			var chart = plotHandler.chart;
			var marketHandler = chart.marketHandler;
			var xAxis = chart.xAxis[0];
			var allPhases = marketHandler.marketData.ohlc;
			
			plotHandler.visStartIndex = startIndex;
			plotHandler.visEndIndex = endIndex;
			plotHandler.visiblePhases = allPhases.slice(startIndex, endIndex+1);
			chart.visiblePhases = plotHandler.visiblePhases;
			chart.updateAxisMinMax();			
		},
		
		
		getPointPositions: function()
		{
			var plotHandler = this;
			var chart = plotHandler.chart;
			var xAxis = chart.xAxis[0];
			var priceAxis = chart.yAxis[0];
			
			var xPos = Math.floor(xAxis.pos.left + xAxis.pixelWidthUnder);

			var phases = chart.visiblePhases;
			var phasesLength = phases.length;
			
			var fullPointWidth = xAxis.fullPointWidth;
			var pointWidth = xAxis.pointWidth;

			var allPoints = [];
			
			var isFullDec = fullPointWidth % 1 != 0;
			var isWidthDec = pointWidth % 1 != 0;
			var isFullOdd = pointWidth % 2 != 0;
			
			if (!isFullOdd)
				xPos += 0.5;

			for (var i = 0; i < phasesLength; i++)
			{
				var phase = phases[i];
				var closedHigher = phase.close > phase.open;
				
				var top = closedHigher ? phase.close : phase.open;
				var bottom = closedHigher ? phase.open : phase.close;
				
				var bottomBody = priceAxis.getPositionFromValue(bottom);
				var bottomLeg = priceAxis.getPositionFromValue(phase.low);
				var topBody = priceAxis.getPositionFromValue(top);
				var topLeg = priceAxis.getPositionFromValue(phase.high);
				
				
				var left = xPos;
				var right = left + pointWidth;
				var middle = (left + right) / 2;
				
				topBody = Math.floor(topBody) + 0.5;
				bottomBody = Math.floor(bottomBody) + 0.5;
				
				if (isFullOdd)
				{
					left += 0.5;
					right -= 0.5;
				}

				
				var positions = {};
				positions.left = left;
				positions.right = right;
				positions.middle = middle;
				positions.topLeg = topLeg;
				positions.topBody = topBody;
				positions.bottomBody = bottomBody;
				positions.bottomLeg = bottomLeg;

				allPoints.push({"phase":phase, "pos":positions});
				
				xPos += fullPointWidth;
			}
			
			
			chart.allPoints = allPoints;
		},
		
		
		
		
		changeZoomState: function(isZoomOut)
		{
			var plotHandler = this;
			var chart = plotHandler.chart;
			var xAxis = chart.xAxis[0];
			
			var currentEndIndex = plotHandler.visEndIndex;
			var xAxisWidth = xAxis.width;
			var allPhases = chart.marketHandler.marketData.ohlc;
			var zoomState = xAxis.fullPointWidth;

			var zoomStates = [2, 3, 4, 5, 6, 7, 10, 13, 15, 17, 20, 25, 30, 40, 50];
			var zoomIndex = zoomStates.indexOf(zoomState)
			var newIndex = isZoomOut ? zoomIndex - 1 : zoomIndex + 1;
			
			if (newIndex < 0 || (newIndex >= zoomStates.length))
			{
				return;
			}
			
			var fullPointWidth = zoomStates[newIndex];
			var numPhases = Math.floor(xAxisWidth / fullPointWidth);			
			var newStartIndex = (currentEndIndex - numPhases) + 1;
			var numMissingPoints = 0;
			
			if (newStartIndex < 0)
			{
				numMissingPoints = Math.abs(newStartIndex);
				newStartIndex = 0;
			}
			
			var missingPixelWidth = numMissingPoints * fullPointWidth;
			var realNumPhases = (currentEndIndex - newStartIndex) + 1;			
			var pixelWidthUnder = (xAxisWidth - (realNumPhases * fullPointWidth)) - missingPixelWidth;
			
			
			var pointPadding = 1;
			

			if (fullPointWidth >= 3) pointPadding = 2;
			if (fullPointWidth >= 6) pointPadding = 3;
			if (fullPointWidth >= 10) pointPadding = 4;
			if (fullPointWidth >= 15) pointPadding = 5;
			if (fullPointWidth >= 20) pointPadding = 6;
			if (fullPointWidth >= 30) pointPadding = 8;
			if (fullPointWidth >= 100) pointPadding = 20;
			
			var pointWidth = fullPointWidth - pointPadding;
			
	
			xAxis.fullPointWidth = fullPointWidth;
			xAxis.pointWidth = pointWidth;
			xAxis.pointPadding = pointPadding;
			xAxis.numPoints = Math.ceil(xAxisWidth / fullPointWidth);
			xAxis.pixelWidthUnder = pixelWidthUnder;
			xAxis.missingPixelWidth = missingPixelWidth;
			
			plotHandler.setVisiblePoints(newStartIndex, currentEndIndex);
		},
		
		
		
		shiftXAxis: function(shifts, direction)
		{
			var plotHandler = this;
			var chart = plotHandler.chart;
			var xAxis = chart.xAxis[0];
			var marketHandler = chart.marketHandler;
			
			var allPhases = marketHandler.marketData.ohlc;
			var allPhasesLength = allPhases.length;
			var currentStartIndex = plotHandler.visStartIndex;
			var currentEndIndex = plotHandler.visEndIndex;
			
			var toShift = false;
			var newStartIndex = -1;
			var newEndIndex = -1;
			shifts = direction ? shifts : shifts * -1;


			if (direction == false)
			{
				if (currentStartIndex > 0)
				{
					var diff = currentStartIndex + shifts;
					var fixedShifts = diff < 0 ? diff : 0;
					fixedShifts = shifts - fixedShifts;
					newStartIndex = currentStartIndex + fixedShifts;
					newEndIndex = currentEndIndex + fixedShifts;
					toShift = true;
				}
			}
			else
			{
				if (currentEndIndex < allPhasesLength - 1)
				{
					var diff = currentEndIndex + shifts;
					var fixedShifts = diff > allPhasesLength-1 ? diff - (allPhasesLength-1) : 0;
					fixedShifts = shifts - fixedShifts;
					newStartIndex = currentStartIndex + fixedShifts;
					newEndIndex = currentEndIndex + fixedShifts;
					toShift = true;
				}
			}


			if (toShift)
			{
				plotHandler.setVisiblePoints(newStartIndex, newEndIndex);
				plotHandler.calcPointWidth();
			}
		},
		
		

		getPoint: function(points, value) 
		{
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
					if (point.pos.left >= value) 
					{
						val = points[i-1];
						
						var firstDiff = Math.abs(value - val.pos.right);
						var secondDiff = Math.abs(value - point.pos.left);
						
						val = firstDiff <= secondDiff ? val : point;
						break;
					}
				}
			}
			
			return val;
		},
		
	
		
	}
	
	
	
	
	

	Sleuthcharts.getMinMax = function(phases, type)
	{
		var min = 0;
		var max = 0;
		
		for (var i = 0; i < phases.length; ++i)
		{
			var phase = phases[i];
			
			if (i == 0)
			{
				if (type)
				{
					min = phases[i].low;
					max = phases[i].high;
				}
				else
				{
					//min = phases[i].vol;
					max = phase.vol;
				}
			}
			else
			{
				if (type)
				{
					min = phase.low < min ? phase.low : min;
					max = phase.high > max ? phase.high : max;
				}
				else
				{
					//min = phases[i].vol < min ? phases[i].vol : min;
					max = phases[i].vol > max ? phases[i].vol : max;
				}
			}
		}
		
		return [min, max];
	}



	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));

