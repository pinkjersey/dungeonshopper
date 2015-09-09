


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
cardSet.defaultCardNames
	Array of strings used as alternative text for card faces. Defaults to the standard 'Ace' to 'King'. Use
	cardSet.setCardNames to change this.
cardSet.defaultCardWord
	String used as alternative text on the back of the card. Defaults to 'Card'. Use cardSet.setCardNames to
	change this.
cardSet.imagePacks
	Reference to an imagePacks object, which contains a list of all available image packs that have been added
	using addImagePack (see the imagePacks definition for more information).
cardSet.playingCards
	Array of all cards in the deck.
cardSet.addCard(string: suit,integer: cardnumber,mixed: color)
	Adds the specified card into the deck.
	Suit should normally be one of 'spades', 'hearts', 'clubs', 'diamonds'.
	Cardnumber should be in the range 1-13 (unless you wish to create a joker - you may want to create this as
	card 14 in a new suit - remember to use changeCardNames as appropriate [add an extra card name on the end]).
	Color is an arbitrary value and is for your own use only.
cardSet.addImageCache(string: src)
	Adds an image into the cache, to ensure image changes run smoothly. If an image fails to load, an alert will
	be displayed, unless you set the global variable 'hideCardGameErrors' to true.
	addImageCache is called automatically when setting image packs.
cardSet.create52Cards(optional string array: suits)
	Creates a standard set of 52 cards, and adds them to the existing deck. No redrawing is performed. If you
	provide suits, it will use the first 4 strings to select the 4 suits. These will also be used by the images.
cardSet.forcePageRedraw()
	Attempts to force an entire page redraw in a variety of browsers. Use to avoid bad rendering bugs but do
	not overuse - it is expensive in terms of performance.
cardSet.redrawCards()
	Forces cards to redraw - can be used to avoid rendering bugs, or just to refresh after making a change.
cardSet.setCardNames(optional string: cardword,optional array: cardnames)
	Changes card names (used as alt text).
	The cardword should be the word used in place of the card back - default is 'Card'.
	Cardnames should be an array of strings with the names of all cards, normally from 'Ace' to 'King' (default).
cardSet.setCardSize(string: width,string: height)
	Sets the width and height styles of all card images. Cards will redraw if needed.
cardSet.setImagePack(string: imageset,string: backimage,string: extension)
	Tells the cards to use the images specified (must be called in any game before dealing).
	Can be called at any time during the game for an instant facelift. Cards will redraw if needed.
	Card faces will be created as; imageset + suit + number + extension
	Card backs will be created as; imageset + 'back' + backimage + extension
	Suit is one of 'spades', 'hearts', 'clubs', 'diamonds'.
	Number is 1-14.
cardSet.shuffleCards(optional integer: times)
	Sorts the cards in a random order within the cardSet.playingCards array. No redrawing is performed. If
	you pass an integer to it, it will sort that many times (in case the browser has a bad random number
	generator). Default is 3 times.

public class cardStack(mixed: type,mixed: index,bool: createDiv,optional string: stackText)
	A class representing a visual stacking of cards within the game area, for example, the deck of undealt
	cards in a game of solitaire. type and index are arbitrary, and can be used simply to keep a reference
	of the features of a specific stack. If createDiv is true, the hotspot property will be created as a
	div with position:absolute, and a className of 'hotspot'. If a hotspot is created, then any text you
	provide in stackText will be added to the hotspot.
cardStack.cardsInStack
	Array of all cards in the stack.
cardStack.hotspot
	A reference to a div element with position set to absolute.
cardStack.type
	The specified stack type.
cardStack.index
	The specified stack index.
cardStack.moveToStack(playingCard)
	Moves a given card into the current stack, and removes it from any existing stack. Note that
	cardStack.cardsInStack does not automatically collapse down when cards are removed from it. This is
	behaviourly synonymous to playingCard.moveToStack
cardStack.setStyles(left,top,zIndex,width,height,fontSize)
	Sets the appropriate styles on the card stack's hotspot.
cardStack.truncate(optional integer: length)
	Shortens the number of cards in the stack to the given length. If no length is given, the card stack
	will be shortened to remove all trailing empty cells.

