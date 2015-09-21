
//'ngAnimate'
var Cart = function (id, size, active, goldCost, itemCost, name, imagePurchased, imageNotPurchased) {
    this.id = id;
	this.size = size;
    this.active = active;
	this.selected = false;
	this.width=92;
	this.height=125;
	this.name = name;
	this.destroyed = false;
	this.purchaseWith = 'gold';
	this.image = imageNotPurchased;

	//set initial state of carts
	if(active===1) {
		this.image = imagePurchased;
	}
	else {
		this.image = imageNotPurchased;
	}
		
	this.imagePurchased = imagePurchased;
	this.imageNotPurchased = imageNotPurchased;
	this.goldCost = goldCost;
	this.itemCost = itemCost;
	this.cards = new cardSet;
	this.borderColorNotBoughtInit = "#5c3e3c"
	this.borderColorInit = "#9c280b"
	this.borderColor = this.borderColorInit;
	this.cardSumSelected = 0;
    this.contains = function () {
        if (this.cards.playingCards.length == 0) {
            return "Nothing";
        }
        var ret = "";
        for (var i = 0; i < this.cards.playingCards.length; ++i) {
            ret += this.cards.playingCards[i].number + " ";
        }
        return ret;
   }
}
 

var Game = function(numPlayers) {

	//all the starter empty playingCards holders	
	this.quests = new questSet();
	this.itemHolders = new cardSet();
	this.itemMarketHolders = new cardSet();
	this.questsInPlay = new cardSet();
	this.marketDeck = new cardSet();
	this.marketDeckInTrade = new cardSet();

	//populated cardrs, itemHolders and quests
	var questImageBase = "../images/quest";
//	var questImageBase = "../images/questxxx";
	var blankMarketImageBase = "../images/"
//	var blankMarketImageBase = "../images/xxx"
	this.itemHolders.createBlankMarket(blankMarketImageBase);
	this.itemMarketHolders.createBlankMarket(blankMarketImageBase);
	this.quests.createQuestDeck(questImageBase);

	this.players = [];
	//create players
	for (var i = 0; i < numPlayers; ++i) {   
		this.players.push(new Player(i, "Player" + i));
	}	
	//set initial size of the cards for the gui
	//their are times in the code that these are changed and reset
	this.quests.setCardSize("orig");	
	this.questsInPlay.setCardSize("orig");

}

var EventsLog = function (id, name, logItem) {
	this.id = id;
	this.name = name;
	this.logItem = logItem;
}

var PlayersLog = function (id, text) {
	this.id = id;
	this.text = text;
}

var Event = function (index, type, name, displayMode) {
	var imageBase="../images/event";
	index = index;
	id = type;
	name = name;
	displayMode = 'event' + name;
	image = imageBase + name + 'jpg';
}




var Player = function (id, name) {
	var imageBase = "../images/cart";
//	var imageBase = "../images/cart_xxx";
    this.id = id;
	this.name = name;
	this.turns = 0;
	this.active = false;
	this.cards = new cardSet();
	this.maxHand = 5;
    this.questsCompleted = new cardSet();
	this.gold = 0;
	this.vp = 0;
	this.bonus = 0;
	this.cardSumSelected = 0;
	this.actionsRemaining = 2;
	this.nextCartId = 1;
	this.nextCartName = 'Hand Cart';
	this.winner=false;
    this.carts = [new Cart(0, 3, 1, 0, 5,'Wheelbarrow', imageBase + '0.jpg', imageBase + '0_not_purchased.jpg'), 
				  new Cart(1, 3, 0, 1, 10, 'Hand Cart', imageBase + '1.jpg', imageBase + '1_not_purchased.jpg'), 
				  new Cart(2, 4, 0, 2, 15, 'Horse Wagon', imageBase + '2.jpg', imageBase + '2_not_purchased.jpg'), 
			      new Cart(3, 5, 0, 3, 20, 'War Wagon', imageBase + '3.jpg', imageBase + '3_not_purchased.jpg')]
				  ;
}
	
