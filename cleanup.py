#!/usr/bin/env python
"""
This is the cleanup script
"""


import webapp2
import json
import logging
import string
import random
import datetime

from google.appengine.api import memcache
from google.appengine.ext import ndb
from gameutil import *
from game_model import *
from google.appengine.api.logservice import logservice

class CleanupHandler(webapp2.RequestHandler):
	def seconds_ago(self, time_s):
		return datetime.datetime.now() - datetime.timedelta(seconds=time_s)
	

	def get(self):
		self.response.headers['Content-Type'] = 'text/plain'
		#action = self.request.get('action')

		#if action != None:
		#	if (action == "full"):
		#		self.deleteAll()
		#		self.response.out.write('All clean')

		twentyFourHours = self.seconds_ago(60 * 60 * 24)
		fifteenMinutes = self.seconds_ago(60 * 15)
		gameInfoQuery = GameInfo.query(ndb.OR(GameInfo.createDate < twentyFourHours,
											  GameInfo.updateDate < fifteenMinutes))
		giList = gameInfoQuery.fetch()
		
		ct = 0
		for gi in giList:
			game_k = ndb.Key('Game', gi.gameKey)
			game_k.delete()
			gi.key.delete()
			ct += 1
			
		self.response.out.write('Deleted {0} stale games'.format(ct))

app = webapp2.WSGIApplication([
    ('/cleanup', CleanupHandler)
], debug=True)