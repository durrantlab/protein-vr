cd /Users/jdurrant/Documents/Work/durrant_git/protein-vr/video-based-plugin/plugin/assets/babylon_html_files/
find . -name "*.ts" | awk '{print "tsc --target es2015 --module amd " $1}' | parallel --no-notice
cd -

rsync -r --include="*js" ~/Documents/Work/durrant_git/protein-vr/video-based-plugin/plugin/assets/babylon_html_files/* ${1}
rsync -r --include="*html" ~/Documents/Work/durrant_git/protein-vr/video-based-plugin/plugin/assets/babylon_html_files/* ${1}
rsync -r --include="*fx" ~/Documents/Work/durrant_git/protein-vr/video-based-plugin/plugin/assets/babylon_html_files/* ${1}
rsync -r --include="*babylon" ~/Documents/Work/durrant_git/protein-vr/video-based-plugin/plugin/assets/babylon_html_files/* ${1}
