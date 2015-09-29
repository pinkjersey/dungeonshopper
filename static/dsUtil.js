var prepEvents = function() {
	var events = [];
	events.push(new Event(0,"unknown"));
	events.push(new Event(1,"BattleOfCastillon"));
	events.push(new Event(2,"CaptureOfLusignan"));
	events.push(new Event(3,"CombatOfTheThirty"));
	events.push(new Event(4,"LoireCampaign"));
	events.push(new Event(5,"SiegeOfHarfleur"));
	events.push(new Event(6,"BarbarianAttack"));
	events.push(new Event(7,"BrokenItems"));
	events.push(new Event(8,"CastleTaxation"));
	events.push(new Event(9,"GolbinRaid"));
	events.push(new Event(10,"KingsFeast"));
	events.push(new Event(11,"MarketShortage"));
	events.push(new Event(12,"MarketSurplus"));
	events.push(new Event(13,"OrcsAttack"));
	events.push(new Event(14,"SandStorm"));
	events.push(new Event(15,"ThrownInTheDungeon"));
	events.push(new Event(16,"Treasure"));
	events.push(new Event(17,"VikingParade"));
	events.push(new Event(18,"HailStorm"));
	events.push(new Event(19,"HiddenRoom"));
	return events;
}

//plays audio files
play = function (soundId) {
	var audio = document.getElementById(soundId);
	audio.play();
};

playerCardChecked = function(card) {
	if(card.selected) {
		card.image = card.imageChecked;
	}
	else {	
		card.image = card.imageOrig;
	}
}	

cartCardChecked = function(card) {
	if(card.selected) {
		card.image = card.imageChecked;
	}
	else {	
		card.image = card.imageSmall;
	}
}	
	
hideImages = function(scope) {
	if(scope.hideImagesBool) {
		scope.questImageBase = "../images/questxxx";
		scope.blankMarketImageBase = "../images/xxx"
		scope.cartImageBase = "../images/cart_xxx";
		scope.splashImage = "../images/boxtopxxx.jpg";
		scope.itemCardBack = "../images/shoppingCardBack.jpgxxx";
		scope.vendorCardBack = "../images/vendorback.jpgxxx";
		scope.knight = "";
		scope.titleImg = "../images/title_smallxxx.jpg"
	}
	else {
		scope.questImageBase = "../images/quest";
		scope.blankMarketImageBase = "../images/"
		scope.cartImageBase = "../images/cart";
		scope.splashImage = "../images/boxtop.jpg";
		scope.itemCardBack = "../images/shoppingCardBack.jpg";
		scope.vendorCardBack = "../images/vendorback.jpg";
		scope.knight = "../images/knight.gif";
		scope.titleImg = "../images/title_small.jpg"
	}
}
	
showHide = function(showOtherPlayerData) {
	if(showOtherPlayerData)	{
			return "Hide";
		}
		else {
			return "Show";
		}
}
showHideQuests = function(showMyCompletedQuests) {
	if(showMyCompletedQuests) {
			return "Hide";
		}
		else {
			return "Show";
		}
}


nextCartName = function(cartId) {
if(cartId === 1)
	return 'Horse Wagon';

if(cartId === 2)
	return 'War Wagon';
}

cartColor = function(cart) {
	if(cart.selected) {
	return 'black';
	}
	else {
	return cart.borderColorInit;
	}
}

mode = function(isActive) {
	if(isActive) {
		return 'game';
	}
	else {
		return 'gameSpectator';
	}
}	

var getPlayerName = function(game, playerId) {
	
	for (var p = 0; p < game.players.length; ++p) {  
		if( game.players[p].id === playerId) {
			return game.players[p].name;
		}
	}
}


checkIfQuestIsReadyFromCart = function (game, player) {
	var questCanBeCompleted = false;
	var cartId = -1;
	var questIndex = -1;
	var questReady = {};
	
	for (var i = 0; i < player.carts.length; ++i) {
		if(questCanBeCompleted === true){
				break;
			}
		var selectedCards = getSelectedCardArrayForQuest(player.carts[i].cards);
		for (var j = 0; j < game.questsInPlay.playingCards.length; ++j) {
			var questFound = game.questsInPlay.playingCards[j];
			if(questFound.level===4) {
				continue;
			}
			var items =  new Array(questFound.item1, questFound.item2, questFound.item3, questFound.item4, questFound.item5);
			
			if (parseSelectedCardArrayForQuest(selectedCards) === parseSelectedCardArrayForQuest(items) ){
				questCanBeCompleted = true;
				var cartWithItems = player.carts[i].cards;
				cartId = i;
				questIndex = j;
				break;
			}

		}
	}
	
	if (questCanBeCompleted === true) {
		questFound.borderColor = 'border:10px solid green';
		questReady.cartId = cartId;
		questReady.questCard = questFound;
		questReady.items = cartWithItems.playingCards;
		questReady.index = questIndex;
	}

	
	return questReady;
}

