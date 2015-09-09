	

var IDEX = (function(IDEX, $, undefined) 
{
	var $contentWrap = $("#content_wrap");
	
	
	
	$contentWrap.on("mousedown", ".orderbox-order-button", function()
	{
		$(this).addClass("order-button-mousedown")
	})
	$contentWrap.on("mouseup", ".orderbox-order-button", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	$contentWrap.on("mouseleave", ".orderbox-order-button", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	
	
	


	return IDEX;
	
}(IDEX || {}, jQuery));
