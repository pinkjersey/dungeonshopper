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


class Player(ndb.Model):
    hand = ndb.IntegerProperty(repeated=True)

class Game(ndb.Model):
    firstPlayer = ndb.IntegerProperty(default=0)
    startingActions = ndb.IntegerProperty(default=2)
    startingCards = ndb.IntegerProperty(default=5)
    marketStart = ndb.IntegerProperty(default=4)
    questStart = ndb.IntegerProperty(default=4)
    itemDeckStartCount = ndb.IntegerProperty(default=75)
    numPlayers = ndb.IntegerProperty(required=True)
    players = ndb.LocalStructuredProperty(Player, repeated=True)
    itemDeck = ndb.IntegerProperty(repeated=True)
    questDeck = ndb.LocalStructuredProperty(QuestCard, repeated=True)



