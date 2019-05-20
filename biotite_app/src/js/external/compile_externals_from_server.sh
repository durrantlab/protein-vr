# Download the files
curl -o jsfile.1.pep.min.js https://code.jquery.com/pep/0.4.3/pep.min.js
curl -o jsfile.2.babylon.js https://preview.babylonjs.com/babylon.js
curl -o jsfile.3.babylonjs.loaders.min.js https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js
curl -o jsfile.4.babylonjs.materials.min.js https://preview.babylonjs.com/materialsLibrary/babylonjs.materials.min.js  # For shadowonly material.
curl -o jsfile.5.babylon.gui.min.js https://preview.babylonjs.com/gui/babylon.gui.min.js  # Needed for GUI3DManagser

# Old ones not used anymore.
# curl -o jsfile.6.jquery-3.3.1.min.js https://code.jquery.com/jquery-3.3.1.min.js

# Concatonate and delete originals
cat jsfile.1.pep.min.js jsfile.2.babylon.js jsfile.3.babylonjs.loaders.min.js \
    jsfile.4.babylonjs.materials.min.js \
    jsfile.5.babylon.gui.min.js \
    > externals.js
# rm jsfile.*.js  # Don't delete, in case you want to download separately. See index.html.

# Closure compiler
java -jar ../../utilities/closure-compiler-v20180506.jar --compilation_level=SIMPLE_OPTIMIZATIONS \
     --js_output_file='externals2.js' 'externals.js'

mv externals2.js externals.js

# Now for a dirty trick. When we go full screen, I don't want to maximize canvas, but rather it's container.
export TRICK_FILENAME="jsfile.2.babylon.js"
cat $TRICK_FILENAME | sed "s|RequestFullscreen(this._renderingCanvas)|RequestFullscreen(document.getElementById('container'))|g" > t
mv t $TRICK_FILENAME

export TRICK_FILENAME="externals.js"
cat $TRICK_FILENAME | sed "s|RequestFullscreen(this._renderingCanvas)|RequestFullscreen(document.getElementById('container'))|g" > t
mv t $TRICK_FILENAME
