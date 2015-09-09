

var IDEX = (function(IDEX, $, undefined)
{
	var $contentWrap = $("#content_wrap");
	var $popup = $("#marketSearch_popup");


	IDEX.allWatchlists = [];
	

	
	IDEX.WatchlistMarket = function(market) 
	{	
		var watchlistMarket = this;
		watchlistMarket.market = market;
		
		watchlistMarket.lastUpdated = -1;
		watchlistMarket.isUpdating = false;
		watchlistMarket.xhr = false;
		watchlistMarket.postDFD = false;
		
		watchlistMarket.marketInfo = 
		{
			lastBid: -1,
			lastAsk: -1
		};
	};
	
	
	IDEX.WatchlistMarket.prototype.update = function(forceUpdate)
	{
		var watchlistMarket = this;
		watchlistMarket.postDFD = new $.Deferred();
		var market = watchlistMarket.market;
		var time = new Date().getTime()
		var lastUpdatedTime = watchlistMarket.lastUpdated;

		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		if (!forceUpdate && ((time - lastUpdatedTime < 10000) && (lastUpdatedTime != -1)))
		{
			watchlistMarket.postDFD.resolve();
		}
		else
		{
			var isNxtAE = market.isNxtAE;
			var base = market.base;
			var rel = market.rel;
			
			var params = 
			{
				'plugin':"InstantDEX",
				'method':"orderbook", 
				'allfields':1,
				'exchange':market.exchanges[0],
				'tradeable':0,
				//'baseid':fav.base.assetID,
				//'relid':"5527630",
				'maxdepth':1
			};
			
			if (isNxtAE)
			{
				params.baseid = base.assetID;
				params.relid = "5527630";
				//params.exchange = "nxtae";
			}
			else
			{
				params.base = base.name;
				params.rel = rel.name;
			}
			
			watchlistMarket.isUpdating = true;
			IDEX.sendPost(params, false).done(function(data)
			{
				var lastBid = data.lastbid;
				var lastAsk = data.lastask;
				
				watchlistMarket.marketInfo.lastBid = lastBid;
				watchlistMarket.marketInfo.lastAsk = lastAsk;
				
				watchlistMarket.isUpdating = false;
				watchlistMarket.postDFD.resolve();
			})
		}
		
		watchlistMarket.lastUpdated = time;
		
		return watchlistMarket.postDFD.promise();
	}
	
	
	
	
	IDEX.WatchlistOverlord = function(obj) 
	{	
		var overlord = this;
		overlord.watchlists = [];
		overlord.watchlistMarkets = [];
	};
	
	


	IDEX.WatchlistOverlord.prototype.initLocalStorage = function()
	{
		var overlord = this;
		var markets = [];
				
		if (localStorage.watchlist)
		{
			markets = JSON.parse(localStorage.getItem('watchlist'));
		}
		
		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			var loadedMarket = IDEX.marketOverlord.expandMarket(market);
			overlord.watchlistMarkets.push(loadedMarket);
		}
	}
	
	
	IDEX.WatchlistOverlord.prototype.setLocalStorage = function()
	{
		var overlord = this;
		var watchlistMarkets = overlord.watchlistMarkets;
		var markets = [];
		
		for (var i = 0; i < watchlistMarkets.length; i++)
		{
			var market = watchlistMarkets[i];
			var marketMin = market.minimizeSelf();;
			markets.push(marketMin);
		}
		
		localStorage.setItem('watchlist', JSON.stringify(markets));

	}
	
	
	IDEX.WatchlistOverlord.prototype.addMarket = function(market)
	{
		var overlord = this;
		var retbool = false;

		var index = overlord.searchForMarket(market);
		
		if (index == -1)
		{
			overlord.watchlistMarkets.push(market);
			overlord.setLocalStorage();
			retbool = true;
		}

		return retbool
	}
	
	
	IDEX.WatchlistOverlord.prototype.removeMarket = function(market)
	{
		var overlord = this;
		var index = overlord.searchForMarket(market);
		
		if (index != -1)
		{
			overlord.watchlistMarkets.splice(index, 1);
			overlord.setLocalStorage();
		}
	}
	
	
	
	
	IDEX.WatchlistOverlord.prototype.searchForMarket = function(market)
	{
		var overlord = this;
		var markets = overlord.watchlistMarkets;
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
	


	
	
	IDEX.Watchlist = function(obj) 
	{	
		

	};
	
	
	IDEX.Watchlist.prototype.staticVar = (function()
	{
		IDEX.Watchlist.allMarkets = [];
	})();
	
	
	IDEX.newWatchlist = function($el, cellHandler)
	{
		var watchlist = IDEX.getObjectByElement($el, IDEX.allWatchlists, "watchlistDom");

		if (!watchlist)
		{
			watchlist = new IDEX.Watchlist();
			watchlist.cellHandler = cellHandler;
			watchlist.timeoutDFD = false;

			watchlist.watchlistDom = $el;
			watchlist.watchlistAddDom = $el.find(".watchlist-add");
			watchlist.watchlistTableDom = $el.find(".nTable");
			watchlist.refreshDom = $el.find(".refresh-wrap img");
			watchlist.loadingDom = $el.find(".watchlist-loading");

			watchlist.watchlistAddDom.on("click", function() { watchlist.toggleAddPopup(); } );
			watchlist.watchlistTableDom.on("click", "tbody tr", function(e) { watchlist.onRowClick(e, $(this)); } );
			//watchlist.refreshDom.on("click", function(){ watchlist.refreshClick() });

			//watchlist.watchlistTableDom.on("mouseover", "tbody tr", function(e) { watchlist.onRowMouseover(e, $(this)); } );
			watchlist.watchlistTableDom.parent().perfectScrollbar();

			
			IDEX.allWatchlists.push(watchlist)
			
			watchlist.initWatchlist();
		}

						
		return watchlist;
	};
	
		
	
	IDEX.Watchlist.prototype.toggleAddPopup = function()
	{		
		IDEX.togglePopup($popup, true, true);
	}
	
	
	
	IDEX.Watchlist.prototype.onRowClick = function(e, $row)
	{
		var watchlist = this;
		var cellHandler = watchlist.cellHandler;
		var market = $row.data("market");
		
		cellHandler.emit("changeMarket", market);
	}
	
	
	
	IDEX.Watchlist.prototype.addRow = function(market)
	{
		var watchlist = this;
		var $table = watchlist.watchlistTableDom;

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
	
	
	
	
	IDEX.Watchlist.prototype.initWatchlist = function()
	{
		var watchlist = this;
		var $watchlistLoading = watchlist.loadingDom;
		var markets = IDEX.watchlistOverlord.watchlistMarkets;
	
		//IDEX.toggleShow($watchlistLoading, true);
		
		for (var i = 0; i < markets.length; i++)
		{
			var market = markets[i];
			watchlist.addRow(market);
		}
		
		watchlist.watchlistMarkets = markets;
		watchlist.pollHandler(0);
	}
	
	
	IDEX.updateWatchlistTable = function(market)
	{
		var overlord = IDEX.watchlistOverlord;
		var allWatchlists = IDEX.allWatchlists;
		
		for (var i = 0; i < allWatchlists.length; i++)
		{
			var watchlist = allWatchlists[i];
			watchlist.addRow(market);
		}
	}
	
	
	
	
	IDEX.Watchlist.prototype.pollHandler = function(timeout)
	{
		var watchlist = this;
		
		watchlist.getWatchlistData(timeout).done(function(data, errorLevel)
		{
			timeout = 10000;

			//console.log([data, errorLevel]);
			
			if (errorLevel == IDEX.TIMEOUT_CLEARED)
			{
				return;
			}
			else if (errorLevel == IDEX.AJAX_ABORT)
			{
				return;
			}
			else if (errorLevel == IDEX.AJAX_ERROR)
			{

			}
			else
			{
				markets = watchlist.watchlistMarkets;
				
				for (var i = 0; i < markets.length; i++)
				{
					var market = markets[i];
					var watchlistMarketInfo = market.watchlistHandler.marketInfo;
					var lastBid = watchlistMarketInfo.lastBid;
					var lastAsk = watchlistMarketInfo.lastAsk;

					var $row = watchlist.watchlistTableDom.find("tbody tr").eq(i);
					$row.find("td").eq(1).text(String(lastBid));
					$row.find("td").eq(2).text(String(lastAsk));
				}
				
				if (!(watchlist.isStoppingPolling))
					watchlist.pollHandler(timeout);
			}
			
		})
	}
	
	IDEX.Watchlist.prototype.getWatchlistData = function(timeout)
	{
		var watchlist = this;
		var retDFD = new $.Deferred();

		watchlist.setTimeout(timeout).done(function(wasCleared)
		{
			if (wasCleared)
			{
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				var dfds = watchlist.temp();

				$.when.apply($, dfds).done(function(data)
				{				
					if (data == "fail")
					{
						retDFD.resolve({}, IDEX.AJAX_ERROR);
					}
					else if (watchlist.isStoppingOrderbook)
					{
						retDFD.resolve({}, IDEX.AJAX_ABORT);
					}
					else
					{
						
						retDFD.resolve(data, IDEX.OK);
					}
				});
				
			}
		})

		return retDFD.promise();
	}
	
	
	
	IDEX.Watchlist.prototype.temp = function()
	{
		var watchlist = this;
		var markets = watchlist.watchlistMarkets;

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
		
		if (!dfds.length)
		{
			dfds.push(new $.Deferred());
			dfds[0].resolve();
		}
		
		return dfds;
	}

	
	
	IDEX.Watchlist.prototype.setTimeout = function(timeout)
	{
		var watchlist = this;
		watchlist.timeoutDFD = new $.Deferred();
		
		watchlist.watchlistTimeout = setTimeout(function() 
		{
			watchlist.timeoutDFD.resolve(false);
			
		}, timeout);
		
		return watchlist.timeoutDFD.promise();
	}
	
	
	IDEX.Watchlist.prototype.clearTimeout = function()
	{
		var watchlist = this;

		if (watchlist.timeoutDFD)
		{
			clearTimeout(watchlist.watchlistTimeout);
			clearTimeout.timeoutDFD.resolve(true);
			clearTimeout.timeoutDFD = false;
		}
	}
	

	
	
	
	$(".marketSearch-add-trig").on("click", function()
	{
		var $wrap = $(this).closest(".popup");
		var $activeTab = $wrap.find(".tab-wrap.active");
		var searchType = $activeTab.attr("data-searchtype");
		var $form = $(".marketSearch-popup-form");
		
		var $banner = $wrap.find(".banner");
		$banner.removeClass("error")
		$banner.removeClass("success")
		$banner.addClass("active");
		
		if (searchType == "market")
		{
			var $market = $form.find("input[name=market]");
			var market = $market.data("market");
			$banner.removeClass("active");

			if (market != "-1")
			{
				var retbool = IDEX.watchlistOverlord.addMarket(market);

				if (retbool)
				{
					//watchlist.addRow(market);
					IDEX.updateWatchlistTable(market);
					$banner.addClass("success")
					$banner.find("span").text("Success: " + market.marketName + " added to watchlist.")
					clearAssetInput($wrap);
				}
				else
				{
					$banner.addClass("error")
					$banner.find("span").text("Error: This market is already in your watchlist.")
				}
			}
			else
			{
				$banner.addClass("error")
				$banner.find("span").text("Error: You must choose a valid market")
			}
		}

	})
	

	
	function clearAssetInput($wrap)
	{		
		$wrap.find("input").each(function()
		{
			$(this).val("")
			$(this).data("market", "-1")
		})
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