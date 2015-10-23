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
    def updateGameInfo(self, gameKey):
        gi = self.getGameInfo(gameKey)
        gi.put()

    def getGameInfo(self, gameKey):
        gameInfoQuery = GameInfo.query(GameInfo.gameKey==gameKey)
        giList = gameInfoQuery.fetch()
        if (len(giList) != 1):
            logging.error("unexpected number of game info items returned")
            self.error(500)
            return

        return giList[0]
        

    def reserveID(self, gameKey):
        ret = memcache.incr(gameKey+"_counter")
        if (ret == None):
            gi = self.getGameInfo(gameKey)
            ret = gi.numPlayers - gi.spaceAvailable
            memcache.add(key=gameKey+"_counter", value=ret+1)
            return ret
        return ret-1    

    def saveGame(self, game, gameKey, alsoDatastore):
        memcache.set(key=gameKey, value=game)
        if (alsoDatastore):
            game.put()


    def getGame(self, gameKey):
        game = memcache.get(gameKey)
        saveInCache = 0            
        if (game == None):
            logging.error("getGame: Key {0} not in cache possible loss of game data".format(gameKey))
            game_k = ndb.Key('Game', gameKey)
            game = game_k.get()
            saveInCache = 1

        if (game == None):
            raise ValueError("Game doesn't exist")

        if (saveInCache):
            memcache.add(key=gameKey, value=game)

        return game

    
    def info(self, game):                
        if (game == None):
            self.response.headers.add_header('Access-Control-Allow-Origin', "*")
            self.response.headers["Content-Type"] = "application/json"
            self.response.write("")
            return    

        jsonstr = json.dumps([game.to_dict()])
        if jsonstr == None or jsonstr == "":
            jsonstr = "no game in current session"

        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)    

    def join(self, game, gameKey):
        playerId = self.reserveID(gameKey)
        if (playerId == -1):
            logging.error("Failed to reserve player ID: -1")
            self.error(500)
            return
        
        name = self.request.get("name")
        if (name == None or name == ""):
            logging.error("name not set")
            self.error(500)
            return

        gi = self.getGameInfo(gameKey)
        if (gi.spaceAvailable < 1):
            logging.error("space unavailable")
            self.error(500)
            return

        minAllowed = gi.numPlayers - gi.spaceAvailable
        gi.spaceAvailable -= 1
        gi.put()        

        logging.info("player ID: {0} {1}".format(playerId, minAllowed))
        if (playerId > 3 or playerId != minAllowed):
            logging.error("Invalid player ID: {0}".format(playerId))
            self.error(500)
            return

        game.players[playerId].name = name
                
        retstr = playerState(game, playerId)        
                
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def fish(self, game):
        """
        USAGE: /game?action=fish&what=<singlecard>&where=<hand,cart0,cart1,etc>
        example: /game?action=fish&what=2&where=cart1
        checks to make sure 2 is in cart1 before doing the action
        returns error 500 when there is an error
        """        

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


    def discard(self, game):
        """
        USAGE: /game?action=discard&what=<item list>&where=<hand,cart0,cart1,etc>
        example: /game?action=discard&what=234&where=hand
        discards the given list of items from location given. Each item must exist, otherwise 500 is returned
        returns error 500 when there is an error
        """        

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


    def move(self, game):
        """
        USAGE: /game?action=cartCards&what=<item list>&src=<hand,cart0,cart1,etc>&dst=<cart0,cart1,etc>
        example: /game?action=cartCards&what=23&src=hand&dst=cart0
        Moves cards from hand to cart or cart to cart. Destination cart must be purchased and 
        there must be enough space. Otherwise an error is returned
        returns error 500 when there is an error
        """        

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


    def buyCart(self, game):
        """
        USAGE: /game?action=buyCart&withGold=<1or0>&items=<blank or itemlist>&cart=<cart0,cart1,etc>
        example: /game?action=buyCart&withGold=0&items=37&cart=cart1
        confirms the cart isn't purchased already and the item cost is greater or equal to the cart cost
        returns error 500 when there is an error
        """        

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


    def buyAction(self, game):
        """
        USAGE: /game?action=buyAction
        example: /game?action=buyAction
        confirms the player has enough gold, if so the number of actions is increased
        returns error 500 when there is an error
        """        

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


    def marketTrade(self, game):
        """
        USAGE: /game?action=marketTrade&handItems=<1 or more items>&marketItems=<1 or more items>
        example: /game?action=marketTrade&handItems=23&marketItems=5

        Trades with the market. The length of one of the list must be zero. Sum of the lists must be equal.
        The cards must exist in the hand and in the market. Error 500 is returned if any of these conditions
        aren't met
        """        

 
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


    def completeQuest(self, game):
        """
        USAGE: /game?action=completeQuest&what=<itemList>where=<cartID>
        Uses the items in the cart to complete a quest. If a quest with the cards in the cart doesn't exist, it returns an error
        """
        logging.info("Complete quest: begin")        
        logging.info("Complete quest: loaded quest")

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

        logging.info("Complete quest: running")
        result = completeQuest(game, iPlayerId, what, where)
        if (result == False):
            self.error(500)
            return

        logging.info("Complete quest: done")

        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def completeEvent(self, game):
        """
        USAGE: /game?action=completeEvent&eventId=<eventId>&cart=<cart0>&gold=<0>&items=<0>&what1=<>&where1=<>&what2=<>&where2=<>&dest1=<>
        Complete an event. 
        """
        logging.info("Complete Event: begin")        
        logging.info("Complete event: loaded event")

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
        iitemsCount = 0
        if (items != None and items != ""):
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

        logging.info("Complete event: done")

        retstr = playerState(game, iPlayerId)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def passPlayer(self, game):
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

    def refresh(self, game):        
        if (game == None):
            logging.warning("refresh called with null game object")
            self.response.headers.add_header('Access-Control-Allow-Origin', "*")
            self.response.headers["Content-Type"] = "application/json"
            self.response.write("") 

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            logging.error("refresh called with bad playerId")
            self.error(500)
            return

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            logging.error("refresh called with invalid playerId")
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
        memcache.add(key=gameKey+"_counter", value=0)


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
            game = self.getGame(keyStr)          
            if (game == None):
                logging.error("Couldn't get the game -- deleting game info")
                gi.key.delete()
                continue

            if (gi.spaceAvailable > 0):
                gamesNeeded[gi.numPlayers-1] = 0
                gameDict = gi.to_dict()
                del gameDict["createDate"]
                del gameDict["updateDate"]
                gameInfos.append(gameDict)


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

    def testHighScores(self):
        """Utility function that creates some highscores"""
        names = ["Cordelia", "Aaron", "Dannielle", "Shona", "Yevette",
                 "Gia", "Rosena", "Micah", "Zoraida", "Kelley", "Quincy",
                 "Claudette", "Debi", "Porsha", "Ozell", "Nubia", "Joellen",
                 "Marni", "Edison", "Shayne"]

        logging.error("Adding high scores")

        ct = 0
        for i in range(4):
            numPlayers = i + 1
            for j in range(20):
                score = j * 2
                hs = HighScore(numPlayers=numPlayers, playerName=names[j], score=score)
                hs.put()
                ct += 1


        thedict = {}
        thedict["highScoresCreated"] = ct
        jsonstr = json.dumps(thedict)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)  


    def saveHighScores(self, game):
        """This function saves the score obtained by each player

        self: the handler
        game: the game that just ended
        """
        if (game.gameMode != "gameOver"):
            raise ValueError("save highscores called but game not over {0}".format(game.gameMode))
                        
        for player in game.players:
            score = player.points + player.bonus
            hs = HighScore(numPlayers=game.numPlayers, playerName=player.name, score=score)
            hs.put()

    def highScores(self):
        """This function returns the five highest scores obtained for each of the four
        game types.

        self: the handler
        """
        highScores = []
        for i in range(4):
            numPlayers = i + 1
            query = HighScore.query(HighScore.numPlayers==numPlayers).order(-HighScore.score)
            scores = query.fetch(5)
            thisList = []
            for score in scores:
                thisList.append(score.to_dict())

            highScores.append(thisList)

        thedict = {}
        thedict["highScores"] = highScores
        jsonstr = json.dumps(thedict)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)  


    def setGameOver(self, game):                 
        retstr = ""       
        if (game == None):
            logging.error("game over called with null game object")
            self.error(500)
            return
        else:
            game.gameMode = "gameOver"
            playerId = self.request.get("playerId")

            iPlayerId = int(playerId)
            if (iPlayerId < 0 or iPlayerId > 3):
                logging.error("game over called with invalid playerId")
                self.error(500)
                return


            retstr = playerState(game, iPlayerId)
            if (playerId == None or playerId == ""):
                logging.error("game over called with bad playerId")
                self.error(500)
                return

        
        
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)
        return True    



    def get(self):
        """Switchboard for game actions"""

        action = self.request.get('action')
        if action == None:
            self.error(500)
            return

        gameKey = self.request.get('gameKey')
        if gameKey == None or gameKey == "":
            if action == "listGames":                
                return self.listGames()
            elif action == "highScores":
                return self.highScores()
            elif action == "testHighScores":
                return self.testHighScores()
            else:
                logging.error("Invalid action {0}".format(action))
                self.error(500)
                return
        
        try:
            retval = False
            alsoDatastore = False
            game = self.getGame(gameKey)

            if (game.gameMode == "gameOver" and
                action != "refresh"):
                logging.error("Cannot execute {0} after the game is over".format(action))
                self.error(500)
                return

            if action == "join":
                retval = self.join(game, gameKey)

            if action == "fish":
                retval = self.fish(game)

            if action == "discard":
                retval = self.discard(game)

            if action == "move":
                retval = self.move(game)

            if action == "buyCart":
                retval = self.buyCart(game)

            if action == "buyAction":
                retval = self.buyAction(game)

            if action == "pass":
                retval = self.passPlayer(game)
                if (retval == True and game.curPlayer == 0):
                    alsoDatastore = True

            if action == "gameOver":
                retval = self.setGameOver(game)                


            if action == "marketTrade":
                retval = self.marketTrade(game)

            if action == "completeQuest":
                retval = self.completeQuest(game)


            if action == "completeEvent":
                retval = self.completeEvent(game)

            if action == "refresh":
                retval = self.refresh(game)

            if action == "info":
                retval = self.info(game)

            if (retval == False):
                logging.error("Worker function returned an error")
                self.error(500)
                return
            
            if (game.gameMode == "gameOver"):
                #game over, save highscores
                self.saveHighScores(game)
                alsoDatastore = True

            self.saveGame(game, gameKey, alsoDatastore)
            if (alsoDatastore):
                self.updateGameInfo(gameKey)

            if (self.response.has_error()):
                if (game != None):
                    jsonstr = json.dumps([game.to_dict()])
                    if jsonstr == None or jsonstr == "":
                        jsonstr = "no game in current session"
                    logging.error("game state {0}".format(state))
                else:
                    logging.error("Can't display game state as the game object is invalid")


            return

        except ValueError as e:
            logging.error("Exception: {0}".format(e))
            self.error(500)
            return

        logging.error("Invalid action {0}".format(action))
        self.error(500)


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'ds-secret-key',
}

app = webapp2.WSGIApplication([
    ('/game', GameHandler)
], debug=True,config=config)


