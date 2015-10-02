#!/usr/bin/env python
"""
This is the back end for dungeon shopper
"""


import webapp2
import json
import logging

from google.appengine.ext import ndb
from gameutil import *
from game_model import *
from google.appengine.api.logservice import logservice

class GameHandler(webapp2.RequestHandler):
    def newGame(self):
        """Creates new game object"""
        # Confirm inputs
        numPlayers = self.request.get('numPlayers')
        if (numPlayers == None or numPlayers == ""):
            self.error(500)
            return

        name = self.request.get("name")
        if (name == None or name == ""):
            self.error(500)
            return

        game = createNewGame(numPlayers, name)       
        retstr = playerState(game, 0)        
        #jsonstr = json.dumps([game.to_dict()])
                
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)
    
    def info(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()
        if (game == None):
            self.response.headers.add_header('Access-Control-Allow-Origin', "*")
            self.response.headers["Content-Type"] = "application/json"
            self.response.write("")    

        jsonstr = json.dumps([game.to_dict()])
        if jsonstr == None or jsonstr == "":
            jsonstr = "no game in current session"

        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)    

    def join(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        name = self.request.get("name")
        if (name == None or name == ""):
            self.error(500)
            return

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 1 or iPlayerId > 3):
            self.error(500)
            return

        game.players[iPlayerId].name = name
        #game.players[iPlayerId].playerId = playerId
        
        game.put()
        retstr = playerState(game, iPlayerId)        
                
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def fish(self):
        """
        USAGE: /game?action=fish&what=<singlecard>&where=<hand,cart0,cart1,etc>
        example: /game?action=fish&what=2&where=cart1
        checks to make sure 2 is in cart1 before doing the action
        returns error 500 when there is an error
        """
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return

        result = fish(game, what, where)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def discard(self):
        """
        USAGE: /game?action=discard&what=<item list>&where=<hand,cart0,cart1,etc>
        example: /game?action=discard&what=234&where=hand
        discards the given list of items from location given. Each item must exist, otherwise 500 is returned
        returns error 500 when there is an error
        """
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return

        result = discard(game, what, where)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def move(self):
        """
        USAGE: /game?action=cartCards&what=<item list>&src=<hand,cart0,cart1,etc>&dst=<cart0,cart1,etc>
        example: /game?action=cartCards&what=23&src=hand&dst=cart0
        Moves cards from hand to cart or cart to cart. Destination cart must be purchased and 
        there must be enough space. Otherwise an error is returned
        returns error 500 when there is an error
        """
        logging.error("move")        
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        src = self.request.get('src')
        if (src == None or src == ""):
            self.error(500)
            return

        dst = self.request.get('dst')
        if (dst == None or dst == ""):
            self.error(500)
            return

        dst = self.request.get('dst')
        if (dst == None or dst == ""):
            self.error(500)
            return        

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1

        result = move(game, what, src, dst, actionCost)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def buyCart(self):
        """
        USAGE: /game?action=buyCart&withGold=<1or0>&items=<blank or itemlist>&cart=<cart0,cart1,etc>
        example: /game?action=buyCart&withGold=0&items=37&cart=cart1
        confirms the cart isn't purchased already and the item cost is greater or equal to the cart cost
        returns error 500 when there is an error
        """
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        withGold = self.request.get('withGold')
        if (withGold == None or withGold == ""):
            self.error(500)
            return

        items = self.request.get('items')
        if (items == None):
            self.error(500)
            return

        cartidstr = self.request.get('cart')        
        if (cartidstr == None or cartidstr == ""):
            self.error(500)
            return

        if (withGold == 0 and items == ""):
            self.error(500)
            return

        result = buyCart(game, cartidstr, withGold, items)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def buyAction(self):
        """
        USAGE: /game?action=buyAction
        example: /game?action=buyAction
        confirms the player has enough gold, if so the number of actions is increased
        returns error 500 when there is an error
        """
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        result = buyAction(game)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def marketTrade(self):
        """
        USAGE: /game?action=marketTrade&handItems=<1 or more items>&marketItems=<1 or more items>
        example: /game?action=marketTrade&handItems=23&marketItems=5

        Trades with the market. The length of one of the list must be zero. Sum of the lists must be equal.
        The cards must exist in the hand and in the market. Error 500 is returned if any of these conditions
        aren't met
        """
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        handItems = self.request.get('handItems')
        if (handItems == None):
            self.error(500)
            return

        marketItems = self.request.get('marketItems')
        if (marketItems == None):
            self.error(500)
            return        

        result = marketTrade(game, handItems, marketItems)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def completeQuest(self):
        """
        USAGE: /game?action=completeQuest&what=<itemList>where=<cartID>
        Uses the items in the cart to complete a quest. If a quest with the cards in the cart doesn't exist, it returns an error
        """
        logging.info("Compelete quest: begin")
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        logging.error("Compelete quest: loaded quest")

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return

        logging.error("Compelete quest: running")
        result = completeQuest(game, what, where)
        if (result == False):
            self.error(500)
            return

        logging.info("Compelete quest: done")

        self.appendToLog(game)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def completeEvent(self):
        """
        USAGE: /game?action=completeEvent&eventId=<eventId>&cart=<cart0>&gold=<0>&what1=<>&where1=<>&what2=<>&where2=<>&dest1=<>
        Complete an event. 
        """
        logging.info("Compelete Event: begin")
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        logging.info("Compelete event: loaded event")

        eventId = self.request.get('eventId')
        if (eventId == None or eventId == ""):
            self.error(500)
            return

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        cartidstr = self.request.get('cartToDestroy')        
        gold = self.request.get('gold')
        items = self.request.get('items')
        what1 = self.request.get('what1')
        where1 = self.request.get('where1')
        what2 = self.request.get('what2')
        where2 = self.request.get('where2')
        dest1 = self.request.get('dest1')
        logging.info("EventId found:  {0}".format(eventId))
        logging.info("gold found:  {0}".format(gold))
        logging.info("items found:  {0}".format(items))
        logging.info("what1 Items Found:  {0}".format(what1))
        logging.info("where1 Items Found:  {0}".format(where1))
        logging.info("what2 Items Found:  {0}".format(what2))
        logging.info("where2 Items Found:  {0}".format(where2))
        logging.info("dest1 Items Found:  {0}".format(dest1))
        result = completeEvent(game, eventId, iPlayerId, cartidstr, gold, items, what1, where1, what2, where2, dest1)
        if (result == False):
            self.error(500)
            return

        logging.info("Compelete event: done")

        self.appendToLog(game)
        retstr = playerState(game, iPlayerId)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def passPlayer(self):
        """
        USAGE: /game?action=passPlayer&items=<items to discard>
        example: /game?action=passPlayer&items=2
        Removes given items from players hand to bring it down to max hand
        if handlen > maxHand, then items len must be so that once discarded handlen = maxHand
        if handlen < maxHand, then items len must be zero. The player will be dealt enough cards to make handlen=maxHand
        if handlen = maxHand, then items len must be zero. No changes occur to the players hand

        Once the player hand is handled, the market is dealt one card. The current player is changed.
        
        returns error 500 when there is an error
        """
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        items = self.request.get('items')
        if (items == None):
            self.error(500)
            return

        self.appendToLog(game)

        try:
            priorPlayer = passPlayer(game, items)
        except ValueError as e:
            self.error(500)
            return


        retstr = playerState(game, priorPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)        

    def refresh(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()
        if (game == None):
            self.response.headers.add_header('Access-Control-Allow-Origin', "*")
            self.response.headers["Content-Type"] = "application/json"
            self.response.write("") 

        playerId = int(self.request.get('player'))
        if (playerId == None):
            self.error(500)
            return

        if (playerId < 0 or playerId > game.numPlayers):
            self.error(500)
            return

        retstr = playerState(game, playerId)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)        

    def appendToLog(self, game):        
        el = PlayerLog(playerId=game.curPlayer, event=self.request.url)
        game.playerLog.append(el)
        game.put()

    def get(self):
        """Switchboard for game actions"""

        action = self.request.get('action')
        if action == None:
            self.error(500)
            return

        try:
            if action == "new":
                return self.newGame()

            if action == "join":
                return self.join()

            if action == "info":
                return self.info()

            if action == "fish":
                return self.fish()

            if action == "discard":
                return self.discard()

            if action == "move":
                return self.move()

            if action == "buyCart":
                return self.buyCart()

            if action == "buyAction":
                return self.buyAction()

            if action == "pass":
                return self.passPlayer()

            if action == "marketTrade":
                return self.marketTrade()

            if action == "completeQuest":
                return self.completeQuest()

            if action == "completeEvent":
                return self.completeEvent()

            if action == "refresh":
                return self.refresh()

        except ValueError as e:
            logging.error("Exception ({0}): {1}".format(e.errno, e.strerror))
            self.error(500)
            return

        logging.error("Invalid action")
        self.error(500)


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'ds-secret-key',
}

app = webapp2.WSGIApplication([
    ('/game', GameHandler)
], debug=True,config=config)