function getIntersect(hand, quest) {
			//as matches are found in quest, multiply by -1 so they don't get selected twice
			//then set the r array to negitive values for the hand to quest match
			var r = [], i, v, x;
			for (i = 0; i < hand.length; i++) {
				v = hand[i];
				for(x = 0; x < quest.length; ++x) {
					if(quest[x] === v) {
						r.push(v*-1);
						quest[x] = v*-1;
						break;
					}
				}	
			}
			return r;
		}

var checkIfQuestISReadyFromHand = function (game, player, autoSelectHand) {
	var questCanBeCompleted = false;
	var r = [];
	var hand = [];
	var questReady = {};
	for (var j = 0; j < player.cards.playingCards.length; ++j) {
		card = player.cards.playingCards[j];
		hand[j]= card.number;
	}
	
	if(hand[0] === "") {
		return;
	}
	else {
		var backupArr1 = hand;
	}

	
	for (var j = 0; j < game.questsInPlay.playingCards.length; ++j) {
		if(questCanBeCompleted === true){
				break;
			}			
	
		hand = backupArr1;
		var questFound = game.questsInPlay.playingCards[j];
		if(questFound.level===4) {
			continue;
		}
		var quest = new Array(questFound.item1, questFound.item2, questFound.item3, questFound.item4, questFound.item5);

		for(var i = quest.length - 1; i >= 0; i--) {
			if(quest[i] === 0) {
			   quest.splice(i, 1);
			}
		}						
					
		var r = getIntersect(hand, quest);


		if (parseSelectedCardArrayForQuest(quest) === parseSelectedCardArrayForQuest(r) ){
			questCanBeCompleted = true;
			questFound.borderColor = 'border:10px solid green';
			questReady.items = r;
			questReady.questCard = questFound;

			return questReady;
		}
	}
		
	return questReady;
}



//returns card in an array
getSelectedCardArrayForQuest = function(deck){
	var arr = [];
	for (var i = 0; i < 5; ++i)  {
		var card = deck.playingCards[i];
		if(card===undefined) {
			arr[i]=0;
		}
		else {
			arr[i]=card.number;
		}
	}
	return arr;
}


parseSelectedCardArrayForQuest = function(items) {
	var s = "";
	var num = "";
	for (var i = 0; i < items.length; i++) {
		num = items[i].toString();
		s += num;
		if(i+1 < items.length) {
			s+=", ";
		}
	}
	return s;
}

updatePlayerCarts = function(game, player, playerCart, dataCart) {
	playerCart.active = dataCart.purchased;
	playerCart.destroyed = dataCart.destroyed;
	if(playerCart.active) {
		playerCart.image = playerCart.imagePurchased;
		player.nextCartId ++;
		player.nextCartName = nextCartName(player.nextCartId);
		for (var i = 0; i < dataCart.inCart.length; ++i) {   
			updatePlayerCartItems(game, playerCart, dataCart.inCart[i]);	
		}
	}
}
	
updatePlayerCartItems = function(game, playerCart, number) {
	for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
		var card = game.itemHolders.playingCards[i];
		card.setCardSize("small");
			if(card.number === number) {
				playerCart.cards.addCardc(card);
				break;
		}
	}
}

dealNumberToPlayer = function(game, player, number) {
	for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
		var card = game.itemHolders.playingCards[i];
		card.setCardSize("orig");
			if(card.number === number) {
				player.cards.addCardc(card);
				break;
		}
	}
}
dealNumberToMarket = function(game, number) {
	for (var i = 0; i < game.itemMarketHolders.playingCards.length; ++i)  {
		var card = game.itemMarketHolders.playingCards[i];
		card.setCardSize("orig");
			if(card.number === number) {
				game.marketDeck.playingCards.push(card);
				break;
			}
	}
}

