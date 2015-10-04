import random
import json
import logging
from game_model import *

def createOtherPlayer(player):
    dict = player.to_dict()
    hand = dict["hand"]
    sz = len(hand)
    for i in range(sz):
        hand[i] = -1
    dict["hand"] = hand
    return player

def playerState(game, playerId):
    #game.players[playerId].playerId = playerId
    player = game.players[playerId]
    player.playerId = playerId
    thedict = player.to_dict()

    thedict["numPlayers"] = game.numPlayers
    thedict["curPlayer"] = playerId
    thedict["itemsCountRemaining"] = len(game.itemDeck)
    thedict["questsCountRemaining"] = len(game.questDeck)
    thedict["market"] = game.market
    thedict["playerId"] = playerId
    thedict["gameMode"] = game.gameMode
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
            #dict = p.to_dict()
            #hand = dict["hand"]
            #sz = len(hand)
            #for i in range(sz):
                #hand[i] = -1
                #dict["hand"] = hand
            otherPlayers.append(p.to_dict())
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

    questsLeftLen = len(game.questDeck)
    questsInPlayLen = len(game.questsInPlay)	
    if(questsLeftLen==0 and questsInPlayLen==4):
        thedict["gameOver"] = True
    else:
        thedict["gameOver"] = False

    jsonstr = json.dumps(thedict)
    return jsonstr   

def whatToArray(what):
    ret = []
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
    """Utility discard function"""
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]
    logging.info("whati {0}".format(whati))  
    logging.info("where {0}".format(where))  
    found = False
    if (where == "hand"):
        logging.info("hand section: {0}".format(where))
        l = len(player.hand)
        logging.info("player hand length section: {0}".format(l))
        for i in range(l):
            logging.info("player hand card [i] section: {0}".format(i))
            logging.info("whati: {0}".format(whati))
            if player.hand[i] == whati:
                logging.info("match found: {0}".format(whati))
                game.discardPile.append(player.hand[i])
                logging.info("discarded : {0}".format(player.hand[i]))
                del player.hand[i]
                found = True
                break

    if (where == "market"):
        logging.info("market section: {0}".format(where))
        m = len(game.market)
        for mi in range(m):
            if game.market[mi] == whati:
                game.discardPile.append(game.market[mi])
                del game.market[mi]
                found = True
                break

    if ("cart" in where):
        logging.info("cart section: {0}".format(where)) 	
        # string "cart1" becomes int(1)
        cartid = int(where[4:])
        logging.info("cartid section: {0}".format(cartid)) 
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
    #else:
        # invalid where
        #raise ValueError('Where value is invalid')

    logging.info("exiting discard section: {0}".format(found)) 
    return found

def removeItems(game, aPlayerId, what, where):
    """Utility function that removes items from a location"""
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("removeItems: empty what array given")
        raise ValueError("removeItems: empty what array given")

    if (where == "hand"):
        srclist = player.hand
    else:
        cartId = getCartId(where)
        cart = player.carts[cartId]
        srclist = cart.inCart

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
            raise ValueError("Failed to locate {0} in src list".format(whati))

    return
            

def move(game, aPlayerId, what, src, dst, actionCost):
    """Moves cards from src to dst"""
    """There is the pending event logic that moves items back to hand before the event starts"""
    """This is for the orcs attack.  """
    logging.info("1")
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    logging.info("what = ".format(what))
    logging.info("src = ".format(src))
    logging.info("dst = ".format(dst))
    logging.info("actionCost = ".format(actionCost))
    if (game.actionsRemaining == 0 and actionCost > 0):
        # no actions remaining
        logging.error("No actions remaining")        
        return False

    logging.info("starting move, getting array of what")
    # convert input to array
    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("Empty whats")        
        return False

    try:        
        # discard items from src
        logging.info("removing items")
        removeItems(game, aPlayerId, what, src)             

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

    game.put()

    return True

