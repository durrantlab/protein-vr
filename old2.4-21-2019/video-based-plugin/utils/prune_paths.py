# This function reprocesses a data.json file to use fewer images. It's really
# better to just render it from the ProteinVR plugin properly in the first
# place, as this might be buggy.

import json
import sys

json_filename = sys.argv[1]

data = json.load(open(json_filename, 'r'))
print(data.keys())

class Point():
    def __init__(self):
        self.position = None
        self.material = ""  # filename
        self.mesh = ""  # filename
        self.neighbors = []
        self.index = -1
    
    def distanceTo(self, other_pt):


# Get the points data
points = []
for i, points_data in enumerate(data["spheres"]):
    pt = Point()
    pt.position = points_data["position"]
    pt.material = points_data["material"]
    pt.mesh = points_data["mesh"]
    pt.index = i
    points.append(pt)

# Add in the nextMoves. 
# I think I might be assuming firstFrameIndex is 0 here?
for next_moves in data["nextMoves"]:
    next_moves_int = int(next_moves)
    points[next_moves_int].neighbors = data["nextMoves"][next_moves]

# Go through and find ones that are too close to their neighbors Merge those
# points with next nearest one. That means deleting it and switching all the
# indexes in neighbors lists. I'd recommend not reindexing until the end. Then
# just look through and find all unused indexes, and remove the appropriate
# ones from the sphers list, and then reindex.

# t = SpherePoint()
import pdb; pdb.set_trace()


# print(data.keys()