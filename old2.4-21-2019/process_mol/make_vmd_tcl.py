import glob
import sys
import json
from os.path import exists as fexst
import os

json_file = "./sample.json"
prot_dir = "./00222300226362617837466/proteins/6___from_textblock/"
comp_dir = "./00222300226362617837466/compounds/2___from_smiles/"
out_dir = "./tmp/"
babel_bin = "/usr/local/bin/obabel"

vis_inf = json.load(open(json_file))["visSpecification"]

# Remove proteins that won't be rendered.
if "biotite_logo.pdb" in vis_inf:
    del vis_inf["biotite_logo.pdb"]
for key in [k for k in vis_inf
                if not vis_inf[k]["visible"]
                or (not fexst(prot_dir + k) and not fexst(comp_dir + k))
            ]:
    del vis_inf[key]

# Make the output directory
os.system("rm -rf " + out_dir + "; mkdir " + out_dir)

# Copy the files. Also, keep track of which files belong to proteins vs. ligands.
files = []
protein_files = []
ligand_files = []
for key in vis_inf:
    prots = glob.glob(prot_dir + key)
    ligs = glob.glob(comp_dir + key)
    protein_files.extend([os.path.basename(p) for p in prots])
    ligand_files.extend([os.path.basename(l) for l in ligs])
    files.extend(prots + ligs)
os.system("cp " + " ".join(files) + " " + out_dir)

# Convert sdf files to pdb
for sdf_file in glob.glob(out_dir + "*.sdf"):
    os.system(babel_bin + " -isdf " + sdf_file + " -opdb -O " + sdf_file + ".pdb; rm " + sdf_file)
ligand_files = [l + (".pdb" if l.endswith(".sdf") else "") for l in ligand_files]

# Change keys in vis_inf
for key in vis_inf.keys()[:]:
    if key.endswith(".sdf"):
        vis_inf[key + ".pdb"] = vis_inf[key]
        del vis_inf[key]

# Make the tcl file now
tcl = """
    # Remove all translation and rotation

    ##
    ## Set transformation matrices to identity so that exported
    ## geometry is written in the original model coordinates rather
    ## than world or eye coordinates.
    ## Code provided by John Stone, personal communication.
    set identityvpts {
        {{1.000000 0.000000 0.000000 0.000000}
            {0.000000 1.000000 0.000000 0.000000}
            {0.000000 0.000000 1.000000 0.000000}
            {0.000000 0.000000 0.000000 1.000000}}
        {{1.000000 0.000000 0.000000 0.000000}
            {0.000000 1.000000 0.000000 0.000000}
            {0.000000 0.000000 1.000000 0.000000}
            {0.000000 0.000000 0.000000 1.000000}}
        {{1.000000 0.000000 0.000000 0.000000}
            {0.000000 1.000000 0.000000 0.000000}
            {0.000000 0.000000 1.000000 0.000000}
            {0.000000 0.000000 0.000000 1.000000}}
        {{1.000000 0.000000 0.000000 0.000000}
            {0.000000 1.000000 0.000000 0.000000}
            {0.000000 0.000000 1.000000 0.000000}
            {0.000000 0.000000 0.000000 1.000000}}
    }

    # Carbons should be grey
    color change rgb 10 0.6 0.6 0.6

    # No axes.
    axes location off
"""

reset_camera = """
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }
"""

for key in vis_inf:
    model_type = "PROTEIN" if key in protein_files else "COMPOUND"

    # Load the pdb file
    tcl += "mol new " + out_dir + key + " type pdb first 0 last -1 step 1 filebonds 1 autobonds 1 waitfor all" + "\n"
    tcl += "mol delrep 0 top" + "\n"

    representations = []

    if vis_inf[key]["proteinSurroundingSticks"]:
        representations.append(["proteinSurroundingSticks", """
            mol representation Licorice 0.300000 30.000000 30.000000
            mol color Name
        """,
        "protein and (same residue as (all within 5 of (not protein)))"])

    if vis_inf[key]["proteinRibbon"]:
        representations.append(["proteinRibbon", """
            mol representation NewCartoon 0.300000 10.000000 4.100000 0
            mol color Name
        """,
        "protein"])

    if vis_inf[key]["proteinSurface"]:
        representations.append(["proteinSurface", """
            mol representation QuickSurf 0.700000 0.500000 0.500000 1.000000
            mol color Name
        """,
        "protein"])

    if vis_inf[key]["proteinLines"]:
        representations.append(["proteinLines", """
            mol representation Licorice 0.100000 30.000000 30.000000
            mol color Name
        """,
        "protein"])

    if vis_inf[key]["proteinSticks"]:
        representations.append(["proteinSticks", """
            mol representation Licorice 0.300000 30.000000 30.000000
            mol color Name
        """,
        "protein"])

    if model_type == "PROTEIN":
        if vis_inf[key]["compoundSurface"]:
            representations.append(["compoundSurface", """
                mol representation QuickSurf 0.700000 0.500000 0.500000 1.000000
                mol color Name
            """,
            "not protein and not water"])

        if vis_inf[key]["compoundLines"]:
            representations.append(["compoundLines", """
                mol representation Licorice 0.100000 30.000000 30.000000
                mol color Name
            """,
            "not protein and not water"])

        if vis_inf[key]["compoundSticks"]:
            representations.append(["compoundSticks", """
                mol representation Licorice 0.300000 30.000000 30.000000
                mol color Name
            """,
            "not protein and not water"])
    elif model_type == "COMPOUND":
        if vis_inf[key]["compoundSurface"]:
            representations.append(["compoundSurface", """
                mol representation QuickSurf 0.700000 0.500000 0.500000 1.000000
                mol color Name
            """,
            "all"])

        if vis_inf[key]["compoundLines"]:
            representations.append(["compoundLines", """
                mol representation Licorice 0.100000 30.000000 30.000000
                mol color Name
            """,
            "all"])

        if vis_inf[key]["compoundSticks"]:
            representations.append(["compoundSticks", """
                mol representation Licorice 0.300000 30.000000 30.000000
                mol color Name
            """,
            "all"])

    tcl += "\n"

    for name, rep, sel in representations:
        # First, make sure the given selection contains atoms
        tcl += """
            set sel [atomselect top {OB}{sel}{CB}]
            set sel_num [$sel num]
            if {OB}$sel_num > 0{CB} {OB}
                mol delrep 0 top
                # {name}
                {rep}
                mol selection {OB}{sel}{CB}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                {reset_camera}

                render Wavefront "{OBJ_FILENAME}"
            {CB}
        """.format(
            name=name,
            rep=rep,
            sel=sel,
            OB="{",
            CB="}",
            OBJ_FILENAME=out_dir + os.path.basename(key) + "." + name + ".obj",
            reset_camera=reset_camera
        )

    # Delete the file
    tcl += "mol delete top" + "\n"

tcl += "quit"

print tcl

# import pdb; pdb.set_trace()
