var express = require('express');
//var redis   = require("redis");
var app     = express();
var server  = app.listen(3000);
var io      = require('socket.io')(server);
var sequence = 1;
var clients = [];

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');

// Initializing Players and Cards
var Player = function(id, name){
	this.id = id;
	this.name = name;
	this.chips = 1500;
	this.chipsout = 0;
	this.card1 = {};
	this.card2 = {};
	this.ingame = true;
	this.inhand = true;
	this.button = false;
	this.bigblind = false;
	this.firsttoact = false;
	this.hand = [];
	this.hands = {
		'SF': false,
		'FK': false,
		'FH': false,
		'FL': false,
		'ST': false,
		'TK': false,
		'TP': false,
		'PA': false,
		'HC': true
	};
	this.suits = {
		'C': 0,
		'D': 0,
		'H': 0,
		'S': 0
	};
	this.ranks = {
		'AC': 0,
		'KI': 0,
		'QU': 0,
		'JA': 0,
		'TE': 0,
		'NI': 0,
		'EI': 0,
		'SE': 0,
		'SI': 0,
		'FI': 0,
		'FO': 0,
		'TH': 0,
		'TW': 0
	};
	this.pacounter = 0;
	this.tkcounter = 0;
	this.straight = [];
	this.flush = "";
};


var p1 = new Player(1, "Rui");
var p2 = new Player(2, "Alex");
var p3 = new Player(3, "Andy");
var p4 = new Player(4, "Sachin");
var p5 = new Player(5, "Winston");
var p6 = new Player(6, "Stephen");
var p7 = new Player(7, "Frances");
var p8 = new Player(8, "Jeremy");
p1.button = true;

var allplayers = [p1,p2,p3,p4,p5,p6,p7,p8];
var players = [p1,p2,p3,p4,p5,p6,p7,p8];

var Card = function(rank, value, suit, image){
	this.rank = rank;
	this.value = value;
	this.suit = suit;
	this.image = image;
}

var c1 = new Card(2, "2", "C", "2C");
var c2 = new Card(2, "2", "D", "2D");
var c3 = new Card(2, "2", "H", "2H");
var c4 = new Card(2, "2", "S", "2S");
var c5 = new Card(3, "3", "C", "3C");
var c6 = new Card(3, "3", "D", "3D");
var c7 = new Card(3, "3", "H", "3H");
var c8 = new Card(3, "3", "S", "3S");
var c9 = new Card(4, "4", "C", "4C");
var c10 = new Card(4, "4", "D", "4D");
var c11 = new Card(4, "4", "H", "4H");
var c12 = new Card(4, "4", "S", "4S");
var c13 = new Card(5, "5", "C", "5C");
var c14 = new Card(5, "5", "D", "5D");
var c15 = new Card(5, "5", "H", "5H");
var c16 = new Card(5, "5", "S", "5S");
var c17 = new Card(6, "6", "C", "6C");
var c18 = new Card(6, "6", "D", "6D");
var c19 = new Card(6, "6", "H", "6H");
var c20 = new Card(6, "6", "S", "6S");
var c21 = new Card(7, "7", "C", "7C");
var c22 = new Card(7, "7", "D", "7D");
var c23 = new Card(7, "7", "H", "7H");
var c24 = new Card(7, "7", "S", "7S");
var c25 = new Card(8, "8", "C", "8C");
var c26 = new Card(8, "8", "D", "8D");
var c27 = new Card(8, "8", "H", "8H");
var c28 = new Card(8, "8", "S", "8S");
var c29 = new Card(9, "9", "C", "9C");
var c30 = new Card(9, "9", "D", "9D");
var c31 = new Card(9, "9", "H", "9H");
var c32 = new Card(9, "9", "S", "9S");
var c33 = new Card(10, "T", "C", "TC");
var c34 = new Card(10, "T", "D", "TD");
var c35 = new Card(10, "T", "H", "TH");
var c36 = new Card(10, "T", "S", "TS");
var c37 = new Card(11, "J", "C", "JC");
var c38 = new Card(11, "J", "D", "JD");
var c39 = new Card(11, "J", "H", "JH");
var c40 = new Card(11, "J", "S", "JS");
var c41 = new Card(12, "Q", "C", "QC");
var c42 = new Card(12, "Q", "D", "QD");
var c43 = new Card(12, "Q", "H", "QH");
var c44 = new Card(12, "Q", "S", "QS");
var c45 = new Card(13, "K", "C", "KC");
var c46 = new Card(13, "K", "D", "KD");
var c47 = new Card(13, "K", "H", "KH");
var c48 = new Card(13, "K", "S", "KS");
var c49 = new Card(14, "A", "C", "AC");
var c50 = new Card(14, "A", "D", "AD");
var c51 = new Card(14, "A", "H", "AH");
var c52 = new Card(14, "A", "S", "AS");

