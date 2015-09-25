
var Event = function (type, name ) {
	var eventImageBase="../images/event";
	this.id = type;
	this.name = name;
	this.displayMode = 'event' + name;
	this.image = eventImageBase + name + '.jpg';
}



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
 

var Game = function(numPlayers, blankMarketImageBase, questImageBase, cartImageBase) {

	//all the starter empty playingCards holders	
	this.quests = new questSet();
	this.itemHolders = new cardSet();
	this.itemMarketHolders = new cardSet();
	this.questsInPlay = new cardSet();
	this.marketDeck = new cardSet();
	this.marketDeckInTrade = new cardSet();
	this.cartImageBase = cartImageBase;
	//populated cardrs, itemHolders and quests
	this.itemHolders.createBlankMarket(blankMarketImageBase);
	this.itemMarketHolders.createBlankMarket(blankMarketImageBase);
	this.quests.createQuestDeck(questImageBase);

	this.players = [];
	//set initial size of the cards for the gui
	//their are times in the code that these are changed and reset
	this.quests.setCardSize("orig");	
	this.questsInPlay.setCardSize("orig");
	this.autoSelectCart=false;
	this.autoSelectHand=false;
	this.activeEvent = null;
	//event id, event type, event name
	

}

var PlayersLog = function (id, name, logItem) {
	this.id = id;
	this.name = name;
	this.logItem = logItem;
}





var Player = function (game, id, name) {
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
	this.nextCartId = 0;
	this.nextCartName = 'Hand Cart';
	this.winner=false;
    this.carts = [new Cart(0, 3, 1, 0, 5,'Wheelbarrow', game.cartImageBase + '0.jpg', game.cartImageBase + '0_not_purchased.jpg'), 
				  new Cart(1, 3, 0, 1, 10, 'Hand Cart', game.cartImageBase + '1.jpg', game.cartImageBase + '1_not_purchased.jpg'), 
				  new Cart(2, 4, 0, 2, 15, 'Horse Wagon', game.cartImageBase + '2.jpg', game.cartImageBase + '2_not_purchased.jpg'), 
			      new Cart(3, 5, 0, 3, 20, 'War Wagon', game.cartImageBase + '3.jpg', game.cartImageBase + '3_not_purchased.jpg')]
				  ;
}