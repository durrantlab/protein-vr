import os
from PIL import Image
import glob
from PIL import ImageFilter
import sys
import GetParams

params = GetParams.get_params()

# Use like this:
# python compile-scene.py file.blend ./output-dir/

# First, run things through blender
script_dir = os.path.abspath(os.path.dirname(__file__))
blend_file = os.path.abspath(sys.argv[1])
torun = (params["blender_exec"] + " -b " + 
    blend_file + " -P " + 
    script_dir + "/make_babylon_scene.py")

# It there's an output directory, use that
output_dir = "proteinvr_scene_prepped/"
if len(sys.argv) > 2:
    output_dir = sys.argv[2] + (os.sep if sys.argv[2][-1:] != os.sep else "")
torun = torun + " -- " + output_dir


print "\n" + torun + "\n"

os.system(torun)

# Now blur shadows and save as black and white
resp = raw_input("Blur shadows and save as black and white png? (y/N) ")
if resp.upper() == "Y":
    for filename in glob.glob(output_dir + "*shadow.png"):
        img = Image.open(filename)
        blurred_img = img.filter(ImageFilter.GaussianBlur(radius=5))
        gray_img = blurred_img.convert('L')
        gray_img.save(filename)