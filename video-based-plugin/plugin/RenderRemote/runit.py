import bpy
import os
import glob

# See https://blender.stackexchange.com/questions/6817/how-to-pass-command-line-arguments-to-a-blender-python-script
# argv = sys.argv
# argv = argv[argv.index("--") + 1:]  # get all args after "--"

os.mkdir("./output/")
bpy.context.scene.proteinvr_output_dir = os.path.abspath("./output/") + os.sep

# Make it so pngquant_path path doesn't exist. You'll do it separately...
bpy.context.scene.pngquant_path = "" # "/usr/bin/pngquant"

# Make it so mobile won't be rendered. You'll do it separately...
mobile_res = bpy.context.scene.proteinvr_mobile_bake_texture_size
bpy.context.scene.proteinvr_mobile_bake_texture_size = 0

# Render the full-images
bpy.ops.proteinvr.create_scene()

# Now make the mobile versions.
open("runit.sh", 'w').write("\n".join([
    "echo Creating mobile version of " + png_filename + "; /usr/bin/convert " + png_filename + " -resize " + str(mobile_res) + "x" + str(mobile_res) + " " + png_filename + ".small.png" 
    for png_filename in glob.glob("./output/frames/*.png")
]))
os.system("cat runit.sh | /usr/bin/parallel")

# Now compress everything
open("runit.sh", 'w').write("\n".join([
    "echo Compressing " + png_filename + '; /usr/bin/pngquant --speed 1 --quality="0-50" ' + png_filename + ' -o ' + png_filename + ".tmp.png; mv " + png_filename + ".tmp.png " + png_filename
    for png_filename in glob.glob("./output/frames/*.png")
]))
os.system("cat runit.sh | /usr/bin/parallel")

# Kill all blenders
os.system("pkill -9 blender")