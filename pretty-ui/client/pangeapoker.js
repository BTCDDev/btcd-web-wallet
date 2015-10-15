var $ = window.$
var console = window.console
var WebSocket = window.WebSocket


var pangea = new Object()
pangea.pokerRoom = document.getElementById('poker-room')

pangea.randomIntFromInterval = function(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

pangea.dealerTray = function(){
  function addDealerChip(row){
    var rows = ['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5']
    var baseTop = 65
    var pokerRoom = document.getElementById('poker-room')
    var chipDiv = document.createElement('div')
    chipDiv.className = 'chip-edge ' + rows[row]
    var thistop = baseTop + (3 * dealerchips[row])
    chipDiv.style.top = String(thistop) + 'px'
    var chipSpot = document.createElement('div')
    chipSpot.className = 'chip-spot'
    chipSpot.style.left = String(pangea.randomIntFromInterval(2,8))
                        + 'px'
    chipDiv.appendChild(chipSpot)
    pokerRoom.appendChild(chipDiv)
    dealerchips[row] += 1
    return chipDiv
  }

  function addChips(row, quantity){
    for (var i=0; i<quantity; i++){
      addDealerChip(row)
    }
  }

  var dealerchips = [0, 0, 0, 0, 0]
  for (var i=0; i<5; i++){
    addChips(i, pangea.randomIntFromInterval(5,14))
  }
}

pangea.addChip = function(chipnum, left, top, extraClass){
  var chipDiv = document.createElement('div')
  if (extraClass == undefined){extraClass = 1}
  if (extraClass.length > 1){
    chipDiv.className = 'chip chip' + chipnum + ' ' + extraClass
  } else {
    chipDiv.className = 'chip chip' + chipnum
  }
  chipDiv.style.top = String(top) + 'px'
  chipDiv.style.left = String(left) + 'px'
  pangea.pokerRoom.appendChild(chipDiv)
}

pangea.playerChips = function(playernum, stacknum, chipnum, quantity){
  // var p0 = [[494, 90], [475, 92], [488, 106], [507, 104], [470, 108]]
  // var p1 = [[644, 132], [630, 142], [648, 149], [631, 160], [647, 167]]
  // var p2 = [[644, 257], [630, 267], [648, 274], [631, 285], [647, 292]]
  // var p3 = [[582, 333], [565, 328], [599, 328], [549, 333], [616, 333]]
  // var p4 = [[395, 345], [378, 340], [412, 340], [362, 345], [429, 345]]
  // var p5 = [[208, 333], [191, 328], [225, 328], [175, 333], [242, 333]]
  // var p6 = [[145, 257], [159, 267], [141, 274], [158, 285], [142, 292]]
  // var p7 = [[145, 132], [159, 142], [141, 149], [158, 160], [142, 167]]
  // var p8 = [[291, 90], [310, 92], [297, 106], [278, 104], [315, 108]]
  var p0 = pangea.constants.p0
  var p1 = pangea.constants.p1
  var p2 = pangea.constants.p2
  var p3 = pangea.constants.p3
  var p4 = pangea.constants.p4
  var p5 = pangea.constants.p5
  var p6 = pangea.constants.p6
  var p7 = pangea.constants.p7
  var p8 = pangea.constants.p8
  var players = Array(p0, p1, p2, p3, p4, p5, p6, p7, p8)
  var player = players[playernum]
  var pokerRoom = document.getElementById('poker-room')
  var bottom_chip = player[stacknum]
  if (bottom_chip == undefined){
    console.log(stacknum)
    console.log(player)
  }
  for (var i=0; i<quantity; i++){
    var top = bottom_chip[1] - (2 * i)
    pangea.addChip(chipnum, bottom_chip[0], top)
  }
}

pangea.potChips = function(potnum, stacknum, chipnum, quantity){
  var pot1 = [[390, 280], [372, 280], [408, 280], [354, 280], [426, 280]]
  var pot2 = [[277, 280], [259, 280], [295, 280], [241, 280], [313, 280]]
  var pot3 = [[508, 280], [490, 280], [526, 280], [472, 280], [544, 280]]
  var pots = Array(pot1, pot2, pot3)
  var pot = pots[potnum]
  var bottom_chip = pot[stacknum]
  if (bottom_chip == undefined){
    console.log(stacknum)
    console.log(pot[stacknum])
  }
  for (var i=0; i<quantity; i++){
    var top = bottom_chip[1] - (2 * i)
    var extraClass = 'potchip' + potnum
    pangea.addChip(chipnum, bottom_chip[0], top, extraClass)
  }
}

pangea.openSocketIO = function(){
  var socketio = io();

  socketio.on('connection', function(socket){
    console.log('connected!');

    //pangea.ws = socket;
    socketio.on('message', function(message){
      pangea.onMessage(message);
    });

    socketio.emit("message", {"action": {"ready": 0}, playerId: pangea.playerId});

    setTimeout(function(){
      pangea.startGame();
    }, 2000);

  });

  return socketio;
}

pangea.openWebSocket = function(){
  var ws  = new WebSocket(pangea.wsURI)
  ws.onmessage = function(event){
    pangea.onMessage(event.data)
  }
  return ws
}

pangea.onMessage = function(message){
  var handlers = {'action':pangea.API.action, 'game':pangea.API.game, 'seats':pangea.API.seats, 'player':pangea.API.player, 'deal':pangea.API.deal, 'chat':pangea.API.chat}

  for (var key in message){
    if (message.hasOwnProperty(key)){
      var handler = handlers[key]
      handler(message[key])
    }
  }
}

pangea.sendMessage = function(message){
  //if (typeof message != 'string'){
  //  message = JSON.stringify(message)
  //}
  message.playerId = pangea.playerId;
  pangea.ws.emit("message", message)
  console.log('Sent: ', message)
}

pangea.onFold = function(){
  folded.push(pangea.seat);
  pangea.API.action({"returnPlayerCards": pangea.seat});
}

pangea.dealerTray()
pangea.wsURI = 'ws://localhost:8081'
pangea.ws = pangea.openSocketIO()

var bet = 0;
var polling = false;

//track the last card so we know the round has ended
var lastCommunityCard;

var newGame = true;
var dealt = false;
var lastTurn = -1;

var folded = [];

pangea.startGame = function(){
  pangea.ws.on('pangeaStatusRes', function(data){
    initializePlayerData(handleStatusResult(data));

    if (newGame) {
      startNewGame();
    }
    else{
      updateGame();

      updateSeats();

      performGameActions();
    }
  });

  if (!polling)
    poll();
}

function startNewGame(){
  newGame = false;

  var game = {
    bigblind: pangea.table.bigblind,
    myturn: pangea.table.hand.undergun == pangea.seat ? 1 : 0,
    tocall: 0,
    pot: [0]
  };

  var smallblind = pangea.table.bigblind / 2

  game.gametype = "NL Holdem<br /> Blinds " + smallblind + "/" + game.bigblind;

  pangea.API.game(game);
}

function handleStatusResult(data){
  //console.log(data);

  data = JSON.parse(data);

  if (!data)
  {
    console.log("error connecting to supernet. data is null");
  }
  else if (data.error){
    console.log(data.error);
    return;
  }

  return data;
}

function reset(){
  console.log("resetting");

  newGame = true;
  folded = [];
  dealt = false;

  pangea.API.action({"returnCards": 0});
}

function initializePlayerData(data){
  //initialize this players data
  pangea.table = data.table;
  pangea.mynxtid = pangea.table.addrs[pangea.table.myind];
  pangea.seat = parseInt(pangea.table.myind);

  //override the player - FOR TESTING PURPOSES
  if (pangea.playerId){
    pangea.seat = pangea.playerId;
  }
}

function updateGame(){
  //update the players timer, pass 0 since server removed timeleft propert
  pangea.API.game({
    timer: pangea.table.timeleft != undefined ? pangea.table.timeleft : 0,
    myturn: pangea.table.hand.undergun == pangea.seat ? 1 : 0,
    tocall: pangea.table.hand.betsize - pangea.table.bets[ pangea.seat],
    //array starting with the main pot
    pot: pangea.table.potTotals
  });
}

function updateSeats(){
  //update all the seats
  var seats = [];
  for (var i = 0; i < pangea.table.addrs.length; i++){
    var addr = pangea.table.addrs[i];

    var isFolded = dealt && getIsFolded(i);
    //don't update the seat if the player has folded
    seats.push({
      empty: 0,
      seat: i,
      name: addr,
      playing: 1,
      player: pangea.table.seat == i ? 1 : 0,
      stack: pangea.table.balances[i],
      bet: pangea.table.bets[i] - pangea.table.snapshot[i]
    });

    //if this is the current player
    if (i == pangea.seat) {
      var player = {
        seat: parseInt(pangea.seat),
        sitting: 1,
        stack: pangea.table.balances[i]
      };

      if (dealt && !isFolded) {
        player.holecards = pangea.table.hand.holecards.split(" ");
      }

      pangea.API.player(player);
    }

    if (!isFolded && dealt && addr == pangea.mynxtid && pangea.table.hand.holecards != undefined) {
      seats[i].playercards = pangea.table.hand.holecards.split(" ");
    }
  };

  pangea.API.seats(seats);

  function getIsFolded(seat){
    if (contains(folded, seat)){
        return true;
    }

    var playerActions = pangea.table.actions[seat];

    for (var i = 0; i < playerActions.length; i++){
      if (Object.keys(playerActions[i])[0] == "fold" || playerActions[i].action == "fold"){
        console.log("player " + seat + " folded.");
        folded.push(seat);
        pangea.API.action({"returnPlayerCards": seat});
        return true;
      }
    }

    return false;
  }
}

function performGameActions(){
  //summary is true when a hand has ended, we'll deal the new cards when the new game is ready and this flag is removed
  if (!pangea.table.summary && !dealt) {

    reset();

    console.log("redealing cards");
    var obj = {"holecards": [null, null], "dealer": 0};
    console.log(obj);
    pangea.API.deal(obj);

    //temporary hack to resolve folding at start of next round
    setTimeout(function(){
      dealt = true;
    }, 2000);

  }
  else{
    var cards = {};


    //check if the hand is over so we can return the cards
    if (pangea.table.summary && dealt){
      console.log("game ended");

      //set dealt to false so once summary goes away the above code will trigger and reset the game
      dealt = false;

      var won = pangea.table.summary.won;
      //delay sliding the chips to the player until slightly after the cards are returned
      //(function(won){
      //  setTimeout(function(){
          //and move the chips to the winner
          for (var i = 0; i < won.length; i++){
            if (won[i] > 0){
              console.log("player " + i + " won");
              pangea.API.action({"chipsToPlayer": i});
            }
          }
      //  }, 500);
      //})(pangea.table.summary.won);
    }
    else if (dealt){
      var community = pangea.table.hand.community.trim().split(" ");

      //detect if round has completed so we can push the chips to the middle
      var last = community[community.length - 1];
      if (lastCommunityCard == undefined){
        lastCommunityCard = last;
      }
      if (lastCommunityCard != last){
        lastCommunityCard = last;

        console.log("round ended. chips to pot");
        pangea.API.action({"chipsToPot" : 1});
      }


      //get the community cards to display the flop
      for (var i = 0; i < community.length; i++) {
        cards[i] = community[i];
      }
    }

    var obj = {"board": cards, "dealer": pangea.table.button};
    console.log("dealing:" + cards);
    pangea.API.deal(obj);
  }
}

function buyin(){
  //pangea.ws.emit('pangeaBuyin', {tableid: pangea.table.tableid, amount: 15000000000});
  //
  //pangea.ws.on('pangeaBuyinRes', function(data){
  //  var data = JSON.parse(data);
  //
  //  if (data.error){
  //    console.log(data.error);
  //    //handle error
  //  }
  //  else {
  //    var seat = [{
  //      empty: 0,
  //      seat: parseInt(pangea.seat),
  //      playing: 1,
  //      stack: 150
  //    }];
  //  }
  //
  //  pangea.API.seats(seat);


  //});
}

function poll(){
  polling = true;
  setTimeout(function(){
    pangea.ws.emit('pangeaStatus2', {tableid: pangea.tableId, playerId: pangea.playerId});

    poll();
  }, 1000);
}

function contains(array, obj) {
  var i = array.length;
  while (i--) {
    if (array[i] == obj) {
      return true;
    }
  }
  return false;
}