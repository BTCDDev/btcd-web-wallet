

var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.allCMarketHistory = [];

	
	IDEX.CMarketHistory = function() 
	{	
		var cMarketHistory = this;
		cMarketHistory.hasMarket = false;
		cMarketHistory.isBasic = false;
		cMarketHistory.cMarketHistoryDom;
		cMarketHistory.searchInputDom;
		cMarketHistory.tableDom;
		cMarketHistory.cellHandler;
	}
	

	
	IDEX.newCMarketHistory = function($el, cellHandler)
	{
		var cMarketHistory = IDEX.getObjectByElement($el, IDEX.allCMarketHistory, "cMarketHistoryDom");

		if (!cMarketHistory)
		{
			cMarketHistory = new IDEX.CMarketHistory();
			cMarketHistory.cellHandler = cellHandler;

			cMarketHistory.cMarketHistoryDom = $el;
			cMarketHistory.searchInputDom = $el.find(".cm-marketHistory-search-wrap input");
			cMarketHistory.refreshDom = $el.find(".refresh-wrap img");
			cMarketHistory.tableDom = cMarketHistory.cMarketHistoryDom.find(".cm-marketHistory-table");
			cMarketHistory.tableDom.parent().perfectScrollbar();

			cMarketHistory.refreshDom.on("click", function(){ cMarketHistory.refreshClick() });
			IDEX.allCMarketHistory.push(cMarketHistory);
		}
		

				
		return cMarketHistory;
	}
	
	
	IDEX.newBasicMarketHistory = function($el)
	{
		var cMarketHistory = new IDEX.CMarketHistory();
	
		cMarketHistory.cMarketHistoryDom = $el;
		cMarketHistory.isBasic = true;
		cMarketHistory.tableDom = cMarketHistory.cMarketHistoryDom.find(".cm-marketHistory-table");
		cMarketHistory.tableDom.parent().perfectScrollbar();

				
		return cMarketHistory;
	}
	
	
	IDEX.CMarketHistory.prototype.changeMarket = function(market)
	{
		var cMarketHistory = this;
		
		cMarketHistory.hasMarket = true;
		cMarketHistory.market = market;
		
		if (!cMarketHistory.isBasic)
			cMarketHistory.updateMarketDOM();
		cMarketHistory.updateMarketHistory();
	}
	
	
	
	IDEX.CMarketHistory.prototype.updateMarketDOM = function()
	{
		var cMarketHistory = this;
		cMarketHistory.searchInputDom.val(cMarketHistory.market.marketName);
	}
	
	
	
	IDEX.CMarketHistory.prototype.refreshClick = function()
	{
		var cMarketHistory = this;
		cMarketHistory.updateMarketHistory();
	}

	
	
	IDEX.CMarketHistory.prototype.updateMarketHistory = function()
	{
		var cMarketHistory = this;
		
		if (cMarketHistory.hasMarket)
		{
			cMarketHistory.tableDom.find("tbody").empty();

			var market = cMarketHistory.market;
			var marketHistoryHandler = market.marketHistoryHandler

			marketHistoryHandler.update(false, []).done(function()
			{
				var trades = marketHistoryHandler.marketHistory;

				for (var j = 0; j < trades.length; j++)
				{
					var trade = trades[j];
					cMarketHistory.addTableRow(trade);
				}
			})
		}
	}
	
	
	
	IDEX.CMarketHistory.prototype.addTableRow = function(trade)
	{
		var cMarketHistory = this;
		var time = trade.time;
		var price = trade.price;
		var amount = trade.amount;
		var exchange = trade.exchange;;
		var tradeType = trade.tradeType;
		
		
		var tradeClass = "cm-orderType-" + tradeType;
		
		var tr = "<tr><td>"+String(time)+"</td><td>"+String(price)+"</td><td>"+String(amount)+"</td><td>"+String(exchange)+"</td></tr>";
		
		var $tr = $(tr);
		$tr.find("td").eq(1).addClass(tradeClass);
		
		cMarketHistory.tableDom.find("tbody").append($tr);

	}
	
	
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
