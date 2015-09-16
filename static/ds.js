
//'ngAnimate'
var Cart = function (id, size, active, goldCost, itemCost, name, imagePurchased, imageNotPurchased) {
    this.id = id;
	this.size = size;
    this.active = active;
	this.selected = false;
	this.width=70;
	this.height=100;
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


var Game = function(numOpponents) {

	//game setup variables count
	this.firstPlayer = 0;
	this.startingActions = 2;
	this.startingCards = 5;
	this.marketStart = 4;
	this.questStart = 4;
	
	this.numOpponents = numOpponents;

	//all the starter empty playingCards holders	
	//this.cards = new cardSet();
	this.quests = new questSet();
	this.itemHolders = new cardSet();
	//this.itemDeck = new cardSet();
	this.discardDeck = new cardSet();
	this.questsInPlay = new cardSet();
	this.marketDeck = new cardSet();
	this.marketDeckInTrade = new cardSet();

	//populated cardrs, itemHolders and quests
	//this.cards.create75Cards();
	var questImageBase = "../images/shopping_card_master";
//	var questImageBase = "../images/shopping_card_masterxxx";
	var blankMarketImageBase = "../images/"
//	var blankMarketImageBase = "../images/xxx"
	this.itemHolders.createBlankMarket(blankMarketImageBase);
	this.quests.create75CardsQuestDeck(questImageBase);

	this.players = [];
	
	//set initial size of the cards for the gui
	//their are times in the code that these are changed and reset
	//this.cards.setCardSize("60","80");
	this.itemHolders.setCardSize("60","80");
	this.quests.setCardSize("auto","200");	
	this.questsInPlay.origWidth=100;
	this.questsInPlay.origHeight=200;

}

var PlayersLog = function (id, text) {
	this.id = id
	this.text = text
}


var Player = function (id, name) {
	var imageBase = "../images/shoppercarts_v3_";
//	var imageBase = "../images/shoppercarts_v3_xxx";
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
    this.carts = [new Cart(0, 3, 1, 0, 5,'Wheelbarrow', imageBase + '0.jpg', imageBase + '0_not_purchased.jpg'), 
				  new Cart(1, 3, 0, 1, 10, 'Hand Cart', imageBase + '1.jpg', imageBase + '1_not_purchased.jpg'), 
				  new Cart(2, 4, 0, 2, 15, 'Horse Wagon', imageBase + '2.jpg', imageBase + '2_not_purchased.jpg'), 
			      new Cart(3, 5, 0, 3, 20, 'War Wagon', imageBase + '3.jpg', imageBase + '3_not_purchased.jpg')]
				  ;
}


	
app.controller('dsCtrl', ['$scope', 'gameFactory', function ($scope, gameFactory) {
	
	
	$scope.noGame = function () {
		setupNoGame();
		$scope.displayMode = "nogame";
	}

	setupNoGame = function() {
		$scope.displayMode = "nogame";
		$scope.spashImage = "../images/boxtop.jpg";
		$scopeNextPlayerId = 0;
		$scope.playerName="Player1";
		$scopeNextPlayerId=0;		
		$scope.numberOfPlayersJoined =0;
		game=null;
	}	

	setupNoGame();
	
	$scope.joinGame = function(playerId, playerName) {
		switch (playerId) {
			case 0:
				$scope.p1Name = playerName;
				break;
			case 1:
				$scope.p2Name = playerName;
				break;
			case 2:
				$scope.p3Name = playerName;
				break;
			case 3:
				$scope.p4Name = playerName;
				break;
			default:
				$scope.p1Name = playerName;
				break;
		}
	$scopeNextPlayerId++;
	$scope.playerName = "Player"+($scopeNextPlayerId+1);
	$scope.numberOfPlayersJoined = $scopeNextPlayerId;
		
	}

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

var nextCartName = function(cartId) {
if(cartId === 1)
	return 'Horse Wagon';

if(cartId === 2)
	return 'War Wagon';
}

$scope.userClickedMarketImage = function(i) {
	var game = $scope.game;
	var card = game.itemHolders.playingCards[i];
	card.selected = !card.selected;

	card.borderColor = 'black';
	card.count--;
	
	game.marketDeckInTrade.addCard(card.number, card.image, 1);
	var len = game.marketDeckInTrade.playingCards.length - 1;
	game.marketDeckInTrade.playingCards[len].selected = true;
	game.marketDeckInTrade.setCardSize("60","80");
	updateMarketItemPoints(card.number);
}

$scope.userClickedMarketTradeImage = function(i) {
	
	var game = $scope.game;
	var card = game.marketDeckInTrade.playingCards[i];
	var marketCard = game.itemHolders.playingCards[card.number-1];
	//increase the number above the market card holder
	marketCard.count++;
	
	marketCard.selected = !marketCard.selected;
	game.marketDeckInTrade.playingCards[i] = null;
	game.marketDeckInTrade.truncate();
	updateMarketItemPoints(-card.number);
}

$scope.userClickedQuestImage = function(i) {
	var game = $scope.game;
	var questClicked = game.questsInPlay.playingCards[i];
	
	questClicked.selected = !questClicked.selected;
	$scope.questSelected=!$scope.questSelected;
	questClicked.borderColor = cardColor(questClicked);
	
	//resetQuestsSize(i);

		
	if(questClicked.selected){
		game.questsInPlay.origWidth = questClicked.cardImage.width;
		game.questsInPlay.origHeight = questClicked.cardImage.height;
		questClicked.cardImage.width = questClicked.cardImage.width * 2;
		questClicked.cardImage.height = questClicked.cardImage.height * 2;
	}
	else {
		questClicked.cardImage.width = game.questsInPlay.origWidth;
		questClicked.cardImage.height = game.questsInPlay.origHeight;
	}
		
			for (var j = 0; j < game.questsInPlay.playingCards.length; ++j)  {
		if(j===i){
			continue;
			}
		var card = game.questsInPlay.playingCards[j];
		card.selected = false;
		card.borderColor = cardColor(card);
		card.cardImage.width = game.questsInPlay.origWidth;
		card.cardImage.height = game.questsInPlay.origHeight;
	}

}

resetQuestsSize = function() {
	for (var j = 0; j < game.questsInPlay.playingCards.length; ++j)  {
		var card = game.questsInPlay.playingCards[j];
		card.selected = false;
		card.borderColor = cardColor(card);
		card.cardImage.width = game.questsInPlay.origWidth;
		card.cardImage.height = game.questsInPlay.origHeight;
	}
}

$scope.aQuestIsReady = function() {
	//go through eachquest
		//go through each cart that has 3 items or more
		//change size of quests that can be completed
	
	
}

$scope.playerCompleteQuest = function(id) {
		var text = "";
		var game = $scope.game;
		var player = $scope.activePlayer;
		var questClicked = game.questsInPlay.playingCards[id];
		var questCanBeCompleted = false;

		if($scope.activeCartId < 0 )	{
			alert("Select a cart with items first.")
			return;
		}

		var cart = player.carts[$scope.activeCartId];

		//if(!$scope.debug) {
		if($scope.selectedCartItemsCount < 3 || cart.cards.playingCards.length != $scope.selectedCartItemsCount) {
			alert("Select all items in cart/wagon first.")
			return;
			}
		//}	

		var selectedCards = getSelectedCards(cart.cards);
		
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
//		if($scope.debug) {
//			questCanBeCompleted = true;
//		}
		
		if (questCanBeCompleted === true) {
			var r =  confirm("Confirm purchase from " + cart.name +"?");
			if(r===true) {
				//check if player completed quest and move it to their completed quests
				resetQuestsSize();
				completeQuest(selectedCards, 'cart' + cart.id);
				resetAllSelectedCards(player);
				player.questsCompleted.setCardSize("auto","100");
				updateCounts(text);
			}
		}
		else {
			alert(cart.name + " does not contain the necessary items for this quest!")
			return;
			
		}
		
		
		//go through sets and get bonus points.
		//for each quest.sortorder set of three, is three points
		//for each quest.sortorder 1,2,3,4,5 is three points
		//cannot get both with same card.
		//calculatePlayerBonus(player);

	}

setCartActiveStatus = function(id) {
	if(id != $scope.activeCartId) {
		$scope.prevActiveCartId = $scope.activeCartId;
	}
	//then set active cart id
	$scope.activeCartId = id;
}

$scope.userClickedCartItem = function(id, i) {
	setCartActiveStatus(id);
	var game = $scope.game;
	var player = $scope.activePlayer;
	var card = player.carts[id].cards.playingCards[i];
	var cart = player.carts[id];
	
	card.selected = !card.selected;
	card.borderColor = cardColor(card);
	resetPlayerCardsSelected(player);
	resetCartCardsSelected(player, id);
	
	cart.cardSumSelected = getSelectedCardSum(cart.cards, true);

}


$scope.userClickedItemImage = function(id) {
	var game = $scope.game;
	var player = $scope.activePlayer;
	var card = player.cards.playingCards[id];
	resetCartCardsSelected(player, -1);
	card.selected = !card.selected;
	card.borderColor = cardColor(card);	
	player.cardSumSelected = getSelectedCardSum(player.cards, true);
	$scope.selectedItemsCount = getSelectedCardcount(player.cards);
	updatePurchaseText();
	updateCounts($scope.blankText);
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
	var player = $scope.activePlayer;
	
	//deselect all items in cart if cart selected
	for (var j = 0; j < player.carts[id].cards.playingCards.length; ++j)  {
		$scope.userClickedCartItem(id, j);
	}
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
		playerCart.cards.setCardSize("38","55");
}
	
updatePlayerCartItems = function(playerCart, number) {
	for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
		var card = game.itemHolders.playingCards[i];
			if(card.number === number) {
				playerCart.cards.addCardc(card);
				break;
		}
	}
}

dealNumberToPlayer = function(player, number) {
	var game = $scope.game;
	for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
		var card = game.itemHolders.playingCards[i];
			if(card.number === number) {
				player.cards.addCardc(card);
				break;
		}
	}
	updateCounts($scope.blankText);
}
	
updateDiscardPile = function(discardDeck, number) {
	var game = $scope.game;
	for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
		var card = game.itemHolders.playingCards[i];
			if(card.number === number) {
				discardDeck.addCardc(card);
				break;
		}
	}
	updateCounts($scope.blankText);
}


dealNumberToMarket = function(marketDeck, number) {
	var game = $scope.game;
	var text = "";
	for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
		var card = game.itemHolders.playingCards[i];
			if(card.number === number) {
				marketDeck.playingCards.push(card);
				break;
			}
	}
	updateCounts(text);
}