public class imagePacks()
	Class representing an available set of images, including their sizes, so that appropriate size of
	image set can be chosen for the available space. Do not create instances of this class directly,
	they are created atomatically for each cardSet and can be accessed through cardSet.imagePacks.
imagePacks.availCombo
	Object with property names matching each combination of image set and back image. The property names are
	created as width+'x'+height+'|'+imageset+'|'+backimage (for use with storing and retrieving preferences).
	Each property references an image pack that match that image combination. Image packs are stored in
	object form with the properties 'imageset', 'backimages', 'extension', 'width', 'height', and 'name'
	(these will match the values passed to the addImagePack method).
imagePacks.availHeights
	Array of available card heights, added using imagePacks.addCardPack. Array will be sorted in descending
	order.
imagePacks.availWidths
	Array of available card widths, added using imagePacks.addCardPack. Array will be sorted in descending
	order.
imagePacks.heights
	Object with property names matching the sizes of the available cards. Each property references an array
	of image packs that match that size (in the same way as with imagePacks.availCombo). For example,
	imagePacks.heights[100][0] will reference the first image pack added with a height of 100.
imagePacks.widths
	Same as imagePacks.heights, but for widths instead of heights.
imagePacks.addImagePack(string: imageset,array: backimages,string: extension,integer: cardWidth,integer: cardHeight,string: name)
	Adds an image pack into the list of available image packs. The values of imageset and extension should be
	compatible with those used by cardSet.setImagePack. cardWidth and cardHeight are for use with
	getFittingImageSize. backimages should be an array of entries. Each entry should be an array with two
	cells: string backimage, string name. This should list all available card back images in this image set.
	Each should be compatible with the backimage value expected by cardSet.setImagePack. The name is a name
	that you want to refer to the image pack as (this is used only for your own reference, so multiple image
	packs may share the same name).
imagePacks.getFittingImageSize(bool: heightOrWidth,integer: size)
	Attempts to find the largest possible card size within the given size limit. The appropriate size of the
	card is returned. If none can be found, it returns the smallest available card size. If no card packs are
	available, it returns null. heightOrWidth should be true if you want to check heights, and false if you
	want to check widths.

public class playingCard(string: suit,integer: cardnumber,mixed: color,object: cardSet)
	Class representing a card in the deck. It is generally best to use cardSet.create52Cards,
	cardSet.addCard, or playingCard.changeCard instead of creating instances manually - if you do,
	you will need to add them to the cardSet.playingCards array.
playingCard.suit playingCard.number playingcard.color
	The values provided when creating the card.
playingCard.cardImage
	A reference to the card image. It will have display:block.
playingCard.cardStack
	A reference to the cardStack object that the card is attached to (can be changed manually if needed).
playingCard.positionOnStack
	The index of the card on the cardStack
playingCard.representation
	A reference to the div containing the card image. It will have position:absolute, and a className of
	'playingcard'.
playingCard.wayup
	Boolean true if the card is face up, false if it is face down.
playingCard.changeCard(string: suit,integer: cardnumber)
	Changes the card from its current suit and number to the new number specified. Cards will be redrawn
	as needed.
playingCard.moveToStack(object: cardStack)
	Removes a card from its current stack (if it is on a stack) and puts it onto the new one. Note that
	cardStack.cardsInStack does not automatically collapse down when cards are removed from it, so you
	should use cardStack.truncate when all changes have been made. No visual changes and redraws will occur.
playingCard.nextOnStack()
	Returns a reference to the next card (with a higher stack position) on the stack. Null or undefined
	if none.
playingCard.previousOnStack()
	Returns a reference to the previous card (with a lower stack position) on the stack. Null or
	undefined if none.
playingCard.inheritCardDesign()
	Picks up the card's current design as specified by cardSet.setBackImage or cardSet.setImagePack
	Card will be redrawn if needed.
playingCard.redrawCardImage()
	Forces a card to redraw - can be used to avoid rendering bugs, or just to refresh after making a change.
	If the card has not yet inherited a card design (inheritCardDesign), this method will fail silently.
