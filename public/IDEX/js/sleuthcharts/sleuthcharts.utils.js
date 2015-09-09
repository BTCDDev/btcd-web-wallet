

Sleuthcharts = (function(Sleuthcharts) 
{
	
	
	Sleuthcharts.Padding = function()
	{
		this.top = 0;
		this.bottom = 0;
		this.left = 0;
		this.right = 0;
	}
	
	Sleuthcharts.Positions = function()
	{

		this.top = 0;
		this.bottom = 0;
		this.left = 0;
		this.right = 0;
	}
	
	
	Sleuthcharts.extend = function(objA, objB)
	{
		if (!objA)
		{
			objA = {}
		}

		for (var key in objB)
		{
			objA[key] = objB[key];
		}

		
		return objA
	}
	
	Sleuthcharts.extendClass = function(parent, members)
	{
		var object = function () { return undefined; };
		object.prototype = new parent();
		Sleuthcharts.extend(object.prototype, members);
		
		return object;
	}
	
	
	Sleuthcharts.formatTime = function(d, temp)
	{
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
		  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];

		var month = monthNames[d.getMonth()];
		var day = d.getDate();
		var hours = String(d.getHours());
		var minutes = d.getMinutes();
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes);
		
		if (!temp)
			return month + ". " + day;
		else
			return month + ". " + day + " " + hours + ":" + minutes;

	}
	
	
	Sleuthcharts.formatExponent = function(num)
	{
		var maxDec = 8;
		var sind = String(num).search("e")
		
		if (sind != -1)
		{
			var partwhole = String(num).slice(0, sind)
			var partall = partwhole.split(".")
			if (partall.length == 1)
				partall.push("0")
			var exnum = String(num).slice(sind+1)
			var isneg = Number(exnum) < 0
			var pow = exnum.slice(1)
			//partall[0].length + partall[1].length
			num = "0." + (Array(Number(pow) - (0)).join("0")) + partall[0] + partall[1]

		}
		
		var all = String(num).split(".")
		var numDec = 0;
		var startDec = 0;

		if (all.length == 2)
		{
			if (Number(all[0]) > 0)
			{
			}
			else
			{
				for (sing in all[1])
				{
					if (Number(all[1][sing]) > 0)
					{
						break
					}
					startDec++;
				}
			}
		}
		else
		{
			all.push("0")
		}


		var paddedDec = 3;
		var endDec = startDec + paddedDec
		//var avail = maxDec - numDec;
		if (endDec > maxDec)
			endDec = maxDec
		
		var strDec = Number("0."+all[1]).toFixed(endDec)
		var strAll = all[0] + "." + strDec.split(".")[1];
		
		return Number(strAll);
	}
	
	
	Sleuthcharts.formatNumWidth = function(num)
	{
		var maxDec = 8;
		var all = String(num).split(".")
		var numDec = 0;
		var startDec = 0;

		if (all.length == 2)
		{
			if (Number(all[0]) > 0)
			{
				
			}
			else
			{
				for (sing in all[1])
				{
					if (Number(all[1][sing]) > 0)
					{
						break
					}
					startDec++;
				}
			}
		}
		else
		{
			all.push("0")
		}


		var paddedDec = 3;
		var endDec = startDec + paddedDec

		if (endDec > maxDec)
			endDec = maxDec
		
		var strDec = Number("0."+all[1]).toFixed(endDec)
		var strAll = all[0] + "." + strDec.split(".")[1];
		
		return Number(strAll)
	}
	
	
	
	Sleuthcharts.getDOMPosition = function($el)
	{
		var positions = {};
		
		var offset = $el.offset()
		var bbox = $el[0].getBoundingClientRect();
		
		var width = bbox.width
		var height = bbox.height
		positions.height = height;
		positions.width = width;
		positions.top = offset.top;
		positions.bottom = positions.top + height;
		positions.left = offset.left;
		positions.right = positions.left + width;
		
		return positions;
	}
	
	
	Sleuthcharts.padString = function(string)
	{
		var numSpaces = 20;
		
		var needed = 20 - string.length
		if (needed < 0)
			needed = 0;
		
		for (i = 0; i < needed; i++)
			string += " "
		
		return string;
	}
	
	
	Sleuthcharts.getTextPixelWidth = function(text, fontSize)
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		ctx.font = fontSize + " Roboto"; 
		
		return ctx.measureText(text).width;
	}
	
	
	Sleuthcharts.getMaxTextWidth = function(vals, fontSize, ctx)
	{
		var max = 0
		
		for (var i = 0; i < vals.length; i++)
		{
			var text = String(Number(vals[i].toPrecision(3)));
			var wid = ctx.measureText(text).width;
			
			if (wid > max)
				max = wid
		}
		
		return max
	}

	

	Sleuthcharts.constructFromObject = function(classInstance, obj)
	{

		if (obj)
		{
			for (var key in obj)
			{
				classInstance[key] = obj[key];
			}
		}
		
		return classInstance
	}
	
	
	
	Sleuthcharts.updateArrayIndex = function(arr)
	{
		for (var i = 0; i < arr.length; i++)
		{			
			arr[i].index = i;
		}
	}
	

	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));
		
		
		