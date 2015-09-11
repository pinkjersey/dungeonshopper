#!/usr/bin/env python
"""
This is the back end for dungeon shopper
"""


import webapp2
import json


from google.appengine.ext import ndb
from gameutil import *
from game_model import *

class GameHandler(webapp2.RequestHandler):
    def newGame(self):
        """Creates new game object"""
        # Confirm inputs
        numPlayers = self.request.get('numPlayers')
        if (numPlayers == None or numPlayers == ""):
            self.error(500)
            return

        game = createNewGame(numPlayers)       
        retstr = playerState(game, 0)        
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

        retstr = playerState(game, 1)        
        #jsonstr = json.dumps([game.to_dict()])
                
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def fish(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return

        what = self.request.get('what')
        if (where == None or where == ""):
            self.error(500)
            return

        result = fish(game, what, where)
        if (result == False):
            self.error(500)
            return

        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def discard(self):
        game_k = ndb.Key('Game', 'theGame')
        game = game_k.get()

        where = self.request.get('where')
        if (where == None or where == ""):
            self.error(500)
            return

        what = self.request.get('what')
        if (where == None or where == ""):
            self.error(500)
            return

        result = discard(game, what, where)
        if (result == False):
            self.error(500)
            return

        retstr = playerState(game, game.curPlayer)
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

        if action == "fish":
            return self.fish()

        if action == "discard":
            return self.discard()

        self.error(500)


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'ds-secret-key',
}

app = webapp2.WSGIApplication([
    ('/game', GameHandler)
], debug=True,config=config)
