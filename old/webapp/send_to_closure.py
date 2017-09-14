import httplib, urllib, sys
import glob

# Define the parameters for the POST request and encode them in
# a URL-safe format.

params = urllib.urlencode([
    ('js_code', open(sys.argv[1]).read()), # <--- This parameter has a new name!
    ('compilation_level', ['WHITESPACE_ONLY', 'SIMPLE_OPTIMIZATIONS', 'ADVANCED_OPTIMIZATIONS'][2]),
    ('output_format', 'text'),
    ('output_info', ['compiled_code', 'errors'][0]),
    ('js_externs', "\n".join([open(f).read() for f in glob.glob('./js/closure-externs/*')])),
    ('formatting', 'pretty_print')
  ])

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()
print data
conn.close()
