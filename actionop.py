import webapp2
import jinja2
import os
#import jsonutil
import intops as ops
import unicon
#import json
import json

from models import *
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import channel

def MetaEcho(content):
    cmeta = ops.loadmeta()
    pack = Packet()
    localmetas = ops.fetchLocalMetaMetaIDs('Meta',cmeta.metaid)
    sloc = ops.loadcloc()
    formatted = "["+sloc.name+"]<b> " + cmeta.name + "</b>: " + content + " haha"
    for localmeta in localmetas:
        pack.scopename = sloc.name
        pack.type = 'action'
        pack.scope = 'local'
        pack.formatted = content
        pack.content = content + " hoho"
        pack.masterid = str(cmeta.masterid)
        pack.name = cmeta.name
        pack.metakind = cmeta.metakind
        pack.metaid = cmeta.metaid
        channel.send_message(str(localmeta), ops.jsonify(pack))

def PackPacket(packtype,scopename,scope,formatted,content):
    cmeta = ops.loadmeta()
    pack = Packet()
    
    if scope == 'local':
        targetmetas = ops.fetchLocalMetaMetaIDs('Meta',cmeta.metaid)
    elif scope == 'global' or scope == 'system':
        targetmetas = ops.fetchAllMetaMetaIDs()
    
    for targetmeta in targetmetas:
                pack.scopename = scopename
                pack.type = packtype
                pack.scope = scope
                pack.formatted = formatted
                pack.content = content
                pack.masterid = str(cmeta.masterid)
                pack.name = cmeta.name
                pack.metakind = cmeta.metakind
                pack.metaid = cmeta.metaid
                channel.send_message(str(targetmeta), ops.jsonify(pack))

def PackObj(sitem):
    cmeta = ops.loadmeta()
    if sitem.kid == cmeta.kid:
        sitem.metasheetupdater = True
    sitem.updater = True
    localmetas = ops.fetchLocalMetaMetaIDs('Meta',cmeta.metaid)
    for localmeta in localmetas:
        channel.send_message(str(localmeta), ops.jsonify(sitem))
def Laugh():
    pass
def StandardActionContent(cmeta,action,sitem):
    return cmeta.name + " " + action + " " + sitem.name + "."
def MineNode(cmeta,sitem):
    #content = StandardActionContent(cmeta,'mines',sitem)
    amount = ops.d10(1)
    
    content = cmeta.name + " mines " + str(amount) + " databits from " + sitem.name + "."
    
    if cmeta.databits:
        cmeta.databits = cmeta.databits + amount
    else:
        cmeta.databits = 10
    sitem.databits = sitem.databits - amount
    sitem.put()
    cmeta.put()
    MetaEcho(content)
    PackObj(sitem)
    PackObj(cmeta)
def Kick(cmeta,sitem):
    content = StandardActionContent(cmeta,'kicks',sitem)
    MetaEcho(content)
    
class ActionRouter(webapp2.RequestHandler):
    def post(self,metaAction):
        cmeta = ops.loadmeta()
        sitem = ndb.Key(self.request.get('metakind'),int(self.request.get('metaid'))).get()
        if metaAction == 'Laugh':
            Laugh()
#                channel.send_message(str(localmeta), ops.jsonify(pack))
        if metaAction == 'Mine Node':
            MineNode(cmeta,sitem)
        if metaAction == 'Kick':
            Kick(cmeta,sitem)

class Move(webapp2.RequestHandler):
    def post(self, direction):
        cmeta = ops.loadmeta()
        localmetas = ops.fetchLocalMetaMetaIDs('Meta',cmeta.metaid)
        
        pack = Packet()
        pack.scope = 'local'
        pack.type = 'move'
        
        
        for localmeta in localmetas:
            if localmeta == cmeta.metaid:
                pack.content = "You move " + ops.dirFull(direction) + "."
                channel.send_message(str(localmeta), ops.jsonify(pack))
            else:
                pack.content = cmeta.name + " has moved " + ops.dirFull(direction)
                channel.send_message(str(localmeta), ops.jsonify(pack))
        
        if direction == 'n':
            cmeta.yloc = str(int(cmeta.yloc)+1)
        elif direction == 's':
            cmeta.yloc = str(int(cmeta.yloc)-1)
        elif direction == 'e':
            cmeta.xloc = str(int(cmeta.xloc)+1)
        elif direction == 'w':
            cmeta.xloc = str(int(cmeta.xloc)-1)
        elif direction == 'u':
            cmeta.zloc = str(int(cmeta.zloc)+1)
        elif direction == 'd':
            cmeta.zloc = str(int(cmeta.zloc)-1)
        elif direction == 'ne':
            cmeta.xloc = str(int(cmeta.xloc)+1)
            cmeta.yloc = str(int(cmeta.yloc)+1)
        elif direction == 'se':
            cmeta.xloc = str(int(cmeta.xloc)+1)
            cmeta.yloc = str(int(cmeta.yloc)-1)
        elif direction == 'sw':
            cmeta.xloc = str(int(cmeta.xloc)-1)
            cmeta.yloc = str(int(cmeta.yloc)-1)
        elif direction == 'nw':
            cmeta.xloc = str(int(cmeta.xloc)-1)
            cmeta.yloc = str(int(cmeta.yloc)+1)
        cmeta.put()
        newlocalmetas = ops.fetchLocalMetaMetaIDs('Meta',cmeta.metaid)
        
        for newlocalmeta in newlocalmetas:
            if newlocalmeta == cmeta.metaid:
                pass
            else:
                pack.content = cmeta.name + " has arrived from the " + ops.dirOpp(direction)
                channel.send_message(str(newlocalmeta), ops.jsonify(pack))
        
        self.response.out.write(cmeta.xloc+cmeta.yloc+cmeta.zloc+cmeta.lattice)

class Test(webapp2.RequestHandler):
    def get(self):
        self.response.out.write('test')

app = webapp2.WSGIApplication([('/action/test', Test),
                               
                               (r'/action/move/(.*)', Move),
                               (r'/action/router/(.*)', ActionRouter),
                               
                               ],debug=True)
