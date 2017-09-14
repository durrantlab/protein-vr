///<reference path="../js/Babylonjs/dist/babylon.2.5.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./Settings/UserVars", "./Core/RenderLoop", "./Optimization/Optimization", "./Optimization/LOD"], function (require, exports, UserVars, RenderLoop, Optimization_1, LOD) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // declare var PVRGlobals;
    // var jQuery = PVRGlobals.jQuery;
    // declare var jQuery;
    var lens = null;
    // namespace Environment {
    /**
    The Environment namespace is where all the functions and variables
    related to the environment are stored.
    */
    function setup() {
        /**
        Set up the environment.
        */
        // If the window is resized, then also resize the game engine.
        window.addEventListener('resize', function () {
            PVRGlobals.engine.resize();
        });
        // If the window looses focus, pause the game.
        window.addEventListener('blur', function () {
            RenderLoop.pause();
        });
        window.addEventListener('focus', function () {
            RenderLoop.start();
        });
        // "Capture" the mouse from the browser.
        // This now launched from the settings input panel.
        //PointerLock.pointerLock();
        // Optimize the scene to keep it running fast.
        Optimization_1.startOptimizing();
        // No shadows and lights because everything rendered
        PVRGlobals.scene.shadowsEnabled = false;
        PVRGlobals.scene.lightsEnabled = false;
        // Set up the fog.
        setFog(0.0);
        // Set up LOD
        var lodLevel = UserVars.getParam("objects");
        switch (lodLevel) {
            case UserVars.objects["Normal"]:
                LOD.adjustLODDistances(LOD.LODLevelOptions[1]);
                break;
            case UserVars.objects["Simple"]:
                LOD.adjustLODDistances(LOD.LODLevelOptions[2]);
                break;
            default:
                LOD.adjustLODDistances(LOD.LODLevelOptions[0]);
        }
        // Let's effects are just too intensive, on both phone and camera. Deactivating.
        // lens = lensEffect();
        // limitLensEffect();
        // countdowns();
        // testing lens flares
        // uses nonexistant texture, rest of code works
        // let flares = LensFlare.buildFlareSys({
        //     name: "LensFlareSystem",
        //     emitter: PVRGlobals.camera,
        //     flares: [{
        //         size: 1,
        //         position: 0,
        //         color: new BABYLON.Color3(1, 1, 1),
        //         texture: "sampletexture.png"
        //     }]
        // });
        // console.log(flares);
    }
    exports.setup = setup;
    function setFog(density) {
        /**
        Setup the fog.
    
        :param float density: The fog density. Defaults to 0.015.
        */
        if (density === void 0) { density = 0.015; }
        var userVarFog = UserVars.getParam("fog");
        if ((userVarFog === UserVars.fog["Thin"]) && (density < 0.015)) {
            density = 0.35;
        }
        else if ((userVarFog === UserVars.fog["Thick"]) && (density < 0.045)) {
            density = 0.6;
        }
        // countdowns();
        if (density !== 0) {
            // Make the fog
            PVRGlobals.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            // PVRGlobals.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            var color = new BABYLON.Color3(0.9, 0.9, 0.85);
            PVRGlobals.scene.fogColor = color;
            PVRGlobals.scene.clearColor = color;
            // If there's fog, there's no skybox, and everything is on the
            // same renderid. renderid doesn't matter... it was that your
            // custom shaders didn't accept fog.
            // No need to keep the skybox visible.
            for (var i = 0; i < PVRGlobals.scene.meshes.length; i++) {
                var m = PVRGlobals.scene.meshes[i];
                // Everything on same renderingroup
                m.renderingGroupId = 1;
                if (m.name === "sky") {
                    m.isVisible = false;
                }
                else if (m.name === "crosshair") {
                    m.renderingGroupId = 2;
                    m.applyFog = false;
                }
                else {
                    m.applyFog = true;
                }
            }
        }
        else {
            // Skybox visible.
            for (var i = 0; i < PVRGlobals.scene.meshes.length; i++) {
                var m = PVRGlobals.scene.meshes[i];
                if (m.name === "sky") {
                    m.isVisible = true;
                    m.renderingGroupId = 0;
                }
                else if (m.name === "crosshair") {
                    m.renderingGroupId = 2;
                }
                else {
                    m.renderingGroupId = 1;
                }
            }
        }
        PVRGlobals.scene.fogDensity = density;
    }
    exports.setFog = setFog;
    var mySceneOptimizationUpdateOctTree = (function (_super) {
        __extends(mySceneOptimizationUpdateOctTree, _super);
        function mySceneOptimizationUpdateOctTree() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.apply = function (scene) {
                scene.createOrUpdateSelectionOctree();
                return true;
            };
            return _this;
        }
        return mySceneOptimizationUpdateOctTree;
    }(BABYLON.SceneOptimization));
    exports.mySceneOptimizationUpdateOctTree = mySceneOptimizationUpdateOctTree;
    function lensEffect() {
        /**
        Create a lens effect. Not currently implemented.
        */
        // See http://doc.babylonjs.com/tutorials/Using_depth-of-field_and
        // _other_lens_effects
        var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
            edge_blur: 1.0,
            chromatic_aberration: 1.0,
            distortion: 1.0,
            dof_focus_distance: 5.0,
            dof_aperture: 2.0,
            grain_amount: 1.0,
            dof_pentagon: true,
            dof_gain: 0.0,
            dof_threshold: 1.0,
            dof_darken: 0.25
        }, PVRGlobals.scene, 1.0, PVRGlobals.camera);
        return lensEffect;
    }
    /**
     * Limit GPU demanding operations in the lens effects (barrel distortion).
     * Here we eliminate highlighting objects out of focus and limit blur effects.
     */
    function limitLensEffect() {
        lens.setHighlightsGain(0.0);
        lens.setAperture(0.1);
    }
    exports.limitLensEffect = limitLensEffect;
    var PointerLock;
    (function (PointerLock) {
        /**
        The PointerLock namespace is where all the functions and variables
        related to capturing the mouse are stored.
        */
        /* Whether or not the mouse has been captured. */
        PointerLock.alreadyLocked = false;
        function pointerLock() {
            /**
            Set up the pointerlock (to capture the mouse).
            */
            // Adapted from
            // http://www.pixelcodr.com/tutos/shooter/shooter.html
            // Get the rendering canvas.
            // var canvas = jQuery("canvas"); // PVRGlobals.scene.getEngine().getRenderingCanvas();
            var canvas = document.getElementsByTagName("canvas")[0];
            // On click event, request pointer lock.
            // canvas.addEventListener("click", function(evt) { 
            //     PointerLock.actuallyRequestLock(canvas); 
            // }, false);
            // Event listener when the pointerlock is updated (or removed
            // by pressing ESC for example).
            var pointerlockchange = function (event) {
                PointerLock.alreadyLocked = (document.mozPointerLockElement === canvas
                    || document.webkitPointerLockElement === canvas
                    || document.msPointerLockElement === canvas
                    || document.pointerLockElement === canvas);
                // If the user is alreday locked.
                if (!PointerLock.alreadyLocked) {
                    PVRGlobals.camera.detachControl(canvas);
                }
                else {
                    PVRGlobals.camera.attachControl(canvas);
                }
            };
            // Attach events to the document.
            document.addEventListener("pointerlockchange", pointerlockchange, false);
            document.addEventListener("mspointerlockchange", pointerlockchange, false);
            document.addEventListener("mozpointerlockchange", pointerlockchange, false);
            document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
            // Tell user to click somehow.
            // console.log('Tell user to click...');
            PointerLock.actuallyRequestLock(canvas);
        }
        PointerLock.pointerLock = pointerLock;
        // if limiting fps, remove dof_gain and dof_aperature first
        function actuallyRequestLock(canvas) {
            /**
            Request the mouse lock.
    
            :param any canvas: The canvas where the 3D scene is being
                        rendered.
            */
            canvas.requestPointerLock = canvas.requestPointerLock ||
                canvas.msRequestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }
        PointerLock.actuallyRequestLock = actuallyRequestLock;
    })(PointerLock = exports.PointerLock || (exports.PointerLock = {}));
    // Lens Flares tested above (line 87)
    /**
     * namespace for creating a lens flare system
     */
    var LensFlare;
    (function (LensFlare) {
        /**
         * returns an array of lens flares
         * @param params FlareSystem interface
         */
        function buildFlareSys(params) {
            var scene = PVRGlobals.scene;
            console.log(scene);
            var flareSys = new BABYLON.LensFlareSystem(params['name'], params['emitter'], PVRGlobals.scene);
            var flareArr = new Array(params['flares'].length);
            var index = 0;
            for (var _i = 0, _a = params['flares']; _i < _a.length; _i++) {
                var flare = _a[_i];
                flareArr[index++] = new BABYLON.LensFlare(flare.size, flare.position, flare.color, flare.texture, flareSys);
            }
            return flareArr;
        }
        LensFlare.buildFlareSys = buildFlareSys;
    })(LensFlare = exports.LensFlare || (exports.LensFlare = {}));
});
// }
// export default Environment; 
