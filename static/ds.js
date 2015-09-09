// JavaScript source code
app = angular.module('dsApp', []);

//'ngAnimate'
var Cart = function (id, size, active, goldCost, itemCost, name, image) {
    this.id = id;
    this.size = size;
    this.active = active;
    this.selected = false;
    this.width=70;
    this.height=100;
    this.name = name;
    this.imagebase = image;
    this.purchaseWith = 'gold';
    this.image = image;
    this.goldCost = goldCost;
    this.itemCost = itemCost;
//    this.cards = new cardSet;
    this.borderColorNotBoughtInit = "#5c3e3c"
    this.borderColorInit = "#9c280b"
    this.borderColor = this.borderColorInit;
    
    //this.cards.setCardSize("120","135");
    
    if(this.active===0)
    {
	this.image += this.id + "_not_purchased.jpg"
    }
    else
    {
	this.image += this.id+ ".jpg"
    }

    //this.cont = [];
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
    this.firstPlayer = 0;
    this.startingActions = 2;
    this.startingCards = 5;
    this.marketStart = 4;
    this.questStart = 4;
    this.itemDeckStartCount = 75;
    this.sumMarketValueSelected = 0;
    this.selectedItemsCount = 0
    this.selectedMarketTradeCount = 0
    this.numOpponents = numOpponents;
    this.itemsCountRemaining = 0;
    this.questsCountRemaining = 0;
    this.discardsCount = 0;
    //this.cards = new cardSet();
    //this.quests = new questSet();
    //this.marketHolders = new cardSet();
    
    //this.cards.create75Cards();
    //this.marketHolders.createBlankMarket();
    //this.quests.createQuestDeck(this.numOpponents + 1);
    //this.itemDeck = new cardStack(0, 0, true, 'Item Deck');
    //this.discardDeck = new cardStack(0, 0, true, 'Waste pile');
    //this.questDeck = new cardStack(0, 0, true, 'Quests');
    //this.questsInPlayDeck = new cardStack(0, 0, true, 'Quests In Play');
    //this.marketDeck = new cardStack(0, 0, true, 'Market');
    //this.marketDeckInTrade = new cardSet();
    this.players = [];
    //this.cards.setCardSize("60","80");
    //this.marketHolders.setCardSize("60","80");
    //this.quests.setCardSize("auto","200");
    this.activePlayerId = this.firstPlayer;
    this.activePlayer = null;
    this.anyActionsRemaining = true;
    //this.lastDiscard = new playingCard();
}

var Player = function (id, name) {
    this.id = id;
    this.name = name;
    this.turns = 0;
    this.active = false;
//    this.cards = new cardStack(0, 0);
    //this.cards.cardsInStack.setCardSize("30","40");
    this.maxHand = 5;
//    this.questsCompleted = new cardStack(0, 0);
    this.gold = 10;
    this.vp = 0;
    this.cardSumSelected = 0;
    this.actionsRemaining = 2;
    this.nextCartId = 1;
    this.nextCartName = 'Hand Cart';
    //	this.sumItemsValueSelected = 0;
    this.carts = [new Cart(0, 3, 1, 0, 5,'Wheelbarrow','images/shoppercarts_v3_'), 
		  new Cart(1, 3, 0, 1, 10, 'Hand Cart', 'images/shoppercarts_v3_'), 
		  new Cart(2, 4, 0, 2, 15, 'Horse Wagon','images/shoppercarts_v3_'), 
		  new Cart(3, 5, 0, 3, 20, 'War Wagon','images/shoppercarts_v3_')];
};