var deck = [c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16,c17,c18,c19,c20,c21,c22,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52];
//var deck = [c1,c2,c3,c4,c35,c51,c27,c43,c8,c3,c4,c7,c8,c12,c1,c17,c52,c48,c44,c40,c32,c23,c24,c25,c26,c27,c28,c29,c30,c31,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46,c47,c48,c49,c50,c51,c52];
var deck = shuffle(deck);

var players = [];
// END PLAYER AND CARD INITIALIZATION

// FUNCTIONS //

function playerReset(){
	for (i=0; i<allplayers.length; i++){
		for (hand in allplayers[i].hands){
			if (hand == 'HC') allplayers[i].hands[hand] = true;
			else allplayers[i].hands[hand] = false;
		}
		for (suit in allplayers[i].suits){
			allplayers[i].suits[suit] = 0;
		}
		for (rank in allplayers[i].ranks){
			allplayers[i].ranks[rank] = 0;
		}
		allplayers[i].hand = [];
		allplayers[i].pacounter = 0;
		allplayers[i].tkcounter = 0;
		allplayers[i].straight = [];
		allplayers[i].flush = "";
	}
}

function passButton(){
	for(i=0; i<allplayers.length; i++){
		var j = 0;
		if (allplayers[i].button == true){
		  allplayers[i].button = false;
		  var buttonIndex = i;
		  break;
		}
	}
	for(i=buttonIndex; j<allplayers.length; j++){
		if(i != allplayers.length-1) i++;
		else i = 0;
		if (allplayers[i].ingame == true){
		  allplayers[i].button = true;
		  break;
		}
		if(i == allplayers.length-1) i=-1;
  }
  playersInHand(i);
};

function playersInHand(buttonIndex){
  players = [];
  var j = buttonIndex;
  for(i=0; i<allplayers.length; i++){
  	allplayers[i].bigblind = false;
  	allplayers[i].firsttoact = false;
  	if(allplayers[j].ingame == true){
      players.push(allplayers[j]);
    }
    if(j != allplayers.length-1) j++;
    else j = 0;
  }
};

function firstAfterButton(){
	players = [];
  for(i=0; i<allplayers.length; i++){
  	allplayers[i].firsttoact = false;
  	if(allplayers[i].button == true){
      var buttonindex = i;
      break;
    }
  }
  
  if (buttonindex == allplayers.length-1) buttonindex = 0;
  else buttonindex ++;

  for(i=0; i<allplayers.length; i++){
  	if(allplayers[buttonindex].inhand == true){
      players.push(allplayers[buttonindex]);
    }
    if (buttonindex != allplayers.length-1) buttonindex ++;
    else buttonindex = 0;
  }
  players[0].firsttoact = true;
};

function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

function shuffleDeck(){
	random = Math.floor(Math.random()*(10-1+1)+1);
	for(var i = 0; i < random; i++){
	  deck = shuffle(deck);
  }
};

function dealCards(){
	for(i=0; i<2; i++){
		for(j=0; j<players.length; j++){
			if(i==0) players[j].card1 = deck[0];
			if(i==1) players[j].card2 = deck[0];
	    deck.push(deck.shift());
	  }
	}
};

function blinds(){
  players.push(players.shift()); 
	players[0].chips -= sb;
	players[0].chipsout += sb;
	players.push(players.shift()); 
	players[0].bigblind = true;
	players[0].chips -= bb;
	players[0].chipsout += bb;
	players.push(players.shift()); 
};

function fold(){
	//players[0].inhand = false;
	//players.delete(0); 
	//io.emit('next', players);
};

