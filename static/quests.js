


/****************************************************************************************
                  Script to provide an API for managing card games
                  Written by Mark Wilton-Jones, 20/12/2005-8/1/2006
*****************************************************************************************

Please see http://www.howtocreate.co.uk/jslibs/ for details and a demo of this script
Please see http://www.howtocreate.co.uk/tutorials/jsexamples/solitaire.html for a demonstration
Please see http://www.howtocreate.co.uk/jslibs/termsOfUse.html for terms of use
_____________________________________________________________________________________________________

Card game core API documentation:

public class cardSet()
	Class representing a deck of cards.
cardSet.playingCards
	Array of all cards in the deck.
cardSet.addCard(string: suit,integer: cardnumber,mixed: color)
	Adds the specified card into the deck.
	Suit should normally be one of 'spades', 'hearts', 'clubs', 'diamonds'.
	Cardnumber should be in the range 1-13 (unless you wish to create a joker - you may want to create this as
	card 14 in a new suit - remember to use changeCardNames as appropriate [add an extra card name on the end]).
	Color is an arbitrary value and is for your own use only.
cardSet.setCardSize(string: width,string: height)
	Sets the width and height styles of all card images. Cards will redraw if needed.
cardSet.shuffleCards(optional integer: times)
	Sorts the cards in a random order within the cardSet.playingCards array. No redrawing is performed. If
	you pass an integer to it, it will sort that many times (in case the browser has a bad random number
	generator). Default is 3 times.

public class playingCard(string: suit,integer: cardnumber,mixed: color,object: cardSet)
	Class representing a card in the deck. It is generally best to use cardSet.create52Cards,
	cardSet.addCard, or playingCard.changeCard instead of creating instances manually - if you do,
	you will need to add them to the cardSet.playingCards array.
playingCard.cardImage
	A reference to the card image. It will have display:block.
playingCard.setCardSize(string: width,string: height)
	Sets the CSS width and height properties of the card image. This does _not_ change the image used. Card
	will be redrawn if needed.
_____________________________________________________________________________________________________*/

/**********************************************
 A class representing the entire deck of cards
**********************************************/
function questSet() {
	
	// Storage for Quest references
	this.playingCards = [];
}

//questSet.prototype.defaultCardNames = ['1','2','3','4','5','6','7','8','9','10'];
//questSet.prototype.defaultCardWord = 'Quest';
//questSet.prototype.toString = function () { return '[object questSet]'; };

questSet.prototype.addCard = function (level,gold,item1,item2,item3,item4,item5,vp,name,nameId,oImage,oImageSmall,oImageLarge) {
	// Add a Quest to the deck
	var questMatchId = "";

	switch (level.toString()) {
		case "1":
		oImage = oImage + item1 + item2 + item3 ;
		break;
		case "2":
		oImage = oImage + item1 + item2 + item3 + item4 ;
		break;
		case "3":
		oImage = oImage + item1 + item2 + item3 + item4 + item5	; 
		break;
		case "4":
		oImage = oImage;
		break;
		default:
		
	}

	
	var oImageOrig = oImage + '.jpg'
	var oImageSmall = oImage + '_sm.jpg'
	var oImageLarge = oImage + '_lg.jpg'
	
	this.playingCards[this.playingCards.length] = new questCard( level,gold,item1,item2,item3,item4,item5,vp,name,nameId,oImageOrig, oImageSmall, oImageLarge, this);
};

questSet.prototype.addCardc = function (oCard) {
	// Add a Quest to the deck
	this.playingCards[this.playingCards.length] = new questCard(oCard.level,oCard.gold,oCard.item1,oCard.item2,oCard.item3,oCard.item4,oCard.item5,oCard.vp,oCard.name,oCard.nameId,oCard.image,oCard.imageSmall, oCard.imageLarge,this);
};

questSet.prototype.peek = function (i) {
	return this.playingCards[ i + 1 ];
};

