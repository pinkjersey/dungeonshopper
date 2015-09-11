
//'ngAnimate'
var Cart = function (id, size, active, goldCost, itemCost, name, imagePurchased, imageNotPurchased) {
    this.id = id;
	this.size = size;
    this.active = active;
	this.selected = false;
	this.width=70;
	this.height=100;
	this.name = name;
	this.purchaseWith = 'gold';
<<<<<<< HEAD
	this.image = image;
	this.imageNotPurchased = this.image + this.id + "_not_purchased.jpg";
=======
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
>>>>>>> origin/master
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


var Game = function(numOpponents) {

	//game setup variables count
	this.firstPlayer = 0;
	this.startingActions = 2;
	this.startingCards = 5;
	this.marketStart = 4;
	this.questStart = 4;
	
	this.numOpponents = numOpponents;

	//all the starter empty playingCards holders	
	this.cards = new cardSet();
	this.quests = new questSet();
	this.marketHolders = new cardSet();
	this.itemDeck = new cardSet();
	this.discardDeck = new cardSet();
	this.questsInPlay = new cardSet();
	this.marketDeck = new cardSet();
	this.marketDeckInTrade = new cardSet();

	//populated cardrs, marketholders and quests
	this.cards.create75Cards();
	this.marketHolders.createBlankMarket();
	this.quests.create75CardsQuestDeck();
//	this.quests.createQuestDeck(this.numOpponents + 1);

	this.players = [];
	
	//set initial size of the cards for the gui
	//their are times in the code that these are changed and reset
	this.cards.setCardSize("60","80");
	this.marketHolders.setCardSize("60","80");
	this.quests.setCardSize("auto","200");
	this.quests.origWidth=0;
	this.quests.origHeight=0;

//recently removed	
	//	this.anyActionsRemaining = true;
	//this.itemDeckStartCount = 75;

}

var Player = function (id, name) {
    this.id = id;
	this.name = name;
	this.turns = 0;
	this.active = false;
	this.cards = new cardSet();
	this.maxHand = 5;
    this.questsCompleted = new cardSet();
	this.gold = 10;
	this.vp = 0;
	this.bonus = 0;
	this.cardSumSelected = 0;
	this.actionsRemaining = 2;
	this.nextCartId = 1;
	this.nextCartName = 'Hand Cart';
	this.winner=false;
<<<<<<< HEAD
    this.carts = [new Cart(0, 3, 1, 0, 5,'Wheelbarrow','../images/shoppercarts_v3_'), 
		new Cart(1, 3, 0, 1, 10, 'Hand Cart', '../images/shoppercarts_v3_'), 
		new Cart(2, 4, 0, 2, 15, 'Horse Wagon','../images/shoppercarts_v3_'), 
		new Cart(3, 5, 0, 3, 20, 'War Wagon','../images/shoppercarts_v3_')];
=======
    this.carts = [new Cart(0, 3, 1, 0, 5,'Wheelbarrow','../images/shoppercarts_v3_0.jpg','../images/shoppercarts_v3_0_not_purchased.jpg'), 
				  new Cart(1, 3, 0, 1, 10, 'Hand Cart', '../images/shoppercarts_v3_1.jpg','../images/shoppercarts_v3_1_not_purchased.jpg'), 
				  new Cart(2, 4, 0, 2, 15, 'Horse Wagon','../images/shoppercarts_v3_2.jpg','../images/shoppercarts_v3_2_not_purchased.jpg'), 
			      new Cart(3, 5, 0, 3, 20, 'War Wagon','../images/shoppercarts_v3_3.jpg','../images/shoppercarts_v3_3_not_purchased.jpg')];
>>>>>>> origin/master
};



app.controller('dsCtrl', ['$scope', 'gameFactory', function ($scope, gameFactory) {
    $scope.displayMode = "nogame";
	$scope.p1Name = "Player 1";
	$scope.p2Name = "Player 2";
	$scope.p3Name = "Player 3";
	$scope.p4Name = "Player 4";

	$scope.activeEvent = null;
	
	
	var cardColor = function(card) {
		if(card.selected) {
		return 'red';
		}
		else {
		return 'black';
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

$scope.endGame = function() {
	$scope.displayMode = "gameover";
}

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

$scope.moveItemsToCart = function(id, actionCost) {
	//check if one to one or many to many
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];
	if(player.actionsRemaining === 0)	{
		alert("You have no actions.")
		return;
	}	
	
	//if cart cards are selected, move between carts else its player items to cart
	if($scope.selectedCartItemsCount > 0) {
		moveItemsBetweenCarts(id);
		return;
	}

	if($scope.selectedItemsCount === 0){
			alert('Select some items to move to cart.');
			return;
	}
	
	if($scope.selectedItemsCount > cart.size - cart.cards.playingCards.length){
		alert('Cannot move that many items into the cart.');
		return;
	}
	
	
	//move player items to market
	cartSelectedCards($scope.activePlayer, cart);
	
	//move market items to player
	$scope.selectedItemsCount = 0;

	player.actionsRemaining -= actionCost;
	
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];
		card.selected = false;
		card.borderColor = cardColor(card);
		}
		
	cart.cards.setCardSize("38","55");
	resetSelectedCards(player);
	updateCounts();
	
}

cartSelectedCards = function(player, cart){
			
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];
			if(card.selected) {
				//discard selected card(s)
				cart.cards.playingCards.push(card);
				player.cards.playingCards[i] = null;
			}
		}
		
		player.cards.truncate();		
//		truncatePlayerCards(player);

		for (var i = 0; i < cart.cards.playingCards.length; ++i)  {
			var card = cart.cards.playingCards[i];
				card.selected=false;
				card.borderColor = cartColor(cart);
		}
		updateCounts();
		$scope.activeCartWithItems = cart.id;
	}
	
moveItemsBetweenCarts = function(id, actionCost) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];
	if(player.actionsRemaining === 0)	{
		alert("You have no actions.")
		return;
	}	
	
	if($scope.selectedCartItemsCount === 0){
		alert('Select items to move between cart.');
		return;
	}	
	
	var cart1 = player.carts[$scope.activeCartWithItems];
	

	if($scope.selectedCartItemsCount > cart.size - cart.cards.playingCards.length){
		alert('Cannot move that many items into the cart.');
		return;
	}
	
	
	//move cart items to cart
	cartCardsBetweenCarts(cart1, cart);
	
	$scope.selectedItemsCount = 0;
	$scope.selectedCartItemsCount = 0;

	player.actionsRemaining -= actionCost;
	
	resetSelectedCards(player);
	updateCounts();
	

}  

