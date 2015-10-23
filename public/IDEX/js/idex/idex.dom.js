

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $loadingOverlay = $(".loading-overlay")
	var $loadingPopup = $(".loading-screen")
	var $loadingText = $(".loading-text").find("span");
	
	
	IDEX.showLoading = function()
	{
		$loadingOverlay.addClass("active");
		$loadingPopup.addClass("active");
	}
	
	IDEX.hideLoading = function()
	{
		var $loadingOverlay = $("body").find(".loading-overlay");
		var $loadingPopup = $("body").find(".loading-screen");
		
		$loadingOverlay.removeClass("active");
		$loadingPopup.removeClass("active");
	}
	
	IDEX.editLoading = function(text)
	{
		$loadingText.text(text);
	}
	
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));
