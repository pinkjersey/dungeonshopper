﻿import random
import json
import logging
from game_model import *
from array import *
from copy import deepcopy

def createOtherPlayer(player):
    """Utility function that copies the given player into a dictionary and sets the
    hand cards to -1. This creates a view of player X of player Y.

    player: the player to create a copy of
    """
    dict = deepcopy(player.to_dict())
    hand = dict["hand"]
    sz = len(hand)
    for i in range(sz):
        hand[i] = -1
        dict["hand"] = hand
    return dict    

def calculateBonus(player):
    """Calculates the bonus points a player earned"""
    numThreeSet = 0
    numFiveSet = 0
    # creates an array of five unsigned bytes (0 .. 255)
    types = array('B', [0,0,0,0,0])
    for quest in player.questsCompleted:
        if quest.type < 1 or quest.type > 5:
            pass

        types[quest.type-1] += 1
        
    numFiveSet = min(types)
    for num in types:
        ct = num / 3
        numThreeSet += ct

    return (numThreeSet + numFiveSet) * 3


def playerState(game, playerId):
    """Generates the player state
    game: the game object
    playerId: the playerId of interest
    """
    #game.players[playerId].playerId = playerId
    player = game.players[playerId]
    player.playerId = playerId
    player.bonus = calculateBonus(player)
    thedict = player.to_dict()

    thedict["numPlayers"] = game.numPlayers
    thedict["curPlayer"] = playerId
    thedict["itemsCountRemaining"] = len(game.itemDeck)
    thedict["questsCountRemaining"] = len(game.questDeck)
    thedict["market"] = game.market
    thedict["playerId"] = playerId
    thedict["gameMode"] = game.gameMode
    thedict["gameKey"] = game.gameKey
    thedict["bonus"] = calculateBonus(player)
    thedict["updateDate"] = game.updateDate.strftime("%A, %d. %B %Y %I:%M:%S%p")

    eventList = []
    for e in player.curEvent:
        eventList.append(e.to_dict())
    thedict["curEvent"] = eventList

    if game.curPlayer == playerId:
        thedict["isActive"] = True
    else:
        thedict["isActive"] = False
    
    questlist = []
    for q in game.questsInPlay:
        questlist.append(q.to_dict())        
    thedict["questsInPlay"] = questlist

    otherPlayers = []
    for p in game.players:
        if (p != player):
            p.bonus = calculateBonus(p)
            otherPlayers.append(createOtherPlayer(p))

    thedict["otherPlayers"] = otherPlayers

    thedict["actionsRemaining"] = game.actionsRemaining

    discardLen = len(game.discardPile)
    thedict["discardsCount"] = discardLen    
    if discardLen > 0:
        thedict["lastDiscarded"] = game.discardPile[discardLen-1]
    else:
        thedict["lastDiscarded"] = None

    el = []
    for e in game.playerLog:
        el.append(e.to_dict())

    thedict["playerLog"] = el
    thedict["turns"] = player.turns

    jsonstr = json.dumps(thedict)
    return jsonstr   

def representsInt(s):
    try: 
        int(s)
        return True
    except ValueError:
        return False

def whatToArray(what):
    """Converts the given string containing integers into a an array of ints
    Features:
    1) Confirms that the given string is valid, logs error and returns blank array if not
       valid
    2) Converts 0's into 10
    3) The results are sorted

    what: a string representing a list of numbers, '22' becomes [2, 2]
    returns: list of cards
    """
    ret = []
    if not representsInt(what):
        logging.error("invalid what, cannot convert to array: {0}".format(what))
        return ret

    for c in what:
        ci = int(c)
        if (ci == 0):
            ci = 10;
        ret.append(ci)

    ret.sort()
    return ret

def getCartId(where):
    if ("cart" in where):
        cartid = int(where[4:])
        if (cartid < 0 or cartid > 3):
            raise ValueError("Invalid cart id")
        return cartid
    else:
        raise ValueError("where isn't a cartid")

def discardItem(game, aPlayerId, whati, where):
    """Utility discard function
    Discards one item from a where and addes it to the discard pile

    game: the game object
    aPlayerId: player ID. Only used when game not in game mode
    whati: what to remove (1..10)
    where: hand, market or cart
    """
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]
    
    found = False
    if (where == "hand"):
        l = len(player.hand)        
        for i in range(l):            
            if player.hand[i] == whati:                
                game.discardPile.append(player.hand[i])                
                del player.hand[i]
                found = True
                break

    elif (where == "market"):        
        m = len(game.market)
        for mi in range(m):
            if game.market[mi] == whati:
                game.discardPile.append(game.market[mi])
                del game.market[mi]
                found = True
                break

    elif ("cart" in where):        
        cartIdStr = where[4:]
        if not representsInt(cartIdStr):
            raise ValueError('Invalid cart ID: {0}'.format(cartIdStr))

        cartid = int(cartIdStr)         
        if (cartid >=0 and cartid <4):
            cart = player.carts[cartid]
            if (cart.purchased == False):
                # removing item from unpurchased cart is invalid
                raise ValueError('Removing item from unpurchased cart is invalid')

            l = len(cart.inCart)
            for i in range(l):
                if cart.inCart[i] == whati:
                    game.discardPile.append(cart.inCart[i])
                    del cart.inCart[i]
                    found = True
                    break
    else:
        # invalid where
        raise ValueError('Where value is invalid: {0}'.format(where))
     
    return found

