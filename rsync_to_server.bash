#!/bin/bash

# copy files in git to web server
source ~/durrantlab.inf.bash 
rsync -rv --exclude docs --exclude scene --exclude 3d_resources * $DURRANTLAB/apps/protein-vr/