dealQuestsCompleted = function(questsCompleted, items) {
	var game = $scope.game;
	var text = "";
	var questString = "../images/shopping_card_master";
	var	itemString = "";
	for (var i = 0; i < items.length; ++i)  {
		itemString += items[i];
	}
	questString += itemString;
	questString += ".jpg";


	for (var i = 0; i < game.quests.playingCards.length; ++i)  {
		var card = game.quests.playingCards[i];
			if(card.image === questString) {
				questsCompleted.playingCards.push(card);
				break;
		}
	}
	updateCounts(text);
	
}

dealQuestCard = function(questsInPlay, items) {
	var game = $scope.game;
	var text = "";
	var questString = "../images/shopping_card_master";
	var	itemString = "";
	for (var i = 0; i < items.length; ++i)  {
		itemString += items[i];
	}
	questString += itemString;
	questString += ".jpg";


	for (var i = 0; i < game.quests.playingCards.length; ++i)  {
		var card = game.quests.playingCards[i];
			if(card.image === questString) {
				questsInPlay.playingCards.push(card);
				break;
		}
	}
	$scope.activeEvent = getActiveEvent(card);
	prepareEventForPlayer(card);
	updateCounts(text);
	
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

//returns card numbers appended to each other for quest.  ex. 1224
getSelectedQuestItems = function (questCard) {
	
	
}

//returns card numbers appended to each other for deck.  ex. 1224
getSelectedCards = function(deck){
	var selectedCards = "";
	var cardNumber = "";
	for (var i = 0; i < deck.playingCards.length; ++i)  {
		var card = deck.playingCards[i];
		if(card.selected) {
			cardNumber = card.number;
			if(card.number===10) {
				cardNumber = 0;
			}
			selectedCards+=cardNumber;
		}
		continue;			
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

	
$scope.newGame = function (numberOfPlayers) {
		
	$scope.activeEvent = null;
	$scope.numberOfPlayers = Number(numberOfPlayers);
	$scope.activeEvent=null;
	$scope.playersCompletedEventCount = 0;
	$scope.itemCardBack = "../images/shoppingCardBack.jpg"
	$scope.vendorCardBack = "../images/vendorback.jpg"
	//$scope.itemCardBack = "../images/shoppingCardBack.jpgxxx"
	//$scope.vendorCardBack = "../images/vendorback.jpgxxx"
	$scope.eventActionsRemaining=0;
	$scope.debug = true;
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
	$scope.questSelected=false;
	$scope.isActive = false;
	$scope.selectedCartItems = "";
	$scope.playerslog = [];
	$scope.showLog = false;
	$scope.showLogText = "Show Players Log";
	$scope.blankText = "";
	
	//for(var i=0; i<100;++i) {
//		text = 'This is a log test ' + i;
//		$scope.playerslog.push(new PlayersLog(i, text));
//	}
	
	//gui variable to control cart buttons
	$scope.prevActiveCartId = -1;
	$scope.activeCartId = -1;
	
	$scope.showLogResults = function() {
		if(!$scope.showLog) {
			$scope.showLogText = "Hide Players Log";
		}else {
			$scope.showLogText = "Show Players Log";
		}
		
		$scope.showLog = !$scope.showLog;
		
	}


	$scope.game = new Game(numberOfPlayers-1);
	$scope.activePlayerId = $scope.game.firstPlayer;

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
		$scope.displayMode = "game";
	
}


$scope.moveItemsToCart = function(id, actionCost) {
	//check if one to one or many to many
	setCartActiveStatus(id);
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var total = player.cardSumSelected;
	var selectedCards = getSelectedCards(player.cards);
	var selectedCartCards = getSelectedCards(player.carts[id].cards);
	var selectedCardCount = getSelectedCardcount(player.cards);
	var selectedCartCount = getSelectedCardcount(player.carts[id].cards);
	//$scope.activeCartId = id;
	var cart = player.carts[id];
	
	if(player.actionsRemaining === 0)	{
		alert("You have no actions.")
		return;
	}	
	
	if($scope.prevActiveCartId >= 0) {
		$scope.selectedCartItems = getSelectedCards(player.carts[$scope.prevActiveCartId].cards);
	}
	
	//if cart cards are selected, move between carts else its player items to cart
	//these are in the scope variable as the new cart they select is selectedCartCount
	if($scope.selectedCartItemsCount > 0) {
		moveItemsBetweenCarts($scope.prevActiveCartId, id, $scope.selectedCartItems, actionCost);
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
	
	text = "moved " + logSelectedCards(selectedCards) + " from hand to " + 'cart'+id + ".";
	//when moved from player to cart
	move(selectedCards, 'hand','cart'+id)
		
	cart.cards.setCardSize("38","55");
	resetAllSelectedCards(player);
	updateCounts(text);
}

moveItemsBetweenCarts = function(prevId, id, selectedCartItems, actionCost) {
	var text = "";
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
	
	if($scope.selectedCartItemsCount > cart.size - cart.cards.playingCards.length){
		alert('Cannot move that many items into the cart.');
		return;
	}
	
	//move cart items to cart
	text = "moved " + logSelectedCards(selectedCartItems) + "from " + 'cart'+prevId + " to " + 'cart'+id + ".";
	move(selectedCartItems, 'cart'+prevId, 'cart'+id )
	
	resetAllSelectedCards(player);
	updateCounts(text);
	

}  

$scope.playerCartFish = function (id, actionCost) {
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];

	//if you have actions, discard selected cards	
	//var  selectedCount = 0;
	//var  cardCount = 0;

	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
		return;
	}	
	
	if($scope.selectedCartItemsCount != 1) {
		alert("You must select one card when fishing for a new one!")
		return;
	}
	
	//if cart cards are selected, move between carts else its player items to cart
	if($scope.selectedCartItemsCount > 0) {
		//var cart = player.carts[id];
		
		var cardNumber = getSelectedCard(cart.cards);
		text = "fished for a card.  Discarded a " + cardNumber + ".";
		fish(cardNumber, 'cart' + cart.id);

		//player.actionsRemaining -= actionCost;
		updateCounts(text);
		//checkItemsRemaining();
		//$scope.selectedCartItemsCount = 0;
		resetCartCardsSelected(player,-1);
		return;
	}
}

$scope.playerFish = function (actionCost) {
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var selectedCardCount = getSelectedCardcount(player.cards);

	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
		return;
	}	
	
	if(selectedCardCount != 1) {
		alert("You must select one card when fishing for a new one!")
		return;
	}

	//returns card selected
	var cardNumber = getSelectedCard(player.cards);

	text = "fished for a card.  Discarded a " + cardNumber + ".";
	//call backend fish
	fish(cardNumber, 'hand');
	resetAllSelectedCards(player);
	updateCounts(text);
}

$scope.playerDiscardFromCart = function (id, actionCost) {
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var cart = player.carts[id];
	var selectedCards = getSelectedCards(cart.cards);

	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
		return;
	}	

	if(getSelectedCardcount(cart.cards) === 0) {
		alert('Select some cart items to discard.');
		return;
	}
	
	//if cart cards are selected, move between carts else its player items to cart
	if($scope.selectedCartItemsCount > 0) {
		text = "discarded cards " + logSelectedCards(selectedCards) + " from " + 'cart'+id + ".";
		discard(selectedCards, 'cart'+id)
		updateCounts(text);
		resetCartCardsSelected(player,-1);
		return;
	}
}

