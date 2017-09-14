#!/bin/bash

tsc --target ES5 --module amd main.ts proteinvr/Settings/UserVars.ts proteinvr/Core/Setup.ts proteinvr/RequireConfig.ts proteinvr/Environment.ts proteinvr/CameraChar.ts --allowUnreachableCode --pretty

# find proteinvr -name "*.ts" | awk '{print "tsc --target ES5 --module amd " $1}' | parallel -j6
# r.js -o baseUrl=. paths.jquery=js/jquery.min paths.bootstrap=js/bootstrap-3.3.7/dist/js/bootstrap.min name=proteinvr/RequireConfig out=single.js

echo Done
