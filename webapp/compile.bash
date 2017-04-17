#!/bin/bash
#cd ../


tsc --target ES5 --module amd main.ts proteinvr/RequireConfig.ts proteinvr/Environment.ts proteinvr/CameraChar.ts

#find proteinvr -name "*.js" -exec rm '{}' \;
#find proteinvr -name "*.ts" | awk '{print "tsc --target ES5 --module amd " $1}' | parallel -j6

echo Done
