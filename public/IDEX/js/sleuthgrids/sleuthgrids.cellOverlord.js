

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{

	
	var CellOverlord = Sleuthgrids.CellOverlord = function()
	{
		this.init.apply(this, arguments)
	}
	
	CellOverlord.prototype = 
	{
		
		init: function(tile)
		{
			var cellOverlord = this;
			
			cellOverlord.tile = tile;
			cellOverlord.grid = tile.grid;
			
			cellOverlord.cells = [];
			cellOverlord.isHeaderTabbed = false;
			
			cellOverlord.initDOM();
		},
		
		
		initDOM: function()
		{
			var cellOverlord = this;
			var tile = cellOverlord.tile;
			
			cellOverlord.cellHeaderDOM = tile.tileDOM.find(".tile-header");
			cellOverlord.tileCellsWrapDOM = tile.tileDOM.find(".tile-cells");
		},
		
		
		toggleHeaderTabbed: function(isTabbed)
		{
			var cellOverlord = this;
			var $cellHeader = cellOverlord.cellHeaderDOM;
			var isHeaderTabbed = cellOverlord.isHeaderTabbed;
			var numCells = cellOverlord.cells.length;
			
			var needsFix = (!isHeaderTabbed && numCells > 1) || (isHeaderTabbed && numCells == 1);
			
			if (needsFix)
			{
				var isTabbed = !cellOverlord.isHeaderTabbed;
				var toggleClass = isTabbed ? "addClass" : "removeClass";
				
				cellOverlord.isHeaderTabbed = isTabbed;
				$cellHeader[toggleClass]("tile-header-tabs");
			}
		},
		
		
		
		initCellsFromSave: function(cellSaves)
		{
			var cellOverlord = this;
			
			for (var i = 0; i < cellSaves.length; i++)
			{			
				var cellSave = cellSaves[i];
				var cellType = cellSave.cellType;
				var index = cellOverlord.cells.length;
				var isActive = cellSave.isActive;

				var cell = cellOverlord.makeCell(cellType, cellSave.linkIndex, isActive);

				cell.loadCellFromSettings(cellSave.cellTypeSettings);
				cell.resizeCell();
			}
		},
		
		
		
		makeCell: function(cellType, linkIndex, isActive, isNewCell)
		{
			var cellOverlord = this;
			var index = cellOverlord.cells.length;
			
			var cell = new Sleuthgrids.Cell(cellOverlord, index, cellType);
			cellOverlord.cells.push(cell);
			cellOverlord.tileCellsWrapDOM.append(cell.cellDOM);

			cellOverlord.toggleHeaderTabbed();
			
			if (isActive)
			{
				cellOverlord.hideAllCells();
				cellOverlord.showCell(cell);
			}
			
			if (isNewCell)
			{
				cell.loadCell();
				cell.resizeCell();
			}
			
			return cell;
		},

		
		moveCellToNewCellOverlord: function(cell, newCellOverlord)
		{
			var cellOverlord = this;			
			var cellIndex = cell.index;			
			var tempIndex = cellIndex - 1 > 0 ? cellIndex - 1 : 0;

			cellOverlord.cells.splice(cellIndex, 1);
			
			cell.cellDOM.appendTo(newCellOverlord.tileCellsWrapDOM);
			cell.cellNav.cellNavDOM.appendTo(newCellOverlord.cellHeaderDOM);
			newCellOverlord.cells.push(cell);
			cell.cellOverlord = newCellOverlord;
			cell.cellNav.cellOverlord = newCellOverlord;

			Sleuthgrids.updateArrayIndex(cellOverlord.cells);
			Sleuthgrids.updateArrayIndex(newCellOverlord.cells);

			newCellOverlord.toggleHeaderTabbed();
			cellOverlord.toggleHeaderTabbed();
			
			cell.cellNav.unbindEventListeners();
			cell.cellNav.initEventListeners();
			

			newCellOverlord.hideAllCells();
			newCellOverlord.showCell(cell);
			
			if (cellOverlord.cells.length == 0)
			{
				//cellOverlord.tile.tileOverlord.closeTileResizer(cellOverlord.tile, false);
				cellOverlord.tile.tileOverlord.removeTile(cellOverlord.tile);
			}
			else
			{
				cellOverlord.hideAllCells();
				cellOverlord.showCell(cellOverlord.cells[tempIndex]);
			}
		},
		
		
		showCell: function(cell)
		{
			var cellOverlord = this;
			
			cell.showCell();
			//tile.showTileBorder();
		},
		
		
		
		hideAllCells: function()
		{
			var cellOverlord = this;
			var cells = cellOverlord.cells;
			var numCells = cells.length;
			
			for (var i = 0; i < numCells; i++)
			{
				var loopCell = cells[i];
				loopCell.hideCell();
			}
		},
		
		
		
		resizeAllCells: function()
		{
			var cellOverlord = this;
			var cells = cellOverlord.cells;
			var numCells = cells.length;
			
			for (var i = 0; i < numCells; i++)
			{
				var cell = cells[i];
				
				cell.resizeCell();
			}
		},
		
		
		
		saveCells: function()
		{
			var cellOverlord = this;
			var cells = cellOverlord.cells;
			var numCells = cells.length;
			var cellSaves = [];
			
			for (var i = 0; i < numCells; i++)
			{
				var cell = cells[i];
				
				var cellSave = cell.saveCell();
				cellSaves.push(cellSave);
			}
			
			return cellSaves;
		},
		
		
		
		closeCell: function(cell)
		{
			var cellOverlord = this;
			var cells = cellOverlord.cells;
			var cellIndex = cell.index;
			
			cellOverlord.removeCell(cell);
			
			var newIndex = ((cellIndex - 1) < 0) ? 0 : cellIndex - 1;
			var newActiveCell = cells[newIndex];
			newActiveCell.showCell();
		},
		
		
		
		removeCell: function(cell)
		{
			var cellOverlord = this;
			var cells = cellOverlord.cells;
			
			var cellIndex = cell.index;			
			cell.removeCell();
			
			cellOverlord.cells.splice(cellIndex, 1);
			Sleuthgrids.updateArrayIndex(cellOverlord.cells);
		},
		
		
		
		removeAllCells: function()
		{
			var cellOverlord = this;
			var cells = cellOverlord.cells;
			var numCells = cells.length;
			
			for (var i = 0; i < numCells; i++)
			{
				var loopCell = cells[i];
				loopCell.removeCell();
			}
			
			cellOverlord.cells = [];
		},
		
		
		
		getLinkedCells: function(cell, includeSelf)
		{
			var cellOverlord = this;
			var tile = cellOverlord.tile;
			var tileOverlord = tile.tileOverlord;
			
			var linkedCells = tileOverlord.getLinkedCells(cell, includeSelf);
			
			return linkedCells;
		},
		
	}
		


	

	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));



	