questSet.prototype.truncate = function () {
	for(var i = this.playingCards.length-1; i >= 0; i--){              // STEP 1
		if(this.playingCards[i] === null){ // STEP 2
			this.playingCards.splice(i,1);                             // STEP 3
		}
	}	
};


questSet.prototype.shuffleCards = function (oTimes) {
	// Sorting function - based on the easier Knuth shuffle
	if( !oTimes ) { oTimes = 3; }
	for( var n = 0; n < oTimes; n++ ) {
		// Three times, just in case the browser's random number generator is not very good
		for( var i = 0; i < this.playingCards.length; i++ ) {
			this.playingCards[i].tmpShuffleSortingIndex = Math.random();
		}
		this.playingCards.sort( function (a,b) {
			// OmniWeb and older Safari insists that I return a whole number, not a fraction
			return ( ( b.tmpShuffleSortingIndex - a.tmpShuffleSortingIndex ) > 0 ) ? 1 : -1;
		} );
	}
	// Enable this for debugging
//	for( var i = 0, s=''; i < this.playingCards.length - 1; i++ ) { s+= this.playingCards[i].number + ' ' + this.playingCards[i].suit + '\n'; } alert(s);
};

questSet.prototype.setCardSize = function (size) {

	for( var i = 0; i < this.playingCards.length; i++ ) {
		switch (size)
			{
				case 'orig':
					this.playingCards[i].image = this.playingCards[i].imageOrig;
					break;
				case 'small':
					this.playingCards[i].image = this.playingCards[i].imageSmall;
					break;
				case 'large':
					this.playingCards[i].image = this.playingCards[i].imageLarge;
					break;
				default:
					this.playingCards[i].image = this.playingCards[i].imageOrig;
			}
			
			this.playingCards[i].borderColor = 'black';
	}
};

//questSet.prototype.redrawCards = function () {
//	// Redraws all cards (resets their images and alt text to the correct values)
//	for( var i = 0; i < this.playingCards.length; i++ ) {
//		this.playingCards[i].redrawCardImage();
//	}
//};


//questSet.prototype.forcePageRedraw = function () {
//	// Force full document redraw
//	document.body.className = document.body.className ? ( document.body.className + '' ) : '';
//};


questSet.prototype.createQuestDeck = function (questImageBase) {
	// Create quest deck
	
	var level1 = new questSet();
	var level2 = new questSet();
	var level3 = new questSet();
	var events = new questSet();
	
	level1.createQuestDecks(1, questImageBase);
	level2.createQuestDecks(2, questImageBase);
	level3.createQuestDecks(3, questImageBase);
	events.createQuestDecks(4, questImageBase);

	//create and add all quests to the quests deck

		for( var i = 0; i < level1.playingCards.length; i++ ) {
            var cardt = level1.playingCards[i];
			this.addCardc(cardt);
        }
		for( var i = 0; i < level2.playingCards.length; i++ ) {
            var cardm = level2.playingCards[i];
			this.addCardc(cardm);
        }
		for( var i = 0; i < level3.playingCards.length; i++ ) {
            var cardb = level3.playingCards[i];
			this.addCardc(cardb);
        }
		for( var i = 0; i < events.playingCards.length; i++ ) {
            var carde = events.playingCards[i];
			this.addCardc(carde);
        }
	

}