playingCard.showFace(bool: face)
	Sets the card to be either face up or face down, and redraws if needed.
	true = face up, false = face down.
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
	this.massiveImageCache = {};
	this.imagePacks = new imagePacks();

}

//questSet.prototype.defaultCardNames = ['1','2','3','4','5','6','7','8','9','10'];
questSet.prototype.defaultCardWord = 'Quest';

questSet.prototype.toString = function () { return '[object questSet]'; };

questSet.prototype.addCard = function (level,coin,item1,item2,item3,item4,item5,vp,name,oImage) {
	// Add a Quest to the deck
	if(level===1) {
		oImage = oImage + item1 + item2 + item3 + '.jpg'
		}
	if(level===2) {
		oImage = oImage + item1 + item2 + item3 + item4 + '.jpg'
		}
	if(level===3) {
		oImage = oImage + item1 + item2 + item3 + item4 + item5	 + '.jpg'
		}
	this.playingCards[this.playingCards.length] = new questCard(level,coin,item1,item2,item3,item4,item5,vp,name,oImage,this);
};

questSet.prototype.addCardc = function (oCard) {
	// Add a Quest to the deck
	this.playingCards[this.playingCards.length] = new questCard(oCard.level,oCard.coin,oCard.item1,oCard.item2,oCard.item3,oCard.item4,oCard.item5,oCard.vp,oCard.name,oCard.image,this);
};


questSet.prototype.addImageCache = function (imUrl) {
	// Add an image into the cache
	if( !this.massiveImageCache[imUrl] ) {
		var oSet = this;
		this.massiveImageCache[imUrl] = new Image();
		this.massiveImageCache[imUrl].onerror = function () {
			if( !oSet.hasAlertedImageError ) {
				oSet.hasAlertedImageError = true;
				if( !window.hideCardGameErrors ) { alert('Warning: Quest game image failed\n\nA card image failed to load - the card game may not play correctly:\n'+this.src+'\n\nNo more warnings will be shown for cards in this card set.'); }
			}
		};
		this.massiveImageCache[imUrl].src = imUrl;
	}
};

