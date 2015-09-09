

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
		price = (typeof price === "undefined") ? '0.0' : price;
		
		this.buyBookDom.find(".twrap").empty();
		this.sellBookDom.find(".twrap").empty();
		
		//$("#currPair .order-text").text(this.baseAsset.name+"_"+this.relAsset.name);
		//$("#currLast .order-text").empty().text(price);
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
	

	
	IDEX.Orderbook.prototype.updateLastPrice = function(orderbookData)
	{
		var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0;
		
		//$("#currLast .order-text").text(Number(lastPrice).toFixed(8));	
	}
	

	IDEX.Orderbook.prototype.animateOrderbook = function()
	{
		this.orderbookDom.find(".twrap .order-row.expiredRow").remove();
		this.updateScrollbar(false)
		this.orderbookDom.find(".newrow .order-col").addClass("fadeSlowIndy")
		this.orderbookDom.find(".newrow").removeClass("newrow");
	}
	
	IDEX.Orderbook.prototype.updateScrollbar = function(toBottom)
	{
		//if (toBottom)
			//$("#sellBook").scrollTop($("#sellBook").prop("scrollHeight"));
		this.buyBookDom.perfectScrollbar('update');
		this.sellBookDom.perfectScrollbar('update');
	}
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));