cartCardsBetweenCarts = function(cart1, cart2){
	player = $scope.activePlayer;	
	
	for (var i = 0; i < cart1.cards.playingCards.length; ++i)  {
		var card = cart1.cards.playingCards[i];
			if(card.selected) {
				//discard selected card(s)
				cart2.cards.playingCards.push(card);
				cart1.cards.playingCards[i] = null;
				//cart1.cards.playingCards.shift();
			}
		}
			
		cart1.cards.truncate();		
		
	}	

$scope.userClickedMarketImage = function(i) {
	var game = $scope.game;
	var card = game.marketHolders.playingCards[i];
	card.selected = !card.selected;

	card.borderColor = 'black';
	card.count--;
	
	game.marketDeckInTrade.addCard(card.number, card.image, 1);
	game.marketDeckInTrade.setCardSize("60","80");
	updateMarketItemPoints(card.number);
	$scope.selectedMarketTradeCount++;
}

$scope.userClickedMarketTradeImage = function(i) {
	
	var game = $scope.game;
	var card = game.marketDeckInTrade.playingCards[i];
	var marketCard = game.marketHolders.playingCards[card.number-1];
	//increase the number above the market card holder
	marketCard.count++;
	
	marketCard.selected = !marketCard.selected;
	game.marketDeckInTrade.playingCards[i] = null;
	game.marketDeckInTrade.truncate();
	$scope.selectedMarketTradeCount--;
	updateMarketItemPoints(-card.number);

}

$scope.userClickedQuestImage = function(i) {
	var game = $scope.game;
	var questClicked = game.questsInPlay.playingCards[i];
	
	questClicked.selected = !questClicked.selected;
	$scope.questSelected=!$scope.questSelected;
	questClicked.borderColor = cardColor(questClicked);
	
	if(questClicked.selected){
		questClicked.cardImage.width = questClicked.cardImage.width * 2;
		questClicked.cardImage.height = questClicked.cardImage.height * 2;
	}
	else {
		questClicked.cardImage.width = game.quests.origWidth;
		questClicked.cardImage.height = game.quests.origHeight;
	}
		
	for (var j = 0; j < game.questsInPlay.playingCards.length; ++j)  {
		if(j===i){
			continue;
			}
		var card = game.questsInPlay.playingCards[j];
		card.selected = false;
		card.borderColor = cardColor(card);
		card.cardImage.width = game.quests.origWidth;
		card.cardImage.height = game.quests.origHeight;
	}
	
}

$scope.aQuestIsReady = function() {
	//go through eachquest
		//go through each cart that has 3 items or more
		//change size of quests that can be completed
	
	
}

$scope.playerCompleteQuest = function(id) {
		var game = $scope.game;
		var player = $scope.activePlayer;
		var questClicked = game.questsInPlay.playingCards[id];
		var questCanBeCompleted = false;

		if($scope.activeCartWithItems === -1)	{
			alert("Select a cart with items first.")
		}

		var cart = player.carts[$scope.activeCartWithItems];
		if(cart != null) {
			sortPlayerCartCards(cart);
		}

		if(!$scope.debug) {
			if($scope.selectedCartItemsCount < 3)	{
				alert("Select all items in cart/wagon first.")
			}
		}
		
		var items =  new Array(questClicked.item1, questClicked.item2, questClicked.item3, questClicked.item4, questClicked.item5);
		for(var j = 0; j < items.length; ++j) {
			if(items[j]===0) {
				break;
			}
			for (var k = 0; k < cart.cards.playingCards.length; ++k)  {
				card = cart.cards.playingCards[k];
				card.selected =true;

				if(card.number===items[j]){
					questCanBeCompleted = true;
					j++;
					continue;
				}
				else {
					questCanBeCompleted = false;
					break;
				}
			}
	
		}

		//fix me back after testing
		if($scope.debug) {
			questCanBeCompleted = true;
		}
		
		if (questCanBeCompleted === true) {
			var r =  confirm("Confirm purchase from " + cart.name +"?");
			if(r===true) {
				//check if player completed quest and move it to their completed quests
					player.questsCompleted.playingCards.push(questClicked);
					player.gold+=questClicked.gold;
					player.vp+=questClicked.vp;
	
					removeSelectedCartCards(cart, true);
					updateCounts();
					checkItemsRemaining();
					$scope.selectedCartItemsCount = 0;
					resetCartCardsSelected(player,-1);
					player.questsCompleted.setCardSize("auto","100");
//					player.questsCompleted.playingCards.shift();
					game.questsInPlay.playingCards[id] = null;
					game.questsInPlay.truncate();
					dealCardToQuests(game.questsInPlay, game.quests);
					sortPlayerQuests();
				}
		}
		else {
			alert(cart.name + " does not contain the necessary items for this quest!")
			return;
			
		}
		
		for (var j = 0; j < game.questsInPlay.playingCards.length; ++j)  {
			var card = game.questsInPlay.playingCards[j];
			card.selected = false;
			card.borderColor = cardColor(card);
		}
		
		//go through sets and get bonus points.
		//for each quest.sortorder set of three, is three points
		//for each quest.sortorder 1,2,3,4,5 is three points
		//cannot get both with same card.
		calculatePlayerBonus(player);

	}

	
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
	

$scope.userClickedCartItem = function(id, i) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var card = player.carts[id].cards.playingCards[i];
	card.selected = !card.selected;
	card.borderColor = cardColor(card);
	resetPlayerCardsSelected(player);
	resetCartCardsSelected(player, id);
	
	updateCartItemPoints(player.carts[id]);

	setActiveCartWithItems(id);
}