$scope.playerDiscard = function (actionCost) {
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var selectedCardCount = getSelectedCardcount(player.cards);
	var selectedCards = getSelectedCards(player.cards);

	//if you have actions, discard selected cards, if not but have too many cards, discard anyway	
	var  cardCount = 0;

	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
		return;
	}	
	
	if(selectedCardCount === 0) {
		alert('Select some items to discard.');
		return;
	}
	
	//actually did a discard
	text = "discarded card(s) " + logSelectedCards(selectedCards) + " from hand.";
	discard(selectedCards, 'hand')
	resetAllSelectedCards(player);
	updateCounts(text);
}

$scope.playerBuyCart	= function(cartId, actionCost) {
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var total = player.cardSumSelected;
	var selectedCards = getSelectedCards(player.cards);
	var selectedCardCount = getSelectedCardcount(player.cards);
	var purchasedStatus = false;
	var purchaseType = null;
	var cart = player.carts[cartId];
	
	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
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
					text = "bought " + "cart" + cartId + " with items " + logSelectedCards(selectedCards) + ".";
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
					text = "bought " + "cart" + cartId + " with " + player.carts[cartId].goldCost + " gold.";
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
			text = "New Quest! - items(" + questItems + ") VP: " + card.vp + ".  Battle: " + card.name;
		}

		updateCounts(text);
	}
	
