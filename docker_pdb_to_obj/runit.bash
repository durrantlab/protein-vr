# Makes and processes the files, save a blend file

cd /image_tmp/

# If the first parameter exists in the mounted directory, use that.
if [ -f /mounted/${1} ]; then
    cp /mounted/${1} ./
fi

# First, get the obj files
vmd ${*} -e save_objs.tcl

# Now process those files with blender
/image_bins/blender-2.78c-linux-glibc219-x86_64/blender -b -P save_objs.py

# move blend file to mounted directory
mv /image_tmp/molecules.blend /mounted/