/*  hotseat create quest deck
questSet.prototype.createQuestDeck = function (numOfOpponents, ) {
	// Create quest deck
	
	var level1 = new questSet();
	var level2 = new questSet();
	var level3 = new questSet();
	var events = new questSet();
	
	level1.createQuestDecks(1);
	level2.createQuestDecks(2);
	level3.createQuestDecks(3);
	events.createQuestDecks('4');

	level1.shuffleCards(10);
	level2.shuffleCards(10);
	level3.shuffleCards(10);
	events.shuffleCards(10);
	
	var top = new questSet();
	var middle = new questSet();
	var bottom = new questSet();


	if(numOfOpponents === 1)
	{
		createQuests(top, middle, bottom, level1, level2, level3, events, 5,1,2,1,1,2,1,1);
		//createQuests(top, middle, bottom, level1, level2, level3, events, 4,0,0,0,0,0,5,0);
	}
	if(numOfOpponents === 2)
	{
		//createQuests(top, middle, bottom, level1, level2, level3, events,7,1,4,1,2,4,2,2);
		createQuests(top, middle, bottom, level1, level2, level3, events,4,1,4,1,2,4,4,4);
	}
	if(numOfOpponents === 3)
	{
		createQuests(top, middle, bottom, level1, level2, level3, events,10,3,7,2,3,5,2,2);
	}
	if(numOfOpponents === 4)
	{
		createQuests(top, middle, bottom, level1, level2, level3, events,12,4,10,2,4,6,3,3);
	}

	//shuffle this deck
	top.shuffleCards(10);
	//shuffle this deck
	middle.shuffleCards(10);
	//shuffle this deck
	bottom.shuffleCards(10);

	//create and add all quests to the quests deck

		for( var i = 0; i < top.playingCards.length; i++ ) {
            var cardt = top.playingCards[0];
			this.addCardc(cardt);
			top.playingCards.shift();
        }
		for( var i = 0; i < middle.playingCards.length; i++ ) {
            var cardm = middle.playingCards[0];
			this.addCardc(cardm);
			middle.playingCards.shift();
        }
		for( var i = 0; i < bottom.playingCards.length; i++ ) {
            var cardb = bottom.playingCards[0];
			this.addCardc(cardb);
			bottom.playingCards.shift();
			
        }
	

}
*/



function createQuests(top, middle, bottom, level1, level2, level3, events, level1CardsTop, level1CardsMiddle, level2CardsMiddle, level1CardsBottom, level2CardsBottom, level3CardsBottom, eventCardsMiddle, eventCardsBottom)
{
	//build game deck top
	    for (var i = 0; i < level1CardsTop; ++i) {
            var cardL1 = level1.playingCards[0];
			top.addCardc(cardL1);
			level1.playingCards.shift();
        }


	//build deck middle
	
		for (var i = 0; i < level1CardsMiddle; ++i) {
            cardL1 = level1.playingCards[0];
			middle.addCardc(cardL1);
			level1.playingCards.shift();
        }
	    for (var i = 0; i < level2CardsMiddle; ++i) {
            var cardL2 = level2.playingCards[0];
			middle.addCardc(cardL2);
			level2.playingCards.shift();

        }
	    for (var i = 0; i < eventCardsMiddle; ++i) {
            var cardevent = events.playingCards[0];
			middle.addCardc(cardevent);
			events.playingCards.shift();			
        }

	//build deck bottom
		for (var i = 0; i < level1CardsBottom; ++i) {
            cardL1 = level1.playingCards[0];
			bottom.addCardc(cardL1);
			level1.playingCards.shift();

        }
	    for (var i = 0; i < level2CardsBottom; ++i) {
            cardL2 = level2.playingCards[0];
			bottom.addCardc(cardL2);
			level2.playingCards.shift();

        }
	    for (var i = 0; i < level3CardsBottom; ++i) {
            var cardL3 = level3.playingCards[0];
			bottom.addCardc(cardL3);
			level3.playingCards.shift();

        }
		for (var i = 0; i < eventCardsBottom; ++i) {
            var cardevent = events.playingCards[0];
			bottom.addCardc(cardevent);
			events.playingCards.shift();
        }

}