def removeItems(game, aPlayerId, what, where, addToDiscardPile):
    """Utility function that removes items from a location and adds the cards to the
    discard pile
    
    game: the game object
    aPlayerId: the player ID to operate on, only valid when the game is in the event mode
    what: a string representing the card(s) to remove (0..9)
    where: hand or cart
    addToDiscardPile: whether or not to add the cards to the discard pile

    Exceptions thrown when the following conditions occur:
    1) whatlen == 0
    2) a given card is not in the source.
    """
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    # convert what string to an array
    # numbers are 1..10
    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("removeItems: empty what array given")
        raise ValueError("removeItems: empty what array given")

    # get the source list based on the given 'what'
    if (where == "hand"):
        srclist = player.hand
    elif ("cart" in where):
        cartId = getCartId(where)
        cart = player.carts[cartId]
        srclist = cart.inCart
    else:
        logging.error("removeItems: invalid where {0}".format(where))
        raise ValueError("removeItems: invalid where {0}".format(where))

    # the what should always be less than or equal to the src list
    srclen = len(srclist)
    if (whatlen > srclen):
        raise ValueError("removeItems: asked to remove {0} items but source has only {1} item(s)".format(whatlen, srclen))

    removed = []
    # for each what, iterate through the src list and remove
    for whati in whats:
        found = False
        srclen = len(srclist)
        for i in range(srclen):
            srci = srclist[i]
            if (srci == 0):
                srci = 10
                
            if (whati == srci):
                found = True
                del srclist[i]
                break

        if (found == False):            
            logging.error("removeItems: failed to find {0}".format(whati))
            srclen = len(srclist)
            for i in range(srclen):
                srci = srclist[i]
                if (srci == 0):
                    srci = 10                        
                logging.error("removeItems: src {0}".format(srci))

            raise ValueError("Failed to locate {0} in src list".format(whati))
        else:
            removed.append(whati)

    if (addToDiscardPile):          
        game.discardPile.extend(removed)

    return
            

def move(game, aPlayerId, what, src, dst, actionCost):
    """Moves cards from src to dst

    Items moved will not end up in the discard pile.

    There is the pending event logic that moves items back to hand before the event starts
    This is for the orcs attack.  
    """    
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    if (game.actionsRemaining == 0 and actionCost > 0):
        # no actions remaining
        logging.error("No actions remaining")        
        return False

    if (src == dst):
        logging.error("move: src and dst the same")
        return False

    # convert input to array
    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("Empty whats")        
        return False

    try:        
        # discard items from src
        logging.info("removing items")
        removeItems(game, aPlayerId, what, src, False)             

        if dst == "hand":
            dstlist = player.hand
        else:
            # get cart id
            cartid = getCartId(dst)
            # find cart
            cart = player.carts[cartid]
            # cart needs to be purchased
            if (cart.purchased == False):
                logging.error("Cart not purchased")        
                return False
            
            # has enough space
            spaceRemaining = cart.cartSize - len(cart.inCart)
            if (spaceRemaining < whatlen):
                logging.error("Not enough space in cart")        
                return False

            dstlist = cart.inCart

        # add items to cart
        for whati in whats:
            dstlist.append(whati)

        dstlist.sort()

    except ValueError as e:
        logging.error("Exception {0}".format(e.message))        
        return False

    game.actionsRemaining = game.actionsRemaining - actionCost
    

    return True

def buyCart(game, aPlayerId, cartidstr, withGold, items, actionCost):
    """Buys cart with gold or items"""
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    if actionCost > 0 and game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")        
        return False

    # find cart id
    cartid = getCartId(cartidstr)
    if (cartid <0 or cartid > 3):
        logging.error("Invalid cart id")        
        return False

    # find cart
    cart = player.carts[cartid]

    if (cart.purchased):
        # cart already purchased
        return False

    if (withGold == "1"):
        if (player.gold < cart.goldCost):
            logging.error("Player chose to buy cart with gold but the player doesn't have enough")
            return False

        player.gold = player.gold - cart.goldCost
        cart.purchased = True
    else:        
        whats = whatToArray(items)
        sumTotal = sum(whats)        
        if sumTotal < cart.cardCost:
            logging.error("Player chose to buy cart with cards, but card total less than cart cost")
            return False

        for whati in whats:              
            found = discardItem(game, player.playerId, whati, "hand")            
            if (found == False):
                logging.error("Couldn't find all whats {0}".format(whati))        
                return False
            else:
                logging.info("discarded {0}".format(whati))
        cart.purchased = True

    if cartid == 1:
        # deal quest, assign one victory point
        dealQuest(game)
        player.points += 1
    elif cartid == 2:
        player.points += 3
    elif cartid == 3:
        player.maxHand += 1

    game.actionsRemaining = game.actionsRemaining - actionCost		      

    return True

def marketTrade(game, aPlayerId, handItems, marketItems, actionCost):
    if game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")  
        return False

    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    whath = whatToArray(handItems)
    whatm = whatToArray(marketItems)
    if (len(whath) > 1 and len(whatm) > 1):
        logging.error("Multi to multi trade not allowed")
        return False

    if (len(whath) == 0 or len(whatm) == 0):
        logging.error("Item sizes must be greater than zero")
        return False

    if (sum(whath) != sum(whatm)):
        logging.error("Sum mismatch")
        return False

    addToHand = []
    addToMarket = []

    for whati in whath:
        found = False
        hlen = len(player.hand)
        for i in range(hlen):
            h = player.hand[i]
            if h == whati:
                found = True
                addToMarket.append(player.hand[i])
                del player.hand[i]
                break

        if found == False:
            logging.error("Missing item in hand")
            return False

    for whati in whatm:
        found = False
        mlen = len(game.market)
        for i in range(mlen):
            m = game.market[i]
            if m == whati:
                found = True
                addToHand.append(game.market[i])
                del game.market[i]
                break

        if found == False:
            logging.error("Missing item in market")
            return False

    game.market.extend(addToMarket)
    game.market.sort()
    player.hand.extend(addToHand)
    player.hand.sort()
    
    game.actionsRemaining = game.actionsRemaining - actionCost    

    return True                

