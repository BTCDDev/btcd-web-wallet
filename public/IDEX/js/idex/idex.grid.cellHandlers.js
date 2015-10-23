


var IDEX = (function(IDEX, $, undefined) 
{
	
	var defaultSave = {"windowHeight":628,"windowWidth":1855,"gridSaves":[{"tileSaves":[{"positions":{"height":405,"width":850,"top":0,"bottom":405,"left":0,"right":850},"winPositions":{"height":405,"width":850,"top":38,"bottom":443,"left":0,"right":850},"index":0,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"chart","cellTypeSettings":{"marketSettings":{"pair":"15344649963748848799_NXT","barType":"tick","barWidth":"25","exchange":"nxtae","isVirtual":false,"isFlipped":false,"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}},"pairName":"InstantDEX_NXT"}}}]},{"positions":{"height":628,"width":593,"top":0,"bottom":628,"left":850,"right":1443},"winPositions":{"height":628,"width":593,"top":38,"bottom":666,"left":850,"right":1443},"index":1,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"orderbook","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}}]},{"positions":{"height":314,"width":412,"top":314,"bottom":628,"left":1443,"right":1855},"winPositions":{"height":314,"width":412,"top":352,"bottom":666,"left":1443,"right":1855},"index":2,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"watchlist"}]},{"positions":{"height":314,"width":412,"top":0,"bottom":314,"left":1443,"right":1855},"winPositions":{"height":314,"width":412,"top":38,"bottom":352,"left":1443,"right":1855},"index":3,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"marketHistory","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}}]},{"positions":{"height":223,"width":850,"top":405,"bottom":628,"left":0,"right":850},"winPositions":{"height":223,"width":850,"top":443,"bottom":666,"left":0,"right":850},"index":4,"isTileHeaderTabbed":true,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"balances"},{"isActive":false,"linkIndex":-1,"cellType":"trades","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}},{"isActive":false,"linkIndex":-1,"cellType":"orders","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}}]}],"index":0,"isActive":true}]}
	
	IDEX.cellHandlers = 
	{

	}
	
	
	IDEX.CellHandler = function()
	{
		//if (!arguments.length)
		//	return
		//this.init.apply(this, arguments)
	}
	
	
	IDEX.CellHandler.prototype = 
	{	
		allCellMethods: IDEX.cellHandlers,
	
		init: function(cell)
		{
			var cellHandler = this;
			cellHandler.cell = cell;
			cellHandler.cellType = cell.cellType;
			cell.cellApp;
			
			cellHandler.cellMethods = cellHandler.allCellMethods[cellHandler.cellType];
		},
		
		
		call: function(funcName, args)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			//var func = cellHandler.cellMethods[funcName];
			var func = cellHandler[funcName];
			
			if (func)
			{
				var ret = func.apply(this, [args]);
			}
			
			return ret;
		},
		
		emit: function(eventName, eventArgs)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellApp = cellHandler.cellApp;
			
			if (eventName == "changeMarket")
			{
				cell.setLinkedCells(eventArgs);
			}
		},
		
		getMarket: function()
		{
			var cellHandler = this;
			var cellApp = cellHandler.cellApp;
			var cellType = cellHandler.cellType;
			
			var market = null;
			
			if (cellType == "watchlist")
			{
				
			}
			else
			{
				market = cellApp.market;
			}
			
			return market;
		},
		
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCOpenOrder($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCOpenOrder($cellApp, cellHandler);
			
			cellHandler.cellApp = cellApp;
			
			if (settings && "market" in settings)
			{
				var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
				cellApp.changeMarket(loadedMarket);
			}
		},
		
		
		changeMarket: function(market)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;

			var cBalance = cellHandler.cellApp;

			if ("changeMarket" in cBalance)
				cBalance.changeMarket(market);
		},
		
		save: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cBalance = cellHandler.cellApp;
			
			var saveObj = {};
			var market = cBalance.market;
			if (market)
			{
				saveObj.market = market.minimizeSelf();
			}
			return saveObj;
		},
		
		remove: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var $cell = cell.cellDOM;

			var $orderbook = $cell.find(".orderbook-wrap");
			IDEX.removeOrderbook($orderbook);
		}
	}
	

	

	IDEX.cellHandlers.chart = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "chart",
		cellAppClassDOM: ".chart-wrap",
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var $cell = cell.cellDOM;
			var $chartNode = $cell.find(".chart-wrap");
			var market = IDEX.defaultMarket;
			
			var $dropdownTable = $($("#chartTableTemplate").html())
			$cell.find(".dropdown-wrap").append($dropdownTable)

			var $search = $cell.find('.skynet-search');
			IDEX.initSkyNETAuto($search);
			
			var chartSettings = {};
			chartSettings.node = $chartNode;
			chartSettings.market = market;

			var chart = IDEX.makeChart(chartSettings, cellHandler);
			cellHandler.cellApp = chart;
			IDEX.changeChartMarket(chart, market, market.exchanges[0]);
		},
		
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var $cell = cell.cellDOM;
			var $chartNode = $cell.find(".chart-wrap");
			
			var $dropdownTable = $($("#chartTableTemplate").html())
			$cell.find(".dropdown-wrap").append($dropdownTable)

			var $search = $cell.find('.skynet-search');
			IDEX.initSkyNETAuto($search)
			
			var chartSettings = {};
			chartSettings.node = $chartNode;
			$.extend(chartSettings, settings);
			
			if ("marketSettings" in chartSettings)
			{
				var market = chartSettings.marketSettings.market;
				if (market && !($.isEmptyObject(market)))
				{
					delete chartSettings.marketSettings.market;
					market = IDEX.marketOverlord.expandMarket(market);
				}
				else
				{
					market = IDEX.defaultMarket;
				}
			}
			
			var chart = IDEX.makeChart(chartSettings, cellHandler);
			IDEX.changeChartMarket(chart, market, market.exchanges[0]);
			cellHandler.cellApp = chart;
		},
		
		
		changeMarket: function(market)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var chart = cellHandler.cellApp;
			var exchange = market.exchanges[0];	
			
			IDEX.changeChartMarket(chart, market, exchange);
		},
		
		
		update: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var chart = cellHandler.cellApp;
			
			if (!chart)
				return
			
			var $chartNode = chart.node;
			chart.redraw();
		},
		
		resize: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var chart = cellHandler.cellApp;
			
			if (!chart)
				return
			
			var $chartNode = chart.node;
			chart.redraw();
		},
		
		
		save: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var chart = cellHandler.cellApp;

			var obj = {};
			obj.marketSettings = chart.marketHandler.marketSettings;
			
			if ("market" in obj.marketSettings)
			{
				var market = obj.marketSettings.market;
				if (market && !($.isEmptyObject(market)))
				{
					market = market.minimizeSelf();
					obj.marketSettings.market = market;
				}
			}	
			
			return obj;
		}

	})
	
	
	
	IDEX.cellHandlers.orderbook = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "orderbook",
		cellAppClassDOM: ".orderbook-wrap",
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newOrderbook($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newOrderbook($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
			
			if (settings && "market" in settings)
			{
				var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
				cellApp.changeMarket(loadedMarket);
			}
		},

	})
	

	IDEX.cellHandlers.watchlist = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "watchlist",
		cellAppClassDOM: ".watchlist-wrap",
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.watchlistOverlord.addWatchlistTile($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.watchlistOverlord.addWatchlistTile($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
	})
	
	IDEX.cellHandlers.balances = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "balances",
		cellAppClassDOM: ".cm-balances-wrap",
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCBalance($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCBalance($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
			
			if (settings && "market" in settings)
			{
				var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
				cellApp.changeMarket(loadedMarket);
			}
		},

	})
	
	IDEX.cellHandlers.orders = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "openOrders",
		cellAppClassDOM: ".cm-openorders-wrap",
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCOpenOrder($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCOpenOrder($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
			
			if (settings && "market" in settings)
			{
				var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
				cellApp.changeMarket(loadedMarket);
			}
		},

	})
	
	
	IDEX.cellHandlers.trades = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "tradeHistory",
		cellAppClassDOM: ".cm-trades-wrap",
		

	})
	

	IDEX.cellHandlers.marketHistory = IDEX.extendClass(IDEX.CellHandler, 
	{
		cellAppType: "marketHistory",
		cellAppClassDOM: ".cm-marketHistory-wrap",
		
		
		new: function()
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCMarketHistory($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
		},
		
		loadCustom: function(settings)
		{
			var cellHandler = this;
			var cell = cellHandler.cell;
			var cellAppClassDOM = cellHandler.cellAppClassDOM;			
			var $cellApp = cell.cellDOM.find(cellAppClassDOM);
			var cellApp = IDEX.newCMarketHistory($cellApp, cellHandler);
			cellHandler.cellApp = cellApp;
			
			if (settings && "market" in settings)
			{
				var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
				cellApp.changeMarket(loadedMarket);
			}
		},

	})


	
	

	
	
	IDEX.initGrids = function()
	{
		Sleuthgrids.cellHandlers = IDEX.cellHandlers;
		Sleuthgrids.cellHandlerClass = IDEX.CellHandler;
		
		//var defaultSave = {};
		if (!localStorage.grids)
		{
			var sleuthgridsSave = defaultSave;
		}
		else
		{
			var sleuthgridsSave = JSON.parse(localStorage.getItem('grids'));
			
			if (!sleuthgridsSave.gridSaves.length)
				sleuthgridsSave = defaultSave;
		}
		
		Sleuthgrids.init(sleuthgridsSave);
			

	}

	
	$(window).on("beforeunload", function()
	{
		var saves = Sleuthgrids.gridOverlord.saveAllGrids();
		console.log(saves);
		localStorage.setItem('grids', JSON.stringify(saves));
	});
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


