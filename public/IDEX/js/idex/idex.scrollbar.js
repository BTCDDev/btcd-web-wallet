

var IDEX = (function(IDEX, $, undefined) 
{


	IDEX.initScrollbar = function()
	{
		$(".orderbook-label-popup-table").perfectScrollbar();
		$(".idex-basic-content").perfectScrollbar();
	}

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