def discard(game, aPlayerId, what, where, actionCost):
    """Discards a card from the given location
    
    game: game object
    aPlayerId: necessary when discarding for events
    what: a list of items to discard
    where: from which location, hand, market or cart
    actionCost: 1 or 0

    """
    if (game.actionsRemaining == 0 and actionCost > 0):
        # no actions remaining
        logging.error("No actions remaining")  
        return False
    logging.info("discarding  {0} from {1}".format(what, where))
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    whats = whatToArray(what)
    if (len(whats) == 0):
        logging.error("Blank what array")  
        return False

    allFound = True
    for whati in whats:
        try:
            found = discardItem(game, player.playerId, whati, where)
            if (found == False):
                logging.error("Couldn't discard {0}".format(whati))
                allFound = False
                break

        except ValueError as e:
            return False

    if (allFound == False):
        logging.error("Couldn't discard one or more cards")  
        # couldn't find 'what'
        return False

    game.actionsRemaining = game.actionsRemaining - actionCost    

    return True

def getIntersection(list1, list2):
    tmp1 = list(list1)
    tmp2 = list(list2)
    ret = []
    priorlen = len(tmp1)
    while (len(tmp1) > 0 and len(tmp2) > 0):
        for i in range(len(tmp1)):
            item1 = tmp1[i]
            found = False
            for j in range(len(tmp2)):
                item2 = tmp2[j]
                if (item1 == item2):
                    found = True
                    del tmp1[i]
                    del tmp2[j]
                    ret.append(item1)
                    break
            
            if (found == True):
                break

        thislen = len(tmp1)
        if (thislen == priorlen):
            # search done
            break
        else:
            priorlen = thislen

    ret.sort()
    return ret



def prepEvents(game, eventId):
    """This function is called after an event card is drawn. Does all work necessary before asking
        The player for input

        game: game object
        eventId: event id of the even drawn
    """
    logging.info("In prepEvents")
    if game.gameMode != "eventStarted":
        logging.info("Wrong game state, leaving prepEvents")
        return False
    game.gameMode = "eventPending"
    logging.info("GameMode pending: {0}".format(game.gameMode))
    gold = 1
    appendEvent = True
    p = len(game.players)
    for playerId in range(p):
        logging.info("playerId set event status to eventInProgress: {0}".format(playerId))
        game.players[playerId].curEventStatus="eventInProgress"
    #currentEvent=Event(eventId = eventId, whatItems1 = what1, fromWhere1 = where1, whatItems2 = what2, fromWhere2 = where2, gold = gold, itemsCount = itemsCount, moveDest = dest1)
    #this should only happen for the first player that is active that caused it.  it applies to all players
    try:
        #destroy market and re-seed       
        if eventId == 6:
            logging.info("Barb Attack start Event Id:  {0}".format(eventId))
            currentEvent=Event(eventId = eventId)
            resetMarket(game)

        #BrokenItems
        if eventId == 7:
            logging.info("Entered Logic for event BrokenItems")
            currentEvent=Event(eventId = eventId)
        #CastleTaxation
        if eventId == 8:
            logging.info("Entered Logic for event CastleTaxation")
            currentEvent=Event(eventId = eventId)
        #GolbinRaid
        if eventId == 9:
            logging.info("Entered Logic for event GolbinRaid")
            currentEvent=Event(eventId = eventId)
        #KingsFeast
        if eventId == 10:
            logging.info("KingsFeast start Event Id:  {0}".format(eventId))
            currentEvent=Event(eventId = eventId, itemsCount = 1, moveDest = 'hand')
            p = len(game.players)
            for playerId in range(p):
                logging.info("playerId: {0}".format(playerId))
                dealItemCard(playerId, game)

        #MarketShortage	
        if eventId == 11:
            logging.info("MarketShortage start Event Id: {0}".format(eventId))
            card = str(dealItemCardToMarket(game))
            if card == "10":
                card = "0"

            cardInt = int(card)
            logging.info("Market shortage card dealt: {0}".format(card))
            #get the number on the card, go through the market, discard all that match
            
            currentEvent=Event(eventId = eventId, prepWhatItems1 = str(card), fromWhere1 = "market")
            
            marketstr = ""
            for itemi in game.market:
                itemstr = "   {0}".format(itemi)
                marketstr += itemstr
            
            logging.info("Market contents: {0}".format(marketstr))    

            while (True):
                found = False
                for itemi in game.market:
                    if itemi == cardInt:
                        logging.info("{0} matches card, discarding".format(itemi))
                        found = True
                        discard(game,0,card,"market",0)
                        break

                if (found == False):
                    break

        #MarketSurplus
        if eventId == 12:
            logging.info("MarketSurplus start Event Id:  {0}".format(eventId))
            prepWhatItems1 = ""
            # deal card to market
            for i in range(5):
                card = str(dealItemCardToMarket(game))
                if card == "10":
                    card = "0"
                prepWhatItems1 += card
                #logging.info("market surplus items: {0}".format(cards))
            currentEvent=Event(eventId = eventId, prepWhatItems1 = prepWhatItems1, fromWhere1 = "market")

        #orcs attack.  Wheelbarrow destroyed.  if handItems present don't destroy, but discard them
        if eventId == 13:
            appendEvent = False
            logging.info("Entered Orc Attack event {0}".format(eventId))
            p = len(game.players)
            for playerId in range(p):
                prepWhatItems1 = ""
                cart = game.players[playerId].carts[0]
                #logging.info("playerId: {0}".format(playerId))
                foundCard = False
                for i in cart.inCart:
                    if (i == 3 or i == 4 or i == 5):
                        foundCard = True
                        break
                
                #logging.info("sumItems: {0}".format(sumItems))
                if not foundCard:
                    logging.info("cart has been destroyed")
                    cart.destroyed = True                
                    cart.purchased = False
                    if len(cart.inCart) > 0:
                        for i in cart.inCart:
                            #logging.info("i= {0}".format(i))
                            #move cards back to hand
                            prepWhatItems1 += str(i)
                            #logging.info("cart items to return {0}".format(prepWhatItems1))
                        move(game, playerId, prepWhatItems1, "cart0", "hand", 0)
                currentEvent = Event(eventId = eventId, prepWhatItems1 = prepWhatItems1, prepFromWhere1 = "cart0", prepMoveDest = "hand")
                game.players[playerId].curEvent.append(currentEvent)
        #sandstorm PASS CARDS TO LEFT
        if eventId == 14:
            logging.info("Sandstorm start Event Id:  {0}".format(eventId))
            p = len(game.players)
            if (p == 1):
                logging.info("only one player, skipping event:  {0}".format(eventId))
            else:                
                currentEvent=Event(eventId = eventId)                                
                tmp = game.players[0].hand
                for i in range(p):
                    src = i+1                    
                    if src == p:
                        srcList = tmp
                    else:
                        srcList = game.players[src].hand
                    game.players[i].hand = srcList

                for i in range(p):
                    numItemsInHand = len(game.players[i].hand)
                    if numItemsInHand < game.players[i].maxHand:
                        diff = game.players[i].maxHand - numItemsInHand
                        logging.info("Dealing {0} cards to player {1}".format(diff, i+1))
                        for d in range(diff):                        
                            dealItemCard(i, game)
                            game.players[i].hand.sort()

        #ThrownInTheDungeon
        if eventId == 15:
            logging.info("Thrown in the dungeon start Event Id:  {0}".format(eventId))
            currentEvent=Event(eventId = eventId)

        #Treasure
        if eventId == 16:
            logging.info("Starting Treasure Event Id:  {0}".format(eventId))
            logging.info("Gold Found! {0}".format(gold))    
            currentEvent=Event(eventId = eventId, gold = 1)
            p = len(game.players)
            for playerId in range(p):
                game.players[playerId].gold += gold;


        #VikingParade
        if eventId == 17:
            currentEvent=Event(eventId = eventId)
            logging.info("Viking Parade start Event Id:  {0}".format(eventId))


        #hailstorm players pass hand to the right
        if eventId == 18:
            logging.info("Hailstorm start Event Id:  {0}".format(eventId))
            currentEvent=Event(eventId = eventId)

            p = len(game.players)
            if(p==1):
                logging.info("only one player, skipping event:  {0}".format(eventId))
            nextPlayerId = 1
            tmp = game.players[0].hand
            for i in range(p):
                #logging.info("game.players[i]: {0}".format(i))
                if (nextPlayerId == game.numPlayers):
                    nextPlayerId = 0
                    del game.players[i].hand
                    game.players[i].hand = tmp
                else:
                    del game.players[i].hand
                    game.players[i].hand = game.players[nextPlayerId].hand
                numItemsInHand = len(game.players[i].hand)
                if numItemsInHand < game.players[i].maxHand:
                    diff = game.players[i].maxHand - numItemsInHand
                    for d in range(diff):
                        dealItemCard(i, game)
                        game.players[i].hand.sort()
                nextPlayerId += 1
        
        #HiddenRoom 
        if eventId == 19:
            logging.info("HiddenRoom start Event Id:  {0}".format(eventId))
            currentEvent=Event(eventId = eventId)
    except ValueError as e:
        logging.error("Exception ({0}): {1}".format(e.errno, e.strerror)) 
        game.gameMode = "game"
        return False  


    p = len(game.players)
    if appendEvent == True:
        for playerId in range(p):
            game.players[playerId].curEvent.append(currentEvent)

    return True

