# This that need to be performed regardless of which rendering script is
# chosen.

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

  
for {set i 0} {$i < [molinfo num]} {incr i} {
    molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
}

# Turn axes off
axes location off