dealQuestsCompleted = function(game, questsCompleted, items) {
	var	itemString = "";
	for (var i = 0; i < items.length; ++i)  {
		itemString += items[i];
	}


	for (var i = 0; i < game.quests.playingCards.length; ++i)  {
		var card = game.quests.playingCards[i];
			if(card.questMatchId=== itemString) {
				questsCompleted.playingCards.push(card);
				break;
		}
	}

}

dealQuestCard = function(game, items, level, type) {
	var	itemString = "";
	for (var i = 0; i < items.length; ++i)  {
		itemString += items[i];
	}
	if(level < 4) {
		for (var i = 0; i < game.quests.playingCards.length; ++i)  {
		var card = game.quests.playingCards[i];
			if(card.questMatchId=== itemString) {
				game.questsInPlay.playingCards.push(card);
				break;
			}	
		}

	}
	else {
		for (var i = 0; i < game.quests.playingCards.length; ++i)  {
		var card = game.quests.playingCards[i];
			if(card.nameId === type) {
				game.questsInPlay.playingCards.push(card);
				break;
			}	
		}
		
		if(level === 4) {
			game.activeEvent = card.name;
			prepareEventForPlayer(game, card);
		}
	}
}
		
		//sort player cart cards
sortPlayerCartCards = function(cart) {
	cart.cards.playingCards.sort(function (a,b) {return a.number-b.number});
}

//sort player quests
sortPlayerQuests = function(activePlayer) {
	activePlayer.questsCompleted.playingCards.sort(function (a,b) {return a.nameId-b.nameId});
}

cardPurchaseWithText = function(cardSumSelected, itemCost) {
	if (cardSumSelected >= itemCost) {
		return 'items';	
		}
	else	{
		return 'gold';
	}
}	
	
//returns first selected card in deck
getSelectedCard = function(deck){
	for (var i = 0; i < deck.playingCards.length; ++i)  {
		var card = deck.playingCards[i];
		if(card.selected) {
			break;
		}
		continue;
	}
	return card;
}

//returns card numbers appended to each other for deck.  ex. 1224
getSelectedCards = function(deck, selectedCardsOnly){
	var selectedCards = "";
	var cardNumber = "";
	for (var i = 0; i < deck.playingCards.length; ++i)  {
		var card = deck.playingCards[i];
		cardNumber = card.number;
		if(card.number===10) {
			cardNumber = 0;
		}
		if(selectedCardsOnly){
			if(card.selected) {
				selectedCards+=cardNumber;
			}
		}
		else {
			selectedCards+=cardNumber;
		}
	}
	
	return selectedCards;

}

logSelectedCards = function(items) {
	var s = "";
	var num = "";
	for (var i = 0; i < items.length; i++) {
		if (items.charAt(i) === '0') {
			num = '10'
		}
		else {
			num = items.charAt(i);
		}
		s += num;
		if(i+1 < items.length) {
			s+=", ";
		}
}
	return s;
}