#result = completeEvent(game, eventId, iPlayerId, igold, iitemsCount, what1, where1, what2, where2, dest1)
def completeEvent(game, eventId, playerId, gold, itemsCount, what1, where1, what2, where2, dest1):
#note that the gameMode has been added to the game object
#this controls if the game is in game or event mode
#special event orcs attack number 13
#pass in -1 to show cart will be destroyed

    if game.gameMode != "eventPending":
        return True
    playerId=int(playerId)
    #logging.info("complete event what1: {0}".format(what1)) 
    #logging.info("complete event where1: {0}".format(where1)) 
    #logging.info("complete event what2: {0}".format(what2)) 
    #logging.info("complete event where2: {0}".format(where2)) 
    #logging.info("complete event dest1: {0}".format(dest1)) 
				
    #currentEvent=Event(eventId = eventId, whatItems1 = what1, fromWhere1 = where1, whatItems2 = what2, fromWhere2 = where2, gold = gold, itemsCount = itemsCount, moveDest = dest1)
    #game.players[playerId].curEvent.append(currentEvent)
    eventCount = len(game.players[playerId].curEvent)
    game.players[playerId].curEvent[eventCount-1].eventId = eventId
    game.players[playerId].curEvent[eventCount-1].whatItems1 = what1
    game.players[playerId].curEvent[eventCount-1].fromWhere1 = where1	
    game.players[playerId].curEvent[eventCount-1].whatItems2 = what2
    game.players[playerId].curEvent[eventCount-1].fromWhere2 = where2
    game.players[playerId].curEvent[eventCount-1].gold = gold
    game.players[playerId].curEvent[eventCount-1].itemsCount = itemsCount
    game.players[playerId].curEvent[eventCount-1].moveDest = dest1
    player = game.players[playerId]
    logging.info("Entered Logic for Events")
    logging.info("playerid is: {0}".format(playerId)) 
    cart = game.players[playerId].carts[0]
    what1arr = []
    if (what1 != None and what1 != ''):
        what1arr = whatToArray(what1)
        if (len(what1arr) == 0):
            raise ValueError("what1arr size cannot be 0 {0}".format(what1))
    else:
        logging.info("blank what1")

    what2arr = []
    if (what2 != None and what2 != ''):
        what2arr = whatToArray(what2)
        if (len(what2arr) == 0):
            raise ValueError("what2arr size cannot be 0 {0}".format(what1))
    else:
        logging.info("blank what2")

    try:
        #Barb Attack destroy market and re-seed if you are the first to get here        
        if eventId == 6:
            logging.info("Barb Attack start Event Id:  {0}".format(eventId))
        #BrokenItems
        if eventId == 7:
            logging.info("BrokenItems start Event Id:  {0}".format(eventId))
            if len(what1arr) > 0:
                logging.info("Broken items what1 contains {0} items".format(len(what1arr)))
                for whati in what1arr:
                    #logging.info("whati {0}".format(whati)) 
                    #logging.info("where1 {0}".format(where1)) 
                    fish(game, playerId, whati, where1, 0)
            else:
                logging.info("BrokenItems nothing in what1")

            if len(what2arr) > 0:
                logging.info("Broken items what2 contains {0} items".format(len(what2arr)))
                for whati2 in what2arr:
                    #logging.info("whati2 {0}".format(whati2)) 
                    #logging.info("where2 {0}".format(where2)) 
                    fish(game, playerId, whati2, where2, 0)
            else:
                logging.info("BrokenItems nothing in what2")
        #CastleTaxation
        if eventId == 8:
            logging.info("Castle Taxation start Event Id:  {0}".format(eventId))
            #discard items first
            if len(what1arr) > 0:
                removeItems(game,  playerId, what1, where1, True)

            if len(what2arr) > 0:
                removeItems(game,  playerId, what2, where2, True)
                                           
            player.gold -= gold
        #GolbinRaid
        if eventId == 9:
            logging.info("GolbinRaid start Event Id:  {0}".format(eventId))
            #discard items first
            if len(what1arr) > 0:
                for whati in what1arr:        
                    found = discardItem(game, playerId, whati, where1)
                    if (found == False):
                        logging.error("Couldn't find all what1arr {0}".format(whati))        
                        return False
        #KingsFeast
        if eventId == 10:
            logging.info("KingsFeast start Event Id:  {0}".format(eventId))
        #MarketShortage	
        if eventId == 11:
            logging.info("Complete Event MarketShortage nothing to do")
        #MarketSurplus
        if eventId == 12:
            logging.info("MarketSurplus start Event Id:  {0}".format(eventId))
   
        #orcs attack.  Wheelbarrow destroyed.  if handItems present don't destroy, but discard them
        if eventId == 13:
            logging.info("orcs attack start Event Id:  {0}".format(eventId))
            #discard items if buying it back
            if len(what1arr) > 0:
                for whati in what1arr:
                    #logging.info("Discarding {0} from {1}".format(whati, where1))
                    found = discardItem(game, playerId, whati, where1)
                    if (found == False):
                        logging.error("Couldn't find all what1arr {0}".format(whati))        
                        return False
                logging.info("buying card back with:  {0}".format(what1))
                cart.destroyed = False
                cart.purchased = True
        #hailstorm players pass hand to the right
        if eventId == 18:
            logging.info("hailstorm start Event Id:  {0}".format(eventId))
        #ThrownInTheDungeon
        if eventId == 15:
            logging.info("Thrown in the dungeon start Event Id:  {0}".format(eventId))
            #discard item
            if len(what1arr) > 0:
                for whati in what1arr:
                    logging.info("Discarding {0} from {1}".format(whati, where1))
                    found = discardItem(game, playerId, whati, where1)
                    if (found == False):
                        logging.error("Couldn't find all what1arr {0}".format(whati))        
                        return False
        #Treasure
        if eventId == 16:
            logging.info("Starting Event Id:  {0}".format(eventId))
        #VikingParade
        if eventId == 17:
            logging.info("Viking Parade start Event Id:  {0}".format(eventId))            
            whatlen = len(what1arr)
            if (whatlen == 0):
                logging.info("Nothing to move")  
            else:
                move(game, playerId, what1, where1, dest1, 0)
        #sandstorm PASS CARDS TO LEFT
        if eventId == 14:
            logging.info("sandstorm start Event Id:  {0}".format(eventId))
        #HiddenRoom 
        if eventId == 19:
            logging.info("HiddenRoom start Event Id:  {0}".format(eventId))
            if gold == 1:
                player.gold += 1
            if itemsCount > 0:
                for r in range(itemsCount):
                    dealItemCard(playerId, game)

    except ValueError as e:
        logging.error("Exception: {0}".format(e))
        return False  

    logging.info("Player {0} event completed".format(playerId))
    game.players[playerId].curEventStatus = "eventCompleted"
    
    ct = 0
    for player in game.players:
        if player.curEventStatus == "eventCompleted":
            ct += 1

    if (ct == game.numPlayers):
        game.gameMode = "game"
        deleteEventFromQuestList(game)
        dealQuest(game)


    return True	

