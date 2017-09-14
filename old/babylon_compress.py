import pprint
import json
import sys

json_file = sys.argv[1]
data = json.load(open(json_file,'r'))

def spider(data):
    for k in data.keys():
        if k in ["MorphTargetManager"]:
            data[k] = {}
            continue
        
        if k in ["normals"]: #, "colors"]:
            data[k] = []
            continue

        v = data[k]
        if type(v) is dict:
            spider(v)
        if type(v) is list:
            if len(v) > 0:
                if type(v[0]) is float:
                    for i in range(len(v)):
                        #v[i] = 0.01 * int(v[i] * 100)
                        # if k == "normals":
                        #     v[i] = int(round(v[i], 0))  # keep 
                        # else:
                        v[i] = v[i] #round(v[i], 4) #0.01 * int(v[i] * 100)

                if type(v[0]) is dict:
                    for vv in v:
                        spider(vv)

spider(data)

data_str = json.dumps(data, separators=(',', ':'))
print data_str
#open("test",'w').write(data_str)

# pp = pprint.PrettyPrinter(indent=4)
# pp.pprint(data)

#import pdb; pdb.set_trace()
