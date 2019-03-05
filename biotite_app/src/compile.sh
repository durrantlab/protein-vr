# Make js files
echo "Compiling ts..."
tsc --target ES5 --alwaysStrict --module amd js/Start.ts
tsc --target ES5 --alwaysStrict --module amd js/Game.ts

# Combine into a single js.
r.js -o build.js

# Closure compile
# --formatting=PRETTY_PRINT
# java -jar utilities/closure-compiler-v20180506.jar --compilation_level=ADVANCED_OPTIMIZATIONS \
#      --externs='utilities/jquery-1.9.js' --externs='utilities/twitter-bootstrap-2.1.1-externs.js' \
#      --externs='utilities/custom_extern.js' --js_output_file='lodash.min2.js' 'lodash.min.js' \
#      --formatting=PRETTY_PRINT \
#      2> closure.out

# # Rename it
# mv lodash.min2.js lodash.min.js

# Remove existing build directory
echo "Recreating build directory..."
rm -r ../build
mkdir ../build

# Copy over files to build
echo "Copying to build directory..."
rsync --exclude '*.ts' --exclude '*.sh' --exclude '*.out' --exclude 'utilities' --exclude 'build.js' -rv * ../build/

# Simplify js structure
ls -1d ../build/js/* | grep -v "external" | awk '{print "rm -rf " $1}' | bash
mv ../build/js/external/* ../build/js/
rm -rf ../build/js/external/
rm -rf ../build/js/require/  # Don't need this.

# Remove compiled js files
echo "Removing compiled js files..."
find . -name "*.ts" | sed "s/\.ts$//g" | awk '{print "rm " $0 ".js"}' | grep -v "\.d\.js" | bash

# Copy over babylon scenes
rsync -rl babylon_scenes ../build/

# Also update copy of code in biotite repo
# rsync -rv ../build/* /Users/jdurrant/Documents/Work/durrant_git/online-app-suite/src/js/api/server_apps/apps/CreateVRScene/test_local/output/protein_vr/

rm -rf /Users/jdurrant/Documents/Work/durrant_git/online-app-suite/src/js/api/server_apps/apps/CreateVRScene/support/browser/*
rsync -rv --exclude="babylon_scenes" ../build/* /Users/jdurrant/Documents/Work/durrant_git/online-app-suite/src/js/api/server_apps/apps/CreateVRScene/support/browser/

# Process is done
#say -v Samantha "beep"
