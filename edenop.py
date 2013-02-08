import webapp2
import jinja2
import os
#import jsonutil
import intops as ops
import prototypes as protos
import unicon
#import json
import json

from models import *
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.api import channel

class LoadCMeta(webapp2.RequestHandler):
    def get(self):
        if ops.loadmeta():
            self.response.out.write(ops.jsonify(ops.loadmeta()))
        else:
            self.response.out.write(ops.jsonify('nometa'))

class OpenChannel(webapp2.RequestHandler):
    def get(self):
        cmeta = ops.loadmeta()
        token = channel.create_channel(str(cmeta.metaid),1440)
        
        self.response.out.write(ops.sonify(token))

def MetaEcho(content):
    cmeta = ops.loadmeta()
    pack = Packet()
    localmetas = ops.fetchLocalMetaMetaIDs('Meta',cmeta.metaid)
    sloc = ops.loadcloc()
    formatted = "["+sloc.name+"]<b> " + cmeta.name + "</b>: " + content + " haha"
    for localmeta in localmetas:
        pack.scopename = sloc.name
        pack.type = 'broadcast'
        pack.scope = 'local'
        pack.formatted = formatted
        pack.content = content + " hoho"
        pack.masterid = str(cmeta.masterid)
        pack.name = cmeta.name
        pack.metakind = cmeta.metakind
        pack.metaid = cmeta.metaid
        channel.send_message(str(localmeta), ops.jsonify(pack))

def SelfEcho(content):
    cmeta = ops.loadmeta()
    pack = Packet()
    sloc = ops.loadcloc()
    
    pack.scopename = sloc.name
    pack.type = 'action'
    pack.scope = 'local'
    pack.formatted = content
    pack.content = content + " hohum"
    pack.masterid = str(cmeta.masterid)
    pack.name = cmeta.name
    pack.metakind = cmeta.metakind
    pack.metaid = cmeta.metaid
    channel.send_message(str(cmeta.metaid), ops.jsonify(pack))
        
def cProc(command):
    cmeta = ops.loadmeta()
    if command == '/datamine':
        unicon.CreateDataMine()
        SelfEcho('DataMine Created.')
    elif command == '/digifort':
        unicon.CreateDigiFort()
        SelfEcho('DigitalFortress Created.')
    elif command == '/spawnloc':
        unicon.Spawn().Location()
        SelfEcho('Location Created.')
    elif command == '/newloc':
        para = Packet()
        para.name = 'Test'
        para.info = 'Test Info'
        para.xloc = cmeta.xloc
        para.yloc = cmeta.yloc
        para.zloc = cmeta.zloc
        para.lattice = cmeta.lattice
        protos.spawnLoca(para)
    else:
        content = 'Invalid Command: ' + command
        SelfEcho(content)

def PackPacket(console,packtype,scopename,scope,formatted,content,smeta='No meta provided'):
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
                pack.medo = smeta
                pack.console = console
                channel.send_message(str(targetmeta), ops.jsonify(pack))

class ChanRouter(webapp2.RequestHandler):
    def post(self,dest):
        cmeta = ops.loadmeta()
        sloc = ops.loadcloc()
        content = self.request.get('content')
        pack = Packet()
        
        if dest == 'command':
            cProc(self.request.get('content'))
            ops.mdb(self.request.get('content'), 'command pack')
            formatted = "["+sloc.name+"]<b> " + cmeta.name + "</b>: " + self.request.get('content')
            packtype = 'broadcast'
            scopename = sloc.name
            scope = 'local'

        if dest == 'local':
            
            packtype = 'broadcast'
            scopename = sloc.name
            scope = 'local'
            formatted = "["+sloc.name+"]<b> " + cmeta.name + "</b>: " + self.request.get('content')
            console = True
            
            PackPacket(console,packtype,scopename,scope,formatted,content)
            
        if dest == 'global':
#            if self.request.get('content')[0] == '@':
#                formatted = self.request.get('content')[1:]
#            else:
#                formatted = "[Global]<b> " + cmeta.name + "</b>: " + self.request.get('content')

            packtype = 'broadcast'
            scopename = 'Global'
            scope = 'global'
            formatted = "[Global]<b> " + cmeta.name + "</b>: " + self.request.get('content')
            console = True
            
            PackPacket(console,packtype,scopename,scope,formatted,content)

        elif dest == 'login':
          
            packtype = 'userlogin'
            scopename = 'System'
            scope = 'system'
            content = cmeta.name + "</b> has logged into MetaEden."
            formatted = "[System]<b> " + cmeta.name + "</b> has logged into MetaEden."
            console = 'edenop.ChanRouter.dest==login'
            
            PackPacket(console,packtype,scopename,scope,formatted,content,cmeta)
            
        elif dest == 'pm':
            metakind = self.request.get('metakind')
            metaid = self.request.get('metaid')
            content = self.request.get('content')
            formatted = "[PM]<b> " + cmeta.name + "</b>: " + content
            pack.type = 'pm'
            pack.scope = 'private'
            pack.formatted = formatted
            pack.content = content
            pack.masterid = str(cmeta.masterid)
            pack.name = cmeta.name
            pack.metakind = cmeta.metakind
            pack.metaid = str(cmeta.metaid)
            channel.send_message(str(metaid), ops.jsonify(pack))
            pack.name = metakind+metaid 
            pack.metakind = metakind
            pack.metaid = metaid
            self.response.out.write(ops.jsonify(pack))
        else:
            pack.type = 'msg'
            pack.content = content
            pack.to = str(dest)
            pack.masterid = str(cmeta.masterid)
            pack.name = cmeta.name
            pack.metakind = 'Meta'
            pack.metaid = cmeta.metaid
            pack = json.dumps(pack.to_dict())
            channel.send_message(str(dest), pack)
            self.response.out.write(pack)

