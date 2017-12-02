# This script is used to render ProteinVR scenes on remote computers. See the
# README.md file for more details on usage.

# Example of use:
# /path/to/exec/blender -b myfile.blend -P render_proteinvr_headless.py -t 12

import pdb
import os

# Overwrite the output directory.
output_dir = os.getcwd() + os.sep + "proteinvr_output" + os.sep
os.mkdir(output_dir)
bpy.data.scenes["Scene"].proteinvr_output_dir = output_dir

# Now press the render button
bpy.ops.proteinvr.create_scene()