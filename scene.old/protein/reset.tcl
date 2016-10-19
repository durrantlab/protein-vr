
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

#### SAVE THIS AS NEW BLEND RIGHT AWAY!!! ####
#### VRML 2.0 each chain separately ####
#### STL imports everything as one, but no colors. ####
