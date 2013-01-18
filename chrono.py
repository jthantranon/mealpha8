import webapp2
import jinja2
import os
#import jsonutil
import intops as ops
#import json
import json

from models import *
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import channel

class MetaClock60(webapp2.RequestHandler):
    def get(self):
        mines = Item.query(Item.regtype == 'Mine').fetch(9999)
        
        for mine in mines:
            mine.databits = mine.databits + 10
            mine.put()
        
class Test(webapp2.RequestHandler):
    def get(self):
        meta = Meta()
        meta.name = self.request.get('name')
        meta.info = self.request.get('info')
        meta.masterid = ops.cmasterid()
        meta.email = ops.cemail()

        meta.put()
        meta.metaid = meta.key.id()
        meta.put()

app = webapp2.WSGIApplication([('/chrono/test', Test),
                               
                               ('/chrono/60', MetaClock60),

                               ],debug=True)
