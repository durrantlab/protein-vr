# This compiles and updates the code in the demo directory.

# First, compile the source
cd ../plugin/assets/babylon_html_files/
tsc --target es2015 --module amd protein-vr/config/RequireConfig.ts
tsc --target es2015 --module amd protein-vr/main.ts
cd -

# Now copy that source to this directory.
rsync -r --exclude="*.mm" --exclude="update*" ../plugin/assets/babylon_html_files/* ./