def buyCart(game, aPlayerId, cartidstr, withGold, items, actionCost):
    """Buys cart with gold or items"""
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]
	
    if game.actionsRemaining == 0:
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
            return False

        player.gold = player.gold - cart.goldCost
        cart.purchased = True
    else:
        logging.info("items {0}".format(items))
        whats = whatToArray(items)
        sumTotal = sum(whats)
        logging.info("sum {0}".format(sumTotal))
        logging.info("cart cost {0}".format(cart.cardCost))
        if sumTotal < cart.cardCost:
            return False
        for whati in whats:  
            logging.info("discarding {0}".format(whati))		
            found = discardItem(game, player, whati, "hand")
            logging.info("found {0}".format(found))
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
		
    game.put()    

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

    game.put()

    return True                

def discard(game, aPlayerId, what, where, actionCost):
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

    game.put()

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
    if game.gameMode != "eventStarted":
        return False
    game.gameMode = "eventPending"
    logging.info("GameMode pending: {0}".format(game.gameMode))
    gold = 1
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
        #CastleTaxation
        if eventId == 8:
            logging.info("Entered Logic for event CastleTaxation")
        #GolbinRaid
        if eventId == 9:
            logging.info("Entered Logic for event GolbinRaid")
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
            logging.info("MarketShortage start Event Id:  {0}".format(eventId))
            card = str(dealItemCardToMarket(game))
            logging.info("card dealt:  {0}".format(card))
            #get the number on the card, go through the market, discard all that match
            mlen = len(game.market)
            currentEvent=Event(eventId = eventId, whatItems1 = str(card), fromWhere1 = "market")
            for itemi in range(mlen):
                if itemi == card:
                    discard(game,0,card,"market",0)

        #MarketSurplus
        if eventId == 12:
            logging.info("MarketSurplus start Event Id:  {0}".format(eventId))
            whatItems1 = ""
            # deal card to market
            for i in range(5):
                cards = str(dealItemCardToMarket(game))
                whatItems1 += cards
                logging.info("market surplus items: {0}".format(cards))
            currentEvent=Event(eventId = eventId, whatItems1 = whatItems1, fromWhere1 = "market")

        #orcs attack.  Wheelbarrow destroyed.  if handItems present don't destroy, but discard them
        if eventId == 13:
            logging.info("Entered Orc Attack event {0}".format(eventId))
            p = len(game.players)
            for playerId in range(p):
                whatItems1 = ""
                cart = game.players[playerId].carts[0]
                logging.info("playerId: {0}".format(playerId))
                sumItems = sum(cart.inCart)
                if sumItems < 5:
                    cart.destroyed = True
                    cart.purchased = False
                    r = len(cart.inCart)
                    for cartItem in range(r):
                        #move cards back to hand
                        #move(game, what, src, dst, actionCost):
                        whatItems1 += str(cartItem)
                    #dont think move is working here
                    move(game, playerId, whatItems1, "cart0", "hand", 0)
            currentEvent=Event(eventId = eventId, prepWhatItems1 = whatItems1, prepFromWhere1 = "cart0", prepMoveDest = "hand")
        #hailstorm players pass hand to the right
        if eventId == 18:
            logging.info("Hailstorm start Event Id:  {0}".format(eventId))
            p = len(game.players)
            if(p==1):
                logging.info("only one player, skipping event:  {0}".format(eventId))
            nextPlayerId = 1
            tmp = game.players[0].hand
            for i in range(p):
                logging.info("game.players[i]: {0}".format(i))
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

        #ThrownInTheDungeon
        if eventId == 15:
            logging.info("Thrown in the dungeon start Event Id:  {0}".format(eventId))

        #Treasure
        if eventId == 16:
            logging.info("Starting Treasure Event Id:  {0}".format(eventId))
            logging.info("Gold Found! {0}".format(gold))    
            currentEvent=Event(eventId = eventId, gold = 1)
            player.gold += gold

        #VikingParade
        if eventId == 17:
            logging.info("Viking Parade start Event Id:  {0}".format(eventId))

        #sandstorm PASS CARDS TO LEFT
        if eventId == 14:
            logging.info("Sandstorm start Event Id:  {0}".format(eventId))
            p = len(game.players)
            if(p==1):
                logging.info("only one player, skipping event:  {0}".format(eventId))
            prevPlayerId = game.numPlayers-1
            tmp = game.players[0].hand
            for i in range(p):
                logging.info("game.players[i]: {0}".format(i))
                logging.info("prevPlayerId before: {0}".format(prevPlayerId))
                if (prevPlayerId == game.numPlayers):
                    prevPlayerId = 0
                    del game.players[i].hand
                    game.players[i].hand = tmp
                else:
                    logging.info("curPlayer: {0}".format(i))
                    logging.info("prevPlayerId after: {0}".format(prevPlayerId))
                    del game.players[i].hand
                    game.players[i].hand = game.players[prevPlayerId].hand
                numItemsInHand = len(game.players[i].hand)
                if numItemsInHand < game.players[i].maxHand:
                    diff = game.players[i].maxHand - numItemsInHand
                    for d in range(diff):
                        logging.info("pre dealing card! {0}".format(d))  
                        dealItemCard(i, game)
                        game.players[i].hand.sort()
                prevPlayerId += 1
        
        #HiddenRoom 
        if eventId == 19:
            logging.info("HiddenRoom start Event Id:  {0}".format(eventId))

    except ValueError as e:
        logging.error("Exception ({0}): {1}".format(e.errno, e.strerror)) 
        game.gameMode = "game"
        return False  

    p = len(game.players)
    for playerId in range(p):
        game.players[playerId].curEvent.append(currentEvent)
    #game.gameMode = "eventPending"
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
    #currentEvent=Event(eventId = eventId, whatItems1 = what1, fromWhere1 = where1, whatItems2 = what2, fromWhere2 = where2, gold = gold, itemsCount = itemsCount, moveDest = dest1)
    #game.players[playerId].curEvent.append(currentEvent)
    eventCount = len(game.players[playerId].curEvent)
    game.players[playerId].curEvent[eventCount-1].eventId = eventId
    if game.players[playerId].curEvent[eventCount-1].whatItems1 == None:
        game.players[playerId].curEvent[eventCount-1].whatItems1 = what1
    if game.players[playerId].curEvent[eventCount-1].fromWhere1 == None:
        game.players[playerId].curEvent[eventCount-1].fromWhere1 = where1	
    if game.players[playerId].curEvent[eventCount-1].whatItems2 == None:
        game.players[playerId].curEvent[eventCount-1].whatItems2 = what2
    if game.players[playerId].curEvent[eventCount-1].fromWhere2 == None:
        game.players[playerId].curEvent[eventCount-1].fromWhere2 = where2
    if game.players[playerId].curEvent[eventCount-1].gold == None:
        game.players[playerId].curEvent[eventCount-1].gold = gold
    if game.players[playerId].curEvent[eventCount-1].itemsCount == None:
        game.players[playerId].curEvent[eventCount-1].itemsCount = itemsCount
    if game.players[playerId].curEvent[eventCount-1].moveDest == None:
        game.players[playerId].curEvent[eventCount-1].moveDest = dest1
    player = game.players[playerId]
    logging.info("Entered Logic for Events")
    logging.info("playerid is: {0}".format(playerId)) 
    cart = game.players[playerId].carts[0]
    what1arr = whatToArray(what1)
    what2arr = whatToArray(what2)

    try:
        #Barb Attack destroy market and re-seed if you are the first to get here        
        if eventId == 6:
            logging.info("Barb Attack start Event Id:  {0}".format(eventId))
        #BrokenItems
        if eventId == 7:
            logging.info("BrokenItems start Event Id:  {0}".format(eventId))
            if len(what1arr) > 0:
                for whati in what1arr:
                    logging.info("whati {0}".format(whati)) 
                    logging.info("where1 {0}".format(where1)) 
                    fish(game, playerId, whati, where1, 0)
            if len(what2arr) > 0:
                for whati2 in what2arr:
                    logging.info("whati2 {0}".format(whati2)) 
                    logging.info("where2 {0}".format(where2)) 
                    fish(game, playerId, whati2, where2, 0)
        #CastleTaxation
        if eventId == 8:
            logging.info("Castle Taxation start Event Id:  {0}".format(eventId))
            #discard items first
            if len(what1arr) > 0:
                for whati in what1arr:        
                    found = discardItem(game, playerId, whati, where1)
                    if (found == False):
                        logging.error("Couldn't find all what1 {0}".format(whati))        
                        return False
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
            logging.info("MarketShortage start Event Id:  {0}".format(eventId))
        #MarketSurplus
        if eventId == 12:
            logging.info("MarketSurplus start Event Id:  {0}".format(eventId))
   
        #orcs attack.  Wheelbarrow destroyed.  if handItems present don't destroy, but discard them
        if eventId == 13:
            logging.info("orcs attack start Event Id:  {0}".format(eventId))
            #discard items if buying it back
            if len(what1arr) > 0:
                for whati in what1arr:
                    logging.info("Discarding {0} from {1}".format(whati, where1))
                    found = discardItem(game, playerId, whati, where1)
                    if (found == False):
                        logging.error("Couldn't find all what1arr {0}".format(whati))        
                        return False
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
            whats = whatToArray(what1)
            whatlen = len(whats)
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
        logging.error("Exception ({0}): {1}".format(e.errno, e.strerror)) 
        return False  

    #logging.info("eventPendingCompletedCount increased to:  {0}".format(game.eventPendingCompletedCount))
    #game.curPlayer += 1
    #if game.curPlayer == game.numPlayers:
    #    game.curPlayer = 0
    #logging.info("CurPlayer changed to:  {0}".format(game.curPlayer))
    game.players[playerId].curEventStatus = "eventCompleted"
    #game.eventPendingCompletedCount += 1

    #if(game.eventPendingCompletedCount==game.numPlayers):
    #    game.gameMode = "eventCompleted"
    #    game.eventPendingCompletedCount = 0
    # save game to data store
    game.put()
    return True	

