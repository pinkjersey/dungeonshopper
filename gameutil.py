import random
import json
import logging
from game_model import *

def createOtherPlayer(game, player, playerId):
    dict = player.to_dict()
    hand = dict["hand"]
    sz = len(hand)
    for i in range(sz):
        hand[i] = -1
    dict["hand"] = hand

    if game.curPlayer == playerId:
        dict["isActive"] = True
    else:
        dict["isActive"] = False
    return dict

def playerState(game, playerId):
    game.players[playerId].playerId = playerId
    player = game.players[playerId]
    player.playerId = playerId
    thedict = player.to_dict()

    thedict["numPlayers"] = game.numPlayers
    thedict["curPlayer"] = playerId
    thedict["itemsCountRemaining"] = len(game.itemDeck)
    thedict["questsCountRemaining"] = len(game.questDeck)
    thedict["market"] = game.market
    thedict["playerId"] = playerId
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
            otherPlayers.append(createOtherPlayer(game, p, playerId))
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

def removeItems(game, what, where):
    """Utility function that removes items from a location"""
    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("removeItems: empty what array given")
        raise ValueError("removeItems: empty what array given")
    
    player = game.players[game.curPlayer]

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
            if (whati == srci):
                found = True
                del srclist[i]
                break

        if (found == False):
            raise ValueError("Failed to locate {0} in src list".format(whati))

    return
            

def move(game, what, src, dst):
    """Moves cards from src to dst"""
    if game.actionsRemaining == 0:
        # no actions remaining
        logging.error("No actions remaining")        
        return False

    # convert input to array
    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("Empty whats")        
        return False

    player = game.players[game.curPlayer]

    try:        
        # discard items from src
        removeItems(game, what, src)             

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

def completeQuest(game, what, where):
    # completing quests require no actions
    whats = whatToArray(what)
    whatlen = len(whats)
    if (whatlen == 0):
        logging.error("Blank what array")  
        return False

    player = game.players[game.curPlayer]
    try:
        # find cart and make sure the cards exist in it
        # delete them if exists
        removeItems(game, what, where)

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
        p=Player(name="defaultPlayer{0}".format(i))
        if (i == 0):
            p.name = name
            p.playerId = 0
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

def getFirstItemCard(game):
    decklen = len(game.itemDeck)
    if (decklen == 0):
        # move market to discard
        game.discardPile.extend(game.market)

        # clear the market
        game.market = []

        # shuffle discard and set it to item deck
        game.itemDeck = shuffle(game.discardPile)

        if (len(game.itemDeck) > 4):
            raise ValueError("Newly created itemdeck has a size less than 5")

        # clear discard
        game.discardPile = []

        # deal to market
        for i in range(4):
            dealItemCardToMarket(game)

        # deal like usual
        return getFirstItemCard(game)
    else:
        card = game.itemDeck[0]
        del game.itemDeck[0]
        return card

def dealItemCard(playerIndex, game):
    card = getFirstItemCard(game)    
    game.players[playerIndex].hand.append(card)
    game.players[playerIndex].hand.sort()

def dealItemCardToMarket(game):
    card = getFirstItemCard(game)
    game.market.append(card)
        
def dealQuest(game):
    decklen = len(game.questDeck)
    if(decklen == 0):
        return
    else:
        quest = game.questDeck[0]
        del game.questDeck[0]
        game.questsInPlay.append(quest)
        #added by gary to try and simulate getting a new quest after an event
        if(quest.level==4 and game.eventCompletedCount==game.numPlayers):
            dealQuest(game)
	
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
    #simulate treasure event only for now
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    level4Cards.append(createQuestCard(4,False,[],0,16))
    
    #level4Cards.append(createQuestCard(4,False,[],0,6))
    #level4Cards.append(createQuestCard(4,False,[],0,7))
    #level4Cards.append(createQuestCard(4,False,[],0,8))
    #level4Cards.append(createQuestCard(4,False,[],0,9))
    #level4Cards.append(createQuestCard(4,False,[],0,10))
    #level4Cards.append(createQuestCard(4,False,[],0,11))
    #level4Cards.append(createQuestCard(4,False,[],0,12))
    #level4Cards.append(createQuestCard(4,False,[],0,13))
    #level4Cards.append(createQuestCard(4,False,[],0,14))
    #level4Cards.append(createQuestCard(4,False,[],0,15))
    #level4Cards.append(createQuestCard(4,False,[],0,16))
    #level4Cards.append(createQuestCard(4,False,[],0,17))


    level1Cards = shuffle(level1Cards)
    level2Cards = shuffle(level2Cards)
    level3Cards = shuffle(level3Cards)
    level4Cards = shuffle(level4Cards)

    if numPlayers == "1":
        createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,5,1,2,1,1,2,1,1)
		#createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,4,1,1,0,0,0,4,4)
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
