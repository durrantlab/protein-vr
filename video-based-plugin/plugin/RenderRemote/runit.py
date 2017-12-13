# ProteinVR is a Blender addon for making educational VR movies.
# Copyright (C) 2017  Jacob D. Durrant
#
# This program is free software: you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option)
# any later version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along with
# this program.  If not, see <http://www.gnu.org/licenses/>.

DEPRECIATED

import bpy
import os
import glob

# See https://blender.stackexchange.com/questions/6817/how-to-pass-command-line-arguments-to-a-blender-python-script
# argv = sys.argv
# argv = argv[argv.index("--") + 1:]  # get all args after "--"

os.mkdir("./output/")
bpy.context.scene.proteinvr_output_dir = os.path.abspath("./output/") + os.sep

# Make it so proteinvr_pngquant_path path doesn't exist. You'll do it separately...
# bpy.context.scene.proteinvr_pngquant_path = "" # "/usr/bin/pngquant"

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

# Copy those (original versions)
os.system("mkdir ./output/frames/orig/")
os.system("cp ./output/frames/*png ./output/frames/orig/")

# Now compress everything
# open("runit.sh", 'w').write("\n".join([
#     "echo Compressing " + png_filename + '; /usr/bin/pngquant --speed 1 --quality="0-50" ' + png_filename + ' -o ' + png_filename + ".tmp.png; mv " + png_filename + ".tmp.png " + png_filename
#     for png_filename in glob.glob("./output/frames/*.png")
# ]))
# os.system("cat runit.sh | /usr/bin/parallel")

# Save helper sh files
open("./output/frames/orig/make_mobile_images.sh", 'w').write("""
export mobile_size=1024
rm *.small.png
ls *png | grep -v "small.png" | awk '{print "echo " $1 ";convert " $1 " -resize MOODOGxMOODOG ./" $1 ".small.png"}' | sed "s/MOODOG/${mobile_size}/g" | parallel --no-notice
cp *.small.png ../
""".strip())

# open("./output/frames/orig/compress_images.sh", "w").write("""
# export desktop_quality=75
# export mobile_quality=100
# ls *png | grep -v ".small.png" | awk '{print "echo " $1 "; pngquant --speed 1 --strip --quality=\"0-MOOSEDOG\" " $1 " -f -o ../" $1}' | sed "s/MOOSEDOG/${desktop_quality}/g" | parallel --no-notice
# ls *png | grep ".small.png" | awk '{print "echo " $1 "; pngquant --speed 1 --strip --quality=\"0-MOOSEDOG\" " $1 " -f -o ../" $1}' | sed "s/MOOSEDOG/${mobile_quality}/g" | parallel --no-notice
# """.strip())

os.system("chmod a+rwx ./output/frames/orig/*.sh")

# Kill all blenders
os.system("pkill -9 blender")
