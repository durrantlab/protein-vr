
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
mol new ./tmp/SMILES_C1CCCC1.sdf.pdb type pdb first 0 last -1 step 1 filebonds 1 autobonds 1 waitfor all
mol delrep 0 top


            set sel [atomselect top {protein}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # proteinRibbon
                
            mol representation NewCartoon 0.300000 10.000000 4.100000 0
            mol color Name
        
                mol selection {protein}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/SMILES_C1CCCC1.sdf.pdb.proteinRibbon.obj"
            }
        
            set sel [atomselect top {all}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # compoundSticks
                
                mol representation Licorice 0.300000 30.000000 30.000000
                mol color Name
            
                mol selection {all}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/SMILES_C1CCCC1.sdf.pdb.compoundSticks.obj"
            }
        mol delete top
mol new ./tmp/1xdn.2.pdb type pdb first 0 last -1 step 1 filebonds 1 autobonds 1 waitfor all
mol delrep 0 top


            set sel [atomselect top {protein}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # proteinRibbon
                
            mol representation NewCartoon 0.300000 10.000000 4.100000 0
            mol color Name
        
                mol selection {protein}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/1xdn.2.pdb.proteinRibbon.obj"
            }
        
            set sel [atomselect top {protein}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # proteinSurface
                
            mol representation QuickSurf 0.700000 0.500000 0.500000 1.000000
            mol color Name
        
                mol selection {protein}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/1xdn.2.pdb.proteinSurface.obj"
            }
        
            set sel [atomselect top {not protein and not water}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # compoundSticks
                
                mol representation Licorice 0.300000 30.000000 30.000000
                mol color Name
            
                mol selection {not protein and not water}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/1xdn.2.pdb.compoundSticks.obj"
            }
        mol delete top
mol new ./tmp/2hu4.2.pdb type pdb first 0 last -1 step 1 filebonds 1 autobonds 1 waitfor all
mol delrep 0 top


            set sel [atomselect top {protein}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # proteinRibbon
                
            mol representation NewCartoon 0.300000 10.000000 4.100000 0
            mol color Name
        
                mol selection {protein}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/2hu4.2.pdb.proteinRibbon.obj"
            }
        
            set sel [atomselect top {not protein and not water}]
            set sel_num [$sel num]
            if {$sel_num > 0} {
                mol delrep 0 top
                # compoundSticks
                
                mol representation Licorice 0.300000 30.000000 30.000000
                mol color Name
            
                mol selection {not protein and not water}
                mol material Opaque
                mol addrep top
                animate goto 0

                # Reset the camera
                
    # Reset the camera
    # for {set i 0} {$i < [molinfo num]} {incr i} {
    # molinfo ${i} set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    molinfo top set {center_matrix rotate_matrix scale_matrix global_matrix} $identityvpts
    # }


                render Wavefront "./tmp/2hu4.2.pdb.compoundSticks.obj"
            }
        mol delete top
quit
