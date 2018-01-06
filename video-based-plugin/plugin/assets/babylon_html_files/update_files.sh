#find . -name "*.ts" | awk '{print "tsc --target es2015 --module amd " $1}' | parallel #--no-notice

tsc --target es2015 --module amd protein-vr/main.ts
tsc --target es2015 --module amd protein-vr/config/RequireConfig.ts
#tsc --target es2015 --module amd protein-vr/scene/Camera.ts

# cp *.js *.html *.fx * /tmp/proteinvr/
rsync -r --include="*js" ./* /tmp/proteinvr
rsync -r --include="*html" ./* /tmp/proteinvr
rsync -r --include="*fx" ./* /tmp/proteinvr
