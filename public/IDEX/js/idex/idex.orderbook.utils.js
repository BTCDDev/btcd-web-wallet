

var IDEX = (function(IDEX, $, undefined)
{
	
	
	IDEX.getRowData = function($row, index)
	{
		var $orderbook = $row.closest(".orderbook-wrap");
		var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
		var rowData = null;
		
		if (orderbook)
		{
			var isAsk = ($row.closest(".bookname").attr('data-book') == "buyBook") ? "bids" : "asks";
			rowData = index >= orderbook.currentOrderbook[isAsk].length ? null : orderbook.currentOrderbook[isAsk][index];
		}
		
		return rowData;
	}
	
	
	IDEX.Orderbook.prototype.emptyOrderbook = function(price)
	{
		var orderbook = this;
		
		orderbook.buyBookDom.find(".twrap").empty();
		orderbook.sellBookDom.find(".twrap").empty();
	}
	
	
	IDEX.Orderbook.prototype.toggleStatusText = function(toggleState, status)
	{
		var orderbook = this;
		var $statusText = orderbook.orderbookDom.find(".orderbook-statusText");
		var toggleClass = toggleState
		var func = toggleState ? "addClass" : "removeClass";

		if (typeof status !== "undefined")
		{
			var text = status == "loading" ? "Loading..." : "Error loading orderbook";
			$statusText.find("span").text(text);
		}
		$statusText[func]("active");
	}
	

	
	IDEX.Orderbook.prototype.updateLastPrice = function()
	{

	}
	

	IDEX.Orderbook.prototype.animateOrderbook = function()
	{
		var orderbook = this;
		
		orderbook.orderbookDom.find(".twrap .order-row.expiredRow").remove();
		orderbook.updateScrollbar(false)
		orderbook.orderbookDom.find(".newrow .order-col").addClass("fadeSlowIndy")
		orderbook.orderbookDom.find(".newrow").removeClass("newrow");
	}
	
	IDEX.Orderbook.prototype.updateScrollbar = function(toBottom)
	{
		var orderbook = this;
		//if (toBottom)
			//$("#sellBook").scrollTop($("#sellBook").prop("scrollHeight"));
		orderbook.buyBookDom.perfectScrollbar('update');
		orderbook.sellBookDom.perfectScrollbar('update');
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));