import sys

filename = sys.argv[1]

txt = open(filename, 'r').read()

txt = txt.replace("\\n", " ")

while "  " in txt:
    txt = txt.replace("  ", " ")

print txt