function startHand(){
	playerReset();
	board =[];
	round = "p";
	raisecount = 0;
	sb = 10;
	bb = 20;
	cb = bb;
	pot = sb+bb;
	besthands = [];
	tie = false;
	passButton();
	blinds();
  shuffleDeck();
  dealCards();
  io.emit('init', players, allplayers, pot, board);
}

function scoopOnFold(){
  if (tie != true) players[0].chips += pot;
  for (var i=0; i<allplayers.length; i++){
    allplayers[i].chipsout = 0;
		allplayers[i].inhand = true;
  }
  if (tie == true){
  	io.emit('tiescoop', players, pot);
  } 
  else io.emit('scoop', players, pot);
  pot = 0;
}

function nextCards(){
	if (round == 'r'){
		players = [];
		for(i=0; i<allplayers.length; i++){
			if (allplayers[i].inhand == true) players.push(allplayers[i]);
		}
		checkHands();
	}
	else{
		if (round == 't') postRiver();
		if (round == 'f') postTurn();
		if (round == 'p') postFlop();
	  for (var i=0; i<allplayers.length; i++){
			allplayers[i].chipsout = 0;
	  }
	  raisecount = 0;
	  firstAfterButton();
	  io.emit('flop', board, players, allplayers, pot);
	}
}
function postFlop(){
	board[0]=deck[0];
	deck.push(deck.shift());
	board[1]=deck[0];
	deck.push(deck.shift());
	board[2]=deck[0];
	deck.push(deck.shift());
	round = "f";
}

function postTurn(){
	board[3]=deck[0];
	deck.push(deck.shift());
	round = "t";
}

function postRiver(){
	board[4]=deck[0];
	deck.push(deck.shift());
	round = "r";
}

function checkHands(){
	for (i=0; i<players.length; i++){
		players[i].hand = [players[i].card1, players[i].card2, board[0], board[1], board[2], board[3], board[4]];
		for (j=0; j<players[i].hand.length; j++){
	  	if (players[i].hand[j].suit == "C") players[i].suits['C'] ++;
	  	if (players[i].hand[j].suit == "D") players[i].suits['D'] ++;
	  	if (players[i].hand[j].suit == "H") players[i].suits['H'] ++;
	  	if (players[i].hand[j].suit == "S") players[i].suits['S'] ++;
	  	if (players[i].hand[j].rank == 2) players[i].ranks['TW'] ++;
	  	if (players[i].hand[j].rank == 3) players[i].ranks['TH'] ++;
	  	if (players[i].hand[j].rank == 4) players[i].ranks['FO'] ++;
	  	if (players[i].hand[j].rank == 5) players[i].ranks['FI'] ++;
	  	if (players[i].hand[j].rank == 6) players[i].ranks['SI'] ++;
	  	if (players[i].hand[j].rank == 7) players[i].ranks['SE'] ++;
	  	if (players[i].hand[j].rank == 8) players[i].ranks['EI'] ++;
	  	if (players[i].hand[j].rank == 9) players[i].ranks['NI'] ++;
	  	if (players[i].hand[j].rank == 10) players[i].ranks['TE'] ++;
	  	if (players[i].hand[j].rank == 11) players[i].ranks['JA'] ++;
	  	if (players[i].hand[j].rank == 12) players[i].ranks['QU'] ++;
	  	if (players[i].hand[j].rank == 13) players[i].ranks['KI'] ++;
	  	if (players[i].hand[j].rank == 14) players[i].ranks['AC'] ++;
	  }
  }
  pairCheck();
	flushCheck();
	straightCheck();
	sfCheck();
	bestIndex();
}

function breakTie(bestindex){
	if (besthands.length == 1) players = besthands;
	else{
		switch (bestindex){
			case 0:
				breakTieSF();
				break;
			case 1:
				breakTieFK();
				break;
			case 2:
				breakTieFH();
				break;
			case 3:
				breakTieFL();
				break;
			case 4:
				breakTieST();
				break;
			case 5:
				breakTieTK();
				break;
			case 6:
				breakTieTP();
				break;
			case 7:
				breakTiePA();
				break;
			case 8:
				breakTieHC();
				break;
		}
	}
	scoopOnFold();
	startHand();
}