setActiveCartWithItems = function(cartid) {
	var game = $scope.game;
	if ($scope.selectedCartItemsCount > 0) {	
		$scope.activeCartWithItems = cartid;
	}
	else
	{
		$scope.activeCartWithItems = null;
	}
	
}

$scope.userClickedItemImage = function(id) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var card = player.cards.playingCards[id];
	
	resetCartCardsSelected(player, -1);
	card.selected = !card.selected;
	card.borderColor = cardColor(card);
	updatePlayerItemPoints();
	
	if(card.selected) {
		$scope.selectedItemsCount++;
		} 
		else {
		$scope.selectedItemsCount--;
	}
	
	updateCounts();
}

updatePurchaseText = function(){
	var game = $scope.game;
	var player = $scope.activePlayer;
	
	if($scope.selectedItemsCount > 0) {
		if(player.nextCartId !=4) {//no more carts to buy!
			player.carts[player.nextCartId].purchaseWith = cardPurchaseWithText(player.cardSumSelected, player.carts[player.nextCartId].itemCost) ;
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
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];
	
	//deselect all items in cart if cart selected
	for (var j = 0; j < player.carts[id].cards.playingCards.length; ++j)  {
		var card = player.carts[id].cards.playingCards[j];
		card.selected = !card.selected;
		card.borderColor = cardColor(card);
		
		if(card.selected) {
			$scope.selectedCartItemsCount++;
		} 
		else {
			$scope.selectedCartItemsCount--;
		}
		
	}

	//deselect all other cards except cart = id
	resetCartCardsSelected(player, id);

	resetPlayerCardsSelected(player);
	updateCartItemPoints(cart);
	setActiveCartWithItems(id);
}
	
$scope.noGame = function () {
	$scope.displayMode = "nogame";
}

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

function loadData(numPlayers) {
     gameFactory.newGame(numPlayers, newGameSuccessCallback, newGameErrorCallback);
}


var newGameSuccessCallback = function (data) {
	getObjectResults(data);
};

var newGameErrorCallback = function (returnVal) {
	alert(returnVal);
};

 function getObjectResults(data) {
       // var data = new Object();
		$scope.isActive = data.isActive;
		$scope.activePlayer.active = data.isActive;
		$scope.itemsCountRemaining = data.itemsCountRemaining;
		$scope.questsCountRemaining = data.questsCountRemaining;
		//$scope.activePlayerId = $scope.game.firstPlayer;	


        for (var i = 0; i < data.hand.length; ++i) {   
			dealNumberToPlayer($scope.game.players[$scope.activePlayerId], data.hand[i]);	
		}
        for (var i = 0; i < data.market.length; ++i) {   
			dealNumberToMarket($scope.game.marketDeck, data.market[i]);	
		}
        for (var i = 0; i < data.questsInPlay.length; ++i) {   
			dealQuestCard($scope.game.questsInPlay, data.questsInPlay[i].items);	
		}

	};

	$scope.joinGame = function(playerId) {
		
	}
	
dealNumberToPlayer = function(player, number) {
	var game = $scope.game;
	for (var i = 0; i < game.marketHolders.playingCards.length; ++i)  {
		var card = game.marketHolders.playingCards[i];
			if(card.number === number) {
				player.cards.playingCards.push(card);
		}
	}
	updateCounts();
}

dealNumberToMarket = function(marketDeck, number) {
	var game = $scope.game;
	for (var i = 0; i < game.marketHolders.playingCards.length; ++i)  {
		var card = game.marketHolders.playingCards[i];
			if(card.number === number) {
				marketDeck.playingCards.push(card);
		}
	}
	updateCounts();
}

dealQuestCard = function(questsInPlay, items) {
	var game = $scope.game;
	
	var itemString = "../images/shopping_card_master";
	for (var i = 0; i < items.length; ++i)  {
		itemString += items[i];
	}
	itemString += ".jpg";


	for (var i = 0; i < game.quests.playingCards.length; ++i)  {
		var card = game.quests.playingCards[i];
			if(card.image === itemString) {
				questsInPlay.playingCards.push(card);
				break;
		}
	}
	updateCounts();
}

	
$scope.newGame = function (p1Name, p2Name, p3Name, p4Name, numberOfPlayers) {
		
		
		$scope.p1Name = p1Name;	
		$scope.p2Name = p2Name;
		$scope.p3Name = p3Name;
		$scope.p4Name = p4Name;
		$scope.numberOfPlayers = Number(numberOfPlayers);
		$scope.activeEvent=null;
		$scope.playersCompletedEventCount = 0;
		$scope.itemCardBack = "../images/shoppingCardBack.jpg"
		$scope.vendorCardBack = "../images/vendorback.jpg"
<<<<<<< HEAD
=======
		$scope.eventActionsRemaining=0;
		$scope.debug = true;
		//gui variable to control item buttons
		$scope.selectedItemsCount = 0;
		//gui variable to control cart buttons
		$scope.selectedCartItemsCount = 0;
		//gui variable to control market buttons
		$scope.sumMarketValueSelected = 0;
		//gui variable to control cart buttons
		$scope.activeCartWithItems = -1;
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
		$scope.questSelected=false;
		$scope.isActive = false;
		
		$scope.game = new Game(numberOfPlayers-1);
        //$scope.game.cards.shuffleCards(10);
		$scope.game.itemDeck = $scope.game.cards;
		$scope.activePlayerId = $scope.game.firstPlayer;

>>>>>>> origin/master
		//create players
        for (var i = 0; i < numberOfPlayers; ++i) {   
			var pName = function(i) {
				if(i===0) {return $scope.p1Name;}
				if(i===1) {return $scope.p2Name;}
				if(i===2) {return $scope.p3Name;}
				if(i===3) {return $scope.p4Name;}
			}
            $scope.game.players.push(new Player(i, pName(i)));

        }

		$scope.activePlayer = $scope.game.players[$scope.activePlayerId];			
		loadData(numberOfPlayers);


		
/*
		// deal five cards to players
		for (var i = 0; i < $scope.game.startingCards; ++i) { 
			for (var j = 0; j < $scope.game.numOpponents + 1; ++j) { 
				dealCardToPlayer($scope.game.players[j], $scope.game.itemDeck);	
			
			}
		}
*/
/*      
		//figure out who is going first by total item card points	
		var playerWithMostPoints = 0;
		var lastPlayertotalNumbers = 0;
		var totalNumbers = 0;
		//set the first player based on hight card values
		for (var j = 0; j < (numberOfPlayers) ; ++j) { // for each player
			for (var c = 0; c < ($scope.game.players[j].cards.playingCards.length); ++c) { // for each card
			totalNumbers += parseInt($scope.game.players[j].cards.playingCards[c].number);  //get total points

			}
			
			if(totalNumbers > lastPlayertotalNumbers)
			{
				playerWithMostPoints = j;
				lastPlayertotalNumbers = totalNumbers;
			}
			$scope.game.firstPlayer = playerWithMostPoints;
			totalNumbers=0;
		}
*/		
/*		
		//hand out extra card to non first player
		for (var x = 0; x < (numberOfPlayers) ; ++x) { 
            if (x === $scope.game.firstPlayer) {
                continue;
            }
			dealCardToPlayer($scope.game.players[x], $scope.game.itemDeck);
        }  
		
		//deal quests start
		for (var q = 0; q < ($scope.game.questStart) ; ++q) { 
			dealCardToQuests($scope.game.questsInPlay, $scope.game.quests);
		}

		$scope.game.quests.origWidth = $scope.game.questsInPlay.playingCards[0].cardImage.width;
		$scope.game.quests.origHeight = $scope.game.questsInPlay.playingCards[0].cardImage.height;

		
		//deal market start
		dealCardToMarket($scope.game.marketDeck, $scope.game.itemDeck, $scope.game.marketStart);
*/
		
//		$scope.activePlayer.active = true;
//		updateCounts();
		//$scope.game.anyActionsRemaining = true;
		$scope.displayMode = "game";
		
	

}
updateMarketItemPoints = function(value) {
	var game = $scope.game;
	$scope.sumMarketValueSelected += value;
}

checkItemsRemaining = function() {
	if($scope.itemsCountRemaining===0) {
		return false;
	}
	else
	{return true;}
}

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

updateCounts = function() {
	
	var game = $scope.game;
	var player = $scope.activePlayer;
	var itemDeck = game.itemDeck;

	if(player != null) {
	setMarketCounts();
	player.cards.truncate();
	itemDeck.truncate();
	updatePlayerItemPoints();
	
	for(var i=0; i < player.carts.length; ++i) {
		var cart = player.carts[i];
		if(cart != null) {
			sortPlayerCartCards(cart);
		}
	}
	sortPlayerCards();

	getItemsCountRemaining();
	getQuestsCountRemaining();
	getDiscardsCount();
	updatePurchaseText();
	//checkActionsRemaining();
	setPlayerHighScore();
	checkEndGameStatus();
	}
	
}	
	
/*this function will:
	go through all cards in market card stack.
	add all $scope.game.market.playingCards[j-1].number and .count
	this array is what is used to show the market on the screen
*/	
setMarketCounts = function() {
	var cardCount =0;
	var marketLength = $scope.game.marketDeck.playingCards.length;
	for (var j=1; j<11; j++) {
		cardCount = 0;
        for (var i = 0; i < marketLength; ++i) {
            var marketCard = $scope.game.marketDeck.playingCards[i];
			if(marketCard===null)
			{continue;}
				if(marketCard.number === j) {
					cardCount++
				}
			}
			//update the item card and the count
			$scope.game.marketHolders.playingCards[j-1].count = cardCount;
	}

}

<<<<<<< HEAD
playerCardSum = function(player) {
	var total = 0;
	for (var i = 0; i < player.cards.playingCards.length; ++i) {
		total += player.cards.playingCards[i].number;
	}
	return total;
}

wheelbarrowCardSum = function() {
	var total = 0;
	var game = $scope.game;
	var player = game.activePlayer;
	for (var i = 0; i < player.carts[0].cards.playingCards.length; ++i) {
		total += player.carts[0].cards.playingCards[i].number;
	}
	$scope.wheelbarrowCardSum = total;
	return total;
}

//deal cards for initial game quests
dealCardToQuests = function(questsInPlay, questSet){
	var game = $scope.game;
	var player = game.activePlayer;
=======
playerCardSum = function(player, selectedCardsOnly) {
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



//deal cards for initial game quests
dealCardToQuests = function(questsInPlay, questSet){
	var game = $scope.game;
	var player = $scope.activePlayer;
>>>>>>> origin/master
	for (var i = 0; i < questSet.playingCards.length; ++i) { // deal numberOfCards cards
		var questCardinplay = questSet.playingCards[i]; // get a reference to the first card on the deck
				if (questCardinplay === null||questCardinplay===undefined) {
					break; //no more quests to deal
				}
			questsInPlay.playingCards.push(questCardinplay);
//			questsInPlay.playingCards.shift();
			questSet.playingCards[i] = null;
			updateCounts();
			break;
	}  

	questSet.truncate();
	$scope.activeEvent = getActiveEvent(questCardinplay);
<<<<<<< HEAD
	
	switch ($scope.activeEvent)
	{
		//fixme
			case 'eventOrcsAttack':
				//set variable for items in cart[0]
				var  total = wheelbarrowCardSum();
=======
	prepareEventForPlayer(questCardinplay, player);
}

prepareEventForPlayer = function(questCardinplay, player) {	

	if(player===null) {
		return;
	}
	if(questCardinplay.level==='4') {
		questCardinplay.cardImage.height = "350";
	}

	switch (questCardinplay.name)
	{
			case 'eventOrcsAttack':
				//set variable for items in cart[0]
				$scope.eventActionsRemaining=1;
				$scope.wheelbarrowCardSum=0;
				var  total = wheelbarrowCardSum(player, false);
>>>>>>> origin/master
				if (total < 5) {
					//discard all items from cart to hand
					for (var i = 0; i < player.carts[0].cards.playingCards.length; ++i)  {
						var card = player.carts[0].cards.playingCards[i];
							//discard selected card(s)
							player.cards.playingCards.push(card);
							player.carts[0].cards.playingCards[i] = null;
						}
							
						player.carts[0].cards.truncate();	
						player.cards.setCardSize("60","80");
<<<<<<< HEAD
						
						
=======
						player.carts[0].active=false;
						player.carts[0].image = player.carts[0].imageNotPurchased;
>>>>>>> origin/master
					}
					
					
				
				break;
			case 'eventBarbarianAttack':
<<<<<<< HEAD
				break;
			case 'eventBrokenItems':
				break;
			case 'eventCastleTaxation':
=======
				$scope.eventActionsRemaining=0;
				break;
			case 'eventBrokenItems':
				$scope.eventActionsRemaining=2;
				break;
			case 'eventCastleTaxation':
				$scope.eventActionsRemaining=2;
>>>>>>> origin/master
				break;
			case 'eventGolbinRaid':
				break;
			case 'eventKingsFeast':
<<<<<<< HEAD
				break;
			case 'eventMarketShortage':
				break;
			case 'eventMarketSurplus':
=======
				$scope.eventActionsRemaining=1;
				break;
			case 'eventMarketShortage':
				$scope.eventActionsRemaining=0;
				break;
			case 'eventMarketSurplus':
				$scope.eventActionsRemaining=0;
>>>>>>> origin/master
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
<<<<<<< HEAD
=======
				$scope.eventActionsRemaining=1;
>>>>>>> origin/master
				break;
			case 'eventVikingParade':
				break;
			default:
				resetDisplayMode('game');
<<<<<<< HEAD
		}
=======
	}
>>>>>>> origin/master
	
	$scope.displayMode = $scope.activeEvent;

}

wheelbarrowCardSum = function(player, selectedCardsOnly) {
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



getActiveEvent = function(questCardinplay) {
		if (questCardinplay === null||questCardinplay===undefined) {
			return 'game';
		}
		
		if(questCardinplay.level === "e") {
			//questCardinplay.cardImage.height = "350";
			return questCardinplay.name;
		}
		else {
			return $scope.displayMode;
		}
	}

resetDisplayMode = function(mode) {
	$scope.displayMode = mode;
}

$scope.playerCompleteEvent = function(actionCost, id) {
	var cardSelectedCount = $scope.selectedItemsCount + $scope.selectedCartItemsCount;
	var game = $scope.game;
	var player = $scope.activePlayer;
	var playerCardCount = player.cards.playingCards.length;
<<<<<<< HEAD
	var playerCardsSum = playerCardSum(player);
=======
	var playerCardsSum = playerCardSum(player, false);
	var playerCardsSumSelected = playerCardSum(player, true);
	var questCardinplay = game.questsInPlay.playingCards[id];
>>>>>>> origin/master
	var event = $scope.activeEvent;


		switch (event) {
			case 'eventOrcsAttack':
			if(id==='Y') {
				//discard selected card
<<<<<<< HEAD
				if(playerCardsSum< 5){
						alert("You do not have enough items selected.");
						return;
					}
			}
			if(id==='N') {
				//flip over cart[0]
				player.carts[0].active=false;
=======
				if(playerCardsSumSelected < 5){
						alert("You do not have enough items selected.");
						return;
					}
				if($scope.selectedItemsCount > 0 && playerCardsSumSelected >= 5) {			
					$scope.playerDiscard(actionCost);
					$scope.eventActionsRemaining=0;
				}					
				player.carts[0].active=true;
				player.carts[0].image = player.carts[0].imagePurchased;

			}
			if(id==='N') {
				//do nothing, nothing was destroyed
>>>>>>> origin/master
				
				
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
					$scope.playerDiscard(actionCost);
				}
				else if(cardSelectedCount > 0 && $scope.selectedCartItemsCount > 0) {			
					$scope.playerCartDiscard(id, actionCost);
				}
				
				for (var j = 0; j < cardSelectedCount; ++j)  {
					dealCardToPlayer(player, game.itemDeck);
					$scope.eventActionsRemaining--;					
				}

				break;

			case 'eventCastleTaxation':
				//discard with no actions from hand only
				if(id="cards") {
					if(playerCardCount< 2){
						alert("You do not have enough items, pay taxation with gold.");
						return;
					}
					else if(cardSelectedCount != 2) {
						alert("You must select two items for taxation.");
						return;
					}
				}
				if(id="gold") {
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
<<<<<<< HEAD
		
			//when all players have finished event and clicked playerCompleteEvent
		if ($scope.playersCompletedEventCount === $scope.numberOfPlayers) {
			$scope.playersCompletedEventCount = 0;
			resetDisplayMode('game');
			//discard quest
			game.questsInPlay.playingCards[id] = null;
			game.questsInPlay.truncate();
		
			//draw new one
			dealCardToQuests($scope.game.questsInPlay, $scope.game.quests);
			eventCycleToNextPlayer(game);
		}
		else	{
			eventCycleToNextPlayer(game);
		}

	}

	eventCycleToNextPlayer = function(game) {
		game.activePlayer.active = false;
		if(game.activePlayer.id === game.numOpponents) {
			game.activePlayerId=0;
		}
		else {
			game.activePlayerId++;
		}
		game.activePlayer = game.players[game.activePlayerId];
		game.activePlayer.active = true;
	}
=======

		checkIfAllPlayersFinishedEvent(questCardinplay, id);
}

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
//	if($scope.activePlayer.id === game.numOpponents) {
		$scope.activePlayerId=0;
//	}
//	else {
//		$scope.activePlayerId++;
//	}
	$scope.activePlayer = game.players[$scope.activePlayerId];
	$scope.activePlayer.active = true;
	prepareEventForPlayer(questCardinplay, $scope.activePlayer);	
}
>>>>>>> origin/master


//deal cards for initial market
dealCardToMarket = function(market, items, count){
	var cardsDealt = 0;

		for (var i = 0; i < items.playingCards.length; ++i) { // deal count number of cards
			var itemCard = items.playingCards[i]; // get a reference to the first card on the deck
			if (itemCard === null) {
				continue;
				}
				
			//check if deck needs reshuffle - must get this ref before moving card!
			//peek looks at i+1
			var nextCard = items.peek(i); 
			
			market.playingCards.push(itemCard);
//			items.playingCards.playingCards.shift();
			items.playingCards[i] = null;
		
			if(nextCard === undefined) {
				//got last card, need to shuffle
				resetItemDeckAndMarket();
				return;
			}

			cardsDealt++
			itemCard = nextCard;
			if (cardsDealt === count) {
				break;
				}
			} 
			
			items.truncate();
			
}	

dealCardToPlayer = function(player, items) {
	for (var i = 0; i < items.playingCards.length; ++i) { 
		var itemCard = items.playingCards[0]; // get a reference to the first card on the deck
		if (itemCard === null) {
				continue;	
				}

			//check if deck needs reshuffle - must get this ref before moving card!
			//peek looks at i+1
			var nextPlayerCard = items.peek(i); 
			
<<<<<<< HEAD
			player.cards.playingCards.push(itemCard); 	
//			items.playingCards.shift();
			items.playingCards[i] = null;
=======
//			player.cards.playingCards.push(itemCard); 	
			player.cards.playingCards.push(items.playingCards.shift());
//			items.playingCards[i] = null;
>>>>>>> origin/master
			
			if(nextPlayerCard === undefined) {
				//got last card, need to shuffle, but you need to keep dealing cards after reshuffle!
				resetItemDeckAndMarket();
				return;
			}
			break;					
		}
		
//		items.truncate();
		updateCounts();
}  

discardCardFromMarket = function( discardCard, discardPile) {
	discardPile.playingCards.push(discardCard);
	$scope.lastDiscard = discardCard;
	updateCounts();
}  

//sort player cart cards
sortPlayerCartCards = function(cart) {
	cart.cards.playingCards.sort(function (a,b) {return a.number-b.number});
}


//sort player cards
sortPlayerCards = function() {
	$scope.activePlayer.cards.playingCards.sort(function (a,b) {return a.number-b.number});
}

//sort player quests
sortPlayerQuests = function() {
	$scope.activePlayer.questsCompleted.playingCards.sort(function (a,b) {return a.sortorder-b.sortorder});
}

payGold = function(player, quantity) {
	for (var i = 0; i < quantity; ++i) { 
		player.gold--
	}
}

getGold = function(player, quantity) {

	for (var i = 0; i < quantity; ++i) { 
		player.gold++
	}
}

//deal cards for initial game quests
moveAllDiscardsToItemDeck = function(itemDeck, discardDeck){
	for (var i = 0; i < discardDeck.playingCards.length; ++i) { // deal numberOfCards cards
		var cardinplay = discardDeck.playingCards[i]; // get a reference to the first card on the deck
				if (cardinplay === null) {
				continue;
				}
			itemDeck.playingCards.push(cardinplay);
	}  

	
}

//deal cards for initial game quests
moveAllMarketToDiscardDeck = function(discardDeck, marketDeck){
	for (var i = 0; i < marketDeck.playingCards.length; ++i) { // deal numberOfCards cards
		var cardinplay = marketDeck.playingCards[i]; // get a reference to the first card on the deck
				if (cardinplay === null) {
				continue;
				}
			discardDeck.playingCards.push(cardinplay);
	}  

	
}

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
	game.marketHolders = new cardSet();
	game.marketHolders.createBlankMarket();
	game.marketDeck = new cardSet();
	dealCardToMarket(game.marketDeck, game.itemDeck, game.marketStart);
	game.marketHolders.setCardSize("60","80");
	
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
	updateCounts();
}

$scope.playerBuyCart	= function(cartId, actionCost) {

	var total = 0;
	var player = $scope.activePlayer;
	
	if(player.actionsRemaining > 0) {
			for (var i = 0; i < player.cards.playingCards.length; ++i)  {
					var card = player.cards.playingCards[i];
					if(card.selected) {
						total += card.number;
					}
			}
		}
		else
		{
			alert("Need more actions!");
			return;
		}
		
		var purchasedStatus = false;
		var purchaseType = null;
		
		if(player.carts[cartId].goldCost===0) {
			if(total < player.carts[cartId].itemCost) {
				alert(player.carts[cartId].name + " must be repurchased with Items totating 5+ points.  Select additional items to trade for cart.");
				return;
			}
			//alert(player.carts[cartId].name + " must be repurchased with Items.  Select items to trade for cart.");
			return;
		}
		
		if(total < player.carts[cartId].itemCost) {
			if(player.gold < player.carts[cartId].goldCost) {
			alert("Select some items or get some gold!");
			return;
			}	
		}
		
		if(total >= player.carts[cartId].itemCost) {
			var r = confirm("Confirm purchase with items!");
				if (r == true) {
					//add code to remove items
					removeSelectedCards(player, true);
					//alert("You bought it!");
					purchasedStatus = true;
					purchaseType = "items";
					updateCounts();
					
				}
				else {
					//alert("You pressed Cancel!");
					purchasedStatus = false;
				}

		}
		else
		{
			if(player.gold >= player.carts[cartId].goldCost) {
			var r = confirm("Confirm purchase with gold!");
				if (r == true) {
					//alert("You bought it!");
					purchasedStatus = true;
					purchaseType = "gold";				}
				else {
					//alert("You pressed Cancel!");
					purchasedStatus = false;
				}
			}
		}

		if(purchasedStatus) {
			var cart = player.carts[cartId]
			var newImage = cart.imagePurchased;
			player.nextCartId ++;
			player.carts[cartId].active=1;
			player.carts[cartId].image = newImage;
			player.nextCartName = nextCartName(cartId);
			if(purchaseType==="gold") {
				player.gold -=player.carts[cartId].goldCost;
			}
			if(cart.id === 1) {
				$scope.activePlayer.vp += 1;
				dealCardToQuests($scope.game.questsInPlay, $scope.game.quests);
				
			}

			if(cart.id === 2) {
				player.vp += 3;
			}
			
			if(cart.id === 3) {
				player.maxHand = 6;
			}
			
			player.actionsRemaining -= actionCost;
			updateCounts();
			checkItemsRemaining();
		}
	
}

$scope.playerCartFish = function (id, actionCost) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];
	
	//if you have actions, discard selected cards	
	var  selectedCount = 0;
	var  cardCount = 0;

	if($scope.selectedCartItemsCount > 1) {
		alert("You must select one card when fishing for a new one!")
		return;
	}
	
	if(player.cards.playingCards.length === player.maxHand) {
		alert("You are already at max hand, discard item from hand first.")
		return;
	}
	
	//if cart cards are selected, move between carts else its player items to cart
	if($scope.selectedCartItemsCount > 0) {
		var cart = player.carts[id];
		removeSelectedCartCards(cart, true);

		//get new card
		dealCardToPlayer(player, $scope.game.itemDeck)

		player.actionsRemaining -= actionCost;
		updateCounts();
		checkItemsRemaining();
		$scope.selectedCartItemsCount = 0;
		resetCartCardsSelected(player,-1);
		return;
	}
}
$scope.playerFish = function (actionCost) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var selectedCount = 0;

	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
		return;
	}	
	
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];		
		if(card.selected) {
			selectedCount++;
		}
	}
	if(selectedCount != 1) {
		alert("You must select one card when fishing for a new one!")
		return;
	}

	removeSelectedCards(player, true);

	//get new card
	dealCardToPlayer(player, $scope.game.itemDeck)

	//remove action
	player.actionsRemaining -= actionCost;
	//check if zero actions and highlight button to take another action if they have gold >= 2
	updateCounts();
	checkItemsRemaining();
}
	
