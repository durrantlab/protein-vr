# Makes and processes the files, save a blend file

cd /image_tmp/

# If the first parameter exists in the mounted directory, use that.
if [ -f /mounted/${1} ]; then
    cp /mounted/${1} ./
    cp /mounted/*.pdb ./
fi

# First, get the obj files
echo "FACE" ${*}
if [[ ${1} == *.vmd ]]; then
    # It's a tcl file
    cat ${1} save_vmd_objs.tcl > all.tcl  # user-defined tcl file, plus render one concatenated
    echo "Running vmd -e all.tcl"
    vmd -e all.tcl
elif [[ ${1} == *.tcl ]]; then
    # It's a tcl file
    cat ${1} save_vmd_objs.tcl > all.tcl  # user-defined tcl file, plus render one concatenated
    echo "Running vmd -e all.tcl"
    vmd -e all.tcl
else
    # A pdb file
    vmd -m ${1} -e save_pdb_objs.tcl
fi


# Now process those files with blender
/image_bins/blender-2.78c-linux-glibc219-x86_64/blender -b -P save_objs.py

# move blend file to mounted directory
mv /image_tmp/molecules.blend /mounted/
mv /image_tmp/*-tex.png /mounted/

if [[ ${2} == "bash" ]]; then
    # Running in interactive mode
    bash
fi