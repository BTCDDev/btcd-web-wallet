

var IDEX = (function(IDEX, $, undefined) 
{
	IDEX.allCBalances = [];

	
	
	IDEX.CBalance = function(obj) 
	{	
		this.hasMarket = false;
		
		this.cBalanceDom;
		this.searchInputDom;
		this.baseSec;
		this.relSec;

		this.cellHandler;

		IDEX.constructFromObject(this, obj);
	}
	
	
	IDEX.CBalanceType = function(type, $cBalanceDom, cBalance) 
	{	
		this.cBalance = cBalance;
		this.dom;
		this.type = type;
		this.balanceTitleDom;
		//this.balanceValDom
		this.tableDom;


		var __construct = function(that, type, $cBalanceDom)
		{
			that.dom = $cBalanceDom.find(".cm-balances-" + type);
			that.balanceTotalDOM = that.dom.find(".cm-balances-sing-balanceVal span");
			that.balanceTitleDom = that.dom.find(".cm-balances-sing-title span");
			//that.balanceValDom = that.dom.find(".orderbox-balance-val span");
			that.tableDom = that.dom.find(".cm-balances-sing-table");
			
			that.tableDom.parent().perfectScrollbar();

		}(this, type, $cBalanceDom)
	}
		
		
	
	
	IDEX.newCBalance = function($el, cellHandler)
	{
		var cBalance = IDEX.getObjectByElement($el, IDEX.allCBalances, "cBalanceDom");

		if (!cBalance)
		{
			cBalance = new IDEX.CBalance();
			cBalance.cellHandler = cellHandler;

			cBalance.cBalanceDom = $el;
			cBalance.searchInputDom = $el.find(".cm-balances-search-wrap input");
			cBalance.refreshDom = $el.find(".refresh-wrap img");

			cBalance.baseSec = new IDEX.CBalanceType("base", cBalance.cBalanceDom, cBalance);
			cBalance.relSec = new IDEX.CBalanceType("rel", cBalance.cBalanceDom, cBalance);
			cBalance.refreshDom.on("click", function(){ cBalance.refreshClick() });
			
			
			IDEX.allCBalances.push(cBalance)
		}
		
				
		return cBalance;
	}
	
	
	
	IDEX.CBalance.prototype.changeMarket = function(market)
	{
		var cBalance = this;
		
		cBalance.hasMarket = true;
		cBalance.market = market;
		
		cBalance.updateMarketDOM();
		cBalance.updateBalances();
	}
	
	
	
	IDEX.CBalance.prototype.updateMarketDOM = function()
	{
		var cBalance = this;
		cBalance.searchInputDom.val(cBalance.market.marketName);
		cBalance.baseSec.balanceTitleDom.text(cBalance.market.base.name);
		cBalance.relSec.balanceTitleDom.text(cBalance.market.rel.name);
	}
	
	
	
	IDEX.CBalance.prototype.updateBalances = function()
	{
		var cBalance = this;
		
		if (cBalance.hasMarket)
		{
			cBalance.baseSec.updateBalance();
			cBalance.relSec.updateBalance();
		}
	}
	
	
	
	IDEX.CBalance.prototype.refreshClick = function()
	{
		var cBalance = this;
	}
	
	
	
	IDEX.CBalanceType.prototype.updateBalance = function()
	{
		var cBalanceType = this;
		var isBase = cBalanceType.type == "base";
		var cBalance = cBalanceType.cBalance;
		var market = cBalance.market;
		
		var baseOrRel = isBase ? market.base : market.rel;
		cBalanceType.tableDom.find("tbody").empty();
		cBalanceType.balanceTotalDOM.text("0.00");

		baseOrRel.balanceHandler.update(false, IDEX.activeExchanges).done(function()
		{
			var balances = baseOrRel.balanceHandler.balance;
			var runningTotal = 0.00;

			for (var i = 0; i < balances.length; i++)
			{
				var balance = balances[i];

				var balanceExchange = balance.exchange;
				var isActiveExchange = !(IDEX.activeExchanges.indexOf(balanceExchange) == -1);
				runningTotal += balance.total;
				if (isActiveExchange)
				{
					cBalanceType.addTableRow(balance);
				}
			}
			
			cBalanceType.balanceTotalDOM.text(String(runningTotal));
		})
	}
	

	
	IDEX.CBalanceType.prototype.addTableRow = function(balance)
	{
		var cBalanceType = this;
		
		var total = balance.total;
		var available = balance.available;
		var unavailable = balance.unavailable;
		var exchange = balance.exchange;
		
		var tr = "<tr><td>"+exchange+"</td><td>"+String(unavailable)+"</td><td>"+String(available)+"</td><td>"+String(total)+"</td></tr>";

		cBalanceType.tableDom.find("tbody").append($(tr));

	}
	
	
	
	function parseBalance(balance)
	{
		var obj = {};
		obj.whole = "0";
		obj.dec = ".0";
		
		if (!($.isEmptyObject(balance)))
		{
			var amount = String(balance.unconfirmedBalance);
			var both = amount.split(".");
			
			obj.whole = both[0];
			if (both.length > 1)
				obj.dec	= "." + both[1];
		}	
		
		return obj;
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
