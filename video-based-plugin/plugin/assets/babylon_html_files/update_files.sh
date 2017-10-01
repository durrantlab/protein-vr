find . -name "*.ts" | awk '{print "tsc --target es2015 --module amd " $1}' | parallel #--no-notice
# cp *.js *.html *.fx * /tmp/proteinvr/
rsync -r --include="*js" ./* /tmp/proteinvr
rsync -r --include="*html" ./* /tmp/proteinvr
rsync -r --include="*fx" ./* /tmp/proteinvr
