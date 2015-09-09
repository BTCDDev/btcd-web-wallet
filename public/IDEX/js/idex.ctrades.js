

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");
	IDEX.allCTrades = [];
	
	
	
	IDEX.CTrade = function(obj) 
	{	
		this.hasMarket = false;
		
		this.cTradeDom;
		this.searchInputDom;
		this.tableDom;
		this.cellHandler;


		IDEX.constructFromObject(this, obj);
	}
	

	
	IDEX.newCTrade = function($el, cellHandler)
	{
		var cTrade = IDEX.getObjectByElement($el, IDEX.allCTrades, "cTradeDom");

		if (!cTrade)
		{
			cTrade = new IDEX.CTrade();
			cTrade.cellHandler = cellHandler;

			cTrade.cTradeDom = $el;
			cTrade.searchInputDom = $el.find(".cm-trades-search-wrap input");
			cTrade.tableDom = cTrade.cTradeDom.find(".cm-trades-table");

			cTrade.tableDom.parent().perfectScrollbar();
			
			IDEX.allCTrades.push(cTrade);
		}
		

				
		return cTrade;
	}
	
	
	
	IDEX.CTrade.prototype.changeMarket = function(market)
	{
		var cTrade = this;
		
		cTrade.hasMarket = true;
		cTrade.market = market;
		
		cTrade.updateMarketDOM();
		cTrade.updateTradeHistory();
	}
	
	
	
	IDEX.CTrade.prototype.updateMarketDOM = function()
	{
		var cTrade = this;
		cTrade.searchInputDom.val(cTrade.market.marketName);
	}
	
	
	
	$contentWrap.on("click", ".cm-trades-search-popup-trig", function()
	{
		var $el = $(this).closest(".cm-trades-wrap");
		var cTrade = IDEX.getObjectByElement($el, IDEX.allCTrades, "cTradeDom");

		cTrade.updateTradeHistory();
	})
	
	
	
	IDEX.CTrade.prototype.updateTradeHistory = function()
	{
		var cTrade = this;
		
		if (cTrade.hasMarket)
		{
			return
			cTrade.tableDom.find("tbody").empty();

			var market = cTrade.market;
			var tradeHistoryHandler = market.tradeHistoryHandler

			tradeHistoryHandler.update().done(function()
			{
				var trades = tradeHistoryHandler.tradeHistory;
				
				for (var j = 0; j < trades.length; j++)
				{
					var trade = trades[j];
					cTrade.addTableRow(trade);
				}
			})			
			
		}
	}
	
	

	IDEX.CTrade.prototype.addTableRow = function(trade)
	{
		var cTrade = this;
		var time = trade.timestamp;
		var price = trade.price;
		var amount = trade.amount;
		var exchange = trade.exchange;
		var tradeType = trade.tradeType;
		var total = trade.total;
		
		
		var tradeClass = "cm-orderType-" + tradeType;
		
		var tr = "<tr><td>"+time+"</td><td>"+String(tradeType)+"</td><td>"+String(price)+"</td><td>"+String(amount)+"</td><td>"+String(total)+"</td><td>"+String(exchange)+"</td></tr>";
		
		var $tr = $(tr);
		$tr.find("td").eq(1).addClass(tradeClass);
		
		cTrade.tableDom.find("tbody").append($tr);

	}
	
	
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
