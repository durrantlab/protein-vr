# This needs to be compatible with both python 3 and python 2

import os
import json
import sys

def get_params():
    file_path = os.path.realpath(os.path.dirname(__file__)) + os.sep
    if os.path.exists("params.json"):
        params = json.load(open("params.json"))
    else:
        params = json.load(open(file_path + "params.json"))

    # Max vertices per object must not exceed 65533. It's a babylonjs
    # requirement. Otherwise, babylonjs will divide the mess, which tends to
    # mess things up with decimation.
    params["max_obj_verts_allowed"] = 60000

    # Add in the output directory
    argv = sys.argv
    if "--" in argv:
        # Being called from within blender
        argv = argv[argv.index("--") + 1:]  # get all args after "--"
        params["output_dir"] = argv[0]
    else:
        # Being called from compile_scene.py
        params["output_dir"] = argv[2]

    return params

