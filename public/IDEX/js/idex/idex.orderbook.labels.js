

var IDEX = (function(IDEX, $, undefined)
{
	
	var $contentWrap = $("#content_wrap");
	var labelPopupClass = ".orderbook-label-popup";
	var $labelPopup = $(labelPopupClass);
	var $banner = $(".orderbook-label-popup-banner");
	
	
	IDEX.OrderbookLabel = function(obj) 
	{
		this.exchange = "";
		this.nxtrs = "";
		this.market = "";
		this.cbg = "";
		this.ctext = "";
		
		this.name = "";
		this.isVisible = false;
		this.isActive = false;

		IDEX.constructFromObject(this, obj);
	};
	
	
	$(".orderbook-label-color-input").each(function()
	{
		var $el = $(this).parent().find(".orderbook-label-color-box-wrap");
		var isLower = $(this).attr("data-ltype") == "bg";
		var name = "orderbook-label-color-box"
		if (isLower)
			name += " lower"
		
		$(this).spectrum({
			flat: true,
			showInput: false,
			showAlpha:true,
			showButtons:false,
			containerClassName:name,
			replacerClassName:'orderbook-label-color-replacer',
			preferredFormat: "rgb",
			appendTo: $el,
		})
	});
		
	
	
	$(".grid-trig-labels").on("click", function()
	{
		var flipClassName = "active"

		IDEX.flipClass($labelPopup, flipClassName)
		
		//$(".order-row").removeClass("label-temp")
		$banner.removeClass("active")
	})
	
	
	$(".orderbook-label-color-trig").on("focus", function()
	{
		var $el = $(this).parent().find(".orderbook-label-color-box")

		$el.addClass("active")
	})
	
	
	$(".orderbook-label-color-trig").on("focusout", function()
	{
		var $el = $(this).parent().find(".orderbook-label-color-box")
		
		$el.removeClass("active")
	})
	
	
	$(".orderbook-label-color-input").on('move.spectrum', function(e, tinycolor)
	{		
		var $el = $(this).parent().find(".orderbook-label-color-trig")
		var $conf = $(".orderbook-label-popup-left")
				
		var ltype = $(this).attr("data-ltype")
		var colorClass = ltype == "bg" ? "cbg" : "ctext";

		var rgba = tinycolor.toRgbString()
		
		updateStyle(colorClass, rgba)		
		$el.val(rgba);
	});
	
	
	$(".orderbook-label-popup-table").on("click", ".orderbook-label-popup-all-row .label-popup-all-name", function(e)
	{
		var elClass = ".orderbook-label-popup-all-row"
		var $parent = $(this).parent()
		
		var isActive = $parent.hasClass("active")
		$parent.parent().find(elClass).removeClass("active");
		
		var index = $parent.index() - 2
		
		if (isActive)
		{
			unloadLabel();
		}
		else
		{
			$parent.addClass("active");
			loadLabel(index);
		}
	})
	
	
	$("#add_orderbook_label").on("click", function()
	{
		addLabel();
	})
	
	$("#delete_orderbook_label").on("click", function()
	{
		removeLabel();
	})
	
	$(".orderbook-label-popup-confirm-wrap").on("click", function()
	{
		saveLabel()
	})
	
	
	function addLabel()
	{
		var lastIndex = IDEX.user.labels.length + 1;
		
		if (lastIndex < 13)
		{
			var $table = $(".orderbook-label-popup-table")
									
			var nums = []

			for (var i = 0; i < IDEX.user.labels.length; i++)
			{
				var label = IDEX.user.labels[i];
				var name = label.name;
				var both = name.split("-");
				var labelNum = Number(both[1])
				nums.push(labelNum)
			}
			
			nums.sort(IDEX.sortNumber)
			
			for (var i = 0; i < nums.length; i++)
			{
				if (i + 1 != nums[i])
					break;
			}
		
			
			var num = i + 1;

			var name = "Label-"+String(num)
			var newRow = IDEX.buildLabelRow(name)
						
			$table.append($(newRow))
			var listVisDOM = "<div class='orderbook-label-dropdown-vis'><img src='img/eye.png'></div>";
			var listTextDOM = "<div class='orderbook-label-dropdown-name'><span class=''>" + name + "</span></div>";
			var li = "<li class='label-"+name+"' data-val='"+name+"'>" + listTextDOM + listVisDOM +"</li>";
			
			$contentWrap.find(".orderbook-label-dropdown ul").append($(li))
			
			var newLabel = new IDEX.OrderbookLabel({"name":name});
			IDEX.user.labels.push(newLabel)
			
			editBanner("success", name + " added");
			localStorage.setItem('orderbookLabels', JSON.stringify(IDEX.user.labels));
		}
		else
		{
			editBanner("error", "Max amount of labels reached");
		}
	}
	
	
	function saveLabel()
	{
		var label = IDEX.getItemsByProp(IDEX.user.labels, "isActive", false)

		if (label.length)
		{
			label = label[0];
			var inputVals = getInputValues()
			
			$.extend(label, inputVals)
			
			IDEX.makeLabelStyle(label)
			initStyle(label)
			IDEX.loadAllVis()
			editBanner("success", label.name + " saved")
			localStorage.setItem('orderbookLabels', JSON.stringify(IDEX.user.labels));			
		}
	}
	
	
	function removeLabel()
	{
		var label = IDEX.getItemsByProp(IDEX.user.labels, "isActive", false)
		
		if (label.length)
		{
			label = label[0];
			
			var $style = $("#label_" + label.name);
			var labelClass = ".label-" + label.name
			$style.remove()
			$(labelClass).removeClass(labelClass)
			
			var index = IDEX.user.labels.indexOf(label)

			IDEX.user.labels.splice(index, 1)
			
			var $table = $(".orderbook-label-popup-table")
			var $row = $(".orderbook-label-popup-all-row.active")
			$row.remove();
			

			$(".orderbook-label-dropdown ul li[data-val='"+label.name+"']").remove();

						
			for (var i = 0; i < IDEX.allOrderbooks.length; i++)
			{
				var orderbook = IDEX.allOrderbooks[i];
				var orderbookLabel = IDEX.searchListOfObjects(orderbook.labels, "name", label.name)
				
				if (orderbookLabel)
				{
					orderbook.labels.splice(orderbookLabel.index, 1);
				}
			}
			
			
			unloadLabel();
			
			IDEX.loadAllVis()
			
			localStorage.setItem('orderbookLabels', JSON.stringify(IDEX.user.labels));
			
			editBanner("success", label.name + " deleted")
		}
		else
		{
			editBanner("error", "Load a label first")
		}
	}
	
	
	function loadLabel(index)
	{		
		var $ex = $("#label_example")
		var label = IDEX.user.labels[index]

		toggleOverlay(false)
		removeActiveLabel()
		label.isActive = true;	
		$ex.text(label.name)
		setInputValues(label)
		loadColorBox(label)
		loadStyle(label)
		
		//editBanner("success", label.name + " loaded");
	}
	
	
	function unloadLabel()
	{
		var $wrap = $(".orderbook-label-popup-left")
		var $ex = $("#label_example")
		
		toggleOverlay(true)
		removeActiveLabel();
		$ex.text("")
		clearInputValues();
		
		$(".label-temp").removeClass("label-temp")
	}	
	
		
	
	$contentWrap.on("click", ".orderbook-label-dropdown li .orderbook-label-dropdown-vis img", function()
	{
		IDEX.flipClass($(this).parent(), "active");

		var $orderbook = $(this).closest(".orderbook-wrap");
		var orderbook = IDEX.getObjectByElement($orderbook, IDEX.allOrderbooks, "orderbookDom");
		
		var name = $(this).closest("li").attr("data-val");
				
		if (orderbook)
		{
			var orderbookLabel = IDEX.searchListOfObjects(orderbook.labels, "name", name)

			if (orderbookLabel)
			{
				orderbook.buyBookDom.find(".label-" + name).removeClass("label-" + name)
				orderbook.sellBookDom.find(".label-" + name).removeClass("label-" + name)

				orderbook.labels.splice(orderbookLabel.index, 1);
			}
			
			else
			{
				var label = IDEX.searchListOfObjects(IDEX.user.labels, "name", name)
							
				if (label)
				{
					label = label.obj;
					orderbook.labels.push(label)
				}
			}
			
			IDEX.loadVis(orderbook)
		}

	
		//$(".label-" + label.name).removeClass("label-" + label.name)
	})
	
	
	IDEX.loadVis = function(orderbook)
	{
		//var vis = IDEX.getItemsByProp(IDEX.user.labels, "isVisible", false)
		//var visMap = IDEX.getVisibleMap(vis)
		
		var vis = orderbook.labels
		
		var $buyBook = orderbook.buyBookDom
		var $sellBook = orderbook.sellBookDom

		colorBook($sellBook, vis);
		colorBook($buyBook, vis);
	}
	
	IDEX.loadAllVis = function()
	{	
		for (var i = 0; i < IDEX.allOrderbooks.length; i++)
		{
			var orderbook = IDEX.allOrderbooks[i];
			var vis = orderbook.labels
			
			var $buyBook = orderbook.buyBookDom
			var $sellBook = orderbook.sellBookDom

			colorBook($sellBook, vis);
			colorBook($buyBook, vis);
		}
	}
	
	
	function colorBook($book, visMap)
	{
		var $rows = $book.find(".order-row")

		$rows.each(function()
		{
			var order = IDEX.getRowData($(this), $(this).index());
			
			/*for (var exchange in visMap)
			{
				var label = visMap[exchange]
				
				if (order.exchange == exchange)
				{
					$(this).addClass("label-" + label.name)
					break;
				}
			}*/
			for (var i = 0; i < visMap.length; i++)
			{				
				var label = visMap[i]

				for (var j = 0; j < order.trades.length; j++)
				{
					var trade = order.trades[j];
					if (trade.exchange == label.exchange)
					{
						$(this).addClass("label-" + label.name)
					}
					/*else if ("NXT" in order && label.nxtrs == IDEX.toRS(order.NXT))
					{
						$(this).addClass("label-" + label.name)
					}*/
				}
			}
		})
	}

	
	IDEX.getVisibleMap = function(vis)
	{
		var exchanges = {}
		
		for (var i = 0; i < vis.length; i++)
		{
			var label = vis[i];
			exchanges[label.exchange] = label;
		}
		
		return exchanges
	}
	
	
	function removeActiveLabel()
	{
		for (var i = 0; i < IDEX.user.labels.length; i++)
		{
			IDEX.user.labels[i].isActive = false;
		}
	}
	
	
	function clearInputValues()
	{
		var $wrap = $(".orderbook-label-popup-left")

		$wrap.find("input").each(function()
		{
			$(this).val("")
		})	
	}
	
	function getInputValues()
	{
		var $wrap = $(".orderbook-label-popup-left")
		var obj = {}
		
		$wrap.find("input").each(function()
		{
			var name = $(this).attr("name");
			var val = $(this).val();
			
			obj[name] = val;
		})	
		
		return obj
	}
	
	
	function setInputValues(label)
	{
		var $wrap = $(".orderbook-label-popup-left")
		
		$wrap.find("input").each(function()
		{
			var name = $(this).attr("name");			
			$(this).val(label[name])
		})	
		
	}
	
	
	IDEX.buildLabelRow = function(name)
	{
		var rowWrap = "<div class='orderbook-label-popup-all-row'></div>"
		var tdWrapName = "<div class='orderbook-label-popup-all-row-cell label-popup-all-name'></div>";
		var tdWrapVis = "<div class='orderbook-label-popup-all-row-cell label-popup-all-vis'></div>";
		var tdName = "<span>" + name + "</span>"
		var tdVis = "<img class='vert-align' src='img/eye.png'>"
		

		var tdNameStr = $(tdWrapName).html(tdName)[0].outerHTML
		var tdVisStr = $(tdWrapVis).html(tdVis)[0].outerHTML
			
		var combined = tdNameStr + tdVisStr
			
		var row = $(combined).wrapAll(rowWrap).parent()[0].outerHTML
		
		return row
	}
	
	
	function loadColorBox(obj)
	{
		//var obj = getInputValues()
		
		$("#orderbook_label_bgcolor").spectrum("set", obj.bgcolor);
		$("orderbook_label_textcolor").spectrum("set", obj.textcolor);
	}
	
	
	function editBanner(statusClass, statusText)
	{
		$banner.removeClass("error")
		$banner.removeClass("success")
		$banner.addClass("active");


		$banner.addClass(statusClass)
		$banner.find("span").text(statusText)
	}
	
	
	function toggleOverlay(hide)
	{
		var $overlay = $(".label-left-overlay");

		if (hide)
			$overlay.addClass("active")
		else
			$overlay.removeClass("active")
	}
	
	
	IDEX.makeLabelStyle = function(label)
	{
		var labelID = "label_" + label.name;
		
		var $labelStyle = 
		$('<style></style>').attr(
		{
			'type': 'text/css',
			'id': labelID,
		});
		
		$labelStyle.html(".label-" + label.name + " { color:" + label.ctext + "; background-color:" + label.cbg + "; }")

		$("head").append($labelStyle)
	}
	
	
	function updateStyle(colorClass, color)
	{
		var $style = $("#temp_label_style");
		
		$style.attr("data-" + colorClass, color)
		
		var cbg = $style.attr("data-cbg")
		var ctext = $style.attr("data-ctext")
		
		var str = "." + "label-temp";
		str += " { " + "background-color" + ":" + cbg + "; " + "color" + ":" + ctext + "; }";
		$style.html(str)
	}
	
	
	function loadStyle(label)
	{	
		var $style = $("#temp_label_style");
		var $temp = $("#label_example");
		
		$style.attr("data-cbg", label.cbg)
		$style.attr("data-ctext", label.ctext)
		
		var str = "." + "label-temp";
		str += " { " + "background-color" + ":" + label.cbg + "; " + "color" + ":" + label.ctext + "; }";
		$style.html(str)
		
		$temp.addClass("label-temp");
	}
	
	
	function initStyle(label)
	{
		var $style = $("#label_" + label.name);

		$style.attr("data-cbg", label.cbg)
		$style.attr("data-ctext", label.ctext)
		
		var str = ".label-" + label.name 
		str += " { " + "background-color" + ":" + label.cbg + "; " + "color" + ":" + label.ctext + "; }"
		$style.html(str)
	}

	
	
	
	/*$('#label_example').on("click", function()
	{
		var name = $(this).text();
		$(this).html('');
		
		$('<input></input>')
		.attr({
			'type': 'text',
			'name': 'fname',
			'id': 'txt_fullname',
			'size': '30',
			'value': name,
			'class': 'label-example-input'
		})
		.appendTo('#label_example');
		
		$('#txt_fullname').focus();
	});

	
	$(document).on('blur', '#txt_fullname', function()
	{
		var name = $(this).val();
		$('#label_example').text(name);
	});*/
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));