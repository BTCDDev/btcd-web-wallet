

var IDEX = (function(IDEX, $, undefined) 
{
	
	var autoSearchName = [];
	var autoSearchMarket = [];
	var autoSearchSkynet = [];
	var autoSearchExchanges = [];
	IDEX.autoSearchSkynet = autoSearchSkynet;
	
	
	
	IDEX.initAutocomplete = function()
	{
		initAssetAutocomplete();
	}
	
	function initAssetAutocomplete()
	{
		var allExchanges = IDEX.exchangeList.slice();
		allExchanges.push("InstantDEX");
		
		var allMarkets = IDEX.allMarkets;
		var allCoins = IDEX.allCoins;
		var len = allCoins.length;

		for (var i = 0; i < len; i++)
		{
			var coin = allCoins[i];
			
			if (coin.isAsset)
				var labelStr = coin.name + " - (Asset ID: " + coin.assetID + ")";
			else
				var labelStr = coin.name;
			
			autoSearchName.push({"label":labelStr, "value":coin.name, "vals":coin});
		}
		
		for (marketName in IDEX.allMarkets)
		{
			var market = IDEX.allMarkets[marketName];
			
			var labelStr = market.marketName;
			
			if (market.isNxtAE)
			{
				var labelStr = market.marketName + " - (Asset ID: " + market.base.assetID + ")";
			}
			
			autoSearchMarket.push({"label":labelStr, "value":market.marketName, "vals":market});
		}
		
		for (var i = 0; i < allExchanges.length; i++)
		{
			var exchange = allExchanges[i];
			
			var labelStr = exchange;
			
			autoSearchExchanges.push({"label":labelStr, "value":exchange, "vals":exchange});
		}
		
		for (key in allMarkets)
		{
			var market = allMarkets[key];
			
			for (var i = 0; i < market.exchanges.length; i++)
			{
				var obj = {};
				obj.exchange = market.exchanges[i];
				obj.pair = market.marketName;
				obj.pairID = market.pairID;
				row = buildSkynetSearchRow(obj)
				
				var vals = {"market":market, "exchangeMarket":obj};
				
				autoSearchSkynet.push({"label":row, "value":obj.pair, "vals":vals});
			}
					
		}
	}
	
	
	
	function buildSkynetSearchRow(obj)
	{
		var exchangeSpan = "<span>" + obj.exchange + "</span>"
		var pairSpan = "<span>" + obj.pair + " </span>"
		var idPairSpan = "<span>" + obj.pairID + " </span>"
		
		var row = "<div class='sky-auto-wrap'>";
		row += "<div class='sky-auto-cell sky-auto-pair'>" + pairSpan + "</div>";
		row += "<div class='sky-auto-cell sky-auto-idPair'>" + idPairSpan + "</div>";
		row += "<div class='sky-auto-cell sky-auto-exchange'>" + exchangeSpan + "</div>";
		row += "</div>";
		
		return row
		
	}
	

	$('.asset-search').autocomplete(
	{
		delay: 0,
		html: true,
		create: function(e, ui) { },
		open: function(e, ui) { $(this).autocomplete('widget').css({'width':"270px"})},
		source: function(request,response) { assetMatcher(request, response, autoSearchName) },
		change: function(e, ui) { assetSelection($(this), e, ui) },
		select: function(e, ui) { assetSelection($(this), e, ui) }
	});
	
	
	function assetMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		
		var a = $.grep(auto, function( item )
		{
			var coin = item.vals;
			var name = coin.name;
			
			var testName = matcher.test(name);
			
			var ret = testName;
			
			if (coin.isAsset)
			{
				var testAsset = matcher.test(coin.assetID);
				
				ret = testAsset || testName;
				
			}

			return ret;
		});
		
		var assetList = [];
		var coinList = [];
		
		for (var i = 0; i < a.length; i++)
		{
			var coin = a[i];
			if (coin.vals.isAsset)
				assetList.push(coin)
			else
				coinList.push(coin)
		}
		
		//coinList.sort(IDEX.compareProp('label'))
		a = coinList.concat(assetList);

		response(a);
	}
	
	function assetSelection($thisScope, e, ui)
	{
		if (!ui.item)
		{
			$thisScope.attr('data-asset', "-1");
		}
		else
		{
			var coin = ui.item.vals;
			
			if (coin.isAsset)
			{
				var assetID = coin.name;
			}
			else
			{
				var assetID = coin.name.toUpperCase();;
			}
			
			$thisScope.data('asset', coin);
		}
	}
	
	
	

	$('.market-search').autocomplete(
	{
		delay: 0,
		html: true,
		create: function(e, ui) { },
		open: function(e, ui) { $(this).autocomplete('widget').css({'width':"350px"})},
		source: function(request,response) { marketMatcher(request, response, autoSearchMarket) },
		change: function(e, ui) { marketSelection($(this), e, ui) },
		select: function(e, ui) { marketSelection($(this), e, ui) }
	});
	
	
	function marketMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		
		var a = $.grep(auto, function( item )
		{
			var market = item.vals;
			var name = market.marketName;
			
			var ret = matcher.test(name);
			
			if (market.isNxtAE)
			{
				var idPair = market.base.assetID + "_" + market.rel.name;
				ret = matcher.test(name) || matcher.test(idPair);
			}

			return ret;
		});
		
		var assetList = [];
		var coinList = [];
		
		for (var i = 0; i < a.length; i++)
		{
			var market = a[i];
			if (market.vals.isNxtAE)
				assetList.push(market)
			else
				coinList.push(market)
		}
		
		a = coinList.concat(assetList);


		response(a);
	}
	
	
	
	function marketSelection($thisScope, e, ui)
	{
		if (!ui.item)
		{
			$thisScope.attr('data-asset', "-1");
		}
		else
		{
			var market = ui.item.vals;
			
			
			$thisScope.data('market', market);
		}
	}
	
	
	

	$('.exchange-search').autocomplete(
	{
		delay: 0,
		minLength: 0,
		html: true,
		create: function(e, ui) { },
		open: function(e, ui) { $(this).autocomplete('widget').css({'width':"170px"})},
		source: function(request,response) { exchangeMatcher(request, response, autoSearchExchanges) },
		change: function(e, ui) { exchangeSelection($(this), e, ui) },
		select: function(e, ui) { exchangeSelection($(this), e, ui) },
		//focus: function(e, ui) { exchangeFocus($(this), e, ui) },

	});
	
	$(".exchange-search").on("focus", function()
	{
		var val = $(this).val();		
		$(this).autocomplete( "search", val);
	})
	
	
	function exchangeMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		
		var a = $.grep(auto, function( item )
		{
			var exchange = item.vals;
			
			var ret = matcher.test(exchange);

			return ret;
		});
		

		a.sort();
		response(a);
	}
	
	
	
	function exchangeSelection($thisScope, e, ui)
	{
		
		if (!ui.item)
		{
			//$thisScope.autocomplete( "search", "" );
			//$thisScope.attr('data-asset', "-1");
		}
		else
		{
			var exchange = ui.item.vals;
			
			
			$thisScope.val(exchange);
		}
	}
	
	
	
	
	IDEX.initSkyNETAuto = function($search)
	{
		$search.autocomplete(
		{
			delay:0,
			html:true,
			open: function(e, ui) { $(this).autocomplete('widget').css({'width':"450px","margin-top":"14px"})},
			source: function(request,response) { skynetMatcher(request, response, autoSearchSkynet) },
			//change: function(e, ui) { skynetSelection($(this), e, ui) },
			select: function(e, ui) { skynetSelection($(this), e, ui) }
		});
	}
	
	
	$('.skynet-search').each(function(index, element)
	{
		IDEX.initSkyNETAuto($(element));
	});

	
	function skynetMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );

		var a = $.grep(auto, function( item )
		{
			var vals = item.vals
			var exchangeMarket = vals.exchangeMarket;

			var pair = exchangeMarket.pair
			var idPair = exchangeMarket.pairID
			var exchange = exchangeMarket.exchange
			
			var pairBoth = pair.split("_")
			

			var ret = matcher.test(pair) || matcher.test(pairBoth[0]) || matcher.test(pairBoth[1]) || matcher.test(idPair) || matcher.test(exchange)
			
			return (ret);
		});

		response(a.slice(0, 80));
	}
	
	
	function skynetSelection($input, e, ui)
	{
		if (!ui.item)
		{
			$input.attr('data-pair', "-1");
		}
		else
		{
			var vals = ui.item.vals;
			var market = vals.market;
			var exchangeMarket = vals.exchangeMarket;
			
			var obj = {};			
			var $wrap = $input.closest(".cell");
			var chart = $wrap.find(".chart-wrap").sleuthcharts();

			IDEX.changeChartMarket(chart, market, exchangeMarket.exchange);
		}
	}
	

	


	

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