def deleteEventFromQuestList(game):
    """Searches for an event in the questsInPlay list and deletes it
    This code assumes there is only one event in  the quest list

    game: the game object
    """
    ct = 0
    for quest in game.questsInPlay:
        if (quest.type > 5):
            del game.questsInPlay[ct]
            break

        ct += 1

def completeQuest(game, aPlayerId, what, where):
    """Utility function that completes a quest
    game: game object
    aPlayerId: player ID to operate on (only valid when the game is handling events)
    what: which cards to use
    where: from where
    """
    # completing quests require no actions
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("Blank what array")  
        return False

    try:
        # find cart and make sure the cards exist in it
        # delete them if exists
        removeItems(game, player.playerId, what, where, True)

        # match quest
        questFound = False
        numQuests = len(game.questsInPlay)
        for i in range(numQuests):
            q = game.questsInPlay[i]
            inter = getIntersection(whats, q.items)

            if (inter == whats):
                questFound = True
                player.questsCompleted.append(q)
                player.questsCompleted.sort(key=lambda questCard: questCard.type, reverse=False)
                if (q.coin):
                    player.gold += 1

                player.points += q.vp

                del game.questsInPlay[i]
                dealQuest(game)
                break

        if (questFound == False):
            logging.error("Couldn't match quest")  
            # couldn't find 'what'
            return False

    except ValueError as e:
        logging.error("Exception: {0}".format(e))
        return False
    

    return True

