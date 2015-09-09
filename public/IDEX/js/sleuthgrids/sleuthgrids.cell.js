
Sleuthgrids = (function(Sleuthgrids) 
{
	var $tileAdd = $("#tile_add");

	
	var TileNavCell = Sleuthgrids.TileNavCell = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	TileNavCell.prototype = 
	{	
		init: function(tile, index)
		{
			var tileNavCell = this;
			
			tileNavCell.tile = tile;
			
			tileNavCell.index = index;
			tileNavCell.linkIndex = -1;

			
			
			tileNavCell.tileNavCellDOM;
			tileNavCell.navLinkDOM;
			tileNavCell.isActive = false;
			tileNavCell.isMoving = false;
		},
		
		
		
		initDOM: function()
		{
			var tileNavCell = this;
			var tile = tileNavCell.tile;
			var index = tileNavCell.index;
			var cell = tile.cells[index];
			var cellType = cell.cellType;
			
			var $tileHeaderTab = $($("#tile_header_solo_template").html());
			var $tabWrap = $("<div/>", {'class':"tile-header-tab", 'data-tab':index} );
			$tileHeaderTab = $($tileHeaderTab.wrapAll($tabWrap).parent()[0].outerHTML);
			
			var title = Sleuthgrids.capitalizeFirstLetter(cellType);
			$tileHeaderTab.find(".tile-header-title").text(title);
			
			tileNavCell.tileNavCellDOM = $tileHeaderTab;
			tileNavCell.navLinkDOM = $tileHeaderTab.find(".tile-header-link");
			
			tileNavCell.initEventListeners();
		},
		
		
		
		updateToNewTile: function()
		{
			
		},
		
		
		
		initEventListeners: function()
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];

			
			tileNavCell.tileNavCellDOM.on("mousedown", function(e)
			{				
				//var hasCloseClass = $(e.target).hasClass("tile-header-close") || $(e.target).hasClass("tile-header-link");
				var has = $(e.target).hasClass("tile-header-tab");
				
				if (has)
				{		
					var $tile = tile.tileDOM;
					var mouseY = e.clientY
					var mouseX = e.clientX
					var tilePositions = tile.winPositions;
					
					var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions)
					
					if (!isInsideBorder.isInside)
					{
						tileNavCell.isMoving = true;
					}
				}
			})
			
			tileNavCell.tileNavCellDOM.on("mouseup", function(e)
			{
				tileNavCell.isMoving = false;
			})
			
			tileNavCell.tileNavCellDOM.on("mouseout", function(e)
			{	
				if (tileNavCell.isMoving)
				{
					$tileAdd.addClass("active");
					$(".grid-arrow").addClass("active");

					Sleuthgrids.updateTileAddPos(e);
					
					Sleuthgrids.isGridTrig = true;
					Sleuthgrids.triggeredCell = cell;
					Sleuthgrids.isTriggeredNew = false;
					tileNavCell.isMoving = false;
				}
			})
			
			
			tileNavCell.tileNavCellDOM.on("mousedown", function(e)
			{
				tileNavCell.changeCellTabs(e);
			})
			
	
			tileNavCell.tileNavCellDOM.find(".tile-header-close").on("click", function()
			{
				tile.closeTile(tileNavCell);
			})
			
			tileNavCell.navLinkDOM.find(".dropdown-list li").on("click", function(e)
			{
				tileNavCell.cellLinkClick($(this))
			})
			
		},
		
		
		
		unbindEventListeners: function()
		{
			var tileNavCell = this;
			tileNavCell.tileNavCellDOM.off();
			tileNavCell.tileNavCellDOM.find("*").off();
		},
		
		
		
		cellLinkClick: function($li)
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];
			var handler = cell.handler;
			var grid = tile.grid;
			
			var $wrap = $li.closest(".dropdown-list-wrap");
			var $ul = $li.closest("ul");

			var linkIndex = $li.attr("data-val");	
			var title = $li.text();

			$ul.find("li").removeClass("active");
			$li.addClass("active");
			
			$wrap.find(".dropdown-title span").text(title);
			$wrap.trigger("mouseleave");
			
			tileNavCell.linkIndex = linkIndex;
			cell.linkIndex = linkIndex;
			
			var linkedCells = cell.getLinkedCells(false);
						
			if (linkedCells.length)
			{
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
			}
					
		},
		
		
		
		changeCellLinkDOM: function()
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var linkIndex = tileNavCell.linkIndex;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];
			var grid = tile.grid;

			
			var $navLinkWrap = tileNavCell.navLinkDOM;
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
			
			var tileNavCell = this;
			var tile = tileNavCell.tile;
			var index = tileNavCell.index;
			var cell = tile.cells[index];
			
			
			for (var i = 0; i < tile.cells.length; i++)
			{
				var loopCell = tile.cells[i];
				var $loopCell = loopCell.cellDOM;
				$loopCell.addClass("tab-hidden");
				loopCell.isActive = false;

				
				var loopTileNavCell = tile.navCells[i];
				var $loopTileNavCell = loopTileNavCell.tileNavCellDOM;
				$loopTileNavCell.removeClass("active");
				loopTileNavCell.isActive = false;
				
			}
			
			tileNavCell.tileNavCellDOM.addClass("active");
			tileNavCell.isActive = true;
			cell.cellDOM.removeClass("tab-hidden");
			cell.isActive = true;
			
			cell.triggerVisible();
			
			tile.showTileBorder();
		},
		
		
		
		removeTileNavCell: function()
		{
			var tileNavCell = this;
			var $tileNavCell = tileNavCell.tileNavCellDOM;

			$tileNavCell.remove();
		},
		
	}
	
	
	
	var Cell = Sleuthgrids.Cell = function()
	{
		this.init.apply(this, arguments)
	}
	
	Cell.prototype = 
	{	
	
		init: function(tile, index, cellType)
		{
			
			var cell = this;
			
			cell.tile = tile;
			cell.grid = tile.grid;
			
			cell.index = index;
			cell.linkIndex = -1;
			cell.isActive = false;
			cell.cellType = cellType;

			var cellHandlers = Sleuthgrids.cellHandlers;
			var handler = new Sleuthgrids.cellHandlerClass(cell);
			cell.handler = handler;
			
			cell.cellDOM;
		},
		
		
		
		makeCellDOM: function()
		{
			var cell = this;
			var cellType = cell.cellType;
			
			var $cellTypeTemplate = $(".grid-trig-template[data-grid='"+cellType+"']").html();
			var $cell = $($("#cell_template").html());
			$cell.append($cellTypeTemplate);
			$cell.attr("data-celltype", cellType);
			$cell.attr("data-cellindex", cell.index);
			
			cell.cellDOM = $cell;
		},
		
		
		
		getLinkedCells: function(includeSelf)
		{
			includeSelf = typeof includeSelf === "undefined" ? true : includeSelf;
			
			var cell = this
			var tile = cell.tile;
			var grid = cell.grid;
			
			var cellIndex = cell.index;
			var linkIndex = cell.linkIndex;
			
			
			var obj = {};
			var allGridTiles = grid.tiles;
			
			
			for (var i = 0; i < allGridTiles.length; i++)
			{
				var loopTile = allGridTiles[i];
				var allLoopTileCells = loopTile.cells;
				
				for (var j = 0; j < allLoopTileCells.length; j++)
				{
					var loopCell = allLoopTileCells[j];
					var loopCellLinkIndex = loopCell.linkIndex;
					
					if (!includeSelf && loopCell == cell)
					{
						//console.log(['includeSelf', includeSelf])
						continue;
					}
					
					if (!(String(loopCellLinkIndex) in obj))
					{
						obj[String(loopCellLinkIndex)] = [];
					}
					
					obj[String(loopCellLinkIndex)].push(loopCell);
				}
			}
			
			var linkedCells = obj[linkIndex];
			linkedCells = typeof linkedCells == "undefined" ? [] : linkedCells;
			
			return linkedCells;
			
		},
		
		
		
		updateCellLink: function()
		{
			var tileNavCell = this;
			var cellIndex = tileNavCell.index;
			var tile = tileNavCell.tile;
			var cell = tile.cells[cellIndex];
			var grid = tile.grid;
			
			var linkIndex = cell.linkIndex;
		},
		
		
				
		setLinkedCells: function(market)
		{
			var cell = this;
			var tile = cell.tile;
			var grid = tile.grid;			
			var linkIndex = cell.linkIndex;
			var cellIndex = cell.index;
			
			var isLinked = linkIndex != -1;
			var linkedCells = cell.getLinkedCells(false);
			
			//console.log(linkedCells);
			
			for (var i = 0; i < linkedCells.length; i++)
			{
				var linkedCell = linkedCells[i];
				linkedCell.changeCellMarket(market);
			}
		},
		
		
		
		closeCell: function($tabHeader)
		{
			var cell = this;
			var tile = cell.tile;
			var grid = cell.grid;
			
			
			var $wrap = $tabHeader.closest(".grid");
			var len = $wrap.find(".tile-content").length;

			var tab = $tabHeader.attr("data-tab");
			var $tabContent = $wrap.find(".tile-content[data-tab='"+tab+"']")
					
			var $nextTabHeader = $tabHeader.next();
			if (!$nextTabHeader.length)
				$nextTabHeader = $tabHeader.prev();
			
			Sleuthgrids.closeGridType($tabContent);
			$tabHeader.remove()
			$tabContent.remove()
			$nextTabHeader.trigger("click");
		},
		
		
		
		loadCell: function()
		{
			var cell = this;
			var handler = cell.handler;
			
			handler.call("new");
			
			var linkedCells = cell.getLinkedCells(false);
			
			if (linkedCells.length)
			{
				var tempLinkedCell = linkedCells[0];
				var market = tempLinkedCell.handler.getMarket();
				//console.log(market);
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
			cell.saveObj = saveObj;
			
			return saveObj;
		},
		
		
		
		removeCell: function()
		{
			var cell = this;
			var $cell = cell.cellDOM;
			var handler = cell.handler;
			
			handler.call("remove");
			
			$cell.remove();
		},
		
	}
		
		
	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));

