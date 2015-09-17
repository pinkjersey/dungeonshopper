import cgi
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import webapp2

class QuestCard(ndb.Model):
    level = ndb.IntegerProperty(required=True)
    coin = ndb.BooleanProperty(required=True, default=True)
    items = ndb.IntegerProperty(repeated=True)
    vp = ndb.IntegerProperty(required=True)
    type = ndb.IntegerProperty(required=True)

class Cart(ndb.Model):
    purchased = ndb.BooleanProperty(required=True, default=False)
    inCart = ndb.IntegerProperty(repeated=True)
    cartSize = ndb.IntegerProperty(required=True)
    goldCost = ndb.IntegerProperty(required=True)
    cardCost = ndb.IntegerProperty(required=True)
    destroyed = ndb.BooleanProperty(required=True, default=False)

class Player(ndb.Model):
    hand = ndb.IntegerProperty(repeated=True)
    carts = ndb.LocalStructuredProperty(Cart, repeated=True)
    gold = ndb.IntegerProperty(required=True, default=0)
    points = ndb.IntegerProperty(required=True, default=0)
    maxHand = ndb.IntegerProperty(required=True, default=5)
    turns = ndb.IntegerProperty(required=True, default=0)
    questsCompleted = ndb.LocalStructuredProperty(QuestCard, repeated=True)

class EventLog(ndb.Model):
    playerId = ndb.IntegerProperty(required=True)
    event = ndb.StringProperty(required=True)

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
    eventLog = ndb.LocalStructuredProperty(EventLog, repeated=True)



