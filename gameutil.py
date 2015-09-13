import random
import json
import logging
from game_model import *

def playerState(game, playerId):
    player = game.players[playerId]
    thedict = player.to_dict()
    if game.curPlayer == playerId:
        thedict["isActive"] = True
    else:
        thedict["isActive"] = False
        
    thedict["itemsCountRemaining"] = len(game.itemDeck)
    thedict["questsCountRemaining"] = len(game.questDeck)
    thedict["market"] = game.market
    questlist = []
    for q in game.questsInPlay:
        questlist.append(q.to_dict())
        
    thedict["questsInPlay"] = questlist
    thedict["actionsRemaining"] = game.actionsRemaining

    discardLen = len(game.discardPile)
    if discardLen > 0:
        thedict["lastDiscarded"] = game.discardPile[discardLen-1]
    else:
        thedict["lastDiscarded"] = None

    jsonstr = json.dumps(thedict)
    return jsonstr   

def whatToArray(what):
    ret = []
    for c in what:
        ci = int(c)
        if (ci == 0):
            ci = 10;
        ret.append(ci)

    return ret

def getCartId(where):
    if ("cart" in where):
        cartid = int(where[4:])
        return cartid
    else:
        raise ValueError("where isn't a cartid")

def discardItem(game, whati, where):
    """Utility discard function"""
    player = game.players[game.curPlayer]
    
    found = False
    if (where == "hand"):
        l = len(player.hand)
        for i in range(l):
            if player.hand[i] == whati:
                game.discardPile.append(player.hand[i])
                del player.hand[i]
                found = True
                break

    elif ("cart" in where):
        # string "cart1" becomes int(1)
        cartid = int(where[4:])
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
        raise ValueError('Where value is invalid')

    return found

def cartCards(game, what, where):
    """Moves cards from hand to cart"""
    if game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")        
        return False

    # convert input to array
    whats = whatToArray(what)
    if (len(whats) == 0):
        logging.error("Empty whats")        
        return False

    player = game.players[game.curPlayer]

    try:
        # discard items from hand
        allFound = True
        for whati in whats:        
            found = discardItem(game, whati, "hand")
            if (found == False):
                logging.error("Couldn't find all whats {0}".format(whati))        
                return False                

        # find cart id
        cartid = getCartId(where)
        if (cartid <0 or cartid > 3):
            logging.error("Invalid cart id")        
            return False

        # find cart
        cart = player.carts[cartid]

        # cart needs to be purchased
        if (cart.purchased == False):
            logging.error("Cart not purchased")        
            return False

        # has enough space
        spaceRemaining = cart.cartSize - len(cart.inCart)
        if (spaceRemaining < len(whats)):
            logging.error("Not enough space in cart")        
            return False

        # add items to cart
        for whati in whats:
            cart.inCart.append(whati)

    except ValueError as e:
        logging.error("Exception ({0}): {1}".format(e.errno, e.strerror))        
        return False

    game.actionsRemaining = game.actionsRemaining -1
    game.put()

    return True

def buyCart(game, cartidstr, withGold, items):
    """Buys cart with gold or items"""
    if game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")        
        return False

    player = game.players[game.curPlayer]
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
        whats = whatToArray(items)
        sumTotal = sum(whats)
        if sumTotal < cart.cardCost:
            return False
        
        for whati in whats:        
            found = discardItem(game, whati, "hand")
            if (found == False):
                logging.error("Couldn't find all whats {0}".format(whati))        
                return False   
            
        cart.purchased = True

    if cartid == 1:
        # deal quest, assign one victory point
        dealQuest(game)
        player.points += 1
    elif cartid == 2:
        player.points += 3
    elif cartid == 3:
        player.maxHand += 1

    game.actionsRemaining = game.actionsRemaining -1
    game.put()    

    return True

def marketTrade(game, handItems, marketItems):
    if game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")  
        return False

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

    player = game.players[game.curPlayer]

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
    
    game.actionsRemaining = game.actionsRemaining -1
    game.put()

    return True                

def discard(game, what, where):
    if game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")  
        return False

    whats = whatToArray(what)
    if (len(whats) == 0):
        logging.error("Blank what array")  
        return False

    allFound = True
    for whati in whats:
        try:
            found = discardItem(game, whati, where)
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
    
    game.actionsRemaining = game.actionsRemaining -1
    game.put()

    return True

