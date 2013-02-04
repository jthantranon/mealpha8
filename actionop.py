import webapp2
import jinja2
import os
#import jsonutil
import intops as ops
import unicon
#import json
import json
import copy

from models import *
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import channel

def DepthPerception(before,after,vision=False):
    cmeta = ops.loadmeta()
    bMetaIDs = ops.fetchXYZMIDs(before.xyz)
    aMetaIDs = ops.fetchXYZMIDs(after.xyz)
    eMetaIDs = ops.conKIDs(bMetaIDs, aMetaIDs)
    pack = Packet()
    pack.refresh = True
    pack.who = cmeta.kid

    if before.databits != after.databits:
        pack.type = 'Databits'
        pack.metakind = before.metakind
        pack.metaid = before.metaid
        pack.kid = before.kid
        pack.medo = after
        for metaID in eMetaIDs:
            channel.send_message(str(metaID), ops.jsonify(pack))
    elif before.xyz != after.xyz: #Relocation
        pack.metakind = before.metakind
        pack.metaid = before.metaid
        pack.kid = before.kid
        pack.fromkind = before.cokind
        pack.tokind = after.cokind 
        pack.fromkid = before.cokind + str(before.coid)
        pack.tokid = after.cokind + str(after.coid)
        pack.medo = after
#        for metaID in eMetaIDs:
#            channel.send_message(str(metaID), ops.jsonify(pack))
        for bMeta in bMetaIDs:
            pack.type = 'MedoMove'
            channel.send_message(str(bMeta), ops.jsonify(pack))
        for aMeta in aMetaIDs:
            if after.metakind != 'Meta':
                if after.cowner == cmeta.kid:
                    pack.type = 'ItemUpdate'
                else:
                    pack.type = 'ItemArrive'
            elif aMeta == cmeta.metaid:
                #ops.mdb(aMeta, 'test')
                pack.type = 'YouArrive'
                pack.nMetas = ops.fetchLocalMetas(after.metakind, after.metaid)
                pack.nItems = ops.fetchLocalItems(after.metakind, after.metaid)
            else:
                pack.type = 'MetaArrive'    
            channel.send_message(str(aMeta), ops.jsonify(pack))
    else:
        ops.mdb('This is else')

    if vision:
        for metaID in eMetaIDs:
            pack = Packet()
            pack.type = 'vision'
            pack.vision = True
            pack.formatted = vision
            channel.send_message(str(metaID), ops.jsonify(pack))

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
def MineNode(cmeta,medo):
    #content = StandardActionContent(cmeta,'mines',medo)
    preMedo = copy.copy(medo)
    preCMeta = copy.copy(cmeta)
    
    amount = ops.d10(1)
    content = cmeta.name + " mines " + str(amount) + " databits from " + medo.name + "."
    
    if cmeta.databits:
        cmeta.databits = cmeta.databits + amount
    else:
        cmeta.databits = 10
    medo.databits = medo.databits - amount
    medo.put()
    DepthPerception(preMedo,medo)
    cmeta.put()
    DepthPerception(preCMeta,cmeta,content)
    
def Kick(cmeta,sitem):
    content = StandardActionContent(cmeta,'kicks',sitem)
    MetaEcho(content)

# Relocate Medo
def Relo(tMedo,rMedo):
    # Load Stuff
    relocator = ops.loadmeta()
    rKind = rMedo.metakind
    tKind = tMedo.metakind
    premove = copy.copy(tMedo)

    origin = tMedo.cowner
    oKID = ops.metasplit(origin)
    oKind = oKID[0]
    oID = oKID[1]
    ops.mdb(origin, 'the non location')
    
    try:
        oMedo = ndb.Key(oKind, int(oID)).get()
    except ValueError:
        ops.mdb('except')
    
    if oKind == 'Location':
        oMedo = Location()
        oMedo.name = relocator.cokid
        
    
    # Do Stuff
    tMedo.cowner = rMedo.kid
    
    if tKind == 'Meta':
        pass #shouldn't pass the frontend check
    elif rKind == 'Location':
        tMedo.xloc = rMedo.xloc
        tMedo.yloc = rMedo.yloc
        tMedo.zloc = rMedo.zloc
        tMedo.lattice = rMedo.lattice
        tMedo.cokind = 'Location'
        tMedo.coid = str(rMedo.xloc)+str(rMedo.yloc)+str(rMedo.zloc)+str(rMedo.lattice)
        tMedo.put()
        
    elif rKind == 'Meta':
        tMedo.xloc = ''
        tMedo.yloc = ''
        tMedo.zloc = ''
        tMedo.lattice = rMedo.lattice
        tMedo.cokind = 'Meta'
        tMedo.coid = str(rMedo.metaid)
        tMedo.put()
    who = relocator.name
    if rMedo == relocator:
        what = ' picks up [' + tMedo.name + '] from [' + oMedo.name + ']'
    elif rMedo.metakind == 'Location':
        what = ' drops [' + tMedo.name + '] @ [' + rMedo.name + ']'
    else:
        what = ' moves ...'
    vision = who + what
    DepthPerception(premove,tMedo,vision)
    
class ActionRouter(webapp2.RequestHandler):
    def post(self,metaAction):
        cmeta = ops.loadmeta()
        tKind = self.request.get('tKind')
        tID = self.request.get('tID')
        tMedo = ndb.Key(tKind,int(tID)).get()
        if self.request.get('rKind'):
            rKind = self.request.get('rKind')
            
            rID = self.request.get('rID')
            
            if rKind == 'Location':
                rMedo = Location()
                rMedo.metakind = 'Location'
                rMedo.xloc = cmeta.xloc
                rMedo.yloc = cmeta.yloc
                rMedo.zloc = cmeta.zloc
                rMedo.lattice = cmeta.lattice
                rMedo.name = cmeta.cokid
            else:
                rMedo = ndb.Key(rKind,int(rID)).get()
        if metaAction == 'Laugh':
            Laugh()
#                channel.send_message(str(localmeta), ops.jsonify(pack))
        if metaAction == 'MineNode':
            MineNode(cmeta,tMedo)
        if metaAction == 'Kick':
            Kick(cmeta,tMedo)
        if metaAction == 'Relo':
            Relo(tMedo,rMedo)

class Move(webapp2.RequestHandler):
    def post(self, direction):
        cmeta = ops.loadmeta()
        cmeta.cokind = 'Location' #Not robust
        premove = copy.copy(ops.loadmeta())
        
        
        
        cloc = ops.loadcloc()
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
                pack.name = cmeta.name
                pack.destination = ops.dirFull(direction)
                pack.type = 'userleave'
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
                pack.destination = ops.dirOpp(direction)
                channel.send_message(str(newlocalmeta), ops.jsonify(pack))
        
        DepthPerception(premove,cmeta)
        #self.response.out.write(cmeta.xloc+cmeta.yloc+cmeta.zloc+cmeta.lattice)
        nLocaMetas = ops.fetchLocalMetas(Meta, cmeta.metaid)
        nloc = Packet()
        nloc.locdata = cloc
        nloc.metashere = nLocaMetas
        self.response.out.write(ops.jsonify(nloc))

class Test(webapp2.RequestHandler):
    def get(self):
        self.response.out.write('test')

app = webapp2.WSGIApplication([('/action/test', Test),
                               
                               (r'/action/move/(.*)', Move),
                               (r'/action/router/(.*)', ActionRouter),
                               
                               ],debug=True)
