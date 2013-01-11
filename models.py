from google.appengine.ext import ndb

class Crystal(ndb.Expando):
    metakind = ndb.StringProperty()
    crystalclass = ndb.StringProperty()
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    primertype = ndb.StringProperty() 
    shardtype = ndb.StringProperty()
    fragtype = ndb.StringProperty()
    itype = ndb.StringProperty()
    cowner = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()

class Blueprint(ndb.Expando):
    metakind = ndb.StringProperty()
    bpclass = ndb.StringProperty()
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    primertype = ndb.StringProperty() 
    shardtype = ndb.StringProperty()
    fragtype = ndb.StringProperty()
    cowner = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()

class Location(ndb.Expando):
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()    
   
class Item(ndb.Expando):
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    itype = ndb.StringProperty()
    primertype = ndb.StringProperty() 
    shardtype = ndb.StringProperty()
    fragtype = ndb.StringProperty()
    cowner = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()

class Meta(ndb.Expando):
    metakind = ndb.StringProperty(default='Meta')
    metaid = ndb.IntegerProperty()
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    masterid = ndb.StringProperty()
    xloc = ndb.StringProperty(default='500')
    yloc = ndb.StringProperty(default='500')
    zloc = ndb.StringProperty(default='500')
    lattice = ndb.StringProperty(default='0')
    

class Base(ndb.Expando):
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()

class Social(ndb.Expando):
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()
    
class Packet(ndb.Expando):
    type = ndb.StringProperty()
    content = ndb.StringProperty()