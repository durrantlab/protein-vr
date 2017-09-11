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

bpy.ops.proteinvr.create_scene()

os.system("pkill -9 blender")

open("runit.sh", 'w').write("\n".join([
    "echo Creating mobile version of " + png_filename + "; /usr/bin/convert " + png_filename + " -resize " + str(mobile_res) + "x" + str(mobile_res) + " " + png_filename + ".small.png" 
    for png_filename in glob.glob("./output/frames/*.png")
]))

os.system("cat runit.sh | /usr/bin/parallel")
os.system("mkdir /tmp/ttt/; cp -r * /tmp/ttt/")

# for png_filename in glob.glob("./output/*.png"):
#     os.system("echo Creating mobile version of " + png_filename + "; /usr/bin/convert " + png_filename + " -resize " + str(mobile_res) + "x" + str(mobile_res) + " " + png_filename + ".small.png")

# for png_filename in glob.glob("./output/*.png"):
#     print("Creating mobile version of " + png_filename)
#     os.system("/usr/bin/convert " + png_filename + " -resize " + str(mobile_res) + "x" + str(mobile_res) + " " + png_filename + ".small.png")
