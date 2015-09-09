

var IDEX = (function(IDEX, $, undefined)
{
	
	var $contentWrap = $("#content_wrap");

	

	$contentWrap.on("click", ".order-row.own-order", function()
	{
		var order = IDEX.getRowData($(this), $(this).index());
		console.log(order);
		
	})
	
	
	
//	$("#buyBook, #sellBook").on("click", ".order-row:not(.own-order):not(.expiredRow)", function(e)
	$contentWrap.on("click", ".order-row:not(.expiredRow):not(.own-order)", function(e)
	{
		var $target = $(e.target)
		var has = $target.hasClass("vert-align")
		
		if (!has)
		{
			var bookID = $(this).closest(".bookname").attr("data-book").toLowerCase();
			var rowIndex = $(this).index(".bookname-"+bookID+" .order-row")
			var order = IDEX.getRowData($(this), rowIndex);
			
			var $orderbook = $(this).closest(".orderbook-wrap");
			var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
			
			var $orderbox = $orderbook.find(".orderbox-all");
			var orderbox = IDEX.getObjectByElement($orderbox, IDEX.allOrderboxes, "orderboxDom");
			
			
			IDEX.user.pendingOrder = order;

			
			IDEX.buildMakeofferModal(order, orderbook);

			
			//var isAsk = order.askoffer ? "Bid" : "Ask";
			//$("#place"+isAsk+"Price").val(order.price);
			//$("#place"+isAsk+"Amount").val(order.volume).trigger("keyup");
		}
	})
	
	
	
	$contentWrap.on("mouseover", ".order-row", function(e)
	{
		var $inspect = $(this).find(".order-row-inspect-trig")
		$inspect.addClass("active");

		var $target = $(e.target)
		var has = $target.hasClass("vert-align")

		if (!has)
		{
			$inspect.removeClass("inspectOrderHover")
		}
		else
		{
			$inspect.addClass("inspectOrderHover");
		}
	})
	
	
	
	$contentWrap.on("mouseleave", ".bookname .order-row", function(e)
	{
		var $inspect = $(this).find(".order-row-inspect-trig")
		$inspect.removeClass("active");
		$inspect.removeClass("inspectOrderHover");
	})
	
	
	$contentWrap.on("click", ".bookname .order-row-inspect-trig", function(e)
	{
		e.preventDefault();
		var $orderRow = $(this).parent();
		var bookID = $(this).closest(".bookname").attr("data-book").toLowerCase();
		var rowIndex = $orderRow.index(".bookname-"+bookID+" .order-row")
		var order = IDEX.getRowData($orderRow, rowIndex);
		
		console.log(order)
		console.log(JSON.stringify(order))
	})
	
	
	
	
	
	
	var $popup = $("#orderbookSearch_popup");
	
	
	$contentWrap.on("click", ".orderbook-search-popup-trig", function()
	{
		var $orderbook = $(this).closest(".orderbook-wrap");
		var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");

		var $banner = $popup.find(".banner");
		$banner.removeClass("active");
		//clearAssetInput();

		$popup.data("orderbook", orderbook);

		IDEX.togglePopup($popup, true, true);
	})
	
	
	$(".orderbookSearch-search-trig").on("click", function()
	{
		var $wrap = $(this).closest(".popup");
		var orderbook = $wrap.data("orderbook")
		
		var $activeTab = $wrap.find(".tab-wrap.active");
		var searchType = $activeTab.attr("data-searchtype");
		var $form = $activeTab.find(".orderbookSearch-popup-form");

		
		var $banner = $wrap.find(".banner");
		$banner.removeClass("error")
		$banner.removeClass("success")
		$banner.addClass("active");
		
		if (searchType == "market")
		{
			var $market = $form.find("input[name=market]");
			var market = $market.data("market");
			console.log(market);
			$banner.removeClass("active");

			if (market != "-1")
			{
				orderbook.changeMarket(market);
				orderbook.cellHandler.emit("changeMarket", market);
				
				clearAssetInput($wrap);
				$popup.find(".popup-header-close").trigger("click");
			}
			else
			{
				$banner.addClass("error")
				$banner.find("span").text("Error: You must choose a valid market")
			}
		}
		else if (searchType == "coin")
		{
			var $base = $form.find("input[name=baseid]");
			var $rel = $form.find("input[name=relid]");
			var baseid = $base.data("asset");
			var relid = $rel.data("asset");
			

			if (baseid != "-1" && relid != "-1")
			{
				orderbook.changeMarket(baseid, relid);

				clearAssetInput($wrap);
				$popup.find(".popup-header-close").trigger("click");
			}
			else
			{
				$banner.addClass("error")
				$banner.find("span").text("Error: You must choose two valid assets")
			}
		}
		else if (searchType == "basket")
		{
			
		}
		

	})
	

	function clearAssetInput($wrap)
	{		
		$wrap.find("input").each(function()
		{
			$(this).val("")
			$(this).data("asset", "-1")
		})
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
		

		if (market.isNxtAE)
			listItems.push("<li class='active' data-val='active'>"+"All Exchanges"+"</li>")
		else
			listItems.push("<li class='active' data-val='active'>"+"All Exchanges"+"</li>")
			
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
		
		if (false && market.isNxtAE)
		{
			$exchangeDropdownTitleDOM.text("nxtae");
			orderbook.exchange = "nxtae";
		}
		else
		{
			$exchangeDropdownTitleDOM.text("All Exchanges");
			orderbook.exchange = "active";

		}
	}

	
	
	$contentWrap.on("click", ".orderbook-exchange-dropdown li", function()
	{
		var $orderbook = $(this).closest(".orderbook-wrap");
		var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
		
		var exchangeName = $(this).attr("data-val");

				
		if (orderbook)
		{
			orderbook.emptyOrderbook("Loading...");
			if (!orderbook.isStoppingOrderbook)
			{
				orderbook.stopPollingOrderbook(function()
				{
					orderbook.exchange = exchangeName;

					orderbook.currentOrderbook = new IDEX.OrderbookVar();

					orderbook.orderbookDom.find(".empty-orderbook").hide();
					orderbook.orderbookHandler(1);
				});
			}
		}
	
	})
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));