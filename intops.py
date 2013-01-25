from models import *
from google.appengine.api import users

#import datetime
#import time
import json
import random

from google.appengine.api import channel
from google.appengine.ext import ndb

##########################################################
# Load = Specific, Fetch = MultiLoad, is = check, , 
##########################################################

def metasplit(s):
    head = s.rstrip('0123456789')
    tail = s[len(head):]
    return head, tail

def d10(dice):
    result = random.randint(1,10) * dice
    return result

def loadmeta():
    user = users.get_current_user()
    masterid = user.user_id()
    meta = Meta.query(Meta.masterid == masterid).get()
    return meta

def jsonify(data):
    if isinstance(data, str):
        return json.dumps(data)
    else:
        return json.dumps(data.to_dict())
    
def cmasterid():
    user = users.get_current_user()
    return user.user_id()

def cemail():
    user = users.get_current_user()
    return user.email()

def sonify(data):
    return json.dumps(data)

def fetchAllMetaMetaIDs():
    q = []

    metas = Meta.query().fetch(100)
    for meta in metas:
        q.append(meta.metaid)
    allmetas = q
    return allmetas    

def fetchLocalMetaMetaIDs(metakind, metaid):
    sobj = ndb.Key(metakind, int(metaid)).get()
    q = []
    metas = Meta.query(Meta.xloc == str(sobj.xloc),
                                 Meta.yloc == str(sobj.yloc),
                                 Meta.zloc == str(sobj.zloc),
                                 Meta.lattice == str(sobj.lattice)).fetch(50)
    for meta in metas:
        q.append(meta.metaid)
    localmetas = q
    return localmetas

def fetchLocalMetas(metakind, metaid):
    sobj = ndb.Key(metakind, int(metaid)).get()
    q = []
    metas = Meta.query(Meta.xloc == str(sobj.xloc),
                                 Meta.yloc == str(sobj.yloc),
                                 Meta.zloc == str(sobj.zloc),
                                 Meta.lattice == str(sobj.lattice)).fetch(50)
    for meta in metas:
        q.append(meta.to_dict())
    localmetas = q
    return localmetas

def fetchLocalItems(metakind, metaid):
    cmeta = ndb.Key(metakind, int(metaid)).get()
    q = []
    items = Item.query(Item.xloc == str(cmeta.xloc),
                                 Item.yloc == str(cmeta.yloc),
                                 Item.zloc == str(cmeta.zloc),
                                 Item.lattice == str(cmeta.lattice)).fetch(50)
    for item in items:
        q.append(item.to_dict())
    localitems = q
    return localitems

def fetchPopUpItems(metakind, metaid):
    cmeta = ndb.Key(metakind, int(metaid)).get()
    q = []
    items = Item.query( Item.ispopup == True,
                        Item.xloc == str(cmeta.xloc),
                        Item.yloc == str(cmeta.yloc),
                        Item.zloc == str(cmeta.zloc),
                        Item.lattice == str(cmeta.lattice)).fetch(50)
    for item in items:
        q.append(item.to_dict())
    return q

def loadcloc():
    user = users.get_current_user()
    cmeta = Meta.query(ndb.GenericProperty('masterid') == user.user_id()).get()
    q = Location.query(
        Location.xloc == cmeta.xloc,
        Location.yloc == cmeta.yloc,
        Location.zloc == cmeta.zloc,
        Location.lattice == cmeta.lattice).get()
    if q:
        return q
    else:
        q = Location();
        q.name = cmeta.xloc + '.' + cmeta.yloc + '.' + cmeta.zloc + ':' + cmeta.lattice
        q.xloc = cmeta.xloc
        q.yloc = cmeta.yloc
        q.zloc = cmeta.zloc
        q.lattice = cmeta.lattice
        return q

def updateclocstate():
    cmeta = loadmeta()
    cloc = loadcloc()
    localmetas = fetchLocalMetaMetaIDs(cmeta.metakind,cmeta.metaid)
    pack = Packet()
    for localmeta in localmetas:
                pack.scopename = cloc.name
                pack.type = 'refresh'
                pack.scope = 'location'
                pack.masterid = str(cmeta.masterid)
                pack.name = cmeta.name
                pack.metakind = cmeta.metakind
                pack.metaid = cmeta.metaid
                channel.send_message(str(localmeta), jsonify(pack))

def changed(metakind,metaid):
    cmeta = loadmeta()
    #Lookup Item
    sobj = ndb.Key(metakind, int(metaid)).get()
    #Lookup Location
    pack = Packet()
    pack.type = 'refresh'
    if metakind == 'Meta' or 'Location' in sobj.cowner:
        if cmeta.metaid == metaid:
            pack.scope = 'meta'
            channel.send_message(str(metaid), jsonify(pack))
        localmetas = fetchLocalMetaMetaIDs(metakind,metaid)
        for localmeta in localmetas:
            pack.scope = 'location'
            channel.send_message(str(localmeta), jsonify(pack))
    elif 'Meta' in sobj.cowner:
        cownerid = sobj.cowner.split('.')[1]
        pack.scope = 'meta'
        channel.send_message(str(cownerid), jsonify(pack))
        
    #Lookup People who say (LocalMetas)

def dirOpp(d):
    if d == 'n':
        opp = 'south'
    elif d == 'ne':
        opp = 'southwest'
    elif d == 'e':
        opp = 'west'
    elif d == 'se':
        opp = 'northwest'
    elif d == 's':
        opp = 'north'
    elif d == 'sw':
        opp = 'northeast'
    elif d == 'w':
        opp = 'east'
    elif d == 'nw':
        opp = 'southeast'
    elif d == 'u':
        opp = 'down'
    elif d == 'd':
        opp = 'up'
    
    return opp

def dirFull(d):
    if d == 'n':
        full = 'north'
    elif d == 'ne':
        full = 'northeast'
    elif d == 'e':
        full = 'east'
    elif d == 'se':
        full = 'southeast'
    elif d == 's':
        full = 'south'
    elif d == 'sw':
        full = 'southwest'
    elif d == 'w':
        full = 'west'
    elif d == 'nw':
        full = 'northwest'
    elif d == 'u':
        full = 'up'
    elif d == 'd':
        full = 'down'
    
    return full