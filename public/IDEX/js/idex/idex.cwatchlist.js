
var IDEX = (function(IDEX, $, undefined)
{
	
	
	
	IDEX.WatchlistOverlord = function() 
	{	
		var overlord = this;
		overlord.watchlistTiles = [];
		overlord.watchlists = [];
		overlord.addMarketPopup = new IDEX.WatchlistPopup();

		overlord.addWatchlist();
	};
	
	
	
	IDEX.WatchlistOverlord.prototype.addWatchlistTile = function($el, cellHandler)
	{
		var watchlistOverlord = this;
		
		var watchlistTile = new IDEX.WatchlistTile(watchlistOverlord, $el, cellHandler);
		watchlistOverlord.watchlistTiles.push(watchlistTile)
		watchlistTile.updateDropdown();

		return watchlistTile;
	};
	
	
	
	IDEX.WatchlistOverlord.prototype.addWatchlist = function()
	{
		var watchlistOverlord = this;
		
		var watchlist = new IDEX.Watchlist(watchlistOverlord);
		watchlistOverlord.watchlists.push(watchlist)
		
		watchlistOverlord.updateAllTileDropdowns();

		return watchlist;
	};
	
	

	IDEX.WatchlistOverlord.prototype.updateAllTileDropdowns = function()
	{
		var watchlistOverlord = this;
		var watchlistTiles = watchlistOverlord.watchlistTiles;
		
		for (var i = 0; i < watchlistTiles.length; i++)
		{
			var watchlistTile = watchlistTiles[i];
			watchlistTile.updateDropdown();
		}
	};

	
	
	IDEX.WatchlistOverlord.prototype.updateAllTileTables = function()
	{
		var watchlistOverlord = this;
		var watchlistTiles = watchlistOverlord.watchlistTiles;
		
		for (var i = 0; i < watchlistTiles.length; i++)
		{
			var watchlistTile = watchlistTiles[i];
			watchlistTile.updateTable();
		}
	};

	

	IDEX.WatchlistOverlord.prototype.loadLocalStorage = function()
	{
		var watchlistOverlord = this;
		watchlistOverlord.watchlists = [];
		var watchlistsRaw = [];
				
		if (localStorage.watchlists)
		{
			watchlistsRaw = JSON.parse(localStorage.getItem('watchlists'));
		}
		
		for (var i = 0; i < watchlistsRaw.length; i++)
		{
			var watchlist = watchlistOverlord.addWatchlist();
			var watchlistMarkets = watchlistsRaw[i];
			watchlist.loadLocalStorage(watchlistMarkets);
		}
		
		if (!watchlistsRaw.length)
		{
			watchlistOverlord.addWatchlist();
		}
	}
	
	
	
	IDEX.WatchlistOverlord.prototype.setLocalStorage = function()
	{
		var watchlistOverlord = this;
		var watchlists = watchlistOverlord.watchlists;
		var watchlistSaves = [];
		
		for (var i = 0; i < watchlists.length; i++)
		{
			var watchlist = watchlists[i];
			var watchlistSave = watchlist.save();
			watchlistSaves.push(watchlistSave);
		}
		
		localStorage.setItem('watchlists', JSON.stringify(watchlistSaves));
	}
	
	
	
	IDEX.WatchlistOverlord.prototype.updateWatchlistTable = function()
	{
		var overlord = IDEX.watchlistOverlord;
		var allWatchlists = IDEX.allWatchlists;
		
		for (var i = 0; i < allWatchlists.length; i++)
		{
			var watchlist = allWatchlists[i];
			watchlist.addRow(market);
		}
	}
	
	
	
	IDEX.WatchlistOverlord.prototype.togglePopup = function(watchlist)
	{
		var watchlistOverlord = this;
		var addMarketPopup = watchlistOverlord.addMarketPopup;
		addMarketPopup.watchlist = watchlist;
		var $popup = $("#marketSearch_popup");

		IDEX.togglePopup($popup, true, true);
	}
	
	

	
	
	
	IDEX.Watchlist = function(watchlistOverlord) 
	{	
		var watchlist = this;
		
		watchlist.watchlistOverlord = watchlistOverlord;
		watchlist.markets = [];
	};
	
	
	
	IDEX.Watchlist.prototype.loadLocalStorage = function(markets)
	{
		var watchlist = this;
		
		for (var i = 0; i < markets.length; i++)
		{
			var marketRaw = markets[i];
			var loadedMarket = IDEX.marketOverlord.expandMarket(marketRaw);
			watchlist.addMarket(loadedMarket);
		}
	}
	
	
	
	IDEX.Watchlist.prototype.save = function()
	{
		var watchlist = this;
		var markets = watchlist.markets;
		var saveMarkets = [];
		
		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			var marketMin = market.minimizeSelf();
			saveMarkets.push(marketMin);
		}
		
		return saveMarkets;
	}
	
	
	
	IDEX.Watchlist.prototype.addMarket = function(market)
	{
		var watchlist = this;
		var watchlistOverlord = watchlist.watchlistOverlord;
		var retbool = false;

		var index = watchlist.searchForMarket(market);
		
		if (index == -1)
		{
			watchlist.markets.push(market);
			watchlistOverlord.setLocalStorage();
			retbool = true;
			watchlistOverlord.updateAllTileTables();
		}

		return retbool;
	}
	

	
	IDEX.Watchlist.prototype.removeMarket = function(market)
	{
		var watchlist = this;
		var watchlistOverlord = watchlist.watchlistOverlord;
		var index = watchlist.searchForMarket(market);
		
		if (index != -1)
		{
			watchlist.markets.splice(index, 1);
			watchlistOverlord.setLocalStorage();
			watchlistOverlord.updateAllTileTables();
		}
	}
	
	
	IDEX.Watchlist.prototype.searchForMarket = function(market)
	{
		var watchlist = this;
		var markets = watchlist.markets;
		var index = -1;

		for (var i = 0; i < markets.length; i++)
		{
			var marketCheck = markets[i];
			
			if (market.marketKey == marketCheck.marketKey)
			{
				index = i;
				break;
			}
		}
		
		return index;
	}
	
	

	
	
	
	
	IDEX.WatchlistTile = function(watchlistOverlord, $watchlist, cellHandler) 
	{	
		var watchlistTile = this;
		
		watchlistTile.watchlistOverlord = watchlistOverlord;
		watchlistTile.cellHandler = cellHandler;
		watchlistTile.watchlist = watchlistOverlord.watchlists[0];
		
		watchlistTile.watchlistIndex = 0;
		watchlistTile.pollHandler = new IDEX.PollHandler(10000, function() {return watchlistTile.temp()}, function(data, errorLevel) {return watchlistTile.callback(data, errorLevel)});

		watchlistTile.initDOM($watchlist);
		watchlistTile.initEventListeners();
		watchlistTile.initWatchlist();

	};
	

	
	IDEX.WatchlistTile.prototype.initDOM = function($watchlist) 
	{	
		var watchlistTile = this;
		
		watchlistTile.watchlistDOM = $watchlist;
		watchlistTile.watchlistAddDom = watchlistTile.watchlistDOM.find(".watchlist-add");
		watchlistTile.watchlistTableDom = watchlistTile.watchlistDOM.find(".nTable");
		watchlistTile.refreshDom = watchlistTile.watchlistDOM.find(".refresh-wrap img");
		watchlistTile.loadingDom = watchlistTile.watchlistDOM.find(".watchlist-loading");
		
		watchlistTile.dropdownListDOM = watchlistTile.watchlistDOM.find(".dropdown-list ul");
		watchlistTile.listAddDOM = watchlistTile.watchlistDOM.find(".dropdown-list-title");

		watchlistTile.watchlistTableDom.parent().perfectScrollbar();
	};
	
	
	
	IDEX.WatchlistTile.prototype.initEventListeners = function() 
	{
		var watchlistTile = this;
		
		watchlistTile.watchlistAddDom.on("click", function() { watchlistTile.onAddMarketClick(); } );
		watchlistTile.watchlistTableDom.on("click", "tbody tr", function(e) { watchlistTile.onRowClick(e, $(this)); } );
		
		watchlistTile.listAddDOM.on("click", function(e) { watchlistTile.onListAddClick(); } );
		watchlistTile.dropdownListDOM.on("click", "li", function(e) { watchlistTile.onListClick($(this)); } );

		//watchlist.refreshDom.on("click", function(){ watchlist.refreshClick() });
		//watchlist.watchlistTableDom.on("mouseover", "tbody tr", function(e) { watchlist.onRowMouseover(e, $(this)); } );			
	}
	
	
	
	IDEX.WatchlistTile.prototype.initWatchlist = function()
	{
		var watchlistTile = this;
		var watchlistOverlord = watchlistTile.watchlistOverlord;

		watchlistTile.updateTable();
		
		watchlistTile.pollHandler.poll(0);
	}
	
	
	
	IDEX.WatchlistTile.prototype.changeWatchlist = function(newWatchlistIndex)
	{
		var watchlistTile = this;
		var watchlistOverlord = watchlistTile.watchlistOverlord;
		watchlistTile.watchlistIndex = newWatchlistIndex;
		watchlistTile.watchlist = watchlistOverlord.watchlists[newWatchlistIndex];
		
		watchlistTile.updateTable();
		
		watchlistTile.pollHandler.stopPolling(function()
		{
			watchlistTile.pollHandler.poll(0);
		})
	}
	
	
	
	IDEX.WatchlistTile.prototype.updateTable = function()
	{
		var watchlistTile = this;

		watchlistTile.watchlistTableDom.find("tbody").empty();
		var markets = watchlistTile.watchlist.markets;

		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			watchlistTile.addRow(market);
		}
	}
	
	
	
	IDEX.WatchlistTile.prototype.updateDropdown = function()
	{
		var watchlistTile = this;
		var watchlistOverlord = watchlistTile.watchlistOverlord;
		var watchlists = watchlistOverlord.watchlists;
		watchlistTile.dropdownListDOM.empty();
		
		for (var i = 0; i < watchlists.length; i++)
		{
			var watchlist = watchlists[i];
			var str = "<li data-watchlist='"+String(i)+"'>Watchlist " + String(i+1) + "</li>";
			watchlistTile.dropdownListDOM.append(str);
		}
	}

	
	IDEX.WatchlistTile.prototype.onListClick = function($li)
	{
		var watchlistTile = this;
		var watchlistOverlord = watchlistTile.watchlistOverlord;
		
		var newWatchlistIndex = $li.data("watchlist");
		watchlistTile.changeWatchlist(newWatchlistIndex);
	}
	
	
	
	IDEX.WatchlistTile.prototype.onListAddClick = function()
	{
		var watchlistTile = this;
		var watchlistOverlord = watchlistTile.watchlistOverlord;
		
		watchlistOverlord.addWatchlist();
	}
	
	

	IDEX.WatchlistTile.prototype.onAddMarketClick = function()
	{
		var watchlistTile = this;
		var watchlist = watchlistTile.watchlist;
		var watchlistOverlord = watchlistTile.watchlistOverlord;

		watchlistOverlord.togglePopup(watchlist);
	}
	
	
	
	IDEX.WatchlistTile.prototype.onRowClick = function(e, $row)
	{
		var watchlistTile = this;
		var cellHandler = watchlistTile.cellHandler;
		var market = $row.data("market");
		
		cellHandler.emit("changeMarket", market);
		//watchlistTile.watchlist.removeMarket(market);
	}
	
	
	
	IDEX.WatchlistTile.prototype.addRow = function(market)
	{
		var watchlistTile = this;
		var $table = watchlistTile.watchlistTableDom;

		var keys = ["market", "lastBid", "lastAsk"]
		var obj = {}
		obj.market = market.marketName;
		obj.lastBid = "loading";
		obj.lastAsk = "loading";
		
		var row = IDEX.buildTableRows(IDEX.objToList([obj], keys), "table");
		row = $(row).get()[0]

		//$row.find("td:last").after("<td class='deleteMarketFavorite'>DELETE</td>");
		//row = IDEX.addElDataAttr(row, [obj], ["baseID", "relID"]);

		var $row = $(row);
		$row.data("market", market);
		$row.find("td").eq(1).addClass("watchlist-lastBid");
		$row.find("td").eq(2).addClass("watchlist-lastAsk");

		$table.find("tbody").append($row)
	}
	
	
	
	IDEX.WatchlistTile.prototype.temp = function()
	{
		var watchlistTile = this;

		var watchlist = watchlistTile.watchlist;
		var markets = watchlist.markets;

		var dfds = [];
		
		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			var watchlistMarketHandler = market.watchlistHandler;
			var isUpdating = watchlistMarketHandler.isUpdating;
			
			if (isUpdating)
			{
				dfds.push(watchlistMarketHandler.postDFD);
			}
			else
			{
				dfds.push(watchlistMarketHandler.update());
			}

		}		

		
		
		return dfds;
	}
	
	

	IDEX.WatchlistTile.prototype.callback = function(data, errorLevel)
	{
		var watchlistTile = this;
		var continuePolling = false;
		
		if (errorLevel == IDEX.TIMEOUT_CLEARED)
		{

		}
		else if (errorLevel == IDEX.AJAX_ABORT)
		{

		}
		else if (errorLevel == IDEX.AJAX_ERROR)
		{

		}
		else
		{
			continuePolling = true;
			var watchlist = watchlistTile.watchlist;

			var markets = watchlist.markets;
			
			for (var i = 0; i < markets.length; i++)
			{
				var market = markets[i];
				var watchlistMarketInfo = market.watchlistHandler.marketInfo;
				var lastBid = watchlistMarketInfo.lastBid;
				var lastAsk = watchlistMarketInfo.lastAsk;

				var $row = watchlistTile.watchlistTableDom.find("tbody tr").eq(i);
				$row.find("td").eq(1).text(String(lastBid));
				$row.find("td").eq(2).text(String(lastAsk));
			}
		}
		
		return continuePolling;
	}
	
	
	
	
	
	

	
	
	IDEX.WatchlistPopup = function(watchlistOverlord) 
	{	
		var watchlistPopup = this;
		watchlistPopup.watchlistOverlord = watchlistOverlord;
		
		watchlistPopup.watchlist = false;
		
		watchlistPopup.initDOM();
		watchlistPopup.initEventListeners();
	};
	
	
	IDEX.WatchlistPopup.prototype.initDOM = function()
	{
		var watchlistPopup = this;

		watchlistPopup.popupDOM = $("#marketSearch_popup");	
		
		watchlistPopup.bannerDOM = watchlistPopup.popupDOM.find(".banner");
		watchlistPopup.bannerTextDOM = watchlistPopup.bannerDOM.find("span");

		watchlistPopup.addMarketButton = watchlistPopup.popupDOM.find(".marketSearch-add-trig");
		
		watchlistPopup.formDOM = watchlistPopup.popupDOM.find(".marketSearch-popup-form");
		watchlistPopup.marketInputDOM = watchlistPopup.popupDOM.find("input[name=market]");

	}

	
	IDEX.WatchlistPopup.prototype.initEventListeners = function()
	{
		var watchlistPopup = this;


		watchlistPopup.addMarketButton.on("click", function() { watchlistPopup.onAddMarketButtonClick() });
	}
	

	IDEX.WatchlistPopup.prototype.editBanner = function(bannerStatus, message)
	{
		var watchlistPopup = this;
		
		watchlistPopup.bannerDOM.addClass("active");
		watchlistPopup.bannerDOM.addClass(bannerStatus);
		watchlistPopup.bannerTextDOM.text(message);
	}
	
	
	IDEX.WatchlistPopup.prototype.resetBanner = function()
	{
		var watchlistPopup = this;
		
		watchlistPopup.bannerDOM.removeClass("active success error");
	}
	
	
	IDEX.WatchlistPopup.prototype.clearInput = function()
	{
		var watchlistPopup = this;
		
		watchlistPopup.formDOM.find("input").each(function()
		{
			$(this).val("")
			$(this).data("market", "-1")
		})
	}
	

	
	IDEX.WatchlistPopup.prototype.onAddMarketButtonClick = function()
	{
		var watchlistPopup = this;
		var watchlistOverlord = watchlistPopup.watchlistOverlord;
		var watchlist = watchlistPopup.watchlist;
		var market = watchlistPopup.marketInputDOM.data("market");

		watchlistPopup.resetBanner();
		

		if (market != "-1")
		{
			var retbool = watchlist.addMarket(market);

			if (retbool)
			{
				watchlistPopup.editBanner("success", "Success: " + market.marketName + " added to watchlist.");
				watchlistPopup.clearInput();
			}
			else
			{
				watchlistPopup.editBanner("error", "Error: This market is already in your watchlist.")
			}
		}
		else
		{
			watchlistPopup.editBanner("error", "Error: You must choose a valid market")
		}

	}

	


	/*
	IDEX.Watchlist.prototype.onRowMouseover = function(e, $row)
	{
		var watchlist = this;
		var $target = $(e.target)
		var has = $target.hasClass("deleteMarketFavorite")

 		if (!has)
		{
			$row.addClass("allFavs-hover")
			//e.stopPropagation()
		}
		else
		{
			$row.removeClass("allFavs-hover")
		}
	}
	
	
	
	IDEX.Watchlist.prototype.onRowMouseleave = function(e, $row)
	{
		$row.removeClass("allFavs-hover")
	}*/
	
	
		/*var params = {}
		params.key = "beta_test";

		var format = {};
		format.rnum = 100;

		var query = {};
		query.section = "dat";
		query.segment = "qts";
		query.target = "qts_lst";
		query.params = {};
		query.params.exchange = fav.exchanges[0];
		query.params.source = "crypto";
		query.params.symbol = fav.pairID;


		params.format = format;
		params.query = query;
		

		
		IDEX.sendSkynetPost(params).done(function(data)
		{
			console.log(data)
			$row.find("td").eq(1).text(String(data.lastbid));
			$row.find("td").eq(2).text(String(data.lastask));
		})*/
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));