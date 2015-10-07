var prepEvents = function() {
	var events = [];
	events.push(new Event(0,"unknown","unknown"));
	events.push(new Event(1,"BattleOfCastillon","Battle of Castillon"));
	events.push(new Event(2,"CaptureOfLusignan","Capture of Lusignan"));
	events.push(new Event(3,"CombatOfTheThirty","Combat of the Thirty"));
	events.push(new Event(4,"LoireCampaign","Loire Campaign"));
	events.push(new Event(5,"SiegeOfHarfleur","Siege of Harfleur"));
	events.push(new Event(6,"BarbarianAttack","Barbarian Attack"));
	events.push(new Event(7,"BrokenItems","Broken Items"));
	events.push(new Event(8,"CastleTaxation","Castle Taxation"));
	events.push(new Event(9,"GolbinRaid","Goblin Raid"));
	events.push(new Event(10,"KingsFeast","Kings Feast"));
	events.push(new Event(11,"MarketShortage","Market Shortage"));
	events.push(new Event(12,"MarketSurplus","Market Surplus"));
	events.push(new Event(13,"OrcsAttack","Orcs Attack"));
	events.push(new Event(14,"SandStorm","Sand Storm"));
	events.push(new Event(15,"ThrownInTheDungeon","Thrown in the Dungeon"));
	events.push(new Event(16,"Treasure","Treasure"));
	events.push(new Event(17,"VikingParade","Viking Parade"));
	events.push(new Event(18,"HailStorm","Hail Storm"));
	events.push(new Event(19,"HiddenRoom","Hidden Room"));
	return events;
}

var prepSounds = function() {
	var sounds = [];
	sounds.push(new Sound(0,"choppingWood"));
	sounds.push(new Sound(1,"trash"));
	sounds.push(new Sound(2,"ambiance"));
	sounds.push(new Sound(3,"card"));
	sounds.push(new Sound(4,"anvil"));
	sounds.push(new Sound(5,"swords"));
	sounds.push(new Sound(6,"horseNeigh"));
	sounds.push(new Sound(7,"questComplete"));
	sounds.push(new Sound(8,"fish"));
	sounds.push(new Sound(9,"button"));
	sounds.push(new Sound(10,"cards"));
	sounds.push(new Sound(11,"pass"));
	sounds.push(new Sound(12,"market"));
	sounds.push(new Sound(13,"buyCart"));
	return sounds;
}

hideImages = function(scope) {
	if(scope.hideImagesBool) {
		scope.questImageBase = "../images/questxxx";
		scope.blankMarketImageBase = "../images/xxx";
		scope.cartImageBase = "../images/cart_xxx";
		scope.splashImage = "../images/boxtopxxx.jpg";
		scope.itemCardBack = "../images/shoppingCardBack.jpgxxx";
		scope.vendorCardBack = "../images/vendorback.jpgxxx";
		scope.knight = "";
		scope.titleImg = "../images/title_smallxxx.jpg";
	}
	else {
		scope.questImageBase = "../images/quest";
		scope.blankMarketImageBase = "../images/";
		scope.cartImageBase = "../images/cart";
		scope.splashImage = "../images/boxtop.jpg";
		scope.itemCardBack = "../images/shoppingCardBack.jpg";
		scope.vendorCardBack = "../images/vendorback.jpg";
		scope.knight = "../images/knight.gif";
		scope.titleImg = "../images/title_small.jpg";
	}
}	

	var getSound = function(action, scope) {
		var name = "";
		switch (action) {
			case "discard":
				name = scope.sounds[1].name;
				break;
			case "fish":
				name = scope.sounds[8].name;
				break;
			case "completeQuest":
				name = scope.sounds[7].name;
				break;
			case "move":
				name = scope.sounds[5].name;
				break;
			case "marketTrade":
				name = scope.sounds[12].name;
				break;
			case "buyCart":
				name = scope.sounds[13].name;
				break;
			case "cart0":
				name = scope.sounds[0].name;
				break;
			case "cart1":
				name = scope.sounds[13].name;
				break;
			case "cart2":
				name = scope.sounds[6].name;
				break;
			case "cart3":
				name = scope.sounds[4].name;
				break;
			case "pass":
				name = scope.sounds[11].name;
				break;
			default:
				name = "";
		}
	return name;
	}
	
	playCartSound = function(cartId, scope) {
			if(cartId===0) {
				play(scope.sounds[0].name);
			}		
			if(cartId===1) {
				play(scope.sounds[13].name);
			}
			if(cartId===2) {
				play(scope.sounds[6].name);
			}
			if(cartId===3) {
				play(scope.sounds[4].name);
			}
	}
	
