REM #!/bin/bash
REM #cd ../


tsc --target ES5 --module amd main.ts proteinvr/Settings/UserVars.ts proteinvr/Core/Setup.ts proteinvr/RequireConfig.ts proteinvr/Environment.ts proteinvr/CameraChar.ts --allowUnreachableCode --pretty

REM #find proteinvr -name "*.js" -exec rm '{}' \;
REM #find proteinvr -name "*.ts" | awk '{print "tsc --target ES5 --module amd " $1}' | parallel -j6

REM echo Done