def completeEventDealQuest(game, playerId, eventId):
    #advance event to next player, deal new quest if done
    #game.eventCompletedCount += 1
    logging.info("playerId event status to eventInProgress: {0}".format(game.players[playerId].curEventStatus))
    if game.players[playerId].curEventStatus == "eventCompleted":
        #game.players[playerId].curEventStatus = "eventCompleted"		
        game.eventCompletedCount += 1
        logging.info("eventCompletedCount: {0}".format(game.eventCompletedCount))
        logging.info("game.numPlayers: {0}".format(game.numPlayers))
    else:
        return True

    if game.eventCompletedCount==game.numPlayers:
        game.gameMode = "game"		
        game.eventCompletedCount = 0	
        decklen = len(game.questsInPlay)
        if(decklen == 0):
            return True
        else:
            del game.questsInPlay[decklen-1]

        dealQuest(game)

def completeQuest(game, aPlayerId, what, where):
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
        removeItems(game, player.playerId, what, where)

        # match quest
        questFound = False
        numQuests = len(game.questsInPlay)
        for i in range(numQuests):
            q = game.questsInPlay[i]
            inter = getIntersection(whats, q.items)

            if (inter == whats):
                questFound = True
                player.questsCompleted.append(q)
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
        logging.error("Exception ({0}): {1}".format(e.errno, e.strerror)) 
        return False

    game.put()

    return True