def passPlayer(game, aPlayerId, items):
    """Passes the currnet player

    The player sometimes needs to discard cards to meet the max hand.
    After discard the # of items in the player hand needs to match the max hand.

    If the number of cards in the players hand is less than max hand, then the player is
    dealt N number of cards

    Exception cases:
    1) Discarded too many items
    2) Discarded too few items
    3) The item asked to discard doesn't exist in hand

    game: game object
    aPlayerId: player ID (only used when game in event mode)
    items: items to discard (what string)
    """
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    # convert what string to array
    whats = []
    numItems = 0
    if (items != ''):
        whats = whatToArray(items)
        numItems = len(whats)    

    priorPlayer = player.playerId
    player = game.players[player.playerId]

    # sanity check
    numItemsInHand = len(player.hand)
    if (numItemsInHand - numItems) > player.maxHand:
        raise ValueError("Need to discard more items")

    if (numItems > 0 and (numItemsInHand - numItems) < player.maxHand):
        raise ValueError("Discarded too many items")

    # discard cards past max if needed    
    for whati in whats:        
        found = discardItem(game, player.playerId, whati, "hand")
        if (found == False):            
            raise ValueError("Pass: Failed to find {0}".format(whati))       

    if numItemsInHand < player.maxHand:
        diff = player.maxHand - numItemsInHand
        for i in range(diff):
            dealItemCard(player.playerId, game)

        player.hand.sort()

    # deal card to market
    dealItemCardToMarket(game)

    game.actionsRemaining = 2
    game.curPlayer += 1
    if game.curPlayer == game.numPlayers:
        game.curPlayer = 0

    player.turns += 1	    

    return priorPlayer

def fish(game, aPlayerId, what, where, actionCost):
    """Discards the given 'what' from 'where' and deals another card to
    the player's hand
    
    game: the game object
    aPlayerId: the player ID to work on (only used in event mode)
    what: a string indicating a card (1..10)
    where: hand or cart
    actionCost: cost to deduct from the number of actions
    """
    if (game.actionsRemaining == 0 and actionCost > 0):
        # no actions remaining
        return False

    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    whati = int(what)
    if (whati < 1 or whati > 10):
        # invalid what
        return False

    
    try:
        found = discardItem(game, player.playerId, whati, where)
    except ValueError as e:
        logging.error("fish: an exception occured during discard item {0}".format(e))
        return False

    if (found == False):
        # couldn't find 'what'
        logging.error("fish: discard failed to find 'what' {0}".format(what))
        return False

    lastDealt = dealItemCard(player.playerId, game)
    logging.info("fish: player {0} got a {1}".format(player.playerId, lastDealt))

    game.actionsRemaining -= actionCost

    return True

def buyAction(game, aPlayerId):
    """Reduces the given player's gold by two and adds another action"""    
    buyCost = 2
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]
    
    if (player.gold < buyCost):
        return False

    player.gold = player.gold - buyCost
    game.actionsRemaining = game.actionsRemaining + 1    

    return True

def createNewGame(gameKey, numPlayers, name):

    # create new game entity with id "theGame"
    # later each existing game will have their own IDs
    game = Game(numPlayers=numPlayers, spaceAvailable=numPlayers, id=gameKey, gameKey=gameKey)

    # create decks
    game.questDeck = newQuestDeck(numPlayers)
    if (len(game.questDeck) == 0):
        raise ValueError("blank quest deck. Cannot continue")


    game.itemDeck = newItemDeck()
    for i in range (0, game.numPlayers):
        p=Player(name="defaultPlayer{0}".format(i), playerId=i)
        if (i == 0):
            p.name = name
        game.players.append(p)

    # deal five cards
    for i in range (5):
        for j in range(game.numPlayers):
            dealItemCard(j, game)

    # deal four cards to the market
    for i in range(4):
        dealItemCardToMarket(game)

    maxTotal = 0
    game.curPlayer = 0
    # determine the max card sum
    for p in range(game.numPlayers):
        pMax = sum(game.players[p].hand)
        if (pMax > maxTotal):
            maxTotal = pMax                
        
    # determine first player
    for p in range(game.numPlayers):
        pMax = sum(game.players[p].hand)
        if (pMax == maxTotal):
            game.curPlayer = p
            break

    # deal extra cards
    for p in range(game.numPlayers):
        if (p != game.curPlayer):
            dealItemCard(p, game)

    # create carts
    sizes = [ 3, 3, 4, 5]
    gcosts = [ 0, 1, 2, 3]
    ccosts = [ 5, 10, 15, 20]

    for p in range(game.numPlayers):
        for i in range(4):
            c=Cart(purchased=False, cartSize=sizes[i], goldCost=gcosts[i], cardCost=ccosts[i])
            if (i == 0):
                c.purchased = True
            game.players[p].carts.append(c)

    # sort items in player hands
    for p in range(game.numPlayers):
        game.players[p].hand.sort()

    # deal quests
    for i in range(4):
        dealQuest(game)

    # save game to data store
    game.gameMode = "game"
    game.put()
    return game

def shuffle(deck):
    shuffled = []
    sz = len(deck)
    while (sz > 0):
        loc = random.randrange(sz)
        shuffled.append(deck[loc])
        del deck[loc]
        sz = sz -1
    return shuffled

def createQuestCard(level, coin, items, vp, type):
    card = QuestCard(level=level, coin=coin, items=items, vp=vp, type=type)
    return card

def createQuestStacks(tippytop, top, middle, bottom, level1, level2, level3, level4, l0t, l1t, l1m, l2m, l1b, l2b, l3b, et, em, eb):
    etotal = et + em + eb
    if (etotal > len(level4)):
        raise ValueError("Total number of events too big!")

    # tippytop
    for i in range(l0t):
        tippytop.append(level1[0])
        del level1[0]

    # top
    for i in range(l1t):
        top.append(level1[0])
        del level1[0]

    for i in range(et):
        top.append(level4[0])
        del level4[0]

    # middle
    for i in range(l1m):
        middle.append(level1[0])
        del level1[0]

    for i in range(l2m):
        middle.append(level2[0])
        del level2[0]

    for i in range(em):
        middle.append(level4[0])
        del level4[0]

    #bottom
    for i in range(l1b):
        bottom.append(level1[0])
        del level1[0]

    for i in range(l2b):
        bottom.append(level2[0])
        del level2[0]

    for i in range(l3b):
        bottom.append(level3[0])
        del level3[0]

    for i in range(eb):
        bottom.append(level4[0])
        del level4[0]

