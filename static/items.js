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
 
cardSet.prototype.addCard = function (oNumber,oName, oImage,oImageSmall,oImageLarge,oImageSmallChecked, oImageChecked,oCount) {
	// Add a card to the deck
	this.playingCards[this.playingCards.length] = new playingCard(oNumber,oName, oImage,oImageSmall,oImageLarge,oImageSmallChecked, oImageChecked,oCount);
};

cardSet.prototype.addCardc = function (oCard) {
	// Add a card to the deck
	this.playingCards[this.playingCards.length] = new playingCard(oCard.number,oCard.name, oCard.image,oCard.imageSmall,oCard.imageLarge,oCard.imageSmallChecked, oCard.imageChecked, oCard.count);

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
};


cardSet.prototype.setCardSize = function (size) {
	// Set a nice width for the cards - any CSS width value is allowed
	for( var i = 0; i < this.playingCards.length; i++ ) {
		switch(size)
		{
		case 'small':
			this.playingCards[i].image = this.playingCards[i].imageSmall;
			break;
		case 'large':
			this.playingCards[i].image = this.playingCards[i].imageLarge;
			break;
		case 'smallChecked':
			this.playingCards[i].image = this.playingCards[i].imageSmallChecked;
			break;
		case 'checked':
			this.playingCards[i].image = this.playingCards[i].imageChecked;
			break;
		case 'orig':
			this.playingCards[i].image = this.playingCards[i].imageOrig;
			break;
		default:
			this.playingCards[i].image = this.playingCards[i].imageOrig;
		}
	}
};

/*
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
*/
cardSet.prototype.createBlankMarket = function(imageBase) {
	// Create 10 cards
	var oImage = "";
	   for (var a = 1; a < 11; a++) { 
		   oImage=imageBase + a + "_card.jpg";
		   oImageSmall=imageBase + a + "_card_sm.jpg";
   		   oImageLarge=imageBase + a + "_card_lg.jpg";
		   oImageSmallChecked=imageBase + a + "_card_sm_checked.jpg";
   		   oImageChecked=imageBase + a + "_card_checked.jpg";
		   var name = "";
		   switch (a) {
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
			this.addCard(a,name,oImage,oImageSmall,oImageLarge,oImageSmallChecked, oImageChecked, 0);
		}

		   oImage=imageBase+"back_card.jpg";
		
		this.addCard(-1,"CardBack",oImage,oImage,oImage,oImage, oImage, 0);

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
function playingCard(oNumber,oName, oImage,oImageSmall,oImageLarge,oImageSmallChecked,oImageChecked,oCount ) {

	// Initialise settings
	this.number = oNumber;
	this.name = oName;
	this.imageOrig = oImage;
	this.image = oImage;
	this.imageSmall = oImageSmall;
	this.imageSmallChecked = oImageSmallChecked;
	this.imageLarge = oImageLarge;
	this.imageChecked = oImageChecked;
	this.count = oCount;
	this.countImg =  "";
	this.selected = false;
	this.borderColor = 'border:1px solid black';
	//this.positionOnStack = this.number;
	// Create the card image and placeholder
	this.cardImage = document.createElement('img');
	this.cardImage.style.display = 'block';

	}

playingCard.prototype.setCountImage = function (oCount) {
	
	this.countImg = "../images/" + oCount +  "_count_card.jpg";
}

playingCard.prototype.setCardSize = function (size) {
	// Set the width of the card image
switch (size)
	{
		case 'small':
			this.image = this.imageSmall;
			break;
		case 'large':
			this.image = this.imageLarge;
			break;
		case 'smallChecked':
			this.image = this.imageSmallChecked;
			break;
		case 'checked':
			this.image = this.imageChecked;
			break;
		case 'orig':
			this.image = this.imageOrig;
			break;
		default:
			this.image = this.imageOrig;
	}
};

