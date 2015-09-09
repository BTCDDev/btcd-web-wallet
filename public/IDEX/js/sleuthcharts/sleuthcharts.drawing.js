


var IDEX = (function(IDEX, $, undefined) 
{   

		/*
		this.isCrosshair = true;
		this.isDrawing = false;
		this.isDrawingLine = false;
		this.isFib = false;
		this.isFibDrawing = false;
		
		this.drawFib = [];
		
		this.drawingLine;
		this.drawPoints = [];
		this.curDrawPoint = [];
		*/
		
		//var $drawingGroup = $(node).find(".drawingLines");
		//$drawingGroup.empty();


	$("#main_grid").on("click", ".chart-tools-crosshair", function()
	{
		var $wrap = $(this).closest(".chart-header");
		var node = $wrap.attr("data-chart");
		
		var chart = IDEX.allcharts[node];
		var settings = chart.settings;
		var sleuthchart = chart.sleuthchart	
		
		sleuthchart.isFib = false
		sleuthchart.isDrawing = false
		sleuthchart.isCrosshair = true;
	})
	

	$("#main_grid").on("click", ".chart-tools-line", function()
	{
		var $wrap = $(this).closest(".chart-header");
		var node = $wrap.attr("data-chart");
		
		var chart = IDEX.allcharts[node];
		var settings = chart.settings;
		var sleuthchart = chart.sleuthchart	
		
		sleuthchart.isCrosshair = false
		sleuthchart.isFib = false
		sleuthchart.isDrawing = true

	})	
	
	
	$("#main_grid").on("click", ".chart-tools-fib", function()
	{
		var $wrap = $(this).closest(".chart-header");
		var node = $wrap.attr("data-chart");
		
		var chart = IDEX.allcharts[node];
		var settings = chart.settings;
		var sleuthchart = chart.sleuthchart	
		
		sleuthchart.isCrosshair = false
		sleuthchart.isDrawing = false
		sleuthchart.isFib = true

	})	


	
	IDEX.addDrawing = function(chart)
	{
		$(chart.node).on("contextmenu", function(e)
		{
			return false;
		})
		
		
		$(chart.node).on("mousedown", function(e)
		{
			if (e.which == 3)
			{
				e.preventDefault();
				IDEX.cMousedownRight(chart, e);
			}
			else
			{
				if (chart.isFib)
					IDEX.cMousedownFib(chart, e);
				else
					IDEX.cMousedown(chart, e);

			}
		});
		
		$(chart.node).on("mousemove", function(e)
		{
			if (chart.isFib)
				IDEX.cMousemoveFib(chart, e);
			else
				IDEX.cMousemove(chart, e);

		});
		
		$(chart.node).on("mouseup", function(e)
		{
			IDEX.cMouseup(chart, e);
		});
	}
	
	
	IDEX.cMousemoveFib = function(chart, e) 
	{
		if (chart.isFib)
		{
			var node = chart.node
			var mouseX = e.pageX
			var mouseY = e.pageY
			var offsetX = $(node).offset().left;
			var offsetY = $(node).offset().top;
			var insideX = mouseX - offsetX
			var insideY = mouseY - offsetY
			
			var xAxis = chart.xAxis[0];
			var priceAxis = chart.yAxis[0];
			
			var height = xAxis.pos['bottom'];
			var width = priceAxis.pos['left'];

			
			if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
			{
				if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom)
				{
					var insidePriceY = insideY - priceAxis.pos.top

					var $drawingGroup = $(node).find(".fibLines");
					$drawingGroup.empty();
					
					var svg = d3.select($drawingGroup.get()[0])
					
					var lineAttr = {
						"stroke-width": 1.5,
						"stroke": "#999999"
					}
					
					if (chart.isFibDrawing)
					{
						var startPoint = chart.drawFib[0];
						
						var startY = startPoint.y;
						var endY = insideY;
						
						if (Math.abs(startY - endY) > 80)
						{
				
							var fibs = getFib(startY, endY);
				
							for (var i = 0; i < fibs.length; i++)
							{
								var fib = fibs[i]
								var price = chart.yAxis[0].getPriceFromY(fib - priceAxis.pos.top)
								
								//console.log(fib)
								//console.log(price)
								
								svg.append("line")
								.attr("x1", xAxis.pos['left'])
								.attr("y1", fib)
								.attr("x2", priceAxis.pos['left'])
								.attr("y2", fib)
								.attr(lineAttr);

							}
						}
					}
				}
				
			}
			
		}
		
	}
	
	function getFib(startY, endY)
	{
		var fibs = [];
		
		var nums = [23.6, 38.2, 50, 61.8, 78.6]
		
		var range = Math.abs(endY - startY);
		
		fibs.push(startY)
		for (var i = 0; i < nums.length; i++)
		{
			var num = nums[i]/100;
			var fib = startY + (range * num)
			fibs.push(fib)
		}
		fibs.push(endY)
		
		return fibs;
	}
	
	
	IDEX.cMousedownFib = function(chart, e)
	{		
		if (chart.isFib)
		{
			var node = chart.node
			var mouseX = e.pageX
			var mouseY = e.pageY
			var offsetX = $(node).offset().left;
			var offsetY = $(node).offset().top;
			var insideX = mouseX - offsetX
			var insideY = mouseY - offsetY
		
			var xAxis = chart.xAxis[0];
			var priceAxis = chart.yAxis[0];
			
			var height = xAxis.pos['bottom'];
			var width = priceAxis.pos['left'];

			
			if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
			{
				if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom)
				{
					var insidePriceY = insideY - priceAxis.pos.top

					var $drawingGroup = $(node).find(".fibLines");
					var svg = d3.select($drawingGroup.get()[0])
					
					var lineAttr = {
						"stroke-width": 1.5,
						"stroke": "#999999"
					}
					
				
					var obj = {};
					//obj.price = chart.yAxis[0].getPriceFromY(closestPoint.pos[key])
					//obj.price = tempKey(key, closestPoint.phase)
					//obj.time = closestPoint.phase.startTime
					//obj.x = closestPoint.pos.middle;
					obj.y = insideY
					
					var points = chart.drawFib;
					var len = chart.drawFib.length;
					
					if (len == 1)
					{
						chart.isFibDrawing = false;
						
						chart.drawFib.push(obj);
						chart.drawFib = [];
					}
					else
					{
						chart.isFibDrawing = true;
						chart.drawFib.push(obj)
						//console.log(chart.drawFib)
						//console.log(e)
						
						/*chart.drawingLine = svg.append("line")
						.attr("x1", closestPoint.pos.middle)
						.attr("y1", closestPoint.pos[key])
						.attr("x2", closestPoint.pos.middle)
						.attr("y2", closestPoint.pos[key])
						.attr(lineAttr);*/
						
					}
				}
				
			}
		}
	}
	
	IDEX.cMousedownRight = function(chart, e)
	{
		
		var $drawingGroup = $(chart.node).find(".drawingLines");
		var len = $drawingGroup.children().length
		
		console.log(len)
		
		//var svg = d3.select($drawingGroup.get()[0])
	}

	
	//$("chartwrap").mousedown(function(){
	IDEX.cMousedown = function(chart, e)
	{
		if (chart.isDrawing)
		{
			var node = chart.node
			var mouseX = e.pageX
			var mouseY = e.pageY
			var offsetX = $(node).offset().left;
			var offsetY = $(node).offset().top;
			var insideX = mouseX - offsetX
			var insideY = mouseY - offsetY
		
			var xAxis = chart.xAxis[0];
			var priceAxis = chart.yAxis[0];
			
			var height = xAxis.pos['bottom'];
			var width = priceAxis.pos['left'];

			
			
			if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
			{
				if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom)
				{
					var insidePriceY = insideY - priceAxis.pos.top

					var $drawingGroup = $(node).find(".drawingLines");
					var svg = d3.select($drawingGroup.get()[0])
					
					var lineAttr = {
						"stroke-width": 1.5,
						"stroke": "#999999"
					}
					
					
					var closestPoint = IDEX.getPoint(chart.pointData, insideX)
					var key = getClosestYPos(closestPoint.pos, insideY);
					
					var obj = {}
					//obj.price = chart.yAxis[0].getPriceFromY(closestPoint.pos[key])
					obj.price = tempKey(key, closestPoint.phase)
					obj.time = closestPoint.phase.startTime
					obj.x = closestPoint.pos.middle;
					obj.y = closestPoint.pos[key];
					
					var points = chart.curDrawPoint;
					var len = chart.curDrawPoint.length;
					
					if (len == 1)
					{
						chart.isDrawingLine = false;
						
						chart.curDrawPoint.push(obj);
						chart.drawPoints.push(chart.curDrawPoint)
						chart.curDrawPoint = [];
					}
					else
					{
						chart.curDrawPoint.push(obj)
						//console.log(e)
						
						chart.drawingLine = svg.append("line")
						.attr("x1", closestPoint.pos.middle)
						.attr("y1", closestPoint.pos[key])
						.attr("x2", closestPoint.pos.middle)
						.attr("y2", closestPoint.pos[key])
						.attr(lineAttr);
						
						chart.isDrawingLine = true;
					}
				}
			}
		}
	}

	IDEX.cMousemove = function(chart, e) 
	{
		if (chart.isDrawing)
		{
			var node = chart.node
			var mouseX = e.pageX
			var mouseY = e.pageY
			var offsetX = $(node).offset().left;
			var offsetY = $(node).offset().top;
			var insideX = mouseX - offsetX
			var insideY = mouseY - offsetY
			
			var xAxis = chart.xAxis[0];
			var priceAxis = chart.yAxis[0];
			
			var height = xAxis.pos['bottom'];
			var width = priceAxis.pos['left'];

			
			if (insideY >= 0 && insideY <= height && insideX >= 0 && insideX <= width)
			{
				if (insideY >= priceAxis.pos.top && insideY <= priceAxis.pos.bottom)
				{
					var insidePriceY = insideY - priceAxis.pos.top
					var closestPoint = IDEX.getPoint(chart.pointData, insideX)
	
					var $drawingFollow = $(node).find(".drawingFollow");
					
					var key = getClosestYPos(closestPoint.pos, insideY);
					
					d3.select($drawingFollow.get()[0])
					.attr("x", closestPoint.pos.middle - 3)
					.attr("y", closestPoint.pos[key] - 3)
					.attr("width", 6)
					.attr("height", 6)
					.attr("fill", "#999999")
					.attr("stroke", "#999999")
					.attr("stroke-width", 1);
					
					
					//var svg = d3.select($(node).get()[0])

					if (chart.isDrawingLine)
					{
						var y1 = priceAxis.getPos(chart.curDrawPoint[0].price);
						var xPoint = IDEX.getXPoint(chart.pointData, chart.curDrawPoint[0].time);
						var x1 = xPoint.pos.middle;
						
						var x2 = closestPoint.pos.middle
						var y2 = closestPoint.pos[key]
						
						//console.log(y2)
						//console.log(y1)
						//console.log(x2)
						//console.log(x1)
						
						var rise = Number(y2) - Number(y1)
						var run = Number(x2) - Number(x1)
						
						
						//console.log('rise/run: ' + String(rise) + " / " + String(run));
						chart.drawingLine
						.attr("x2", x2)
						.attr("y2", y2)
					}
				}
			}
		}
	}
	
	
	function tempKey(key, phase)
	{
		var closedHigher = phase.close > phase.open
		map = {}
		map.topLeg = phase.high;
		map.topBody = closedHigher ? phase.close : phase.open;
		map.bottomBody = closedHigher ? phase.open : phase.close;
		map.bottomLeg = phase.low;
		
		return map[key]
	}
	
	function getClosestYPos(pointPositions, pos)
	{
		var diff = -1;
		var index = "";

		
		for (key in pointPositions)
		{
			if (key == "left" || key == "middle" || key == "right")
				continue
			
			var pointPos = pointPositions[key];
			var testDiff = Math.abs(Number(pointPos) - Number(pos))
			
			if (diff == -1 || testDiff < diff)
			{
				diff = testDiff
				index = key;
			}
			
		}
		
		return index
	}
	
	
	IDEX.cMouseup = function() 
	{

	}
	
	
	

	
	function redrawLines(chart)
	{
		var node = chart.node;
		var $drawingGroup = $(node).find(".drawingLines");
		$drawingGroup.empty();
		
		var d3DrawingGroup = d3.select($drawingGroup.get()[0])
		
		var lineAttr = {
			"stroke-width": 1.5,
			"stroke": "#999999"
		}
		
		var priceAxis = chart.yAxis[0];
		var xAxis = chart.xAxis[0];
		
		for (var i = 0; i < chart.drawPoints.length; i++)
		{
			var drawPoint = chart.drawPoints[i];
			
			if (drawPoint.length != 2)
				continue;
			
			var positions = [];
			
			for (var j = 0; j < drawPoint.length; j++)
			{
				var linePoint = drawPoint[j];
				var yPos = priceAxis.getPos(linePoint.price);
				var xPoint = IDEX.getXPoint(chart.pointData, linePoint.time);
				
				var xPos = xPoint.pos.middle;
				
				positions.push({"x":xPos, "y":yPos});
			}
			
			d3DrawingGroup.append("line")
			.attr("x1", positions[0].x)
			.attr("y1", positions[0].y)
			.attr("x2", positions[1].x)
			.attr("y2", positions[1].y)
			.attr(lineAttr);
		}
					
	}
	
	
	
	IDEX.getXPoint = function(points, value)
	{
		var val = null;
		//var points = curChart.pointData;

		if (value >= points[points.length-1].phase.startTime)
		{
			val = points[points.length-1]
		}
		else if (value <= points[0].phase.startTime)
		{
			val = points[0]
		}
		else
		{
			for (var i = 0; i < points.length; i++) 
			{
				point = points[i]
				if ( point.phase.startTime >= value) 
				{
					val = points[i-1]
					break;
				}
			}
		}
		
		//console.log(value)
		//console.log(val)
		//console.log(points)
		return val;
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