$scope.playerBuyAction = function(actionCost) {
		var player = $scope.activePlayer;
		var text = "";
		if(player.gold >= 2) {
			buyAction();
			text = "Bouught one Action for 2 gold.";
		}
		else {
			alert("Need more gold!");
			return;
		}
		
		updateCounts(text);
}

$scope.playerPass = function() {
	//make sure you discard down to max cards or you can't pass
	var game = $scope.game;
	var player = $scope.activePlayer;
	var discardSelectedCards = getSelectedCards(player.cards);
	var selectedCardCount = getSelectedCardcount(player.cards);
	var text = "";
	
	if(player.actionsRemaining > 0)	{
		var r = confirm("You are trying to pass with remaining actions - Continue?");
		if (r == true) {
			text += " passed with " + player.actionsRemaining +  " remaining actions.";
			discardSelectedCards = "";
		}
	}	
	else {
		if(player.cards.playingCards.length - selectedCardCount > player.maxHand) {	
			alert("Too many cards, select and discard!");
			return;
		}
		
		//if(player.cards.playingCards.length - selectedCardCount > player.maxHand) {	
		//	alert("Too many cards, select and discard!");
		//	return;
		//}

		if((player.cards.playingCards.length = player.maxHand) && selectedCardCount > 0) {
			//alert("You can only discard when you have actions remaining or need to remove cards to max hand size.");
			discardSelectedCards = "";
		}
		
		text = "passed";
		if (discardSelectedCards != "") {
			text += " and discarded cards " + logSelectedCards(discardSelectedCards) + ".";
		}
		else {
			text += ".";
		}
	}
	
	pass(discardSelectedCards);

	var card = game.marketDeck.playingCards[game.marketDeck.playingCards.length-1];
	text = "New Market Item! - (" + card.number + ")";


	$scope.selectedMarketTradeCount = 0;
	$scope.sumMarketValueSelected = 0;
	resetAllSelectedCards(player);
	
	//wipe out any potential market trades in progress
	game.marketDeckInTrade = new cardSet();
	updateCounts(text);
}

