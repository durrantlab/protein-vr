# This script is used to render ProteinVR scenes on remote computers. See the
# README.md file for more details on usage. It runs under Unix only.

# Example of use:
# /path/to/exec/blender -b myfile.blend -P render_proteinvr_headless.py -t 12

import bpy
import os

# Overwrite the output directory.
output_dir = os.getcwd() + os.sep + "proteinvr_output" + os.sep
# if os.path.exists(output_dir):
    # os.system("rm -r " + output_dir)
if not os.path.exists(output_dir):
    os.mkdir(output_dir)


if len(bpy.data.scenes) != 1:
    print("More than one scene!")
    sdfsdf

# bpy.data.scenes["Scene"].proteinvr_output_dir = output_dir
bpy.data.scenes[0].proteinvr_output_dir = output_dir

# Make sure Use existing frames not clicked
bpy.data.scenes[0].proteinvr_use_existing_frames = False

# Now press the render button
bpy.ops.proteinvr.create_scene()