$scope.playerBuyAction = function (actionCost) {
		var game = $scope.game;
		var player = $scope.activePlayer;

		if(player.gold >= 2) {
			payGold(player,2);
			player.actionsRemaining += actionCost;
		}
		else{
			alert("Need more gold!");
			return;
		}
		updateCounts();
}

$scope.playerCartDiscard = function (id, actionCost) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];
	
	//if you have actions, discard selected cards	
	var  selectedCount = 0;
	var  cardCount = 0;

	if($scope.selectedCartItemsCount === 0) {
				alert('Select some items to discard.');
				return;
	}
	
	//if cart cards are selected, move between carts else its player items to cart
	if($scope.selectedCartItemsCount > 0) {
		var cart = player.carts[id];
		removeSelectedCartCards(cart, true);
		player.actionsRemaining -= actionCost;
		updateCounts();
		checkItemsRemaining();
		$scope.selectedCartItemsCount = 0;
		resetCartCardsSelected(player,-1);
		return;
	}
}


$scope.playerDiscard = function (actionCost) {
	var game = $scope.game;
	var player = $scope.activePlayer;

	//if you have actions, discard selected cards, if not but have too many cards, discard anyway	
	var  selectedCount = 0;
	var  cardCount = 0;

	if($scope.selectedItemsCount === 0) {
		alert('Select some items to discard.');
		return;
	}
	
	if(actionCost!=0) {
		if(player.actionsRemaining === 0)	{
		for (var i = 0; i < player.cards.playingCards.length; ++i)  {
			var card = player.cards.playingCards[i];		
			if(card != null && card != undefined) {
				cardCount++;
				}
			}
		
			if(cardCount <= player.maxHand)	{
				alert("You have no actions.");
				return;
			}
		}
	}
	
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];		
		if(card.selected) {
			selectedCount++;
		}
	}

	if(actionCost!=0) {
	//if player cards is more than maxhand and no actions, and selected cards does not bring down to max hand, alert
		if(player.cards.playingCards.length > player.maxHand) {
			if(player.actionsRemaining === 0)	{
				if(player.cards.playingCards.length - selectedCount != player.maxHand) {	
					alert("You have no actions, you can't discard more than max hand: "+ player.maxHand + " cards.");
					return;
					//you have no actions, you can't discard more than max hand
				}
			}
		}
	}
	
	//actuall did a discard
	removeSelectedCards(player, true);

	if(player.actionsRemaining > 0 && selectedCount > 0) {	
		player.actionsRemaining -= actionCost;
	}
	
	updateCounts();
	checkItemsRemaining();
}

