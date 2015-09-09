
Sleuthgrids = (function(Sleuthgrids) 
{
	
	var PreviewTile = Sleuthgrids.PreviewTile = function()
	{
		this.init.apply(this, arguments)
	}
	
	PreviewTile.prototype = 
	{	
		init: function(grid)
		{
			var previewTile = this;

			previewTile.grid = grid;
			
			previewTile.tileDOM = $($("#preview_tile_template").html());
			previewTile.positions = {};
			previewTile.winPositions = {};
			previewTile.isActive = false;
			
			grid.gridDOM.append(previewTile.tileDOM);
		},
		
		updateInternalTilePositions: function()
		{
			var previewTile = this;
			
			var tilePositions = Sleuthgrids.getPositions(previewTile.tileDOM, true);
			var winTilePositions = Sleuthgrids.getPositions(previewTile.tileDOM, false);

			previewTile.positions = tilePositions;
			previewTile.winPositions = winTilePositions;
		},
		
		showPreviewTile: function()
		{
			var previewTile = this;
			
			previewTile.tileDOM.addClass("active");
			previewTile.isActive = true;
			
		},
		
		hidePreviewTile: function()
		{
			var previewTile = this;
			
			previewTile.tileDOM.removeClass("active");
			previewTile.isActive = false;
		}
	}
	
	
	var Tile = Sleuthgrids.Tile = function()
	{
		this.init.apply(this, arguments)
	}
	
	Tile.prototype = 
	{	
		init: function(grid, $tile)
		{
			
			var tile = this;

			tile.grid = grid;
			tile.cells = [];
			tile.navCells = [];
			
			tile.positions = {};
			tile.winPositions = {};
			
			tile.tileDOM = $tile;
			tile.tileArrowWrapDOM = tile.tileDOM.find(".tile-arrow-wrap");
			tile.tileHeaderDOM = tile.tileDOM.find(".tile-header");
			tile.tileOverlayDOM = tile.tileDOM.find(".tile-overlay");
			tile.tileCellsWrapDOM = tile.tileDOM.find(".tile-cells");
			tile.index = -1;
			tile.saveObj = {};
			
			
			tile.isTileHeaderTabbed = false;
			
			
			tile.initEventListeners();
			//tile.grid.gridDOM.append($tile);		

		},
		
		
		initEventListeners: function()
		{
			var tile = this;
			
			
			tile.tileDOM.on("mousedown", function()
			{
				tile.showTileBorder();
			})
			
			
			
			// start resize
			tile.tileDOM.on("mousedown", function(e)
			{
				tile.onTileMouseDown(e);
			})
			
			//resize cursor + resize
			tile.tileDOM.on("mousemove", function(e)
			{
				tile.onTileMousemove(e);
			})
			
			//hide resize cursor
			tile.tileDOM.on("mouseleave", function(e)
			{
				tile.onTileMouseleave();
			})
			
			

			tile.tileDOM.on("mouseover", function()
			{
				tile.showTileArrows();
			})
			
			tile.tileDOM.on("mouseleave", function()
			{
				tile.hideTileArrows();
			})
			
			
			
			
			tile.tileDOM.find(".tile-arrow").on("mouseover", function()
			{
				tile.onTileArrowMouseover($(this));
			})
			
			tile.tileDOM.find(".tile-arrow").on("mouseout", function()
			{
				tile.onTileArrowMouseout($(this));
			})

			tile.tileDOM.find(".tile-arrow").on("mouseup", function()
			{
				tile.onTileArrowMouseup($(this));
			})
			
		},
		
		
		updateInternalTilePositions: function()
		{
			var tile = this;
			
			var tilePositions = Sleuthgrids.getPositions(tile.tileDOM, true);
			var winTilePositions = Sleuthgrids.getPositions(tile.tileDOM, false);

			tile.positions = tilePositions;
			tile.winPositions = winTilePositions;
		},
		
		
		initCellsFromSave: function(cellSaves)
		{
			var tile = this;
			var grid = tile.grid;
			var activeCell = null;
			
			var isActiveGrid = grid.isActive;
			//if (!isActiveGrid)
			//{
				grid.showGrid(false);
			//}
			for (var i = 0; i < cellSaves.length; i++)
			{			
				var cellSave = cellSaves[i];
				
				var cellType = cellSave.cellType;
				var arrowDirections = {};
				arrowDirections.isMiddle = i == 0 ? false : true;
				
				//tile.addCell(cellType, arrowDirections, true);

				var cell = new Sleuthgrids.Cell(tile, tile.cells.length, cellType);
				tile.cells.push(cell);
				cell.makeCellDOM();
				tile.tileCellsWrapDOM.append(cell.cellDOM);
				
				var tileNavCell = new Sleuthgrids.TileNavCell(tile, tile.navCells.length);
				tile.navCells.push(tileNavCell);
				if (cellSave.isActive)
					activeCell = tileNavCell;
				tileNavCell.initDOM();
				tile.tileHeaderDOM.append(tileNavCell.tileNavCellDOM);
							
				if (!tile.isTileHeaderTabbed && tile.cells.length > 1)
				{
					tile.toggleHeaderTabbed(true);
				}

				tileNavCell.linkIndex = cellSave.linkIndex;
				cell.linkIndex = cellSave.linkIndex;
				
				tileNavCell.changeCellLinkDOM();
				tileNavCell.changeCellTabs();

				cell.loadCellFromSettings(cellSave.cellTypeSettings);
				cell.resizeCell();

			}
			
			if (activeCell);
				activeCell.changeCellTabs();
			if (!isActiveGrid)
			{
				grid.hideGrid();
			}
			
		},
		
		
		saveTile: function()
		{
			var tile = this;
			var $tile = tile.tileDOM;
			var saveObj = {};
			
			saveObj.positions = tile.positions;
			saveObj.winPositions = tile.winPositions;
			saveObj.index = tile.index;
			saveObj.isTileHeaderTabbed = tile.isTileHeaderTabbed;
			saveObj.cellSaves = tile.saveCells();
			
			tile.saveObj = saveObj;
		},
		
		
		saveCells: function()
		{
			var tile = this;
			var cells = tile.cells;
			
			var cellSaves = [];
			
			for (var i = 0; i < cells.length; i++)
			{
				var cell = cells[i];
				
				cell.saveCell();
				cellSaves.push(cell.saveObj);
			}
			
			return cellSaves;
		},
		
		
		
		addCell: function(cellType, arrowDirections, isNewCell)
		{
			//force = typeof force === "undefined" ? false : true;
			var tile = this;
			var $tile = tile.tileDOM;
			
			
			var cell = new Sleuthgrids.Cell(tile, tile.cells.length, cellType);
			tile.cells.push(cell);
			cell.makeCellDOM();
			tile.tileCellsWrapDOM.append(cell.cellDOM);
			
			
			var tileNavCell = new Sleuthgrids.TileNavCell(tile, tile.navCells.length);
			tile.navCells.push(tileNavCell);
			tileNavCell.initDOM();
			tile.tileHeaderDOM.append(tileNavCell.tileNavCellDOM);
						
			
			//if (arrowDirections.isMiddle)
			//{
				if (!tile.isTileHeaderTabbed && tile.cells.length > 1)
				{
					tile.toggleHeaderTabbed(true);
				}
			//}
			
			tileNavCell.changeCellTabs();
			if (isNewCell)
			{
				//console.log(cell.cellDOM.is(":visible"));
				cell.loadCell();
				cell.resizeCell();
			}
		},
		
		
		
		resizeCells: function()
		{
			var tile = this;
			var cells = tile.cells;
			
			for (var i = 0; i < cells.length; i++)
			{
				var cell = cells[i];
				
				cell.resizeCell();
			}
		},
		
		
		
		closeTile: function(tileNavCell)
		{
			var tile = this;
			var grid = tile.grid;
			var numCells = tile.cells.length;
			
			if (numCells > 1)
			{	
				tile.closeCell(tileNavCell);
			}
			else
			{
				tile.closeTileResizer();

				//tile.removeCell();
				grid.removeTile(tile);
			}
		},
		
		
		
		closeCell: function(tileNavCell)
		{
			var tile = this;
			var cellIndex = tileNavCell.index;
			var cell = tile.cells[cellIndex];			
			var numCells = tile.cells.length;


			if (numCells == 2)
			{
				tile.toggleHeaderTabbed(false);
			}
			
			tile.removeCell(cell);
			
			
			var activeNavCell = false;
			for (var i = 0; i < tile.navCells.length; i++)
			{
				if (tile.navCells[i].isActive)
				{
					activeNavCell = tile.navCells[i];
					break;
				}
			}
			
			if (!activeNavCell)
			{
				var newIndex = cellIndex - 1;
				newIndex = newIndex < 0 ? 0 : newIndex;
				activeNavCell = tile.navCells[newIndex];
			}

			activeNavCell.changeCellTabs();
		},
	
		
		
		closeTileResizer: function(withPrev)
		{
			var tile = this;
			var grid = tile.grid;
			var $tile = tile.tileDOM;
			
			var allTiles = grid.tiles.slice();
			allTiles.splice(tile.index, 1);
			if (withPrev)
				allTiles.push(grid.previewTile);
			
			var tilePositions = tile.positions;
			var searchMap = Sleuthgrids.makeSearchMap(tilePositions);
			
			/*for (searchDirection in searchMap)
			{
				var adjData = grid.searchForAdjacentTiles(tile, resizeDirection);
				
				var adjTiles = adjData.adjTiles;
				var nonAdjTiles = adjData.nonAdjTiles;
				var formattedCoords = adjData.formattedCoords;
			}*/
			
			for (searchDirection in searchMap)
			{
				var searchPoints = searchMap[searchDirection];
				var searchResults = grid.searchForParallelTiles(allTiles, searchPoints, searchDirection)
				
				if (searchResults.length)
				{
					var isVert = (searchDirection == "left" || searchDirection == "right");

					var coordOne = isVert ? searchPoints[0][1] : searchPoints[0][0];
					var coordTwo = isVert ? searchPoints[1][1] : searchPoints[1][0];
					var min = Math.min(coordOne, coordTwo)
					var max = Math.max(coordOne, coordTwo)
					var size = max - min;
					var runningSize = 0;
					var sizeKey = isVert ? "height" : "width";
					
					for (var j = 0; j < searchResults.length; j++)
					{
						runningSize += searchResults[j][0].tile.positions[sizeKey];
					}
										
					if (runningSize == size || Math.abs(runningSize - size) <= 0.5)
					{
						//console.log([size, runningSize, "yes"])
						break;
					}
					else
					{
						//console.log([size, runningSize, "no"])
						searchResults = [];
					}				
				}
			}
			
			if (!searchResults.length)
			{
				
			}
						
			var isLeftOrTop = (searchDirection == "left" || searchDirection == "top");
			var isHoriz = (searchDirection == "top" || searchDirection == "bottom"); //backwards
			var isVert = (searchDirection == "left" || searchDirection == "right");
			var absKey = isVert ? "left" : "top";
			var sizeKey = isVert ? "width" : "height";

			for (var i = 0; i < searchResults.length; i++)
			{
				var loopTile = searchResults[i][0].tile;
				var loopTilePositions = loopTile.positions;
				var $loopTile = loopTile.tileDOM;
				
				var size = loopTilePositions[sizeKey] + tilePositions[sizeKey];
				var abs = isLeftOrTop ? loopTilePositions[absKey] : loopTilePositions[absKey] - tilePositions[sizeKey];
				
				$loopTile.css(absKey, abs);
				$loopTile.css(sizeKey, size);
				loopTile.updateInternalTilePositions();
				
				if ("cells" in loopTile)
				{
					for (var j = 0; j < loopTile.cells.length; j++)
					{
						var loopCell = loopTile.cells[j];
						loopCell.resizeCell();
					}
				}
			}
		},
		
		
		
		removeTile: function()
		{
			var tile = this;
			var $tile = tile.tileDOM;
			
			tile.removeCell();
			//$tile.unbind();
			$tile.remove();
		},
		
		
		
		removeCell: function(cell)
		{
			var tile = this;
			
			var removeAll = (typeof cell === "undefined");
			
			if (removeAll)
			{
				for (var i = 0; i < tile.cells.length; i++)
				{
					var loopCell = tile.cells[i];
					loopCell.removeCell();
				}
				
				tile.cells = [];
			}
			else
			{				
				var cellIndex = cell.index;
				var tileNavCell = tile.navCells[cellIndex];
				
				tileNavCell.removeTileNavCell();
				cell.removeCell();
				
				tile.navCells.splice(cellIndex, 1);
				Sleuthgrids.updateArrayIndex(tile.navCells);
				
				tile.cells.splice(cellIndex, 1);
				Sleuthgrids.updateArrayIndex(tile.cells);
			}
		},
		
		
		
		toggleHeaderTabbed: function(isTabbed)
		{
			var tile = this;
			var $tileHeader = tile.tileHeaderDOM;
			
			if (isTabbed)
			{
				$tileHeader.addClass("tile-header-tabs");					
				tile.isTileHeaderTabbed = true;
			}
			else
			{
				$tileHeader.removeClass("tile-header-tabs");					
				tile.isTileHeaderTabbed = false;
			}
		},
		
		
		
		onTileMousemove: function(e)
		{
			var tile = this;
			var grid = tile.grid;
			
			var mouseY = e.clientY;
			var mouseX = e.clientX;
			
			var tilePositions = tile.winPositions;
			
			var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions);
			
			if (isInsideBorder.isInside && !Sleuthgrids.isResizing)
			{
				var borderMap = ["top", "bottom", "left", "right"]
				var dirMap = ["N", "S", "W", "E"]
				
				for (var i = 0; i < borderMap.length; i++)
				{
					var borderKey = borderMap[i];
					
					if (isInsideBorder[borderKey])
					{
						var resizeClassName = "tileResize" + dirMap[i];
						
						tile.removeResizeClass();
						tile.addResizeClass(resizeClassName);
						
						break;
					}
				}
			}
			else
			{
				if (!Sleuthgrids.isResizing)
				{
					tile.removeResizeClass();
				}
			}
			
				
			if (Sleuthgrids.isResizing)
			{
				var resizePos = Sleuthgrids.resizeTile.positions;
				var offsetX = grid.gridDOM.offset().left;
				var offsetY = grid.gridDOM.offset().top;
				var insideX = mouseX - offsetX;
				var insideY = mouseY - offsetY;
				
				grid.resizeTile(insideX, insideY)
			}
		},
		
		
		
		onTileMouseleave: function()
		{
			var tile = this;

			if (!Sleuthgrids.isResizing)
			{
				tile.removeResizeClass();
			}
		},
		
		

		onTileMouseDown: function(e)
		{
			var tile = this;
			var $tileDOM = tile.tileDOM;
			var grid = tile.grid;
			
			var mouseY = e.clientY
			var mouseX = e.clientX
			
			var tilePositions = tile.winPositions;
			
			var isInsideBorder = Sleuthgrids.checkIfMouseIsInsideBorder(mouseY, mouseX, tilePositions)

					
			if (isInsideBorder.isInside)
			{
				//$mainGrid.find(".tile").removeClass("active");
				//$tileDOM.find(".tile").addClass("active");
				
				Sleuthgrids.resizeDir = isInsideBorder.direction;
				Sleuthgrids.isResizing = true;
				Sleuthgrids.resizeTile = tile;
				grid.toggleTileResizeOverlay(true);	
			}
		},
		
		
		onTileHeaderMouseLeave: function(e)
		{
			
		},
		
		
		toggleTileOverlay: function(isVisible)
		{
			var tile = this;
			var $tileOverlay = tile.tileOverlayDOM;
			
			if (isVisible)
			{
				$tileOverlay.addClass("active");
			}
			else
			{
				$tileOverlay.removeClass("active");
			}
		},
		
		
		
		showTileBorder: function()
		{
			var tile = this;
			var grid = tile.grid;
			var $tile = tile.tileDOM;
			
			
			grid.gridDOM.find(".tile-header-tab").removeClass("focus-border");
			grid.gridDOM.find(".tile-cells").removeClass("focus-border");
			
			
			var activeNavCell = false;
			
			for (var i = 0; i < tile.navCells.length; i++)
			{
				if (tile.navCells[i].isActive)
				{
					activeNavCell = tile.navCells[i];
					break;
				}
			}

				tile.tileCellsWrapDOM.addClass("focus-border");
				
				activeNavCell.tileNavCellDOM.addClass("focus-border");
		},
		
		
		
		changeCellTab: function($tileNavCell)
		{
			var tile = this;
			
			var cellIndex = $tileNavCell.attr("data-cellIndex");
			var $tile = $tileNavCell.closest(".tile");
			var $cell = $tile.find(".cell[data-cellIndex='" + cellIndex + "']")
			
			$tile.find(".tile-nav-cell").removeClass("active");
			$tile.find(".cell").addClass("tab-hidden");
			
			$tileNavCell.addClass("active");
			$cell.removeClass("tab-hidden");
		},
		
		
		addResizeClass: function(resizeClassName)
		{
			var tile = this;
			
			$contentWrap.addClass(resizeClassName)
		},
		
		
		
		removeResizeClass: function()
		{
			var tile = this;
			
			$contentWrap.removeClass("tileResizeW tileResizeN tileResizeE tileResizeS")
		},
		
		
		
		showTileArrows: function()
		{
			var tile = this;
			var $tileArrowWrap = tile.tileArrowWrapDOM;

			if (Sleuthgrids.isGridTrig && (Sleuthgrids.triggeredCell == null || Sleuthgrids.triggeredCell.tile != tile)) //|| !$(this).is(Sleuthgrids.triggeredGrid)
			{
				$tileArrowWrap.addClass("active");
			}
		},
		
		
		
		hideTileArrows: function()
		{
			var tile = this;
			var $tileArrowWrap = tile.tileArrowWrapDOM;

			
			if (Sleuthgrids.isGridTrig)
			{
				$tileArrowWrap.removeClass("active");
			}
		},
		
		
		
		onTileArrowMouseover: function($arrow)
		{
			var tile = this;
			var grid = tile.grid;
			var $tile = tile.tileDOM;
			var $tileArrowWrap = tile.tileArrowWrapDOM;
			var previewTile = grid.previewTile;
			var $previewTile = previewTile.tileDOM;

			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

			
			$tileArrowWrap.addClass(arrowDirections.direction);
			Sleuthgrids.toggleTileAdd(false);
			
			
			var tilePositions = tile.positions;
			
			
			var sizeKeys = getSizeKeys(arrowDirections, tilePositions, false, false)
			
			$tile.css(sizeKeys.sizeKey, sizeKeys.newSize);
			$tile.css(sizeKeys.absKey, sizeKeys.newAbs);
			tile.updateInternalTilePositions();
			
			
			var sizeKeys = getSizeKeys(arrowDirections, tilePositions, true, false)

			$previewTile.css("left", tilePositions.left);
			$previewTile.css("top", tilePositions.top);
			$previewTile.css("height", tilePositions.height);
			$previewTile.css("width", tilePositions.width);

			$previewTile.css(sizeKeys.absKey, sizeKeys.newAbs);
			$previewTile.css(sizeKeys.sizeKey, sizeKeys.newSize);
			
			previewTile.showPreviewTile();
			previewTile.updateInternalTilePositions();
			tile.resizeCells();
		},
		
		
		
		onTileArrowMouseout: function($arrow)
		{
			if (Sleuthgrids.isGridTrig)
			{	
				var tile = this;
				var grid = tile.grid;
				var previewTile = grid.previewTile;
				var $tile = tile.tileDOM;
				var $tileArrowWrap = tile.tileArrowWrapDOM;
			
				
				var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

				$tileArrowWrap.removeClass(arrowDirections.direction);
				Sleuthgrids.toggleTileAdd(true);

				
				var tilePositions = tile.positions;
				
				var sizeKeys = getSizeKeys(arrowDirections, tilePositions, false, true)
				
				$tile.css(sizeKeys.sizeKey, sizeKeys.newSize)
				$tile.css(sizeKeys.absKey, sizeKeys.newAbs)
				tile.updateInternalTilePositions();
				
				previewTile.hidePreviewTile();
				tile.resizeCells();
			}
		},
		
		
		
		onTileArrowMouseup: function($arrow)
		{
			var tile = this;
			var grid = tile.grid;
			var previewTile = grid.previewTile;
			var previewTilePositions = previewTile.positions;

			var $tileArrowWrap = tile.tileArrowWrapDOM;
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			
			var triggeredType = Sleuthgrids.triggeredType;
			var isTriggeredNew = Sleuthgrids.isTriggeredNew;

	
			Sleuthgrids.toggleTileAdd(false);
			$tileArrowWrap.removeClass(arrowDirections.direction);
			
			
			/*var newGridDirections = 
			{
				height: prevPos.height,
				width: prevPos.width,
				top: prevPos.top,
				left: prevPos.left,
			}*/
			
			
			if (arrowDirections.isMiddle && isTriggeredNew)
			{
				arrowDirections.isTab = true;
				tile.addCell(triggeredType, arrowDirections, isTriggeredNew);
			}
			else
			{
				grid.makeTile(arrowDirections, previewTilePositions, tile);
			}

			

			previewTile.hidePreviewTile();
		}
		
			
		
	}
	
	
	
	function getSizeKeys(arrowDirections, gridPositions, isInverted, isSignInverted)
	{
		var obj = {};
		
		var isHoriz = arrowDirections.isHoriz;
		var isMiddle = arrowDirections.isMiddle;
		var isLeftOrTop = arrowDirections.isLeft || arrowDirections.isTop;
			
		var absKey = isHoriz ? "left" : "top";
		var sizeKey = isHoriz ? "width" : "height";
		
		
		var size = gridPositions[sizeKey];
		var abs = gridPositions[absKey];


		
		if (isMiddle)
		{
			var newSize = size;
			var newAbs = abs;
			
		}
		else
		{
			var newSize = isSignInverted ? (size * 2) : (size / 2);
		
			var otherAbs = isSignInverted ? (abs - size) : (abs + newSize);
			
			//var newAbs = isInverted ? abs : otherAbs;

			
			if (isInverted)
			{
				var newAbs = isLeftOrTop ? abs : otherAbs;
			}
			else
			{
				var newAbs = isLeftOrTop ? otherAbs : abs;

			}
		}
		
		
		obj.absKey = absKey;
		obj.sizeKey = sizeKey;
		obj.newAbs = newAbs;
		obj.newSize = newSize;
		
		
		return obj;
	}
	
	

	
	
	
	
	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));