def passPlayer(game, items):
    whats = whatToArray(items)
    numItems = len(whats)    

    priorPlayer = game.curPlayer
    player = game.players[game.curPlayer]

    numItemsInHand = len(player.hand)
    if (numItemsInHand - numItems) > player.maxHand:
        raise ValueError("Need to discard more items")

    if (numItems > 0 and (numItemsInHand - numItems) < player.maxHand):
        raise ValueError("Discarded too many items")

    # discard cards past max if needed
    allFound = True
    for whati in whats:        
        found = discardItem(game, whati, "hand")
        if (found == False):
            allFound = False
            break

    if numItemsInHand < player.maxHand:
        diff = player.maxHand - numItemsInHand
        for i in range(diff):
            dealItemCard(game.curPlayer, game)

    # deal card to market
    dealItemCardToMarket(game)

    game.actionsRemaining = 2
    game.curPlayer += 1
    if game.curPlayer == game.numPlayers:
        game.curPlayer = 0

    # save game to data store
    game.put()

    return priorPlayer

def fish(game, what, where):
    if game.actionsRemaining == 0:
        # no actions remaining
        return False

    whati = int(what)
    if (whati < 1 or whati > 10):
        # invalid what
        return False

    player = game.players[game.curPlayer]
    
    try:
        found = discardItem(game, whati, where)
    except ValueError as e:
        return False

    if (found == False):
        # couldn't find 'what'
        return False

    dealItemCard(game.curPlayer, game)
    game.actionsRemaining = game.actionsRemaining -1
    game.put()

    return True

def buyAction(game):    
    buyCost = 2
    player = game.players[game.curPlayer]
    
    if (player.gold < buyCost):
        return False

    player.gold = player.gold - buyCost    
    game.actionsRemaining = game.actionsRemaining + 1
    game.put()

    return True

def createNewGame(numPlayers):
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
        p=Player()            
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

def createQuestStacks(top, middle, bottom, level1, level2, level3, level4,l1t, l1m, l2m, l1b, l2b, l3b, em, eb):
    # top
    for i in range(l1t):
        top.append(level1[i])
        del level1[i]

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

def dealItemCard(playerIndex, game):
    card = game.itemDeck[0]
    del game.itemDeck[0]
    game.players[playerIndex].hand.append(card)

def dealItemCardToMarket(game):
    card = game.itemDeck[0]
    del game.itemDeck[0]
    game.market.append(card)
        
def dealQuest(game):
    quest = game.questDeck[0]
    del game.questDeck[0]
    game.questsInPlay.append(quest)

def newQuestDeck(numPlayers):
    level1Cards = []
    level2Cards = []
    level3Cards = []
    level4Cards = []
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
    level1Cards.append(createQuestCard(1,True,[4,4,4],4,2))
    level1Cards.append(createQuestCard(1,True,[1,3,10],3,3))
    level1Cards.append(createQuestCard(1,True,[1,5,9],3,3))
    level1Cards.append(createQuestCard(1,True,[2,2,10],3,3))
    level1Cards.append(createQuestCard(1,True,[2,5,8],3,3))
    level1Cards.append(createQuestCard(1,True,[3,5,9],3,3))
    level1Cards.append(createQuestCard(1,True,[3,7,8],3,3))
    level1Cards.append(createQuestCard(1,True,[5,5,5],4,3))
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
    level4Cards.append(createQuestCard(4,False,[],0,6))
    level4Cards.append(createQuestCard(4,False,[],0,7))
    level4Cards.append(createQuestCard(4,False,[],0,8))
    level4Cards.append(createQuestCard(4,False,[],0,9))
    level4Cards.append(createQuestCard(4,False,[],0,10))
    level4Cards.append(createQuestCard(4,False,[],0,11))
    level4Cards.append(createQuestCard(4,False,[],0,12))
    level4Cards.append(createQuestCard(4,False,[],0,13))
    level4Cards.append(createQuestCard(4,False,[],0,14))
    level4Cards.append(createQuestCard(4,False,[],0,15))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,17))


    level1Cards = shuffle(level1Cards)
    level2Cards = shuffle(level2Cards)
    level3Cards = shuffle(level3Cards)
    level4Cards = shuffle(level4Cards)

    if numPlayers == "1":
        createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,5,1,2,1,1,2,1,1)
    elif numPlayers == "2":
        createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,7,1,4,1,2,4,2,2)
    elif numPlayers == "3":
        createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,10,3,7,2,3,5,2,2)
    elif numPlayers == "4":
        createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,12,4,10,2,4,6,3,3)
        
    top = shuffle(top)
    middle = shuffle(middle)
    bottom = shuffle(bottom)        

    return top + middle + bottom