$scope.playerPass = function() {
	//make sure you discard down to max cards or you can't pass
	var game = $scope.game;
	var player = $scope.activePlayer;
	player.cards.truncate();

	if(player.cards.playingCards.length > player.maxHand) {	
		alert("Too many cards, select and discard!")
		return;
	}

	//add one card to market
	dealCardToMarket(game.marketDeck, game.itemDeck,1);
	
	//draw new cards up to max hand
	for (var j = 0; j < player.maxHand + 1; ++j) { 
		if(player.maxHand > player.cards.playingCards.length) {
			dealCardToPlayer(player, game.itemDeck);	
			}
			else {
			break;
			}
		}
	
	player.actionsRemaining = 0;
	player.active = false;
	player.cardSumSelected = 0;

	resetSelectedCards(player);
	
	$scope.selectedItemsCount = 0;
	$scope.selectedMarketTradeCount = 0;
	$scope.sumMarketValueSelected = 0;
	
	//wipe out any potential market trades in progress
	game.marketDeckInTrade = new cardSet();
	player.turns ++;
	//active next player
	updateCounts();
	checkItemsRemaining();
	activateNextPlayer();
}

$scope.playerMarketTrade = function(actionCost) {
	//check if one to one or many to many
	var game = $scope.game;
	var player = $scope.activePlayer;
	
	if(player.actionsRemaining === 0)	{
		alert("You have no actions.")
		return;
	}	
	
	$scope.selectedItemsCount = 0;
	
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];		
		if(card.selected) {
			$scope.selectedItemsCount++;
		}
	}
	
	
	if($scope.selectedItemsCount === 0){
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
	
	//move player items to market
	tradeSelectedCards($scope.activePlayer);
	
	//move market items to player
	$scope.selectedItemsCount = 0;
	$scope.selectedMarketTradeCount = 0;
	$scope.sumMarketValueSelected = 0;
	
	game.marketDeckInTrade = new cardSet();
	player.actionsRemaining -= actionCost;
	
	resetPlayerCardsSelected(player);
	

	updateCounts();
	
}