def passPlayer(game, aPlayerId, items):
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]

    whats = whatToArray(items)
    numItems = len(whats)    

    priorPlayer = player.playerId
    player = game.players[player.playerId]

    numItemsInHand = len(player.hand)
    if (numItemsInHand - numItems) > player.maxHand:
        raise ValueError("Need to discard more items")

    if (numItems > 0 and (numItemsInHand - numItems) < player.maxHand):
        raise ValueError("Discarded too many items")

    # discard cards past max if needed
    allFound = True
    for whati in whats:        
        found = discardItem(game, player.playerId, whati, "hand")
        if (found == False):
            allFound = False
            break

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

    # save game to data store
    game.put()

    return priorPlayer

def fish(game, aPlayerId, what, where, actionCost):
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
        return False

    if (found == False):
        # couldn't find 'what'
        return False

    dealItemCard(player.playerId, game)

    game.actionsRemaining = game.actionsRemaining - actionCost

    game.put()

    return True

def buyAction(game, aPlayerId):    
    buyCost = 2
    if game.gameMode == "game":
        player = game.players[game.curPlayer]
    else:
        player = game.players[aPlayerId]
    
    if (player.gold < buyCost):
        return False

    player.gold = player.gold - buyCost
    game.actionsRemaining = game.actionsRemaining + 1

    game.put()

    return True

