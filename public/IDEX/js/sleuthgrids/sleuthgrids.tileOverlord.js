

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{
	
	
	var TileOverlord = Sleuthgrids.TileOverlord = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	TileOverlord.prototype = 
	{
		
		init: function(grid)
		{
			var tileOverlord = this;
			
			tileOverlord.grid = grid;
			tileOverlord.gridDOM = grid.gridDOM;
			tileOverlord.tilesWrapDOM = grid.gridDOM.find(".tiles");

			tileOverlord.tiles = [];
			
			tileOverlord.previewTile = new Sleuthgrids.PreviewTile(grid);
		},
		
		
		
		getAllTiles: function(excludedTile)
		{
			var tileOverlord = this;
			
			var allTiles = tileOverlord.tiles.slice();
			
			if (excludedTile)
			{
				allTiles.splice(excludedTile.index, 1);
			}
			
			return allTiles;
		},
		
		
		
		initTilesFromSave: function(tileSaves)
		{
			var tileOverlord = this;
			
			for (var i = 0; i < tileSaves.length; i++)
			{			
				var tileSave = tileSaves[i];
				var tileSavePositions = tileSave.positions;
				var tileCSS = Sleuthgrids.positionsToCSS(tileSavePositions);
				
				var tile = tileOverlord.makeTile(tileCSS);
				tile.positions = tileSavePositions;

				var cellSaves = tileSave.cellSaves;
				tile.cellOverlord.initCellsFromSave(cellSaves);
			}
		},
		
		
		
		makeTile: function(tileCSS)
		{
			var tileOverlord = this;
			var index = tileOverlord.tiles.length;
			
			var tile = new Sleuthgrids.Tile(tileOverlord, index, tileCSS);
			
			tileOverlord.tiles.push(tile);
			tileOverlord.tilesWrapDOM.append(tile.tileDOM);
			//tile.updateInternalTilePositions();

			return tile;
		},
		
		
		
		addTile: function(arrowDirections, newTilePositions, newTile)
		{
			var tileOverlord = this;
			var isTriggeredNew = Sleuthgrids.isTriggeredNew;
			var tileCSS = Sleuthgrids.positionsToCSS(newTilePositions);

			if (isTriggeredNew)
			{
				var triggeredCellType = Sleuthgrids.triggeredType;
				var tile = tileOverlord.makeTile(tileCSS);
				tile.updateInternalTilePositions();
				tile.cellOverlord.makeCell(triggeredCellType, -1, true, isTriggeredNew);
			}
			else
			{
				var triggeredCell = Sleuthgrids.triggeredCell;
				var triggeredCellOverlord = triggeredCell.cellOverlord;
				var triggeredTile = triggeredCell.cellOverlord.tile;

				var $triggeredTile = triggeredTile.tileDOM;
				
				var numCells = triggeredCellOverlord.cells.length;
				
				if (numCells == 1 && !arrowDirections.isMiddle)
				{
					triggeredTile.tileOverlord.closeTileResizer(triggeredTile, false);
					$triggeredTile.css(tileCSS);
					triggeredTile.updateInternalTilePositions();
				}
				else
				{
					if (!arrowDirections.isMiddle)
					{
						newTile = tileOverlord.makeTile(tileCSS);
						newTile.updateInternalTilePositions();
					}
					
					triggeredCellOverlord.moveCellToNewCellOverlord(triggeredCell, newTile.cellOverlord);	
				}
			}
		
			tileOverlord.resizeTileCells();
		},
		

		
		resizeTileCells: function()
		{
			var tileOverlord = this;
			var tiles = tileOverlord.tiles;
			var numTiles = tiles.length;
			
			for (var i = 0; i < numTiles; i++)
			{
				var tile = tiles[i];
				tile.cellOverlord.resizeAllCells();
			}
		},
		
		
		
		scaleTiles: function()
		{
			var tileOverlord = this;
			var grid = tileOverlord.grid;
			var tiles = tileOverlord.tiles;
			
			var prevGridPositions = grid.prevGridPositions;
			var currentGridPositions = grid.currentGridPositions;
			
			var prevGridHeight = prevGridPositions.height;
			var prevGridWidth = prevGridPositions.width;
			var gridHeight = currentGridPositions.height;
			var gridWidth = currentGridPositions.width;

			var heightDiff = gridHeight - prevGridHeight;
			var widthDiff = gridWidth - prevGridWidth;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
									
				tile.resizeTile("height", prevGridHeight, heightDiff);
				tile.resizeTile("width", prevGridWidth, widthDiff);

				tile.updateInternalTilePositions();
				tile.cellOverlord.resizeAllCells();
			}
		},
		
		
		
		saveAllTiles: function()
		{
			var tileOverlord = this;
			var tiles = tileOverlord.tiles;
			var numTiles = tiles.length;
			var tileSaves = [];
			
			for (var i = 0; i < numTiles; i++)
			{
				var tile = tiles[i];
				
				var tileSave = tile.saveTile();
				tileSaves.push(tileSave);
			}
			
			return tileSaves;
		},
		
		
		
		removeTile: function(tile)
		{
			var tileOverlord = this;
			var tileIndex = tile.index;
			
			tileOverlord.closeTileResizer(tile, false);
			tile.removeTile();
			tileOverlord.tiles.splice(tileIndex, 1);
			Sleuthgrids.updateArrayIndex(tileOverlord.tiles);
		},
		
		
		
		removeAllTiles: function()
		{
			var tileOverlord = this;
			var tiles = tileOverlord.tiles;
			var numTiles = tiles.length;

			for (var i = 0; i < numTiles; i++)
			{
				var tile = tiles[i];
				tileOverlord.removeTile(tile);
			}
		},
		
		
		
		toggleTileResizeOverlay: function(isResizing)
		{
			var tileOverlord = this;
			var tiles = tileOverlord.tiles;
			var numTiles = tiles.length;
			
			for (var i = 0; i < numTiles; i++)
			{
				var tile = tiles[i];
				tile.toggleTileOverlay(isResizing);
			}
		},
		
		

		findTilesTouchingEdge: function(direction, edgePosition)
		{
			var tileOverlord = this;
			var tiles = tileOverlord.tiles;
			var numTiles = tiles.length;
			
			var foundTiles = [];

			for (var i = 0; i < numTiles; i++)
			{
				var tile = tiles[i];
				var tilePositions = tile.positions;
				var tileEdgePosition = tilePositions[direction];
				
				if (Sleuthgrids.checkIfSamePosition(edgePosition, tileEdgePosition))
				{
					foundTiles.push(tile);
				}	
			}
			

			return foundTiles;
		},
		
		
		
		getSmallestTile: function(tiles, sizeKey)
		{
			var lowestTile = null;
			var lowestSize = -1;

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

		
		
		closeTileResizer: function(tile, withPrev)
		{
			var tileOverlord = this;
			var previewTile = tileOverlord.previewTile;
			
			var tilePositions = tile.positions;
			
			var allTiles = tileOverlord.getAllTiles(tile);
			if (withPrev)
				allTiles.push(tileOverlord.previewTile);
			
			var sides = Sleuthgrids.getSideCoords(tilePositions);
			
			
			for (var searchDirection in sides)
			{
				var side = sides[searchDirection];
				var sideCoord = side.coord;
				var parallelTiles = tileOverlord.searchForParallelTiles(allTiles, sideCoord, searchDirection)
				
				if (parallelTiles.length)
				{
					break;
				}
			}
			
			if (parallelTiles.length)
			{
				var directions = Sleuthgrids.getDirections(searchDirection);
				var absKey = directions.isVert ? "top" : "left";
				var sizeKey = directions.isVert ? "height" : "width";
				var isLeftOrTop = directions.isLeftOrTop;
				
				for (var i = 0; i < parallelTiles.length; i++)
				{
					var loopTile = parallelTiles[i];
					var $loopTile = loopTile.tileDOM;
					var loopTilePositions = loopTile.positions;
					
					var size = loopTilePositions[sizeKey] + tilePositions[sizeKey];
					var abs = isLeftOrTop ? loopTilePositions[absKey] : loopTilePositions[absKey] - tilePositions[sizeKey];
					
					var obj = {}
					obj[absKey] = abs;
					obj[sizeKey] = size;
					
					//$loopTile.css(obj);
					//loopTile.updateInternalTilePositions();

					loopTile.animate(obj, 300);

					
					
					//loopTile.cellOverlord.resizeAllCells();
					
				}
			}
		},
		
		
		
		resizeTile: function(mouseX, mouseY)
		{
			var tileOverlord = this;
			var tile = Sleuthgrids.resizeTile;
			var tilePositions = tile.positions;
			var resizeDirection = Sleuthgrids.resizeDir;
			var directions = Sleuthgrids.getDirections(resizeDirection);
			
			var foundTiles = tileOverlord.getTilesAlongAnExpandingTileSide(tile, resizeDirection);
			var adjTiles = foundTiles.adjTilesInRange;
			adjTiles.push(tile);

			var parallelTiles = foundTiles.parallelTiles;

			if (parallelTiles.length)
			{
				var mousePos = directions.isVert ? mouseY : mouseX;
				var diff = mousePos - tilePositions[resizeDirection];
			
				var resizeFunc = function(tiles, isAdjacent)
				{
					for (var i = 0; i < tiles.length; i++)
					{
						var loopTile = tiles[i];
						var pos = loopTile.positions;
						//var minSize = tile['min'+sizeKey];
						var absKey = directions.isVert ? "top" : "left";
						var sizeKey = directions.isVert ? "height" : "width";
						var adjCheck = isAdjacent ? directions.isLeftOrTop : !directions.isLeftOrTop;

						var newSize = adjCheck ? (pos[sizeKey] - diff) : (pos[sizeKey] + diff);
						loopTile.tileDOM.css(sizeKey, newSize);
						
						if (adjCheck)
						{
							var newAbs = pos[absKey] + diff;
							loopTile.tileDOM.css(absKey, newAbs);
						}
						
						loopTile.updateInternalTilePositions();
					}
				}
				
				resizeFunc(adjTiles, true);
				resizeFunc(parallelTiles, false);
			}

		},
		
		
		
		getTilesAlongAnExpandingTileSide: function(tile, sideDirection)
		{
			var tileOverlord = this;
			var allTiles = tileOverlord.getAllTiles(tile);
			var adjData = tileOverlord.searchForAdjacentTiles(tile, sideDirection);
			var possibleTileRanges = adjData.rangeData;
			
			var adjTilesInRange = [];
			var parallelTiles = [];

			for (var i = 0; i < possibleTileRanges.length; i++)
			{
				var tileRange = possibleTileRanges[i];
				var lineObj = tileRange.lineCoord;
				var coord = lineObj.coord;
				adjTilesInRange = tileRange.tilesInRange;
				
				parallelTiles = tileOverlord.searchForParallelTiles(allTiles, coord, sideDirection);
				
				if (parallelTiles.length)
				{
					break;
				}
			}
			
			return {adjTilesInRange:adjTilesInRange, parallelTiles:parallelTiles};
		},



		searchForParallelTiles: function(searchTiles, rangeCoord, searchDirection)
		{
			var tileOverlord = this;
			var checkDirection = Sleuthgrids.invertDirection(searchDirection);
			
			var parallelTiles = [];
			var runningSize = 0;
			
			for (var i = 0; i < searchTiles.length; i++)
			{
				var searchTile = searchTiles[i];
				var searchTilePositions = searchTile.positions;
				var allSidesCoords = Sleuthgrids.getSideCoords(searchTilePositions);

				var sideCoords = allSidesCoords[checkDirection].coord;
				var searchTilePointACoord = sideCoords[0];
				var searchTilePointBCoord = sideCoords[1];
				var isVert = (searchDirection == "top" || searchDirection == "bottom");
				var indexOfSame = isVert ? 1 : 0;
				var indexOfBetween = isVert ? 0 : 1;

				var min = Math.min(rangeCoord[0][indexOfBetween], rangeCoord[1][indexOfBetween]);
				var max = Math.max(rangeCoord[0][indexOfBetween], rangeCoord[1][indexOfBetween]);
				var size = max-min;
				var isSame = Math.abs(rangeCoord[0][indexOfSame] - searchTilePointACoord[indexOfSame]) <= 0.5;
				var isBetween = (searchTilePointACoord[indexOfBetween] >= min - 1) && (searchTilePointBCoord[indexOfBetween] <= max + 1);
				
				if (isSame && isBetween)
				{
					parallelTiles.push(searchTile);
				}
				


			}
			
			if (parallelTiles.length)
			{
				var sizeKey = isVert ? "width" : "height";

				var runningSize = 0;
				
				for (var i = 0; i < parallelTiles.length; i++)
				{
					var parallelTile = parallelTiles[i];
					var parallelTilePosition = parallelTile.positions;

					runningSize += parallelTilePosition[sizeKey];
				}
				
				
				//var ret = tileOverlord.checkSearchTilesTotalSize(parallelTiles)
				if (Math.abs(size - runningSize) >= 1)
				{
					parallelTiles = [];
				}
			}
			
			return parallelTiles;
		},
		
		

		
		searchForAdjacentTiles: function(tile, searchDirection)
		{
			var tileOverlord = this;
			
			var allTiles = tileOverlord.getAllTiles(tile);		
			var directions = Sleuthgrids.getDirections(searchDirection);
			var searchPosition = tile.positions[searchDirection];

			var searchSideDirections = {};
			searchSideDirections.sideA = directions.isVert ? "left" : "top";
			searchSideDirections.sideB = directions.isVert ? "right" : "bottom";
			
			var mainTile = {};
			mainTile.tile = tile;
			mainTile.positions = tile.positions;
			mainTile.sides = Sleuthgrids.getSideCoords(tile.positions);
			mainTile.sideA = mainTile.sides[searchSideDirections.sideA];
			mainTile.sideB = mainTile.sides[searchSideDirections.sideB];


			var tilesInRow = tileOverlord.getTilesInRow(allTiles, searchDirection, searchPosition);
			
			var tilesInRowFormatted = tileOverlord.formatTilesInRow(tilesInRow, mainTile, searchSideDirections);
			
			var allRowCoords = tileOverlord.getAdjacentTileCoords(tilesInRowFormatted, mainTile);

			var allRowCoordsFormatted = tileOverlord.formatAdjacentTileCoords(allRowCoords, searchPosition, directions.isVert);

			
			var formattedAdjData = tileOverlord.formatAdjacentTileData(tilesInRowFormatted, allRowCoordsFormatted);
			
			return formattedAdjData;
		},
	
		
		
		getTilesInRow: function(tiles, searchDirection, searchPosition)
		{
			var tilesInRow = [];
			
			for (var i = 0; i < tiles.length; i++)
			{
				var loopTile = tiles[i];
				var loopTilePositions = loopTile.positions;
				var loopTileSearchPosition = loopTilePositions[searchDirection];
				
				if (Sleuthgrids.checkIfSamePosition(searchPosition, loopTileSearchPosition))
				{
					tilesInRow.push(loopTile);
				}	
			}
			
			return tilesInRow;
		},
		
		
		
		formatTilesInRow: function(tilesInRow, mainTile, searchSideDirections)
		{
			var sideADirection = searchSideDirections.sideA;
			var sideBDirection = searchSideDirections.sideB;

			var tilesInRowFormatted = {};
			tilesInRowFormatted.allTiles = [];
			tilesInRowFormatted.sideATiles = [];
			tilesInRowFormatted.sideBTiles = [];
			
			for (var i = 0; i < tilesInRow.length; i++)
			{
				var tileInRow = tilesInRow[i];
				var tileInRowPositions = tileInRow.positions;
				var tileInRowSides = Sleuthgrids.getSideCoords(tileInRowPositions)
				
				var tileInRowSideA = tileInRowSides[sideADirection];
				var tileInRowSideB = tileInRowSides[sideBDirection];

				var dirRelativeToMainTile = tileInRowSideA.pos < mainTile.sideA.pos ? sideADirection : sideBDirection;
				var isSideA = dirRelativeToMainTile == sideADirection;
				
				var tileInRowFormatted = {};
				tileInRowFormatted.tile = tileInRow;
				tileInRowFormatted.dirRelativeToMainTile = dirRelativeToMainTile;
				tileInRowFormatted.isSideA = isSideA;
				tileInRowFormatted.sideA = tileInRowSideA;
				tileInRowFormatted.sideB = tileInRowSideB;
				
				tilesInRowFormatted.allTiles.push(tileInRowFormatted);
				tilesInRowFormatted[isSideA ? "sideATiles" : "sideBTiles"].push(tileInRowFormatted);
			}
			
			return tilesInRowFormatted;
		},
		
		
		
		getAdjacentTileCoords: function(tilesInRowFormatted, mainTile)
		{
			var tileOverlord = this;
			
			var allRowTiles = tilesInRowFormatted.allTiles;
			var sideATiles = tilesInRowFormatted.sideATiles;
			var sideBTiles = tilesInRowFormatted.sideBTiles;

			var mainTileSideAPosition = mainTile.sideA.pos;
			var mainTileSideBPosition = mainTile.sideB.pos;
			var mainTileLengthCoord = [mainTileSideAPosition, mainTileSideBPosition];
			
			var allRowCoords = [];
			allRowCoords.push(mainTileLengthCoord);
			
			
			for (var i = 0; i < allRowTiles.length; i++)
			{
				var rowTile = allRowTiles[i];
				var isSideA = rowTile.isSideA;
				
				var sideAPosition = isSideA ? rowTile.sideA.pos : mainTileSideAPosition;
				var sideBPosition = isSideA ? mainTileSideBPosition : rowTile.sideB.pos;
				
				var coord = [sideAPosition, sideBPosition];
				allRowCoords.push(coord);
			}
			
			for (var i = 0; i < sideATiles.length; i++)
			{
				var sideATile = sideATiles[i];
				var sideAPosition = sideATile.sideA.pos;
				
				for (var j = 0; j < sideBTiles.length; j++)
				{
					var sideBTile = sideBTiles[j];
					var sideBPosition = sideBTile.sideB.pos;
					
					var coord = [sideAPosition, sideBPosition];
					allRowCoords.push(coord);
				}
			}
			
			
			return allRowCoords;
		},
		
		
		
		formatAdjacentTileCoords: function(allRowCoords, constantSidePosition, isVert)
		{
			var tileOverlord = this;
			
			var allRowCoordsFormatted = [];

			for (var i = 0; i < allRowCoords.length; i++)
			{
				var rowCoord = allRowCoords[i];
				var sideAPosition = rowCoord[0];
				var sideBPosition = rowCoord[1];
				
				var vertCoord = [[constantSidePosition, sideAPosition], [constantSidePosition, sideBPosition]];
				var nonVertCoord = [[sideAPosition, constantSidePosition], [sideBPosition, constantSidePosition]];
				
				var formattedCoord = !isVert ? vertCoord : nonVertCoord; 
				
				var lineCoord = {};
				lineCoord.pointA = formattedCoord[0];
				lineCoord.pointB = formattedCoord[1];
				lineCoord.coord = formattedCoord;
				lineCoord.isVert = isVert;
				lineCoord.distancePoints = [sideAPosition, sideBPosition];

				allRowCoordsFormatted.push(lineCoord);
			}
			
			return allRowCoordsFormatted;
		},
		
		
		
		formatAdjacentTileData: function(tilesInRowFormatted, allRowCoordsFormatted)
		{
			var formattedAdjData = {};
			var rangeData = [];
			
			formattedAdjData.adjTiles = tilesInRowFormatted;
			
			for (var i = 0; i < allRowCoordsFormatted.length; i++)
			{
				var lineCoord = allRowCoordsFormatted[i];
				var lineDistanceA = lineCoord.distancePoints[0];
				var lineDistanceB = lineCoord.distancePoints[1];
				var tilesInRange = [];

				for (var j = 0; j < tilesInRowFormatted.allTiles.length; j++)
				{
					var tileInRow = tilesInRowFormatted.allTiles[j];

					var firstBetween = tileInRow.sideA.pos >= lineDistanceA;
					var secondBetween =  tileInRow.sideB.pos <= lineDistanceB;
					
					if (firstBetween && secondBetween)
					{
						tilesInRange.push(tileInRow.tile);
					}
				}
				
				var obj = {}
				obj.lineCoord = lineCoord;
				obj.tilesInRange = tilesInRange;
				
				rangeData.push(obj);
			}
			
			formattedAdjData.rangeData = rangeData;
			
			return formattedAdjData;
		},
		


		
		getAllCells: function()
		{
			var tileOverlord = this;
			var tiles = tileOverlord.tiles;
			var numTiles = tiles.length;
			
			var cellOverlords = [];
			var allCells = [];
			
			for (var i = 0; i < numTiles; i++)
			{
				var loopTile = tiles[i];
				var loopCellOverlord = loopTile.cellOverlord;
				cellOverlords.push(loopCellOverlord);
			}
			
			for (var i = 0; i < cellOverlords.length; i++)
			{
				var loopCellOverlord = cellOverlords[i];
				var loopCells = loopCellOverlord.cells;
				
				allCells = allCells.concat(loopCells);
			}
			
			return allCells;
		},
		
		
		getLinkedCells: function(cell, includeSelf)
		{
			var tileOverlord = this;
			
			var allCells = tileOverlord.getAllCells();
			var linkIndex = cell.linkIndex;
			var obj = {};
			includeSelf = typeof includeSelf === "undefined" ? true : includeSelf;

			
			for (var i = 0; i < allCells.length; i++)
			{
				var loopCell = allCells[i];
				var loopCellLinkIndex = loopCell.linkIndex;
				
				if ((!includeSelf) && (loopCell == cell))
				{
					continue;
				}
				
				if (!(String(loopCellLinkIndex) in obj))
				{
					obj[String(loopCellLinkIndex)] = [];
				}
				
				obj[String(loopCellLinkIndex)].push(loopCell);
			}
			
			
			var linkedCells = obj[linkIndex];
			linkedCells = typeof linkedCells == "undefined" ? [] : linkedCells;
			
			return linkedCells;
		},
			

	}
	
	
	
	return Sleuthgrids;

	
}(Sleuthgrids || {}));
