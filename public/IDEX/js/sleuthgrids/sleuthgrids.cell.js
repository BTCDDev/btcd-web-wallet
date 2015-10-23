

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{
	
	var CellNav = Sleuthgrids.CellNav = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	CellNav.prototype = 
	{
		
		init: function(cell)
		{
			var cellNav = this;
			
			cellNav.cell = cell;
			cellNav.cellOverlord = cell.cellOverlord;
			
			cellNav.cellNavDOM;
			cellNav.navLinkDOM;
			
			cellNav.isActive = false;
			cellNav.isMoving = false;
			
			cellNav.initDOM();
			cellNav.initEventListeners();
			cellNav.changeCellLinkDOM();
		},
		
		
		
		initDOM: function()
		{
			var cellNav = this;
			var cell = cellNav.cell;
			var cellOverlord = cell.cellOverlord;;
			var index = cell.index;
			var cellType = cell.cellType;
			
			
			var $tileHeaderTab = $($("#tile_header_solo_template").html());
			var $tabWrap = $("<div/>", {'class':"tile-header-tab", 'data-tab':index} );
			$tileHeaderTab = $($tileHeaderTab.wrapAll($tabWrap).parent()[0].outerHTML);
			
			var title = Sleuthgrids.capitalizeFirstLetter(cellType);
			$tileHeaderTab.find(".tile-header-title").text(title);
			
			
			cellNav.cellNavDOM = $tileHeaderTab;
			cellNav.navLinkDOM = $tileHeaderTab.find(".tile-header-link");
			
			cellOverlord.cellHeaderDOM.append(cellNav.cellNavDOM);
		},
		
		
		
		initEventListeners: function()
		{
			var cellNav = this;
			var cell = cellNav.cell;
			var cellOverlord = cellNav.cellOverlord;
			var tile = cellOverlord.tile;
			
			
			cellNav.cellNavDOM.on("mousedown", function(e)
			{				
				//var hasCloseClass = $(e.target).hasClass("tile-header-close") || $(e.target).hasClass("tile-header-link");
				var has = $(e.target).hasClass("tile-header-tab");
				
				if (has)
				{		
					var mouseY = e.clientY
					var mouseX = e.clientX
					var tilePositions = tile.winPositions;
					
					var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions)
					
					if (!isInsideBorder.isInside)
					{
						cellNav.isMoving = true;
					}
				}
			})
			
			
			cellNav.cellNavDOM.on("mouseup", function(e)
			{
				cellNav.isMoving = false;
			})
			
			
			cellNav.cellNavDOM.on("mouseout", function(e)
			{	
				if (cellNav.isMoving)
				{
					Sleuthgrids.toggleTileAdd(true);
					$(".grid-arrow").addClass("active");

					Sleuthgrids.updateTileAddPos(e);
					
					Sleuthgrids.isGridTrig = true;
					Sleuthgrids.triggeredCell = cell;
					Sleuthgrids.isTriggeredNew = false;
					cellNav.isMoving = false;
					
					/*
					//tile.closeTile(tileNavCell);
					
					var grid = cellNav.cell.cellOverlord.tile.tileOverlord.grid;
					var gridPositions = grid.currentGridPositions;
					var mouseX = e.clientX - gridPositions.left;
					var mouseY = e.clientY - gridPositions.top;

					console.log(gridPositions);
					console.log(mouseX);
					tile.tileDOM.animate({left:mouseX-150, top:mouseY, width:"300px", height:"250px"}, 400);
					tile.toggleTileOverlay(true);
					tile.tileOverlord.closeTileResizer();
					// tile.tileDOM.animate({}, 400);
					*/
				}
			})
			
			
			cellNav.cellNavDOM.on("mousedown", function(e)
			{
				cellNav.changeCellTabs(e);
			})
			
	
			cellNav.cellNavDOM.find(".tile-header-close").on("click", function()
			{
				tile.closeTile(cellNav);
			})
			
			
			cellNav.navLinkDOM.find(".dropdown-list li").on("click", function(e)
			{
				cellNav.cellLinkClick($(this))
			})
		},
		
		
		
		unbindEventListeners: function()
		{
			var cellNav = this;
			cellNav.cellNavDOM.off();
			cellNav.cellNavDOM.find("*").off();
		},
		
		
		
		cellLinkClick: function($li)
		{
			var cellNav = this;
			var cell = cellNav.cell;
			var cellOverlord = cellNav.cellOverlord;
			var handler = cell.handler;
			
			var $wrap = $li.closest(".dropdown-list-wrap");
			var $ul = $li.closest("ul");

			var linkIndex = $li.attr("data-val");	
			var title = $li.text();

			$ul.find("li").removeClass("active");
			$li.addClass("active");
			
			$wrap.find(".dropdown-title span").text(title);
			$wrap.trigger("mouseleave");
			
			cell.linkIndex = linkIndex;
			
			var linkedCells = cellOverlord.getLinkedCells(cell, false);
						

			for (var i = 0; i < linkedCells.length; i++)
			{
				var linkedCell = linkedCells[i];

				var market = linkedCell.handler.getMarket();

				if (market)
				{
					handler.call("changeMarket", market);
					break;
				}
			}
		},
		
		
		
		changeCellLinkDOM: function()
		{
			var cellNav = this;
			var cell = cellNav.cell;
			var linkIndex = cell.linkIndex;

			var $navLinkWrap = cellNav.navLinkDOM;
			var $title = $navLinkWrap.find(".tile-header-link-title span");
			var $activeLink = $navLinkWrap.find("li[data-val='"+String(linkIndex)+"']");
			var title = $activeLink.text();
			
			$navLinkWrap.find("li").removeClass("active");
			$activeLink.addClass("active");
			$title.text(title);
		},
		
		
		
		changeCellTabs: function(e)
		{
			if (e && $(e.target).hasClass("tile-header-close"))
			{
				return;
			}
			
			var cellNav = this;
			var cell = cellNav.cell;
			var cellOverlord = cellNav.cellOverlord;
			
			cellOverlord.hideAllCells();
			cellOverlord.showCell(cell);
		},
		
		
		
		showCellNav: function()
		{
			var cellNav = this;
			cellNav.cellNavDOM.addClass("active");
			cellNav.isActive = true;
		},
		
		
		
		hideCellNav: function()
		{
			var cellNav = this;
			cellNav.cellNavDOM.removeClass("active");
			cellNav.isActive = false;
		},
		
		
		
		removeCellNav: function()
		{
			var cellNav = this;
			var $cellNav = cellNav.cellNavDOM;

			$cellNav.remove();
		},
	}
	
	
	
	var Cell = Sleuthgrids.Cell = function()
	{
		this.init.apply(this, arguments)
	}
	
	Cell.prototype = 
	{	
	
		init: function(cellOverlord, index, cellType)
		{
			var cell = this;
			
			cell.cellOverlord = cellOverlord;			
			cell.index = index;
			cell.cellType = cellType;
			cell.linkIndex = -1;
			cell.isActive = false;
			cell.cellDOM;
			
			cell.makeCellDOM();
			
			cell.cellNav = new Sleuthgrids.CellNav(cell);
			//cell.handler = new Sleuthgrids.cellHandlerClass(cell);
			cell.handler = new Sleuthgrids.cellHandlers[cellType]();
			cell.handler.init(cell)

		},
		
		
		
		makeCellDOM: function()
		{
			var cell = this;
			var cellType = cell.cellType;
			var cellIndex = cell.index;
			
			var $cellTypeTemplate = $(".grid-trig-template[data-grid='"+cellType+"']").html();
			var $cell = $($("#cell_template").html());
			$cell.append($cellTypeTemplate);
			$cell.attr("data-celltype", cellType);
			$cell.attr("data-cellindex", cellIndex);
			
			cell.cellDOM = $cell;
		},
		
		
		
		setLinkedCells: function(market)
		{
			var cell = this;
			var cellOverlord = cell.cellOverlord;

			var linkedCells = cellOverlord.getLinkedCells(cell, false);
			
			for (var i = 0; i < linkedCells.length; i++)
			{
				var linkedCell = linkedCells[i];
				linkedCell.changeCellMarket(market);
			}
		},
		
		
		
		hideCell: function()
		{
			var cell = this;
			
			cell.cellDOM.addClass("tab-hidden");
			cell.isActive = false;
			
			cell.cellNav.hideCellNav();
		},
		
		
		
		showCell: function()
		{
			var cell = this;
			
			cell.cellDOM.removeClass("tab-hidden");
			cell.isActive = true;
			cell.triggerVisible();
			
			cell.cellNav.showCellNav();
		},
		
		
		
		loadCell: function()
		{
			var cell = this;
			var cellOverlord = cell.cellOverlord;
			var handler = cell.handler;
			
			handler.call("new");
			
			var linkedCells = cellOverlord.getLinkedCells(cell, false);
			
			if (linkedCells.length)
			{
				var tempLinkedCell = linkedCells[0];
				var market = tempLinkedCell.handler.getMarket();

				if (market)
				{
					handler.call("changeMarket", market);
				}
			}	
		},
		
		
		
		loadCellFromSettings: function(settings)
		{
			var cell = this;
			var handler = cell.handler;
			//console.log(settings);
			handler.call("loadCustom", settings);
		},
		
		
		
		changeCellMarket: function(market)
		{
			var cell = this;
			var handler = cell.handler;
			
			handler.call("changeMarket", market);
		},
		
		
		
		triggerVisible: function()
		{
			var cell = this;
			var handler = cell.handler;
			
			handler.call("update");
		},
		
		
		
		resizeCell: function()
		{
			var cell = this;
			var handler = cell.handler;
			
			handler.call("resize");
		},
		
		
		
		saveCell: function()
		{
			var cell = this;
			var handler = cell.handler;
			var cellTypeSettings = handler.call("save");			
			
			var saveObj = {};
			saveObj.isActive = cell.isActive;
			saveObj.linkIndex = cell.linkIndex;
			saveObj.cellType = cell.cellType;
			saveObj.cellTypeSettings = cellTypeSettings;
			
			return saveObj;
		},
		
		
		
		removeCell: function()
		{
			var cell = this;
			var $cell = cell.cellDOM;
			var handler = cell.handler;
			
			handler.call("remove");
			$cell.remove();
			
			cell.cellNav.removeCellNav();
		},
		
	}
		

	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));