function bestIndex(){
	var bestindex = 8;
	for (i=0; i<players.length; i++){
		var curindex = 0;
		for (var hand in players[i].hands){
			if (players[i].hands[hand] == true){
				if (curindex <= bestindex){
					if (curindex < bestindex){
						besthands = [];
					}
					besthands.push(players[i]);
					bestindex = curindex;
				}
				break;
			}
			curindex ++;
		}
	}
	breakTie(bestindex);
}

function pairCheck(){
	for (i=0; i<players.length; i++){
		for (var rank in players[i].ranks){
			if (players[i].ranks[rank] == 4) players[i].hands['FK'] = true;
			if (players[i].ranks[rank] == 3){
				players[i].hands['TK'] = true;
				players[i].tkcounter ++;
			}
			if(players[i].ranks[rank] == 2){
				players[i].hands['PA'] = true;
				players[i].pacounter ++;
			}
		}
		if (players[i].pacounter >= 2) players[i].hands['TP'] = true;
		if ( (players[i].tkcounter >= 1 && players[i].pacounter >= 1) || players[i].tkcounter == 2) players[i].hands['FH'] = true;
	}
}

function flushCheck(){
	for (i=0; i<players.length; i++){
		for (var suit in players[i].suits){
			if (players[i].suits[suit] >= 5){
				players[i].hands['FL'] = true;
				players[i].flush = suit;
			}
		}
	}
}