def newItemDeck():
    """Creates an array of ints representing the item deck
    The cards in this deck are 1..10
    """
    cards = []
    for itemValue in range(1, 11):
        for ct in range(12, itemValue-1, -1):
            cards.append(itemValue)

    shuffled = shuffle(cards)                
    return shuffled


def resetMarket(game):
    """Utility function that 

    1) Extends the discard pile with the content of the market, the market is cleared
    2) The item deck is extended with the contents of the discard pile, the discount pile is cleared
    3) The item deck is shuffled
    4) 4 cards are dealt to the market
    """
    logging.info("Reseting Market")
    # move market to discard
    game.discardPile.extend(game.market)
    # clear the market
    game.market = []

    game.itemDeck.extend(game.discardPile)
    # clear discard
    game.discardPile = []

    # shuffle discard and set it to item deck
    shuffled = shuffle(game.itemDeck)
    game.itemDeck = shuffled

    if (len(game.itemDeck) < 5):
        raise ValueError("Newly created itemdeck has a size less than 5")

    # deal to market
    for i in range(4):
        dealItemCardToMarket(game)


def getFirstItemCard(game):
    """Pops the first time from the itemDeck and returns it
    if the itemDeck is empty, the market is destroyed and the itemDeck is regenerated
    """
    decklen = len(game.itemDeck)
    if (decklen == 0):
        resetMarket(game)

        # deal like usual
        return getFirstItemCard(game)
    else:
        card = game.itemDeck[0]
        del game.itemDeck[0]
        return card

def dealItemCard(playerIndex, game):
    """deals a card to the given player

    playerIndex: player id
    game: game object

    returns: card just dealt
    """
    card = getFirstItemCard(game)   
    game.players[playerIndex].hand.append(card)
    game.players[playerIndex].hand.sort()
    return card

def dealItemCardToMarket(game):
    """deals a card to the market"""
    card = getFirstItemCard(game)
    game.market.append(card)
    return card
        
def dealQuest(game):
    decklen = len(game.questDeck)
    if(decklen == 0):
        # is the game over?            
        questsInPlayLen = len(game.questsInPlay)	
        if(questsInPlayLen==4):
            game.gameMode = "gameOver"
            logging.info("Four quests left in the quest list -- game over")
            return
        
        logging.info("Quest deck empty, can't deal quest")
        return
    else:
        quest = game.questDeck[0]
        del game.questDeck[0]
        game.questsInPlay.append(quest)
        if quest.level == 4:
            game.gameMode = "eventStarted"
            prepEvents(game, quest.type)
        else:
            game.gameMode = "game"


