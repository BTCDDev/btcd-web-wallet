


var IDEX = (function(IDEX, $, undefined) 
{
	
	var defaultSave = {"windowHeight":628,"windowWidth":1855,"gridSaves":[{"tileSaves":[{"positions":{"height":405,"width":850,"top":0,"bottom":405,"left":0,"right":850},"winPositions":{"height":405,"width":850,"top":38,"bottom":443,"left":0,"right":850},"index":0,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"chart","cellTypeSettings":{"marketSettings":{"pair":"15344649963748848799_NXT","barType":"tick","barWidth":"25","exchange":"nxtae","isVirtual":false,"isFlipped":false,"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}},"pairName":"InstantDEX_NXT"}}}]},{"positions":{"height":628,"width":593,"top":0,"bottom":628,"left":850,"right":1443},"winPositions":{"height":628,"width":593,"top":38,"bottom":666,"left":850,"right":1443},"index":1,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"orderbook","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}}]},{"positions":{"height":314,"width":412,"top":314,"bottom":628,"left":1443,"right":1855},"winPositions":{"height":314,"width":412,"top":352,"bottom":666,"left":1443,"right":1855},"index":2,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"watchlist"}]},{"positions":{"height":314,"width":412,"top":0,"bottom":314,"left":1443,"right":1855},"winPositions":{"height":314,"width":412,"top":38,"bottom":352,"left":1443,"right":1855},"index":3,"isTileHeaderTabbed":false,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"marketHistory","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}}]},{"positions":{"height":223,"width":850,"top":405,"bottom":628,"left":0,"right":850},"winPositions":{"height":223,"width":850,"top":443,"bottom":666,"left":0,"right":850},"index":4,"isTileHeaderTabbed":true,"cellSaves":[{"isActive":true,"linkIndex":-1,"cellType":"balances"},{"isActive":false,"linkIndex":-1,"cellType":"trades","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}},{"isActive":false,"linkIndex":-1,"cellType":"orders","cellTypeSettings":{"market":{"marketName":"InstantDEX_NXT","pairID":"15344649963748848799_NXT","isNxtAE":true,"exchangeSettings":{"nxtae":{"skynetFlipped":false}},"exchanges":["nxtae"],"base":{"name":"InstantDEX","isAsset":true,"assetID":"15344649963748848799","exchanges":["nxtae"]},"rel":{"name":"NXT","isAsset":false,"assetID":"","exchanges":["bittrex","nxtae","poloniex","btc38"]}}}}]}],"index":0,"isActive":true}]}
	
	var cellHandlers = 
	{
		chart:
		{
			new: newChart,
			loadCustom: loadCustomChart,
			changeMarket: changeChartMarket,
			update: resizeChart,
			resize: resizeChart,
			remove: removeChart,
			save: saveChart,
		},
		
		orderbook:
		{
			new: newOrderbook,
			loadCustom: loadCustomOrderbook,
			changeMarket: changeOrderbookMarket,
			remove: removeOrderbook,
			save: saveOrderbook,
		},
		
		watchlist:
		{
			new: newWatchlist,
			loadCustom: loadCustomWatchlist,
			save: saveWatchlist,
		},
		
		balances:
		{
			new: newBalance,
			loadCustom: loadCustomBalance,
			changeMarket: changeBalanceMarket,
			remove: removeBalance,
			save: saveBalance,
		},
		
		orders:
		{
			new: newOpenOrder,
			loadCustom: loadCustomOpenOrder,
			changeMarket: changeOpenOrderMarket,
			remove: removeOpenOrder,
			save: saveOpenOrder,
		},
		
		trades:
		{
			new: newTradeHistory,
			loadCustom: loadCustomTradeHistory,
			changeMarket: changeTradeHistoryMarket,
			remove: removeTradeHistory,
			save: saveTradeHistory,
		},
		
		marketHistory:
		{
			new: newMarketHistory,
			loadCustom: loadCustomMarketHistory,
			changeMarket: changeMarketHistoryMarket,
			remove: removeMarketHistory,
			save: saveMarketHistory,
		}
	};
	
	
	
	
	IDEX.CellHandler = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	IDEX.CellHandler.prototype = 
	{	
		allCellMethods: cellHandlers,
	
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
			var func = cellHandler.cellMethods[funcName];
			
			//console.log([cellHandler, funcName], args);
			
			
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
		}
	}
	
	
	/********************	CHART	*********************/
	
	
	function newChart()
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
	}
	
	
	function loadCustomChart(settings)
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
	}
	
	
	function changeChartMarket(market)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var chart = cellHandler.cellApp;
		var exchange = market.exchanges[0];	
		
		IDEX.changeChartMarket(chart, market, exchange);
	}
	
	
	function resizeChart()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var chart = cellHandler.cellApp;
		
		if (!chart)
			return
		
		var $chartNode = chart.node;
		var isVisible = $chartNode.is(":visible");
		chart.setContainerSize();

		if (!isVisible)
		{
			chart.needsResize = true;
		}
		else
		{
			chart.redraw();
		}
	}	
	
	
	function removeChart()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
	}
	
	
	function saveChart()
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
	
	
	/********************	ORDERBOOK	*********************/

	
	function newOrderbook()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		
		var $orderbook = $cell.find(".orderbook-wrap");
		var orderbook = IDEX.newOrderbook($orderbook, cellHandler);
		
		cellHandler.cellApp = orderbook;
	}
	
	
	function loadCustomOrderbook(settings)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		
		var $orderbook = $cell.find(".orderbook-wrap");
		var orderbook = IDEX.newOrderbook($orderbook, cellHandler);
		
		cellHandler.cellApp = orderbook;
		
		if (settings && ("market" in settings))
		{
			var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
			orderbook.changeMarket(loadedMarket);
		}
	}
	
	function changeOrderbookMarket(market)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var orderbook = cellHandler.cellApp;

		orderbook.changeMarket(market);
	}
	
	function saveOrderbook()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var orderbook = cellHandler.cellApp;
		
		var obj = {};
		var market = orderbook.market;
		if (market)
		{
			var saveMarket = market.minimizeSelf();
			obj.market = saveMarket;
		}
		
		return obj;
		
	}
	
	function removeOrderbook()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var $cell = cell.cellDOM;

		var $orderbook = $cell.find(".orderbook-wrap");
		IDEX.removeOrderbook($orderbook)
	}
	
	
	
	/********************	WATCHLIST	*********************/


	
	function newWatchlist()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		var $watchlist = $cell.find(".watchlist-wrap");
		
		var watchlist = IDEX.newWatchlist($watchlist, cellHandler);
		cellHandler.cellApp = watchlist;

	}
	
	
	function loadCustomWatchlist()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var $cell = cell.cellDOM;
		var $watchlist = $cell.find(".watchlist-wrap");
		
		var watchlist = IDEX.newWatchlist($watchlist, cellHandler);
		cellHandler.cellApp = watchlist;

	}
	
	
	function saveWatchlist()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
	}
	
	
	/********************	BALANCE	*********************/

	
	
	function newBalance(cell)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		
		var $cBalance = $cell.find(".cm-balances-wrap");
		var cBalance = IDEX.newCBalance($cBalance, cellHandler);
		cellHandler.cellApp = cBalance;

	}
	
	
	function loadCustomBalance(settings)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;

		var $cBalance = $cell.find(".cm-balances-wrap");
		var cBalance = IDEX.newCBalance($cBalance, cellHandler);
		
		cellHandler.cellApp = cBalance;
		
		if (settings && "market" in settings)
		{
			var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
			cBalance.changeMarket(loadedMarket);
		}

	}
	
	function changeBalanceMarket(market)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;

		var cBalance = cellHandler.cellApp;

		cBalance.changeMarket(market);
	}
	
	function saveBalance()
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
	}
	
	function removeBalance()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
	}
	

	
	/********************	ORDERS	*********************/

	
	
	function newOpenOrder()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var $cell = cell.cellDOM;
		
		var $cOpenOrder = $cell.find(".cm-openorders-wrap");
		var cOpenOrder = IDEX.newCOpenOrder($cOpenOrder, cellHandler);
		cellHandler.cellApp = cOpenOrder;

	}
	
	
	function loadCustomOpenOrder(settings)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var $cell = cell.cellDOM;

		var $cOpenOrder = $cell.find(".cm-openorders-wrap");
		var cOpenOrder = IDEX.newCOpenOrder($cOpenOrder, cellHandler);
		cellHandler.cellApp = cOpenOrder;
		
		if (settings && "market" in settings)
		{
			var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
			cOpenOrder.changeMarket(loadedMarket);
		}
	}
	
	function changeOpenOrderMarket(market)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var cOpenOrder = cellHandler.cellApp;

		cOpenOrder.changeMarket(market);
	}
	
	function saveOpenOrder()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var cOpenOrder = cellHandler.cellApp;
		
		var saveObj = {};
		var market = cOpenOrder.market;
		if (market)
		{
			saveObj.market = market.minimizeSelf();
		}
		return saveObj;
	}
	
	function removeOpenOrder()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;	
	}
		
	
	
	
	/********************	TRADE HISTORY	*********************/

	
	
	function newTradeHistory()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		
		var $cTrade = $cell.find(".cm-trades-wrap");
		var cTrade = IDEX.newCTrade($cTrade, cellHandler);
		cellHandler.cellApp = cTrade;

	}
	
	
	function loadCustomTradeHistory(settings)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var $cell = cell.cellDOM;

		var $cTrade = $cell.find(".cm-trades-wrap");
		var cTrade = IDEX.newCTrade($cTrade, cellHandler);
		cellHandler.cellApp = cTrade;
		
		if (settings && "market" in settings)
		{
			var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
			cTrade.changeMarket(loadedMarket);
		}
	}
	
	function changeTradeHistoryMarket(market)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var cTrade = cellHandler.cellApp;

		cTrade.changeMarket(market);
	}
	
	function saveTradeHistory()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var cTrade = cellHandler.cellApp;
		
		var saveObj = {};
		var market = cTrade.market;
		if (market)
		{
			saveObj.market = market.minimizeSelf();
		}
				
		return saveObj;
		
	}
	
	function removeTradeHistory()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
	}
	
	
	/********************	MARKET HISTORY	*********************/

	
	
	function newMarketHistory()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		
		var $cMarketHistory = $cell.find(".cm-marketHistory-wrap");
		var cMarketHistory = IDEX.newCMarketHistory($cMarketHistory, cellHandler);
		cellHandler.cellApp = cMarketHistory;
	}
	
	
	function loadCustomMarketHistory(settings)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
		var $cell = cell.cellDOM;
		
		var $cMarketHistory = $cell.find(".cm-marketHistory-wrap");
		var cMarketHistory = IDEX.newCMarketHistory($cMarketHistory, cellHandler);
		cellHandler.cellApp = cMarketHistory;
		
		if (settings && "market" in settings)
		{
			var loadedMarket = IDEX.marketOverlord.expandMarket(settings.market);
			cMarketHistory.changeMarket(loadedMarket);
		}
	}
	
	function changeMarketHistoryMarket(market)
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var cMarketHistory = cellHandler.cellApp;

		cMarketHistory.changeMarket(market);
	}
	
	function saveMarketHistory()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		var cMarketHistory = cellHandler.cellApp;
		
		var saveObj = {};
		var market = cMarketHistory.market;
		if (market)
		{
			saveObj.market = market.minimizeSelf();
		}
		return saveObj;
		
	}
	
	function removeMarketHistory()
	{
		var cellHandler = this;
		var cell = cellHandler.cell;
		
	}
	


	
	
	IDEX.initGrids = function()
	{
		Sleuthgrids.cellHandlers = cellHandlers;
		Sleuthgrids.cellHandlerClass = IDEX.CellHandler;
		
		//var defaultSave = {};
		if (!localStorage.grids)
		{
			var saveObj = defaultSave;
		}
		else
		{
			var saveObj = JSON.parse(localStorage.getItem('grids'));
			
			if (!saveObj.gridSaves.length)
				saveObj = defaultSave;
		}
			
		var prevHeight = saveObj.windowHeight;
		var prevWidth = saveObj.windowWidth;
		var gridSaves = saveObj.gridSaves;
		
		if (!gridSaves)
			gridSaves = [];
		
		for (var i = 0; i < gridSaves.length; i++)
		{
			var gridSave = gridSaves[i];
			var grid = new Sleuthgrids.Grid();
			grid.gridSave = gridSave;
			grid.prevGridHeight = prevHeight;
			grid.prevGridWidth = prevWidth;
			grid.isActive = gridSave.isActive;
					
			grid.initTilesFromSave(gridSave.tileSaves);

					
			if (grid.isActive)
			{
				grid.gridTab.gridTabDOM.trigger("click");
				//grid.showGrid();
			}
		}

		
		Sleuthgrids.resizeAllGrids();
	}

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