tradeSelectedCards = function(player){
	var game = $scope.game;

	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];		
		if(card.selected) {
			game.marketDeck.playingCards.push(card);
		}
	}
	
	removeSelectedCards(player, false);
	
	for (var i = 0; i < game.marketDeckInTrade.playingCards.length; ++i)  {
		var card = game.marketDeckInTrade.playingCards[i];
		
		for (var j = 0; j < game.marketDeck.playingCards.length; ++j)  {
		var marketCard = game.marketDeck.playingCards[j];
			if (marketCard === null) {
					continue;
					}
			if(card.number === marketCard.number) {
<<<<<<< HEAD
			player.cards.playingCards.push(card);
//			game.marketDeck.playingCards.shift();
			game.marketDeck.playingCards[j]=null;
=======
//			player.cards.playingCards.push(card);
			player.cards.playingCards.push(game.marketDeck.playingCards.shift());
//			game.marketDeck.playingCards[j]=null;
>>>>>>> origin/master
			break;
			}
		}

		
	}

//	game.marketDeck.truncate();	
	updateCounts();
}

getItemsCountRemaining = function() {
	var count = 0;
			for (var i = 0; i < $scope.game.itemDeck.playingCards.length; ++i) { 
				var itemsCard = $scope.game.itemDeck.playingCards[i]; // get a reference to the first card on the deck
				if (itemsCard === null) {
					continue;
					}
                count++;
        } 
		$scope.itemsCountRemaining = count;
}	