def newQuestDeck(numPlayers):
    logging.info("Creating quest deck for {0} players".format(numPlayers))

    level1Cards = []
    level2Cards = []
    level3Cards = []
    level4Cards = []
    tippytop = []
    top = []
    middle = []
    bottom = []

    level1Cards.append(createQuestCard(1,True,[1,3,9],2,1))
    level1Cards.append(createQuestCard(1,True,[2,2,2],2,1))
    level1Cards.append(createQuestCard(1,True,[1,5,8],3,1))
    level1Cards.append(createQuestCard(1,True,[2,5,7],3,1))
    level1Cards.append(createQuestCard(1,True,[3,4,8],3,1))
    level1Cards.append(createQuestCard(1,True,[3,7,7],3,1))
    level1Cards.append(createQuestCard(1,True,[4,6,7],3,1))
    level1Cards.append(createQuestCard(1,True,[1,1,1],2,2))
    level1Cards.append(createQuestCard(1,True,[1,4,6],2,2))
    level1Cards.append(createQuestCard(1,True,[2,3,7],2,2))
    level1Cards.append(createQuestCard(1,True,[1,6,8],3,2))
    #level1Cards.append(createQuestCard(1,True,[2,6,10],3,2))
    level1Cards.append(createQuestCard(1,True,[2,6,7],3,2))    
    level1Cards.append(createQuestCard(1,True,[3,5,10],3,2))
    level1Cards.append(createQuestCard(1,False,[4,4,4],4,2))
    level1Cards.append(createQuestCard(1,True,[1,3,10],3,3))
    level1Cards.append(createQuestCard(1,True,[1,5,9],3,3))
    #level1Cards.append(createQuestCard(1,True,[2,2,10],3,3))
    level1Cards.append(createQuestCard(1,True,[2,2,7],2,3))
    level1Cards.append(createQuestCard(1,True,[2,5,8],3,3))
    level1Cards.append(createQuestCard(1,True,[3,5,9],3,3))
    level1Cards.append(createQuestCard(1,True,[3,7,8],3,3))
    level1Cards.append(createQuestCard(1,False,[5,5,5],4,3))
    level1Cards.append(createQuestCard(1,True,[1,2,8],2,4))
    level1Cards.append(createQuestCard(1,True,[1,4,9],3,4))
    level1Cards.append(createQuestCard(1,True,[1,6,9],3,4))
    level1Cards.append(createQuestCard(1,True,[2,4,8],3,4))
    level1Cards.append(createQuestCard(1,True,[2,7,8],3,4))
    level1Cards.append(createQuestCard(1,True,[3,6,7],3,4))
    level1Cards.append(createQuestCard(1,True,[4,4,7],3,4))
    level1Cards.append(createQuestCard(1,True,[1,2,9],2,5))
    level1Cards.append(createQuestCard(1,True,[1,5,5],2,5))
    level1Cards.append(createQuestCard(1,True,[3,3,3],2,5))
    level1Cards.append(createQuestCard(1,True,[1,6,10],3,5))
    #level1Cards.append(createQuestCard(1,True,[2,4,10],3,5))
    level1Cards.append(createQuestCard(1,True,[2,4,7],3,5))
    level1Cards.append(createQuestCard(1,True,[3,6,9],3,5))
    level1Cards.append(createQuestCard(1,True,[4,6,6],3,5))
    #level2Cards.append(createQuestCard(2,True,[1,2,6,10],4,1))
    level2Cards.append(createQuestCard(2,True,[1,2,6,6],4,1))
    level2Cards.append(createQuestCard(2,False,[2,2,6,9],4,1))
    level2Cards.append(createQuestCard(2,True,[2,4,5,5],4,1))
    #level2Cards.append(createQuestCard(2,False,[3,4,5,10],5,1))
    level2Cards.append(createQuestCard(2,True,[3,4,5,7],4,1))
    level2Cards.append(createQuestCard(2,False,[1,3,7,10],5,1))
    level2Cards.append(createQuestCard(2,True,[1,3,3,8],3,2))
    level2Cards.append(createQuestCard(2,True,[1,1,1,10],4,2))
    level2Cards.append(createQuestCard(2,True,[2,3,5,6],3,2))
    level2Cards.append(createQuestCard(2,False,[1,4,6,8],4,2))
    level2Cards.append(createQuestCard(2,True,[2,5,6,8],4,2))
    level2Cards.append(createQuestCard(2,True,[2,3,5,5],3,3))
    level2Cards.append(createQuestCard(2,False,[1,2,7,10],5,3))
    level2Cards.append(createQuestCard(2,False,[1,4,5,9],4,3))
    level2Cards.append(createQuestCard(2,True,[2,4,6,8],4,3))
    level2Cards.append(createQuestCard(2,False,[3,4,7,8],5,3))
    level2Cards.append(createQuestCard(2,False,[1,1,6,8],4,4))
    level2Cards.append(createQuestCard(2,False,[1,3,4,9],4,4))
    level2Cards.append(createQuestCard(2,True,[3,3,4,7],4,4))
    level2Cards.append(createQuestCard(2,True,[2,3,7,9],4,4))
    level2Cards.append(createQuestCard(2,False,[1,5,7,9],5,4))
    level2Cards.append(createQuestCard(2,False,[1,2,6,9],4,5))
    level2Cards.append(createQuestCard(2,False,[1,3,5,7],4,5))
    level2Cards.append(createQuestCard(2,True,[2,2,6,7],4,5))
    level2Cards.append(createQuestCard(2,True,[3,4,4,8],4,5))
    level2Cards.append(createQuestCard(2,False,[2,4,4,10],5,5))
    level3Cards.append(createQuestCard(3,False,[1,2,3,4,5],5,1))
    level3Cards.append(createQuestCard(3,False,[2,2,3,4,7],5,1))
    level3Cards.append(createQuestCard(3,False,[3,5,6,7,8],6,1))
    level3Cards.append(createQuestCard(3,False,[1,1,1,1,10],5,2))
    level3Cards.append(createQuestCard(3,True,[2,2,5,6,8],5,2))
    level3Cards.append(createQuestCard(3,False,[1,3,3,8,8],6,2))
    level3Cards.append(createQuestCard(3,True,[1,2,5,7,9],5,3))
    level3Cards.append(createQuestCard(3,True,[2,2,4,5,9],5,3))
    level3Cards.append(createQuestCard(3,False,[4,4,6,6,10],6,3))
    level3Cards.append(createQuestCard(3,False,[1,1,2,3,6],4,4))
    level3Cards.append(createQuestCard(3,True,[1,3,5,6,7],5,4))
    level3Cards.append(createQuestCard(3,False,[3,4,5,7,10],6,4))
    level3Cards.append(createQuestCard(3,False,[1,2,2,4,4],5,5))
    level3Cards.append(createQuestCard(3,True,[1,3,5,6,9],5,5))
    level3Cards.append(createQuestCard(3,False,[3,4,7,8,9],6,5))
        
    # events to include in all games
    # 7 and 13 testing
    #for i in range(2):
    #    evt = 11
    #    if (i == 1):
    #        evt = 11
    #    for j in range(7):
    #        level4Cards.append(createQuestCard(4,False,[],0,evt))
            
    level4Cards.append(createQuestCard(4,False,[],0,6))
    level4Cards.append(createQuestCard(4,False,[],0,7))
    level4Cards.append(createQuestCard(4,False,[],0,8))
    level4Cards.append(createQuestCard(4,False,[],0,9))
    level4Cards.append(createQuestCard(4,False,[],0,10))
    level4Cards.append(createQuestCard(4,False,[],0,11))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,15))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,17))    
    level4Cards.append(createQuestCard(4,False,[],0,19))

    # events to include when the game isn't a 1 player game
    if (numPlayers != 1):
        level4Cards.append(createQuestCard(4,False,[],0,14))
        level4Cards.append(createQuestCard(4,False,[],0,18))
            
    level1Cards = shuffle(level1Cards)
    level2Cards = shuffle(level2Cards)
    level3Cards = shuffle(level3Cards)
    level4Cards = shuffle(level4Cards)


    if numPlayers == 1:
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards, 4, 4, 1, 2, 1,1,2, 1,1,1)
    elif numPlayers == 2:
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards, 4, 6, 1, 4, 2,3,4, 2,2,2)
    elif numPlayers == 3:
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards, 4, 7, 3, 7, 2,3,5, 3,3,3)
    elif numPlayers == 4:
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards, 4, 10, 2, 8, 2,4,6, 4,4,4)
    else:
        raise ValueError("Invalid number of players")

    tippytop = shuffle(tippytop)
    top = shuffle(top)
    middle = shuffle(middle)
    bottom = shuffle(bottom)
    logging.info("card lists sizes {0} {1} {2} {3}".format(len(tippytop), len(top), len(middle), len(bottom)))        

    return tippytop + top + middle + bottom
