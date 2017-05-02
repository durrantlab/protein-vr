# This python file wraps around the docker executable

import sys
import os

# If the first argument is a file, change into that directory. (It could also
# be a PDB ID for download)
vmd_param = sys.argv[1]
if os.path.exists(vmd_param):
    adir = os.path.dirname(vmd_param)
    if adir == "":
        adir = "./"
    os.chdir(adir)
    vmd_param = os.path.basename(vmd_param)

# Run the docker file, mounting the present directory and passing the
# parameter
host_dir = os.path.abspath(os.getcwd())

interactive = False

if interactive:
    os.system("docker run --rm -it -v " + host_dir + ":/mounted/ durrantlab_pdb_to_obj " + vmd_param + " bash")
else:
    os.system("docker run --rm -v " + host_dir + ":/mounted/ durrantlab_pdb_to_obj " + vmd_param)
