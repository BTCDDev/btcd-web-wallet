

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.Orderbook.prototype.formatOrderbookData = function(orderbookData)
	{
		var orderbook = this;

		formatOrderData(orderbookData.bids, false);
		formatOrderData(orderbookData.asks, true);
		
		formatOrderNumbers(orderbookData.bids, orderbookData.asks);

		orderbook.groupedBids = groupOrders(IDEX.cloneListOfObjects(orderbookData.bids), IDEX.cloneListOfObjects(orderbook.currentOrderbook.bids));
		orderbook.groupedAsks = groupOrders(IDEX.cloneListOfObjects(orderbookData.asks), IDEX.cloneListOfObjects(orderbook.currentOrderbook.asks));

		formatNewOrders(orderbook.groupedBids.newOrders, false, orderbook)
		formatNewOrders(orderbook.groupedAsks.newOrders, true, orderbook)
	}

	
	function formatOrderData(orders, isAsk)
	{
		var len = orders.length;
		var runningTotal = 0;
		orders.sort(IDEX.compareProp('price'))
		if (!isAsk)
			orders.reverse();
		var loopStart = isAsk ? len - 1 : 0;
		var loopEnd = isAsk ? -1 : len;
		var loopInc = isAsk ? -1 : 1;

		for (var i = loopStart; i != loopEnd; i += loopInc)
		{
			var order = orders[i];
			order.rawData = $.extend(true, {}, order);

			order.index = i;
			order.price = IDEX.toSatoshi(order.price).toFixed(8);
			order.volume = IDEX.toSatoshi(order.volume).toFixed(6);
			order.total = IDEX.toSatoshi(order.price*order.volume).toFixed(6);
			runningTotal = (Number(runningTotal) + Number(order['total'])).toFixed(6);
			order.sum = runningTotal;
			order.askoffer = isAsk ? 1 : 0;
		}
	}
	
	
	function formatOrderNumbers(newBids, newAsks)
	{
		var keys = ['price', 'volume', 'total', 'sum'];
		var len = newBids.length;
		var allBidNumbers = IDEX.getListObjVals(newBids, keys);
		var allAskNumbers = IDEX.getListObjVals(newAsks, keys);

		for (var i = 0; i < keys.length; i++)
		{
			var key = keys[i];
			var allNumbers = IDEX.formatNumberWidth(allBidNumbers[key].concat(allAskNumbers[key]), 6);
			var asks = allNumbers.splice(len);
			var bids = allNumbers;
			
			newBids = IDEX.setListObjVals(newBids, key, bids);
			newAsks = IDEX.setListObjVals(newAsks, key, asks);
		}

	}


	function groupOrders(orders, currentOrders)
	{
		var oldOrders = [];
		var newOrders = [];
		var expiredOrders = [];
		
		for (var i = 0; i < orders.length; i++)
		{
			var order = orders[i];
			var isNew = true;

			for (var j = 0; j < currentOrders.length; j++)
			{
				var currentOrder = currentOrders[j];

				if (compOrders(order, currentOrder))
				{
					order['index'] = currentOrder['index'];
					oldOrders.push(order);
					currentOrders.splice(j, 1);
					isNew = false;
					break;
				}
			}
			
			if (isNew)
				newOrders.push(order);
		}

		expiredOrders = currentOrders;

		return {'expiredOrders':expiredOrders, 'newOrders':newOrders, 'oldOrders':oldOrders};
	}

	
	function compOrders(order, currentOrder)
	{
		var ret = true;
		
		if (order.trades.length == currentOrder.trades.length)
		{
			for (var i = 0; i < order.trades.length; i++)
			{
				if (!IDEX.compObjs(order.trades[i], currentOrder.trades[i], ['orderprice', 'ordervolume', 'exchange']))
				{
					ret = false;
					break;
				}
			}
		}
		else
		{
			ret = false;
		}
		
		return ret;
	}
	

	function formatNewOrders(newOrders, isAsk, orderbook)
	{	
		for (var i = 0; i < newOrders.length; i++)
		{
			var order = newOrders[i];
			
			var arr = isAsk ? [[order.price, order.volume, order.total, order.sum]] : [[order.total, order.volume, order.price, order.sum]];
			var trString = IDEX.buildTableRows(arr, "span");

			
			//var trClasses = (order['exchange'] == "nxtae_nxtae" || order['exchange'] == "nxtae") ? "fadeSlowIndy tooltip" : "fadeSlowIndy tooltip";
			//trClasses += IDEX.isOrderbookExpanded ? " order-row-expand" : "";
			//trString = orderTooltip(trString, order);
			
			var trClasses = "fadeSlowIndy";
			//trClasses += (order['offerNXT'] == IDEX.allExchanges.nxtae.nxtID) ? " own-order" : "";
			trClasses += " " + getLabelClass(order, orderbook)
			
			trString = IDEX.addElClass(trString, trClasses);
			
			trString = $(trString).find("span").each(function(index, e)
			{
				var extraClasses = "order-col-extra";
				if (index == 3)
				{
					//if (IDEX.isOrderbookExpanded)
					//	extraClasses += " extra-show";
					$(this).addClass(extraClasses);
				}
			}).parent()[0].outerHTML;
			

			//trString = $(trString).prepend("<div class='order-row-inspect-trig'><img class='vert-align' src='img/eye.png'></div>")[0].outerHTML;
			
			order.row = trString;
		}	
	}
	
	
	function getLabelClass(order, orderbook)
	{
		var labelClass = "";
		var vis = orderbook.labels

		for (var i = 0; i < vis.length; i++)
		{
			var label = vis[i]
			
			if (order.trades[0].exchange == label.exchange)
			{
				labelClass = "label-" + label.name
			}

		}
		
		return labelClass
	}
	
	
	function orderTooltip(row, rowData)
	{
		var nxt = "";
		var exchange = rowData['exchange']
		
		if (exchange == "InstantDEX" || exchange == "nxtae")
			nxt = IDEX.toRS(rowData['NXT']);
		else
			return row;
		
		return $(row).tooltipster(
		{
			'minWidth':240,
			'content':$("<div style='display:block'><img src='img/user.png' height='15px' width='20px'></img> "+ nxt +"</div>"),
		})
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));