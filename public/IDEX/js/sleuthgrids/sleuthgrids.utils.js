

// Created by CryptoSleuth <cryptosleuth@gmail.com>


Sleuthgrids = (function(Sleuthgrids) 
{

	Sleuthgrids.updateArrayIndex = function(arr)
	{
		for (var i = 0; i < arr.length; i++)
		{			
			arr[i].index = i;
		}
	}
	
	
	Sleuthgrids.positionsToCSS = function(positions)
	{
		var keys = ["height", "width", "top", "left"];
		var cssObj = {};
		
		for (var i = 0; i < keys.length; i++)
		{
			var key = keys[i];
			
			if (key in positions)
			{
				cssObj[key] = positions[key];
			}
		}
		
		return cssObj;
	}
	
	
	Sleuthgrids.getDirections = function(direction, isInverted)
	{
		var directions = {};
		
		directions.direction = direction;
		directions.isTop = direction == "top";
		directions.isBottom = direction == "bottom";
		directions.isLeft = direction == "left";
		directions.isRight = direction == "right";
		directions.isMiddle = direction == "middle";
		
		directions.isLeftOrTop =  (direction == "left" || direction == "top");
		
		directions.isHoriz = (direction == "left" || direction == "right");
		directions.isVert = (direction == "top" || direction == "bottom");
		
		directions.absKey = directions.isVert ? "left" : "top";
		directions.sizeKey = directions.isVert ? "width" : "height";
		
		return directions;
	}
	
	
	Sleuthgrids.getSearchDirections = function()
	{
		var searchMap = {};
		
		searchMap.left = [["left", "top"], ["left", "bottom"]];
		searchMap.right = [["right", "top"], ["right", "bottom"]];
		searchMap.top = [["left", "top"], ["right", "top"]];
		searchMap.bottom = [["left", "bottom"], ["right", "bottom"]];

		
		return searchMap;
	}
	
	
	Sleuthgrids.getSideCoords = function(positions)
	{
		var searchMap = Sleuthgrids.getSearchDirections();
		
		var sides = {};
		
		for (var searchDirection in searchMap)
		{
			var sideDirections = searchMap[searchDirection];
			var directions = Sleuthgrids.getDirections(searchDirection);
			
			var sidePointADirections = sideDirections[0];
			var sidePointBDirections = sideDirections[1];

			var sidePointACoord = [positions[sidePointADirections[0]], positions[sidePointADirections[1]]];
			var sidePointBCoord = [positions[sidePointBDirections[0]], positions[sidePointBDirections[1]]];

			var loopSide = {}
			loopSide.coord = [sidePointACoord, sidePointBCoord];
			loopSide.pos = directions.isHoriz ? sidePointACoord[0] : sidePointACoord[1];
			
			sides[searchDirection] = loopSide;
		}
		
		return sides;
	}
	
	
	
	
	
	Sleuthgrids.checkIfSamePosition = function(posA, posB)
	{
		var check = Math.abs(posA - posB) <= 1;
		
		return check;
	}
	
	
	Sleuthgrids.getAllArrayCombinations = function(arr)
	{
		if (arr.length == 1)
		{
			return arr[0];
		}
		else
		{
			var result = [];
			var allCasesOfRest = allPossibleCases(arr.slice(1));
			
			for (var i = 0; i < allCasesOfRest.length; i++)
			{
				for (var j = 0; j < arr[0].length; j++)
				{
					result.push(arr[0][j] + allCasesOfRest[i]);
				}
			}
			
			return result;
		}
	}
	
	

	
	Sleuthgrids.invertDirection = function(direction)
	{
		var dirMap = 
		{
			left: "right",
			right: "left",
			top: "bottom",
			bottom: "top"
		};
		
		
		var invertedDirection = dirMap[direction];
		
		return invertedDirection;
	}
	
	
	

	
	
	Sleuthgrids.checkIfMouseIsInsideBorder = function(mouseY, mouseX, pos)
	{
		var isInsideBorder = {};
		var borderWidth = 4;
		var direction = ""

		isInsideBorder.top = mouseY > pos.top && mouseY < (pos.top + borderWidth);
		isInsideBorder.bottom = mouseY < pos.bottom && mouseY > (pos.bottom - borderWidth);

		isInsideBorder.left = mouseX > pos.left && mouseX < (pos.left + borderWidth);
		isInsideBorder.right = mouseX < pos.right && mouseX > (pos.right - borderWidth);
		
		isInsideBorder.isInside = (isInsideBorder.top || isInsideBorder.bottom || isInsideBorder.left || isInsideBorder.right)
		
		for (key in isInsideBorder)
		{
			if (key == "isInside")
				continue;
			if (isInsideBorder[key])
				direction = key;
		}
		
		isInsideBorder.direction = direction;
		
		return isInsideBorder;
	}
	
	
	
	Sleuthgrids.getPositions = function($el, isAbs)
	{
		var positions = {};

		var offset = $el.offset()
		if (isAbs)
			offset = $el.position();
		
		var width = $el[0].getBoundingClientRect().width
		var height = $el[0].getBoundingClientRect().height
		
		positions.height = height;
		positions.width = width;
		positions.top = offset.top;
		positions.bottom = positions.top + height;
		positions.left = offset.left;
		positions.right = positions.left + width;
		
		return positions
	}
	
	
	
	Sleuthgrids.capitalizeFirstLetter = function(string) 
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	
	
	Sleuthgrids.cloneListOfObjects = function(listObj)
	{
		var len = listObj.length;
		var clone = [];
		
		for (var i = 0; i < len; i++)
		{
			clone.push($.extend(true, {}, listObj[i]));
		}
		
		return clone;
	}
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));



	