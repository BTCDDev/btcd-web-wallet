

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.snPostParams = 
	{
		'orderbook':["baseid","relid","allfields"],
		'allorderbooks':[],
		'placebid':["baseid","relid","price","volume"],
		'placeask':["baseid","relid","price","volume"],
		'openorders':[],
		'tradehistory':["timestamp"],
		'cancelorder':["quoteid"],
	};
	
	IDEX.SATOSHI = 100000000;
	var GENESIS_TIMESTAMP = 1385294400;

	
	
	
	IDEX.extend = function(objA, objB)
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
	
	IDEX.extendClass = function(parent, members)
	{
		var object = function () { return undefined; };
		object.prototype = new parent();
		IDEX.extend(object.prototype, members);
		
		return object;
	}
	
	
	IDEX.formatTime = function(timestamp, temp)
	{
		var d = new Date(timestamp*1000);
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
		  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];

		var month = monthNames[d.getMonth()];
		var day = d.getDate();
		var hours = String(d.getHours());
		var minutes = d.getMinutes();
		var seconds = d.getSeconds()
		
		hours = hours < 10 ? "0"+String(hours) : String(hours);
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes);
		seconds = seconds < 10 ? "0"+String(seconds) : String(seconds);

		
		if (temp == "MD")
			return month + ". " + day;
		else if (temp == "MDHM")
			return month + ". " + day + " " + hours + ":" + minutes;
		else if (temp == "HMS")
			return hours + ":" + minutes + ":" + seconds;

	}
	
	
	IDEX.minObject = function(obj, keys)
	{
		var minObj = {};
		
		for (var i = 0; i < keys.length; i++)
		{
			var key = keys[i];
			minObj[key] = obj[key];
			
		}
		
		return minObj;
	}

	
	
	IDEX.flipCheckMarket = function(market, exchange)
	{
		var isFlipped = market.exchangeSettings[exchange].skynetFlipped;
		var pairID = "";
		
		if (isFlipped)
		{
			var both = market.pairID.split("_");
			pairID = both[1] + "_" + both[0];
		}
		else
		{
			pairID = market.pairID;
		}
		
		return pairID;
	}
	
	
	IDEX.parseActiveExchanges = function(exchanges)
	{
		var marketActiveExchanges = [];
		var allActiveExchanges = IDEX.activeExchanges;

		for (var i = 0; i < exchanges.length; i++)
		{
			var exchange = exchanges[i];
			if (exchange == "nxtae" || allActiveExchanges.indexOf(exchange) != -1)
			{
				marketActiveExchanges.push(exchange);
			}
		}
		
		return marketActiveExchanges;
	}
	
	IDEX.sortNumber = function(a, b)
	{
		return a - b;
	}
	
	IDEX.compareProp = function(prop)
	{
		return function(a, b)
		{
			return a[prop] - b[prop];
		}
	}


	IDEX.toRS = function(id)
	{
		var s = new NxtAddress()
		s.set(id)
		return s.toString();
	}
	

	IDEX.toSatoshi = function(number)
	{
		return Math.round(Number(number) * IDEX.SATOSHI) / IDEX.SATOSHI;
	}


	IDEX.addElClass = function(row, rowClass)
	{
		var s = "";
		
		$(row).each(function(e, p)
		{
			$(p).addClass(rowClass);
			s += $(p)[0].outerHTML;
		})
		
		return s;
	}
	

	IDEX.addElAttr = function(row, data, rowAttr)
	{
		var s = "";
		
		$(row).each(function(e, p)
		{
			$(p).attr(rowAttr, data);
			s += $(p)[0].outerHTML;
		})
		
		return s;
	}


	IDEX.addElDataAttr = function(row, data, keys)
	{
		var s = "";
		var i = 0;
		
		$(row).each(function(e, p)
		{
			for (var j = 0; j < keys.length; ++j)
			{
				$(p).attr("data-"+keys[j], data[i][keys[j]]);
			}
			
			s += $(p)[0].outerHTML;
			++i;
		})
		
		return s;
	}
	
	
	IDEX.flipClass = function($el, cssClass)
	{
		var has = $el.hasClass(cssClass);
		
		if (has)
			$el.removeClass(cssClass);
		else
			$el.addClass(cssClass);
	}
	

	IDEX.toggleShow = function($el, show)
	{
		var func = show ? "addClass" : "removeClass";
		$el[func]("active");
	}
	
	
	IDEX.searchListOfObjects = function(arr, key, val)
	{
		var len = arr.length;
		var retObj = false;
		
		for (var i = 0; i < len; i++)
		{
			var loopEl = arr[i];
			
			if (key in loopEl && loopEl[key] == val)
			{
				retObj = {};
				retObj.index = i;
				retObj.obj = loopEl;
				break;
			}
		}
		
		return retObj;
	}
	
	
	IDEX.searchListOfObjectsAll = function(arr, obj, keys)
	{
		var retObj = {};
		var ret = false;
		var objKeys = Object.keys(obj).length;
		
		for (var i = 0; i < arr.length; i++)
		{
			var item = arr[i];
			var checkedKeys = 0;
			
			var itemKeys = Object.keys(item).length;
			
			if (objKeys == itemKeys)
			{
				for (key in item)
				{
					if (key in obj)
					{
						if (obj[key] == item[key] || key == ignoreKey) 
						{
							checkedKeys++;
						}
					}
					else
					{
						break;
					}
				}
				
				if (checkedKeys == objKeys)
				{
					ret = true;
					break;
				}
			}
		}
		
		retObj.ret = ret;
		retObj.index = i;
		
		return retObj;
	}

	IDEX.getObjectByElement = function($el, arr, key)
	{
		var ret = false;
		
		for (var i = 0; i < arr.length; i++)
		{
			var loopObj = arr[i];
			var $loopEl = loopObj[key]
						
			if ($el.is($loopEl))
			{
				ret = loopObj;
				break;
			}
		}
		
		return ret;
	}
	
	
	IDEX.getListObjVals = function(listObj, keys)
	{
		var obj = {};
		var len = listObj.length;

		for (var j = 0; j < keys.length; j++)
		{
			var key = keys[j];
			var vals = [];
			
			for (var i = 0; i < len; i++)
				vals.push(listObj[i][key]);
			
			obj[key] = vals;
		}
		
		return obj;
	}

	
	IDEX.setListObjVals = function(listObj, key, vals)
	{
		var len = listObj.length;
		
		for (var i = 0; i < len; i++)
			listObj[i][key] = vals[i];
		
		return listObj;	
	}


	IDEX.objToList = function(data, keys)
	{
		var arr = [];

		for (var i = 0; i < data.length; ++i)
		{
			var loopArr = [];

			for (var j = 0; j < keys.length; ++j)
			{
				if (!(keys[j] in data[i]))
					loopArr.push("")
				else
					loopArr.push(data[i][keys[j]]);
			}
			arr.push(loopArr);
		}

		return arr;
	}


	IDEX.compObjs = function(aObj, bObj, keys)
	{
		var compCount = 0;

		for(var i = 0; i < keys.length; i++)
		{
			if (aObj[keys[i]] == bObj[keys[i]])
			{
				compCount++;
			}
		}

		return ((compCount == keys.length) ? true : false);
	}
	
	

	IDEX.getFormData = function($form) 
	{
		var serialized = $form.serializeArray();
		var data = {};

		for (var s in serialized) 
			data[serialized[s]['name']] = serialized[s]['value'];

		return data;
	}


	IDEX.extractPostPayload = function($element)
	{
		var params = {};

		if ($element.is("button"))
		{
			var $form = $("#" + $element.attr("data-form"));
			params = IDEX.getFormData($form);
		}
		else
		{
			params = $element.data();
		}

		return params;
	}


	IDEX.buildPostPayload = function(method, data)
	{
		var params = {'method':method};

		for (var i = 0; i < IDEX.snPostParams[method].length; ++i)
		{
			for (var key in data)
			{
				if (key == IDEX.snPostParams[method][i])
				{
					params[key] = data[key];
					break;
				}
			}
		}

		return params;
	}
	
	
	IDEX.getItemsByProp = function(arr, prop, getAll)
	{
		var items = [];

		for (var i = 0; i < arr.length; i++)
		{
			var item = arr[i]
			
			if (item[prop])
			{
				items.push(item);
				
				if (!getAll)
					break;
			}
		}
		
		return items;	
	}


	IDEX.constructFromObject = function(classInstance, obj)
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
	
	
	IDEX.makeMarketString = function(baseName, relName)
	{
		return baseName+"/"+relName;
	}

	
	IDEX.cloneListOfObjects = function(listObj)
	{
		var len = listObj.length;
		var clone = [];
		
		for (var i = 0; i < len; i++)
		{
			clone.push($.extend(true, {}, listObj[i]));
		}
		
		return clone;
	}

	
	/*
	function getBiggestWidth(newBids, newAsks)
	{
		var joined = newBids.concat(newAsks);
		var len = joined.length;
		var biggestWidth = -1;
		
		for (var i = 0; i < len; i++)
		{
			var num = joined[i];
			var numStr = String(num);
			var wholeDigits = numStr.split(".")[0]
			if (wholeDigits.length > biggestWidth)
				biggestWidth = wholeDigits.length
		}
		
		return biggestWidth
	}*/

	IDEX.formatNumberWidth = function(allNumbers, decimals)
	{
		var maxWidth = 8 + 2;
		var biggestWidth = -1;
		var len = allNumbers.length;
		
		for (var i = 0; i < len; i++)
		{
			var num = allNumbers[i];
			var numStr = String(num);
			var wholeDigits = numStr.split(".")[0]
			if (wholeDigits.length > biggestWidth)
				biggestWidth = wholeDigits.length
		}
		
		for (var i = 0; i < len; i++)
		{
			var num = allNumbers[i];
			var numStr = String(num);
			var digits = numStr.split(".");
			var wholeDigits = digits[0];
			var decDigits = digits[1];
			//var hasDecimal = numStr.search("\\.");
			if (numStr.length > maxWidth)
			{
				var extra = numStr.length - maxWidth;
				decDigits = decDigits.slice(0, (decDigits.length - extra));
			}
			if (wholeDigits.length < biggestWidth)
			{
				var extra = biggestWidth - wholeDigits.length;
				decDigits = decDigits.slice(0, ((decDigits.length) - extra));
			}
			allNumbers[i] = wholeDigits + "." + decDigits;
		}
		
		//console.log(allNumbers)
		return allNumbers
	}
	
	

	IDEX.capitalizeFirstLetter = function(string) 
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	
	
	IDEX.convertNXTTime = function(timestamp)
	{
		return timestamp + GENESIS_TIMESTAMP
	}
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));