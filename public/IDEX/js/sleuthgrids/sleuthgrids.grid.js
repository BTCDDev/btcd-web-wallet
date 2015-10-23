

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{

	
	var GridTab = Sleuthgrids.GridTab = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	GridTab.prototype = 
	{
		init: function(grid)
		{
			var gridTab = this;
			gridTab.grid = grid;
			gridTab.gridOverlord = grid.gridOverlord;
			
			gridTab.isActive = false;
			gridTab.name = "";
			
			gridTab.gridTabDOM;
			gridTab.gridTabCloseDOM;
			gridTab.gridTabTitleDOM;
			

			gridTab.initDOM();
			gridTab.initEventListeners();
			gridTab.updateName();
		},
		
		
		
		initDOM: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var index = grid.index;
			var isDefault = grid.isDefault;
			
			gridTab.gridTabDOM = $($("#util_grid_tab_template").html());
			gridTab.gridTabTitleDOM = gridTab.gridTabDOM.find(".util-grid-tab-title span");
			gridTab.gridTabCloseDOM = gridTab.gridTabDOM.find(".util-grid-tab-close");			
		},
		
		
		
		initEventListeners: function()
		{
			var gridTab = this;
			
			gridTab.gridTabDOM.on("click", function(e)
			{
				gridTab.onGridTabClick(e);
			})
			
			gridTab.gridTabCloseDOM.on("click", function(e)
			{
				gridTab.onGridTabCloseClick();
			})
			
		},
		
		
		updateName: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var index = grid.index;
			var isDefault = grid.isDefault;
			
			var defaultClass = isDefault ? "util-grid-tab-default" : "";
			gridTab.gridTabDOM.addClass(defaultClass);

			var name = isDefault ? "Default" : "Grid-" + String(index);
			gridTab.name = name;
			gridTab.gridTabTitleDOM.text(name);
		},
		
		
		
		onGridTabClick: function(e)
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var gridOverlord = gridTab.gridOverlord;
			
			var isClose = $(e.target).hasClass("util-grid-tab-close");
			
			if (!isClose)
			{
				gridOverlord.hideAllGrids();
				grid.showGrid(true);
			}
		},
		
		
		
		onGridTabCloseClick: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var gridOverlord = gridTab.gridOverlord;
			
			gridOverlord.removeGrid(grid);
		},
		

		
		showTab: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			
			gridTab.gridTabDOM.addClass("active");
		},
		
		
		
		hideTab: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var gridOverlord = gridTab.gridOverlord;
			
			gridTab.gridTabDOM.removeClass("active");
			//gridOverlord.gridTabsWrap.find(".util-grid-tab").removeClass("active");
		},
		
		
		
		removeGridTab: function()
		{
			var gridTab = this;

			gridTab.gridTabDOM.remove();
		}
	}

	
	
	var Grid = Sleuthgrids.Grid = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	Grid.prototype = 
	{
		
		init: function(gridOverlord, index)
		{	
			var grid = this;
			
			grid.gridOverlord = gridOverlord;
			grid.index = index;
			grid.isDefault = index == 0;
			
			grid.currentGridPositions = {};
			grid.prevGridPositions = {};

			grid.isActive = false;
			grid.needsResize = false;

			grid.initDOM();
			grid.initEventListeners();
			grid.onetime = true;
			//grid.currentGridPositions = Sleuthgrids.getPositions(grid.gridDOM, true);
			
			grid.gridTab = new Sleuthgrids.GridTab(grid, grid.index);
			grid.tileOverlord = new Sleuthgrids.TileOverlord(grid);
		},
		
		
		
		initDOM: function()
		{
			var grid = this;
			var index = grid.index;
			
			grid.gridDOM = $($("#grid_template").html());
			grid.gridDOM.attr("data-gridindex", index);
		},
		
		
		
		initEventListeners: function()
		{
			var grid = this;
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseover", function(e)
			{
				grid.onGridArrowMouseover($(this));
			})

			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseout", function(e)
			{
				grid.onGridArrowMouseout($(this));
			})
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseup", function(e)
			{
				grid.onGridArrowMouseup($(this));
			})
		},
		
		
		updateInternalGridPositions: function()
		{
			var grid = this;
			
			var gridPositions = Sleuthgrids.getPositions(grid.gridDOM, true);

			var isVisible = grid.gridDOM.is(":visible");

			if (isVisible)
			{
				grid.prevGridPositions = grid.currentGridPositions;
				grid.currentGridPositions = gridPositions;
				if (grid.onetime)
				{
					grid.prevGridPositions = {};
					grid.prevGridPositions.height = Sleuthgrids.saveHeight;
					grid.prevGridPositions.width = Sleuthgrids.saveWidth;
					grid.onetime = false;
				}
			}
			
			//console.log(grid.prevGridPositions);
			//console.log(grid.currentGridPositions);
		},
		
		
		showGrid: function(resize)
		{
			var grid = this;
			var gridTab = grid.gridTab;
			
			grid.gridDOM.addClass("active");
			grid.isActive = true;
			gridTab.showTab();
			
			grid.resizeGrid();
		},
		
		
		
		hideGrid: function()
		{
			var grid = this;
			var gridTab = grid.gridTab;

			grid.gridDOM.removeClass("active");
			grid.isActive = false;
			
			gridTab.hideTab();
		},
	
		
		
		saveGrid: function()
		{
			var grid = this;
			var tileOverlord = grid.tileOverlord;
			var saveObj = {};			

			saveObj.tileSaves = tileOverlord.saveAllTiles();
			
			saveObj.index = grid.index;
			saveObj.isActive = grid.isActive;
			
			return saveObj;
		},
			
			
			
		removeGrid: function()
		{
			var grid = this;
			var gridTab = grid.gridTab;
			var tileOverlord = grid.tileOverlord;
			
			tileOverlord.removeAllTiles();
			
			grid.gridDOM.remove();
			gridTab.removeGridTab();
		},
		
		
		
		resizeGrid: function()
		{
			var grid = this;
			var tileOverlord = grid.tileOverlord;
			var isVisible = grid.gridDOM.is(":visible");

			if (isVisible)
			{
				grid.updateInternalGridPositions();

				tileOverlord.scaleTiles();

				grid.needsResize = false;
			}
			else
			{
				grid.needsResize = true;
			}
		},
		
		
	
		onGridArrowMouseover: function($arrow)
		{
			var grid = this;
			var gridPositions = grid.currentGridPositions;
			var tileOverlord = grid.tileOverlord;
			
			var previewTile = tileOverlord.previewTile;
			var $previewTile = previewTile.tileDOM;
			
			var direction = $arrow.attr("data-arrow");
			var arrowDirections = Sleuthgrids.getDirections(direction);

			Sleuthgrids.toggleTileAdd(false);			

			previewTile.resetPositions();

			
			if (arrowDirections.isMiddle)
			{
				previewTile.showPreviewTile();
				previewTile.updateInternalTilePositions();
			}
			else
			{
				var edgePosition = gridPositions[arrowDirections.direction];
				var foundTiles = tileOverlord.findTilesTouchingEdge(arrowDirections.direction, edgePosition);
				
				if (foundTiles.length)
				{
					var absKey = arrowDirections.isHoriz ? "left" : "top";
					var sizeKey = arrowDirections.isHoriz ? "width" : "height";
					
					var smallestTile = tileOverlord.getSmallestTile(foundTiles, sizeKey);
					var smallestTilePositions = smallestTile.positions;
					
					var newSize = smallestTilePositions[sizeKey] / 2;
					
					grid.resizeTilesTouchingGridEdges(foundTiles, arrowDirections, newSize, absKey, sizeKey, true);

					
					var prevAbs = (arrowDirections.isBottom || arrowDirections.isRight) ? (gridPositions[sizeKey] - newSize) : 0;
					
					$previewTile.css(sizeKey, newSize);
					$previewTile.css(absKey, prevAbs);

					previewTile.showPreviewTile();
					previewTile.updateInternalTilePositions();

				}
			}
		},
	
	
	
		resizeTilesTouchingGridEdges: function(tiles, arrowDirections, newSize, absKey, sizeKey, isMouseover)
		{
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				var $tile = tile.tileDOM;
				var tilePositions = tile.positions;
				
				var size = tilePositions[sizeKey];
				var adjSize = isMouseover ? size - newSize : size + newSize;

				var newAbs = isMouseover ? (tilePositions[absKey] + newSize) : (tilePositions[absKey] - newSize);
				newAbs = (arrowDirections.isLeft || arrowDirections.isTop) ? newAbs : tilePositions[absKey];
				
				
				$tile.css(sizeKey, adjSize);
				$tile.css(absKey, newAbs);
				tile.updateInternalTilePositions();
				tile.cellOverlord.resizeAllCells();
			}
		},
		
		
		
		onGridArrowMouseout: function($arrow)
		{
			var grid = this;
			var tileOverlord = grid.tileOverlord;
			var previewTile = tileOverlord.previewTile;
			
			var direction = $arrow.attr("data-arrow");
			var arrowDirections = Sleuthgrids.getDirections(direction);
			
			
			if (Sleuthgrids.isGridTrig)
			{
				Sleuthgrids.toggleTileAdd(true);
				
				if (arrowDirections.isMiddle)
				{
					previewTile.hidePreviewTile();
				}
				else
				{
					var previewTilePositions = previewTile.positions;
					var previewDirection = Sleuthgrids.invertDirection(arrowDirections.direction);
					
					var edgePosition = previewTilePositions[previewDirection];
					var foundTiles = tileOverlord.findTilesTouchingEdge(arrowDirections.direction, edgePosition);

					if (foundTiles.length)
					{
						var absKey = arrowDirections.isHoriz ? "left" : "top";
						var sizeKey = arrowDirections.isHoriz ? "width" : "height";
						
						var smallestTile = tileOverlord.getSmallestTile(foundTiles, sizeKey);
						var smallestTilePositions = smallestTile.positions;
						
						var newSize = smallestTilePositions[sizeKey];
						
						grid.resizeTilesTouchingGridEdges(foundTiles, arrowDirections, newSize, absKey, sizeKey, false);
						
						previewTile.hidePreviewTile();
					}
				}
			}
		},

		
		
		onGridArrowMouseup: function($arrow)
		{
			var grid = this;
			var tileOverlord = grid.tileOverlord;
			var previewTile = tileOverlord.previewTile;
			var previewTilePositions = previewTile.positions;
			var cellType = 	Sleuthgrids.triggeredType;

			var direction = $arrow.attr("data-arrow");
			var arrowDirections = Sleuthgrids.getDirections(direction);
			
			Sleuthgrids.toggleTileAdd(false);
			
			tileOverlord.addTile(arrowDirections, previewTilePositions);

			previewTile.hidePreviewTile();
		},
		
		

	}
	
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	



