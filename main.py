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

    def cartCards(self):
        logging.error("Cart cards")        
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

        result = cartCards(game, what, where)
        if (result == False):
            self.error(500)
            return

        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def buyCart(self):               
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

        retstr = playerState(game, game.curPlayer)
        self.response.headers.add_header('Access-Control-Allow-Origin', "*")
        self.response.headers["Content-Type"] = "application/json"
        self.response.write(retstr)

    def get(self):
        """Switchboard for game actions"""
        logging.error("in get")


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

        if action == "cartCards":
            return self.cartCards()

        if action == "buyCart":
            return self.buyCart()

        logging.error("Invalid action")
        self.error(500)


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'ds-secret-key',
}

app = webapp2.WSGIApplication([
    ('/game', GameHandler)
], debug=True,config=config)

def main():
    logging.getLogger().setLevel(logging.DEBUG)
    webapp2.util.run_wsgi_app(app)

if __name__ == '__main__':
    main()
