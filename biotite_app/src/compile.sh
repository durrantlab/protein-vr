# Make js files
echo "Compiling ts..."
tsc js/Start.ts --module amd
tsc js/Game.ts --module amd

# Remove existing build directory
echo "Recreating build directory..."
rm -r ../build
mkdir ../build

# Copy over files to build
echo "Copying to build directory..."
rsync --exclude '*.ts' --exclude '*.sh' -rv * ../build/

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
