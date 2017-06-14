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

# Do some additional image manipulation with PIL. Has to be here because PIL
# isn't installed in Blender's Python 3

# Now save low-res versions if necessary
# save low-res versions of the maps too.
imgs = glob.glob(output_dir + "*.png")
imgs = [i for i in imgs if not i.endswith(".512px.png") and not i.endswith(".256px.png")]

for img in imgs:
    file_name_512 = img + ".512px.png"
    file_name_256 = img + ".256px.png"

    if os.path.exists(file_name_512) and os.path.exists(file_name_256):
        continue

    img_obj = Image.open(img)
    width, height = img_obj.size

    if width > 512 and not os.path.exists(file_name_512):
        size = 512, 512
        img_obj.thumbnail(size, Image.ANTIALIAS)
        img_obj.save(file_name_512, "PNG")
    else:
        os.system("cp " + img + " " + file_name_512)
    
    if width > 256 and not os.path.exists(file_name_256):
        size = 256, 256
        img_obj.thumbnail(size, Image.ANTIALIAS)
        img_obj.save(file_name_256, "PNG")
    else:
        os.system("cp " + img + " " + file_name_256)

# Now blur shadows and save as black and white
resp = raw_input("Blur shadows and save as black and white png? (y/N) ")
if resp.upper() == "Y":
    for filename in glob.glob(output_dir + "*shadow*png"):
        img = Image.open(filename)
        blurred_img = img.filter(ImageFilter.GaussianBlur(radius=5))
        gray_img = blurred_img.convert('L')
        gray_img.save(filename)

