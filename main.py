#!/usr/bin/env python
"""
This is the back end for dungeon shopper
"""


import webapp2
import json
import logging
import string
import random

from google.appengine.api import memcache
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

        # Temporary: delete theGame from the data store
        # later, perhaps stale games will be deleted here
        game_k = ndb.Key('Game', 'theGame')
        game_k.delete()

        game = createNewGame("theGame", numPlayers, name)       
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

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1

        iActionCost = int(actionCost)

        result = fish(game, iPlayerId, what, where, iActionCost)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game, iPlayerId)
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

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1
        iActionCost = int(actionCost)
        result = discard(game, iPlayerId, what, where, iActionCost)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game, iPlayerId)
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
        logging.info("move")        
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return
			
        src = self.request.get('src')
        if (src == None or src == ""):
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

        iActionCost = int(actionCost)

        result = move(game, iPlayerId, what, src, dst, iActionCost)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game, iPlayerId)
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

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
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

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1
        iActionCost = int(actionCost)
        result = buyCart(game, iPlayerId, cartidstr, withGold, items, iActionCost)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game, iPlayerId)
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

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        result = buyAction(game, iPlayerId)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, iPlayerId)
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

 
        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        handItems = self.request.get('handItems')
        if (handItems == None):
            self.error(500)
            return

        marketItems = self.request.get('marketItems')
        if (marketItems == None):
            self.error(500)
            return        

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1
        iActionCost = int(actionCost)
        result = marketTrade(game, iPlayerId, handItems, marketItems, iActionCost)
        if (result == False):
            self.error(500)
            return
        self.appendToLog(game, iPlayerId)
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

        logging.info("Compelete quest: loaded quest")

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return

        logging.info("Compelete quest: running")
        result = completeQuest(game, iPlayerId, what, where)
        if (result == False):
            self.error(500)
            return

        logging.info("Compelete quest: done")

        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)


    def completeEventDealQuest(self):
        """
        USAGE: /game?action=completeEventDealQuest&eventId=<eventId>playerId=<playerId>
        """
        logging.info("Players Compeleting Event Deal Quest: begin")
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        logging.info("Players Compeleting event: loaded event")

        eventId = self.request.get('eventId')
        if (eventId == None or eventId == ""):
            self.error(500)
            return
        ieventId = int(eventId)


        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        logging.info("EventId found:  {0}".format(eventId))
        result = completeEventDealQuest(game, iPlayerId, ieventId)
        if (result == False):
            self.error(500)
            return

        logging.info("Player {0}'s compeleting event".format(iPlayerId))

        retstr = playerState(game, iPlayerId)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def completeEvent(self):
        """
        USAGE: /game?action=completeEvent&eventId=<eventId>&cart=<cart0>&gold=<0>&items=<0>&what1=<>&where1=<>&what2=<>&where2=<>&dest1=<>
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

        gold = self.request.get('gold')
        igold = int(gold)
        items = self.request.get('items')
        iitemsCount = int(items)
        what1 = self.request.get('what1')
        where1 = self.request.get('where1')
        what2 = self.request.get('what2')
        where2 = self.request.get('where2')
        dest1 = self.request.get('dest1')
        ieventId = int(eventId)
        logging.info("EventId found:  {0}".format(eventId))
        logging.info("gold found:  {0}".format(gold))
        logging.info("items found:  {0}".format(items))
        logging.info("what1 Items Found:  {0}".format(what1))
        logging.info("where1 Items Found:  {0}".format(where1))
        logging.info("what2 Items Found:  {0}".format(what2))
        logging.info("where2 Items Found:  {0}".format(where2))
        logging.info("dest1 Items Found:  {0}".format(dest1))
        result = completeEvent(game, ieventId, iPlayerId, igold, iitemsCount, what1, where1, what2, where2, dest1)
        if (result == False):
            self.error(500)
            return

        logging.info("Compelete event: done")

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

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        items = self.request.get('items')
        if (items == None):
            self.error(500)
            return

        self.appendToLog(game, iPlayerId)

        try:
            priorPlayer = passPlayer(game, iPlayerId, items)
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

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return

        retstr = playerState(game, iPlayerId)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)        

    def appendToLog(self, game, iPlayerId):        
        el = PlayerLog(playerId=iPlayerId, event=self.request.url)
        game.playerLog.append(el)
        game.put()

    def id_generator(self, size=6, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

    def createGame(self, numPlayers):
        gameKey = "game{0}".format(numPlayers)
        randomStr = self.id_generator(6, gameKey)
        gameKey += "_" + randomStr
        gameInfo = GameInfo(gameKey=gameKey, numPlayers=numPlayers, spaceAvailable=numPlayers)
        gameInfo.put()

        # if the game exists in the datastore ... delete it
        game_k = ndb.Key('Game', gameKey)
        game_k.delete()

        theGame = createNewGame(gameKey, numPlayers, "defaultPlayer0")

        # add game to cache
        memcache.add(key=gameKey, value=theGame)


    def listGames(self):
        """
        This function returns a list of games available to play
        
        It will manage the games: delete old ones and create new ones as needed
        The game state will mainly be saved in the memcache often and the db store
        rarely.

        Functionality Provided:
        - Creating games when # of available games less than 4
        - Synchronizing cache with games in db when those games are not in the cache
          but yet not complete
        - Deleting games from cache, game entity (db) and game info entity (db) when the
          games are complete or stale
        """
        ct = 1
        gamesNeeded = array('B', [1,1,1,1])         

        # get all games from game info datastore
        gameInfos = []
        games = GameInfo.query()
        for gi in games:
            keyStr = gi.gameKey
            game = memcache.get(keyStr)            
            if (game == None):
                logging.error("Key not in cache: {0}".format(keyStr))

            if (gi.spaceAvailable > 0):
                gamesNeeded[gi.numPlayers-1] = 0
                gameInfos.append(gi.to_dict())

        #ct = 1
        #for 

        gameCreated = 0
        ct = 1
        for gn in gamesNeeded:
            if gn == 1:
                # create game
                self.createGame(ct)
                gameCreated = 1
            ct += 1

        if (gameCreated == 1):
            return self.listGames()
        
        thedict = {}
        thedict["gamesAvailable"] = gameInfos
        jsonstr = json.dumps(thedict)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)      

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

            if action == "completeEventDealQuest":
                return self.completeEventDealQuest()

            if action == "refresh":
                return self.refresh()

            if action == "listGames":
                return self.listGames()

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


