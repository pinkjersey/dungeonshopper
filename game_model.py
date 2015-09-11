import cgi
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import webapp2

#class ItemCard(ndb.Model):
#    value = ndb.IntegerProperty(required=True)

class QuestCard(ndb.Model):
    level = ndb.IntegerProperty(required=True)
    coin = ndb.BooleanProperty(required=True, default=True)
    items = ndb.IntegerProperty(repeated=True)
    vp = ndb.IntegerProperty(required=True)
    type = ndb.IntegerProperty(required=True)

class Cart(ndb.Model):
    purchased = ndb.BooleanProperty(required=True, default=False)
    inCart = ndb.IntegerProperty(repeated=True)

class Player(ndb.Model):
    hand = ndb.IntegerProperty(repeated=True)
    carts = ndb.LocalStructuredProperty(Cart, repeated=True)

class Game(ndb.Model):
    curPlayer = ndb.IntegerProperty(default=0)
    actionsRemaining = ndb.IntegerProperty(default=2)        
    numPlayers = ndb.IntegerProperty(required=True)
    players = ndb.LocalStructuredProperty(Player, repeated=True)
    itemDeck = ndb.IntegerProperty(repeated=True)
    discardPile = ndb.IntegerProperty(repeated=True)
    questDeck = ndb.LocalStructuredProperty(QuestCard, repeated=True)
    market = ndb.IntegerProperty(repeated=True)
    questsInPlay = ndb.LocalStructuredProperty(QuestCard, repeated=True)



