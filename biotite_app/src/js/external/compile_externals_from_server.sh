# Download the files
curl -o t https://code.jquery.com/pep/0.4.3/pep.min.js
curl -o t2 https://preview.babylonjs.com/babylon.js
curl -o t3 https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js
curl -o t4 https://preview.babylonjs.com/materialsLibrary/babylonjs.materials.min.js
curl -o t5 https://preview.babylonjs.com/gui/babylon.gui.min.js
# curl -o t6 https://code.jquery.com/jquery-3.3.1.min.js

# Concatonate and delete originals
# cat t t2 t3 t4 t5 t6 > externals.js
# rm t t2 t3 t4 t5 t6
cat t t2 t3 t4 t5 > externals.js
rm t t2 t3 t4 t5

# Closure compiler
java -jar ../../utilities/closure-compiler-v20180506.jar --compilation_level=SIMPLE_OPTIMIZATIONS \
     --js_output_file='externals2.js' 'externals.js'

mv externals2.js externals.js

# Now for a dirty trick. When we go full screen, I don't want to maximize canvas, but rather it's container.
cat externals.js | sed "s|RequestFullscreen(this._renderingCanvas)|RequestFullscreen(document.getElementById('container'))|g" > t
mv t externals.js
