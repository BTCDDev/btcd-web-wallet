	
	
var IDEX = (function(IDEX, $, undefined) 
{


	IDEX.User = function(obj)
	{
		this.allAssets = [];
		this.labels = [];
		this.options = {};
		this.favorites = {};
		
		this.curBase = {};
		this.curRel = {};
		this.pendingOrder = {};
		
		IDEX.constructFromObject(this, obj);
	}

	

	IDEX.User.prototype.initLabels = function()
	{
		var $table = $(".orderbook-label-popup-table")
		var orderbookLabels = [];
				
		if (localStorage.orderbookLabels)
		{
			orderbookLabels = JSON.parse(localStorage.getItem('orderbookLabels'));
		}

		for (var i = 0; i < orderbookLabels.length; i++)
		{
			var label = orderbookLabels[i];
			label.isActive = false;
			label.isVisible = false;
			IDEX.makeLabelStyle(label)
			var name = label.name
			var newRow = IDEX.buildLabelRow(name)
			
			$table.append($(newRow))
		}

		this.labels = orderbookLabels;
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
