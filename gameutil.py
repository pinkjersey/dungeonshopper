import random
import json
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

    jsonstr = json.dumps(thedict)
    return jsonstr   

def fish(game, what, where):
    if game.actionsRemaining == 0:
        # no actions remaining
        return False

    whati = int(what)
    if (whati < 1 or whati > 10):
        # invalid what
        return False

    player = game.players[game.curPlayer]
    
    found = False
    if (where == "hand"):
        l = len(player.hand)
        for i in range(l):
            if player.hand[i] == whati:
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
                return False

            l = len(cart.inCart)
            for i in range(l):
                if cart.inCart[i] == whati:
                    del cart.inCart[i]
                    found = True
                    break
    else:
        # invalid where
        return False

    if (found == False):
        # couldn't find 'what'
        return False

    dealItemCard(game.curPlayer, game)
    game.actionsRemaining = game.actionsRemaining -1
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
    for p in range(game.numPlayers):
        for i in range(4):
            c=Cart(purchased=False)
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