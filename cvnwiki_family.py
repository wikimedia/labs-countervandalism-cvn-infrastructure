import config
import family


class Family(family.Family):
    def __init__(self):
        family.Family.__init__(self)
        self.name = 'cvnwiki'

        self.langs = {
            'en': 'www.countervandalism.net',
        }

        self.namespaces[4]['en'] = u'Counter-Vandalism Wiki'
        self.namespaces[5]['en'] = u'Counter-Vandalism Wiki talk'

        self.content_id = "bodyContent"

    def protocol(self, code):
        return 'http'

    def scriptpath(self, code):
        return '/w'

    def apipath(self, code):
        return '%s/api.php' % self.scriptpath(code)

    def version(self, code):
        return '1.17alpha'

    def code2encoding(self, code):
        return 'utf-8'
