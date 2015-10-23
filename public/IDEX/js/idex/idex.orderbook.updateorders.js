	

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.Orderbook.prototype.updateOrders = function($book, orderData)
	{
		var orderbook = this;
		var isAsk = $book.parent().attr("data-book") == "buyBook";
		var isEmpty = true;
		
		for (key in orderData)
		{
			var check = orderData[key];
			if (check.length)
			{
				isEmpty = false;
				break;
			}
		}
		
		if (isEmpty)
			$book.parent().find(".empty-orderbook").show()
		else
			$book.parent().find(".empty-orderbook").hide()
					
					
		if (!($book.find(".order-row").length))
		{
			for (var i = 0; i < orderData.newOrders.length; i++)
				$book.append(orderData.newOrders[i].row)

			orderbook.updateScrollbar(true);
		}
		else
		{
			$book.find(".order-row").each(function(index, element)
			{
				var rowData = IDEX.getRowData($(this), index)
				
				//updateSum($(this), index, orderData, rowData);
				removeOrders($(this), orderData, index);
				
				if (isAsk)
					orderbook.addNewOrders($(this), orderData, rowData, index);
				else
					orderbook.addNewOrdersAsk($(this), orderData, rowData, index);
			})
		}
	}


	function updateSum($row, index, orderData, rowData)
	{
		for (var i = 0; i < orderData.oldOrders.length; i++)
		{
			var oldOrder = orderData.oldOrders[i];

			if (index == oldOrder.index && (Number(oldOrder.sum) != Number(rowData.sum)))
			{
				$row.find(".order-col").eq(3).text(String(oldOrder.sum));
			}
		}		
	}


	function removeOrders($row, orderData, index)
	{
		for (var i = 0; i < orderData.expiredOrders.length; i++)
		{
			var expiredOrder = orderData.expiredOrders[i];
			
			if (index == expiredOrder.index)
			{
				$row.addClass("expiredRow");
			}
		}
	}


	IDEX.Orderbook.prototype.addNewOrders = function($row, orderData, rowData, index, isAsk)
	{
		var orderbook = this;

		for (var i = 0; i < orderData.newOrders.length; i++)
		{
			var newOrder = orderData.newOrders[i];
			var trString = IDEX.addElClass(orderData.newOrders[i]['row'], "newrow");

			if (Number(newOrder.price) < Number(rowData.price))
			{
				var $sib = $row;
				
				while ($sib.next() && $sib.next().hasClass("newrow"))
					$sib = $sib.next();
				
				var sibData = IDEX.getRowData($sib, index+1)
				
				if (!sibData || Number(newOrder.price) >= Number(sibData.price))
					$sib.after($(trString));
				else
					break;
			}
			else
			{
				$row.before($(trString));
			}
			
			orderData['newOrders'].splice(i,1);
			--i;
		}
	}
	
	
	IDEX.Orderbook.prototype.addNewOrdersAsk = function($row, orderData, rowData, index)
	{
		var orderbook = this;
		
		for (var i = 0; i < orderData.newOrders.length; i++)
		{
			var newOrder = orderData.newOrders[i];
			var trString = IDEX.addElClass(orderData.newOrders[i]['row'], "newrow");

			if (Number(newOrder.price) > Number(rowData.price))
			{
				var $sib = $row;
				
				while ($sib.next() && $sib.next().hasClass("newrow"))
					$sib = $sib.next();
				
				var sibData = IDEX.getRowData($sib, index+1)
				
				if (!sibData || Number(newOrder.price) <= Number(sibData.price))
					$sib.after($(trString));
				else
					break;
			}
			else
			{
				$row.before($(trString));
			}
			
			orderData['newOrders'].splice(i,1);
			--i;
		}
	}

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));