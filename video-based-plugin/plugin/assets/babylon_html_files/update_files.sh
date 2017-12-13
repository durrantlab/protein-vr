#find . -name "*.ts" | awk '{print "tsc --target es2015 --module amd " $1}' | parallel #--no-notice

tsc --target es2015 --module amd protein-vr/main.ts
tsc --target es2015 --module amd protein-vr/config/RequireConfig.ts
#tsc --target es2015 --module amd protein-vr/scene/Camera.ts

# cp *.js *.html *.fx * /tmp/proteinvr2/
rsync -r --include="*js" ./* /tmp/proteinvr2
rsync -r --include="*html" ./* /tmp/proteinvr2
rsync -r --include="*fx" ./* /tmp/proteinvr2
