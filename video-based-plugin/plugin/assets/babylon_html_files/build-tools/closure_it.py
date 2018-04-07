import httplib, urllib, sys

# Define the parameters for the POST request and encode them in
# a URL-safe format.

js_code = open(sys.argv[1], 'r').read()

params = urllib.urlencode([
    ('js_code', js_code),
    ('compilation_level', 'SIMPLE_OPTIMIZATIONS'), # 'ADVANCED_OPTIMIZATIONS'), #'WHITESPACE_ONLY'),
    #('compilation_level', 'ADVANCED_OPTIMIZATIONS'),
    ('output_format', 'text'),
    ('output_info', 'compiled_code'),
    ('externs_url', 'https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/jquery-1.9.js'),
    ('externs_url', 'https://raw.githubusercontent.com/tarruda/closure-externs/master/twitter-bootstrap-2.1.1-externs.js'),
    #('externs_url', 'https://durrantlab.bio.pitt.edu/tmp/externs.js'),
    # ('externs_url', 'https://durrantlab.bio.pitt.edu/tmp/babylon.extern.js'),
    #('formatting', 'pretty_print')
])

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPSConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()
print data
conn.close()
