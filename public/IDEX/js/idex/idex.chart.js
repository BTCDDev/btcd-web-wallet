
var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");

	
	IDEX.makeChart = function(obj, cellHandler)
	{
		var node = obj.node				
		var volAxisHeight = "25%"
		var priceAxisHeight = "75%"
		var priceAxisTopPadding = 35;
		
		var yLabelStyle =
		{
			"textPadding":5,
			"fontSize":"11.5px",
			"fontColor":"#8C8C8C",
		};
		
		var chartOptions = 
		{
			chart:
			{
				node:node,
				padding:
				{
					left:0,
					right:0,
					top:0,
					bottom:0,
				},
			},
			
			xAxis: [
				{	
					"isXAxis":true,
					"heightInit":20,
					"widthInit":"100%",
					
					"range":40,
					"minRange":40,
					
					"padding":{
						"top":0,
						"left":0,
						"right":10,
					},
					
					"numTicks":8,
					"tickLength":4,
					"tickStep":6,

					"labels":{
						"fontSize":"12px",
						"fontColor":"#8C8C8C"
					},
				}
			],
			
			yAxis: [
				{
					"heightInit":priceAxisHeight,
					"widthInit":50,
					
					"padding":
					{
						"top":priceAxisTopPadding,
						//"bottom":10,
					},
					
					"minPadding":0.05,
					"maxPadding":0.05,
					
					"numTicks":10,
					"tickLength":7,
					
					"labels":yLabelStyle
				},
			
				{
					"heightInit":volAxisHeight,
					"widthInit":50,
					
					"padding":{
						"top":20,
						//"bottom":10,
					},
					
					"minPadding":0.1,
					"maxPadding":0.05,
					
					"numTicks":3,
					"tickLength":7,
					
					"labels":yLabelStyle
				}
			],
			
			series: 
			[
				{
					seriesType: "candlestick",
				},
				{
					seriesType: "column",
				}
			]
			
		}
		
		if ("marketSettings" in obj)
		{
			chartOptions.marketSettings = obj.marketSettings;
		}
		
		var chart = obj.node.sleuthcharts(chartOptions);
		chart.cell = cellHandler;
		
		return chart;
	}
	
	
	IDEX.changeChartMarket = function(chart, market, exchange)
	{	
		var marketHandler = chart.marketHandler;
		marketHandler.changeMarket(market, exchange);
		IDEX.changeChartMarketDOM(chart);
		chart.updateChart();
	}
	
	
	IDEX.changeChartMarketDOM = function(chart)
	{
		var $cell = chart.node.closest(".cell");
		var marketHandler = chart.marketHandler;
		var marketSettings = marketHandler.marketSettings;
		var market = marketSettings.market;
		var barType = marketSettings.barType;
		var barLen = marketSettings.barWidth;
		
		var $header = $cell.find(".chart-header");

		$header.find(".chart-time-dropdown-wrap ul").removeClass("active");
		var $activeList = $header.find(".chart-time-dropdown-wrap ul[data-inttype='"+barType+"']");
		$activeList.addClass("active");
		
		$activeList.find("li").removeClass("active");
		var $activeListCell = $activeList.find("li[data-val='"+barLen+"']");
		$activeListCell.addClass("active");
		
		var title = $activeListCell.text();
		$header.find(".chart-time-wrap .chart-time-button-title span").text(title);
		$header.find(".chart-search-input input").val(market.marketName);
	}
	




	$contentWrap.on("click", ".chart-time-dropdown-wrap li", function()
	{
		var $wrap = $(this).closest(".chart-time-wrap");
		var isSwitch = $(this).hasClass("time-change");		


		if (isSwitch)
		{
			var timeType = $(this).attr("data-val");	
			var $otherList = $wrap.find("ul[data-inttype='"+timeType+"']")
			var $otherCell = $otherList.find("li.active")
			var timeVal = $otherCell.attr("data-val");
			var title = $otherCell.text();
			
			$wrap.find("ul").removeClass("active");
			$otherList.addClass("active");
		}
		else
		{
			var $list = $(this).closest("ul");
			var timeType = $list.attr("data-inttype");
			var timeVal = $(this).attr("data-val");	
			var title = $(this).text();

			$list.find("li").removeClass("active");
			$(this).addClass("active");
		}
		
		$wrap.find(".chart-time-button-title span").text(title);

		
		
		var $node = $(this).closest(".chart-header").parent().find(".chart-wrap");
		var chart = $node.sleuthcharts();
		var marketHandler = chart.marketHandler;
		
		var newSettings = {};
		newSettings.configType = "time";
		newSettings.configVal = timeType;
		newSettings.val = timeVal;
		
		marketHandler.changeSettings(newSettings);
	})
	
	
	$contentWrap.on("click", ".chart-header .mm-chart-config li", function(e)
	{
		$(this).parent().find("li").removeClass("active");
		$(this).addClass("active");
		
				
		var $node = $(this).closest(".chart-header").parent().find(".chart-wrap");
		var chart = $node.sleuthcharts();
		var marketHandler = chart.marketHandler;
		
		var confType = $(this).parent().attr("data-config")
		var confVal = $(this).attr("data-val")
		
		var newSettings = {};
		newSettings.configType = confType;
		newSettings.configVal = confVal;		

		marketHandler.changeSettings(newSettings);

	})
	

	
	
	IDEX.chartIndicators = 
	[
		{
			fullName: "MACD",
			shortName: "MACD",
			skynetCode: "macd",
			indicatorSettings: 
			{
				icode: "macd",
				ion: "cl",
				ilen: 9
			}

		},
		{
			fullName: "Stoch RSI",
			shortName: "Stock RSI",
			skynetCode: "storsi",
			indicatorSettings: 
			{
				icode: "storsi",
				ion: "cl", //vol
				ilen: 14
			}

		}
	]
	
	
	IDEX.addChartIndicator = function(chart, indicatorSettings)
	{
		var yAxisSettings = 
		{
			heightInit:"25%",
			widthInit:50,
			
			padding:
			{
				"top":20,
				"left":0,
			},
			
			minPadding:0.0,
			maxPadding:0.0,
			
			numTicks:3,
			tickLength:7,
			
			labels:
			{
				textPadding:5,
				fontSize:"11.5px",
				fontColor:"#8C8C8C",
			}
		};

		var seriesSettings = 
		{
			seriesType: "indicator",
			indicatorSettings: indicatorSettings
		};
		
		/*
		seriesSettings = 
		{
			seriesType: "column",
		};
		*/
		
		
		var newSeriesSettings = {};
		newSeriesSettings.series = seriesSettings;
		newSeriesSettings.yAxis = yAxisSettings;
		
		chart.addSeries(newSeriesSettings);
		IDEX.togglePopup($chartIndicatorPopup, false, true);
	};
	
	
	

	
	var $chartIndicatorPopup = $("#chartIndicator_popup");
	IDEX.indChart;
	
	
	$contentWrap.on("click", ".chartIndicatorPopup-indList-row", function(e)
	{
		var chart = IDEX.indChart;
		var rowIndCode = $(this).attr("data-ind");
		var indicator;
		
		for (var i = 0; i < IDEX.chartIndicators.length; i++)
		{
			indicator = IDEX.chartIndicators[i];
			if (indicator.skynetCode == rowIndCode)
				break;
		}
		
		
		IDEX.addChartIndicator(chart, indicator.indicatorSettings);
	})

	
	$contentWrap.on("click", ".chart-indicator-popup-trig", function(e)
	{
		var $node = $(this).closest(".cell").find(".chart-wrap");
		var chart = $node.sleuthcharts();
	
		IDEX.indChart = chart;

		
		var isActive = $chartIndicatorPopup.hasClass("active");
		IDEX.togglePopup($chartIndicatorPopup, !isActive, true);
	})

	
	
	IDEX.initChartIndicators = function()
	{	
		var rows = [];
		
		for (var i = 0; i < IDEX.chartIndicators.length; i++)
		{
			var indicator = IDEX.chartIndicators[i];
			var row = IDEX.addChartIndicatorDOM(indicator);
			rows.push(row);
		}
		
		//console.log(rows);
		$(".chartIndicatorPopup-indList").append($(rows.join("")))
	}



	IDEX.addChartIndicatorDOM = function(indicator)
	{
		var fullName = indicator.fullName;
		var shortName = indicator.shortName;
		var nameCode = indicator.skynetCode;
		
		var rowWrap = "<div class='chartIndicatorPopup-indList-row' data-ind='"+nameCode+"'></div>"
		var tdWrapFullName = "<div class='chartIndicatorPopup-indList-cell'></div>";
		var tdWrapShortName = "<div class='chartIndicatorPopup-indList-cell'></div>";
		var tdFullName = "<span>" + fullName + "</span>";
		var tdShortName = "<span>" + shortName + "</span>";		

		var tdFullNameStr = $(tdWrapFullName).html(tdFullName)[0].outerHTML;
		var tdWrapShortNameStr = $(tdWrapShortName).html(tdShortName)[0].outerHTML;
			
		var combined = tdFullNameStr + tdWrapShortNameStr
			
		var row = $(combined).wrapAll(rowWrap).parent()[0].outerHTML
		
		return row
	}
	
	

	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
