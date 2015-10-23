

var IDEX = (function(IDEX, $, undefined)
{
	
	var $contentWrap = $("#content_wrap");

	

	$contentWrap.on("click", ".order-row.own-order", function()
	{
		var order = IDEX.getRowData($(this), $(this).index());
		console.log(order);
		
	})
	
	
	
	$contentWrap.on("click", ".order-row:not(.expiredRow):not(.own-order)", function(e)
	{
		var $target = $(e.target)
		var has = $target.hasClass("vert-align")
		
		if (!has)
		{
			var bookID = $(this).closest(".bookname").attr("data-book").toLowerCase();
			var rowIndex = $(this).index();
			var order = IDEX.getRowData($(this), rowIndex);

			if (!tempCheck(order))
				return;
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
	
	function tempCheck(order)
	{
		var ret = false;
		if (order)
		{
			var trades = order.trades;
			if (trades)
			{
				for (var i = 0; i < trades.length; i++)
				{
					var trade = trades[i];
					var exchange = trade.exchange;
					ret = true;
					if (exchange != "InstantDEX")
					{
						ret = false;
						break;
					}
				}
			}
		}
		
		return ret
	}
	
	
	
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
			var $baseAsset = $form.find("input[name=base]");
			var baseAsset = $baseAsset.data("asset");
			var $relAsset = $form.find("input[name=rel]");
			var relAsset = $relAsset.data("asset");
			$banner.removeClass("active");

			console.log(baseAsset, relAsset);
			if (baseAsset != "-1" && relAsset != "-1")
			{
				var market = IDEX.marketOverlord.makeVirtual(baseAsset, relAsset);
				orderbook.changeMarket(market);
				//orderbook.cellHandler.emit("changeMarket", market);
				
				clearAssetInput($wrap);
				$popup.find(".popup-header-close").trigger("click");
			}
			else
			{
				$banner.addClass("error")
				$banner.find("span").text("Error: You must choose valid assets")
			}
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
	

	

	
	

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));