ls *.ts | awk '{print "tsc --module amd " $1}' | parallel ; cp *.js *.html *.fx * /tmp/proteinvr/
