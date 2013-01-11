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

def CreateTI():
        cmeta = ops.loadmeta()
        spec = Item();
        spec.name = 'Test Item'
        spec.info = 'This is a test item.'
        spec.itype = 'Test'
        spec.primertype = 'Generic'
        spec.shardtype = 'Generic'
        spec.fragtype = 'Generic'
        spec.cowner = 'Meta.'+str(cmeta.metaid)
        spec.lattice = '0'
        spec.metakind = 'Item'
        spec.actions = ['Mine Node','Kick']
        
        spec.put()
        spec.metaid = spec.key.id()
        spec.put()

class SpawnMeta(webapp2.RequestHandler):
    def post(self):
        meta = Meta()
        meta.name = self.request.get('name')
        meta.info = self.request.get('info')
        meta.masterid = ops.cmasterid()
        meta.email = ops.cemail()

        meta.put()
        meta.metaid = meta.key.id()
        meta.put()

class CreateSpec(webapp2.RequestHandler):
    def post(self):
        cmeta = ops.loadmeta()
        spec = Item();
        spec.name = self.request.get('title')
        spec.info = 'A YouTube video.'
        spec.itype = 'YouTube'
        spec.primertype = 'Item'
        spec.shardtype = 'Generic'
        spec.fragtype = 'YouTube'
        spec.cowner = 'Meta.'+str(cmeta.metaid)
        spec.lattice = '0'
        spec.metakind = 'Item'
        spec.ytlink = self.request.get('ytlink')
        
        spec.put()
        spec.metaid = spec.key.id()
        spec.put()

class Modify(webapp2.RequestHandler):
    def post(self, metakind,metaid):
        
        metaid = int(metaid)
        metaobj = ndb.Key(metakind,metaid).get()
        for data in self.request.arguments():
            if data == 'createorder':
                continue
            setattr(metaobj,data,self.request.get(data))
        metaobj.put()
        ops.changed(metakind,metaid)

class Test(webapp2.RequestHandler):
    def get(self):
        self.response.out.write(ops.fetchLocalMetas('Meta', 37))

app = webapp2.WSGIApplication([('/unicon/test', Test),
                               
                               (r'/unicon/modify/(.*)/(.*)', Modify),
                               ('/unicon/spawn/meta', SpawnMeta),
                               ('/unicon/create/ytitem', CreateSpec),

                               ],debug=True)
