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

class GameInfo:
    def __init__(self):
        self.gameKey = None
        self.numPlayers = None
        self.spaceAvailable = None
        self.createDate = None
        self.updateDate = None

    def to_dict(self):
        dict = {'gameKey': self.gameKey, 'numPlayers': self.numPlayers, 'spaceAvailable': self.spaceAvailable}
        return dict


class GameHandler(webapp2.RequestHandler):
    #def updateGameInfo(self, gameKey):
    #    gi = self.getGameInfo(gameKey)
    #    gi.put()

    def getGameInfo(self, gameKey):        
        game = self.getGame(gameKey)
        gi = GameInfo()
        gi.createDate = game.createDate
        gi.gameKey = game.gameKey
        gi.numPlayers = game.numPlayers
        gi.spaceAvailable = game.spaceAvailable
        gi.updateDate = game.updateDate

        return gi
        

    def reserveID(self, game):
        """Reserves an id from a game
        
        ret: id of the player
        """
        ret = game.numPlayers - game.spaceAvailable        
        return ret    

    def sanityCheck(self, game):
        ct = 0
        ct += len(game.market)
        ct += len(game.discardPile)
        ct += len(game.itemDeck)
        logging.info("Sanity check: mk {0} dp {1} id {2}".format(len(game.market),
                                                       len(game.discardPile),
                                                       len(game.itemDeck)))

        p = 1
        for player in game.players:
            ct += len(player.hand)
            str = "player {0}: ".format(p)
            p += 1
            str += "hand {0}".format(len(player.hand))
            
            for cart in player.carts:
                str += " cart {0} ".format(len(cart.inCart))                
                ct += len(cart.inCart)
            logging.info(str)

        if (ct == 75):
            return True
        else:
            logging.error("Sanity check: {0}".format(ct))
            return False

    def saveGame(self, game):
        if (self.sanityCheck(game) == False):
            logging.error("Sanity check failed")

        logging.info("Saving game")
        game.put()
        self.updateCache(game)

    def getGame(self, gameKey):
        """Retrieves the game object, and updates the cache for each player"""
        game_k = ndb.Key('Game', gameKey)
        game = game_k.get()        

        #game = memcache.get(gameKey)
        #saveInCache = 0            
        #if (game == None):
        #    logging.error("getGame: Key {0} not in cache possible loss of game data".format(gameKey))
        #    game_k = ndb.Key('Game', gameKey)
        #    game = game_k.get()
        #    saveInCache = 1

        #if (game == None):
        #    raise ValueError("Game doesn't exist")

        #if (saveInCache):
        #    memcache.add(key=gameKey, value=game)

        return game

    @ndb.transactional(xg=True)
    def info(self, gameKey):
        """Dumps the entire game data to JSON format"""                
        if (game == None):            
            self.response.headers["Content-Type"] = "application/json"
            self.response.write("")
            return None   

        game = self.getGame(gameKey)
        jsonstr = json.dumps([game.to_dict()])
        if jsonstr == None or jsonstr == "":
            jsonstr = "no game in current session"
        
        return jsonstr

    @ndb.transactional(xg=True)
    def join(self, gameKey):        
        name = self.request.get("name")
        if (name == None or name == ""):
            logging.error("name not set")
            self.error(500)
            return None
        
        game = self.getGame(gameKey)
        playerId = self.reserveID(game)
        if (playerId == -1):
            logging.error("Failed to reserve player ID: -1")
            self.error(500)
            return None
                
        if (game.spaceAvailable < 1):
            logging.error("space unavailable")
            self.error(500)
            return None
        
        minAllowed = game.numPlayers - game.spaceAvailable
        game.spaceAvailable -= 1        

        logging.info("player ID: {0} {1}".format(playerId, minAllowed))
        #if (playerId > 3 or playerId != minAllowed):
        #    logging.error("Invalid player ID: {0}".format(playerId))
        #    self.error(500)
        #    return

        
        self.noActionAfterGameOver(game) # throws exception if game is over
        game.players[playerId].name = name
                
        retstr = playerState(game, playerId)        
        self.saveGame(game)        
        return retstr

    @ndb.transactional(xg=True)
    def fish(self, gameKey):
        """
        USAGE: /game?action=fish&what=<singlecard>&where=<hand,cart0,cart1,etc>
        example: /game?action=fish&what=2&where=cart1
        checks to make sure 2 is in cart1 before doing the action
        returns error 500 when there is an error
        """        

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return None

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return None

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1

        iActionCost = int(actionCost)

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = fish(game, iPlayerId, what, where, iActionCost)
        if (result == False):
            self.error(500)
            return None
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        
        self.saveGame(game)
        return retstr


    @ndb.transactional(xg=True)
    def discard(self, gameKey):
        """
        USAGE: /game?action=discard&what=<item list>&where=<hand,cart0,cart1,etc>
        example: /game?action=discard&what=234&where=hand
        discards the given list of items from location given. Each item must exist, otherwise 500 is returned
        returns error 500 when there is an error
        """        

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return None

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return None

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1
        iActionCost = int(actionCost)

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = discard(game, iPlayerId, what, where, iActionCost)
        if (result == False):
            self.error(500)
            return None
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def move(self, gameKey):
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
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        src = self.request.get('src')
        if (src == None or src == ""):
            self.error(500)
            return None

        dst = self.request.get('dst')
        if (dst == None or dst == ""):
            self.error(500)
            return None

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return None

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1

        iActionCost = int(actionCost)

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = move(game, iPlayerId, what, src, dst, iActionCost)
        if (result == False):
            self.error(500)
            return None
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def buyCart(self, gameKey):
        """
        USAGE: /game?action=buyCart&withGold=<1or0>&items=<blank or itemlist>&cart=<cart0,cart1,etc>
        example: /game?action=buyCart&withGold=0&items=37&cart=cart1
        confirms the cart isn't purchased already and the item cost is greater or equal to the cart cost
        returns error 500 when there is an error
        """        

        withGold = self.request.get('withGold')
        if (withGold == None or withGold == ""):
            self.error(500)
            return None

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        items = self.request.get('items')
        if (items == None):
            self.error(500)
            return None

        cartidstr = self.request.get('cart')        
        if (cartidstr == None or cartidstr == ""):
            self.error(500)
            return None

        if (withGold == 0 and items == ""):
            self.error(500)
            return None

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1
        iActionCost = int(actionCost)

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = buyCart(game, iPlayerId, cartidstr, withGold, items, iActionCost)
        if (result == False):
            self.error(500)
            return None
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def buyAction(self, gameKey):
        """
        USAGE: /game?action=buyAction
        example: /game?action=buyAction
        confirms the player has enough gold, if so the number of actions is increased
        returns error 500 when there is an error
        """        

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        result = buyAction(game, iPlayerId)
        if (result == False):
            self.error(500)
            return None

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, iPlayerId)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def marketTrade(self, gameKey):
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
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        handItems = self.request.get('handItems')
        if (handItems == None):
            self.error(500)
            return None

        marketItems = self.request.get('marketItems')
        if (marketItems == None):
            self.error(500)
            return None        

        actionCost = self.request.get('actionCost')
        if (actionCost == None or actionCost == ""):
            actionCost = 1
        iActionCost = int(actionCost)

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = marketTrade(game, iPlayerId, handItems, marketItems, iActionCost)
        if (result == False):
            self.error(500)
            return None
        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def completeQuest(self, gameKey):
        """
        USAGE: /game?action=completeQuest&what=<itemList>where=<cartID>
        Uses the items in the cart to complete a quest. If a quest with the cards in the cart doesn't exist, it returns an error
        """
        logging.info("Complete quest: begin")        
        logging.info("Complete quest: loaded quest")

        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return None

        what = self.request.get('what')
        if (what == None or what == ""):
            self.error(500)
            return None

        logging.info("Complete quest: running")
        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = completeQuest(game, iPlayerId, what, where)
        if (result == False):
            self.error(500)
            return None

        logging.info("Complete quest: done")

        self.appendToLog(game, iPlayerId)
        retstr = playerState(game, game.curPlayer)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def completeEvent(self, gameKey):
        """
        USAGE: /game?action=completeEvent&eventId=<eventId>&cart=<cart0>&gold=<0>&items=<0>&what1=<>&where1=<>&what2=<>&where2=<>&dest1=<>
        Complete an event. 
        """
        logging.info("Complete Event: begin")        
        logging.info("Complete event: loaded event")

        eventId = self.request.get('eventId')
        if (eventId == None or eventId == ""):
            self.error(500)
            return None


        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

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

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        result = completeEvent(game, ieventId, iPlayerId, igold, iitemsCount, what1, where1, what2, where2, dest1)
        if (result == False):
            self.error(500)
            return None

        logging.info("Complete event: done")

        retstr = playerState(game, iPlayerId)
        
        self.saveGame(game)
        return retstr

    @ndb.transactional(xg=True)
    def passPlayer(self, gameKey):
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
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            self.error(500)
            return None

        items = self.request.get('items')
        if (items == None):
            self.error(500)
            return None

        game = self.getGame(gameKey)
        self.noActionAfterGameOver(game) # throws exception if game is over
        self.appendToLog(game, iPlayerId)

        try:
            priorPlayer = passPlayer(game, iPlayerId, items)
        except ValueError as e:
            logging.error("pass player exception {0}".format(e))
            self.error(500)
            return None


        retstr = playerState(game, priorPlayer)
        
        self.saveGame(game)
        return retstr

    def clearRefresh(self, game):
        gameKey = game.gameKey
        for i in range(game.numPlayers):        
            key = gameKey + "_refresh_" + str(i)
            memcache.delete(key)

    def updateCache(self, game):
        """Updates the cache for each player"""
        logging.info("Updating cache")
        gameKey = game.gameKey
        state = None
        for i in range(game.numPlayers):        
            key = gameKey + "_refresh_" + str(i)
            state = playerState(game, i)
            memcache.set(key=key, value=state)            

        obj = json.loads(state)
        logging.info("Done updating cache {0}".format(obj["updateDate"]))

    def refresh(self, gameKey):        
        playerId = self.request.get("playerId")
        if (playerId == None or playerId == ""):
            logging.error("refresh called with bad playerId")
            self.error(500)
            return None

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            logging.error("refresh called with invalid playerId")
            self.error(500)
            return None
                
        key = gameKey + "_refresh_" + playerId

        state = memcache.get(key)
        if (state == None):
            raise ValueError("cache doesn't have key {0} refresh failed".format(key)) 
        #    state = playerState(game, iPlayerId)
        #    memcache.add(key=key, value=state)
        #state = playerState(game, iPlayerId)
        obj = json.loads(state)
        logging.info("refresh: last update time {0}".format(obj["updateDate"]))
        return state
    

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

        # if the game exists in the datastore ... delete it
        game_k = ndb.Key('Game', gameKey)
        game_k.delete()

        theGame = createNewGame(gameKey, numPlayers, "defaultPlayer0")

        # add game to cache
        #memcache.add(key=gameKey, value=theGame)
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
        games = Game.query()
        for game in games:
            keyStr = game.gameKey

            if (game.spaceAvailable > 0):
                gamesNeeded[game.numPlayers-1] = 0
                gi = self.getGameInfo(keyStr)
                gameDict = gi.to_dict()
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
            score = player.points + player.bonus + player.gold
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
        
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(jsonstr)  

    def noActionAfterGameOver(self, game):
        if (game.gameMode == "gameOver"):
            raise ValueError("Cannot execute action after the game is over")            

    @ndb.transactional(xg=True)
    def checkGameOver(self, gameKey):
        game = self.getGame(gameKey)
        if (game.gameMode == "gameOver" and game.highScoresSaved == False):
            #game over, save highscores                
            game.highScoresSaved =True                              
            self.saveHighScores(game)                
            self.saveGame(game)

    @ndb.transactional(xg=True)
    def setGameOver(self, gameKey):
        game = None                 
        retstr = ""
        game = self.getGame(gameKey)       
        if (game == None):
            logging.error("game over called with null game object")
            self.error(500)
            return None
                
        self.noActionAfterGameOver(game) # throws exception if game is over
        game.gameMode = "gameOver"
        playerId = self.request.get("playerId")

        iPlayerId = int(playerId)
        if (iPlayerId < 0 or iPlayerId > 3):
            logging.error("game over called with invalid playerId")
            self.error(500)
            return None
            
        retstr = playerState(game, iPlayerId)
        if (playerId == None or playerId == ""):
            logging.error("game over called with bad playerId")
            self.error(500)
            return None
                
        self.saveGame(game)
        
        return retstr          



    def get(self):
        """Switchboard for game actions"""
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers.add_header('cache-control', "no-cache, no-store, must-revalidate")
        action = self.request.get('action')
        if action == None:
            self.error(500)
            return

        gameKey = self.request.get('gameKey')

        #
        # The following actions do not need the game object
        #
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

            # refresh doesn't load the game, it gets it from cache
            # or returns an error
            if action == "refresh":
                retval = self.refresh(gameKey)

            # all of these functions are transactional and get the game and save it in cache
            # get the game and put it into cache for refresh, modify the game and save it
            if action == "join":
                retval = self.join(gameKey)

            if action == "fish":
                retval = self.fish(gameKey)

            if action == "discard":
                retval = self.discard(gameKey)

            if action == "move":
                retval = self.move(gameKey)

            if action == "buyCart":
                retval = self.buyCart(gameKey)

            if action == "buyAction":
                retval = self.buyAction(gameKey)

            if action == "pass":
                retval = self.passPlayer(gameKey)

            if action == "gameOver":
                retval = self.setGameOver(gameKey)                

            if action == "marketTrade":
                retval = self.marketTrade(gameKey)

            if action == "completeQuest":
                retval = self.completeQuest(gameKey)

            if action == "completeEvent":
                retval = self.completeEvent(gameKey)

            if action == "info":
                retval = self.info(gameKey)

            if (self.response.has_error()):
                logging.error("Not outputting anything as the response has an error")
            else:
                if (retval != None):
                    self.response.headers["Content-Type"] = "application/json"
                    self.response.write(retval)
            
            if (action != "refresh"):
                self.checkGameOver(gameKey)
            
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