questSet.prototype.createQuestDecks = function (level, imageBase) {
	
var image=imageBase;
	
if(level===1){
	

	this.addCard(level,1,1,3,9,0,0,2,'Battle of Castillon',1,image,this);
	this.addCard(level,1,2,2,2,0,0,2,'Battle of Castillon',1,image,this);
	this.addCard(level,1,1,5,8,0,0,3,'Battle of Castillon',1,image,this);
	this.addCard(level,1,2,5,7,0,0,3,'Battle of Castillon',1,image,this);
	this.addCard(level,1,3,4,8,0,0,3,'Battle of Castillon',1,image,this);
	this.addCard(level,1,3,7,7,0,0,3,'Battle of Castillon',1,image,this);
	this.addCard(level,1,4,6,7,0,0,3,'Battle of Castillon',1,image,this);
	this.addCard(level,1,1,1,1,0,0,2,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,1,4,6,0,0,2,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,2,3,7,0,0,2,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,1,6,8,0,0,3,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,2,6,10,0,0,3,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,3,5,10,0,0,3,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,4,4,4,0,0,4,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,1,3,10,0,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,1,1,5,9,0,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,1,2,2,10,0,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,1,2,5,8,0,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,1,3,5,9,0,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,1,3,7,8,0,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,1,5,5,5,0,0,4,'Combat of the thirty',3,image,this);
	this.addCard(level,1,1,2,8,0,0,2,'Loire Campaign',4,image,this);
	this.addCard(level,1,1,4,9,0,0,3,'Loire Campaign',4,image,this);
	this.addCard(level,1,1,6,9,0,0,3,'Loire Campaign',4,image,this);
	this.addCard(level,1,2,4,8,0,0,3,'Loire Campaign',4,image,this);
	this.addCard(level,1,2,7,8,0,0,3,'Loire Campaign',4,image,this);
	this.addCard(level,1,3,6,7,0,0,3,'Loire Campaign',4,image,this);
	this.addCard(level,1,4,4,7,0,0,3,'Loire Campaign',4,image,this);
	this.addCard(level,1,1,2,9,0,0,2,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,1,5,5,0,0,2,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,3,3,3,0,0,2,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,1,6,10,0,0,3,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,2,4,10,0,0,3,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,3,6,9,0,0,3,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,4,6,6,0,0,3,'Siege of Harfleur',5,image,this);
}
if(level===2){
	this.addCard(level,1,1,2,6,10,0,4,'Battle of Castillon',1,image,this);
	this.addCard(level,0,2,2,6,9,0,4,'Battle of Castillon',1,image,this);
	this.addCard(level,1,2,4,5,5,0,4,'Battle of Castillon',1,image,this);
	this.addCard(level,0,3,4,5,10,0,5,'Battle of Castillon',1,image,this);
	this.addCard(level,0,1,3,7,10,0,5,'Battle of Castillon',1,image,this);
	this.addCard(level,1,1,3,3,8,0,3,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,1,1,1,10,0,4,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,2,3,5,6,0,3,'Capture of Lusignan',2,image,this);
	this.addCard(level,0,1,4,6,8,0,4,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,2,5,6,8,0,4,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,2,3,5,5,0,3,'Combat of the thirty',3,image,this);
	this.addCard(level,0,1,2,7,10,0,5,'Combat of the thirty',3,image,this);
	this.addCard(level,0,1,4,5,9,0,4,'Combat of the thirty',3,image,this);
	this.addCard(level,1,2,4,6,8,0,4,'Combat of the thirty',3,image,this);
	this.addCard(level,0,3,4,7,8,0,5,'Combat of the thirty',3,image,this);
	this.addCard(level,0,1,1,6,8,0,4,'Loire Campaign',4,image,this);
	this.addCard(level,0,1,3,4,9,0,4,'Loire Campaign',4,image,this);
	this.addCard(level,1,3,3,4,7,0,4,'Loire Campaign',4,image,this);
	this.addCard(level,1,2,3,7,9,0,4,'Loire Campaign',4,image,this);
	this.addCard(level,0,1,5,7,9,0,5,'Loire Campaign',4,image,this);
	this.addCard(level,0,1,2,6,9,0,4,'Siege of Harfleur',5,image,this);
	this.addCard(level,0,1,3,5,7,0,4,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,2,2,6,7,0,4,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,3,4,4,8,0,4,'Siege of Harfleur',5,image,this);
	this.addCard(level,0,2,4,4,10,0,5,'Siege of Harfleur',5,image,this);
}
if(level===3){
	this.addCard(level,0,1,2,3,4,5,5,'Battle of Castillon',1,image,this);
	this.addCard(level,0,2,2,3,4,7,5,'Battle of Castillon',1,image,this);
	this.addCard(level,0,3,5,6,7,8,6,'Battle of Castillon',1,image,this);
	this.addCard(level,0,1,1,1,1,10,5,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,2,2,5,6,8,5,'Capture of Lusignan',2,image,this);
	this.addCard(level,0,1,3,3,8,8,6,'Capture of Lusignan',2,image,this);
	this.addCard(level,1,1,2,5,7,9,5,'Combat of the thirty',3,image,this);
	this.addCard(level,1,2,2,4,5,9,5,'Combat of the thirty',3,image,this);
	this.addCard(level,0,4,4,6,6,10,6,'Combat of the thirty',3,image,this);
	this.addCard(level,0,1,1,2,3,6,4,'Loire Campaign',4,image,this);
	this.addCard(level,1,1,3,5,6,7,5,'Loire Campaign',4,image,this);
	this.addCard(level,0,3,4,5,7,10,6,'Loire Campaign',4,image,this);
	this.addCard(level,0,1,2,2,4,4,5,'Siege of Harfleur',5,image,this);
	this.addCard(level,1,1,3,5,6,9,5,'Siege of Harfleur',5,image,this);
	this.addCard(level,0,3,4,7,8,9,6,'Siege of Harfleur',5,image,this);
}

if(level===4){
	var image="../images/event";
	this.addCard(level,0,0,0,0,0,0,0,'eventBarbarianAttack',6,image+"barbarianattack",this);
	this.addCard(level,0,0,0,0,0,0,0,'eventBrokenItems',7,image+"brokenitems",this);
	this.addCard(level,0,0,0,0,0,0,0,'eventCastleTaxation',8,image+"castletaxation",this);
	this.addCard(level,0,0,0,0,0,0,0,'eventGolbinRaid',9,image+"golbinraid",this);
	this.addCard(level,0,0,0,0,0,0,0,'eventKingsFeast',10,image+"kngsfeast",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventMarketShortage',11,image+"marketshortage",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventMarketSurplus',12,image+"marketsurplus",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventOrcsAttack',13,image+"orcsattack",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventSandStorm',14,image+"sandstorm",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventThrownInTheDungeon',15,image+"throwninthedungeon",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventTreasure',16,image+"treasure",this);	
	this.addCard(level,0,0,0,0,0,0,0,'eventVikingParade',17,image+"vikingparade",this);	
	}

}

