ls *.ts | awk '{print "tsc --module amd " $1}' | parallel --no-notice
cp *.js *.html *.fx * /tmp/proteinvr/