getQuestsCountRemaining = function() {
	var count = 0;
	        for (var i = 0; i < $scope.game.quests.playingCards.length; ++i) { 
				var questCard = $scope.game.quests.playingCards[i]; // get a reference to the first card on the deck
				if (questCard === null) {
					continue;
					}
                count++;
        } 
		
		$scope.questsCountRemaining = count;
		return count + $scope.game.questsInPlay.playingCards.length;
	
}	

checkEndGameStatus = function() {
		if(getQuestsCountRemaining()===4) {
			//game over!
			$scope.displayMode = "gameover";
		}	
}

getDiscardsCount = function() {
	var count = 0;
	        for (var i = 0; i < $scope.game.discardDeck.playingCards.length; ++i) { 
				var discardCard = $scope.game.discardDeck.playingCards[i]; // get a reference to the first card on the deck
				if (discardCard === null) {
					continue;
					}
                count++;
        } 
	$scope.discardsCount = count;
}

resetPlayerCardsSelected =  function(player) {
		for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];
		card.selected = false;
		card.borderColor = cardColor(card);
	}
	$scope.selectedItemsCount=0;
}

resetCartCardsSelected =  function(player, id) {
	game = $scope.game;
	$scope.selectedCartItemsCount=0;

	for (var i = 0; i < player.carts.length; ++i)  {
		cart = player.carts[i];
		cart.selected = false;
		cart.cardSumSelected = 0;
		cart.borderColor = cartColor(cart);
		if(cart.id === id) {
			//continue;
				for (var j = 0; j < player.carts[i].cards.playingCards.length; ++j)  {
					card = player.carts[id].cards.playingCards[j];
					if(card.selected) {
						cart.cardSumSelected+= card.number;
						card.borderColor = cardColor(card);
						$scope.selectedCartItemsCount++;
					}
					else {
						card.borderColor = cardColor(card);
					}
				}
			
			}  //dont reset the current cart cards
			else {
				for (var k = 0; k < player.carts[i].cards.playingCards.length; ++k)  {
					card = player.carts[i].cards.playingCards[k];
					card.selected = false;
					card.borderColor = cardColor(card);
				}
			}
	}
}

