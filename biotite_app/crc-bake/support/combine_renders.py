import os
import glob
from PIL import Image
import numpy
from Parallelizer import Parallelizer
import random

parallelizer = Parallelizer("multiprocessing", -1)

# Make an output directory if it doesn't exist.
if not os.path.exists("output_imgs"):
    os.mkdir("output_imgs")

# Get a list of acceptable PNG files
all_png_files = []
size_cutoff_frac = 0.9
for dirnm in glob.glob("*.img_dir"):
    if dirnm == "output_imgs": continue

    # Get the png files in the corresponding directory.
    png_files = glob.glob(dirnm + os.sep + "*.png")
    if len(png_files) == 0: continue

    # Get their file sizes
    file_sizes = [os.stat(f).st_size for f in png_files]
    max_file_size = max(file_sizes)
    largest_png_file = png_files[numpy.argmax(file_sizes)]

    # Only keep the png_files that are > 90% of the max, and also that don't
    # have an associated .1.npy file. This is to remove partial png files.
    size_cutoff = size_cutoff_frac * max_file_size
    all_png_files.extend([
        [p]
        for p, s in zip(png_files, file_sizes)
        if s > size_cutoff and not os.path.exists(p + ".1.npy")
    ])

    # Delete the others...
    for flsz, png_file in zip(file_sizes, png_files):
        if flsz <= size_cutoff:
            print("    Deleting " + png_file + ". It is much smaller than " +
                  largest_png_file + ". (" + str(flsz) +
                  " vs " + str(max_file_size) + ")")
            os.unlink(png_file)


# Now convert all those to numpy arrays, and save to disk. Delete original png
# files.
def png_to_numpy(filename):
    npy_filename = filename + ".1.npy"
    # if not os.path.exists(npy_filename):
    print("Processing " + filename + "...")
    if not os.path.exists(filename):
        return

    pic = Image.open(filename)
    try:
        # Alpha included?
        pix = numpy.array(pic.getdata()).reshape(pic.size[0], pic.size[1], 4)
        pix = pix[:,:,:3]
    except:
        # Alpha not included.
        pix = numpy.array(pic.getdata()).reshape(pic.size[0], pic.size[1], 3)

    numpy.save(npy_filename, pix)

    # No need to delete the source png file.
    if os.path.exists(filename):
        os.unlink(filename)

random.shuffle(all_png_files)  # So if run twice, will start at different place.
parallelizer.run(all_png_files, png_to_numpy, -1, "multiprocessing")

# Now average the images and save the average, for each directory.
def avg_img_in_single_dir(dirnm):
    print("Averaging images in " + dirnm + os.sep + "...")
    img_data = None
    png_npy_files = glob.glob(dirnm + os.sep + "*.npy")[:50]  # Do it in batches of 50 to prevent memory problems.

    if len(png_npy_files) == 1: return

    weights = [int(f.split(".")[-2]) for f in png_npy_files]
    sum_weights = 0
    for i, npy_filename in enumerate(png_npy_files):
        print("    Processing " + npy_filename + "...")
        weight = weights[i]

        try:
            pix = numpy.load(npy_filename)
        except:
            print("        " + npy_filename + " is invalid. Deleting...")
            os.unlink(npy_filename)
            continue

        if img_data is None:
            img_data = weight * pix
        else:
            img_data = img_data + weight * pix
        sum_weights = sum_weights + weight
    img_data = img_data / float(sum_weights)  # float(len(png_npy_files))

    # Save the new (joined) numpy file.
    numpy.save(
        dirnm + os.sep +
        str(random.randint(0, 10000000)) + ".png." +
        str(sum_weights) + ".npy",
        img_data
    )

    # Now delete the source npy files.
    for f in png_npy_files:
        if os.path.exists(f):
            os.unlink(f)

npy_files = glob.glob("*.img_dir/*.npy")
num_img_dir = len(glob.glob("*.img_dir"))
last_npy_files_count = -1

# while len(npy_files) != num_img_dir and len(npy_files) != last_npy_files_count:

while len(npy_files) != last_npy_files_count:
    print(str(len(npy_files)) + " != " + str(last_npy_files_count))
    parallelizer.run(
        [[d] for d in glob.glob("*.img_dir")],
        avg_img_in_single_dir, -1, "multiprocessing"
    )
    last_npy_files_count = len(npy_files)
    npy_files = glob.glob("*.img_dir/*.npy")

def save_avg_img(dirnm):
    print("Saving averaged images from " + dirnm + os.sep + "...")

    img_data = numpy.load(glob.glob(dirnm + os.sep + "*.npy")[0])

    # Make a new picture
    new_pic = Image.fromarray(numpy.uint8(img_data))

    # Save that picture
    quality = 100  # Needs to be high or you notice artifact. Still better than png.
    # new_pic.save("output_imgs" + os.sep + dirnm[:-8] + ".png")
    new_pic.save(
        "output_imgs" + os.sep + dirnm[:-8] + ".jpg", "JPEG",
        quality=quality, optimize=True, progressive=True
    )

    # Save lower-res versions too.
    sz = new_pic.size[0]
    while sz > 512:
        sz = sz / 2
        resized_pic = new_pic.resize((int(sz), int(sz)), Image.ANTIALIAS)
        # resized_pic.save("output_imgs" + os.sep + dirnm[:-8] + "." + str(sz) + ".png")
        resized_pic.save(
            "output_imgs" + os.sep + dirnm[:-8] + "." + str(sz) + ".jpg", "JPEG",
            quality=quality, optimize=True, progressive=True
        )

parallelizer.run(
    [[d] for d in glob.glob("*.img_dir")],
    save_avg_img, -1, "multiprocessing"
)
