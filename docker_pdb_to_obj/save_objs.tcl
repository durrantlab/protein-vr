# Remove all translation and rotation

  ##
  ## Set transformation matrices to identity so that exported geometry
  ## is written in the original model coordinates rather than world or
  ## eye coordinates.
  ##
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
  molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts

# Go through each of the chains and save it separately.
set all [atomselect top all]
set chains [$all get chain]
set uniq_chains [lsort -unique $chains]

# Carbons should be grey
color change rgb 10 0.6 0.6 0.6

# Turn axes off
axes location off

foreach chain $uniq_chains {
  # Deal with non-protein
  mol delrep 0 top
  mol selection "(chain $chain) and (not protein and not water) and not ((not element N C O P S Se Cl Br F) and mass > 16) and (not resname MSE)"
  mol representation Licorice 0.300000 20.000000 20.000000
  mol addrep top
  render Wavefront "/image_tmp/ligand_${chain}.obj"

  # Deal with heavy atoms
  mol delrep 0 top
  mol selection "(not element N C O P S Se Cl Br F) and (mass > 16) and (not resname MSE)"
  mol representation VDW 1.000000 12.000000
  mol addrep top
  render Wavefront "/image_tmp/ligand_${chain}_heavy_metals.obj"

  # deal with protein (ribbon)
  mol delrep 0 top
  mol selection "chain $chain and (protein or resname MSE)"
  mol representation NewCartoon 0.300000 10.000000 4.100000 0
  mol addrep top 
  render Wavefront "/image_tmp/protein_ribbon_${chain}.obj"

  # Deal with protein (surface)
  mol delrep 0 top
  mol selection "chain $chain and (protein or resname MSE)"
  mol representation MSMS 1.500000 1.500000 0.000000 0.000000
  mol addrep top
  render Wavefront "/image_tmp/protein_msms_${chain}.obj"
}

quit