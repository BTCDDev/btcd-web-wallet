


Sleuthgrids = (function(Sleuthgrids) 
{

	Sleuthgrids.updateArrayIndex = function(arr)
	{
		for (var i = 0; i < arr.length; i++)
		{			
			arr[i].index = i;
		}
	}
	
	
	
	Sleuthgrids.makeSearchMap = function(positions)
	{
		var searchMap = {};
		searchMap.left = [["left", "bottom"], ["left", "top"]];
		searchMap.top = [["left", "top"], ["right", "top"]];
		searchMap.right = [["right", "top"], ["right", "bottom"]];
		searchMap.bottom = [["right", "bottom"], ["left", "bottom"]];
		
		var map = {};
		
		for (searchDirection in searchMap)
		{
			searchDirectionLine = searchMap[searchDirection];
			map[searchDirection] = [];
			
			for (var i = 0; i < searchDirectionLine.length; i++)
			{
				var coords = [];
				var searchDirectionPoint = searchDirectionLine[i];
				
				for (var j = 0; j < searchDirectionPoint.length; j++)
				{
					var searchDirectionCoord = searchDirectionPoint[j];
					coords.push(positions[searchDirectionCoord]);
				}
				
				map[searchDirection].push(coords);
			}
		}
		
		return map;
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
	
	
	
	Sleuthgrids.getArrowDirections = function($arrow)
	{
		var arrowDirections = {};
		var direction = $arrow.attr("data-arrow");
		
		arrowDirections.direction = direction;
		arrowDirections.isTop = direction == "top";
		arrowDirections.isBottom = direction == "bottom";
		arrowDirections.isLeft = direction == "left";
		arrowDirections.isRight = direction == "right";
		arrowDirections.isMiddle = direction == "middle"
		
		arrowDirections.isHoriz = (direction == "left" || direction == "right");
		arrowDirections.isVert = (direction == "top" || direction == "bottom");
		
		arrowDirections.isTab = false;
		
		return arrowDirections;
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



	