

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{


	var GridOverlord = Sleuthgrids.GridOverlord = function()
	{
		this.init.apply(this, arguments)
	}
	
	GridOverlord.prototype = 
	{	
		init: function()
		{
			var gridOverlord = this;
			
			gridOverlord.grids = [];
			
			gridOverlord.initDOM();
			gridOverlord.initEventListeners();
		},
		
		
		
		initDOM: function()
		{
			var gridOverlord = this;
			
			gridOverlord.gridTabsWrap = $(".util-grid-tabs");
			gridOverlord.gridsWrapDOM = $(".grids");
			gridOverlord.addGridButtonDOM = $(".util-grid-newTab");
		},
		
		
		
		initEventListeners: function()
		{
			var gridOverlord = this;
			
			gridOverlord.addGridButtonDOM.on("click", function()
			{
				gridOverlord.makeGrid(true);
			});
			
			
		},
		
		
		makeGridsFromSave: function(gridSaves)
		{
			var gridOverlord = this;
			
			for (var i = 0; i < gridSaves.length; i++)
			{
				var gridSave = gridSaves[i];
				var isActive = gridSave.isActive;
				var grid = gridOverlord.makeGrid(false);
				grid.tileOverlord.initTilesFromSave(gridSave.tileSaves);
				
				if (isActive)
				{
					gridOverlord.hideAllGrids();
					grid.showGrid(true);
				}
			}
			
			return gridOverlord.grids;
		},
		
		
		
		makeGrid: function(isActive)
		{
			var gridOverlord = this;
			var index = gridOverlord.grids.length;
						
			if (index >= 5)
			{
				$.growl.warning({'message':"Limit of 5 grids reached", 'location':"tl"});
			}
			else
			{
				var grid = new Sleuthgrids.Grid(gridOverlord, index);
				
				gridOverlord.grids.push(grid);
				gridOverlord.gridsWrapDOM.append(grid.gridDOM);
				gridOverlord.gridTabsWrap.append(grid.gridTab.gridTabDOM);

				if (isActive)
				{
					gridOverlord.hideAllGrids();
					grid.showGrid(true);
				}
			}
			
			return grid;
		},
		
		
		
		removeGrid: function(grid)
		{
			var gridOverlord = this;
			var gridIndex = grid.index;
			var showGridIndex = gridIndex - 1;

			grid.removeGrid();
			
			gridOverlord.grids.splice(gridIndex, 1);
			Sleuthgrids.updateArrayIndex(gridOverlord.grids);
			gridOverlord.updateGridTabs();
							
			var showGrid = gridOverlord.grids[showGridIndex];
			showGrid.gridTab.gridTabDOM.trigger("click");
		},
		
		
		
		resizeAllGrids: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				grid.resizeGrid();
			}
		},
		
		
		
		saveAllGrids: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			var saveObj = {};
			var gridSaves = [];

			saveObj.windowHeight = Sleuthgrids.contentWrap.height();
			saveObj.windowWidth = Sleuthgrids.contentWrap.width();
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				var gridSave = grid.saveGrid();
				gridSaves.push(gridSave);
			}
			
			saveObj.gridSaves = gridSaves;
			
			return saveObj;
		},
		
		
		
		hideAllGrids: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				grid.hideGrid();
			}
		},
		
		

		updateGridTabs: function()
		{
			var gridOverlord = this;
			var grids = gridOverlord.grids;
			var numGrids = grids.length;
			
			for (var i = 0; i < numGrids; i++)
			{
				var grid = grids[i];
				var gridTab = grid.gridTab;
				gridTab.updateName();
			}
		},
	
	
	}
		
		
		

	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));



	