app.controller('dsCtrl', ['$scope', function ($scope) {
    $scope.displayMode = "nogame";
    $scope.p1Name = "Player 1";
    $scope.p2Name = "Player 2";
    $scope.p3Name = "Player 3";
    $scope.p4Name = "Player 4";
    //$scope.playerCardSelected = function (index) { alert("item " + index); }
    //$scope.marketCardSelected = function (index) { alert("market " + index); }
    //$scope.otherCallback = function () { alert("DIFFERENT MESSAGE"); };

    var color = function(card) {
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
    
    $scope.userClickedItemImage = function(i) {
	var game = $scope.game;
	var player = game.activePlayer;
	var card = player.cards.cardsInStack[i];
	
	card.selected = !card.selected;
	card.borderColor = color(card);
	updatePlayerItemPoints();
	player.carts[player.nextCartId].purchaseWith = cardPurchaseWithText(player.nextCartId, player.cardSumSelected, player.carts[player.nextCartId].itemCost) ;
	if(card.selected){game.selectedItemsCount++} else {game.selectedItemsCount--}
    }

    
    cardPurchaseWithText = function(nextCartId, cardSumSelected, itemCost) {
	if (cardSumSelected >= itemCost) {
	    return 'items';	
	}
	else	{
	    return 'gold';
	}
    }

    
    $scope.userClickedMarketImage = function(i) {
	var game = $scope.game;
	var card = $scope.game.marketHolders.playingCards[i];
	card.selected = !card.selected;

	card.borderColor = 'black';
	card.count--

	//		var tradeCard = new playingCard();
	//		tradeCard.number=card.number;
	//		tradeCard.image=card.image;
	
	game.marketDeckInTrade.addCard(card.number, card.image, 1);
	game.marketDeckInTrade.setCardSize("60","80");
	updateMarketItemPoints(card.number);
	game.selectedMarketTradeCount++;
	//put card into trade section
	//updateCounts();
    }

    $scope.moveItemsToCart = function(id)
    {
	
	
	//check if one to one or many to many
	var game = $scope.game;
	var player = game.activePlayer;
	var cart = $scope.game.activePlayer.carts[id];
	if(player.actionsRemaining === 0)	{
	    alert("You have no actions.")
	    return;
	}	
	
	game.selectedItemsCount = 0;
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		game.selectedItemsCount++;
	    }
	}
	
	
	if(game.selectedItemsCount === 0){
	    alert('Select items to move to cart.');
	    return;
	}


	if(game.selectedItemsCount > cart.size - cart.cards.playingCards.length){
	    alert('Cannot move that many items into the cart.');
	    return;
	}
	
	
	//move player items to market
	cartSelectedCards(game.activePlayer, cart);
	
	//move market items to player
	game.selectedItemsCount = 0;

	player.actionsRemaining --;
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    card.selected = false;
	    card.borderColor = color(card);
	}
	
	cart.cards.setCardSize("38","55");
	updateCounts();
	
    }

    cartSelectedCards = function(player, cart){
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		//discard selected card(s)
		moveCardPlayerToCart(card, cart);
	    }
	}
	
	truncatePlayerCards(player);

	for (var i = 0; i < cart.cards.playingCards.length; ++i)  {
	    var card = cart.cards.playingCards[i];
	    card.selected=false;
	    card.borderColor = cartColor(cart);
	}
	
	
	updateCounts();
    }

    moveCardPlayerToCart = function(card, deck) {
	deck.cards.playingCards.push(card);

    }  

    
    

    $scope.userClickedMarketTradeImage = function(i) {
	
	var game = $scope.game;
	var card = $scope.game.marketDeckInTrade.playingCards[i];
	var marketCard = $scope.game.marketHolders.playingCards[card.number-1];
	//increase the number above the market card holder
	marketCard.count++;
	
	marketCard.selected = !marketCard.selected;
	game.marketDeckInTrade.playingCards[i] = null;
	game.marketDeckInTrade.truncate();
	game.selectedMarketTradeCount--;
	updateMarketItemPoints(-card.number);

    }
    
    updateMarketItemPoints = function(value) {
	var game = $scope.game;
	game.sumMarketValueSelected += value;
    }

    
    
    $scope.userClickedQuestImage = function(i) {
	var card = $scope.game.questsInPlayDeck.cardsInStack[i];
	card.selected = !card.selected;
	card.borderColor = color(card);
    }
    $scope.userClickedCartItem = function(id, i) {
	var card = $scope.game.activePlayer.carts[id].cards.playingCards[i];
	card.selected = !card.selected;
	card.borderColor = color(card);
    }

    $scope.userClickedCartImage = function(id) {
	var cart = $scope.game.activePlayer.carts[id];
	cart.selected = !cart.selected;
	cart.borderColor = cartColor(cart);
    }
    

    
    
    $scope.noGame = function () {
	$scope.displayMode = "nogame";
    }
    
    
    $scope.newGame = function (p1Name, p2Name, p3Name, p4Name, numberOfPlayers) {
	$scope.game = new Game(numberOfPlayers-1);
	$scope.p1Name = p1Name;	
	$scope.p2Name = p2Name;
	$scope.p3Name = p3Name;
	$scope.p4Name = p4Name;

//        $scope.game.cards.shuffleCards(10);

//	buildItemDeck();
	
	
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

	//populate quest card stack
//	var questLength = $scope.game.quests.playingCards.length;
//        for (var i = 0; i < questLength; ++i) {
//            var questCard = $scope.game.quests.playingCards[i];
//            $scope.game.questDeck.moveToStack(questCard);
//        }
	
	// deal five cards to players
//	for (var i = 0; i < $scope.game.startingCards; ++i) { 
//	    for (var j = 0; j < $scope.game.numOpponents + 1; ++j) { 
//		dealCardToPlayer($scope.game.players[j], $scope.game.itemDeck);	
//	    }
//	}
	
	//figure out who is going first by total item card points	
	var playerWithMostPoints = 0;
	var lastPlayertotalNumbers = 0;
	var totalNumbers = 0;
	//set the first player based on hight card values
/*	for (var j = 0; j < (numberOfPlayers) ; ++j) { // for each player
	    for (var c = 0; c < ($scope.game.players[j].cards.cardsInStack.length); ++c) { // for each card
		totalNumbers += parseInt($scope.game.players[j].cards.cardsInStack[c].number);  //get total points
	    }
	    
	    if(totalNumbers > lastPlayertotalNumbers)
	    {
		playerWithMostPoints = j;
		lastPlayertotalNumbers = totalNumbers;
	    }
	    $scope.game.firstPlayer = playerWithMostPoints;
	    totalNumbers=0;
	}*/
	
	
	//hand out extra card to non first player
/*	for (var x = 0; x < (numberOfPlayers) ; ++x) { 
            if (x === $scope.game.firstPlayer) {
                continue;
            }
	    dealCardToPlayer($scope.game.players[x], $scope.game.itemDeck);
        }  */
	
	//deal quests start
	/*for (var q = 0; q < ($scope.game.questStart) ; ++q) { 
	    dealCardToQuests($scope.game.questsInPlayDeck, $scope.game.questDeck);
	}

	//deal market start
	dealCardToMarket($scope.game.marketDeck, $scope.game.itemDeck, $scope.game.marketStart);*/
	
	$scope.game.activePlayerId = $scope.game.firstPlayer;	
	$scope.game.activePlayer = $scope.game.players[$scope.game.activePlayerId];			
	$scope.game.activePlayer.active = true;
	updateCounts();
	$scope.game.anyActionsRemaining = true;
	$scope.displayMode = "game";
	
    }

    checkItemsRemaining = function() {
	if($scope.game.itemsCountRemaining===0) {
	    return false;
	}
	else
	{return true;}
    }


    updatePlayerItemPoints = function() {
	var player = $scope.game.activePlayer;
	player.cardSumSelected = 0;
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card===undefined)
	    {continue;}
	    if(card.selected) {
		player.cardSumSelected += card.number;
	    }
	}
    }

    updateCounts = function() {
	
	var game = $scope.game;
	var player = game.activePlayer;

	if(player != null) {
	    setMarketCounts();
	    //player.cards.truncate();
	    
	    //updatePlayerItemPoints();


	    //add trunctate for all carts too to remove nulls before sorting
	    //fix me
	    //sortPlayerCards();
	    //sort items in carts
	    //getItemsCountRemaining();
	    //getQuestsCountRemaining();
	    //getDiscardsCount();
	    
	    checkActionsRemaining();
	}
	
    }	
    
    /*this function will:
      go through all cards in market card stack.
      add all $scope.game.market.playingCards[j-1].number and .count
      this array is what is used to show the market on the screen
    */	
    setMarketCounts = function() {
/*
	var cardCount =0;
	var marketLength = $scope.game.marketDeck.cardsInStack;
	for (var j=1; j<11; j++) {
	    cardCount = 0;
            for (var i = 0; i < marketLength.length; ++i) {
		var marketCard = $scope.game.marketDeck.cardsInStack[i];
		if(marketCard===null)
		{continue;}
		if(marketCard.number === j) {
		    cardCount++
		}
	    }
	    //add the item card and the count
	    if(cardCount > 0) {
		$scope.game.marketHolders.playingCards[j-1].count = cardCount;
		//console.log($scope.game.market.playingCards[j-1].number);
		//console.log($scope.game.market.playingCards[j-1].count);
	    }
	}*/

    }

    buildItemDeck = function() {
	$scope.game.itemDeck = new cardStack(0, 0, true, 'Item Deck');
	//populate items card stack
	for (var i = 0; i < $scope.game.itemDeckStartCount; ++i) {
	    var itemCard = $scope.game.cards.playingCards[i];
	    $scope.game.itemDeck.moveToStack(itemCard);
	}
    }


    //deal cards for initial game quests
    dealCardToQuests = function(questStack, questsInPlay){
	for (var i = 0; i < questsInPlay.cardsInStack.length; ++i) { // deal numberOfCards cards
	    var questCardinplay = questsInPlay.cardsInStack[i]; // get a reference to the first card on the deck
	    if (questCardinplay === null) {
		continue;
	    }
	    var nextQuest = questCardinplay.nextOnStack(); // get next reference
	    questStack.moveToStack(questCardinplay);
	    updateCounts();
	    questCardinplay = nextQuest;
	    break;
	}  

	$scope.game.questsInPlay = questStack;
	
    }


    //deal cards for initial market
    dealCardToMarket = function(market, items, count){
	var cardsDealt = 0;

	for (var i = 0; i < items.cardsInStack.length; ++i) { // deal count number of cards
	    var itemCard = items.cardsInStack[i]; // get a reference to the first card on the deck
	    if (itemCard === null) {
		continue;
	    }
	    
	    //check if deck needs reshuffle - must get this ref before moving card!
	    var nextCard = itemCard.nextOnStack(); 
	    
	    market.moveToStack(itemCard);
	    
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
    }	



    dealCardToPlayer = function(player, items) {
	for (var i = 0; i < items.cardsInStack.length; ++i) { 
	    var itemCard = items.cardsInStack[i]; // get a reference to the first card on the deck
	    if (itemCard === null) {
		continue;	
	    }

	    //check if deck needs reshuffle - must get this ref before moving card!
	    var nextPlayerCard = itemCard.nextOnStack(); 
	    
	    itemCard.moveToStack(player.cards); 	
	    
	    if(nextPlayerCard === undefined) {
		//got last card, need to shuffle, but you need to keep dealing cards after reshuffle!
		resetItemDeckAndMarket();
		return;
		
		//player.cards.truncate(); //to fix bug adding nulls to the player card deck - 
		//what is happening is after truncate of cards
		//return; - don't return here
	    }

	    updateCounts();
	    break;					
	}
    }  

    discardCardFromPlayer = function( discardCard, discardPile) {
	discardPile.cardsInStack.push(discardCard);
	$scope.game.lastDiscard = discardCard;
	updateCounts();
    }  

    discardCardFromMarket = function( discardCard, discardPile) {
	discardPile.cardsInStack.push(discardCard);
	$scope.game.lastDiscard = discardCard;
	updateCounts();
    }  



    //sort player cards
    sortPlayerCards = function() {
	$scope.game.activePlayer.cards.cardsInStack.sort(function (a,b) {return a.number-b.number});
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
    moveAllDiscardsToItemDeck = function(itemStack, discardStack){
	var nextPosition = 0;
	for (var i = 0; i < discardStack.cardsInStack.length; ++i) { // deal numberOfCards cards
	    var cardinplay = discardStack.cardsInStack[i]; // get a reference to the first card on the deck
	    if (cardinplay === null) {
		continue;
	    }
	    cardinplay.positionOnStack=nextPosition;
	    itemStack.moveToStack(cardinplay);
	    nextPosition++
	}  

	
    }

    resetItemDeckAndMarket = function() {
	//var count = 0;
	//alert(count++);
	var game = $scope.game;
	var player = game.activePlayer;
	player.cards.truncate();
	
	for (var i = 0; i < game.marketDeck.cardsInStack.length; ++i)  {
	    var card = game.marketDeck.cardsInStack[i];
	    discardCardFromMarket(card, game.discardDeck);
	}
	

	game.itemDeck = new cardStack(0, 0, true, 'Item Deck');	
	moveAllDiscardsToItemDeck(game.itemDeck, game.discardDeck);

	game.discardDeck = new cardStack(0, 0, true, 'Waste pile');
	
	//remove the nulls first
	//game.itemDeck.truncate();
	//game.itemDeck.shuffleCards(10);
	
	//deal market start
	game.marketHolders = new cardSet();
	game.marketHolders.createBlankMarket();
	game.marketDeck = new cardStack(0, 0, true, 'Market');
	dealCardToMarket(game.marketDeck, game.itemDeck, game.marketStart);
	game.marketHolders.setCardSize("60","80");
	
	//now finish dealing cards to player
	//draw new cards up to max hand

	for (var j = 0; j < player.maxHand + 1; ++j) { 
	    if(player.maxHand > player.cards.cardsInStack.length) {
		dealCardToPlayer(player, game.itemDeck);	
	    }
	    else {
		break;
	    }
	}
	updateCounts();
    }


    $scope.playerMarketTrade = function() {
	

	
	//check if one to one or many to many
	var game = $scope.game;
	var player = game.activePlayer;
	if(player.actionsRemaining === 0)	{
	    alert("You have no actions.")
	    return;
	}	
	
	game.selectedItemsCount = 0;
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		game.selectedItemsCount++;
	    }
	}
	
	
	if(game.selectedItemsCount === 0){
	    alert('Select items to trade.');
	    return;
	}

	if(game.selectedMarketTradeCount === 0){
	    alert('Select market items to trade.');
	    return;
	}


	if(game.selectedItemsCount > 1 && game.selectedMarketTradeCount > 1){
	    alert('Cannot do many to many trade.  De-select either your items or market items.');
	    return;
	}
	
	if(game.selectedItemsCount === 1 && game.selectedMarketTradeCount === 1){
	    alert('Cannot do single card trade.  Select more items.');
	    return;
	}
	if(game.sumMarketValueSelected != game.activePlayer.cardSumSelected) {
	    alert('Sum of items selected must be equal.  Items: ' + game.activePlayer.cardSumSelected + ' Market Items: ' + game.sumMarketValueSelected);
	    return;
	}
	
	//move player items to market
	tradeSelectedCards(game.activePlayer);
	
	//move market items to player
	game.selectedItemsCount = 0;
	game.selectedMarketTradeCount = 0;
	game.sumMarketValueSelected = 0;
	
	game.marketDeckInTrade = new cardSet();
	player.actionsRemaining --;
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    card.selected = false;
	    card.borderColor = color(card);
	}
	
	updateCounts();
	
    }

    tradeSelectedCards = function(player){
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		//discard selected card(s)
		tradeCardPlayerToMarket(card, $scope.game.marketDeck);
	    }
	}
	
	truncatePlayerCards(player);
	
	
	
	for (var i = 0; i < $scope.game.marketDeckInTrade.playingCards.length; ++i)  {
	    var card = $scope.game.marketDeckInTrade.playingCards[i];
	    
	    for (var j = 0; j < $scope.game.marketDeck.cardsInStack.length; ++j)  {
		var marketCard = $scope.game.marketDeck.cardsInStack[j];
		if (marketCard === null) {
		    continue;
		}
		if(card.number === marketCard.number) {
		    tradeCardMarketToPlayer( marketCard, player.cards);
		    break;
		}
	    }

	    
	}

	
	updateCounts();
    }

    tradeCardPlayerToMarket = function(card, deck) {
	deck.cardsInStack.push(card);

    }  

    tradeCardMarketToPlayer = function(card, deck) {
	card.moveToStack(deck);

    }  


    getItemsCountRemaining = function() {
	var count = 0;
	for (var i = 0; i < $scope.game.itemDeck.cardsInStack.length; ++i) { 
	    var itemsCard = $scope.game.itemDeck.cardsInStack[i]; // get a reference to the first card on the deck
	    if (itemsCard === null) {
		continue;
	    }
            count++;
        } 
	
	$scope.game.itemsCountRemaining = count;
	
    }	

    getQuestsCountRemaining = function() {
	var count = 0;
	for (var i = 0; i < $scope.game.questDeck.cardsInStack.length; ++i) { 
	    var questCard = $scope.game.questDeck.cardsInStack[i]; // get a reference to the first card on the deck
	    if (questCard === null) {
		continue;
	    }
            count++;
        } 
	
	$scope.game.questsCountRemaining = count;
	
    }	

    getDiscardsCount = function() {
	var count = 0;
	for (var i = 0; i < $scope.game.discardDeck.cardsInStack.length; ++i) { 
	    var discardCard = $scope.game.discardDeck.cardsInStack[i]; // get a reference to the first card on the deck
	    if (discardCard === null) {
		continue;
	    }
            count++;
        } 
	$scope.game.discardsCount = count;
    }

    $scope.playerFish = function () {
	var player = $scope.game.activePlayer;
	var selectedCount = 0;

	if(player.actionsRemaining === 0)	{
	    alert("You have no actions.")
	    return;
	}	
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		selectedCount++;
	    }
	}
	if(selectedCount != 1) {
	    alert("You must select one card when fishing for a new one!")
	    return;
	}

	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		break;
	    }
	}
	
	//discard selected card
	discardCardFromPlayer( card, $scope.game.discardDeck);

	truncatePlayerCards(player);

	//get new card
	dealCardToPlayer(player, $scope.game.itemDeck)

	//remove action
	player.actionsRemaining --;
	//check if zero actions and highlight button to take another action if they have gold >= 2
	updateCounts();
	checkItemsRemaining();
    }



    
    $scope.playerBuyAction = function () {
	if($scope.game.players[$scope.game.activePlayerId].gold >= 2) {
	    payGold($scope.game.players[$scope.game.activePlayerId],2);
	    $scope.game.players[$scope.game.activePlayerId].actionsRemaining ++;
	}
	else{
	    alert("Need more gold!");
	    return;
	}
	updateCounts();
    }

    $scope.playerDiscard = function () {
	var player = $scope.game.activePlayer;
	//if you have actions, discard selected cards	
	var  selectedCount = 0;
	var  cardCount = 0;

	
	if(player.actionsRemaining === 0)	{
	    for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
		var card = player.cards.cardsInStack[i];
		if(card != null && card != undefined) {
		    cardCount++;
		}
	    }
	    
	    if(cardCount <= player.maxHand)	{
		alert("You have no actions.");
		return;
	    }
	}
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		selectedCount++;
	    }
	}

	//if player cards is more than maxhand and no actions, and selected cards does not bring down to max hand, alert
	if(player.cards.cardsInStack.length > player.maxHand) {
	    if(player.actionsRemaining === 0)	{
		if(player.cards.cardsInStack.length - selectedCount != player.maxHand) {
		    alert("You have no actions, you can't discard more than max hand: "+ player.maxHand + " cards.");
		    return;
		    //you have no actions, you can't discard more than max hand
		}
	    }
	}
	
	//actuall did a discard
	removeSelectedCards(player);

	if(player.actionsRemaining > 0 && selectedCount > 0) {	
	    player.actionsRemaining --;
	}
	

	updateCounts();
	checkItemsRemaining();
	
    }





    $scope.playerPass = function() {
	//make sure you discard down to max cards or you can't pass
	//var cardIndex = 0;
	var game = $scope.game;
	var player = game.activePlayer;
	player.cards.truncate();

	
	if(player.cards.cardsInStack.length > player.maxHand) {
	    alert("Too many cards, select and discard!")
	    return;
	}

	//add one card to market
	dealCardToMarket(game.marketDeck, game.itemDeck,1);
	
	//	var len=0
	//	for (var j = 0; j <= player.cards.cardsInStack.length; ++j) {
	//		if(player.cards.cardsInStack[j] === undefined)
	//	}
	//draw new cards up to max hand
	for (var j = 0; j < player.maxHand + 1; ++j) { 
	    if(player.maxHand > player.cards.cardsInStack.length) {
		dealCardToPlayer(player, game.itemDeck);	
	    }
	    else {
		break;
	    }
	}
	
	player.actionsRemaining = 0;
	player.active = false;
	
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    card.selected = false;
	    card.borderColor = color(card);
	}
	
	game.selectedItemsCount = 0;
	game.selectedMarketTradeCount = 0;
	game.sumMarketValueSelected = 0;
	game.marketDeckInTrade = new cardSet();
	player.turns ++;
	//active next player
	updateCounts();
	checkItemsRemaining();
	activateNextPlayer();
    }

    var nextCartName = function(cartId) {
	if(cartId === 1)
	    return 'Horse Wagon';

	if(cartId === 2)
	    return 'War Wagon';
    }
    
    $scope.playerBuyCart	= function(cartId) {

	var total = 0;
	var player = $scope.game.activePlayer;
	
	if(player.actionsRemaining > 0) {
	    for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
		var card = player.cards.cardsInStack[i];
		if(card.selected) {
		    total += card.number;
		    //discard selected card(s)
		    discardCardFromPlayer( card, $scope.game.discardDeck);
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
		removeSelectedCards(player);
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
	    var newImage = cart.imagebase + cart.id + '.jpg';
	    player.nextCartId ++;
	    player.carts[cartId].active=1;
	    player.carts[cartId].image = newImage;
	    player.nextCartName = nextCartName(cartId);
	    if(purchaseType==="gold") {
		player.gold -=player.carts[cartId].goldCost;
	    }
	    if(cart.id === 1) {
		$scope.game.activePlayer.vp += 1;
		dealCardToQuests($scope.game.questsInPlayDeck, $scope.game.questDeck);
		
	    }

	    if(cart.id === 2) {
		player.vp += 3;
	    }
	    
	    if(cart.id === 3) {
		player.maxHand = 6;
	    }
	    
	    player.actionsRemaining --;
	    updateCounts();
	    checkItemsRemaining();
	}
	
    }
    activateNextPlayer = function(){
	if( $scope.game.activePlayer.id === $scope.game.numOpponents) {
	    $scope.game.activePlayerId=0;
	}
	else {
	    $scope.game.activePlayerId++;
	}
	
	$scope.game.activePlayer = $scope.game.players[$scope.game.activePlayerId];
	$scope.game.players[$scope.game.activePlayerId].actionsRemaining = $scope.game.startingActions;
	$scope.game.activePlayer.active = true;
	updateCounts();
    }

    removeSelectedCards = function(player){
	
	for (var i = 0; i < player.cards.cardsInStack.length; ++i)  {
	    var card = player.cards.cardsInStack[i];
	    if(card.selected) {
		//discard selected card(s)
		discardCardFromPlayer( card, $scope.game.discardDeck);
	    }
	}
	truncatePlayerCards(player);
    }

    truncatePlayerCards = function(player) {
	for (var i = 0; i < player.cards.cardsInStack.length; ++i) { 
	    if(player.cards.cardsInStack[i].selected) {
		player.cards.cardsInStack[i] = null;
	    }
	}
	player.cards.truncate();
    }

    checkActionsRemaining = function()  {
	if ($scope.game.activePlayer.actionsRemaining === 0) {
	    $scope.game.anyActionsRemaining =false;
	}
	else {
	    $scope.game.anyActionsRemaining =true;
	}
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
}).directive("myDirective", function () {
    return {
	restrict: 'A',
	link: function (scope, element, attr){
	    element.bind('click', function (){
		if (typeof scope[attr.myDirective] == "function"){
		    scope[attr.myDirective]();
		}
	    });
	}
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


