import os
from PIL import Image
import glob
from PIL import ImageFilter
import sys

# First, run things through blender
script_dir = os.path.abspath(os.path.dirname(__file__))
os.system(
    "/Applications/blender-2.78-OSX_10.6-x86_64/blender.app/Contents/MacOS/blender -b " + 
    sys.argv[1] + " -P " + 
    script_dir + "/make_babylon_scene.py"
)

# Now blur shadows and save as black and white
resp = raw_input("Blur shadows and save as black and white jpg? (Y/n) ")
if resp.upper() == "Y" or resp == "":
    for filename in glob.glob("proteinvr_scene_prepped/*shadow.jpg"):
        img = Image.open(filename)
        blurred_img = img.filter(ImageFilter.GaussianBlur(radius=5))
        gray_img = blurred_img.convert('L')
        gray_img.save(filename)