$scope.playerMarketTrade = function(actionCost) {
	//check if one to one or many to many
	var text = "";
	var game = $scope.game;
	var player = $scope.activePlayer;
	var selectedItemCards = getSelectedCards(player.cards);
	var selectedMarketCards = getSelectedCards(game.marketDeckInTrade);
	var selectedCardCount = getSelectedCardcount(player.cards);
	$scope.selectedItemsCount = selectedCardCount;
	
	if(player.actionsRemaining === 0 && actionCost ===1)	{
		alert("You have no actions.")
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
	
	//move player items to market
	marketTrade(selectedItemCards, selectedMarketCards);
	text = "Market trade with " + logSelectedCards(selectedItemCards) + ' for ' + logSelectedCards(selectedMarketCards) + "."
	//move market items to player
	//$scope.selectedItemsCount = 0;
	$scope.selectedMarketTradeCount = 0;
	$scope.sumMarketValueSelected = 0;
	
	game.marketDeckInTrade = new cardSet();

	resetPlayerCardsSelected(player);
	setMarketCounts();
	updateCounts(text);
}
	

updateCounts = function(text) {

	//sortPlayerCards();
	if(text!="") {
		$scope.playerslog.push(new PlayersLog($scope.playerslog.length, text));
		//alert(text);
	}
	//checkEndGameStatus();
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
			$scope.game.itemHolders.playingCards[j-1].count = cardCount;
	}

}




