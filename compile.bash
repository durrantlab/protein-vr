#!/bin/bash
#cd ../


tsc --target ES5 --module amd source/main.ts config.ts source/Shader/Shader.ts source/Environment.ts source/CameraChar.ts

#find source -name "*.js" -exec rm '{}' \;
#find source -name "*.ts" | awk '{print "tsc --target ES5 --module amd " $1}' | parallel -j6

echo Done
