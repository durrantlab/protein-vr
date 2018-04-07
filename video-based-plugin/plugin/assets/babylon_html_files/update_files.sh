#find . -name "*.ts" | awk '{print "tsc --target es2015 --module amd " $1}' | parallel #--no-notice

echo Compile typescript
tsc --target es2015 --module amd protein-vr/main.ts
tsc --target es2015 --module amd protein-vr/config/RequireConfig.ts
#tsc --target es2015 --module amd protein-vr/scene/Camera.ts

# Compile all js files into one
echo Combine all modules into one js.
r.js -o require_build.js

#echo Push closure externs to server
#scp build-tools/externs.js build-tools/babylon.extern.js jdurrant@durrantlab.bio.pitt.edu:/var/www/html/tmp/

echo Closure compile the combined script
#python build-tools/closure_it.py compiled.js > compiled2.js; mv compiled2.js compiled.js

echo Further remove whitespace
#python build-tools/further_remove_whitespace.py compiled.js > t
#mv t compiled.js

echo Copy over other files
# cp *.js *.html *.fx * /tmp/proteinvr/
rsync -r --include="*js" ./* /tmp/proteinvr
rsync -r --include="*html" ./* /tmp/proteinvr
rsync -r --include="*fx" ./* /tmp/proteinvr