getCardName = function (number) {
	switch (parseInt(number)) {
	   case 0:
		   name = "Ballista";
		   break;
		case 1: 
		   name = "Club";
			break;
	   case 2:
		   name = "Shield";
			break;
	   case 3:
		   name = "Mace";
		   break;
	   case 4:
		   name = "Flail";
		   break;
	   case 5:
		   name = "Sword";
		   break;
	   case 6:
		   name = "Axe";
		   break;
	   case 7:
		   name = "Crossbow";
		   break;
	   case 8:
		   name = "Armor";
		   break;
	   case 9:
		   name = "Trebuchet";
		   break;
	   case 10:
		   name = "Ballista";
		   break;
	   default:
		   name = "Unknown";
		   break;
   }
	return name;
}

getAdj = function(i) {
	var adj = [];
	adj[0] = "dope";
	adj[1] = "shaky";
	adj[2] = "stirdy";
	adj[3] = "wobly";
	adj[4] = "well-built";
	adj[5] = "vigorous";
	adj[6] = "bulky";
	adj[7] = "hulking";
	adj[8] = "rugged";
	adj[9] = "powerhouse";
	adj[10] = "secure";
	return adj[i];
}

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
	else {
		playerCart.image = playerCart.imageNotPurchased;
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
			game.activeEventCard = card;
			//prepareEventForPlayer(game, card);
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

parseToArray = function(items) {
	var s = [];
	var num = "";
	for (var i = 0; i < items.length; i++) {
		if (items.charAt(i) === '0') {
			num = '10'
		}
		else {
			num = items.charAt(i);
		}
		s[i] = num;
	}
	return s;
}


parseFromArray = function(items) {
	var s = "";
	var num = "";
	for (var i = 0; i < items.length; i++) {
		if (items[i] === '0') {
			num = '10'
		}
		else {
			num = items[i];
		}
		s += num;
		if(i+1 < items.length) {
			s+=", ";
		}
}
	return s;
}

parseFromArrayIntoNames = function(items) {
	var s = "";
	var num = "";
	for (var i = 0; i < items.length; i++) {
		if (items[1] === '0') {
			num = '10'
		}
		else {
			num = items[i];
		}
		s += getCardName(num);
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
		}
		else {
			total += deck.playingCards[i].number;
		}
		
		
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
			return "hand";
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

//completeEventeventId16 the wheelbarrowgold1what1where1what2where2dest1.

logPlayerAction = function(isActive, playersLog, playerName, logItem, scope) {
	if(logItem!="") {
		var pattern = "/game?";
		var index = logItem.indexOf(pattern) + pattern.length;
				
		var array = logItem.substring(index).split("&");
		var logEntry = "";
		var sound = "";
		
		if(array[0] === "action=completeEvent") {
			var logActions  = array[1].split("=");
			logEntry = " completed event " + logActions[1];
		}
		else {
			for (var i = 0; i < array.length; ++i) {   
				var logActions = array[i].split("=");
				for (var j = 0; j < logActions.length; ++j) {   
					switch(logActions[j]) {
						case "action":
							logEntry+="";
							break;
						case "discard":
							logEntry+=" discarded";
							sound = getSound(logActions[j], scope);
							break;
						case "completeEventeventId":
							logEntry+=" completed event " + logActions[j]
							break;
						case "fish":
							logEntry+=" fished " ;
							sound = getSound(logActions[j], scope);
							break;
						case "completeQuest":
							logEntry+= " completed a quest ";
							sound = getSound(logActions[j], scope);
							break;
						case "move":
							logEntry+=" moved " ;
							sound = getSound(logActions[j], scope);
							break;
						case "marketTrade":
							logEntry+= " did a market trade from ";
							sound = getSound(logActions[j], scope);
							break;
						case "buyCart":
							logEntry+= "bought ";
							sound = getSound(logActions[j+1], scope);
							break;
						case "pass":
							logEntry+=" passed ";
							sound = getSound(logActions[j], scope);
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
							sound = getSound("horseNeigh", scope);
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
		}
		playersLog.push(new PlayersLog(playersLog.length, playerName, logEntry + '.'));
		if(!isActive && sound != "") {
			play(sound);
		}
	}
}

