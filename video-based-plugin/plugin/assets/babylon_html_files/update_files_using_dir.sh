find . -name "*.ts" | awk '{print "tsc --target es2015 --module amd " $1}' | parallel --no-notice
rsync -r --include="*js" ./* ${1}
rsync -r --include="*html" ./* ${1}
rsync -r --include="*fx" ./* ${1}
rsync -r --include="*babylon" ./* ${1}
