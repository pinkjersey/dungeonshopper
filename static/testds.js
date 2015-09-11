$scope.playerCompleteEvent = function(actionCost, id) {
	var cardSelectedCount = 0;
	var game = $scope.game;
	var player = game.activePlayer;
	var playerCardCount = player.cards.playingCards.length;
	var playerCardsSum = playerCardSum(player, false);
	var playerCardsSumSelected = playerCardSum(player, true);
	var event = $scope.activeEvent;

	for (var i = 0; i < player.cards.playingCards.length; ++i)  {
		var card = player.cards.playingCards[i];
		if(card.selected) {
			cardSelectedCount ++;
		}
	}
				

		switch (event) {
			case 'eventOrcsAttack':
			if(id==='Y') {
				//discard selected card
				if(playerCardsSum < 5){
						alert("You do not have enough items selected.");
						return;
					}
				if(game.selectedItemsCount > 0 && playerCardsSum >= 5) {			
					$scope.playerDiscard(actionCost);
					$scope.eventActionsRemaining=0;
				}					
				player.carts[0].active=true;

			}
			if(id==='N') {
				//do nothing
				
				
			}
				break;
			case 'eventBarbarianAttack':
				break;
			case 'eventBrokenItems':
				//discard with no actions from hand or cart
				
				if(cardSelectedCount > 2) {
					alert("You may only select up to two items that need repairing.");
					return;
				}

				if(cardSelectedCount > 0) {			
					$scope.playerDiscard(actionCost);
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
	
	
	
//deal cards for initial game quests
dealCardToQuests = function(questsInPlay, questSet){
	var game = $scope.game;
	var player = game.activePlayer;
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
	
	switch ($scope.activeEvent)
	{
		//fixme
			case 'eventOrcsAttack':
				//set variable for items in cart[0]
				$scope.eventActionsRemaining=2;
				var  total = wheelbarrowCardSum();
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
						player.carts[0].active=false;

						
					}
					
					
				
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
