
Sleuthcharts = (function(Sleuthcharts) 
{
	
	var Point = Sleuthcharts.Point = function()
	{
		this.init.apply(this, arguments)
	}
	
	Point.prototype = 
	{
		
	}
	

	Sleuthcharts.getMinMax = function(phases, type)
	{
		var min = 0;
		var max = 0;
		
		for (var i = 0; i < phases.length; ++i)
		{
			var phase = phases[i];
			
			if (i == 0)
			{
				if (type)
				{
					min = phases[i].low;
					max = phases[i].high;
				}
				else
				{
					//min = phases[i].vol;
					max = phase.vol;
				}
			}
			else
			{
				if (type)
				{
					min = phase.low < min ? phase.low : min;
					max = phase.high > max ? phase.high : max;
				}
				else
				{
					//min = phases[i].vol < min ? phases[i].vol : min;
					max = phases[i].vol > max ? phases[i].vol : max;
				}
			}
		}
		
		return [min, max];
	}



	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));

