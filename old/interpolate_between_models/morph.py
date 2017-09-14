# This script takes two models generated from https://swissmodel.expasy.org/ and interpolates between them.

import sys
import scoria
import os
import subprocess


pdb_file1 = sys.argv[1]
pdb_file2 = sys.argv[2]


pdb1 = scoria.Molecule(pdb_file1)
pdb2 = scoria.Molecule(pdb_file2)

def get_seq(pdb_mol):
    three_letters_to_one = {
        "ALA": "A",
        "ARG": "R",
        "ASN": "N",
        "ASP": "D",
        "ASX": "B",
        "CYS": "C",
        "GLU": "E",
        "GLN": "Q",
        "GLX": "Z",
        "GLY": "G",
        "HIS": "H",
        "ILE": "I",
        "LEU": "L",
        "LYS": "K",
        "MET": "M",
        "PHE": "F",
        "PRO": "P",
        "SER": "S",
        "THR": "T",
        "TRP": "W",
        "TYR": "Y",
        "VAL": "V"
    }

    uniq_in_row = []
    last_key = ""

    # Get the uniq keys
    atom_infs = pdb_mol.get_atom_information()
    for inf in atom_infs:
        key = inf["resname"] + "_" + str(inf["resseq"]) + "_" + inf["chainid"]
        if key != last_key:
            uniq_in_row.append(key)
        last_key = key
    
    # Remove extra info
    uniq_in_row = [l.split("_")[0] for l in uniq_in_row]

    # Now get one letter code
    single_letter = "".join([three_letters_to_one[l] for l in uniq_in_row])

    fasta = ">stuff\n"

    while len(single_letter) > 60:
        fasta = fasta + single_letter[:60] + "\n"
        single_letter = single_letter[60:]
    fasta = fasta + single_letter + "\n"

    return fasta

# Get the sequences
seq1 = get_seq(pdb1)
seq2 = get_seq(pdb2)

# Save to the disk
open("seq1.fasta", 'w').write(seq1)
open("seq2.fasta", 'w').write(seq2)

# Align them.
proc = subprocess.Popen("perl emboss_stretcher_lwp.pl --asequence seq1.fasta --bsequence seq2.fasta --email jacobdurrant@gmail.com --outfile -", stdout=subprocess.PIPE, shell=True)
(out, err) = proc.communicate()

out = out.split("\n")

# Get the two aligned sequences
i = 0
seq1_all = ""
seq2_all = ""
while i < len(out):
    if out[i].startswith("#---------------------------------------"):
        break

    if out[i].startswith(" stuff "):
        seq1 = out[i]
        # ln2 = out[i+1]
        seq2 = out[i+2]

        seq1 = seq1[len(" stuff "):]
        seq2 = seq2[len(" stuff "):]

        # Make gaps match (delete residues that don't have matches)
        seq1_all = seq1_all + seq1
        seq2_all = seq2_all + seq2

        i = i + 2
    i = i + 1

# Delete resiudes that don't have matches
seq1_all_same_gaps = ""
seq2_all_same_gaps = ""

for r1, r2 in zip(seq1_all, seq2_all):
    if r1 == "-" or r2 == "-":
        seq1_all_same_gaps = seq1_all_same_gaps + "-"
        seq2_all_same_gaps = seq2_all_same_gaps + "-"
    else:
        seq1_all_same_gaps = seq1_all_same_gaps + r1
        seq2_all_same_gaps = seq2_all_same_gaps + r2

# Split on the gaps
def split_on_gaps(seq):
    while "--" in seq:
        seq = seq.replace("--", "-")
    seq = seq.strip("-")
    return seq.split("-")

segs1 = split_on_gaps(seq1_all_same_gaps)
segs2 = split_on_gaps(seq2_all_same_gaps)

# Now, figure out which amino acids belong to which on original protein.
# Discard the ones that aren't common to both.
# Align both by alpha carbons.
# Morph between two
# Save to PDB
