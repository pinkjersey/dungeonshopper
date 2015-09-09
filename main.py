#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import json
import random

from webapp2_extras import sessions
from game_model import *

class GameHandler(webapp2.RequestHandler):
    def newItemDeck(self):
        cards = []
        for itemValue in range(1, 11):
            for ct in range(12, itemValue-1, -1):
                cards.append(itemValue)

        shuffled = []
        for i in range(75):
            size = 75 - i
            loc = random.randrange(size)
            shuffled.append(cards[loc])
            del cards[loc]
                
        return shuffled

    def dealItemCard(self, playerIndex, game):
        card = game.itemDeck[0]
        del game.itemDeck[0]
        game.players[playerIndex].hand.append(card)
        
    
    def newGame(self):
        """Creates new game object"""
        numPlayers = self.request.get('numPlayers')
        if (numPlayers == None or numPlayers == ""):
            self.error(500)
            return
        
        game = Game(numPlayers=int(numPlayers))
        game.itemDeck = self.newItemDeck()
        for i in range (0, game.numPlayers):
            p=Player()            
            game.players.append(p)

        # deal five cards
        for i in range (5):
            for j in range(game.numPlayers):
                self.dealItemCard(j, game)

        # sort items
        for p in range(game.numPlayers):
            game.players[p].hand.sort()

        maxTotal = 0
        game.firstPlayer = 0
        for p in range(game.numPlayers):
            pMax = sum(game.players[p].hand)
            if (pMax > maxTotal):
                maxTotal = pMax
                game.firstPlayer = p
                
        jsonstr = json.dumps([game.to_dict()])
        self.session['game'] = jsonstr
                
        self.response.write(jsonstr)
        
    
    def get(self):
        """Switchboard for game actions"""
        action = self.request.get('action')
        if action == None:
            self.error(500)
            return

        if action == "new":
            return self.newGame()

        self.error(500)

    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        return self.session_store.get_session()


config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'ds-secret-key',
}

app = webapp2.WSGIApplication([
    ('/game', GameHandler)
], debug=True,config=config)