function straightCheck(){
 	for (i=0; i<players.length; i++){
 		if (players[i].ranks['AC'] >= 1 && players[i].ranks['KI'] >= 1 && players[i].ranks['QU'] >= 1 && players[i].ranks['JA'] >= 1 && players[i].ranks['TE'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(14);
    }
    if (players[i].ranks['KI'] >= 1 && players[i].ranks['QU'] >= 1 && players[i].ranks['JA'] >= 1 && players[i].ranks['TE'] >= 1 && players[i].ranks['NI'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(13);
    }
    if (players[i].ranks['QU'] >= 1 && players[i].ranks['JA'] >= 1 && players[i].ranks['TE'] >= 1 && players[i].ranks['NI'] >= 1 && players[i].ranks['EI'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(12);
    }
    if (players[i].ranks['JA'] >= 1 && players[i].ranks['TE'] >= 1 && players[i].ranks['NI'] >= 1 && players[i].ranks['EI'] >= 1 && players[i].ranks['SE'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(11);
    }
    if (players[i].ranks['TE'] >= 1 && players[i].ranks['NI'] >= 1 && players[i].ranks['EI'] >= 1 && players[i].ranks['SE'] >= 1 && players[i].ranks['SI'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(10);
    }
    if (players[i].ranks['NI'] >= 1 && players[i].ranks['EI'] >= 1 && players[i].ranks['SE'] >= 1 && players[i].ranks['SI'] >= 1 && players[i].ranks['FI'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(9);
    }
    if (players[i].ranks['EI'] >= 1 && players[i].ranks['SE'] >= 1 && players[i].ranks['SI'] >= 1 && players[i].ranks['FI'] >= 1 && players[i].ranks['FO'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(8);
    }
    if (players[i].ranks['SE'] >= 1 && players[i].ranks['SI'] >= 1 && players[i].ranks['FI'] >= 1 && players[i].ranks['FO'] >= 1 && players[i].ranks['TH'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(7);
    }
    if (players[i].ranks['SI'] >= 1 && players[i].ranks['FI'] >= 1 && players[i].ranks['FO'] >= 1 && players[i].ranks['TH'] >= 1 && players[i].ranks['TW'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(6);
    }
    if (players[i].ranks['FI'] >= 1 && players[i].ranks['FO'] >= 1 && players[i].ranks['TH'] >= 1 && players[i].ranks['TW'] >= 1 && players[i].ranks['AC'] >= 1){
      players[i].hands['ST'] = true;
      players[i].straight.push(5);
    }
  }
}

function sfCheck(){
 	for (i=0; i<players.length; i++){
 	  if (players[i].hands['FL'] == true && players[i].hands['ST'] == true){
      for(j=0; j<players[i].straight.length; j++){
     	  var num = players[i].straight[j];
        var suitcount = 0
          for(k=0; k<5; k++){
        	  if (num == 1) num = 14;
            for (l=0; l<players[i].hand.length; l++){
              if (players[i].hand[l].suit == players[i].flush && players[i].hand[l].rank == num) suitcount += 1;
            }
            num = num-1; 
          }
        if (suitcount >= 5) players[i].hands['SF'] = true;
      }
    } 
  }
}

var board = [];
var round = "p";
var raisecount = 0;
var sb = 10;
var bb = 20;
var cb = bb;
var pot = sb+bb;
var action;
var besthands = [];
var tie = false;
startHand();


io.on('connection', function(socket) {
	socket.on('disconnect', function() {
		console.log('Aww..');
	});

	socket.on('init', function(message) {
		io.emit('init', players, allplayers, pot, board);
		//var p8 = new Player(8, "Jeremy", soc);
	});

	socket.on('fold', function(message) {
		io.emit('fold', players, cb, bb);
		players[0].inhand = false;
		if (cb == players[1].chipsout && (bb != players[1].chipsout || round != 'p')) nextCards();
		else players.shift(); 

		if (players.length == 1){
		  scoopOnFold();
		  startHand();
		} 
	});

	socket.on('call', function(message) {
		var toCall = cb-players[0].chipsout;
		players[0].chips -= toCall;
		players[0].chipsout += toCall;
		pot += toCall;
		if (cb == players[1].chipsout && (bb != players[1].chipsout || round != 'p')){
			io.emit('addChips', players, allplayers, pot, cb, bb, raisecount, action, round);
			nextCards();
		}
		else{
			action = 'call';
			io.emit('addChips', players, allplayers, pot, cb, bb, raisecount, action, round);
			players.push(players.shift());
		}
	});

	socket.on('raise', function(message) {
		raisecount ++;
		if(round == 'p' || round == 'f'){
			var toRaise = cb-players[0].chipsout + bb;
			cb += bb;
		}
		else{
			var toRaise = cb-players[0].chipsout + (bb * 2);
			cb += bb * 2;
		}
		players[0].chips -= toRaise;
		players[0].chipsout += toRaise;
		pot += toRaise;
		action = 'raise';
		io.emit('addChips', players, allplayers, pot, cb, bb, raisecount, action, round);
		players.push(players.shift());
	});

	socket.on('bet', function(message) {
		if (round == 'f') var toBet = bb;
		else var toBet = bb * 2;
		cb = toBet;
		players[0].chips -= toBet;
		players[0].chipsout += toBet;
		pot += toBet;
		action = 'bet';
		io.emit('addChips', players, allplayers, pot, cb, bb, raisecount, action, round);
		players.push(players.shift());
	});

	socket.on('check', function(message) {
		if (round == 'p'){
			nextCards();
		}
		else{
			if (players[1].firsttoact == true) nextCards();
			else players.push(players.shift());
		}
	});

	socket.on('flop', function(message) {
		board[0]=deck[0];
		deck.push(deck.shift());
		board[1]=deck[0];
		deck.push(deck.shift());
		board[2]=deck[0];
		deck.push(deck.shift());
		//io.emit('flop', board, players, allplayers, pot);
		postFlop();
	});
	


});

// ROUTE 
app.get('/', function(req, res) {
	res.render('index');
});





// ---------------- TIEBREAKERS AND SPLIT POTS ------------------

function splitPot(tiedhands){
	tie = true;
	var potshare = pot/tiedhands.length;
	for (i=0; i<tiedhands.length; i++){
		tiedhands[i].chips += potshare;
	}
}


function breakTieFK(){
	var bestrank = 12;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		var currank = 0;
		for (var rank in besthands[i].ranks){
			if (besthands[i].ranks[rank] == 4){
				if (currank <= bestrank){
					if (currank < bestrank) newbesthands = [];
					newbesthands.push(besthands[i]);
					bestrank = currank;
				}
				break;
			}
			currank ++;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		bestrank = 12;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			var currank = 0;
			for (var rank in newbesthands[i].ranks){
				if (newbesthands[i].ranks[rank] != 4 && newbesthands[i].ranks[rank] >= 1){
					if (currank <= bestrank){
						if (currank < bestrank) newerbesthands = [];
						newerbesthands.push(newbesthands[i]);
						bestrank = currank;
					}
					break;
				}
				currank ++;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else splitPot(newerbesthands);
	}
}

function breakTieFH(){
	var bestrank = 12;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		var currank = 0;
		for (var rank in besthands[i].ranks){
			if (besthands[i].ranks[rank] == 3){
				if (currank <= bestrank){
					if (currank < bestrank) newbesthands = [];
					newbesthands.push(besthands[i]);
					bestrank = currank;
				}
				break;
			}
			currank ++;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		oldbestrank = bestrank;
		bestrank = 12;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			var currank = 0;
			for (var rank in newbesthands[i].ranks){
				if (newbesthands[i].ranks[rank] >=2  && newbesthands[i].ranks[rank] != oldbestrank){
					if (currank <= bestrank){
						if (currank < bestrank) newerbesthands = [];
						newerbesthands.push(newbesthands[i]);
						bestrank = currank;
					}
					break;
				}
				currank ++;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else splitPot(newerbesthands);
	}
}

function breakTieFL(){
	var bestrank = 2;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		pbrank = 2;
		for (j=0; j<besthands[i].hand.length; j++){
			if (besthands[i].hand[j].suit == besthands[i].flush && besthands[i].hand[j].rank > pbrank) pbrank = besthands[i].hand[j].rank;
		}
		if (pbrank >= bestrank){	
			if (pbrank > bestrank) newbesthands = [];	
			newbesthands.push(besthands[i]);
			bestrank = pbrank;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		oldbestrank = bestrank;
		bestrank = 2;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			pbrank = 2;
			for (j=0; j<newbesthands[i].hand.length; j++){
				if (newbesthands[i].hand[j].suit == newbesthands[i].flush && newbesthands[i].hand[j].rank > pbrank && newbesthands[i].hand[j].rank < oldbestrank) pbrank = newbesthands[i].hand[j].rank;
			}
			if (pbrank >= bestrank){	
				if (pbrank > bestrank) newerbesthands = [];	
				newerbesthands.push(newbesthands[i]);
				bestrank = pbrank;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else{
			oldbestrank = bestrank;
			bestrank = 2;
			var newestbesthands =[];
	    for (i=0; i<newerbesthands.length; i++){
				pbrank = 2;
				for (j=0; j<newerbesthands[i].hand.length; j++){
					if (newerbesthands[i].hand[j].suit == newerbesthands[i].flush && newerbesthands[i].hand[j].rank > pbrank && newerbesthands[i].hand[j].rank < oldbestrank) pbrank = newerbesthands[i].hand[j].rank;
				}
				if (pbrank >= bestrank){	
					if (pbrank > bestrank) newestbesthands = [];	
					newestbesthands.push(newerbesthands[i]);
					bestrank = pbrank;
				}
			}
			if (newestbesthands.length == 1) players = newestbesthands;
			else{
				olderbestrank = bestrank;
				bestrank = 2;
				var besthands1 =[];
		    for (i=0; i<newestbesthands.length; i++){
				pbrank = 2;
				for (j=0; j<newestbesthands[i].hand.length; j++){
					if (newestbesthands[i].hand[j].suit == newestbesthands[i].flush && newestbesthands[i].hand[j].rank > pbrank && newestbesthands[i].hand[j].rank < oldbestrank) pbrank = newestbesthands[i].hand[j].rank;
				}
				if (pbrank >= bestrank){	
					if (pbrank > bestrank) besthands1 = [];	
					besthands1.push(newestbesthands[i]);
					bestrank = pbrank;
				}
			}
				if (besthands1.length == 1) players = besthands1;
				else{
					olderbestrank = bestrank;
					bestrank = 2;
					var besthands2 =[];
			    for (i=0; i<besthands1.length; i++){
						pbrank = 2;
						for (j=0; j<besthands1[i].hand.length; j++){
							if (besthands1[i].hand[j].suit == besthands1[i].flush && besthands1[i].hand[j].rank > pbrank && besthands1[i].hand[j].rank < oldbestrank) pbrank = besthands1[i].hand[j].rank;
						}
						if (pbrank >= bestrank){	
							if (pbrank > bestrank) besthands2 = [];	
							besthands2.push(besthands1[i]);
							bestrank = pbrank;
						}
					}
					if (besthands2.length == 1) players = besthands2;
					else splitPot(besthands2);
				}
			}
		}
	}
}

function breakTieST(){
	var bestrank = 5;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		if (besthands[i].straight[0] >= bestrank){
			if (besthands[i].straight[0] > bestrank) newbesthands = [];
			newbesthands.push(besthands[i]);
			bestrank = besthands[i].straight[0];
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else splitPot(newbesthands);
}

function breakTieTK(){
	var bestrank = 12;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		var currank = 0;
		for (var rank in besthands[i].ranks){
			if (besthands[i].ranks[rank] == 3){
				if (currank <= bestrank){
					if (currank < bestrank) newbesthands = [];
					newbesthands.push(besthands[i]);
					bestrank = currank;
				}
				break;
			}
			currank ++;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		oldbestrank = bestrank;
		bestrank = 12;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			var currank = 0;
			for (var rank in newbesthands[i].ranks){
				if (newbesthands[i].ranks[rank] == 1  && currank != oldbestrank){
					if (currank <= bestrank){
						if (currank < bestrank) newerbesthands = [];
						newerbesthands.push(newbesthands[i]);
						bestrank = currank;
					}
					break;
				}
				currank ++;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else{
			olderbestrank = bestrank;
			bestrank = 12;
			var newestbesthands =[];
	    for (i=0; i<newerbesthands.length; i++){
				var currank = 0;
				for (var rank in newerbesthands[i].ranks){
					if (newerbesthands[i].ranks[rank] == 1 && currank != oldbestrank && currank != olderbestrank){
						if (currank <= bestrank){
							if (currank < bestrank) newestbesthands = [];
							newestbesthands.push(newerbesthands[i]);
							bestrank = currank;
						}
						break;
					}
					currank ++;
				}
			}
			if (newestbesthands.length == 1) players = newestbesthands;
			else splitPot(newestbesthands);
		}
	}
}

function breakTieTP(){
	var bestrank = 12;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		var currank = 0;
		for (var rank in besthands[i].ranks){
			if (besthands[i].ranks[rank] == 2){
				if (currank <= bestrank){
					if (currank < bestrank) newbesthands = [];
					newbesthands.push(besthands[i]);
					bestrank = currank;
				}
				break;
			}
			currank ++;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		oldbestrank = bestrank;
		bestrank = 12;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			var currank = 0;
			for (var rank in newbesthands[i].ranks){
				if (newbesthands[i].ranks[rank] == 2  && currank != oldbestrank){
					if (currank <= bestrank){
						if (currank < bestrank) newerbesthands = [];
						newerbesthands.push(newbesthands[i]);
						bestrank = currank;
					}
					break;
				}
				currank ++;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else{
			olderbestrank = bestrank;
			bestrank = 12;
			var newestbesthands =[];
	    for (i=0; i<newerbesthands.length; i++){
				var currank = 0;
				for (var rank in newerbesthands[i].ranks){
					if (newerbesthands[i].ranks[rank] >= 1 && currank != oldbestrank && currank != olderbestrank){
						if (currank <= bestrank){
							if (currank < bestrank) newestbesthands = [];
							newestbesthands.push(newerbesthands[i]);
							bestrank = currank;
						}
						break;
					}
					currank ++;
				}
			}
			if (newestbesthands.length == 1) players = newestbesthands;
			else splitPot(newestbesthands);
		}
	}
}

function breakTiePA(){
	var bestrank = 12;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		var currank = 0;
		for (var rank in besthands[i].ranks){
			if (besthands[i].ranks[rank] == 2){
				if (currank <= bestrank){
					if (currank < bestrank) newbesthands = [];
					newbesthands.push(besthands[i]);
					bestrank = currank;
				}
				break;
			}
			currank ++;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		bestrank = 12;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			var currank = 0;
			for (var rank in newbesthands[i].ranks){
				if (newbesthands[i].ranks[rank] == 1){
					if (currank <= bestrank){
						if (currank < bestrank) newerbesthands = [];
						newerbesthands.push(newbesthands[i]);
						bestrank = currank;
					}
					break;
				}
				currank ++;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else{
			oldbestrank = bestrank;
			bestrank = 12;
			var newestbesthands =[];
	    for (i=0; i<newerbesthands.length; i++){
				var currank = 0;
				for (var rank in newerbesthands[i].ranks){
					if (newerbesthands[i].ranks[rank] == 1 && currank != oldbestrank){
						if (currank <= bestrank){
							if (currank < bestrank) newestbesthands = [];
							newestbesthands.push(newerbesthands[i]);
							bestrank = currank;
						}
						break;
					}
					currank ++;
				}
			}
			if (newestbesthands.length == 1) players = newestbesthands;
			else{
				olderbestrank = bestrank;
				bestrank = 12;
				var besthands1 =[];
		    for (i=0; i<newestbesthands.length; i++){
					var currank = 0;
					for (var rank in newestbesthands[i].ranks){
						if (newestbesthands[i].ranks[rank] == 1 && currank != oldbestrank && currank != olderbestrank){
							if (currank <= bestrank){
								if (currank < bestrank) besthands1 = [];
								besthands1.push(newestbesthands[i]);
								bestrank = currank;
							}
							break;
						}
						currank ++;
					}
				}
				if (besthands1.length == 1) players = besthands1;
				else splitPot(besthands1);
			}
		}
	}
}

function breakTieHC(){
	var bestrank = 12;
	var newbesthands =[];
	for (i=0; i<besthands.length; i++){
		var currank = 0;
		for (var rank in besthands[i].ranks){
			if (besthands[i].ranks[rank] == 1){
				if (currank <= bestrank){
					if (currank < bestrank) newbesthands = [];
					newbesthands.push(besthands[i]);
					bestrank = currank;
				}
				break;
			}
			currank ++;
		}
	}
	if (newbesthands.length == 1) players = newbesthands;
	else{
		oldbestrank = bestrank;
		bestrank = 12;
		var newerbesthands =[];
    for (i=0; i<newbesthands.length; i++){
			var currank = 0;
			for (var rank in newbesthands[i].ranks){
				if (newbesthands[i].ranks[rank] == 1 && currank != oldbestrank){
					if (currank <= bestrank){
						if (currank < bestrank) newerbesthands = [];
						newerbesthands.push(newbesthands[i]);
						bestrank = currank;
					}
					break;
				}
				currank ++;
			}
		}
		if (newerbesthands.length == 1) players = newerbesthands;
		else{
			olderbestrank = bestrank;
			bestrank = 12;
			var newestbesthands =[];
	    for (i=0; i<newerbesthands.length; i++){
				var currank = 0;
				for (var rank in newerbesthands[i].ranks){
					if (newerbesthands[i].ranks[rank] == 1 && currank != oldbestrank && currank != olderbestrank){
						if (currank <= bestrank){
							if (currank < bestrank) newestbesthands = [];
							newestbesthands.push(newerbesthands[i]);
							bestrank = currank;
						}
						break;
					}
					currank ++;
				}
			}
			if (newestbesthands.length == 1) players = newestbesthands;
			else{
				oldestbestrank = bestrank;
				bestrank = 12;
				var besthands1 =[];
		    for (i=0; i<newestbesthands.length; i++){
					var currank = 0;
					for (var rank in newestbesthands[i].ranks){
						if (newestbesthands[i].ranks[rank] == 1 && currank != oldbestrank && currank != olderbestrank && currank != oldestbestrank){
							if (currank <= bestrank){
								if (currank < bestrank) besthands1 = [];
								besthands1.push(newestbesthands[i]);
								bestrank = currank;
							}
							break;
						}
						currank ++;
					}
				}
				if (besthands1.length == 1) players = besthands1;
				else{
					oldestbestrank1 = bestrank;
					bestrank = 12;
					var besthands2 =[];
			    for (i=0; i<besthands1.length; i++){
						var currank = 0;
						for (var rank in besthands1[i].ranks){
							if (besthands1[i].ranks[rank] == 1 && currank != oldbestrank && currank != olderbestrank && currank != oldestbestrank && currank != oldestbestrank1){
								if (currank <= bestrank){
									if (currank < bestrank) besthands2 = [];
									besthands2.push(besthands1[i]);
									bestrank = currank;
								}
								break;
							}
							currank ++;
						}
					}
					if (besthands2.length == 1) players = besthands2;
					else splitPot(besthands2);
				}
			}
		}
	}
}