questSet.prototype.setImagePack = function (oImageSet,oBackImage,oExtension) {
	// Set Quest images
	this.questSet = oImageSet;
	this.imageExtension = oExtension;
	this.backImage = oImageSet+'back'+oBackImage+oExtension;
	this.addImageCache(this.backImage);
	for( var i = 0; i < this.playingCards.length; i++ ) {
		this.playingCards[i].inheritCardDesign();
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

questSet.prototype.setCardSize = function (oWidth,oHeight) {
	// Set a nice width for the cards - any CSS width value is allowed
	for( var i = 0; i < this.playingCards.length; i++ ) {
		this.playingCards[i].setCardSize(oWidth,oHeight);
	}
};

questSet.prototype.redrawCards = function () {
	// Redraws all cards (resets their images and alt text to the correct values)
	for( var i = 0; i < this.playingCards.length; i++ ) {
		this.playingCards[i].redrawCardImage();
	}
};

questSet.prototype.setCardNames = function (oCardWord,oCardNames) {
	// Change the text representation of the cards
	if( !oCardWord ) { oCardWord = this.defaultCardWord; }
	if( !oCardNames ) { oCardNames = this.defaultCardNames; }
	this.cardWord = oCardWord;
	this.cardNames = oCardNames;
	this.redrawCards();
};

questSet.prototype.forcePageRedraw = function () {
	// Force full document redraw
	document.body.className = document.body.className ? ( document.body.className + '' ) : '';
};



questSet.prototype.createQuestDeck = function (numOfOpponents) {
	// Create quest deck
	
	var level1 = new questSet();
	var level2 = new questSet();
	var level3 = new questSet();
	var events = new questSet();
	
	level1.createQuestDecks(1);
	level2.createQuestDecks(2);
	level3.createQuestDecks(3);
	events.createQuestDecks('e');

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
	}
	if(numOfOpponents === 2)
	{
		createQuests(top, middle, bottom, level1, level2, level3, events,7,1,4,1,2,4,2,2);
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
            var cardt = top.playingCards[i];
			this.addCardc(cardt);
        }
		for( var i = 0; i < middle.playingCards.length; i++ ) {
            var cardm = middle.playingCards[i];
			this.addCardc(cardm);
        }
		for( var i = 0; i < bottom.playingCards.length; i++ ) {
            var cardb = bottom.playingCards[i];
			this.addCardc(cardb);
        }
	

}




function createQuests(top, middle, bottom, level1, level2, level3, events, level1CardsTop, level1CardsMiddle, level2CardsMiddle, level1CardsBottom, level2CardsBottom, level3CardsBottom, eventCardsMiddle, eventCardsBottom)
{
	//build two player deck top
	    for (var i = 0; i < level1CardsTop; ++i) {
            var cardL1 = level1.playingCards[i];
			top.addCardc(cardL1);
        }


	//build deck middle
	
		for (var i = 0; i < level1CardsMiddle; ++i) {
            cardL1 = level1.playingCards[i];
			middle.addCardc(cardL1);
        }
	    for (var i = 0; i < level2CardsMiddle; ++i) {
            var cardL2 = level2.playingCards[i];
			middle.addCardc(cardL2);
        }
	    for (var i = 0; i < eventCardsMiddle; ++i) {
            var cardevent = events.playingCards[i];
			middle.addCardc(cardevent);
        }

	//build deck bottom
		for (var i = 0; i < level1CardsBottom; ++i) {
            cardL1 = level1.playingCards[i];
			bottom.addCardc(cardL1);
        }
	    for (var i = 0; i < level2CardsBottom; ++i) {
            cardL2 = level2.playingCards[i];
			bottom.addCardc(cardL2);
        }
	    for (var i = 0; i < level3CardsBottom; ++i) {
            var cardL3 = level3.playingCards[i];
			bottom.addCardc(cardL3);
        }
		for (var i = 0; i < eventCardsBottom; ++i) {
            var cardevent = events.playingCards[i];
			bottom.addCardc(cardevent);
        }

}

questSet.prototype.createQuestDecks = function (level) {
	
var image="images/shopping_card_master";
	
if(level===1){
	
	
//	shopping_card_master111
	this.addCard(level,'Y',1,3,9,0,0,2,'Battle of Castillon',image,this);
	this.addCard(level,'Y',2,2,2,0,0,2,'Battle of Castillon',image,this);
	this.addCard(level,'Y',1,5,8,0,0,3,'Battle of Castillon',image,this);
	this.addCard(level,'Y',2,5,7,0,0,3,'Battle of Castillon',image,this);
	this.addCard(level,'Y',3,4,8,0,0,3,'Battle of Castillon',image,this);
	this.addCard(level,'Y',3,7,7,0,0,3,'Battle of Castillon',image,this);
	this.addCard(level,'Y',4,6,7,0,0,3,'Battle of Castillon',image,this);
	this.addCard(level,'Y',1,1,1,0,0,2,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',1,4,6,0,0,2,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',2,3,7,0,0,2,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',1,6,8,0,0,3,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',2,6,10,0,0,3,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',3,5,10,0,0,3,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',4,4,4,0,0,4,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',1,3,10,0,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'Y',1,5,9,0,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'Y',2,2,10,0,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'Y',2,5,8,0,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'Y',3,5,9,0,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'Y',3,7,8,0,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'Y',5,5,5,0,0,4,'Combat of the thirty',image,this);
	this.addCard(level,'Y',1,2,8,0,0,2,'Loire Campaign',image,this);
	this.addCard(level,'Y',1,4,9,0,0,3,'Loire Campaign',image,this);
	this.addCard(level,'Y',1,6,9,0,0,3,'Loire Campaign',image,this);
	this.addCard(level,'Y',2,4,8,0,0,3,'Loire Campaign',image,this);
	this.addCard(level,'Y',2,7,8,0,0,3,'Loire Campaign',image,this);
	this.addCard(level,'Y',3,6,7,0,0,3,'Loire Campaign',image,this);
	this.addCard(level,'Y',4,4,7,0,0,3,'Loire Campaign',image,this);
	this.addCard(level,'Y',1,2,9,0,0,2,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',1,5,5,0,0,2,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',3,3,3,0,0,2,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',1,6,10,0,0,3,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',2,4,10,0,0,3,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',3,6,9,0,0,3,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',4,6,6,0,0,3,'Siege of Harfleur',image,this);
}
if(level===2){
	this.addCard(level,'Y',1,2,6,10,0,4,'Battle of Castillon',image,this);
	this.addCard(level,'N',2,2,6,9,0,4,'Battle of Castillon',image,this);
	this.addCard(level,'Y',2,4,5,5,0,4,'Battle of Castillon',image,this);
	this.addCard(level,'N',3,4,5,10,0,5,'Battle of Castillon',image,this);
	this.addCard(level,'N',1,3,7,10,0,5,'Battle of Castillon',image,this);
	this.addCard(level,'Y',1,3,3,8,0,3,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',1,1,1,10,0,4,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',2,3,5,6,0,3,'Capture of Lusignan',image,this);
	this.addCard(level,'N',1,4,6,8,0,4,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',2,5,6,8,0,4,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',2,3,5,5,0,3,'Combat of the thirty',image,this);
	this.addCard(level,'N',1,2,7,10,0,5,'Combat of the thirty',image,this);
	this.addCard(level,'N',1,4,5,9,0,4,'Combat of the thirty',image,this);
	this.addCard(level,'Y',2,4,6,8,0,4,'Combat of the thirty',image,this);
	this.addCard(level,'N',3,4,7,8,0,5,'Combat of the thirty',image,this);
	this.addCard(level,'N',1,1,6,8,0,4,'Loire Campaign',image,this);
	this.addCard(level,'N',1,3,4,9,0,4,'Loire Campaign',image,this);
	this.addCard(level,'Y',3,3,4,7,0,4,'Loire Campaign',image,this);
	this.addCard(level,'Y',2,3,7,9,0,4,'Loire Campaign',image,this);
	this.addCard(level,'N',1,5,7,9,0,5,'Loire Campaign',image,this);
	this.addCard(level,'N',1,2,6,9,0,4,'Siege of Harfleur',image,this);
	this.addCard(level,'N',1,3,5,7,0,4,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',2,2,6,7,0,4,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',3,4,4,8,0,4,'Siege of Harfleur',image,this);
	this.addCard(level,'N',2,4,4,10,0,5,'Siege of Harfleur',image,this);
}
if(level===3){
	this.addCard(level,'N',1,2,3,4,5,5,'Battle of Castillon',image,this);
	this.addCard(level,'N',2,2,3,4,7,5,'Battle of Castillon',image,this);
	this.addCard(level,'N',3,5,6,7,8,6,'Battle of Castillon',image,this);
	this.addCard(level,'N',1,1,1,1,10,5,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',2,2,5,6,8,5,'Capture of Lusignan',image,this);
	this.addCard(level,'N',1,3,3,8,8,6,'Capture of Lusignan',image,this);
	this.addCard(level,'Y',1,2,5,7,9,5,'Combat of the thirty',image,this);
	this.addCard(level,'Y',2,2,4,5,9,5,'Combat of the thirty',image,this);
	this.addCard(level,'N',4,4,6,6,10,6,'Combat of the thirty',image,this);
	this.addCard(level,'N',1,1,2,3,6,4,'Loire Campaign',image,this);
	this.addCard(level,'Y',1,3,5,6,7,5,'Loire Campaign',image,this);
	this.addCard(level,'N',3,4,5,7,10,6,'Loire Campaign',image,this);
	this.addCard(level,'N',1,2,2,4,4,5,'Siege of Harfleur',image,this);
	this.addCard(level,'Y',1,3,5,6,9,5,'Siege of Harfleur',image,this);
	this.addCard(level,'N',3,4,7,8,9,6,'Siege of Harfleur',image,this);
}

if(level==='e'){
	var image="images/dungeonevent";
	this.addCard(level,'N',0,0,0,0,0,0,'Event Barbarian Attack',image+"BarbarianAttack",this);
	this.addCard(level,'N',0,0,0,0,0,0,'Event Broken Items',image+"BrokenItems",this);
	this.addCard(level,'N',0,0,0,0,0,0,'Event Castle Taxation',image+"CastleTaxation",this);
	this.addCard(level,'N',0,0,0,0,0,0,'Event Golbin Raid',image+"GolbinRaid",this);
	this.addCard(level,'N',0,0,0,0,0,0,'Event Kings Feast',image+"KingsFeast",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Market Shortage',image+"MarketShortage",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Market Surplus',image+"MarketSurplus",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Orcs Attack',image+"OrcsAttack",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Sand Storm',image+"SandStorm",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Thrown In The Dungeon',image+"ThrownInTheDungeon",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Treasure',image+"Treasure",this);	
	this.addCard(level,'N',0,0,0,0,0,0,'Event Viking Parade',image+"VikingParade",this);	
	}

}

/****************************
 A class representing a card
****************************/
function questCard(level,coin,item1,item2,item3,item4,item5,vp,name,image,oCardSet) {

	// Initialise settings
//	this.number = oNumber;
//	this.suit = oSuit;
//	this.color = oColour;
	this.level=level;
	this.item1=item1;
	this.item2=item2;
	this.item3=item3;
	this.item4=item4;
	this.item5=item5;
	this.coin = coin;
	this.name = name;
	this.vp = vp;
	this.image = image;
	this.wayup = false;
	this.cardSet = oCardSet;
	this.cardStack = null;
	this.positionOnStack = 0;

	// Create the card image and placeholder
	this.representation = document.createElement('div');
	this.representation.relatedObject = this;
	this.representation.style.position = 'absolute';
	this.representation.className = 'questCard';
	this.cardImage = document.createElement('img');
	this.cardImage.style.display = 'block';
	this.representation.appendChild(this.cardImage);

}

questCard.prototype.toString = function () { return '[object questCard: '+this.number+']'; };

questCard.prototype.moveToStack = function (oNewStack) {
	// Move onto another card stack
	if( this.cardStack ) {
		this.cardStack.cardsInStack[ this.positionOnStack ] = null;
	}
	this.cardStack = oNewStack;
	this.positionOnStack = oNewStack.cardsInStack.length;
	oNewStack.cardsInStack[this.positionOnStack] = this;
};

questCard.prototype.nextOnStack = function () {
	// Like nextSibling but related to card stacks
	if( !this.cardStack ) { return null; }
	return this.cardStack.cardsInStack[ this.positionOnStack + 1 ];
};

questCard.prototype.previousOnStack = function () {
	// Like previousSibling but related to card stacks
	if( !this.cardStack ) { return null; }
	return this.cardStack.cardsInStack[ this.positionOnStack - 1 ];
};

questCard.prototype.inheritCardDesign = function () {
	// Get the new card set images
	this.faceImage = this.cardSet.cardSet+this.number+this.cardSet.imageExtension;
	this.cardSet.addImageCache(this.faceImage);
	this.redrawCardImage();
};

//questCard.prototype.changeCard = function (oNumber) {
//	this.number = oNumber;
//	this.suit = oSuit;
//	this.inheritCardDesign();
//};

questCard.prototype.redrawCardImage = function () {
	// Set or change the image showing on the card face
	if( !this.faceImage || !this.cardSet.backImage ) { return; }
	// Bug in Firefox - alt attributes do not change unless they are made _before_ an SRC change
	this.cardImage.setAttribute('alt',this.wayup?(this.cardSet.cardNames[this.number-1]):this.cardSet.cardWord);
	this.cardImage.src = this.wayup ? this.faceImage : this.cardSet.backImage;
};

questCard.prototype.showFace = function (oWhich) {
	// Used to flip a card over
	if( this.redrawNewImage != oWhich ) {
		this.wayup = oWhich;
		this.redrawCardImage();
	}
};

questCard.prototype.setCardSize = function (oWidth,oHeight) {
	// Set the width of the card image
	this.cardImage.width = oWidth;
	this.cardImage.height = oHeight;
	this.cardImage.style.width = oWidth;
	this.cardImage.style.height = oHeight;
	this.representation.style.width = oWidth;
	this.representation.style.height = oHeight;
};
