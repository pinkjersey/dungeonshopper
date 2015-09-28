app.controller('dsCtrl', ['$scope', 'gameFactory', function ($scope, gameFactory) {

	$scope.hideImagesBool = false;
	$scope.debug = false;
	$scope.autoSelectHand = true;
	$scope.autoSelectCart = true;
	$scope.autoSelectQuest = true;
	$scope.autoPass = true;
	$scope.playersCompletedEventCount = 0;
	//$scope.eventActionsRemaining=0;;
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
	$scope.showLog = false;
	$scope.showLogText = "Show Players Log";
	$scope.blankText = "";
	//$scope.dots="...";
	//gui variable to control cart buttons
	$scope.prevActiveCartId = -1;
	$scope.activeCartId = -1;
	$scope.borderPXselected = "border:3px solid red";
	$scope.borderPX = "border:1px solid black";
	$scope.borderPXorig = "border:1px solid black";
	$scope.showOtherPlayerData = false;
	$scope.showMyCompletedQuests = false;
	$scope.showHideVar = "Show";
	$scope.showHideQuestVar = "Show";
	$scope.playerFishButton=false;



	$scope.noGame = function () {
		setupNoGame();
	}

	$scope.debugCheck = function () {
		$scope.debug = !$scope.debug;
	}		

	$scope.autoSelectCartCheck = function () {
		$scope.autoSelectCart = !$scope.autoSelectCart;
	}	
	
	$scope.autoSelectHandCheck = function () {
		$scope.autoSelectHand = !$scope.autoSelectHand;
	}	
	
	$scope.autoSelectQuestCheck = function () {
		$scope.autoSelectQuest = !$scope.autoSelectQuest;
	}	

	$scope.autoPassCheck = function () {
		$scope.autoPass = !$scope.autoPass;
	}	


	$scope.hideImagesCheck = function () {
		$scope.hideImagesBool = !$scope.hideImagesBool;
	}	
	
var cardColor = function(card) {
	if(card.selected) {
		return $scope.borderPXselected; //red
	}
	else {
		return $scope.borderPXorig; //black
	}
}

	//setup splash screen
	setupNoGame = function() {
		$scope.displayMode = "nogame";
		$scope.playerName="Player";
		$scope.numberOfPlayers =1;
		$scope.playerId = 0;
		$scope.game=null;
		hideImages($scope);
	}	

	setupNoGame();
	
	$scope.joinGame = function(playerName, playerId) {
		$scope.myId = playerId;
		hideImages($scope);
		$scope.game = new Game($scope.blankMarketImageBase, $scope.questImageBase,$scope.cartImageBase);
		joinGame(playerId, playerName);
		$scope.events = prepEvents();
	}
	
	$scope.newGame = function (numberOfPlayers, playerName) {
		$scope.numberOfPlayers = Number(numberOfPlayers);
		$scope.myId = 0;
		hideImages($scope);
		$scope.game = new Game($scope.blankMarketImageBase, $scope.questImageBase,$scope.cartImageBase);
		newGame(numberOfPlayers, playerName);
		play("cards");
		$scope.events = prepEvents();
	}

	//refresh data from backend if anything is stuck
	$scope.playerRefresh = function() {
		playerRefresh($scope.myId);
		$scope.loadingData=false;
	}

	//interval method to update game spectators
   	function startInterval(params) {
        $scope.timerId = setInterval(function () { 
			if($scope.isActive===false) {
				if($scope.myId != undefined) {
					$scope.playerRefresh();
				}
			}

		}	, params	)
	}

    //this is the initial load spectator refresh 
    $(document).ready(); {
        startInterval(2000);
    }

	$scope.showOtherPlayerDataClick = function () {
		$scope.showOtherPlayerData = !$scope.showOtherPlayerData;
		$scope.showHideVar = showHide($scope.showOtherPlayerData);
	}

	$scope.showMyCompletedQuestsClick = function () {
		$scope.showMyCompletedQuests = !$scope.showMyCompletedQuests;
		$scope.showHideQuestVar = showHideQuests($scope.showMyCompletedQuests);
	}
	
	$scope.showLogResults = function() {
		if(!$scope.showLog) {
			$scope.showLogText = "Hide Players Log";
		}else {
			$scope.showLogText = "Show Players Log";
		}
		$scope.showLog = !$scope.showLog;
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

	$scope.userClickedMarketImage = function(i) {
		if(!$scope.isActive){return;}
		var game = $scope.game;
		var card = game.itemMarketHolders.playingCards[i];
		card.selected = !card.selected;
		card.count--;
		card.setCountImage(card.count);
		card.setCardSize("orig");
		
		game.marketDeckInTrade.addCardc(card);
		var len = game.marketDeckInTrade.playingCards.length - 1;
		game.marketDeckInTrade.playingCards[len].selected = true;
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

	gameEnd = function() {
		$scope.displayMode = "gameover";
		$scope.displayModeName = "Game Over";
		clearInterval($scope.timerId);
		$scope.loadingData=false;
	}
	
	selectHandCards = function(cardArray) {
		var nextItem = 0;
		for (var a=0; a < cardArray.length; ++a) {
			itemNumber = cardArray[a]*-1;
			for (var d=nextItem;d < $scope.activePlayer.cards.playingCards.length; ++d) {
				nextItem++;
				if(itemNumber === $scope.activePlayer.cards.playingCards[d].number) {
					$scope.userClickedItemImage(d);
					break;
					
				}
			}
		}
	}

	$scope.playerCompleteQuest = function(id) {
		var game = $scope.game;
		var player = $scope.activePlayer;
		var questClicked = game.questsInPlay.playingCards[id];
		var questCanBeCompleted = false;

		if($scope.activeCartId < 0 )	{
			alert("Select a cart with items first.");
			return;
		}

		var cart = player.carts[$scope.activeCartId];

		if($scope.selectedCartItemsCount < 3 || cart.cards.playingCards.length != $scope.selectedCartItemsCount) {
			alert("Select all items in cart/wagon first.");
			return;
			}
			
		var selectedCards = getSelectedCards(cart.cards, true);
		var questCards = getSelectedCardArrayForQuest(cart.cards);
		var items =  new Array(questClicked.item1, questClicked.item2, questClicked.item3, questClicked.item4, questClicked.item5);
		
		if (parseSelectedCardArrayForQuest(questCards) === parseSelectedCardArrayForQuest(items) ){
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

	$scope.userClickedItemImage = function(id) {
		if(!$scope.isActive){return;}
		var player = $scope.activePlayer;
		var card = player.cards.playingCards[id];
		resetCartCardsSelected(player, -1);
		card.selected = !card.selected;
		card.borderColor = cardColor(card);	
		playerCardChecked(card);
		player.cardSumSelected = getSelectedCardSum(player.cards, true);
		$scope.selectedItemsCount = getSelectedCardcount(player.cards);
		updatePurchaseText(player.cardSumSelected);
		play("button");
	}

	updatePurchaseText = function(playerCardSumSelected){
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

	updateDiscardPile = function(game, number) {
		for (var i = 0; i < game.itemHolders.playingCards.length; ++i)  {
			var card = game.itemHolders.playingCards[i];
			card.setCardSize("large");
				if(card.number === number) {
					$scope.lastDiscard = card;				
					break;
			}
		}
	}

	$scope.moveItemsToCart = function(id ) {
		if(!$scope.isActive){return;}
		//check if one to one or many to many
		setCartActiveStatus(id);
		var player = $scope.activePlayer;
		var selectedCards = getSelectedCards(player.cards, true);
		var selectedCardCount = getSelectedCardcount(player.cards);
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
		
		//when moved from player to cart
		move(selectedCards, 'hand','cart'+id)
			
		cart.cards.setCardSize("small");
		resetAllSelectedCards(player);
		play("swords");
	}

	moveItemsBetweenCarts = function(prevId, id, selectedCartItems ) {
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
		move(selectedCartItems, 'cart'+prevId, 'cart'+id )
		
		cart.cards.setCardSize("small");
		resetAllSelectedCards(player);
	}  

	$scope.playerCartFish = function (id) {
		if(!$scope.isActive){return;}
		var player = $scope.activePlayer;
		var cart = player.carts[id];

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
			
			var card = getSelectedCard(cart.cards);
			
			var r =  confirm("Discard the " + card.name + "? Fish for a new card?");
			if(r===true) {
				fish(card.number, 'cart' + cart.id);
			}
			else {
				return;
			}

			resetCartCardsSelected(player,-1);
			play("fish");
			return;
		}
	}

	$scope.playerFish = function (id) {
		if(!$scope.isActive){return;}
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
		var card = getSelectedCard(player.cards);

		var r =  confirm("Discard the " + card.name + "? Fish for a new card?");
		if(r===true) {
			fish(card.number, 'hand');
		}
		else {
			return;
		}

		resetAllSelectedCards(player);
		play("fish");
	}

	$scope.playerDiscardFromCart = function (id) {
		if(!$scope.isActive){return;}
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

			var r =  confirm("Are you sure you want discard?");
			if(r===true) {
				discard(selectedCards, 'cart'+id)
			}
			else {
				return;
			}

			resetCartCardsSelected(player,-1);
			play("trash");
			return;
		}
	}

	$scope.playerDiscard = function () {
		if(!$scope.isActive){return;}
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
		
		var r =  confirm("Are you sure you want discard?");
		if(r===true) {
			discard(selectedCards, 'hand');
		}
		else {
			return;
		}

		resetAllSelectedCards(player);
		play("trash");

	}
		
	$scope.playerBuyCart	= function(cartId) {
		if(!$scope.isActive){return;}
		var game = $scope.game;
		var player = $scope.activePlayer;
		var total = player.cardSumSelected;
		var selectedCards = getSelectedCards(player.cards, true);
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
						buyCart('cart'+cartId, 0, selectedCards);
					}
					else {
						return;
					}

			}
			else
			{
				if(player.gold >= player.carts[cartId].goldCost) {
				var r = confirm("Confirm purchase with gold!");
					if (r == true) {
						buyCart('cart'+cartId, 1, "");
					}
					else {
						return;
					}

				}
			}			

			resetAllSelectedCards(player);
			if(cartId===1) {
				play("buyCart");
			}
			if(cartId===2) {
				play("horseNeigh");
			}
			if(cartId===3) {
				play("buyCart");
			}
		}
		
	$scope.playerBuyAction = function() {
		if(!$scope.isActive){return;}
		var player = $scope.activePlayer;
		if(player.gold >= 2) {
			var r =  confirm("This will cost you 2 gold!  Confirm?");
			if(r===true) {
				buyAction();
			}
			else {
				return;
			}
		}
		else {
			alert("Need more gold!");
			return;
		}
		
		play("market");
	}

	$scope.playerPass = function() {
		if(!$scope.isActive){return;}
		//make sure you discard down to max cards or you can't pass
		var game = $scope.game;
		var player = $scope.activePlayer;
		var discardSelectedCards = getSelectedCards(player.cards, true);
		var selectedCardCount = getSelectedCardcount(player.cards);
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
					resetAllSelectedCards(player);
					return;
				}
			}

			
			if((player.cards.playingCards.length <= player.maxHand) && selectedCardCount > 0) {
				//alert("You can only discard when you have actions remaining or need to remove cards to max hand size.");
				discardSelectedCards = "";
			}
			
		}
		
		pass(discardSelectedCards);

		$scope.selectedMarketTradeCount = 0;
		$scope.sumMarketValueSelected = 0;
		resetAllSelectedCards(player);
		
		//wipe out any potential market trades in progress
		game.marketDeckInTrade = new cardSet();
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
		setMarketCounts(game);
		//updateLog(text);
		play("market");
	}
	
	prepareEventForPlayer = function(game, questCardinplay) {	

		$scope.playerPaidWithItems=0;
		var player = $scope.activePlayer;
		var cart = player.carts[0];
		$scope.wheelbarrowCardSum = getSelectedCardSum(cart.cards, false);
		
		if(player===null) {
			return;
		}
		
		if(questCardinplay.level===4) {
			questCardinplay.setCardSize("large");
		}

		
		switch (questCardinplay.name)
		{
				case 'eventOrcsAttack':
					if ($scope.wheelbarrowCardSum > 0  && $scope.wheelbarrowCardSum < 5) {
						//discard all items from cart to hand
						var cardsToMoveBackToHand = getSelectedCards(cart.cards,false);
						move(cardsToMoveBackToHand, 'cart0', 'hand');
						}					
					
					break;
				case 'eventBarbarianAttack':
				//market has been destroyed
					break;
				case 'eventBrokenItems':
					break;
				case 'eventCastleTaxation':
				//player is broke allow to complete
					if($scope.activePlayer.gold === 0 && playerItemCards === 0 && playerCartItemCards === 0) {
						$scope.playerPaidWithItems=2;
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
					break;
				case 'eventVikingParade':
					break;
				default:
					resetDisplayMode('game');
		}
		
		resetDisplayMode(game.activeEvent);
		//deselect all cards
		resetAllSelectedCards($scope.activePlayer);
		
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
				$scope.displayModeName = mode;
				if($scope.isActive) {
					$scope.displayModeName = " - Your Turn";
				}
				else {
					$scope.displayModeName = " - Game Spectating";
				}
				
		}
	}
	
	
	checkIfPlayerHas123InHand = function(playerItemCards) {
		for (var i = 0; i < playerItemCards.length; ++i)  {
			var card = playerItemCards.playingCards[i];
			if(card.number < 4) {
				return true;
			}
		}
		return false;
	}

	$scope.moveItemsBetweenCartsEvent = function(id) {
		var player = $scope.activePlayer;
		var cart = player.carts[id];
		$scope.activeCartId = id;
		
		if($scope.selectedCartItemsCount === 0){
			alert('Select items to move between cart.');
			return;
		}	
		
		if($scope.selectedCartItemsCount > cart.size - cart.cards.playingCards.length){
			alert('Cannot move that many items into the cart.');
			return;
		}
		play("swords");
	}  
	
	$scope.userClickedCartItemEvent = function (cartId, cardIndex) {
		if(!$scope.isActive){return;}
		setCartActiveStatus(cartId);
		var player = $scope.activePlayer;
		var card = player.carts[cartId].cards.playingCards[cardIndex];
		var cart = player.carts[cartId];
		
		card.selected = !card.selected;
		card.borderColor = cardColor(card);
		cartCardChecked(card);
	
		cart.cardSumSelected = getSelectedCardSum(cart.cards, true);
		resetCartCardsSelected(player, cartId);
		play("button");
	}
	
	$scope.userClickedItemImageEvent = function (cardIndex) {
		if(!$scope.isActive){return;}
		var player = $scope.activePlayer;
		var card = player.cards.playingCards[cardIndex];
		card.selected = !card.selected;
		card.borderColor = cardColor(card);	
		playerCardChecked(card);
		player.cardSumSelected = getSelectedCardSum(player.cards, true);
		$scope.selectedItemsCount = getSelectedCardcount(player.cards);
		play("button");
	}
	
	$scope.playerCompleteEvent = function(index, id) {
		if(!$scope.isActive){return;}
		var game = $scope.game;
		var player = $scope.activePlayer;
		var playerCardCount = player.cards.playingCards.length;
		var playerCardsSum = getSelectedCardSum(player.cards, false);
		var playerCardsSumSelected = getSelectedCardSum(player.cards, true);
		var questCardinplay = game.questsInPlay.playingCards[index];
		var event = $scope.game.activeEvent;
		var selectedItemCards = getSelectedCards(player.cards, true);
		var playerItemCards = getSelectedCards(player.cards, false);
		var destroyCart = 'cart0';
		var playerHas123InHand = checkIfPlayerHas123InHand(player.cards);
		var gold = 0;
		var playerCardCountSel = getSelectedCardcount(player.cards);
		var cart0CardCountSel = getSelectedCardcount(player.carts[0].cards);
		var cart1CardCountSel = getSelectedCardcount(player.carts[1].cards);
		var cart2CardCountSel = getSelectedCardcount(player.carts[2].cards);
		var cart3CardCountSel = getSelectedCardcount(player.carts[3].cards);
		var totalCardsSelected = playerCardCountSel+cart0CardCountSel +cart1CardCountSel +cart2CardCountSel +cart3CardCountSel ;
		var eventId = "";
		var what1 = "";
		var where1="";
		var what2 = "";
		var where2="";
		var card="";
		var whatWhereArray = [];
		var found = false;
		var dest1 = "";
	/*events.push(new Event(6,"BarbarianAttack"));
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
*/
			switch (event) {
				case 'eventBarbarianAttack':
					eventId = 6;
					//market has been destroyed
					break;
				case 'eventBrokenItems':
					eventId = 7;
					//discard with no actions from hand or cart
					if(totalCardsSelected > 2) {
						alert("You may only select none, one or two items to replace.");
						return;
					}
					if(totalCardsSelected ===  0) {
						break;
					}
					if(playerCardCountSel >= 1) {
						//what1 = getSelectedCard(player.cards)
						//where1 = 'hand'
						whatWhereArray.push(getSelectedCards(player.cards, true));
						whatWhereArray.push('hand');
					}
					for (var i = 0; i < player.carts.length; ++i)  {
						var cart = player.carts[i];
						if(cart.active) {
							var cartCards = getSelectedCardcount(player.carts[i].cards);
							if(cartCards > 0) {
								whatWhereArray.push(getSelectedCards(player.carts[i].cards, true));
								whatWhereArray.push('cart' + i);
							}
						}
					}	

					what1=whatWhereArray.shift();
					where1=whatWhereArray.shift();
					what2=whatWhereArray.shift();
					where2=whatWhereArray.shift();
					break;

				case 'eventCastleTaxation':
					 eventId = 8;
					//discard with no actions from hand only
					if($scope.activePlayer.gold === 0 && playerItemCards === 0 && playerCartItemCards === 0) {
						gold = 0;
						break;
					}

					if(id==="items") {
						gold = 0;
						break;
					}
					if(id==="gold") {
						if(player.gold > 0) {
							gold = 1;							
						}
						else{
							alert("You do not have enough gold for taxation, you must lose items.");
							return;
						}
					}
					

					if(playerItemCards >= 2 && playerCardCountSel < 2) {
						alert("You must select 2 items for taxes.");
						return;
					}

					if(playerItemCards >= 2 && playerCardCountSel===2) {
						what1 = selectedItemCards;
						where1 = 'hand'
						break;
					}
					if(playerItemCards === 1 && playerCardCountSel===0) {
						alert("You must select your only card item for taxes.");
						return;
					}
					if(playerItemCards === 1 && playerCardCountSel===1) {
						what1 = selectedItemCards;
						where1 = 'hand';
						break;
					}
			
					break;
			

				case 'eventGolbinRaid':	
					eventId = 9;
					if(totalCardsSelected > 1) {
						alert("You may only select one cart item to lose to the Goblins.");
						return;
					}
					for (var i = 0; i < player.carts.length; ++i)  {
						if(found) {
							break;
						}
						var cart = player.carts[i];
						if(cart.active) {
							var cartCards = getSelectedCardcount(player.carts[i].cards);
							if(cartCards > 0) {
								whatWhereArray.push(getSelectedCards(player.carts[i].cards, true));
								whatWhereArray.push('cart' + i);
								found = true;
								break;
							}
						}
					}
					what1=whatWhereArray.shift();
					where1=whatWhereArray.shift();
					
					break;
				case 'eventKingsFeast':
					eventId = 10;
					break;
				case 'eventMarketShortage':
					eventId = 11;
					break;
				case 'eventMarketSurplus':
					eventId = 12;
					break;
				case 'eventOrcsAttack':
					eventId = 13;
					if(id==='Y') {
						if(playerCardsSumSelected < 5){
								alert("You do not have enough items selected.");
								return;
						}
						
						if($scope.selectedItemsCount > 0 && playerCardsSumSelected >= 5) {			
							if(playerItemCards === 1 && playerCardCountSel===1) {
								what1 = selectedItemCards;
								where1 = 'hand';
								break;
							}	
						}					
					}
					else if(id==='N') {
						//do nothing, nothing was destroyed
					}
					else if(id==='X') {
						//let it be destroyed
						var selectedItemCards = "";
					}					
					
					//send in eventid, send in items to buy cart back with
					//the prepevents already moved the cards back to hand first
					break;
					
				case 'eventSandStorm':
					eventId = 14;
					break;
				case 'eventHailStorm':
					eventId = 18;
					break;
				case 'eventHiddenRoom':
					eventId = 19;
					break;
				case 'eventThrownInTheDungeon':
				
					eventId = 15;
					if($scope.selectedItemsCount === 0 && checkIfPlayerHas123InHand){
						alert("Select one item - Club, Shield or Hammer to lose.");
						return;
					}
					else {
						break;
					}
					if($scope.selectedItemsCount > 0 && checkIfPlayerHas123InHand && playerCardsSumSelected > 3) {
						alert("Select one item - Club, Shield or Hammer to lose.");
						return;
					}
					if($scope.selectedItemsCount > 0 && checkIfPlayerHas123InHand) {			
						if(playerCardCountSel===1) {
							what1 = selectedItemCards;
							where1 = 'hand';
							break;
						}
					}
			
					break;
				case 'eventTreasure':
					//give active player a gold
					eventId = 16;
					gold = 1;
					break;
				case 'eventVikingParade':
					eventId = 17;
					for (var i = 0; i < player.carts.length; ++i)  {
						if(found) {
							break;
						}
						var cart = player.carts[i];
						if(cart.active) {
							var cartCards = getSelectedCardcount(player.carts[i].cards);
							if(cartCards > 0) {
								whatWhereArray.push(getSelectedCards(player.carts[i].cards, true));
								whatWhereArray.push('cart' + i);
								found = true;
								break;
							}
						}
					}
					what1=whatWhereArray.shift();
					where1=whatWhereArray.shift();
					dest1='cart' + $scope.activeCartId;
					break;
				default:
					resetDisplayMode('game');
			}
			
			if(what1===undefined) {what1=""}
			if(where1===undefined) {where1=""}
			if(what2===undefined) {what2=""}
			if(where2===undefined) {where2=""}
			if(dest1===undefined) {dest1=""}
			completeEvent(eventId, destroyCart, gold, what1, where1, what2, where2, dest1);
			resetPlayerCardsSelected(player);
			//resetDisplayMode('game');
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
	

	var processGameStateCallback = function (data) {
		getObjectResults(data);
	};

	var processGameStateErrorCallback = function (returnVal) {
		$scope.loadingData=true;
		alert("Error Occurred: " + returnVal);
	};

	function getObjectResults(data) {
		var text = "";
		var game = $scope.game;
		// players = game.players;
		//this controls the buttons to return if you are not active
		//already doing so much in angular js buttons, did not want to add this as well
		$scope.isActive = data.isActive;
		$scope.numPlayers = data.numPlayers;
	
		$scope.otherPlayers = [];		
		$scope.game.players = [];
		
		//current player
		var p=0;
		game.players.push(new Player(game, $scope.myId, data.name));
		game.players[p].active = data.isActive;
		$scope.activePlayer = game.players[p];
		var activePlayer = $scope.activePlayer;
		
		activePlayer.actionsRemaining = data.actionsRemaining;
		activePlayer.gold = data.gold;
		activePlayer.turns = data.turns;
		activePlayer.vp = data.points;
		activePlayer.maxHand = data.maxHand;
		activePlayer.active = data.isActive;
		//$scope.activePlayerId = $scope.myId;
		
		for (var i = 0; i < data.hand.length; ++i) {   
			dealNumberToPlayer(game, activePlayer, data.hand[i]);	
		}
	
		//initialize to zero before going through carts
		$scope.activePlayer.nextCartId=0;
		//populate carts
		for (var c = 0; c < data.carts.length; ++c) {   
			activePlayer.carts[c].cards =  new cardSet();
			updatePlayerCarts(game, activePlayer, activePlayer.carts[c], data.carts[c]);	
		}
		
		for (var q = 0; q < data.questsCompleted.length; ++q) {   
			dealQuestsCompleted(game, activePlayer.questsCompleted, data.questsCompleted[q].items);
		}
		var len=0;
		var o=0;
		for (var z = 0; z < data.otherPlayers.length; ++z) {
			/*
			if(data.curPlayer === z) {
				o++;
			}
			else {
				if(data.curPlayer===data.numPlayers-1) {
					o=0;
				}
				else {
					o++
				}
			}
			*/
			game.players.push(new Player(game, data.otherPlayers[z].playerId, data.otherPlayers[z].name));
			//game.players.push(new Player(game, o, data.otherPlayers[z].name));

			var len = game.players.length - 1;

			game.players[len].cards = new cardSet();
			game.players[len].questsCompleted =  new cardSet();
	
			for (var i = 0; i < data.otherPlayers[z].hand.length; ++i) {   
				//dealNumberToPlayer(game, game.players[len], data.otherPlayers[z].hand[i]);	
				dealNumberToPlayer(game, $scope.game.players[len], -1);	
			}

			//populate carts
			for (var c = 0; c < data.carts.length; ++c) {   
				game.players[len].carts[c].cards =  new cardSet();
				updatePlayerCarts(game, $scope.game.players[len], $scope.game.players[len].carts[c], data.otherPlayers[z].carts[c]);	
			}
			
			for (var q = 0; q < data.otherPlayers[z].questsCompleted.length; ++q) {   
				dealQuestsCompleted(game, game.players[len].questsCompleted, data.otherPlayers[z].questsCompleted[q].items);
			}
			game.players[len].questsCompleted.setCardSize("small");
			$scope.otherPlayers[z] = game.players[len];

		}
	

		
		resetDisplayMode(mode(data.isActive));
		$scope.itemsCountRemaining = data.itemsCountRemaining;
		$scope.questsCountRemaining = data.questsCountRemaining;
		$scope.discardsCount = data.discardsCount;
		$scope.playersLog = [];
		game.questsInPlay = new cardSet();
		game.marketDeck = new cardSet();
		
		
        for (var i = 0; i < data.market.length; ++i) {   
			dealNumberToMarket(game, data.market[i]);	
		}
		setMarketCounts(game);

        for (var i = 0; i < data.questsInPlay.length; ++i) {   
			dealQuestCard(game, data.questsInPlay[i].items, data.questsInPlay[i].level, data.questsInPlay[i].type);
			var card = game.questsInPlay.playingCards[i];
			card.borderColor = cardColor(card);
		}
		game.questsInPlay.setCardSize("orig");


		if (data.lastDiscarded != null) {
			updateDiscardPile(game, data.lastDiscarded);	
		}
		

		for (var i = 0; i < data.playerLog.length; ++i) {   
		//0 is always the active player
			logPlayerAction($scope.playersLog, getPlayerName(game, data.playerLog[i].playerId), data.playerLog[i].event);
		}
		
		if(data.gameOver===true)	{
			gameEnd();
			return;
		}

	
		$scope.loadingData=false;
		var questReady = checkIfQuestIsReadyFromCart(game, $scope.activePlayer);
		if(questReady.index != undefined) {
			if(questReady.cartId >= 0 && $scope.autoSelectCart) {
				$scope.userClickedCartImage(questReady.cartId);
				if($scope.autoSelectQuest) {
					$scope.userClickedQuestImage(questReady.index);
					return;
				}
			}
		}
 
		 
		var questReady = checkIfQuestISReadyFromHand(game, $scope.activePlayer, $scope.autoSelectHand);
		if(questReady.items != undefined) {
			if(questReady.items.length >=3 && $scope.autoSelectHand) {
				if($scope.displayMode === 'game') {	
					selectHandCards(questReady.items);
				}
			}
		}
		
		//dont autopass in the middle of an event
		if($scope.displayMode === 'game') {
			checkAutoPass(data.actionsRemaining);
		}
	
	}

	function checkAutoPass(actionsRemaining) {
		if(actionsRemaining === 0 && $scope.activePlayer.gold < 2 && $scope.autoPass) {
			$scope.playerPass();
		}
	}
	
	function newGame(numPlayers, playerName) {
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

	function completeEvent(eventId, cartToDestroy, gold, what1, where1, what2, where2, dest1) {
		$scope.loadingData=true;
		gameFactory.completeEvent(eventId, cartToDestroy, gold, what1, where1, what2, where2, dest1, processGameStateCallback, processGameStateErrorCallback);
	}

	function pass(discard) {
		$scope.loadingData=true;
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
}).directive('eventcard', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'eventcard.html?2'
    };
}).directive('eventquests', function () {
    return {
        restrict: 'E',
        scope: {
            card: '=info'
        },
        templateUrl: 'eventquests.html?2'
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