prepareEventForPlayer = function(questCardinplay) {	

	var player = $scope.activePlayer;
	if(player===null) {
		return;
	}
	if(questCardinplay.level==='4') {
		questCardinplay.cardImage.height = "350";
	}
	var cart = player.carts[0];
	
	switch (questCardinplay.name)
	{
			case 'eventOrcsAttack':
				//set variable for items in cart[0]
				$scope.eventActionsRemaining=1;
				$scope.wheelbarrowCardSum = getSelectedCardSum(cart.cards, false);
				if (total < 5) {
					//discard all items from cart to hand
					var cardsToMoveBackToHand = getSelectedCards(cart.cards,false);
					//fix event
					//cartDestroyed('cart0');
					move(cardsToMoveBackToHand, 'cart0', 'hand');
//					for (var i = 0; i < cart.cards.playingCards.length; ++i)  {
//						var card = cart.cards.playingCards[i];
//							//discard selected card(s)
//							player.cards.playingCards.push(card);
//							cart.cards.playingCards[i] = null;
						}
				
//						cart.cards.truncate();	
//						player.cards.setCardSize("60","80");
//						cart.active=false;
//						cart.image = player.carts[0].imageNotPurchased;
//					}
					
					
				
				break;
			case 'eventBarbarianAttack':
				$scope.eventActionsRemaining=0;
				break;
			case 'eventBrokenItems':
				$scope.eventActionsRemaining=2;
				break;
			case 'eventCastleTaxation':
				$scope.eventActionsRemaining=2;
				break;
			case 'eventGolbinRaid':
				break;
			case 'eventKingsFeast':
				$scope.eventActionsRemaining=1;
				break;
			case 'eventMarketShortage':
				$scope.eventActionsRemaining=0;
				break;
			case 'eventMarketSurplus':
				$scope.eventActionsRemaining=0;
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
				$scope.eventActionsRemaining=1;
				break;
			case 'eventVikingParade':
				break;
			default:
				resetDisplayMode('game');
	}
	
	$scope.displayMode = $scope.activeEvent;

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
					$scope.playerDiscard(actionCost);
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
					$scope.playerDiscard(actionCost);
				}
				else if(cardSelectedCount > 0 && $scope.selectedCartItemsCount > 0) {			
					$scope.playerDiscardFromCart(id, actionCost);
				}
				
				for (var j = 0; j < cardSelectedCount; ++j)  {
					//dealCardToPlayer(player, game.itemDeck);
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
	$scope.activePlayerId=0;
	$scope.activePlayer = game.players[$scope.activePlayerId];
	$scope.activePlayer.active = true;
	prepareEventForPlayer(questCardinplay, $scope.activePlayer);	
}


