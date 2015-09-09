

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");

	IDEX.allCOpenOrders = [];
	
	
	
	
	IDEX.COpenOrder = function(obj) 
	{	
		this.hasMarket = false;
		
		this.cOpenOrderDom;
		this.searchInputDom;
		this.tableDom;
		this.cellHandler;
		

		IDEX.constructFromObject(this, obj);
	}
	
	
	
	IDEX.newCOpenOrder = function($el, cellHandler)
	{
		var cOpenOrder = IDEX.getObjectByElement($el, IDEX.allCOpenOrders, "cOpenOrderDom");

		if (!cOpenOrder)
		{
			cOpenOrder = new IDEX.COpenOrder();
			cOpenOrder.cellHandler = cellHandler;

			cOpenOrder.cOpenOrderDom = $el;
			cOpenOrder.searchInputDom = $el.find(".cm-openorders-search-wrap input");
			cOpenOrder.tableDom = cOpenOrder.cOpenOrderDom.find(".cm-openorders-table");
			cOpenOrder.refreshDom = $el.find(".refresh-wrap img");

			cOpenOrder.tableDom.parent().perfectScrollbar();
			
			IDEX.allCOpenOrders.push(cOpenOrder);
		}
		
				
		return cOpenOrder;
	}
	
	
	
	IDEX.COpenOrder.prototype.changeMarket = function(market)
	{
		var cOpenOrder = this;
		
		cOpenOrder.hasMarket = true;
		cOpenOrder.market = market;
		
		cOpenOrder.updateMarketDOM();
		cOpenOrder.updateOrders();
	}
	
	
	
	IDEX.COpenOrder.prototype.updateMarketDOM = function()
	{
		var cOpenOrder = this;
		cOpenOrder.searchInputDom.val(cOpenOrder.market.marketName);
	}
	
	
	
	$contentWrap.on("click", ".cm-openorders-search-popup-trig", function()
	{
		var $el = $(this).closest(".cm-openorders-wrap");
		var cOpenOrder = IDEX.getObjectByElement($el, IDEX.allCOpenOrders, "cOpenOrderDom");

		cOpenOrder.updateOrders();
	})
	
	
	
	IDEX.COpenOrder.prototype.updateOrders = function()
	{
		var cOpenOrder = this;

		if (cOpenOrder.hasMarket)
		{
			return
			cOpenOrder.tableDom.find("tbody").empty();
			var market = cOpenOrder.market;
			var openOrdersHandler = market.openOrdersHandler;
			//accountOpenOrders
			//updateOpenOrders
			openOrdersHandler.update().done(function()
			{
				var openOrders = marketHistoryMarket.marketHistory;
				
				for (var j = 0; j < openOrders.length; j++)
				{
					var openOrder = openOrders[j];
					cOpenOrder.addTableRow(openOrder);
				}
			})
		}
	}
	
	

	IDEX.COpenOrder.prototype.addTableRow = function(openOrder)
	{
		var cOpenOrder = this;
		//var time = openOrder.timestamp;
		var price = openOrder.price;
		var amount = openOrder.amount;
		var exchange = openOrder.exchange;
		var tradeType = openOrder.tradeType;
		var total = openOrder.total;
		var status = openOrder.status;
		
		var map = tradeType == "bid" ? "buy" : "sell";
		var tradeClass = "cm-orderType-" + map;
		
		var tr = "<tr><td>"+tradeType+"</td><td>"+String(price)+"</td><td>"+String(amount)+"</td><td>"+String(total)+"</td><td>"+String(exchange)+"</td><td>"+String(status)+"</td></tr>";
		
		var $tr = $(tr);
		$tr.find("td").eq(0).addClass(tradeClass);
		
		cOpenOrder.tableDom.find("tbody").append($tr);
	}
	
	
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