class LoadLocation(webapp2.RequestHandler):
    def get(self):
        
        try:
            cmeta = ops.loadmeta()
            q = Location.query(
                               Location.xloc == cmeta.xloc,
                               Location.yloc == cmeta.yloc,
                               Location.zloc == cmeta.zloc,
                               Location.lattice == cmeta.lattice)
            q = q.get()
                       
            self.response.out.write(ops.jsonify(q))
        except AttributeError:
            q = Location()
            q.exits = 'n,e,s,w,nw,ne,se,sw,u,d'
            q.metakind = 'Location'
            q.metaid = cmeta.xloc+cmeta.yloc+cmeta.zloc+cmeta.lattice
            q.name = 'Beyond Eden'
            q.info = "You have wandered beyond constructed space. Don't get lost!"
            if cmeta:
                q.xloc =  cmeta.xloc
                q.yloc =  cmeta.yloc
                q.zloc =  cmeta.zloc
                q.lattice =  cmeta.lattice
            else:
                q.xloc =  '500'
                q.yloc =  '500'
                q.zloc =  '500'
                q.lattice =  '0'
            q = q.to_dict()
            jsonData = json.dumps(q)
            self.response.out.write(jsonData)

class FetchLocalMetas(webapp2.RequestHandler):
    def get(self):
        cmeta = ops.loadmeta()
        localmetas = ops.fetchLocalMetas('Meta',cmeta.metaid)
        self.response.out.write(ops.sonify(localmetas))
        
class FetchLocalItems(webapp2.RequestHandler):
    def get(self):
        cmeta = ops.loadmeta()
        localitems = ops.fetchLocalItems('Meta',cmeta.metaid)
        self.response.out.write(ops.sonify(localitems))

class FetchPopUpItems(webapp2.RequestHandler):
    def get(self):
        cmeta = ops.loadmeta()
        puis = ops.fetchPopUpItems('Meta',cmeta.metaid)
        self.response.out.write(ops.sonify(puis))

class FetchInventory(webapp2.RequestHandler):
    def get(self,target):
        if target == 'self' or target == '':
            tMeta = ops.loadmeta()
        else:
            tMeta = ops.KIDtoMedo(target)
        q = []
        for crystal in Crystal.query(Crystal.cowner == 'Meta'+str(tMeta.metaid)).fetch(50):
            q.append(crystal)
        for blueprint in Blueprint.query(Blueprint.cowner == 'Meta'+str(tMeta.metaid)).fetch(50):
            q.append(blueprint)
        for item in Item.query(Item.cowner == 'Meta'+str(tMeta.metaid)).fetch(50):
            q.append(item)

        cinv = q
        invli = []
        for inv in cinv:
            inv = inv.to_dict()
            invli.append(inv)
        
        self.response.out.write(ops.sonify(invli))

class Drop(webapp2.RequestHandler):
    def post(self,metakind,metaid,dkind,did):
        
        mobject = ndb.Key(metakind, int(metaid)).get()
        
        
        
        if 'Location' in mobject.cowner:
            ops.updateclocstate()    
        
        mobject.cowner = dkind+'.'+did
        
        if metakind == 'Meta':
            pass
        elif dkind == 'Location':
            cloc = ops.loadcloc()
            mobject.xloc = cloc.xloc
            mobject.yloc = cloc.yloc
            mobject.zloc = cloc.zloc
            mobject.put()
            ops.updateclocstate()
            
        elif dkind == 'Meta':
            
            cmeta = ops.loadmeta()
            
            nowner = ndb.Key('Meta', int(did)).get()
            pack = Packet()
            pack.type = 'reinv'
            pack.masterid = str(cmeta.masterid)
            pack.name = cmeta.name
            pack.metakind = 'Meta'
            pack.metaid = cmeta.metaid
            pack = json.dumps(pack.to_dict())
            channel.send_message(nowner.masterid, pack)
            
            
            mobject.xloc = ''
            mobject.yloc = ''
            mobject.zloc = ''
            mobject.put()
        
        mobject = mobject.to_dict()
        jsonData = json.dumps(mobject)

        self.response.out.write(jsonData)



class LoadObject(webapp2.RequestHandler):
    def get(self,metakind,metaid):
        
        mobject = ndb.Key(metakind, int(metaid)).get()

        mobject = mobject.to_dict()
        jsonData = json.dumps(mobject)

        self.response.out.write(jsonData)

class Test(webapp2.RequestHandler):
    def get(self):
        self.response.out.write('test')

app = webapp2.WSGIApplication([('/edenop/test', Test),
                               
                               (r'/edenop/load/(.*)/(.*)', LoadObject),
                               (r'/edenop/drop/(.*)/(.*)/(.*)/(.*)', Drop),
                               (r'/edenop/chanrouter/(.*)', ChanRouter),
                               (r'/edenop/fetchinventory/(.*)', FetchInventory),
                               ('/edenop/loadcmeta', LoadCMeta),
                               ('/edenop/openchannel', OpenChannel),
                               ('/edenop/location', LoadLocation),
                               ('/edenop/fetchpuis', FetchPopUpItems),
                               ('/edenop/fetchlocalmetas', FetchLocalMetas),
                               ('/edenop/fetchlocalitems', FetchLocalItems),
                               
                               
                               ],debug=True)