//sort player cart cards
sortPlayerCartCards = function(cart) {
	cart.cards.playingCards.sort(function (a,b) {return a.number-b.number});
}

//sort player quests
sortPlayerQuests = function() {
	$scope.activePlayer.questsCompleted.playingCards.sort(function (a,b) {return a.sortorder-b.sortorder});
}

resetPlayerCardsSelected =  function(player) {
	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];
		if(card===undefined) {
			break;
		}
		card.selected = false;
		card.borderColor = cardColor(card);
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
					}
					else {
						card.borderColor = cardColor(card);
					}
				}
//				$scope.activeCartId = id;
			}  
		else {
			for (var k = 0; k < player.carts[i].cards.playingCards.length; ++k)  {
				card = player.carts[i].cards.playingCards[k];
				card.selected = false;
				card.borderColor = cardColor(card);
			}
		}
	}
}

resetAllSelectedCards = function(player) {
	resetPlayerCardsSelected(player);
	resetCartCardsSelected(player,-1);
//	setCartActiveStatus(id);
//	$scope.activeCartId = -1;
//	$scope.prevActiveCartId = -1;

}

//sort player cards
sortPlayerCards = function() {
	$scope.activePlayer.cards.playingCards.sort(function (a,b) {return a.number-b.number});
}



var processGameStateCallback = function (data) {
	getObjectResults(data);
};

