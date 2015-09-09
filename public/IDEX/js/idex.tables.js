


var IDEX = (function(IDEX, $, undefined) 
{

	
	
	IDEX.buildTableRows = function(data, tableType)
	{
		var row = "";
		var rowWrap = "";
		var tdWrap = "";

		if (tableType == "table")
		{
			rowWrap = "<tr></tr>"
			tdWrap = "<td></td>";
		}
		else if (tableType == "span")
		{
			rowWrap = "<div class='order-row'></div>"
			tdWrap = "<span class='order-col'></span>";
		}
		
		for (var i = 0; i < data.length; ++i)
		{
			var td = "";

			for (var j = 0; j < data[i].length; ++j)
			{
				td += $(tdWrap).text(data[i][j])[0].outerHTML
			}
			
			row += $(td).wrapAll(rowWrap).parent()[0].outerHTML
		}

		return row;
	}

	
	

	/*
	
	var tables = {
		"openOrdersTable": {'method':"openorders", 'keys':"askoffer market price volume total quoteid age", 'firstKey':false, 'isDataTable':true},
		"marketOpenOrdersTable": {'method':"openorders", 'keys':"askoffer price volume total exchange", 'firstKey':false, 'isDataTable':false},
		"allOrderbooksTable": {'method':"allorderbooks", 'keys':"base rel last high low volume exchange", 'firstKey':"orderbooks", 'isDataTable':true},
		"tradeHistoryTable": {'method':"tradehistory", 'keys':"market priceNQTA priceNQTB NXT triggerhash", 'firstKey':"tradehistory", 'isDataTable':true},
		"balancesTable": {'method':"getAccountAssets", 'keys':"name assetID availableBalance unconfirmedBalance change", 'firstKey':false, 'isDataTable':true},
		"marketFavorites": {'method':"marketFavs", 'keys':"market baseID relID", 'firstKey':false, 'isDataTable':false}
	};
	
	if (tableName == "openOrdersTable")
	{	
		tableData = formatPairName(tableData);
		tableData = formatOpenOrders(tableData);
		row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
		row = $(row).each(function()
		{
			$(this).find("td:last").after("<td class='cancelOrder'>CANCEL</td>");
		})
		row = IDEX.addElDataAttr(row, tableData, ["quoteid"]);
	}
	
	else if (tableName == "marketOpenOrdersTable")
	{
		tableData = formatPairName(tableData);
		tableData = formatOpenOrders(tableData);
		row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
		row = $(row).each(function(e, i)
		{
			var bidAsk = $(this).find("td:first").text();
			var addClass = bidAsk == "Bid" ? "text-green" : "text-red";
			$(this).find("td:first").addClass(addClass);
			$(this).find("td:last").after("<td class='cancelOrder'>CANCEL</td>");
		})
		
		row = IDEX.addElDataAttr(row, tableData, ["quoteid"]);
	}
	*/

	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