def createNewGame(numPlayers, name):
    # Temporary: delete theGame from the data store
    # later, perhaps stale games will be deleted here
    game_k = ndb.Key('Game', 'theGame')
    game_k.delete()

    # create new game entity with id "theGame"
    # later each existing game will have their own IDs
    game = Game(numPlayers=int(numPlayers), id='theGame')

    # create decks
    game.questDeck = newQuestDeck(numPlayers)

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
    # tippytop
    for i in range(l0t):
        tippytop.append(level1[i])
        del level1[i]

    # top
    for i in range(l1t):
        top.append(level1[i])
        del level1[i]

    for i in range(et):
        top.append(level4[i])
        del level4[i]

    # middle
    for i in range(l1m):
        middle.append(level1[i])
        del level1[i]

    for i in range(l2m):
        middle.append(level2[i])
        del level2[i]

    for i in range(em):
        middle.append(level4[i])
        del level4[i]

    #bottom
    for i in range(l1b):
        bottom.append(level1[i])
        del level1[i]

    for i in range(l2b):
        bottom.append(level2[i])
        del level2[i]

    for i in range(l3b):
        bottom.append(level3[i])
        del level3[i]

    for i in range(eb):
        bottom.append(level4[i])
        del level4[i]

def newItemDeck():
    cards = []
    for itemValue in range(1, 11):
        for ct in range(12, itemValue-1, -1):
            cards.append(itemValue)

    shuffled = shuffle(cards)                
    return shuffled


def resetMarket(game):
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
    card = getFirstItemCard(game)   
    logging.info("dealing card to player! {0}".format(playerIndex))  
	
    game.players[playerIndex].hand.append(card)
    game.players[playerIndex].hand.sort()

def dealItemCardToMarket(game):
    card = getFirstItemCard(game)
    game.market.append(card)
    return card
        
def dealQuest(game):
    decklen = len(game.questDeck)
    if(decklen == 0):
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
    level1Cards.append(createQuestCard(1,True,[2,6,10],3,2))
    level1Cards.append(createQuestCard(1,True,[3,5,10],3,2))
    level1Cards.append(createQuestCard(1,False,[4,4,4],4,2))
    level1Cards.append(createQuestCard(1,True,[1,3,10],3,3))
    level1Cards.append(createQuestCard(1,True,[1,5,9],3,3))
    level1Cards.append(createQuestCard(1,True,[2,2,10],3,3))
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
    level1Cards.append(createQuestCard(1,True,[2,4,10],3,5))
    level1Cards.append(createQuestCard(1,True,[3,6,9],3,5))
    level1Cards.append(createQuestCard(1,True,[4,6,6],3,5))
    level2Cards.append(createQuestCard(2,True,[1,2,6,10],4,1))
    level2Cards.append(createQuestCard(2,False,[2,2,6,9],4,1))
    level2Cards.append(createQuestCard(2,True,[2,4,5,5],4,1))
    level2Cards.append(createQuestCard(2,False,[3,4,5,10],5,1))
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
    

    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,13))


    level1Cards = shuffle(level1Cards)
    level2Cards = shuffle(level2Cards)
    level3Cards = shuffle(level3Cards)
    level4Cards = shuffle(level4Cards)

	#def createQuestStacks(tippytop, top, middle, bottom, level1, level2, level3, level4, l0t, l1t, l1m, l2m, l1b, l2b, l3b, et, em, eb):
    if numPlayers == "1":
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards, 4,  4,1,2,1,1,2,   1,1,1)
        #createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,  4,  2,2,2,2,2,2,     2,2,2)
    elif numPlayers == "2":
        #createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,  4,  6,1,4,1,2,4,   2,2,2)
		createQuestStacks(tippytop,top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,  4,  1,1,1,1,1,1,   2,2,2)
    elif numPlayers == "3":
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,  4,  7,3,7,2,3,5,   3,3,3)
    elif numPlayers == "4":
        createQuestStacks(tippytop, top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,  4,  10,4,10,2,4,6, 4,4,4)

    tippytop = shuffle(tippytop)
    top = shuffle(top)
    middle = shuffle(middle)
    bottom = shuffle(bottom)        

    return tippytop + top + middle + bottom