var processGameStateErrorCallback = function (returnVal) {
	alert("Error Occurred: " + returnVal);
};

 function getObjectResults(data) {
//class player(ndb.Model):
//		hand = ndb.IntegerProperty(repeated=True)
//		carts = ndb.LocalStructuredProperty(Cart, repeated=True)
//		gold = ndb.IntegerProperty(required=True, default=0)
//		points = ndb.IntegerProperty(required=True, default=0)
//		maxHand = ndb.IntegerProperty(required=True, default=5)
//		turns = ndb.IntegerProperty(required=True, default=0)

//class QuestCard(ndb.Model):
//    level = ndb.IntegerProperty(required=True)
//    coin = ndb.BooleanProperty(required=True, default=True)
//    items = ndb.IntegerProperty(repeated=True)
//    vp = ndb.IntegerProperty(required=True)
//    type = ndb.IntegerProperty(required=True)

//class Cart(ndb.Model):
//    purchased = ndb.BooleanProperty(required=True, default=False)
//    inCart = ndb.IntegerProperty(repeated=True)
//    cartSize = ndb.IntegerProperty(required=True)
//    goldCost = ndb.IntegerProperty(required=True)
//    cardCost = ndb.IntegerProperty(required=True)
//    destroyed = ndb.BooleanProperty(required=True, default=False)

//class Game(ndb.Model):
//    curPlayer = ndb.IntegerProperty(default=0)
//    actionsRemaining = ndb.IntegerProperty(default=2)        
//    numPlayers = ndb.IntegerProperty(required=True)
//    players = ndb.LocalStructuredProperty(Player, repeated=True)
//    itemDeck = ndb.IntegerProperty(repeated=True)
//    discardPile = ndb.IntegerProperty(repeated=True)
//    questDeck = ndb.LocalStructuredProperty(QuestCard, repeated=True)
//    market = ndb.IntegerProperty(repeated=True)
//    questsInPlay = ndb.LocalStructuredProperty(QuestCard, repeated=True)
		var text = "";
		$scope.isActive = data.isActive;
		$scope.activePlayer.active = data.isActive;
		$scope.activePlayer.actionsRemaining = data.actionsRemaining;
		$scope.activePlayer.gold = data.gold;
		$scope.activePlayer.turns = data.turns;
		$scope.activePlayer.vp = data.points;
		$scope.activePlayer.maxHand = data.maxHand;
		$scope.itemsCountRemaining = data.itemsCountRemaining;
		$scope.questsCountRemaining = data.questsCountRemaining;
		//$scope.activePlayerId = $scope.game.firstPlayer;	
		$scope.game.questsInPlay = new cardSet();
		$scope.game.marketDeck = new cardSet();
		$scope.activePlayer.cards =  new cardSet();
		$scope.activePlayer.questsCompleted =  new cardSet();
		$scope.activePlayer.carts[0].cards =  new cardSet();
		$scope.activePlayer.carts[1].cards =  new cardSet();
		$scope.activePlayer.carts[2].cards =  new cardSet();
		$scope.activePlayer.carts[3].cards =  new cardSet();		
		//$scope.game.questsInPlay.origWidth=100;
		//$scope.game.questsInPlay.origHeight=200;
		

        for (var i = 0; i < data.hand.length; ++i) {   
			dealNumberToPlayer($scope.game.players[$scope.activePlayerId], data.hand[i]);	
		}
		$scope.activePlayer.cards.setCardSize("60","80");

		
        for (var i = 0; i < data.market.length; ++i) {   
			dealNumberToMarket($scope.game.marketDeck, data.market[i]);	
		}
		setMarketCounts();

        for (var i = 0; i < data.questsInPlay.length; ++i) {   
			dealQuestCard($scope.game.questsInPlay, data.questsInPlay[i].items);
		}
		
		
		for (var i = 0; i < data.carts.length; ++i) {   
			updatePlayerCarts($scope.game.players[$scope.activePlayerId].carts[i], data.carts[i]);	
		}

        for (var i = 0; i < data.questsCompleted.length; ++i) {   
			dealQuestsCompleted($scope.game.players[$scope.activePlayerId].questsCompleted, data.questsCompleted[i].items);
		}
			
		
		
//		for (var i = 0; i < data.discardPile.length; ++i) {   
//			updateDiscardPile($scope.game.discardDeck, data.discardPile[i]);	
//		}

}


function loadData(numPlayers) {
     gameFactory.newGame(numPlayers, processGameStateCallback, processGameStateErrorCallback);
}

function pass(discard) {
     gameFactory.pass(discard, processGameStateCallback, processGameStateErrorCallback);
}

function move(what, src, dst) {
     gameFactory.move(what, src, dst, processGameStateCallback, processGameStateErrorCallback);
}

function fish(what, where) {
     gameFactory.fish(what, where, processGameStateCallback, processGameStateErrorCallback);
}

function discard(what, where) {
     gameFactory.discard(what, where, processGameStateCallback, processGameStateErrorCallback);
}

function buyCart(cart, goldFlag, items) {
     gameFactory.buyCart(cart, goldFlag, items, processGameStateCallback, processGameStateErrorCallback);
}

function buyAction() {
     gameFactory.buyAction(processGameStateCallback, processGameStateErrorCallback);
}

function marketTrade(handItems, marketItems) {
     gameFactory.marketTrade(handItems, marketItems, processGameStateCallback, processGameStateErrorCallback);
}

function completeQuest(cartItems, cart) {
     gameFactory.completeQuest(cartItems, cart, processGameStateCallback, processGameStateErrorCallback);
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
	updateCounts();
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
	updateCounts();
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