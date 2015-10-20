import cgi
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import webapp2

class GameInfo(ndb.Model):
    gameKey = ndb.StringProperty(required=True)
    numPlayers = ndb.IntegerProperty(required=True)
    spaceAvailable = ndb.IntegerProperty(required=True)
    createDate = ndb.DateTimeProperty(required=True, auto_now_add=True)
    updateDate = ndb.DateTimeProperty(required=True, auto_now=True)

class QuestCard(ndb.Model):
    level = ndb.IntegerProperty(required=True)
    coin = ndb.BooleanProperty(required=True, default=True)
    items = ndb.IntegerProperty(repeated=True)
    vp = ndb.IntegerProperty(required=True)
    type = ndb.IntegerProperty(required=True)

class Event(ndb.Model):    
    eventId = ndb.IntegerProperty(required=True, default=0)
    whatItems1 = ndb.StringProperty(required=False, default="")
    fromWhere1 = ndb.StringProperty(required=False, default="")
    whatItems2 = ndb.StringProperty(required=False, default="")
    fromWhere2 = ndb.StringProperty(required=False, default="")
    gold = ndb.IntegerProperty(required=False, default=0)
    itemsCount = ndb.IntegerProperty(required=False, default=0)
    moveDest = ndb.StringProperty(required=False, default="")
    prepWhatItems1 = ndb.StringProperty(required=False, default="")
    prepFromWhere1 = ndb.StringProperty(required=False, default="")
    prepMoveDest = ndb.StringProperty(required=False, default="")

class Cart(ndb.Model):
    purchased = ndb.BooleanProperty(required=True, default=False)
    inCart = ndb.IntegerProperty(repeated=True)
    cartSize = ndb.IntegerProperty(required=True)
    goldCost = ndb.IntegerProperty(required=True)
    cardCost = ndb.IntegerProperty(required=True)
    destroyed = ndb.BooleanProperty(required=True, default=False)

class Player(ndb.Model):    
    playerId = ndb.IntegerProperty(required=True, default=0)
    name = ndb.StringProperty(required=True)
    hand = ndb.IntegerProperty(repeated=True)
    carts = ndb.LocalStructuredProperty(Cart, repeated=True)
    gold = ndb.IntegerProperty(required=True, default=0)
    bonus = ndb.IntegerProperty(required=True, default=0)
    points = ndb.IntegerProperty(required=True, default=0)
    maxHand = ndb.IntegerProperty(required=True, default=5)
    turns = ndb.IntegerProperty(required=True, default=0)
    questsCompleted = ndb.LocalStructuredProperty(QuestCard, repeated=True)
    curEventStatus = ndb.StringProperty(required=False, default="completed")
    curEvent = ndb.LocalStructuredProperty(Event, repeated=True)

class PlayerLog(ndb.Model):
    playerId = ndb.IntegerProperty(required=True)
    event = ndb.StringProperty(required=True)

class Game(ndb.Model):
    gameKey = ndb.StringProperty(required=True, default="game") 
    gameMode = ndb.StringProperty(required=True, default="game") 
    curPlayer = ndb.IntegerProperty(default=0)
    actionsRemaining = ndb.IntegerProperty(default=2)        
    numPlayers = ndb.IntegerProperty(required=True)
    players = ndb.LocalStructuredProperty(Player, repeated=True)
    itemDeck = ndb.IntegerProperty(repeated=True)
    discardPile = ndb.IntegerProperty(repeated=True)
    questDeck = ndb.LocalStructuredProperty(QuestCard, repeated=True)
    market = ndb.IntegerProperty(repeated=True)
    questsInPlay = ndb.LocalStructuredProperty(QuestCard, repeated=True)
    playerLog = ndb.LocalStructuredProperty(PlayerLog, repeated=True)
    #eventCompletedCount = ndb.IntegerProperty(default=0)




