# This scene accepts a proteinvr directory as input. It optimizes the textures
# to improve performance. Only works if there's a optimize.json config file in
# the proteinvr directory.

import os
import sys
import json
import glob
import PIL
from PIL import Image
import Multiprocess as mp

def remove_double_slash(dirname):
    while "//" in dirname:
        dirname = dirname.replace("//", "/")
    return dirname

proteinvr_dir = remove_double_slash(sys.argv[1] + os.sep)

# First make sure you're in a proteinvr directory.
frames_dir = remove_double_slash(proteinvr_dir + "frames" + os.sep)
if not os.path.exists(frames_dir):
    print(frames_dir + " doesn't exist! Have you already rendered the scene?")
    sys.exit(0)

# Establish the default parameters.
config = {
    "desktop_resolution": 4096,  # 2048 too low res on my macbook
    "mobile_resolution": 1024,
    # "pngquant_exec": "/usr/local/bin/pngquant",  # Jacob's mac
    "pngquant_exec": "/ihome/jdurrant/durrantj/programs/pngquant/pngquant",  # crc resources
    "mobile_quality": -1,  # Even 90 reduces file size substantially.
    "desktop_quality": -1
}

# Load the config json.
config_file = remove_double_slash(proteinvr_dir + "optimize.json")
if not os.path.exists(config_file):
    print(config_file + " doesn't exist! Created the file with default values.")
    json.dump(config, open(config_file, 'w'))

# Make a copy of the original files if they don't already exist
orig_frames_dir = frames_dir + "orig" + os.sep
if not os.path.exists(orig_frames_dir):
    os.mkdir(orig_frames_dir)
    os.system("cp " + frames_dir + "*.png " + orig_frames_dir)

# Resize the images
def resize_img(png_file):
    if ".small.png" in png_file:
        reso = config["mobile_resolution"]
    else:
        reso = config["desktop_resolution"]

    output_png_file = os.path.dirname(png_file) + os.sep + ".." + os.sep + os.path.basename(png_file)
    
    img = Image.open(png_file)
    width, height = img.size

    if width <= reso:
        print("Will not resize image " + png_file + ". Existing reso (" + str(width) + " <= " + str(reso) + ")")
        os.system("cp " + png_file + " " + output_png_file)
    else:
        img = img.resize((reso, reso), PIL.Image.ANTIALIAS)

        print("Saving " + output_png_file)
        img.save(output_png_file)

    return png_file
tmp = mp.MultiThreading(glob.glob(orig_frames_dir + "*.png"), -1, resize_img)

# Compress the png files.
def compress_png(png_file):
    if ".small.png" in png_file:
        quality = config["mobile_quality"]
    else:
        quality = config["desktop_quality"]
    
    if quality < 0:
        return

    print("Compressing " + png_file)
    os.system(config["pngquant_exec"] + ' --speed 1 --strip --quality="0-' + str(quality) + '" ' + png_file + " -f -o " + png_file + ".tmp")
    os.system("mv " + png_file + ".tmp " + png_file)
tmp = mp.MultiThreading(glob.glob(frames_dir + "*.png"), -1, compress_png)

# Update the data.json with the file sizes
data_json = json.load(open(proteinvr_dir + "data.json", 'r'))
png_file_sizes = {os.path.basename(flnm): int(os.path.getsize(flnm) / 1000.0) for flnm in glob.glob(frames_dir + "*.png")}
data_json["pngFileSizes"] = png_file_sizes
json.dump(data_json, open(proteinvr_dir + "data.json", 'w'))


