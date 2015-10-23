

var IDEX = (function(IDEX, $, undefined)
{

	var $contentWrap = $("#content_wrap");

	IDEX.allOrderbooks = [];
	
	
	
	IDEX.OrderbookVar = function(obj) 
	{	
		this.nxtRS = "";
		this.pair = "";
		this.orderbookID = "";
		
		this.asks = [];
		this.bids = [];

		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.Orderbook = function($orderbook, cellHandler) 
	{	
		var orderbook = this;
		
		orderbook.currentOrderbook;
		orderbook.newOrderbook;
		
		orderbook.isBasic = false;

		orderbook.groupedBids = {};
		orderbook.groupedAsks = {};
		
		orderbook.labels = [];
		orderbook.exchange = "active";
		
		orderbook.market;
		orderbook.cellHandler = cellHandler;

		
		orderbook.initDOM($orderbook);
		orderbook.pollHandler = new IDEX.PollHandler(5000, function() {return orderbook.orderbookPost()}, function(data, errorLevel) {return orderbook.pollCallback(data, errorLevel)}, orderbook.lastUpdatedDom);
		orderbook.orderbox;

	};
	
	
	IDEX.Orderbook.prototype.initDOM = function($orderbook)
	{
		var orderbook = this;
		
		orderbook.orderbookDom = $orderbook;
		orderbook.buyBookDom = $orderbook.find(".bookname-buybook");
		orderbook.emptyBuyBookDom = orderbook.buyBookDom.find(".empty-orderbook");
		orderbook.sellBookDom = $orderbook.find(".bookname-sellbook");
		orderbook.emptySellBookDom = orderbook.sellBookDom.find(".empty-orderbook");
		orderbook.searchInputDom = $orderbook.find(".orderbook-search-wrap input");
		orderbook.lastUpdatedDom = $orderbook.find(".orderbook-lastUpdated");
		
		orderbook.buyBookDom.perfectScrollbar();
		orderbook.sellBookDom.perfectScrollbar();
	}
	
	
	
	IDEX.newOrderbook = function($el, cellHandler)
	{
		var orderbook = IDEX.getObjectByElement($el, IDEX.allOrderbooks, "orderbookDom");
		var orderbox = IDEX.getObjectByElement($el, IDEX.allOrderboxes, "orderboxDom");

		if (!orderbook)
		{
			orderbook = new IDEX.Orderbook($el, cellHandler);

			IDEX.allOrderbooks.push(orderbook)
			
			orderbook.initLabelsDom();
		}
		if (!orderbox)
		{
			var $orderbox = $el.find(".orderbox-all")
			var orderbox = IDEX.newOrderbox($orderbox, cellHandler)
			orderbook.orderbox = orderbox;
		}
		

		orderbook.currentOrderbook = new IDEX.OrderbookVar();
				
		return orderbook;
	};
	
	
	
	IDEX.Orderbook.prototype.initLabelsDom = function()
	{
		var orderbook = this;
		
		for (var i = 0; i < IDEX.user.labels.length; i++)
		{
			var label = IDEX.user.labels[i];
			var name = label.name;
			
			var listVisDOM = "<div class='orderbook-label-dropdown-vis'><img src='img/eye.png'></div>";
			var listTextDOM = "<div class='orderbook-label-dropdown-name'><span class=''>" + name + "</span></div>";

			var li = "<li class='label-"+name+"' data-val='"+name+"'>" + listTextDOM + listVisDOM +"</li>";
			orderbook.orderbookDom.find(".orderbook-label-dropdown ul").append($(li));
		}
	}

	
	IDEX.Orderbook.prototype.updateMarketDom = function()
	{
		var orderbook = this;
		var base = orderbook.market.base.name;
		var rel = orderbook.market.rel.name;
		
		orderbook.searchInputDom.val(base + "_" + rel);
		
		orderbook.orderbookDom.find(".refcur-base").text(base);
		orderbook.orderbookDom.find(".refcur-rel").text(rel);
	}
	
	
	
	IDEX.Orderbook.prototype.changeMarket = function(market)
	{
		var orderbook = this;
		var pollHandler = orderbook.pollHandler;
		
		orderbook.market = market;

		orderbook.emptyOrderbook("Loading...");
		
		orderbook.updateMarketDom();
		orderbook.updateExchangesDom();
		
		if (!orderbook.isBasic)
			orderbook.orderbox.changeMarket(market);
		
		if (!pollHandler.isStoppingPolling)
		{
			pollHandler.stopPolling(function()
			{
				orderbook.toggleStatusText(true, "loading");

				orderbook.currentOrderbook = new IDEX.OrderbookVar();

				orderbook.orderbookDom.find(".empty-orderbook").hide();
				pollHandler.poll(1);
			});
		}
	}
	
	IDEX.Orderbook.prototype.changeExchange = function(exchangeName)
	{
		var orderbook = this;
		var pollHandler = orderbook.pollHandler;

		orderbook.emptyOrderbook("Loading...");
		if (!pollHandler.isStoppingPolling)
		{
			pollHandler.stopPolling(function()
			{
				orderbook.exchange = exchangeName;

				orderbook.currentOrderbook = new IDEX.OrderbookVar();

				orderbook.orderbookDom.find(".empty-orderbook").hide();
				pollHandler.poll(1);
			});
		}
	}
	
	
	IDEX.removeOrderbook = function($orderbook)
	{
		var orderbook = false;
		
		for (var i = 0; i < IDEX.allOrderbooks.length; i++)
		{
			var loopOrderbook = IDEX.allOrderbooks[i];
			var $loopOrderbook = loopOrderbook.orderbookDom
						
			if ($orderbook.is($loopOrderbook))
			{
				orderbook = loopOrderbook;
				break;
			}
		}
				
		if (orderbook)
		{
			orderbook.pollHandler.stopPolling();
			IDEX.allOrderbooks.splice(i, 1);
		}
	}
	
	
	
	IDEX.Orderbook.prototype.pollCallback = function(orderbookData, errorLevel)
	{
		var orderbook = this;
		var continuePolling = false;
		orderbook.toggleStatusText(false);

		if (errorLevel == IDEX.TIMEOUT_CLEARED)
		{

		}
		else if (errorLevel == IDEX.AJAX_ABORT)
		{

		}
		else if (errorLevel == IDEX.AJAX_ERROR)
		{
			orderbook.orderbookDom.find(".empty-orderbook").hide();
			orderbook.emptyOrderbook("Error loading orderbook");
			orderbook.toggleStatusText(true, "Error loading orderbook");
		}
		else
		{
			continuePolling = true;
			
			if ($.isEmptyObject(orderbookData))
			{
				orderbook.currentOrderbook = new IDEX.OrderbookVar(orderbookData);
				orderbook.emptyOrderbook();
				orderbook.orderbookDom.find(".empty-orderbook").show();
				orderbook.updateScrollbar(false);
			}
			else
			{
				orderbook.formatOrderbookData(orderbookData);
				orderbook.updateOrders(orderbook.buyBookDom.find(".twrap"), orderbook.groupedBids);
				orderbook.updateOrders(orderbook.sellBookDom.find(".twrap"), orderbook.groupedAsks);
				
				orderbook.updateLastPrice(orderbookData);
				orderbook.animateOrderbook();
				orderbook.currentOrderbook = new IDEX.OrderbookVar(orderbookData);
			}
		}
		
		return continuePolling;
	}
	
	
	
	IDEX.Orderbook.prototype.orderbookPost = function()
	{
		var orderbook = this;
		var retDFD = new $.Deferred();
		var base = orderbook.market.base;
		var rel = orderbook.market.rel;
		
		var params = 
		{
			'plugin':"InstantDEX",
			'method':"orderbook", 
			'allfields':1,
			'exchange':orderbook.exchange,
			'tradeable':0
		};
		
		if (orderbook.market.isNxtAE)
		{
			params.baseid = base.assetID;
			params.relid = "5527630";
			//params.exchange = "nxtae";
		}
		else if (orderbook.market.isVirtualAsset)
		{
			params.base = base.assetID;
			params.rel = rel.assetID;
			params.exchange = "active";
		}
		else
		{
			params.base = base.name
			params.rel = rel.name
		}
		

		

		IDEX.sendPost(params, false).done(function(orderbookData)
		{
			if ("error" in orderbookData)
				orderbookData = {};

			retDFD.resolve(orderbookData);
			
		}).fail(function(data)
		{
			retDFD.resolve("fail")
		})
		
		
		return [retDFD];
	}

	
	IDEX.Orderbook.prototype.updateExchangesDom = function()
	{
		var orderbook = this;
		var market = orderbook.market;		
		var marketExchanges = market.exchanges;
		
		var $exchangeDropdownDOM = orderbook.orderbookDom.find(".orderbook-exchange-dropdown");
		var $exchangeDropdownListDOM = $exchangeDropdownDOM.find("ul");
		var $exchangeDropdownTitleDOM = $exchangeDropdownDOM.find(".orderbook-exchange-dropdown-title");
		$exchangeDropdownListDOM.empty();
		
		var listItems = [];

		listItems.push("<li class='active' data-val='active'>"+"All Exchanges"+"</li>");

		if (market.isNxtAE)
		{
			listItems.push("<li class='' data-val='InstantDEX'>"+"InstantDEX"+"</li>")
		}
			
		for (var i = 0; i < marketExchanges.length; i++)
		{
			var exchangeName = marketExchanges[i];
			
			var li = "<li data-val='"+exchangeName+"'>"+exchangeName+"</li>"
			listItems.push(li);
		}
		
		for (var i = 0; i < listItems.length; i++)
		{
			var $li = $(listItems[i]);
			$exchangeDropdownListDOM.append($li)
		}
		

		$exchangeDropdownTitleDOM.text("All Exchanges");
		orderbook.exchange = "active";
	}


	$contentWrap.on("click", ".orderbook-exchange-dropdown li", function()
	{
		var $orderbook = $(this).closest(".orderbook-wrap");
		var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
		
		var exchangeName = $(this).attr("data-val");

				
		if (orderbook)
		{
			orderbook.changeExchange(exchangeName);
		}
	})
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));