resetSelectedCards = function(player) {
	resetPlayerCardsSelected(player);
	resetCartCardsSelected(player,-1);
}

var nextCartName = function(cartId) {
if(cartId === 1)
	return 'Horse Wagon';

if(cartId === 2)
	return 'War Wagon';
}

activateNextPlayer = function(){
	var game = $scope.game;
<<<<<<< HEAD
	if( game.activePlayer.id === game.numOpponents) {
	game.activePlayerId=0;
		}
	else {
	game.activePlayerId++;
	}
		
	game.activePlayer = $scope.game.players[game.activePlayerId];
	game.players[game.activePlayerId].actionsRemaining = game.startingActions;
	game.activePlayer.active = true;
=======
//	if( $scope.activePlayer.id === game.numOpponents) {
	$scope.activePlayerId=0;
//		}
//	else {
//	$scope.activePlayerId++;
//	}
		
	$scope.activePlayer = $scope.game.players[$scope.activePlayerId];
	game.players[$scope.activePlayerId].actionsRemaining = game.startingActions;
	$scope.activePlayer.active = true;
>>>>>>> origin/master
	updateCounts();
}

removeSelectedCards = function(player, discardFlag){
			for (var i = 0; i < player.cards.playingCards.length; ++i)  {
				var card = player.cards.playingCards[i];
				if(card.selected) {
					$scope.selectedItemsCount--;
					//discard selected card(s)
					if(discardFlag) {
						discardCardFromDeck( card, $scope.game.discardDeck);
					}
			}
	}
	truncatePlayerCards(player);
}

removeSelectedCartCards = function(cart, discardFlag){
			for (var i = 0; i < cart.cards.playingCards.length; ++i)  {
				var card = cart.cards.playingCards[i];
				if(card.selected) {
					$scope.selectedCardItemsCount--;
					//discard selected card(s)
					if(discardFlag) {
						discardCardFromDeck( card, $scope.game.discardDeck);
					}
			}
	}
	truncateCartCards(cart);
}
discardCardFromDeck = function( discardCard, discardPile) {
	discardPile.playingCards.push(discardCard);
	$scope.lastDiscard = discardCard;
	updateCounts();
} 

truncatePlayerCards = function(player) {
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
	if(player.cards.playingCards[i].selected) {
			player.cards.playingCards[i] = null;
		}
	}
	player.cards.truncate();
}

truncateCartCards = function(cart) {
	for (var i = 0; i < cart.cards.playingCards.length; ++i)  {
	if(cart.cards.playingCards[i].selected) {
			cart.cards.playingCards[i] = null;
		}
	}
	cart.cards.truncate();
}

	
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
}).directive('marketcardcount', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'marketcardcount.html?2'
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