//returns number of cards selected for deck
getSelectedCardcount = function(deck, selectedCardsOnly){
	var total = 0;
	for (var i = 0; i < deck.playingCards.length; ++i)  {
		var card = deck.playingCards[i];
		if(selectedCardsOnly){
			if(card.selected) {
				total++;
			}
		else {
			total += deck.playingCards[i].number;
		}
		continue;
	}
	return total;

}

//returns total number sum of selected cards in deck
getSelectedCardSum = function(deck, selectedCardsOnly){
	var total = 0;
	for (var i = 0; i < deck.playingCards.length; ++i)  {
		var card = deck.playingCards[i];
		if(selectedCardsOnly){
			if(card.selected) {
				total += card.number;
			}
		}
		else {
			total += deck.playingCards[i].number;
		}
	}
	return total;

}

	
setMarketCounts = function(game) {
	/*this function will:
	go through all cards in market card stack.
	add all $scope.game.market.playingCards[j-1].number and .count
	this array is what is used to show the market on the screen
	*/	
	var cardCount =0;
	var marketLength = game.marketDeck.playingCards.length;
	for (var j=1; j<11; j++) {
		cardCount = 0;
		for (var i = 0; i < marketLength; ++i) {
			var marketCard = game.marketDeck.playingCards[i];
			if(marketCard===null)
			{continue;}
			else {
				if(marketCard.number === j) {
					cardCount++
				}
			}
		}
		//update the item card and the count
		game.itemMarketHolders.playingCards[j-1].count = cardCount;
		game.itemMarketHolders.playingCards[j-1].setCountImage(cardCount);
	}

}


var convertToName = function(params) {
	switch(params) {
		case "hand":
			return "player's hand";
			break;
		case "cart0":
			return "wheelbarrow";
			break;
		case "cart1":
			return "hand cart";
			break;
		case "cart2":
			return "horse cart";
			break;
		case "cart3":
			return "war wagon";
			break;
		default:
			return "";
	}
}

	
//ex
//"playerLog": [{"event": "http://localhost:8080/game?action=discard&what=3&where=hand", "playerId": 0}]
/*
action=buyCart&withGold=0&items=0&cart=cart1
action=move&what=67&src=hand&dst=cart0
action=move&what=14&src=hand&dst=cart1
action=buyCart&withGold=0&items=288&cart=cart2
action=fish&what=6&where=cart0
action=move&what=37&src=hand&dst=cart0
action=completeQuest&what=377&where=cart0
action=buyCart&withGold=0&items=24456&cart=cart3
action=discard&what=14&where=cart1
action=discard&what=67&where=hand
action=fish&what=7&where=hand
action=move&what=23&src=hand&dst=cart1
action=move&what=45&src=hand&dst=cart2
*/

/*
<audio id="trash">
<audio id="swords">
<audio id="horseNeigh">
<audio id="questComplete">
<audio id="fish">
<audio id="button">
<audio id="cards">
<audio id="pass">
<audio id="market">
<audio id="buyCart">
*/
logPlayerAction = function(isActive, playersLog, playerName, logItem) {
	if(logItem!="") {
		var pattern = "/game?";
		var index = logItem.indexOf(pattern) + pattern.length;
				
		var array = logItem.substring(index).split("&");
		var logEntry = "";
		var sound = "";
		
		for (var i = 0; i < array.length; ++i) {   
			var logActions = array[i].split("=");
				for (var j = 0; j < logActions.length; ++j) {   
					switch(logActions[j]) {
						case "action":
							logEntry+="";
							break;
						case "discard":
							logEntry+=" discarded";
							sound = "trash";
							break;
						case "fish":
							logEntry+=" fished " ;
							sound = "fish";
							break;
						case "completeQuest":
							logEntry+= " completed a quest ";
							sound = "questComplete";
							break;
						case "move":
							logEntry+=" moved " ;
							sound = "swords";
							break;
						case "marketTrade":
							logEntry+= " did a market trade from ";
							sound = "market";
							break;
						case "buyCart":
							logEntry+= "bought ";
							sound = "buyCart";
							break;
						case "pass":
							logEntry+=" passed ";
							sound = "swords";
							break;
						case "what":
							logEntry+=" item(s) " ;
							break;
						case "where":
							logEntry+=" from " ;
							break;
						case "dst":
							logEntry+=" to the ";
							break;
						case "src":
							logEntry+=" from the " ;
							break;
						case "handItems":
							logEntry+=convertToName("hand") + " item(s) ";
							break;
						case "hand":
							logEntry+=convertToName("hand");
							break;
						case "cart":
							logEntry+=" the ";
							break;
						case "cart0":
							logEntry+=convertToName("cart0");
							break;
						case "cart1":
							logEntry+=convertToName("cart1");
							break;
						case "cart2":
							logEntry+=convertToName("cart2");
							sound="horseNeigh";
							break;
						case "cart3":
							logEntry+=convertToName("cart3");
							break;
						case "items":
							if(logActions[j+1]!="") {
								logEntry+= " with item(s) ";
							}
							else {
								logEntry+= "";
							}
								
							break;
						case "withGold":
							if(logActions[j+1]!="0") {
								logEntry+= " with gold the ";
							}
							else {
								logEntry+= "";
							}

							break;
						case "marketItems":
							logEntry+= " for market item(s) ";
							break;
						case "withGold":
							logEntry+= " with gold the ";
							break;
						case "0":
							logEntry+= "";
							break;
						default:
							logEntry+=logActions[j];
					}
				}
			}
		
		playersLog.push(new PlayersLog(playersLog.length, playerName, logEntry + '.'));
		if(!isActive && sound != "") {
			play(sound);
		}
	}
}
