#!/bin/bash

# copy files in git to web server
source ~/durrantlab.inf.bash 
rsync -rv * $DURRANTLAB/apps/protein-vr/

