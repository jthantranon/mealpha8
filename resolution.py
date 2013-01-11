import webapp2
import intops as ops
import json

from google.appengine.api import users

class Resolution(webapp2.RequestHandler):
    def get(self):
        if users.get_current_user():
            self.redirect('/main')
        else:
            self.redirect(users.create_login_url("/"))

class HasMeta(webapp2.RequestHandler):
    def get(self):
        cmeta = ops.loadmeta()
        if cmeta:
            self.response.out.write(json.dumps(cmeta.to_dict()))
        else:
            self.response.out.write(json.dumps('false'))
            
class Logout(webapp2.RequestHandler):
    def get(self):
        #self.response.out.write('test')
        self.redirect(users.create_logout_url('/'))

app = webapp2.WSGIApplication([('/', Resolution),
                               ('/logout', Logout),
                               ('/resolution/hasmeta', HasMeta),
                               ],
                              debug=True) 