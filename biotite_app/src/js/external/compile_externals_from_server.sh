# Download the files
curl -o tmp.1.pep.min.js https://code.jquery.com/pep/0.4.3/pep.min.js
curl -o tmp.2.babylon.js https://preview.babylonjs.com/babylon.js
curl -o tmp.3.babylonjs.loaders.min.js https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js
curl -o tmp.4.babylonjs.materials.min.js https://preview.babylonjs.com/materialsLibrary/babylonjs.materials.min.js  # For shadowonly material.
curl -o tmp.5.babylon.gui.min.js https://preview.babylonjs.com/gui/babylon.gui.min.js  # Needed for GUI3DManagser

# Old ones not used anymore.
# curl -o tmp.6.jquery-3.3.1.min.js https://code.jquery.com/jquery-3.3.1.min.js

# Concatonate and delete originals
cat tmp.1.pep.min.js tmp.2.babylon.js tmp.3.babylonjs.loaders.min.js \
    tmp.4.babylonjs.materials.min.js \
    tmp.5.babylon.gui.min.js \
    > externals.js
rm tmp.*.js

# Closure compiler
java -jar ../../utilities/closure-compiler-v20180506.jar --compilation_level=SIMPLE_OPTIMIZATIONS \
     --js_output_file='externals2.js' 'externals.js'

mv externals2.js externals.js

# Now for a dirty trick. When we go full screen, I don't want to maximize canvas, but rather it's container.
cat externals.js | sed "s|RequestFullscreen(this._renderingCanvas)|RequestFullscreen(document.getElementById('container'))|g" > t
mv t externals.js