app.controller('dsCtrl', ['$scope', 'gameFactory', function ($scope, gameFactory) {

	//plays audio files
	play = function (soundId) {
		var audio = document.getElementById(soundId);
		//audio.play();
	};

	$scope.noGame = function () {
		setupNoGame();
	}


	//setup splash screen
	setupNoGame = function() {
		$scope.displayMode = "nogame";
		//$scope.splashImage = "../images/boxtop.jpg";
		//$scopeNextPlayerId = 0;
		$scope.playerName="Type Your Name";
		$scopeNextPlayerId=0;		
		$scope.numberOfPlayers =1;
		$scope.game=null;
	}	

	setupNoGame();
	
	$scope.joinGame = function(numberOfPlayers, playerName) {
		//$scope.playerName = playerName;
		$scopeNextPlayerId++;		
		$scope.numberOfPlayers = Number(numberOfPlayers);
		//$scopeNextPlayerId++;
		//$scope.playerName = "Player"+($scopeNextPlayerId+1);
		//$scope.numberOfPlayersJoined = $scopeNextPlayerId;
		$scope.game = new Game($scopeNextPlayerId+1);
		//$scope.activePlayerId = $scopeNextPlayerId;
		//$scope.activePlayer = $scope.game.players[$scope.activePlayerId];			
		$scope.myId=$scopeNextPlayerId;
		joinGame($scopeNextPlayerId, playerName);
		//$scope.displayMode = "game";
	}
	
	
	$scope.newGame = function (numberOfPlayers, playerName) {
		$scope.numberOfPlayers = Number(numberOfPlayers);
		$scope.game = new Game(numberOfPlayers);
		//$scope.activePlayerId = 0;
		$scope.myId = 0;
		//$scope.activePlayer = $scope.game.players[$scope.activePlayerId];			
		loadData(numberOfPlayers, playerName);
		//$scope.displayMode = "game";
		play("cards");
	}

	//refresh data from backend if anything is stuck
	$scope.playerRefresh = function() {
		$scope.dots += "...";
		playerRefresh($scope.activePlayerId);
		$scope.loadingData=false;
	}

	//interval method to update game spectators
   	function startInterval(params) {
        $scope.timerId = setInterval(function () { 
			if($scope.isActive===false) {
				if($scope.activePlayerId != undefined) {
					$scope.playerRefresh();
				}
			}

		}	, params	)
	}

    //this is the initial load spectator refresh 
    $(document).ready(); {
        startInterval(5000);
    }

	$scope.activeEvent = null;
	$scope.playersCompletedEventCount = 0;
	$scope.itemCardBack = "../images/shoppingCardBack.jpg";
	$scope.vendorCardBack = "../images/vendorback.jpg";
	//$scope.itemCardBack = "../images/shoppingCardBack.jpgxxx";
	//$scope.vendorCardBack = "../images/vendorback.jpgxxx";
	//$scope.eventActionsRemaining=0;;
	$scope.debug = false;
	//gui variable to control item buttons
	$scope.selectedItemsCount = 0;
	//gui variable to control cart buttons
	$scope.selectedCartItemsCount = 0;
	//gui variable to control market buttons
	$scope.sumMarketValueSelected = 0;
	//gui control of the market cards selected
	$scope.selectedMarketTradeCount = 0;
	//used in gui to show items left in deck
	$scope.itemsCountRemaining = 0;
	//used in gui to show quests left in deck
	$scope.questsCountRemaining = 0;
	//used in gui to show discard count
	$scope.discardsCount = 0;
	$scope.activePlayer = null;
	//used to show the last card discarded in the gui
	$scope.lastDiscard = new playingCard();
	//gui control of the quests
	//$scope.questSelected=false;
	$scope.isActive = false;
	$scope.selectedCartItems = "";
	$scope.playerslog = [];
	$scope.eventsLog = [];
	$scope.showLog = false;
	$scope.showLogText = "Show Players Log";
	$scope.blankText = "";
	$scope.dots="...";
	//gui variable to control cart buttons
	$scope.prevActiveCartId = -1;
	$scope.activeCartId = -1;
	$scope.borderPXselected = "border:3px solid red";
	$scope.borderPX = "border:1px solid black";
	$scope.borderPXorig = "border:1px solid white";
	
	$scope.events = [
		new Event(0,0,""),
		new Event(1,0,""),
		new Event(2,0,""),
		new Event(3,0,""),
		new Event(4,0,""),
		new Event(5,0,""),
		new Event(6,6,"BarbarianAttack"),
		new Event(7,7,"BrokenItems"),
		new Event(8,8,"CastleTaxation"),
		new Event(9,9,"GolbinRaid"),
		new Event(10,10,"KingsFeast"),
		new Event(11,11,"MarketShortage"),
		new Event(12,12,"MarketSurplus"),
		new Event(13,13,"OrcsAttack"),
		new Event(14,14,"SandStorm"),
		new Event(15,15,"ThrownInTheDungeon"),
		new Event(16,16,"Treasure"),
		new Event(17,17,"VikingParade"),
		new Event(18,18,"HailStorm"),
		new Event(19,19,"HiddenRoom"),
		]
	
	$scope.showLogResults = function() {
		if(!$scope.showLog) {
			$scope.showLogText = "Hide Players Log";
		}else {
			$scope.showLogText = "Show Players Log";
		}
		$scope.showLog = !$scope.showLog;
	}

	var cardColor = function(card) {
		if(card.selected) {
			return $scope.borderPXselected;
		//return 'red';
		}
		else {
			return $scope.borderPXorig;
		//return 'black';
		}
	}

	var cartColor = function(cart) {
		if(cart.selected) {
		return 'black';
		}
		else {
		return cart.borderColorInit;
		}
	}

	gameEnd = function() {
		$scope.displayMode = "gameover";
		$scope.displayModeName = "Game Over";
		clearInterval($scope.timerId);
		$scope.loadingData=false;
	}
	
	$scope.endGame = function() {
		var r =  confirm("Are you sure you want to quit?");
			if(r===true) {
				gameEnd();
			}
			else {
				return;
			}
	}

	var nextCartName = function(cartId) {
	if(cartId === 1)
		return 'Horse Wagon';

	if(cartId === 2)
		return 'War Wagon';
	}

	$scope.userClickedMarketImage = function(i) {
		if(!$scope.isActive){return;}
		var game = $scope.game;
		var card = game.itemMarketHolders.playingCards[i];
		card.selected = !card.selected;
		//card.borderColor = cardColor(card);
		card.count--;
		card.setCountImage(card.count);
		card.setCardSize("orig");
		
		game.marketDeckInTrade.addCardc(card);
		var len = game.marketDeckInTrade.playingCards.length - 1;
		game.marketDeckInTrade.playingCards[len].selected = true;
		//game.marketDeckInTrade.setCardSize("60","80");
		updateMarketItemPoints(card.number);
		play("button");
	}

	$scope.userClickedMarketTradeImage = function(i) {
		if(!$scope.isActive){return;}	
		var game = $scope.game;
		var card = game.marketDeckInTrade.playingCards[i];
		var marketCard = game.itemMarketHolders.playingCards[card.number-1];
		//increase the number above the market card holder
		marketCard.count++;
		marketCard.setCountImage(marketCard.count);
		
		marketCard.selected = !marketCard.selected;
		//marketCard.borderColor = cardColor(marketCard);
		game.marketDeckInTrade.playingCards[i] = null;
		game.marketDeckInTrade.truncate();
		updateMarketItemPoints(-card.number);
		play("button");
	}

	$scope.userClickedQuestImage = function(i) {
		if(!$scope.isActive){return;}
		var game = $scope.game;
		var questClicked = game.questsInPlay.playingCards[i];
		questClicked.selected = !questClicked.selected;
		questClicked.borderColor = cardColor(questClicked);

		for (var j = 0; j < game.questsInPlay.playingCards.length; ++j)  {
			if(j===i){
				if(questClicked.selected){
					questClicked.setCardSize("large");
				}
				else {
					questClicked.setCardSize("orig");
				}
			}
			else {
				var card = game.questsInPlay.playingCards[j];
				card.selected = false;
				card.borderColor = cardColor(card);
				card.setCardSize("orig");
			}
		}
		play("button");
	}


	var checkIfQuestIsReady = function () {
		var game = $scope.game;
		var player = $scope.activePlayer;
		var questCanBeCompleted = false;


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
				
				if (parseSelectedCardArrayFoQuest(selectedCards) === parseSelectedCardArrayFoQuest(items) ){
					questCanBeCompleted = true;
					var cartWithItems = player.carts[i].cards;
					var cartId = i;
					break;
				}

			}
		}
		
		if (questCanBeCompleted === true) {
			questFound.borderColor = 'border:10px solid green';
			$scope.userClickedCartImage(cartId);
		
		}
	}
	
	function getIntersect(arr1, arr2) {
				var r = [], o = {}, l = arr2.length, i, v;
				for (i = 0; i < l; i++) {
					o[arr2[i]] = true;
				}
				l = arr1.length;
				for (i = 0; i < l; i++) {
					v = arr1[i];
					if (v in o) {
						r.push(v);
					}
				}
				return r;
			}

	var checkIfHaveCardsForQuest = function () {
		var game = $scope.game;
		var player = $scope.activePlayer;
		var questCanBeCompleted = false;

		var arr1 = [];
		for (var j = 0; j < player.cards.playingCards.length; ++j) {
			card = player.cards.playingCards[j];
			arr1[j]= card.number;
		}
		
		if(arr1[0] === "") {
			return;
		}

		for (var j = 0; j < game.questsInPlay.playingCards.length; ++j) {
			var questFound = game.questsInPlay.playingCards[j];
			if(questFound.level===4) {
				continue;
			}
			var arr2 = new Array(questFound.item1, questFound.item2, questFound.item3, questFound.item4, questFound.item5);
			
	
			for(var i = arr2.length - 1; i >= 0; i--) {
				if(arr2[i] === 0) {
				   arr2.splice(i, 1);
				}
			}						
						
			var r = getIntersect(arr2, arr1);
	
			//remove trailing zeros from arrays and it will match.

			if (parseSelectedCardArrayFoQuest(arr2) === parseSelectedCardArrayFoQuest(r) ){
				questCanBeCompleted = true;
				break;
			}
		}
		
		if (questCanBeCompleted === true) {
			questFound.borderColor = 'border:10px solid green';
			selectHandCards(arr2);

			
		}
	}
	
	selectHandCards = function(cardArray) {
		var cards = new Array(cardArray);
		for (var a=0; a < cardArray.length; ++a) {
			questNumber = cardArray[a];
			for (var d=0;d<$scope.activePlayer.cards.playingCards.length; ++d) {
				if(questNumber = $scope.activePlayer.cards.playingCards[d]) {
					$scope.userClickedItemImage[d];
					break;
				}
			}
		}
	}

	//returns card numbers appended to each other for deck.  ex. 1224
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


	parseSelectedCardArrayFoQuest = function(items) {
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

	$scope.playerCompleteQuest = function(id) {
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var questClicked = game.questsInPlay.playingCards[id];
		var questCanBeCompleted = false;

		if($scope.activeCartId < 0 )	{
			alert("Select a cart with items first.");
			return;
		}

		var cart = player.carts[$scope.activeCartId];

		//if(!$scope.debug) {  //good for testing events
		if($scope.selectedCartItemsCount < 3 || cart.cards.playingCards.length != $scope.selectedCartItemsCount) {
			alert("Select all items in cart/wagon first.");
			return;
			}
			
		var selectedCards = getSelectedCards(cart.cards, true);
		var questCards = getSelectedCardArrayForQuest(cart.cards);
		var items =  new Array(questClicked.item1, questClicked.item2, questClicked.item3, questClicked.item4, questClicked.item5);
		//var itemsTrimmed = getSelectedCardsFoQuest(items);
		//var items = questClicked.item1.toString() +questClicked.item2.toString()+questClicked.item3.toString()+questClicked.item4.toString()+questClicked.item5.toString();
		
		if (parseSelectedCardArrayFoQuest(questCards) === parseSelectedCardArrayFoQuest(items) ){
			questCanBeCompleted = true;
		}

		if (questCanBeCompleted === true) {
			var r =  confirm("Confirm purchase from " + cart.name +"?");
			if(r===true) {
				//check if player completed quest and move it to their completed quests
				game.questsInPlay.setCardSize("orig");
				completeQuest(selectedCards, 'cart' + cart.id);
				questClicked.selected = false;
				resetAllSelectedCards(player);
			}
			else {
				return;
			}
		}
		else {
			alert(cart.name + " does not contain the necessary items for this quest!")
			return;
		}
		play("questComplete");
	}

	setCartActiveStatus = function(id) {
		if(id != $scope.activeCartId) {
			$scope.prevActiveCartId = $scope.activeCartId;
		}
		//then set active cart id
		$scope.activeCartId = id;
	}

	$scope.userClickedCartItem = function(id, i) {
		if(!$scope.isActive){return;}
		setCartActiveStatus(id);
		var game = $scope.game;
		var player = $scope.activePlayer;
		var card = player.carts[id].cards.playingCards[i];
		var cart = player.carts[id];
		
		card.selected = !card.selected;
		card.borderColor = cardColor(card);
		cartCardChecked(card);
		resetPlayerCardsSelected(player);
		resetCartCardsSelected(player, id);
		
		cart.cardSumSelected = getSelectedCardSum(cart.cards, true);
		play("button");
	}

	var cartCardChecked = function(card) {
		if(card.selected) {
			card.image = card.imageChecked;
		}
		else {	
			card.image = card.imageSmall;
		}
	}	


	$scope.userClickedItemImage = function(id) {
		if(!$scope.isActive){return;}
		var game = $scope.game;
		var player = $scope.activePlayer;
		var card = player.cards.playingCards[id];
		resetCartCardsSelected(player, -1);
		card.selected = !card.selected;
		card.borderColor = cardColor(card);	
		playerCardChecked(card);
		player.cardSumSelected = getSelectedCardSum(player.cards, true);
		$scope.selectedItemsCount = getSelectedCardcount(player.cards);
		updatePurchaseText(player.cardSumSelected);
		//updateLog($scope.blankText);
		play("button");
	}

	var playerCardChecked = function(card) {
		if(card.selected) {
			card.image = card.imageChecked;
		}
		else {	
			card.image = card.imageOrig;
		}
	}	

	updatePurchaseText = function(playerCardSumSelected){
		var game = $scope.game;
		var player = $scope.activePlayer;
		
		if(playerCardSumSelected > 0) {
			if(player.nextCartId !=4) {//no more carts to buy!
				player.carts[player.nextCartId].purchaseWith = cardPurchaseWithText(playerCardSumSelected, player.carts[player.nextCartId].itemCost) ;
			}
		}
		if(!player.carts[0].active) {
			player.carts[0].purchaseWith = 'items' ;	
			}
		
	}

	cardPurchaseWithText = function(cardSumSelected, itemCost) {
		if (cardSumSelected >= itemCost) {
			return 'items';	
			}
		else	{
			return 'gold';
		}
	}	

	$scope.userClickedCartImage = function(id) {
		if(!$scope.isActive){return;}
		var player = $scope.activePlayer;
		
		//deselect all items in cart if cart selected
		for (var j = 0; j < player.carts[id].cards.playingCards.length; ++j)  {
			$scope.userClickedCartItem(id, j);
		}
	}


	updateMarketItemPoints = function(value) {
		$scope.sumMarketValueSelected += value;
		
		if(value > 0) {
			$scope.selectedMarketTradeCount++;
		}
		else {
			$scope.selectedMarketTradeCount--;
		}
		
	}


	//update game from DATA response
	updatePlayerCarts = function(playerCart, dataCart) {
			playerCart.active = dataCart.purchased;
			playerCart.destroyed = dataCart.destroyed;
			if(playerCart.active) {
				playerCart.image = playerCart.imagePurchased;
				for (var i = 0; i < dataCart.inCart.length; ++i) {   
					updatePlayerCartItems(playerCart, dataCart.inCart[i]);	
				}
			}
			//playerCart.cards.setCardSize("small");

	}
		
	updatePlayerCartItems = function(playerCart, number) {
		for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
			var card = game.itemHolders.playingCards[i];
			card.setCardSize("small");
				if(card.number === number) {
					playerCart.cards.addCardc(card);
					break;
			}
		}
		//playerCart.cards.setCardSize("small");
	}

	dealNumberToPlayer = function(player, number) {
		var game = $scope.game;
		for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
			var card = game.itemHolders.playingCards[i];
			card.setCardSize("orig");
				if(card.number === number) {
					player.cards.addCardc(card);
					break;
			}
		}
		//updateLog($scope.blankText);
		//player.cards.setCardSize("orig");
	}
		
	updateDiscardPile = function(number) {
		var game = $scope.game;
		for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
			var card = game.itemHolders.playingCards[i];
			card.setCardSize("large");
				if(card.number === number) {
					$scope.lastDiscard = card;				
					break;
			}
		}
		//$scope.lastDiscard.setCardSize("large");	
		//updateLog($scope.blankText);
	}


	dealNumberToMarket = function(marketDeck, number) {
		var game = $scope.game;
		//var text = "";
		for (var i = 0; i < game.itemMarketHolders.playingCards.length; ++i)  {
			var card = game.itemMarketHolders.playingCards[i];
			card.setCardSize("orig");
				if(card.number === number) {
					marketDeck.playingCards.push(card);
					break;
				}
		}
		//updateLog(text);
	}

	//	'eventBarbarianAttack',6,image+"BarbarianAttack",this);
	//	'eventBrokenItems',7,image+"BrokenItems",this);
	//	'eventCastleTaxation',8,image+"CastleTaxation",this);
	//	'eventGolbinRaid',9,image+"GolbinRaid",this);
	//	'eventKingsFeast',10,image+"KingsFeast",this);	
	//	'eventMarketShortage',11,image+"MarketShortage",this);	
	//	'eventMarketSurplus',12,image+"MarketSurplus",this);	
	//	'eventOrcsAttack',13,image+"OrcsAttack",this);	
	//	'eventSandStorm',14,image+"SandStorm",this);	
	//	'eventThrownInTheDungeon',15,image+"ThrownInTheDungeon",this);	
	//	'eventTreasure',16,image+"Treasure",this);	
	//	'eventVikingParade',17,image+"VikingParade",this);	

	getEvent = function (questCardInPlay) {
		switch (questCardInPlay.type)
		{
				case 6:
					break;
				case 7:
					break;
				case 8:
					break;
				case 9:
					break;
				case 10:
					break;
				case 11:
					break;
				case 12:
					break;
				case 13:
					break;
				case 14:
					break;
				case 15:
					break;
				case 16:
					break;
				case 17:
					break;
				case 18:
					break;
				case 19:
					break;
				default:
					'';
		}
		return event;
	}




	dealQuestsCompleted = function(questsCompleted, items) {
		var game = $scope.game;
		//var text = "";
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
		//updateLog(text);
		
	}



	dealQuestCard = function(questsInPlay, items, level, type) {
		var game = $scope.game;
		//var text = "";
		var	itemString = "";
		for (var i = 0; i < items.length; ++i)  {
			itemString += items[i];
		}
		if(level < 4) {
			for (var i = 0; i < game.quests.playingCards.length; ++i)  {
			var card = game.quests.playingCards[i];
				if(card.questMatchId=== itemString) {
					questsInPlay.playingCards.push(card);
					break;
				}	
			}
			//var typeMatch = getEvent(type);
	//		questString += itemString;
	//		questString += ".jpg";
		}
		else {
			for (var i = 0; i < game.quests.playingCards.length; ++i)  {
			var card = game.quests.playingCards[i];
				if(card.nameId=== type) {
					questsInPlay.playingCards.push(card);
					break;
				}	
			}

		//questString = $scope.events[type].image;
			//$scope.activeEvent = $scope.events[type].displayMode;
		}


		
		if(level === 4) {
			//prepareEventForPlayer(card);
		}
		//updateLog(text);
	}

	getSelectedCardName = function(cardNumber) {
		var name = "";
		switch (cardNumber) {
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

	//returns first selected card in deck
	getSelectedCard = function(deck){
		for (var i = 0; i < deck.playingCards.length; ++i)  {
			var card = deck.playingCards[i];
			if(card.selected) {
				break;
			}
			continue;
		}
		return card.number;
	}

	//returns card numbers appended to each other for deck.  ex. 1224
	getSelectedCards = function(deck, selectedCardsOnly){
		var selectedCards = "";
		var cardNumber = "";
		for (var i = 0; i < deck.playingCards.length; ++i)  {
			var card = deck.playingCards[i];
			if(selectedCardsOnly){
				if(card.selected) {
					cardNumber = card.number;
					if(card.number===10) {
						cardNumber = 0;
					}
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
	getSelectedCardcount = function(deck){
		var selectedCardCount = 0;
		for (var i = 0; i < deck.playingCards.length; ++i)  {
			var card = deck.playingCards[i];
			if(card.selected) {
				selectedCardCount++;
			}
			continue;
		}
		return selectedCardCount;

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

		



	$scope.moveItemsToCart = function(id ) {
		if(!$scope.isActive){return;}
		//check if one to one or many to many
		setCartActiveStatus(id);
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var total = player.cardSumSelected;
		var selectedCards = getSelectedCards(player.cards, true);
		var selectedCartCards = getSelectedCards(player.carts[id].cards, true);
		var selectedCardCount = getSelectedCardcount(player.cards);
		var selectedCartCount = getSelectedCardcount(player.carts[id].cards);
		//$scope.activeCartId = id;
		var cart = player.carts[id];
		
		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	
		
		if($scope.prevActiveCartId >= 0) {
			$scope.selectedCartItems = getSelectedCards(player.carts[$scope.prevActiveCartId].cards, true);
		}
		
		//if cart cards are selected, move between carts else its player items to cart
		//these are in the scope variable as the new cart they select is selectedCartCount
		if($scope.selectedCartItemsCount > 0) {
			moveItemsBetweenCarts($scope.prevActiveCartId, id, $scope.selectedCartItems );
			return;
		}

		if(selectedCardCount === 0){
				alert('Select some items to move to cart.');
				return;
		}
		
		if($scope.selectedCartItemsCount > cart.size - cart.cards.playingCards.length){
			alert('Cannot move that many items into the cart.');
			return;
		}
		
		//text = "moved " + logSelectedCards(selectedCards) + " from hand to " + 'cart'+id + ".";
		//when moved from player to cart
		move(selectedCards, 'hand','cart'+id)
			
		cart.cards.setCardSize("small");
		resetAllSelectedCards(player);
		//updateLog(text);
		play("swords");
		//checkIfQuestIsReady();
	}

	moveItemsBetweenCarts = function(prevId, id, selectedCartItems ) {
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var cart = player.carts[id];
		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	
		
		if($scope.selectedCartItemsCount === 0){
			alert('Select items to move between cart.');
			return;
		}	
		
		if($scope.selectedCartItemsCount > cart.size - cart.cards.playingCards.length){
			alert('Cannot move that many items into the cart.');
			return;
		}
		
		//move cart items to cart
		//text = "moved " + logSelectedCards(selectedCartItems) + "from " + 'cart'+prevId + " to " + 'cart'+id + ".";
		move(selectedCartItems, 'cart'+prevId, 'cart'+id )
		
		cart.cards.setCardSize("small");
		resetAllSelectedCards(player);
		//checkIfQuestIsReady();
		

	}  

	$scope.playerCartFish = function (id) {
		if(!$scope.isActive){return;}
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var cart = player.carts[id];

		//if you have actions, discard selected cards	
		//var  selectedCount = 0;
		//var  cardCount = 0;

		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	
		
		if($scope.selectedCartItemsCount != 1) {
			alert("You must select one card when fishing for a new one!");
			return;
		}
		
		//if cart cards are selected, move between carts else its player items to cart
		if($scope.selectedCartItemsCount > 0) {
			//var cart = player.carts[id];
			
			var cardNumber = getSelectedCard(cart.cards);
			//text = "fished for a card.  Discarded a " + cardNumber + ".";
			
			var r =  confirm("Discard the " + getSelectedCardName(cardNumber) + "? Fish for a new card?");
			if(r===true) {
				fish(cardNumber, 'cart' + cart.id);
			}
			else {
				return;
			}

			//updateLog(text);

			resetCartCardsSelected(player,-1);
			play("fish");
			return;
		}
	}

	$scope.playerFish = function (id) {
		if(!$scope.isActive){return;}
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var selectedCardCount = getSelectedCardcount(player.cards);

		if(player.actionsRemaining === 0)	{
			alert("You have no actions.")
			return;
		}	
		
		if(selectedCardCount != 1) {
			alert("You must select one card when fishing for a new one!")
			return;
		}

		//returns card selected
		var cardNumber = getSelectedCard(player.cards);

		//text = "fished for a card.  Discarded a " + cardNumber + ".";
		//call backend fish

		var r =  confirm("Discard the " + getSelectedCardName(cardNumber) + "? Fish for a new card?");
		if(r===true) {
			fish(cardNumber, 'hand');
		}
		else {
			return;
		}


		resetAllSelectedCards(player);
		play("fish");
		//updateLog(text);
	}

	$scope.playerDiscardFromCart = function (id) {
		if(!$scope.isActive){return;}
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var cart = player.carts[id];
		var selectedCards = getSelectedCards(cart.cards, true);

		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	

		if(getSelectedCardcount(cart.cards) === 0) {
			alert('Select some cart items to discard.');
			return;
		}
		
		//if cart cards are selected, move between carts else its player items to cart
		if($scope.selectedCartItemsCount > 0) {
			//text = "discarded cards " + logSelectedCards(selectedCards) + " from " + 'cart'+id + ".";

			var r =  confirm("Are you sure you want discard?");
			if(r===true) {
				discard(selectedCards, 'cart'+id)
			}
			else {
				return;
			}

			//updateLog(text);
			resetCartCardsSelected(player,-1);
			play("trash");
			return;
		}
	}

	$scope.playerDiscard = function () {
		if(!$scope.isActive){return;}
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var selectedCardCount = getSelectedCardcount(player.cards);
		var selectedCards = getSelectedCards(player.cards, true);

		//if you have actions, discard selected cards, if not but have too many cards, discard anyway	
		var  cardCount = 0;

		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	
		
		if(selectedCardCount === 0) {
			alert('Select some items to discard.');
			return;
		}
		
		//actually did a discard
		//text = "discarded card(s) " + logSelectedCards(selectedCards) + " from hand.";
		var r =  confirm("Are you sure you want discard?");
		if(r===true) {
			discard(selectedCards, 'hand');
		}
		else {
			return;
		}

		resetAllSelectedCards(player);
		//updateLog(text);
		play("trash");

	}

		
	$scope.playerBuyCart	= function(cartId) {
		if(!$scope.isActive){return;}
		//var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var total = player.cardSumSelected;
		var selectedCards = getSelectedCards(player.cards, true);
		var selectedCardCount = getSelectedCardcount(player.cards);
		var purchasedStatus = false;
		var purchaseType = null;
		var cart = player.carts[cartId];
		
		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	
			
		if(cart.goldCost===0) {
			if(total < cart.itemCost) {
				alert(cart.name + " must be repurchased with Items totating 5+ points.  Select additional items to trade for cart.");
				return;
			}
			return;
		}
			
			if(total < cart.itemCost) {
				if(player.gold < cart.goldCost) {
				alert("Select some items or get some gold!");
				return;
				}	
			}
			
			if(total >= cart.itemCost) {
				var r = confirm("Confirm purchase with items!");
					if (r === true) {
						//text = "bought " + "cart" + cartId + " with items " + logSelectedCards(selectedCards) + ".";
						buyCart('cart'+cartId, 0, selectedCards);
						purchasedStatus = true;
						
					}
					else {
						purchasedStatus = false;
					}
			}
			else
			{
				if(player.gold >= player.carts[cartId].goldCost) {
				var r = confirm("Confirm purchase with gold!");
					if (r == true) {
						//text = "bought " + "cart" + cartId + " with " + player.carts[cartId].goldCost + " gold.";
						buyCart('cart'+cartId, 1, "");
						purchasedStatus = true;
					}
					else {
						purchasedStatus = false;
					}
				}
			}

			
			if(purchasedStatus) {
				player.nextCartId ++;
				player.nextCartName = nextCartName(cartId);
			}
			resetAllSelectedCards(player);

			if(cartId===1) {
				var card = game.questsInPlay.playingCards[game.questsInPlay.playingCards.length-1];
				var questItems =  new Array(card.item1, card.item2, card.item3, card.item4, card.item5);
				questItems.join(", ");
				//text = "New Quest! - items(" + questItems + ") VP: " + card.vp + ".  Battle: " + card.name;
			}

			//updateLog(text);
			play("buyCart");
		}
		
	$scope.playerBuyAction = function() {
		if(!$scope.isActive){return;}
		var player = $scope.activePlayer;
		//var text = "";
		if(player.gold >= 2) {
			var r =  confirm("This will cost you 2 gold!  Confirm?");
			if(r===true) {
				buyAction();
			}
			else {
				return;
			}
			
			//text = "Bouught one Action for 2 gold.";
		}
		else {
			alert("Need more gold!");
			return;
		}
		
		//updateLog(text);
		play("market");
	}

	$scope.playerPass = function() {
		if(!$scope.isActive){return;}
		//make sure you discard down to max cards or you can't pass
		var game = $scope.game;
		var player = $scope.activePlayer;
		var discardSelectedCards = getSelectedCards(player.cards, true);
		var selectedCardCount = getSelectedCardcount(player.cards);
		//var text = "";
		var r = false;

		if(player.actionsRemaining > 0)	{
			var r = confirm("You are trying to pass with remaining actions - Continue?");
			if (r === true) {
				//text += " passed with " + player.actionsRemaining +  " remaining actions.";
				discardSelectedCards = "";
			}
			else {
				return;
			}
		}
		else if(player.actionsRemaining === 0)	{
			if(player.cards.playingCards.length - selectedCardCount > player.maxHand) {	
				alert("Too many cards, select cards to discard and pass.");
				return;
			}
			
			if(player.actionsRemaining === 0 && (player.cards.playingCards.length > player.maxHand))	{
				if(player.cards.playingCards.length - selectedCardCount < player.maxHand) {	
					alert("You have no actions remaining.  Only select card(s) to discard to get back to max hand size of " + player.maxHand + ".");
					return;
				}
			}

			
			if((player.cards.playingCards.length <= player.maxHand) && selectedCardCount > 0) {
				//alert("You can only discard when you have actions remaining or need to remove cards to max hand size.");
				discardSelectedCards = "";
			}
			
	//		text = "passed";
	//		if (discardSelectedCards != "") {
	//			text += " and discarded cards " + logSelectedCards(discardSelectedCards) + ".";
	//		}
	//		else {
	//			text += ".";
	//		}
		}
		
		
		pass(discardSelectedCards);
		//updateLog(text);
		
		var card = game.marketDeck.playingCards[game.marketDeck.playingCards.length-1];
		text = "New Market Item! - (" + card.number + ")";


		$scope.selectedMarketTradeCount = 0;
		$scope.sumMarketValueSelected = 0;
		resetAllSelectedCards(player);
		
		//wipe out any potential market trades in progress
		game.marketDeckInTrade = new cardSet();
	//	updateLog(text);
		play("pass");

	}

	$scope.playerMarketTrade = function() {
		if(!$scope.isActive){return;}
		//check if one to one or many to many
		var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var selectedItemCards = getSelectedCards(player.cards, true);
		var selectedMarketCards = getSelectedCards(game.marketDeckInTrade, true);
		var selectedCardCount = getSelectedCardcount(player.cards);
		$scope.selectedItemsCount = selectedCardCount;
		
		if(player.actionsRemaining === 0)	{
			alert("You have no actions.");
			return;
		}	
		
		if(selectedCardCount === 0){
			alert('Select items to trade.');
			return;
		}

		if($scope.selectedMarketTradeCount === 0){
			alert('Select market items to trade.');
			return;
		}

		if($scope.selectedItemsCount > 1 && $scope.selectedMarketTradeCount > 1){
			alert('Cannot do many to many trade.  De-select either your items or market items.');
			return;
		}
		
		if($scope.selectedItemsCount === 1 && $scope.selectedMarketTradeCount === 1){
			alert('Cannot do single item trade.  Select more items.');
			return;
		}
		if($scope.sumMarketValueSelected != $scope.activePlayer.cardSumSelected) {
			alert('Sum of items selected must be equal.  Your Items selected: ' + $scope.activePlayer.cardSumSelected + ' Market Items selected: ' + $scope.sumMarketValueSelected);
			return;
		}
		
		text = "Market trade with " + logSelectedCards(selectedItemCards) + ' for ' + logSelectedCards(selectedMarketCards);
		
		//move player items to market
		
			var r =  confirm(text + "?");
			if(r===true) {
				marketTrade(selectedItemCards, selectedMarketCards);
			}
			else {
				return;
			}

		

		//move market items to player
		$scope.selectedMarketTradeCount = 0;
		$scope.sumMarketValueSelected = 0;
		
		game.marketDeckInTrade = new cardSet();

		resetPlayerCardsSelected(player);
		setMarketCounts();
		//updateLog(text);
		play("market");
	}
		



	setMarketCounts = function() {
		/*this function will:
		go through all cards in market card stack.
		add all $scope.game.market.playingCards[j-1].number and .count
		this array is what is used to show the market on the screen
		*/	
		var cardCount =0;
		var marketLength = $scope.game.marketDeck.playingCards.length;
		for (var j=1; j<11; j++) {
			cardCount = 0;
			for (var i = 0; i < marketLength; ++i) {
				var marketCard = $scope.game.marketDeck.playingCards[i];
				if(marketCard===null)
				{continue;}
				else {
					if(marketCard.number === j) {
						cardCount++
					}
				}
			}
			//update the item card and the count
			$scope.game.itemMarketHolders.playingCards[j-1].count = cardCount;
			$scope.game.itemMarketHolders.playingCards[j-1].setCountImage(cardCount);
		}

	}

	prepareEventForPlayer = function(questCardinplay) {	

		var player = $scope.activePlayer;
		if(player===null) {
			return;
		}
		if(questCardinplay.level==='4') {
			//questCardinplay.cardImage.height = "350";
			questCardinplay.setCardSize("large");
		}
		var cart = player.carts[0];
		
		switch (questCardinplay.name)
		{
				case 'eventOrcsAttack':
					//set variable for items in cart[0]
					$scope.wheelbarrowCardSum = getSelectedCardSum(cart.cards, false);
					if (total < 5) {
						//discard all items from cart to hand
						var cardsToMoveBackToHand = getSelectedCards(cart.cards,false);
						//fix event
						//cartDestroyed('cart0');
						move(cardsToMoveBackToHand, 'cart0', 'hand');
							}
						
						
					
					break;
				case 'eventBarbarianAttack':
					break;
				case 'eventBrokenItems':
					break;
				case 'eventCastleTaxation':
					break;
				case 'eventGolbinRaid':
					break;
				case 'eventKingsFeast':
					break;
				case 'eventMarketShortage':
					break;
				case 'eventMarketSurplus':
					break;
				case 'eventSandStorm':
					break;
				case 'eventHailStorm':
					break;
				case 'eventHiddenRoom':
					break;
				case 'eventThrownInTheDungeon':
					break;
				case 'eventTreasure':
					break;
				case 'eventVikingParade':
					break;
				default:
					resetDisplayMode('game');
		}
		
		$scope.displayMode = $scope.activeEvent;

	}



	resetDisplayMode = function(mode) {
		$scope.displayMode = mode;
		switch(mode) {
			case "game":
				$scope.displayModeName = " - Your Turn";
				break;
			case "gameSpectator":
				$scope.displayModeName = " - Game Spectating";
				break;
			case "gameover":
				$scope.displayModeName = "Game Over";
				break;
			default:
				$scope.displayModeName = "";		
				
		}
	}

	$scope.playerCompleteEvent = function(id) {
		if(!$scope.isActive){return;}
		var cardSelectedCount = $scope.selectedItemsCount + $scope.selectedCartItemsCount;
		var game = $scope.game;
		var player = $scope.activePlayer;
		var playerCardCount = player.cards.playingCards.length;
		var playerCardsSum = getSelectedCardSum(player.cards, false);
		var playerCardsSumSelected = getSelectedCardSum(player.cards, true);
		var questCardinplay = game.questsInPlay.playingCards[id];
		var event = $scope.activeEvent;


			switch (event) {
				case 'eventOrcsAttack':
				if(id==='Y') {
					//discard selected card
					if(playerCardsSumSelected < 5){
							alert("You do not have enough items selected.");
							return;
						}
					if($scope.selectedItemsCount > 0 && playerCardsSumSelected >= 5) {			
						$scope.playerDiscard();
						$scope.eventActionsRemaining=0;
					}					
					player.carts[0].active=true;
					player.carts[0].image = player.carts[0].imagePurchased;

				}
				if(id==='N') {
					//do nothing, nothing was destroyed
					
					
				}
					break;
				case 'eventBarbarianAttack':
					break;
				case 'eventBrokenItems':
					//discard with no actions from hand or cart
					
					if(cardSelectedCount > 1) {
						alert("You may only select one item at a time to replace.");
						return;
					}

					if(cardSelectedCount > 0 && $scope.selectedItemsCount > 0) {			
						$scope.playerDiscard();
					}
					else if(cardSelectedCount > 0 && $scope.selectedCartItemsCount > 0) {			
						$scope.playerDiscardFromCart(id);
					}
					
					for (var j = 0; j < cardSelectedCount; ++j)  {
						//dealCardToPlayer(player, game.itemDeck);
						$scope.eventActionsRemaining--;					
					}

					break;

				case 'eventCastleTaxation':
					//discard with no actions from hand only
					if(id==="cards") {
						if(playerCardCount< 2){
							alert("You do not have enough items, pay taxation with gold.");
							return;
						}
						else if(cardSelectedCount != 2) {
							alert("You must select two items for taxation.");
							return;
						}
					}
					if(id==="gold") {
						if(player.gold > 0) {
							payGold(player, 1);
						}
						else{
							alert("You do not have enough gold for taxation, you must lose items.");
							return;
						}
					}
					

					if(cardSelectedCount > 0) {			
						$scope.playerDiscard(actionCost);
						$scope.eventActionsRemaining=1;
					}
					break;
			

				case 'eventGolbinRaid':
					break;
				case 'eventKingsFeast':
					break;
				case 'eventMarketShortage':
					break;
				case 'eventMarketSurplus':
					break;
				case 'eventSandStorm':
					break;
				case 'eventHailStorm':
					break;
				case 'eventHiddenRoom':
					break;
				case 'eventThrownInTheDungeon':
					break;
				case 'eventTreasure':
					//give active player a gold
					getGold(player, 1);
					break;
				case 'eventVikingParade':
					break;
				default:
					resetDisplayMode('game');
			}
			
			$scope.playersCompletedEventCount++;

			}


	//sort player cart cards
	sortPlayerCartCards = function(cart) {
		cart.cards.playingCards.sort(function (a,b) {return a.number-b.number});
	}

	//sort player quests
	sortPlayerQuests = function() {
		$scope.activePlayer.questsCompleted.playingCards.sort(function (a,b) {return a.nameId-b.nameId});
	}

	resetPlayerCardsSelected =  function(player) {
		for (var i = 0; i < player.cards.playingCards.length; ++i)  {
			var card = player.cards.playingCards[i];
			if(card===undefined) {
				break;
			}
			card.selected = false;
			card.borderColor = cardColor(card);
			card.setCardSize("orig");
		}
		$scope.selectedItemsCount=0;
		player.cardSumSelected = 0;
	}

	resetCartCardsSelected =  function(player, id) {
		game = $scope.game;
		$scope.selectedCartItemsCount=0;

		setCartActiveStatus(id);
		//if id=cartid, reset the counts selected on that cart only
		for (var i = 0; i < player.carts.length; ++i)  {
			cart = player.carts[i];
			cart.selected = false;
			cart.cardSumSelected = 0;
			cart.borderColor = cartColor(cart);
			//dont reset the current cart cards
			if(cart.id === id) {
					for (var j = 0; j < player.carts[i].cards.playingCards.length; ++j)  {
						//$scope.userClickedCartItem(id, j);
						card = player.carts[id].cards.playingCards[j];
						if(card.selected) {
							cart.cardSumSelected+= card.number;
							card.borderColor = cardColor(card);
							$scope.selectedCartItemsCount++;
							card.setCardSize("checked");
						}
						else {
							card.borderColor = cardColor(card);
							card.setCardSize("small");
						}
					}
				}  
			else {
				for (var k = 0; k < player.carts[i].cards.playingCards.length; ++k)  {
					card = player.carts[i].cards.playingCards[k];
					card.selected = false;
					card.borderColor = cardColor(card);
					card.setCardSize("small");
				}
			}
		}
	}

	resetAllSelectedCards = function(player) {
		resetPlayerCardsSelected(player);
		resetCartCardsSelected(player,-1);
	}

	//sort player cards
	sortPlayerCards = function() {
		$scope.activePlayer.cards.playingCards.sort(function (a,b) {return a.number-b.number});
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

	//"eventLog": [{"event": "http://localhost:8080/game?action=discard&what=3&where=hand", "playerId": 0}]
	logEvent = function(eventsLog, playerName, logItem) {
		if(logItem!="") {
			var pattern = "/game?";
			var index = logItem.indexOf(pattern) + pattern.length;
					
			var array = logItem.substring(index).split("&");
			var logEntry = "";
			
			for (var i = 0; i < array.length; ++i) {   
				var logActions = array[i].split("=");
					for (var j = 0; j < logActions.length; ++j) {   
						switch(logActions[j]) {
							case "action":
								logEntry+="";
								break;
							case "discard":
								logEntry+=" discarded";
								break;
							case "fish":
								logEntry+=" fished " ;
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
							case "move":
								logEntry+=" moved " ;
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
							case "pass":
								logEntry+=" passed ";
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
								break;
							case "cart3":
								logEntry+=convertToName("cart3");
								break;
							case "buyCart":
								logEntry+= "bought ";
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
							case "marketTrade":
								logEntry+= " did a market trade from ";
								break;
							case "marketItems":
								logEntry+= " for market item(s) ";
								break;
							case "completeQuest":
								logEntry+= " completed a quest ";
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
			//logItem.substring(index)
			$scope.eventsLog.push(new EventsLog($scope.eventsLog.length, playerName, logEntry + '.'));
		}
	}


	var processGameStateCallback = function (data) {
		getObjectResults(data);
	};

	var processGameStateErrorCallback = function (returnVal) {
		$scope.loadingData=true;
		alert("Error Occurred: " + returnVal);
	};

	//updateLog = function(text) {
	//	if(text!="") {
	//		$scope.playerslog.push(new PlayersLog($scope.playerslog.length, text));
	//	}
	//}

		

	function getObjectResults(data) {
		var text = "";
		$scope.isActive = data.isActive;
		//$scope.numberOfPlayers = data.numPlayers;
		
		$scope.activePlayer = $scope.game.players[data.curPlayer];
		$scope.activePlayerId = data.curPlayer;
		$scope.activePlayer.active = data.isActive;
		var mode = function(isActive) {
			if(isActive) {
				return 'game';
			}
			else {
				//$scope.dots = "..";
				return 'gameSpectator';
			}
		}
		resetDisplayMode(mode(data.isActive));
		$scope.activePlayer.actionsRemaining = data.actionsRemaining;
		$scope.activePlayer.gold = data.gold;
		$scope.activePlayer.turns = data.turns;
		$scope.curPlayer = data.curPlayer;
		$scope.numPlayers = data.numPlayers;
		$scope.activePlayer.vp = data.points;
		$scope.activePlayer.maxHand = data.maxHand;
		$scope.itemsCountRemaining = data.itemsCountRemaining;
		$scope.questsCountRemaining = data.questsCountRemaining;
		$scope.discardsCount = data.discardsCount;
		$scope.eventsLog = [];
		$scope.game.players[$scope.activePlayerId].name = data.name;
		$scope.game.questsInPlay = new cardSet();
		$scope.game.marketDeck = new cardSet();
		
        for (var i = 0; i < data.market.length; ++i) {   
			dealNumberToMarket($scope.game.marketDeck, data.market[i]);	
		}
		setMarketCounts();

        for (var i = 0; i < data.questsInPlay.length; ++i) {   
			dealQuestCard($scope.game.questsInPlay, data.questsInPlay[i].items, data.questsInPlay[i].level, data.questsInPlay[i].type);
			var card = $scope.game.questsInPlay.playingCards[i];
			card.borderColor = cardColor(card);
		}
		$scope.game.questsInPlay.setCardSize("orig");
		
		for (var p = 0; p < data.numPlayers; ++p) {  

			$scope.game.players[p].cards = new cardSet();
			$scope.game.players[p].questsCompleted =  new cardSet();

			
			if($scope.myId === data.curPlayer && $scope.myId === p) {
				for (var i = 0; i < data.hand.length; ++i) {   
					dealNumberToPlayer($scope.activePlayer, data.hand[i]);	
				}
			}
			else {
				for (var i = 0; i < $scope.game.players[p].maxHand; ++i) {   
					dealNumberToPlayer($scope.game.players[p], -1);	
				}
			}
		
			//populate carts - once we have data.player[i] working, fix me
			if($scope.myId === data.curPlayer && $scope.myId === p) {
				for (var i = 0; i < data.carts.length; ++i) {   
					$scope.game.players[p].carts[i].cards =  new cardSet();
					updatePlayerCarts($scope.game.players[p].carts[i], data.carts[i]);	
				}
			}
			
			//populate quests completed - once we have data.player[i] working, fix me
			if($scope.myId === data.curPlayer && $scope.myId === p) {
				for (var q = 0; q < data.questsCompleted.length; ++q) {   
					dealQuestsCompleted($scope.game.players[p].questsCompleted, data.questsCompleted[q].items);
				}
				$scope.game.players[p].questsCompleted.setCardSize("small");
			}
		}
		
		if (data.lastDiscarded != null) {
			updateDiscardPile(data.lastDiscarded);	
		}
		

		for (var i = 0; i < data.eventLog.length; ++i) {   
			logEvent($scope.eventsLog, data.name, data.eventLog[i].event);
		}
		
		if(data.gameOver===true)	{
			gameEnd();
			return;
		}
		
		 $scope.loadingData=false;
		 checkIfQuestIsReady();
		 checkIfHaveCardsForQuest();
	}


function loadData(numPlayers, playerName) {
	$scope.loadingData=true;
    gameFactory.newGame(numPlayers, playerName,  processGameStateCallback, processGameStateErrorCallback);
}

function playerRefresh(playerId) {
	$scope.loadingData=true;
    gameFactory.refresh(playerId, processGameStateCallback, processGameStateErrorCallback);
}

function joinGame(playerId, playerName) {
	$scope.loadingData=true;
    gameFactory.joinGame(playerId, playerName, processGameStateCallback, processGameStateErrorCallback);
}

function pass(discard) {
	$scope.loadingData=true;
	$scope.dots = "..";
    gameFactory.pass(discard, processGameStateCallback, processGameStateErrorCallback);
}

function move(what, src, dst) {
	$scope.loadingData=true;
    gameFactory.move(what, src, dst, processGameStateCallback, processGameStateErrorCallback);
}

function fish(what, where) {
	$scope.loadingData=true;
	gameFactory.fish(what, where, processGameStateCallback, processGameStateErrorCallback);
}

function discard(what, where) {
	$scope.loadingData=true;
	gameFactory.discard(what, where, processGameStateCallback, processGameStateErrorCallback);
}

function buyCart(cart, goldFlag, items) {
	$scope.loadingData=true;
	gameFactory.buyCart(cart, goldFlag, items, processGameStateCallback, processGameStateErrorCallback);
}

function buyAction() {
	$scope.loadingData=true;
	gameFactory.buyAction(processGameStateCallback, processGameStateErrorCallback);
}

function marketTrade(handItems, marketItems) {
	$scope.loadingData=true;
	gameFactory.marketTrade(handItems, marketItems, processGameStateCallback, processGameStateErrorCallback);
}

function completeQuest(cartItems, cart) {
	$scope.loadingData=true;
	gameFactory.completeQuest(cartItems, cart, processGameStateCallback, processGameStateErrorCallback);
}

}]).directive('questcard', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'questcard.html?2'
    };
}).directive('marketcard', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'marketcard.html?2'
    };
}).directive('cart', function () {
    return {
        restrict: 'E',
        scope: {
            cart: '=info'
        },
        templateUrl: 'cart.html'
    }
});


/*
.directive('marketcardcount', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'marketcardcount.html?2'
    };
})
*/

/*
resetItemDeckAndMarket = function() {
	var game = $scope.game;
	var player = $scope.activePlayer;
	player.cards.truncate();
	
	for (var i = 0; i < game.marketDeck.playingCards.length; ++i)  {
				var card = game.marketDeck.playingCards[i];
				if (card === null) {
				continue;
				}
				discardCardFromMarket(card, game.discardDeck);
				game.marketDeck.playingCards[i] = null;
		}

	game.marketDeck.truncate();
	
	game.itemDeck = new cardSet();
    moveAllDiscardsToItemDeck(game.itemDeck, game.discardDeck);

	game.discardDeck = new cardSet();
	
	//remove the nulls first
	game.itemDeck.truncate();
	game.itemDeck.shuffleCards(10);
	
	//deal market start
	game.itemHolders = new cardSet();
	game.itemHolders.createBlankMarket();
	game.marketDeck = new cardSet();
	dealCardToMarket(game.marketDeck, game.itemDeck, game.marketStart);
	game.itemHolders.setCardSize("60","80");
	
	//now finish dealing cards to player
	//draw new cards up to max hand

	for (var j = 0; j < player.maxHand + 1; ++j) { 
			if(player.maxHand > player.cards.playingCards.length) {
				dealCardToPlayer(player, game.itemDeck);	
			}
			else {
			break;
			}
		}
	updateLog();
}
*/

/*
updateCartItemPoints = function(cart) {
	
	cart.cardSumSelected = 0;
	for (var i = 0; i < cart.cards.playingCards.length; ++i)  {
	var card = cart.cards.playingCards[i];
	if(card===undefined)
	{continue;}
	if(card.selected) {
		cart.cardSumSelected += card.number;
		}
	}

}
*/

/*
getPlayerCardSum = function(player, selectedCardsOnly) {
	var total = 0;
	for (var i = 0; i < player.cards.playingCards.length; ++i) {
		if(selectedCardsOnly){
			if(player.cards.playingCards[i].selected){
				total += player.cards.playingCards[i].number;				
			}
		}
		else {
			total += player.cards.playingCards[i].number;
		}

	}
	return total;
}
*/

/*
wheelbarrowCardSum = function(player) {
	if(player===null) {
		return 0;
	}
	var total = 0;
	for (var i = 0; i < player.carts[0].cards.playingCards.length; ++i) {
		total += player.carts[0].cards.playingCards[i].number;
	}
	$scope.wheelbarrowCardSum = total;
	return total;
}
*/
/*
calculatePlayerBonus = function(player){
	var bonus = 0;
	
	//loop through player completed quests
	//if sortOrder count = 3, they have a match set (sortOrder or name can be used for the 5 different wars you are collecting)
	//mark as !selected
	//then go through and mark selected as you try to find sets.
	//add VP+=3 when set is found
	//continue after finding a set of three with the same sortOrder/name
	//when loop through all 5, then loop again for a set of 1,2,3,4,5 that were not previously selected
	//add VP+=3
	
	
	
	player.bonus = bonus;
}	
*/

/*
activateNextPlayer = function(){
	var game = $scope.game;
//	if( $scope.activePlayer.id === game.numOpponents) {
	$scope.activePlayerId=0;
//		}
//	else {
//	$scope.activePlayerId++;
//	}
		
	$scope.activePlayer = $scope.game.players[$scope.activePlayerId];
	game.players[$scope.activePlayerId].actionsRemaining = game.startingActions;
	$scope.activePlayer.active = true;
	updateLog();
}
*/

/*
checkItemsRemaining = function() {
	if($scope.itemsCountRemaining===0) {
		return false;
	}
	else
	{return true;}
}
*/
/*	
updatePlayerItemPoints = function() {
	var player = $scope.activePlayer;
	player.cardSumSelected = 0;
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
	var card = player.cards.playingCards[i];
	if(card===undefined)
	{continue;}
	if(card.selected) {
		player.cardSumSelected += card.number;
		}
	}
}
*/


/*
}]).directive('quest', function () {
	return {
		restrict: 'E',
		scope: {
			quest: '=info'
		},
		templateUrl: 'quest.html?6'
	};
}).directive('player', function () {
    return {
        restrict: 'E',
        scope: {
            player: '=info'
        },
        templateUrl: 'player.html?6'
    };
}).directive('playerhand', function () {
    return {
        restrict: 'E',
        scope: {
            player: '=info'
        },
        templateUrl: 'playerHand.html?2'
    };
}).directive('card', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'card.html?2'
    };
}).directive('questcard', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'questcard.html?2'
    };
}).directive('marketcard', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'marketcard.html?2'
    };
}).directive('cart', function () {
    return {
        restrict: 'E',
        scope: {
            cart: '=info'
        },
        templateUrl: 'cart.html'
    }
});*/


/*
setPlayerHighScore = function() {
var total = 0;
var lastTotal = 0;
var lastGold = 0;
var lastNumberOfCards = 0;
var game = $scope.game;

for (var j = 0; j < game.players.length; ++j)  {
		var player = game.players[j];
		total = player.gold + player.bonus + player.vp;
		numOfCards = player.questsCompleted.playingCards.length;
		lastTotal = total;
		lastNumberOfCards = numOfCards;
		lastGold = player.gold;
		
		if(total > lastTotal) {
			player.winner = true;
			continue;
		}
		if(total < lastTotal) {
			player.winner = false;
			continue;
		}

		if(total === lastTotal) {  //tie, check who has lowest number of quests
				if(numOfCards < lastNumberOfCards) {
					player.winner = true;
					continue;
				}
			if(numOfCards > lastNumberOfCards) {
					player.winner = false;
					continue;
				}
			if(numOfCards === lastNumberOfCards) { //gold next tie breaker, most wins - or its a tie
				if(player.gold > lastGold) {
					player.winner = true;
					continue;
				}
				if(player.gold < lastGold){
					player.winner = false;
					continue;
				}
				if(player.gold === lastGold) {
					player.winner = true;
					continue;
				}
			}
		}
	
	}
}
*/


/*
checkIfAllPlayersFinishedEvent = function(questCardinplay, id) {
	//when all players have finished event and clicked playerCompleteEvent
	if ($scope.playersCompletedEventCount === $scope.numberOfPlayers) {
		$scope.playersCompletedEventCount = 0;
		$scope.eventActionsRemaining = 0;
		//discard quest
		game.questsInPlay.playingCards[id] = null;
		game.questsInPlay.truncate();
	
		//draw new one
		dealCardToQuests($scope.game.questsInPlay, $scope.game.quests);
		eventCycleToNextPlayer(game, questCardinplay);
	}
	else	{
		eventCycleToNextPlayer(game, questCardinplay);
	}
}

eventCycleToNextPlayer = function(game, questCardinplay) {
	$scope.activePlayer.active = false;
	$scope.activePlayerId=0;
	$scope.activePlayer = game.players[$scope.activePlayerId];
	$scope.activePlayer.active = true;
	prepareEventForPlayer(questCardinplay, $scope.activePlayer);	
}
*/