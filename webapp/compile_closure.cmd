# First, you need to build the project, combining modules into one.
# Remove old compiled directory
rm -r ../webapp-compiled/

# Babylonjs needs to be kept out of the loop for now, since it's not loaded through requirejs.
rm -r ../babylonjs.tmp_storage
mkdir ../babylonjs.tmp_storage
mv js/Babylon* ../babylonjs.tmp_storage/

# Now compile this app
r.js -o proteinvr/app.build.js

# And move babylon to the right place
cp -r ../babylonjs.tmp_storage/* ../webapp-compiled/js/
mv ../babylonjs.tmp_storage/* js/
rm -r ../babylonjs.tmp_storage/

echo "Make sure you're in the compile directory!"
pwd
echo "<Press Enter>"
read -n1 -r -p "Press space to continue..." key

# Clean up some files
cd ../webapp-compiled/
find . -name "*.cmd" | awk '{print "rm " $1}' | bash
find . -name "*.ts" | awk '{print "rm " $1}' | bash
cd proteinvr
rm -r Core Definitions Events Objects Optimization Quiz Settings docs
cd ..
#find . -name "*.js" | grep -v "almond.js" | grep -v "Babylonjs" | grep -v "screenful" | awk '{print "rm " $1}' | bash
pwd

# Rename almond.js
mv ./js/almond.js ./js/main.js

# Fix index.html
cat index.html | sed "s|</head>|<script src=\"js/main.js\"></script></head>|g" | grep -v "RequireConfig" > tmp
mv tmp index.html

# Now compile main.js using closure remote service
python send_to_closure.py ./js/main.js > tmp
mv tmp ./js/main.js
