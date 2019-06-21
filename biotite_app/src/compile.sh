# Make js files
echo "Compiling ts..."
tsc --target ES5 --alwaysStrict --module amd js/Start.ts
tsc --target ES5 --alwaysStrict --module amd js/Scene/LoadAndSetup.ts

# Combine into a single js.
r.js -o build.js

# Closure compile
./utilities/closure.sh lodash.min.js

# Combine it with the externals.
# cat js/external/externals.js lodash.min.js > tmptmp
# mv tmptmp lodash.min.js

# Remove existing build directory
echo "Recreating build directory..."
rm -r ../build
mkdir ../build

# Copy over files to build
echo "Copying to build directory..."
rsync --exclude '*.ts' --exclude '*.sh' --exclude '*.out' --exclude 'utilities' --exclude 'build.js' -rv * ../build/
cp js/nanokid.sdf ../build/

# Simplify js structure
ls -1d ../build/js/* | grep -v "external" | awk '{print "rm -rf " $1}' | bash
mv ../build/js/external/* ../build/js/
rm -rf ../build/js/external/
rm -rf ../build/js/require/  # Don't need this.

# Also compile web workers separately
find js -name "*WebWorker.ts" | awk '{print "tsc --target ES5 --alwaysStrict " $1}' | parallel --no-notice

# Copy over web workers, fixing export problem.
find js -name "*WebWorker.js" | awk '{print "cat " $1 " | grep -v exports > ../build/$(basename " $1 ")"}' | bash

# Closure compile those
ls ../build/*WebWorker.js | awk '{print "./utilities/closure.sh " $1}' | parallel --no-notice

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
say -v Samantha "beep"
