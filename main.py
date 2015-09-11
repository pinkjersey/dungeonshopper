#!/usr/bin/env python

import webapp2
import json
import random

from google.appengine.ext import ndb

from game_model import *

class GameHandler(webapp2.RequestHandler):
    def shuffle(self, deck):
        shuffled = []
        sz = len(deck)
        while (sz > 0):
            loc = random.randrange(sz)
            shuffled.append(deck[loc])
            del deck[loc]
            sz = sz -1
        return shuffled

    def createQuestCard(self, level, coin, items, vp, type):
        card = QuestCard(level=level, coin=coin, items=items, vp=vp, type=type)
        return card

    def createQuestStacks(self, top, middle, bottom, level1, level2, level3, level4,l1t, l1m, l2m, l1b, l2b, l3b, em, eb):
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

    def newQuestDeck(self, numPlayers):
        level1Cards = []
        level2Cards = []
        level3Cards = []
        level4Cards = []
        top = []
        middle = []
        bottom = []

        level1Cards.append(self.createQuestCard(1,True,[1,3,9],2,1))
        level1Cards.append(self.createQuestCard(1,True,[2,2,2],2,1))
        level1Cards.append(self.createQuestCard(1,True,[1,5,8],3,1))
        level1Cards.append(self.createQuestCard(1,True,[2,5,7],3,1))
        level1Cards.append(self.createQuestCard(1,True,[3,4,8],3,1))
        level1Cards.append(self.createQuestCard(1,True,[3,7,7],3,1))
        level1Cards.append(self.createQuestCard(1,True,[4,6,7],3,1))
        level1Cards.append(self.createQuestCard(1,True,[1,1,1],2,2))
        level1Cards.append(self.createQuestCard(1,True,[1,4,6],2,2))
        level1Cards.append(self.createQuestCard(1,True,[2,3,7],2,2))
        level1Cards.append(self.createQuestCard(1,True,[1,6,8],3,2))
        level1Cards.append(self.createQuestCard(1,True,[2,6,10],3,2))
        level1Cards.append(self.createQuestCard(1,True,[3,5,10],3,2))
        level1Cards.append(self.createQuestCard(1,True,[4,4,4],4,2))
        level1Cards.append(self.createQuestCard(1,True,[1,3,10],3,3))
        level1Cards.append(self.createQuestCard(1,True,[1,5,9],3,3))
        level1Cards.append(self.createQuestCard(1,True,[2,2,10],3,3))
        level1Cards.append(self.createQuestCard(1,True,[2,5,8],3,3))
        level1Cards.append(self.createQuestCard(1,True,[3,5,9],3,3))
        level1Cards.append(self.createQuestCard(1,True,[3,7,8],3,3))
        level1Cards.append(self.createQuestCard(1,True,[5,5,5],4,3))
        level1Cards.append(self.createQuestCard(1,True,[1,2,8],2,4))
        level1Cards.append(self.createQuestCard(1,True,[1,4,9],3,4))
        level1Cards.append(self.createQuestCard(1,True,[1,6,9],3,4))
        level1Cards.append(self.createQuestCard(1,True,[2,4,8],3,4))
        level1Cards.append(self.createQuestCard(1,True,[2,7,8],3,4))
        level1Cards.append(self.createQuestCard(1,True,[3,6,7],3,4))
        level1Cards.append(self.createQuestCard(1,True,[4,4,7],3,4))
        level1Cards.append(self.createQuestCard(1,True,[1,2,9],2,5))
        level1Cards.append(self.createQuestCard(1,True,[1,5,5],2,5))
        level1Cards.append(self.createQuestCard(1,True,[3,3,3],2,5))
        level1Cards.append(self.createQuestCard(1,True,[1,6,10],3,5))
        level1Cards.append(self.createQuestCard(1,True,[2,4,10],3,5))
        level1Cards.append(self.createQuestCard(1,True,[3,6,9],3,5))
        level1Cards.append(self.createQuestCard(1,True,[4,6,6],3,5))
        level2Cards.append(self.createQuestCard(2,True,[1,2,6,10],4,1))
        level2Cards.append(self.createQuestCard(2,False,[2,2,6,9],4,1))
        level2Cards.append(self.createQuestCard(2,True,[2,4,5,5],4,1))
        level2Cards.append(self.createQuestCard(2,False,[3,4,5,10],5,1))
        level2Cards.append(self.createQuestCard(2,False,[1,3,7,10],5,1))
        level2Cards.append(self.createQuestCard(2,True,[1,3,3,8],3,2))
        level2Cards.append(self.createQuestCard(2,True,[1,1,1,10],4,2))
        level2Cards.append(self.createQuestCard(2,True,[2,3,5,6],3,2))
        level2Cards.append(self.createQuestCard(2,False,[1,4,6,8],4,2))
        level2Cards.append(self.createQuestCard(2,True,[2,5,6,8],4,2))
        level2Cards.append(self.createQuestCard(2,True,[2,3,5,5],3,3))
        level2Cards.append(self.createQuestCard(2,False,[1,2,7,10],5,3))
        level2Cards.append(self.createQuestCard(2,False,[1,4,5,9],4,3))
        level2Cards.append(self.createQuestCard(2,True,[2,4,6,8],4,3))
        level2Cards.append(self.createQuestCard(2,False,[3,4,7,8],5,3))
        level2Cards.append(self.createQuestCard(2,False,[1,1,6,8],4,4))
        level2Cards.append(self.createQuestCard(2,False,[1,3,4,9],4,4))
        level2Cards.append(self.createQuestCard(2,True,[3,3,4,7],4,4))
        level2Cards.append(self.createQuestCard(2,True,[2,3,7,9],4,4))
        level2Cards.append(self.createQuestCard(2,False,[1,5,7,9],5,4))
        level2Cards.append(self.createQuestCard(2,False,[1,2,6,9],4,5))
        level2Cards.append(self.createQuestCard(2,False,[1,3,5,7],4,5))
        level2Cards.append(self.createQuestCard(2,True,[2,2,6,7],4,5))
        level2Cards.append(self.createQuestCard(2,True,[3,4,4,8],4,5))
        level2Cards.append(self.createQuestCard(2,False,[2,4,4,10],5,5))
        level3Cards.append(self.createQuestCard(3,False,[1,2,3,4,5],5,1))
        level3Cards.append(self.createQuestCard(3,False,[2,2,3,4,7],5,1))
        level3Cards.append(self.createQuestCard(3,False,[3,5,6,7,8],6,1))
        level3Cards.append(self.createQuestCard(3,False,[1,1,1,1,10],5,2))
        level3Cards.append(self.createQuestCard(3,True,[2,2,5,6,8],5,2))
        level3Cards.append(self.createQuestCard(3,False,[1,3,3,8,8],6,2))
        level3Cards.append(self.createQuestCard(3,True,[1,2,5,7,9],5,3))
        level3Cards.append(self.createQuestCard(3,True,[2,2,4,5,9],5,3))
        level3Cards.append(self.createQuestCard(3,False,[4,4,6,6,10],6,3))
        level3Cards.append(self.createQuestCard(3,False,[1,1,2,3,6],4,4))
        level3Cards.append(self.createQuestCard(3,True,[1,3,5,6,7],5,4))
        level3Cards.append(self.createQuestCard(3,False,[3,4,5,7,10],6,4))
        level3Cards.append(self.createQuestCard(3,False,[1,2,2,4,4],5,5))
        level3Cards.append(self.createQuestCard(3,True,[1,3,5,6,9],5,5))
        level3Cards.append(self.createQuestCard(3,False,[3,4,7,8,9],6,5))
        level4Cards.append(self.createQuestCard(4,False,[],0,6))
        level4Cards.append(self.createQuestCard(4,False,[],0,7))
        level4Cards.append(self.createQuestCard(4,False,[],0,8))
        level4Cards.append(self.createQuestCard(4,False,[],0,9))
        level4Cards.append(self.createQuestCard(4,False,[],0,10))
        level4Cards.append(self.createQuestCard(4,False,[],0,11))
        level4Cards.append(self.createQuestCard(4,False,[],0,12))
        level4Cards.append(self.createQuestCard(4,False,[],0,13))
        level4Cards.append(self.createQuestCard(4,False,[],0,14))
        level4Cards.append(self.createQuestCard(4,False,[],0,15))
        level4Cards.append(self.createQuestCard(4,False,[],0,16))
        level4Cards.append(self.createQuestCard(4,False,[],0,17))


        level1Cards = self.shuffle(level1Cards)
        level2Cards = self.shuffle(level2Cards)
        level3Cards = self.shuffle(level3Cards)
        level4Cards = self.shuffle(level4Cards)

        if numPlayers == "1":
            self.createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,5,1,2,1,1,2,1,1)
        elif numPlayers == "2":
            self.createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,7,1,4,1,2,4,2,2)
        elif numPlayers == "3":
            self.createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,10,3,7,2,3,5,2,2)
        elif numPlayers == "4":
            self.createQuestStacks(top, middle, bottom, level1Cards, level2Cards, level3Cards, level4Cards,12,4,10,2,4,6,3,3)
        
        top = self.shuffle(top)
        middle = self.shuffle(middle)
        bottom = self.shuffle(bottom)        

        return top + middle + bottom

    def newItemDeck(self):
        cards = []
        for itemValue in range(1, 11):
            for ct in range(12, itemValue-1, -1):
                cards.append(itemValue)

        shuffled = self.shuffle(cards)                
        return shuffled

    def dealItemCard(self, playerIndex, game):
        card = game.itemDeck[0]
        del game.itemDeck[0]
        game.players[playerIndex].hand.append(card)

    def dealItemCardToMarket(self, game):
        card = game.itemDeck[0]
        del game.itemDeck[0]
        game.market.append(card)
        
    def dealQuest(self, game):
        quest = game.questDeck[0]
        del game.questDeck[0]
        game.questsInPlay.append(quest)

    def playerState(self, game, playerId):
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

    def newGame(self):
        """Creates new game object"""

        game_k = ndb.Key('Game', 'theGame')
        game_k.delete()

        numPlayers = self.request.get('numPlayers')
        if (numPlayers == None or numPlayers == ""):
            self.error(500)
            return
        
        game = Game(numPlayers=int(numPlayers), id='theGame')
        game.questDeck = self.newQuestDeck(numPlayers)

        game.itemDeck = self.newItemDeck()
        for i in range (0, game.numPlayers):
            p=Player()            
            game.players.append(p)

        # deal five cards
        for i in range (5):
            for j in range(game.numPlayers):
                self.dealItemCard(j, game)

        # deal four cards to the market
        for i in range(4):
            self.dealItemCardToMarket(game)

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
                self.dealItemCard(p, game)

        # create carts
        for p in range(game.numPlayers):
            for i in range(4):
                c=Cart(purchased=False)
                if (i == 0):
                    c.purchased = True
                game.players[p].carts.append(c)

        # sort items
        for p in range(game.numPlayers):
            game.players[p].hand.sort()

        # deal quests
        for i in range(4):
            self.dealQuest(game)

        game.put()

        retstr = self.playerState(game, 0)        
        #jsonstr = json.dumps([game.to_dict()])
                
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)
    
    def info(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        jsonstr = json.dumps([game.to_dict()])
        if jsonstr == None or jsonstr == "":
            jsonstr = "no game in current session"

        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)    

    def join(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        retstr = self.playerState(game, 1)        
        #jsonstr = json.dumps([game.to_dict()])
                
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def get(self):
        """Switchboard for game actions"""
        action = self.request.get('action')
        if action == None:
            self.error(500)
            return

        if action == "new":
            return self.newGame()

        if action == "join":
            return self.join()

        if action == "info":
            return self.info()


        self.error(500)


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'ds-secret-key',
}

app = webapp2.WSGIApplication([
    ('/game', GameHandler)
], debug=True,config=config)
