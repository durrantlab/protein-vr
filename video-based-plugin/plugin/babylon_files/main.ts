declare var BABYLON;
declare var jQuery;

if (BABYLON.Engine.isSupported()) {

    // Get the canvas element from our HTML above
    var canvas = document.getElementById("renderCanvas");

    // Load the BABYLON 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    BABYLON.SceneLoader.Load("scene/", "babylon.babylon", engine, function (scene) {
        // Wait for textures and shaders to be ready
        scene.executeWhenReady(function () {
            // Attach camera to canvas inputs
            scene.activeCamera.attachControl(canvas);

            // Start rendering video texture
            let sphere = scene.meshes[0];
            scene.activeCamera.position = sphere.position;
            scene.activeCamera.rotation =  {x: 0.312831706486495, y: -1.1043217385267734, z: 0.0142}

            var mat = new BABYLON.StandardMaterial("mat", scene);
            
            mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
            mat.specularColor = new BABYLON.Color3(0, 0, 0);
            mat.diffuseTexture = null;
            mat.backFaceCulling = false;
            
            let videoTexture = new BABYLON.VideoTexture("video", ["proteinvr_baked.mp4"], scene, true);
            let nonVideoTexture = new BABYLON.Texture("proteinvr_baked_texture34.png", scene);
            let useVideoTexture = true;
            mat.emissiveTexture = videoTexture;
            
            sphere.material = mat;  // Because sphere is only thing in scene.


            // Once the scene is loaded, just register a render loop to render it
            engine.runRenderLoop(function() {
                scene.render();
            });

            // On click, switch textures
            jQuery("body").click(function() {
                this.useVideoTexture = !this.useVideoTexture;
                if (this.useVideoTexture) {
                    mat.emissiveTexture = this.videoTexture;
                } else {
                    mat.emissiveTexture = this.nonVideoTexture;
                }
                this.sphere.material = mat;
            }.bind({
                sphere: sphere,
                mat: mat,
                videoTexture: videoTexture,
                nonVideoTexture: nonVideoTexture,
                useVideoTexture: useVideoTexture
            }));

        });
    }, function (progress) {
        // To do: give progress feedback to user
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
}