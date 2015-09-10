


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
function cardSet() {
	
	// Storage for card references
	this.playingCards = [];
}
//
//cardSet.prototype.defaultCardNames = ['1','2','3','4','5','6','7','8','9','10'];
//cardSet.prototype.defaultCardWord = 'Card';
//cardSet.prototype.toString = function () { return '[object cardSet]'; };

cardSet.prototype.addCard = function (oNumber,oImage,oCount) {
	// Add a card to the deck
	this.playingCards[this.playingCards.length] = new playingCard(oNumber,oImage,oCount,this);
};

cardSet.prototype.peek = function (i) {
	return this.playingCards[ i + 1 ];
};


cardSet.prototype.shuffleCards = function (oTimes) {
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

cardSet.prototype.setCardSize = function (oWidth,oHeight) {
	// Set a nice width for the cards - any CSS width value is allowed
	for( var i = 0; i < this.playingCards.length; i++ ) {
		this.playingCards[i].setCardSize(oWidth,oHeight);
	}
};

//cardSet.prototype.redrawCards = function () {
//	// Redraws all cards (resets their images and alt text to the correct values)
//	for( var i = 0; i < this.playingCards.length; i++ ) {
//		this.playingCards[i].redrawCardImage();
//	}
//};


//cardSet.prototype.forcePageRedraw = function () {
//	// Force full document redraw
//	document.body.className = document.body.className ? ( document.body.className + '' ) : '';
//};

cardSet.prototype.create75Cards = function () {
	// Create 75 cards
	var oImage = "";
	for( a = 1; a <= 10; a = a + 1) {
	   for( b = 12; b >= a; b = b - 1)	   
	   {
		   oImage="../images/"+a+"_card.jpg";
			this.addCard(a,oImage,1,this);
		}

	}
}

cardSet.prototype.createBlankMarket = function() {
	// Create 10 cards
	var oImage = "";
	   for (var a=1; a<11; a++) { 
		   oImage="../images/"+a+"_card.jpg";
			this.addCard(a,oImage,0,this);
		}

	}

cardSet.prototype.truncate = function () {
	for(var i = this.playingCards.length-1; i >= 0; i--){              // STEP 1
		if(this.playingCards[i] === null){ // STEP 2
			this.playingCards.splice(i,1);                             // STEP 3
		}
	}	
};


/****************************
 A class representing a card
****************************/
function playingCard(oNumber,oImage,oCount,oCardSet) {

	// Initialise settings
	this.number = oNumber;
	this.image = oImage;
	this.count = oCount;
	this.wayup = false;
	this.cardSet = oCardSet;
	this.owner = null;
	this.positionOnStack = 0;
	this.selected = false;
	this.borderColor = 'black'
	// Create the card image and placeholder
	this.representation = document.createElement('div');
	this.representation.relatedObject = this;
	this.representation.style.position = 'absolute';
	this.representation.className = 'playingcard';
	this.cardImage = document.createElement('img');
	this.cardImage.style.display = 'block';
	this.representation.appendChild(this.cardImage);

	}

//playingCard.prototype.toString = function () { return '[object playingCard: '+this.number+']'; };


playingCard.prototype.setCardSize = function (oWidth,oHeight) {
	// Set the width of the card image

	this.cardImage.width = oWidth;
	this.cardImage.height = oHeight;
	this.cardImage.style.width = oWidth;
	this.cardImage.style.height = oHeight;
	this.representation.style.width = oWidth;
	this.representation.style.height = oHeight;
};
