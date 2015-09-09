

Sleuthgrids = (function(Sleuthgrids) 
{
	var $contentWrap = $("#content_wrap");
	

	$(window).on("beforeunload", function()
	{
		var saves = Sleuthgrids.saveAllGrids();
		
		//console.log(saves);
		localStorage.setItem('grids', JSON.stringify(saves));
	})
	
	
	
	$(window).resize(function(e)
	{
		Sleuthgrids.resizeAllGrids();
	})
	
	
	
	$(".util-grid-newTab").on("click", function()
	{
		var numGrids = Sleuthgrids.allGrids.length;
		
		if (numGrids >= 5)
		{
			$.growl.warning({'message':"Limit of 5 grids reached", 'location':"tl"});
		}
		else
		{
			var grid = new Sleuthgrids.Grid();
			grid.gridTab.gridTabDOM.trigger("click");
		}
	})
	
	
	
	$(document).on("mousemove", function(e)
	{
		if (Sleuthgrids.isGridTrig)
		{
			Sleuthgrids.updateTileAddPos(e)
		}
	})
	
	
	
	$(document).on("mousedown", function(e)
	{	
		var $tile = $(e.target).closest(".tile")
		var $grid = $contentWrap.find(".grid.active");

		if ($grid.length)
		{
			if (!$tile.length && !$(e.target).hasClass("tile"))
			{

				$grid.find(".tile-cells").removeClass("focus-border");
				$grid.find(".tile-header-tab").removeClass("focus-border");
			}
		}
	})
	
	

	$(".grid-trig").on("mousedown", function(e)
	{
		$(this).addClass("mousedown");

		var cellType = $(this).attr("data-grid");
		
		
		Sleuthgrids.isGridTrig = true;
		Sleuthgrids.isTriggeredNew = true;
		Sleuthgrids.triggeredType = cellType;
	})



	$(".grid-trig").on("mouseleave", function(e)
	{
		if (Sleuthgrids.isGridTrig)
		{
			var $grid = $contentWrap.find(".grid.active");
			
			if ($grid.length)
			{
				var has = $tileAdd.hasClass("active")
				
				if (!has)
				{
					Sleuthgrids.updateTileAddPos(e)	
					$tileAdd.addClass("active");
					$grid.find(".grid-arrow").addClass("active");
					
					var hasGrids = $grid.find(".tile").length;
					
					if (!hasGrids)
					{
						$grid.find(".grid-arrow-middle").addClass("active");
					}
				}
				
				Sleuthgrids.updateTileAddPos(e)
			}
		}
	})



	$(document).on("mouseup", function(e)
	{
		$(".grid-arrow-middle").removeClass("active");

		if (Sleuthgrids.isGridTrig)
		{
			Sleuthgrids.isGridTrig = false;
			Sleuthgrids.triggeredCell = null;
			$tileAdd.removeClass("active");
			$(".grid-arrow").removeClass("active");
			$(".tile-arrow-wrap").removeClass("active");
			$(".grid-trig").removeClass("mousedown");
		}
		
		if (Sleuthgrids.isResizing)
		{
			var allGrids = Sleuthgrids.allGrids;
			
			for (var i = 0; i < allGrids.length; i++)
			{
				var grid = allGrids[i];
				grid.toggleTileResizeOverlay(false);
				grid.resizeTileCells();
				//grid.resizeTiles();
			}
		}
		
		Sleuthgrids.isResizing = false;
		Sleuthgrids.resizeTile = null;
		Sleuthgrids.resizeDir = "";
	})
	
	
	
	/*
	
	$(".mainHeader-menu-ico-orders").on("click", function()
	{
		var saves = Sleuthgrids.saveAllGrids();
		
		console.log(saves);
		localStorage.setItem('grids', JSON.stringify(saves));
	})
	
	
	$(".mainHeader-menu-ico-markets").on("click", function()
	{
		var saves = JSON.parse(localStorage.getItem('grids'));
		console.log(saves);
		console.log(JSON.stringify(saves))
	})
	
	*/
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	