var itemcheck = function(params) {
	if(params!=0) {
		return params.toString();
	} 
	else {
		return "";
	}
}
/****************************
 A class representing a card
****************************/
function questCard( level,gold,item1,item2,item3,item4,item5,vp, name, nameId,image,imageSmall,imageLarge , oCardSet) {



	// Initialise settings
	this.level=level;
	this.item1=item1;
	this.item2=item2;
	this.item3=item3;
	this.item4=item4;
	this.item5=item5;
	this.questMatchId = item1.toString()+item2.toString()+item3.toString()+itemcheck(item4)+itemcheck(item5);
	this.gold = gold;
	this.name = name;
	this.nameId = nameId;  //sortorder when completed
	this.selected = false;
	this.vp = vp;
	this.imageOrig = image;
	this.image = image;
	this.imageSmall = imageSmall;
	this.imageLarge = imageLarge;
	this.wayup = false;
	this.cardSet = oCardSet;
	this.borderColor = 'black'
	this.cardImage = document.createElement('img');
	this.cardImage.style.display = 'block';

}

//questCard.prototype.toString = function () { return '[object questCard: '+this.number+']'; };


questCard.prototype.setCardSize = function (size) {

switch (size)
	{
		case 'orig':
			this.image = this.imageOrig;
			break;
		case 'small':
			this.image = this.imageSmall;
			break;
		case 'large':
			this.image = this.imageLarge;
			break;
		default:
			this.image = this.imageOrig;
	}
};
