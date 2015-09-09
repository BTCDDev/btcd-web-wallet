


var Sleuthgrids = {};
var $tileAdd = $("#tile_add");
var $contentWrap = $("#content_wrap");
var $gridTabsWrap = $(".util-grid-tabs");


Sleuthgrids = (function(Sleuthgrids) 
{
	Sleuthgrids.cellHandlers = {};
	Sleuthgrids.allGrids = [];
	Sleuthgrids.tileAdd = $("#tile_add");
	Sleuthgrids.contentWrap = $("#content_wrap");
	
	
	Sleuthgrids.isGridTrig = false;
	Sleuthgrids.triggeredCell = null;
	Sleuthgrids.isTriggeredNew = false;
	Sleuthgrids.triggeredType = "";
	
	
	Sleuthgrids.isResizing = false;
	Sleuthgrids.resizeTile = null;
	Sleuthgrids.resizeDir = "";
	
	
	Sleuthgrids.prevWindowHeight = 0;
	Sleuthgrids.prevWindowWidth = 0;
		
	
	
	
	
	Sleuthgrids.addEventListener = function(eventType, selector, callback)
	{
		$contentWrap.on(eventType, selector, function()
		{
			callback($(this));
		})
		
	};
	
	
	Sleuthgrids.getGrid = function(index)
	{
		var allGrids = this.allGrids;
		var len = allGrids.length;
		var ret = false;
		
		var grid = allGrids[index];
		return grid;
		
		for (var i = 0; i < len; i++)
		{
			var grid = allGrids[i];
			
			if (grid.node.is($node))
			{
				ret = grid;
				break;
			}
		}
		
		return ret;
	};
	
	
	
	$.fn.sleuthgrids = function() 
	{
		var args = arguments;
		var ret = false;
		var allGrids = Sleuthgrids.allGrids;
		var len = allGrids.length;
		var $grid = $(this);
		
		if (this[0]) 
		{
			for (var i = 0; i < len; i++)
			{
				var grid = allGrids[i];
				
				if (grid.gridDOM.is($grid))
				{
					ret = grid;
					break;
				}
			}
		}
		
		return ret;
	};
	
	
	
	
	Sleuthgrids.toggleTileAdd = function(show)
	{
		if (show)
		{
			$tileAdd.addClass("active")
		}
		else
		{
			$tileAdd.removeClass("active")
		}
	};
	
	
	Sleuthgrids.updateTileAddPos = function(event)
	{
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		
		$tileAdd.css("left", mouseX);
		$tileAdd.css("top", mouseY);
	};
		

	Sleuthgrids.updateGridTabs = function()
	{
		var allGrids = Sleuthgrids.allGrids;
		var len = allGrids.length;
		
		for (var i = 0; i < len; i++)
		{
			var grid = allGrids[i];
			var gridTab = grid.gridTab;
			gridTab.updateIndex();
		}
	};
		
	Sleuthgrids.hideAllGrids = function()
	{
		var allGrids = Sleuthgrids.allGrids;
		var len = allGrids.length;
		
		for (var i = 0; i < len; i++)
		{
			var grid = allGrids[i];
			grid.hideGrid();
		}
	};
	
	
	Sleuthgrids.saveAllGrids = function()
	{
		var allGrids = Sleuthgrids.allGrids;
		var len = allGrids.length;
		
		var saveObj = {};
		saveObj.windowHeight = $contentWrap.height();
		saveObj.windowWidth = $contentWrap.width();
		
		var gridSaves = [];
		
		for (var i = 0; i < len; i++)
		{
			var grid = allGrids[i];
			grid.saveGrid();
			gridSaves.push(grid.saveObj);
		}
		
		saveObj.gridSaves = gridSaves;
		
		
		return saveObj;
	};
	
	
	Sleuthgrids.resizeAllGrids = function()
	{
		var grids = Sleuthgrids.allGrids;
		
		for (var i = 0; i < grids.length; i++)
		{
			var grid = grids[i];
			
			if (grid.isActive)
			{
				grid.resizeGrid();
			}
		}
	};
	
	
	var GridTab = Sleuthgrids.GridTab = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	GridTab.prototype = 
	{
		init: function(grid, index)
		{
			var gridTab = this;
			gridTab.grid = grid;
			
			gridTab.index = index;
			gridTab.isActive = false;
			gridTab.name = "";
			gridTab.isDefault = index == 0;
			
			gridTab.gridTabDOM;
			gridTab.gridTabCloseDOM;
			gridTab.gridTabTitleDOM;
			

			gridTab.initDOM();
			gridTab.initEventListeners();
		},
		
		
		initDOM: function()
		{
			var gridTab = this;
			var index = gridTab.index;
			var isDefault = gridTab.isDefault;
			
			gridTab.gridTabDOM = $($("#util_grid_tab_template").html());
			gridTab.gridTabTitleDOM = gridTab.gridTabDOM.find(".util-grid-tab-title span");
			gridTab.gridTabCloseDOM = gridTab.gridTabDOM.find(".util-grid-tab-close");

			gridTab.gridTabDOM.attr("data-gridindex", index);
			
			var defaultClass = isDefault ? "util-grid-tab-default" : "";
			gridTab.gridTabDOM.addClass(defaultClass);

			var name = isDefault ? "Default" : "Grid-" + String(index);
			gridTab.name = name;
			gridTab.gridTabTitleDOM.text(name);
			
			$gridTabsWrap.append(gridTab.gridTabDOM);
		},
		
		
		initEventListeners: function()
		{
			var gridTab = this;
			
			gridTab.gridTabDOM.on("click", function(e)
			{
				gridTab.showTab(e);
			})
			
			gridTab.gridTabCloseDOM.on("click", function(e)
			{
				gridTab.removeGrid();
			})
			
		},
		
		showTab: function(e)
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var isClose = $(e.target).hasClass("util-grid-tab-close");
			
			if (!isClose)
			{
				$gridTabsWrap.find(".util-grid-tab").removeClass("active");
				gridTab.gridTabDOM.addClass("active");
								
				Sleuthgrids.hideAllGrids();
				grid.showGrid(true);
			}
		},
		
		updateIndex: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var index = grid.index;
			var isDefault =  index == 0;
			
			gridTab.index = index;
			gridTab.isDefault = isDefault;
			
			gridTab.gridTabDOM.attr("data-gridindex", index);
			var name = isDefault ? "Default" : "Grid-" + String(index);
			gridTab.name = name;
			gridTab.gridTabTitleDOM.text(name);
		},
		
		
		removeGrid: function()
		{
			var gridTab = this;
			var grid = gridTab.grid;
			var index = grid.index;

			
			grid.removeGrid();
			gridTab.gridTabDOM.remove();
				
			
			var showGridIndex = index - 1;
			//$gridTabsWrap.find(".util-grid-tab[data-gridindex='"+String(showGridIndex)+"']").trigger("click")
			var showGrid = Sleuthgrids.getGrid(showGridIndex);
			showGrid.gridTab.gridTabDOM.trigger("click");
			//Sleuthgrids.hideAllGrids();
			//showGrid.showGrid();
		},
	}

	
	
	
	var Grid = Sleuthgrids.Grid = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	
	
	Grid.prototype = 
	{
		
		init: function()
		{	
			var grid = this;
			
			grid.gridDOM = $($("#grid_template").html());
			grid.tilesWrapDOM = grid.gridDOM.find(".tiles");
			grid.index = Sleuthgrids.allGrids.length;
			grid.gridDOM.attr("data-gridindex", grid.index);
			
			grid.tiles = [];
			grid.cells = [];
			grid.previewTile = new Sleuthgrids.PreviewTile(grid);
			grid.gridTab = new Sleuthgrids.GridTab(grid, grid.index);

			grid.isActive = false;
			grid.saveObj = {};

			grid.initEventListeners();
			
			Sleuthgrids.allGrids.push(grid);
			
			$(".grids").append(grid.gridDOM);
			grid.prevGridHeight = $contentWrap.height();
			grid.prevGridWidth = $contentWrap.width();
		},
		
		
		initEventListeners: function()
		{
			var grid = this;
			
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseover", function(e)
			{
				grid.mouseover($(this));
			})

			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseout", function(e)
			{
				grid.mouseout($(this));
			})
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseup", function(e)
			{
				grid.mouseup($(this));
			})
			
		},
		
		
		
		getCell: function($cell)
		{
			var grid = this;
			var tiles = this.tiles;
			var ret = false;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				var cells = tile.cells;
				
				for (var j = 0; j < cells.length; j++)
				{
					var cell = cells[j];
			
					if (cell.cellDOM.is($cell))
					{
						ret = cell;
						break;
					}
				}
				
				if (ret)
					break;
			}
			
			return ret;
		},
		
		
		
		initTilesFromSave: function(tileSaves)
		{
			var grid = this;
			var gridSaveObj = grid.saveObj;
			//var tileSaves = grid.tileSaves;
			//grid.prevGridWidth = saveO
			
			for (var i = 0; i < tileSaves.length; i++)
			{			
				var tileSave = tileSaves[i];
				var tileSavePositions = tileSave.positions;
				var $tile = $($("#tile_template").html())
				$tile.css("height", tileSavePositions.height);
				$tile.css("width", tileSavePositions.width);
				$tile.css("top", tileSavePositions.top);
				$tile.css("left", tileSavePositions.left);
				//$tile.attr("data-arrow", arrowDirections.direction);
				
				var tile = new Sleuthgrids.Tile(grid, $tile);
				//tile.isTileHeaderTabbed = tileSave.isTileHeaderTabbed;
				tile.index = grid.tiles.length;
				tile.positions = tileSave.positions;
				tile.winPositions = tileSave.winPositions;
				grid.tiles.push(tile);
				grid.tilesWrapDOM.append($tile);
				//tile.updateInternalTilePositions();

				
				var cellSaves = tileSave.cellSaves;
				tile.initCellsFromSave(cellSaves);
			}
		},
		
		
		
		makeTile: function(arrowDirections, newTilePositions, tile)
		{
			var grid = this;
			var isTriggeredNew = Sleuthgrids.isTriggeredNew;

			//console.log(isTriggeredNew);
			
			if (isTriggeredNew)
			{
				var triggeredCellType = Sleuthgrids.triggeredType;
				
				var $tile = $($("#tile_template").html())

				$tile.css("height", newTilePositions.height);
				$tile.css("width", newTilePositions.width);
				$tile.css("top", newTilePositions.top);
				$tile.css("left", newTilePositions.left);
				$tile.attr("data-arrow", arrowDirections.direction);
				
				var tile = new Sleuthgrids.Tile(grid, $tile);
				tile.index = grid.tiles.length;
				grid.tiles.push(tile);
				grid.tilesWrapDOM.append($tile);	
				tile.updateInternalTilePositions();
				

				
				tile.addCell(triggeredCellType, arrowDirections, isTriggeredNew);

			}
			else
			{
				var previewTile = grid.previewTile;

				var triggeredCell = Sleuthgrids.triggeredCell;
				var triggeredTile = triggeredCell.tile;
				var $triggeredTile = triggeredTile.tileDOM;
				var cellIndex = triggeredCell.index;
				var triggeredTileNavCell = triggeredTile.navCells[cellIndex];
				
				var numCells = triggeredTile.cells.length;
				//console.log(numCells);
				
				if (numCells == 1)
				{
					triggeredTile.closeTileResizer(!arrowDirections.isMiddle);
				}

				
				if (!arrowDirections.isMiddle)
				{
					var $prev = grid.gridDOM.find(".preview-tile");
					newTilePositions = previewTile.positions;
				}
				
				if (numCells == 1 && !arrowDirections.isMiddle)
				{
					$triggeredTile.css("height", newTilePositions.height);
					$triggeredTile.css("width", newTilePositions.width);
					$triggeredTile.css("top", newTilePositions.top);
					$triggeredTile.css("left", newTilePositions.left);
					$triggeredTile.attr("data-arrow", arrowDirections.direction);
					triggeredTile.updateInternalTilePositions();
				}
				
				if (numCells > 1)
				{
					triggeredTile.navCells.splice(cellIndex, 1);
					Sleuthgrids.updateArrayIndex(triggeredTile.navCells);
					
					triggeredTile.cells.splice(cellIndex, 1);
					Sleuthgrids.updateArrayIndex(triggeredTile.cells);
				}
				
				if (numCells > 1 && !arrowDirections.isMiddle)
				{
					var $newTile = $($("#tile_template").html())

					$newTile.css("height", newTilePositions.height);
					$newTile.css("width", newTilePositions.width);
					$newTile.css("top", newTilePositions.top);
					$newTile.css("left", newTilePositions.left);
					$newTile.attr("data-arrow", arrowDirections.direction);
					
					var newTile = new Sleuthgrids.Tile(grid, $newTile);
					newTile.index = grid.tiles.length;
					grid.tiles.push(newTile);
					Sleuthgrids.updateArrayIndex(grid.tiles);
					grid.tilesWrapDOM.append($newTile);
					newTile.updateInternalTilePositions();

					triggeredCell.tile = newTile;
					newTile.cells.push(triggeredCell);
					triggeredCell.cellDOM.appendTo($newTile.find(".tile-cells"))
					
					triggeredTileNavCell.tile = newTile;
					newTile.navCells.push(triggeredTileNavCell);
					triggeredTileNavCell.tileNavCellDOM.appendTo(newTile.tileHeaderDOM)
					
					Sleuthgrids.updateArrayIndex(newTile.cells);
					Sleuthgrids.updateArrayIndex(newTile.navCells);

					triggeredTileNavCell.unbindEventListeners();
					triggeredTileNavCell.initEventListeners();
					
					var tempIndex = cellIndex - 1 > 0 ? cellIndex - 1 : 0;
					triggeredTile.navCells[tempIndex].changeCellTabs();	
				
				}
				

				if (arrowDirections.isMiddle)
				{
					var $tile = tile.tileDOM;
					
					triggeredCell.tile = tile;
					tile.cells.push(triggeredCell);
					triggeredCell.cellDOM.appendTo($tile.find(".tile-cells"))
					
					triggeredTileNavCell.tile = tile;
					tile.navCells.push(triggeredTileNavCell);
					triggeredTileNavCell.tileNavCellDOM.appendTo(tile.tileHeaderDOM)
					
					triggeredTileNavCell.unbindEventListeners();
					triggeredTileNavCell.initEventListeners();

					Sleuthgrids.updateArrayIndex(tile.cells);
					Sleuthgrids.updateArrayIndex(tile.navCells);

					tile.toggleHeaderTabbed(true);

					triggeredTileNavCell.changeCellTabs();
					
				}
				
				if (numCells == 1 && arrowDirections.isMiddle)
				{
					grid.tiles.splice(triggeredTile.index, 1);
					Sleuthgrids.updateArrayIndex(grid.tiles);
					triggeredTile.tileDOM.remove();
				}
				
				if (numCells == 2)
				{
					triggeredTile.toggleHeaderTabbed(false);
				}
				if (numCells > 1)
				{
					var tempIndex = cellIndex - 1 > 0 ? cellIndex - 1 : 0;
					triggeredTile.navCells[tempIndex].changeCellTabs();	
				}
				
			}
		
			grid.resizeTileCells();
		},
		
		
		
		showGrid: function(resize)
		{
			var grid = this;
			
			grid.gridDOM.addClass("active");
			grid.isActive = true;
			if (resize)
				grid.resizeGrid();
		},
		
		
		
		hideGrid: function()
		{
			var grid = this;
			
			grid.gridDOM.removeClass("active");
			grid.isActive = false;
		},
	
		
		
		saveGrid: function()
		{
			var grid = this;
			
			var saveObj = {};
			
			var isActiveGrid = grid.isActive;
			if (!isActiveGrid)
			{
				grid.showGrid(true);
			}
			saveObj.tileSaves = grid.saveTiles();
			if (!isActiveGrid)
			{
				grid.hideGrid();
			}
			
			saveObj.index = grid.index;
			saveObj.isActive = grid.isActive;
			
			grid.saveObj = saveObj;
		},
		
		
		
		saveTiles: function()
		{
			var grid = this;
			var tiles = grid.tiles;
			
			var tileSaves = [];
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				
				tile.saveTile();
				tileSaves.push(tile.saveObj);
			}
			
			return tileSaves;
		},
			
			
			
		removeGrid: function()
		{
			var grid = this;
			var tiles = grid.tiles;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				grid.removeTile(tile);
			}
			
			Sleuthgrids.allGrids.splice(grid.index, 1);
			Sleuthgrids.updateArrayIndex(Sleuthgrids.allGrids);
			grid.gridDOM.remove();
			Sleuthgrids.updateGridTabs();
		},
		
		
		
		removeTile: function(tile)
		{
			var grid = this;
			var tileIndex = tile.index;
			
			tile.removeTile();
			
			grid.tiles.splice(tileIndex, 1);
			
			Sleuthgrids.updateArrayIndex(grid.tiles);
		},
		
		
		
		resizeGrid: function()
		{
			var grid = this;
			
			var prevGridHeight = grid.prevGridHeight;
			var prevGridWidth = grid.prevGridWidth;
			var gridHeight = grid.gridDOM.height();
			var gridWidth = grid.gridDOM.width();
						
			var heightDiff = gridHeight - prevGridHeight;
			var widthDiff = gridWidth - prevGridWidth;
						
			var tiles = grid.tiles;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				var $tile = tile.tileDOM;
				var tilePositions = tile.positions;
				
				grid.changeHW($tile, tilePositions, "height", prevGridHeight, heightDiff);
				grid.changeHW($tile, tilePositions, "width", prevGridWidth, widthDiff);
				tile.updateInternalTilePositions();
				tile.resizeCells();
			}

					
			grid.prevGridHeight = gridHeight;
			grid.prevGridWidth = gridWidth;
		},
		
		
		
		changeHW: function($el, pos, sizeKey, prevWin, diff)
		{
			if (diff != 0)
			{
				var absKey = sizeKey == "width" ? "left" : "top";
				var ratio = pos[sizeKey] / prevWin;
				var change = diff * ratio;

				var size = pos[sizeKey] + change;
				
				
				var prevAbs = pos[absKey]
				var adjustRatio = prevAbs/prevWin
				var adjustChange = diff * adjustRatio
				var abs = (prevAbs + adjustChange);
							
				$el.css(sizeKey, size);
				$el.css(absKey, abs);
			}
		},
		
		
		
		toggleTileResizeOverlay: function(isResizing)
		{
			var grid = this;
			var tiles = grid.tiles;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				tile.toggleTileOverlay(isResizing);
			}
		},

		
		
		resizeTileCells: function()
		{
			var grid = this;
			var tiles = grid.tiles;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				tile.resizeCells();
			}
		},
		
	
	
		mouseover: function($arrow)
		{
			var grid = this;
			var previewTile = grid.previewTile;
			var $previewTile = previewTile.tileDOM;

			
			Sleuthgrids.toggleTileAdd(false);
			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			

			$previewTile.css("height", "100%");
			$previewTile.css("width", "100%");
			$previewTile.css("top", 0);
			$previewTile.css("left", 0);

			
			if (arrowDirections.isMiddle)
			{
				previewTile.showPreviewTile();
				previewTile.updateInternalTilePositions();

			}
			else
			{
				var foundTiles = grid.findMain(arrowDirections.direction, false);
				
				if (foundTiles.length)
				{
					var smallestTile = grid.getLowest(foundTiles, arrowDirections.direction);
					var smallestTilePositions = smallestTile.positions;
					
					var absKey = arrowDirections.isHoriz ? "left" : "top";
					var sizeKey = arrowDirections.isHoriz ? "width" : "height";
					var newSize = smallestTilePositions[sizeKey]/2;
					
					
					grid.resizeMain(foundTiles, arrowDirections, newSize, absKey, sizeKey, true);
					

					var mainPos = Sleuthgrids.getPositions(grid.gridDOM, true);
					
					var prevAbs = (arrowDirections.isBottom || arrowDirections.isRight) ? (mainPos[sizeKey] - newSize) : 0;
					
					
					$previewTile.css(sizeKey, newSize);
					$previewTile.css(absKey, prevAbs);

					previewTile.showPreviewTile();
					previewTile.updateInternalTilePositions();

				}
			}
		},
	
		
		
		mouseout: function($arrow)
		{
			var grid = this;
			var previewTile = grid.previewTile;
			
			if (Sleuthgrids.isGridTrig)
			{
				Sleuthgrids.toggleTileAdd(true);
				
				var arrowDirections = Sleuthgrids.getArrowDirections($arrow);


				if (arrowDirections.isMiddle)
				{
					previewTile.hidePreviewTile();
				}
				else
				{
					var foundTiles = grid.findMain(arrowDirections.direction, true);

					if (foundTiles.length)
					{					
						var smallestTile = grid.getLowest(foundTiles, arrowDirections.direction);
						var smallestTilePositions = smallestTile.positions;
						
						var absKey = arrowDirections.isHoriz ? "left" : "top";
						var sizeKey = arrowDirections.isHoriz ? "width" : "height";
						var newSize = smallestTilePositions[sizeKey];
						
						grid.resizeMain(foundTiles, arrowDirections, newSize, absKey, sizeKey, false);
						
						previewTile.hidePreviewTile();
					}
				}
			}
		},

		
		
		mouseup: function($arrow)
		{
			Sleuthgrids.toggleTileAdd(false);

			var grid = this;
			var previewTile = grid.previewTile;
			var previewTilePositions = previewTile.positions;
			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			
			grid.makeTile(arrowDirections, previewTilePositions);
			
			previewTile.hidePreviewTile();
		},
		
		
		
		findMain: function(direction, withPreview)
		{
			var grid = this;
			var gridPositions = Sleuthgrids.getPositions(grid.gridDOM, true);
			var gridPos = gridPositions[direction];
			
			var tiles = grid.tiles;

			var previewTile = grid.previewTile;
			var previewTilePositions = previewTile.positions;
			
			var foundTiles = [];

			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				var tilePositions = tile.positions;

				if (withPreview)
				{
					var previewDirection = Sleuthgrids.invertDirection(direction);
					var isDirection = Math.abs(tilePositions[direction] - previewTilePositions[previewDirection]) <= 1;
				}
				else
				{
					var isDirection = Math.abs(tilePositions[direction] - gridPos) <= 1;
				}

				if (isDirection)
				{
					foundTiles.push(tile);
				}
			}
			

			return foundTiles;
		},
		
		
		
		getLowest: function(tiles, direction)
		{
			var lowestTile = null;
			var lowestSize = -1;
			var sizeKey = (direction == "left" || direction == "right") ? "width" : "height";

			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				var tileSize = tile.positions[sizeKey];

				if (tileSize < lowestSize || lowestSize == -1)
				{
					lowestTile = tile;
					lowestSize = tileSize;
				}
			}

			return lowestTile;
		},

		
		
		resizeMain: function(tiles, arrowDirections, newSize, absKey, sizeKey, isMouseover)
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
				tile.resizeCells();

			}
		},
		
		
		
		searchForParallelTiles: function(searchTiles, points, direction)
		{
			var grid = this;
			
			var hKeys = ["left", "right"];
			var vKeys = ["top", "bottom"];
			var results = [];
			
			for (var i = 0; i < searchTiles.length; i++)
			{
				var searchTile = searchTiles[i];
				var oneRes = [];
				
				for (var j = 0; j < hKeys.length; j++)
				{
					var hKey = hKeys[j];
					
					for (var k = 0; k < vKeys.length; k++)
					{
						var vKey = vKeys[k];
						
						var coord = [searchTile.positions[hKey], searchTile.positions[vKey]]
						
						var obj = {};
						obj.h = hKey;
						obj.v = vKey;
						obj.tile = searchTile;
						
						if (grid.compareCoord(points, coord, direction))
							oneRes.push(obj)
					}
				}
				
				if (oneRes.length > 1)
					results.push(oneRes)
			}
			
			return results;
		},
		
		
		
		compareCoord: function(mainPoints, compPoint, direction)
		{
			var isVert = (direction == "left" || direction == "right");
			var indexOfSame = isVert ? 0 : 1;
			var indexOfBetween = isVert ? 1 : 0;
			
			var min = Math.min(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween]);
			var max = Math.max(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween]);

			var isSame = Math.abs(mainPoints[0][indexOfSame] - compPoint[indexOfSame]) <= 0.5;
			//console.log([min, compPoint[indexOfBetween], max]);
			var isBetween = (compPoint[indexOfBetween] >= min - 1) && (compPoint[indexOfBetween] <= max + 1);


			return isSame && isBetween
		},
		
		
		
		
		searchForAdjacentTiles: function(tile, searchDirection)
		{
			var grid = this;
			var tilePositions = tile.positions;
			var isVert = (searchDirection == "left" || searchDirection == "right");

			
			var allTiles = grid.tiles.slice();
			allTiles.splice(tile.index, 1);

			
			var adjTiles = []
			adjTiles.push(tile)
			
			//var cloneTiles = Sleuthgrids.cloneListOfObjects(allTiles);
			var cloneTiles = allTiles.slice();

			var flip = isVert ? ["top", "bottom"] : ["left", "right"];

			var all = {};
			all[flip[0]] = [];
			all[flip[1]] = [];
			
			//console.log(searchDirection);
			
			for (var i = 0; i < cloneTiles.length; i++)
			{
				var cloneTile = cloneTiles[i];
							
				for (var v = 0; v < adjTiles.length; v++)
				{
					var adjTile = adjTiles[v]
				
					if (Math.abs(cloneTile.positions[searchDirection] - adjTile.positions[searchDirection]) <= 1)
					{
						var check = false;
						
						for (var k = 0; k < flip.length; k++)
						{
							var key = flip[k]

							for (var j = 0; j < flip.length; j++)
							{
								var flipKey = flip[j];
								//console.log(Math.abs(cloneTile.positions[key] - adjTile.positions[flipKey]))

								if (Math.abs(cloneTile.positions[key] - adjTile.positions[flipKey]) <= 1)
								{
									check = true;
									break
								}
							}
							if (check)
								break
						}
						
						if (check)
						{
							all[flipKey].push(cloneTile);
							adjTiles.push(cloneTile);
							cloneTiles.splice(i, 1);
							i = -1;
							break;
						}
					}
				}
			}
						

			var poss = [];
			
			poss.push([tilePositions[flip[0]], tilePositions[flip[1]]])
			
			var first = all[flip[0]]
			var second = all[flip[1]];
			var constant = tilePositions[searchDirection];
			
			for (var i = 0; i < first.length; i++)
			{
				//var obj = {};
				var minor = first[i].positions[flip[0]];
				var major = tilePositions[flip[1]];
				//obj.tiles = [tile, first[i]];
				//obj.coord = [minor, major];
				poss.push([minor, major])
			}
			
			for (var i = 0; i < second.length; i++)
			{
				var minor = tilePositions[flip[0]];
				var major = second[i].positions[flip[1]];
				poss.push([minor, major]);
			}
			
			for (var i = 0; i < first.length; i++)
			{
				var minor = first[i].positions[flip[0]] // check same as tilePositions?
				
				for (var j = 0; j < second.length; j++)
				{
					var major = second[j].positions[flip[1]]
					poss.push([minor, major])
				}
			}
			
			var points = [];
			
			for (var i = 0; i < poss.length; i++)
			{
				var pos = poss[i]
				var formattedCoord = isVert ? [[constant, pos[0]],[constant, pos[1]]] : [[pos[0], constant],[pos[1],constant]]

				points.push(formattedCoord);
			}
			
			var retObj = {};
			retObj.adjTiles = adjTiles;
			retObj.nonAdjTiles = cloneTiles;
			retObj.formattedCoords = points;
			
			return retObj;
		},
		
		
		
		resizeTile: function(mouseX, mouseY)
		{
			var grid = this;
			var tile = Sleuthgrids.resizeTile;
			var $tile = tile.tileDOM;
			var tilePositions = tile.positions;
			
			var resizeDirection = Sleuthgrids.resizeDir;
			var isVert = (resizeDirection == "left" || resizeDirection == "right");

			
			var adjData = grid.searchForAdjacentTiles(tile, resizeDirection);
			
			var adjTiles = adjData.adjTiles;
			var nonAdjTiles = adjData.nonAdjTiles;
			var formattedCoords = adjData.formattedCoords;

			
			for (var i = 0; i < formattedCoords.length; i++)
			{
				var formattedCoord = formattedCoords[i];
				var results = grid.searchForParallelTiles(nonAdjTiles, formattedCoord, resizeDirection); // nonAdjTiles == filtered list
				
				if (results.length)
				{
					var coordOne = isVert ? formattedCoord[0][1] : formattedCoord[0][0];
					var coordTwo = isVert ? formattedCoord[1][1] : formattedCoord[1][0];
					var min = Math.min(coordOne, coordTwo)
					var max = Math.max(coordOne, coordTwo)
					var size = max - min;
					var runningSize = 0;
					var sizeKey = isVert ? "height" : "width";
					
					for (var j = 0; j < results.length; j++)
					{
						runningSize += results[j][0].tile.positions[sizeKey];
					}
										
					if (runningSize == size || Math.abs(runningSize - size) <= 1)
					{
						//console.log([size, runningSize])
						break;
					}
					else
					{
						//console.log([size, runningSize])
						results = [];
					}
				}
			}
			
			if (!results.length)
			{
				return;
			}
			
			
			var adjTilesInRange = [];
			
			var flip = isVert ? ["top", "bottom"] : ["left", "right"];

			for (var i = 0; i < adjTiles.length; i++)
			{
				var coordOne = isVert ? formattedCoord[0][1] : formattedCoord[0][0];
				var coordTwo = isVert ? formattedCoord[1][1] : formattedCoord[1][0];
				
				var pos = adjTiles[i].positions;
					
				var min = Math.min(coordOne, coordTwo)
				var max = Math.max(coordOne, coordTwo)
				
				var firstBetween = pos[flip[0]] >= min && pos[flip[0]] <= max;
				var secondBetween = pos[flip[1]] >= min && pos[flip[1]] <= max;
				
				if (firstBetween && secondBetween)
				{
					adjTilesInRange.push(adjTiles[i])
				}
			}

			
			
			var isLeftOrTop =  (resizeDirection == "left" || resizeDirection == "top");
			var isHoriz = (resizeDirection == "top" || resizeDirection == "bottom"); //backwards
			var isVert = (resizeDirection == "left" || resizeDirection == "right");
			var absKey = isVert ? "left" : "top";
			var sizeKey = isVert ? "width" : "height";
			
			var loopMouse = isVert ? mouseX : mouseY;
			var diff = loopMouse - tilePositions[resizeDirection];
			
			
			for (var i = 0; i < adjTilesInRange.length; i++)
			{
				var tile = adjTilesInRange[i];
				var $el = tile.tileDOM;
				var pos = tile.positions;
				
				var newSize = isLeftOrTop ? (pos[sizeKey] - diff) : (pos[sizeKey] + diff);
				
				$el.css(sizeKey, newSize);
				
				if (isLeftOrTop)
				{
					var newAbs = pos[absKey] + diff;
					$el.css(absKey, newAbs);
				}
				
				tile.updateInternalTilePositions();
			}
			
			for (var i = 0; i < results.length; i++)
			{
				var tile = results[i][0].tile;
				var pos = tile.positions;
				var $el = tile.tileDOM;
		
				
				var newSize = isLeftOrTop ? (pos[sizeKey] + diff) : (pos[sizeKey] - diff);
				$el.css(sizeKey, newSize);


				if (!isLeftOrTop)
				{
					var newAbs = pos[absKey] + diff;
					$el.css(absKey, newAbs);
				}
				
				tile.updateInternalTilePositions();
			}

		}
	

		

	}
	
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	



