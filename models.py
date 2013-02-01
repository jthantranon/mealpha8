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
    metakind = ndb.StringProperty(default='Location')
    name = ndb.StringProperty()
    info = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty()
    exits = ndb.StringProperty(default='n,s,e,w')      
    @ndb.ComputedProperty
    def xyz(self):
        if self.xloc:
            return self.xloc+"."+self.yloc+"."+ self.zloc+":"+self.lattice
        else:
            return 'Limbo'
#    @ndb.ComputedProperty
#    def metaid(self):
#        try:
#            return self.key.id()
#        except AttributeError:
#            return 'Zero'
    @ndb.ComputedProperty
    def kid(self):
        if self.metakind:
            return self.metakind+str(self.xloc+self.yloc+self.zloc+self.lattice)
        else:
            return 'No kid(ding).'
   
class Item(ndb.Expando):
    name = ndb.StringProperty()
    info = ndb.TextProperty()
    itype = ndb.StringProperty()
    primertype = ndb.StringProperty() 
    shardtype = ndb.StringProperty()
    fragtype = ndb.StringProperty()
    cowner = ndb.StringProperty()
    cokind = ndb.StringProperty()
    coid = ndb.StringProperty()
    xloc = ndb.StringProperty()
    yloc = ndb.StringProperty()
    zloc = ndb.StringProperty()
    lattice = ndb.StringProperty(default=0)
    databits = ndb.IntegerProperty(default=0)
    suptype = ndb.StringProperty()
    regtype = ndb.StringProperty()
    subtype = ndb.StringProperty()
    ispopup = ndb.BooleanProperty(default=False)
    @ndb.ComputedProperty
    def xyz(self):
        if self.xloc:
            return self.xloc+"."+self.yloc+"."+ self.zloc+":"+self.lattice
        elif self.cowner:
            return self.cowner
        else:
            return 'Limbo'
    @ndb.ComputedProperty
    def kid(self):
        try:
            return self.metakind+str(self.metaid)
        except AttributeError:
            return 'No kid(ding).'

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
    databits = ndb.IntegerProperty(default=0)
    @ndb.ComputedProperty
    def xyz(self):
        if self.xloc:
            return self.xloc+"."+self.yloc+"."+ self.zloc+":"+self.lattice
        else:
            return 'Limbo'
    @ndb.ComputedProperty
    def xyzraw(self): #need to deprecate, use coid instead
        if self.xloc:
            return self.xloc+self.yloc+ self.zloc+self.lattice
        else:
            return 'Limbo'
    @ndb.ComputedProperty
    def kid(self):
        if self.metakind:
            return self.metakind+str(self.metaid)
        else:
            return 'No kid(ding).'
    @ndb.ComputedProperty
    def coid(self): #duplicate of xyzraw
        if self.xloc:
            return self.xloc+self.yloc+ self.zloc+self.lattice
        else:
            return 'Limbo'
    

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