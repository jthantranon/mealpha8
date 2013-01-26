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

def BigBrother(target,targetattr,cmetachange):
    pack = Packet()
    pack.refresh = True
    cmeta = ops.loadmeta()
    #If there is a change to the source, update source's static sheet and observers' dynamic glass
    if cmetachange:
        
#        pack.type = 'cMetaUpdate'
#        pack.attr = cmetachange
#        pack.metakind = cmeta.metakind
#        pack.metaid = cmeta.metaid
#        channel.send_message(str(cmeta.metaid), ops.jsonify(pack))

        targetmetas = ops.fetchLocalMetaMetaIDs('Meta', cmeta.metaid)
        for targetmeta in targetmetas:
            pack.type = 'sMedoUpdate'
            pack.attr = cmetachange
            pack.metakind = cmeta.metakind
            pack.metaid = cmeta.metaid
            pack.kid = cmeta.kid
            channel.send_message(str(targetmeta), ops.jsonify(pack))
    
    #If target is a Meta, update his static sheet and observer's dynamic glass
    if target.metakind == 'Meta':
        pack.type = 'cMetaUpdate'
        pack.attr = targetattr
        channel.send_message(str(target.metaid), ops.jsonify(pack))
    
        targetmetas = ops.fetchLocalMetaMetaIDs(target.metakind, target.metaid)
        for targetmeta in targetmetas:
            pack.type = 'sMedoUpdate'
            pack.attr = targetattr
            pack.metakind = target.metakind
            pack.metaid = target.metaid
            pack.kid = target.kid
            channel.send_message(str(targetmeta), ops.jsonify(pack))
            
    if target.metakind == 'Location':
        targetmetas = ops.fetchLocalMetaMetaIDs(target.metakind, target.metaid)
        for targetmeta in targetmetas:
            pack.type = 'cLocaUpdate'
            pack.attr = targetattr
            pack.metakind = target.metakind
            pack.metaid = target.metaid
            pack.kid = target.kid
            channel.send_message(str(targetmeta), ops.jsonify(pack))
    
    if target.metakind == 'Item':
        targetmetas = ops.fetchLocalMetaMetaIDs(target.metakind, target.metaid)
        for targetmeta in targetmetas:
            if targetmeta == cmeta.metaid:
                pass
            else:
                pack.type = 'cLocaUpdate'
                pack.attr = targetattr
                pack.metakind = target.metakind
                pack.metaid = target.metaid
                pack.kid = target.kid
                channel.send_message(str(targetmeta), ops.jsonify(pack))
    
    #If target is not a Meta, update all observer's glass
    if target.metakind != 'Meta':
        targetmetas = ops.fetchLocalMetaMetaIDs(target.metakind, target.metaid)
        for targetmeta in targetmetas:
            if targetmeta == cmeta.metaid:
                pass
            else:
                pack.type = 'sMedoUpdate'
                pack.attr = targetattr
                pack.metakind = target.metakind
                pack.metaid = target.metaid
                pack.kid = target.kid
                channel.send_message(str(targetmeta), ops.jsonify(pack))

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
    #PackObj(sitem)
    #PackObj(cmeta)
    
def Kick(cmeta,sitem):
    content = StandardActionContent(cmeta,'kicks',sitem)
    MetaEcho(content)

# Relocate Medo
def Relo(tMedo,rMedo):
    # Load Stuff
    cmeta = ops.loadmeta()
    rKind = rMedo.metakind
    tKind = tMedo.metakind

    origin = tMedo.cowner
    oKID = ops.metasplit(origin)
    oKind = oKID[0]
    oID = oKID[1]
    try:
        oMedo = ndb.Key(oKind, int(oID)).get()
    except ValueError:
        pass
    
    # Do Stuff
    tMedo.cowner = rMedo.kid
    
    if oKind == 'Location':
        BigBrother(tMedo,'ihremove','')
    
    if tKind == 'Meta':
        pass
    elif rKind == 'Location':
        tMedo.xloc = rMedo.xloc
        tMedo.yloc = rMedo.yloc
        tMedo.zloc = rMedo.zloc
        tMedo.put()
        
        BigBrother(tMedo,'itemshere','')
        
        if oKID == cmeta.kid:
            BigBrother(rMedo,'itemshere','inventory')

    elif rKind == 'Meta':
        tMedo.xloc = ''
        tMedo.yloc = ''
        tMedo.zloc = ''
        tMedo.put()
        
        if oKID == cmeta.kid:
            BigBrother(rMedo,'inventory','inventory')
    else:
        BigBrother(rMedo,'itemshere')
        if oKind == 'Location':
            BigBrother(oMedo,'itemshere','')
        elif oKind == 'Meta':
            BigBrother(oMedo,'inventory','')
    
class ActionRouter(webapp2.RequestHandler):
    def post(self,metaAction):
        cmeta = ops.loadmeta()
        tKind = self.request.get('tKind')
        tID = self.request.get('tID')
        tMedo = ndb.Key(tKind,int(tID)).get()
        if self.request.get('rKind'):
            rKind = self.request.get('rKind')
            rID = self.request.get('rID')
            if rID == 'Zero':
                rMedo = Location()
                rMedo.metakind = 'Location'
                rMedo.xloc = cmeta.xloc
                rMedo.yloc = cmeta.yloc
                rMedo.zloc = cmeta.zloc
                rMedo.lattice = cmeta.lattice
            else:
                rMedo = ndb.Key(rKind,int(rID)).get()
        if metaAction == 'Laugh':
            Laugh()
#                channel.send_message(str(localmeta), ops.jsonify(pack))
        if metaAction == 'Mine Node':
            MineNode(cmeta,tMedo)
            BigBrother(tMedo,'databits','databits')
        if metaAction == 'Kick':
            Kick(cmeta,tMedo)
        if metaAction == 'Relo':
            Relo(tMedo,rMedo)

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
                pack.type = 'usermove'
                channel.send_message(str(localmeta), ops.jsonify(pack))
            else:
                pack.content = cmeta.name + " has moved " + ops.dirFull(direction)
                pack.type = 'userleave'
                pack.name = cmeta.name
                pack.destination = ops.dirFull(direction)
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
                pack.type = 'userenter'
                pack.name = cmeta.name
                pack.destination = ops.dirFull(direction)
                channel.send_message(str(newlocalmeta), ops.jsonify(pack))
        
        self.response.out.write(cmeta.xloc+cmeta.yloc+cmeta.zloc+cmeta.lattice)

class Test(webapp2.RequestHandler):
    def get(self):
        self.response.out.write('test')

app = webapp2.WSGIApplication([('/action/test', Test),
                               
                               (r'/action/move/(.*)', Move),
                               (r'/action/router/(.*)', ActionRouter),
                               
                               ],debug=True)
