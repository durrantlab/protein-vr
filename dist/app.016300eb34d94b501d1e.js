(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["app"],{

/***/ "/7QA":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_Scene_LoadAndSetup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/Scene/LoadAndSetup */ "fcUb");
/* harmony import */ var bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bootstrap */ "SYky");
/* harmony import */ var bootstrap__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bootstrap__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/Vars/UrlVars */ "p11u");


// import * as Styles from "./styles/style.css";

// Get server workers (for progressive web app). Makes for better experience,
// especially on iOS. See
// https://webpack.js.org/guides/progressive-web-application/
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js', { scope: './' }).then(function (registration) {
            console.log('SW registered: ', registration);
        }).catch(function (registrationError) {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
// document.getElementById("renderCanvas").classList.add(Styles.renderCanvas);
// document.getElementById("container").classList.add(Styles.container);
_components_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_2__["readEnvironmentNameParam"]();
_components_Scene_LoadAndSetup__WEBPACK_IMPORTED_MODULE_0__["load"]();


/***/ }),

/***/ 0:
/*!*************************************************************************!*\
  !*** multi (webpack)-dev-server/client?http://localhost ./src/index.ts ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! /Users/jdurrant/Documents/Work/durrant_git/protein-vr/node_modules/webpack-dev-server/client/index.js?http://localhost */"FPRn");
module.exports = __webpack_require__(/*! /Users/jdurrant/Documents/Work/durrant_git/protein-vr/src/index.ts */"/7QA");


/***/ }),

/***/ "0fSa":
/*!***********************************************!*\
  !*** ./src/components/Scene/Optimizations.ts ***!
  \***********************************************/
/*! exports provided: setup, optimizeMeshPicking, freezeMeshProps, updateEnvironmentShadows, removeMeshEntirely */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "optimizeMeshPicking", function() { return optimizeMeshPicking; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "freezeMeshProps", function() { return freezeMeshProps; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateEnvironmentShadows", function() { return updateEnvironmentShadows; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeMeshEntirely", function() { return removeMeshEntirely; });
/* harmony import */ var _Mols_MolShadows__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Mols/MolShadows */ "sqbB");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");


/**
 * Setup the optimizations.
 * @returns void
 */
function setup() {
    // Turn on scene optimizer. Note that during loading the fps is bound to
    // drop, so let's put it on a little delay. TODO: Only run this once the
    // model and scene are loaded.
    setTimeout(function () {
        BABYLON.SceneOptimizer.OptimizeAsync(_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"], 
        // BABYLON.SceneOptimizerOptions.HighDegradationAllowed(),
        sceneOptimizerParameters());
    }, 5000);
    // Assume no part of the scene goes on to empty (skybox?)
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].autoClear = false; // Color buffer
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].autoClearDepthAndStencil = false;
    // Modify some meshes
    /** @type {number} */
    var len = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].meshes.length;
    var zeroVec = new BABYLON.Color3(0, 0, 0);
    for (var idx = 0; idx < len; idx++) {
        /** @const {*} */
        var mesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].meshes[idx];
        // Meshes that contain the word "baked" should be shadeless
        if ((mesh.name.indexOf("baked") !== -1) && (mesh.material !== undefined)) {
            // Make material shadeless
            mesh.material.diffuseColor = zeroVec;
            mesh.material.specularColor = zeroVec;
            mesh.material.emissiveTexture = mesh.material.diffuseTexture;
            mesh.material.diffuseTexture = null;
            // Material won't be changing. But apparently this is no
            // longer a needed optimization:
            // http://www.html5gamedevs.com/topic/37540-when-is-it-safe-to-freeze-materials/
            // mesh.material.freeze();
            // Assume no change in location (because that would require
            // recalculating shadows)
            mesh.freezeWorldMatrix();
        }
    }
}
/**
 * Gets the number of vertices in a mesh.
 * @param  {*} mesh The mesh.
 * @returns {number|null}  The number of vertices.
 */
function getNumVertices(mesh) {
    // First, get the number of vertexes.
    var numVertexes = 0;
    if (mesh !== undefined) {
        /** @type {Array<*>} */
        var vertexData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        if (vertexData === null) {
            return null;
        } // Something like __root__
        numVertexes = vertexData.length / 3;
    }
    else {
        numVertexes = 0;
    }
    return numVertexes;
}
/**
 * Optimize the ability to pick meshes, using octrees.
 * @param  {*} mesh The mesh.
 * @returns void
 */
function optimizeMeshPicking(mesh) {
    // First, get the number of vertexes.
    /** @type {number} */
    var numVertexes = getNumVertices(mesh);
    if (numVertexes === null) {
        return;
    } // Something like __root__
    // If there are very few vertexes, don't use this optimization. This
    // prevents it's use on button spheres, for example.
    if (numVertexes < 100) {
        return;
    }
    // Now get the number of submeshes to use.
    var numSubMeshes = 1 + Math.floor(numVertexes / _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["MAX_VERTS_PER_SUBMESH"]);
    // Subdivide the mesh if necessary.
    if (numSubMeshes > 1) {
        mesh.subdivide(numSubMeshes);
    }
    // Now use octree for picking and collisions.
    // mesh.createOrUpdateSubmeshesOctree(64, 2);  // Messes up culling on protein all sticks.
    // mesh.useOctreeForCollisions = true;
}
/**
 * Freeze the properties on a mesh, so they don't need to be recalculated.
 * @param  {*}       mesh	                The mesh.
 * @param  {boolean} [freezeMaterial=true]  Whether to freeze the material.
 * @param  {boolean} [worldMatrix=true]     Whether to freeze the world matrix.
 * @returns void
 */
function freezeMeshProps(mesh, freezeMaterial, worldMatrix) {
    if (freezeMaterial === void 0) { freezeMaterial = true; }
    if (worldMatrix === void 0) { worldMatrix = true; }
    if (freezeMaterial) {
        mesh.material.freeze();
        // material.unfreeze();
    }
    // if (worldMatrix) {
    // TODO: Why doesn't this work?
    // mesh.freezeWorldMatrix();
    // mesh.unfreezeWorldMatrix();
    // }
}
/**
 * Update the environment shadows. They are frozen otherwise. This function
 * unfreezes them and the freezes them again.
 * @returns void
 */
function updateEnvironmentShadows() {
    if (_Mols_MolShadows__WEBPACK_IMPORTED_MODULE_0__["shadowGenerator"]) {
        // Update the shadows. They are frozen otherwise.
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].lights[0].autoUpdateExtends = true;
        _Mols_MolShadows__WEBPACK_IMPORTED_MODULE_0__["shadowGenerator"].getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        // Vars.scene.render();
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].lights[0].autoUpdateExtends = false;
    }
}
/**
 * Prepares scene-optimizer paramters.
 * @returns * The parameters.
 */
function sceneOptimizerParameters() {
    // See https://doc.babylonjs.com/how_to/how_to_use_sceneoptimizer
    // The goal here is to maintain a frame rate of 60. Check every two
    // seconds. Very similar to HighDegradationAllowed
    var result = new BABYLON.SceneOptimizerOptions(25, 2000);
    var priority = 0;
    result.optimizations.push(new BABYLON.ShadowsOptimization(priority));
    // The below won't make a difference for my scenes anyway...
    // result.optimizations.push(new BABYLON.MergeMeshesOptimization(priority));
    result.optimizations.push(new BABYLON.LensFlaresOptimization(priority));
    result.optimizations.push(new BABYLON.PostProcessesOptimization(priority));
    result.optimizations.push(new BABYLON.ParticlesOptimization(priority));
    result.optimizations.push(new ReportOptimizationChange(priority));
    // Next priority
    priority++;
    result.optimizations.push(new RemoveSurfaces(priority)); // Remove surfaces
    result.optimizations.push(new ReportOptimizationChange(priority));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.TextureOptimization(priority, 512));
    result.optimizations.push(new ReportOptimizationChange(priority));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
    result.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
    result.optimizations.push(new ReportOptimizationChange(priority));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 4));
    result.optimizations.push(new SimplifyMeshes(priority, 500)); // Simplify meshes.
    result.optimizations.push(new ReportOptimizationChange(priority));
    return result;
}
/**
 * Entirely remove a mesh.
 * @param  {*} mesh The mesh to remove.
 * @returns void
 */
function removeMeshEntirely(mesh) {
    if (mesh !== null) {
        mesh.dispose();
    }
    mesh = null;
}
var ReportOptimizationChange = /** @class */ (function () {
    /**
     * Remove the surface mesh (it takes a lot of resources).
     * @param  {number} priority The priority of this optimization.
     * @returns void
     */
    function ReportOptimizationChange(priority) {
        var _this = this;
        if (priority === undefined) {
            priority = 0;
        }
        this["priority"] = priority;
        this["apply"] = function (scene) {
            console.log("Optimization priority:", _this["priority"]);
            console.log("FPS:", _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["engine"].getFps());
            console.log("");
            return true;
        };
        this["getDescription"] = function () {
            return "Reports the current priority. For debugging.";
        };
    }
    return ReportOptimizationChange;
}());
// tslint:disable-next-line:max-classes-per-file
var RemoveSurfaces = /** @class */ (function () {
    /**
     * Remove the surface mesh (it takes a lot of resources).
     * @param  {number} priority The priority of this optimization.
     * @returns void
     */
    function RemoveSurfaces(priority) {
        if (typeof priority === "undefined") {
            priority = 0;
        }
        this["priority"] = priority;
        this["apply"] = function (scene) {
            // Delete the surface mesh. Note that it will still be visible in the
            // main menu, but oh well.
            var surfaces = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].getMeshByName("surfaces.wrl");
            removeMeshEntirely(surfaces);
            return true;
        };
        this["getDescription"] = function () {
            return "Removes surface representations.";
        };
    }
    return RemoveSurfaces;
}());
// tslint:disable-next-line:max-classes-per-file
var SimplifyMeshes = /** @class */ (function () {
    /**
     * A scene optimization to decimate the big meshes.
     * @param  {number} priority                  The priority of this
     *                                            optimization.
     * @param  {number} minNumVertsThatIsProblem  The target number of vertices.
     * @param  {number} [decimationLevel=]        The decimation level. If not
     *                                            specified, calculated from
     *                                            minNumVertsThatIsProblem.
     */
    function SimplifyMeshes(priority, minNumVertsThatIsProblem, decimationLevel) {
        if (decimationLevel === void 0) { decimationLevel = undefined; }
        if (typeof priority === "undefined") {
            priority = 0;
        }
        this["priority"] = priority;
        this["apply"] = function (scene) {
            /** @type {Array<Array<number,*,number>>} */
            var meshesToConsider = [];
            /** @type {number} */
            var len = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].meshes.length;
            for (var meshIdx = 0; meshIdx < len; meshIdx++) {
                var mesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].meshes[meshIdx];
                // If it's decimated, skip it. It will be deleted and
                // recreated.
                if (mesh.name.indexOf("Decimated") !== -1) {
                    continue;
                }
                // Get the number of vertexes.
                /** @type {number} */
                var numVertexes = getNumVertices(mesh);
                if (numVertexes === null) {
                    continue;
                } // Something like __root__
                if (numVertexes < minNumVertsThatIsProblem) {
                    continue;
                }
                meshesToConsider.push([
                    numVertexes, mesh,
                    (decimationLevel === undefined) ? 1. - minNumVertsThatIsProblem / numVertexes : decimationLevel,
                ]);
                // Simplify the mesh. See
                // https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
                // You used to be able to simplify a mesh without LOD.
                // Apparently you can't now?
                // let decimator = new BABYLON.QuadraticErrorSimplification(mesh);
                // simplify({
                //     "decimationIterations": 100,
                //     "aggressiveness": 7,
                //     // "syncIterations": ?  // Just keep default. Not sure what this is.
                // }, () => { return; });
            }
            // Order the meshes from the one with most vertices to the one with
            // least (prioritize bad ones).
            meshesToConsider.sort(function (a, b) { return b[0] - a[0]; });
            // Simplify those meshes.
            var meshesToConsiderLen = meshesToConsider.length;
            for (var i = 0; i < meshesToConsiderLen; i++) {
                /** @type {Array<number,*,number>} */
                var meshToConsider = meshesToConsider[i];
                var mesh = meshToConsider[1];
                /** @type {number} */
                var decimationLvel = meshToConsider[2];
                // Remove the existing LODs if they exist.
                while (mesh.getLODLevels().length > 0) {
                    var firstLODMesh = mesh.getLODLevels()[0]["mesh"];
                    mesh.removeLODLevel(firstLODMesh);
                    removeMeshEntirely(firstLODMesh);
                }
                // https://doc.babylonjs.com/api/classes/babylon.mesh#simplify
                mesh.simplify([{ "quality": decimationLvel, "distance": 0.001 }], false, BABYLON.SimplificationType.QUADRATIC, function () {
                    // let simpMesh = mesh.getLODLevels()[0]["mesh"];
                    // removeMeshEntirely(mesh);
                });
            }
            return true;
        };
        this["getDescription"] = function () {
            return "Simplifies the geometry of complex objects in the scene.";
        };
    }
    return SimplifyMeshes;
}());


/***/ }),

/***/ "1RHl":
/*!*****************************************!*\
  !*** ./src/components/Cameras/Setup.ts ***!
  \*****************************************/
/*! exports provided: cameraFromBabylonFile, setup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cameraFromBabylonFile", function() { return cameraFromBabylonFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _NonVRCamera__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./NonVRCamera */ "ejGh");


var cameraFromBabylonFile;
/**
 * This function runs after the babylon scene is loaded.
 * @returns void
 */
function setup() {
    // You need to make the camera from the babylon file active. First, get
    // the babylon camera. It's the one that doesn't have "VR" in its name,
    // because VR cameras are added programatically.
    cameraFromBabylonFile = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].cameras.filter(function (c) { return c.name.indexOf("VR") === -1; })[0];
    // If true, sets up device orientation camera. Otherwise, just use one in
    // babylonjs file. A toggle for debugging.
    if (true) {
        // Create a device orientation camera that matches the one loaded from
        // the babylon file.
        var devOrCamera = new BABYLON.DeviceOrientationCamera("DevOr_camera", cameraFromBabylonFile.position.clone(), _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"], true);
        devOrCamera.rotation = cameraFromBabylonFile.rotation.clone();
        // For debugging.
        // window["cameraFromBabylonFile"] = cameraFromBabylonFile;
        // window["devOrCamera"] = devOrCamera;
        // Update the active camera to be the device orientation one.
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].activeCamera = devOrCamera; // cameraFromBabylonFile
        // Make sure device orientation camera pointing in direction of
        // original camera.
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].activeCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(cameraFromBabylonFile.rotation);
    }
    else {}
    // Get the camera height.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["determineCameraHeightFromActiveCamera"]();
    // Setup the default (nonVR) camera.
    _NonVRCamera__WEBPACK_IMPORTED_MODULE_1__["setup"]();
}


/***/ }),

/***/ "9bcR":
/*!*************************************************!*\
  !*** ./src/components/Navigation/Navigation.ts ***!
  \*************************************************/
/*! exports provided: setup, actOnStareTrigger */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "actOnStareTrigger", function() { return actOnStareTrigger; });
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Cameras/CommonCamera */ "vCcv");
/* harmony import */ var _Cameras_NonVRCamera__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Cameras/NonVRCamera */ "ejGh");
/* harmony import */ var _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Scene/Optimizations */ "0fSa");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _Pickables__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Pickables */ "TqLJ");
/* harmony import */ var _Points__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Points */ "ph2Y");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Vars/UrlVars */ "p11u");
/* harmony import */ var _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../UI/Menu3D/Menu3D */ "jIpr");
// This module handles all things navigation related.








var currentlyTeleporting = false;
/**
 * Setup the navigation system.
 * @returns void
 */
function setup() {
    // Allways collide with a floor mesh.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].groundMesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].getMeshByID("ground");
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].groundMesh === null) {
        alert("No mesh named ground");
    }
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].groundMesh.checkCollisions = true;
    // The ground should generally be hidden. There's a chance it could be
    // turned into glass too. See Mols.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].groundMesh.visibility = 0;
    _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_2__["optimizeMeshPicking"](_Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].groundMesh);
    _Pickables__WEBPACK_IMPORTED_MODULE_4__["makeMeshMouseClickable"]({
        callBack: actOnStareTrigger,
        mesh: _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].groundMesh,
    });
    // Initially, no VR.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].navMode = 3 /* NoVR */;
    // Setup triggers.
    setupTriggers();
    // Keep track up critical points in the scene (like stare points).
    _Points__WEBPACK_IMPORTED_MODULE_5__["setup"]();
    // Create a div to intercept clicks if needed. Add clear div over canvas.
    setupCaptureMouseClicksOutsideBabylon();
    // Constantly monitor the position of the camera. If it's no longer over
    // the floor, move it back to its previous position.
    keepCameraOverFloor();
}
/** @type {*} */
var lastCameraPt;
/** @type {string} */
var lastCameraName = "";
/**
 * Check and make sure the camera is over the ground. If not, move it back so
 * it is over the ground.
 * @returns void
 */
function keepCameraOverFloor() {
    lastCameraPt = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].registerBeforeRender(function () {
        var cameraPt = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"](); // cloned pt.
        var groundPointBelowCamera = _Points__WEBPACK_IMPORTED_MODULE_5__["groundPointPickingInfo"](cameraPt);
        if ((groundPointBelowCamera.pickedMesh === null) && (lastCameraName === _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].activeCamera.id)) {
            // You're not above the ground! This shouldn't happen, but it can
            // occasionally. Return the camera to its previous position. One
            // example is if you're using the controllers on a HTC vive to
            // navigate (forward/backward).
            _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["setCameraPosition"](lastCameraPt);
        }
        else {
            lastCameraPt = cameraPt;
            lastCameraName = _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].activeCamera.id;
        }
    });
}
/**
 * Sets up additional triggers.
 * @returns void
 */
function setupTriggers() {
    // Space always triggers
    var body = jQuery("body");
    body.keypress(function (e) {
        if (e.charCode === 32) {
            // Space bar
            actOnStareTrigger();
        }
        else if (e.charCode === 109) {
            // M (open 3d menu).
            _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_7__["openMainMenuFloorButton"].toggled();
        }
    });
    // Mouse clicks are handled elsewhere...
}
var lastTrigger = 0;
/**
 * Triggers an action, based on the mesh you're currently looking at.
 * @returns void
 */
function actOnStareTrigger() {
    if (_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_6__["webrtc"] !== undefined) {
        // If in leader mode, don't ever trigger.
        return;
    }
    // There is a refractory period to prevent rapid trigger fires.
    var curTime = new Date().getTime();
    if (curTime - lastTrigger < 250) {
        return;
    }
    else {
        lastTrigger = curTime;
    }
    // Click, space, or something. You need to decide how to act.
    switch (_Pickables__WEBPACK_IMPORTED_MODULE_4__["getCategoryOfCurMesh"]()) {
        case 2 /* Ground */:
            // It's the ground, so teleport there.
            console.log("teleport");
            teleport();
            break;
        case 4 /* Molecule */:
            // It's a molecule, so increase the height.
            grow();
            break;
        case 3 /* Button */:
            // It's a button. Click function is attached to the mesh (see
            // GUI.ts).
            _Pickables__WEBPACK_IMPORTED_MODULE_4__["curPickedMesh"].clickFunc();
        default:
            // None.
            break;
    }
}
/**
 * Teleport to a given location.
 * @param  {*}         [newLoc=undefined] The new location. Uses stare point
 *                                        if no location given.
 * @param  {Function}  [callBack=]        The callback function once teleport
 *                                        is done.
 * @returns void
 */
function teleport(newLoc, callBack) {
    if (newLoc === void 0) { newLoc = undefined; }
    if (callBack === void 0) { callBack = undefined; }
    currentlyTeleporting = true;
    if (callBack === undefined) {
        callBack = function () { return; };
    }
    // Hide the bigger nav mesh. It will appear again elsewhere.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrHelper"].gazeTrackerMesh.isVisible = false;
    // Animate the transition to the new location.
    /** @const {*} */
    var animationCameraTeleportation = new BABYLON.Animation("animationCameraTeleportation", "position", 90, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    // The start location.
    var startLoc = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
    // Get the new location.
    if (newLoc === undefined) {
        // If it's not defined, use the current stare point.
        newLoc = new BABYLON.Vector3(_Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].x, _Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].y + _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["cameraHeight"], _Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].z);
    }
    // Correct if VR camera.
    var eyeToCamVec = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getVecFromEyeToCamera"]();
    newLoc = newLoc.subtract(eyeToCamVec);
    startLoc = startLoc.subtract(eyeToCamVec);
    // Animate to new location.
    /** @const {Array<Object<string, *>>} */
    var animationCameraTeleportationKeys = [
        { "frame": 0, "value": startLoc },
        { "frame": _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["TRANSPORT_DURATION"], "value": newLoc },
    ];
    animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);
    /** @const {*} */
    var activeCamera = _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].activeCamera;
    activeCamera.animations = [];
    activeCamera.animations.push(animationCameraTeleportation);
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].beginAnimation(activeCamera, 0, _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["TRANSPORT_DURATION"], false, 1, function () {
        // Animation finished callback.
        currentlyTeleporting = false;
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrHelper"].gazeTrackerMesh.isVisible = true;
        // Erase animation
        activeCamera.animations = [];
        callBack();
    });
}
/**
 * Teleport and grow. Fires if you click on a molecular mesh.
 * @returns void
 */
function grow() {
    var ptBelowStarePt = _Points__WEBPACK_IMPORTED_MODULE_5__["groundPointBelowStarePt"];
    // Get the vector form the stare point to the camera.
    var cameraPos = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
    var vecStarePtCamera = _Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].subtract(cameraPos);
    /** @type {number} */
    var vecStarePtDist = vecStarePtCamera.length();
    var newPt;
    if (0.1 * vecStarePtDist < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["MIN_DIST_TO_MOL_ON_TELEPORT"]) {
        // Teleporting 90% of the way would put you too close to the target.
        newPt = _Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].subtract(vecStarePtCamera.normalize().scale(_Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["MIN_DIST_TO_MOL_ON_TELEPORT"]));
    }
    else if (0.1 * vecStarePtDist > _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["MAX_DIST_TO_MOL_ON_TELEPORT"]) {
        // Teleporting 90% of the way would put you too far from the target.
        newPt = _Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].subtract(vecStarePtCamera.normalize().scale(_Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["MAX_DIST_TO_MOL_ON_TELEPORT"]));
    }
    else if (0.1 * vecStarePtDist < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["MAX_DIST_TO_MOL_ON_TELEPORT"]) {
        // Teleporting 90% of the way would put you in the sweet spot. Do
        // that.
        newPt = cameraPos.add(vecStarePtCamera.scale(0.9));
    }
    // Now tweak the height to match the point exactly (not on the line
    // between camera and point).
    newPt.y = _Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].y;
    // You need to make sure the new point isn't within the button sphere at
    // your feet. If not, you could get trapped.
    if (newPt.y - ptBelowStarePt.y < 0.5 * _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["BUTTON_SPHERE_RADIUS"] + 0.1) {
        newPt.y = ptBelowStarePt.y + 0.5 * _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["BUTTON_SPHERE_RADIUS"] + 0.1;
    }
    // Set the new height. 0.01 is important so elipse doesn't get caught on
    // new ground.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["setCameraHeight"](_Points__WEBPACK_IMPORTED_MODULE_5__["curStarePt"].y - ptBelowStarePt.y);
    teleport(newPt, function () {
        // Make sure the collision elipsoid surrounding the non-VR camera
        // matches the new height.
        _Cameras_NonVRCamera__WEBPACK_IMPORTED_MODULE_1__["setCameraElipsoid"]();
    });
}
var captureMouseClicksDiv = undefined;
var currentlyCapturingMouseClicks = false;
/**
 * Setup the ability to capture clicks.
 * @returns void
 */
function setupCaptureMouseClicksOutsideBabylon() {
    // Unfortunately, when you click on phones it takes away control from the
    // orientation sensor. Babylon.js claims to have fixed this, but I don't
    // think it is fixed: https://github.com/BabylonJS/Babylon.js/pull/6042
    // I'm going to detect if it's currently reading from the orientation
    // sensor and throw up a div to capture clicks if it is. A hackish
    // solution that works.
    // Setup div to intercept clicks if needed. Add clear div over canvas.
    captureMouseClicksDiv = jQuery("#capture-clicks");
    // Make it clickable.
    captureMouseClicksDiv.click(function () {
        console.log("clicked!");
        actOnStareTrigger();
    });
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].registerBeforeRender(function () {
        checkCaptureMouseClicksOutsideBabylon();
    });
}
/**
 * Checks if you should currently be capturing clicks. TODO: Should you be
 * checking this with every render? I don't know that it can change, so maybe
 * you just need to check it once? Maybe could be in setTimeout.
 * @returns void
 */
function checkCaptureMouseClicksOutsideBabylon() {
    var deviceOrientation = _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].activeCamera.inputs.attached.deviceOrientation;
    var deviceBeingOriented;
    if (!deviceOrientation) {
        // On htc vive, deviceOrientation does not exist.
        deviceBeingOriented = false;
    }
    else {
        // Check other devices (whether in browser or in cardboard, etc).
        deviceBeingOriented = (deviceOrientation._alpha !== 0) ||
            (deviceOrientation._beta !== 0) ||
            (deviceOrientation._gamma !== 0);
    }
    if (deviceBeingOriented && !currentlyCapturingMouseClicks) {
        currentlyCapturingMouseClicks = true;
        captureMouseClicksDiv.show();
    }
    else if (!deviceBeingOriented && currentlyCapturingMouseClicks) {
        currentlyCapturingMouseClicks = false;
        captureMouseClicksDiv.hide();
    }
    else {
        // console.log("confused");
        // console.log(deviceBeingOriented);
        // console.log(currentlyCapturingMouseClicks);
    }
}
// NOTE THAT THE TRACKPAD-CONTROLED FORWARD MOVEMENTS AND ROTATIONS USED IN VR
// MODE ARE LOCATED IN VRControllers.ts.

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn")))

/***/ }),

/***/ "BjG7":
/*!********************************************!*\
  !*** ./src/components/UI/Menu3D/Styles.ts ***!
  \********************************************/
/*! exports provided: buildStylesSubMenu, updatePastStylesInMenu, updateModelSpecificSelectionsInMenu */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "buildStylesSubMenu", function() { return buildStylesSubMenu; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updatePastStylesInMenu", function() { return updatePastStylesInMenu; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateModelSpecificSelectionsInMenu", function() { return updateModelSpecificSelectionsInMenu; });
/* harmony import */ var _Mols_3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Mols/3DMol/ThreeDMol */ "qmVJ");
/* harmony import */ var _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Mols/3DMol/VisStyles */ "EYe7");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Vars/UrlVars */ "p11u");
/* harmony import */ var _Menu3D__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Menu3D */ "jIpr");




// Define all the possible components.
var components = ["Protein", "Ligand", "Ligand Context", "Water", "Nucleic"];
// For each of those components, get the possible selections.
var selections = {
    "Ligand": ["All"],
    "Ligand Context": ["All"],
    "Nucleic": ["All"],
    "Protein": [
        "All", "Hydrophobic", "Hydrophilic", "Charged", "Aromatic",
    ],
    "Water": ["All"],
};
// For each of those components, specify the associated representations.
var commonReps = ["Stick", "Sphere", "Surface"];
var representations = {
    "Ligand": commonReps,
    "Ligand Context": ["Cartoon"].concat(commonReps),
    "Nucleic": commonReps,
    "Protein": ["Cartoon"].concat(commonReps),
    "Water": commonReps,
};
// You'll need to modify colorSchemeKeyWordTo3DMol in VisStyles.ts too.
var colors = [
    "White", "Red", "Blue", "Green", "Orange", "Yellow", "Purple",
];
var colorSchemes = [
    "Element", "Amino Acid", "Chain", "Nucleic", "Spectrum",
];
/**
 * Makes submenus required for the various style options (reps, colors, etc.).
 * @returns Object
 */
function buildStylesSubMenu() {
    var menu = {
        "Components": {},
        "Selections": {},
        "Clear": function () {
            var fullKeys = Object.keys(_Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["styleMeshes"]);
            var len = fullKeys.length;
            for (var i = 0; i < len; i++) {
                var fullKey = fullKeys[i];
                var styleMesh = _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["styleMeshes"][fullKey];
                styleMesh.mesh.isVisible = false;
            }
            _Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].toggled();
        },
        "Remove Existing": {},
    };
    // Add in the components (ligand, protein, etc).
    /** @type {number} */
    var componentsLen = components.length;
    var _loop_1 = function (i) {
        var component = components[i];
        menu["Components"][component] = {};
        /** @type {number} */
        var selectionsComponentLen = selections[component].length;
        var _loop_2 = function (i2) {
            var selection = selections[component][i2];
            menu["Components"][component][selection] = makeRepColorSchemeSubMenus({}, component, function (rep, colorScheme) {
                _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["toggleRep"]([component, selection], rep, colorScheme);
            });
        };
        for (var i2 = 0; i2 < selectionsComponentLen; i2++) {
            _loop_2(i2);
        }
    };
    for (var i = 0; i < componentsLen; i++) {
        _loop_1(i);
    }
    return menu;
}
/**
 * Populates the portion of the styles menu that lets the user remove old
 * styles.
 * @param  {Object<string,*>} menuInf
 * @returns void
 */
function updatePastStylesInMenu(menuInf) {
    if (_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_2__["checkWebrtcInUrl"]()) {
        // Leader mode. So no need to update menu (it doesn't exist).
        return;
    }
    // Also add in existing styles so they can be removed.
    menuInf["Styles"]["Remove Existing"] = {};
    _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](menuInf["Styles"]["Remove Existing"], ["Styles", "Remove Existing"]);
    var repNames = Object.keys(_Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["styleMeshes"]);
    /** @type {number} */
    var len = repNames.length;
    var _loop_3 = function (i) {
        var repName = repNames[i];
        if (_Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["styleMeshes"][repName].mesh.isVisible === true) {
            var lbl = repName.replace(/--/g, " ");
            lbl = lbl.replace(/{/g, "").replace(/}/g, "").replace(/"/g, "");
            menuInf["Styles"]["Remove Existing"][lbl] = function () {
                _Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].toggled();
                setTimeout(function () {
                    /** @type {Array<*>} */
                    var repInfo = _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_2__["extractRepInfoFromKey"](repName);
                    _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["toggleRep"](repInfo[0], repInfo[1], "Hide");
                }, 0);
            };
        }
    };
    for (var i = 0; i < len; i++) {
        _loop_3(i);
    }
}
/**
 * Populates the portion of the styles menu that has model-specific
 * selections.
 * @param  {Object<string,*>} menuInf
 * @returns void
 */
function updateModelSpecificSelectionsInMenu(menuInf) {
    // Reset this part of the menu.
    menuInf["Styles"]["Selections"] = {};
    _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](menuInf["Styles"]["Selections"], ["Styles", "Selections"]);
    // Selection keywords
    var selKeywords = {
        "Atom Name": "atom",
        "Chain": "chain",
        "Element": "elem",
        "Residue Index": "resi",
        "Residue Name": "resn",
        "Secondary Structure": "ss",
    };
    var maxNumPerGroup = 14;
    /**
     * @param  {string}      component
     * @param  {Object<*,*>} menuBranch
     * @param  {Array<*>}    items
     * @param  {Array<string>} breadcrumbs
     */
    var addToMenuRecurse = function (component, menuBranch, items, breadcrumbs) {
        items.sort(
        /**
         * @param  {number} x
         * @param  {number} y
         * @returns number
         */
        function (x, y) {
            // If either is a string number, convert to number.
            /** @type {number} */
            x = isNaN(+x) ? x : +x;
            /** @type {number} */
            y = isNaN(+y) ? y : +y;
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
        });
        // So divide it into maxNumPerGroup groups.
        var chunks = chunkify(items, maxNumPerGroup);
        // Add the items and recurse if necessary.
        /** @type {number} */
        var chunksLen = chunks.length;
        var _loop_4 = function (i) {
            /** @type {Array<*>} */
            var chunk = chunks[i];
            if (chunk.length === 1) {
                // Just a single item, so make the rep/color submenus.
                var item_1 = chunk[0];
                menuBranch[item_1] = {};
                // MOOSE
                menuBranch[item_1] = makeRepColorSchemeSubMenus(menuBranch[item_1], component, function (rep, colorScheme) {
                    /** @type {string} */
                    var selKeyword = selKeywords[component]; // See ThreeDMol.ts
                    var it = {};
                    it[selKeyword] = item_1;
                    _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["toggleRep"]([it], rep, colorScheme);
                }, breadcrumbs.concat([item_1]));
            }
            else {
                // Multiple items, so it's a category.
                var lbl = "[" + chunk[0].toString() + "-" + chunk[chunk.length - 1].toString() + "]";
                menuBranch[lbl] = {};
                addToMenuRecurse(component, menuBranch[lbl], chunk, breadcrumbs.concat([lbl]));
            }
        };
        for (var i = 0; i < chunksLen; i++) {
            _loop_4(i);
        }
        // Also add in things like back buttons.
        _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](menuBranch, breadcrumbs);
    };
    // Add in selections specific to this protein.
    var cs = Object.keys(_Mols_3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_0__["atomicInfo"]);
    var len = cs.length;
    for (var i = 0; i < len; i++) {
        var component = cs[i];
        // component is like "Element"
        var sels = _Mols_3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_0__["atomicInfo"][component];
        menuInf["Styles"]["Selections"][component] = {};
        addToMenuRecurse(component, menuInf["Styles"]["Selections"][component], sels, ["Styles", "Selections", component]);
    }
}
/**
 * Takes an array and divides it into subarrays that are roughly equally
 * spaced.
 * @param  {Array<*>} arr        The array.
 * @param  {number}   numChunks  The number of subarrays.
 * @returns Array<Array<*>>  An array of arrays.
 */
function chunkify(arr, numChunks) {
    // see
    // https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
    if (numChunks < 2) {
        return [arr];
    }
    var len = arr.length;
    var out = [];
    var i = 0;
    var size;
    if (len % numChunks === 0) {
        size = Math.floor(len / numChunks);
        while (i < len) {
            out.push(arr.slice(i, i += size));
        }
    }
    else {
        while (i < len) {
            size = Math.ceil((len - i) / numChunks--);
            out.push(arr.slice(i, i += size));
        }
    }
    return out;
}
/**
 * Adds representative and color submenus.
 * @param  {Object}        menuBranch      The branch to which to add these
 *                                         submenus.
 * @param  {string}        component       Like "Protein".
 * @param  {Function}      clickFunc       The function to run when the
 *                                         buttons of this submenu are
 *                                         clicked.
 * @param  {Array<string>} [breadcrumbs=]  If given, this is used to add
 *                                         buttons like the Back button.
 * @returns Object                         The submenu object, now updated.
 */
function makeRepColorSchemeSubMenus(menuBranch, component, clickFunc, breadcrumbs) {
    // What representations can you use? Default to Protein because it
    // contains them all.
    /** @type Object<string,*> */
    var repsToUse = (representations[component] === undefined) ?
        representations["Protein"] :
        representations[component]; // Like ["Cartoon"]
    /** @type {number} */
    var repsToUseLen = repsToUse.length;
    var _loop_5 = function (i) {
        /** @type {string} */
        var rep = repsToUse[i];
        menuBranch[rep] = {
            "Colors": {},
            "Color Schemes": {},
        };
        var colorSchemesLen = colorSchemes.length;
        var _loop_6 = function (i_1) {
            /** @type {string} */
            var colorScheme = colorSchemes[i_1];
            menuBranch[rep]["Color Schemes"][colorScheme] = function () {
                clickFunc(rep, colorScheme);
                _Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].toggled();
            };
        };
        for (var i_1 = 0; i_1 < colorSchemesLen; i_1++) {
            _loop_6(i_1);
        }
        /** @type {number} */
        var colorsLen = colors.length;
        var _loop_7 = function (i_2) {
            /** @type {string} */
            var color = colors[i_2];
            menuBranch[rep]["Colors"][color] = function () {
                clickFunc(rep, color);
                _Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].toggled();
            };
        };
        for (var i_2 = 0; i_2 < colorsLen; i_2++) {
            _loop_7(i_2);
        }
        menuBranch[rep]["Hide"] = function () {
            clickFunc(rep, "Hide");
            _Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].toggled();
        };
        // Also add in things like back buttons.
        if (breadcrumbs !== undefined) {
            var newCrumbs = breadcrumbs.concat([rep]);
            _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](menuBranch[rep], newCrumbs);
            newCrumbs = breadcrumbs.concat([rep, "Colors"]);
            var newBranch = menuBranch[rep]["Colors"];
            _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](newBranch, newCrumbs);
            newCrumbs = breadcrumbs.concat([rep, "Color Schemes"]);
            newBranch = menuBranch[rep]["Color Schemes"];
            _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](newBranch, newCrumbs);
        }
    };
    for (var i = 0; i < repsToUseLen; i++) {
        _loop_5(i);
    }
    if (breadcrumbs !== undefined) {
        _Menu3D__WEBPACK_IMPORTED_MODULE_3__["setupSubMenuNavButtons"](menuBranch, breadcrumbs);
    }
    return menuBranch;
}


/***/ }),

/***/ "EYe7":
/*!************************************************!*\
  !*** ./src/components/Mols/3DMol/VisStyles.ts ***!
  \************************************************/
/*! exports provided: styleMeshes, toggleRep */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "styleMeshes", function() { return styleMeshes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggleRep", function() { return toggleRep; });
/* harmony import */ var _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Scene/Optimizations */ "0fSa");
/* harmony import */ var _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../UI/Menu3D/Menu3D */ "jIpr");
/* harmony import */ var _UI_Menu3D_Styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../UI/Menu3D/Styles */ "BjG7");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../Vars/UrlVars */ "p11u");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../Vars/Vars */ "gqHH");
/* harmony import */ var _PositionInScene__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PositionInScene */ "YORc");
/* harmony import */ var _VRML__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./VRML */ "PjGz");
/* harmony import */ var _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../WebRTC/Lecturer */ "mvtX");
// Functions to create a protein visualization using 3DMol.js








var styleMeshes = {};
var selKeyWordTo3DMolSel = {
    // See VMD output TCL files for good ideas. You may nee to look at
    // Styles.ts too.
    "All": {},
    "Protein": { "resn": lAndU(["ALA", "ARG", "ASP", "ASN", "ASX", "CYS",
            "GLN", "GLU", "GLX", "GLY", "HIS", "HSP",
            "HYP", "ILE", "LEU", "LYS", "MET", "PCA",
            "PHE", "PRO", "TRP", "TYR", "VAL", "GLU",
            "SER", "THR", "MSE"]) },
    "Acidic": { "resn": lAndU(["ASP", "GLU"]) },
    "Cyclic": { "resn": lAndU(["HIS", "PHE", "PRO", "TRP", "TYR"]) },
    "Aliphatic": { "resn": lAndU(["ALA", "GLY", "ILE", "LEU", "VAL"]) },
    "Aromatic": { "resn": lAndU(["HIS", "PHE", "TRP", "TYR"]) },
    "Basic": { "resn": lAndU(["ARG", "HIS", "LYS", "HSP"]) },
    "Charged": { "resn": lAndU(["ASP", "GLU", "ARG", "HIS", "LYS", "HSP"]) },
    "Hydrophobic": { "resn": lAndU(["ALA", "LEU", "VAL", "ILE", "PRO", "PHE",
            "MET", "TRP"]) },
    "Neutral": { "resn": lAndU(["VAL", "PHE", "GLN", "TYR", "HIS", "CYS",
            "MET", "TRP", "ASX", "GLX", "PCA", "HYP"]) },
    "Nucleic": { "resn": lAndU(["ADE", "A", "GUA", "G", "CYT", "C", "THY",
            "T", "URA", "U", "DA", "DG", "DC", "DT"]) },
    "Purine": { "resn": lAndU(["ADE", "A", "GUA", "G"]) },
    "Pyrimidine": { "resn": lAndU(["CYT", "C", "THY", "T", "URA", "U"]) },
    "Ions": { "resn": lAndU(["AL", "BA", "CA", "CAL", "CD", "CES", "CLA",
            "CL", "CO", "CS", "CU", "CU1", "CUA", "HG",
            "IN", "IOD", "K", "MG", "MN3", "MO3", "MO4",
            "MO5", "MO6", "NA", "NAW", "OC7", "PB",
            "POT", "PT", "RB", "SOD", "TB", "TL", "WO4",
            "YB", "ZN", "ZN1", "ZN2"]) },
    "Water": { "resn": lAndU(["WAT", "HOH", "TIP", "TIP3"]) },
};
// Add in ligand
selKeyWordTo3DMolSel["Ligand"] = { "not": { "or": [
            selKeyWordTo3DMolSel["Protein"],
            selKeyWordTo3DMolSel["Nucleic"],
            selKeyWordTo3DMolSel["Ions"],
            selKeyWordTo3DMolSel["Water"],
        ] } };
// Add in all within ligand
selKeyWordTo3DMolSel["Ligand Context"] = {
    "byres": true,
    "within": {
        "distance": 4.0,
        "sel": selKeyWordTo3DMolSel["Ligand"],
    },
};
var colorSchemeKeyWordTo3DMol = {
    "Amino Acid": { "colorscheme": "amino" },
    "Blue": { "color": "blue" },
    "Chain": { "colorscheme": "chain" },
    "Element": { "colorscheme": "default" },
    "Green": { "color": "green" },
    "Nucleic": { "colorscheme": "nucleic" },
    "Orange": { "color": "orange" },
    "Purple": { "color": "purple" },
    "Red": { "color": "red" },
    "Spectrum": { "color": "spectrum" },
    "White": { "color": "white" },
    "Yellow": { "color": "yellow" },
};
/**
 * The toggleRep function. Starts the mesh-creation proecss.
 * @param  {Array<*>}            filters        Can include strings (lookup
 *                                              sel in selKeyWordTo3DMolSel).
 *                                              Or a 3DMoljs selection object.
 * @param  {string}              repName        The representative name. Like
 *                                              "Surface".
 * @param  {string}              colorScheme    The name of the color scheme.
 * @param  {Function|undefined}  finalCallback  Callback to run once the mesh
 *                                              is entirely done.
 * @returns void
 */
function toggleRep(filters, repName, colorScheme, finalCallback) {
    if (finalCallback === void 0) { finalCallback = undefined; }
    if (_WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_7__["isLecturerBroadcasting"]) {
        // Let the student know about this change...
        _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_7__["sendToggleRepCommand"](filters, repName, colorScheme);
    }
    // Get the key of this rep request.
    /** @type {Object<string,*>} */
    var keys = getKeys(filters, repName, colorScheme);
    if (finalCallback === undefined) {
        finalCallback = function () { return; };
    }
    // If it's "Hide", then just hide the mesh
    if (colorScheme === "Hide") {
        var fullKeys = Object.keys(styleMeshes);
        var len = fullKeys.length;
        for (var i = 0; i < len; i++) {
            var fullKey = fullKeys[i];
            var styleMesh = styleMeshes[fullKey];
            if (styleMesh.categoryKey === keys.categoryKey) {
                styleMesh.mesh.isVisible = false;
                console.log("Hiding existing mesh...");
            }
        }
        // Still need to position the meshes (hiding some reps could make
        // others bigger).
        _PositionInScene__WEBPACK_IMPORTED_MODULE_5__["positionAll3DMolMeshInsideAnother"](undefined, _Vars_Vars__WEBPACK_IMPORTED_MODULE_4__["scene"].getMeshByName("protein_box"));
        visChanged();
        return;
    }
    // Maybe the mesh has been generated previously. If so, just show that.
    if (styleMeshes[keys.fullKey] !== undefined) {
        styleMeshes[keys.fullKey].mesh.isVisible = true;
        console.log("showing existing mesh...");
        // Still need to position the meshes (hiding some reps could make
        // others bigger).
        _PositionInScene__WEBPACK_IMPORTED_MODULE_5__["positionAll3DMolMeshInsideAnother"](undefined, _Vars_Vars__WEBPACK_IMPORTED_MODULE_4__["scene"].getMeshByName("protein_box"));
        visChanged();
        return;
    }
    // You'll need to use 3DMoljs to generate the mesh, since it's never been
    // generated before. First remove all representations from existing
    // 3Dmoljs.
    _VRML__WEBPACK_IMPORTED_MODULE_6__["resetAll"]();
    // Make the new representation.
    /** @type {string} */
    var colorSccheme = colorSchemeKeyWordTo3DMol[colorScheme];
    var sels = { "and": filters.map(function (i) {
            // "i" can be a keyword or a selection json itself.
            return (selKeyWordTo3DMolSel[i] !== undefined) ? selKeyWordTo3DMolSel[i] : i;
        }) };
    if (repName.toLowerCase() === "surface") {
        _VRML__WEBPACK_IMPORTED_MODULE_6__["addSurface"](colorSccheme, sels, function () {
            toggleRepContinued(keys, repName, finalCallback);
        });
    }
    else {
        var rep = {};
        rep[repName.toLowerCase()] = colorSccheme;
        _VRML__WEBPACK_IMPORTED_MODULE_6__["setStyle"](sels, rep);
        toggleRepContinued(keys, repName, finalCallback);
    }
}
/**
 * Continues the toggleRep function.
 * @param  {Object<string,*>}    keys
 * @param  {string}              repName        The representative name. Like
 *                                              "Surface".
 * @param  {Function|undefined}  finalCallback  Callback to run once the mesh
 *                                              is entirely done.
 * @returns void
 */
function toggleRepContinued(keys, repName, finalCallback) {
    _VRML__WEBPACK_IMPORTED_MODULE_6__["render"](true, repName, function (newMesh) {
        // Remove any other meshes that have the same category key (so could
        // be different color... that would be removed.)
        var ks = Object.keys(styleMeshes);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var key = ks[i];
            var styleMesh = styleMeshes[key];
            if (styleMesh.categoryKey === keys.categoryKey) {
                _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__["removeMeshEntirely"](styleMesh.mesh);
                delete styleMeshes[key];
                console.log("deleting old mesh...");
            }
        }
        if (newMesh !== undefined) {
            // newMesh is undefined if you tried to select something not
            // present in the scene (e.g., trying to select nucleic when there
            // is no nucleic in the model).
            // If the new mesh is a surface, make it so each triangle is two
            // sided and delete the surface from 3Dmoljs instance (cleanup).
            if (repName === "Surface") {
                newMesh.material.backFaceCulling = false;
            }
            // Add this new one.
            styleMeshes[keys.fullKey] = {
                categoryKey: keys.categoryKey,
                mesh: newMesh,
            };
        }
        visChanged();
        finalCallback();
        console.log("added new mesh");
    });
}
/**
 * Get keys to uniquelty describe a given representations.
 * @param  {Array<string|Object>} filters      Selections. Can be keywords or
 *                                             3dmoljs selection objects.
 * @param  {string}               repName      The name of the representation,
 *                                             e.g., "Cartoon".
 * @param  {string}               colorScheme  The color style keyword.
 * @returns {Object<string,*>}
 */
function getKeys(filters, repName, colorScheme) {
    filters.sort();
    var filtersStr = filters.map(function (f) {
        if (typeof f === "string") {
            return f;
        }
        else {
            return JSON.stringify(f);
        }
    }); // In case some JSON selections.
    return {
        categoryKey: filtersStr.join("--") + "--" + repName,
        fullKey: filtersStr.join("--") + "--" + repName + "--" + colorScheme,
    };
}
/**
 * Also adds upper and lower versions of elements in a list.
 * @param  {Array<string>} lst  The original list.
 * @returns {Array<string>}  The list with uppercase and lowercase items also added.
 */
function lAndU(lst) {
    var newLst = lst.map(function (s) { return s; });
    var len = lst.length;
    for (var i = 0; i < len; i++) {
        var s = lst[i];
        newLst.push(s.toUpperCase());
        newLst.push(s.toLowerCase());
    }
    // See https://gomakethings.com/removing-duplicates-from-an-array-with-vanilla-javascript/
    newLst = newLst.filter(function (item, index) {
        return newLst.indexOf(item) >= index;
    });
    return newLst;
}
/**
 * This runs whenever a visualization changes, no matter how it changes.
 * @returns void
 */
function visChanged() {
    // Update the URL
    _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__["setURL"]();
    // Recalculate the past-styles section of the menu.
    _UI_Menu3D_Styles__WEBPACK_IMPORTED_MODULE_2__["updatePastStylesInMenu"](_UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_1__["menuInf"]);
}


/***/ }),

/***/ "MD2z":
/*!********************************************!*\
  !*** ./src/components/UI/Menu3D/Button.ts ***!
  \********************************************/
/*! exports provided: ButtonWrapper */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ButtonWrapper", function() { return ButtonWrapper; });
/* harmony import */ var _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Navigation/Pickables */ "TqLJ");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Vars/Vars */ "gqHH");
/* harmony import */ var _Menu3D__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Menu3D */ "jIpr");



var btnScale = new BABYLON.Vector3(0.75, 0.75, 0.75);
var ButtonWrapper = /** @class */ (function () {
    /**
     * The constructor.
     * @param  {Object<string,*>} params
     * @constructor
     */
    function ButtonWrapper(params) {
        var _this = this;
        // Make the button
        this.button = new BABYLON.GUI.HolographicButton(params.name);
        params.panel.addControl(this.button);
        // Make the possible materials (different colors).
        this.makeColorMats();
        // Change button color if appropriate.
        if (params.color !== undefined) {
            this.updateColor(params.color);
        }
        // Save the level.
        this.level = params.level;
        // Make a text block
        this.textBlock = new BABYLON.GUI.TextBlock();
        this.textBlock.color = "white";
        this.textBlock.resizeToFit = true;
        // Save the value and text, etc.
        this.value = params.default;
        this.trueTxt = params.trueTxt;
        this.falseTxt = params.falseTxt;
        this.clickFunc = params.clickFunc;
        // Update the text.
        this.updateTxt();
        this.button.scaling = btnScale.clone();
        // Make the button clickable. No. It is the sphere that will trigger
        // this... So commented out.
        // this.button.onPointerClickObservable.add((e) => {
        // this.toggled();
        // });
        // Make a mesh that surrounds the button. It actually triggers the
        // click.
        this.containingMesh = BABYLON.Mesh.CreateSphere(params.name + "-container-mesh", 2, _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["BUTTON_SPHERE_RADIUS"], _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"]);
        this.containingMesh.position = this.button.node.absolutePosition;
        this.containingMesh.visibility = 0;
        this.containingMesh.scaling = btnScale.clone();
        // Add a clicking function to the mesh.
        this.containingMesh.clickFunc = function () {
            _this.toggled();
        };
        // Add the mesh to the list of ones that are pickable.
        _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_0__["addPickableButton"](this.containingMesh);
        if (params.initFunc !== undefined) {
            params.initFunc(this);
        }
    }
    /**
     * Updates the button color.
     * @param color string
     */
    ButtonWrapper.prototype.updateColor = function (color) {
        switch (color) {
            case "default":
                this.button.mesh.material = this.defaultMat;
                break;
            case undefined: // Also default
                this.button.mesh.material = this.defaultMat;
                break;
            case "green":
                this.button.mesh.material = this.greenMat;
                break;
            case "yellow":
                this.button.mesh.material = this.yellowMat;
                break;
            case "red":
                this.button.mesh.material = this.redMat;
                break;
            default:
        }
    };
    /**
     * Determines if this button is visible.
     * @param  {boolean} [val=] Whether this button is visible.
     * @returns void
     */
    ButtonWrapper.prototype.isVisible = function (val) {
        if (val === undefined) {
            // A getter
            return this.button.isVisible;
        }
        else {
            // A setter. Note that this doesn't affect visibility on meshes
            // (they could be entirely transparent).
            this.button.isVisible = val;
            this.containingMesh.isVisible = val;
        }
    };
    /**
     * Toggle whether this button is visible.
     * @returns void
     */
    ButtonWrapper.prototype.toggled = function () {
        // Play the sound.
        _Menu3D__WEBPACK_IMPORTED_MODULE_2__["clickSound"].setPosition(this.containingMesh.position.clone());
        _Menu3D__WEBPACK_IMPORTED_MODULE_2__["clickSound"].play();
        // Switch value.
        /** @type {boolean} */
        this.value = !this.value;
        // Fire the user-defined trigger.
        this.clickFunc(this);
        // Update the text.
        this.updateTxt();
    };
    /**
     * Sets the text on this button.
     * @param {string=} txt  The text to update. If undefined, gets it based
     *                       on the value, trueTxt, and falseTxt variables.
     * @returns void
     */
    ButtonWrapper.prototype.updateTxt = function (txt) {
        if (txt === undefined) {
            this.textBlock.text = this.value ? this.trueTxt : this.falseTxt;
        }
        else {
            this.textBlock.text = txt;
            this.trueTxt = txt;
            this.falseTxt = txt;
        }
        this.textBlock.text = this.wrap(this.textBlock.text, 25);
        this.button.content.dispose();
        this.button.content = this.textBlock;
    };
    /**
     * Wrap the text to keep it from getting too long.
     * @param {stirng} s  The string to wrap.
     * @param {number} w  The width.
     * @returns {string} The wrapped text.
     */
    ButtonWrapper.prototype.wrap = function (s, w) {
        return s.replace(new RegExp("(?![^\\n]{1," + w + "}$)([^\\n]{1," + w + "})\\s", "g"), "$1\n");
    };
    /**
     * Make variously colored materials for the different kinds of menu
     * buttons.
     * @returns void
     */
    ButtonWrapper.prototype.makeColorMats = function () {
        /** @const {number} */
        var colorDelta = 0.1;
        this.defaultMat = this.button.mesh.material;
        this.greenMat = this.button.mesh.material.clone();
        this.greenMat.albedoColor = new BABYLON.Color3(0.3, 0.35 + colorDelta, 0.4);
        this.yellowMat = this.button.mesh.material.clone();
        this.yellowMat.albedoColor = new BABYLON.Color3(0.3 + colorDelta, 0.35 + colorDelta, 0.4);
        this.redMat = this.button.mesh.material.clone();
        this.redMat.albedoColor = new BABYLON.Color3(0.3 + colorDelta, 0.35, 0.4);
    };
    return ButtonWrapper;
}());



/***/ }),

/***/ "O2BG":
/*!***********************************************************!*\
  !*** ./src/components/UI/Menu3D/staple-public-domain.mp3 ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cf4bd43cd8dade4b62f7e691f5d0f8cc.mp3";

/***/ }),

/***/ "PjGz":
/*!*******************************************!*\
  !*** ./src/components/Mols/3DMol/VRML.ts ***!
  \*******************************************/
/*! exports provided: molRotation, viewer, setup, resetAll, loadPDBURL, setStyle, addSurface, render, importIntoBabylonScene, updateMolRotation, setMolRotation */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery, $3Dmol) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "molRotation", function() { return molRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewer", function() { return viewer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetAll", function() { return resetAll; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadPDBURL", function() { return loadPDBURL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStyle", function() { return setStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addSurface", function() { return addSurface; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "importIntoBabylonScene", function() { return importIntoBabylonScene; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateMolRotation", function() { return updateMolRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMolRotation", function() { return setMolRotation; });
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Vars/UrlVars */ "p11u");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Vars/Vars */ "gqHH");
/* harmony import */ var _Load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Load */ "cw8d");
/* harmony import */ var _PositionInScene__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PositionInScene */ "YORc");
/* harmony import */ var _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../UI/OpenPopup/OpenPopup */ "iC5T");
// An module to manage VRML data obtained from 3Dmol.js. Assumes the 3Dmol.js
// javascript file is already loaded.





/** @type {Array<Object<string,*>>} */
var modelData = [];
var molRotation = new BABYLON.Vector3(0, 0, 0);
var viewer;
var element;
/** @type {Object<string,string>} */
var config;
/** @type {string} */
var vrmlStr;
var vrmlParserWebWorker = new Worker("vrmlWebWorker.js");
var molTxt = "";
var molTxtType = "pdb";
var hasActiveSurface = false;
/**
 * Setup the ability to work with 3Dmol.js.
 * @param  {Function} callBack  Runs once the iframe is loaded is loaded.
 * @returns void
 */
function setup(callBack) {
    // Deactivate 3Dmol.js tracking. This is now done via manual modifications
    // to the vendor.js code itself.
    // $3Dmol["notrack"] = true;
    // Add a container for 3dmoljs.
    addDiv();
    // Make the viewer object.
    element = jQuery("#mol-container");
    config = { backgroundColor: "white" };
    viewer = $3Dmol.createViewer(element, config);
    window["viewer"] = viewer; // For debugging.
    callBack();
}
/**
 * Add (or readd) div 3DMoljs div.
 * @returns void
 */
function addDiv() {
    var molContainer = jQuery("#mol-container");
    if (molContainer) {
        molContainer.remove();
    }
    var extraStyle = "display:none;";
    jQuery("body").append("<div\n        id=\"mol-container\"\n        class=\"mol-container\"\n        style=\"" + extraStyle + "\"></div>");
}
/**
 * Resets the 3Dmol.js visualization.
 * @returns void
 */
function resetAll() {
    if (hasActiveSurface) {
        hasActiveSurface = false;
        // I can't get rid of the surfaces without causing
        // problems. I'm just going to go nuclear and reload the
        // whole thing.
        viewer = null;
        setup(function () {
            viewer.addModel(molTxt, "pdb");
        });
    }
    viewer.setStyle({}, {});
}
/**
 * Load a file into the 3dmol object.
 * @param  {string}   url       The url.
 * @param  {Function} callBack  A callback function. The 3DMoljs molecule
 *                              object is the parameter.
 * @returns void
 */
function loadPDBURL(url, callBack) {
    jQuery.ajax(url, {
        /**
         * When the url data is retrieved.
         * @param  {string} data  The remote data.
         * @returns void
         */
        "success": function (data) {
            // Setup the visualization
            /** @type {string} */
            molTxt = data; // In case you need to restart.
            molTxtType = "pdb";
            if (url.slice(url.length - 3).toLowerCase() === "sdf") {
                molTxtType = "sdf";
            }
            var mdl = viewer.addModel(data, molTxtType);
            callBack(mdl);
        },
        /**
         * If there's an error...
         * @param  {*}       hdr
         * @param  {*}       status
         * @param  {string}  err
         */
        "error": function (hdr, status, err) {
            var msg = "<p>Could not load molecule: " + url + "</p>";
            msg += "<p><pre>" + err + "</pre></p>";
            msg += '<p>(<a href="' + window.location.href.split("?")[0] + '">Click to restart...</a>)</p>';
            _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_4__["openModal"]("Error Loading Molecule", msg, false, false);
        },
    });
}
/**
 * Set the style on the 3DMoljs viewer.
 * @param  {Object<string,*>} sels  A selection object.
 * @param  {Object<string,*>} rep   A representation object.
 * @returns void
 */
function setStyle(sels, rep) {
    // If the selection looks like {"and":[{}, {...}]}, simplify it.
    if ((sels["and"] !== undefined) && // "and" is a key
        (Object.keys(sels).length === 1) && // it is the only key
        (JSON.stringify(sels["and"][0]) === "{}") && // it points to a list with {} as first item.
        (sels["and"].length === 2)) { // that list has only to elements
        sels = sels["and"][1];
    }
    viewer.setStyle(sels, rep);
    viewer.render();
}
/**
 * Add a surface to the 3DMoljs viewer.
 * @param  {Object<string,*>} colorScheme  A colorscheme object.
 * @param  {Object<string,*>} sels         A selection object.
 * @param  {Function}         callBack     A callback function.
 * @returns void
 */
function addSurface(colorScheme, sels, callBack) {
    hasActiveSurface = true;
    viewer.addSurface($3Dmol.SurfaceType.MS, colorScheme, sels, undefined, undefined, function () {
        callBack();
    });
}
/**
 * Sets the 3dmol.js style. Also generates a vrml string and values.
 * @param  {boolean}    updateData  Whether to update the underlying data with
 *                                  this visualization. True by default.
 * @param  {string}     repName     The representative name. Like "Surface".
 * @param  {Function=}  callBack    The callback function, with the new mesh
 *                                  as a parameter.
 * @returns void
 */
function render(updateData, repName, callBack) {
    if (callBack === void 0) { callBack = function () { return; }; }
    // Make sure there are no waiting menus up and running. Happens some
    // times.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["engine"].hideLoadingUI();
    if (updateData) {
        // Load the data.
        loadVRMLFrom3DMol(function () {
            loadValsFromVRML(repName, function () {
                // Could modify coordinates before importing into babylon
                // scene, so comment out below. Changed my mind the kinds of
                // manipulations above should be performed on the mesh.
                // Babylon is going to have better functions for this than I
                // can come up with.
                var newMesh = importIntoBabylonScene();
                if (newMesh !== undefined) {
                    // It's undefined if, for example, trying to do cartoon on
                    // ligand.
                    _PositionInScene__WEBPACK_IMPORTED_MODULE_3__["positionAll3DMolMeshInsideAnother"](newMesh, _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].getMeshByName("protein_box"));
                }
                callBack(newMesh); // Cloned so it won't change with new rep in future.
                // Clean up.
                modelData = [];
            });
        });
    }
}
/**
 * Loads the VRML string from the 3Dmol instance.
 * @param  {Function=}  callBack    The callback function.
 * @returns void
 */
function loadVRMLFrom3DMol(callBack) {
    // Make the VRML string from that model.
    /** @type {string} */
    vrmlStr = viewer.exportVRML();
    callBack();
}
/**
 * Load in values like coordinates and colors from the VRML string.
 * @param  {string}    repName   The representative name. Like "Surface".
 * @param  {Function}  callBack  A callback function.
 * @returns void
 */
function loadValsFromVRML(repName, callBack) {
    // Clear previous model data.
    modelData = [];
    if (typeof (Worker) !== "undefined") {
        vrmlParserWebWorker.onmessage = function (event) {
            // Msg back from web worker
            /** @type {Object<string,*>} */
            var resp = event.data;
            var chunk = resp["chunk"];
            /** @type {string} */
            var status = resp["status"];
            if (chunk !== undefined) {
                /** @type {number} */
                var modelIdx = chunk[0];
                /** @type {string} */
                var dataType = chunk[1];
                var vals = chunk[2];
                if (modelData.length === modelIdx) {
                    modelData.push({
                        "coors": new Float32Array(0),
                        "colors": new Float32Array(0),
                        "trisIdxs": new Uint32Array(0),
                    });
                }
                modelData[modelIdx][dataType] = typedArrayConcat(dataType === "trisIdxs" ? Uint32Array : Float32Array, [modelData[modelIdx][dataType], vals]);
            }
            switch (status) {
                case "more":
                    // There's more data. Request it now.
                    vrmlParserWebWorker.postMessage({
                        "cmd": "sendDataChunk",
                        "data": undefined,
                    });
                    break;
                case "done":
                    // No more data. Run the callback.
                    callBack();
                    break;
                default:
                    console.log("Error here!");
            }
        };
        // Send message to web worker.
        // debugger;
        vrmlParserWebWorker.postMessage({
            "cmd": "start",
            "data": vrmlStr,
            "removeExtraPts": (repName === "Stick"),
        });
    }
    else {
        // Sorry! No Web Worker support..
        _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_4__["openModal"]("Browser Error", "Your browser does not support web workers. Please use a more\n            modern browser when running ProteinVR.", false);
        throw new Error("Browser does not support web workers.");
        // Comment below if you ever want to try to make it work without web
        // workers...
        // modelData = VRMLParserWebWorker.loadValsFromVRML(vrmlStr);
        // callBack();
    }
}
/**
 * Concatonates a list of typed arrays.
 * @param  {*}        resultConstructor  The type of array. E.g., Uint8Array.
 * @param  {Array<*>} listOfArrays       A list of typed arrays to
 *                                       concatonate.
 * @returns {*} The typed array.
 */
function typedArrayConcat(resultConstructor, listOfArrays) {
    // See http://2ality.com/2015/10/concatenating-typed-arrays.html
    var totalLength = 0;
    /** @type {number} */
    var listOfArraysLen = listOfArrays.length;
    for (var i = 0; i < listOfArraysLen; i++) {
        /** @type {Array<*>} */
        var arr = listOfArrays[i];
        totalLength += arr.length;
    }
    var result = new resultConstructor(totalLength);
    var offset = 0;
    for (var i = 0; i < listOfArraysLen; i++) {
        /** @type {Array<*>} */
        var arr = listOfArrays[i];
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
/**
 * Creates a babylonjs object from the values and adds it to the babylonjs
 * scene.
 * @returns {*} The new mesh from the 3dmoljs instance.
 */
function importIntoBabylonScene() {
    // The material to add to all meshes.
    var mat = new BABYLON.StandardMaterial("Material", _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"]);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    var meshes = [];
    /** @type {number} */
    var len = modelData.length;
    for (var modelIdx = 0; modelIdx < len; modelIdx++) {
        var modelDatum = modelData[modelIdx];
        // Calculate normals instead? It's not necessary. Doesn't chang over
        // 3dmoljs calculated normals.
        var norms = [];
        BABYLON.VertexData.ComputeNormals(modelDatum["coors"], modelDatum["trisIdxs"], norms);
        // Compile all that into vertex data.
        var vertexData = new BABYLON.VertexData();
        vertexData["positions"] = modelDatum["coors"]; // In quotes because from webworker (external)
        vertexData["indices"] = modelDatum["trisIdxs"];
        vertexData["normals"] = norms;
        vertexData["colors"] = modelDatum["colors"];
        // Make the new mesh
        var babylonMeshTmp = new BABYLON.Mesh("mesh_3dmol_tmp" + modelIdx, _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"]);
        vertexData.applyToMesh(babylonMeshTmp);
        // Add a material.
        babylonMeshTmp.material = mat;
        // babylonMeshTmp.showBoundingBox = true;
        meshes.push(babylonMeshTmp);
    }
    var babylonMesh;
    if (meshes.length > 0) {
        // Merge all these meshes.
        // https://doc.babylonjs.com/how_to/how_to_merge_meshes
        babylonMesh = BABYLON.Mesh.MergeMeshes(meshes, true, true); // dispose of source and allow 32 bit integers.
        // babylonMesh = meshes[0];
        babylonMesh.name = "MeshFrom3DMol" + Math.random().toString();
        babylonMesh.id = babylonMesh.name;
        // Work here
        _Load__WEBPACK_IMPORTED_MODULE_2__["setupMesh"](babylonMesh, 123456789);
    }
    return babylonMesh;
}
/**
 * Rotate the molecular meshes.
 * @param  {string} axis    The axis. "x", "y", or "z".
 * @param  {number} amount  The amount. In radians, I think.
 * @returns void
 */
function updateMolRotation(axis, amount) {
    molRotation[axis] += amount;
    // Update URL too.
    _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_0__["setURL"]();
}
/**
 * Sets the molRotation object externally. Does not actually rotate anything.
 * @param  {number} x  Rotation about x axis.
 * @param  {number} y  Rotation about y axis.
 * @param  {number} z  Rotation about z axis.
 * @returns void
 */
function setMolRotation(x, y, z) {
    molRotation = new BABYLON.Vector3(x, y, z);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn"), __webpack_require__(/*! 3dmol */ "VS3o")))

/***/ }),

/***/ "Rr3C":
/*!*********************************************!*\
  !*** ./src/components/UI/LoadingScreens.ts ***!
  \*********************************************/
/*! exports provided: removeLoadingJavascriptScreen, babylonJSLoadingMsg, startFakeLoading, stopFakeLoading */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeLoadingJavascriptScreen", function() { return removeLoadingJavascriptScreen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "babylonJSLoadingMsg", function() { return babylonJSLoadingMsg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startFakeLoading", function() { return startFakeLoading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopFakeLoading", function() { return stopFakeLoading; });
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");

var intervalID;
/**
 * Removes the initial loading screen, to let the user know that the initial
 * javascript file is loading.
 * @returns void
 */
function removeLoadingJavascriptScreen() {
    // Remove the initial loading javascript screen (not the babylonjs loading
    // screen... That's to come).
    document.getElementById("loadingContainer").outerHTML = "";
}
/**
 * Update the text displayed on the babylonjs loading scene.
 * @param  {string} msg  The text to update.
 * @returns void
 */
function babylonJSLoadingMsg(msg) {
    // Just to make sure there isn't a fight between the two ways of showing
    // babylonjs loading messages.
    stopFakeLoading();
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["engine"].displayLoadingUI(); // Keep it up while progressing...
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["engine"].loadingUIText = msg;
}
/**
 * Starts the fake loading screen, to give the impression that things are
 * loading.
 * @param  {number} initialVal  The initial fake value (%).
 * @returns void
 */
function startFakeLoading(initialVal) {
    var fakeVal = initialVal;
    clearInterval(intervalID);
    intervalID = setInterval(function () {
        fakeVal = fakeVal + 0.02 * (99 - fakeVal);
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["engine"].displayLoadingUI(); // Keep it up while progressing...
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["engine"].loadingUIText = "Loading the main scene... " + fakeVal.toFixed(0) + "%";
    }, 100);
}
/**
 * Stop the fake-loading splash screen.
 * @returns void
 */
function stopFakeLoading() {
    clearInterval(intervalID);
}


/***/ }),

/***/ "TqLJ":
/*!************************************************!*\
  !*** ./src/components/Navigation/Pickables.ts ***!
  \************************************************/
/*! exports provided: padNavSphereAroundCamera, setCurPickedMesh, curPickedMesh, setup, addPickableButton, addPickableMolecule, checkIfMeshPickable, getCategoryOfCurMesh, makeMeshMouseClickable, makePadNavigationSphereAroundCamera */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "padNavSphereAroundCamera", function() { return padNavSphereAroundCamera; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCurPickedMesh", function() { return setCurPickedMesh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "curPickedMesh", function() { return curPickedMesh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addPickableButton", function() { return addPickableButton; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addPickableMolecule", function() { return addPickableMolecule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkIfMeshPickable", function() { return checkIfMeshPickable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCategoryOfCurMesh", function() { return getCategoryOfCurMesh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeMeshMouseClickable", function() { return makeMeshMouseClickable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makePadNavigationSphereAroundCamera", function() { return makePadNavigationSphereAroundCamera; });
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Cameras/CommonCamera */ "vCcv");
/* harmony import */ var _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Scene/Optimizations */ "0fSa");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _Navigation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Navigation */ "9bcR");
// This module includes functions to manage which meshes in the scene are
// pickable.




var pickableMeshes = [];
var pickableButtons = [];
var pickableMolecules = [];
// A sphere placed around the camera to aid navigation.
var padNavSphereAroundCamera;
/**
 * Sets the currently picked mesh.
 * @param  {*} mesh The mesh.
 */
function setCurPickedMesh(mesh) { curPickedMesh = mesh; }
var curPickedMesh;
/**
 * Sets up the pickables.
 * @returns void
 */
function setup() {
    pickableMeshes.push(_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].groundMesh);
}
/**
 * Adds a mesh to the list of pickable buttons.
 * @param  {*} mesh The mesh.
 * @returns void
 */
function addPickableButton(mesh) {
    pickableMeshes.push(mesh);
    pickableButtons.push(mesh);
    _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_1__["optimizeMeshPicking"](mesh);
    makeMeshMouseClickable({
        mesh: mesh,
        callBack: function () {
            // Here click the button rather than acting on the stare point
            // (default).
            mesh.clickFunc();
        },
    });
}
/**
 * Adds a mesh to the list of pickable molecule meshes.
 * @param  {*} mesh The mesh.
 * @returns void
 */
function addPickableMolecule(mesh) {
    pickableMeshes.push(mesh);
    pickableMolecules.push(mesh);
    _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_1__["optimizeMeshPicking"](mesh);
    makeMeshMouseClickable({ mesh: mesh });
}
/**
 * Determines if a given mesh is pickable.
 * @param  {*} mesh The mesh.
 * @returns boolean True if it is pickable. False otherwise.
 */
function checkIfMeshPickable(mesh) {
    // Floor is always pickable, even if not visible.
    if (mesh.id === _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].groundMesh.id) {
        return true;
    }
    // If not visible, then not pickable. Note that something could be
    // entirely transparent (visibility is 0), but it will still intercept the
    // stare point. This is by design.
    if (!mesh.isVisible) {
        return false;
    }
    // Otherwise, pick only if in the list.
    return pickableMeshes.indexOf(mesh) !== -1;
}
/**
 * Get the category of the currently selected mesh.
 * @returns number The category.
 */
function getCategoryOfCurMesh() {
    if (curPickedMesh === undefined) {
        return 1 /* None */;
    }
    else if (curPickedMesh === _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].groundMesh) {
        return 2 /* Ground */;
    }
    else if (pickableButtons.indexOf(curPickedMesh) !== -1) {
        return 3 /* Button */;
    }
    else if (pickableMolecules.indexOf(curPickedMesh) !== -1) {
        return 4 /* Molecule */;
    }
    else if (curPickedMesh === padNavSphereAroundCamera) {
        return 5 /* padNavSphereAroundCamera */;
    }
    else {
        return 1 /* None */;
    }
}
/**
 * Make it so a given mesh can be clicked with the mouse.
 * @param  {Object<string,*>} params The parameters. See interface above.
 * @returns void
 */
function makeMeshMouseClickable(params) {
    if (params.callBack === undefined) {
        params.callBack = _Navigation__WEBPACK_IMPORTED_MODULE_3__["actOnStareTrigger"];
    }
    if (params.scene === undefined) {
        params.scene = _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"];
    }
    if (params.mesh === undefined) {
        return;
    }
    params.mesh.actionManager = new BABYLON.ActionManager(params.scene);
    params.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        // If it's in VR mode, there are no mouse clicks. This is
        // important to prevent a double click with controllers.
        if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].navMode !== 3 /* NoVR */) {
            return;
        }
        params.callBack();
    }));
}
/**
 * Places a cube around the canmera so you can navegate even when not pointing
 * at a molecule or anything. Good for pad-based navigation, but not
 * teleportation.
 * @returns void
 */
function makePadNavigationSphereAroundCamera() {
    padNavSphereAroundCamera = BABYLON.Mesh.CreateSphere("padNavSphereAroundCamera", 4, _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["MAX_TELEPORT_DIST"] - 1.0, _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"]);
    padNavSphereAroundCamera.flipFaces(true);
    var mat = new BABYLON.StandardMaterial("padNavSphereAroundCameraMat", _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"]);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    mat.opacityTexture = null;
    padNavSphereAroundCamera.material = mat;
    padNavSphereAroundCamera.visibility = 0.0; // It's an invisible sphere.
    // Doing it this way so follows camera even if camera changes.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].registerBeforeRender(function () {
        padNavSphereAroundCamera.position = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
    });
    // It needs to be pickable
    pickableMeshes.push(padNavSphereAroundCamera);
    // Pretend like it's a molecule. Teleportation will be disabled elsewhere.
    // addPickableMolecule(padNavSphereAroundCamera);
}


/***/ }),

/***/ "YORc":
/*!******************************************************!*\
  !*** ./src/components/Mols/3DMol/PositionInScene.ts ***!
  \******************************************************/
/*! exports provided: lastRotationBeforeAnimation, positionAll3DMolMeshInsideAnother */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lastRotationBeforeAnimation", function() { return lastRotationBeforeAnimation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "positionAll3DMolMeshInsideAnother", function() { return positionAll3DMolMeshInsideAnother; });
/* harmony import */ var _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Scene/Optimizations */ "0fSa");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Vars/Vars */ "gqHH");
/* harmony import */ var _VisStyles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./VisStyles */ "EYe7");
/* harmony import */ var _VRML__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./VRML */ "PjGz");




var lastRotationBeforeAnimation = new BABYLON.Vector3(0, 0, 0);
var lastRotationVec = undefined;
var cachedDeltaYs = {};
/**
 * Positions a given molecular mesh within a specified box.
 * @param  {*}         babylonMesh       The molecular mesh.
 * @param  {*}         otherBabylonMesh  The box.
 * @param  {boolean=}  animate           Whether to animate the mesh, to move
 *                                       it to the new position. Defaults to
 *                                       false.
 * @returns void
 */
function positionAll3DMolMeshInsideAnother(babylonMesh, otherBabylonMesh, animate) {
    if (animate === void 0) { animate = false; }
    /** @type {Array<*>} */
    var allVisMolMeshes = getVisibleMolMeshes(babylonMesh);
    // Save all information about each of the visible meshes, for later
    // animation.
    if (lastRotationVec === undefined) {
        lastRotationVec = _VRML__WEBPACK_IMPORTED_MODULE_3__["molRotation"].clone();
    }
    var allVisMolMeshesInfo = allVisMolMeshes.map(function (m) {
        return {
            mesh: m,
            position: m.position.clone(),
            rotation: lastRotationVec.clone(),
            scaling: m.scaling.clone(),
        };
    });
    lastRotationVec = _VRML__WEBPACK_IMPORTED_MODULE_3__["molRotation"].clone();
    if (allVisMolMeshes.length === 0) {
        // No meshes to show.
        return;
    }
    resetMeshes(allVisMolMeshes);
    // Render to update the meshes
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].render(); // Needed to get bounding box to recalculate.
    // Get the bounding box of the other mesh and it's dimensions
    // (protein_box).
    var targetBox = otherBabylonMesh.getBoundingInfo().boundingBox;
    var targetBoxDimens = Object.keys(targetBox.maximumWorld).map(function (k) { return targetBox.maximumWorld[k] - targetBox.minimumWorld[k]; });
    // Get the molecular model with the biggest volume.
    var maxVol = 0.0;
    var thisBox;
    /** @type {Array<number>} */
    var thisBoxDimens;
    var thisMesh; // biggest mesh
    /** @type {number} */
    var allVisMolMeshesLen = allVisMolMeshes.length;
    var _loop_1 = function (i) {
        var allVisMolMesh = allVisMolMeshes[i];
        // Get the bounding box of this mesh.
        var thisBoxTmp = allVisMolMesh.getBoundingInfo().boundingBox;
        var thisBoxDimensTmp = Object.keys(thisBoxTmp.maximumWorld).map(function (k) { return thisBoxTmp.maximumWorld[k] - thisBoxTmp.minimumWorld[k]; });
        var volume = thisBoxDimensTmp[0] * thisBoxDimensTmp[1] * thisBoxDimensTmp[2];
        if (volume > maxVol) {
            maxVol = volume;
            thisBox = thisBoxTmp;
            thisBoxDimens = thisBoxDimensTmp;
            thisMesh = allVisMolMesh; // biggest mesh
        }
    };
    for (var i = 0; i < allVisMolMeshesLen; i++) {
        _loop_1(i);
    }
    // Get the scales
    var scales = targetBoxDimens.map(function (targetBoxDimen, i) {
        return targetBoxDimen / thisBoxDimens[i];
    });
    // Get the minimum scale
    var minScale = Math.min.apply(null, scales);
    var meshScaling = new BABYLON.Vector3(minScale, minScale, minScale);
    // Scale the meshes.
    for (var i = 0; i < allVisMolMeshesLen; i++) {
        var allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.scaling = meshScaling;
    }
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].render(); // Needed to get bounding box to recalculate.
    // Translate the meshes.
    var meshTranslation = thisBox.centerWorld.subtract(targetBox.centerWorld);
    for (var i = 0; i < allVisMolMeshesLen; i++) {
        var allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
    }
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].render(); // Needed to get bounding box to recalculate.
    var deltaY = 0;
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["sceneInfo"].positionOnFloor) {
        deltaY = moveMolMeshesToGround(thisMesh, targetBox);
    }
    for (var i = 0; i < allVisMolMeshesLen; i++) {
        var allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.position.y = allVisMolMesh.position.y - deltaY;
        allVisMolMesh.visibility = 1; // Hide while rotating.
    }
    lastRotationBeforeAnimation = allVisMolMeshesInfo[0].rotation.clone();
    // Now do the animations, if not moving from origin (as is the case if the
    // style just changed).
    if (animate === true) {
        var len = allVisMolMeshesInfo.length;
        for (var i = 0; i < len; i++) {
            var allVisMolMeshInfo = allVisMolMeshesInfo[i];
            var mesh = allVisMolMeshInfo.mesh;
            var pos = mesh.position.clone();
            var sca = mesh.scaling.clone();
            var rot = mesh.rotation.clone();
            var posX = makeBabylonAnim("posX", "position.x", allVisMolMeshInfo.position.x, pos.x);
            var posY = makeBabylonAnim("posY", "position.y", allVisMolMeshInfo.position.y, pos.y);
            var posZ = makeBabylonAnim("posZ", "position.z", allVisMolMeshInfo.position.z, pos.z);
            var scaX = makeBabylonAnim("scaX", "scaling.x", allVisMolMeshInfo.scaling.x, sca.x);
            var scaY = makeBabylonAnim("scaY", "scaling.y", allVisMolMeshInfo.scaling.y, sca.y);
            var scaZ = makeBabylonAnim("scaZ", "scaling.z", allVisMolMeshInfo.scaling.z, sca.z);
            var rotX = makeBabylonAnim("rotX", "rotation.x", allVisMolMeshInfo.rotation.x, rot.x);
            var rotY = makeBabylonAnim("rotY", "rotation.y", allVisMolMeshInfo.rotation.y, rot.y);
            var rotZ = makeBabylonAnim("rotZ", "rotation.z", allVisMolMeshInfo.rotation.z, rot.z);
            mesh.animations = [posX, posY, posZ, scaX, scaY, scaZ, rotX, rotY, rotZ];
            var anim = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].beginAnimation(mesh, 0, 15, false, 1, function () {
                // You need to recalculate the shadows.
                _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__["updateEnvironmentShadows"]();
            });
        }
    }
    else {
        // Not animating. You need to recalculate the shadows.
        _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__["updateEnvironmentShadows"]();
    }
}
/**
 * How much to move the mesh to position it on the ground.
 * @param  {*} biggestMolMesh  The biggest molecular mesh.
 * @param  {Object} targetBox  The box within which to position the mesh.
 * @returns number  How much to move along the Y axis.
 */
function moveMolMeshesToGround(biggestMolMesh, targetBox) {
    // The above will position the molecular mesh within the target mesh,
    // centering the two bounding boxes. That would be good for positioning
    // proteins in a bilayer, for example. Now let's move the meshes so they
    // are actually on the ground (all other meshes).
    // Check and see if the deltaY has already been calculated.
    var PI = Math.PI;
    var key = biggestMolMesh.name + "-" +
        (biggestMolMesh.rotation.x % PI).toFixed(3) + "-" +
        (biggestMolMesh.rotation.y % PI).toFixed(3) + "-" +
        (biggestMolMesh.rotation.z % PI).toFixed(3);
    if (cachedDeltaYs[key] !== undefined) {
        return cachedDeltaYs[key];
    }
    // Unfortunately, BABYLONjs rotates bounding boxes with the mesh. So the
    // minimum z per the bounding box doesn't correspond to EXACTLY the
    // minimum z of any vertex. Let's loop through the biggest mesh and find
    // its lowest vertex, because positioning over the ground needs to be more
    // exact.
    var verts = biggestMolMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    var thisMinY = 1000000.0;
    var vertsLength = verts.length;
    var thisMeshWorldMatrix = biggestMolMesh.getWorldMatrix();
    var amntToSkipToGet1000Pts = Math.max(1, 3 * Math.floor(vertsLength / 3000));
    for (var i = 0; i < vertsLength; i = i + amntToSkipToGet1000Pts) {
        var vec = new BABYLON.Vector3(verts[i], verts[i + 1], verts[i + 2]);
        vec = BABYLON.Vector3.TransformCoordinates(vec, thisMeshWorldMatrix);
        if (vec.y < thisMinY) {
            thisMinY = vec.y;
        }
    }
    // The min z of the target box should be ok.
    var targetMinY = targetBox.minimumWorld.y;
    var deltaY = thisMinY - targetMinY - 0.1;
    cachedDeltaYs[key] = deltaY;
    return deltaY;
}
/**
 * Gets a list of all the babylonjs molecular meshes that are visible.
 * @param  {*} babylonMesh  The mesh that was just added.
 * @returns Array<*>  A list of all visible meshes.
 */
function getVisibleMolMeshes(babylonMesh) {
    var allVisMolMeshes = [];
    var molMeshIds = Object.keys(_VisStyles__WEBPACK_IMPORTED_MODULE_2__["styleMeshes"]);
    var len = molMeshIds.length;
    for (var i = 0; i < len; i++) {
        var molMeshId = molMeshIds[i];
        var allVisMolMesh = _VisStyles__WEBPACK_IMPORTED_MODULE_2__["styleMeshes"][molMeshId].mesh;
        if (allVisMolMesh.isVisible === true) {
            allVisMolMeshes.push(allVisMolMesh);
        }
    }
    // Add the current one (just added).
    if (babylonMesh !== undefined) {
        allVisMolMeshes.push(babylonMesh);
    }
    return allVisMolMeshes;
}
/**
 * Resets things like the location and rotation of all visible meshes.
 * @param  {Object<*>} allVisMolMeshes  All the visible meshes.
 * @returns void
 */
function resetMeshes(allVisMolMeshes) {
    // Reset the scaling, position, and rotation of all the visible molecular
    // meshes.
    var len = allVisMolMeshes.length;
    for (var i = 0; i < len; i++) {
        var allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.animations = [];
        if (allVisMolMesh.isVisible === true) {
            // Make sure allVisMolMesh is not scaled or positioned. But
            // note that rotations are preserved.
            allVisMolMesh.scaling = new BABYLON.Vector3(1, 1, 1);
            allVisMolMesh.position = new BABYLON.Vector3(0, 0, 0);
            allVisMolMesh.rotation = _VRML__WEBPACK_IMPORTED_MODULE_3__["molRotation"];
            allVisMolMesh.visibility = 0; // Hide while rotating.
        }
    }
}
/**
 * Make a babylonjs animation. I found myself doing this a lot, so figured I'd
 * make a function.
 * @param  {string} name      The animation name.
 * @param  {string} prop      The property to animate.
 * @param  {number} startVal  The starting value.
 * @param  {number} endVal    The ending value.
 */
function makeBabylonAnim(name, prop, startVal, endVal) {
    var anim = new BABYLON.Animation(name, prop, 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys([
        { frame: 0, value: startVal },
        { frame: 15, value: endVal },
    ]);
    return anim;
}


/***/ }),

/***/ "cw8d":
/*!*************************************!*\
  !*** ./src/components/Mols/Load.ts ***!
  \*************************************/
/*! exports provided: setup, afterLoading, setupMesh */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "afterLoading", function() { return afterLoading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupMesh", function() { return setupMesh; });
/* harmony import */ var _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Scene/Optimizations */ "0fSa");
/* harmony import */ var _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../UI/Menu3D/Menu3D */ "jIpr");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./3DMol/ThreeDMol */ "qmVJ");
/* harmony import */ var _MolShadows__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MolShadows */ "sqbB");
/* harmony import */ var _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Navigation/Pickables */ "TqLJ");
/* harmony import */ var _Scene_LoadAndSetup__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Scene/LoadAndSetup */ "fcUb");







/**
 * Load in the molecules.
 * @returns void
 */
function setup() {
    beforeLoading();
    // Load from a pdb file via 3Dmoljs.
    _3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_3__["setup"]();
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].menuActive) {
        _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_1__["setup"]();
    }
    // Update the shadows.
    _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__["updateEnvironmentShadows"]();
}
/**
 * Run this before loading.
 * @returns void
 */
function beforeLoading() {
    // Set up the shadow generator.
    _MolShadows__WEBPACK_IMPORTED_MODULE_4__["setupShadowGenerator"]();
    // Make UVs work
    // BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
}
/**
 * @returns void
 */
function afterLoading() {
    _MolShadows__WEBPACK_IMPORTED_MODULE_4__["setupShadowCatchers"](); // Related to extras, so keep it here.
    // Do you need to make the ground glass instead of invisible? See
    // scene_info.json, which can have transparentGround: true.
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["sceneInfo"].transparentGround === true) {
        if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].groundMesh) {
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].groundMesh.visibility = 1;
            var transparentGround = new BABYLON.StandardMaterial("transparentGround", _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"]);
            transparentGround.diffuseColor = new BABYLON.Color3(1, 1, 1);
            transparentGround.specularColor = new BABYLON.Color3(0, 0, 0);
            transparentGround.emissiveColor = new BABYLON.Color3(0, 0, 0);
            transparentGround.alpha = _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["TRANSPARENT_FLOOR_ALPHA"];
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].groundMesh.material = transparentGround;
        }
        else {
            console.log("Warning: Vars.vrVars.groundMesh not defined.");
        }
    }
    // Finish up all scene preparations.
    _Scene_LoadAndSetup__WEBPACK_IMPORTED_MODULE_6__["loadingAssetsDone"]();
}
/**
 * Sets up a molecule mesh.
 * @param  {*}      mesh           The mesh.
 * @param  {number} uniqIntID      A unique numerical id that identifies this
 *                                 mesh.
 * @returns void
 */
function setupMesh(mesh, uniqIntID) {
    if ((mesh.material !== undefined) && (mesh.material !== null)) {
        // Add a small emission color so the dark
        // side of the protein isn't too dark.
        var lightingInf = _MolShadows__WEBPACK_IMPORTED_MODULE_4__["getBlurDarknessAmbientFromLightName"]();
        var backgroundLum = 0;
        if (lightingInf.ambient === undefined) {
            // Experience:
            // In Couch scene, background luminosity of 0.01 is good. There shadow
            // darkness was 0.9625
            // In House scene, background luminosity of 0.0025 is good. There
            // shadow darkness was 0.35.
            // Let's play around with a scheme for guessing at the right
            // background luminosity.
            /** @type {number} */
            var lightingInfDarkness = lightingInf.darkness;
            if (lightingInfDarkness > 0.95) {
                backgroundLum = 0.05;
            }
            else if (lightingInfDarkness < 0.4) {
                backgroundLum = 0.0025;
            }
            else {
                // Scaled
                // (0.95, 0.01)
                // (0.4, 0.0025)
                // let m = 0.013636363636363637;  // (0.01 - 0.0025) / (0.95 - 0.4);
                // let b = -0.0029545454545454545;  // 0.01 - 0.013636363636363637 * 0.95;
                backgroundLum = 0.013636363636363637 * lightingInfDarkness - 0.0029545454545454545;
            }
        }
        else {
            // It's given in the name of the light, so no need to try to
            // calculate it.
            backgroundLum = lightingInf.ambient;
        }
        mesh.material.emissiveColor = new BABYLON.Color3(backgroundLum, backgroundLum, backgroundLum);
        // Freeze the material (improves optimization).
        _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_0__["freezeMeshProps"](mesh);
    }
    // }
    // This is required to position correctly.
    mesh.scaling.z = -1;
    if (uniqIntID > 0) {
        mesh.scaling.x = -1;
    }
    // Make it so it casts a shadow.
    if (_MolShadows__WEBPACK_IMPORTED_MODULE_4__["shadowGenerator"]) {
        _MolShadows__WEBPACK_IMPORTED_MODULE_4__["shadowGenerator"].getShadowMap().renderList.push(mesh);
    }
    // Make it pickable
    _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_5__["addPickableMolecule"](mesh);
}


/***/ }),

/***/ "ejGh":
/*!***********************************************!*\
  !*** ./src/components/Cameras/NonVRCamera.ts ***!
  \***********************************************/
/*! exports provided: setup, setCameraElipsoid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCameraElipsoid", function() { return setCameraElipsoid; });
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
// This sets up the non vr camera. Not everyone has a vr headset.

/** @type {*} */
var nonVRCamera;
var lastCameraPosAboveGroundMesh = new BABYLON.Vector3(0, 0, 0);
/**
 * Sets up the nonVR camera (not everyone has a VR headset).
 * @returns void
 */
function setup() {
    setupNonVRCameraObj();
}
/**
 * Sets up the camera object.
 * @returns void
 */
function setupNonVRCameraObj() {
    // The VRHelper already created a camera. Need to set it up.
    nonVRCamera = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].activeCamera;
    // Enable navigation via both WASD and the arrows keys.
    nonVRCamera.keysUp = [87, 38];
    nonVRCamera.keysDown = [83, 40];
    nonVRCamera.keysLeft = [65, 37];
    nonVRCamera.keysRight = [68, 39];
    // Turn on gravity. Note: Turning this on causes problems, and it doesn't
    // seem to be necessary. Well, it does help with arrow/wsad navigation
    // (can't fly off).
    // Vars.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].gravity = new BABYLON.Vector3(0, -0.1, 0);
    nonVRCamera.applyGravity = true;
    // Enable collision detection. Note that the second paramerter is a
    // radius.
    setCameraElipsoid();
    // Turn on collisions as appropriate. Note that groundMesh collisions are
    // enabled in Navigation.
    // scene.workerCollisions = true;
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].collisionsEnabled = true;
    nonVRCamera.checkCollisions = true;
    // Slow the camera.
    nonVRCamera.speed = 0.1;
    nonVRCamera.attachControl(_Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["canvas"], true);
    // Position the camera on the floor. See
    // http://www.html5gamedevs.com/topic/30837-gravity-camera-stops-falling/
    nonVRCamera._updatePosition();
}
/**
 * Sets up the collision elipsoid around the non-VR camera.
 * @returns void
 */
function setCameraElipsoid() {
    // Depends on camera height.
    nonVRCamera.ellipsoid = new BABYLON.Vector3(1.0, 0.5 * _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["cameraHeight"], 1.0);
}


/***/ }),

/***/ "fRJN":
/*!***********************************!*\
  !*** ./src/components/UI/UI2D.ts ***!
  \***********************************/
/*! exports provided: setup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony import */ var _OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./OpenPopup/OpenPopup */ "iC5T");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../WebRTC/Lecturer */ "mvtX");
// Sets up tweaks to the UI.



/**
 * Sets up the 2D button that can be used to launch VR.
 * @returns void
 */
function setup() {
    addRunModeButtons();
}
/**
 * Adds the 2D button to the DOM, makes it clickable.
 * @returns void
 */
function addRunModeButtons() {
    // Create a list of the buttons, from the one on the top to the one on the
    // bottom. Doesn't include VR button, because that's added elsewhere.
    // Icons should fit within 80px x 50px.
    var dimen = "48"; // The icon dimensions (square).
    var btns = [
        {
            // https://pixabay.com/vectors/folder-directory-open-computer-26694/
            svg: "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n                    width=\"" + dimen + "px\" height=\"" + dimen + "px\" viewBox=\"0 0 " + dimen + " " + dimen + "\" enable-background=\"new 0 0 48 48\" xml:space=\"preserve\">\n                    <g>\n                        <path fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M41.99,17.573v-5.209\n                            c0-0.588-0.717-1.092-1.615-1.092H25.123V8.92c0-0.336-0.449-0.672-0.987-0.672H1.077C0.449,8.248,0,8.583,0,8.92v3.444\n                            c0,0,0,0,0,0.084v25.877c0,0.588,0.717,1.092,1.615,1.092h38.671\"/>\n                        <path fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M7.985,17.573h38.67\n                            c0.898,0,1.526,0.504,1.347,1.008l-5.295,19.744c-0.089,0.588-0.985,1.092-1.884,1.092H2.064c-0.898,0-1.526-0.504-1.347-1.008\n                            l5.294-19.744C6.19,18.077,7.088,17.573,7.985,17.573L7.985,17.573\"/>\n                    </g>\n                    </svg>",
            title: "open",
            id: "open-button",
            clickFunc: function () {
                // Give them some time to admire nanokid... :)
                _OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_0__["openModal"]("Load Molecule", "pages/load.html?warning");
            }
        },
        {
            svg: "<svg version=\"1.2\" baseProfile=\"tiny\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n                    x=\"0px\" y=\"0px\" width=\"" + dimen + "px\" height=\"" + dimen + "px\" viewBox=\"0 0 " + dimen + " " + dimen + "\" xml:space=\"preserve\">\n                        <path fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-miterlimit=\"10\" d=\"\n                            M35.5,9.8c1.7,5.4-0.6,8-1.6,8.9c-1.9,1.9-4.5,4.7-5.8,7c-1.5,2.7-4.1,12-6.8,4.4c-3.2-9.1,1.3-11.6,3.5-13.4\n                            c1.5-1.3,3.4-4.3,0.5-5.3c-4-1.3-6.1,5.3-10.7,4c-3-0.8-3.2-4.1-2.2-6.6C15.4,1.7,32.5,0.6,35.5,9.8L35.5,9.8z\"/>\n                        <path fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-miterlimit=\"10\" d=\"M28.3,39.6c0-5.5-8.5-5.5-8.5,0S28.3,45.1,28.3,39.6\"/>\n                  </svg>",
            title: "Help",
            id: "help-button",
            clickFunc: function () { _OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_0__["openModal"]("Help", "pages/index.html", true, true); }
        },
        {
            svg: "<svg version=\"1.2\" baseProfile=\"tiny\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n             \t    x=\"0px\" y=\"0px\" width=\"" + dimen + "px\" height=\"" + dimen + "px\" viewBox=\"0 0 " + dimen + " " + dimen + "\" xml:space=\"preserve\">\n                    <path fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"1.5\" d=\"M35.4,4.6c-3.2,0-5.8,2.4-5.8,5.8l0,0c0,0.5,0.2,1.1,0.5,1.4l-13.4,7.8\n             \t    c-1-1.4-2.6-1.8-4.1-1.8c-3.2,0-5.8,2.4-5.8,5.8l0,0c0,2.9,2.6,5.8,5.8,5.8l0,0c1.3,0,2.2-0.5,3.2-1.4l13.6,8.3\n             \t    c-0.3,0.4-0.3,0.9-0.3,1.4c0,3.4,2.7,5.8,5.9,5.8l0,0c3.2,0,5.6-2.4,5.6-5.8l0,0c0-2.9-2.4-5.9-5.6-5.9l0,0c-1.7,0-3.2,1.1-4.4,2\n             \t    l-13.1-7.3c0.5-0.9,0.7-2,0.7-2.9c0-0.5,0-1.4-0.2-2l13.3-7.3c1,0.9,2.5,1.5,4.1,1.5c3.2,0,5.9-2.5,5.9-5.4l0,0\n             \t    C41.3,6.9,38.5,4.6,35.4,4.6L35.4,4.6L35.4,4.6z\"/>\n                 </svg>",
            title: "Share (Leader)",
            id: "leader",
            clickFunc: function () {
                _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_2__["startBroadcast"]();
            }
        },
        {
            // https://iconmonstr.com/fullscreen-thin-svg/
            svg: "<svg style=\"position:relative; left:0.5px;\" width=\"" + dimen + "px\" height=\"" + dimen + "px\" xmlns=\"http://www.w3.org/2000/svg\"\n                    xmlns:svg=\"http://www.w3.org/2000/svg\" clip-rule=\"evenodd\">\n                    <g class=\"layer\">\n                        <path d=\"m47.799999,43.649999l-47.699999,0l0,-39.749999l47.699999,0l0,39.749999zm-1.9875,-37.762499l-43.724999,0l0,35.774999l43.724999,0l0,-35.774999zm-7.95,13.9125l-1.9875,0l0,-6.441487l-22.341487,22.341487l6.441487,0l0,1.9875l-9.9375,0l0,-9.9375l1.9875,0l0,6.441487l22.341487,-22.341487l-6.441487,0l0,-1.9875l9.9375,0l0,9.9375z\" fill=\"#ffffff\" id=\"svg_1\"/>\n                    </g>\n                  </svg>",
            title: "Full Screen",
            id: "fullscreen-button",
            clickFunc: function () {
                _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["engine"].switchFullscreen(true);
                jQuery("#renderCanvas").focus(); // So keypress will work.
            }
        }
    ];
    // Reverse the buttons.
    var html = "";
    var curBottom = 60;
    for (var _i = 0, _a = btns.reverse(); _i < _a.length; _i++) {
        var btn = _a[_i];
        html += "\n            <button\n                title=\"" + btn.title + "\"\n                id=\"" + btn.id + "\"\n                class=\"ui-button\"\n                style=\"color:white;\n                    width:80px;\n                    height:50px;\n                    right:5px;\n                    position:absolute;\n                    bottom:" + curBottom.toString() + "px;\n                    background-color:rgba(51,51,51,0.7);\n                    border:none;\n                    outline:none;\n                    cursor:pointer;\">\n                    " + btn.svg + "\n            </button>";
        curBottom += 55;
    }
    // Add to DOM.
    jQuery("body").append(html);
    var _loop_1 = function (btn) {
        jQuery("#" + btn.id).click(function () {
            btn.clickFunc();
        });
    };
    // Make buttons clickable
    for (var _b = 0, btns_1 = btns; _b < btns_1.length; _b++) {
        var btn = btns_1[_b];
        _loop_1(btn);
    }
    // Also make VR button visible.
    var babylonVRiconbtn = document.getElementById("babylonVRiconbtn");
    if (babylonVRiconbtn !== null) {
        babylonVRiconbtn.style.opacity = "1.0"; // Non IE;
        babylonVRiconbtn.style.filter = "alpha(opacity=1.0)"; // IE;
    }
}
/**
 * A function to activate debug mode.
 * @returns void
 */
function debugMode() {
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].debugLayer.show();
    setTimeout(function () {
        document.getElementById("inspector-host").style.zIndex = "15";
        document.getElementById("scene-explorer-host").style.zIndex = "15";
    }, 500);
}
// For debugging...
// window["debugMode"] = debugMode;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn")))

/***/ }),

/***/ "fcUb":
/*!**********************************************!*\
  !*** ./src/components/Scene/LoadAndSetup.ts ***!
  \**********************************************/
/*! exports provided: load, loadingAssetsDone */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "load", function() { return load; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadingAssetsDone", function() { return loadingAssetsDone; });
/* harmony import */ var _Cameras_Setup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Cameras/Setup */ "1RHl");
/* harmony import */ var _Cameras_VRCamera__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Cameras/VRCamera */ "nV79");
/* harmony import */ var _Mols_Load__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Mols/Load */ "cw8d");
/* harmony import */ var _Navigation_Navigation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Navigation/Navigation */ "9bcR");
/* harmony import */ var _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Navigation/Pickables */ "TqLJ");
/* harmony import */ var _UI_LoadingScreens__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../UI/LoadingScreens */ "Rr3C");
/* harmony import */ var _UI_UI2D__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../UI/UI2D */ "fRJN");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _Optimizations__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Optimizations */ "0fSa");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../Vars/UrlVars */ "p11u");










/**
 * Load the scene, setup the VR, etc.
 * @returns void
 */
function load() {
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["setup"]();
    // Remove the initial loading javascript screen (not the babylonjs loading
    // screen... That's to come).
    _UI_LoadingScreens__WEBPACK_IMPORTED_MODULE_5__["removeLoadingJavascriptScreen"]();
    // Because of this error, you need to setup VR before loading the babylon
    // scene:
    // https://forum.babylonjs.com/t/createdefaultvrexperience-android-chrome-vr-mode-change-material-unusual-error/2738/4
    vrSetupBeforeBabylonFileLoaded();
    babylonScene(function () {
        // Setup the cameras.
        _Cameras_Setup__WEBPACK_IMPORTED_MODULE_0__["setup"]();
        if (!_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_9__["checkWebrtcInUrl"]()) {
            // The below are run if not in webrtc (leader) mode.
            // Setup the general things that apply regardless of the mode used.
            // Here because it requires a ground mesh. Set up the floor mesh
            // (hidden).
            _Navigation_Navigation__WEBPACK_IMPORTED_MODULE_3__["setup"]();
            // Setup function to manage pickable objects (e.g., floor).
            _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_4__["setup"]();
        }
        else {
            // Initially, no VR.
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["vrVars"].navMode = 3 /* NoVR */;
            // Also, make sure ground is not visible.
            var groundMesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].getMeshByID("ground");
            groundMesh.visibility = 0;
            // Also hide navigation sphere.
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["vrVars"].navTargetMesh.isVisible = false;
        }
        // Load extra objects
        _Mols_Load__WEBPACK_IMPORTED_MODULE_2__["setup"]();
        // loadingAssetsDone(), below, will run once all assets loaded.
        // Sets up nav selection buttons in DOM.
        _UI_UI2D__WEBPACK_IMPORTED_MODULE_6__["setup"]();
    });
    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["engine"].resize();
    });
}
/**
 * A few VR-relevant things need to be handled before you load the babylon
 * scene. These are separated into this function so they can be called
 * separately.
 * @returns void
 */
function vrSetupBeforeBabylonFileLoaded() {
    // You'll need a navigation mesh.
    var navMeshToUse = BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"]);
    var navMeshMat = new BABYLON.StandardMaterial("myMaterial", _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"]);
    navMeshMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
    navMeshToUse.material = navMeshMat;
    navMeshToUse.renderingGroupId = 2; // So always visible, in theory.
    // Setup the VR here. Set up the parameters (filling in missing values,
    // for example). Also saves the modified params to the params module
    // variable. Note that this calls createDefaultVRExperience.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["setupVR"]({
        navTargetMesh: navMeshToUse,
    });
    // Setup the VR camera
    _Cameras_VRCamera__WEBPACK_IMPORTED_MODULE_1__["setup"]();
    // Optimize the scene to make it run better.
    _Optimizations__WEBPACK_IMPORTED_MODULE_8__["setup"]();
    // For debugging...
    // trackDebugSphere();
    // window.Vars = Vars;
}
/**
 * Load the scene from the .babylon file.
 * @param  {Function} callBackFunc The callback function to run when loaded.
 * @returns void
 */
function babylonScene(callBackFunc) {
    _UI_LoadingScreens__WEBPACK_IMPORTED_MODULE_5__["babylonJSLoadingMsg"]("Loading the main scene...");
    BABYLON.SceneLoader.LoadAssetContainer(_Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["sceneName"], "scene.babylon", _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"], function (container) {
        _UI_LoadingScreens__WEBPACK_IMPORTED_MODULE_5__["startFakeLoading"](90);
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].executeWhenReady(function () {
            // Now load scene_info.json too.
            jQuery.getJSON(_Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["sceneName"] + "scene_info.json", function (data) {
                // Save variables from scene_info.json so they can be accessed
                // elsewhere (throughout the app).
                // Deactivate menu if appropriate. Note that this feature is
                // not supported (gives an error). Perhaps in the future I
                // will reimplement it, so I'm leaving the vestigial code
                // here.
                if (data["menuActive"] === false) {
                    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["vrVars"].menuActive = false;
                }
                if (data["positionOnFloor"] !== undefined) {
                    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["sceneInfo"].positionOnFloor = data["positionOnFloor"];
                }
                if (data["infiniteDistanceSkyBox"] !== undefined) {
                    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["sceneInfo"].infiniteDistanceSkyBox = data["infiniteDistanceSkyBox"];
                }
                if (data["transparentGround"] !== undefined) {
                    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["sceneInfo"].transparentGround = data["transparentGround"];
                }
                container.addAllToScene();
                // There should be only one camera at this point, because the VR
                // stuff is in the callback. Make that that one camera is the
                // active one.
                // Vars.scene.activeCamera =  Vars.scene.cameras[0];
                // Make sure the active camera is the one loaded from the babylon
                // file. Should be the only one without the string VR in it.
                _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].activeCamera = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].cameras.filter(function (c) { return c.name.indexOf("VR") === -1; })[0];
                // Attach camera to canvas inputs
                // Vars.scene.activeCamera.attachControl(Vars.canvas);
                keepOnlyLightWithShadowlightSubstr();
                furtherProcessKeyMeshes();
                allMaterialsShadeless();
                optimizeMeshesAndMakeClickable();
                callBackFunc();
            });
        });
    }, function (progress) {
        if (progress["lengthComputable"]) {
            // Only to 90 to not give the impression that it's done loading.
            var percent = Math.round(90 * progress["loaded"] / progress["total"]);
            _UI_LoadingScreens__WEBPACK_IMPORTED_MODULE_5__["babylonJSLoadingMsg"]("Loading the main scene... " + percent.toString() + "%");
        }
    });
}
/**
 * Only the light with shadowlight should be retained.
 * @returns void
 */
function keepOnlyLightWithShadowlightSubstr() {
    // Delete all the lights but the first one that has the substring
    // shadowlight or shadow_light.
    var foundFirstShadowLight = false;
    var indexToUse = 0;
    while (_Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].lights.length > 1) {
        var light = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].lights[indexToUse];
        var lightName = light.name.toLowerCase();
        var isShadowLight = ((lightName.indexOf("shadowlight") !== -1) ||
            (lightName.indexOf("shadow_light") !== -1));
        if (!isShadowLight) {
            // It's not a shadow light. Delete it.
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].lights[indexToUse].dispose();
        }
        else if (foundFirstShadowLight) {
            // You've already found a shadow light. Delete additional
            // ones.
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].lights[indexToUse].dispose();
        }
        else {
            // Must be the first shadow light. Don't delete, but make
            // note of it.
            foundFirstShadowLight = true;
            indexToUse++;
        }
    }
}
/**
 * Hides meshes that are only used for scene creation. Also deals with
 * skyboxes and other objects.
 * @returns void
 */
function furtherProcessKeyMeshes() {
    // Hide objects used for scene creation.
    /** @type {number} */
    var len = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes.length;
    for (var meshIdx = 0; meshIdx < len; meshIdx++) {
        var mesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes[meshIdx];
        if (mesh.name === "protein_box") {
            mesh.isVisible = false;
        }
        else if (mesh.name.toLowerCase().indexOf("skybox") !== -1) {
            if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["sceneInfo"].infiniteDistanceSkyBox) {
                mesh.material.disableLighting = true;
                mesh.infiniteDistance = true;
            }
            // Causes skybox to go black. I think you'd need to set to 0, and
            // all other meshes to 1.
            // mesh.renderingGroupId = -1;
        }
    }
}
/**
 * All objects with materials that have emissive textures should be shadeless.
 * @returns void
 */
function allMaterialsShadeless() {
    /** @type {number} */
    var len = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes.length;
    for (var meshIdx = 0; meshIdx < len; meshIdx++) {
        var mesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes[meshIdx];
        if (!mesh.material) {
            continue;
        }
        // It has a material
        if (mesh.material.emissiveTexture) {
            mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            mesh.material.albedoColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.ambientColor = new BABYLON.Color3(0, 0, 0);
        }
        // It has submaterials.
        /** @type {number} */
        // if (mesh.material.subMaterials) {
        //     let len2 = mesh.material.subMaterials.length;
        //     for (let matIdx = 0; matIdx < len2; matIdx++) {
        //         let mat = mesh.material.subMaterials[matIdx];
        //         if (mat.emissiveTexture) {
        //             mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        //             mat.albedoColor = new BABYLON.Color3(0, 0, 0);
        //             mat.ambientColor = new BABYLON.Color3(0, 0, 0);
        //         }
        //     }
        // }
    }
}
/**
 * Optimizes meshes and makes them clickable.
 * @returns void
 */
function optimizeMeshesAndMakeClickable() {
    // Optimize and make meshes clickable. Also, make sure all meshes
    // are emmissive.
    /** @type {number} */
    var len = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes.length;
    for (var meshIdx = 0; meshIdx < len; meshIdx++) {
        if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes[meshIdx].material) {
            var mesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].meshes[meshIdx];
            // It needs to be emmisive (so always baked).
            if ((mesh.material.emissiveTexture === undefined) || (mesh.material.emissiveTexture === null)) {
                mesh.material.emissiveTexture = mesh.material.diffuseTexture;
                // Below seems important to comment out. .clone()
                // above and .dispose() below doesn't work. Also,
                // below = null and = undefined didn't work. No good
                // solutions, so leave diffuse texture in place?
                // mesh.material.diffuseTexture = undefined;
                mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            }
            // TODO: Using false below to not freeze materials.
            // They are white otherwise. Good to figure out why.
            _Optimizations__WEBPACK_IMPORTED_MODULE_8__["freezeMeshProps"](mesh, false);
            _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_4__["makeMeshMouseClickable"]({
                mesh: mesh,
                scene: _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"],
            });
        }
    }
}
/**
 * This runs when all the assets are fully loaded. Does things like start the
 * render loop.
 * @returns void
 */
function loadingAssetsDone() {
    // Give it a bit to let one render cycle go through. Hackish,
    // admittedly.
    setTimeout(_Optimizations__WEBPACK_IMPORTED_MODULE_8__["updateEnvironmentShadows"], 1000);
    // Stop showing the fake loading screen.
    _UI_LoadingScreens__WEBPACK_IMPORTED_MODULE_5__["stopFakeLoading"]();
    // Make sure the camera can see far enough.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].activeCamera.maxZ = 250;
    // Make sure camera can see objects that are very close.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].activeCamera.minZ = 0;
    // Start the render loop. Register a render loop to repeatedly render the
    // scene
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["engine"].runRenderLoop(function () {
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_7__["scene"].render();
    });
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn")))

/***/ }),

/***/ "gg4m":
/*!*********************************************!*\
  !*** ./src/components/WebRTC/WebRTCBase.ts ***!
  \*********************************************/
/*! exports provided: DEBUG, WebRTCBase, webRTCErrorMsg, webRTCStandardErrorMsg */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEBUG", function() { return DEBUG; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WebRTCBase", function() { return WebRTCBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webRTCErrorMsg", function() { return webRTCErrorMsg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webRTCStandardErrorMsg", function() { return webRTCStandardErrorMsg; });
/* harmony import */ var _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../UI/OpenPopup/OpenPopup */ "iC5T");
// Functions that are common to the main classes of Lecturer.ts and
// Student.ts.

var DEBUG = false;
var WebRTCBase = /** @class */ (function () {
    function WebRTCBase() {
        // Some functions are common to both senders and receivers.
        this.peerId = null;
        this.peer = null;
        this.createPeerObj();
        this.setupWebRTCCloseFuncs();
    }
    /**
     * Creates a peer.js object for use in leader mode.
     * @returns void
     */
    WebRTCBase.prototype.createPeerObj = function () {
        // Create own peer object with connection to shared PeerJS server
        // let idToUse = "pvr" + Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);  // null and it gets picked for you.
        var wrds = ["act", "add", "age", "ago", "aid", "aim", "air", "all",
            "and", "any", "arm", "art", "ask", "bag", "ban", "bar",
            "bed", "bet", "big", "bit", "box", "bus", "but", "buy",
            "can", "cap", "car", "cat", "ceo", "cow", "cry", "cup",
            "day", "dig", "dna", "rna", "dog", "dry", "due", "ear",
            "eat", "egg", "end", "era", "etc", "eye", "fan", "far",
            "fee", "few", "fit", "fix", "fly", "for", "fun", "gap",
            "get", "guy", "hat", "hey", "hip", "hit", "hot", "how",
            "ice", "its", "jet", "job", "joy", "key", "kid", "lab",
            "law", "lay", "let", "lie", "lot", "low", "map", "may",
            "mix", "net", "new", "nod", "nor", "not", "now", "nut",
            "odd", "off", "oil", "old", "one", "our", "out", "owe",
            "own", "pan", "pay", "per", "pet", "pie", "pop", "put",
            "raw", "red", "rid", "row", "run", "say", "sea", "see",
            "set", "sit", "six", "ski", "sky", "sue", "sun", "tap",
            "tax", "ten", "the", "toe", "too", "top", "toy", "try",
            "two", "use", "via", "war", "way", "wet", "who", "why",
            "win", "yes", "yet", "you"];
        var idToUse = "pvr" + this.randomNumStr();
        idToUse += wrds[Math.floor(Math.random() * wrds.length)] + this.randomNumStr();
        // idToUse += wrds[Math.floor(Math.random() * wrds.length)] + this.randomNumStr();
        idToUse = idToUse.replace(/\./g, "");
        // Remove some ambiguous ones.
        // for (let c of ["1", "l", "O", "0"]) {
        //     idToUse = idToUse.replace(c, "");
        // }
        this.peer = new Peer(idToUse, {
            "debug": 2,
            "config": { 'iceServers': [
                    { "urls": 'stun:0.peerjs.com' },
                    { "urls": 'stun:stun.l.google.com:19302' },
                    { "urls": 'stun:durrantlab.com/apps/proteinvr/stun' } // not yet implemented
                    // {"url": 'stun:stun1.l.google.com:19302'},
                    // {"url": 'stun:stun2.l.google.com:19302'},
                    // {"url": 'stun:stun3.l.google.com:19302'},
                    // {"url": 'stun:stun4.l.google.com:19302'},
                    // {url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo'}
                ] }
        });
    };
    /**
     * Sets up the functions that are fired when peer.js disconnects or
     * produces an error.
     * @returns void
     */
    WebRTCBase.prototype.setupWebRTCCloseFuncs = function () {
        var _this = this;
        this.peer.on("disconnected", function () {
            webRTCStandardErrorMsg();
            if (DEBUG === true) {
                console.log("Connection lost. Please reconnect");
            }
            // Workaround for peer.reconnect deleting previous id
            _this.peer.id = _this.peerId;
            _this.peer._lastServerId = _this.peerId;
            _this.peer.reconnect();
        });
        this.peer.on("error", function (err) {
            webRTCErrorMsg(err);
        });
    };
    WebRTCBase.prototype.randomNumStr = function () {
        return Math.random().toString().replace(/\./g, "").replace(/0/g, "").slice(0, 3);
    };
    return WebRTCBase;
}());

/**
 * Throw a generic error message to let the user know that the connection has
 * failed.
 * @param  {string} details  An additional message to display, beyond the
 *                           default one.
 * @returns void
 */
function webRTCErrorMsg(details) {
    if (details === void 0) { details = ""; }
    var msg = "<p>ProteinVR has encountered an error while running in leader mode. ";
    if (details !== "") {
        msg += " Here are the details:</p>";
        msg += "<p><pre>" + details + "</pre></p>";
    }
    else {
        msg += "</p>";
    }
    _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_0__["openModal"]("Leader Error", msg, false);
}
/**
 * Show the standard "please refresh" error message.
 * @returns void
 */
function webRTCStandardErrorMsg() {
    webRTCErrorMsg("Leader connection destroyed. Please refresh.");
}


/***/ }),

/***/ "gqHH":
/*!*************************************!*\
  !*** ./src/components/Vars/Vars.ts ***!
  \*************************************/
/*! exports provided: canvas, engine, scene, vrHelper, sceneName, setSceneName, sceneInfo, cameraHeight, TRANSPORT_DURATION, MAX_DIST_TO_MOL_ON_TELEPORT, MIN_DIST_TO_MOL_ON_TELEPORT, MAX_VERTS_PER_SUBMESH, BUTTON_SPHERE_RADIUS, MENU_RADIUS, MENU_MARGIN, PAD_MOVE_SPEED, VR_CONTROLLER_TRIGGER_DELAY_TIME, VR_CONTROLLER_PAD_ROTATION_DELAY_TIME, VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET, MAX_TELEPORT_DIST, TRANSPARENT_FLOOR_ALPHA, vrVars, setup, determineCameraHeightFromActiveCamera, setCameraHeight, setupVR */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "canvas", function() { return canvas; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "engine", function() { return engine; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scene", function() { return scene; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "vrHelper", function() { return vrHelper; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sceneName", function() { return sceneName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSceneName", function() { return setSceneName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sceneInfo", function() { return sceneInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cameraHeight", function() { return cameraHeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TRANSPORT_DURATION", function() { return TRANSPORT_DURATION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MAX_DIST_TO_MOL_ON_TELEPORT", function() { return MAX_DIST_TO_MOL_ON_TELEPORT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MIN_DIST_TO_MOL_ON_TELEPORT", function() { return MIN_DIST_TO_MOL_ON_TELEPORT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MAX_VERTS_PER_SUBMESH", function() { return MAX_VERTS_PER_SUBMESH; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BUTTON_SPHERE_RADIUS", function() { return BUTTON_SPHERE_RADIUS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MENU_RADIUS", function() { return MENU_RADIUS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MENU_MARGIN", function() { return MENU_MARGIN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PAD_MOVE_SPEED", function() { return PAD_MOVE_SPEED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VR_CONTROLLER_TRIGGER_DELAY_TIME", function() { return VR_CONTROLLER_TRIGGER_DELAY_TIME; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VR_CONTROLLER_PAD_ROTATION_DELAY_TIME", function() { return VR_CONTROLLER_PAD_ROTATION_DELAY_TIME; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET", function() { return VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MAX_TELEPORT_DIST", function() { return MAX_TELEPORT_DIST; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TRANSPARENT_FLOOR_ALPHA", function() { return TRANSPARENT_FLOOR_ALPHA; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "vrVars", function() { return vrVars; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "determineCameraHeightFromActiveCamera", function() { return determineCameraHeightFromActiveCamera; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCameraHeight", function() { return setCameraHeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupVR", function() { return setupVR; });
/* harmony import */ var _UrlVars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UrlVars */ "p11u");
// A place to put variables that need to be accessed from multiple places.
// This module is a place to store "global" variables.

var canvas;
var engine;
var scene;
var vrHelper;
var sceneName = "environs/day/";
/**
 * Setter for sceneName variable.
 * @param  {string} val  The value to set.
 */
function setSceneName(val) { sceneName = val; }
// From scene_info.json
var sceneInfo = {
    positionOnFloor: false,
    infiniteDistanceSkyBox: true,
    transparentGround: false
};
/** @type {number} */
var cameraHeight;
// Also some constants
/** @const {number} */
var TRANSPORT_DURATION = 11;
/** @const {number} */
var MAX_DIST_TO_MOL_ON_TELEPORT = 1.5;
/** @const {number} */
var MIN_DIST_TO_MOL_ON_TELEPORT = 1.0;
/** @const {number} */
var MAX_VERTS_PER_SUBMESH = 2000; // This is kind of an arbitrary number.
/** @const {number} */
var BUTTON_SPHERE_RADIUS = 1.2; // the radius of the spheres around buttons used to detect clicks.
/** @const {number} */
var MENU_RADIUS = 2.5; // 3 is comfortable, but doesn't work in crowded environments.
/** @const {number} */
var MENU_MARGIN = 0.05; // 0.15;  // 0.1;
/** @const {number} */
var PAD_MOVE_SPEED = 0.01;
/** @const {number} */
var VR_CONTROLLER_TRIGGER_DELAY_TIME = 500; // time to wait between triggers.
/** @const {number} */
var VR_CONTROLLER_PAD_ROTATION_DELAY_TIME = 750; // time to wait between triggers.
/** @const {number} */
var VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET = 0.1;
/** @const {number} */
var MAX_TELEPORT_DIST = 15;
/** @const {number} */
var TRANSPARENT_FLOOR_ALPHA = 0.05; // 0.02;
// IOS doesn't support a lot of features!
/** @const {*} */
// export const IOS: boolean = false;  // TODO: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window["MSStream"];
// Variables that can change.
var vrVars = {};
/**
 * Setup the Vars.
 * @returns void
 */
function setup() {
    canvas = document.getElementById("renderCanvas");
    // Generate the BABYLON 3D engine
    engine = new BABYLON.Engine(canvas, true);
    if (true) { // true means use manifest files.
        BABYLON.Database.IDBStorageEnabled = true;
    }
    else {}
    scene = new BABYLON.Scene(engine);
    // For debugging...
    window["scene"] = scene;
}
/**
 * Determines the camera height from the active camera.
 * @returns void
 */
function determineCameraHeightFromActiveCamera() {
    // Get the camera height. But I don't think this variable is every
    // actually used anywhere...
    if (cameraHeight === undefined) {
        // Calculate the camera height from it's position.
        /** @const {*} */
        var ray = new BABYLON.Ray(scene.activeCamera.position, new BABYLON.Vector3(0, -1, 0), 50);
        /** @const {*} */
        var pickingInfo = scene.pickWithRay(ray, function (mesh) {
            return (mesh.name === "ground");
        });
        cameraHeight = pickingInfo.distance;
    }
}
/**
 * Sets the camera height.
 * @param  {number} height  The height.
 * @returns void
 */
function setCameraHeight(height) {
    cameraHeight = height;
}
/**
 * Modifies the parameters, adding in default values where values are missing,
 * for example. Also saves the updated params to the module-level params
 * variable.
 * @param  {Object<string,*>} initParams The initial parameters.
 */
function setupVR(initParams) {
    // Save the parameter to params (module-level variable).
    vrVars = initParams;
    // If running in Student mode, do not set up VR camera... But good to
    // define vrVars first (above) so you can hide the nav sphere elsewhere.
    if (_UrlVars__WEBPACK_IMPORTED_MODULE_0__["checkWebrtcInUrl"]()) {
        return;
    }
    // Create the vr helper. See http://doc.babylonjs.com/how_to/webvr_helper
    var params = {
        // "createDeviceOrientationCamera": false,  // This makes phone ignore motion sensor. No good.
        "createDeviceOrientationCamera": true,
        "useMultiview": false
    };
    if (scene.getEngine().getCaps().multiview) {
        // Much faster according to
        // https://doc.babylonjs.com/how_to/multiview, but not supported in
        // all browsers.
        params["useMultiview"] = true;
    }
    vrHelper = scene.createDefaultVRExperience(params);
    // Hide the vrHelper icon initially.
    var babylonVRiconbtn = document.getElementById("babylonVRiconbtn");
    if (babylonVRiconbtn !== null) {
        babylonVRiconbtn.style.opacity = "0.0"; // Non IE;
        babylonVRiconbtn.style.filter = "alpha(opacity=0)"; // IE;
    }
    // For debugging....
    // window["vrHelper"] = vrHelper;
    // Whether the menu system is active. True by default.
    vrVars.menuActive = true;
}


/***/ }),

/***/ "i3Xp":
/*!*************************************************!*\
  !*** (webpack)/hot sync nonrecursive ^\.\/log$ ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./log": "dZZH"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "i3Xp";

/***/ }),

/***/ "iC5T":
/*!**************************************************!*\
  !*** ./src/components/UI/OpenPopup/OpenPopup.ts ***!
  \**************************************************/
/*! exports provided: openModal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openModal", function() { return openModal; });
var bootstrapLoaded = false;
/** @type {Function} */
// let modalFunc: any;
var msgModal;
var myTitle;
var myIFrame;
var iFrameContainer;
var msgContainer;
var footer;
/**
 * Opens a modal.
 * @param  {string}  title     The tittle.
 * @param  {string}  val       The URL if iframed. A message otherwise.
 * @param  {boolean} iframed   Whether to display an iframe (val = url) or a
 *                             message (val is string).
 * @param  {boolean} closeBtn  Whether to include a close button. Defaults to
 *                             false if iframed, true otherwise.
 * @returns void
 */
function openModal(title, val, iframed, closeBtn) {
    if (iframed === void 0) { iframed = true; }
    // Load the css if needed.
    if (!bootstrapLoaded) {
        bootstrapLoaded = true;
        // Add the css
        document.head.insertAdjacentHTML("beforeend", "<link rel=stylesheet href=pages/css/bootstrap.min.css>");
        // Add the DOM for a modal
        document.body.insertAdjacentHTML("beforeend", "\n            <!-- The Modal -->\n            <div class=\"modal fade\" id=\"msgModal\" role=\"dialog\">\n                <div class=\"modal-dialog\" role=\"document\">\n                    <div class=\"modal-content\">\n\n                    <!-- Modal Header -->\n                    <div class=\"modal-header\">\n                        <h4 class=\"modal-title\">Modal Heading</h4>\n                        <button type=\"button\" class=\"close\" data-dismiss=\"modal\">&times;</button>\n                    </div>\n\n                    <!-- Modal body -->\n                    <div class=\"modal-body\">\n                        <!-- TODO: Check if works on both iPhone and Firefox. Used to be overflow-y:auto;overflow-x:hidden; -->\n                        <div id=\"iframe-container\" style=\"height:350px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch\">\n                            <iframe frameBorder=\"0\" src=\"\" style=\"width:100%;height:100%;\"></iframe>\n                        </div>\n                        <span id=\"msg-container\"></span>\n                    </div>\n\n                    <!-- Modal footer -->\n                    <div id=\"modal-footer\" class=\"modal-footer\">\n                        <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\">Close</button>\n                    </div>\n                </div>\n            </div>\n        ");
        // Note re. traditional bootstrap iframe. I'm using a different format
        // to make sure iphone compatible.
        // <!-- <div id="iframe-container" class="embed-responsive embed-responsive-1by1">
        //     <iframe class="embed-responsive-item" src=""></iframe>
        // </div> -->
        // Add the javascript
        openUrlModalContinue(title, val, iframed, closeBtn);
    }
    else {
        openUrlModalContinue(title, val, iframed, closeBtn);
    }
}
/**
 * A follow-up function for opening the url modal.
 * @param  {string}  title     The title.
 * @param  {string}  val       The URL if iframed. A message otherwise.
 * @param  {boolean} iframed   Whether to display an iframe (val = url) or a
 *                             message (val is string).
 * @param  {boolean} closeBtn  Whether to include a close button. Defaults to
 *                             false if iframed, true otherwise.
 * @returns void
 */
function openUrlModalContinue(title, val, iframed, closeBtn) {
    if (msgModal === undefined) {
        msgModal = jQuery("#msgModal");
        myTitle = msgModal.find("h4.modal-title");
        iFrameContainer = msgModal.find("#iframe-container");
        msgContainer = msgModal.find("#msg-container");
        myIFrame = iFrameContainer.find("iframe");
        footer = msgModal.find("#modal-footer");
    }
    // Immediately hide.
    iFrameContainer.hide();
    // Clear it.
    myIFrame.attr("src", "");
    myTitle.html(title);
    if (iframed === true) {
        msgContainer.hide();
        myIFrame.attr("src", val);
        if (closeBtn === undefined) {
            footer.hide();
        }
        // Only show once loaded.
        myIFrame.on("load", function () {
            iFrameContainer.show();
        });
    }
    else {
        msgContainer.show();
        iFrameContainer.hide();
        // On some rare occasions, a previous iframe may take too long to
        // load, so the iFramEContainer.show() can open after this hide. Put
        // in a timeout to fix this. It's hashish, but works. Slideup just to
        // make it look a little better (less like the bug that it is!).
        setTimeout(function () {
            if (msgContainer.css("display") === "inline") {
                iFrameContainer.slideUp();
            }
        }, 1000);
        msgContainer.html(val);
        if (closeBtn === undefined) {
            footer.show();
        }
    }
    if (closeBtn === true) {
        footer.show();
    }
    else if (closeBtn === false) {
        footer.hide();
    }
    msgModal.modal();
}
// For debugging...
// window["openModal"] = openModal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn")))

/***/ }),

/***/ "jIpr":
/*!********************************************!*\
  !*** ./src/components/UI/Menu3D/Menu3D.ts ***!
  \********************************************/
/*! exports provided: menuInf, clickSound, openMainMenuFloorButton, setup, setupSubMenuNavButtons */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "menuInf", function() { return menuInf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clickSound", function() { return clickSound; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openMainMenuFloorButton", function() { return openMainMenuFloorButton; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupSubMenuNavButtons", function() { return setupSubMenuNavButtons; });
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Cameras/CommonCamera */ "vCcv");
/* harmony import */ var _Navigation_Points__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Navigation/Points */ "ph2Y");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Vars/Vars */ "gqHH");
/* harmony import */ var _Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Button */ "MD2z");
/* harmony import */ var _Rotations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Rotations */ "nKXq");
/* harmony import */ var _Styles__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Styles */ "BjG7");
/* harmony import */ var _staple_public_domain_mp3__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./staple-public-domain.mp3 */ "O2BG");
/* harmony import */ var _staple_public_domain_mp3__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_staple_public_domain_mp3__WEBPACK_IMPORTED_MODULE_6__);







// An easy way to define a menu. It's a nested object. See setup();
/** @type {Object<string,*>} */
var menuInf;
var clickSound = undefined;
var openMainMenuFloorButton;
// These variables need to be initialized in setup(), to enable reloading if
// necessary.
/** @type {Array<*>} */
var allButtons;
var latestBreadcrumbsViewed;
/** @type {Object<string>} */
// let sceneInfoData: any;
var gui3DMenuManager;
var commonMenuAnchor;
/**
 * Load the 3D GUI. Also reloads the GUI (destroys old version). Reloading is
 * useful when you add a new PDB, for example, and want to update the
 * selection options.
 * @param  {Object<string,*>=} data The data from scene_info.json. Saves on
 *                                  first use so it doesn't need to be
 *                                  subsequently specified.
 * @returns void
 */
function setup(data) {
    // Initialize some variables
    allButtons = [];
    latestBreadcrumbsViewed = [];
    menuInf = {
        "Styles": _Styles__WEBPACK_IMPORTED_MODULE_5__["buildStylesSubMenu"](),
        "Rotate": _Rotations__WEBPACK_IMPORTED_MODULE_4__["buildRotationsSubMenu"]()
    };
    // Save the scene data so you can reference it in the future, if you
    // recreate the menu. If it's not defined, the use the saved data.
    // if (data !== undefined) {
    //     sceneInfoData = data;
    // } else {
    //     data = sceneInfoData;
    // }
    // Only required to setup once.
    if (gui3DMenuManager === undefined) {
        // Make a manager for the menu
        gui3DMenuManager = new BABYLON.GUI.GUI3DManager(_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"]);
        // For debugging...
        // window["gui3DMenuManager"] = gui3DMenuManager;
    }
    setupMainMenu();
    // Only required to setup once.
    if (openMainMenuFloorButton === undefined) {
        setupMainMenuToggleButton();
    }
    // Only required to setup once.
    if (clickSound === undefined) {
        clickSound = new BABYLON.Sound("click-button", _staple_public_domain_mp3__WEBPACK_IMPORTED_MODULE_6___default.a, _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"], null, { loop: false, autoplay: false, spatialSound: true, volume: 0.1 });
    }
    // Simplify the menu (collapsing excessive parts).
    reduceSingleItemSubMenus();
}
/**
 * Setup the main menu.
 * @returns void
 */
function setupMainMenu() {
    // Here would also be a good place to add additional buttons such as voice
    // dictation. See setupAllSubMenuNavButtons for how this was done
    // previously.
    setupAllSubMenuNavButtons();
    commonMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too
    createPanelSixteenButtons();
}
/**
 * Creates a panel containing 16 buttons. These buttons are manipulated to
 * show different submenus.
 * @returns void
 */
function createPanelSixteenButtons() {
    // let panel = new BABYLON.GUI.CylinderPanel();
    var panel = new BABYLON.GUI.SpherePanel();
    panel.radius = _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["MENU_RADIUS"];
    panel.margin = _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["MENU_MARGIN"];
    gui3DMenuManager.addControl(panel);
    panel.blockLayout = true;
    var _loop_1 = function (idx) {
        var func = function () { return; };
        var txt = idx.toString();
        var color = "yellow";
        var levelInt = 1;
        allButtons.push(new _Button__WEBPACK_IMPORTED_MODULE_3__["ButtonWrapper"]({
            clickFunc: function (buttonWrapper) {
                func();
                // For reasons I don't understand, the radius on this
                // cylinder (set below) doesn't take. Put it here to
                // too make sure.
                // cylinderPanelMainMenu.radius = Vars.MENU_RADIUS;
                // cylinderPanelMainMenu.margin = Vars.MENU_MARGIN;
            },
            default: false,
            falseTxt: txt,
            initFunc: function (buttonWrapper) {
                buttonWrapper.isVisible(false); // Buttons start off hidden.
            },
            level: levelInt,
            name: "menu-visible-button-" + txt,
            panel: panel,
            trueTxt: txt,
            color: color,
        }));
    };
    // Add buttons
    for (var idx = 0; idx < 16; idx++) {
        _loop_1(idx);
    }
    // Set radius and such.
    panel.columns = 4;
    panel.linkToTransformNode(commonMenuAnchor);
    panel.blockLayout = false;
}
/**
 * Applies a user-provided function to all levels of the menu. For example,
 * adds "Back" and "Close Menu" buttons to all sub menus.
 * @param  {Function(Object, Array<string>)} funcToApply  The function to
 * apply.
 * @returns void
 */
function applyFuncToAllMenuLevels(funcToApply) {
    /**
     * @param  {Object}           subMenu      The submenu data.
     * @param  {Array<string>}    breadcrumbs  They list of keys to get to
     *                                         this point in the menu.
     * @returns void
     */
    var recurse = function (subMenu, breadcrumbs) {
        funcToApply(subMenu, breadcrumbs);
        var keys = Object.keys(subMenu);
        var keysLen = keys.length;
        for (var i = 0; i < keysLen; i++) {
            var key = keys[i];
            var subMenuItems = subMenu[key];
            switch (typeof (subMenuItems)) {
                case "object":
                    recurse(subMenuItems, breadcrumbs.concat([key]));
                    break;
                default:
                    continue;
            }
        }
    };
    recurse(menuInf, []);
}
/**
 * Set up submenu navigation buttons like back and close.
 * @returns void
 */
function setupAllSubMenuNavButtons() {
    // Each of the submenus should have a back button and a close menu button.
    applyFuncToAllMenuLevels(function (subMenu, breadcrumbs) {
        setupSubMenuNavButtons(subMenu, breadcrumbs);
    });
}
/**
 * Sets up the submenu navigation buttons ("Back", "Close Menu"). This
 * function acts on a single submenu, but elsewhere it is applied to all
 * submenus.
 * @param  {*}        subMenu      Information about the submenu.
 * @param  {string[]} breadcrumbs  The breadcrumbs to get to this submenu.
 * @returns void
 */
function setupSubMenuNavButtons(subMenu, breadcrumbs) {
    if (breadcrumbs.length > 0) {
        // No back button on top-level menu.
        subMenu["Back ⇦"] = function () {
            var newBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
            showOnlyButtonsOfLevel(newBreadcrumbs);
        };
    }
    subMenu["Close Menu ×"] = function () {
        openMainMenuFloorButton.toggled();
    };
}
/**
 * Setup the toggle button on the floor that turns the main menu on and off.
 * @returns void
 */
function setupMainMenuToggleButton() {
    // Also set up a manager at your feet. This turns the main manager on and
    // off.
    var panelToggle = new BABYLON.GUI.StackPanel3D();
    gui3DMenuManager.addControl(panelToggle);
    // Set up the button
    openMainMenuFloorButton = new _Button__WEBPACK_IMPORTED_MODULE_3__["ButtonWrapper"]({
        clickFunc: function (buttonWrapper) {
            if (!buttonWrapper.value) {
                showOnlyButtonsOfLevel(undefined);
            }
            else {
                showOnlyButtonsOfLevel([]);
            }
            commonMenuAnchor.position.copyFrom(_Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]());
            commonMenuAnchor.rotation.y = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraRotationY"](); //  + Math.PI * 0.5;
            // camera.rotation.y + Math.PI * 0.5;s
        },
        default: false,
        falseTxt: "Show Menu",
        level: 0,
        name: "menu-visible-button",
        panel: panelToggle,
        trueTxt: "Hide Menu",
    });
    // For debugging...
    // window["openMainMenuFloorButton"] = openMainMenuFloorButton;
    // Set up the button anchor and move/rotate it.
    var mainMenuAnchorToggle = new BABYLON.TransformNode(""); // this can be a mesh, too
    panelToggle.linkToTransformNode(mainMenuAnchorToggle);
    mainMenuAnchorToggle.rotation.x = Math.PI * 0.5;
    // Update button position with each turn of the render loop.
    mainMenuAnchorToggle.position.copyFrom(_Navigation_Points__WEBPACK_IMPORTED_MODULE_1__["groundPointBelowCamera"]);
    mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1;
    mainMenuAnchorToggle.rotation.y = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraRotationY"]();
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].registerBeforeRender(function () {
        mainMenuAnchorToggle.position.copyFrom(_Navigation_Points__WEBPACK_IMPORTED_MODULE_1__["groundPointBelowCamera"]); // Prob
        mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1; // No prob
        mainMenuAnchorToggle.rotation.y = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraRotationY"](); // Prob
    });
}
/**
 * Shows the buttons associated with a specific submenu level.
 * @param  {Array<string>|undefined} breadcrumbs The breadcrumbs to get to the desired menu level.
 * @returns void
 */
function showOnlyButtonsOfLevel(breadcrumbs) {
    if ((breadcrumbs !== undefined) && (breadcrumbs.length > 0)) {
        // Not the top-level menu or floor button, so enable "Last" button.
        latestBreadcrumbsViewed = breadcrumbs;
        if (menuInf["Last"] === undefined) {
            menuInf["Last"] = function () {
                console.log("Going to", latestBreadcrumbsViewed);
                showOnlyButtonsOfLevel(latestBreadcrumbsViewed);
            };
        }
    }
    // Hide all the buttons.
    var allButtonsLen = allButtons.length;
    for (var i = 0; i < allButtonsLen; i++) {
        var btn = allButtons[i];
        btn.isVisible(false);
    }
    if (breadcrumbs === undefined) {
        // It's the button on the floor. Just needed to hide all buttons, so
        // now you're good.
        return;
    }
    // Find the submenu
    var subMenu = menuInf;
    var breadcrumbsLen = breadcrumbs.length;
    for (var i = 0; i < breadcrumbsLen; i++) {
        var breadcrumb = breadcrumbs[i];
        subMenu = subMenu[breadcrumb];
    }
    // Get the names of the submenu items.
    var subMenuItemNames = Object.keys(subMenu);
    // Set some names aside as "special".
    var redBtns = ["Close Menu ×"];
    var yellowBtns = ["Back ⇦"];
    var specialBtns = redBtns.concat(yellowBtns);
    // Sort those names
    subMenuItemNames.sort(function (first, second) {
        // See
        // https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
        var firstIsSpecial = specialBtns.indexOf(first) !== -1;
        var secondIsSpecial = specialBtns.indexOf(second) !== -1;
        if (firstIsSpecial && !secondIsSpecial) {
            return 1;
        }
        else if (!firstIsSpecial && secondIsSpecial) {
            return -1;
        }
        else {
            return ("" + first).localeCompare(second);
        }
    });
    // Figure out what layout to use.
    var btnIdxOrder = [];
    if (subMenuItemNames.length <= 4) {
        btnIdxOrder = [7, 6, 5, 4];
    }
    else if (subMenuItemNames.length <= 8) {
        btnIdxOrder = [7, 6, 5, 4, 11, 10, 9, 8];
    }
    else if (subMenuItemNames.length <= 12) {
        btnIdxOrder = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8];
    }
    else {
        btnIdxOrder = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8, 15, 14, 13, 12];
    }
    // Update and show the buttons.
    var len = subMenuItemNames.length;
    var _loop_2 = function (i) {
        var subMenuItemName = subMenuItemNames[i];
        var subMenuItem = subMenu[subMenuItemName];
        var btnidx = btnIdxOrder[i];
        var btn = allButtons[btnidx];
        btn.updateTxt(subMenuItemName);
        switch (typeof (subMenuItem)) {
            case "object":
                btn.clickFunc = function () {
                    showOnlyButtonsOfLevel(breadcrumbs.concat(subMenuItemName));
                };
                btn.updateColor("green");
                break;
            case "function":
                btn.clickFunc = subMenuItem;
                btn.updateColor("default");
                break;
            default:
                break;
        }
        if (redBtns.indexOf(subMenuItemName) !== -1) {
            btn.updateColor("red");
        }
        else if (yellowBtns.indexOf(subMenuItemName) !== -1) {
            btn.updateColor("yellow");
        }
        // menuInfFlatThisOne.upLevel doesn't seem to be necessary.
        btn.isVisible(true);
    };
    for (var i = 0; i < len; i++) {
        _loop_2(i);
    }
}
/**
 * If a given submenu has only one item, condense the menu.
 * @returns void
 */
function reduceSingleItemSubMenus() {
    /**
     * @param  {Object}           subMenu      The submenu data.
     * @param  {Array<string>}    breadcrumbs  They list of keys to get to
     *                                         this point in the menu.
     * @returns void
     */
    var recurse = function (subMenu, breadcrumbs) {
        var keys = Object.keys(subMenu);
        // There should be three items in a one-item submenu, including back
        // and close.
        if (keys.length === 3) {
            var keysToKeep = keys.filter(function (k) {
                if (k === "Close Menu ×") {
                    return false;
                }
                else if (k === "Back ⇦") {
                    return false;
                }
                return true;
            });
            if (keysToKeep.length === 1) {
                // Only one item remains. That's the one to collpase.
                var keyToKeep = keysToKeep[0];
                // Get the name of the new key (one up with keyToKeep added to
                // end).
                var lastKey = breadcrumbs[breadcrumbs.length - 1];
                var newKey = lastKey + ": " + keyToKeep;
                // Redefine the breadcrumbs
                breadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1).concat([newKey]);
                // Go through the menu keys to get to the submenu above this
                // one.
                subMenu = menuInf;
                var breadcrumbsButLast = breadcrumbs.slice(0, breadcrumbs.length - 1);
                var breadcrumbsButLastLen = breadcrumbsButLast.length;
                for (var i = 0; i < breadcrumbsButLastLen; i++) {
                    var breadcrumb = breadcrumbsButLast[i];
                    subMenu = subMenu[breadcrumb];
                }
                // Rename if submenu.
                subMenu[newKey] = subMenu[lastKey][keyToKeep];
                delete subMenu[lastKey];
                // Go into new submenu
                subMenu = subMenu[newKey];
                // Update keys
                keys = Object.keys(subMenu);
            }
        }
        var keysLen = keys.length;
        for (var i = 0; i < keysLen; i++) {
            var key = keys[i];
            var subMenuItems = subMenu[key];
            switch (typeof (subMenuItems)) {
                case "object":
                    recurse(subMenuItems, breadcrumbs.concat([key]));
                    break;
                default:
                    continue;
            }
        }
    };
    recurse(menuInf, []);
}


/***/ }),

/***/ "mvtX":
/*!*******************************************!*\
  !*** ./src/components/WebRTC/Lecturer.ts ***!
  \*******************************************/
/*! exports provided: isLecturerBroadcasting, Lecturer, startBroadcast, sendToggleRepCommand, sendUpdateMolRotCommand, sendUndoRotCommand */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isLecturerBroadcasting", function() { return isLecturerBroadcasting; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Lecturer", function() { return Lecturer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startBroadcast", function() { return startBroadcast; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendToggleRepCommand", function() { return sendToggleRepCommand; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendUpdateMolRotCommand", function() { return sendUpdateMolRotCommand; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sendUndoRotCommand", function() { return sendUndoRotCommand; });
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Cameras/CommonCamera */ "vCcv");
/* harmony import */ var _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../UI/OpenPopup/OpenPopup */ "iC5T");
/* harmony import */ var _WebRTCBase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./WebRTCBase */ "gg4m");
// Functions for leader mode, that the leader (lecturer) uses.
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var isLecturerBroadcasting = false;
var lect;
var Lecturer = /** @class */ (function (_super) {
    __extends(Lecturer, _super);
    // because this is the lecturer).
    function Lecturer() {
        var _this = _super.call(this) || this;
        _this.idReady = null;
        _this.gotConn = null;
        _this.conns = []; // The connections (there could be multiple ones
        var gotConnResolve;
        _this.gotConn = new Promise(function (resolve, reject) {
            gotConnResolve = resolve;
        });
        _this.idReady = new Promise(function (idReadyResolve, reject) {
            _this.setupWebRTCCallbacks(idReadyResolve, gotConnResolve);
        });
        return _this;
    }
    /**
     * Send data to a remote webrtc partner.
     * @param  {*} data  The data to send.
     * @returns void
     */
    Lecturer.prototype.sendData = function (data) {
        if (_WebRTCBase__WEBPACK_IMPORTED_MODULE_2__["DEBUG"] === true) {
            console.log("Send:", data);
        }
        /** @type {number} */
        var connsLen = this.conns.length;
        for (var i = 0; i < connsLen; i++) {
            var conn = this.conns[i];
            conn.send(data);
        }
    };
    /**
     * Sets up the webrtc callback functions.
     * @param  {Function(string)} idReadyResolve  The function to call when
     *                                            peer.js is open.
     * @param  {Function()}       gotConnResolve  The function to call when
     *                                            the connection is resolved.
     * @returns void
     */
    Lecturer.prototype.setupWebRTCCallbacks = function (idReadyResolve, gotConnResolve) {
        var _this = this;
        this.peer.on("open", function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (_this.peer.id === null) {
                _WebRTCBase__WEBPACK_IMPORTED_MODULE_2__["webRTCErrorMsg"]("Received null id from peer open.");
                _this.peer.id = _this.peerId;
            }
            else {
                _this.peerId = _this.peer.id;
            }
            idReadyResolve(_this.peerId);
            if (_WebRTCBase__WEBPACK_IMPORTED_MODULE_2__["DEBUG"] === true) {
                console.log(_this.peerId);
            }
        });
        // Below only needed on lecturer. It's when a connection is received.
        this.peer.on("connection", function (c) {
            _this.conns.push(c);
            gotConnResolve();
            if (_WebRTCBase__WEBPACK_IMPORTED_MODULE_2__["DEBUG"] === true) {
                console.log("Lecturer: added a connection");
            }
        });
        this.peer.on("close", function () {
            /** @type {number} */
            var connsLen = _this.conns.length;
            for (var i = 0; i < connsLen; i++) {
                _this.conns[i] = null;
            }
            _WebRTCBase__WEBPACK_IMPORTED_MODULE_2__["webRTCStandardErrorMsg"]();
        });
    };
    return Lecturer;
}(_WebRTCBase__WEBPACK_IMPORTED_MODULE_2__["WebRTCBase"]));

/**
 * Start broadcasting information like the current camera location and
 * position.
 * @returns void
 */
function startBroadcast() {
    isLecturerBroadcasting = true;
    // Contact the peerjs server
    lect = new Lecturer();
    lect.idReady.then(function (id) {
        _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_1__["openModal"]("Leader", "pages/leader.html?f=" + id, true, true);
    });
    // Periodically send the information about the representations.
    setInterval(function () {
        var pos = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
        var rotQua = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraRotationQuaternion"]();
        var rotFac = 1.0;
        var val = [pos.x, pos.y, pos.z, rotFac * rotQua.x, rotFac * rotQua.y, rotFac * rotQua.z, rotFac * rotQua.w];
        lect.sendData({
            "type": "locrot",
            "val": val,
        });
    }, 100);
    // Periodically send the current url (to sync initial representations with
    // remote).
    setInterval(function () {
        lect.sendData({
            "type": "initialUrl",
            "val": window.location.href
        });
    }, 2000);
}
/**
 * Sends the data to the student so they can run VisStyles.toggleRep in their
 * ProteinVR instance.
 * @param  {Array<*>}            filters        Can include strings (lookup
 *                                              sel in selKeyWordTo3DMolSel).
 *                                              Or a 3DMoljs selection object.
 * @param  {string}              repName        The representative name. Like
 *                                              "Surface".
 * @param  {string}              colorScheme    The name of the color scheme.
 * @param  {Function|undefined}  finalCallback  Callback to run once the mesh
 *                                              is entirely done.
 * @returns void
 */
function sendToggleRepCommand(filters, repName, colorScheme) {
    lect.sendData({
        "type": "toggleRep",
        "val": {
            "filters": filters,
            "repName": repName,
            "colorScheme": colorScheme
        }
    });
}
/**
 * Sends the data to the student so they can run Rotations.axisRotation.
 * @param  {string} axis The axis to rotate about.
 * @returns void
 */
function sendUpdateMolRotCommand(axis) {
    lect.sendData({
        "type": "molAxisRotation",
        "val": axis
    });
}
function sendUndoRotCommand() {
    lect.sendData({
        "type": "molUndoRot",
        "val": undefined
    });
}
// For debugging...
// window["startBroadcast"] = startBroadcast;


/***/ }),

/***/ "nKXq":
/*!***********************************************!*\
  !*** ./src/components/UI/Menu3D/Rotations.ts ***!
  \***********************************************/
/*! exports provided: buildRotationsSubMenu, axisRotation, undoRotate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "buildRotationsSubMenu", function() { return buildRotationsSubMenu; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "axisRotation", function() { return axisRotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "undoRotate", function() { return undoRotate; });
/* harmony import */ var _Mols_3DMol_PositionInScene__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../Mols/3DMol/PositionInScene */ "YORc");
/* harmony import */ var _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../Mols/3DMol/VRML */ "PjGz");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../Vars/Vars */ "gqHH");
/* harmony import */ var _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../WebRTC/Lecturer */ "mvtX");




/**
 * Builds a submenu object describing how the models and be rotated.
 * @returns Object The submenu objct.
 */
function buildRotationsSubMenu() {
    return {
        "Undo Rotate": function () {
            undoRotate();
        },
        "X Axis": function () {
            axisRotation("x");
        },
        "Y Axis": function () {
            axisRotation("y");
        },
        "Z Axis": function () {
            axisRotation("z");
        },
    };
}
/**
 * Rotates the molecule about a given axis.
 * @param  {string} axis The axis to rotate about.
 * @returns void
 */
function axisRotation(axis) {
    var amt = 15.0 * Math.PI / 180.0;
    _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_1__["updateMolRotation"](axis, amt);
    _Mols_3DMol_PositionInScene__WEBPACK_IMPORTED_MODULE_0__["positionAll3DMolMeshInsideAnother"](undefined, _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].getMeshByName("protein_box"), true);
    if (_WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_3__["isLecturerBroadcasting"]) {
        // Let the student know about this change...
        _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_3__["sendUpdateMolRotCommand"](axis);
    }
}
/**
 * Undo a previous rotation.
 * @returns void
 */
function undoRotate() {
    var vec = _Mols_3DMol_PositionInScene__WEBPACK_IMPORTED_MODULE_0__["lastRotationBeforeAnimation"];
    _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_1__["setMolRotation"](vec.x, vec.y, vec.z);
    _Mols_3DMol_PositionInScene__WEBPACK_IMPORTED_MODULE_0__["positionAll3DMolMeshInsideAnother"](undefined, _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].getMeshByName("protein_box"), true);
    if (_WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_3__["isLecturerBroadcasting"]) {
        // Let the student know about this change...
        _WebRTC_Lecturer__WEBPACK_IMPORTED_MODULE_3__["sendUndoRotCommand"]();
    }
}


/***/ }),

/***/ "nV79":
/*!********************************************!*\
  !*** ./src/components/Cameras/VRCamera.ts ***!
  \********************************************/
/*! exports provided: setup, setupGazeTracker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupGazeTracker", function() { return setupGazeTracker; });
/* harmony import */ var _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Navigation/Pickables */ "TqLJ");
/* harmony import */ var _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Scene/Optimizations */ "0fSa");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _VRControllers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./VRControllers */ "pAUf");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Vars/UrlVars */ "p11u");
// This module sets up the VR camera.





var lastTimeJSRunningChecked;
/**
 * Sets up the VR camera.
 * @returns void
 */
function setup() {
    if (_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_4__["checkWebrtcInUrl"]()) {
        // Never do VR in webrtc mode.
        return;
    }
    // Setup different trigger VR functions (changes state, etc.)
    setupEnterAndExitVRCallbacks();
    _VRControllers__WEBPACK_IMPORTED_MODULE_3__["setup"]();
    // When you gain or loose focus, always exit VR mode. Doing this for
    // iphone pwa, which otherwise can't exit VR mode.
    // jQuery(window).focus(() => { exitVRAndFS(); });
    // jQuery(window).blur(() => { exitVRAndFS(); });
    // jQuery("body").focus(() => { exitVRAndFS(); });
    // jQuery("body").blur(() => { exitVRAndFS(); });
    // document.addEventListener("visibilitychange", () => { exitVRAndFS(); }, false);
    // Surprizingly, none of the above are triggering on ios pwa! Let's try an
    // additional approach...
    setInterval(function () {
        var now = new Date().getTime();
        if (lastTimeJSRunningChecked === undefined) {
            lastTimeJSRunningChecked = now;
        }
        var deltaTime = now - lastTimeJSRunningChecked;
        if (deltaTime > 2000) {
            // Javascript must have stopped recently.
            exitVRAndFS();
        }
        lastTimeJSRunningChecked = now;
    }, 1000);
}
/**
 * Exits VR and/or full-screen mode, if necessary.
 * @returns void
 */
function exitVRAndFS() {
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"] === undefined) {
        return;
    }
    // I wondered if the if statements below prevented ios pwa from working.
    // Could be wrong, but doesn't hurt to omit them. Leave them commented in
    // case you need them in the future.
    // if (Vars.vrHelper.isInVRMode) {
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].exitVR();
    // }
    // if (Vars.vrHelper._fullscreenVRpresenting) {
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].getEngine().exitFullscreen();
    // }
}
/**
 * Sets up the enter and exit VR functions. When enters, sets up VR. When
 * exists, downgrades to non-VR navigation.
 * @returns void
 */
function setupEnterAndExitVRCallbacks() {
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].onEnteringVRObservable.add(function (a, b) {
        // When you enter VR. Not sure what a and b are. Both are objects.
        // Update navMode
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].navMode = 2 /* VRNoControllers */;
        // Setup teleportation. If uncommented, this is the one that comes
        // with BABYLON.js.
        // setupCannedVRTeleportation();
        setupGazeTracker();
        // Reset selected mesh.
        _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_0__["setCurPickedMesh"](undefined);
        // You need to recalculate the shadows. I've found you get back
        // shadows in VR otherwise.
        _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_1__["updateEnvironmentShadows"]();
        // Hide the 2D buttons.
        jQuery(".ui-button").hide();
        jQuery(".babylonVRicon").hide();
        // Start trying to initialive the controllers (in case they weren't
        // initalized already).
        _VRControllers__WEBPACK_IMPORTED_MODULE_3__["startCheckingForControlers"]();
        window["vrHelper"] = _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"];
    });
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].onExitingVRObservable.add(function () {
        // Update navMode
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrVars"].navMode = 3 /* NoVR */;
        // Reset selected mesh.
        _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_0__["setCurPickedMesh"](undefined);
        // Let's recalculate the shadows here again too, just to be on the
        // safe side.
        _Scene_Optimizations__WEBPACK_IMPORTED_MODULE_1__["updateEnvironmentShadows"]();
        // Show the 2D buttons.
        jQuery(".ui-button").show();
        jQuery(".babylonVRicon").show();
    });
}
/**
 * A placeholder mesh. Not technically empty, but pretty close.
 * @returns {*} The custom mesh (almost an empty).
 */
function makeEmptyMesh() {
    /** @const {*} */
    var customMesh = new BABYLON.Mesh("vrNavTargetMesh", _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"]);
    /** @const {Array<number>} */
    var positions = [0, 0, 0];
    /** @const {Array<number>} */
    var indices = [0];
    /** @const {*} */
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.applyToMesh(customMesh);
    customMesh.isVisible = false;
    return customMesh;
}
/**
 * Sets up the VR gaze tracking mesh.
 * @returns void
 */
function setupGazeTracker() {
    /**
     * @param {*}
     * @returns boolean
     */
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].raySelectionPredicate = function (mesh) {
        // if (!mesh.isVisible) {
        //     return false;
        // }
        return _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_0__["checkIfMeshPickable"](mesh);
    };
    // Make an invisible mesh that will be positioned at location of gaze.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].gazeTrackerMesh = makeEmptyMesh();
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].updateGazeTrackerScale = false; // Babylon 3.3 preview.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].displayGaze = true; // Does need to be true. Otherwise, position not updated.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].enableGazeEvenWhenNoPointerLock = true;
    // console.log(Vars.vrHelper);
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["vrHelper"].enableInteractions();
    // For debugging...
    // window.vrHelper = Vars.vrHelper;
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn")))

/***/ }),

/***/ "p11u":
/*!****************************************!*\
  !*** ./src/components/Vars/UrlVars.ts ***!
  \****************************************/
/*! exports provided: webrtc, shadows, setURL, readEnvironmentNameParam, readUrlParams, extractRepInfoFromKey, startLoadingStyles, checkWebrtcInUrl, checkShadowInUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(jQuery) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "webrtc", function() { return webrtc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shadows", function() { return shadows; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setURL", function() { return setURL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readEnvironmentNameParam", function() { return readEnvironmentNameParam; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readUrlParams", function() { return readUrlParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractRepInfoFromKey", function() { return extractRepInfoFromKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startLoadingStyles", function() { return startLoadingStyles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkWebrtcInUrl", function() { return checkWebrtcInUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkShadowInUrl", function() { return checkShadowInUrl; });
/* harmony import */ var _Mols_3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Mols/3DMol/ThreeDMol */ "qmVJ");
/* harmony import */ var _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Mols/3DMol/VisStyles */ "EYe7");
/* harmony import */ var _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Mols/3DMol/VRML */ "PjGz");
/* harmony import */ var _WebRTC_Student__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../WebRTC/Student */ "uBLq");
/* harmony import */ var _Vars__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Vars */ "gqHH");
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Cameras/CommonCamera */ "vCcv");






var stylesQueue = [];
var webrtc = undefined;
var shadows = false;
var urlParams;
/**
 * Get all the url parameters from a url string.
 * @param  {string} url  The url srtring.
 * @returns Object<string,*> The parameters.
 */
function getAllUrlParams(url) {
    // Adapted from
    // https://www.sitepoint.com/get-url-parameters-with-javascript/
    // get query string from url (optional) or window
    var queryString = url ? url.split("?")[1] : window.location.search.slice(1);
    // we'll store the parameters here
    var obj = {};
    // if query string exists
    if (queryString) {
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split("#")[0];
        // split our query string into its component parts
        var arr = queryString.split("&");
        var arrLen = arr.length;
        for (var i = 0; i < arrLen; i++) {
            var a = arr[i];
            // separate the keys and the values
            var keyValPair = a.split("=");
            // set parameter name and value (use 'true' if empty)
            var paramName = keyValPair[0];
            var paramValue = (keyValPair[1] === undefined) ? true : keyValPair[1];
            obj[paramName] = paramValue;
        }
    }
    return obj;
}
/**
 * Round a number and represent it as a string.
 * @param  {number} x  The number.
 * @returns string The rounded string.
 */
function round(x) {
    return (Math.round(100000 * x) / 100000).toString();
}
/**
 * Set the browser url to reflect the latest styles and rotations.
 * @returns void
 */
function setURL() {
    var params = [];
    // Get the rotations.
    /** @type {number} */
    var x = _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_2__["molRotation"].x;
    if (x !== 0) {
        params.push("rx=" + round(x));
    }
    /** @type {number} */
    var y = _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_2__["molRotation"].y;
    if (y !== 0) {
        params.push("ry=" + round(y));
    }
    /** @type {number} */
    var z = _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_2__["molRotation"].z;
    if (z !== 0) {
        params.push("rz=" + round(z));
    }
    // Set the url of molecular model.
    params.push("s=" + _Mols_3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_0__["modelUrl"]);
    if (webrtc !== undefined) {
        console.log("setting webrtc...");
        params.push("f=" + webrtc);
    }
    // Also get all the representations
    var i = 0;
    var styles = [];
    var keys = Object.keys(_Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["styleMeshes"]);
    var len = keys.length;
    for (var i2 = 0; i2 < len; i2++) {
        var key = keys[i2];
        if (_Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["styleMeshes"][key].mesh.isVisible) {
            styles.push("st" + i.toString() + "=" + key);
            i++;
        }
    }
    params = params.concat(styles);
    // Also get the camera position and rotation.
    var cameraPos = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_5__["getCameraPosition"]();
    var cameraRot = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_5__["getCameraRotationQuaternion"]();
    params.push("cx=" + round(cameraPos["x"]));
    params.push("cy=" + round(cameraPos["y"]));
    params.push("cz=" + round(cameraPos["z"]));
    params.push("crx=" + round(cameraRot["x"]));
    params.push("cry=" + round(cameraRot["y"]));
    params.push("crz=" + round(cameraRot["z"]));
    params.push("crw=" + round(cameraRot["w"]));
    // Also get the environment
    params.push("e=" + _Vars__WEBPACK_IMPORTED_MODULE_4__["sceneName"]);
    if (shadows === undefined) {
        shadows = false;
    }
    params.push("sh=" + shadows.toString());
    // Update URL
    window.history.pushState({
    // "html": response.html,
    // "pageTitle": response.pageTitle,
    }, document.title, window.location.href.split("?")[0] + "?" + params.join("&"));
}
/**
 * This function gets the environment name. It's separated from
 * readUrlParams() because you need th environment name earlier in the
 * loadding process.
 * @returns void
 */
function readEnvironmentNameParam() {
    urlParams = getAllUrlParams(window.location.href);
    // Get the environment.
    var environ = urlParams["e"];
    if (environ !== undefined) {
        _Vars__WEBPACK_IMPORTED_MODULE_4__["setSceneName"](environ);
    }
}
/**
 * Gets info from the url parameters and saves/applies it, as appropriate.
 * Note that this gets what molecular styles need to be applied, but does not
 * apply them. It should only be run once (the initial read).
 * @returns void
 */
function readUrlParams() {
    // Before anything, check if this is a webrtc session.
    webrtc = urlParams["f"];
    if (webrtc !== undefined) {
        _WebRTC_Student__WEBPACK_IMPORTED_MODULE_3__["startFollowing"](webrtc);
        // Prevent the student from being able to change the view or anything.
        _Vars__WEBPACK_IMPORTED_MODULE_4__["scene"].activeCamera.inputs.clear();
        // Also hide/move some of the buttons.
        jQuery("#help-button").hide();
        jQuery("#leader").hide();
        jQuery("#babylonVRiconbtn").hide();
        jQuery("#open-button").hide();
        var fullscreenButton = jQuery("#fullscreen-button");
        var bottom = fullscreenButton.css("bottom");
        if (bottom !== undefined) {
            var top_1 = +bottom.replace(/px/g, "");
            fullscreenButton.css("bottom", (top_1 - 60).toString() + "px");
        }
        // Make sure clicking on the screen doesn't move either. Basically
        // disable all teleportation.
        jQuery("#capture-clicks").remove();
    }
    // Update the mesh rotations
    /** @type {number} */
    var rx = urlParams["rx"];
    /** @type {number} */
    var ry = urlParams["ry"];
    /** @type {number} */
    var rz = urlParams["rz"];
    rx = (rx === undefined) ? 0 : +rx;
    ry = (ry === undefined) ? 0 : +ry;
    rz = (rz === undefined) ? 0 : +rz;
    _Mols_3DMol_VRML__WEBPACK_IMPORTED_MODULE_2__["setMolRotation"](rx, ry, rz);
    // Set the protein model if it's present.
    /** @type {string} */
    var src = urlParams["s"];
    if ((src !== undefined) && (src !== "")) {
        if ((src.length === 4) && (src.indexOf(".") === -1)) {
            // Assume it's a pdb id
            src = "https://files.rcsb.org/view/" + src.toUpperCase() + ".pdb";
        }
        _Mols_3DMol_ThreeDMol__WEBPACK_IMPORTED_MODULE_0__["setModelUrl"](src);
    }
    // Setup the styles as well.
    /** @type {Array<string>} */
    var keys = Object.keys(urlParams);
    var len = keys.length;
    for (var i = 0; i < len; i++) {
        var key = keys[i];
        if (key.slice(0, 2) === "st") {
            var repInfo = extractRepInfoFromKey(urlParams[key]);
            stylesQueue.push(repInfo);
        }
    }
    // If stylesQueue has nothing in it, set up a default rep.
    if (stylesQueue.length === 0) {
        stylesQueue.push([["Protein", "All"], "Cartoon", "Spectrum"]);
        stylesQueue.push([["Nucleic", "All"], "Stick", "Element"]);
        stylesQueue.push([["Ligand", "All"], "Stick", "Element"]);
    }
    // Position the camera
    var cx = urlParams["cx"];
    var cy = urlParams["cy"];
    var cz = urlParams["cz"];
    if ((cx !== undefined) && (cy !== undefined) && (cz !== undefined)) {
        _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_5__["setCameraPosition"](new BABYLON.Vector3(+cx, +cy, +cz));
    }
    var crx = urlParams["crx"];
    var cry = urlParams["cry"];
    var crz = urlParams["crz"];
    var crw = urlParams["crw"];
    if ((crx !== undefined) && (cry !== undefined) && (crz !== undefined) && (crw !== undefined)) {
        _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_5__["setCameraRotationQuaternion"](new BABYLON.Quaternion(+crx, +cry, +crz, +crw));
    }
    // Determine if shadows or not.
    shadows = urlParams["sh"];
    // Start updating the URL periodically. Because of camera changes.
    autoUpdateUrl();
}
/**
 * Takes a string like All--Ligand--Stick--Element and converts it to [["All",
 * "Ligand"], "Stick", "Element"].
 * @param  {string} key The srting.
 * @returns Array<*>
 */
function extractRepInfoFromKey(key) {
    var prts = key.split("--");
    var rep = decodeURIComponent(prts[prts.length - 2]);
    var colorScheme = decodeURIComponent(prts[prts.length - 1]);
    var sels = prts.slice(0, prts.length - 2).map(function (i) {
        i = decodeURIComponent(i);
        if (i.slice(0, 1) === "{") {
            i = JSON.parse(i);
        }
        return i;
    });
    return [sels, rep, colorScheme];
}
/**
 * Start loading all the molecular styles described in the url. A recursive
 * function.
 * @returns void
 */
function startLoadingStyles() {
    if (stylesQueue.length > 0) {
        // There are some styles to still run.
        var style = stylesQueue.pop();
        _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_1__["toggleRep"](style[0], style[1], style[2], function () {
            // Try to get the next style.
            startLoadingStyles();
        });
    }
}
/**
 * Checks if "f=" in url (webrtc). This works even if UrlVars hasn't been set yet.
 * @returns boolean
 */
function checkWebrtcInUrl() {
    return window.location.href.indexOf("f=") !== -1;
}
/**
 * Checks if "sh=" in url (shadows). This works even if UrlVars hasn't been
 * set yet.
 * @returns boolean
 */
function checkShadowInUrl() {
    return window.location.href.indexOf("sh=t") !== -1;
}
/**
 * Periodically update the url. This is because the camera can change, but I
 * don't want to update the url with every tick of the loop.
 * @returns void
 */
function autoUpdateUrl() {
    setInterval(function () {
        setURL();
    }, 1000);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "EVdn")))

/***/ }),

/***/ "pAUf":
/*!*************************************************!*\
  !*** ./src/components/Cameras/VRControllers.ts ***!
  \*************************************************/
/*! exports provided: setup, startCheckingForControlers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startCheckingForControlers", function() { return startCheckingForControlers; });
/* harmony import */ var _Navigation_Navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Navigation/Navigation */ "9bcR");
/* harmony import */ var _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Navigation/Pickables */ "TqLJ");
/* harmony import */ var _Navigation_Points__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Navigation/Points */ "ph2Y");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _CommonCamera__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CommonCamera */ "vCcv");
/* harmony import */ var _VRCamera__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./VRCamera */ "nV79");






var lastTriggerTime = 0;
var lastPadRotationTime = 0;
var padMoveSpeedFactor = 0.0;
var padRotateSpeedFactor = 0.0;
var padPressed = false;
// let controllerLoaded = false;
// let startedCheckingForControllers = false;
/**
 * Sets up the enter and exit functions when controllers load. No unload
 * function, though I'd like one.
 * @returns void
 */
function setup() {
    // Put a cube around the camera. This is to receive picker for pad-based
    // navigation, even if you're not pointing at a protein.
    _Navigation_Pickables__WEBPACK_IMPORTED_MODULE_1__["makePadNavigationSphereAroundCamera"]();
    // Use various controller detected functions to cover your bases...
    var onControllerLoaded = function (webVRController) {
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrVars"].navMode = 1 /* VRWithControllers */;
        _VRCamera__WEBPACK_IMPORTED_MODULE_5__["setupGazeTracker"]();
        setupTrigger(webVRController);
        setupPad(webVRController);
        // controllerLoaded = true;
    };
    // onControllersAttachedObservable doesn't work. I'd prefer that one...
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrHelper"].webVRCamera.onControllerMeshLoadedObservable.add(function (webVRController) {
        onControllerLoaded(webVRController);
    });
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrHelper"].onControllerMeshLoaded.add(function (webVRController) {
        onControllerLoaded(webVRController);
    });
    // Vars.vrHelper.webVRCamera.onControllersAttachedObservable.add((v) => {
    //     Vars.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    // });
    // Doesn't appear to be a detach function...
}
/**
 * Runs once user enters VR mode. Starts trying to init controllers and nav
 * sphere. Stops when it succeeds.
 * @returns void
 */
function startCheckingForControlers() {
    // On different devices (e.g., Oculus Go), the controllers don't start by
    // default. Try initializing them every once in a while just in case.
    // if (startedCheckingForControllers === false) {
    //     startedCheckingForControllers = true;
    //     setTimeout(keepTryingToPrepControllers, 3000);
    // }
}
// function keepTryingToPrepControllers(): void {
//     // console.log(Vars.vrHelper, Vars.vrHelper.currentVRCamera, Vars.vrHelper.currentVRCamera.initControllers);
//     // console.log("yo");
//     if ((Vars.vrHelper !== undefined) &&
//         (Vars.vrHelper.currentVRCamera !== undefined) &&
//         (Vars.vrHelper.currentVRCamera.initControllers) !== undefined) {
//             // It does get here.
//             // Try initializing the controllers if necessary.
//         // if (controllerLoaded === false) {
//         //     Vars.scene.getMeshByName("skybox.baked").isVisible = false;
//         //     console.log("Trying to initialize controllers...");
//         //     Vars.vrHelper.currentVRCamera.initControllers();
//         //     setTimeout(keepTryingToPrepControllers, 3000);
//         //     return;
//         // }
//         // Also initialize interactions if you need to...
//         // if (Vars.vrHelper._interactionsEnabled !== true) {
//             // Vars.vrHelper.enableInteractions();
//             VRCamera.setupGazeTracker();
//             // Note eno more setTimeout here. Because you've succeeded.
//             // setTimeout(keepTryingToPrepControllers, 3000);
//             return;
//         // }
//     }
//     setTimeout(keepTryingToPrepControllers, 3000);
// }
/**
 * Sets up the trigger button.
 * @param  {*} webVRController The web controller object.
 * @returns void
 */
function setupTrigger(webVRController) {
    // Monitor for triggers. Only allow one to fire every once in a while.
    // When it does, teleport to that location.
    webVRController.onTriggerStateChangedObservable.add(function (state) {
        if (!state["pressed"]) {
            // Only trigger if it's pressed.
            return;
        }
        /** @const {number} */
        var curTime = new Date().getTime();
        if (curTime - lastTriggerTime > _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["VR_CONTROLLER_TRIGGER_DELAY_TIME"]) {
            // Enough time has passed...
            lastTriggerTime = curTime;
            _Navigation_Navigation__WEBPACK_IMPORTED_MODULE_0__["actOnStareTrigger"]();
        }
    });
}
/**
 * Sets up the VR controller pads.
 * @param  {*} webVRController
 * @returns void
 */
function setupPad(webVRController) {
    // Also allow navigation via the pad (non teleporting).
    webVRController.onPadStateChangedObservable.add(function (state) {
        padPressed = state["pressed"];
        if ((padPressed) &&
            (Math.abs(padMoveSpeedFactor) < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET"]) &&
            (Math.abs(padRotateSpeedFactor) < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET"])) {
            console.log("Would reset camera view if you didn't get an error below...");
            return;
        }
    });
    webVRController.onPadValuesChangedObservable.add(function (state) {
        // If it's not a press right in the middle, then save the y value for
        // moving foward/backward.
        /** @type {number} */
        padMoveSpeedFactor = state["y"];
        // Also save the x for turning. But here you can make people really
        // sick, so only trigger if on outer 4ths of pad (no accidents).
        /** @type {number} */
        padRotateSpeedFactor = state["x"];
        // First check if it's right in the middle. That's reset camera zone,
        // so cancel.
        if ((Math.abs(padRotateSpeedFactor) < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET"]) &&
            (Math.abs(padMoveSpeedFactor) < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET"])) {
            padMoveSpeedFactor = 0;
            padRotateSpeedFactor = 0;
            return;
        }
        // Unless you're pretty far to the left or right, don't count it.
        if (Math.abs(padRotateSpeedFactor) < 0.5) {
            padRotateSpeedFactor = 0.0;
        }
        else {
            // Scale the rotation speed factor
            padRotateSpeedFactor = padRotateSpeedFactor + ((padRotateSpeedFactor > 0) ? -0.5 : 0.5);
            padRotateSpeedFactor = 2.0 * padRotateSpeedFactor;
        }
    });
    // Check the pad state at every render and act accordingly.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].registerBeforeRender(function () {
        if (padPressed) {
            moveCamera();
            rotateCamera();
        }
    });
}
/**
 * Moves the camera slightly forward.
 * @returns void
 */
function moveCamera() {
    // No point in proceeding if you don't have a stare point.
    if (_Navigation_Points__WEBPACK_IMPORTED_MODULE_2__["curStarePt"].equals(_Navigation_Points__WEBPACK_IMPORTED_MODULE_2__["pointWayOffScreen"])) {
        return;
    }
    // Get the vector form the stare point to the camera. TODO: This is also
    // calculated elsewhere. Could put it in its own function or even cache it
    // for speed.
    var cameraPos = _CommonCamera__WEBPACK_IMPORTED_MODULE_4__["getCameraPosition"]();
    var vecStarePtCamera = _Navigation_Points__WEBPACK_IMPORTED_MODULE_2__["curStarePt"].subtract(cameraPos);
    vecStarePtCamera.normalize();
    var deltaVec = vecStarePtCamera.scale(padMoveSpeedFactor * _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["PAD_MOVE_SPEED"] * _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["scene"].getAnimationRatio());
    _CommonCamera__WEBPACK_IMPORTED_MODULE_4__["setCameraPosition"](cameraPos.subtract(deltaVec));
}
/**
 * Rotates the VR camera slightly.
 * @returns void
 */
function rotateCamera() {
    if (padRotateSpeedFactor === 0) {
        // Why proceed if there is no rotation?
        return;
    }
    var nowTime = new Date().getTime();
    if (nowTime - lastPadRotationTime < _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["VR_CONTROLLER_PAD_ROTATION_DELAY_TIME"]) {
        // Avoid rapid/continuous rotations. I tested this. It makes people
        // want to vomit.
        return;
    }
    lastPadRotationTime = nowTime;
    // Get the camera's current rotation.
    var curAngles = _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrHelper"].webVRCamera.rotationQuaternion.toEulerAngles();
    // Rotate it slightly about up axis.
    // curAngles.y += 0.1 * padRotateSpeedFactor * Vars.PAD_MOVE_SPEED * Vars.scene.getAnimationRatio();
    // curAngles.y = curAngles.y + Math.sign(padRotateSpeedFactor) * 0.0625 * Math.PI;
    // Rotates 45 degrees for rapid reorientation.
    curAngles.y = curAngles.y + Math.sign(padRotateSpeedFactor) * 0.25 * Math.PI;
    // Set camera to this new rotation.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_3__["vrHelper"].webVRCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(curAngles);
}


/***/ }),

/***/ "ph2Y":
/*!*********************************************!*\
  !*** ./src/components/Navigation/Points.ts ***!
  \*********************************************/
/*! exports provided: pointWayOffScreen, groundPointBelowCamera, groundPointBelowStarePt, curStarePt, setCurStarePt, setup, setStarePointInfo, groundPointPickingInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pointWayOffScreen", function() { return pointWayOffScreen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "groundPointBelowCamera", function() { return groundPointBelowCamera; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "groundPointBelowStarePt", function() { return groundPointBelowStarePt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "curStarePt", function() { return curStarePt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCurStarePt", function() { return setCurStarePt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStarePointInfo", function() { return setStarePointInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "groundPointPickingInfo", function() { return groundPointPickingInfo; });
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Cameras/CommonCamera */ "vCcv");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _Pickables__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Pickables */ "TqLJ");
/* harmony import */ var _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../UI/Menu3D/Menu3D */ "jIpr");
// This module has functions for storing various important points in the
// scene. Note that the camera location is in CommonCamera, not here.




var pointWayOffScreen = new BABYLON.Vector3(-1000, 1000, 1000);
var groundPointBelowCamera = new BABYLON.Vector3(0, 0, 0);
var groundPointBelowStarePt = new BABYLON.Vector3(0, 0, 0);
var curStarePt = new BABYLON.Vector3(0, 0, 0);
/**
 * Sets the curStarePt variable externally.
 * @param {*} pt
 * @returns void
 */
function setCurStarePt(pt) {
    curStarePt.copyFrom(pt);
}
/**
 * Sets up the key points detection. Stare point, point below the camera, etc.
 * @returns void
 */
function setup() {
    // Hide menu button if clsoer than this
    var CLOSE_TO_GROUND_DIST = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["BUTTON_SPHERE_RADIUS"] * 1.5;
    // Constantly update the stare point info. Also, position the tracking
    // mesh.
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].registerBeforeRender(function () {
        // Get the stare point. Here because it should be updated with every
        // frame.
        setStarePointInfo();
        cancelStareIfFarAway();
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navTargetMesh.position.copyFrom(curStarePt);
        // Hide Vars.vrVars.navTargetMesh if it's on padNavSphereAroundCamera.
        if (_Pickables__WEBPACK_IMPORTED_MODULE_2__["curPickedMesh"] !== undefined) {
            _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navTargetMesh.isVisible = _Pickables__WEBPACK_IMPORTED_MODULE_2__["curPickedMesh"] !== _Pickables__WEBPACK_IMPORTED_MODULE_2__["padNavSphereAroundCamera"];
        }
        // Also the point on the ground below the camera should be updated
        // every turn of the render loop (to position the menu button).
        var camPos = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
        var pickedGroundPt = groundPointPickingInfo(camPos).pickedPoint;
        if (pickedGroundPt) {
            groundPointBelowCamera = pickedGroundPt;
            // If the pickedgroundPt is close, hide the navigation menu button (to
            // prevent user from getting trapped).
            var heightOffGround = camPos.y - pickedGroundPt.y;
            if (heightOffGround < CLOSE_TO_GROUND_DIST) {
                _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].button.isVisible = false;
                _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].containingMesh.isVisible = false;
            }
            else {
                _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].button.isVisible = true;
                _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_3__["openMainMenuFloorButton"].containingMesh.isVisible = true;
            }
        }
        // Also the point on the ground below the stare point.
        pickedGroundPt = groundPointPickingInfo(curStarePt).pickedPoint;
        if (pickedGroundPt) {
            groundPointBelowStarePt = pickedGroundPt;
        }
    });
}
/**
 * Gets the point where the user is looking (or pointing with controllers).
 * @returns void
 */
function setStarePointInfo() {
    // This function runs with ever turn of the render loop. Set's information
    // about what you're looking/pointing at. Info saved to curStarePt
    /** @type {*} */
    var ray;
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 3 /* NoVR */) {
        // No VR yet. So it's outside the realm of the VRHelper. Calculate
        // it using the looking direction.
        // Get a ray extending out in the direction of the stare.
        ray = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera.getForwardRay();
    }
    else if ((_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) ||
        (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */)) {
        // Find the valid gazetracker mesh.
        /** @type {*} */
        var gazeTrackerMesh = void 0;
        if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */) {
            gazeTrackerMesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrHelper"].rightControllerGazeTrackerMesh;
            if (!gazeTrackerMesh) {
                gazeTrackerMesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrHelper"].leftControllerGazeTrackerMesh;
            }
        }
        else if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) {
            gazeTrackerMesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrHelper"].gazeTrackerMesh;
        }
        if (!gazeTrackerMesh) {
            console.log("error!");
            return;
        }
        if (!gazeTrackerMesh.isVisible) {
            setCurStarePt(pointWayOffScreen);
        }
        else {
            setCurStarePt(gazeTrackerMesh.absolutePosition);
        }
        // Construct a ray from the camera to the stare obj
        /** @type {*} */
        var camPos = _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]();
        ray = new BABYLON.Ray(camPos, curStarePt.subtract(camPos));
    }
    else {
        console.log("Unexpected error.");
    }
    setPickPointAndObjInScene(ray);
}
/**
 * Cancel the stare point if it's very far away.
 * @returns void
 */
function cancelStareIfFarAway() {
    if (curStarePt === undefined) {
        setCurStarePt(pointWayOffScreen);
        _Pickables__WEBPACK_IMPORTED_MODULE_2__["setCurPickedMesh"](undefined);
    }
    else {
        /** @type {number} */
        var dist = BABYLON.Vector3.Distance(_Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"](), curStarePt);
        if (dist > 10) {
            setCurStarePt(pointWayOffScreen);
            _Pickables__WEBPACK_IMPORTED_MODULE_2__["setCurPickedMesh"](undefined);
        }
    }
}
/**
 * Sets the pick point and object currently looking at.
 * @param  {*}       ray	          The looking ray.
 * @param  {boolean} [updatePos=true] Whether to update the position.
 * @returns void
 */
function setPickPointAndObjInScene(ray, updatePos) {
    if (updatePos === void 0) { updatePos = true; }
    // Determines where the specified ray intersects a pickable object.
    /** @const {*} */
    var pickingInfo = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].pickWithRay(ray, function (mesh) {
        return _Pickables__WEBPACK_IMPORTED_MODULE_2__["checkIfMeshPickable"](mesh);
    });
    /** @type {number} */
    var pickingInfoDist = pickingInfo.distance;
    if ((pickingInfo.hit) && (pickingInfoDist < _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["MAX_TELEPORT_DIST"])) {
        // It does hit the floor or some other pickable object. Return the
        // point.
        if (updatePos) {
            setCurStarePt(pickingInfo.pickedPoint);
        }
        _Pickables__WEBPACK_IMPORTED_MODULE_2__["setCurPickedMesh"](pickingInfo.pickedMesh);
    }
    else {
        // It doesn't hit the floor or is too far away, so return null.
        setCurStarePt(pointWayOffScreen);
        _Pickables__WEBPACK_IMPORTED_MODULE_2__["setCurPickedMesh"](undefined);
    }
}
/**
 * Gets the picking info for the point on the ground below a specified point.
 * @param   {*}              pt  The specified point.
 * @returns Object<string,*> The picking info, projected onto the ground.
 */
function groundPointPickingInfo(pt) {
    /** @const {*} */
    var ray = new BABYLON.Ray(pt, new BABYLON.Vector3(0, -1, 0), 50);
    /** @const {*} */
    var pickingInfo = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].pickWithRay(ray, function (mesh) {
        return (mesh.id === _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].groundMesh.id);
    });
    return pickingInfo;
}


/***/ }),

/***/ "qmVJ":
/*!************************************************!*\
  !*** ./src/components/Mols/3DMol/ThreeDMol.ts ***!
  \************************************************/
/*! exports provided: atomicInfo, modelUrl, setModelUrl, setup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "atomicInfo", function() { return atomicInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "modelUrl", function() { return modelUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setModelUrl", function() { return setModelUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setup", function() { return setup; });
/* harmony import */ var _UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../UI/Menu3D/Menu3D */ "jIpr");
/* harmony import */ var _UI_Menu3D_Styles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../UI/Menu3D/Styles */ "BjG7");
/* harmony import */ var _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../UI/OpenPopup/OpenPopup */ "iC5T");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../Vars/UrlVars */ "p11u");
/* harmony import */ var _Load__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Load */ "cw8d");
/* harmony import */ var _VRML__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./VRML */ "PjGz");
// Functions from loading molecules directly from a 3Dmol.js instance. See
// VRML.ts for additional functions related to the mesh itself.






var atomicInfo = {};
var modelUrl = "nanokid.sdf"; // NanoKidFile;
/**
 * Setter for modelUrl.
 * @param  {string} url The new value.
 * @returns void
 */
function setModelUrl(url) { modelUrl = url; }
/**
 * Load in the extra molecule meshes.
 * @returns void
 */
function setup() {
    after3DMolJsLoaded();
}
/**
 * Runs after the 3Dmol.js library is loaded.
 * @returns void
 */
function after3DMolJsLoaded() {
    _VRML__WEBPACK_IMPORTED_MODULE_5__["setup"](function () {
        _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__["readUrlParams"]();
        // let pdbUri = "https://files.rcsb.org/view/1XDN.pdb";
        _VRML__WEBPACK_IMPORTED_MODULE_5__["loadPDBURL"](modelUrl, function (mdl3DMol) {
            // Update URL with location
            _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__["setURL"]();
            if (!_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__["checkWebrtcInUrl"]()) {
                // It's not leader mode, set setup menu.
                // Get additional selection information about the loaded molecule.
                // Like residue name.
                getAdditionalSels(mdl3DMol);
                // Now that the pdb is loaded, you need to update the menu.
                _UI_Menu3D_Styles__WEBPACK_IMPORTED_MODULE_1__["updateModelSpecificSelectionsInMenu"](_UI_Menu3D_Menu3D__WEBPACK_IMPORTED_MODULE_0__["menuInf"]);
            }
            // Now that the PDB is loaded, you can start loading styles.
            _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__["startLoadingStyles"]();
            // Continue...
            _Load__WEBPACK_IMPORTED_MODULE_4__["afterLoading"]();
            // If it's nanokid, open a popup to let them specify a url or
            // pdbid.
            if ((modelUrl === "nanokid.sdf") && (_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_3__["checkWebrtcInUrl"]() === false)) {
                setTimeout(function () {
                    // Give them some time to admire nanokid... :)
                    _UI_OpenPopup_OpenPopup__WEBPACK_IMPORTED_MODULE_2__["openModal"]("Load Molecule", "pages/load.html");
                }, 3000);
            }
        });
    });
}
/**
 * Generates additional possible selections from the properties of the atoms
 * themselves (like residue names).
 * @param  {*} mdl3DMol  A 3dmoljs molecule object.
 * @returns void
 */
function getAdditionalSels(mdl3DMol) {
    // Get all the atoms.
    /** @type {Array<Object<string,*>>} */
    var atoms = mdl3DMol.selectedAtoms({});
    atomicInfo = {
        "Atom Name": [],
        "Chain": [],
        "Element": [],
        "Residue Index": [],
        "Residue Name": [],
        "Secondary Structure": [],
    };
    /** @type {number} */
    var atomsLen = atoms.length;
    for (var i = 0; i < atomsLen; i++) {
        /** @type {Object<string,*>} */
        var atom = atoms[i];
        atomicInfo["Atom Name"].push(atom["atom"]);
        atomicInfo["Chain"].push(atom["chain"]);
        atomicInfo["Element"].push(atom["elem"]);
        atomicInfo["Residue Name"].push(atom["resn"]);
        atomicInfo["Residue Index"].push(atom["resi"]);
        atomicInfo["Secondary Structure"].push(atom["ss"]);
    }
    // We want just unique values.
    var lbls = Object.keys(atomicInfo);
    var len = lbls.length;
    for (var i = 0; i < len; i++) {
        var lbl = lbls[i];
        atomicInfo[lbl] = uniq(atomicInfo[lbl]);
    }
}
/**
 * Get the unique values in an array.
 * @param  {Array<string>} arr  The array
 * @returns Array<*>  The array, with unique values.
 */
function uniq(arr) {
    // see
    // https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
    var u = {};
    var a = [];
    /** @type {number} */
    var len = arr.length;
    for (var i = 0, l = len; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}


/***/ }),

/***/ "sqbB":
/*!*******************************************!*\
  !*** ./src/components/Mols/MolShadows.ts ***!
  \*******************************************/
/*! exports provided: shadowGenerator, setupShadowGenerator, getBlurDarknessAmbientFromLightName, setupShadowCatchers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shadowGenerator", function() { return shadowGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupShadowGenerator", function() { return setupShadowGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBlurDarknessAmbientFromLightName", function() { return getBlurDarknessAmbientFromLightName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupShadowCatchers", function() { return setupShadowCatchers; });
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _Vars_UrlVars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Vars/UrlVars */ "p11u");
// Functions to handle molecule shadows.


var shadowGenerator;
/**
 * Setup the shadow generator that casts a shadow from the molecule meshes.
 * @returns void
 */
function setupShadowGenerator() {
    // Get the light that will cast the shadows.
    var light = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].lights[0];
    /** @type {Object<string,number>} */
    var shadowInf = getBlurDarknessAmbientFromLightName();
    // shadowInf.T = 0;
    // shadowInf.blur = 2;
    // Set up the shadow generator.
    // Below gives error on iphone sometimes... And Oculus Go browser.
    // if (!Vars.IOS) {
    if (_Vars_UrlVars__WEBPACK_IMPORTED_MODULE_1__["checkShadowInUrl"]()) {
        shadowGenerator = new BABYLON.ShadowGenerator(4096, light);
        if (true) {
            // Set above to false for debugging (sharp shadow).
            // shadowInf.darkness = 0.8;
            shadowGenerator.useBlurExponentialShadowMap = true;
            // If using kernal, do below.
            shadowGenerator.useKernelBlur = true; // Very good shadows, but more expensive.
            shadowGenerator.blurKernel = shadowInf.blur; // Degree of bluriness.
            // shadowGenerator.blurScale = 15;
            // shadowGenerator.blurBoxOffset = 15;
            // console.log(shadowInf);
            shadowGenerator.setDarkness(shadowInf.darkness);
            // If not using blurKernal, do below. It's a bit faster, but
            // doesn't look as good.
            // shadowGenerator.blurScale = 12;  // Good for surfaces and ribbon.
            // shadowGenerator.blurBoxOffset = 15;
            // Old parameters not used:
            // shadowGenerator.usePoissonSampling = true;  // Good but slow.
        }
        // setTimeout(() => {
        //     Optimizations.updateEnvironmentShadows();
        // }, 1000)
        // Will make debugging easier.
        // window.shadowGenerator = shadowGenerator;
    }
    else {
        console.log("iOS, so not generating shadows... causes an error... See https://forum.babylonjs.com/t/issues-between-shadowgenerator-and-ios-osx/795");
    }
}
/**
 * Gets the blur and darkness to use on shadows and molecule lighting.
 * @returns Object<string,number>
 */
function getBlurDarknessAmbientFromLightName() {
    var light = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].lights[0];
    // Set some default values for the shadows.
    var blur = 64;
    var darkness = 0.9625; // Lower numbers are darker.
    var ambient = undefined;
    // Now overwrite those values if reason to do so in the name of the light.
    var blurMatches = light.name.match(/blur_([0-9\.]+)/g);
    if (blurMatches !== null) {
        blur = +blurMatches[0].substr(5);
    }
    /** @type Array<string> */
    var darknessMatches = light.name.match(/dark_([0-9\.]+)/g);
    if (darknessMatches !== null) {
        darkness = +darknessMatches[0].substr(5);
    }
    var ambientMatches = light.name.match(/ambient_([0-9\.]+)/g);
    if (ambientMatches !== null) {
        ambient = +ambientMatches[0].substr(8);
    }
    return { blur: blur, darkness: darkness, ambient: ambient };
}
/**
 * Sets up the shadow-catcher mesh.
 * @returns void
 */
function setupShadowCatchers() {
    // Go through and find the shdow catchers
    /** @type {number} */
    var len = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].meshes.length;
    for (var idx = 0; idx < len; idx++) {
        var mesh = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].meshes[idx];
        if ((mesh.name.toLowerCase().indexOf("shadowcatcher") !== -1) || (mesh.name.toLowerCase().indexOf("shadow_catcher") !== -1)) {
            // Make the material
            mesh.material = new BABYLON.ShadowOnlyMaterial("shadow_catch" + idx.toString(), _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"]);
            mesh.material.activeLight = _Vars_Vars__WEBPACK_IMPORTED_MODULE_0__["scene"].lights[0];
            // mesh.material.alpha = 0.1;
            // It can receive shadows.
            mesh.receiveShadows = true;
        }
    }
}


/***/ }),

/***/ "uBLq":
/*!******************************************!*\
  !*** ./src/components/WebRTC/Student.ts ***!
  \******************************************/
/*! exports provided: Student, startFollowing */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Student", function() { return Student; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startFollowing", function() { return startFollowing; });
/* harmony import */ var _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Cameras/CommonCamera */ "vCcv");
/* harmony import */ var _WebRTCBase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WebRTCBase */ "gg4m");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
/* harmony import */ var _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Mols/3DMol/VisStyles */ "EYe7");
/* harmony import */ var _UI_Menu3D_Rotations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../UI/Menu3D/Rotations */ "nKXq");
// Functions for leader mode, that the follower (student) uses.
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();





var peerId;
var Student = /** @class */ (function (_super) {
    __extends(Student, _super);
    function Student(dataReceivedFunc) {
        var _this = _super.call(this) || this;
        _this.conn = null; // The connection (just one).
        _this.dataReceivedFunc = dataReceivedFunc;
        _this.setupWebRTCCallbacks();
        return _this;
    }
    /**
     * Joins an existing webrtc connection.
     * @param  {string} id  The peer.js id.
     * @returns void
     */
    Student.prototype.joinExistingSession = function (id) {
        var _this = this;
        // Close old connection
        if (this.conn) {
            this.conn.close();
        }
        // Create connection to destination peer specified in the input field
        this.conn = this.peer.connect(id, {
            reliable: true,
        });
        this.setConnectionCallbacks();
        this.conn.on("open", function () {
            if (_WebRTCBase__WEBPACK_IMPORTED_MODULE_1__["DEBUG"] === true) {
                console.log("Connected to: " + _this.conn.peer);
            }
        });
        // Save peerid
        peerId = id;
    };
    /**
     * Setup the webrtc callbacks.
     * @returns void
     */
    Student.prototype.setupWebRTCCallbacks = function () {
        var _this = this;
        this.peer.on("close", function () {
            _this.conn = null;
            _WebRTCBase__WEBPACK_IMPORTED_MODULE_1__["webRTCStandardErrorMsg"]();
        });
    };
    /**
     * Setup the callbacks for when data is received or the connection is
     * closed.
     * @returns void
     */
    Student.prototype.setConnectionCallbacks = function () {
        var _this = this;
        // Handle incoming data (messages only since this is the signal
        // sender)
        this.conn.on("data", function (data) {
            if (_WebRTCBase__WEBPACK_IMPORTED_MODULE_1__["DEBUG"] === true) {
                console.log("Received:", data);
            }
            _this.dataReceivedFunc(data);
        });
        this.conn.on("close", function () {
            _WebRTCBase__WEBPACK_IMPORTED_MODULE_1__["webRTCErrorMsg"]("Leader connection closed.");
        });
    };
    return Student;
}(_WebRTCBase__WEBPACK_IMPORTED_MODULE_1__["WebRTCBase"]));

var targetCameraPosition = null;
var targetCameraRotationQuaternion = null;
/**
 * Start following the leader. Receives information from remote user re.
 * camera position and rotation, and mirrors that on the present camera.
 * @param  {string} id  The remote webrtc id.
 * @returns void
 */
function startFollowing(id) {
    targetCameraPosition = new Float32Array(_Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]().asArray());
    targetCameraRotationQuaternion = new Float32Array(_Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraRotationQuaternion"]().asArray());
    var stud = new Student(function (data) {
        if (_WebRTCBase__WEBPACK_IMPORTED_MODULE_1__["DEBUG"] === true) {
            console.log("stud1 got data", data);
        }
        var type = data["type"];
        var val = data["val"];
        switch (type) {
            case "locrot":
                targetCameraPosition = new Float32Array([val[0], val[1], val[2]]);
                targetCameraRotationQuaternion = new Float32Array([val[3], val[4], val[5], val[6]]);
                break;
            case "initialUrl":
                // If "nanokid.sdf" in url, you need to redirect...
                if (window.location.href.indexOf("nanokid.sdf") !== -1) {
                    // Need to redirect.
                    var newUrl = val + "&f=" + peerId;
                    // Followers should never have shadows, because you never
                    // know what device your students will be viewing on.
                    newUrl = newUrl.replace(/sh=true/g, "sh=false");
                    top.location.href = newUrl;
                }
                break;
            case "toggleRep":
                _Mols_3DMol_VisStyles__WEBPACK_IMPORTED_MODULE_3__["toggleRep"](val["filters"], val["repName"], val["colorScheme"], undefined);
                break;
            case "molAxisRotation":
                _UI_Menu3D_Rotations__WEBPACK_IMPORTED_MODULE_4__["axisRotation"](val);
                break;
            case "molUndoRot":
                _UI_Menu3D_Rotations__WEBPACK_IMPORTED_MODULE_4__["undoRotate"]();
                break;
            default:
                break;
        }
    });
    stud.joinExistingSession(id);
    // Start moving the camera in sync
    _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].registerBeforeRender(function () {
        var cameraLoc = new Float32Array(_Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraPosition"]().asArray());
        var newPos = moveVecTowards(cameraLoc, targetCameraPosition);
        var newPosAsVec = BABYLON.Vector3.FromArray(newPos);
        _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["setCameraPosition"](newPosAsVec);
        var cameraRotQuat = new Float32Array(_Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["getCameraRotationQuaternion"]().asArray());
        var newRot = moveVecTowards(cameraRotQuat, targetCameraRotationQuaternion);
        var newRotAsVec = BABYLON.Quaternion.FromArray(newRot);
        _Cameras_CommonCamera__WEBPACK_IMPORTED_MODULE_0__["setCameraRotationQuaternion"](newRotAsVec);
    });
}
/**
 * Moves a vector towards the target vector. Gets applied to both the camera
 * position and rotation.
 * @param  {any} curVec     The current vector.
 * @param  {any} targetVec  The target vector.
 */
function moveVecTowards(curVec, targetVec) {
    var numEntries = curVec.length;
    // Now get the distance between curVec and this newPos.
    var deltaPos = new Float32Array(numEntries);
    for (var i = 0; i < numEntries; i++) {
        deltaPos[i] = targetVec[i] - curVec[i];
    }
    var fac = 0.02;
    var animRatio = _Vars_Vars__WEBPACK_IMPORTED_MODULE_2__["scene"].getAnimationRatio();
    // A variable that will contain the new position
    var newPos = new Float32Array(numEntries);
    // Scale the delta and add it to the curVec. That's the newPos.
    for (var i = 0; i < numEntries; i++) {
        newPos[i] = curVec[i] + animRatio * fac * deltaPos[i];
    }
    return newPos;
}


/***/ }),

/***/ "vCcv":
/*!************************************************!*\
  !*** ./src/components/Cameras/CommonCamera.ts ***!
  \************************************************/
/*! exports provided: getCameraPosition, setCameraPosition, getCameraRotationQuaternion, setCameraRotationQuaternion, getCameraRotationY, getVecFromEyeToCamera */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCameraPosition", function() { return getCameraPosition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCameraPosition", function() { return setCameraPosition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCameraRotationQuaternion", function() { return getCameraRotationQuaternion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCameraRotationQuaternion", function() { return setCameraRotationQuaternion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCameraRotationY", function() { return getCameraRotationY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getVecFromEyeToCamera", function() { return getVecFromEyeToCamera; });
/* harmony import */ var _Navigation_Points__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Navigation/Points */ "ph2Y");
/* harmony import */ var _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Vars/Vars */ "gqHH");
// These functions include camera functions common to all kinds of cameras.


/** @const {*} */
var forwardVec = new BABYLON.Vector3(1, 0, 0);
/** @const {*} */
var upVec = new BABYLON.Vector3(1, 0, 0);
// let activeCamPos = new BABYLON.Vector3(0, 0, 0);
/**
 * Gets the location of the camera. If VR camera, gets the left eye.
 * @returns * The camera location.
 */
function getCameraPosition() {
    // If it's a VR camera, you need to make an adjustment.
    /** @const {*} */
    var activeCam = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera;
    var activeCamPos = activeCam.position.clone();
    if ((_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) ||
        (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */)) {
        // VR camera, so get eye position.
        if (activeCam.leftCamera) {
            activeCamPos.copyFrom(activeCam.leftCamera.globalPosition);
        }
        else {
            console.log("Prob here");
        }
    }
    return activeCamPos;
}
/**
 * Sets the camera location. Accounts for difference between eye and camera
 * pos if VR camera.
 * @param  {*} pt The new location.
 * @returns void
 */
function setCameraPosition(pt) {
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 3 /* NoVR */) {
        // A regular camera. Just move it there.
        var activeCam = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera;
        activeCam.position.copyFrom(pt);
    }
    else if ((_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) ||
        (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */)) {
        // Not ever tested... not sure it works...
        var activeCam = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrHelper"].webVRCamera;
        // A VR camera. Need to account for the fact that the eye might not be
        // at the same place as the camera.
        activeCam.position.copyFrom(pt.subtract(getVecFromEyeToCamera()));
    }
}
/**
 * Gets the rotation quaternion of the current camera, whether Universal,
 * DeviceOrientation, or VR.
 * @returns * The quaternion.
 */
function getCameraRotationQuaternion() {
    if ((_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) ||
        (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */)) {
        // Cover all devices using the below... (Android, Chrome, Carboard)
        var quat = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrHelper"].webVRCamera.deviceRotationQuaternion;
        return (quat.x !== 0) ? quat : _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera.rotationQuaternion;
    }
    else {
        // Regular (Universal) camera.
        return _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera.rotationQuaternion;
    }
}
/**
 * Sets the rotation quaternion of the camera. As currently implemented,
 * assumes Universal camera (i.e., this function should only be called in
 * Student mode).
 * @param  {*} rotQua The rotation quaternion.
 * @returns void
 */
function setCameraRotationQuaternion(rotQua) {
    if ((_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) ||
        (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */)) {
        console.log("PROBLEM!");
    }
    else {
        // Update the quaternion
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera.rotationQuaternion = rotQua.clone();
        // Update the rotation vector accordingly. See
        // http://www.html5gamedevs.com/topic/16160-retrieving-rotation-after-meshlookat/
        _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera.rotation = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera.rotationQuaternion.toEulerAngles();
    }
}
/**
 * Gets the camera rotation.
 * @returns * The rotation.
 */
function getCameraRotationY() {
    if ((_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 2 /* VRNoControllers */) ||
        (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 1 /* VRWithControllers */)) {
        // Complicated in the case of a VR camera.
        var groundPtVec = _Navigation_Points__WEBPACK_IMPORTED_MODULE_0__["groundPointBelowStarePt"].subtract(_Navigation_Points__WEBPACK_IMPORTED_MODULE_0__["groundPointBelowCamera"]);
        /** @type {number} */
        var angle = BABYLON.Vector3.GetAngleBetweenVectors(groundPtVec, forwardVec, upVec);
        if (groundPtVec.z < 0) {
            angle = -angle;
        }
        // Make sure the angle is between 0 and 2 * Math.PI
        while (angle < 0) {
            angle = angle + 2 * Math.PI;
        }
        while (angle > 2 * Math.PI) {
            angle = angle - 2 * Math.PI;
        }
        angle = angle + Math.PI * 0.5;
        return angle;
    }
    else {
        // This is much simplier with a non-VR camera.
        var activeCam = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["scene"].activeCamera;
        var activeCamRot = activeCam.rotation.clone();
        return activeCamRot.y; // + Math.PI * 0.5;
    }
}
/**
 * Gets the vector from the camera location to the eye location. For a VR
 * camera, these can be different.
 * @returns * The vector.
 */
function getVecFromEyeToCamera() {
    if (_Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrVars"].navMode === 3 /* NoVR */) {
        // Not in VR mode? Then there is no eye.
        return new BABYLON.Vector3(0, 0, 0);
    }
    // Note that some VR cameras don't track position, only orientation.
    // Google cardboard is an example.
    var activeCam = _Vars_Vars__WEBPACK_IMPORTED_MODULE_1__["vrHelper"].webVRCamera;
    var deltaVec;
    if (activeCam.leftCamera) {
        var leftEyePos = activeCam.leftCamera.globalPosition;
        deltaVec = leftEyePos.subtract(activeCam.position);
    }
    else {
        deltaVec = new BABYLON.Vector3(0, 0, 0);
    }
    return deltaVec;
}


/***/ })

},[[0,"runtime","vendors"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvU2NlbmUvT3B0aW1pemF0aW9ucy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9DYW1lcmFzL1NldHVwLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL05hdmlnYXRpb24vTmF2aWdhdGlvbi50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9VSS9NZW51M0QvU3R5bGVzLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL01vbHMvM0RNb2wvVmlzU3R5bGVzLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL1VJL01lbnUzRC9CdXR0b24udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVUkvTWVudTNEL3N0YXBsZS1wdWJsaWMtZG9tYWluLm1wMyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9Nb2xzLzNETW9sL1ZSTUwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVUkvTG9hZGluZ1NjcmVlbnMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTmF2aWdhdGlvbi9QaWNrYWJsZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTW9scy8zRE1vbC9Qb3NpdGlvbkluU2NlbmUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTW9scy9Mb2FkLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL0NhbWVyYXMvTm9uVlJDYW1lcmEudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVUkvVUkyRC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9TY2VuZS9Mb2FkQW5kU2V0dXAudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvV2ViUlRDL1dlYlJUQ0Jhc2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVmFycy9WYXJzLnRzIiwid2VicGFjazovLy8od2VicGFjaykvaG90IHN5bmMgbm9ucmVjdXJzaXZlIF5cXC5cXC9sb2ckIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL1VJL09wZW5Qb3B1cC9PcGVuUG9wdXAudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVUkvTWVudTNEL01lbnUzRC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9XZWJSVEMvTGVjdHVyZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvVUkvTWVudTNEL1JvdGF0aW9ucy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9DYW1lcmFzL1ZSQ2FtZXJhLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL1ZhcnMvVXJsVmFycy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9DYW1lcmFzL1ZSQ29udHJvbGxlcnMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTmF2aWdhdGlvbi9Qb2ludHMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTW9scy8zRE1vbC9UaHJlZURNb2wudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvTW9scy9Nb2xTaGFkb3dzLnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL1dlYlJUQy9TdHVkZW50LnRzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL0NhbWVyYXMvQ29tbW9uQ2FtZXJhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQStEO0FBQzVDO0FBQ25CLGdEQUFnRDtBQUNLO0FBRXJELDZFQUE2RTtBQUM3RSx5QkFBeUI7QUFDekIsNkRBQTZEO0FBQzdELElBQUksZUFBZSxJQUFJLFNBQVMsRUFBRTtJQUM5QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO1FBQzVCLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUM1QixtQkFBbUIsRUFDbkIsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQ2hCLENBQUMsSUFBSSxDQUFDLHNCQUFZO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsMkJBQWlCO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0NBQ047QUFFRCw4RUFBOEU7QUFDOUUsd0VBQXdFO0FBRXhFLGlGQUFnQyxFQUFFLENBQUM7QUFFbkMsbUVBQWdCLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxQm5CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBaUQ7QUFDWjtBQUlyQzs7O0dBR0c7QUFDSSxTQUFTLEtBQUs7SUFDakIsd0VBQXdFO0lBQ3hFLHdFQUF3RTtJQUN4RSw4QkFBOEI7SUFDOUIsVUFBVSxDQUFDO1FBQ1AsT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQ2hDLGdEQUFVO1FBQ1YsMERBQTBEO1FBQzFELHdCQUF3QixFQUFFLENBQzdCLENBQUM7SUFDTixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFVCx5REFBeUQ7SUFDekQsZ0RBQVUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsZUFBZTtJQUM3QyxnREFBVSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztJQUU1QyxxQkFBcUI7SUFDckIscUJBQXFCO0lBQ3JCLElBQU0sR0FBRyxHQUFHLGdEQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNyQyxJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ2hDLGlCQUFpQjtRQUNqQixJQUFNLElBQUksR0FBRyxnREFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQywyREFBMkQ7UUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxFQUFFO1lBQ3RFLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7WUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQzdELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUVwQyx3REFBd0Q7WUFDeEQsZ0NBQWdDO1lBQ2hDLGdGQUFnRjtZQUNoRiwwQkFBMEI7WUFFMUIsMkRBQTJEO1lBQzNELHlCQUF5QjtZQUN6QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUM1QjtLQUNKO0FBQ0wsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxJQUFTO0lBQzdCLHFDQUFxQztJQUNyQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3BCLHVCQUF1QjtRQUN2QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0UsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRSxDQUFFLDBCQUEwQjtRQUNyRSxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDdkM7U0FBTTtRQUNILFdBQVcsR0FBRyxDQUFDLENBQUM7S0FDbkI7SUFDRCxPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNJLFNBQVMsbUJBQW1CLENBQUMsSUFBUztJQUN6QyxxQ0FBcUM7SUFDckMscUJBQXFCO0lBQ3JCLElBQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFBRSxPQUFPO0tBQUUsQ0FBRSwwQkFBMEI7SUFFakUsb0VBQW9FO0lBQ3BFLG9EQUFvRDtJQUNwRCxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFFbEMsMENBQTBDO0lBQzFDLElBQU0sWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxnRUFBMEIsQ0FBQyxDQUFDO0lBRTlFLG1DQUFtQztJQUNuQyxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7UUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNoQztJQUVELDZDQUE2QztJQUM3QywwRkFBMEY7SUFDMUYsc0NBQXNDO0FBQzFDLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSSxTQUFTLGVBQWUsQ0FBQyxJQUFTLEVBQUUsY0FBcUIsRUFBRSxXQUFrQjtJQUF6QyxzREFBcUI7SUFBRSxnREFBa0I7SUFDaEYsSUFBSSxjQUFjLEVBQUU7UUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN2Qix1QkFBdUI7S0FDMUI7SUFFRCxxQkFBcUI7SUFDakIsK0JBQStCO0lBQy9CLDRCQUE0QjtJQUM1Qiw4QkFBOEI7SUFDbEMsSUFBSTtBQUNSLENBQUM7QUFFRDs7OztHQUlHO0FBQ0ksU0FBUyx3QkFBd0I7SUFDcEMsSUFBSSxnRUFBMEIsRUFBRTtRQUM1QixpREFBaUQ7UUFDakQsZ0RBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQzlDLGdFQUEwQixDQUFDLFlBQVksRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsdUJBQXVCLENBQUM7UUFDNUcsdUJBQXVCO1FBQ3ZCLGdEQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztLQUNsRDtBQUNMLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLHdCQUF3QjtJQUM3QixpRUFBaUU7SUFDakUsbUVBQW1FO0lBQ25FLGtEQUFrRDtJQUNsRCxJQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFM0QsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDckUsNERBQTREO0lBQzVELDRFQUE0RTtJQUM1RSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDM0UsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN2RSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFbEUsZ0JBQWdCO0lBQ2hCLFFBQVEsRUFBRSxDQUFDO0lBQ1gsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFFLGtCQUFrQjtJQUM1RSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFbEUsZ0JBQWdCO0lBQ2hCLFFBQVEsRUFBRSxDQUFDO0lBQ1gsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRWxFLGdCQUFnQjtJQUNoQixRQUFRLEVBQUUsQ0FBQztJQUNYLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDM0UsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRWxFLGdCQUFnQjtJQUNoQixRQUFRLEVBQUUsQ0FBQztJQUNYLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUUsbUJBQW1CO0lBQ2xGLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUVsRSxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNJLFNBQVMsa0JBQWtCLENBQUMsSUFBUztJQUN4QyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDZixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbEI7SUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDtJQUtJOzs7O09BSUc7SUFDSCxrQ0FBWSxRQUFnQjtRQUE1QixpQkFnQkM7UUFmRyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDeEIsUUFBUSxHQUFHLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQUMsS0FBVTtZQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEtBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGlEQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO1lBQ3JCLE9BQU8sOENBQThDLENBQUM7UUFDMUQsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUNMLCtCQUFDO0FBQUQsQ0FBQztBQUVELGdEQUFnRDtBQUNoRDtJQUtJOzs7O09BSUc7SUFDSCx3QkFBWSxRQUFnQjtRQUN4QixJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtZQUNqQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBQyxLQUFVO1lBQ3ZCLHFFQUFxRTtZQUNyRSwwQkFBMEI7WUFDMUIsSUFBTSxRQUFRLEdBQUcsZ0RBQVUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDMUQsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0IsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUc7WUFDckIsT0FBTyxrQ0FBa0MsQ0FBQztRQUM5QyxDQUFDLENBQUM7SUFDTixDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDO0FBRUQsZ0RBQWdEO0FBQ2hEO0lBS0k7Ozs7Ozs7O09BUUc7SUFDSCx3QkFBWSxRQUFnQixFQUFFLHdCQUFnQyxFQUFFLGVBQW1DO1FBQW5DLDZEQUFtQztRQUMvRixJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtZQUNqQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBQyxLQUFVO1lBQ3ZCLDRDQUE0QztZQUM1QyxJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUM1QixxQkFBcUI7WUFDckIsSUFBTSxHQUFHLEdBQUcsZ0RBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3JDLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQzVDLElBQU0sSUFBSSxHQUFHLGdEQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV4QyxxREFBcUQ7Z0JBQ3JELGFBQWE7Z0JBQ2IsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFBRSxTQUFTO2lCQUFFO2dCQUV4RCw4QkFBOEI7Z0JBQzlCLHFCQUFxQjtnQkFDckIsSUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7b0JBQUUsU0FBUztpQkFBRSxDQUFFLDBCQUEwQjtnQkFDbkUsSUFBSSxXQUFXLEdBQUcsd0JBQXdCLEVBQUU7b0JBQUUsU0FBUztpQkFBRTtnQkFFekQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO29CQUNsQixXQUFXLEVBQUUsSUFBSTtvQkFDakIsQ0FBQyxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyx3QkFBd0IsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQWU7aUJBQ2xHLENBQUMsQ0FBQztnQkFFSCx5QkFBeUI7Z0JBQ3pCLGtFQUFrRTtnQkFDbEUsc0RBQXNEO2dCQUN0RCw0QkFBNEI7Z0JBRTVCLGtFQUFrRTtnQkFDbEUsYUFBYTtnQkFDYixtQ0FBbUM7Z0JBQ25DLDJCQUEyQjtnQkFDM0IsMkVBQTJFO2dCQUMzRSx5QkFBeUI7YUFDNUI7WUFFRCxtRUFBbUU7WUFDbkUsK0JBQStCO1lBQy9CLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssUUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQztZQUU3Qyx5QkFBeUI7WUFDekIsSUFBTSxtQkFBbUIsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7WUFDcEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFtQixFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxxQ0FBcUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFNLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRS9CLHFCQUFxQjtnQkFDckIsSUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV6QywwQ0FBMEM7Z0JBQzFDLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ25DLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDbEMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3BDO2dCQUVELDhEQUE4RDtnQkFDOUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUMsRUFDMUQsS0FBSyxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7b0JBQ3pDLGlEQUFpRDtvQkFDakQsNEJBQTRCO2dCQUNoQyxDQUFDLENBQ0osQ0FBQzthQUNMO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUc7WUFDckIsT0FBTywwREFBMEQsQ0FBQztRQUN0RSxDQUFDLENBQUM7SUFDTixDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDOzs7Ozs7Ozs7Ozs7O0FDelZEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBcUM7QUFDUTtBQUl0QyxJQUFJLHFCQUEwQixDQUFDO0FBRXRDOzs7R0FHRztBQUNJLFNBQVMsS0FBSztJQUNqQix1RUFBdUU7SUFDdkUsdUVBQXVFO0lBQ3ZFLGdEQUFnRDtJQUNoRCxxQkFBcUIsR0FBRyxnREFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQzdDLFVBQUMsQ0FBTSxJQUFLLFFBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUEzQixDQUEyQixDQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRUwseUVBQXlFO0lBQ3pFLDBDQUEwQztJQUMxQyxJQUFJLElBQUksRUFBRTtRQUNOLHNFQUFzRTtRQUN0RSxvQkFBb0I7UUFDcEIsSUFBTSxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsdUJBQXVCLENBQ25ELGNBQWMsRUFDZCxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQ3RDLGdEQUFVLEVBQ1YsSUFBSSxDQUNQLENBQUM7UUFDRixXQUFXLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU5RCxpQkFBaUI7UUFDakIsMkRBQTJEO1FBQzNELHVDQUF1QztRQUV2Qyw2REFBNkQ7UUFDN0QsZ0RBQVUsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLENBQUMsd0JBQXdCO1FBRS9ELCtEQUErRDtRQUMvRCxtQkFBbUI7UUFDbkIsZ0RBQVUsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQzNFLHFCQUFxQixDQUFDLFFBQVEsQ0FDakMsQ0FBQztLQUNMO1NBQU0sRUFFTjtJQUVELHlCQUF5QjtJQUN6QixnRkFBMEMsRUFBRSxDQUFDO0lBRTdDLG9DQUFvQztJQUNwQyxrREFBaUIsRUFBRSxDQUFDO0FBQ3hCLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNyREQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFEQUFxRDtBQUVHO0FBQ0Y7QUFDRTtBQUNuQjtBQUVJO0FBQ047QUFDUTtBQUNHO0FBWTlDLElBQUksb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0FBRWpDOzs7R0FHRztBQUNJLFNBQVMsS0FBSztJQUNqQixxQ0FBcUM7SUFDckMsaURBQVcsQ0FBQyxVQUFVLEdBQUcsZ0RBQVUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUQsSUFBSSxpREFBVyxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7UUFBRSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUFFO0lBQ3ZFLGlEQUFXLENBQUMsVUFBVSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFFOUMsc0VBQXNFO0lBQ3RFLG1DQUFtQztJQUNuQyxpREFBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRXRDLHdFQUFpQyxDQUFDLGlEQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUQsaUVBQWdDLENBQUM7UUFDN0IsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixJQUFJLEVBQUUsaURBQVcsQ0FBQyxVQUFVO0tBQy9CLENBQUMsQ0FBQztJQUVILG9CQUFvQjtJQUNwQixpREFBVyxDQUFDLE9BQU8sZUFBMEIsQ0FBQztJQUU5QyxrQkFBa0I7SUFDbEIsYUFBYSxFQUFFLENBQUM7SUFFaEIsa0VBQWtFO0lBQ2xFLDZDQUFZLEVBQUUsQ0FBQztJQUVmLHlFQUF5RTtJQUN6RSxxQ0FBcUMsRUFBRSxDQUFDO0lBRXhDLHdFQUF3RTtJQUN4RSxvREFBb0Q7SUFDcEQsbUJBQW1CLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRUQsZ0JBQWdCO0FBQ2hCLElBQUksWUFBaUIsQ0FBQztBQUV0QixxQkFBcUI7QUFDckIsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBRXhCOzs7O0dBSUc7QUFDSCxTQUFTLG1CQUFtQjtJQUN4QixZQUFZLEdBQUcsdUVBQThCLEVBQUUsQ0FBQztJQUNoRCxnREFBVSxDQUFDLG9CQUFvQixDQUFDO1FBQzVCLElBQU0sUUFBUSxHQUFHLHVFQUE4QixFQUFFLENBQUMsQ0FBRSxhQUFhO1FBQ2pFLElBQU0sc0JBQXNCLEdBQUcsOERBQTZCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxnREFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNqRyxpRUFBaUU7WUFDakUsZ0VBQWdFO1lBQ2hFLDhEQUE4RDtZQUM5RCwrQkFBK0I7WUFFL0IsdUVBQThCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNILFlBQVksR0FBRyxRQUFRLENBQUM7WUFDeEIsY0FBYyxHQUFHLGdEQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztTQUMvQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsYUFBYTtJQUNsQix3QkFBd0I7SUFDeEIsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBQyxDQUFNO1FBQ2pCLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLEVBQUU7WUFDbkIsWUFBWTtZQUNaLGlCQUFpQixFQUFFLENBQUM7U0FDdkI7YUFBTSxJQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssR0FBRyxFQUFFO1lBQzNCLG9CQUFvQjtZQUNwQix5RUFBOEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsd0NBQXdDO0FBQzVDLENBQUM7QUFFRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFFcEI7OztHQUdHO0FBQ0ksU0FBUyxpQkFBaUI7SUFDN0IsSUFBSSxvREFBYyxLQUFLLFNBQVMsRUFBRTtRQUM5Qix5Q0FBeUM7UUFDekMsT0FBTztLQUNWO0lBRUQsK0RBQStEO0lBQy9ELElBQU0sT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDckMsSUFBSSxPQUFPLEdBQUcsV0FBVyxHQUFHLEdBQUcsRUFBRTtRQUM3QixPQUFPO0tBQ1Y7U0FBTTtRQUNILFdBQVcsR0FBRyxPQUFPLENBQUM7S0FDekI7SUFFRCw2REFBNkQ7SUFDN0QsUUFBUSwrREFBOEIsRUFBRSxFQUFFO1FBQ3RDO1lBQ0ksc0NBQXNDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsUUFBUSxFQUFFLENBQUM7WUFDWCxNQUFNO1FBQ1Y7WUFDSSwyQ0FBMkM7WUFDM0MsSUFBSSxFQUFFLENBQUM7WUFDUCxNQUFNO1FBQ1Y7WUFDSSw2REFBNkQ7WUFDN0QsV0FBVztZQUNYLHdEQUF1QixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDO1lBQ0ksUUFBUTtZQUNSLE1BQU07S0FDYjtBQUNMLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxRQUFRLENBQUMsTUFBdUIsRUFBRSxRQUF5QjtJQUFsRCwyQ0FBdUI7SUFBRSwrQ0FBeUI7SUFDaEUsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBRTVCLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtRQUN4QixRQUFRLEdBQUcsY0FBUSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ2hDO0lBRUQsNERBQTREO0lBQzVELG1EQUFhLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFFaEQsOENBQThDO0lBQzlDLGlCQUFpQjtJQUNqQixJQUFNLDRCQUE0QixHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FDdEQsOEJBQThCLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFDOUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFDdkMsT0FBTyxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FDL0MsQ0FBQztJQUVGLHNCQUFzQjtJQUN0QixJQUFJLFFBQVEsR0FBRyx1RUFBOEIsRUFBRSxDQUFDO0lBRWhELHdCQUF3QjtJQUN4QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDdEIsb0RBQW9EO1FBQ3BELE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQ3hCLGtEQUFpQixDQUFDLENBQUMsRUFDbkIsa0RBQWlCLENBQUMsQ0FBQyxHQUFHLHVEQUFpQixFQUN2QyxrREFBaUIsQ0FBQyxDQUFDLENBQ3RCLENBQUM7S0FDTDtJQUVELHdCQUF3QjtJQUN4QixJQUFNLFdBQVcsR0FBRywyRUFBa0MsRUFBRSxDQUFDO0lBQ3pELE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRTFDLDJCQUEyQjtJQUMzQix3Q0FBd0M7SUFDeEMsSUFBTSxnQ0FBZ0MsR0FBRztRQUNyQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtRQUNqQyxFQUFFLE9BQU8sRUFBRSw2REFBdUIsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO0tBQ3hELENBQUM7SUFDRiw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUV2RSxpQkFBaUI7SUFDakIsSUFBTSxZQUFZLEdBQUcsZ0RBQVUsQ0FBQyxZQUFZLENBQUM7SUFFN0MsWUFBWSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDN0IsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUUzRCxnREFBVSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLDZEQUF1QixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7UUFDMUUsK0JBQStCO1FBQy9CLG9CQUFvQixHQUFHLEtBQUssQ0FBQztRQUM3QixtREFBYSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBRS9DLGtCQUFrQjtRQUNsQixZQUFZLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUU3QixRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsSUFBSTtJQUNULElBQU0sY0FBYyxHQUFHLCtEQUE4QixDQUFDO0lBRXRELHFEQUFxRDtJQUNyRCxJQUFNLFNBQVMsR0FBRyx1RUFBOEIsRUFBRSxDQUFDO0lBQ25ELElBQU0sZ0JBQWdCLEdBQUcsa0RBQWlCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRS9ELHFCQUFxQjtJQUNyQixJQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUVqRCxJQUFJLEtBQUssQ0FBQztJQUNWLElBQUksR0FBRyxHQUFHLGNBQWMsR0FBRyxzRUFBZ0MsRUFBRTtRQUN6RCxvRUFBb0U7UUFDcEUsS0FBSyxHQUFHLGtEQUFpQixDQUFDLFFBQVEsQ0FDOUIsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUM5QixzRUFBZ0MsQ0FDbkMsQ0FDSixDQUFDO0tBQ0w7U0FBTSxJQUFJLEdBQUcsR0FBRyxjQUFjLEdBQUcsc0VBQWdDLEVBQUU7UUFDaEUsb0VBQW9FO1FBQ3BFLEtBQUssR0FBRyxrREFBaUIsQ0FBQyxRQUFRLENBQzlCLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FDOUIsc0VBQWdDLENBQ25DLENBQ0osQ0FBQztLQUNMO1NBQU0sSUFBSSxHQUFHLEdBQUcsY0FBYyxHQUFHLHNFQUFnQyxFQUFFO1FBQ2hFLGlFQUFpRTtRQUNqRSxRQUFRO1FBQ1IsS0FBSyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQ2pCLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FDOUIsQ0FBQztLQUNMO0lBRUQsbUVBQW1FO0lBQ25FLDZCQUE2QjtJQUM3QixLQUFLLENBQUMsQ0FBQyxHQUFHLGtEQUFpQixDQUFDLENBQUMsQ0FBQztJQUU5Qix3RUFBd0U7SUFDeEUsNENBQTRDO0lBQzVDLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRywrREFBeUIsR0FBRyxHQUFHLEVBQUU7UUFDcEUsS0FBSyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRywrREFBeUIsR0FBRyxHQUFHLENBQUM7S0FDdEU7SUFFRCx3RUFBd0U7SUFDeEUsY0FBYztJQUNkLDBEQUFvQixDQUFDLGtEQUFpQixDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFN0QsUUFBUSxDQUFDLEtBQUssRUFBRTtRQUNaLGlFQUFpRTtRQUNqRSwwQkFBMEI7UUFDMUIsc0VBQTZCLEVBQUUsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxJQUFJLHFCQUFxQixHQUFRLFNBQVMsQ0FBQztBQUMzQyxJQUFJLDZCQUE2QixHQUFHLEtBQUssQ0FBQztBQUUxQzs7O0dBR0c7QUFDSCxTQUFTLHFDQUFxQztJQUMxQyx5RUFBeUU7SUFDekUsd0VBQXdFO0lBQ3hFLHVFQUF1RTtJQUN2RSxxRUFBcUU7SUFDckUsa0VBQWtFO0lBQ2xFLHVCQUF1QjtJQUV2QixzRUFBc0U7SUFDdEUscUJBQXFCLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFbEQscUJBQXFCO0lBQ3JCLHFCQUFxQixDQUFDLEtBQUssQ0FBQztRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hCLGlCQUFpQixFQUFFLENBQUM7SUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxnREFBVSxDQUFDLG9CQUFvQixDQUFDO1FBQzVCLHFDQUFxQyxFQUFFLENBQUM7SUFDNUMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLHFDQUFxQztJQUMxQyxJQUFNLGlCQUFpQixHQUFHLGdEQUFVLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUM7SUFDcEYsSUFBSSxtQkFBbUIsQ0FBQztJQUV4QixJQUFJLENBQUMsaUJBQWlCLEVBQUU7UUFDcEIsaURBQWlEO1FBQ2pELG1CQUFtQixHQUFHLEtBQUssQ0FBQztLQUMvQjtTQUFNO1FBQ0gsaUVBQWlFO1FBQ2pFLG1CQUFtQixHQUFHLENBQUMsaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUNoQyxDQUFDLGlCQUFpQixDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDMUQ7SUFFRCxJQUFJLG1CQUFtQixJQUFJLENBQUMsNkJBQTZCLEVBQUU7UUFDdkQsNkJBQTZCLEdBQUcsSUFBSSxDQUFDO1FBQ3JDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2hDO1NBQU0sSUFBSSxDQUFDLG1CQUFtQixJQUFJLDZCQUE2QixFQUFFO1FBQzlELDZCQUE2QixHQUFHLEtBQUssQ0FBQztRQUN0QyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNoQztTQUFNO1FBQ0gsMkJBQTJCO1FBQzNCLG9DQUFvQztRQUNwQyw4Q0FBOEM7S0FDakQ7QUFDTCxDQUFDO0FBRUQsOEVBQThFO0FBQzlFLHdDQUF3Qzs7Ozs7Ozs7Ozs7Ozs7QUN2VnhDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBd0Q7QUFDQTtBQUNWO0FBQ1g7QUFFbkMsc0NBQXNDO0FBQ3RDLElBQU0sVUFBVSxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFL0UsNkRBQTZEO0FBQzdELElBQU0sVUFBVSxHQUFHO0lBQ2YsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDO0lBQ2pCLGdCQUFnQixFQUFFLENBQUMsS0FBSyxDQUFDO0lBQ3pCLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUNsQixTQUFTLEVBQUU7UUFDUCxLQUFLLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsVUFBVTtLQUM3RDtJQUNELE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztDQUNuQixDQUFDO0FBRUYsd0VBQXdFO0FBQ3hFLElBQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNsRCxJQUFNLGVBQWUsR0FBRztJQUNwQixRQUFRLEVBQUUsVUFBVTtJQUNwQixnQkFBZ0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDaEQsU0FBUyxFQUFFLFVBQVU7SUFDckIsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN6QyxPQUFPLEVBQUUsVUFBVTtDQUN0QixDQUFDO0FBRUYsdUVBQXVFO0FBQ3ZFLElBQU0sTUFBTSxHQUFHO0lBQ1gsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUTtDQUNoRSxDQUFDO0FBRUYsSUFBTSxZQUFZLEdBQUc7SUFDakIsU0FBUyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVU7Q0FDMUQsQ0FBQztBQUVGOzs7R0FHRztBQUNJLFNBQVMsa0JBQWtCO0lBQzlCLElBQU0sSUFBSSxHQUFHO1FBQ1QsWUFBWSxFQUFFLEVBQUU7UUFDaEIsWUFBWSxFQUFFLEVBQUU7UUFDaEIsT0FBTyxFQUFFO1lBQ0wsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpRUFBcUIsQ0FBQyxDQUFDO1lBQ3BELElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUIsSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFNLFNBQVMsR0FBRyxpRUFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDakQsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQ3BDO1lBQ0QsK0RBQThCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUNELGlCQUFpQixFQUFFLEVBQUU7S0FDeEIsQ0FBQztJQUVGLGdEQUFnRDtJQUNoRCxxQkFBcUI7SUFDckIsSUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQzs0QkFDL0IsQ0FBQztRQUNOLElBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ25DLHFCQUFxQjtRQUNyQixJQUFNLHNCQUFzQixHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0NBQ25ELEVBQUU7WUFDUCxJQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLDBCQUEwQixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsVUFBQyxHQUFRLEVBQUUsV0FBZ0I7Z0JBQzVHLCtEQUFtQixDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQzs7UUFKUCxLQUFLLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsc0JBQXNCLEVBQUUsRUFBRSxFQUFFO29CQUF6QyxFQUFFO1NBS1Y7O0lBVkwsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUU7Z0JBQTdCLENBQUM7S0FXVDtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNJLFNBQVMsc0JBQXNCLENBQUMsT0FBWTtJQUMvQyxJQUFJLDhEQUF3QixFQUFFLEVBQUU7UUFDNUIsNkRBQTZEO1FBQzdELE9BQU87S0FDVjtJQUVELHNEQUFzRDtJQUN0RCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUMsOERBQTZCLENBQ3pCLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUNwQyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUNoQyxDQUFDO0lBRUYsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpRUFBcUIsQ0FBQyxDQUFDO0lBQ3BELHFCQUFxQjtJQUNyQixJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDOzRCQUNuQixDQUFDO1FBQ04sSUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksaUVBQXFCLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDeEQsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRztnQkFDeEMsK0RBQThCLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3pDLFVBQVUsQ0FBQztvQkFDUCx1QkFBdUI7b0JBQ3ZCLElBQU0sT0FBTyxHQUFHLG1FQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN2RCwrREFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN4RCxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVixDQUFDLENBQUM7U0FDTDs7SUFiTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRTtnQkFBbkIsQ0FBQztLQWNUO0FBQ0wsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0ksU0FBUyxtQ0FBbUMsQ0FBQyxPQUFZO0lBQzVELCtCQUErQjtJQUMvQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3JDLDhEQUE2QixDQUN6QixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLEVBQy9CLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUMzQixDQUFDO0lBRUYscUJBQXFCO0lBQ3JCLElBQU0sV0FBVyxHQUFHO1FBQ2hCLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFNBQVMsRUFBRSxNQUFNO1FBQ2pCLGVBQWUsRUFBRSxNQUFNO1FBQ3ZCLGNBQWMsRUFBRSxNQUFNO1FBQ3RCLHFCQUFxQixFQUFFLElBQUk7S0FDOUIsQ0FBQztJQUVGLElBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUUxQjs7Ozs7T0FLRztJQUNILElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxTQUFpQixFQUFFLFVBQWUsRUFBRSxLQUFZLEVBQUUsV0FBcUI7UUFDN0YsS0FBSyxDQUFDLElBQUk7UUFDTjs7OztXQUlHO1FBQ0gsVUFBQyxDQUFTLEVBQUUsQ0FBUztZQUNqQixtREFBbUQ7WUFDbkQscUJBQXFCO1lBQ3JCLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2QixxQkFBcUI7WUFDckIsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQUU7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQUU7WUFDeEIsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDLENBQ0osQ0FBQztRQUVGLDJDQUEyQztRQUMzQyxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRS9DLDBDQUEwQztRQUUxQyxxQkFBcUI7UUFDckIsSUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQ0FDdkIsQ0FBQztZQUNOLHVCQUF1QjtZQUN2QixJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEIsc0RBQXNEO2dCQUN0RCxJQUFNLE1BQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLFVBQVUsQ0FBQyxNQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3RCLFFBQVE7Z0JBQ1IsVUFBVSxDQUFDLE1BQUksQ0FBQyxHQUFHLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxNQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBQyxHQUFRLEVBQUUsV0FBZ0I7b0JBQ2xHLHFCQUFxQjtvQkFDckIsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUUsbUJBQW1CO29CQUMvRCxJQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7b0JBQ2QsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQUksQ0FBQztvQkFDdEIsK0RBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ2hELENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO2lCQUFNO2dCQUNILHNDQUFzQztnQkFDdEMsSUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUN2RixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQixnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xGOztRQXBCTCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRTtvQkFBekIsQ0FBQztTQXFCVDtRQUVELHdDQUF3QztRQUN4Qyw4REFBNkIsQ0FDekIsVUFBVSxFQUFFLFdBQVcsQ0FDMUIsQ0FBQztJQUNOLENBQUMsQ0FBQztJQUVGLDhDQUE4QztJQUM5QyxJQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdFQUFvQixDQUFDLENBQUM7SUFDN0MsSUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4Qiw4QkFBOEI7UUFFOUIsSUFBTSxJQUFJLEdBQUcsZ0VBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVoRCxnQkFBZ0IsQ0FDWixTQUFTLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUNyRCxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUM1QyxDQUFDO0tBQ0w7QUFDTCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxRQUFRLENBQUMsR0FBVSxFQUFFLFNBQWlCO0lBQzNDLE1BQU07SUFDTixpRkFBaUY7SUFDakYsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hCO0lBRUQsSUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUN2QixJQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLElBQUksQ0FBQztJQUVULElBQUksR0FBRyxHQUFHLFNBQVMsS0FBSyxDQUFDLEVBQUU7UUFDdkIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNaLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDckM7S0FDSjtTQUFNO1FBQ0gsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ1osSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUMxQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO0tBQ0o7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQVMsMEJBQTBCLENBQUMsVUFBZSxFQUFFLFNBQWlCLEVBQUUsU0FBYyxFQUFFLFdBQXNCO0lBQzFHLGtFQUFrRTtJQUNsRSxxQkFBcUI7SUFDckIsNkJBQTZCO0lBQzdCLElBQU0sU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDOUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUUsbUJBQW1CO0lBRWhFLHFCQUFxQjtJQUNyQixJQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDOzRCQUM3QixDQUFDO1FBQ04scUJBQXFCO1FBQ3JCLElBQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUc7WUFDZCxRQUFRLEVBQUUsRUFBRTtZQUNaLGVBQWUsRUFBRSxFQUFFO1NBQ3RCLENBQUM7UUFFRixJQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO2dDQUNuQyxHQUFDO1lBQ04scUJBQXFCO1lBQ3JCLElBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFDLENBQUMsQ0FBQztZQUNwQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUc7Z0JBQzVDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQzVCLCtEQUE4QixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdDLENBQUMsQ0FBQzs7UUFOTixLQUFLLElBQUksR0FBQyxHQUFHLENBQUMsRUFBRSxHQUFDLEdBQUcsZUFBZSxFQUFFLEdBQUMsRUFBRTtvQkFBL0IsR0FBQztTQU9UO1FBRUQscUJBQXFCO1FBQ3JCLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0NBQ3ZCLEdBQUM7WUFDTixxQkFBcUI7WUFDckIsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1lBQ3hCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRztnQkFDL0IsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdEIsK0RBQThCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0MsQ0FBQyxDQUFDOztRQU5OLEtBQUssSUFBSSxHQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUMsR0FBRyxTQUFTLEVBQUUsR0FBQyxFQUFFO29CQUF6QixHQUFDO1NBT1Q7UUFFRCxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUc7WUFDdEIsU0FBUyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN2QiwrREFBOEIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QyxDQUFDLENBQUM7UUFFRix3Q0FBd0M7UUFDeEMsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzNCLElBQUksU0FBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDhEQUE2QixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUUxRCxTQUFTLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyw4REFBNkIsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFcEQsU0FBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN2RCxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdDLDhEQUE2QixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUN2RDs7SUE5Q0wsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUU7Z0JBQTVCLENBQUM7S0ErQ1Q7SUFFRCxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7UUFDM0IsOERBQTZCLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsT0FBTyxVQUFVLENBQUM7QUFDdEIsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzdVRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsNkRBQTZEO0FBRUY7QUFDVjtBQUNBO0FBQ0g7QUFDTjtBQUNhO0FBQ3RCO0FBQ21CO0FBTzNDLElBQUksV0FBVyxHQUE4QixFQUFFLENBQUM7QUFFdkQsSUFBTSxvQkFBb0IsR0FBRztJQUN6QixrRUFBa0U7SUFDbEUsaUJBQWlCO0lBQ2pCLEtBQUssRUFBVSxFQUFFO0lBQ2pCLFNBQVMsRUFBTSxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7WUFDeEMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1lBQ3hDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN4QyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7WUFDeEMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFDO0lBQ3JELFFBQVEsRUFBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBQztJQUM5QyxRQUFRLEVBQU8sRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUM7SUFDbkUsV0FBVyxFQUFJLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFDO0lBQ25FLFVBQVUsRUFBSyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFDO0lBQzVELE9BQU8sRUFBUSxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFDO0lBQzVELFNBQVMsRUFBTSxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUM7SUFDMUUsYUFBYSxFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN4QyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBQztJQUM5QyxTQUFTLEVBQU0sRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1lBQ3hDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBQztJQUMxRSxTQUFTLEVBQU0sRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSztZQUN6QyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFDO0lBQ3pFLFFBQVEsRUFBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFDO0lBQ3hELFlBQVksRUFBRyxFQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUM7SUFDcEUsTUFBTSxFQUFTLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFB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R0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVsQyxJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RixJQUFNLElBQUksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLFlB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RSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSyxrQ0FBYSxHQUFyQjtRQUNJLGlFQUFpRTtRQUNqRSxzSkFBc0o7UUFFdEosSUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN4RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSztZQUN0RCxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FB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SSxTQUFTLHFCQUFxQjtJQUNqQyxJQUFJLGlEQUFXLENBQUMsT0FBTyxpQkFBNEIsRUFBRTtRQUNqRCx3Q0FBd0M7UUFDeEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN2QztJQUVELG9FQUFvRTtJQUNwRSxrQ0FBa0M7SUFDbEMsSUFBTSxTQUFTLEdBQUcsbURBQWEsQ0FBQyxXQUFXLENBQUM7SUFDNUMsSUFBSSxRQUFRLENBQUM7SUFDYixJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUU7UUFDdEIsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDdkQsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3REO1NBQU07UUFDSCxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7SUFFRCxPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDIiwiZmlsZSI6ImFwcC4wMTYzMDBlYjM0ZDk0YjUwMWQxZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFNjZW5lTG9hZGVyIGZyb20gXCIuL2NvbXBvbmVudHMvU2NlbmUvTG9hZEFuZFNldHVwXCI7XG5pbXBvcnQgJ2Jvb3RzdHJhcCc7XG4vLyBpbXBvcnQgKiBhcyBTdHlsZXMgZnJvbSBcIi4vc3R5bGVzL3N0eWxlLmNzc1wiO1xuaW1wb3J0ICogYXMgVXJsVmFycyBmcm9tIFwiLi9jb21wb25lbnRzL1ZhcnMvVXJsVmFyc1wiO1xuXG4vLyBHZXQgc2VydmVyIHdvcmtlcnMgKGZvciBwcm9ncmVzc2l2ZSB3ZWIgYXBwKS4gTWFrZXMgZm9yIGJldHRlciBleHBlcmllbmNlLFxuLy8gZXNwZWNpYWxseSBvbiBpT1MuIFNlZVxuLy8gaHR0cHM6Ly93ZWJwYWNrLmpzLm9yZy9ndWlkZXMvcHJvZ3Jlc3NpdmUtd2ViLWFwcGxpY2F0aW9uL1xuaWYgKCdzZXJ2aWNlV29ya2VyJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoXG4gICAgICAgICAgICAnc2VydmljZS13b3JrZXIuanMnLFxuICAgICAgICAgICAge3Njb3BlOiAnLi8nfVxuICAgICAgICApLnRoZW4ocmVnaXN0cmF0aW9uID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVyByZWdpc3RlcmVkOiAnLCByZWdpc3RyYXRpb24pO1xuICAgICAgICB9KS5jYXRjaChyZWdpc3RyYXRpb25FcnJvciA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnU1cgcmVnaXN0cmF0aW9uIGZhaWxlZDogJywgcmVnaXN0cmF0aW9uRXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZW5kZXJDYW52YXNcIikuY2xhc3NMaXN0LmFkZChTdHlsZXMucmVuZGVyQ2FudmFzKTtcbi8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGFpbmVyXCIpLmNsYXNzTGlzdC5hZGQoU3R5bGVzLmNvbnRhaW5lcik7XG5cblVybFZhcnMucmVhZEVudmlyb25tZW50TmFtZVBhcmFtKCk7XG5cblNjZW5lTG9hZGVyLmxvYWQoKTtcbiIsImltcG9ydCAqIGFzIE1vbFNoYWRvd3MgZnJvbSBcIi4uL01vbHMvTW9sU2hhZG93c1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5cbmRlY2xhcmUgdmFyIEJBQllMT046IGFueTtcblxuLyoqXG4gKiBTZXR1cCB0aGUgb3B0aW1pemF0aW9ucy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIC8vIFR1cm4gb24gc2NlbmUgb3B0aW1pemVyLiBOb3RlIHRoYXQgZHVyaW5nIGxvYWRpbmcgdGhlIGZwcyBpcyBib3VuZCB0b1xuICAgIC8vIGRyb3AsIHNvIGxldCdzIHB1dCBpdCBvbiBhIGxpdHRsZSBkZWxheS4gVE9ETzogT25seSBydW4gdGhpcyBvbmNlIHRoZVxuICAgIC8vIG1vZGVsIGFuZCBzY2VuZSBhcmUgbG9hZGVkLlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBCQUJZTE9OLlNjZW5lT3B0aW1pemVyLk9wdGltaXplQXN5bmMoXG4gICAgICAgICAgICBWYXJzLnNjZW5lLFxuICAgICAgICAgICAgLy8gQkFCWUxPTi5TY2VuZU9wdGltaXplck9wdGlvbnMuSGlnaERlZ3JhZGF0aW9uQWxsb3dlZCgpLFxuICAgICAgICAgICAgc2NlbmVPcHRpbWl6ZXJQYXJhbWV0ZXJzKCksXG4gICAgICAgICk7XG4gICAgfSwgNTAwMCk7XG5cbiAgICAvLyBBc3N1bWUgbm8gcGFydCBvZiB0aGUgc2NlbmUgZ29lcyBvbiB0byBlbXB0eSAoc2t5Ym94PylcbiAgICBWYXJzLnNjZW5lLmF1dG9DbGVhciA9IGZhbHNlOyAvLyBDb2xvciBidWZmZXJcbiAgICBWYXJzLnNjZW5lLmF1dG9DbGVhckRlcHRoQW5kU3RlbmNpbCA9IGZhbHNlO1xuXG4gICAgLy8gTW9kaWZ5IHNvbWUgbWVzaGVzXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgY29uc3QgbGVuID0gVmFycy5zY2VuZS5tZXNoZXMubGVuZ3RoO1xuICAgIGNvbnN0IHplcm9WZWMgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XG4gICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgICAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgICAgICBjb25zdCBtZXNoID0gVmFycy5zY2VuZS5tZXNoZXNbaWR4XTtcblxuICAgICAgICAvLyBNZXNoZXMgdGhhdCBjb250YWluIHRoZSB3b3JkIFwiYmFrZWRcIiBzaG91bGQgYmUgc2hhZGVsZXNzXG4gICAgICAgIGlmICgobWVzaC5uYW1lLmluZGV4T2YoXCJiYWtlZFwiKSAhPT0gLTEpICYmIChtZXNoLm1hdGVyaWFsICE9PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAvLyBNYWtlIG1hdGVyaWFsIHNoYWRlbGVzc1xuICAgICAgICAgICAgbWVzaC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSB6ZXJvVmVjO1xuICAgICAgICAgICAgbWVzaC5tYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gemVyb1ZlYztcbiAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmVUZXh0dXJlID0gbWVzaC5tYXRlcmlhbC5kaWZmdXNlVGV4dHVyZTtcbiAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuZGlmZnVzZVRleHR1cmUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBNYXRlcmlhbCB3b24ndCBiZSBjaGFuZ2luZy4gQnV0IGFwcGFyZW50bHkgdGhpcyBpcyBub1xuICAgICAgICAgICAgLy8gbG9uZ2VyIGEgbmVlZGVkIG9wdGltaXphdGlvbjpcbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVnYW1lZGV2cy5jb20vdG9waWMvMzc1NDAtd2hlbi1pcy1pdC1zYWZlLXRvLWZyZWV6ZS1tYXRlcmlhbHMvXG4gICAgICAgICAgICAvLyBtZXNoLm1hdGVyaWFsLmZyZWV6ZSgpO1xuXG4gICAgICAgICAgICAvLyBBc3N1bWUgbm8gY2hhbmdlIGluIGxvY2F0aW9uIChiZWNhdXNlIHRoYXQgd291bGQgcmVxdWlyZVxuICAgICAgICAgICAgLy8gcmVjYWxjdWxhdGluZyBzaGFkb3dzKVxuICAgICAgICAgICAgbWVzaC5mcmVlemVXb3JsZE1hdHJpeCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIG51bWJlciBvZiB2ZXJ0aWNlcyBpbiBhIG1lc2guXG4gKiBAcGFyYW0gIHsqfSBtZXNoIFRoZSBtZXNoLlxuICogQHJldHVybnMge251bWJlcnxudWxsfSAgVGhlIG51bWJlciBvZiB2ZXJ0aWNlcy5cbiAqL1xuZnVuY3Rpb24gZ2V0TnVtVmVydGljZXMobWVzaDogYW55KTogbnVtYmVyfG51bGwge1xuICAgIC8vIEZpcnN0LCBnZXQgdGhlIG51bWJlciBvZiB2ZXJ0ZXhlcy5cbiAgICBsZXQgbnVtVmVydGV4ZXMgPSAwO1xuICAgIGlmIChtZXNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLyoqIEB0eXBlIHtBcnJheTwqPn0gKi9cbiAgICAgICAgY29uc3QgdmVydGV4RGF0YSA9IG1lc2guZ2V0VmVydGljZXNEYXRhKEJBQllMT04uVmVydGV4QnVmZmVyLlBvc2l0aW9uS2luZCk7XG4gICAgICAgIGlmICh2ZXJ0ZXhEYXRhID09PSBudWxsKSB7IHJldHVybiBudWxsOyB9ICAvLyBTb21ldGhpbmcgbGlrZSBfX3Jvb3RfX1xuICAgICAgICBudW1WZXJ0ZXhlcyA9IHZlcnRleERhdGEubGVuZ3RoIC8gMztcbiAgICB9IGVsc2Uge1xuICAgICAgICBudW1WZXJ0ZXhlcyA9IDA7XG4gICAgfVxuICAgIHJldHVybiBudW1WZXJ0ZXhlcztcbn1cblxuLyoqXG4gKiBPcHRpbWl6ZSB0aGUgYWJpbGl0eSB0byBwaWNrIG1lc2hlcywgdXNpbmcgb2N0cmVlcy5cbiAqIEBwYXJhbSAgeyp9IG1lc2ggVGhlIG1lc2guXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZU1lc2hQaWNraW5nKG1lc2g6IGFueSk6IHZvaWQge1xuICAgIC8vIEZpcnN0LCBnZXQgdGhlIG51bWJlciBvZiB2ZXJ0ZXhlcy5cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBjb25zdCBudW1WZXJ0ZXhlcyA9IGdldE51bVZlcnRpY2VzKG1lc2gpO1xuICAgIGlmIChudW1WZXJ0ZXhlcyA9PT0gbnVsbCkgeyByZXR1cm47IH0gIC8vIFNvbWV0aGluZyBsaWtlIF9fcm9vdF9fXG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgdmVyeSBmZXcgdmVydGV4ZXMsIGRvbid0IHVzZSB0aGlzIG9wdGltaXphdGlvbi4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGl0J3MgdXNlIG9uIGJ1dHRvbiBzcGhlcmVzLCBmb3IgZXhhbXBsZS5cbiAgICBpZiAobnVtVmVydGV4ZXMgPCAxMDApIHsgcmV0dXJuOyB9XG5cbiAgICAvLyBOb3cgZ2V0IHRoZSBudW1iZXIgb2Ygc3VibWVzaGVzIHRvIHVzZS5cbiAgICBjb25zdCBudW1TdWJNZXNoZXMgPSAxICsgTWF0aC5mbG9vcihudW1WZXJ0ZXhlcyAvIFZhcnMuTUFYX1ZFUlRTX1BFUl9TVUJNRVNIKTtcblxuICAgIC8vIFN1YmRpdmlkZSB0aGUgbWVzaCBpZiBuZWNlc3NhcnkuXG4gICAgaWYgKG51bVN1Yk1lc2hlcyA+IDEpIHtcbiAgICAgICAgbWVzaC5zdWJkaXZpZGUobnVtU3ViTWVzaGVzKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgdXNlIG9jdHJlZSBmb3IgcGlja2luZyBhbmQgY29sbGlzaW9ucy5cbiAgICAvLyBtZXNoLmNyZWF0ZU9yVXBkYXRlU3VibWVzaGVzT2N0cmVlKDY0LCAyKTsgIC8vIE1lc3NlcyB1cCBjdWxsaW5nIG9uIHByb3RlaW4gYWxsIHN0aWNrcy5cbiAgICAvLyBtZXNoLnVzZU9jdHJlZUZvckNvbGxpc2lvbnMgPSB0cnVlO1xufVxuXG4vKipcbiAqIEZyZWV6ZSB0aGUgcHJvcGVydGllcyBvbiBhIG1lc2gsIHNvIHRoZXkgZG9uJ3QgbmVlZCB0byBiZSByZWNhbGN1bGF0ZWQuXG4gKiBAcGFyYW0gIHsqfSAgICAgICBtZXNoXHQgICAgICAgICAgICAgICAgVGhlIG1lc2guXG4gKiBAcGFyYW0gIHtib29sZWFufSBbZnJlZXplTWF0ZXJpYWw9dHJ1ZV0gIFdoZXRoZXIgdG8gZnJlZXplIHRoZSBtYXRlcmlhbC5cbiAqIEBwYXJhbSAge2Jvb2xlYW59IFt3b3JsZE1hdHJpeD10cnVlXSAgICAgV2hldGhlciB0byBmcmVlemUgdGhlIHdvcmxkIG1hdHJpeC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyZWV6ZU1lc2hQcm9wcyhtZXNoOiBhbnksIGZyZWV6ZU1hdGVyaWFsID0gdHJ1ZSwgd29ybGRNYXRyaXggPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKGZyZWV6ZU1hdGVyaWFsKSB7XG4gICAgICAgIG1lc2gubWF0ZXJpYWwuZnJlZXplKCk7XG4gICAgICAgIC8vIG1hdGVyaWFsLnVuZnJlZXplKCk7XG4gICAgfVxuXG4gICAgLy8gaWYgKHdvcmxkTWF0cml4KSB7XG4gICAgICAgIC8vIFRPRE86IFdoeSBkb2Vzbid0IHRoaXMgd29yaz9cbiAgICAgICAgLy8gbWVzaC5mcmVlemVXb3JsZE1hdHJpeCgpO1xuICAgICAgICAvLyBtZXNoLnVuZnJlZXplV29ybGRNYXRyaXgoKTtcbiAgICAvLyB9XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBlbnZpcm9ubWVudCBzaGFkb3dzLiBUaGV5IGFyZSBmcm96ZW4gb3RoZXJ3aXNlLiBUaGlzIGZ1bmN0aW9uXG4gKiB1bmZyZWV6ZXMgdGhlbSBhbmQgdGhlIGZyZWV6ZXMgdGhlbSBhZ2Fpbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUVudmlyb25tZW50U2hhZG93cygpOiB2b2lkIHtcbiAgICBpZiAoTW9sU2hhZG93cy5zaGFkb3dHZW5lcmF0b3IpIHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzaGFkb3dzLiBUaGV5IGFyZSBmcm96ZW4gb3RoZXJ3aXNlLlxuICAgICAgICBWYXJzLnNjZW5lLmxpZ2h0c1swXS5hdXRvVXBkYXRlRXh0ZW5kcyA9IHRydWU7XG4gICAgICAgIE1vbFNoYWRvd3Muc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlZnJlc2hSYXRlID0gQkFCWUxPTi5SZW5kZXJUYXJnZXRUZXh0dXJlLlJFRlJFU0hSQVRFX1JFTkRFUl9PTkNFO1xuICAgICAgICAvLyBWYXJzLnNjZW5lLnJlbmRlcigpO1xuICAgICAgICBWYXJzLnNjZW5lLmxpZ2h0c1swXS5hdXRvVXBkYXRlRXh0ZW5kcyA9IGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQcmVwYXJlcyBzY2VuZS1vcHRpbWl6ZXIgcGFyYW10ZXJzLlxuICogQHJldHVybnMgKiBUaGUgcGFyYW1ldGVycy5cbiAqL1xuZnVuY3Rpb24gc2NlbmVPcHRpbWl6ZXJQYXJhbWV0ZXJzKCk6IGFueSB7XG4gICAgLy8gU2VlIGh0dHBzOi8vZG9jLmJhYnlsb25qcy5jb20vaG93X3RvL2hvd190b191c2Vfc2NlbmVvcHRpbWl6ZXJcbiAgICAvLyBUaGUgZ29hbCBoZXJlIGlzIHRvIG1haW50YWluIGEgZnJhbWUgcmF0ZSBvZiA2MC4gQ2hlY2sgZXZlcnkgdHdvXG4gICAgLy8gc2Vjb25kcy4gVmVyeSBzaW1pbGFyIHRvIEhpZ2hEZWdyYWRhdGlvbkFsbG93ZWRcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQkFCWUxPTi5TY2VuZU9wdGltaXplck9wdGlvbnMoMjUsIDIwMDApO1xuXG4gICAgbGV0IHByaW9yaXR5ID0gMDtcbiAgICByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBCQUJZTE9OLlNoYWRvd3NPcHRpbWl6YXRpb24ocHJpb3JpdHkpKTtcbiAgICAvLyBUaGUgYmVsb3cgd29uJ3QgbWFrZSBhIGRpZmZlcmVuY2UgZm9yIG15IHNjZW5lcyBhbnl3YXkuLi5cbiAgICAvLyByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBCQUJZTE9OLk1lcmdlTWVzaGVzT3B0aW1pemF0aW9uKHByaW9yaXR5KSk7XG4gICAgcmVzdWx0Lm9wdGltaXphdGlvbnMucHVzaChuZXcgQkFCWUxPTi5MZW5zRmxhcmVzT3B0aW1pemF0aW9uKHByaW9yaXR5KSk7XG4gICAgcmVzdWx0Lm9wdGltaXphdGlvbnMucHVzaChuZXcgQkFCWUxPTi5Qb3N0UHJvY2Vzc2VzT3B0aW1pemF0aW9uKHByaW9yaXR5KSk7XG4gICAgcmVzdWx0Lm9wdGltaXphdGlvbnMucHVzaChuZXcgQkFCWUxPTi5QYXJ0aWNsZXNPcHRpbWl6YXRpb24ocHJpb3JpdHkpKTtcbiAgICByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBSZXBvcnRPcHRpbWl6YXRpb25DaGFuZ2UocHJpb3JpdHkpKTtcblxuICAgIC8vIE5leHQgcHJpb3JpdHlcbiAgICBwcmlvcml0eSsrO1xuICAgIHJlc3VsdC5vcHRpbWl6YXRpb25zLnB1c2gobmV3IFJlbW92ZVN1cmZhY2VzKHByaW9yaXR5KSk7ICAvLyBSZW1vdmUgc3VyZmFjZXNcbiAgICByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBSZXBvcnRPcHRpbWl6YXRpb25DaGFuZ2UocHJpb3JpdHkpKTtcblxuICAgIC8vIE5leHQgcHJpb3JpdHlcbiAgICBwcmlvcml0eSsrO1xuICAgIHJlc3VsdC5vcHRpbWl6YXRpb25zLnB1c2gobmV3IEJBQllMT04uVGV4dHVyZU9wdGltaXphdGlvbihwcmlvcml0eSwgNTEyKSk7XG4gICAgcmVzdWx0Lm9wdGltaXphdGlvbnMucHVzaChuZXcgUmVwb3J0T3B0aW1pemF0aW9uQ2hhbmdlKHByaW9yaXR5KSk7XG5cbiAgICAvLyBOZXh0IHByaW9yaXR5XG4gICAgcHJpb3JpdHkrKztcbiAgICByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBCQUJZTE9OLlJlbmRlclRhcmdldHNPcHRpbWl6YXRpb24ocHJpb3JpdHkpKTtcbiAgICByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBCQUJZTE9OLlRleHR1cmVPcHRpbWl6YXRpb24ocHJpb3JpdHksIDI1NikpO1xuICAgIHJlc3VsdC5vcHRpbWl6YXRpb25zLnB1c2gobmV3IFJlcG9ydE9wdGltaXphdGlvbkNoYW5nZShwcmlvcml0eSkpO1xuXG4gICAgLy8gTmV4dCBwcmlvcml0eVxuICAgIHByaW9yaXR5Kys7XG4gICAgcmVzdWx0Lm9wdGltaXphdGlvbnMucHVzaChuZXcgQkFCWUxPTi5IYXJkd2FyZVNjYWxpbmdPcHRpbWl6YXRpb24ocHJpb3JpdHksIDQpKTtcbiAgICByZXN1bHQub3B0aW1pemF0aW9ucy5wdXNoKG5ldyBTaW1wbGlmeU1lc2hlcyhwcmlvcml0eSwgNTAwKSk7ICAvLyBTaW1wbGlmeSBtZXNoZXMuXG4gICAgcmVzdWx0Lm9wdGltaXphdGlvbnMucHVzaChuZXcgUmVwb3J0T3B0aW1pemF0aW9uQ2hhbmdlKHByaW9yaXR5KSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEVudGlyZWx5IHJlbW92ZSBhIG1lc2guXG4gKiBAcGFyYW0gIHsqfSBtZXNoIFRoZSBtZXNoIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZU1lc2hFbnRpcmVseShtZXNoOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAobWVzaCAhPT0gbnVsbCkge1xuICAgICAgICBtZXNoLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgbWVzaCA9IG51bGw7XG59XG5cbmNsYXNzIFJlcG9ydE9wdGltaXphdGlvbkNoYW5nZSB7XG4gICAgcHJpdmF0ZSBwcmlvcml0eTogbnVtYmVyO1xuICAgIHByaXZhdGUgYXBwbHk6IGFueTsgICAgICAgICAgIC8vIExlYXZlIHRoZXNlIGV2ZW4gdGhvdWdoIG5vdCB1c2VkLlxuICAgIHByaXZhdGUgZ2V0RGVzY3JpcHRpb246IGFueTsgIC8vIExlYXZlIHRoZXNlIGV2ZW4gdGhvdWdoIG5vdCB1c2VkLlxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoZSBzdXJmYWNlIG1lc2ggKGl0IHRha2VzIGEgbG90IG9mIHJlc291cmNlcykuXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBwcmlvcml0eSBUaGUgcHJpb3JpdHkgb2YgdGhpcyBvcHRpbWl6YXRpb24uXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaW9yaXR5OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHByaW9yaXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByaW9yaXR5ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbXCJwcmlvcml0eVwiXSA9IHByaW9yaXR5O1xuICAgICAgICB0aGlzW1wiYXBwbHlcIl0gPSAoc2NlbmU6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJPcHRpbWl6YXRpb24gcHJpb3JpdHk6XCIsIHRoaXNbXCJwcmlvcml0eVwiXSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZQUzpcIiwgVmFycy5lbmdpbmUuZ2V0RnBzKCkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJcIik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzW1wiZ2V0RGVzY3JpcHRpb25cIl0gPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXCJSZXBvcnRzIHRoZSBjdXJyZW50IHByaW9yaXR5LiBGb3IgZGVidWdnaW5nLlwiO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1jbGFzc2VzLXBlci1maWxlXG5jbGFzcyBSZW1vdmVTdXJmYWNlcyB7XG4gICAgcHJpdmF0ZSBwcmlvcml0eTogbnVtYmVyOyAgICAgLy8gTGVhdmUgdGhlc2UgZXZlbiB0aG91Z2ggbm90IHVzZWQuXG4gICAgcHJpdmF0ZSBhcHBseTogYW55OyAgICAgICAgICAgLy8gTGVhdmUgdGhlc2UgZXZlbiB0aG91Z2ggbm90IHVzZWQuXG4gICAgcHJpdmF0ZSBnZXREZXNjcmlwdGlvbjogYW55OyAgLy8gTGVhdmUgdGhlc2UgZXZlbiB0aG91Z2ggbm90IHVzZWQuXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhlIHN1cmZhY2UgbWVzaCAoaXQgdGFrZXMgYSBsb3Qgb2YgcmVzb3VyY2VzKS5cbiAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IHByaW9yaXR5IFRoZSBwcmlvcml0eSBvZiB0aGlzIG9wdGltaXphdGlvbi5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpb3JpdHk6IG51bWJlcikge1xuICAgICAgICBpZiAodHlwZW9mIHByaW9yaXR5ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBwcmlvcml0eSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW1wicHJpb3JpdHlcIl0gPSBwcmlvcml0eTtcbiAgICAgICAgdGhpc1tcImFwcGx5XCJdID0gKHNjZW5lOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIERlbGV0ZSB0aGUgc3VyZmFjZSBtZXNoLiBOb3RlIHRoYXQgaXQgd2lsbCBzdGlsbCBiZSB2aXNpYmxlIGluIHRoZVxuICAgICAgICAgICAgLy8gbWFpbiBtZW51LCBidXQgb2ggd2VsbC5cbiAgICAgICAgICAgIGNvbnN0IHN1cmZhY2VzID0gVmFycy5zY2VuZS5nZXRNZXNoQnlOYW1lKFwic3VyZmFjZXMud3JsXCIpO1xuICAgICAgICAgICAgcmVtb3ZlTWVzaEVudGlyZWx5KHN1cmZhY2VzKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXNbXCJnZXREZXNjcmlwdGlvblwiXSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBcIlJlbW92ZXMgc3VyZmFjZSByZXByZXNlbnRhdGlvbnMuXCI7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWNsYXNzZXMtcGVyLWZpbGVcbmNsYXNzIFNpbXBsaWZ5TWVzaGVzIHtcbiAgICBwcml2YXRlIHByaW9yaXR5OiBudW1iZXI7ICAgICAvLyBMZWF2ZSB0aGVzZSBldmVuIHRob3VnaCBub3QgdXNlZC5cbiAgICBwcml2YXRlIGFwcGx5OiBhbnk7ICAgICAgICAgICAvLyBMZWF2ZSB0aGVzZSBldmVuIHRob3VnaCBub3QgdXNlZC5cbiAgICBwcml2YXRlIGdldERlc2NyaXB0aW9uOiBhbnk7ICAvLyBMZWF2ZSB0aGVzZSBldmVuIHRob3VnaCBub3QgdXNlZC5cblxuICAgIC8qKlxuICAgICAqIEEgc2NlbmUgb3B0aW1pemF0aW9uIHRvIGRlY2ltYXRlIHRoZSBiaWcgbWVzaGVzLlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gcHJpb3JpdHkgICAgICAgICAgICAgICAgICBUaGUgcHJpb3JpdHkgb2YgdGhpc1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpbWl6YXRpb24uXG4gICAgICogQHBhcmFtICB7bnVtYmVyfSBtaW5OdW1WZXJ0c1RoYXRJc1Byb2JsZW0gIFRoZSB0YXJnZXQgbnVtYmVyIG9mIHZlcnRpY2VzLlxuICAgICAqIEBwYXJhbSAge251bWJlcn0gW2RlY2ltYXRpb25MZXZlbD1dICAgICAgICBUaGUgZGVjaW1hdGlvbiBsZXZlbC4gSWYgbm90XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpZmllZCwgY2FsY3VsYXRlZCBmcm9tXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbk51bVZlcnRzVGhhdElzUHJvYmxlbS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcmlvcml0eTogbnVtYmVyLCBtaW5OdW1WZXJ0c1RoYXRJc1Byb2JsZW06IG51bWJlciwgZGVjaW1hdGlvbkxldmVsOiBudW1iZXIgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcmlvcml0eSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcHJpb3JpdHkgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tcInByaW9yaXR5XCJdID0gcHJpb3JpdHk7XG4gICAgICAgIHRoaXNbXCJhcHBseVwiXSA9IChzY2VuZTogYW55KSA9PiB7XG4gICAgICAgICAgICAvKiogQHR5cGUge0FycmF5PEFycmF5PG51bWJlciwqLG51bWJlcj4+fSAqL1xuICAgICAgICAgICAgY29uc3QgbWVzaGVzVG9Db25zaWRlciA9IFtdO1xuICAgICAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgICAgICBjb25zdCBsZW4gPSBWYXJzLnNjZW5lLm1lc2hlcy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGxldCBtZXNoSWR4ID0gMDsgbWVzaElkeCA8IGxlbjsgbWVzaElkeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzaCA9IFZhcnMuc2NlbmUubWVzaGVzW21lc2hJZHhdO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgaXQncyBkZWNpbWF0ZWQsIHNraXAgaXQuIEl0IHdpbGwgYmUgZGVsZXRlZCBhbmRcbiAgICAgICAgICAgICAgICAvLyByZWNyZWF0ZWQuXG4gICAgICAgICAgICAgICAgaWYgKG1lc2gubmFtZS5pbmRleE9mKFwiRGVjaW1hdGVkXCIpICE9PSAtMSkgeyBjb250aW51ZTsgfVxuXG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBudW1iZXIgb2YgdmVydGV4ZXMuXG4gICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgICAgICAgICAgY29uc3QgbnVtVmVydGV4ZXMgPSBnZXROdW1WZXJ0aWNlcyhtZXNoKTtcbiAgICAgICAgICAgICAgICBpZiAobnVtVmVydGV4ZXMgPT09IG51bGwpIHsgY29udGludWU7IH0gIC8vIFNvbWV0aGluZyBsaWtlIF9fcm9vdF9fXG4gICAgICAgICAgICAgICAgaWYgKG51bVZlcnRleGVzIDwgbWluTnVtVmVydHNUaGF0SXNQcm9ibGVtKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgICAgICAgICBtZXNoZXNUb0NvbnNpZGVyLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICBudW1WZXJ0ZXhlcywgbWVzaCxcbiAgICAgICAgICAgICAgICAgICAgKGRlY2ltYXRpb25MZXZlbCA9PT0gdW5kZWZpbmVkKSA/IDEuIC0gbWluTnVtVmVydHNUaGF0SXNQcm9ibGVtIC8gbnVtVmVydGV4ZXMgOiBkZWNpbWF0aW9uTGV2ZWwsXG4gICAgICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTaW1wbGlmeSB0aGUgbWVzaC4gU2VlXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kb2MuYmFieWxvbmpzLmNvbS9ob3dfdG8vaW4tYnJvd3Nlcl9tZXNoX3NpbXBsaWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgLy8gWW91IHVzZWQgdG8gYmUgYWJsZSB0byBzaW1wbGlmeSBhIG1lc2ggd2l0aG91dCBMT0QuXG4gICAgICAgICAgICAgICAgLy8gQXBwYXJlbnRseSB5b3UgY2FuJ3Qgbm93P1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IGRlY2ltYXRvciA9IG5ldyBCQUJZTE9OLlF1YWRyYXRpY0Vycm9yU2ltcGxpZmljYXRpb24obWVzaCk7XG4gICAgICAgICAgICAgICAgLy8gc2ltcGxpZnkoe1xuICAgICAgICAgICAgICAgIC8vICAgICBcImRlY2ltYXRpb25JdGVyYXRpb25zXCI6IDEwMCxcbiAgICAgICAgICAgICAgICAvLyAgICAgXCJhZ2dyZXNzaXZlbmVzc1wiOiA3LFxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBcInN5bmNJdGVyYXRpb25zXCI6ID8gIC8vIEp1c3Qga2VlcCBkZWZhdWx0LiBOb3Qgc3VyZSB3aGF0IHRoaXMgaXMuXG4gICAgICAgICAgICAgICAgLy8gfSwgKCkgPT4geyByZXR1cm47IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBPcmRlciB0aGUgbWVzaGVzIGZyb20gdGhlIG9uZSB3aXRoIG1vc3QgdmVydGljZXMgdG8gdGhlIG9uZSB3aXRoXG4gICAgICAgICAgICAvLyBsZWFzdCAocHJpb3JpdGl6ZSBiYWQgb25lcykuXG4gICAgICAgICAgICBtZXNoZXNUb0NvbnNpZGVyLnNvcnQoKGEsIGIpID0+IGJbMF0gLSBhWzBdKTtcblxuICAgICAgICAgICAgLy8gU2ltcGxpZnkgdGhvc2UgbWVzaGVzLlxuICAgICAgICAgICAgY29uc3QgbWVzaGVzVG9Db25zaWRlckxlbiA9IG1lc2hlc1RvQ29uc2lkZXIubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXNoZXNUb0NvbnNpZGVyTGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvKiogQHR5cGUge0FycmF5PG51bWJlciwqLG51bWJlcj59ICovXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzaFRvQ29uc2lkZXIgPSBtZXNoZXNUb0NvbnNpZGVyW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc2ggPSBtZXNoVG9Db25zaWRlclsxXTtcblxuICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlY2ltYXRpb25MdmVsID0gbWVzaFRvQ29uc2lkZXJbMl07XG5cbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGV4aXN0aW5nIExPRHMgaWYgdGhleSBleGlzdC5cbiAgICAgICAgICAgICAgICB3aGlsZSAobWVzaC5nZXRMT0RMZXZlbHMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0TE9ETWVzaCA9IG1lc2guZ2V0TE9ETGV2ZWxzKClbMF1bXCJtZXNoXCJdO1xuICAgICAgICAgICAgICAgICAgICBtZXNoLnJlbW92ZUxPRExldmVsKGZpcnN0TE9ETWVzaCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZU1lc2hFbnRpcmVseShmaXJzdExPRE1lc2gpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZG9jLmJhYnlsb25qcy5jb20vYXBpL2NsYXNzZXMvYmFieWxvbi5tZXNoI3NpbXBsaWZ5XG4gICAgICAgICAgICAgICAgbWVzaC5zaW1wbGlmeShbe1wicXVhbGl0eVwiOiBkZWNpbWF0aW9uTHZlbCwgXCJkaXN0YW5jZVwiOiAwLjAwMX1dLFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSwgQkFCWUxPTi5TaW1wbGlmaWNhdGlvblR5cGUuUVVBRFJBVElDLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgc2ltcE1lc2ggPSBtZXNoLmdldExPRExldmVscygpWzBdW1wibWVzaFwiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZU1lc2hFbnRpcmVseShtZXNoKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzW1wiZ2V0RGVzY3JpcHRpb25cIl0gPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXCJTaW1wbGlmaWVzIHRoZSBnZW9tZXRyeSBvZiBjb21wbGV4IG9iamVjdHMgaW4gdGhlIHNjZW5lLlwiO1xuICAgICAgICB9O1xuICAgIH1cbn1cbiIsImltcG9ydCAqIGFzIFZhcnMgZnJvbSBcIi4uL1ZhcnMvVmFyc1wiO1xuaW1wb3J0ICogYXMgTm9uVlJDYW1lcmEgZnJvbSBcIi4vTm9uVlJDYW1lcmFcIjtcblxuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG5leHBvcnQgbGV0IGNhbWVyYUZyb21CYWJ5bG9uRmlsZTogYW55O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcnVucyBhZnRlciB0aGUgYmFieWxvbiBzY2VuZSBpcyBsb2FkZWQuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpOiB2b2lkIHtcbiAgICAvLyBZb3UgbmVlZCB0byBtYWtlIHRoZSBjYW1lcmEgZnJvbSB0aGUgYmFieWxvbiBmaWxlIGFjdGl2ZS4gRmlyc3QsIGdldFxuICAgIC8vIHRoZSBiYWJ5bG9uIGNhbWVyYS4gSXQncyB0aGUgb25lIHRoYXQgZG9lc24ndCBoYXZlIFwiVlJcIiBpbiBpdHMgbmFtZSxcbiAgICAvLyBiZWNhdXNlIFZSIGNhbWVyYXMgYXJlIGFkZGVkIHByb2dyYW1hdGljYWxseS5cbiAgICBjYW1lcmFGcm9tQmFieWxvbkZpbGUgPSBWYXJzLnNjZW5lLmNhbWVyYXMuZmlsdGVyKFxuICAgICAgICAoYzogYW55KSA9PiBjLm5hbWUuaW5kZXhPZihcIlZSXCIpID09PSAtMSxcbiAgICApWzBdO1xuXG4gICAgLy8gSWYgdHJ1ZSwgc2V0cyB1cCBkZXZpY2Ugb3JpZW50YXRpb24gY2FtZXJhLiBPdGhlcndpc2UsIGp1c3QgdXNlIG9uZSBpblxuICAgIC8vIGJhYnlsb25qcyBmaWxlLiBBIHRvZ2dsZSBmb3IgZGVidWdnaW5nLlxuICAgIGlmICh0cnVlKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIGRldmljZSBvcmllbnRhdGlvbiBjYW1lcmEgdGhhdCBtYXRjaGVzIHRoZSBvbmUgbG9hZGVkIGZyb21cbiAgICAgICAgLy8gdGhlIGJhYnlsb24gZmlsZS5cbiAgICAgICAgY29uc3QgZGV2T3JDYW1lcmEgPSBuZXcgQkFCWUxPTi5EZXZpY2VPcmllbnRhdGlvbkNhbWVyYShcbiAgICAgICAgICAgIFwiRGV2T3JfY2FtZXJhXCIsXG4gICAgICAgICAgICBjYW1lcmFGcm9tQmFieWxvbkZpbGUucG9zaXRpb24uY2xvbmUoKSxcbiAgICAgICAgICAgIFZhcnMuc2NlbmUsXG4gICAgICAgICAgICB0cnVlLFxuICAgICAgICApO1xuICAgICAgICBkZXZPckNhbWVyYS5yb3RhdGlvbiA9IGNhbWVyYUZyb21CYWJ5bG9uRmlsZS5yb3RhdGlvbi5jbG9uZSgpO1xuXG4gICAgICAgIC8vIEZvciBkZWJ1Z2dpbmcuXG4gICAgICAgIC8vIHdpbmRvd1tcImNhbWVyYUZyb21CYWJ5bG9uRmlsZVwiXSA9IGNhbWVyYUZyb21CYWJ5bG9uRmlsZTtcbiAgICAgICAgLy8gd2luZG93W1wiZGV2T3JDYW1lcmFcIl0gPSBkZXZPckNhbWVyYTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGFjdGl2ZSBjYW1lcmEgdG8gYmUgdGhlIGRldmljZSBvcmllbnRhdGlvbiBvbmUuXG4gICAgICAgIFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhID0gZGV2T3JDYW1lcmE7IC8vIGNhbWVyYUZyb21CYWJ5bG9uRmlsZVxuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBkZXZpY2Ugb3JpZW50YXRpb24gY2FtZXJhIHBvaW50aW5nIGluIGRpcmVjdGlvbiBvZlxuICAgICAgICAvLyBvcmlnaW5hbCBjYW1lcmEuXG4gICAgICAgIFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhLnJvdGF0aW9uUXVhdGVybmlvbiA9IEJBQllMT04uUXVhdGVybmlvbi5Gcm9tRXVsZXJWZWN0b3IoXG4gICAgICAgICAgICBjYW1lcmFGcm9tQmFieWxvbkZpbGUucm90YXRpb24sXG4gICAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgVmFycy5zY2VuZS5hY3RpdmVDYW1lcmEgPSBjYW1lcmFGcm9tQmFieWxvbkZpbGU7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBjYW1lcmEgaGVpZ2h0LlxuICAgIFZhcnMuZGV0ZXJtaW5lQ2FtZXJhSGVpZ2h0RnJvbUFjdGl2ZUNhbWVyYSgpO1xuXG4gICAgLy8gU2V0dXAgdGhlIGRlZmF1bHQgKG5vblZSKSBjYW1lcmEuXG4gICAgTm9uVlJDYW1lcmEuc2V0dXAoKTtcbn1cbiIsIi8vIFRoaXMgbW9kdWxlIGhhbmRsZXMgYWxsIHRoaW5ncyBuYXZpZ2F0aW9uIHJlbGF0ZWQuXG5cbmltcG9ydCAqIGFzIENvbW1vbkNhbWVyYSBmcm9tIFwiLi4vQ2FtZXJhcy9Db21tb25DYW1lcmFcIjtcbmltcG9ydCAqIGFzIE5vblZSQ2FtZXJhIGZyb20gXCIuLi9DYW1lcmFzL05vblZSQ2FtZXJhXCI7XG5pbXBvcnQgKiBhcyBPcHRpbWl6YXRpb25zIGZyb20gXCIuLi9TY2VuZS9PcHRpbWl6YXRpb25zXCI7XG5pbXBvcnQgKiBhcyBWYXJzIGZyb20gXCIuLi9WYXJzL1ZhcnNcIjtcbmltcG9ydCAqIGFzIE5hdmlnYXRpb24gZnJvbSBcIi4vTmF2aWdhdGlvblwiO1xuaW1wb3J0ICogYXMgUGlja2FibGVzIGZyb20gXCIuL1BpY2thYmxlc1wiO1xuaW1wb3J0ICogYXMgUG9pbnRzIGZyb20gXCIuL1BvaW50c1wiO1xuaW1wb3J0ICogYXMgVXJsVmFycyBmcm9tIFwiLi4vVmFycy9VcmxWYXJzXCI7XG5pbXBvcnQgKiBhcyBNZW51M0QgZnJvbSBcIi4uL1VJL01lbnUzRC9NZW51M0RcIjtcblxuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuZGVjbGFyZSB2YXIgalF1ZXJ5OiBhbnk7XG5cbmV4cG9ydCBjb25zdCBlbnVtIE5hdk1vZGUge1xuICAgIC8vIE5vdGU6IGNvbnN0IGVudW0gbmVlZGVkIGZvciBjbG9zdXJlLWNvbXBpbGVyIGNvbXBhdGliaWxpdHkuXG4gICAgVlJXaXRoQ29udHJvbGxlcnMgPSAxLFxuICAgIFZSTm9Db250cm9sbGVycyA9IDIsXG4gICAgTm9WUiA9IDMsXG59XG5cbmxldCBjdXJyZW50bHlUZWxlcG9ydGluZyA9IGZhbHNlO1xuXG4vKipcbiAqIFNldHVwIHRoZSBuYXZpZ2F0aW9uIHN5c3RlbS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIC8vIEFsbHdheXMgY29sbGlkZSB3aXRoIGEgZmxvb3IgbWVzaC5cbiAgICBWYXJzLnZyVmFycy5ncm91bmRNZXNoID0gVmFycy5zY2VuZS5nZXRNZXNoQnlJRChcImdyb3VuZFwiKTtcbiAgICBpZiAoVmFycy52clZhcnMuZ3JvdW5kTWVzaCA9PT0gbnVsbCkgeyBhbGVydChcIk5vIG1lc2ggbmFtZWQgZ3JvdW5kXCIpOyB9XG4gICAgVmFycy52clZhcnMuZ3JvdW5kTWVzaC5jaGVja0NvbGxpc2lvbnMgPSB0cnVlO1xuXG4gICAgLy8gVGhlIGdyb3VuZCBzaG91bGQgZ2VuZXJhbGx5IGJlIGhpZGRlbi4gVGhlcmUncyBhIGNoYW5jZSBpdCBjb3VsZCBiZVxuICAgIC8vIHR1cm5lZCBpbnRvIGdsYXNzIHRvby4gU2VlIE1vbHMuXG4gICAgVmFycy52clZhcnMuZ3JvdW5kTWVzaC52aXNpYmlsaXR5ID0gMDtcblxuICAgIE9wdGltaXphdGlvbnMub3B0aW1pemVNZXNoUGlja2luZyhWYXJzLnZyVmFycy5ncm91bmRNZXNoKTtcbiAgICBQaWNrYWJsZXMubWFrZU1lc2hNb3VzZUNsaWNrYWJsZSh7XG4gICAgICAgIGNhbGxCYWNrOiBhY3RPblN0YXJlVHJpZ2dlcixcbiAgICAgICAgbWVzaDogVmFycy52clZhcnMuZ3JvdW5kTWVzaCxcbiAgICB9KTtcblxuICAgIC8vIEluaXRpYWxseSwgbm8gVlIuXG4gICAgVmFycy52clZhcnMubmF2TW9kZSA9IE5hdmlnYXRpb24uTmF2TW9kZS5Ob1ZSO1xuXG4gICAgLy8gU2V0dXAgdHJpZ2dlcnMuXG4gICAgc2V0dXBUcmlnZ2VycygpO1xuXG4gICAgLy8gS2VlcCB0cmFjayB1cCBjcml0aWNhbCBwb2ludHMgaW4gdGhlIHNjZW5lIChsaWtlIHN0YXJlIHBvaW50cykuXG4gICAgUG9pbnRzLnNldHVwKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBkaXYgdG8gaW50ZXJjZXB0IGNsaWNrcyBpZiBuZWVkZWQuIEFkZCBjbGVhciBkaXYgb3ZlciBjYW52YXMuXG4gICAgc2V0dXBDYXB0dXJlTW91c2VDbGlja3NPdXRzaWRlQmFieWxvbigpO1xuXG4gICAgLy8gQ29uc3RhbnRseSBtb25pdG9yIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2FtZXJhLiBJZiBpdCdzIG5vIGxvbmdlciBvdmVyXG4gICAgLy8gdGhlIGZsb29yLCBtb3ZlIGl0IGJhY2sgdG8gaXRzIHByZXZpb3VzIHBvc2l0aW9uLlxuICAgIGtlZXBDYW1lcmFPdmVyRmxvb3IoKTtcbn1cblxuLyoqIEB0eXBlIHsqfSAqL1xubGV0IGxhc3RDYW1lcmFQdDogYW55O1xuXG4vKiogQHR5cGUge3N0cmluZ30gKi9cbmxldCBsYXN0Q2FtZXJhTmFtZSA9IFwiXCI7XG5cbi8qKlxuICogQ2hlY2sgYW5kIG1ha2Ugc3VyZSB0aGUgY2FtZXJhIGlzIG92ZXIgdGhlIGdyb3VuZC4gSWYgbm90LCBtb3ZlIGl0IGJhY2sgc29cbiAqIGl0IGlzIG92ZXIgdGhlIGdyb3VuZC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24ga2VlcENhbWVyYU92ZXJGbG9vcigpOiB2b2lkIHtcbiAgICBsYXN0Q2FtZXJhUHQgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKTtcbiAgICBWYXJzLnNjZW5lLnJlZ2lzdGVyQmVmb3JlUmVuZGVyKCgpID0+IHtcbiAgICAgICAgY29uc3QgY2FtZXJhUHQgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKTsgIC8vIGNsb25lZCBwdC5cbiAgICAgICAgY29uc3QgZ3JvdW5kUG9pbnRCZWxvd0NhbWVyYSA9IFBvaW50cy5ncm91bmRQb2ludFBpY2tpbmdJbmZvKGNhbWVyYVB0KTtcbiAgICAgICAgaWYgKChncm91bmRQb2ludEJlbG93Q2FtZXJhLnBpY2tlZE1lc2ggPT09IG51bGwpICYmIChsYXN0Q2FtZXJhTmFtZSA9PT0gVmFycy5zY2VuZS5hY3RpdmVDYW1lcmEuaWQpKSB7XG4gICAgICAgICAgICAvLyBZb3UncmUgbm90IGFib3ZlIHRoZSBncm91bmQhIFRoaXMgc2hvdWxkbid0IGhhcHBlbiwgYnV0IGl0IGNhblxuICAgICAgICAgICAgLy8gb2NjYXNpb25hbGx5LiBSZXR1cm4gdGhlIGNhbWVyYSB0byBpdHMgcHJldmlvdXMgcG9zaXRpb24uIE9uZVxuICAgICAgICAgICAgLy8gZXhhbXBsZSBpcyBpZiB5b3UncmUgdXNpbmcgdGhlIGNvbnRyb2xsZXJzIG9uIGEgSFRDIHZpdmUgdG9cbiAgICAgICAgICAgIC8vIG5hdmlnYXRlIChmb3J3YXJkL2JhY2t3YXJkKS5cblxuICAgICAgICAgICAgQ29tbW9uQ2FtZXJhLnNldENhbWVyYVBvc2l0aW9uKGxhc3RDYW1lcmFQdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0Q2FtZXJhUHQgPSBjYW1lcmFQdDtcbiAgICAgICAgICAgIGxhc3RDYW1lcmFOYW1lID0gVmFycy5zY2VuZS5hY3RpdmVDYW1lcmEuaWQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIGFkZGl0aW9uYWwgdHJpZ2dlcnMuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIHNldHVwVHJpZ2dlcnMoKTogdm9pZCB7XG4gICAgLy8gU3BhY2UgYWx3YXlzIHRyaWdnZXJzXG4gICAgY29uc3QgYm9keSA9IGpRdWVyeShcImJvZHlcIik7XG4gICAgYm9keS5rZXlwcmVzcygoZTogYW55KSA9PiB7XG4gICAgICAgIGlmIChlLmNoYXJDb2RlID09PSAzMikge1xuICAgICAgICAgICAgLy8gU3BhY2UgYmFyXG4gICAgICAgICAgICBhY3RPblN0YXJlVHJpZ2dlcigpO1xuICAgICAgICB9IGVsc2UgaWYgKGUuY2hhckNvZGUgPT09IDEwOSkge1xuICAgICAgICAgICAgLy8gTSAob3BlbiAzZCBtZW51KS5cbiAgICAgICAgICAgIE1lbnUzRC5vcGVuTWFpbk1lbnVGbG9vckJ1dHRvbi50b2dnbGVkKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE1vdXNlIGNsaWNrcyBhcmUgaGFuZGxlZCBlbHNld2hlcmUuLi5cbn1cblxubGV0IGxhc3RUcmlnZ2VyID0gMDtcblxuLyoqXG4gKiBUcmlnZ2VycyBhbiBhY3Rpb24sIGJhc2VkIG9uIHRoZSBtZXNoIHlvdSdyZSBjdXJyZW50bHkgbG9va2luZyBhdC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdE9uU3RhcmVUcmlnZ2VyKCk6IHZvaWQge1xuICAgIGlmIChVcmxWYXJzLndlYnJ0YyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIGluIGxlYWRlciBtb2RlLCBkb24ndCBldmVyIHRyaWdnZXIuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUaGVyZSBpcyBhIHJlZnJhY3RvcnkgcGVyaW9kIHRvIHByZXZlbnQgcmFwaWQgdHJpZ2dlciBmaXJlcy5cbiAgICBjb25zdCBjdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgaWYgKGN1clRpbWUgLSBsYXN0VHJpZ2dlciA8IDI1MCkge1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFRyaWdnZXIgPSBjdXJUaW1lO1xuICAgIH1cblxuICAgIC8vIENsaWNrLCBzcGFjZSwgb3Igc29tZXRoaW5nLiBZb3UgbmVlZCB0byBkZWNpZGUgaG93IHRvIGFjdC5cbiAgICBzd2l0Y2ggKFBpY2thYmxlcy5nZXRDYXRlZ29yeU9mQ3VyTWVzaCgpKSB7XG4gICAgICAgIGNhc2UgUGlja2FibGVzLlBpY2thYmxlQ2F0ZWdvcnkuR3JvdW5kOlxuICAgICAgICAgICAgLy8gSXQncyB0aGUgZ3JvdW5kLCBzbyB0ZWxlcG9ydCB0aGVyZS5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVsZXBvcnRcIik7XG4gICAgICAgICAgICB0ZWxlcG9ydCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUGlja2FibGVzLlBpY2thYmxlQ2F0ZWdvcnkuTW9sZWN1bGU6XG4gICAgICAgICAgICAvLyBJdCdzIGEgbW9sZWN1bGUsIHNvIGluY3JlYXNlIHRoZSBoZWlnaHQuXG4gICAgICAgICAgICBncm93KCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBQaWNrYWJsZXMuUGlja2FibGVDYXRlZ29yeS5CdXR0b246XG4gICAgICAgICAgICAvLyBJdCdzIGEgYnV0dG9uLiBDbGljayBmdW5jdGlvbiBpcyBhdHRhY2hlZCB0byB0aGUgbWVzaCAoc2VlXG4gICAgICAgICAgICAvLyBHVUkudHMpLlxuICAgICAgICAgICAgUGlja2FibGVzLmN1clBpY2tlZE1lc2guY2xpY2tGdW5jKCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBOb25lLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuXG4vKipcbiAqIFRlbGVwb3J0IHRvIGEgZ2l2ZW4gbG9jYXRpb24uXG4gKiBAcGFyYW0gIHsqfSAgICAgICAgIFtuZXdMb2M9dW5kZWZpbmVkXSBUaGUgbmV3IGxvY2F0aW9uLiBVc2VzIHN0YXJlIHBvaW50XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBubyBsb2NhdGlvbiBnaXZlbi5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSAgW2NhbGxCYWNrPV0gICAgICAgIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBvbmNlIHRlbGVwb3J0XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBkb25lLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiB0ZWxlcG9ydChuZXdMb2M6IGFueSA9IHVuZGVmaW5lZCwgY2FsbEJhY2s6IGFueSA9IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGN1cnJlbnRseVRlbGVwb3J0aW5nID0gdHJ1ZTtcblxuICAgIGlmIChjYWxsQmFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNhbGxCYWNrID0gKCkgPT4geyByZXR1cm47IH07XG4gICAgfVxuXG4gICAgLy8gSGlkZSB0aGUgYmlnZ2VyIG5hdiBtZXNoLiBJdCB3aWxsIGFwcGVhciBhZ2FpbiBlbHNld2hlcmUuXG4gICAgVmFycy52ckhlbHBlci5nYXplVHJhY2tlck1lc2guaXNWaXNpYmxlID0gZmFsc2U7XG5cbiAgICAvLyBBbmltYXRlIHRoZSB0cmFuc2l0aW9uIHRvIHRoZSBuZXcgbG9jYXRpb24uXG4gICAgLyoqIEBjb25zdCB7Kn0gKi9cbiAgICBjb25zdCBhbmltYXRpb25DYW1lcmFUZWxlcG9ydGF0aW9uID0gbmV3IEJBQllMT04uQW5pbWF0aW9uKFxuICAgICAgICBcImFuaW1hdGlvbkNhbWVyYVRlbGVwb3J0YXRpb25cIiwgXCJwb3NpdGlvblwiLCA5MCxcbiAgICAgICAgQkFCWUxPTi5BbmltYXRpb24uQU5JTUFUSU9OVFlQRV9WRUNUT1IzLFxuICAgICAgICBCQUJZTE9OLkFuaW1hdGlvbi5BTklNQVRJT05MT09QTU9ERV9DT05TVEFOVCxcbiAgICApO1xuXG4gICAgLy8gVGhlIHN0YXJ0IGxvY2F0aW9uLlxuICAgIGxldCBzdGFydExvYyA9IENvbW1vbkNhbWVyYS5nZXRDYW1lcmFQb3NpdGlvbigpO1xuXG4gICAgLy8gR2V0IHRoZSBuZXcgbG9jYXRpb24uXG4gICAgaWYgKG5ld0xvYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIGl0J3Mgbm90IGRlZmluZWQsIHVzZSB0aGUgY3VycmVudCBzdGFyZSBwb2ludC5cbiAgICAgICAgbmV3TG9jID0gbmV3IEJBQllMT04uVmVjdG9yMyhcbiAgICAgICAgICAgIFBvaW50cy5jdXJTdGFyZVB0LngsXG4gICAgICAgICAgICBQb2ludHMuY3VyU3RhcmVQdC55ICsgVmFycy5jYW1lcmFIZWlnaHQsXG4gICAgICAgICAgICBQb2ludHMuY3VyU3RhcmVQdC56LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIENvcnJlY3QgaWYgVlIgY2FtZXJhLlxuICAgIGNvbnN0IGV5ZVRvQ2FtVmVjID0gQ29tbW9uQ2FtZXJhLmdldFZlY0Zyb21FeWVUb0NhbWVyYSgpO1xuICAgIG5ld0xvYyA9IG5ld0xvYy5zdWJ0cmFjdChleWVUb0NhbVZlYyk7XG4gICAgc3RhcnRMb2MgPSBzdGFydExvYy5zdWJ0cmFjdChleWVUb0NhbVZlYyk7XG5cbiAgICAvLyBBbmltYXRlIHRvIG5ldyBsb2NhdGlvbi5cbiAgICAvKiogQGNvbnN0IHtBcnJheTxPYmplY3Q8c3RyaW5nLCAqPj59ICovXG4gICAgY29uc3QgYW5pbWF0aW9uQ2FtZXJhVGVsZXBvcnRhdGlvbktleXMgPSBbXG4gICAgICAgIHsgXCJmcmFtZVwiOiAwLCBcInZhbHVlXCI6IHN0YXJ0TG9jIH0sXG4gICAgICAgIHsgXCJmcmFtZVwiOiBWYXJzLlRSQU5TUE9SVF9EVVJBVElPTiwgXCJ2YWx1ZVwiOiBuZXdMb2MgfSxcbiAgICBdO1xuICAgIGFuaW1hdGlvbkNhbWVyYVRlbGVwb3J0YXRpb24uc2V0S2V5cyhhbmltYXRpb25DYW1lcmFUZWxlcG9ydGF0aW9uS2V5cyk7XG5cbiAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgIGNvbnN0IGFjdGl2ZUNhbWVyYSA9IFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhO1xuXG4gICAgYWN0aXZlQ2FtZXJhLmFuaW1hdGlvbnMgPSBbXTtcbiAgICBhY3RpdmVDYW1lcmEuYW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbkNhbWVyYVRlbGVwb3J0YXRpb24pO1xuXG4gICAgVmFycy5zY2VuZS5iZWdpbkFuaW1hdGlvbihhY3RpdmVDYW1lcmEsIDAsIFZhcnMuVFJBTlNQT1JUX0RVUkFUSU9OLCBmYWxzZSwgMSwgKCkgPT4ge1xuICAgICAgICAvLyBBbmltYXRpb24gZmluaXNoZWQgY2FsbGJhY2suXG4gICAgICAgIGN1cnJlbnRseVRlbGVwb3J0aW5nID0gZmFsc2U7XG4gICAgICAgIFZhcnMudnJIZWxwZXIuZ2F6ZVRyYWNrZXJNZXNoLmlzVmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgLy8gRXJhc2UgYW5pbWF0aW9uXG4gICAgICAgIGFjdGl2ZUNhbWVyYS5hbmltYXRpb25zID0gW107XG5cbiAgICAgICAgY2FsbEJhY2soKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBUZWxlcG9ydCBhbmQgZ3Jvdy4gRmlyZXMgaWYgeW91IGNsaWNrIG9uIGEgbW9sZWN1bGFyIG1lc2guXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGdyb3coKTogdm9pZCB7XG4gICAgY29uc3QgcHRCZWxvd1N0YXJlUHQgPSBQb2ludHMuZ3JvdW5kUG9pbnRCZWxvd1N0YXJlUHQ7XG5cbiAgICAvLyBHZXQgdGhlIHZlY3RvciBmb3JtIHRoZSBzdGFyZSBwb2ludCB0byB0aGUgY2FtZXJhLlxuICAgIGNvbnN0IGNhbWVyYVBvcyA9IENvbW1vbkNhbWVyYS5nZXRDYW1lcmFQb3NpdGlvbigpO1xuICAgIGNvbnN0IHZlY1N0YXJlUHRDYW1lcmEgPSBQb2ludHMuY3VyU3RhcmVQdC5zdWJ0cmFjdChjYW1lcmFQb3MpO1xuXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgY29uc3QgdmVjU3RhcmVQdERpc3QgPSB2ZWNTdGFyZVB0Q2FtZXJhLmxlbmd0aCgpO1xuXG4gICAgbGV0IG5ld1B0O1xuICAgIGlmICgwLjEgKiB2ZWNTdGFyZVB0RGlzdCA8IFZhcnMuTUlOX0RJU1RfVE9fTU9MX09OX1RFTEVQT1JUKSB7XG4gICAgICAgIC8vIFRlbGVwb3J0aW5nIDkwJSBvZiB0aGUgd2F5IHdvdWxkIHB1dCB5b3UgdG9vIGNsb3NlIHRvIHRoZSB0YXJnZXQuXG4gICAgICAgIG5ld1B0ID0gUG9pbnRzLmN1clN0YXJlUHQuc3VidHJhY3QoXG4gICAgICAgICAgICB2ZWNTdGFyZVB0Q2FtZXJhLm5vcm1hbGl6ZSgpLnNjYWxlKFxuICAgICAgICAgICAgICAgIFZhcnMuTUlOX0RJU1RfVE9fTU9MX09OX1RFTEVQT1JULFxuICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKDAuMSAqIHZlY1N0YXJlUHREaXN0ID4gVmFycy5NQVhfRElTVF9UT19NT0xfT05fVEVMRVBPUlQpIHtcbiAgICAgICAgLy8gVGVsZXBvcnRpbmcgOTAlIG9mIHRoZSB3YXkgd291bGQgcHV0IHlvdSB0b28gZmFyIGZyb20gdGhlIHRhcmdldC5cbiAgICAgICAgbmV3UHQgPSBQb2ludHMuY3VyU3RhcmVQdC5zdWJ0cmFjdChcbiAgICAgICAgICAgIHZlY1N0YXJlUHRDYW1lcmEubm9ybWFsaXplKCkuc2NhbGUoXG4gICAgICAgICAgICAgICAgVmFycy5NQVhfRElTVF9UT19NT0xfT05fVEVMRVBPUlQsXG4gICAgICAgICAgICApLFxuICAgICAgICApO1xuICAgIH0gZWxzZSBpZiAoMC4xICogdmVjU3RhcmVQdERpc3QgPCBWYXJzLk1BWF9ESVNUX1RPX01PTF9PTl9URUxFUE9SVCkge1xuICAgICAgICAvLyBUZWxlcG9ydGluZyA5MCUgb2YgdGhlIHdheSB3b3VsZCBwdXQgeW91IGluIHRoZSBzd2VldCBzcG90LiBEb1xuICAgICAgICAvLyB0aGF0LlxuICAgICAgICBuZXdQdCA9IGNhbWVyYVBvcy5hZGQoXG4gICAgICAgICAgICB2ZWNTdGFyZVB0Q2FtZXJhLnNjYWxlKDAuOSksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gTm93IHR3ZWFrIHRoZSBoZWlnaHQgdG8gbWF0Y2ggdGhlIHBvaW50IGV4YWN0bHkgKG5vdCBvbiB0aGUgbGluZVxuICAgIC8vIGJldHdlZW4gY2FtZXJhIGFuZCBwb2ludCkuXG4gICAgbmV3UHQueSA9IFBvaW50cy5jdXJTdGFyZVB0Lnk7XG5cbiAgICAvLyBZb3UgbmVlZCB0byBtYWtlIHN1cmUgdGhlIG5ldyBwb2ludCBpc24ndCB3aXRoaW4gdGhlIGJ1dHRvbiBzcGhlcmUgYXRcbiAgICAvLyB5b3VyIGZlZXQuIElmIG5vdCwgeW91IGNvdWxkIGdldCB0cmFwcGVkLlxuICAgIGlmIChuZXdQdC55IC0gcHRCZWxvd1N0YXJlUHQueSA8IDAuNSAqIFZhcnMuQlVUVE9OX1NQSEVSRV9SQURJVVMgKyAwLjEpIHtcbiAgICAgICAgbmV3UHQueSA9IHB0QmVsb3dTdGFyZVB0LnkgKyAwLjUgKiBWYXJzLkJVVFRPTl9TUEhFUkVfUkFESVVTICsgMC4xO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgbmV3IGhlaWdodC4gMC4wMSBpcyBpbXBvcnRhbnQgc28gZWxpcHNlIGRvZXNuJ3QgZ2V0IGNhdWdodCBvblxuICAgIC8vIG5ldyBncm91bmQuXG4gICAgVmFycy5zZXRDYW1lcmFIZWlnaHQoUG9pbnRzLmN1clN0YXJlUHQueSAtIHB0QmVsb3dTdGFyZVB0LnkpO1xuXG4gICAgdGVsZXBvcnQobmV3UHQsICgpID0+IHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBjb2xsaXNpb24gZWxpcHNvaWQgc3Vycm91bmRpbmcgdGhlIG5vbi1WUiBjYW1lcmFcbiAgICAgICAgLy8gbWF0Y2hlcyB0aGUgbmV3IGhlaWdodC5cbiAgICAgICAgTm9uVlJDYW1lcmEuc2V0Q2FtZXJhRWxpcHNvaWQoKTtcbiAgICB9KTtcbn1cblxubGV0IGNhcHR1cmVNb3VzZUNsaWNrc0RpdjogYW55ID0gdW5kZWZpbmVkO1xubGV0IGN1cnJlbnRseUNhcHR1cmluZ01vdXNlQ2xpY2tzID0gZmFsc2U7XG5cbi8qKlxuICogU2V0dXAgdGhlIGFiaWxpdHkgdG8gY2FwdHVyZSBjbGlja3MuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIHNldHVwQ2FwdHVyZU1vdXNlQ2xpY2tzT3V0c2lkZUJhYnlsb24oKTogdm9pZCB7XG4gICAgLy8gVW5mb3J0dW5hdGVseSwgd2hlbiB5b3UgY2xpY2sgb24gcGhvbmVzIGl0IHRha2VzIGF3YXkgY29udHJvbCBmcm9tIHRoZVxuICAgIC8vIG9yaWVudGF0aW9uIHNlbnNvci4gQmFieWxvbi5qcyBjbGFpbXMgdG8gaGF2ZSBmaXhlZCB0aGlzLCBidXQgSSBkb24ndFxuICAgIC8vIHRoaW5rIGl0IGlzIGZpeGVkOiBodHRwczovL2dpdGh1Yi5jb20vQmFieWxvbkpTL0JhYnlsb24uanMvcHVsbC82MDQyXG4gICAgLy8gSSdtIGdvaW5nIHRvIGRldGVjdCBpZiBpdCdzIGN1cnJlbnRseSByZWFkaW5nIGZyb20gdGhlIG9yaWVudGF0aW9uXG4gICAgLy8gc2Vuc29yIGFuZCB0aHJvdyB1cCBhIGRpdiB0byBjYXB0dXJlIGNsaWNrcyBpZiBpdCBpcy4gQSBoYWNraXNoXG4gICAgLy8gc29sdXRpb24gdGhhdCB3b3Jrcy5cblxuICAgIC8vIFNldHVwIGRpdiB0byBpbnRlcmNlcHQgY2xpY2tzIGlmIG5lZWRlZC4gQWRkIGNsZWFyIGRpdiBvdmVyIGNhbnZhcy5cbiAgICBjYXB0dXJlTW91c2VDbGlja3NEaXYgPSBqUXVlcnkoXCIjY2FwdHVyZS1jbGlja3NcIik7XG5cbiAgICAvLyBNYWtlIGl0IGNsaWNrYWJsZS5cbiAgICBjYXB0dXJlTW91c2VDbGlja3NEaXYuY2xpY2soKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWQhXCIpO1xuICAgICAgICBhY3RPblN0YXJlVHJpZ2dlcigpO1xuICAgIH0pO1xuXG4gICAgVmFycy5zY2VuZS5yZWdpc3RlckJlZm9yZVJlbmRlcigoKSA9PiB7XG4gICAgICAgIGNoZWNrQ2FwdHVyZU1vdXNlQ2xpY2tzT3V0c2lkZUJhYnlsb24oKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgeW91IHNob3VsZCBjdXJyZW50bHkgYmUgY2FwdHVyaW5nIGNsaWNrcy4gVE9ETzogU2hvdWxkIHlvdSBiZVxuICogY2hlY2tpbmcgdGhpcyB3aXRoIGV2ZXJ5IHJlbmRlcj8gSSBkb24ndCBrbm93IHRoYXQgaXQgY2FuIGNoYW5nZSwgc28gbWF5YmVcbiAqIHlvdSBqdXN0IG5lZWQgdG8gY2hlY2sgaXQgb25jZT8gTWF5YmUgY291bGQgYmUgaW4gc2V0VGltZW91dC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gY2hlY2tDYXB0dXJlTW91c2VDbGlja3NPdXRzaWRlQmFieWxvbigpOiB2b2lkIHtcbiAgICBjb25zdCBkZXZpY2VPcmllbnRhdGlvbiA9IFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhLmlucHV0cy5hdHRhY2hlZC5kZXZpY2VPcmllbnRhdGlvbjtcbiAgICBsZXQgZGV2aWNlQmVpbmdPcmllbnRlZDtcblxuICAgIGlmICghZGV2aWNlT3JpZW50YXRpb24pIHtcbiAgICAgICAgLy8gT24gaHRjIHZpdmUsIGRldmljZU9yaWVudGF0aW9uIGRvZXMgbm90IGV4aXN0LlxuICAgICAgICBkZXZpY2VCZWluZ09yaWVudGVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2hlY2sgb3RoZXIgZGV2aWNlcyAod2hldGhlciBpbiBicm93c2VyIG9yIGluIGNhcmRib2FyZCwgZXRjKS5cbiAgICAgICAgZGV2aWNlQmVpbmdPcmllbnRlZCA9IChkZXZpY2VPcmllbnRhdGlvbi5fYWxwaGEgIT09IDApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZGV2aWNlT3JpZW50YXRpb24uX2JldGEgIT09IDApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZGV2aWNlT3JpZW50YXRpb24uX2dhbW1hICE9PSAwKTtcbiAgICB9XG5cbiAgICBpZiAoZGV2aWNlQmVpbmdPcmllbnRlZCAmJiAhY3VycmVudGx5Q2FwdHVyaW5nTW91c2VDbGlja3MpIHtcbiAgICAgICAgY3VycmVudGx5Q2FwdHVyaW5nTW91c2VDbGlja3MgPSB0cnVlO1xuICAgICAgICBjYXB0dXJlTW91c2VDbGlja3NEaXYuc2hvdygpO1xuICAgIH0gZWxzZSBpZiAoIWRldmljZUJlaW5nT3JpZW50ZWQgJiYgY3VycmVudGx5Q2FwdHVyaW5nTW91c2VDbGlja3MpIHtcbiAgICAgICAgY3VycmVudGx5Q2FwdHVyaW5nTW91c2VDbGlja3MgPSBmYWxzZTtcbiAgICAgICAgY2FwdHVyZU1vdXNlQ2xpY2tzRGl2LmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNvbmZ1c2VkXCIpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhkZXZpY2VCZWluZ09yaWVudGVkKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coY3VycmVudGx5Q2FwdHVyaW5nTW91c2VDbGlja3MpO1xuICAgIH1cbn1cblxuLy8gTk9URSBUSEFUIFRIRSBUUkFDS1BBRC1DT05UUk9MRUQgRk9SV0FSRCBNT1ZFTUVOVFMgQU5EIFJPVEFUSU9OUyBVU0VEIElOIFZSXG4vLyBNT0RFIEFSRSBMT0NBVEVEIElOIFZSQ29udHJvbGxlcnMudHMuXG4iLCJpbXBvcnQgKiBhcyBUaHJlZURNb2wgZnJvbSBcIi4uLy4uL01vbHMvM0RNb2wvVGhyZWVETW9sXCI7XG5pbXBvcnQgKiBhcyBWaXNTdHlsZXMgZnJvbSBcIi4uLy4uL01vbHMvM0RNb2wvVmlzU3R5bGVzXCI7XG5pbXBvcnQgKiBhcyBVcmxWYXJzIGZyb20gXCIuLi8uLi9WYXJzL1VybFZhcnNcIjtcbmltcG9ydCAqIGFzIE1lbnUzRCBmcm9tIFwiLi9NZW51M0RcIjtcblxuLy8gRGVmaW5lIGFsbCB0aGUgcG9zc2libGUgY29tcG9uZW50cy5cbmNvbnN0IGNvbXBvbmVudHMgPSBbXCJQcm90ZWluXCIsIFwiTGlnYW5kXCIsIFwiTGlnYW5kIENvbnRleHRcIiwgXCJXYXRlclwiLCBcIk51Y2xlaWNcIl07XG5cbi8vIEZvciBlYWNoIG9mIHRob3NlIGNvbXBvbmVudHMsIGdldCB0aGUgcG9zc2libGUgc2VsZWN0aW9ucy5cbmNvbnN0IHNlbGVjdGlvbnMgPSB7XG4gICAgXCJMaWdhbmRcIjogW1wiQWxsXCJdLFxuICAgIFwiTGlnYW5kIENvbnRleHRcIjogW1wiQWxsXCJdLFxuICAgIFwiTnVjbGVpY1wiOiBbXCJBbGxcIl0sXG4gICAgXCJQcm90ZWluXCI6IFtcbiAgICAgICAgXCJBbGxcIiwgXCJIeWRyb3Bob2JpY1wiLCBcIkh5ZHJvcGhpbGljXCIsIFwiQ2hhcmdlZFwiLCBcIkFyb21hdGljXCIsICAvLyBPdGhlcj8gRnJvbSBWTUQ/XG4gICAgXSxcbiAgICBcIldhdGVyXCI6IFtcIkFsbFwiXSxcbn07XG5cbi8vIEZvciBlYWNoIG9mIHRob3NlIGNvbXBvbmVudHMsIHNwZWNpZnkgdGhlIGFzc29jaWF0ZWQgcmVwcmVzZW50YXRpb25zLlxuY29uc3QgY29tbW9uUmVwcyA9IFtcIlN0aWNrXCIsIFwiU3BoZXJlXCIsIFwiU3VyZmFjZVwiXTtcbmNvbnN0IHJlcHJlc2VudGF0aW9ucyA9IHtcbiAgICBcIkxpZ2FuZFwiOiBjb21tb25SZXBzLFxuICAgIFwiTGlnYW5kIENvbnRleHRcIjogW1wiQ2FydG9vblwiXS5jb25jYXQoY29tbW9uUmVwcyksXG4gICAgXCJOdWNsZWljXCI6IGNvbW1vblJlcHMsXG4gICAgXCJQcm90ZWluXCI6IFtcIkNhcnRvb25cIl0uY29uY2F0KGNvbW1vblJlcHMpLFxuICAgIFwiV2F0ZXJcIjogY29tbW9uUmVwcyxcbn07XG5cbi8vIFlvdSdsbCBuZWVkIHRvIG1vZGlmeSBjb2xvclNjaGVtZUtleVdvcmRUbzNETW9sIGluIFZpc1N0eWxlcy50cyB0b28uXG5jb25zdCBjb2xvcnMgPSBbXG4gICAgXCJXaGl0ZVwiLCBcIlJlZFwiLCBcIkJsdWVcIiwgXCJHcmVlblwiLCBcIk9yYW5nZVwiLCBcIlllbGxvd1wiLCBcIlB1cnBsZVwiLFxuXTtcblxuY29uc3QgY29sb3JTY2hlbWVzID0gW1xuICAgIFwiRWxlbWVudFwiLCBcIkFtaW5vIEFjaWRcIiwgXCJDaGFpblwiLCBcIk51Y2xlaWNcIiwgXCJTcGVjdHJ1bVwiLFxuXTtcblxuLyoqXG4gKiBNYWtlcyBzdWJtZW51cyByZXF1aXJlZCBmb3IgdGhlIHZhcmlvdXMgc3R5bGUgb3B0aW9ucyAocmVwcywgY29sb3JzLCBldGMuKS5cbiAqIEByZXR1cm5zIE9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTdHlsZXNTdWJNZW51KCk6IGFueSB7XG4gICAgY29uc3QgbWVudSA9IHtcbiAgICAgICAgXCJDb21wb25lbnRzXCI6IHt9LFxuICAgICAgICBcIlNlbGVjdGlvbnNcIjoge30sXG4gICAgICAgIFwiQ2xlYXJcIjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZnVsbEtleXMgPSBPYmplY3Qua2V5cyhWaXNTdHlsZXMuc3R5bGVNZXNoZXMpO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gZnVsbEtleXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxLZXkgPSBmdWxsS2V5c1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHlsZU1lc2ggPSBWaXNTdHlsZXMuc3R5bGVNZXNoZXNbZnVsbEtleV07XG4gICAgICAgICAgICAgICAgc3R5bGVNZXNoLm1lc2guaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBNZW51M0Qub3Blbk1haW5NZW51Rmxvb3JCdXR0b24udG9nZ2xlZCgpO1xuICAgICAgICB9LFxuICAgICAgICBcIlJlbW92ZSBFeGlzdGluZ1wiOiB7fSxcbiAgICB9O1xuXG4gICAgLy8gQWRkIGluIHRoZSBjb21wb25lbnRzIChsaWdhbmQsIHByb3RlaW4sIGV0YykuXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgY29uc3QgY29tcG9uZW50c0xlbiA9IGNvbXBvbmVudHMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50c0xlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbaV07XG4gICAgICAgIG1lbnVbXCJDb21wb25lbnRzXCJdW2NvbXBvbmVudF0gPSB7fTtcbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbnNDb21wb25lbnRMZW4gPSBzZWxlY3Rpb25zW2NvbXBvbmVudF0ubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpMiA9IDA7IGkyIDwgc2VsZWN0aW9uc0NvbXBvbmVudExlbjsgaTIrKykge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gc2VsZWN0aW9uc1tjb21wb25lbnRdW2kyXTtcbiAgICAgICAgICAgIG1lbnVbXCJDb21wb25lbnRzXCJdW2NvbXBvbmVudF1bc2VsZWN0aW9uXSA9IG1ha2VSZXBDb2xvclNjaGVtZVN1Yk1lbnVzKHt9LCBjb21wb25lbnQsIChyZXA6IGFueSwgY29sb3JTY2hlbWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIFZpc1N0eWxlcy50b2dnbGVSZXAoW2NvbXBvbmVudCwgc2VsZWN0aW9uXSwgcmVwLCBjb2xvclNjaGVtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtZW51O1xufVxuXG4vKipcbiAqIFBvcHVsYXRlcyB0aGUgcG9ydGlvbiBvZiB0aGUgc3R5bGVzIG1lbnUgdGhhdCBsZXRzIHRoZSB1c2VyIHJlbW92ZSBvbGRcbiAqIHN0eWxlcy5cbiAqIEBwYXJhbSAge09iamVjdDxzdHJpbmcsKj59IG1lbnVJbmZcbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVBhc3RTdHlsZXNJbk1lbnUobWVudUluZjogYW55KTogdm9pZCB7XG4gICAgaWYgKFVybFZhcnMuY2hlY2tXZWJydGNJblVybCgpKSB7XG4gICAgICAgIC8vIExlYWRlciBtb2RlLiBTbyBubyBuZWVkIHRvIHVwZGF0ZSBtZW51IChpdCBkb2Vzbid0IGV4aXN0KS5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEFsc28gYWRkIGluIGV4aXN0aW5nIHN0eWxlcyBzbyB0aGV5IGNhbiBiZSByZW1vdmVkLlxuICAgIG1lbnVJbmZbXCJTdHlsZXNcIl1bXCJSZW1vdmUgRXhpc3RpbmdcIl0gPSB7fTtcbiAgICBNZW51M0Quc2V0dXBTdWJNZW51TmF2QnV0dG9ucyhcbiAgICAgICAgbWVudUluZltcIlN0eWxlc1wiXVtcIlJlbW92ZSBFeGlzdGluZ1wiXSxcbiAgICAgICAgW1wiU3R5bGVzXCIsIFwiUmVtb3ZlIEV4aXN0aW5nXCJdLFxuICAgICk7XG5cbiAgICBjb25zdCByZXBOYW1lcyA9IE9iamVjdC5rZXlzKFZpc1N0eWxlcy5zdHlsZU1lc2hlcyk7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgY29uc3QgbGVuID0gcmVwTmFtZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgcmVwTmFtZSA9IHJlcE5hbWVzW2ldO1xuICAgICAgICBpZiAoVmlzU3R5bGVzLnN0eWxlTWVzaGVzW3JlcE5hbWVdLm1lc2guaXNWaXNpYmxlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBsZXQgbGJsID0gcmVwTmFtZS5yZXBsYWNlKC8tLS9nLCBcIiBcIik7XG4gICAgICAgICAgICBsYmwgPSBsYmwucmVwbGFjZSgvey9nLCBcIlwiKS5yZXBsYWNlKC99L2csIFwiXCIpLnJlcGxhY2UoL1wiL2csIFwiXCIpO1xuICAgICAgICAgICAgbWVudUluZltcIlN0eWxlc1wiXVtcIlJlbW92ZSBFeGlzdGluZ1wiXVtsYmxdID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIE1lbnUzRC5vcGVuTWFpbk1lbnVGbG9vckJ1dHRvbi50b2dnbGVkKCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8Kj59ICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcEluZm8gPSBVcmxWYXJzLmV4dHJhY3RSZXBJbmZvRnJvbUtleShyZXBOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgVmlzU3R5bGVzLnRvZ2dsZVJlcChyZXBJbmZvWzBdLCByZXBJbmZvWzFdLCBcIkhpZGVcIik7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFBvcHVsYXRlcyB0aGUgcG9ydGlvbiBvZiB0aGUgc3R5bGVzIG1lbnUgdGhhdCBoYXMgbW9kZWwtc3BlY2lmaWNcbiAqIHNlbGVjdGlvbnMuXG4gKiBAcGFyYW0gIHtPYmplY3Q8c3RyaW5nLCo+fSBtZW51SW5mXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVNb2RlbFNwZWNpZmljU2VsZWN0aW9uc0luTWVudShtZW51SW5mOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBSZXNldCB0aGlzIHBhcnQgb2YgdGhlIG1lbnUuXG4gICAgbWVudUluZltcIlN0eWxlc1wiXVtcIlNlbGVjdGlvbnNcIl0gPSB7fTtcbiAgICBNZW51M0Quc2V0dXBTdWJNZW51TmF2QnV0dG9ucyhcbiAgICAgICAgbWVudUluZltcIlN0eWxlc1wiXVtcIlNlbGVjdGlvbnNcIl0sXG4gICAgICAgIFtcIlN0eWxlc1wiLCBcIlNlbGVjdGlvbnNcIl0sXG4gICAgKTtcblxuICAgIC8vIFNlbGVjdGlvbiBrZXl3b3Jkc1xuICAgIGNvbnN0IHNlbEtleXdvcmRzID0ge1xuICAgICAgICBcIkF0b20gTmFtZVwiOiBcImF0b21cIixcbiAgICAgICAgXCJDaGFpblwiOiBcImNoYWluXCIsXG4gICAgICAgIFwiRWxlbWVudFwiOiBcImVsZW1cIixcbiAgICAgICAgXCJSZXNpZHVlIEluZGV4XCI6IFwicmVzaVwiLFxuICAgICAgICBcIlJlc2lkdWUgTmFtZVwiOiBcInJlc25cIixcbiAgICAgICAgXCJTZWNvbmRhcnkgU3RydWN0dXJlXCI6IFwic3NcIixcbiAgICB9O1xuXG4gICAgY29uc3QgbWF4TnVtUGVyR3JvdXAgPSAxNDtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gICAgICBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3Q8KiwqPn0gbWVudUJyYW5jaFxuICAgICAqIEBwYXJhbSAge0FycmF5PCo+fSAgICBpdGVtc1xuICAgICAqIEBwYXJhbSAge0FycmF5PHN0cmluZz59IGJyZWFkY3J1bWJzXG4gICAgICovXG4gICAgY29uc3QgYWRkVG9NZW51UmVjdXJzZSA9IChjb21wb25lbnQ6IHN0cmluZywgbWVudUJyYW5jaDogYW55LCBpdGVtczogYW55W10sIGJyZWFkY3J1bWJzOiBzdHJpbmdbXSkgPT4ge1xuICAgICAgICBpdGVtcy5zb3J0KFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IHhcbiAgICAgICAgICAgICAqIEBwYXJhbSAge251bWJlcn0geVxuICAgICAgICAgICAgICogQHJldHVybnMgbnVtYmVyXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICh4OiBudW1iZXIsIHk6IG51bWJlcik6IG51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZWl0aGVyIGlzIGEgc3RyaW5nIG51bWJlciwgY29udmVydCB0byBudW1iZXIuXG4gICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgICAgICAgICAgeCA9IGlzTmFOKCt4KSA/IHggOiAreDtcblxuICAgICAgICAgICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICAgICAgICAgIHkgPSBpc05hTigreSkgPyB5IDogK3k7XG5cbiAgICAgICAgICAgICAgICBpZiAoeCA8IHkpIHsgcmV0dXJuIC0xOyB9XG4gICAgICAgICAgICAgICAgaWYgKHggPiB5KSB7IHJldHVybiAxOyB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFNvIGRpdmlkZSBpdCBpbnRvIG1heE51bVBlckdyb3VwIGdyb3Vwcy5cbiAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtpZnkoaXRlbXMsIG1heE51bVBlckdyb3VwKTtcblxuICAgICAgICAvLyBBZGQgdGhlIGl0ZW1zIGFuZCByZWN1cnNlIGlmIG5lY2Vzc2FyeS5cblxuICAgICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAgICAgY29uc3QgY2h1bmtzTGVuID0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3NMZW47IGkrKykge1xuICAgICAgICAgICAgLyoqIEB0eXBlIHtBcnJheTwqPn0gKi9cbiAgICAgICAgICAgIGNvbnN0IGNodW5rID0gY2h1bmtzW2ldO1xuICAgICAgICAgICAgaWYgKGNodW5rLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIEp1c3QgYSBzaW5nbGUgaXRlbSwgc28gbWFrZSB0aGUgcmVwL2NvbG9yIHN1Ym1lbnVzLlxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBjaHVua1swXTtcbiAgICAgICAgICAgICAgICBtZW51QnJhbmNoW2l0ZW1dID0ge307XG4gICAgICAgICAgICAgICAgLy8gTU9PU0VcbiAgICAgICAgICAgICAgICBtZW51QnJhbmNoW2l0ZW1dID0gbWFrZVJlcENvbG9yU2NoZW1lU3ViTWVudXMobWVudUJyYW5jaFtpdGVtXSwgY29tcG9uZW50LCAocmVwOiBhbnksIGNvbG9yU2NoZW1lOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbEtleXdvcmQgPSBzZWxLZXl3b3Jkc1tjb21wb25lbnRdOyAgLy8gU2VlIFRocmVlRE1vbC50c1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBpdFtzZWxLZXl3b3JkXSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIFZpc1N0eWxlcy50b2dnbGVSZXAoW2l0XSwgcmVwLCBjb2xvclNjaGVtZSk7XG4gICAgICAgICAgICAgICAgfSwgYnJlYWRjcnVtYnMuY29uY2F0KFtpdGVtXSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBNdWx0aXBsZSBpdGVtcywgc28gaXQncyBhIGNhdGVnb3J5LlxuICAgICAgICAgICAgICAgIGNvbnN0IGxibCA9IFwiW1wiICsgY2h1bmtbMF0udG9TdHJpbmcoKSArIFwiLVwiICsgY2h1bmtbY2h1bmsubGVuZ3RoIC0gMV0udG9TdHJpbmcoKSArIFwiXVwiO1xuICAgICAgICAgICAgICAgIG1lbnVCcmFuY2hbbGJsXSA9IHt9O1xuICAgICAgICAgICAgICAgIGFkZFRvTWVudVJlY3Vyc2UoY29tcG9uZW50LCBtZW51QnJhbmNoW2xibF0sIGNodW5rLCBicmVhZGNydW1icy5jb25jYXQoW2xibF0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsc28gYWRkIGluIHRoaW5ncyBsaWtlIGJhY2sgYnV0dG9ucy5cbiAgICAgICAgTWVudTNELnNldHVwU3ViTWVudU5hdkJ1dHRvbnMoXG4gICAgICAgICAgICBtZW51QnJhbmNoLCBicmVhZGNydW1icyxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgLy8gQWRkIGluIHNlbGVjdGlvbnMgc3BlY2lmaWMgdG8gdGhpcyBwcm90ZWluLlxuICAgIGNvbnN0IGNzID0gT2JqZWN0LmtleXMoVGhyZWVETW9sLmF0b21pY0luZm8pO1xuICAgIGNvbnN0IGxlbiA9IGNzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNzW2ldO1xuICAgICAgICAvLyBjb21wb25lbnQgaXMgbGlrZSBcIkVsZW1lbnRcIlxuXG4gICAgICAgIGNvbnN0IHNlbHMgPSBUaHJlZURNb2wuYXRvbWljSW5mb1tjb21wb25lbnRdO1xuICAgICAgICBtZW51SW5mW1wiU3R5bGVzXCJdW1wiU2VsZWN0aW9uc1wiXVtjb21wb25lbnRdID0ge307XG5cbiAgICAgICAgYWRkVG9NZW51UmVjdXJzZShcbiAgICAgICAgICAgIGNvbXBvbmVudCwgbWVudUluZltcIlN0eWxlc1wiXVtcIlNlbGVjdGlvbnNcIl1bY29tcG9uZW50XSxcbiAgICAgICAgICAgIHNlbHMsIFtcIlN0eWxlc1wiLCBcIlNlbGVjdGlvbnNcIiwgY29tcG9uZW50XSxcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbi8qKlxuICogVGFrZXMgYW4gYXJyYXkgYW5kIGRpdmlkZXMgaXQgaW50byBzdWJhcnJheXMgdGhhdCBhcmUgcm91Z2hseSBlcXVhbGx5XG4gKiBzcGFjZWQuXG4gKiBAcGFyYW0gIHtBcnJheTwqPn0gYXJyICAgICAgICBUaGUgYXJyYXkuXG4gKiBAcGFyYW0gIHtudW1iZXJ9ICAgbnVtQ2h1bmtzICBUaGUgbnVtYmVyIG9mIHN1YmFycmF5cy5cbiAqIEByZXR1cm5zIEFycmF5PEFycmF5PCo+PiAgQW4gYXJyYXkgb2YgYXJyYXlzLlxuICovXG5mdW5jdGlvbiBjaHVua2lmeShhcnI6IGFueVtdLCBudW1DaHVua3M6IG51bWJlcik6IGFueVtdIHtcbiAgICAvLyBzZWVcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84MTg4NTQ4L3NwbGl0dGluZy1hLWpzLWFycmF5LWludG8tbi1hcnJheXNcbiAgICBpZiAobnVtQ2h1bmtzIDwgMikge1xuICAgICAgICByZXR1cm4gW2Fycl07XG4gICAgfVxuXG4gICAgY29uc3QgbGVuID0gYXJyLmxlbmd0aDtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBsZXQgaSA9IDA7XG4gICAgbGV0IHNpemU7XG5cbiAgICBpZiAobGVuICUgbnVtQ2h1bmtzID09PSAwKSB7XG4gICAgICAgIHNpemUgPSBNYXRoLmZsb29yKGxlbiAvIG51bUNodW5rcyk7XG4gICAgICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICAgICAgICBvdXQucHVzaChhcnIuc2xpY2UoaSwgaSArPSBzaXplKSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB3aGlsZSAoaSA8IGxlbikge1xuICAgICAgICAgICAgc2l6ZSA9IE1hdGguY2VpbCgobGVuIC0gaSkgLyBudW1DaHVua3MtLSk7XG4gICAgICAgICAgICBvdXQucHVzaChhcnIuc2xpY2UoaSwgaSArPSBzaXplKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgcmVwcmVzZW50YXRpdmUgYW5kIGNvbG9yIHN1Ym1lbnVzLlxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgbWVudUJyYW5jaCAgICAgIFRoZSBicmFuY2ggdG8gd2hpY2ggdG8gYWRkIHRoZXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWVudXMuXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICAgICAgICBjb21wb25lbnQgICAgICAgTGlrZSBcIlByb3RlaW5cIi5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSAgICAgIGNsaWNrRnVuYyAgICAgICBUaGUgZnVuY3Rpb24gdG8gcnVuIHdoZW4gdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9ucyBvZiB0aGlzIHN1Ym1lbnUgYXJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2tlZC5cbiAqIEBwYXJhbSAge0FycmF5PHN0cmluZz59IFticmVhZGNydW1icz1dICBJZiBnaXZlbiwgdGhpcyBpcyB1c2VkIHRvIGFkZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbnMgbGlrZSB0aGUgQmFjayBidXR0b24uXG4gKiBAcmV0dXJucyBPYmplY3QgICAgICAgICAgICAgICAgICAgICAgICAgVGhlIHN1Ym1lbnUgb2JqZWN0LCBub3cgdXBkYXRlZC5cbiAqL1xuZnVuY3Rpb24gbWFrZVJlcENvbG9yU2NoZW1lU3ViTWVudXMobWVudUJyYW5jaDogYW55LCBjb21wb25lbnQ6IHN0cmluZywgY2xpY2tGdW5jOiBhbnksIGJyZWFkY3J1bWJzPzogc3RyaW5nW10pOiBhbnkge1xuICAgIC8vIFdoYXQgcmVwcmVzZW50YXRpb25zIGNhbiB5b3UgdXNlPyBEZWZhdWx0IHRvIFByb3RlaW4gYmVjYXVzZSBpdFxuICAgIC8vIGNvbnRhaW5zIHRoZW0gYWxsLlxuICAgIC8qKiBAdHlwZSBPYmplY3Q8c3RyaW5nLCo+ICovXG4gICAgY29uc3QgcmVwc1RvVXNlID0gKHJlcHJlc2VudGF0aW9uc1tjb21wb25lbnRdID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb25zW1wiUHJvdGVpblwiXSA6XG4gICAgICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uc1tjb21wb25lbnRdOyAgLy8gTGlrZSBbXCJDYXJ0b29uXCJdXG5cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBjb25zdCByZXBzVG9Vc2VMZW4gPSByZXBzVG9Vc2UubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVwc1RvVXNlTGVuOyBpKyspIHtcbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIGNvbnN0IHJlcCA9IHJlcHNUb1VzZVtpXTtcbiAgICAgICAgbWVudUJyYW5jaFtyZXBdID0ge1xuICAgICAgICAgICAgXCJDb2xvcnNcIjoge30sXG4gICAgICAgICAgICBcIkNvbG9yIFNjaGVtZXNcIjoge30sXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY29sb3JTY2hlbWVzTGVuID0gY29sb3JTY2hlbWVzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xvclNjaGVtZXNMZW47IGkrKykge1xuICAgICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgICAgICBjb25zdCBjb2xvclNjaGVtZSA9IGNvbG9yU2NoZW1lc1tpXTtcbiAgICAgICAgICAgIG1lbnVCcmFuY2hbcmVwXVtcIkNvbG9yIFNjaGVtZXNcIl1bY29sb3JTY2hlbWVdID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsaWNrRnVuYyhyZXAsIGNvbG9yU2NoZW1lKTtcbiAgICAgICAgICAgICAgICBNZW51M0Qub3Blbk1haW5NZW51Rmxvb3JCdXR0b24udG9nZ2xlZCgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICBjb25zdCBjb2xvcnNMZW4gPSBjb2xvcnMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbG9yc0xlbjsgaSsrKSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gY29sb3JzW2ldO1xuICAgICAgICAgICAgbWVudUJyYW5jaFtyZXBdW1wiQ29sb3JzXCJdW2NvbG9yXSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGlja0Z1bmMocmVwLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgTWVudTNELm9wZW5NYWluTWVudUZsb29yQnV0dG9uLnRvZ2dsZWQoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBtZW51QnJhbmNoW3JlcF1bXCJIaWRlXCJdID0gKCkgPT4ge1xuICAgICAgICAgICAgY2xpY2tGdW5jKHJlcCwgXCJIaWRlXCIpO1xuICAgICAgICAgICAgTWVudTNELm9wZW5NYWluTWVudUZsb29yQnV0dG9uLnRvZ2dsZWQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBbHNvIGFkZCBpbiB0aGluZ3MgbGlrZSBiYWNrIGJ1dHRvbnMuXG4gICAgICAgIGlmIChicmVhZGNydW1icyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsZXQgbmV3Q3J1bWJzID0gYnJlYWRjcnVtYnMuY29uY2F0KFtyZXBdKTtcbiAgICAgICAgICAgIE1lbnUzRC5zZXR1cFN1Yk1lbnVOYXZCdXR0b25zKG1lbnVCcmFuY2hbcmVwXSwgbmV3Q3J1bWJzKTtcblxuICAgICAgICAgICAgbmV3Q3J1bWJzID0gYnJlYWRjcnVtYnMuY29uY2F0KFtyZXAsIFwiQ29sb3JzXCJdKTtcbiAgICAgICAgICAgIGxldCBuZXdCcmFuY2ggPSBtZW51QnJhbmNoW3JlcF1bXCJDb2xvcnNcIl07XG4gICAgICAgICAgICBNZW51M0Quc2V0dXBTdWJNZW51TmF2QnV0dG9ucyhuZXdCcmFuY2gsIG5ld0NydW1icyk7XG5cbiAgICAgICAgICAgIG5ld0NydW1icyA9IGJyZWFkY3J1bWJzLmNvbmNhdChbcmVwLCBcIkNvbG9yIFNjaGVtZXNcIl0pO1xuICAgICAgICAgICAgbmV3QnJhbmNoID0gbWVudUJyYW5jaFtyZXBdW1wiQ29sb3IgU2NoZW1lc1wiXTtcbiAgICAgICAgICAgIE1lbnUzRC5zZXR1cFN1Yk1lbnVOYXZCdXR0b25zKG5ld0JyYW5jaCwgbmV3Q3J1bWJzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChicmVhZGNydW1icyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE1lbnUzRC5zZXR1cFN1Yk1lbnVOYXZCdXR0b25zKG1lbnVCcmFuY2gsIGJyZWFkY3J1bWJzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVudUJyYW5jaDtcbn1cbiIsIi8vIEZ1bmN0aW9ucyB0byBjcmVhdGUgYSBwcm90ZWluIHZpc3VhbGl6YXRpb24gdXNpbmcgM0RNb2wuanNcblxuaW1wb3J0ICogYXMgT3B0aW1pemF0aW9ucyBmcm9tIFwiLi4vLi4vU2NlbmUvT3B0aW1pemF0aW9uc1wiO1xuaW1wb3J0ICogYXMgTWVudTNEIGZyb20gXCIuLi8uLi9VSS9NZW51M0QvTWVudTNEXCI7XG5pbXBvcnQgKiBhcyBTdHlsZXMgZnJvbSBcIi4uLy4uL1VJL01lbnUzRC9TdHlsZXNcIjtcbmltcG9ydCAqIGFzIFVybFZhcnMgZnJvbSBcIi4uLy4uL1ZhcnMvVXJsVmFyc1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBQb3NpdGlvbkluU2NlbmUgZnJvbSBcIi4vUG9zaXRpb25JblNjZW5lXCI7XG5pbXBvcnQgKiBhcyBWUk1MIGZyb20gXCIuL1ZSTUxcIjtcbmltcG9ydCAqIGFzIExlY3R1cmVyIGZyb20gXCIuLi8uLi9XZWJSVEMvTGVjdHVyZXJcIjtcblxuLy8gV2hlcmUgdGhlIG1lc2hlcyBnZW5lcmF0ZWQgZnJvbSAzRE1vbC5qcyBnZXQgc3RvcmVkLlxuaW50ZXJmYWNlIElTdHlsZU1lc2gge1xuICAgIG1lc2g6IGFueTtcbiAgICBjYXRlZ29yeUtleTogc3RyaW5nOyAgLy8gRXZlcnl0aGluZyBidXQgY29sb3IuIE9iaiBrZXkgd2lsbCBpbmNsdWRlIGNvbG9yIChmb3IgbG9va3VwKS5cbn1cbmV4cG9ydCBsZXQgc3R5bGVNZXNoZXM6IHtbczogc3RyaW5nXTogSVN0eWxlTWVzaH0gPSB7fTtcblxuY29uc3Qgc2VsS2V5V29yZFRvM0RNb2xTZWwgPSB7XG4gICAgLy8gU2VlIFZNRCBvdXRwdXQgVENMIGZpbGVzIGZvciBnb29kIGlkZWFzLiBZb3UgbWF5IG5lZSB0byBsb29rIGF0XG4gICAgLy8gU3R5bGVzLnRzIHRvby5cbiAgICBcIkFsbFwiOiAgICAgICAgIHt9LFxuICAgIFwiUHJvdGVpblwiOiAgICAge1wicmVzblwiOiBsQW5kVShbXCJBTEFcIiwgXCJBUkdcIiwgXCJBU1BcIiwgXCJBU05cIiwgXCJBU1hcIiwgXCJDWVNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJHTE5cIiwgXCJHTFVcIiwgXCJHTFhcIiwgXCJHTFlcIiwgXCJISVNcIiwgXCJIU1BcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJIWVBcIiwgXCJJTEVcIiwgXCJMRVVcIiwgXCJMWVNcIiwgXCJNRVRcIiwgXCJQQ0FcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJQSEVcIiwgXCJQUk9cIiwgXCJUUlBcIiwgXCJUWVJcIiwgXCJWQUxcIiwgXCJHTFVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTRVJcIiwgXCJUSFJcIiwgXCJNU0VcIl0pfSxcbiAgICBcIkFjaWRpY1wiOiAgICAgIHtcInJlc25cIjogbEFuZFUoW1wiQVNQXCIsIFwiR0xVXCJdKX0sXG4gICAgXCJDeWNsaWNcIjogICAgICB7XCJyZXNuXCI6IGxBbmRVKFtcIkhJU1wiLCBcIlBIRVwiLCBcIlBST1wiLCBcIlRSUFwiLCBcIlRZUlwiXSl9LFxuICAgIFwiQWxpcGhhdGljXCI6ICAge1wicmVzblwiOiBsQW5kVShbXCJBTEFcIiwgXCJHTFlcIiwgXCJJTEVcIiwgXCJMRVVcIiwgXCJWQUxcIl0pfSxcbiAgICBcIkFyb21hdGljXCI6ICAgIHtcInJlc25cIjogbEFuZFUoW1wiSElTXCIsIFwiUEhFXCIsIFwiVFJQXCIsIFwiVFlSXCJdKX0sXG4gICAgXCJCYXNpY1wiOiAgICAgICB7XCJyZXNuXCI6IGxBbmRVKFtcIkFSR1wiLCBcIkhJU1wiLCBcIkxZU1wiLCBcIkhTUFwiXSl9LFxuICAgIFwiQ2hhcmdlZFwiOiAgICAge1wicmVzblwiOiBsQW5kVShbXCJBU1BcIiwgXCJHTFVcIiwgXCJBUkdcIiwgXCJISVNcIiwgXCJMWVNcIiwgXCJIU1BcIl0pfSxcbiAgICBcIkh5ZHJvcGhvYmljXCI6IHtcInJlc25cIjogbEFuZFUoW1wiQUxBXCIsIFwiTEVVXCIsIFwiVkFMXCIsIFwiSUxFXCIsIFwiUFJPXCIsIFwiUEhFXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiTUVUXCIsIFwiVFJQXCJdKX0sXG4gICAgXCJOZXV0cmFsXCI6ICAgICB7XCJyZXNuXCI6IGxBbmRVKFtcIlZBTFwiLCBcIlBIRVwiLCBcIkdMTlwiLCBcIlRZUlwiLCBcIkhJU1wiLCBcIkNZU1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk1FVFwiLCBcIlRSUFwiLCBcIkFTWFwiLCBcIkdMWFwiLCBcIlBDQVwiLCBcIkhZUFwiXSl9LFxuICAgIFwiTnVjbGVpY1wiOiAgICAge1wicmVzblwiOiBsQW5kVShbXCJBREVcIiwgXCJBXCIsIFwiR1VBXCIsIFwiR1wiLCBcIkNZVFwiLCBcIkNcIiwgXCJUSFlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUXCIsIFwiVVJBXCIsIFwiVVwiLCBcIkRBXCIsIFwiREdcIiwgXCJEQ1wiLCBcIkRUXCJdKX0sXG4gICAgXCJQdXJpbmVcIjogICAgICB7XCJyZXNuXCI6IGxBbmRVKFtcIkFERVwiLCBcIkFcIiwgXCJHVUFcIiwgXCJHXCJdKX0sXG4gICAgXCJQeXJpbWlkaW5lXCI6ICB7XCJyZXNuXCI6IGxBbmRVKFtcIkNZVFwiLCBcIkNcIiwgXCJUSFlcIiwgXCJUXCIsIFwiVVJBXCIsIFwiVVwiXSl9LFxuICAgIFwiSW9uc1wiOiAgICAgICAge1wicmVzblwiOiBsQW5kVShbXCJBTFwiLCBcIkJBXCIsIFwiQ0FcIiwgXCJDQUxcIiwgXCJDRFwiLCBcIkNFU1wiLCBcIkNMQVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkNMXCIsIFwiQ09cIiwgXCJDU1wiLCBcIkNVXCIsIFwiQ1UxXCIsIFwiQ1VBXCIsIFwiSEdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJJTlwiLCBcIklPRFwiLCBcIktcIiwgXCJNR1wiLCBcIk1OM1wiLCBcIk1PM1wiLCBcIk1PNFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk1PNVwiLCBcIk1PNlwiLCBcIk5BXCIsIFwiTkFXXCIsIFwiT0M3XCIsIFwiUEJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJQT1RcIiwgXCJQVFwiLCBcIlJCXCIsIFwiU09EXCIsIFwiVEJcIiwgXCJUTFwiLCBcIldPNFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIllCXCIsIFwiWk5cIiwgXCJaTjFcIiwgXCJaTjJcIl0pfSxcbiAgICBcIldhdGVyXCI6ICAgICB7XCJyZXNuXCI6IGxBbmRVKFtcIldBVFwiLCBcIkhPSFwiLCBcIlRJUFwiLCBcIlRJUDNcIl0pfSxcbn07XG5cbi8vIEFkZCBpbiBsaWdhbmRcbnNlbEtleVdvcmRUbzNETW9sU2VsW1wiTGlnYW5kXCJdID0ge1wibm90XCI6IHtcIm9yXCI6IFtcbiAgICBzZWxLZXlXb3JkVG8zRE1vbFNlbFtcIlByb3RlaW5cIl0sXG4gICAgc2VsS2V5V29yZFRvM0RNb2xTZWxbXCJOdWNsZWljXCJdLFxuICAgIHNlbEtleVdvcmRUbzNETW9sU2VsW1wiSW9uc1wiXSxcbiAgICBzZWxLZXlXb3JkVG8zRE1vbFNlbFtcIldhdGVyXCJdLFxuXX19O1xuXG4vLyBBZGQgaW4gYWxsIHdpdGhpbiBsaWdhbmRcbnNlbEtleVdvcmRUbzNETW9sU2VsW1wiTGlnYW5kIENvbnRleHRcIl0gPSB7XG4gICAgXCJieXJlc1wiOiB0cnVlLFxuICAgIFwid2l0aGluXCI6IHtcbiAgICAgICAgXCJkaXN0YW5jZVwiOiA0LjAsXG4gICAgICAgIFwic2VsXCI6IHNlbEtleVdvcmRUbzNETW9sU2VsW1wiTGlnYW5kXCJdLFxuICAgIH0sXG59O1xuXG5jb25zdCBjb2xvclNjaGVtZUtleVdvcmRUbzNETW9sID0ge1xuICAgIFwiQW1pbm8gQWNpZFwiOiB7XCJjb2xvcnNjaGVtZVwiOiBcImFtaW5vXCJ9LFxuICAgIFwiQmx1ZVwiOiB7XCJjb2xvclwiOiBcImJsdWVcIn0sXG4gICAgXCJDaGFpblwiOiB7XCJjb2xvcnNjaGVtZVwiOiBcImNoYWluXCJ9LFxuICAgIFwiRWxlbWVudFwiOiB7XCJjb2xvcnNjaGVtZVwiOiBcImRlZmF1bHRcIn0sXG4gICAgXCJHcmVlblwiOiB7XCJjb2xvclwiOiBcImdyZWVuXCJ9LFxuICAgIFwiTnVjbGVpY1wiOiB7XCJjb2xvcnNjaGVtZVwiOiBcIm51Y2xlaWNcIn0sXG4gICAgXCJPcmFuZ2VcIjoge1wiY29sb3JcIjogXCJvcmFuZ2VcIn0sXG4gICAgXCJQdXJwbGVcIjoge1wiY29sb3JcIjogXCJwdXJwbGVcIn0sXG4gICAgXCJSZWRcIjoge1wiY29sb3JcIjogXCJyZWRcIn0sXG4gICAgXCJTcGVjdHJ1bVwiOiB7XCJjb2xvclwiOiBcInNwZWN0cnVtXCJ9LFxuICAgIFwiV2hpdGVcIjoge1wiY29sb3JcIjogXCJ3aGl0ZVwifSxcbiAgICBcIlllbGxvd1wiOiB7XCJjb2xvclwiOiBcInllbGxvd1wifSxcbn07XG5cbi8qKlxuICogVGhlIHRvZ2dsZVJlcCBmdW5jdGlvbi4gU3RhcnRzIHRoZSBtZXNoLWNyZWF0aW9uIHByb2Vjc3MuXG4gKiBAcGFyYW0gIHtBcnJheTwqPn0gICAgICAgICAgICBmaWx0ZXJzICAgICAgICBDYW4gaW5jbHVkZSBzdHJpbmdzIChsb29rdXBcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbCBpbiBzZWxLZXlXb3JkVG8zRE1vbFNlbCkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPciBhIDNETW9sanMgc2VsZWN0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSAge3N0cmluZ30gICAgICAgICAgICAgIHJlcE5hbWUgICAgICAgIFRoZSByZXByZXNlbnRhdGl2ZSBuYW1lLiBMaWtlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlN1cmZhY2VcIi5cbiAqIEBwYXJhbSAge3N0cmluZ30gICAgICAgICAgICAgIGNvbG9yU2NoZW1lICAgIFRoZSBuYW1lIG9mIHRoZSBjb2xvciBzY2hlbWUuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbnx1bmRlZmluZWR9ICBmaW5hbENhbGxiYWNrICBDYWxsYmFjayB0byBydW4gb25jZSB0aGUgbWVzaFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgZW50aXJlbHkgZG9uZS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZVJlcChmaWx0ZXJzOiBhbnlbXSwgcmVwTmFtZTogc3RyaW5nLCBjb2xvclNjaGVtZTogc3RyaW5nLCBmaW5hbENhbGxiYWNrOiBhbnkgPSB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICBpZiAoTGVjdHVyZXIuaXNMZWN0dXJlckJyb2FkY2FzdGluZykge1xuICAgICAgICAvLyBMZXQgdGhlIHN0dWRlbnQga25vdyBhYm91dCB0aGlzIGNoYW5nZS4uLlxuICAgICAgICBMZWN0dXJlci5zZW5kVG9nZ2xlUmVwQ29tbWFuZChmaWx0ZXJzLCByZXBOYW1lLCBjb2xvclNjaGVtZSk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBrZXkgb2YgdGhpcyByZXAgcmVxdWVzdC5cbiAgICAvKiogQHR5cGUge09iamVjdDxzdHJpbmcsKj59ICovXG4gICAgY29uc3Qga2V5cyA9IGdldEtleXMoZmlsdGVycywgcmVwTmFtZSwgY29sb3JTY2hlbWUpO1xuXG4gICAgaWYgKGZpbmFsQ2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBmaW5hbENhbGxiYWNrID0gKCkgPT4geyByZXR1cm47IH07XG4gICAgfVxuXG4gICAgLy8gSWYgaXQncyBcIkhpZGVcIiwgdGhlbiBqdXN0IGhpZGUgdGhlIG1lc2hcbiAgICBpZiAoY29sb3JTY2hlbWUgPT09IFwiSGlkZVwiKSB7XG4gICAgICAgIGNvbnN0IGZ1bGxLZXlzID0gT2JqZWN0LmtleXMoc3R5bGVNZXNoZXMpO1xuICAgICAgICBjb25zdCBsZW4gPSBmdWxsS2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxLZXkgPSBmdWxsS2V5c1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlTWVzaCA9IHN0eWxlTWVzaGVzW2Z1bGxLZXldO1xuICAgICAgICAgICAgaWYgKHN0eWxlTWVzaC5jYXRlZ29yeUtleSA9PT0ga2V5cy5jYXRlZ29yeUtleSkge1xuICAgICAgICAgICAgICAgIHN0eWxlTWVzaC5tZXNoLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSGlkaW5nIGV4aXN0aW5nIG1lc2guLi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGlsbCBuZWVkIHRvIHBvc2l0aW9uIHRoZSBtZXNoZXMgKGhpZGluZyBzb21lIHJlcHMgY291bGQgbWFrZVxuICAgICAgICAvLyBvdGhlcnMgYmlnZ2VyKS5cbiAgICAgICAgUG9zaXRpb25JblNjZW5lLnBvc2l0aW9uQWxsM0RNb2xNZXNoSW5zaWRlQW5vdGhlcihcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgVmFycy5zY2VuZS5nZXRNZXNoQnlOYW1lKFwicHJvdGVpbl9ib3hcIilcbiAgICAgICAgKTtcblxuICAgICAgICB2aXNDaGFuZ2VkKCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE1heWJlIHRoZSBtZXNoIGhhcyBiZWVuIGdlbmVyYXRlZCBwcmV2aW91c2x5LiBJZiBzbywganVzdCBzaG93IHRoYXQuXG4gICAgaWYgKHN0eWxlTWVzaGVzW2tleXMuZnVsbEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzdHlsZU1lc2hlc1trZXlzLmZ1bGxLZXldLm1lc2guaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzaG93aW5nIGV4aXN0aW5nIG1lc2guLi5cIik7XG5cbiAgICAgICAgLy8gU3RpbGwgbmVlZCB0byBwb3NpdGlvbiB0aGUgbWVzaGVzIChoaWRpbmcgc29tZSByZXBzIGNvdWxkIG1ha2VcbiAgICAgICAgLy8gb3RoZXJzIGJpZ2dlcikuXG4gICAgICAgIFBvc2l0aW9uSW5TY2VuZS5wb3NpdGlvbkFsbDNETW9sTWVzaEluc2lkZUFub3RoZXIoXG4gICAgICAgICAgICB1bmRlZmluZWQsIFZhcnMuc2NlbmUuZ2V0TWVzaEJ5TmFtZShcInByb3RlaW5fYm94XCIpXG4gICAgICAgICk7XG5cbiAgICAgICAgdmlzQ2hhbmdlZCgpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBZb3UnbGwgbmVlZCB0byB1c2UgM0RNb2xqcyB0byBnZW5lcmF0ZSB0aGUgbWVzaCwgc2luY2UgaXQncyBuZXZlciBiZWVuXG4gICAgLy8gZ2VuZXJhdGVkIGJlZm9yZS4gRmlyc3QgcmVtb3ZlIGFsbCByZXByZXNlbnRhdGlvbnMgZnJvbSBleGlzdGluZ1xuICAgIC8vIDNEbW9sanMuXG4gICAgVlJNTC5yZXNldEFsbCgpO1xuXG4gICAgLy8gTWFrZSB0aGUgbmV3IHJlcHJlc2VudGF0aW9uLlxuICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgIGNvbnN0IGNvbG9yU2NjaGVtZSA9IGNvbG9yU2NoZW1lS2V5V29yZFRvM0RNb2xbY29sb3JTY2hlbWVdO1xuICAgIGNvbnN0IHNlbHMgPSB7XCJhbmRcIjogZmlsdGVycy5tYXAoKGk6IG51bWJlcikgPT4ge1xuICAgICAgICAvLyBcImlcIiBjYW4gYmUgYSBrZXl3b3JkIG9yIGEgc2VsZWN0aW9uIGpzb24gaXRzZWxmLlxuICAgICAgICByZXR1cm4gKHNlbEtleVdvcmRUbzNETW9sU2VsW2ldICE9PSB1bmRlZmluZWQpID8gc2VsS2V5V29yZFRvM0RNb2xTZWxbaV0gOiBpO1xuICAgIH0pfTtcblxuICAgIGlmIChyZXBOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwic3VyZmFjZVwiKSB7XG4gICAgICAgIFZSTUwuYWRkU3VyZmFjZShjb2xvclNjY2hlbWUsIHNlbHMsICgpID0+IHtcbiAgICAgICAgICAgIHRvZ2dsZVJlcENvbnRpbnVlZChrZXlzLCByZXBOYW1lLCBmaW5hbENhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVwID0ge307XG4gICAgICAgIHJlcFtyZXBOYW1lLnRvTG93ZXJDYXNlKCldID0gY29sb3JTY2NoZW1lO1xuICAgICAgICBWUk1MLnNldFN0eWxlKHNlbHMsIHJlcCk7XG4gICAgICAgIHRvZ2dsZVJlcENvbnRpbnVlZChrZXlzLCByZXBOYW1lLCBmaW5hbENhbGxiYWNrKTtcbiAgICB9XG59XG5cbi8qKlxuICogQ29udGludWVzIHRoZSB0b2dnbGVSZXAgZnVuY3Rpb24uXG4gKiBAcGFyYW0gIHtPYmplY3Q8c3RyaW5nLCo+fSAgICBrZXlzXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICAgICAgICAgICAgICByZXBOYW1lICAgICAgICBUaGUgcmVwcmVzZW50YXRpdmUgbmFtZS4gTGlrZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTdXJmYWNlXCIuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbnx1bmRlZmluZWR9ICBmaW5hbENhbGxiYWNrICBDYWxsYmFjayB0byBydW4gb25jZSB0aGUgbWVzaFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgZW50aXJlbHkgZG9uZS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gdG9nZ2xlUmVwQ29udGludWVkKGtleXM6IGFueSwgcmVwTmFtZTogc3RyaW5nLCBmaW5hbENhbGxiYWNrOiBhbnkpOiB2b2lkIHtcbiAgICBWUk1MLnJlbmRlcih0cnVlLCByZXBOYW1lLCAobmV3TWVzaDogYW55KSA9PiB7XG4gICAgICAgIC8vIFJlbW92ZSBhbnkgb3RoZXIgbWVzaGVzIHRoYXQgaGF2ZSB0aGUgc2FtZSBjYXRlZ29yeSBrZXkgKHNvIGNvdWxkXG4gICAgICAgIC8vIGJlIGRpZmZlcmVudCBjb2xvci4uLiB0aGF0IHdvdWxkIGJlIHJlbW92ZWQuKVxuICAgICAgICBjb25zdCBrcyA9IE9iamVjdC5rZXlzKHN0eWxlTWVzaGVzKTtcbiAgICAgICAgY29uc3QgbGVuID0ga3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBrc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlTWVzaCA9IHN0eWxlTWVzaGVzW2tleV07XG4gICAgICAgICAgICBpZiAoc3R5bGVNZXNoLmNhdGVnb3J5S2V5ID09PSBrZXlzLmNhdGVnb3J5S2V5KSB7XG4gICAgICAgICAgICAgICAgT3B0aW1pemF0aW9ucy5yZW1vdmVNZXNoRW50aXJlbHkoc3R5bGVNZXNoLm1lc2gpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzdHlsZU1lc2hlc1trZXldO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVsZXRpbmcgb2xkIG1lc2guLi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3TWVzaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBuZXdNZXNoIGlzIHVuZGVmaW5lZCBpZiB5b3UgdHJpZWQgdG8gc2VsZWN0IHNvbWV0aGluZyBub3RcbiAgICAgICAgICAgIC8vIHByZXNlbnQgaW4gdGhlIHNjZW5lIChlLmcuLCB0cnlpbmcgdG8gc2VsZWN0IG51Y2xlaWMgd2hlbiB0aGVyZVxuICAgICAgICAgICAgLy8gaXMgbm8gbnVjbGVpYyBpbiB0aGUgbW9kZWwpLlxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgbmV3IG1lc2ggaXMgYSBzdXJmYWNlLCBtYWtlIGl0IHNvIGVhY2ggdHJpYW5nbGUgaXMgdHdvXG4gICAgICAgICAgICAvLyBzaWRlZCBhbmQgZGVsZXRlIHRoZSBzdXJmYWNlIGZyb20gM0Rtb2xqcyBpbnN0YW5jZSAoY2xlYW51cCkuXG4gICAgICAgICAgICBpZiAocmVwTmFtZSA9PT0gXCJTdXJmYWNlXCIpIHtcbiAgICAgICAgICAgICAgICBuZXdNZXNoLm1hdGVyaWFsLmJhY2tGYWNlQ3VsbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgdGhpcyBuZXcgb25lLlxuICAgICAgICAgICAgc3R5bGVNZXNoZXNba2V5cy5mdWxsS2V5XSA9IHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yeUtleToga2V5cy5jYXRlZ29yeUtleSxcbiAgICAgICAgICAgICAgICBtZXNoOiBuZXdNZXNoLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZpc0NoYW5nZWQoKTtcblxuICAgICAgICBmaW5hbENhbGxiYWNrKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJhZGRlZCBuZXcgbWVzaFwiKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBHZXQga2V5cyB0byB1bmlxdWVsdHkgZGVzY3JpYmUgYSBnaXZlbiByZXByZXNlbnRhdGlvbnMuXG4gKiBAcGFyYW0gIHtBcnJheTxzdHJpbmd8T2JqZWN0Pn0gZmlsdGVycyAgICAgIFNlbGVjdGlvbnMuIENhbiBiZSBrZXl3b3JkcyBvclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzZG1vbGpzIHNlbGVjdGlvbiBvYmplY3RzLlxuICogQHBhcmFtICB7c3RyaW5nfSAgICAgICAgICAgICAgIHJlcE5hbWUgICAgICBUaGUgbmFtZSBvZiB0aGUgcmVwcmVzZW50YXRpb24sXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuZy4sIFwiQ2FydG9vblwiLlxuICogQHBhcmFtICB7c3RyaW5nfSAgICAgICAgICAgICAgIGNvbG9yU2NoZW1lICBUaGUgY29sb3Igc3R5bGUga2V5d29yZC5cbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCo+fVxuICovXG5mdW5jdGlvbiBnZXRLZXlzKGZpbHRlcnM6IHN0cmluZ1tdLCByZXBOYW1lOiBzdHJpbmcsIGNvbG9yU2NoZW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGZpbHRlcnMuc29ydCgpO1xuICAgIGNvbnN0IGZpbHRlcnNTdHIgPSBmaWx0ZXJzLm1hcCgoZjogYW55KSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZik7XG4gICAgICAgIH1cbiAgICB9KTsgIC8vIEluIGNhc2Ugc29tZSBKU09OIHNlbGVjdGlvbnMuXG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjYXRlZ29yeUtleTogZmlsdGVyc1N0ci5qb2luKFwiLS1cIikgKyBcIi0tXCIgKyByZXBOYW1lLFxuICAgICAgICBmdWxsS2V5OiBmaWx0ZXJzU3RyLmpvaW4oXCItLVwiKSArIFwiLS1cIiArIHJlcE5hbWUgKyBcIi0tXCIgKyBjb2xvclNjaGVtZSxcbiAgICB9O1xufVxuXG4vKipcbiAqIEFsc28gYWRkcyB1cHBlciBhbmQgbG93ZXIgdmVyc2lvbnMgb2YgZWxlbWVudHMgaW4gYSBsaXN0LlxuICogQHBhcmFtICB7QXJyYXk8c3RyaW5nPn0gbHN0ICBUaGUgb3JpZ2luYWwgbGlzdC5cbiAqIEByZXR1cm5zIHtBcnJheTxzdHJpbmc+fSAgVGhlIGxpc3Qgd2l0aCB1cHBlcmNhc2UgYW5kIGxvd2VyY2FzZSBpdGVtcyBhbHNvIGFkZGVkLlxuICovXG5mdW5jdGlvbiBsQW5kVShsc3Q6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xuICAgIGxldCBuZXdMc3QgPSBsc3QubWFwKChzKSA9PiBzKTtcbiAgICBjb25zdCBsZW4gPSBsc3QubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgcyA9IGxzdFtpXTtcbiAgICAgICAgbmV3THN0LnB1c2gocy50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgbmV3THN0LnB1c2gocy50b0xvd2VyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICAvLyBTZWUgaHR0cHM6Ly9nb21ha2V0aGluZ3MuY29tL3JlbW92aW5nLWR1cGxpY2F0ZXMtZnJvbS1hbi1hcnJheS13aXRoLXZhbmlsbGEtamF2YXNjcmlwdC9cbiAgICBuZXdMc3QgPSBuZXdMc3QuZmlsdGVyKChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ld0xzdC5pbmRleE9mKGl0ZW0pID49IGluZGV4O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ld0xzdDtcbn1cblxuLyoqXG4gKiBUaGlzIHJ1bnMgd2hlbmV2ZXIgYSB2aXN1YWxpemF0aW9uIGNoYW5nZXMsIG5vIG1hdHRlciBob3cgaXQgY2hhbmdlcy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gdmlzQ2hhbmdlZCgpOiB2b2lkIHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBVUkxcbiAgICAgICAgVXJsVmFycy5zZXRVUkwoKTtcblxuICAgICAgICAvLyBSZWNhbGN1bGF0ZSB0aGUgcGFzdC1zdHlsZXMgc2VjdGlvbiBvZiB0aGUgbWVudS5cbiAgICAgICAgU3R5bGVzLnVwZGF0ZVBhc3RTdHlsZXNJbk1lbnUoTWVudTNELm1lbnVJbmYpO1xufVxuIiwiaW1wb3J0ICogYXMgUGlja2FibGVzIGZyb20gXCIuLi8uLi9OYXZpZ2F0aW9uL1BpY2thYmxlc1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBNZW51M0QgZnJvbSBcIi4vTWVudTNEXCI7XG5cbmRlY2xhcmUgdmFyIEJBQllMT046IGFueTtcblxuY29uc3QgYnRuU2NhbGUgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAuNzUsIDAuNzUsIDAuNzUpO1xuXG5pbnRlcmZhY2UgSUJ1dHRvbldyYXBwZXIge1xuICAgIHBhbmVsOiBhbnk7XG4gICAgdHJ1ZVR4dDogc3RyaW5nO1xuICAgIGZhbHNlVHh0OiBzdHJpbmc7XG4gICAgZGVmYXVsdDogYm9vbGVhbjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgY2xpY2tGdW5jOiBhbnk7XG4gICAgaW5pdEZ1bmM/OiBhbnk7XG4gICAgbGV2ZWw6IG51bWJlcjtcbiAgICBjb2xvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEJ1dHRvbldyYXBwZXIge1xuICAgIC8qKiBAdHlwZSB7RnVuY3Rpb259ICovXG4gICAgcHVibGljIGNsaWNrRnVuYzogYW55O1xuXG4gICAgcHVibGljIGJ1dHRvbjogYW55O1xuXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgcHVibGljIGxldmVsOiBudW1iZXI7XG5cbiAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgcHVibGljIHZhbHVlOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSB0ZXh0QmxvY2s6IGFueTtcblxuICAgIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAgIHByaXZhdGUgdHJ1ZVR4dDogc3RyaW5nO1xuXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgcHJpdmF0ZSBmYWxzZVR4dDogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBjb250YWluaW5nTWVzaDogYW55O1xuICAgIHByaXZhdGUgZGVmYXVsdE1hdDogYW55O1xuICAgIHByaXZhdGUgZ3JlZW5NYXQ6IGFueTtcbiAgICBwcml2YXRlIHllbGxvd01hdDogYW55O1xuICAgIHByaXZhdGUgcmVkTWF0OiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29uc3RydWN0b3IuXG4gICAgICogQHBhcmFtICB7T2JqZWN0PHN0cmluZywqPn0gcGFyYW1zXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocGFyYW1zOiBJQnV0dG9uV3JhcHBlcikge1xuICAgICAgICAvLyBNYWtlIHRoZSBidXR0b25cbiAgICAgICAgdGhpcy5idXR0b24gPSBuZXcgQkFCWUxPTi5HVUkuSG9sb2dyYXBoaWNCdXR0b24ocGFyYW1zLm5hbWUpO1xuICAgICAgICBwYXJhbXMucGFuZWwuYWRkQ29udHJvbCh0aGlzLmJ1dHRvbik7XG5cbiAgICAgICAgLy8gTWFrZSB0aGUgcG9zc2libGUgbWF0ZXJpYWxzIChkaWZmZXJlbnQgY29sb3JzKS5cbiAgICAgICAgdGhpcy5tYWtlQ29sb3JNYXRzKCk7XG5cbiAgICAgICAgLy8gQ2hhbmdlIGJ1dHRvbiBjb2xvciBpZiBhcHByb3ByaWF0ZS5cbiAgICAgICAgaWYgKHBhcmFtcy5jb2xvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUNvbG9yKHBhcmFtcy5jb2xvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIHRoZSBsZXZlbC5cbiAgICAgICAgdGhpcy5sZXZlbCA9IHBhcmFtcy5sZXZlbDtcblxuICAgICAgICAvLyBNYWtlIGEgdGV4dCBibG9ja1xuICAgICAgICB0aGlzLnRleHRCbG9jayA9IG5ldyBCQUJZTE9OLkdVSS5UZXh0QmxvY2soKTtcbiAgICAgICAgdGhpcy50ZXh0QmxvY2suY29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgIHRoaXMudGV4dEJsb2NrLnJlc2l6ZVRvRml0ID0gdHJ1ZTtcblxuICAgICAgICAvLyBTYXZlIHRoZSB2YWx1ZSBhbmQgdGV4dCwgZXRjLlxuICAgICAgICB0aGlzLnZhbHVlID0gcGFyYW1zLmRlZmF1bHQ7XG4gICAgICAgIHRoaXMudHJ1ZVR4dCA9IHBhcmFtcy50cnVlVHh0O1xuICAgICAgICB0aGlzLmZhbHNlVHh0ID0gcGFyYW1zLmZhbHNlVHh0O1xuICAgICAgICB0aGlzLmNsaWNrRnVuYyA9IHBhcmFtcy5jbGlja0Z1bmM7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSB0ZXh0LlxuICAgICAgICB0aGlzLnVwZGF0ZVR4dCgpO1xuXG4gICAgICAgIHRoaXMuYnV0dG9uLnNjYWxpbmcgPSBidG5TY2FsZS5jbG9uZSgpO1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIGJ1dHRvbiBjbGlja2FibGUuIE5vLiBJdCBpcyB0aGUgc3BoZXJlIHRoYXQgd2lsbCB0cmlnZ2VyXG4gICAgICAgIC8vIHRoaXMuLi4gU28gY29tbWVudGVkIG91dC5cbiAgICAgICAgLy8gdGhpcy5idXR0b24ub25Qb2ludGVyQ2xpY2tPYnNlcnZhYmxlLmFkZCgoZSkgPT4ge1xuICAgICAgICAgICAgLy8gdGhpcy50b2dnbGVkKCk7XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIC8vIE1ha2UgYSBtZXNoIHRoYXQgc3Vycm91bmRzIHRoZSBidXR0b24uIEl0IGFjdHVhbGx5IHRyaWdnZXJzIHRoZVxuICAgICAgICAvLyBjbGljay5cbiAgICAgICAgdGhpcy5jb250YWluaW5nTWVzaCA9IEJBQllMT04uTWVzaC5DcmVhdGVTcGhlcmUoXG4gICAgICAgICAgICBwYXJhbXMubmFtZSArIFwiLWNvbnRhaW5lci1tZXNoXCIsIDIsIFZhcnMuQlVUVE9OX1NQSEVSRV9SQURJVVMsIFZhcnMuc2NlbmUsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuY29udGFpbmluZ01lc2gucG9zaXRpb24gPSB0aGlzLmJ1dHRvbi5ub2RlLmFic29sdXRlUG9zaXRpb247XG4gICAgICAgIHRoaXMuY29udGFpbmluZ01lc2gudmlzaWJpbGl0eSA9IDA7XG4gICAgICAgIHRoaXMuY29udGFpbmluZ01lc2guc2NhbGluZyA9IGJ0blNjYWxlLmNsb25lKCk7XG5cbiAgICAgICAgLy8gQWRkIGEgY2xpY2tpbmcgZnVuY3Rpb24gdG8gdGhlIG1lc2guXG4gICAgICAgIHRoaXMuY29udGFpbmluZ01lc2guY2xpY2tGdW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVkKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQWRkIHRoZSBtZXNoIHRvIHRoZSBsaXN0IG9mIG9uZXMgdGhhdCBhcmUgcGlja2FibGUuXG4gICAgICAgIFBpY2thYmxlcy5hZGRQaWNrYWJsZUJ1dHRvbih0aGlzLmNvbnRhaW5pbmdNZXNoKTtcblxuICAgICAgICBpZiAocGFyYW1zLmluaXRGdW5jICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHBhcmFtcy5pbml0RnVuYyh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGJ1dHRvbiBjb2xvci5cbiAgICAgKiBAcGFyYW0gY29sb3Igc3RyaW5nXG4gICAgICovXG4gICAgcHVibGljIHVwZGF0ZUNvbG9yKGNvbG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoIChjb2xvcikge1xuICAgICAgICAgICAgY2FzZSBcImRlZmF1bHRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5tZXNoLm1hdGVyaWFsID0gdGhpcy5kZWZhdWx0TWF0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6ICAvLyBBbHNvIGRlZmF1bHRcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5tZXNoLm1hdGVyaWFsID0gdGhpcy5kZWZhdWx0TWF0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImdyZWVuXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ubWVzaC5tYXRlcmlhbCA9IHRoaXMuZ3JlZW5NYXQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwieWVsbG93XCI6XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ubWVzaC5tYXRlcmlhbCA9IHRoaXMueWVsbG93TWF0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInJlZFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLm1lc2gubWF0ZXJpYWwgPSB0aGlzLnJlZE1hdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoaXMgYnV0dG9uIGlzIHZpc2libGUuXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gW3ZhbD1dIFdoZXRoZXIgdGhpcyBidXR0b24gaXMgdmlzaWJsZS5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgcHVibGljIGlzVmlzaWJsZSh2YWw/OiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gQSBnZXR0ZXJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbi5pc1Zpc2libGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBIHNldHRlci4gTm90ZSB0aGF0IHRoaXMgZG9lc24ndCBhZmZlY3QgdmlzaWJpbGl0eSBvbiBtZXNoZXNcbiAgICAgICAgICAgIC8vICh0aGV5IGNvdWxkIGJlIGVudGlyZWx5IHRyYW5zcGFyZW50KS5cbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLmlzVmlzaWJsZSA9IHZhbDtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmluZ01lc2guaXNWaXNpYmxlID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIHdoZXRoZXIgdGhpcyBidXR0b24gaXMgdmlzaWJsZS5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgcHVibGljIHRvZ2dsZWQoKTogdm9pZCB7XG4gICAgICAgIC8vIFBsYXkgdGhlIHNvdW5kLlxuICAgICAgICBNZW51M0QuY2xpY2tTb3VuZC5zZXRQb3NpdGlvbih0aGlzLmNvbnRhaW5pbmdNZXNoLnBvc2l0aW9uLmNsb25lKCkpO1xuICAgICAgICBNZW51M0QuY2xpY2tTb3VuZC5wbGF5KCk7XG5cbiAgICAgICAgLy8gU3dpdGNoIHZhbHVlLlxuICAgICAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICAgICAgIHRoaXMudmFsdWUgPSAhdGhpcy52YWx1ZTtcblxuICAgICAgICAvLyBGaXJlIHRoZSB1c2VyLWRlZmluZWQgdHJpZ2dlci5cbiAgICAgICAgdGhpcy5jbGlja0Z1bmModGhpcyk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSB0ZXh0LlxuICAgICAgICB0aGlzLnVwZGF0ZVR4dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRleHQgb24gdGhpcyBidXR0b24uXG4gICAgICogQHBhcmFtIHtzdHJpbmc9fSB0eHQgIFRoZSB0ZXh0IHRvIHVwZGF0ZS4gSWYgdW5kZWZpbmVkLCBnZXRzIGl0IGJhc2VkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgIG9uIHRoZSB2YWx1ZSwgdHJ1ZVR4dCwgYW5kIGZhbHNlVHh0IHZhcmlhYmxlcy5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgcHVibGljIHVwZGF0ZVR4dCh0eHQ/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHR4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnRleHRCbG9jay50ZXh0ID0gdGhpcy52YWx1ZSA/IHRoaXMudHJ1ZVR4dCA6IHRoaXMuZmFsc2VUeHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRleHRCbG9jay50ZXh0ID0gdHh0O1xuICAgICAgICAgICAgdGhpcy50cnVlVHh0ID0gdHh0O1xuICAgICAgICAgICAgdGhpcy5mYWxzZVR4dCA9IHR4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGV4dEJsb2NrLnRleHQgPSB0aGlzLndyYXAodGhpcy50ZXh0QmxvY2sudGV4dCwgMjUpO1xuXG4gICAgICAgIHRoaXMuYnV0dG9uLmNvbnRlbnQuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLmJ1dHRvbi5jb250ZW50ID0gdGhpcy50ZXh0QmxvY2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JhcCB0aGUgdGV4dCB0byBrZWVwIGl0IGZyb20gZ2V0dGluZyB0b28gbG9uZy5cbiAgICAgKiBAcGFyYW0ge3N0aXJuZ30gcyAgVGhlIHN0cmluZyB0byB3cmFwLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3ICBUaGUgd2lkdGguXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHdyYXBwZWQgdGV4dC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHdyYXAoczogc3RyaW5nLCB3OiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKFxuICAgICAgICAgICAgbmV3IFJlZ0V4cChgKD8hW15cXFxcbl17MSwke3d9fSQpKFteXFxcXG5dezEsJHt3fX0pXFxcXHNgLCBcImdcIiksIFwiJDFcXG5cIixcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlIHZhcmlvdXNseSBjb2xvcmVkIG1hdGVyaWFscyBmb3IgdGhlIGRpZmZlcmVudCBraW5kcyBvZiBtZW51XG4gICAgICogYnV0dG9ucy5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgcHJpdmF0ZSBtYWtlQ29sb3JNYXRzKCk6IHZvaWQge1xuICAgICAgICAvKiogQGNvbnN0IHtudW1iZXJ9ICovXG4gICAgICAgIGNvbnN0IGNvbG9yRGVsdGEgPSAwLjE7XG5cbiAgICAgICAgdGhpcy5kZWZhdWx0TWF0ID0gdGhpcy5idXR0b24ubWVzaC5tYXRlcmlhbDtcblxuICAgICAgICB0aGlzLmdyZWVuTWF0ID0gdGhpcy5idXR0b24ubWVzaC5tYXRlcmlhbC5jbG9uZSgpO1xuICAgICAgICB0aGlzLmdyZWVuTWF0LmFsYmVkb0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuMywgMC4zNSArIGNvbG9yRGVsdGEsIDAuNCk7XG5cbiAgICAgICAgdGhpcy55ZWxsb3dNYXQgPSB0aGlzLmJ1dHRvbi5tZXNoLm1hdGVyaWFsLmNsb25lKCk7XG4gICAgICAgIHRoaXMueWVsbG93TWF0LmFsYmVkb0NvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAuMyArIGNvbG9yRGVsdGEsIDAuMzUgKyBjb2xvckRlbHRhLCAwLjQpO1xuXG4gICAgICAgIHRoaXMucmVkTWF0ID0gdGhpcy5idXR0b24ubWVzaC5tYXRlcmlhbC5jbG9uZSgpO1xuICAgICAgICB0aGlzLnJlZE1hdC5hbGJlZG9Db2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLjMgKyBjb2xvckRlbHRhLCAwLjM1LCAwLjQpO1xuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImNmNGJkNDNjZDhkYWRlNGI2MmY3ZTY5MWY1ZDBmOGNjLm1wM1wiOyIsIi8vIEFuIG1vZHVsZSB0byBtYW5hZ2UgVlJNTCBkYXRhIG9idGFpbmVkIGZyb20gM0Rtb2wuanMuIEFzc3VtZXMgdGhlIDNEbW9sLmpzXG4vLyBqYXZhc2NyaXB0IGZpbGUgaXMgYWxyZWFkeSBsb2FkZWQuXG5cbmltcG9ydCAqIGFzIFVybFZhcnMgZnJvbSBcIi4uLy4uL1ZhcnMvVXJsVmFyc1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBMb2FkIGZyb20gXCIuLi9Mb2FkXCI7XG5pbXBvcnQgKiBhcyBQb3NpdGlvbkluU2NlbmUgZnJvbSBcIi4vUG9zaXRpb25JblNjZW5lXCI7XG5pbXBvcnQgKiBhcyBPcGVuUG9wdXAgZnJvbSBcIi4uLy4uL1VJL09wZW5Qb3B1cC9PcGVuUG9wdXBcIjtcblxuZGVjbGFyZSB2YXIgJDNEbW9sO1xuXG5kZWNsYXJlIHZhciBCQUJZTE9OOiBhbnk7XG5kZWNsYXJlIHZhciBqUXVlcnk6IGFueTtcblxuZXhwb3J0IGludGVyZmFjZSBJVlJNTE1vZGVsIHtcbiAgICBjb29yczogYW55OyAgLy8gRmxvYXQzMkFycmF5XG4gICAgY29sb3JzOiBhbnk7ICAvLyBGbG9hdDMyQXJyYXlcbiAgICB0cmlzSWR4czogYW55OyAgLy8gVWludDMyQXJyYXlcbn1cblxuLyoqIEB0eXBlIHtBcnJheTxPYmplY3Q8c3RyaW5nLCo+Pn0gKi9cbmxldCBtb2RlbERhdGE6IElWUk1MTW9kZWxbXSA9IFtdO1xuXG5leHBvcnQgbGV0IG1vbFJvdGF0aW9uOiBhbnkgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAsIDApO1xuXG5leHBvcnQgbGV0IHZpZXdlcjogYW55O1xubGV0IGVsZW1lbnQ6IGFueTtcblxuLyoqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLHN0cmluZz59ICovXG5sZXQgY29uZmlnOiBhbnk7XG5cbi8qKiBAdHlwZSB7c3RyaW5nfSAqL1xubGV0IHZybWxTdHI6IHN0cmluZztcblxuY29uc3QgdnJtbFBhcnNlcldlYldvcmtlciA9IG5ldyBXb3JrZXIoXCJ2cm1sV2ViV29ya2VyLmpzXCIpO1xuXG5sZXQgbW9sVHh0ID0gXCJcIjtcbmxldCBtb2xUeHRUeXBlID0gXCJwZGJcIjtcbmxldCBoYXNBY3RpdmVTdXJmYWNlID0gZmFsc2U7XG5cbi8qKlxuICogU2V0dXAgdGhlIGFiaWxpdHkgdG8gd29yayB3aXRoIDNEbW9sLmpzLlxuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxCYWNrICBSdW5zIG9uY2UgdGhlIGlmcmFtZSBpcyBsb2FkZWQgaXMgbG9hZGVkLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoY2FsbEJhY2s6IGFueSk6IHZvaWQge1xuICAgIC8vIERlYWN0aXZhdGUgM0Rtb2wuanMgdHJhY2tpbmcuIFRoaXMgaXMgbm93IGRvbmUgdmlhIG1hbnVhbCBtb2RpZmljYXRpb25zXG4gICAgLy8gdG8gdGhlIHZlbmRvci5qcyBjb2RlIGl0c2VsZi5cbiAgICAvLyAkM0Rtb2xbXCJub3RyYWNrXCJdID0gdHJ1ZTtcblxuICAgIC8vIEFkZCBhIGNvbnRhaW5lciBmb3IgM2Rtb2xqcy5cbiAgICBhZGREaXYoKTtcblxuICAgIC8vIE1ha2UgdGhlIHZpZXdlciBvYmplY3QuXG4gICAgZWxlbWVudCA9IGpRdWVyeShcIiNtb2wtY29udGFpbmVyXCIpO1xuICAgIGNvbmZpZyA9IHsgYmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCIgfTtcbiAgICB2aWV3ZXIgPSAkM0Rtb2wuY3JlYXRlVmlld2VyKCBlbGVtZW50LCBjb25maWcgKTtcbiAgICB3aW5kb3dbXCJ2aWV3ZXJcIl0gPSB2aWV3ZXI7ICAvLyBGb3IgZGVidWdnaW5nLlxuXG4gICAgY2FsbEJhY2soKTtcbn1cblxuLyoqXG4gKiBBZGQgKG9yIHJlYWRkKSBkaXYgM0RNb2xqcyBkaXYuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGFkZERpdigpOiB2b2lkIHtcbiAgICBjb25zdCBtb2xDb250YWluZXIgPSBqUXVlcnkoXCIjbW9sLWNvbnRhaW5lclwiKTtcbiAgICBpZiAobW9sQ29udGFpbmVyKSB7XG4gICAgICAgIG1vbENvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBleHRyYVN0eWxlID0gXCJkaXNwbGF5Om5vbmU7XCI7XG4gICAgalF1ZXJ5KFwiYm9keVwiKS5hcHBlbmQoYDxkaXZcbiAgICAgICAgaWQ9XCJtb2wtY29udGFpbmVyXCJcbiAgICAgICAgY2xhc3M9XCJtb2wtY29udGFpbmVyXCJcbiAgICAgICAgc3R5bGU9XCIke2V4dHJhU3R5bGV9XCI+PC9kaXY+YCk7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSAzRG1vbC5qcyB2aXN1YWxpemF0aW9uLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRBbGwoKTogdm9pZCB7XG4gICAgaWYgKGhhc0FjdGl2ZVN1cmZhY2UpIHtcbiAgICAgICAgaGFzQWN0aXZlU3VyZmFjZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEkgY2FuJ3QgZ2V0IHJpZCBvZiB0aGUgc3VyZmFjZXMgd2l0aG91dCBjYXVzaW5nXG4gICAgICAgIC8vIHByb2JsZW1zLiBJJ20ganVzdCBnb2luZyB0byBnbyBudWNsZWFyIGFuZCByZWxvYWQgdGhlXG4gICAgICAgIC8vIHdob2xlIHRoaW5nLlxuICAgICAgICB2aWV3ZXIgPSBudWxsO1xuICAgICAgICBzZXR1cCgoKSA9PiB7XG4gICAgICAgICAgICB2aWV3ZXIuYWRkTW9kZWwobW9sVHh0LCBcInBkYlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmlld2VyLnNldFN0eWxlKHt9LCB7fSk7XG59XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byB0aGUgM2Rtb2wgb2JqZWN0LlxuICogQHBhcmFtICB7c3RyaW5nfSAgIHVybCAgICAgICBUaGUgdXJsLlxuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxCYWNrICBBIGNhbGxiYWNrIGZ1bmN0aW9uLiBUaGUgM0RNb2xqcyBtb2xlY3VsZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QgaXMgdGhlIHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQREJVUkwodXJsOiBzdHJpbmcsIGNhbGxCYWNrOiBhbnkpOiB2b2lkIHtcbiAgICBqUXVlcnkuYWpheCggdXJsLCB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gdGhlIHVybCBkYXRhIGlzIHJldHJpZXZlZC5cbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSBkYXRhICBUaGUgcmVtb3RlIGRhdGEuXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIFwic3VjY2Vzc1wiOiAoZGF0YTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgICAgICAvLyBTZXR1cCB0aGUgdmlzdWFsaXphdGlvblxuICAgICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgICAgICBtb2xUeHQgPSBkYXRhOyAgLy8gSW4gY2FzZSB5b3UgbmVlZCB0byByZXN0YXJ0LlxuICAgICAgICAgICAgbW9sVHh0VHlwZSA9IFwicGRiXCI7XG5cbiAgICAgICAgICAgIGlmICh1cmwuc2xpY2UodXJsLmxlbmd0aCAtIDMpLnRvTG93ZXJDYXNlKCkgPT09IFwic2RmXCIpIHtcbiAgICAgICAgICAgICAgICBtb2xUeHRUeXBlID0gXCJzZGZcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWRsID0gdmlld2VyLmFkZE1vZGVsKGRhdGEsIG1vbFR4dFR5cGUpO1xuXG4gICAgICAgICAgICBjYWxsQmFjayhtZGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0aGVyZSdzIGFuIGVycm9yLi4uXG4gICAgICAgICAqIEBwYXJhbSAgeyp9ICAgICAgIGhkclxuICAgICAgICAgKiBAcGFyYW0gIHsqfSAgICAgICBzdGF0dXNcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSAgZXJyXG4gICAgICAgICAqL1xuICAgICAgICBcImVycm9yXCI6IChoZHI6IGFueSwgc3RhdHVzOiBhbnksIGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgbXNnID0gXCI8cD5Db3VsZCBub3QgbG9hZCBtb2xlY3VsZTogXCIgKyB1cmwgKyBcIjwvcD5cIjtcbiAgICAgICAgICAgIG1zZyArPSBcIjxwPjxwcmU+XCIgKyBlcnIgKyBcIjwvcHJlPjwvcD5cIjtcbiAgICAgICAgICAgIG1zZyArPSAnPHA+KDxhIGhyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoXCI/XCIpWzBdICsgJ1wiPkNsaWNrIHRvIHJlc3RhcnQuLi48L2E+KTwvcD4nO1xuICAgICAgICAgICAgT3BlblBvcHVwLm9wZW5Nb2RhbChcIkVycm9yIExvYWRpbmcgTW9sZWN1bGVcIiwgbXNnLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFNldCB0aGUgc3R5bGUgb24gdGhlIDNETW9sanMgdmlld2VyLlxuICogQHBhcmFtICB7T2JqZWN0PHN0cmluZywqPn0gc2VscyAgQSBzZWxlY3Rpb24gb2JqZWN0LlxuICogQHBhcmFtICB7T2JqZWN0PHN0cmluZywqPn0gcmVwICAgQSByZXByZXNlbnRhdGlvbiBvYmplY3QuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdHlsZShzZWxzOiBhbnksIHJlcDogYW55KTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIHNlbGVjdGlvbiBsb29rcyBsaWtlIHtcImFuZFwiOlt7fSwgey4uLn1dfSwgc2ltcGxpZnkgaXQuXG4gICAgaWYgKChzZWxzW1wiYW5kXCJdICE9PSB1bmRlZmluZWQpICYmICAgICAgICAgICAgICAgIC8vIFwiYW5kXCIgaXMgYSBrZXlcbiAgICAgICAgKE9iamVjdC5rZXlzKHNlbHMpLmxlbmd0aCA9PT0gMSkgJiYgICAgICAgICAgIC8vIGl0IGlzIHRoZSBvbmx5IGtleVxuICAgICAgICAoSlNPTi5zdHJpbmdpZnkoc2Vsc1tcImFuZFwiXVswXSkgPT09IFwie31cIikgJiYgIC8vIGl0IHBvaW50cyB0byBhIGxpc3Qgd2l0aCB7fSBhcyBmaXJzdCBpdGVtLlxuICAgICAgICAoc2Vsc1tcImFuZFwiXS5sZW5ndGggPT09IDIpKSB7ICAgICAgICAgICAgICAgICAvLyB0aGF0IGxpc3QgaGFzIG9ubHkgdG8gZWxlbWVudHNcblxuICAgICAgICBzZWxzID0gc2Vsc1tcImFuZFwiXVsxXTtcbiAgICB9XG5cbiAgICB2aWV3ZXIuc2V0U3R5bGUoc2VscywgcmVwKTtcbiAgICB2aWV3ZXIucmVuZGVyKCk7XG59XG5cbi8qKlxuICogQWRkIGEgc3VyZmFjZSB0byB0aGUgM0RNb2xqcyB2aWV3ZXIuXG4gKiBAcGFyYW0gIHtPYmplY3Q8c3RyaW5nLCo+fSBjb2xvclNjaGVtZSAgQSBjb2xvcnNjaGVtZSBvYmplY3QuXG4gKiBAcGFyYW0gIHtPYmplY3Q8c3RyaW5nLCo+fSBzZWxzICAgICAgICAgQSBzZWxlY3Rpb24gb2JqZWN0LlxuICogQHBhcmFtICB7RnVuY3Rpb259ICAgICAgICAgY2FsbEJhY2sgICAgIEEgY2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRTdXJmYWNlKGNvbG9yU2NoZW1lOiBhbnksIHNlbHM6IGFueSwgY2FsbEJhY2s6IGFueSk6IHZvaWQge1xuICAgIGhhc0FjdGl2ZVN1cmZhY2UgPSB0cnVlO1xuICAgIHZpZXdlci5hZGRTdXJmYWNlKFxuICAgICAgICAkM0Rtb2wuU3VyZmFjZVR5cGUuTVMsXG4gICAgICAgIGNvbG9yU2NoZW1lLFxuICAgICAgICBzZWxzLFxuICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgY2FsbEJhY2soKTtcbiAgICAgICAgfSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIDNkbW9sLmpzIHN0eWxlLiBBbHNvIGdlbmVyYXRlcyBhIHZybWwgc3RyaW5nIGFuZCB2YWx1ZXMuXG4gKiBAcGFyYW0gIHtib29sZWFufSAgICB1cGRhdGVEYXRhICBXaGV0aGVyIHRvIHVwZGF0ZSB0aGUgdW5kZXJseWluZyBkYXRhIHdpdGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgdmlzdWFsaXphdGlvbi4gVHJ1ZSBieSBkZWZhdWx0LlxuICogQHBhcmFtICB7c3RyaW5nfSAgICAgcmVwTmFtZSAgICAgVGhlIHJlcHJlc2VudGF0aXZlIG5hbWUuIExpa2UgXCJTdXJmYWNlXCIuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbj19ICBjYWxsQmFjayAgICBUaGUgY2FsbGJhY2sgZnVuY3Rpb24sIHdpdGggdGhlIG5ldyBtZXNoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBhIHBhcmFtZXRlci5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcih1cGRhdGVEYXRhOiBib29sZWFuLCByZXBOYW1lOiBzdHJpbmcsIGNhbGxCYWNrOiBhbnkgPSAoKSA9PiB7IHJldHVybjsgfSk6IHZvaWQge1xuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gd2FpdGluZyBtZW51cyB1cCBhbmQgcnVubmluZy4gSGFwcGVucyBzb21lXG4gICAgLy8gdGltZXMuXG4gICAgVmFycy5lbmdpbmUuaGlkZUxvYWRpbmdVSSgpO1xuXG4gICAgaWYgKHVwZGF0ZURhdGEpIHtcbiAgICAgICAgLy8gTG9hZCB0aGUgZGF0YS5cbiAgICAgICAgbG9hZFZSTUxGcm9tM0RNb2woKCkgPT4ge1xuICAgICAgICAgICAgbG9hZFZhbHNGcm9tVlJNTChyZXBOYW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgbW9kaWZ5IGNvb3JkaW5hdGVzIGJlZm9yZSBpbXBvcnRpbmcgaW50byBiYWJ5bG9uXG4gICAgICAgICAgICAgICAgLy8gc2NlbmUsIHNvIGNvbW1lbnQgb3V0IGJlbG93LiBDaGFuZ2VkIG15IG1pbmQgdGhlIGtpbmRzIG9mXG4gICAgICAgICAgICAgICAgLy8gbWFuaXB1bGF0aW9ucyBhYm92ZSBzaG91bGQgYmUgcGVyZm9ybWVkIG9uIHRoZSBtZXNoLlxuICAgICAgICAgICAgICAgIC8vIEJhYnlsb24gaXMgZ29pbmcgdG8gaGF2ZSBiZXR0ZXIgZnVuY3Rpb25zIGZvciB0aGlzIHRoYW4gSVxuICAgICAgICAgICAgICAgIC8vIGNhbiBjb21lIHVwIHdpdGguXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3TWVzaCA9IGltcG9ydEludG9CYWJ5bG9uU2NlbmUoKTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXdNZXNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSXQncyB1bmRlZmluZWQgaWYsIGZvciBleGFtcGxlLCB0cnlpbmcgdG8gZG8gY2FydG9vbiBvblxuICAgICAgICAgICAgICAgICAgICAvLyBsaWdhbmQuXG4gICAgICAgICAgICAgICAgICAgIFBvc2l0aW9uSW5TY2VuZS5wb3NpdGlvbkFsbDNETW9sTWVzaEluc2lkZUFub3RoZXIobmV3TWVzaCwgVmFycy5zY2VuZS5nZXRNZXNoQnlOYW1lKFwicHJvdGVpbl9ib3hcIikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNhbGxCYWNrKG5ld01lc2gpOyAgLy8gQ2xvbmVkIHNvIGl0IHdvbid0IGNoYW5nZSB3aXRoIG5ldyByZXAgaW4gZnV0dXJlLlxuXG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAuXG4gICAgICAgICAgICAgICAgbW9kZWxEYXRhID0gW107XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIExvYWRzIHRoZSBWUk1MIHN0cmluZyBmcm9tIHRoZSAzRG1vbCBpbnN0YW5jZS5cbiAqIEBwYXJhbSAge0Z1bmN0aW9uPX0gIGNhbGxCYWNrICAgIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gbG9hZFZSTUxGcm9tM0RNb2woY2FsbEJhY2s6IGFueSk6IHZvaWQge1xuICAgIC8vIE1ha2UgdGhlIFZSTUwgc3RyaW5nIGZyb20gdGhhdCBtb2RlbC5cbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICB2cm1sU3RyID0gdmlld2VyLmV4cG9ydFZSTUwoKTtcbiAgICBjYWxsQmFjaygpO1xufVxuXG4vKipcbiAqIExvYWQgaW4gdmFsdWVzIGxpa2UgY29vcmRpbmF0ZXMgYW5kIGNvbG9ycyBmcm9tIHRoZSBWUk1MIHN0cmluZy5cbiAqIEBwYXJhbSAge3N0cmluZ30gICAgcmVwTmFtZSAgIFRoZSByZXByZXNlbnRhdGl2ZSBuYW1lLiBMaWtlIFwiU3VyZmFjZVwiLlxuICogQHBhcmFtICB7RnVuY3Rpb259ICBjYWxsQmFjayAgQSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gbG9hZFZhbHNGcm9tVlJNTChyZXBOYW1lOiBzdHJpbmcsIGNhbGxCYWNrOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBDbGVhciBwcmV2aW91cyBtb2RlbCBkYXRhLlxuICAgIG1vZGVsRGF0YSA9IFtdO1xuXG4gICAgaWYgKHR5cGVvZihXb3JrZXIpICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHZybWxQYXJzZXJXZWJXb3JrZXIub25tZXNzYWdlID0gKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIE1zZyBiYWNrIGZyb20gd2ViIHdvcmtlclxuICAgICAgICAgICAgLyoqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLCo+fSAqL1xuICAgICAgICAgICAgY29uc3QgcmVzcCA9IGV2ZW50LmRhdGE7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rID0gcmVzcFtcImNodW5rXCJdO1xuXG4gICAgICAgICAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHJlc3BbXCJzdGF0dXNcIl07XG5cbiAgICAgICAgICAgIGlmIChjaHVuayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgICAgICAgICAgY29uc3QgbW9kZWxJZHg6IG51bWJlciA9IGNodW5rWzBdO1xuXG4gICAgICAgICAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YVR5cGUgPSBjaHVua1sxXTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHMgPSBjaHVua1syXTtcblxuICAgICAgICAgICAgICAgIGlmIChtb2RlbERhdGEubGVuZ3RoID09PSBtb2RlbElkeCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RlbERhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvb3JzXCI6IG5ldyBGbG9hdDMyQXJyYXkoMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBcImNvbG9yc1wiOiBuZXcgRmxvYXQzMkFycmF5KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmlzSWR4c1wiOiBuZXcgVWludDMyQXJyYXkoMCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1vZGVsRGF0YVttb2RlbElkeF1bZGF0YVR5cGVdID0gdHlwZWRBcnJheUNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGUgPT09IFwidHJpc0lkeHNcIiA/IFVpbnQzMkFycmF5IDogRmxvYXQzMkFycmF5LFxuICAgICAgICAgICAgICAgICAgICBbbW9kZWxEYXRhW21vZGVsSWR4XVtkYXRhVHlwZV0sIHZhbHNdLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm1vcmVcIjpcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlcmUncyBtb3JlIGRhdGEuIFJlcXVlc3QgaXQgbm93LlxuICAgICAgICAgICAgICAgICAgICB2cm1sUGFyc2VyV2ViV29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY21kXCI6IFwic2VuZERhdGFDaHVua1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhXCI6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJkb25lXCI6XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG1vcmUgZGF0YS4gUnVuIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBoZXJlIVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gd2ViIHdvcmtlci5cbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgIHZybWxQYXJzZXJXZWJXb3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgXCJjbWRcIjogXCJzdGFydFwiLFxuICAgICAgICAgICAgXCJkYXRhXCI6IHZybWxTdHIsXG4gICAgICAgICAgICBcInJlbW92ZUV4dHJhUHRzXCI6IChyZXBOYW1lID09PSBcIlN0aWNrXCIpLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTb3JyeSEgTm8gV2ViIFdvcmtlciBzdXBwb3J0Li5cbiAgICAgICAgT3BlblBvcHVwLm9wZW5Nb2RhbChcbiAgICAgICAgICAgIFwiQnJvd3NlciBFcnJvclwiLFxuICAgICAgICAgICAgYFlvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHdlYiB3b3JrZXJzLiBQbGVhc2UgdXNlIGEgbW9yZVxuICAgICAgICAgICAgbW9kZXJuIGJyb3dzZXIgd2hlbiBydW5uaW5nIFByb3RlaW5WUi5gLFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHdlYiB3b3JrZXJzLlwiKTtcblxuICAgICAgICAvLyBDb21tZW50IGJlbG93IGlmIHlvdSBldmVyIHdhbnQgdG8gdHJ5IHRvIG1ha2UgaXQgd29yayB3aXRob3V0IHdlYlxuICAgICAgICAvLyB3b3JrZXJzLi4uXG4gICAgICAgIC8vIG1vZGVsRGF0YSA9IFZSTUxQYXJzZXJXZWJXb3JrZXIubG9hZFZhbHNGcm9tVlJNTCh2cm1sU3RyKTtcbiAgICAgICAgLy8gY2FsbEJhY2soKTtcbiAgICB9XG59XG5cbi8qKlxuICogQ29uY2F0b25hdGVzIGEgbGlzdCBvZiB0eXBlZCBhcnJheXMuXG4gKiBAcGFyYW0gIHsqfSAgICAgICAgcmVzdWx0Q29uc3RydWN0b3IgIFRoZSB0eXBlIG9mIGFycmF5LiBFLmcuLCBVaW50OEFycmF5LlxuICogQHBhcmFtICB7QXJyYXk8Kj59IGxpc3RPZkFycmF5cyAgICAgICBBIGxpc3Qgb2YgdHlwZWQgYXJyYXlzIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmNhdG9uYXRlLlxuICogQHJldHVybnMgeyp9IFRoZSB0eXBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gdHlwZWRBcnJheUNvbmNhdChyZXN1bHRDb25zdHJ1Y3RvcjogYW55LCBsaXN0T2ZBcnJheXM6IGFueVtdKTogYW55IHtcbiAgICAvLyBTZWUgaHR0cDovLzJhbGl0eS5jb20vMjAxNS8xMC9jb25jYXRlbmF0aW5nLXR5cGVkLWFycmF5cy5odG1sXG4gICAgbGV0IHRvdGFsTGVuZ3RoID0gMDtcblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGxpc3RPZkFycmF5c0xlbiA9IGxpc3RPZkFycmF5cy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0T2ZBcnJheXNMZW47IGkrKykge1xuICAgICAgICAvKiogQHR5cGUge0FycmF5PCo+fSAqL1xuICAgICAgICBjb25zdCBhcnIgPSBsaXN0T2ZBcnJheXNbaV07XG4gICAgICAgIHRvdGFsTGVuZ3RoICs9IGFyci5sZW5ndGg7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IHJlc3VsdENvbnN0cnVjdG9yKHRvdGFsTGVuZ3RoKTtcbiAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3RPZkFycmF5c0xlbjsgaSsrKSB7XG4gICAgICAgIC8qKiBAdHlwZSB7QXJyYXk8Kj59ICovXG4gICAgICAgIGNvbnN0IGFyciA9IGxpc3RPZkFycmF5c1tpXTtcbiAgICAgICAgcmVzdWx0LnNldChhcnIsIG9mZnNldCk7XG4gICAgICAgIG9mZnNldCArPSBhcnIubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBiYWJ5bG9uanMgb2JqZWN0IGZyb20gdGhlIHZhbHVlcyBhbmQgYWRkcyBpdCB0byB0aGUgYmFieWxvbmpzXG4gKiBzY2VuZS5cbiAqIEByZXR1cm5zIHsqfSBUaGUgbmV3IG1lc2ggZnJvbSB0aGUgM2Rtb2xqcyBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGltcG9ydEludG9CYWJ5bG9uU2NlbmUoKTogYW55IHtcbiAgICAvLyBUaGUgbWF0ZXJpYWwgdG8gYWRkIHRvIGFsbCBtZXNoZXMuXG4gICAgY29uc3QgbWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbChcIk1hdGVyaWFsXCIsIFZhcnMuc2NlbmUpO1xuICAgIG1hdC5kaWZmdXNlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMSk7XG4gICAgbWF0LmVtaXNzaXZlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XG4gICAgbWF0LnNwZWN1bGFyQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XG5cbiAgICBjb25zdCBtZXNoZXMgPSBbXTtcblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGxlbiA9IG1vZGVsRGF0YS5sZW5ndGg7XG5cbiAgICBmb3IgKGxldCBtb2RlbElkeCA9IDA7IG1vZGVsSWR4IDwgbGVuOyBtb2RlbElkeCsrKSB7XG4gICAgICAgIGNvbnN0IG1vZGVsRGF0dW0gPSBtb2RlbERhdGFbbW9kZWxJZHhdO1xuXG4gICAgICAgIC8vIENhbGN1bGF0ZSBub3JtYWxzIGluc3RlYWQ/IEl0J3Mgbm90IG5lY2Vzc2FyeS4gRG9lc24ndCBjaGFuZyBvdmVyXG4gICAgICAgIC8vIDNkbW9sanMgY2FsY3VsYXRlZCBub3JtYWxzLlxuICAgICAgICBjb25zdCBub3JtczogYW55W10gPSBbXTtcbiAgICAgICAgQkFCWUxPTi5WZXJ0ZXhEYXRhLkNvbXB1dGVOb3JtYWxzKFxuICAgICAgICAgICAgbW9kZWxEYXR1bVtcImNvb3JzXCJdLCBtb2RlbERhdHVtW1widHJpc0lkeHNcIl0sIG5vcm1zLFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIENvbXBpbGUgYWxsIHRoYXQgaW50byB2ZXJ0ZXggZGF0YS5cbiAgICAgICAgY29uc3QgdmVydGV4RGF0YSA9IG5ldyBCQUJZTE9OLlZlcnRleERhdGEoKTtcbiAgICAgICAgdmVydGV4RGF0YVtcInBvc2l0aW9uc1wiXSA9IG1vZGVsRGF0dW1bXCJjb29yc1wiXTsgIC8vIEluIHF1b3RlcyBiZWNhdXNlIGZyb20gd2Vid29ya2VyIChleHRlcm5hbClcbiAgICAgICAgdmVydGV4RGF0YVtcImluZGljZXNcIl0gPSBtb2RlbERhdHVtW1widHJpc0lkeHNcIl07XG4gICAgICAgIHZlcnRleERhdGFbXCJub3JtYWxzXCJdID0gbm9ybXM7XG4gICAgICAgIHZlcnRleERhdGFbXCJjb2xvcnNcIl0gPSBtb2RlbERhdHVtW1wiY29sb3JzXCJdO1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIG5ldyBtZXNoXG4gICAgICAgIGNvbnN0IGJhYnlsb25NZXNoVG1wID0gbmV3IEJBQllMT04uTWVzaChcIm1lc2hfM2Rtb2xfdG1wXCIgKyBtb2RlbElkeCwgVmFycy5zY2VuZSk7XG4gICAgICAgIHZlcnRleERhdGEuYXBwbHlUb01lc2goYmFieWxvbk1lc2hUbXApO1xuXG4gICAgICAgIC8vIEFkZCBhIG1hdGVyaWFsLlxuICAgICAgICBiYWJ5bG9uTWVzaFRtcC5tYXRlcmlhbCA9IG1hdDtcbiAgICAgICAgLy8gYmFieWxvbk1lc2hUbXAuc2hvd0JvdW5kaW5nQm94ID0gdHJ1ZTtcblxuICAgICAgICBtZXNoZXMucHVzaChiYWJ5bG9uTWVzaFRtcCk7XG4gICAgfVxuXG4gICAgbGV0IGJhYnlsb25NZXNoO1xuICAgIGlmIChtZXNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBNZXJnZSBhbGwgdGhlc2UgbWVzaGVzLlxuICAgICAgICAvLyBodHRwczovL2RvYy5iYWJ5bG9uanMuY29tL2hvd190by9ob3dfdG9fbWVyZ2VfbWVzaGVzXG4gICAgICAgIGJhYnlsb25NZXNoID0gQkFCWUxPTi5NZXNoLk1lcmdlTWVzaGVzKG1lc2hlcywgdHJ1ZSwgdHJ1ZSk7ICAvLyBkaXNwb3NlIG9mIHNvdXJjZSBhbmQgYWxsb3cgMzIgYml0IGludGVnZXJzLlxuICAgICAgICAvLyBiYWJ5bG9uTWVzaCA9IG1lc2hlc1swXTtcbiAgICAgICAgYmFieWxvbk1lc2gubmFtZSA9IFwiTWVzaEZyb20zRE1vbFwiICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygpO1xuICAgICAgICBiYWJ5bG9uTWVzaC5pZCA9IGJhYnlsb25NZXNoLm5hbWU7XG5cbiAgICAgICAgLy8gV29yayBoZXJlXG4gICAgICAgIExvYWQuc2V0dXBNZXNoKGJhYnlsb25NZXNoLCAxMjM0NTY3ODkpO1xuICAgIH1cblxuICAgIHJldHVybiBiYWJ5bG9uTWVzaDtcbn1cblxuLyoqXG4gKiBSb3RhdGUgdGhlIG1vbGVjdWxhciBtZXNoZXMuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGF4aXMgICAgVGhlIGF4aXMuIFwieFwiLCBcInlcIiwgb3IgXCJ6XCIuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGFtb3VudCAgVGhlIGFtb3VudC4gSW4gcmFkaWFucywgSSB0aGluay5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZU1vbFJvdGF0aW9uKGF4aXM6IHN0cmluZywgYW1vdW50OiBudW1iZXIpOiB2b2lkIHtcbiAgICBtb2xSb3RhdGlvbltheGlzXSArPSBhbW91bnQ7XG5cbiAgICAvLyBVcGRhdGUgVVJMIHRvby5cbiAgICBVcmxWYXJzLnNldFVSTCgpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1vbFJvdGF0aW9uIG9iamVjdCBleHRlcm5hbGx5LiBEb2VzIG5vdCBhY3R1YWxseSByb3RhdGUgYW55dGhpbmcuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHggIFJvdGF0aW9uIGFib3V0IHggYXhpcy5cbiAqIEBwYXJhbSAge251bWJlcn0geSAgUm90YXRpb24gYWJvdXQgeSBheGlzLlxuICogQHBhcmFtICB7bnVtYmVyfSB6ICBSb3RhdGlvbiBhYm91dCB6IGF4aXMuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRNb2xSb3RhdGlvbih4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogdm9pZCB7XG4gICAgbW9sUm90YXRpb24gPSBuZXcgQkFCWUxPTi5WZWN0b3IzKHgsIHksIHopO1xufVxuIiwiaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5cbmxldCBpbnRlcnZhbElEOiBhbnk7XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgaW5pdGlhbCBsb2FkaW5nIHNjcmVlbiwgdG8gbGV0IHRoZSB1c2VyIGtub3cgdGhhdCB0aGUgaW5pdGlhbFxuICogamF2YXNjcmlwdCBmaWxlIGlzIGxvYWRpbmcuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVMb2FkaW5nSmF2YXNjcmlwdFNjcmVlbigpOiB2b2lkIHtcbiAgICAvLyBSZW1vdmUgdGhlIGluaXRpYWwgbG9hZGluZyBqYXZhc2NyaXB0IHNjcmVlbiAobm90IHRoZSBiYWJ5bG9uanMgbG9hZGluZ1xuICAgIC8vIHNjcmVlbi4uLiBUaGF0J3MgdG8gY29tZSkuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nQ29udGFpbmVyXCIpLm91dGVySFRNTCA9IFwiXCI7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSB0ZXh0IGRpc3BsYXllZCBvbiB0aGUgYmFieWxvbmpzIGxvYWRpbmcgc2NlbmUuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IG1zZyAgVGhlIHRleHQgdG8gdXBkYXRlLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFieWxvbkpTTG9hZGluZ01zZyhtc2c6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIEp1c3QgdG8gbWFrZSBzdXJlIHRoZXJlIGlzbid0IGEgZmlnaHQgYmV0d2VlbiB0aGUgdHdvIHdheXMgb2Ygc2hvd2luZ1xuICAgIC8vIGJhYnlsb25qcyBsb2FkaW5nIG1lc3NhZ2VzLlxuICAgIHN0b3BGYWtlTG9hZGluZygpO1xuXG4gICAgVmFycy5lbmdpbmUuZGlzcGxheUxvYWRpbmdVSSgpOyAgLy8gS2VlcCBpdCB1cCB3aGlsZSBwcm9ncmVzc2luZy4uLlxuICAgIFZhcnMuZW5naW5lLmxvYWRpbmdVSVRleHQgPSBtc2c7XG59XG5cbi8qKlxuICogU3RhcnRzIHRoZSBmYWtlIGxvYWRpbmcgc2NyZWVuLCB0byBnaXZlIHRoZSBpbXByZXNzaW9uIHRoYXQgdGhpbmdzIGFyZVxuICogbG9hZGluZy5cbiAqIEBwYXJhbSAge251bWJlcn0gaW5pdGlhbFZhbCAgVGhlIGluaXRpYWwgZmFrZSB2YWx1ZSAoJSkuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEZha2VMb2FkaW5nKGluaXRpYWxWYWw6IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBmYWtlVmFsID0gaW5pdGlhbFZhbDtcbiAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpO1xuICAgIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGZha2VWYWwgPSBmYWtlVmFsICsgMC4wMiAqICg5OSAtIGZha2VWYWwpO1xuICAgICAgICBWYXJzLmVuZ2luZS5kaXNwbGF5TG9hZGluZ1VJKCk7ICAvLyBLZWVwIGl0IHVwIHdoaWxlIHByb2dyZXNzaW5nLi4uXG4gICAgICAgIFZhcnMuZW5naW5lLmxvYWRpbmdVSVRleHQgPSBcIkxvYWRpbmcgdGhlIG1haW4gc2NlbmUuLi4gXCIgKyBmYWtlVmFsLnRvRml4ZWQoMCkgKyBcIiVcIjtcbiAgICB9LCAxMDApO1xufVxuXG4vKipcbiAqIFN0b3AgdGhlIGZha2UtbG9hZGluZyBzcGxhc2ggc2NyZWVuLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcEZha2VMb2FkaW5nKCk6IHZvaWQge1xuICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRCk7XG59XG4iLCIvLyBUaGlzIG1vZHVsZSBpbmNsdWRlcyBmdW5jdGlvbnMgdG8gbWFuYWdlIHdoaWNoIG1lc2hlcyBpbiB0aGUgc2NlbmUgYXJlXG4vLyBwaWNrYWJsZS5cblxuaW1wb3J0ICogYXMgQ29tbW9uQ2FtZXJhIGZyb20gXCIuLi9DYW1lcmFzL0NvbW1vbkNhbWVyYVwiO1xuaW1wb3J0ICogYXMgT3B0aW1pemF0aW9ucyBmcm9tIFwiLi4vU2NlbmUvT3B0aW1pemF0aW9uc1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBOYXZpZ2F0aW9uIGZyb20gXCIuL05hdmlnYXRpb25cIjtcblxuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG5jb25zdCBwaWNrYWJsZU1lc2hlczogYW55W10gPSBbXTtcbmNvbnN0IHBpY2thYmxlQnV0dG9uczogYW55W10gPSBbXTtcbmNvbnN0IHBpY2thYmxlTW9sZWN1bGVzOiBhbnlbXSA9IFtdO1xuXG4vLyBBIHNwaGVyZSBwbGFjZWQgYXJvdW5kIHRoZSBjYW1lcmEgdG8gYWlkIG5hdmlnYXRpb24uXG5leHBvcnQgbGV0IHBhZE5hdlNwaGVyZUFyb3VuZENhbWVyYTogYW55O1xuXG5leHBvcnQgY29uc3QgZW51bSBQaWNrYWJsZUNhdGVnb3J5IHtcbiAgICAvLyBOb3RlOiBjb25zdCBlbnVtIG5lZWRlZCBmb3IgY2xvc3VyZS1jb21waWxlciBjb21wYXRpYmlsaXR5LlxuICAgIE5vbmUgPSAxLFxuICAgIEdyb3VuZCA9IDIsXG4gICAgQnV0dG9uID0gMyxcbiAgICBNb2xlY3VsZSA9IDQsXG4gICAgcGFkTmF2U3BoZXJlQXJvdW5kQ2FtZXJhID0gNSxcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50bHkgcGlja2VkIG1lc2guXG4gKiBAcGFyYW0gIHsqfSBtZXNoIFRoZSBtZXNoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VyUGlja2VkTWVzaChtZXNoOiBhbnkpIHsgY3VyUGlja2VkTWVzaCA9IG1lc2g7IH1cbmV4cG9ydCBsZXQgY3VyUGlja2VkTWVzaDogYW55O1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIHBpY2thYmxlcy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIHBpY2thYmxlTWVzaGVzLnB1c2goVmFycy52clZhcnMuZ3JvdW5kTWVzaCk7XG59XG5cbi8qKlxuICogQWRkcyBhIG1lc2ggdG8gdGhlIGxpc3Qgb2YgcGlja2FibGUgYnV0dG9ucy5cbiAqIEBwYXJhbSAgeyp9IG1lc2ggVGhlIG1lc2guXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRQaWNrYWJsZUJ1dHRvbihtZXNoOiBhbnkpOiB2b2lkIHtcbiAgICBwaWNrYWJsZU1lc2hlcy5wdXNoKG1lc2gpO1xuICAgIHBpY2thYmxlQnV0dG9ucy5wdXNoKG1lc2gpO1xuICAgIE9wdGltaXphdGlvbnMub3B0aW1pemVNZXNoUGlja2luZyhtZXNoKTtcbiAgICBtYWtlTWVzaE1vdXNlQ2xpY2thYmxlKHtcbiAgICAgICAgbWVzaCxcbiAgICAgICAgY2FsbEJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgIC8vIEhlcmUgY2xpY2sgdGhlIGJ1dHRvbiByYXRoZXIgdGhhbiBhY3Rpbmcgb24gdGhlIHN0YXJlIHBvaW50XG4gICAgICAgICAgICAvLyAoZGVmYXVsdCkuXG4gICAgICAgICAgICBtZXNoLmNsaWNrRnVuYygpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG4vKipcbiAqIEFkZHMgYSBtZXNoIHRvIHRoZSBsaXN0IG9mIHBpY2thYmxlIG1vbGVjdWxlIG1lc2hlcy5cbiAqIEBwYXJhbSAgeyp9IG1lc2ggVGhlIG1lc2guXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRQaWNrYWJsZU1vbGVjdWxlKG1lc2g6IGFueSk6IHZvaWQge1xuICAgIHBpY2thYmxlTWVzaGVzLnB1c2gobWVzaCk7XG4gICAgcGlja2FibGVNb2xlY3VsZXMucHVzaChtZXNoKTtcbiAgICBPcHRpbWl6YXRpb25zLm9wdGltaXplTWVzaFBpY2tpbmcobWVzaCk7XG4gICAgbWFrZU1lc2hNb3VzZUNsaWNrYWJsZSh7bWVzaH0pO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgYSBnaXZlbiBtZXNoIGlzIHBpY2thYmxlLlxuICogQHBhcmFtICB7Kn0gbWVzaCBUaGUgbWVzaC5cbiAqIEByZXR1cm5zIGJvb2xlYW4gVHJ1ZSBpZiBpdCBpcyBwaWNrYWJsZS4gRmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tJZk1lc2hQaWNrYWJsZShtZXNoOiBhbnkpOiBib29sZWFuIHtcbiAgICAvLyBGbG9vciBpcyBhbHdheXMgcGlja2FibGUsIGV2ZW4gaWYgbm90IHZpc2libGUuXG4gICAgaWYgKG1lc2guaWQgPT09IFZhcnMudnJWYXJzLmdyb3VuZE1lc2guaWQpIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIC8vIElmIG5vdCB2aXNpYmxlLCB0aGVuIG5vdCBwaWNrYWJsZS4gTm90ZSB0aGF0IHNvbWV0aGluZyBjb3VsZCBiZVxuICAgIC8vIGVudGlyZWx5IHRyYW5zcGFyZW50ICh2aXNpYmlsaXR5IGlzIDApLCBidXQgaXQgd2lsbCBzdGlsbCBpbnRlcmNlcHQgdGhlXG4gICAgLy8gc3RhcmUgcG9pbnQuIFRoaXMgaXMgYnkgZGVzaWduLlxuICAgIGlmICghbWVzaC5pc1Zpc2libGUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAvLyBPdGhlcndpc2UsIHBpY2sgb25seSBpZiBpbiB0aGUgbGlzdC5cbiAgICByZXR1cm4gcGlja2FibGVNZXNoZXMuaW5kZXhPZihtZXNoKSAhPT0gLTE7XG59XG5cbi8qKlxuICogR2V0IHRoZSBjYXRlZ29yeSBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIG1lc2guXG4gKiBAcmV0dXJucyBudW1iZXIgVGhlIGNhdGVnb3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2F0ZWdvcnlPZkN1ck1lc2goKTogUGlja2FibGVDYXRlZ29yeSB7XG4gICAgaWYgKGN1clBpY2tlZE1lc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gUGlja2FibGVDYXRlZ29yeS5Ob25lO1xuICAgIH0gZWxzZSBpZiAoY3VyUGlja2VkTWVzaCA9PT0gVmFycy52clZhcnMuZ3JvdW5kTWVzaCkge1xuICAgICAgICByZXR1cm4gUGlja2FibGVDYXRlZ29yeS5Hcm91bmQ7XG4gICAgfSBlbHNlIGlmIChwaWNrYWJsZUJ1dHRvbnMuaW5kZXhPZihjdXJQaWNrZWRNZXNoKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIFBpY2thYmxlQ2F0ZWdvcnkuQnV0dG9uO1xuICAgIH0gZWxzZSBpZiAocGlja2FibGVNb2xlY3VsZXMuaW5kZXhPZihjdXJQaWNrZWRNZXNoKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIFBpY2thYmxlQ2F0ZWdvcnkuTW9sZWN1bGU7XG4gICAgfSBlbHNlIGlmIChjdXJQaWNrZWRNZXNoID09PSBwYWROYXZTcGhlcmVBcm91bmRDYW1lcmEpIHtcbiAgICAgICAgcmV0dXJuIFBpY2thYmxlQ2F0ZWdvcnkucGFkTmF2U3BoZXJlQXJvdW5kQ2FtZXJhO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQaWNrYWJsZUNhdGVnb3J5Lk5vbmU7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSU1ha2VNZXNoQ2xpY2thYmxlUGFyYW1zIHtcbiAgICBtZXNoOiBhbnk7XG4gICAgY2FsbEJhY2s/OiBhbnk7XG4gICAgc2NlbmU/OiBhbnk7XG59XG5cbi8qKlxuICogTWFrZSBpdCBzbyBhIGdpdmVuIG1lc2ggY2FuIGJlIGNsaWNrZWQgd2l0aCB0aGUgbW91c2UuXG4gKiBAcGFyYW0gIHtPYmplY3Q8c3RyaW5nLCo+fSBwYXJhbXMgVGhlIHBhcmFtZXRlcnMuIFNlZSBpbnRlcmZhY2UgYWJvdmUuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlTWVzaE1vdXNlQ2xpY2thYmxlKHBhcmFtczogSU1ha2VNZXNoQ2xpY2thYmxlUGFyYW1zKTogdm9pZCB7XG4gICAgaWYgKHBhcmFtcy5jYWxsQmFjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcmFtcy5jYWxsQmFjayA9IE5hdmlnYXRpb24uYWN0T25TdGFyZVRyaWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5zY2VuZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcmFtcy5zY2VuZSA9IFZhcnMuc2NlbmU7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5tZXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBhcmFtcy5tZXNoLmFjdGlvbk1hbmFnZXIgPSBuZXcgQkFCWUxPTi5BY3Rpb25NYW5hZ2VyKHBhcmFtcy5zY2VuZSk7XG4gICAgcGFyYW1zLm1lc2guYWN0aW9uTWFuYWdlci5yZWdpc3RlckFjdGlvbihcbiAgICAgICAgbmV3IEJBQllMT04uRXhlY3V0ZUNvZGVBY3Rpb24oXG4gICAgICAgICAgICBCQUJZTE9OLkFjdGlvbk1hbmFnZXIuT25QaWNrVHJpZ2dlcixcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpdCdzIGluIFZSIG1vZGUsIHRoZXJlIGFyZSBubyBtb3VzZSBjbGlja3MuIFRoaXMgaXNcbiAgICAgICAgICAgICAgICAvLyBpbXBvcnRhbnQgdG8gcHJldmVudCBhIGRvdWJsZSBjbGljayB3aXRoIGNvbnRyb2xsZXJzLlxuICAgICAgICAgICAgICAgIGlmIChWYXJzLnZyVmFycy5uYXZNb2RlICE9PSBOYXZpZ2F0aW9uLk5hdk1vZGUuTm9WUikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGFyYW1zLmNhbGxCYWNrKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICApLFxuICAgICk7XG59XG5cbi8qKlxuICogUGxhY2VzIGEgY3ViZSBhcm91bmQgdGhlIGNhbm1lcmEgc28geW91IGNhbiBuYXZlZ2F0ZSBldmVuIHdoZW4gbm90IHBvaW50aW5nXG4gKiBhdCBhIG1vbGVjdWxlIG9yIGFueXRoaW5nLiBHb29kIGZvciBwYWQtYmFzZWQgbmF2aWdhdGlvbiwgYnV0IG5vdFxuICogdGVsZXBvcnRhdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQYWROYXZpZ2F0aW9uU3BoZXJlQXJvdW5kQ2FtZXJhKCk6IHZvaWQge1xuICAgIHBhZE5hdlNwaGVyZUFyb3VuZENhbWVyYSA9IEJBQllMT04uTWVzaC5DcmVhdGVTcGhlcmUoXG4gICAgICAgIFwicGFkTmF2U3BoZXJlQXJvdW5kQ2FtZXJhXCIsXG4gICAgICAgIDQsIFZhcnMuTUFYX1RFTEVQT1JUX0RJU1QgLSAxLjAsIFZhcnMuc2NlbmUsXG4gICAgKTtcbiAgICBwYWROYXZTcGhlcmVBcm91bmRDYW1lcmEuZmxpcEZhY2VzKHRydWUpO1xuXG4gICAgY29uc3QgbWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbChcInBhZE5hdlNwaGVyZUFyb3VuZENhbWVyYU1hdFwiLCBWYXJzLnNjZW5lKTtcbiAgICBtYXQuZGlmZnVzZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpO1xuICAgIG1hdC5zcGVjdWxhckNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xuICAgIG1hdC5vcGFjaXR5VGV4dHVyZSA9IG51bGw7XG4gICAgcGFkTmF2U3BoZXJlQXJvdW5kQ2FtZXJhLm1hdGVyaWFsID0gbWF0O1xuXG4gICAgcGFkTmF2U3BoZXJlQXJvdW5kQ2FtZXJhLnZpc2liaWxpdHkgPSAwLjA7ICAvLyBJdCdzIGFuIGludmlzaWJsZSBzcGhlcmUuXG5cbiAgICAvLyBEb2luZyBpdCB0aGlzIHdheSBzbyBmb2xsb3dzIGNhbWVyYSBldmVuIGlmIGNhbWVyYSBjaGFuZ2VzLlxuICAgIFZhcnMuc2NlbmUucmVnaXN0ZXJCZWZvcmVSZW5kZXIoKCkgPT4ge1xuICAgICAgICBwYWROYXZTcGhlcmVBcm91bmRDYW1lcmEucG9zaXRpb24gPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKTtcbiAgICB9KTtcblxuICAgIC8vIEl0IG5lZWRzIHRvIGJlIHBpY2thYmxlXG4gICAgcGlja2FibGVNZXNoZXMucHVzaChwYWROYXZTcGhlcmVBcm91bmRDYW1lcmEpO1xuXG4gICAgLy8gUHJldGVuZCBsaWtlIGl0J3MgYSBtb2xlY3VsZS4gVGVsZXBvcnRhdGlvbiB3aWxsIGJlIGRpc2FibGVkIGVsc2V3aGVyZS5cbiAgICAvLyBhZGRQaWNrYWJsZU1vbGVjdWxlKHBhZE5hdlNwaGVyZUFyb3VuZENhbWVyYSk7XG59XG4iLCJpbXBvcnQgKiBhcyBPcHRpbWl6YXRpb25zIGZyb20gXCIuLi8uLi9TY2VuZS9PcHRpbWl6YXRpb25zXCI7XG5pbXBvcnQgKiBhcyBWYXJzIGZyb20gXCIuLi8uLi9WYXJzL1ZhcnNcIjtcbmltcG9ydCAqIGFzIFZpc1N0eWxlcyBmcm9tIFwiLi9WaXNTdHlsZXNcIjtcbmltcG9ydCAqIGFzIFZSTUwgZnJvbSBcIi4vVlJNTFwiO1xuXG5kZWNsYXJlIHZhciBCQUJZTE9OOiBhbnk7XG5cbmV4cG9ydCBsZXQgbGFzdFJvdGF0aW9uQmVmb3JlQW5pbWF0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKTtcbmxldCBsYXN0Um90YXRpb25WZWM6IGFueSA9IHVuZGVmaW5lZDtcbmNvbnN0IGNhY2hlZERlbHRhWXMgPSB7fTtcblxuLyoqXG4gKiBQb3NpdGlvbnMgYSBnaXZlbiBtb2xlY3VsYXIgbWVzaCB3aXRoaW4gYSBzcGVjaWZpZWQgYm94LlxuICogQHBhcmFtICB7Kn0gICAgICAgICBiYWJ5bG9uTWVzaCAgICAgICBUaGUgbW9sZWN1bGFyIG1lc2guXG4gKiBAcGFyYW0gIHsqfSAgICAgICAgIG90aGVyQmFieWxvbk1lc2ggIFRoZSBib3guXG4gKiBAcGFyYW0gIHtib29sZWFuPX0gIGFuaW1hdGUgICAgICAgICAgIFdoZXRoZXIgdG8gYW5pbWF0ZSB0aGUgbWVzaCwgdG8gbW92ZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdCB0byB0aGUgbmV3IHBvc2l0aW9uLiBEZWZhdWx0cyB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvc2l0aW9uQWxsM0RNb2xNZXNoSW5zaWRlQW5vdGhlcihiYWJ5bG9uTWVzaDogYW55LCBvdGhlckJhYnlsb25NZXNoOiBhbnksIGFuaW1hdGUgPSBmYWxzZSk6IHZvaWQge1xuICAgIC8qKiBAdHlwZSB7QXJyYXk8Kj59ICovXG4gICAgY29uc3QgYWxsVmlzTW9sTWVzaGVzID0gZ2V0VmlzaWJsZU1vbE1lc2hlcyhiYWJ5bG9uTWVzaCk7XG5cbiAgICAvLyBTYXZlIGFsbCBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9mIHRoZSB2aXNpYmxlIG1lc2hlcywgZm9yIGxhdGVyXG4gICAgLy8gYW5pbWF0aW9uLlxuICAgIGlmIChsYXN0Um90YXRpb25WZWMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBsYXN0Um90YXRpb25WZWMgPSBWUk1MLm1vbFJvdGF0aW9uLmNsb25lKCk7XG4gICAgfVxuICAgIGNvbnN0IGFsbFZpc01vbE1lc2hlc0luZm8gPSBhbGxWaXNNb2xNZXNoZXMubWFwKChtOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1lc2g6IG0sXG4gICAgICAgICAgICBwb3NpdGlvbjogbS5wb3NpdGlvbi5jbG9uZSgpLFxuICAgICAgICAgICAgcm90YXRpb246IGxhc3RSb3RhdGlvblZlYy5jbG9uZSgpLFxuICAgICAgICAgICAgc2NhbGluZzogbS5zY2FsaW5nLmNsb25lKCksXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgbGFzdFJvdGF0aW9uVmVjID0gVlJNTC5tb2xSb3RhdGlvbi5jbG9uZSgpO1xuXG4gICAgaWYgKGFsbFZpc01vbE1lc2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gbWVzaGVzIHRvIHNob3cuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXNldE1lc2hlcyhhbGxWaXNNb2xNZXNoZXMpO1xuXG4gICAgLy8gUmVuZGVyIHRvIHVwZGF0ZSB0aGUgbWVzaGVzXG4gICAgVmFycy5zY2VuZS5yZW5kZXIoKTsgIC8vIE5lZWRlZCB0byBnZXQgYm91bmRpbmcgYm94IHRvIHJlY2FsY3VsYXRlLlxuXG4gICAgLy8gR2V0IHRoZSBib3VuZGluZyBib3ggb2YgdGhlIG90aGVyIG1lc2ggYW5kIGl0J3MgZGltZW5zaW9uc1xuICAgIC8vIChwcm90ZWluX2JveCkuXG4gICAgY29uc3QgdGFyZ2V0Qm94ID0gb3RoZXJCYWJ5bG9uTWVzaC5nZXRCb3VuZGluZ0luZm8oKS5ib3VuZGluZ0JveDtcbiAgICBjb25zdCB0YXJnZXRCb3hEaW1lbnMgPSBPYmplY3Qua2V5cyh0YXJnZXRCb3gubWF4aW11bVdvcmxkKS5tYXAoXG4gICAgICAgIChrKSA9PiB0YXJnZXRCb3gubWF4aW11bVdvcmxkW2tdIC0gdGFyZ2V0Qm94Lm1pbmltdW1Xb3JsZFtrXSxcbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSBtb2xlY3VsYXIgbW9kZWwgd2l0aCB0aGUgYmlnZ2VzdCB2b2x1bWUuXG4gICAgbGV0IG1heFZvbCA9IDAuMDtcbiAgICBsZXQgdGhpc0JveDtcblxuICAgIC8qKiBAdHlwZSB7QXJyYXk8bnVtYmVyPn0gKi9cbiAgICBsZXQgdGhpc0JveERpbWVuczogbnVtYmVyW107XG5cbiAgICBsZXQgdGhpc01lc2g7ICAvLyBiaWdnZXN0IG1lc2hcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBjb25zdCBhbGxWaXNNb2xNZXNoZXNMZW4gPSBhbGxWaXNNb2xNZXNoZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsVmlzTW9sTWVzaGVzTGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgYWxsVmlzTW9sTWVzaCA9IGFsbFZpc01vbE1lc2hlc1tpXTtcblxuICAgICAgICAvLyBHZXQgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGlzIG1lc2guXG4gICAgICAgIGNvbnN0IHRoaXNCb3hUbXAgPSBhbGxWaXNNb2xNZXNoLmdldEJvdW5kaW5nSW5mbygpLmJvdW5kaW5nQm94O1xuICAgICAgICBjb25zdCB0aGlzQm94RGltZW5zVG1wID0gT2JqZWN0LmtleXModGhpc0JveFRtcC5tYXhpbXVtV29ybGQpLm1hcChcbiAgICAgICAgICAgIChrKSA9PiB0aGlzQm94VG1wLm1heGltdW1Xb3JsZFtrXSAtIHRoaXNCb3hUbXAubWluaW11bVdvcmxkW2tdLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCB2b2x1bWUgPSB0aGlzQm94RGltZW5zVG1wWzBdICogdGhpc0JveERpbWVuc1RtcFsxXSAqIHRoaXNCb3hEaW1lbnNUbXBbMl07XG5cbiAgICAgICAgaWYgKHZvbHVtZSA+IG1heFZvbCkge1xuICAgICAgICAgICAgbWF4Vm9sID0gdm9sdW1lO1xuICAgICAgICAgICAgdGhpc0JveCA9IHRoaXNCb3hUbXA7XG4gICAgICAgICAgICB0aGlzQm94RGltZW5zID0gdGhpc0JveERpbWVuc1RtcDtcbiAgICAgICAgICAgIHRoaXNNZXNoID0gYWxsVmlzTW9sTWVzaDsgIC8vIGJpZ2dlc3QgbWVzaFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBzY2FsZXNcbiAgICBjb25zdCBzY2FsZXMgPSB0YXJnZXRCb3hEaW1lbnMubWFwKCh0YXJnZXRCb3hEaW1lbiwgaSkgPT5cbiAgICAgICAgdGFyZ2V0Qm94RGltZW4gLyB0aGlzQm94RGltZW5zW2ldLFxuICAgICk7XG5cbiAgICAvLyBHZXQgdGhlIG1pbmltdW0gc2NhbGVcbiAgICBjb25zdCBtaW5TY2FsZSA9IE1hdGgubWluLmFwcGx5KG51bGwsIHNjYWxlcyk7XG4gICAgY29uc3QgbWVzaFNjYWxpbmcgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKG1pblNjYWxlLCBtaW5TY2FsZSwgbWluU2NhbGUpO1xuXG4gICAgLy8gU2NhbGUgdGhlIG1lc2hlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFZpc01vbE1lc2hlc0xlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFsbFZpc01vbE1lc2ggPSBhbGxWaXNNb2xNZXNoZXNbaV07XG4gICAgICAgIGFsbFZpc01vbE1lc2guc2NhbGluZyA9IG1lc2hTY2FsaW5nO1xuICAgIH1cblxuICAgIFZhcnMuc2NlbmUucmVuZGVyKCk7ICAvLyBOZWVkZWQgdG8gZ2V0IGJvdW5kaW5nIGJveCB0byByZWNhbGN1bGF0ZS5cblxuICAgIC8vIFRyYW5zbGF0ZSB0aGUgbWVzaGVzLlxuICAgIGNvbnN0IG1lc2hUcmFuc2xhdGlvbiA9IHRoaXNCb3guY2VudGVyV29ybGQuc3VidHJhY3QodGFyZ2V0Qm94LmNlbnRlcldvcmxkKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFZpc01vbE1lc2hlc0xlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFsbFZpc01vbE1lc2ggPSBhbGxWaXNNb2xNZXNoZXNbaV07XG4gICAgICAgIGFsbFZpc01vbE1lc2gucG9zaXRpb24gPSBhbGxWaXNNb2xNZXNoLnBvc2l0aW9uLnN1YnRyYWN0KG1lc2hUcmFuc2xhdGlvbik7XG4gICAgfVxuXG4gICAgVmFycy5zY2VuZS5yZW5kZXIoKTsgIC8vIE5lZWRlZCB0byBnZXQgYm91bmRpbmcgYm94IHRvIHJlY2FsY3VsYXRlLlxuXG4gICAgbGV0IGRlbHRhWSA9IDA7XG4gICAgaWYgKFZhcnMuc2NlbmVJbmZvLnBvc2l0aW9uT25GbG9vcikge1xuICAgICAgICBkZWx0YVkgPSBtb3ZlTW9sTWVzaGVzVG9Hcm91bmQodGhpc01lc2gsIHRhcmdldEJveCk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxWaXNNb2xNZXNoZXNMZW47IGkrKykge1xuICAgICAgICBjb25zdCBhbGxWaXNNb2xNZXNoID0gYWxsVmlzTW9sTWVzaGVzW2ldO1xuICAgICAgICBhbGxWaXNNb2xNZXNoLnBvc2l0aW9uLnkgPSBhbGxWaXNNb2xNZXNoLnBvc2l0aW9uLnkgLSBkZWx0YVk7XG4gICAgICAgIGFsbFZpc01vbE1lc2gudmlzaWJpbGl0eSA9IDE7ICAvLyBIaWRlIHdoaWxlIHJvdGF0aW5nLlxuICAgIH1cblxuICAgIGxhc3RSb3RhdGlvbkJlZm9yZUFuaW1hdGlvbiA9IGFsbFZpc01vbE1lc2hlc0luZm9bMF0ucm90YXRpb24uY2xvbmUoKTtcblxuICAgIC8vIE5vdyBkbyB0aGUgYW5pbWF0aW9ucywgaWYgbm90IG1vdmluZyBmcm9tIG9yaWdpbiAoYXMgaXMgdGhlIGNhc2UgaWYgdGhlXG4gICAgLy8gc3R5bGUganVzdCBjaGFuZ2VkKS5cbiAgICBpZiAoYW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb25zdCBsZW4gPSBhbGxWaXNNb2xNZXNoZXNJbmZvLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYWxsVmlzTW9sTWVzaEluZm8gPSBhbGxWaXNNb2xNZXNoZXNJbmZvW2ldO1xuICAgICAgICAgICAgY29uc3QgbWVzaCA9IGFsbFZpc01vbE1lc2hJbmZvLm1lc2g7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSBtZXNoLnBvc2l0aW9uLmNsb25lKCk7XG4gICAgICAgICAgICBjb25zdCBzY2EgPSBtZXNoLnNjYWxpbmcuY2xvbmUoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvdCA9IG1lc2gucm90YXRpb24uY2xvbmUoKTtcblxuICAgICAgICAgICAgY29uc3QgcG9zWCA9IG1ha2VCYWJ5bG9uQW5pbShcInBvc1hcIiwgXCJwb3NpdGlvbi54XCIsIGFsbFZpc01vbE1lc2hJbmZvLnBvc2l0aW9uLngsIHBvcy54KTtcbiAgICAgICAgICAgIGNvbnN0IHBvc1kgPSBtYWtlQmFieWxvbkFuaW0oXCJwb3NZXCIsIFwicG9zaXRpb24ueVwiLCBhbGxWaXNNb2xNZXNoSW5mby5wb3NpdGlvbi55LCBwb3MueSk7XG4gICAgICAgICAgICBjb25zdCBwb3NaID0gbWFrZUJhYnlsb25BbmltKFwicG9zWlwiLCBcInBvc2l0aW9uLnpcIiwgYWxsVmlzTW9sTWVzaEluZm8ucG9zaXRpb24ueiwgcG9zLnopO1xuXG4gICAgICAgICAgICBjb25zdCBzY2FYID0gbWFrZUJhYnlsb25BbmltKFwic2NhWFwiLCBcInNjYWxpbmcueFwiLCBhbGxWaXNNb2xNZXNoSW5mby5zY2FsaW5nLngsIHNjYS54KTtcbiAgICAgICAgICAgIGNvbnN0IHNjYVkgPSBtYWtlQmFieWxvbkFuaW0oXCJzY2FZXCIsIFwic2NhbGluZy55XCIsIGFsbFZpc01vbE1lc2hJbmZvLnNjYWxpbmcueSwgc2NhLnkpO1xuICAgICAgICAgICAgY29uc3Qgc2NhWiA9IG1ha2VCYWJ5bG9uQW5pbShcInNjYVpcIiwgXCJzY2FsaW5nLnpcIiwgYWxsVmlzTW9sTWVzaEluZm8uc2NhbGluZy56LCBzY2Eueik7XG5cbiAgICAgICAgICAgIGNvbnN0IHJvdFggPSBtYWtlQmFieWxvbkFuaW0oXCJyb3RYXCIsIFwicm90YXRpb24ueFwiLCBhbGxWaXNNb2xNZXNoSW5mby5yb3RhdGlvbi54LCByb3QueCk7XG4gICAgICAgICAgICBjb25zdCByb3RZID0gbWFrZUJhYnlsb25BbmltKFwicm90WVwiLCBcInJvdGF0aW9uLnlcIiwgYWxsVmlzTW9sTWVzaEluZm8ucm90YXRpb24ueSwgcm90LnkpO1xuICAgICAgICAgICAgY29uc3Qgcm90WiA9IG1ha2VCYWJ5bG9uQW5pbShcInJvdFpcIiwgXCJyb3RhdGlvbi56XCIsIGFsbFZpc01vbE1lc2hJbmZvLnJvdGF0aW9uLnosIHJvdC56KTtcblxuICAgICAgICAgICAgbWVzaC5hbmltYXRpb25zID0gW3Bvc1gsIHBvc1ksIHBvc1osIHNjYVgsIHNjYVksIHNjYVosIHJvdFgsIHJvdFksIHJvdFpdO1xuXG4gICAgICAgICAgICBjb25zdCBhbmltID0gVmFycy5zY2VuZS5iZWdpbkFuaW1hdGlvbihtZXNoLCAwLCAxNSwgZmFsc2UsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBZb3UgbmVlZCB0byByZWNhbGN1bGF0ZSB0aGUgc2hhZG93cy5cbiAgICAgICAgICAgICAgICBPcHRpbWl6YXRpb25zLnVwZGF0ZUVudmlyb25tZW50U2hhZG93cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3QgYW5pbWF0aW5nLiBZb3UgbmVlZCB0byByZWNhbGN1bGF0ZSB0aGUgc2hhZG93cy5cbiAgICAgICAgT3B0aW1pemF0aW9ucy51cGRhdGVFbnZpcm9ubWVudFNoYWRvd3MoKTtcbiAgICB9XG59XG5cbi8qKlxuICogSG93IG11Y2ggdG8gbW92ZSB0aGUgbWVzaCB0byBwb3NpdGlvbiBpdCBvbiB0aGUgZ3JvdW5kLlxuICogQHBhcmFtICB7Kn0gYmlnZ2VzdE1vbE1lc2ggIFRoZSBiaWdnZXN0IG1vbGVjdWxhciBtZXNoLlxuICogQHBhcmFtICB7T2JqZWN0fSB0YXJnZXRCb3ggIFRoZSBib3ggd2l0aGluIHdoaWNoIHRvIHBvc2l0aW9uIHRoZSBtZXNoLlxuICogQHJldHVybnMgbnVtYmVyICBIb3cgbXVjaCB0byBtb3ZlIGFsb25nIHRoZSBZIGF4aXMuXG4gKi9cbmZ1bmN0aW9uIG1vdmVNb2xNZXNoZXNUb0dyb3VuZChiaWdnZXN0TW9sTWVzaDogYW55LCB0YXJnZXRCb3g6IGFueSk6IG51bWJlciB7XG4gICAgLy8gVGhlIGFib3ZlIHdpbGwgcG9zaXRpb24gdGhlIG1vbGVjdWxhciBtZXNoIHdpdGhpbiB0aGUgdGFyZ2V0IG1lc2gsXG4gICAgLy8gY2VudGVyaW5nIHRoZSB0d28gYm91bmRpbmcgYm94ZXMuIFRoYXQgd291bGQgYmUgZ29vZCBmb3IgcG9zaXRpb25pbmdcbiAgICAvLyBwcm90ZWlucyBpbiBhIGJpbGF5ZXIsIGZvciBleGFtcGxlLiBOb3cgbGV0J3MgbW92ZSB0aGUgbWVzaGVzIHNvIHRoZXlcbiAgICAvLyBhcmUgYWN0dWFsbHkgb24gdGhlIGdyb3VuZCAoYWxsIG90aGVyIG1lc2hlcykuXG5cbiAgICAvLyBDaGVjayBhbmQgc2VlIGlmIHRoZSBkZWx0YVkgaGFzIGFscmVhZHkgYmVlbiBjYWxjdWxhdGVkLlxuICAgIGNvbnN0IFBJID0gTWF0aC5QSTtcbiAgICBjb25zdCBrZXk6IHN0cmluZyA9IGJpZ2dlc3RNb2xNZXNoLm5hbWUgKyBcIi1cIiArXG4gICAgICAgICAgICAgIChiaWdnZXN0TW9sTWVzaC5yb3RhdGlvbi54ICUgUEkpLnRvRml4ZWQoMykgKyBcIi1cIiArXG4gICAgICAgICAgICAgIChiaWdnZXN0TW9sTWVzaC5yb3RhdGlvbi55ICUgUEkpLnRvRml4ZWQoMykgKyBcIi1cIiArXG4gICAgICAgICAgICAgIChiaWdnZXN0TW9sTWVzaC5yb3RhdGlvbi56ICUgUEkpLnRvRml4ZWQoMyk7XG4gICAgaWYgKGNhY2hlZERlbHRhWXNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBjYWNoZWREZWx0YVlzW2tleV07XG4gICAgfVxuXG4gICAgLy8gVW5mb3J0dW5hdGVseSwgQkFCWUxPTmpzIHJvdGF0ZXMgYm91bmRpbmcgYm94ZXMgd2l0aCB0aGUgbWVzaC4gU28gdGhlXG4gICAgLy8gbWluaW11bSB6IHBlciB0aGUgYm91bmRpbmcgYm94IGRvZXNuJ3QgY29ycmVzcG9uZCB0byBFWEFDVExZIHRoZVxuICAgIC8vIG1pbmltdW0geiBvZiBhbnkgdmVydGV4LiBMZXQncyBsb29wIHRocm91Z2ggdGhlIGJpZ2dlc3QgbWVzaCBhbmQgZmluZFxuICAgIC8vIGl0cyBsb3dlc3QgdmVydGV4LCBiZWNhdXNlIHBvc2l0aW9uaW5nIG92ZXIgdGhlIGdyb3VuZCBuZWVkcyB0byBiZSBtb3JlXG4gICAgLy8gZXhhY3QuXG4gICAgY29uc3QgdmVydHMgPSBiaWdnZXN0TW9sTWVzaC5nZXRWZXJ0aWNlc0RhdGEoQkFCWUxPTi5WZXJ0ZXhCdWZmZXIuUG9zaXRpb25LaW5kKTtcbiAgICBsZXQgdGhpc01pblkgPSAxMDAwMDAwLjA7XG4gICAgY29uc3QgdmVydHNMZW5ndGggPSB2ZXJ0cy5sZW5ndGg7XG4gICAgY29uc3QgdGhpc01lc2hXb3JsZE1hdHJpeCA9IGJpZ2dlc3RNb2xNZXNoLmdldFdvcmxkTWF0cml4KCk7XG4gICAgY29uc3QgYW1udFRvU2tpcFRvR2V0MTAwMFB0cyA9IE1hdGgubWF4KDEsIDMgKiBNYXRoLmZsb29yKHZlcnRzTGVuZ3RoIC8gMzAwMCkpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydHNMZW5ndGg7IGkgPSBpICsgYW1udFRvU2tpcFRvR2V0MTAwMFB0cykge1xuICAgICAgICBsZXQgdmVjID0gbmV3IEJBQllMT04uVmVjdG9yMyh2ZXJ0c1tpXSwgdmVydHNbaSArIDFdLCB2ZXJ0c1tpICsgMl0pO1xuICAgICAgICB2ZWMgPSBCQUJZTE9OLlZlY3RvcjMuVHJhbnNmb3JtQ29vcmRpbmF0ZXModmVjLCB0aGlzTWVzaFdvcmxkTWF0cml4KTtcbiAgICAgICAgaWYgKHZlYy55IDwgdGhpc01pblkpIHtcbiAgICAgICAgICAgIHRoaXNNaW5ZID0gdmVjLnk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgbWluIHogb2YgdGhlIHRhcmdldCBib3ggc2hvdWxkIGJlIG9rLlxuICAgIGNvbnN0IHRhcmdldE1pblkgPSB0YXJnZXRCb3gubWluaW11bVdvcmxkLnk7XG5cbiAgICBjb25zdCBkZWx0YVkgPSB0aGlzTWluWSAtIHRhcmdldE1pblkgLSAwLjE7XG4gICAgY2FjaGVkRGVsdGFZc1trZXldID0gZGVsdGFZO1xuICAgIHJldHVybiBkZWx0YVk7XG59XG5cbi8qKlxuICogR2V0cyBhIGxpc3Qgb2YgYWxsIHRoZSBiYWJ5bG9uanMgbW9sZWN1bGFyIG1lc2hlcyB0aGF0IGFyZSB2aXNpYmxlLlxuICogQHBhcmFtICB7Kn0gYmFieWxvbk1lc2ggIFRoZSBtZXNoIHRoYXQgd2FzIGp1c3QgYWRkZWQuXG4gKiBAcmV0dXJucyBBcnJheTwqPiAgQSBsaXN0IG9mIGFsbCB2aXNpYmxlIG1lc2hlcy5cbiAqL1xuZnVuY3Rpb24gZ2V0VmlzaWJsZU1vbE1lc2hlcyhiYWJ5bG9uTWVzaDogYW55KTogYW55W10ge1xuICAgIGNvbnN0IGFsbFZpc01vbE1lc2hlcyA9IFtdO1xuICAgIGNvbnN0IG1vbE1lc2hJZHMgPSBPYmplY3Qua2V5cyhWaXNTdHlsZXMuc3R5bGVNZXNoZXMpO1xuICAgIGNvbnN0IGxlbiA9IG1vbE1lc2hJZHMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgbW9sTWVzaElkID0gbW9sTWVzaElkc1tpXTtcbiAgICAgICAgY29uc3QgYWxsVmlzTW9sTWVzaCA9IFZpc1N0eWxlcy5zdHlsZU1lc2hlc1ttb2xNZXNoSWRdLm1lc2g7XG4gICAgICAgIGlmIChhbGxWaXNNb2xNZXNoLmlzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgYWxsVmlzTW9sTWVzaGVzLnB1c2goYWxsVmlzTW9sTWVzaCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGN1cnJlbnQgb25lIChqdXN0IGFkZGVkKS5cbiAgICBpZiAoYmFieWxvbk1lc2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhbGxWaXNNb2xNZXNoZXMucHVzaChiYWJ5bG9uTWVzaCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFsbFZpc01vbE1lc2hlcztcbn1cblxuLyoqXG4gKiBSZXNldHMgdGhpbmdzIGxpa2UgdGhlIGxvY2F0aW9uIGFuZCByb3RhdGlvbiBvZiBhbGwgdmlzaWJsZSBtZXNoZXMuXG4gKiBAcGFyYW0gIHtPYmplY3Q8Kj59IGFsbFZpc01vbE1lc2hlcyAgQWxsIHRoZSB2aXNpYmxlIG1lc2hlcy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gcmVzZXRNZXNoZXMoYWxsVmlzTW9sTWVzaGVzOiBhbnlbXSk6IHZvaWQge1xuICAgIC8vIFJlc2V0IHRoZSBzY2FsaW5nLCBwb3NpdGlvbiwgYW5kIHJvdGF0aW9uIG9mIGFsbCB0aGUgdmlzaWJsZSBtb2xlY3VsYXJcbiAgICAvLyBtZXNoZXMuXG4gICAgY29uc3QgbGVuID0gYWxsVmlzTW9sTWVzaGVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFsbFZpc01vbE1lc2ggPSBhbGxWaXNNb2xNZXNoZXNbaV07XG4gICAgICAgIGFsbFZpc01vbE1lc2guYW5pbWF0aW9ucyA9IFtdO1xuXG4gICAgICAgIGlmIChhbGxWaXNNb2xNZXNoLmlzVmlzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIGFsbFZpc01vbE1lc2ggaXMgbm90IHNjYWxlZCBvciBwb3NpdGlvbmVkLiBCdXRcbiAgICAgICAgICAgIC8vIG5vdGUgdGhhdCByb3RhdGlvbnMgYXJlIHByZXNlcnZlZC5cbiAgICAgICAgICAgIGFsbFZpc01vbE1lc2guc2NhbGluZyA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMSwgMSwgMSk7XG4gICAgICAgICAgICBhbGxWaXNNb2xNZXNoLnBvc2l0aW9uID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKTtcbiAgICAgICAgICAgIGFsbFZpc01vbE1lc2gucm90YXRpb24gPSBWUk1MLm1vbFJvdGF0aW9uO1xuICAgICAgICAgICAgYWxsVmlzTW9sTWVzaC52aXNpYmlsaXR5ID0gMDsgIC8vIEhpZGUgd2hpbGUgcm90YXRpbmcuXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogTWFrZSBhIGJhYnlsb25qcyBhbmltYXRpb24uIEkgZm91bmQgbXlzZWxmIGRvaW5nIHRoaXMgYSBsb3QsIHNvIGZpZ3VyZWQgSSdkXG4gKiBtYWtlIGEgZnVuY3Rpb24uXG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgICAgICBUaGUgYW5pbWF0aW9uIG5hbWUuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHByb3AgICAgICBUaGUgcHJvcGVydHkgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSAge251bWJlcn0gc3RhcnRWYWwgIFRoZSBzdGFydGluZyB2YWx1ZS5cbiAqIEBwYXJhbSAge251bWJlcn0gZW5kVmFsICAgIFRoZSBlbmRpbmcgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIG1ha2VCYWJ5bG9uQW5pbShuYW1lOiBzdHJpbmcsIHByb3A6IHN0cmluZywgc3RhcnRWYWw6IG51bWJlciwgZW5kVmFsOiBudW1iZXIpIHtcbiAgICBjb25zdCBhbmltID0gbmV3IEJBQllMT04uQW5pbWF0aW9uKFxuICAgICAgICBuYW1lLCBwcm9wLCA2MCxcbiAgICAgICAgQkFCWUxPTi5BbmltYXRpb24uQU5JTUFUSU9OVFlQRV9GTE9BVCxcbiAgICAgICAgQkFCWUxPTi5BbmltYXRpb24uQU5JTUFUSU9OTE9PUE1PREVfQ1lDTEUsXG4gICAgKTtcblxuICAgIGFuaW0uc2V0S2V5cyhbXG4gICAgICAgIHtmcmFtZTogMCwgdmFsdWU6IHN0YXJ0VmFsfSxcbiAgICAgICAge2ZyYW1lOiAxNSwgdmFsdWU6IGVuZFZhbH0sXG4gICAgXSk7XG5cbiAgICByZXR1cm4gYW5pbTtcbn1cbiIsImltcG9ydCAqIGFzIE9wdGltaXphdGlvbnMgZnJvbSBcIi4uL1NjZW5lL09wdGltaXphdGlvbnNcIjtcbmltcG9ydCAqIGFzIE1lbnUzRCBmcm9tIFwiLi4vVUkvTWVudTNEL01lbnUzRFwiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBUaHJlZURNb2wgZnJvbSBcIi4vM0RNb2wvVGhyZWVETW9sXCI7XG5pbXBvcnQgKiBhcyBNb2xTaGFkb3dzIGZyb20gXCIuL01vbFNoYWRvd3NcIjtcbmltcG9ydCAqIGFzIFBpY2thYmxlcyBmcm9tIFwiLi4vTmF2aWdhdGlvbi9QaWNrYWJsZXNcIjtcbmltcG9ydCAqIGFzIExvYWRBbmRTZXR1cCBmcm9tIFwiLi4vU2NlbmUvTG9hZEFuZFNldHVwXCI7XG5cbmRlY2xhcmUgdmFyIGpRdWVyeTogYW55O1xuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG4vKipcbiAqIExvYWQgaW4gdGhlIG1vbGVjdWxlcy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIGJlZm9yZUxvYWRpbmcoKTtcblxuICAgIC8vIExvYWQgZnJvbSBhIHBkYiBmaWxlIHZpYSAzRG1vbGpzLlxuICAgIFRocmVlRE1vbC5zZXR1cCgpO1xuXG4gICAgaWYgKFZhcnMudnJWYXJzLm1lbnVBY3RpdmUpIHtcbiAgICAgICAgTWVudTNELnNldHVwKCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBzaGFkb3dzLlxuICAgIE9wdGltaXphdGlvbnMudXBkYXRlRW52aXJvbm1lbnRTaGFkb3dzKCk7XG59XG5cbi8qKlxuICogUnVuIHRoaXMgYmVmb3JlIGxvYWRpbmcuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGJlZm9yZUxvYWRpbmcoKTogdm9pZCB7XG4gICAgLy8gU2V0IHVwIHRoZSBzaGFkb3cgZ2VuZXJhdG9yLlxuICAgIE1vbFNoYWRvd3Muc2V0dXBTaGFkb3dHZW5lcmF0b3IoKTtcblxuICAgIC8vIE1ha2UgVVZzIHdvcmtcbiAgICAvLyBCQUJZTE9OLk9CSkZpbGVMb2FkZXIuT1BUSU1JWkVfV0lUSF9VViA9IHRydWU7XG59XG5cbi8qKlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWZ0ZXJMb2FkaW5nKCk6IHZvaWQge1xuICAgIE1vbFNoYWRvd3Muc2V0dXBTaGFkb3dDYXRjaGVycygpOyAgLy8gUmVsYXRlZCB0byBleHRyYXMsIHNvIGtlZXAgaXQgaGVyZS5cblxuICAgIC8vIERvIHlvdSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VuZCBnbGFzcyBpbnN0ZWFkIG9mIGludmlzaWJsZT8gU2VlXG4gICAgLy8gc2NlbmVfaW5mby5qc29uLCB3aGljaCBjYW4gaGF2ZSB0cmFuc3BhcmVudEdyb3VuZDogdHJ1ZS5cbiAgICBpZiAoVmFycy5zY2VuZUluZm8udHJhbnNwYXJlbnRHcm91bmQgPT09IHRydWUpIHtcbiAgICAgICAgaWYgKFZhcnMudnJWYXJzLmdyb3VuZE1lc2gpIHtcbiAgICAgICAgICAgIFZhcnMudnJWYXJzLmdyb3VuZE1lc2gudmlzaWJpbGl0eSA9IDE7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50R3JvdW5kID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbChcInRyYW5zcGFyZW50R3JvdW5kXCIsIFZhcnMuc2NlbmUpO1xuXG4gICAgICAgICAgICB0cmFuc3BhcmVudEdyb3VuZC5kaWZmdXNlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMSwgMSk7XG4gICAgICAgICAgICB0cmFuc3BhcmVudEdyb3VuZC5zcGVjdWxhckNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xuICAgICAgICAgICAgdHJhbnNwYXJlbnRHcm91bmQuZW1pc3NpdmVDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKTtcbiAgICAgICAgICAgIHRyYW5zcGFyZW50R3JvdW5kLmFscGhhID0gVmFycy5UUkFOU1BBUkVOVF9GTE9PUl9BTFBIQTtcblxuICAgICAgICAgICAgVmFycy52clZhcnMuZ3JvdW5kTWVzaC5tYXRlcmlhbCA9IHRyYW5zcGFyZW50R3JvdW5kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJXYXJuaW5nOiBWYXJzLnZyVmFycy5ncm91bmRNZXNoIG5vdCBkZWZpbmVkLlwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpbmlzaCB1cCBhbGwgc2NlbmUgcHJlcGFyYXRpb25zLlxuICAgIExvYWRBbmRTZXR1cC5sb2FkaW5nQXNzZXRzRG9uZSgpO1xufVxuXG4vKipcbiAqIFNldHMgdXAgYSBtb2xlY3VsZSBtZXNoLlxuICogQHBhcmFtICB7Kn0gICAgICBtZXNoICAgICAgICAgICBUaGUgbWVzaC5cbiAqIEBwYXJhbSAge251bWJlcn0gdW5pcUludElEICAgICAgQSB1bmlxdWUgbnVtZXJpY2FsIGlkIHRoYXQgaWRlbnRpZmllcyB0aGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc2guXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cE1lc2gobWVzaDogYW55LCB1bmlxSW50SUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmICgobWVzaC5tYXRlcmlhbCAhPT0gdW5kZWZpbmVkKSAmJiAobWVzaC5tYXRlcmlhbCAhPT0gbnVsbCkpIHtcbiAgICAgICAgLy8gQWRkIGEgc21hbGwgZW1pc3Npb24gY29sb3Igc28gdGhlIGRhcmtcbiAgICAgICAgLy8gc2lkZSBvZiB0aGUgcHJvdGVpbiBpc24ndCB0b28gZGFyay5cbiAgICAgICAgY29uc3QgbGlnaHRpbmdJbmYgPSBNb2xTaGFkb3dzLmdldEJsdXJEYXJrbmVzc0FtYmllbnRGcm9tTGlnaHROYW1lKCk7XG4gICAgICAgIGxldCBiYWNrZ3JvdW5kTHVtID0gMDtcblxuICAgICAgICBpZiAobGlnaHRpbmdJbmYuYW1iaWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBFeHBlcmllbmNlOlxuXG4gICAgICAgICAgICAvLyBJbiBDb3VjaCBzY2VuZSwgYmFja2dyb3VuZCBsdW1pbm9zaXR5IG9mIDAuMDEgaXMgZ29vZC4gVGhlcmUgc2hhZG93XG4gICAgICAgICAgICAvLyBkYXJrbmVzcyB3YXMgMC45NjI1XG5cbiAgICAgICAgICAgIC8vIEluIEhvdXNlIHNjZW5lLCBiYWNrZ3JvdW5kIGx1bWlub3NpdHkgb2YgMC4wMDI1IGlzIGdvb2QuIFRoZXJlXG4gICAgICAgICAgICAvLyBzaGFkb3cgZGFya25lc3Mgd2FzIDAuMzUuXG5cbiAgICAgICAgICAgIC8vIExldCdzIHBsYXkgYXJvdW5kIHdpdGggYSBzY2hlbWUgZm9yIGd1ZXNzaW5nIGF0IHRoZSByaWdodFxuICAgICAgICAgICAgLy8gYmFja2dyb3VuZCBsdW1pbm9zaXR5LlxuXG4gICAgICAgICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAgICAgICAgIGNvbnN0IGxpZ2h0aW5nSW5mRGFya25lc3MgPSBsaWdodGluZ0luZi5kYXJrbmVzcztcbiAgICAgICAgICAgIGlmIChsaWdodGluZ0luZkRhcmtuZXNzID4gMC45NSkge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmRMdW0gPSAwLjA1O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaWdodGluZ0luZkRhcmtuZXNzIDwgMC40KSB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZEx1bSA9IDAuMDAyNTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2NhbGVkXG4gICAgICAgICAgICAgICAgLy8gKDAuOTUsIDAuMDEpXG4gICAgICAgICAgICAgICAgLy8gKDAuNCwgMC4wMDI1KVxuICAgICAgICAgICAgICAgIC8vIGxldCBtID0gMC4wMTM2MzYzNjM2MzYzNjM2Mzc7ICAvLyAoMC4wMSAtIDAuMDAyNSkgLyAoMC45NSAtIDAuNCk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGIgPSAtMC4wMDI5NTQ1NDU0NTQ1NDU0NTQ1OyAgLy8gMC4wMSAtIDAuMDEzNjM2MzYzNjM2MzYzNjM3ICogMC45NTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kTHVtID0gMC4wMTM2MzYzNjM2MzYzNjM2MzcgKiBsaWdodGluZ0luZkRhcmtuZXNzIC0gMC4wMDI5NTQ1NDU0NTQ1NDU0NTQ1O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSXQncyBnaXZlbiBpbiB0aGUgbmFtZSBvZiB0aGUgbGlnaHQsIHNvIG5vIG5lZWQgdG8gdHJ5IHRvXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgaXQuXG4gICAgICAgICAgICBiYWNrZ3JvdW5kTHVtID0gbGlnaHRpbmdJbmYuYW1iaWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmVDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMyhiYWNrZ3JvdW5kTHVtLCBiYWNrZ3JvdW5kTHVtLCBiYWNrZ3JvdW5kTHVtKTtcblxuICAgICAgICAvLyBGcmVlemUgdGhlIG1hdGVyaWFsIChpbXByb3ZlcyBvcHRpbWl6YXRpb24pLlxuICAgICAgICBPcHRpbWl6YXRpb25zLmZyZWV6ZU1lc2hQcm9wcyhtZXNoKTtcbiAgICB9XG4gICAgLy8gfVxuXG4gICAgLy8gVGhpcyBpcyByZXF1aXJlZCB0byBwb3NpdGlvbiBjb3JyZWN0bHkuXG4gICAgbWVzaC5zY2FsaW5nLnogPSAtMTtcbiAgICBpZiAodW5pcUludElEID4gMCkge1xuICAgICAgICBtZXNoLnNjYWxpbmcueCA9IC0xO1xuICAgIH1cblxuICAgIC8vIE1ha2UgaXQgc28gaXQgY2FzdHMgYSBzaGFkb3cuXG4gICAgaWYgKE1vbFNoYWRvd3Muc2hhZG93R2VuZXJhdG9yKSB7XG4gICAgICAgIE1vbFNoYWRvd3Muc2hhZG93R2VuZXJhdG9yLmdldFNoYWRvd01hcCgpLnJlbmRlckxpc3QucHVzaChtZXNoKTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIGl0IHBpY2thYmxlXG4gICAgUGlja2FibGVzLmFkZFBpY2thYmxlTW9sZWN1bGUobWVzaCk7XG59XG4iLCIvLyBUaGlzIHNldHMgdXAgdGhlIG5vbiB2ciBjYW1lcmEuIE5vdCBldmVyeW9uZSBoYXMgYSB2ciBoZWFkc2V0LlxuXG5pbXBvcnQgKiBhcyBWYXJzIGZyb20gXCIuLi9WYXJzL1ZhcnNcIjtcblxuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG4vKiogQHR5cGUgeyp9ICovXG5sZXQgbm9uVlJDYW1lcmE6IGFueTtcblxuY29uc3QgbGFzdENhbWVyYVBvc0Fib3ZlR3JvdW5kTWVzaDogYW55ID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKTtcblxuLyoqXG4gKiBTZXRzIHVwIHRoZSBub25WUiBjYW1lcmEgKG5vdCBldmVyeW9uZSBoYXMgYSBWUiBoZWFkc2V0KS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIHNldHVwTm9uVlJDYW1lcmFPYmooKTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIHRoZSBjYW1lcmEgb2JqZWN0LlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBzZXR1cE5vblZSQ2FtZXJhT2JqKCk6IHZvaWQge1xuICAgIC8vIFRoZSBWUkhlbHBlciBhbHJlYWR5IGNyZWF0ZWQgYSBjYW1lcmEuIE5lZWQgdG8gc2V0IGl0IHVwLlxuICAgIG5vblZSQ2FtZXJhID0gVmFycy5zY2VuZS5hY3RpdmVDYW1lcmE7XG5cbiAgICAvLyBFbmFibGUgbmF2aWdhdGlvbiB2aWEgYm90aCBXQVNEIGFuZCB0aGUgYXJyb3dzIGtleXMuXG4gICAgbm9uVlJDYW1lcmEua2V5c1VwID0gWzg3LCAzOF07XG4gICAgbm9uVlJDYW1lcmEua2V5c0Rvd24gPSBbODMsIDQwXTtcbiAgICBub25WUkNhbWVyYS5rZXlzTGVmdCA9IFs2NSwgMzddO1xuICAgIG5vblZSQ2FtZXJhLmtleXNSaWdodCA9IFs2OCwgMzldO1xuXG4gICAgLy8gVHVybiBvbiBncmF2aXR5LiBOb3RlOiBUdXJuaW5nIHRoaXMgb24gY2F1c2VzIHByb2JsZW1zLCBhbmQgaXQgZG9lc24ndFxuICAgIC8vIHNlZW0gdG8gYmUgbmVjZXNzYXJ5LiBXZWxsLCBpdCBkb2VzIGhlbHAgd2l0aCBhcnJvdy93c2FkIG5hdmlnYXRpb25cbiAgICAvLyAoY2FuJ3QgZmx5IG9mZikuXG4gICAgLy8gVmFycy5zY2VuZS5ncmF2aXR5ID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAtOS44MSwgMCk7XG4gICAgVmFycy5zY2VuZS5ncmF2aXR5ID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAtMC4xLCAwKTtcbiAgICBub25WUkNhbWVyYS5hcHBseUdyYXZpdHkgPSB0cnVlO1xuXG4gICAgLy8gRW5hYmxlIGNvbGxpc2lvbiBkZXRlY3Rpb24uIE5vdGUgdGhhdCB0aGUgc2Vjb25kIHBhcmFtZXJ0ZXIgaXMgYVxuICAgIC8vIHJhZGl1cy5cbiAgICBzZXRDYW1lcmFFbGlwc29pZCgpO1xuXG4gICAgLy8gVHVybiBvbiBjb2xsaXNpb25zIGFzIGFwcHJvcHJpYXRlLiBOb3RlIHRoYXQgZ3JvdW5kTWVzaCBjb2xsaXNpb25zIGFyZVxuICAgIC8vIGVuYWJsZWQgaW4gTmF2aWdhdGlvbi5cbiAgICAvLyBzY2VuZS53b3JrZXJDb2xsaXNpb25zID0gdHJ1ZTtcbiAgICBWYXJzLnNjZW5lLmNvbGxpc2lvbnNFbmFibGVkID0gdHJ1ZTtcbiAgICBub25WUkNhbWVyYS5jaGVja0NvbGxpc2lvbnMgPSB0cnVlO1xuXG4gICAgLy8gU2xvdyB0aGUgY2FtZXJhLlxuICAgIG5vblZSQ2FtZXJhLnNwZWVkID0gMC4xO1xuXG4gICAgbm9uVlJDYW1lcmEuYXR0YWNoQ29udHJvbChWYXJzLmNhbnZhcywgdHJ1ZSk7XG5cbiAgICAvLyBQb3NpdGlvbiB0aGUgY2FtZXJhIG9uIHRoZSBmbG9vci4gU2VlXG4gICAgLy8gaHR0cDovL3d3dy5odG1sNWdhbWVkZXZzLmNvbS90b3BpYy8zMDgzNy1ncmF2aXR5LWNhbWVyYS1zdG9wcy1mYWxsaW5nL1xuICAgIG5vblZSQ2FtZXJhLl91cGRhdGVQb3NpdGlvbigpO1xufVxuXG4vKipcbiAqIFNldHMgdXAgdGhlIGNvbGxpc2lvbiBlbGlwc29pZCBhcm91bmQgdGhlIG5vbi1WUiBjYW1lcmEuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDYW1lcmFFbGlwc29pZCgpOiB2b2lkIHtcbiAgICAvLyBEZXBlbmRzIG9uIGNhbWVyYSBoZWlnaHQuXG4gICAgbm9uVlJDYW1lcmEuZWxsaXBzb2lkID0gbmV3IEJBQllMT04uVmVjdG9yMygxLjAsIDAuNSAqIFZhcnMuY2FtZXJhSGVpZ2h0LCAxLjApO1xufVxuIiwiLy8gU2V0cyB1cCB0d2Vha3MgdG8gdGhlIFVJLlxuXG5pbXBvcnQgKiBhcyBPcGVuUG9wdXAgZnJvbSBcIi4vT3BlblBvcHVwL09wZW5Qb3B1cFwiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBMZWN0dXJlciBmcm9tIFwiLi4vV2ViUlRDL0xlY3R1cmVyXCI7XG5cbmRlY2xhcmUgdmFyIGpRdWVyeTogYW55O1xuXG5pbnRlcmZhY2UgSTJEQnV0dG9uIHtcbiAgICBzdmc6IHN0cmluZztcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY2xpY2tGdW5jOiBhbnk7XG59XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgMkQgYnV0dG9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gbGF1bmNoIFZSLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKTogdm9pZCB7XG4gICAgYWRkUnVuTW9kZUJ1dHRvbnMoKTtcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSAyRCBidXR0b24gdG8gdGhlIERPTSwgbWFrZXMgaXQgY2xpY2thYmxlLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBhZGRSdW5Nb2RlQnV0dG9ucygpOiB2b2lkIHtcbiAgICAvLyBDcmVhdGUgYSBsaXN0IG9mIHRoZSBidXR0b25zLCBmcm9tIHRoZSBvbmUgb24gdGhlIHRvcCB0byB0aGUgb25lIG9uIHRoZVxuICAgIC8vIGJvdHRvbS4gRG9lc24ndCBpbmNsdWRlIFZSIGJ1dHRvbiwgYmVjYXVzZSB0aGF0J3MgYWRkZWQgZWxzZXdoZXJlLlxuICAgIC8vIEljb25zIHNob3VsZCBmaXQgd2l0aGluIDgwcHggeCA1MHB4LlxuXG4gICAgY29uc3QgZGltZW4gPSBcIjQ4XCI7ICAvLyBUaGUgaWNvbiBkaW1lbnNpb25zIChzcXVhcmUpLlxuXG4gICAgY29uc3QgYnRuczogSTJEQnV0dG9uW10gPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vcGl4YWJheS5jb20vdmVjdG9ycy9mb2xkZXItZGlyZWN0b3J5LW9wZW4tY29tcHV0ZXItMjY2OTQvXG4gICAgICAgICAgICBzdmc6IGA8c3ZnIHZlcnNpb249XCIxLjFcIiBpZD1cIkxheWVyXzFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgeG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIlxuICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIiR7ZGltZW59cHhcIiBoZWlnaHQ9XCIke2RpbWVufXB4XCIgdmlld0JveD1cIjAgMCAke2RpbWVufSAke2RpbWVufVwiIGVuYWJsZS1iYWNrZ3JvdW5kPVwibmV3IDAgMCA0OCA0OFwiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjRkZGRkZGXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgZD1cIk00MS45OSwxNy41NzN2LTUuMjA5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYzAtMC41ODgtMC43MTctMS4wOTItMS42MTUtMS4wOTJIMjUuMTIzVjguOTJjMC0wLjMzNi0wLjQ0OS0wLjY3Mi0wLjk4Ny0wLjY3MkgxLjA3N0MwLjQ0OSw4LjI0OCwwLDguNTgzLDAsOC45MnYzLjQ0NFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMwLDAsMCwwLDAsMC4wODR2MjUuODc3YzAsMC41ODgsMC43MTcsMS4wOTIsMS42MTUsMS4wOTJoMzguNjcxXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjRkZGRkZGXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgZD1cIk03Ljk4NSwxNy41NzNoMzguNjdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjMC44OTgsMCwxLjUyNiwwLjUwNCwxLjM0NywxLjAwOGwtNS4yOTUsMTkuNzQ0Yy0wLjA4OSwwLjU4OC0wLjk4NSwxLjA5Mi0xLjg4NCwxLjA5MkgyLjA2NGMtMC44OTgsMC0xLjUyNi0wLjUwNC0xLjM0Ny0xLjAwOFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGw1LjI5NC0xOS43NDRDNi4xOSwxOC4wNzcsNy4wODgsMTcuNTczLDcuOTg1LDE3LjU3M0w3Ljk4NSwxNy41NzNcIi8+XG4gICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+YCxcbiAgICAgICAgICAgIHRpdGxlOiBcIm9wZW5cIixcbiAgICAgICAgICAgIGlkOiBcIm9wZW4tYnV0dG9uXCIsXG4gICAgICAgICAgICBjbGlja0Z1bmM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBHaXZlIHRoZW0gc29tZSB0aW1lIHRvIGFkbWlyZSBuYW5va2lkLi4uIDopXG4gICAgICAgICAgICAgICAgT3BlblBvcHVwLm9wZW5Nb2RhbChcIkxvYWQgTW9sZWN1bGVcIiwgXCJwYWdlcy9sb2FkLmh0bWw/d2FybmluZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgc3ZnOiBgPHN2ZyB2ZXJzaW9uPVwiMS4yXCIgYmFzZVByb2ZpbGU9XCJ0aW55XCIgaWQ9XCJMYXllcl8xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXG4gICAgICAgICAgICAgICAgICAgIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIke2RpbWVufXB4XCIgaGVpZ2h0PVwiJHtkaW1lbn1weFwiIHZpZXdCb3g9XCIwIDAgJHtkaW1lbn0gJHtkaW1lbn1cIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjRkZGRkZGXCIgc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZS1taXRlcmxpbWl0PVwiMTBcIiBkPVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTTM1LjUsOS44YzEuNyw1LjQtMC42LDgtMS42LDguOWMtMS45LDEuOS00LjUsNC43LTUuOCw3Yy0xLjUsMi43LTQuMSwxMi02LjgsNC40Yy0zLjItOS4xLDEuMy0xMS42LDMuNS0xMy40XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYzEuNS0xLjMsMy40LTQuMywwLjUtNS4zYy00LTEuMy02LjEsNS4zLTEwLjcsNGMtMy0wLjgtMy4yLTQuMS0yLjItNi42QzE1LjQsMS43LDMyLjUsMC42LDM1LjUsOS44TDM1LjUsOS44elwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiI0ZGRkZGRlwiIHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbWl0ZXJsaW1pdD1cIjEwXCIgZD1cIk0yOC4zLDM5LjZjMC01LjUtOC41LTUuNS04LjUsMFMyOC4zLDQ1LjEsMjguMywzOS42XCIvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+YCxcbiAgICAgICAgICAgIHRpdGxlOiBcIkhlbHBcIixcbiAgICAgICAgICAgIGlkOiBcImhlbHAtYnV0dG9uXCIsXG4gICAgICAgICAgICBjbGlja0Z1bmM6ICgpID0+IHsgT3BlblBvcHVwLm9wZW5Nb2RhbChcIkhlbHBcIiwgXCJwYWdlcy9pbmRleC5odG1sXCIsIHRydWUsIHRydWUpOyB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN2ZzogYDxzdmcgdmVyc2lvbj1cIjEuMlwiIGJhc2VQcm9maWxlPVwidGlueVwiIGlkPVwiTGF5ZXJfMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxuICAgICAgICAgICAgIFx0ICAgIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIke2RpbWVufXB4XCIgaGVpZ2h0PVwiJHtkaW1lbn1weFwiIHZpZXdCb3g9XCIwIDAgJHtkaW1lbn0gJHtkaW1lbn1cIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwibm9uZVwiIHN0cm9rZT1cIiNGRkZGRkZcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBkPVwiTTM1LjQsNC42Yy0zLjIsMC01LjgsMi40LTUuOCw1LjhsMCwwYzAsMC41LDAuMiwxLjEsMC41LDEuNGwtMTMuNCw3LjhcbiAgICAgICAgICAgICBcdCAgICBjLTEtMS40LTIuNi0xLjgtNC4xLTEuOGMtMy4yLDAtNS44LDIuNC01LjgsNS44bDAsMGMwLDIuOSwyLjYsNS44LDUuOCw1LjhsMCwwYzEuMywwLDIuMi0wLjUsMy4yLTEuNGwxMy42LDguM1xuICAgICAgICAgICAgIFx0ICAgIGMtMC4zLDAuNC0wLjMsMC45LTAuMywxLjRjMCwzLjQsMi43LDUuOCw1LjksNS44bDAsMGMzLjIsMCw1LjYtMi40LDUuNi01LjhsMCwwYzAtMi45LTIuNC01LjktNS42LTUuOWwwLDBjLTEuNywwLTMuMiwxLjEtNC40LDJcbiAgICAgICAgICAgICBcdCAgICBsLTEzLjEtNy4zYzAuNS0wLjksMC43LTIsMC43LTIuOWMwLTAuNSwwLTEuNC0wLjItMmwxMy4zLTcuM2MxLDAuOSwyLjUsMS41LDQuMSwxLjVjMy4yLDAsNS45LTIuNSw1LjktNS40bDAsMFxuICAgICAgICAgICAgIFx0ICAgIEM0MS4zLDYuOSwzOC41LDQuNiwzNS40LDQuNkwzNS40LDQuNkwzNS40LDQuNnpcIi8+XG4gICAgICAgICAgICAgICAgIDwvc3ZnPmAsXG4gICAgICAgICAgICB0aXRsZTogXCJTaGFyZSAoTGVhZGVyKVwiLFxuICAgICAgICAgICAgaWQ6IFwibGVhZGVyXCIsXG4gICAgICAgICAgICBjbGlja0Z1bmM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBMZWN0dXJlci5zdGFydEJyb2FkY2FzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBodHRwczovL2ljb25tb25zdHIuY29tL2Z1bGxzY3JlZW4tdGhpbi1zdmcvXG4gICAgICAgICAgICBzdmc6IGA8c3ZnIHN0eWxlPVwicG9zaXRpb246cmVsYXRpdmU7IGxlZnQ6MC41cHg7XCIgd2lkdGg9XCIke2RpbWVufXB4XCIgaGVpZ2h0PVwiJHtkaW1lbn1weFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICAgICAgICAgICAgICB4bWxuczpzdmc9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGcgY2xhc3M9XCJsYXllclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm00Ny43OTk5OTksNDMuNjQ5OTk5bC00Ny42OTk5OTksMGwwLC0zOS43NDk5OTlsNDcuNjk5OTk5LDBsMCwzOS43NDk5OTl6bS0xLjk4NzUsLTM3Ljc2MjQ5OWwtNDMuNzI0OTk5LDBsMCwzNS43NzQ5OTlsNDMuNzI0OTk5LDBsMCwtMzUuNzc0OTk5em0tNy45NSwxMy45MTI1bC0xLjk4NzUsMGwwLC02LjQ0MTQ4N2wtMjIuMzQxNDg3LDIyLjM0MTQ4N2w2LjQ0MTQ4NywwbDAsMS45ODc1bC05LjkzNzUsMGwwLC05LjkzNzVsMS45ODc1LDBsMCw2LjQ0MTQ4N2wyMi4zNDE0ODcsLTIyLjM0MTQ4N2wtNi40NDE0ODcsMGwwLC0xLjk4NzVsOS45Mzc1LDBsMCw5LjkzNzV6XCIgZmlsbD1cIiNmZmZmZmZcIiBpZD1cInN2Z18xXCIvPlxuICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5gLFxuICAgICAgICAgICAgdGl0bGU6IFwiRnVsbCBTY3JlZW5cIixcbiAgICAgICAgICAgIGlkOiBcImZ1bGxzY3JlZW4tYnV0dG9uXCIsXG4gICAgICAgICAgICBjbGlja0Z1bmM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBWYXJzLmVuZ2luZS5zd2l0Y2hGdWxsc2NyZWVuKHRydWUpO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNyZW5kZXJDYW52YXNcIikuZm9jdXMoKTsgIC8vIFNvIGtleXByZXNzIHdpbGwgd29yay5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF07XG5cbiAgICAvLyBSZXZlcnNlIHRoZSBidXR0b25zLlxuICAgIGxldCBodG1sID0gXCJcIjtcbiAgICBsZXQgY3VyQm90dG9tID0gNjA7XG4gICAgZm9yIChjb25zdCBidG4gb2YgYnRucy5yZXZlcnNlKCkpIHtcbiAgICAgICAgaHRtbCArPSBgXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdGl0bGU9XCIke2J0bi50aXRsZX1cIlxuICAgICAgICAgICAgICAgIGlkPVwiJHtidG4uaWR9XCJcbiAgICAgICAgICAgICAgICBjbGFzcz1cInVpLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJjb2xvcjp3aGl0ZTtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ODBweDtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OjUwcHg7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OjVweDtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbToke2N1ckJvdHRvbS50b1N0cmluZygpfXB4O1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoNTEsNTEsNTEsMC43KTtcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOm5vbmU7XG4gICAgICAgICAgICAgICAgICAgIG91dGxpbmU6bm9uZTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOnBvaW50ZXI7XCI+XG4gICAgICAgICAgICAgICAgICAgICR7YnRuLnN2Z31cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gICAgICAgIGN1ckJvdHRvbSArPSA1NTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdG8gRE9NLlxuICAgIGpRdWVyeShcImJvZHlcIikuYXBwZW5kKGh0bWwpO1xuXG4gICAgLy8gTWFrZSBidXR0b25zIGNsaWNrYWJsZVxuICAgIGZvciAoY29uc3QgYnRuIG9mIGJ0bnMpIHtcbiAgICAgICAgalF1ZXJ5KFwiI1wiICsgYnRuLmlkKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgICBidG4uY2xpY2tGdW5jKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFsc28gbWFrZSBWUiBidXR0b24gdmlzaWJsZS5cbiAgICBjb25zdCBiYWJ5bG9uVlJpY29uYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiYWJ5bG9uVlJpY29uYnRuXCIpO1xuICAgIGlmIChiYWJ5bG9uVlJpY29uYnRuICE9PSBudWxsKSB7XG4gICAgICAgIGJhYnlsb25WUmljb25idG4uc3R5bGUub3BhY2l0eSA9IFwiMS4wXCI7ICAvLyBOb24gSUU7XG4gICAgICAgIGJhYnlsb25WUmljb25idG4uc3R5bGUuZmlsdGVyID0gXCJhbHBoYShvcGFjaXR5PTEuMClcIjsgIC8vIElFO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIGRlYnVnIG1vZGUuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGRlYnVnTW9kZSgpOiB2b2lkIHtcbiAgICBWYXJzLnNjZW5lLmRlYnVnTGF5ZXIuc2hvdygpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImluc3BlY3Rvci1ob3N0XCIpLnN0eWxlLnpJbmRleCA9IFwiMTVcIjtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzY2VuZS1leHBsb3Jlci1ob3N0XCIpLnN0eWxlLnpJbmRleCA9IFwiMTVcIjtcbiAgICB9LCA1MDApO1xufVxuXG4vLyBGb3IgZGVidWdnaW5nLi4uXG4vLyB3aW5kb3dbXCJkZWJ1Z01vZGVcIl0gPSBkZWJ1Z01vZGU7XG4iLCJpbXBvcnQgKiBhcyBDYW1lcmFzU2V0dXAgZnJvbSBcIi4uL0NhbWVyYXMvU2V0dXBcIjtcbmltcG9ydCAqIGFzIFZSQ2FtZXJhIGZyb20gXCIuLi9DYW1lcmFzL1ZSQ2FtZXJhXCI7XG5pbXBvcnQgKiBhcyBNb2xzTG9hZCBmcm9tIFwiLi4vTW9scy9Mb2FkXCI7XG5pbXBvcnQgKiBhcyBOYXZpZ2F0aW9uIGZyb20gXCIuLi9OYXZpZ2F0aW9uL05hdmlnYXRpb25cIjtcbmltcG9ydCAqIGFzIFBpY2thYmxlcyBmcm9tIFwiLi4vTmF2aWdhdGlvbi9QaWNrYWJsZXNcIjtcbmltcG9ydCAqIGFzIExvYWRpbmdTY3JlZW5zIGZyb20gXCIuLi9VSS9Mb2FkaW5nU2NyZWVuc1wiO1xuaW1wb3J0ICogYXMgVUkyRCBmcm9tIFwiLi4vVUkvVUkyRFwiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBMZWN0dXJlciBmcm9tIFwiLi4vV2ViUlRDL0xlY3R1cmVyXCI7XG5pbXBvcnQgKiBhcyBPcHRpbWl6YXRpb25zIGZyb20gXCIuL09wdGltaXphdGlvbnNcIjtcbmltcG9ydCAqIGFzIFVybFZhcnMgZnJvbSBcIi4uL1ZhcnMvVXJsVmFyc1wiO1xuXG5kZWNsYXJlIHZhciBCQUJZTE9OOiBhbnk7XG5cbi8qKlxuICogTG9hZCB0aGUgc2NlbmUsIHNldHVwIHRoZSBWUiwgZXRjLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpOiB2b2lkIHtcbiAgICBWYXJzLnNldHVwKCk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGluaXRpYWwgbG9hZGluZyBqYXZhc2NyaXB0IHNjcmVlbiAobm90IHRoZSBiYWJ5bG9uanMgbG9hZGluZ1xuICAgIC8vIHNjcmVlbi4uLiBUaGF0J3MgdG8gY29tZSkuXG4gICAgTG9hZGluZ1NjcmVlbnMucmVtb3ZlTG9hZGluZ0phdmFzY3JpcHRTY3JlZW4oKTtcblxuICAgIC8vIEJlY2F1c2Ugb2YgdGhpcyBlcnJvciwgeW91IG5lZWQgdG8gc2V0dXAgVlIgYmVmb3JlIGxvYWRpbmcgdGhlIGJhYnlsb25cbiAgICAvLyBzY2VuZTpcbiAgICAvLyBodHRwczovL2ZvcnVtLmJhYnlsb25qcy5jb20vdC9jcmVhdGVkZWZhdWx0dnJleHBlcmllbmNlLWFuZHJvaWQtY2hyb21lLXZyLW1vZGUtY2hhbmdlLW1hdGVyaWFsLXVudXN1YWwtZXJyb3IvMjczOC80XG4gICAgdnJTZXR1cEJlZm9yZUJhYnlsb25GaWxlTG9hZGVkKCk7XG5cbiAgICBiYWJ5bG9uU2NlbmUoKCkgPT4ge1xuICAgICAgICAvLyBTZXR1cCB0aGUgY2FtZXJhcy5cbiAgICAgICAgQ2FtZXJhc1NldHVwLnNldHVwKCk7XG5cbiAgICAgICAgaWYgKCFVcmxWYXJzLmNoZWNrV2VicnRjSW5VcmwoKSkge1xuICAgICAgICAgICAgLy8gVGhlIGJlbG93IGFyZSBydW4gaWYgbm90IGluIHdlYnJ0YyAobGVhZGVyKSBtb2RlLlxuXG4gICAgICAgICAgICAvLyBTZXR1cCB0aGUgZ2VuZXJhbCB0aGluZ3MgdGhhdCBhcHBseSByZWdhcmRsZXNzIG9mIHRoZSBtb2RlIHVzZWQuXG4gICAgICAgICAgICAvLyBIZXJlIGJlY2F1c2UgaXQgcmVxdWlyZXMgYSBncm91bmQgbWVzaC4gU2V0IHVwIHRoZSBmbG9vciBtZXNoXG4gICAgICAgICAgICAvLyAoaGlkZGVuKS5cbiAgICAgICAgICAgIE5hdmlnYXRpb24uc2V0dXAoKTtcblxuICAgICAgICAgICAgLy8gU2V0dXAgZnVuY3Rpb24gdG8gbWFuYWdlIHBpY2thYmxlIG9iamVjdHMgKGUuZy4sIGZsb29yKS5cbiAgICAgICAgICAgIFBpY2thYmxlcy5zZXR1cCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5LCBubyBWUi5cbiAgICAgICAgICAgIFZhcnMudnJWYXJzLm5hdk1vZGUgPSBOYXZpZ2F0aW9uLk5hdk1vZGUuTm9WUjtcblxuICAgICAgICAgICAgLy8gQWxzbywgbWFrZSBzdXJlIGdyb3VuZCBpcyBub3QgdmlzaWJsZS5cbiAgICAgICAgICAgIGNvbnN0IGdyb3VuZE1lc2ggPSBWYXJzLnNjZW5lLmdldE1lc2hCeUlEKFwiZ3JvdW5kXCIpO1xuICAgICAgICAgICAgZ3JvdW5kTWVzaC52aXNpYmlsaXR5ID0gMDtcblxuICAgICAgICAgICAgLy8gQWxzbyBoaWRlIG5hdmlnYXRpb24gc3BoZXJlLlxuICAgICAgICAgICAgVmFycy52clZhcnMubmF2VGFyZ2V0TWVzaC5pc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvYWQgZXh0cmEgb2JqZWN0c1xuICAgICAgICBNb2xzTG9hZC5zZXR1cCgpO1xuXG4gICAgICAgIC8vIGxvYWRpbmdBc3NldHNEb25lKCksIGJlbG93LCB3aWxsIHJ1biBvbmNlIGFsbCBhc3NldHMgbG9hZGVkLlxuXG4gICAgICAgIC8vIFNldHMgdXAgbmF2IHNlbGVjdGlvbiBidXR0b25zIGluIERPTS5cbiAgICAgICAgVUkyRC5zZXR1cCgpO1xuICAgIH0pO1xuXG4gICAgLy8gV2F0Y2ggZm9yIGJyb3dzZXIvY2FudmFzIHJlc2l6ZSBldmVudHNcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XG4gICAgICAgIFZhcnMuZW5naW5lLnJlc2l6ZSgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEEgZmV3IFZSLXJlbGV2YW50IHRoaW5ncyBuZWVkIHRvIGJlIGhhbmRsZWQgYmVmb3JlIHlvdSBsb2FkIHRoZSBiYWJ5bG9uXG4gKiBzY2VuZS4gVGhlc2UgYXJlIHNlcGFyYXRlZCBpbnRvIHRoaXMgZnVuY3Rpb24gc28gdGhleSBjYW4gYmUgY2FsbGVkXG4gKiBzZXBhcmF0ZWx5LlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiB2clNldHVwQmVmb3JlQmFieWxvbkZpbGVMb2FkZWQoKTogdm9pZCB7XG4gICAgLy8gWW91J2xsIG5lZWQgYSBuYXZpZ2F0aW9uIG1lc2guXG4gICAgY29uc3QgbmF2TWVzaFRvVXNlID0gQkFCWUxPTi5NZXNoLkNyZWF0ZVNwaGVyZShcIm5hdlRhcmdldE1lc2hcIiwgNCwgMC4xLCBWYXJzLnNjZW5lKTtcbiAgICBjb25zdCBuYXZNZXNoTWF0ID0gbmV3IEJBQllMT04uU3RhbmRhcmRNYXRlcmlhbChcIm15TWF0ZXJpYWxcIiwgVmFycy5zY2VuZSk7XG4gICAgbmF2TWVzaE1hdC5kaWZmdXNlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMSwgMCwgMSk7XG4gICAgbmF2TWVzaFRvVXNlLm1hdGVyaWFsID0gbmF2TWVzaE1hdDtcbiAgICBuYXZNZXNoVG9Vc2UucmVuZGVyaW5nR3JvdXBJZCA9IDI7ICAvLyBTbyBhbHdheXMgdmlzaWJsZSwgaW4gdGhlb3J5LlxuXG4gICAgLy8gU2V0dXAgdGhlIFZSIGhlcmUuIFNldCB1cCB0aGUgcGFyYW1ldGVycyAoZmlsbGluZyBpbiBtaXNzaW5nIHZhbHVlcyxcbiAgICAvLyBmb3IgZXhhbXBsZSkuIEFsc28gc2F2ZXMgdGhlIG1vZGlmaWVkIHBhcmFtcyB0byB0aGUgcGFyYW1zIG1vZHVsZVxuICAgIC8vIHZhcmlhYmxlLiBOb3RlIHRoYXQgdGhpcyBjYWxscyBjcmVhdGVEZWZhdWx0VlJFeHBlcmllbmNlLlxuICAgIFZhcnMuc2V0dXBWUih7XG4gICAgICAgIG5hdlRhcmdldE1lc2g6IG5hdk1lc2hUb1VzZSxcbiAgICB9KTtcblxuICAgIC8vIFNldHVwIHRoZSBWUiBjYW1lcmFcbiAgICBWUkNhbWVyYS5zZXR1cCgpO1xuXG4gICAgLy8gT3B0aW1pemUgdGhlIHNjZW5lIHRvIG1ha2UgaXQgcnVuIGJldHRlci5cbiAgICBPcHRpbWl6YXRpb25zLnNldHVwKCk7XG5cbiAgICAvLyBGb3IgZGVidWdnaW5nLi4uXG4gICAgLy8gdHJhY2tEZWJ1Z1NwaGVyZSgpO1xuICAgIC8vIHdpbmRvdy5WYXJzID0gVmFycztcbn1cblxuLyoqXG4gKiBMb2FkIHRoZSBzY2VuZSBmcm9tIHRoZSAuYmFieWxvbiBmaWxlLlxuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxCYWNrRnVuYyBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gcnVuIHdoZW4gbG9hZGVkLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBiYWJ5bG9uU2NlbmUoY2FsbEJhY2tGdW5jOiBhbnkpOiB2b2lkIHtcbiAgICBMb2FkaW5nU2NyZWVucy5iYWJ5bG9uSlNMb2FkaW5nTXNnKFwiTG9hZGluZyB0aGUgbWFpbiBzY2VuZS4uLlwiKTtcblxuICAgIEJBQllMT04uU2NlbmVMb2FkZXIuTG9hZEFzc2V0Q29udGFpbmVyKFZhcnMuc2NlbmVOYW1lLCBcInNjZW5lLmJhYnlsb25cIiwgVmFycy5zY2VuZSwgKGNvbnRhaW5lcjogYW55KSA9PiB7XG4gICAgICAgIExvYWRpbmdTY3JlZW5zLnN0YXJ0RmFrZUxvYWRpbmcoOTApO1xuICAgICAgICBWYXJzLnNjZW5lLmV4ZWN1dGVXaGVuUmVhZHkoKCkgPT4ge1xuICAgICAgICAgICAgLy8gTm93IGxvYWQgc2NlbmVfaW5mby5qc29uIHRvby5cbiAgICAgICAgICAgIGpRdWVyeS5nZXRKU09OKFZhcnMuc2NlbmVOYW1lICsgXCJzY2VuZV9pbmZvLmpzb25cIiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFNhdmUgdmFyaWFibGVzIGZyb20gc2NlbmVfaW5mby5qc29uIHNvIHRoZXkgY2FuIGJlIGFjY2Vzc2VkXG4gICAgICAgICAgICAgICAgLy8gZWxzZXdoZXJlICh0aHJvdWdob3V0IHRoZSBhcHApLlxuXG4gICAgICAgICAgICAgICAgLy8gRGVhY3RpdmF0ZSBtZW51IGlmIGFwcHJvcHJpYXRlLiBOb3RlIHRoYXQgdGhpcyBmZWF0dXJlIGlzXG4gICAgICAgICAgICAgICAgLy8gbm90IHN1cHBvcnRlZCAoZ2l2ZXMgYW4gZXJyb3IpLiBQZXJoYXBzIGluIHRoZSBmdXR1cmUgSVxuICAgICAgICAgICAgICAgIC8vIHdpbGwgcmVpbXBsZW1lbnQgaXQsIHNvIEknbSBsZWF2aW5nIHRoZSB2ZXN0aWdpYWwgY29kZVxuICAgICAgICAgICAgICAgIC8vIGhlcmUuXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJtZW51QWN0aXZlXCJdID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBWYXJzLnZyVmFycy5tZW51QWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRhdGFbXCJwb3NpdGlvbk9uRmxvb3JcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBWYXJzLnNjZW5lSW5mby5wb3NpdGlvbk9uRmxvb3IgPSBkYXRhW1wicG9zaXRpb25PbkZsb29yXCJdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChkYXRhW1wiaW5maW5pdGVEaXN0YW5jZVNreUJveFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIFZhcnMuc2NlbmVJbmZvLmluZmluaXRlRGlzdGFuY2VTa3lCb3ggPSBkYXRhW1wiaW5maW5pdGVEaXN0YW5jZVNreUJveFwiXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YVtcInRyYW5zcGFyZW50R3JvdW5kXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgVmFycy5zY2VuZUluZm8udHJhbnNwYXJlbnRHcm91bmQgPSBkYXRhW1widHJhbnNwYXJlbnRHcm91bmRcIl07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFkZEFsbFRvU2NlbmUoKTtcblxuICAgICAgICAgICAgICAgIC8vIFRoZXJlIHNob3VsZCBiZSBvbmx5IG9uZSBjYW1lcmEgYXQgdGhpcyBwb2ludCwgYmVjYXVzZSB0aGUgVlJcbiAgICAgICAgICAgICAgICAvLyBzdHVmZiBpcyBpbiB0aGUgY2FsbGJhY2suIE1ha2UgdGhhdCB0aGF0IG9uZSBjYW1lcmEgaXMgdGhlXG4gICAgICAgICAgICAgICAgLy8gYWN0aXZlIG9uZS5cbiAgICAgICAgICAgICAgICAvLyBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYSA9ICBWYXJzLnNjZW5lLmNhbWVyYXNbMF07XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGFjdGl2ZSBjYW1lcmEgaXMgdGhlIG9uZSBsb2FkZWQgZnJvbSB0aGUgYmFieWxvblxuICAgICAgICAgICAgICAgIC8vIGZpbGUuIFNob3VsZCBiZSB0aGUgb25seSBvbmUgd2l0aG91dCB0aGUgc3RyaW5nIFZSIGluIGl0LlxuICAgICAgICAgICAgICAgIFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhID0gVmFycy5zY2VuZS5jYW1lcmFzLmZpbHRlcigoYzogYW55KSA9PiBjLm5hbWUuaW5kZXhPZihcIlZSXCIpID09PSAtMSlbMF07XG5cbiAgICAgICAgICAgICAgICAvLyBBdHRhY2ggY2FtZXJhIHRvIGNhbnZhcyBpbnB1dHNcbiAgICAgICAgICAgICAgICAvLyBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5hdHRhY2hDb250cm9sKFZhcnMuY2FudmFzKTtcblxuICAgICAgICAgICAgICAgIGtlZXBPbmx5TGlnaHRXaXRoU2hhZG93bGlnaHRTdWJzdHIoKTtcblxuICAgICAgICAgICAgICAgIGZ1cnRoZXJQcm9jZXNzS2V5TWVzaGVzKCk7XG5cbiAgICAgICAgICAgICAgICBhbGxNYXRlcmlhbHNTaGFkZWxlc3MoKTtcblxuICAgICAgICAgICAgICAgIG9wdGltaXplTWVzaGVzQW5kTWFrZUNsaWNrYWJsZSgpO1xuXG4gICAgICAgICAgICAgICAgY2FsbEJhY2tGdW5jKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSwgKHByb2dyZXNzOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHByb2dyZXNzW1wibGVuZ3RoQ29tcHV0YWJsZVwiXSkge1xuICAgICAgICAgICAgLy8gT25seSB0byA5MCB0byBub3QgZ2l2ZSB0aGUgaW1wcmVzc2lvbiB0aGF0IGl0J3MgZG9uZSBsb2FkaW5nLlxuICAgICAgICAgICAgY29uc3QgcGVyY2VudCA9IE1hdGgucm91bmQoOTAgKiBwcm9ncmVzc1tcImxvYWRlZFwiXSAvIHByb2dyZXNzW1widG90YWxcIl0pO1xuICAgICAgICAgICAgTG9hZGluZ1NjcmVlbnMuYmFieWxvbkpTTG9hZGluZ01zZyhcIkxvYWRpbmcgdGhlIG1haW4gc2NlbmUuLi4gXCIgKyBwZXJjZW50LnRvU3RyaW5nKCkgKyBcIiVcIik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBPbmx5IHRoZSBsaWdodCB3aXRoIHNoYWRvd2xpZ2h0IHNob3VsZCBiZSByZXRhaW5lZC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24ga2VlcE9ubHlMaWdodFdpdGhTaGFkb3dsaWdodFN1YnN0cigpOiB2b2lkIHtcbiAgICAvLyBEZWxldGUgYWxsIHRoZSBsaWdodHMgYnV0IHRoZSBmaXJzdCBvbmUgdGhhdCBoYXMgdGhlIHN1YnN0cmluZ1xuICAgIC8vIHNoYWRvd2xpZ2h0IG9yIHNoYWRvd19saWdodC5cbiAgICBsZXQgZm91bmRGaXJzdFNoYWRvd0xpZ2h0ID0gZmFsc2U7XG4gICAgbGV0IGluZGV4VG9Vc2UgPSAwO1xuICAgIHdoaWxlIChWYXJzLnNjZW5lLmxpZ2h0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IGxpZ2h0ID0gVmFycy5zY2VuZS5saWdodHNbaW5kZXhUb1VzZV07XG4gICAgICAgIGNvbnN0IGxpZ2h0TmFtZSA9IGxpZ2h0Lm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaXNTaGFkb3dMaWdodCA9IChcbiAgICAgICAgICAgIChsaWdodE5hbWUuaW5kZXhPZihcInNoYWRvd2xpZ2h0XCIpICE9PSAtMSkgfHxcbiAgICAgICAgICAgIChsaWdodE5hbWUuaW5kZXhPZihcInNoYWRvd19saWdodFwiKSAhPT0gLTEpXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCFpc1NoYWRvd0xpZ2h0KSB7XG4gICAgICAgICAgICAvLyBJdCdzIG5vdCBhIHNoYWRvdyBsaWdodC4gRGVsZXRlIGl0LlxuICAgICAgICAgICAgVmFycy5zY2VuZS5saWdodHNbaW5kZXhUb1VzZV0uZGlzcG9zZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGZvdW5kRmlyc3RTaGFkb3dMaWdodCkge1xuICAgICAgICAgICAgLy8gWW91J3ZlIGFscmVhZHkgZm91bmQgYSBzaGFkb3cgbGlnaHQuIERlbGV0ZSBhZGRpdGlvbmFsXG4gICAgICAgICAgICAvLyBvbmVzLlxuICAgICAgICAgICAgVmFycy5zY2VuZS5saWdodHNbaW5kZXhUb1VzZV0uZGlzcG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTXVzdCBiZSB0aGUgZmlyc3Qgc2hhZG93IGxpZ2h0LiBEb24ndCBkZWxldGUsIGJ1dCBtYWtlXG4gICAgICAgICAgICAvLyBub3RlIG9mIGl0LlxuICAgICAgICAgICAgZm91bmRGaXJzdFNoYWRvd0xpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGluZGV4VG9Vc2UrKztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBIaWRlcyBtZXNoZXMgdGhhdCBhcmUgb25seSB1c2VkIGZvciBzY2VuZSBjcmVhdGlvbi4gQWxzbyBkZWFscyB3aXRoXG4gKiBza3lib3hlcyBhbmQgb3RoZXIgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gZnVydGhlclByb2Nlc3NLZXlNZXNoZXMoKTogdm9pZCB7XG4gICAgLy8gSGlkZSBvYmplY3RzIHVzZWQgZm9yIHNjZW5lIGNyZWF0aW9uLlxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGxlbiA9IFZhcnMuc2NlbmUubWVzaGVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBtZXNoSWR4ID0gMDsgbWVzaElkeCA8IGxlbjsgbWVzaElkeCsrKSB7XG4gICAgICAgIGNvbnN0IG1lc2ggPSBWYXJzLnNjZW5lLm1lc2hlc1ttZXNoSWR4XTtcbiAgICAgICAgaWYgKG1lc2gubmFtZSA9PT0gXCJwcm90ZWluX2JveFwiKSB7XG4gICAgICAgICAgICBtZXNoLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKG1lc2gubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJza3lib3hcIikgIT09IC0xKSB7XG4gICAgICAgICAgICBpZiAoVmFycy5zY2VuZUluZm8uaW5maW5pdGVEaXN0YW5jZVNreUJveCkge1xuICAgICAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuZGlzYWJsZUxpZ2h0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBtZXNoLmluZmluaXRlRGlzdGFuY2UgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDYXVzZXMgc2t5Ym94IHRvIGdvIGJsYWNrLiBJIHRoaW5rIHlvdSdkIG5lZWQgdG8gc2V0IHRvIDAsIGFuZFxuICAgICAgICAgICAgLy8gYWxsIG90aGVyIG1lc2hlcyB0byAxLlxuICAgICAgICAgICAgLy8gbWVzaC5yZW5kZXJpbmdHcm91cElkID0gLTE7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQWxsIG9iamVjdHMgd2l0aCBtYXRlcmlhbHMgdGhhdCBoYXZlIGVtaXNzaXZlIHRleHR1cmVzIHNob3VsZCBiZSBzaGFkZWxlc3MuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGFsbE1hdGVyaWFsc1NoYWRlbGVzcygpOiB2b2lkIHtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBjb25zdCBsZW4gPSBWYXJzLnNjZW5lLm1lc2hlcy5sZW5ndGg7XG4gICAgZm9yIChsZXQgbWVzaElkeCA9IDA7IG1lc2hJZHggPCBsZW47IG1lc2hJZHgrKykge1xuICAgICAgICBjb25zdCBtZXNoID0gVmFycy5zY2VuZS5tZXNoZXNbbWVzaElkeF07XG4gICAgICAgIGlmICghbWVzaC5tYXRlcmlhbCkgeyBjb250aW51ZTsgfVxuXG4gICAgICAgIC8vIEl0IGhhcyBhIG1hdGVyaWFsXG4gICAgICAgIGlmIChtZXNoLm1hdGVyaWFsLmVtaXNzaXZlVGV4dHVyZSkge1xuICAgICAgICAgICAgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpO1xuICAgICAgICAgICAgbWVzaC5tYXRlcmlhbC5hbGJlZG9Db2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKTtcbiAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuYW1iaWVudENvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXQgaGFzIHN1Ym1hdGVyaWFscy5cbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIC8vIGlmIChtZXNoLm1hdGVyaWFsLnN1Yk1hdGVyaWFscykge1xuICAgICAgICAvLyAgICAgbGV0IGxlbjIgPSBtZXNoLm1hdGVyaWFsLnN1Yk1hdGVyaWFscy5sZW5ndGg7XG4gICAgICAgIC8vICAgICBmb3IgKGxldCBtYXRJZHggPSAwOyBtYXRJZHggPCBsZW4yOyBtYXRJZHgrKykge1xuICAgICAgICAvLyAgICAgICAgIGxldCBtYXQgPSBtZXNoLm1hdGVyaWFsLnN1Yk1hdGVyaWFsc1ttYXRJZHhdO1xuICAgICAgICAvLyAgICAgICAgIGlmIChtYXQuZW1pc3NpdmVUZXh0dXJlKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIG1hdC5lbWlzc2l2ZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDEsIDEsIDEpO1xuICAgICAgICAvLyAgICAgICAgICAgICBtYXQuYWxiZWRvQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XG4gICAgICAgIC8vICAgICAgICAgICAgIG1hdC5hbWJpZW50Q29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG4gICAgfVxufVxuXG4vKipcbiAqIE9wdGltaXplcyBtZXNoZXMgYW5kIG1ha2VzIHRoZW0gY2xpY2thYmxlLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBvcHRpbWl6ZU1lc2hlc0FuZE1ha2VDbGlja2FibGUoKTogdm9pZCB7XG4gICAgLy8gT3B0aW1pemUgYW5kIG1ha2UgbWVzaGVzIGNsaWNrYWJsZS4gQWxzbywgbWFrZSBzdXJlIGFsbCBtZXNoZXNcbiAgICAvLyBhcmUgZW1taXNzaXZlLlxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGxlbiA9IFZhcnMuc2NlbmUubWVzaGVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBtZXNoSWR4ID0gMDsgbWVzaElkeCA8IGxlbjsgbWVzaElkeCsrKSB7XG4gICAgICAgIGlmIChWYXJzLnNjZW5lLm1lc2hlc1ttZXNoSWR4XS5tYXRlcmlhbCkge1xuICAgICAgICAgICAgY29uc3QgbWVzaCA9IFZhcnMuc2NlbmUubWVzaGVzW21lc2hJZHhdO1xuXG4gICAgICAgICAgICAvLyBJdCBuZWVkcyB0byBiZSBlbW1pc2l2ZSAoc28gYWx3YXlzIGJha2VkKS5cbiAgICAgICAgICAgIGlmICgobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZVRleHR1cmUgPT09IHVuZGVmaW5lZCkgfHwgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmVUZXh0dXJlID09PSBudWxsKSkge1xuICAgICAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmVUZXh0dXJlID0gbWVzaC5tYXRlcmlhbC5kaWZmdXNlVGV4dHVyZTtcblxuICAgICAgICAgICAgICAgIC8vIEJlbG93IHNlZW1zIGltcG9ydGFudCB0byBjb21tZW50IG91dC4gLmNsb25lKClcbiAgICAgICAgICAgICAgICAvLyBhYm92ZSBhbmQgLmRpc3Bvc2UoKSBiZWxvdyBkb2Vzbid0IHdvcmsuIEFsc28sXG4gICAgICAgICAgICAgICAgLy8gYmVsb3cgPSBudWxsIGFuZCA9IHVuZGVmaW5lZCBkaWRuJ3Qgd29yay4gTm8gZ29vZFxuICAgICAgICAgICAgICAgIC8vIHNvbHV0aW9ucywgc28gbGVhdmUgZGlmZnVzZSB0ZXh0dXJlIGluIHBsYWNlP1xuXG4gICAgICAgICAgICAgICAgLy8gbWVzaC5tYXRlcmlhbC5kaWZmdXNlVGV4dHVyZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IEJBQllMT04uQ29sb3IzKDAsIDAsIDApO1xuICAgICAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuc3BlY3VsYXJDb2xvciA9IG5ldyBCQUJZTE9OLkNvbG9yMygwLCAwLCAwKTtcbiAgICAgICAgICAgICAgICBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlQ29sb3IgPSBuZXcgQkFCWUxPTi5Db2xvcjMoMCwgMCwgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRPRE86IFVzaW5nIGZhbHNlIGJlbG93IHRvIG5vdCBmcmVlemUgbWF0ZXJpYWxzLlxuICAgICAgICAgICAgLy8gVGhleSBhcmUgd2hpdGUgb3RoZXJ3aXNlLiBHb29kIHRvIGZpZ3VyZSBvdXQgd2h5LlxuICAgICAgICAgICAgT3B0aW1pemF0aW9ucy5mcmVlemVNZXNoUHJvcHMobWVzaCwgZmFsc2UpO1xuICAgICAgICAgICAgUGlja2FibGVzLm1ha2VNZXNoTW91c2VDbGlja2FibGUoe1xuICAgICAgICAgICAgICAgIG1lc2gsXG4gICAgICAgICAgICAgICAgc2NlbmU6IFZhcnMuc2NlbmUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBUaGlzIHJ1bnMgd2hlbiBhbGwgdGhlIGFzc2V0cyBhcmUgZnVsbHkgbG9hZGVkLiBEb2VzIHRoaW5ncyBsaWtlIHN0YXJ0IHRoZVxuICogcmVuZGVyIGxvb3AuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkaW5nQXNzZXRzRG9uZSgpOiB2b2lkIHtcbiAgICAvLyBHaXZlIGl0IGEgYml0IHRvIGxldCBvbmUgcmVuZGVyIGN5Y2xlIGdvIHRocm91Z2guIEhhY2tpc2gsXG4gICAgLy8gYWRtaXR0ZWRseS5cbiAgICBzZXRUaW1lb3V0KE9wdGltaXphdGlvbnMudXBkYXRlRW52aXJvbm1lbnRTaGFkb3dzLCAxMDAwKTtcblxuICAgIC8vIFN0b3Agc2hvd2luZyB0aGUgZmFrZSBsb2FkaW5nIHNjcmVlbi5cbiAgICBMb2FkaW5nU2NyZWVucy5zdG9wRmFrZUxvYWRpbmcoKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgY2FtZXJhIGNhbiBzZWUgZmFyIGVub3VnaC5cbiAgICBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5tYXhaID0gMjUwO1xuXG4gICAgLy8gTWFrZSBzdXJlIGNhbWVyYSBjYW4gc2VlIG9iamVjdHMgdGhhdCBhcmUgdmVyeSBjbG9zZS5cbiAgICBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5taW5aID0gMDtcblxuICAgIC8vIFN0YXJ0IHRoZSByZW5kZXIgbG9vcC4gUmVnaXN0ZXIgYSByZW5kZXIgbG9vcCB0byByZXBlYXRlZGx5IHJlbmRlciB0aGVcbiAgICAvLyBzY2VuZVxuICAgIFZhcnMuZW5naW5lLnJ1blJlbmRlckxvb3AoKCkgPT4ge1xuICAgICAgICBWYXJzLnNjZW5lLnJlbmRlcigpO1xuICAgIH0pO1xufVxuIiwiLy8gRnVuY3Rpb25zIHRoYXQgYXJlIGNvbW1vbiB0byB0aGUgbWFpbiBjbGFzc2VzIG9mIExlY3R1cmVyLnRzIGFuZFxuLy8gU3R1ZGVudC50cy5cblxuaW1wb3J0ICogYXMgT3BlblBvcHVwIGZyb20gXCIuLi9VSS9PcGVuUG9wdXAvT3BlblBvcHVwXCI7XG5cbmRlY2xhcmUgdmFyIFBlZXI6IGFueTtcblxuZXhwb3J0IGxldCBERUJVRyA9IGZhbHNlO1xuXG5leHBvcnQgY2xhc3MgV2ViUlRDQmFzZSB7XG4gICAgLy8gU29tZSBmdW5jdGlvbnMgYXJlIGNvbW1vbiB0byBib3RoIHNlbmRlcnMgYW5kIHJlY2VpdmVycy5cbiAgICBwdWJsaWMgcGVlcklkOiBzdHJpbmcgPSBudWxsO1xuICAgIHByb3RlY3RlZCBwZWVyOiBhbnkgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlUGVlck9iaigpO1xuICAgICAgICB0aGlzLnNldHVwV2ViUlRDQ2xvc2VGdW5jcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBwZWVyLmpzIG9iamVjdCBmb3IgdXNlIGluIGxlYWRlciBtb2RlLlxuICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVBlZXJPYmooKTogdm9pZCB7XG4gICAgICAgIC8vIENyZWF0ZSBvd24gcGVlciBvYmplY3Qgd2l0aCBjb25uZWN0aW9uIHRvIHNoYXJlZCBQZWVySlMgc2VydmVyXG4gICAgICAgIC8vIGxldCBpZFRvVXNlID0gXCJwdnJcIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA1KSArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA1KTsgIC8vIG51bGwgYW5kIGl0IGdldHMgcGlja2VkIGZvciB5b3UuXG5cbiAgICAgICAgY29uc3Qgd3JkcyA9IFtcImFjdFwiLCBcImFkZFwiLCBcImFnZVwiLCBcImFnb1wiLCBcImFpZFwiLCBcImFpbVwiLCBcImFpclwiLCBcImFsbFwiLFxuICAgICAgICAgICAgICAgICAgICBcImFuZFwiLCBcImFueVwiLCBcImFybVwiLCBcImFydFwiLCBcImFza1wiLCBcImJhZ1wiLCBcImJhblwiLCBcImJhclwiLFxuICAgICAgICAgICAgICAgICAgICBcImJlZFwiLCBcImJldFwiLCBcImJpZ1wiLCBcImJpdFwiLCBcImJveFwiLCBcImJ1c1wiLCBcImJ1dFwiLCBcImJ1eVwiLFxuICAgICAgICAgICAgICAgICAgICBcImNhblwiLCBcImNhcFwiLCBcImNhclwiLCBcImNhdFwiLCBcImNlb1wiLCBcImNvd1wiLCBcImNyeVwiLCBcImN1cFwiLFxuICAgICAgICAgICAgICAgICAgICBcImRheVwiLCBcImRpZ1wiLCBcImRuYVwiLCBcInJuYVwiLCBcImRvZ1wiLCBcImRyeVwiLCBcImR1ZVwiLCBcImVhclwiLFxuICAgICAgICAgICAgICAgICAgICBcImVhdFwiLCBcImVnZ1wiLCBcImVuZFwiLCBcImVyYVwiLCBcImV0Y1wiLCBcImV5ZVwiLCBcImZhblwiLCBcImZhclwiLFxuICAgICAgICAgICAgICAgICAgICBcImZlZVwiLCBcImZld1wiLCBcImZpdFwiLCBcImZpeFwiLCBcImZseVwiLCBcImZvclwiLCBcImZ1blwiLCBcImdhcFwiLFxuICAgICAgICAgICAgICAgICAgICBcImdldFwiLCBcImd1eVwiLCBcImhhdFwiLCBcImhleVwiLCBcImhpcFwiLCBcImhpdFwiLCBcImhvdFwiLCBcImhvd1wiLFxuICAgICAgICAgICAgICAgICAgICBcImljZVwiLCBcIml0c1wiLCBcImpldFwiLCBcImpvYlwiLCBcImpveVwiLCBcImtleVwiLCBcImtpZFwiLCBcImxhYlwiLFxuICAgICAgICAgICAgICAgICAgICBcImxhd1wiLCBcImxheVwiLCBcImxldFwiLCBcImxpZVwiLCBcImxvdFwiLCBcImxvd1wiLCBcIm1hcFwiLCBcIm1heVwiLFxuICAgICAgICAgICAgICAgICAgICBcIm1peFwiLCBcIm5ldFwiLCBcIm5ld1wiLCBcIm5vZFwiLCBcIm5vclwiLCBcIm5vdFwiLCBcIm5vd1wiLCBcIm51dFwiLFxuICAgICAgICAgICAgICAgICAgICBcIm9kZFwiLCBcIm9mZlwiLCBcIm9pbFwiLCBcIm9sZFwiLCBcIm9uZVwiLCBcIm91clwiLCBcIm91dFwiLCBcIm93ZVwiLFxuICAgICAgICAgICAgICAgICAgICBcIm93blwiLCBcInBhblwiLCBcInBheVwiLCBcInBlclwiLCBcInBldFwiLCBcInBpZVwiLCBcInBvcFwiLCBcInB1dFwiLFxuICAgICAgICAgICAgICAgICAgICBcInJhd1wiLCBcInJlZFwiLCBcInJpZFwiLCBcInJvd1wiLCBcInJ1blwiLCBcInNheVwiLCBcInNlYVwiLCBcInNlZVwiLFxuICAgICAgICAgICAgICAgICAgICBcInNldFwiLCBcInNpdFwiLCBcInNpeFwiLCBcInNraVwiLCBcInNreVwiLCBcInN1ZVwiLCBcInN1blwiLCBcInRhcFwiLFxuICAgICAgICAgICAgICAgICAgICBcInRheFwiLCBcInRlblwiLCBcInRoZVwiLCBcInRvZVwiLCBcInRvb1wiLCBcInRvcFwiLCBcInRveVwiLCBcInRyeVwiLFxuICAgICAgICAgICAgICAgICAgICBcInR3b1wiLCBcInVzZVwiLCBcInZpYVwiLCBcIndhclwiLCBcIndheVwiLCBcIndldFwiLCBcIndob1wiLCBcIndoeVwiLFxuICAgICAgICAgICAgICAgICAgICBcIndpblwiLCBcInllc1wiLCBcInlldFwiLCBcInlvdVwiXTtcbiAgICAgICAgbGV0IGlkVG9Vc2UgPSBcInB2clwiICsgdGhpcy5yYW5kb21OdW1TdHIoKTtcbiAgICAgICAgaWRUb1VzZSArPSB3cmRzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdyZHMubGVuZ3RoKV0gKyB0aGlzLnJhbmRvbU51bVN0cigpO1xuICAgICAgICAvLyBpZFRvVXNlICs9IHdyZHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd3Jkcy5sZW5ndGgpXSArIHRoaXMucmFuZG9tTnVtU3RyKCk7XG4gICAgICAgIGlkVG9Vc2UgPSBpZFRvVXNlLnJlcGxhY2UoL1xcLi9nLCBcIlwiKTtcblxuICAgICAgICAvLyBSZW1vdmUgc29tZSBhbWJpZ3VvdXMgb25lcy5cbiAgICAgICAgLy8gZm9yIChsZXQgYyBvZiBbXCIxXCIsIFwibFwiLCBcIk9cIiwgXCIwXCJdKSB7XG4gICAgICAgIC8vICAgICBpZFRvVXNlID0gaWRUb1VzZS5yZXBsYWNlKGMsIFwiXCIpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdGhpcy5wZWVyID0gbmV3IFBlZXIoaWRUb1VzZSwge1xuICAgICAgICAgICAgXCJkZWJ1Z1wiOiAyLFxuICAgICAgICAgICAgXCJjb25maWdcIjogeydpY2VTZXJ2ZXJzJzogW1xuICAgICAgICAgICAgICAgIHtcInVybHNcIjogJ3N0dW46MC5wZWVyanMuY29tJ30sXG4gICAgICAgICAgICAgICAge1widXJsc1wiOiAnc3R1bjpzdHVuLmwuZ29vZ2xlLmNvbToxOTMwMid9LFxuICAgICAgICAgICAgICAgIHtcInVybHNcIjogJ3N0dW46ZHVycmFudGxhYi5jb20vYXBwcy9wcm90ZWludnIvc3R1bid9ICAvLyBub3QgeWV0IGltcGxlbWVudGVkXG4gICAgICAgICAgICAgICAgLy8ge1widXJsXCI6ICdzdHVuOnN0dW4xLmwuZ29vZ2xlLmNvbToxOTMwMid9LFxuICAgICAgICAgICAgICAgIC8vIHtcInVybFwiOiAnc3R1bjpzdHVuMi5sLmdvb2dsZS5jb206MTkzMDInfSxcbiAgICAgICAgICAgICAgICAvLyB7XCJ1cmxcIjogJ3N0dW46c3R1bjMubC5nb29nbGUuY29tOjE5MzAyJ30sXG4gICAgICAgICAgICAgICAgLy8ge1widXJsXCI6ICdzdHVuOnN0dW40LmwuZ29vZ2xlLmNvbToxOTMwMid9LFxuICAgICAgICAgICAgICAgIC8vIHt1cmw6ICd0dXJuOmhvbWVvQHR1cm4uYmlzdHJpLmNvbTo4MCcsIGNyZWRlbnRpYWw6ICdob21lbyd9XG4gICAgICAgICAgICBdfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIHRoZSBmdW5jdGlvbnMgdGhhdCBhcmUgZmlyZWQgd2hlbiBwZWVyLmpzIGRpc2Nvbm5lY3RzIG9yXG4gICAgICogcHJvZHVjZXMgYW4gZXJyb3IuXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0dXBXZWJSVENDbG9zZUZ1bmNzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnBlZXIub24oXCJkaXNjb25uZWN0ZWRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgd2ViUlRDU3RhbmRhcmRFcnJvck1zZygpO1xuICAgICAgICAgICAgaWYgKERFQlVHID09PSB0cnVlKSB7IGNvbnNvbGUubG9nKFwiQ29ubmVjdGlvbiBsb3N0LiBQbGVhc2UgcmVjb25uZWN0XCIpOyB9XG5cbiAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIHBlZXIucmVjb25uZWN0IGRlbGV0aW5nIHByZXZpb3VzIGlkXG4gICAgICAgICAgICB0aGlzLnBlZXIuaWQgPSB0aGlzLnBlZXJJZDtcbiAgICAgICAgICAgIHRoaXMucGVlci5fbGFzdFNlcnZlcklkID0gdGhpcy5wZWVySWQ7XG4gICAgICAgICAgICB0aGlzLnBlZXIucmVjb25uZWN0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGVlci5vbihcImVycm9yXCIsIChlcnI6IGFueSkgPT4ge1xuICAgICAgICAgICAgd2ViUlRDRXJyb3JNc2coZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByYW5kb21OdW1TdHIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKS5yZXBsYWNlKC9cXC4vZywgXCJcIikucmVwbGFjZSgvMC9nLCBcIlwiKS5zbGljZSgwLCAzKTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhyb3cgYSBnZW5lcmljIGVycm9yIG1lc3NhZ2UgdG8gbGV0IHRoZSB1c2VyIGtub3cgdGhhdCB0aGUgY29ubmVjdGlvbiBoYXNcbiAqIGZhaWxlZC5cbiAqIEBwYXJhbSAge3N0cmluZ30gZGV0YWlscyAgQW4gYWRkaXRpb25hbCBtZXNzYWdlIHRvIGRpc3BsYXksIGJleW9uZCB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdCBvbmUuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWJSVENFcnJvck1zZyhkZXRhaWxzID0gXCJcIik6IHZvaWQge1xuICAgIGxldCBtc2cgPSBcIjxwPlByb3RlaW5WUiBoYXMgZW5jb3VudGVyZWQgYW4gZXJyb3Igd2hpbGUgcnVubmluZyBpbiBsZWFkZXIgbW9kZS4gXCI7XG4gICAgaWYgKGRldGFpbHMgIT09IFwiXCIpIHtcbiAgICAgICAgbXNnICs9IFwiIEhlcmUgYXJlIHRoZSBkZXRhaWxzOjwvcD5cIjtcbiAgICAgICAgbXNnICs9IFwiPHA+PHByZT5cIiArIGRldGFpbHMgKyBcIjwvcHJlPjwvcD5cIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtc2cgKz0gXCI8L3A+XCI7XG4gICAgfVxuXG4gICAgT3BlblBvcHVwLm9wZW5Nb2RhbChcIkxlYWRlciBFcnJvclwiLCBtc2csIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBTaG93IHRoZSBzdGFuZGFyZCBcInBsZWFzZSByZWZyZXNoXCIgZXJyb3IgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlYlJUQ1N0YW5kYXJkRXJyb3JNc2coKTogdm9pZCB7XG4gICAgd2ViUlRDRXJyb3JNc2coXCJMZWFkZXIgY29ubmVjdGlvbiBkZXN0cm95ZWQuIFBsZWFzZSByZWZyZXNoLlwiKTtcbn1cbiIsIi8vIEEgcGxhY2UgdG8gcHV0IHZhcmlhYmxlcyB0aGF0IG5lZWQgdG8gYmUgYWNjZXNzZWQgZnJvbSBtdWx0aXBsZSBwbGFjZXMuXG4vLyBUaGlzIG1vZHVsZSBpcyBhIHBsYWNlIHRvIHN0b3JlIFwiZ2xvYmFsXCIgdmFyaWFibGVzLlxuXG5pbXBvcnQgKiBhcyBOYXZpZ2F0aW9uIGZyb20gXCIuLi9OYXZpZ2F0aW9uL05hdmlnYXRpb25cIjtcbmltcG9ydCAqIGFzIFVybFZhcnMgZnJvbSBcIi4vVXJsVmFyc1wiO1xuXG5kZWNsYXJlIHZhciBCQUJZTE9OOiBhbnk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZSU2V0dXAge1xuICAgIGdyb3VuZE1lc2g/OiBhbnk7ICAvLyBUaGUgYWN0dWFsIG1lc2hcbiAgICBuYXZUYXJnZXRNZXNoPzogYW55OyAgICAgICAgICAgIC8vIFRoZSBtZXNoIHRoYXQgYXBwZWFycyB3aGVyZSB5b3UncmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdhemluZy4gQWx3YXlzIG9uLCBldmVuIGR1cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGVsZXBvcnRhdGlvbi4gVGhpcyBpcyBhbHNvIHVzZWQgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRldGVybWluZSB0aGUgbG9jYXRpb24gb2YgdGhlIGdhemUuIElmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3Qgc2V0LCBhbiBlbXB0eSBpcyB1c2VkIGZvciB0cmFja2luZy5cbiAgICBuYXZNb2RlPzogTmF2aWdhdGlvbi5OYXZNb2RlO1xuICAgIG1lbnVBY3RpdmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgbGV0IGNhbnZhczogYW55O1xuZXhwb3J0IGxldCBlbmdpbmU6IGFueTtcbmV4cG9ydCBsZXQgc2NlbmU6IGFueTtcbmV4cG9ydCBsZXQgdnJIZWxwZXI6IGFueTtcbmV4cG9ydCBsZXQgc2NlbmVOYW1lID0gXCJlbnZpcm9ucy9kYXkvXCI7XG5cbi8qKlxuICogU2V0dGVyIGZvciBzY2VuZU5hbWUgdmFyaWFibGUuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHZhbCAgVGhlIHZhbHVlIHRvIHNldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFNjZW5lTmFtZSh2YWw6IHN0cmluZykgeyBzY2VuZU5hbWUgPSB2YWw7IH1cblxuLy8gRnJvbSBzY2VuZV9pbmZvLmpzb25cbmV4cG9ydCBsZXQgc2NlbmVJbmZvID0ge1xuICAgIHBvc2l0aW9uT25GbG9vcjogZmFsc2UsXG4gICAgaW5maW5pdGVEaXN0YW5jZVNreUJveDogdHJ1ZSxcbiAgICB0cmFuc3BhcmVudEdyb3VuZDogZmFsc2Vcbn07XG5cbi8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuZXhwb3J0IGxldCBjYW1lcmFIZWlnaHQ6IG51bWJlcjtcblxuLy8gQWxzbyBzb21lIGNvbnN0YW50c1xuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuZXhwb3J0IGNvbnN0IFRSQU5TUE9SVF9EVVJBVElPTiA9IDExO1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgTUFYX0RJU1RfVE9fTU9MX09OX1RFTEVQT1JUID0gMS41O1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgTUlOX0RJU1RfVE9fTU9MX09OX1RFTEVQT1JUID0gMS4wO1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgTUFYX1ZFUlRTX1BFUl9TVUJNRVNIID0gMjAwMDsgIC8vIFRoaXMgaXMga2luZCBvZiBhbiBhcmJpdHJhcnkgbnVtYmVyLlxuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgQlVUVE9OX1NQSEVSRV9SQURJVVMgPSAxLjI7ICAvLyB0aGUgcmFkaXVzIG9mIHRoZSBzcGhlcmVzIGFyb3VuZCBidXR0b25zIHVzZWQgdG8gZGV0ZWN0IGNsaWNrcy5cblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfUkFESVVTID0gMi41OyAgLy8gMyBpcyBjb21mb3J0YWJsZSwgYnV0IGRvZXNuJ3Qgd29yayBpbiBjcm93ZGVkIGVudmlyb25tZW50cy5cblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuZXhwb3J0IGNvbnN0IE1FTlVfTUFSR0lOID0gMC4wNTsgIC8vIDAuMTU7ICAvLyAwLjE7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmV4cG9ydCBjb25zdCBQQURfTU9WRV9TUEVFRCA9IDAuMDE7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmV4cG9ydCBjb25zdCBWUl9DT05UUk9MTEVSX1RSSUdHRVJfREVMQVlfVElNRSA9IDUwMDsgIC8vIHRpbWUgdG8gd2FpdCBiZXR3ZWVuIHRyaWdnZXJzLlxuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgVlJfQ09OVFJPTExFUl9QQURfUk9UQVRJT05fREVMQVlfVElNRSA9IDc1MDsgIC8vIHRpbWUgdG8gd2FpdCBiZXR3ZWVuIHRyaWdnZXJzLlxuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgVlJfQ09OVFJPTExFUl9QQURfUkFUSU9fT0ZfTUlERExFX0ZPUl9DQU1FUkFfUkVTRVQgPSAwLjE7XG5cbi8qKiBAY29uc3Qge251bWJlcn0gKi9cbmV4cG9ydCBjb25zdCBNQVhfVEVMRVBPUlRfRElTVCA9IDE1O1xuXG4vKiogQGNvbnN0IHtudW1iZXJ9ICovXG5leHBvcnQgY29uc3QgVFJBTlNQQVJFTlRfRkxPT1JfQUxQSEEgPSAwLjA1OyAgLy8gMC4wMjtcblxuLy8gSU9TIGRvZXNuJ3Qgc3VwcG9ydCBhIGxvdCBvZiBmZWF0dXJlcyFcbi8qKiBAY29uc3Qgeyp9ICovXG4vLyBleHBvcnQgY29uc3QgSU9TOiBib29sZWFuID0gZmFsc2U7ICAvLyBUT0RPOiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhd2luZG93W1wiTVNTdHJlYW1cIl07XG5cbi8vIFZhcmlhYmxlcyB0aGF0IGNhbiBjaGFuZ2UuXG5leHBvcnQgbGV0IHZyVmFyczogSVZSU2V0dXAgPSB7fTtcblxuLyoqXG4gKiBTZXR1cCB0aGUgVmFycy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVuZGVyQ2FudmFzXCIpO1xuXG4gICAgLy8gR2VuZXJhdGUgdGhlIEJBQllMT04gM0QgZW5naW5lXG4gICAgZW5naW5lID0gbmV3IEJBQllMT04uRW5naW5lKGNhbnZhcywgdHJ1ZSk7XG5cbiAgICBpZiAodHJ1ZSkgeyAgLy8gdHJ1ZSBtZWFucyB1c2UgbWFuaWZlc3QgZmlsZXMuXG4gICAgICAgIEJBQllMT04uRGF0YWJhc2UuSURCU3RvcmFnZUVuYWJsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZ2luZS5lbmFibGVPZmZsaW5lU3VwcG9ydCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNjZW5lID0gbmV3IEJBQllMT04uU2NlbmUoZW5naW5lKTtcblxuICAgIC8vIEZvciBkZWJ1Z2dpbmcuLi5cbiAgICB3aW5kb3dbXCJzY2VuZVwiXSA9IHNjZW5lO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGNhbWVyYSBoZWlnaHQgZnJvbSB0aGUgYWN0aXZlIGNhbWVyYS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZUNhbWVyYUhlaWdodEZyb21BY3RpdmVDYW1lcmEoKTogdm9pZCB7XG4gICAgLy8gR2V0IHRoZSBjYW1lcmEgaGVpZ2h0LiBCdXQgSSBkb24ndCB0aGluayB0aGlzIHZhcmlhYmxlIGlzIGV2ZXJ5XG4gICAgLy8gYWN0dWFsbHkgdXNlZCBhbnl3aGVyZS4uLlxuICAgIGlmIChjYW1lcmFIZWlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGNhbWVyYSBoZWlnaHQgZnJvbSBpdCdzIHBvc2l0aW9uLlxuICAgICAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgICAgICBjb25zdCByYXkgPSBuZXcgQkFCWUxPTi5SYXkoXG4gICAgICAgICAgICBzY2VuZS5hY3RpdmVDYW1lcmEucG9zaXRpb24sIG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgLTEsIDApLCA1MCxcbiAgICAgICAgKTtcblxuICAgICAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgICAgICBjb25zdCBwaWNraW5nSW5mbyA9IHNjZW5lLnBpY2tXaXRoUmF5KHJheSwgKG1lc2g6IGFueSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChtZXNoLm5hbWUgPT09IFwiZ3JvdW5kXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW1lcmFIZWlnaHQgPSBwaWNraW5nSW5mby5kaXN0YW5jZTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyB0aGUgY2FtZXJhIGhlaWdodC5cbiAqIEBwYXJhbSAge251bWJlcn0gaGVpZ2h0ICBUaGUgaGVpZ2h0LlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FtZXJhSGVpZ2h0KGhlaWdodDogbnVtYmVyKTogdm9pZCB7XG4gICAgY2FtZXJhSGVpZ2h0ID0gaGVpZ2h0O1xufVxuXG4vKipcbiAqIE1vZGlmaWVzIHRoZSBwYXJhbWV0ZXJzLCBhZGRpbmcgaW4gZGVmYXVsdCB2YWx1ZXMgd2hlcmUgdmFsdWVzIGFyZSBtaXNzaW5nLFxuICogZm9yIGV4YW1wbGUuIEFsc28gc2F2ZXMgdGhlIHVwZGF0ZWQgcGFyYW1zIHRvIHRoZSBtb2R1bGUtbGV2ZWwgcGFyYW1zXG4gKiB2YXJpYWJsZS5cbiAqIEBwYXJhbSAge09iamVjdDxzdHJpbmcsKj59IGluaXRQYXJhbXMgVGhlIGluaXRpYWwgcGFyYW1ldGVycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVlIoaW5pdFBhcmFtczogSVZSU2V0dXApOiB2b2lkIHtcbiAgICAvLyBTYXZlIHRoZSBwYXJhbWV0ZXIgdG8gcGFyYW1zIChtb2R1bGUtbGV2ZWwgdmFyaWFibGUpLlxuICAgIHZyVmFycyA9IGluaXRQYXJhbXM7XG5cbiAgICAvLyBJZiBydW5uaW5nIGluIFN0dWRlbnQgbW9kZSwgZG8gbm90IHNldCB1cCBWUiBjYW1lcmEuLi4gQnV0IGdvb2QgdG9cbiAgICAvLyBkZWZpbmUgdnJWYXJzIGZpcnN0IChhYm92ZSkgc28geW91IGNhbiBoaWRlIHRoZSBuYXYgc3BoZXJlIGVsc2V3aGVyZS5cbiAgICBpZiAoVXJsVmFycy5jaGVja1dlYnJ0Y0luVXJsKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgdnIgaGVscGVyLiBTZWUgaHR0cDovL2RvYy5iYWJ5bG9uanMuY29tL2hvd190by93ZWJ2cl9oZWxwZXJcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIC8vIFwiY3JlYXRlRGV2aWNlT3JpZW50YXRpb25DYW1lcmFcIjogZmFsc2UsICAvLyBUaGlzIG1ha2VzIHBob25lIGlnbm9yZSBtb3Rpb24gc2Vuc29yLiBObyBnb29kLlxuICAgICAgICBcImNyZWF0ZURldmljZU9yaWVudGF0aW9uQ2FtZXJhXCI6IHRydWUsXG4gICAgICAgIFwidXNlTXVsdGl2aWV3XCI6IGZhbHNlXG4gICAgfTtcbiAgICBpZiAoc2NlbmUuZ2V0RW5naW5lKCkuZ2V0Q2FwcygpLm11bHRpdmlldykge1xuICAgICAgICAvLyBNdWNoIGZhc3RlciBhY2NvcmRpbmcgdG9cbiAgICAgICAgLy8gaHR0cHM6Ly9kb2MuYmFieWxvbmpzLmNvbS9ob3dfdG8vbXVsdGl2aWV3LCBidXQgbm90IHN1cHBvcnRlZCBpblxuICAgICAgICAvLyBhbGwgYnJvd3NlcnMuXG4gICAgICAgIHBhcmFtc1tcInVzZU11bHRpdmlld1wiXSA9IHRydWU7XG4gICAgfVxuICAgIHZySGVscGVyID0gc2NlbmUuY3JlYXRlRGVmYXVsdFZSRXhwZXJpZW5jZShwYXJhbXMpO1xuXG4gICAgLy8gSGlkZSB0aGUgdnJIZWxwZXIgaWNvbiBpbml0aWFsbHkuXG4gICAgY29uc3QgYmFieWxvblZSaWNvbmJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmFieWxvblZSaWNvbmJ0blwiKTtcbiAgICBpZiAoYmFieWxvblZSaWNvbmJ0biAhPT0gbnVsbCkge1xuICAgICAgICBiYWJ5bG9uVlJpY29uYnRuLnN0eWxlLm9wYWNpdHkgPSBcIjAuMFwiOyAgLy8gTm9uIElFO1xuICAgICAgICBiYWJ5bG9uVlJpY29uYnRuLnN0eWxlLmZpbHRlciA9IFwiYWxwaGEob3BhY2l0eT0wKVwiOyAgLy8gSUU7XG4gICAgfVxuXG4gICAgLy8gRm9yIGRlYnVnZ2luZy4uLi5cbiAgICAvLyB3aW5kb3dbXCJ2ckhlbHBlclwiXSA9IHZySGVscGVyO1xuXG4gICAgLy8gV2hldGhlciB0aGUgbWVudSBzeXN0ZW0gaXMgYWN0aXZlLiBUcnVlIGJ5IGRlZmF1bHQuXG4gICAgdnJWYXJzLm1lbnVBY3RpdmUgPSB0cnVlO1xufVxuIiwidmFyIG1hcCA9IHtcblx0XCIuL2xvZ1wiOiBcImRaWkhcIlxufTtcblxuXG5mdW5jdGlvbiB3ZWJwYWNrQ29udGV4dChyZXEpIHtcblx0dmFyIGlkID0gd2VicGFja0NvbnRleHRSZXNvbHZlKHJlcSk7XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKGlkKTtcbn1cbmZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0UmVzb2x2ZShyZXEpIHtcblx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhtYXAsIHJlcSkpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyByZXEgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0cmV0dXJuIG1hcFtyZXFdO1xufVxud2VicGFja0NvbnRleHQua2V5cyA9IGZ1bmN0aW9uIHdlYnBhY2tDb250ZXh0S2V5cygpIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hcCk7XG59O1xud2VicGFja0NvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tDb250ZXh0UmVzb2x2ZTtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0NvbnRleHQ7XG53ZWJwYWNrQ29udGV4dC5pZCA9IFwiaTNYcFwiOyIsImRlY2xhcmUgdmFyIGpRdWVyeTogYW55O1xuXG5sZXQgYm9vdHN0cmFwTG9hZGVkID0gZmFsc2U7XG5cbi8qKiBAdHlwZSB7RnVuY3Rpb259ICovXG4vLyBsZXQgbW9kYWxGdW5jOiBhbnk7XG5cbmxldCBtc2dNb2RhbDogYW55O1xubGV0IG15VGl0bGU6IGFueTtcbmxldCBteUlGcmFtZTogYW55O1xubGV0IGlGcmFtZUNvbnRhaW5lcjogYW55O1xubGV0IG1zZ0NvbnRhaW5lcjogYW55O1xubGV0IGZvb3RlcjogYW55O1xuXG4vKipcbiAqIE9wZW5zIGEgbW9kYWwuXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICB0aXRsZSAgICAgVGhlIHRpdHRsZS5cbiAqIEBwYXJhbSAge3N0cmluZ30gIHZhbCAgICAgICBUaGUgVVJMIGlmIGlmcmFtZWQuIEEgbWVzc2FnZSBvdGhlcndpc2UuXG4gKiBAcGFyYW0gIHtib29sZWFufSBpZnJhbWVkICAgV2hldGhlciB0byBkaXNwbGF5IGFuIGlmcmFtZSAodmFsID0gdXJsKSBvciBhXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSAodmFsIGlzIHN0cmluZykuXG4gKiBAcGFyYW0gIHtib29sZWFufSBjbG9zZUJ0biAgV2hldGhlciB0byBpbmNsdWRlIGEgY2xvc2UgYnV0dG9uLiBEZWZhdWx0cyB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlIGlmIGlmcmFtZWQsIHRydWUgb3RoZXJ3aXNlLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gb3Blbk1vZGFsKHRpdGxlOiBzdHJpbmcsIHZhbDogc3RyaW5nLCBpZnJhbWVkID0gdHJ1ZSwgY2xvc2VCdG4/OiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8gTG9hZCB0aGUgY3NzIGlmIG5lZWRlZC5cbiAgICBpZiAoIWJvb3RzdHJhcExvYWRlZCkge1xuICAgICAgICBib290c3RyYXBMb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgY3NzXG4gICAgICAgIGRvY3VtZW50LmhlYWQuaW5zZXJ0QWRqYWNlbnRIVE1MKCBcImJlZm9yZWVuZFwiLCBcIjxsaW5rIHJlbD1zdHlsZXNoZWV0IGhyZWY9cGFnZXMvY3NzL2Jvb3RzdHJhcC5taW4uY3NzPlwiICk7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBET00gZm9yIGEgbW9kYWxcbiAgICAgICAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgYFxuICAgICAgICAgICAgPCEtLSBUaGUgTW9kYWwgLS0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwgZmFkZVwiIGlkPVwibXNnTW9kYWxcIiByb2xlPVwiZGlhbG9nXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZ1wiIHJvbGU9XCJkb2N1bWVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiPlxuXG4gICAgICAgICAgICAgICAgICAgIDwhLS0gTW9kYWwgSGVhZGVyIC0tPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3M9XCJtb2RhbC10aXRsZVwiPk1vZGFsIEhlYWRpbmc8L2g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiIGRhdGEtZGlzbWlzcz1cIm1vZGFsXCI+JnRpbWVzOzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICA8IS0tIE1vZGFsIGJvZHkgLS0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tIFRPRE86IENoZWNrIGlmIHdvcmtzIG9uIGJvdGggaVBob25lIGFuZCBGaXJlZm94LiBVc2VkIHRvIGJlIG92ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjsgLS0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiaWZyYW1lLWNvbnRhaW5lclwiIHN0eWxlPVwiaGVpZ2h0OjM1MHB4O292ZXJmbG93LXk6YXV0bztvdmVyZmxvdy14OmhpZGRlbjstd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzp0b3VjaFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpZnJhbWUgZnJhbWVCb3JkZXI9XCIwXCIgc3JjPVwiXCIgc3R5bGU9XCJ3aWR0aDoxMDAlO2hlaWdodDoxMDAlO1wiPjwvaWZyYW1lPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cIm1zZy1jb250YWluZXJcIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIDwhLS0gTW9kYWwgZm9vdGVyIC0tPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlkPVwibW9kYWwtZm9vdGVyXCIgY2xhc3M9XCJtb2RhbC1mb290ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1kaXNtaXNzPVwibW9kYWxcIj5DbG9zZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgKTtcblxuICAgICAgICAvLyBOb3RlIHJlLiB0cmFkaXRpb25hbCBib290c3RyYXAgaWZyYW1lLiBJJ20gdXNpbmcgYSBkaWZmZXJlbnQgZm9ybWF0XG4gICAgICAgIC8vIHRvIG1ha2Ugc3VyZSBpcGhvbmUgY29tcGF0aWJsZS5cbiAgICAgICAgLy8gPCEtLSA8ZGl2IGlkPVwiaWZyYW1lLWNvbnRhaW5lclwiIGNsYXNzPVwiZW1iZWQtcmVzcG9uc2l2ZSBlbWJlZC1yZXNwb25zaXZlLTFieTFcIj5cbiAgICAgICAgLy8gICAgIDxpZnJhbWUgY2xhc3M9XCJlbWJlZC1yZXNwb25zaXZlLWl0ZW1cIiBzcmM9XCJcIj48L2lmcmFtZT5cbiAgICAgICAgLy8gPC9kaXY+IC0tPlxuXG4gICAgICAgIC8vIEFkZCB0aGUgamF2YXNjcmlwdFxuICAgICAgICBvcGVuVXJsTW9kYWxDb250aW51ZSh0aXRsZSwgdmFsLCBpZnJhbWVkLCBjbG9zZUJ0bik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3BlblVybE1vZGFsQ29udGludWUodGl0bGUsIHZhbCwgaWZyYW1lZCwgY2xvc2VCdG4pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZvbGxvdy11cCBmdW5jdGlvbiBmb3Igb3BlbmluZyB0aGUgdXJsIG1vZGFsLlxuICogQHBhcmFtICB7c3RyaW5nfSAgdGl0bGUgICAgIFRoZSB0aXRsZS5cbiAqIEBwYXJhbSAge3N0cmluZ30gIHZhbCAgICAgICBUaGUgVVJMIGlmIGlmcmFtZWQuIEEgbWVzc2FnZSBvdGhlcndpc2UuXG4gKiBAcGFyYW0gIHtib29sZWFufSBpZnJhbWVkICAgV2hldGhlciB0byBkaXNwbGF5IGFuIGlmcmFtZSAodmFsID0gdXJsKSBvciBhXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSAodmFsIGlzIHN0cmluZykuXG4gKiBAcGFyYW0gIHtib29sZWFufSBjbG9zZUJ0biAgV2hldGhlciB0byBpbmNsdWRlIGEgY2xvc2UgYnV0dG9uLiBEZWZhdWx0cyB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlIGlmIGlmcmFtZWQsIHRydWUgb3RoZXJ3aXNlLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBvcGVuVXJsTW9kYWxDb250aW51ZSh0aXRsZTogc3RyaW5nLCB2YWw6IHN0cmluZywgaWZyYW1lZDogYm9vbGVhbiwgY2xvc2VCdG46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAobXNnTW9kYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtc2dNb2RhbCA9IGpRdWVyeShcIiNtc2dNb2RhbFwiKTtcbiAgICAgICAgbXlUaXRsZSA9IG1zZ01vZGFsLmZpbmQoXCJoNC5tb2RhbC10aXRsZVwiKTtcbiAgICAgICAgaUZyYW1lQ29udGFpbmVyID0gbXNnTW9kYWwuZmluZChcIiNpZnJhbWUtY29udGFpbmVyXCIpO1xuICAgICAgICBtc2dDb250YWluZXIgPSBtc2dNb2RhbC5maW5kKFwiI21zZy1jb250YWluZXJcIik7XG4gICAgICAgIG15SUZyYW1lID0gaUZyYW1lQ29udGFpbmVyLmZpbmQoXCJpZnJhbWVcIik7XG4gICAgICAgIGZvb3RlciA9IG1zZ01vZGFsLmZpbmQoXCIjbW9kYWwtZm9vdGVyXCIpO1xuICAgIH1cblxuICAgIC8vIEltbWVkaWF0ZWx5IGhpZGUuXG4gICAgaUZyYW1lQ29udGFpbmVyLmhpZGUoKTtcblxuICAgIC8vIENsZWFyIGl0LlxuICAgIG15SUZyYW1lLmF0dHIoXCJzcmNcIiwgXCJcIik7XG5cbiAgICBteVRpdGxlLmh0bWwodGl0bGUpO1xuXG4gICAgaWYgKGlmcmFtZWQgPT09IHRydWUpIHtcbiAgICAgICAgbXNnQ29udGFpbmVyLmhpZGUoKTtcbiAgICAgICAgbXlJRnJhbWUuYXR0cihcInNyY1wiLCB2YWwpO1xuICAgICAgICBpZiAoY2xvc2VCdG4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9vdGVyLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IHNob3cgb25jZSBsb2FkZWQuXG4gICAgICAgIG15SUZyYW1lLm9uKFwibG9hZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICBpRnJhbWVDb250YWluZXIuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtc2dDb250YWluZXIuc2hvdygpO1xuICAgICAgICBpRnJhbWVDb250YWluZXIuaGlkZSgpO1xuXG4gICAgICAgIC8vIE9uIHNvbWUgcmFyZSBvY2Nhc2lvbnMsIGEgcHJldmlvdXMgaWZyYW1lIG1heSB0YWtlIHRvbyBsb25nIHRvXG4gICAgICAgIC8vIGxvYWQsIHNvIHRoZSBpRnJhbUVDb250YWluZXIuc2hvdygpIGNhbiBvcGVuIGFmdGVyIHRoaXMgaGlkZS4gUHV0XG4gICAgICAgIC8vIGluIGEgdGltZW91dCB0byBmaXggdGhpcy4gSXQncyBoYXNoaXNoLCBidXQgd29ya3MuIFNsaWRldXAganVzdCB0b1xuICAgICAgICAvLyBtYWtlIGl0IGxvb2sgYSBsaXR0bGUgYmV0dGVyIChsZXNzIGxpa2UgdGhlIGJ1ZyB0aGF0IGl0IGlzISkuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG1zZ0NvbnRhaW5lci5jc3MoXCJkaXNwbGF5XCIpID09PSBcImlubGluZVwiKSB7XG4gICAgICAgICAgICAgICAgaUZyYW1lQ29udGFpbmVyLnNsaWRlVXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgbXNnQ29udGFpbmVyLmh0bWwodmFsKTtcbiAgICAgICAgaWYgKGNsb3NlQnRuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvb3Rlci5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xvc2VCdG4gPT09IHRydWUpIHtcbiAgICAgICAgZm9vdGVyLnNob3coKTtcbiAgICB9IGVsc2UgaWYgKGNsb3NlQnRuID09PSBmYWxzZSkge1xuICAgICAgICBmb290ZXIuaGlkZSgpO1xuICAgIH1cblxuICAgIG1zZ01vZGFsLm1vZGFsKCk7XG59XG5cbi8vIEZvciBkZWJ1Z2dpbmcuLi5cbi8vIHdpbmRvd1tcIm9wZW5Nb2RhbFwiXSA9IG9wZW5Nb2RhbDtcbiIsImltcG9ydCAqIGFzIENvbW1vbkNhbWVyYSBmcm9tIFwiLi4vLi4vQ2FtZXJhcy9Db21tb25DYW1lcmFcIjtcbmltcG9ydCAqIGFzIFZSUG9pbnRzIGZyb20gXCIuLi8uLi9OYXZpZ2F0aW9uL1BvaW50c1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vLi4vVmFycy9WYXJzXCI7XG5pbXBvcnQgKiBhcyBCdXR0b24gZnJvbSBcIi4vQnV0dG9uXCI7XG5pbXBvcnQgKiBhcyBSb3RhdGlvbnMgZnJvbSBcIi4vUm90YXRpb25zXCI7XG5pbXBvcnQgKiBhcyBTdHlsZXMgZnJvbSBcIi4vU3R5bGVzXCI7XG5pbXBvcnQgQnV0dG9uUHJlc3NTb3VuZEZpbGUgZnJvbSBcIi4vc3RhcGxlLXB1YmxpYy1kb21haW4ubXAzXCI7XG5cbmRlY2xhcmUgdmFyIEJBQllMT046IGFueTtcblxuLy8gQW4gZWFzeSB3YXkgdG8gZGVmaW5lIGEgbWVudS4gSXQncyBhIG5lc3RlZCBvYmplY3QuIFNlZSBzZXR1cCgpO1xuLyoqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLCo+fSAqL1xuZXhwb3J0IGxldCBtZW51SW5mOiBhbnk7XG5cbmV4cG9ydCBsZXQgY2xpY2tTb3VuZDogYW55ID0gdW5kZWZpbmVkO1xuZXhwb3J0IGxldCBvcGVuTWFpbk1lbnVGbG9vckJ1dHRvbjogYW55O1xuXG4vLyBUaGVzZSB2YXJpYWJsZXMgbmVlZCB0byBiZSBpbml0aWFsaXplZCBpbiBzZXR1cCgpLCB0byBlbmFibGUgcmVsb2FkaW5nIGlmXG4vLyBuZWNlc3NhcnkuXG4vKiogQHR5cGUge0FycmF5PCo+fSAqL1xubGV0IGFsbEJ1dHRvbnM6IGFueVtdO1xuXG5sZXQgbGF0ZXN0QnJlYWRjcnVtYnNWaWV3ZWQ6IHN0cmluZ1tdO1xuXG4vKiogQHR5cGUge09iamVjdDxzdHJpbmc+fSAqL1xuLy8gbGV0IHNjZW5lSW5mb0RhdGE6IGFueTtcblxubGV0IGd1aTNETWVudU1hbmFnZXI6IGFueTtcbmxldCBjb21tb25NZW51QW5jaG9yOiBhbnk7XG5cbi8qKlxuICogTG9hZCB0aGUgM0QgR1VJLiBBbHNvIHJlbG9hZHMgdGhlIEdVSSAoZGVzdHJveXMgb2xkIHZlcnNpb24pLiBSZWxvYWRpbmcgaXNcbiAqIHVzZWZ1bCB3aGVuIHlvdSBhZGQgYSBuZXcgUERCLCBmb3IgZXhhbXBsZSwgYW5kIHdhbnQgdG8gdXBkYXRlIHRoZVxuICogc2VsZWN0aW9uIG9wdGlvbnMuXG4gKiBAcGFyYW0gIHtPYmplY3Q8c3RyaW5nLCo+PX0gZGF0YSBUaGUgZGF0YSBmcm9tIHNjZW5lX2luZm8uanNvbi4gU2F2ZXMgb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0IHVzZSBzbyBpdCBkb2Vzbid0IG5lZWQgdG8gYmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNlcXVlbnRseSBzcGVjaWZpZWQuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cChkYXRhPzogYW55KTogdm9pZCB7XG4gICAgLy8gSW5pdGlhbGl6ZSBzb21lIHZhcmlhYmxlc1xuICAgIGFsbEJ1dHRvbnMgPSBbXTtcbiAgICBsYXRlc3RCcmVhZGNydW1ic1ZpZXdlZCA9IFtdO1xuICAgIG1lbnVJbmYgPSB7XG4gICAgICAgIFwiU3R5bGVzXCI6IFN0eWxlcy5idWlsZFN0eWxlc1N1Yk1lbnUoKSxcbiAgICAgICAgXCJSb3RhdGVcIjogUm90YXRpb25zLmJ1aWxkUm90YXRpb25zU3ViTWVudSgpXG4gICAgfTtcblxuICAgIC8vIFNhdmUgdGhlIHNjZW5lIGRhdGEgc28geW91IGNhbiByZWZlcmVuY2UgaXQgaW4gdGhlIGZ1dHVyZSwgaWYgeW91XG4gICAgLy8gcmVjcmVhdGUgdGhlIG1lbnUuIElmIGl0J3Mgbm90IGRlZmluZWQsIHRoZSB1c2UgdGhlIHNhdmVkIGRhdGEuXG4gICAgLy8gaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vICAgICBzY2VuZUluZm9EYXRhID0gZGF0YTtcbiAgICAvLyB9IGVsc2Uge1xuICAgIC8vICAgICBkYXRhID0gc2NlbmVJbmZvRGF0YTtcbiAgICAvLyB9XG5cbiAgICAvLyBPbmx5IHJlcXVpcmVkIHRvIHNldHVwIG9uY2UuXG4gICAgaWYgKGd1aTNETWVudU1hbmFnZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBNYWtlIGEgbWFuYWdlciBmb3IgdGhlIG1lbnVcbiAgICAgICAgZ3VpM0RNZW51TWFuYWdlciA9IG5ldyBCQUJZTE9OLkdVSS5HVUkzRE1hbmFnZXIoVmFycy5zY2VuZSk7XG5cbiAgICAgICAgLy8gRm9yIGRlYnVnZ2luZy4uLlxuICAgICAgICAvLyB3aW5kb3dbXCJndWkzRE1lbnVNYW5hZ2VyXCJdID0gZ3VpM0RNZW51TWFuYWdlcjtcbiAgICB9XG5cbiAgICBzZXR1cE1haW5NZW51KCk7XG5cbiAgICAvLyBPbmx5IHJlcXVpcmVkIHRvIHNldHVwIG9uY2UuXG4gICAgaWYgKG9wZW5NYWluTWVudUZsb29yQnV0dG9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0dXBNYWluTWVudVRvZ2dsZUJ1dHRvbigpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgcmVxdWlyZWQgdG8gc2V0dXAgb25jZS5cbiAgICBpZiAoY2xpY2tTb3VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsaWNrU291bmQgPSBuZXcgQkFCWUxPTi5Tb3VuZChcbiAgICAgICAgICAgIFwiY2xpY2stYnV0dG9uXCIsIEJ1dHRvblByZXNzU291bmRGaWxlLFxuICAgICAgICAgICAgVmFycy5zY2VuZSwgbnVsbCxcbiAgICAgICAgICAgIHsgbG9vcDogZmFsc2UsIGF1dG9wbGF5OiBmYWxzZSwgc3BhdGlhbFNvdW5kOiB0cnVlLCB2b2x1bWU6IDAuMSB9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFNpbXBsaWZ5IHRoZSBtZW51IChjb2xsYXBzaW5nIGV4Y2Vzc2l2ZSBwYXJ0cykuXG4gICAgcmVkdWNlU2luZ2xlSXRlbVN1Yk1lbnVzKCk7XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIG1haW4gbWVudS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gc2V0dXBNYWluTWVudSgpOiB2b2lkIHtcbiAgICAvLyBIZXJlIHdvdWxkIGFsc28gYmUgYSBnb29kIHBsYWNlIHRvIGFkZCBhZGRpdGlvbmFsIGJ1dHRvbnMgc3VjaCBhcyB2b2ljZVxuICAgIC8vIGRpY3RhdGlvbi4gU2VlIHNldHVwQWxsU3ViTWVudU5hdkJ1dHRvbnMgZm9yIGhvdyB0aGlzIHdhcyBkb25lXG4gICAgLy8gcHJldmlvdXNseS5cbiAgICBzZXR1cEFsbFN1Yk1lbnVOYXZCdXR0b25zKCk7XG5cbiAgICBjb21tb25NZW51QW5jaG9yID0gbmV3IEJBQllMT04uVHJhbnNmb3JtTm9kZShcIlwiKTsgLy8gdGhpcyBjYW4gYmUgYSBtZXNoLCB0b29cblxuICAgIGNyZWF0ZVBhbmVsU2l4dGVlbkJ1dHRvbnMoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcGFuZWwgY29udGFpbmluZyAxNiBidXR0b25zLiBUaGVzZSBidXR0b25zIGFyZSBtYW5pcHVsYXRlZCB0b1xuICogc2hvdyBkaWZmZXJlbnQgc3VibWVudXMuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBhbmVsU2l4dGVlbkJ1dHRvbnMoKTogdm9pZCB7XG4gICAgLy8gbGV0IHBhbmVsID0gbmV3IEJBQllMT04uR1VJLkN5bGluZGVyUGFuZWwoKTtcbiAgICBjb25zdCBwYW5lbCA9IG5ldyBCQUJZTE9OLkdVSS5TcGhlcmVQYW5lbCgpO1xuXG4gICAgcGFuZWwucmFkaXVzID0gVmFycy5NRU5VX1JBRElVUztcbiAgICBwYW5lbC5tYXJnaW4gPSBWYXJzLk1FTlVfTUFSR0lOO1xuXG4gICAgZ3VpM0RNZW51TWFuYWdlci5hZGRDb250cm9sKHBhbmVsKTtcbiAgICBwYW5lbC5ibG9ja0xheW91dCA9IHRydWU7XG5cbiAgICAvLyBBZGQgYnV0dG9uc1xuICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IDE2OyBpZHgrKykge1xuICAgICAgICBjb25zdCBmdW5jID0gKCkgPT4geyByZXR1cm47IH07XG4gICAgICAgIGNvbnN0IHR4dCA9IGlkeC50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBjb2xvciA9IFwieWVsbG93XCI7XG4gICAgICAgIGNvbnN0IGxldmVsSW50ID0gMTtcblxuICAgICAgICBhbGxCdXR0b25zLnB1c2goXG4gICAgICAgICAgICBuZXcgQnV0dG9uLkJ1dHRvbldyYXBwZXIoe1xuICAgICAgICAgICAgICAgIGNsaWNrRnVuYzogKGJ1dHRvbldyYXBwZXI6IEJ1dHRvbi5CdXR0b25XcmFwcGVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIHJlYXNvbnMgSSBkb24ndCB1bmRlcnN0YW5kLCB0aGUgcmFkaXVzIG9uIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgLy8gY3lsaW5kZXIgKHNldCBiZWxvdykgZG9lc24ndCB0YWtlLiBQdXQgaXQgaGVyZSB0b1xuICAgICAgICAgICAgICAgICAgICAvLyB0b28gbWFrZSBzdXJlLlxuICAgICAgICAgICAgICAgICAgICAvLyBjeWxpbmRlclBhbmVsTWFpbk1lbnUucmFkaXVzID0gVmFycy5NRU5VX1JBRElVUztcbiAgICAgICAgICAgICAgICAgICAgLy8gY3lsaW5kZXJQYW5lbE1haW5NZW51Lm1hcmdpbiA9IFZhcnMuTUVOVV9NQVJHSU47XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmYWxzZVR4dDogdHh0LCAvLyAgKyBcIlxcbihIaWRlKVwiLFxuICAgICAgICAgICAgICAgIGluaXRGdW5jOiAoYnV0dG9uV3JhcHBlcjogQnV0dG9uLkJ1dHRvbldyYXBwZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uV3JhcHBlci5pc1Zpc2libGUoZmFsc2UpOyAgLy8gQnV0dG9ucyBzdGFydCBvZmYgaGlkZGVuLlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsSW50LFxuICAgICAgICAgICAgICAgIG5hbWU6IFwibWVudS12aXNpYmxlLWJ1dHRvbi1cIiArIHR4dCxcbiAgICAgICAgICAgICAgICBwYW5lbCxcbiAgICAgICAgICAgICAgICB0cnVlVHh0OiB0eHQsIC8vICArIFwiXFxuKFNob3cpXCIsXG4gICAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgcmFkaXVzIGFuZCBzdWNoLlxuICAgIHBhbmVsLmNvbHVtbnMgPSA0O1xuXG4gICAgcGFuZWwubGlua1RvVHJhbnNmb3JtTm9kZShjb21tb25NZW51QW5jaG9yKTtcblxuICAgIHBhbmVsLmJsb2NrTGF5b3V0ID0gZmFsc2U7XG59XG5cbi8qKlxuICogQXBwbGllcyBhIHVzZXItcHJvdmlkZWQgZnVuY3Rpb24gdG8gYWxsIGxldmVscyBvZiB0aGUgbWVudS4gRm9yIGV4YW1wbGUsXG4gKiBhZGRzIFwiQmFja1wiIGFuZCBcIkNsb3NlIE1lbnVcIiBidXR0b25zIHRvIGFsbCBzdWIgbWVudXMuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbihPYmplY3QsIEFycmF5PHN0cmluZz4pfSBmdW5jVG9BcHBseSAgVGhlIGZ1bmN0aW9uIHRvXG4gKiBhcHBseS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gYXBwbHlGdW5jVG9BbGxNZW51TGV2ZWxzKGZ1bmNUb0FwcGx5OiBhbnkpOiB2b2lkIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gICAgICAgICAgIHN1Yk1lbnUgICAgICBUaGUgc3VibWVudSBkYXRhLlxuICAgICAqIEBwYXJhbSAge0FycmF5PHN0cmluZz59ICAgIGJyZWFkY3J1bWJzICBUaGV5IGxpc3Qgb2Yga2V5cyB0byBnZXQgdG9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBwb2ludCBpbiB0aGUgbWVudS5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgY29uc3QgcmVjdXJzZSA9IChzdWJNZW51OiBhbnksIGJyZWFkY3J1bWJzOiBzdHJpbmdbXSk6IHZvaWQgPT4ge1xuICAgICAgICBmdW5jVG9BcHBseShzdWJNZW51LCBicmVhZGNydW1icyk7XG5cbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHN1Yk1lbnUpO1xuICAgICAgICBjb25zdCBrZXlzTGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c0xlbjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgY29uc3Qgc3ViTWVudUl0ZW1zID0gc3ViTWVudVtrZXldO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlb2Yoc3ViTWVudUl0ZW1zKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzZShzdWJNZW51SXRlbXMsIGJyZWFkY3J1bWJzLmNvbmNhdChba2V5XSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZWN1cnNlKG1lbnVJbmYsIFtdKTtcbn1cblxuLyoqXG4gKiBTZXQgdXAgc3VibWVudSBuYXZpZ2F0aW9uIGJ1dHRvbnMgbGlrZSBiYWNrIGFuZCBjbG9zZS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gc2V0dXBBbGxTdWJNZW51TmF2QnV0dG9ucygpOiB2b2lkIHtcbiAgICAvLyBFYWNoIG9mIHRoZSBzdWJtZW51cyBzaG91bGQgaGF2ZSBhIGJhY2sgYnV0dG9uIGFuZCBhIGNsb3NlIG1lbnUgYnV0dG9uLlxuICAgIGFwcGx5RnVuY1RvQWxsTWVudUxldmVscygoc3ViTWVudTogYW55LCBicmVhZGNydW1iczogc3RyaW5nW10pID0+IHtcbiAgICAgICAgc2V0dXBTdWJNZW51TmF2QnV0dG9ucyhzdWJNZW51LCBicmVhZGNydW1icyk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgc3VibWVudSBuYXZpZ2F0aW9uIGJ1dHRvbnMgKFwiQmFja1wiLCBcIkNsb3NlIE1lbnVcIikuIFRoaXNcbiAqIGZ1bmN0aW9uIGFjdHMgb24gYSBzaW5nbGUgc3VibWVudSwgYnV0IGVsc2V3aGVyZSBpdCBpcyBhcHBsaWVkIHRvIGFsbFxuICogc3VibWVudXMuXG4gKiBAcGFyYW0gIHsqfSAgICAgICAgc3ViTWVudSAgICAgIEluZm9ybWF0aW9uIGFib3V0IHRoZSBzdWJtZW51LlxuICogQHBhcmFtICB7c3RyaW5nW119IGJyZWFkY3J1bWJzICBUaGUgYnJlYWRjcnVtYnMgdG8gZ2V0IHRvIHRoaXMgc3VibWVudS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwU3ViTWVudU5hdkJ1dHRvbnMoc3ViTWVudTogYW55LCBicmVhZGNydW1iczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBpZiAoYnJlYWRjcnVtYnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBObyBiYWNrIGJ1dHRvbiBvbiB0b3AtbGV2ZWwgbWVudS5cbiAgICAgICAgc3ViTWVudVtcIkJhY2sg4oemXCJdID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3QnJlYWRjcnVtYnMgPSBicmVhZGNydW1icy5zbGljZSgwLCBicmVhZGNydW1icy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHNob3dPbmx5QnV0dG9uc09mTGV2ZWwobmV3QnJlYWRjcnVtYnMpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBzdWJNZW51W1wiQ2xvc2UgTWVudSDDl1wiXSA9ICgpID0+IHtcbiAgICAgICAgb3Blbk1haW5NZW51Rmxvb3JCdXR0b24udG9nZ2xlZCgpO1xuICAgIH07XG59XG5cbi8qKlxuICogU2V0dXAgdGhlIHRvZ2dsZSBidXR0b24gb24gdGhlIGZsb29yIHRoYXQgdHVybnMgdGhlIG1haW4gbWVudSBvbiBhbmQgb2ZmLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBzZXR1cE1haW5NZW51VG9nZ2xlQnV0dG9uKCk6IHZvaWQge1xuICAgIC8vIEFsc28gc2V0IHVwIGEgbWFuYWdlciBhdCB5b3VyIGZlZXQuIFRoaXMgdHVybnMgdGhlIG1haW4gbWFuYWdlciBvbiBhbmRcbiAgICAvLyBvZmYuXG4gICAgY29uc3QgcGFuZWxUb2dnbGUgPSBuZXcgQkFCWUxPTi5HVUkuU3RhY2tQYW5lbDNEKCk7XG4gICAgZ3VpM0RNZW51TWFuYWdlci5hZGRDb250cm9sKHBhbmVsVG9nZ2xlKTtcblxuICAgIC8vIFNldCB1cCB0aGUgYnV0dG9uXG4gICAgb3Blbk1haW5NZW51Rmxvb3JCdXR0b24gPSBuZXcgQnV0dG9uLkJ1dHRvbldyYXBwZXIoe1xuICAgICAgICBjbGlja0Z1bmM6IChidXR0b25XcmFwcGVyOiBCdXR0b24uQnV0dG9uV3JhcHBlcikgPT4ge1xuICAgICAgICAgICAgaWYgKCFidXR0b25XcmFwcGVyLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc2hvd09ubHlCdXR0b25zT2ZMZXZlbCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaG93T25seUJ1dHRvbnNPZkxldmVsKFtdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29tbW9uTWVudUFuY2hvci5wb3NpdGlvbi5jb3B5RnJvbShDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKSk7XG4gICAgICAgICAgICBjb21tb25NZW51QW5jaG9yLnJvdGF0aW9uLnkgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUm90YXRpb25ZKCk7IC8vICArIE1hdGguUEkgKiAwLjU7XG4gICAgICAgICAgICAvLyBjYW1lcmEucm90YXRpb24ueSArIE1hdGguUEkgKiAwLjU7c1xuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgZmFsc2VUeHQ6IFwiU2hvdyBNZW51XCIsXG4gICAgICAgIGxldmVsOiAwLFxuICAgICAgICBuYW1lOiBcIm1lbnUtdmlzaWJsZS1idXR0b25cIixcbiAgICAgICAgcGFuZWw6IHBhbmVsVG9nZ2xlLFxuICAgICAgICB0cnVlVHh0OiBcIkhpZGUgTWVudVwiLFxuICAgIH0pO1xuXG4gICAgLy8gRm9yIGRlYnVnZ2luZy4uLlxuICAgIC8vIHdpbmRvd1tcIm9wZW5NYWluTWVudUZsb29yQnV0dG9uXCJdID0gb3Blbk1haW5NZW51Rmxvb3JCdXR0b247XG5cbiAgICAvLyBTZXQgdXAgdGhlIGJ1dHRvbiBhbmNob3IgYW5kIG1vdmUvcm90YXRlIGl0LlxuICAgIGNvbnN0IG1haW5NZW51QW5jaG9yVG9nZ2xlID0gbmV3IEJBQllMT04uVHJhbnNmb3JtTm9kZShcIlwiKTsgLy8gdGhpcyBjYW4gYmUgYSBtZXNoLCB0b29cbiAgICBwYW5lbFRvZ2dsZS5saW5rVG9UcmFuc2Zvcm1Ob2RlKG1haW5NZW51QW5jaG9yVG9nZ2xlKTtcbiAgICBtYWluTWVudUFuY2hvclRvZ2dsZS5yb3RhdGlvbi54ID0gTWF0aC5QSSAqIDAuNTtcblxuICAgIC8vIFVwZGF0ZSBidXR0b24gcG9zaXRpb24gd2l0aCBlYWNoIHR1cm4gb2YgdGhlIHJlbmRlciBsb29wLlxuICAgIG1haW5NZW51QW5jaG9yVG9nZ2xlLnBvc2l0aW9uLmNvcHlGcm9tKFZSUG9pbnRzLmdyb3VuZFBvaW50QmVsb3dDYW1lcmEpO1xuICAgIG1haW5NZW51QW5jaG9yVG9nZ2xlLnBvc2l0aW9uLnkgPSBtYWluTWVudUFuY2hvclRvZ2dsZS5wb3NpdGlvbi55ICsgMC4xO1xuICAgIG1haW5NZW51QW5jaG9yVG9nZ2xlLnJvdGF0aW9uLnkgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUm90YXRpb25ZKCk7XG5cbiAgICBWYXJzLnNjZW5lLnJlZ2lzdGVyQmVmb3JlUmVuZGVyKCgpID0+IHtcbiAgICAgICAgbWFpbk1lbnVBbmNob3JUb2dnbGUucG9zaXRpb24uY29weUZyb20oVlJQb2ludHMuZ3JvdW5kUG9pbnRCZWxvd0NhbWVyYSk7ICAvLyBQcm9iXG4gICAgICAgIG1haW5NZW51QW5jaG9yVG9nZ2xlLnBvc2l0aW9uLnkgPSBtYWluTWVudUFuY2hvclRvZ2dsZS5wb3NpdGlvbi55ICsgMC4xOyAgICAgLy8gTm8gcHJvYlxuICAgICAgICBtYWluTWVudUFuY2hvclRvZ2dsZS5yb3RhdGlvbi55ID0gQ29tbW9uQ2FtZXJhLmdldENhbWVyYVJvdGF0aW9uWSgpOyAgLy8gUHJvYlxuICAgIH0pO1xufVxuXG4vKipcbiAqIFNob3dzIHRoZSBidXR0b25zIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIHN1Ym1lbnUgbGV2ZWwuXG4gKiBAcGFyYW0gIHtBcnJheTxzdHJpbmc+fHVuZGVmaW5lZH0gYnJlYWRjcnVtYnMgVGhlIGJyZWFkY3J1bWJzIHRvIGdldCB0byB0aGUgZGVzaXJlZCBtZW51IGxldmVsLlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBzaG93T25seUJ1dHRvbnNPZkxldmVsKGJyZWFkY3J1bWJzOiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGlmICgoYnJlYWRjcnVtYnMgIT09IHVuZGVmaW5lZCkgJiYgKGJyZWFkY3J1bWJzLmxlbmd0aCA+IDApKSB7XG4gICAgICAgIC8vIE5vdCB0aGUgdG9wLWxldmVsIG1lbnUgb3IgZmxvb3IgYnV0dG9uLCBzbyBlbmFibGUgXCJMYXN0XCIgYnV0dG9uLlxuICAgICAgICBsYXRlc3RCcmVhZGNydW1ic1ZpZXdlZCA9IGJyZWFkY3J1bWJzO1xuICAgICAgICBpZiAobWVudUluZltcIkxhc3RcIl0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbWVudUluZltcIkxhc3RcIl0gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJHb2luZyB0b1wiLCBsYXRlc3RCcmVhZGNydW1ic1ZpZXdlZCk7XG4gICAgICAgICAgICAgICAgc2hvd09ubHlCdXR0b25zT2ZMZXZlbChsYXRlc3RCcmVhZGNydW1ic1ZpZXdlZCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGlkZSBhbGwgdGhlIGJ1dHRvbnMuXG4gICAgY29uc3QgYWxsQnV0dG9uc0xlbiA9IGFsbEJ1dHRvbnMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsQnV0dG9uc0xlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IGFsbEJ1dHRvbnNbaV07XG4gICAgICAgIGJ0bi5pc1Zpc2libGUoZmFsc2UpO1xuICAgIH1cblxuICAgIGlmIChicmVhZGNydW1icyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIEl0J3MgdGhlIGJ1dHRvbiBvbiB0aGUgZmxvb3IuIEp1c3QgbmVlZGVkIHRvIGhpZGUgYWxsIGJ1dHRvbnMsIHNvXG4gICAgICAgIC8vIG5vdyB5b3UncmUgZ29vZC5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZpbmQgdGhlIHN1Ym1lbnVcbiAgICBsZXQgc3ViTWVudSA9IG1lbnVJbmY7XG4gICAgY29uc3QgYnJlYWRjcnVtYnNMZW4gPSBicmVhZGNydW1icy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBicmVhZGNydW1ic0xlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGJyZWFkY3J1bWIgPSBicmVhZGNydW1ic1tpXTtcbiAgICAgICAgc3ViTWVudSA9IHN1Yk1lbnVbYnJlYWRjcnVtYl07XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBuYW1lcyBvZiB0aGUgc3VibWVudSBpdGVtcy5cbiAgICBjb25zdCBzdWJNZW51SXRlbU5hbWVzID0gT2JqZWN0LmtleXMoc3ViTWVudSk7XG5cbiAgICAvLyBTZXQgc29tZSBuYW1lcyBhc2lkZSBhcyBcInNwZWNpYWxcIi5cbiAgICBjb25zdCByZWRCdG5zID0gW1wiQ2xvc2UgTWVudSDDl1wiXTtcbiAgICBjb25zdCB5ZWxsb3dCdG5zID0gW1wiQmFjayDih6ZcIl07XG4gICAgY29uc3Qgc3BlY2lhbEJ0bnMgPSByZWRCdG5zLmNvbmNhdCh5ZWxsb3dCdG5zKTtcblxuICAgIC8vIFNvcnQgdGhvc2UgbmFtZXNcbiAgICBzdWJNZW51SXRlbU5hbWVzLnNvcnQoKGZpcnN0OiBzdHJpbmcsIHNlY29uZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIFNlZVxuICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81MTE2NS9ob3ctdG8tc29ydC1zdHJpbmdzLWluLWphdmFzY3JpcHRcbiAgICAgICAgY29uc3QgZmlyc3RJc1NwZWNpYWwgPSBzcGVjaWFsQnRucy5pbmRleE9mKGZpcnN0KSAhPT0gLTE7XG4gICAgICAgIGNvbnN0IHNlY29uZElzU3BlY2lhbCA9IHNwZWNpYWxCdG5zLmluZGV4T2Yoc2Vjb25kKSAhPT0gLTE7XG4gICAgICAgIGlmIChmaXJzdElzU3BlY2lhbCAmJiAhc2Vjb25kSXNTcGVjaWFsKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmICghZmlyc3RJc1NwZWNpYWwgJiYgc2Vjb25kSXNTcGVjaWFsKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKFwiXCIgKyBmaXJzdCkubG9jYWxlQ29tcGFyZShzZWNvbmQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBGaWd1cmUgb3V0IHdoYXQgbGF5b3V0IHRvIHVzZS5cbiAgICBsZXQgYnRuSWR4T3JkZXIgPSBbXTtcbiAgICBpZiAoc3ViTWVudUl0ZW1OYW1lcy5sZW5ndGggPD0gNCkge1xuICAgICAgICBidG5JZHhPcmRlciA9IFs3LCA2LCA1LCA0XTtcbiAgICB9IGVsc2UgaWYgKHN1Yk1lbnVJdGVtTmFtZXMubGVuZ3RoIDw9IDgpIHtcbiAgICAgICAgYnRuSWR4T3JkZXIgPSBbNywgNiwgNSwgNCwgMTEsIDEwLCA5LCA4XTtcbiAgICB9IGVsc2UgaWYgKHN1Yk1lbnVJdGVtTmFtZXMubGVuZ3RoIDw9IDEyKSB7XG4gICAgICAgIGJ0bklkeE9yZGVyID0gWzMsIDIsIDEsIDAsIDcsIDYsIDUsIDQsIDExLCAxMCwgOSwgOF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYnRuSWR4T3JkZXIgPSBbMywgMiwgMSwgMCwgNywgNiwgNSwgNCwgMTEsIDEwLCA5LCA4LCAxNSwgMTQsIDEzLCAxMl07XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFuZCBzaG93IHRoZSBidXR0b25zLlxuICAgIGNvbnN0IGxlbiA9IHN1Yk1lbnVJdGVtTmFtZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3Qgc3ViTWVudUl0ZW1OYW1lID0gc3ViTWVudUl0ZW1OYW1lc1tpXTtcbiAgICAgICAgY29uc3Qgc3ViTWVudUl0ZW0gPSBzdWJNZW51W3N1Yk1lbnVJdGVtTmFtZV07XG4gICAgICAgIGNvbnN0IGJ0bmlkeCA9IGJ0bklkeE9yZGVyW2ldO1xuICAgICAgICBjb25zdCBidG4gPSBhbGxCdXR0b25zW2J0bmlkeF07XG4gICAgICAgIGJ0bi51cGRhdGVUeHQoc3ViTWVudUl0ZW1OYW1lKTtcblxuICAgICAgICBzd2l0Y2ggKHR5cGVvZihzdWJNZW51SXRlbSkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgICAgICBidG4uY2xpY2tGdW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzaG93T25seUJ1dHRvbnNPZkxldmVsKGJyZWFkY3J1bWJzLmNvbmNhdChzdWJNZW51SXRlbU5hbWUpKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGJ0bi51cGRhdGVDb2xvcihcImdyZWVuXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgICAgICAgYnRuLmNsaWNrRnVuYyA9IHN1Yk1lbnVJdGVtO1xuICAgICAgICAgICAgICAgIGJ0bi51cGRhdGVDb2xvcihcImRlZmF1bHRcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlZEJ0bnMuaW5kZXhPZihzdWJNZW51SXRlbU5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgYnRuLnVwZGF0ZUNvbG9yKFwicmVkXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHllbGxvd0J0bnMuaW5kZXhPZihzdWJNZW51SXRlbU5hbWUpICE9PSAtMSkge1xuICAgICAgICAgICAgYnRuLnVwZGF0ZUNvbG9yKFwieWVsbG93XCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG1lbnVJbmZGbGF0VGhpc09uZS51cExldmVsIGRvZXNuJ3Qgc2VlbSB0byBiZSBuZWNlc3NhcnkuXG5cbiAgICAgICAgYnRuLmlzVmlzaWJsZSh0cnVlKTtcbiAgICB9XG59XG5cbi8qKlxuICogSWYgYSBnaXZlbiBzdWJtZW51IGhhcyBvbmx5IG9uZSBpdGVtLCBjb25kZW5zZSB0aGUgbWVudS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gcmVkdWNlU2luZ2xlSXRlbVN1Yk1lbnVzKCk6IHZvaWQge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gICAgICAgICAgIHN1Yk1lbnUgICAgICBUaGUgc3VibWVudSBkYXRhLlxuICAgICAqIEBwYXJhbSAge0FycmF5PHN0cmluZz59ICAgIGJyZWFkY3J1bWJzICBUaGV5IGxpc3Qgb2Yga2V5cyB0byBnZXQgdG9cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBwb2ludCBpbiB0aGUgbWVudS5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgY29uc3QgcmVjdXJzZSA9IChzdWJNZW51OiBhbnksIGJyZWFkY3J1bWJzOiBzdHJpbmdbXSk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKHN1Yk1lbnUpO1xuXG4gICAgICAgIC8vIFRoZXJlIHNob3VsZCBiZSB0aHJlZSBpdGVtcyBpbiBhIG9uZS1pdGVtIHN1Ym1lbnUsIGluY2x1ZGluZyBiYWNrXG4gICAgICAgIC8vIGFuZCBjbG9zZS5cbiAgICAgICAgaWYgKGtleXMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzVG9LZWVwID0ga2V5cy5maWx0ZXIoKGs6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChrID09PSBcIkNsb3NlIE1lbnUgw5dcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChrID09PSBcIkJhY2sg4oemXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoa2V5c1RvS2VlcC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IG9uZSBpdGVtIHJlbWFpbnMuIFRoYXQncyB0aGUgb25lIHRvIGNvbGxwYXNlLlxuICAgICAgICAgICAgICAgIGNvbnN0IGtleVRvS2VlcCA9IGtleXNUb0tlZXBbMF07XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIG5hbWUgb2YgdGhlIG5ldyBrZXkgKG9uZSB1cCB3aXRoIGtleVRvS2VlcCBhZGRlZCB0b1xuICAgICAgICAgICAgICAgIC8vIGVuZCkuXG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdEtleSA9IGJyZWFkY3J1bWJzW2JyZWFkY3J1bWJzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IGxhc3RLZXkgKyBcIjogXCIgKyBrZXlUb0tlZXA7XG5cbiAgICAgICAgICAgICAgICAvLyBSZWRlZmluZSB0aGUgYnJlYWRjcnVtYnNcbiAgICAgICAgICAgICAgICBicmVhZGNydW1icyA9IGJyZWFkY3J1bWJzLnNsaWNlKDAsIGJyZWFkY3J1bWJzLmxlbmd0aCAtIDEpLmNvbmNhdChbbmV3S2V5XSk7XG5cbiAgICAgICAgICAgICAgICAvLyBHbyB0aHJvdWdoIHRoZSBtZW51IGtleXMgdG8gZ2V0IHRvIHRoZSBzdWJtZW51IGFib3ZlIHRoaXNcbiAgICAgICAgICAgICAgICAvLyBvbmUuXG4gICAgICAgICAgICAgICAgc3ViTWVudSA9IG1lbnVJbmY7XG4gICAgICAgICAgICAgICAgY29uc3QgYnJlYWRjcnVtYnNCdXRMYXN0ID0gYnJlYWRjcnVtYnMuc2xpY2UoMCwgYnJlYWRjcnVtYnMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnJlYWRjcnVtYnNCdXRMYXN0TGVuID0gYnJlYWRjcnVtYnNCdXRMYXN0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJyZWFkY3J1bWJzQnV0TGFzdExlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJyZWFkY3J1bWIgPSBicmVhZGNydW1ic0J1dExhc3RbaV07XG4gICAgICAgICAgICAgICAgICAgIHN1Yk1lbnUgPSBzdWJNZW51W2JyZWFkY3J1bWJdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFJlbmFtZSBpZiBzdWJtZW51LlxuICAgICAgICAgICAgICAgIHN1Yk1lbnVbbmV3S2V5XSA9IHN1Yk1lbnVbbGFzdEtleV1ba2V5VG9LZWVwXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgc3ViTWVudVtsYXN0S2V5XTtcblxuICAgICAgICAgICAgICAgIC8vIEdvIGludG8gbmV3IHN1Ym1lbnVcbiAgICAgICAgICAgICAgICBzdWJNZW51ID0gc3ViTWVudVtuZXdLZXldO1xuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGtleXNcbiAgICAgICAgICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMoc3ViTWVudSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBrZXlzTGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c0xlbjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgY29uc3Qgc3ViTWVudUl0ZW1zID0gc3ViTWVudVtrZXldO1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlb2Yoc3ViTWVudUl0ZW1zKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzZShzdWJNZW51SXRlbXMsIGJyZWFkY3J1bWJzLmNvbmNhdChba2V5XSkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZWN1cnNlKG1lbnVJbmYsIFtdKTtcbn1cbiIsIi8vIEZ1bmN0aW9ucyBmb3IgbGVhZGVyIG1vZGUsIHRoYXQgdGhlIGxlYWRlciAobGVjdHVyZXIpIHVzZXMuXG5cbmltcG9ydCAqIGFzIENvbW1vbkNhbWVyYSBmcm9tIFwiLi4vQ2FtZXJhcy9Db21tb25DYW1lcmFcIjtcbmltcG9ydCAqIGFzIE9wZW5Qb3B1cCBmcm9tIFwiLi4vVUkvT3BlblBvcHVwL09wZW5Qb3B1cFwiO1xuaW1wb3J0ICogYXMgV2ViUlRDQmFzZSBmcm9tIFwiLi9XZWJSVENCYXNlXCI7XG5cbmV4cG9ydCBsZXQgaXNMZWN0dXJlckJyb2FkY2FzdGluZyA9IGZhbHNlO1xuXG5sZXQgbGVjdDogYW55O1xuXG5leHBvcnQgY2xhc3MgTGVjdHVyZXIgZXh0ZW5kcyBXZWJSVENCYXNlLldlYlJUQ0Jhc2Uge1xuICAgIHB1YmxpYyBpZFJlYWR5OiBhbnkgPSBudWxsO1xuICAgIHB1YmxpYyBnb3RDb25uOiBhbnkgPSBudWxsO1xuICAgIHByaXZhdGUgY29ubnM6IGFueSA9IFtdOyAgLy8gVGhlIGNvbm5lY3Rpb25zICh0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBvbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHRoaXMgaXMgdGhlIGxlY3R1cmVyKS5cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBsZXQgZ290Q29ublJlc29sdmU6IGFueTtcbiAgICAgICAgdGhpcy5nb3RDb25uID0gbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGdvdENvbm5SZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaWRSZWFkeSA9IG5ldyBQcm9taXNlKChpZFJlYWR5UmVzb2x2ZTogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXR1cFdlYlJUQ0NhbGxiYWNrcyhpZFJlYWR5UmVzb2x2ZSwgZ290Q29ublJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGRhdGEgdG8gYSByZW1vdGUgd2VicnRjIHBhcnRuZXIuXG4gICAgICogQHBhcmFtICB7Kn0gZGF0YSAgVGhlIGRhdGEgdG8gc2VuZC5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgcHVibGljIHNlbmREYXRhKGRhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAoV2ViUlRDQmFzZS5ERUJVRyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTZW5kOlwiLCBkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICBjb25zdCBjb25uc0xlbiA9IHRoaXMuY29ubnMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbm5zTGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbm4gPSB0aGlzLmNvbm5zW2ldO1xuICAgICAgICAgICAgY29ubi5zZW5kKGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCB0aGUgd2VicnRjIGNhbGxiYWNrIGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbihzdHJpbmcpfSBpZFJlYWR5UmVzb2x2ZSAgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZWVyLmpzIGlzIG9wZW4uXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb24oKX0gICAgICAgZ290Q29ublJlc29sdmUgIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNvbm5lY3Rpb24gaXMgcmVzb2x2ZWQuXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0dXBXZWJSVENDYWxsYmFja3MoaWRSZWFkeVJlc29sdmU6IGFueSwgZ290Q29ublJlc29sdmU6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLnBlZXIub24oXCJvcGVuXCIsIChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBwZWVyLnJlY29ubmVjdCBkZWxldGluZyBwcmV2aW91cyBpZFxuICAgICAgICAgICAgaWYgKHRoaXMucGVlci5pZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIFdlYlJUQ0Jhc2Uud2ViUlRDRXJyb3JNc2coXCJSZWNlaXZlZCBudWxsIGlkIGZyb20gcGVlciBvcGVuLlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBlZXIuaWQgPSB0aGlzLnBlZXJJZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZWVySWQgPSB0aGlzLnBlZXIuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZFJlYWR5UmVzb2x2ZSh0aGlzLnBlZXJJZCk7XG5cbiAgICAgICAgICAgIGlmIChXZWJSVENCYXNlLkRFQlVHID09PSB0cnVlKSB7IGNvbnNvbGUubG9nKHRoaXMucGVlcklkKTsgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCZWxvdyBvbmx5IG5lZWRlZCBvbiBsZWN0dXJlci4gSXQncyB3aGVuIGEgY29ubmVjdGlvbiBpcyByZWNlaXZlZC5cbiAgICAgICAgdGhpcy5wZWVyLm9uKFwiY29ubmVjdGlvblwiLCAoYzogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbm5zLnB1c2goYyk7XG4gICAgICAgICAgICBnb3RDb25uUmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKFdlYlJUQ0Jhc2UuREVCVUcgPT09IHRydWUpIHsgY29uc29sZS5sb2coXCJMZWN0dXJlcjogYWRkZWQgYSBjb25uZWN0aW9uXCIpOyB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGVlci5vbihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICAgICAgY29uc3QgY29ubnNMZW4gPSB0aGlzLmNvbm5zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29ubnNMZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29ubnNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgV2ViUlRDQmFzZS53ZWJSVENTdGFuZGFyZEVycm9yTXNnKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBTdGFydCBicm9hZGNhc3RpbmcgaW5mb3JtYXRpb24gbGlrZSB0aGUgY3VycmVudCBjYW1lcmEgbG9jYXRpb24gYW5kXG4gKiBwb3NpdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0QnJvYWRjYXN0KCk6IHZvaWQge1xuICAgIGlzTGVjdHVyZXJCcm9hZGNhc3RpbmcgPSB0cnVlO1xuXG4gICAgLy8gQ29udGFjdCB0aGUgcGVlcmpzIHNlcnZlclxuICAgIGxlY3QgPSBuZXcgTGVjdHVyZXIoKTtcblxuICAgIGxlY3QuaWRSZWFkeS50aGVuKChpZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIE9wZW5Qb3B1cC5vcGVuTW9kYWwoXG4gICAgICAgICAgICBcIkxlYWRlclwiLCBcInBhZ2VzL2xlYWRlci5odG1sP2Y9XCIgKyBpZCwgdHJ1ZSwgdHJ1ZVxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gUGVyaW9kaWNhbGx5IHNlbmQgdGhlIGluZm9ybWF0aW9uIGFib3V0IHRoZSByZXByZXNlbnRhdGlvbnMuXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3MgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKTtcbiAgICAgICAgY29uc3Qgcm90UXVhID0gQ29tbW9uQ2FtZXJhLmdldENhbWVyYVJvdGF0aW9uUXVhdGVybmlvbigpO1xuXG4gICAgICAgIGNvbnN0IHJvdEZhYyA9IDEuMDtcbiAgICAgICAgY29uc3QgdmFsID0gW3Bvcy54LCBwb3MueSwgcG9zLnosIHJvdEZhYyAqIHJvdFF1YS54LCByb3RGYWMgKiByb3RRdWEueSwgcm90RmFjICogcm90UXVhLnosIHJvdEZhYyAqIHJvdFF1YS53XTtcbiAgICAgICAgbGVjdC5zZW5kRGF0YSh7XG4gICAgICAgICAgICBcInR5cGVcIjogXCJsb2Nyb3RcIixcbiAgICAgICAgICAgIFwidmFsXCI6IHZhbCxcbiAgICAgICAgfSk7XG4gICAgfSwgMTAwKTtcblxuICAgIC8vIFBlcmlvZGljYWxseSBzZW5kIHRoZSBjdXJyZW50IHVybCAodG8gc3luYyBpbml0aWFsIHJlcHJlc2VudGF0aW9ucyB3aXRoXG4gICAgLy8gcmVtb3RlKS5cbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGxlY3Quc2VuZERhdGEoe1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiaW5pdGlhbFVybFwiLFxuICAgICAgICAgICAgXCJ2YWxcIjogd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICAgICAgfSk7XG4gICAgfSwgMjAwMCk7XG59XG5cbi8qKlxuICogU2VuZHMgdGhlIGRhdGEgdG8gdGhlIHN0dWRlbnQgc28gdGhleSBjYW4gcnVuIFZpc1N0eWxlcy50b2dnbGVSZXAgaW4gdGhlaXJcbiAqIFByb3RlaW5WUiBpbnN0YW5jZS5cbiAqIEBwYXJhbSAge0FycmF5PCo+fSAgICAgICAgICAgIGZpbHRlcnMgICAgICAgIENhbiBpbmNsdWRlIHN0cmluZ3MgKGxvb2t1cFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsIGluIHNlbEtleVdvcmRUbzNETW9sU2VsKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9yIGEgM0RNb2xqcyBzZWxlY3Rpb24gb2JqZWN0LlxuICogQHBhcmFtICB7c3RyaW5nfSAgICAgICAgICAgICAgcmVwTmFtZSAgICAgICAgVGhlIHJlcHJlc2VudGF0aXZlIG5hbWUuIExpa2VcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiU3VyZmFjZVwiLlxuICogQHBhcmFtICB7c3RyaW5nfSAgICAgICAgICAgICAgY29sb3JTY2hlbWUgICAgVGhlIG5hbWUgb2YgdGhlIGNvbG9yIHNjaGVtZS5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufHVuZGVmaW5lZH0gIGZpbmFsQ2FsbGJhY2sgIENhbGxiYWNrIHRvIHJ1biBvbmNlIHRoZSBtZXNoXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBlbnRpcmVseSBkb25lLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VuZFRvZ2dsZVJlcENvbW1hbmQoZmlsdGVyczogYW55W10sIHJlcE5hbWU6IHN0cmluZywgY29sb3JTY2hlbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGxlY3Quc2VuZERhdGEoe1xuICAgICAgICBcInR5cGVcIjogXCJ0b2dnbGVSZXBcIixcbiAgICAgICAgXCJ2YWxcIjp7XG4gICAgICAgICAgICBcImZpbHRlcnNcIjogZmlsdGVycyxcbiAgICAgICAgICAgIFwicmVwTmFtZVwiOiByZXBOYW1lLFxuICAgICAgICAgICAgXCJjb2xvclNjaGVtZVwiOiBjb2xvclNjaGVtZVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2VuZHMgdGhlIGRhdGEgdG8gdGhlIHN0dWRlbnQgc28gdGhleSBjYW4gcnVuIFJvdGF0aW9ucy5heGlzUm90YXRpb24uXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGF4aXMgVGhlIGF4aXMgdG8gcm90YXRlIGFib3V0LlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VuZFVwZGF0ZU1vbFJvdENvbW1hbmQoYXhpczogc3RyaW5nKTogdm9pZCB7XG4gICAgbGVjdC5zZW5kRGF0YSh7XG4gICAgICAgIFwidHlwZVwiOiBcIm1vbEF4aXNSb3RhdGlvblwiLFxuICAgICAgICBcInZhbFwiOiBheGlzXG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZW5kVW5kb1JvdENvbW1hbmQoKTogdm9pZCB7XG4gICAgbGVjdC5zZW5kRGF0YSh7XG4gICAgICAgIFwidHlwZVwiOiBcIm1vbFVuZG9Sb3RcIixcbiAgICAgICAgXCJ2YWxcIjogdW5kZWZpbmVkXG4gICAgfSk7XG59XG5cbi8vIEZvciBkZWJ1Z2dpbmcuLi5cbi8vIHdpbmRvd1tcInN0YXJ0QnJvYWRjYXN0XCJdID0gc3RhcnRCcm9hZGNhc3Q7XG4iLCJpbXBvcnQgKiBhcyBQb3NpdGlvbkluU2NlbmUgZnJvbSBcIi4uLy4uL01vbHMvM0RNb2wvUG9zaXRpb25JblNjZW5lXCI7XG5pbXBvcnQgKiBhcyBWUk1MIGZyb20gXCIuLi8uLi9Nb2xzLzNETW9sL1ZSTUxcIjtcbmltcG9ydCAqIGFzIFZhcnMgZnJvbSBcIi4uLy4uL1ZhcnMvVmFyc1wiO1xuaW1wb3J0ICogYXMgTGVjdHVyZXIgZnJvbSBcIi4uLy4uL1dlYlJUQy9MZWN0dXJlclwiO1xuXG4vKipcbiAqIEJ1aWxkcyBhIHN1Ym1lbnUgb2JqZWN0IGRlc2NyaWJpbmcgaG93IHRoZSBtb2RlbHMgYW5kIGJlIHJvdGF0ZWQuXG4gKiBAcmV0dXJucyBPYmplY3QgVGhlIHN1Ym1lbnUgb2JqY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJvdGF0aW9uc1N1Yk1lbnUoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBcIlVuZG8gUm90YXRlXCI6ICgpID0+IHtcbiAgICAgICAgICAgIHVuZG9Sb3RhdGUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJYIEF4aXNcIjogKCkgPT4ge1xuICAgICAgICAgICAgYXhpc1JvdGF0aW9uKFwieFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJZIEF4aXNcIjogKCkgPT4ge1xuICAgICAgICAgICAgYXhpc1JvdGF0aW9uKFwieVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJaIEF4aXNcIjogKCkgPT4ge1xuICAgICAgICAgICAgYXhpc1JvdGF0aW9uKFwielwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBCZWxvdyBqdWRnZWQgdW5uZWNlc3Nhcnkgd2l0aCBuZXcgXCJ1bmRvXCIgYnV0dG9uLlxuICAgICAgICAvLyBcIi1YIEF4aXNcIjogKCkgPT4ge1xuICAgICAgICAvLyAgICAgVlJNTC51cGRhdGVNb2xSb3RhdGlvbihcInhcIiwgLWFtdCk7XG4gICAgICAgIC8vICAgICBQb3NpdGlvbkluU2NlbmUucG9zaXRpb25BbGwzRE1vbE1lc2hJbnNpZGVBbm90aGVyKHVuZGVmaW5lZCwgVmFycy5zY2VuZS5nZXRNZXNoQnlOYW1lKFwicHJvdGVpbl9ib3hcIikpO1xuICAgICAgICAvLyB9LFxuICAgICAgICAvLyBcIi1ZIEF4aXNcIjogKCkgPT4ge1xuICAgICAgICAvLyAgICAgVlJNTC51cGRhdGVNb2xSb3RhdGlvbihcInlcIiwgLWFtdCk7XG4gICAgICAgIC8vICAgICBQb3NpdGlvbkluU2NlbmUucG9zaXRpb25BbGwzRE1vbE1lc2hJbnNpZGVBbm90aGVyKHVuZGVmaW5lZCwgVmFycy5zY2VuZS5nZXRNZXNoQnlOYW1lKFwicHJvdGVpbl9ib3hcIikpO1xuICAgICAgICAvLyB9LFxuICAgICAgICAvLyBcIi1aIEF4aXNcIjogKCkgPT4ge1xuICAgICAgICAvLyAgICAgVlJNTC51cGRhdGVNb2xSb3RhdGlvbihcInpcIiwgLWFtdCk7XG4gICAgICAgIC8vICAgICBQb3NpdGlvbkluU2NlbmUucG9zaXRpb25BbGwzRE1vbE1lc2hJbnNpZGVBbm90aGVyKHVuZGVmaW5lZCwgVmFycy5zY2VuZS5nZXRNZXNoQnlOYW1lKFwicHJvdGVpbl9ib3hcIikpO1xuICAgICAgICAvLyB9LFxuICAgIH07XG59XG5cbi8qKlxuICogUm90YXRlcyB0aGUgbW9sZWN1bGUgYWJvdXQgYSBnaXZlbiBheGlzLlxuICogQHBhcmFtICB7c3RyaW5nfSBheGlzIFRoZSBheGlzIHRvIHJvdGF0ZSBhYm91dC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF4aXNSb3RhdGlvbihheGlzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBhbXQgPSAxNS4wICogTWF0aC5QSSAvIDE4MC4wO1xuICAgIFZSTUwudXBkYXRlTW9sUm90YXRpb24oYXhpcywgYW10KTtcbiAgICBQb3NpdGlvbkluU2NlbmUucG9zaXRpb25BbGwzRE1vbE1lc2hJbnNpZGVBbm90aGVyKFxuICAgICAgICB1bmRlZmluZWQsIFZhcnMuc2NlbmUuZ2V0TWVzaEJ5TmFtZShcInByb3RlaW5fYm94XCIpLCB0cnVlXG4gICAgKTtcblxuICAgIGlmIChMZWN0dXJlci5pc0xlY3R1cmVyQnJvYWRjYXN0aW5nKSB7XG4gICAgICAgIC8vIExldCB0aGUgc3R1ZGVudCBrbm93IGFib3V0IHRoaXMgY2hhbmdlLi4uXG4gICAgICAgIExlY3R1cmVyLnNlbmRVcGRhdGVNb2xSb3RDb21tYW5kKGF4aXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBVbmRvIGEgcHJldmlvdXMgcm90YXRpb24uXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmRvUm90YXRlKCk6IHZvaWQge1xuICAgIGNvbnN0IHZlYyA9IFBvc2l0aW9uSW5TY2VuZS5sYXN0Um90YXRpb25CZWZvcmVBbmltYXRpb247XG4gICAgVlJNTC5zZXRNb2xSb3RhdGlvbih2ZWMueCwgdmVjLnksIHZlYy56KTtcbiAgICBQb3NpdGlvbkluU2NlbmUucG9zaXRpb25BbGwzRE1vbE1lc2hJbnNpZGVBbm90aGVyKFxuICAgICAgICB1bmRlZmluZWQsIFZhcnMuc2NlbmUuZ2V0TWVzaEJ5TmFtZShcInByb3RlaW5fYm94XCIpLCB0cnVlXG4gICAgKTtcblxuICAgIGlmIChMZWN0dXJlci5pc0xlY3R1cmVyQnJvYWRjYXN0aW5nKSB7XG4gICAgICAgIC8vIExldCB0aGUgc3R1ZGVudCBrbm93IGFib3V0IHRoaXMgY2hhbmdlLi4uXG4gICAgICAgIExlY3R1cmVyLnNlbmRVbmRvUm90Q29tbWFuZCgpO1xuICAgIH1cbn1cbiIsIi8vIFRoaXMgbW9kdWxlIHNldHMgdXAgdGhlIFZSIGNhbWVyYS5cblxuaW1wb3J0ICogYXMgTmF2aWdhdGlvbiBmcm9tIFwiLi4vTmF2aWdhdGlvbi9OYXZpZ2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBQaWNrYWJsZXMgZnJvbSBcIi4uL05hdmlnYXRpb24vUGlja2FibGVzXCI7XG5pbXBvcnQgKiBhcyBPcHRpbWl6YXRpb25zIGZyb20gXCIuLi9TY2VuZS9PcHRpbWl6YXRpb25zXCI7XG5pbXBvcnQgKiBhcyBWYXJzIGZyb20gXCIuLi9WYXJzL1ZhcnNcIjtcbmltcG9ydCAqIGFzIFZSQ29udHJvbGxlcnMgZnJvbSBcIi4vVlJDb250cm9sbGVyc1wiO1xuaW1wb3J0ICogYXMgVXJsVmFycyBmcm9tIFwiLi4vVmFycy9VcmxWYXJzXCI7XG5cbmRlY2xhcmUgdmFyIEJBQllMT046IGFueTtcblxubGV0IGxhc3RUaW1lSlNSdW5uaW5nQ2hlY2tlZDogbnVtYmVyO1xuXG4vKipcbiAqIFNldHMgdXAgdGhlIFZSIGNhbWVyYS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKCk6IHZvaWQge1xuICAgIGlmIChVcmxWYXJzLmNoZWNrV2VicnRjSW5VcmwoKSkge1xuICAgICAgICAvLyBOZXZlciBkbyBWUiBpbiB3ZWJydGMgbW9kZS5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNldHVwIGRpZmZlcmVudCB0cmlnZ2VyIFZSIGZ1bmN0aW9ucyAoY2hhbmdlcyBzdGF0ZSwgZXRjLilcbiAgICBzZXR1cEVudGVyQW5kRXhpdFZSQ2FsbGJhY2tzKCk7XG4gICAgVlJDb250cm9sbGVycy5zZXR1cCgpO1xuXG4gICAgLy8gV2hlbiB5b3UgZ2FpbiBvciBsb29zZSBmb2N1cywgYWx3YXlzIGV4aXQgVlIgbW9kZS4gRG9pbmcgdGhpcyBmb3JcbiAgICAvLyBpcGhvbmUgcHdhLCB3aGljaCBvdGhlcndpc2UgY2FuJ3QgZXhpdCBWUiBtb2RlLlxuICAgIC8vIGpRdWVyeSh3aW5kb3cpLmZvY3VzKCgpID0+IHsgZXhpdFZSQW5kRlMoKTsgfSk7XG4gICAgLy8galF1ZXJ5KHdpbmRvdykuYmx1cigoKSA9PiB7IGV4aXRWUkFuZEZTKCk7IH0pO1xuICAgIC8vIGpRdWVyeShcImJvZHlcIikuZm9jdXMoKCkgPT4geyBleGl0VlJBbmRGUygpOyB9KTtcbiAgICAvLyBqUXVlcnkoXCJib2R5XCIpLmJsdXIoKCkgPT4geyBleGl0VlJBbmRGUygpOyB9KTtcbiAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidmlzaWJpbGl0eWNoYW5nZVwiLCAoKSA9PiB7IGV4aXRWUkFuZEZTKCk7IH0sIGZhbHNlKTtcblxuICAgIC8vIFN1cnByaXppbmdseSwgbm9uZSBvZiB0aGUgYWJvdmUgYXJlIHRyaWdnZXJpbmcgb24gaW9zIHB3YSEgTGV0J3MgdHJ5IGFuXG4gICAgLy8gYWRkaXRpb25hbCBhcHByb2FjaC4uLlxuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGlmIChsYXN0VGltZUpTUnVubmluZ0NoZWNrZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFzdFRpbWVKU1J1bm5pbmdDaGVja2VkID0gbm93O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlbHRhVGltZSA9IG5vdyAtIGxhc3RUaW1lSlNSdW5uaW5nQ2hlY2tlZDtcbiAgICAgICAgaWYgKGRlbHRhVGltZSA+IDIwMDApIHtcbiAgICAgICAgICAgIC8vIEphdmFzY3JpcHQgbXVzdCBoYXZlIHN0b3BwZWQgcmVjZW50bHkuXG4gICAgICAgICAgICBleGl0VlJBbmRGUygpO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RUaW1lSlNSdW5uaW5nQ2hlY2tlZCA9IG5vdztcbiAgICB9LCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFeGl0cyBWUiBhbmQvb3IgZnVsbC1zY3JlZW4gbW9kZSwgaWYgbmVjZXNzYXJ5LlxuICogQHJldHVybnMgdm9pZFxuICovXG5mdW5jdGlvbiBleGl0VlJBbmRGUygpOiB2b2lkIHtcbiAgICBpZiAoVmFycy52ckhlbHBlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJIHdvbmRlcmVkIGlmIHRoZSBpZiBzdGF0ZW1lbnRzIGJlbG93IHByZXZlbnRlZCBpb3MgcHdhIGZyb20gd29ya2luZy5cbiAgICAvLyBDb3VsZCBiZSB3cm9uZywgYnV0IGRvZXNuJ3QgaHVydCB0byBvbWl0IHRoZW0uIExlYXZlIHRoZW0gY29tbWVudGVkIGluXG4gICAgLy8gY2FzZSB5b3UgbmVlZCB0aGVtIGluIHRoZSBmdXR1cmUuXG5cbiAgICAvLyBpZiAoVmFycy52ckhlbHBlci5pc0luVlJNb2RlKSB7XG4gICAgICAgIFZhcnMudnJIZWxwZXIuZXhpdFZSKCk7XG4gICAgLy8gfVxuXG4gICAgLy8gaWYgKFZhcnMudnJIZWxwZXIuX2Z1bGxzY3JlZW5WUnByZXNlbnRpbmcpIHtcbiAgICBWYXJzLnNjZW5lLmdldEVuZ2luZSgpLmV4aXRGdWxsc2NyZWVuKCk7XG4gICAgLy8gfVxufVxuXG4vKipcbiAqIFNldHMgdXAgdGhlIGVudGVyIGFuZCBleGl0IFZSIGZ1bmN0aW9ucy4gV2hlbiBlbnRlcnMsIHNldHMgdXAgVlIuIFdoZW5cbiAqIGV4aXN0cywgZG93bmdyYWRlcyB0byBub24tVlIgbmF2aWdhdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gc2V0dXBFbnRlckFuZEV4aXRWUkNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICBWYXJzLnZySGVscGVyLm9uRW50ZXJpbmdWUk9ic2VydmFibGUuYWRkKChhOiBhbnksIGI6IGFueSkgPT4ge1xuICAgICAgICAvLyBXaGVuIHlvdSBlbnRlciBWUi4gTm90IHN1cmUgd2hhdCBhIGFuZCBiIGFyZS4gQm90aCBhcmUgb2JqZWN0cy5cblxuICAgICAgICAvLyBVcGRhdGUgbmF2TW9kZVxuICAgICAgICBWYXJzLnZyVmFycy5uYXZNb2RlID0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSTm9Db250cm9sbGVycztcblxuICAgICAgICAvLyBTZXR1cCB0ZWxlcG9ydGF0aW9uLiBJZiB1bmNvbW1lbnRlZCwgdGhpcyBpcyB0aGUgb25lIHRoYXQgY29tZXNcbiAgICAgICAgLy8gd2l0aCBCQUJZTE9OLmpzLlxuICAgICAgICAvLyBzZXR1cENhbm5lZFZSVGVsZXBvcnRhdGlvbigpO1xuXG4gICAgICAgIHNldHVwR2F6ZVRyYWNrZXIoKTtcblxuICAgICAgICAvLyBSZXNldCBzZWxlY3RlZCBtZXNoLlxuICAgICAgICBQaWNrYWJsZXMuc2V0Q3VyUGlja2VkTWVzaCh1bmRlZmluZWQpO1xuXG4gICAgICAgIC8vIFlvdSBuZWVkIHRvIHJlY2FsY3VsYXRlIHRoZSBzaGFkb3dzLiBJJ3ZlIGZvdW5kIHlvdSBnZXQgYmFja1xuICAgICAgICAvLyBzaGFkb3dzIGluIFZSIG90aGVyd2lzZS5cbiAgICAgICAgT3B0aW1pemF0aW9ucy51cGRhdGVFbnZpcm9ubWVudFNoYWRvd3MoKTtcblxuICAgICAgICAvLyBIaWRlIHRoZSAyRCBidXR0b25zLlxuICAgICAgICBqUXVlcnkoXCIudWktYnV0dG9uXCIpLmhpZGUoKTtcbiAgICAgICAgalF1ZXJ5KFwiLmJhYnlsb25WUmljb25cIikuaGlkZSgpO1xuXG4gICAgICAgIC8vIFN0YXJ0IHRyeWluZyB0byBpbml0aWFsaXZlIHRoZSBjb250cm9sbGVycyAoaW4gY2FzZSB0aGV5IHdlcmVuJ3RcbiAgICAgICAgLy8gaW5pdGFsaXplZCBhbHJlYWR5KS5cbiAgICAgICAgVlJDb250cm9sbGVycy5zdGFydENoZWNraW5nRm9yQ29udHJvbGVycygpO1xuXG4gICAgICAgIHdpbmRvd1tcInZySGVscGVyXCJdID0gVmFycy52ckhlbHBlcjtcbiAgICB9KTtcblxuICAgIFZhcnMudnJIZWxwZXIub25FeGl0aW5nVlJPYnNlcnZhYmxlLmFkZCgoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSBuYXZNb2RlXG4gICAgICAgIFZhcnMudnJWYXJzLm5hdk1vZGUgPSBOYXZpZ2F0aW9uLk5hdk1vZGUuTm9WUjtcblxuICAgICAgICAvLyBSZXNldCBzZWxlY3RlZCBtZXNoLlxuICAgICAgICBQaWNrYWJsZXMuc2V0Q3VyUGlja2VkTWVzaCh1bmRlZmluZWQpO1xuXG4gICAgICAgIC8vIExldCdzIHJlY2FsY3VsYXRlIHRoZSBzaGFkb3dzIGhlcmUgYWdhaW4gdG9vLCBqdXN0IHRvIGJlIG9uIHRoZVxuICAgICAgICAvLyBzYWZlIHNpZGUuXG4gICAgICAgIE9wdGltaXphdGlvbnMudXBkYXRlRW52aXJvbm1lbnRTaGFkb3dzKCk7XG5cbiAgICAgICAgLy8gU2hvdyB0aGUgMkQgYnV0dG9ucy5cbiAgICAgICAgalF1ZXJ5KFwiLnVpLWJ1dHRvblwiKS5zaG93KCk7XG4gICAgICAgIGpRdWVyeShcIi5iYWJ5bG9uVlJpY29uXCIpLnNob3coKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBIHBsYWNlaG9sZGVyIG1lc2guIE5vdCB0ZWNobmljYWxseSBlbXB0eSwgYnV0IHByZXR0eSBjbG9zZS5cbiAqIEByZXR1cm5zIHsqfSBUaGUgY3VzdG9tIG1lc2ggKGFsbW9zdCBhbiBlbXB0eSkuXG4gKi9cbmZ1bmN0aW9uIG1ha2VFbXB0eU1lc2goKTogYW55IHtcbiAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgIGNvbnN0IGN1c3RvbU1lc2ggPSBuZXcgQkFCWUxPTi5NZXNoKFwidnJOYXZUYXJnZXRNZXNoXCIsIFZhcnMuc2NlbmUpO1xuXG4gICAgLyoqIEBjb25zdCB7QXJyYXk8bnVtYmVyPn0gKi9cbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbMCwgMCwgMF07XG5cbiAgICAvKiogQGNvbnN0IHtBcnJheTxudW1iZXI+fSAqL1xuICAgIGNvbnN0IGluZGljZXMgPSBbMF07XG5cbiAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgIGNvbnN0IHZlcnRleERhdGEgPSBuZXcgQkFCWUxPTi5WZXJ0ZXhEYXRhKCk7XG5cbiAgICB2ZXJ0ZXhEYXRhLnBvc2l0aW9ucyA9IHBvc2l0aW9ucztcbiAgICB2ZXJ0ZXhEYXRhLmluZGljZXMgPSBpbmRpY2VzO1xuICAgIHZlcnRleERhdGEuYXBwbHlUb01lc2goY3VzdG9tTWVzaCk7XG4gICAgY3VzdG9tTWVzaC5pc1Zpc2libGUgPSBmYWxzZTtcblxuICAgIHJldHVybiBjdXN0b21NZXNoO1xufVxuXG4vKipcbiAqIFNldHMgdXAgdGhlIFZSIGdhemUgdHJhY2tpbmcgbWVzaC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldHVwR2F6ZVRyYWNrZXIoKTogdm9pZCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0geyp9XG4gICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAqL1xuICAgIFZhcnMudnJIZWxwZXIucmF5U2VsZWN0aW9uUHJlZGljYXRlID0gKG1lc2g6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAvLyBpZiAoIW1lc2guaXNWaXNpYmxlKSB7XG4gICAgICAgIC8vICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIH1cbiAgICAgICAgcmV0dXJuIFBpY2thYmxlcy5jaGVja0lmTWVzaFBpY2thYmxlKG1lc2gpO1xuICAgIH07XG5cbiAgICAvLyBNYWtlIGFuIGludmlzaWJsZSBtZXNoIHRoYXQgd2lsbCBiZSBwb3NpdGlvbmVkIGF0IGxvY2F0aW9uIG9mIGdhemUuXG4gICAgVmFycy52ckhlbHBlci5nYXplVHJhY2tlck1lc2ggPSBtYWtlRW1wdHlNZXNoKCk7XG4gICAgVmFycy52ckhlbHBlci51cGRhdGVHYXplVHJhY2tlclNjYWxlID0gZmFsc2U7ICAvLyBCYWJ5bG9uIDMuMyBwcmV2aWV3LlxuICAgIFZhcnMudnJIZWxwZXIuZGlzcGxheUdhemUgPSB0cnVlOyAgLy8gRG9lcyBuZWVkIHRvIGJlIHRydWUuIE90aGVyd2lzZSwgcG9zaXRpb24gbm90IHVwZGF0ZWQuXG4gICAgVmFycy52ckhlbHBlci5lbmFibGVHYXplRXZlbldoZW5Ob1BvaW50ZXJMb2NrID0gdHJ1ZTtcbiAgICAvLyBjb25zb2xlLmxvZyhWYXJzLnZySGVscGVyKTtcblxuICAgIFZhcnMudnJIZWxwZXIuZW5hYmxlSW50ZXJhY3Rpb25zKCk7XG5cbiAgICAvLyBGb3IgZGVidWdnaW5nLi4uXG4gICAgLy8gd2luZG93LnZySGVscGVyID0gVmFycy52ckhlbHBlcjtcbn1cbiIsImltcG9ydCAqIGFzIFRocmVlRE1vbCBmcm9tIFwiLi4vTW9scy8zRE1vbC9UaHJlZURNb2xcIjtcbmltcG9ydCAqIGFzIFZpc1N0eWxlcyBmcm9tIFwiLi4vTW9scy8zRE1vbC9WaXNTdHlsZXNcIjtcbmltcG9ydCAqIGFzIFZSTUwgZnJvbSBcIi4uL01vbHMvM0RNb2wvVlJNTFwiO1xuaW1wb3J0ICogYXMgU3R1ZGVudCBmcm9tIFwiLi4vV2ViUlRDL1N0dWRlbnRcIjtcbmltcG9ydCAqIGFzIFZhcnMgZnJvbSBcIi4vVmFyc1wiO1xuaW1wb3J0ICogYXMgQ29tbW9uQ2FtZXJhIGZyb20gXCIuLi9DYW1lcmFzL0NvbW1vbkNhbWVyYVwiO1xuLy8gaW1wb3J0ICogYXMgT3BlblBvcHVwIGZyb20gXCIuLi9VSS9PcGVuUG9wdXAvT3BlblBvcHVwXCI7XG5cbmRlY2xhcmUgdmFyIGpRdWVyeTogYW55O1xuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG5jb25zdCBzdHlsZXNRdWV1ZTogYW55W10gPSBbXTtcbmV4cG9ydCBsZXQgd2VicnRjOiBhbnkgPSB1bmRlZmluZWQ7XG5leHBvcnQgbGV0IHNoYWRvd3MgPSBmYWxzZTtcbmxldCB1cmxQYXJhbXM6IGFueTtcblxuLyoqXG4gKiBHZXQgYWxsIHRoZSB1cmwgcGFyYW1ldGVycyBmcm9tIGEgdXJsIHN0cmluZy5cbiAqIEBwYXJhbSAge3N0cmluZ30gdXJsICBUaGUgdXJsIHNydHJpbmcuXG4gKiBAcmV0dXJucyBPYmplY3Q8c3RyaW5nLCo+IFRoZSBwYXJhbWV0ZXJzLlxuICovXG5mdW5jdGlvbiBnZXRBbGxVcmxQYXJhbXModXJsOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vIEFkYXB0ZWQgZnJvbVxuICAgIC8vIGh0dHBzOi8vd3d3LnNpdGVwb2ludC5jb20vZ2V0LXVybC1wYXJhbWV0ZXJzLXdpdGgtamF2YXNjcmlwdC9cblxuICAgIC8vIGdldCBxdWVyeSBzdHJpbmcgZnJvbSB1cmwgKG9wdGlvbmFsKSBvciB3aW5kb3dcbiAgICBsZXQgcXVlcnlTdHJpbmcgPSB1cmwgPyB1cmwuc3BsaXQoXCI/XCIpWzFdIDogd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zbGljZSgxKTtcblxuICAgIC8vIHdlJ2xsIHN0b3JlIHRoZSBwYXJhbWV0ZXJzIGhlcmVcbiAgICBjb25zdCBvYmogPSB7fTtcblxuICAgIC8vIGlmIHF1ZXJ5IHN0cmluZyBleGlzdHNcbiAgICBpZiAocXVlcnlTdHJpbmcpIHtcblxuICAgICAgICAvLyBzdHVmZiBhZnRlciAjIGlzIG5vdCBwYXJ0IG9mIHF1ZXJ5IHN0cmluZywgc28gZ2V0IHJpZCBvZiBpdFxuICAgICAgICBxdWVyeVN0cmluZyA9IHF1ZXJ5U3RyaW5nLnNwbGl0KFwiI1wiKVswXTtcblxuICAgICAgICAvLyBzcGxpdCBvdXIgcXVlcnkgc3RyaW5nIGludG8gaXRzIGNvbXBvbmVudCBwYXJ0c1xuICAgICAgICBjb25zdCBhcnI6IHN0cmluZ1tdID0gcXVlcnlTdHJpbmcuc3BsaXQoXCImXCIpO1xuXG4gICAgICAgIGNvbnN0IGFyckxlbiA9IGFyci5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyTGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBhcnJbaV07XG4gICAgICAgICAgICAvLyBzZXBhcmF0ZSB0aGUga2V5cyBhbmQgdGhlIHZhbHVlc1xuICAgICAgICAgICAgY29uc3Qga2V5VmFsUGFpciA9IGEuc3BsaXQoXCI9XCIpO1xuXG4gICAgICAgICAgICAvLyBzZXQgcGFyYW1ldGVyIG5hbWUgYW5kIHZhbHVlICh1c2UgJ3RydWUnIGlmIGVtcHR5KVxuICAgICAgICAgICAgY29uc3QgcGFyYW1OYW1lID0ga2V5VmFsUGFpclswXTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtVmFsdWUgPSAoa2V5VmFsUGFpclsxXSA9PT0gdW5kZWZpbmVkKSA/IHRydWUgOiBrZXlWYWxQYWlyWzFdO1xuXG4gICAgICAgICAgICBvYmpbcGFyYW1OYW1lXSA9IHBhcmFtVmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFJvdW5kIGEgbnVtYmVyIGFuZCByZXByZXNlbnQgaXQgYXMgYSBzdHJpbmcuXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHggIFRoZSBudW1iZXIuXG4gKiBAcmV0dXJucyBzdHJpbmcgVGhlIHJvdW5kZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiByb3VuZCh4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiAoTWF0aC5yb3VuZCgxMDAwMDAgKiB4KSAvIDEwMDAwMCkudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGJyb3dzZXIgdXJsIHRvIHJlZmxlY3QgdGhlIGxhdGVzdCBzdHlsZXMgYW5kIHJvdGF0aW9ucy5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVSTCgpOiB2b2lkIHtcbiAgICBsZXQgcGFyYW1zID0gW107XG5cbiAgICAvLyBHZXQgdGhlIHJvdGF0aW9ucy5cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBjb25zdCB4ID0gVlJNTC5tb2xSb3RhdGlvbi54O1xuICAgIGlmICh4ICE9PSAwKSB7XG4gICAgICAgIHBhcmFtcy5wdXNoKFwicng9XCIgKyByb3VuZCh4KSk7XG4gICAgfVxuXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgY29uc3QgeSA9IFZSTUwubW9sUm90YXRpb24ueTtcbiAgICBpZiAoeSAhPT0gMCkge1xuICAgICAgICBwYXJhbXMucHVzaChcInJ5PVwiICsgcm91bmQoeSkpO1xuICAgIH1cblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IHogPSBWUk1MLm1vbFJvdGF0aW9uLno7XG4gICAgaWYgKHogIT09IDApIHtcbiAgICAgICAgcGFyYW1zLnB1c2goXCJyej1cIiArIHJvdW5kKHopKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHVybCBvZiBtb2xlY3VsYXIgbW9kZWwuXG4gICAgcGFyYW1zLnB1c2goXCJzPVwiICsgVGhyZWVETW9sLm1vZGVsVXJsKTtcblxuICAgIGlmICh3ZWJydGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNldHRpbmcgd2VicnRjLi4uXCIpO1xuICAgICAgICBwYXJhbXMucHVzaChcImY9XCIgKyB3ZWJydGMpO1xuICAgIH1cblxuICAgIC8vIEFsc28gZ2V0IGFsbCB0aGUgcmVwcmVzZW50YXRpb25zXG4gICAgbGV0IGkgPSAwO1xuICAgIGNvbnN0IHN0eWxlcyA9IFtdO1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhWaXNTdHlsZXMuc3R5bGVNZXNoZXMpO1xuICAgIGNvbnN0IGxlbiA9IGtleXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkyID0gMDsgaTIgPCBsZW47IGkyKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpMl07XG4gICAgICAgIGlmIChWaXNTdHlsZXMuc3R5bGVNZXNoZXNba2V5XS5tZXNoLmlzVmlzaWJsZSkge1xuICAgICAgICAgICAgc3R5bGVzLnB1c2goXCJzdFwiICsgaS50b1N0cmluZygpICsgXCI9XCIgKyBrZXkpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBhcmFtcyA9IHBhcmFtcy5jb25jYXQoc3R5bGVzKTtcblxuICAgIC8vIEFsc28gZ2V0IHRoZSBjYW1lcmEgcG9zaXRpb24gYW5kIHJvdGF0aW9uLlxuICAgIGNvbnN0IGNhbWVyYVBvcyA9IENvbW1vbkNhbWVyYS5nZXRDYW1lcmFQb3NpdGlvbigpO1xuICAgIGNvbnN0IGNhbWVyYVJvdCA9IENvbW1vbkNhbWVyYS5nZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb24oKTtcbiAgICBwYXJhbXMucHVzaChcImN4PVwiICsgcm91bmQoY2FtZXJhUG9zW1wieFwiXSkpO1xuICAgIHBhcmFtcy5wdXNoKFwiY3k9XCIgKyByb3VuZChjYW1lcmFQb3NbXCJ5XCJdKSk7XG4gICAgcGFyYW1zLnB1c2goXCJjej1cIiArIHJvdW5kKGNhbWVyYVBvc1tcInpcIl0pKTtcbiAgICBwYXJhbXMucHVzaChcImNyeD1cIiArIHJvdW5kKGNhbWVyYVJvdFtcInhcIl0pKTtcbiAgICBwYXJhbXMucHVzaChcImNyeT1cIiArIHJvdW5kKGNhbWVyYVJvdFtcInlcIl0pKTtcbiAgICBwYXJhbXMucHVzaChcImNyej1cIiArIHJvdW5kKGNhbWVyYVJvdFtcInpcIl0pKTtcbiAgICBwYXJhbXMucHVzaChcImNydz1cIiArIHJvdW5kKGNhbWVyYVJvdFtcIndcIl0pKTtcblxuICAgIC8vIEFsc28gZ2V0IHRoZSBlbnZpcm9ubWVudFxuICAgIHBhcmFtcy5wdXNoKFwiZT1cIiArIFZhcnMuc2NlbmVOYW1lKTtcblxuICAgIGlmIChzaGFkb3dzID09PSB1bmRlZmluZWQpIHsgc2hhZG93cyA9IGZhbHNlOyB9XG5cbiAgICBwYXJhbXMucHVzaChcInNoPVwiICsgc2hhZG93cy50b1N0cmluZygpKTtcblxuICAgIC8vIFVwZGF0ZSBVUkxcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFwiaHRtbFwiOiByZXNwb25zZS5odG1sLFxuICAgICAgICAgICAgLy8gXCJwYWdlVGl0bGVcIjogcmVzcG9uc2UucGFnZVRpdGxlLFxuICAgICAgICB9LFxuICAgICAgICBkb2N1bWVudC50aXRsZSxcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoXCI/XCIpWzBdICsgXCI/XCIgKyBwYXJhbXMuam9pbihcIiZcIiksXG4gICAgKTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdldHMgdGhlIGVudmlyb25tZW50IG5hbWUuIEl0J3Mgc2VwYXJhdGVkIGZyb21cbiAqIHJlYWRVcmxQYXJhbXMoKSBiZWNhdXNlIHlvdSBuZWVkIHRoIGVudmlyb25tZW50IG5hbWUgZWFybGllciBpbiB0aGVcbiAqIGxvYWRkaW5nIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkRW52aXJvbm1lbnROYW1lUGFyYW0oKTogdm9pZCB7XG4gICAgdXJsUGFyYW1zID0gZ2V0QWxsVXJsUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgIC8vIEdldCB0aGUgZW52aXJvbm1lbnQuXG4gICAgY29uc3QgZW52aXJvbiA9IHVybFBhcmFtc1tcImVcIl07XG4gICAgaWYgKGVudmlyb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBWYXJzLnNldFNjZW5lTmFtZShlbnZpcm9uKTtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0cyBpbmZvIGZyb20gdGhlIHVybCBwYXJhbWV0ZXJzIGFuZCBzYXZlcy9hcHBsaWVzIGl0LCBhcyBhcHByb3ByaWF0ZS5cbiAqIE5vdGUgdGhhdCB0aGlzIGdldHMgd2hhdCBtb2xlY3VsYXIgc3R5bGVzIG5lZWQgdG8gYmUgYXBwbGllZCwgYnV0IGRvZXMgbm90XG4gKiBhcHBseSB0aGVtLiBJdCBzaG91bGQgb25seSBiZSBydW4gb25jZSAodGhlIGluaXRpYWwgcmVhZCkuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkVXJsUGFyYW1zKCk6IHZvaWQge1xuICAgIC8vIEJlZm9yZSBhbnl0aGluZywgY2hlY2sgaWYgdGhpcyBpcyBhIHdlYnJ0YyBzZXNzaW9uLlxuICAgIHdlYnJ0YyA9IHVybFBhcmFtc1tcImZcIl07XG4gICAgaWYgKHdlYnJ0YyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIFN0dWRlbnQuc3RhcnRGb2xsb3dpbmcod2VicnRjKTtcblxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBzdHVkZW50IGZyb20gYmVpbmcgYWJsZSB0byBjaGFuZ2UgdGhlIHZpZXcgb3IgYW55dGhpbmcuXG4gICAgICAgIFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhLmlucHV0cy5jbGVhcigpO1xuXG4gICAgICAgIC8vIEFsc28gaGlkZS9tb3ZlIHNvbWUgb2YgdGhlIGJ1dHRvbnMuXG4gICAgICAgIGpRdWVyeShcIiNoZWxwLWJ1dHRvblwiKS5oaWRlKCk7XG4gICAgICAgIGpRdWVyeShcIiNsZWFkZXJcIikuaGlkZSgpO1xuICAgICAgICBqUXVlcnkoXCIjYmFieWxvblZSaWNvbmJ0blwiKS5oaWRlKCk7XG4gICAgICAgIGpRdWVyeShcIiNvcGVuLWJ1dHRvblwiKS5oaWRlKCk7XG4gICAgICAgIGNvbnN0IGZ1bGxzY3JlZW5CdXR0b24gPSBqUXVlcnkoXCIjZnVsbHNjcmVlbi1idXR0b25cIik7XG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IGZ1bGxzY3JlZW5CdXR0b24uY3NzKFwiYm90dG9tXCIpO1xuICAgICAgICBpZiAoYm90dG9tICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcCA9ICtib3R0b20ucmVwbGFjZSgvcHgvZywgXCJcIik7XG4gICAgICAgICAgICBmdWxsc2NyZWVuQnV0dG9uLmNzcyhcImJvdHRvbVwiLCAodG9wIC0gNjApLnRvU3RyaW5nKCkgKyBcInB4XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGNsaWNraW5nIG9uIHRoZSBzY3JlZW4gZG9lc24ndCBtb3ZlIGVpdGhlci4gQmFzaWNhbGx5XG4gICAgICAgIC8vIGRpc2FibGUgYWxsIHRlbGVwb3J0YXRpb24uXG4gICAgICAgIGpRdWVyeShcIiNjYXB0dXJlLWNsaWNrc1wiKS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1lc2ggcm90YXRpb25zXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgbGV0IHJ4ID0gdXJsUGFyYW1zW1wicnhcIl07XG5cbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBsZXQgcnkgPSB1cmxQYXJhbXNbXCJyeVwiXTtcblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGxldCByeiA9IHVybFBhcmFtc1tcInJ6XCJdO1xuXG4gICAgcnggPSAocnggPT09IHVuZGVmaW5lZCkgPyAwIDogK3J4O1xuICAgIHJ5ID0gKHJ5ID09PSB1bmRlZmluZWQpID8gMCA6ICtyeTtcbiAgICByeiA9IChyeiA9PT0gdW5kZWZpbmVkKSA/IDAgOiArcno7XG4gICAgVlJNTC5zZXRNb2xSb3RhdGlvbihyeCwgcnksIHJ6KTtcblxuICAgIC8vIFNldCB0aGUgcHJvdGVpbiBtb2RlbCBpZiBpdCdzIHByZXNlbnQuXG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgbGV0IHNyYyA9IHVybFBhcmFtc1tcInNcIl07XG4gICAgaWYgKChzcmMgIT09IHVuZGVmaW5lZCkgJiYgKHNyYyAhPT0gXCJcIikpIHtcbiAgICAgICAgaWYgKChzcmMubGVuZ3RoID09PSA0KSAmJiAoc3JjLmluZGV4T2YoXCIuXCIpID09PSAtMSkpIHtcbiAgICAgICAgICAgIC8vIEFzc3VtZSBpdCdzIGEgcGRiIGlkXG4gICAgICAgICAgICBzcmMgPSBcImh0dHBzOi8vZmlsZXMucmNzYi5vcmcvdmlldy9cIiArIHNyYy50b1VwcGVyQ2FzZSgpICsgXCIucGRiXCI7XG4gICAgICAgIH1cbiAgICAgICAgVGhyZWVETW9sLnNldE1vZGVsVXJsKHNyYyk7XG4gICAgfVxuXG4gICAgLy8gU2V0dXAgdGhlIHN0eWxlcyBhcyB3ZWxsLlxuICAgIC8qKiBAdHlwZSB7QXJyYXk8c3RyaW5nPn0gKi9cbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModXJsUGFyYW1zKTtcbiAgICBjb25zdCBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICAgIGlmIChrZXkuc2xpY2UoMCwgMikgPT09IFwic3RcIikge1xuICAgICAgICAgICAgY29uc3QgcmVwSW5mbyA9IGV4dHJhY3RSZXBJbmZvRnJvbUtleSh1cmxQYXJhbXNba2V5XSk7XG4gICAgICAgICAgICBzdHlsZXNRdWV1ZS5wdXNoKHJlcEluZm8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgc3R5bGVzUXVldWUgaGFzIG5vdGhpbmcgaW4gaXQsIHNldCB1cCBhIGRlZmF1bHQgcmVwLlxuICAgIGlmIChzdHlsZXNRdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3R5bGVzUXVldWUucHVzaChbW1wiUHJvdGVpblwiLCBcIkFsbFwiXSwgXCJDYXJ0b29uXCIsIFwiU3BlY3RydW1cIl0pO1xuICAgICAgICBzdHlsZXNRdWV1ZS5wdXNoKFtbXCJOdWNsZWljXCIsIFwiQWxsXCJdLCBcIlN0aWNrXCIsIFwiRWxlbWVudFwiXSk7XG4gICAgICAgIHN0eWxlc1F1ZXVlLnB1c2goW1tcIkxpZ2FuZFwiLCBcIkFsbFwiXSwgXCJTdGlja1wiLCBcIkVsZW1lbnRcIl0pO1xuICAgIH1cblxuICAgIC8vIFBvc2l0aW9uIHRoZSBjYW1lcmFcbiAgICBjb25zdCBjeCA9IHVybFBhcmFtc1tcImN4XCJdO1xuICAgIGNvbnN0IGN5ID0gdXJsUGFyYW1zW1wiY3lcIl07XG4gICAgY29uc3QgY3ogPSB1cmxQYXJhbXNbXCJjelwiXTtcbiAgICBpZiAoKGN4ICE9PSB1bmRlZmluZWQpICYmIChjeSAhPT0gdW5kZWZpbmVkKSAmJiAoY3ogIT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgQ29tbW9uQ2FtZXJhLnNldENhbWVyYVBvc2l0aW9uKG5ldyBCQUJZTE9OLlZlY3RvcjMoK2N4LCArY3ksICtjeikpO1xuICAgIH1cblxuICAgIGNvbnN0IGNyeCA9IHVybFBhcmFtc1tcImNyeFwiXTtcbiAgICBjb25zdCBjcnkgPSB1cmxQYXJhbXNbXCJjcnlcIl07XG4gICAgY29uc3QgY3J6ID0gdXJsUGFyYW1zW1wiY3J6XCJdO1xuICAgIGNvbnN0IGNydyA9IHVybFBhcmFtc1tcImNyd1wiXTtcbiAgICBpZiAoKGNyeCAhPT0gdW5kZWZpbmVkKSAmJiAoY3J5ICE9PSB1bmRlZmluZWQpICYmIChjcnogIT09IHVuZGVmaW5lZCkgJiYgKGNydyAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICBDb21tb25DYW1lcmEuc2V0Q2FtZXJhUm90YXRpb25RdWF0ZXJuaW9uKG5ldyBCQUJZTE9OLlF1YXRlcm5pb24oK2NyeCwgK2NyeSwgK2NyeiwgK2NydykpO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSBpZiBzaGFkb3dzIG9yIG5vdC5cbiAgICBzaGFkb3dzID0gdXJsUGFyYW1zW1wic2hcIl07XG5cbiAgICAvLyBTdGFydCB1cGRhdGluZyB0aGUgVVJMIHBlcmlvZGljYWxseS4gQmVjYXVzZSBvZiBjYW1lcmEgY2hhbmdlcy5cbiAgICBhdXRvVXBkYXRlVXJsKCk7XG59XG5cbi8qKlxuICogVGFrZXMgYSBzdHJpbmcgbGlrZSBBbGwtLUxpZ2FuZC0tU3RpY2stLUVsZW1lbnQgYW5kIGNvbnZlcnRzIGl0IHRvIFtbXCJBbGxcIixcbiAqIFwiTGlnYW5kXCJdLCBcIlN0aWNrXCIsIFwiRWxlbWVudFwiXS5cbiAqIEBwYXJhbSAge3N0cmluZ30ga2V5IFRoZSBzcnRpbmcuXG4gKiBAcmV0dXJucyBBcnJheTwqPlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFJlcEluZm9Gcm9tS2V5KGtleTogc3RyaW5nKTogYW55W10ge1xuICAgIGNvbnN0IHBydHMgPSBrZXkuc3BsaXQoXCItLVwiKTtcbiAgICBjb25zdCByZXAgPSBkZWNvZGVVUklDb21wb25lbnQocHJ0c1twcnRzLmxlbmd0aCAtIDJdKTtcbiAgICBjb25zdCBjb2xvclNjaGVtZSA9IGRlY29kZVVSSUNvbXBvbmVudChwcnRzW3BydHMubGVuZ3RoIC0gMV0pO1xuICAgIGNvbnN0IHNlbHMgPSBwcnRzLnNsaWNlKDAsIHBydHMubGVuZ3RoIC0gMikubWFwKFxuICAgICAgICAoaTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpID0gZGVjb2RlVVJJQ29tcG9uZW50KGkpO1xuICAgICAgICAgICAgaWYgKGkuc2xpY2UoMCwgMSkgPT09IFwie1wiKSB7XG4gICAgICAgICAgICAgICAgaSA9IEpTT04ucGFyc2UoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSxcbiAgICApO1xuICAgIHJldHVybiBbc2VscywgcmVwLCBjb2xvclNjaGVtZV07XG59XG5cbi8qKlxuICogU3RhcnQgbG9hZGluZyBhbGwgdGhlIG1vbGVjdWxhciBzdHlsZXMgZGVzY3JpYmVkIGluIHRoZSB1cmwuIEEgcmVjdXJzaXZlXG4gKiBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0TG9hZGluZ1N0eWxlcygpOiB2b2lkIHtcbiAgICBpZiAoc3R5bGVzUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBUaGVyZSBhcmUgc29tZSBzdHlsZXMgdG8gc3RpbGwgcnVuLlxuICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlc1F1ZXVlLnBvcCgpO1xuICAgICAgICBWaXNTdHlsZXMudG9nZ2xlUmVwKHN0eWxlWzBdLCBzdHlsZVsxXSwgc3R5bGVbMl0sICgpID0+IHtcbiAgICAgICAgICAgIC8vIFRyeSB0byBnZXQgdGhlIG5leHQgc3R5bGUuXG4gICAgICAgICAgICBzdGFydExvYWRpbmdTdHlsZXMoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiBcImY9XCIgaW4gdXJsICh3ZWJydGMpLiBUaGlzIHdvcmtzIGV2ZW4gaWYgVXJsVmFycyBoYXNuJ3QgYmVlbiBzZXQgeWV0LlxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tXZWJydGNJblVybCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZihcImY9XCIpICE9PSAtMTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgXCJzaD1cIiBpbiB1cmwgKHNoYWRvd3MpLiBUaGlzIHdvcmtzIGV2ZW4gaWYgVXJsVmFycyBoYXNuJ3QgYmVlblxuICogc2V0IHlldC5cbiAqIEByZXR1cm5zIGJvb2xlYW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrU2hhZG93SW5VcmwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJzaD10XCIpICE9PSAtMTtcbn1cblxuLyoqXG4gKiBQZXJpb2RpY2FsbHkgdXBkYXRlIHRoZSB1cmwuIFRoaXMgaXMgYmVjYXVzZSB0aGUgY2FtZXJhIGNhbiBjaGFuZ2UsIGJ1dCBJXG4gKiBkb24ndCB3YW50IHRvIHVwZGF0ZSB0aGUgdXJsIHdpdGggZXZlcnkgdGljayBvZiB0aGUgbG9vcC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gYXV0b1VwZGF0ZVVybCgpOiB2b2lkIHtcbiAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHNldFVSTCgpO1xuICAgIH0sIDEwMDApO1xufVxuIiwiaW1wb3J0ICogYXMgTmF2aWdhdGlvbiBmcm9tIFwiLi4vTmF2aWdhdGlvbi9OYXZpZ2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBQaWNrYWJsZXMgZnJvbSBcIi4uL05hdmlnYXRpb24vUGlja2FibGVzXCI7XG5pbXBvcnQgKiBhcyBQb2ludHMgZnJvbSBcIi4uL05hdmlnYXRpb24vUG9pbnRzXCI7XG5pbXBvcnQgKiBhcyBWYXJzIGZyb20gXCIuLi9WYXJzL1ZhcnNcIjtcbmltcG9ydCAqIGFzIENvbW1vbkNhbWVyYSBmcm9tIFwiLi9Db21tb25DYW1lcmFcIjtcbmltcG9ydCAqIGFzIFZSQ2FtZXJhIGZyb20gXCIuL1ZSQ2FtZXJhXCI7XG4vLyBpbXBvcnQgKiBhcyBEZWJ1Z01zZyBmcm9tIFwiLi4vVUkvRGVidWdNc2dcIjtcblxuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG5sZXQgbGFzdFRyaWdnZXJUaW1lID0gMDtcbmxldCBsYXN0UGFkUm90YXRpb25UaW1lID0gMDtcblxubGV0IHBhZE1vdmVTcGVlZEZhY3RvciA9IDAuMDtcbmxldCBwYWRSb3RhdGVTcGVlZEZhY3RvciA9IDAuMDtcbmxldCBwYWRQcmVzc2VkID0gZmFsc2U7XG5cbi8vIGxldCBjb250cm9sbGVyTG9hZGVkID0gZmFsc2U7XG4vLyBsZXQgc3RhcnRlZENoZWNraW5nRm9yQ29udHJvbGxlcnMgPSBmYWxzZTtcblxuLyoqXG4gKiBTZXRzIHVwIHRoZSBlbnRlciBhbmQgZXhpdCBmdW5jdGlvbnMgd2hlbiBjb250cm9sbGVycyBsb2FkLiBObyB1bmxvYWRcbiAqIGZ1bmN0aW9uLCB0aG91Z2ggSSdkIGxpa2Ugb25lLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKTogdm9pZCB7XG4gICAgLy8gUHV0IGEgY3ViZSBhcm91bmQgdGhlIGNhbWVyYS4gVGhpcyBpcyB0byByZWNlaXZlIHBpY2tlciBmb3IgcGFkLWJhc2VkXG4gICAgLy8gbmF2aWdhdGlvbiwgZXZlbiBpZiB5b3UncmUgbm90IHBvaW50aW5nIGF0IGEgcHJvdGVpbi5cbiAgICBQaWNrYWJsZXMubWFrZVBhZE5hdmlnYXRpb25TcGhlcmVBcm91bmRDYW1lcmEoKTtcblxuICAgIC8vIFVzZSB2YXJpb3VzIGNvbnRyb2xsZXIgZGV0ZWN0ZWQgZnVuY3Rpb25zIHRvIGNvdmVyIHlvdXIgYmFzZXMuLi5cblxuICAgIGNvbnN0IG9uQ29udHJvbGxlckxvYWRlZCA9ICh3ZWJWUkNvbnRyb2xsZXI6IGFueSkgPT4ge1xuICAgICAgICBWYXJzLnZyVmFycy5uYXZNb2RlID0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSV2l0aENvbnRyb2xsZXJzO1xuICAgICAgICBWUkNhbWVyYS5zZXR1cEdhemVUcmFja2VyKCk7XG4gICAgICAgIHNldHVwVHJpZ2dlcih3ZWJWUkNvbnRyb2xsZXIpO1xuICAgICAgICBzZXR1cFBhZCh3ZWJWUkNvbnRyb2xsZXIpO1xuICAgICAgICAvLyBjb250cm9sbGVyTG9hZGVkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLy8gb25Db250cm9sbGVyc0F0dGFjaGVkT2JzZXJ2YWJsZSBkb2Vzbid0IHdvcmsuIEknZCBwcmVmZXIgdGhhdCBvbmUuLi5cbiAgICBWYXJzLnZySGVscGVyLndlYlZSQ2FtZXJhLm9uQ29udHJvbGxlck1lc2hMb2FkZWRPYnNlcnZhYmxlLmFkZCgod2ViVlJDb250cm9sbGVyOiBhbnkpID0+IHtcbiAgICAgICAgb25Db250cm9sbGVyTG9hZGVkKHdlYlZSQ29udHJvbGxlcik7XG4gICAgfSk7XG5cbiAgICBWYXJzLnZySGVscGVyLm9uQ29udHJvbGxlck1lc2hMb2FkZWQuYWRkKCh3ZWJWUkNvbnRyb2xsZXI6IGFueSkgPT4ge1xuICAgICAgICBvbkNvbnRyb2xsZXJMb2FkZWQod2ViVlJDb250cm9sbGVyKTtcbiAgICB9KTtcblxuICAgIC8vIFZhcnMudnJIZWxwZXIud2ViVlJDYW1lcmEub25Db250cm9sbGVyc0F0dGFjaGVkT2JzZXJ2YWJsZS5hZGQoKHYpID0+IHtcbiAgICAvLyAgICAgVmFycy5zY2VuZS5mb2dNb2RlID0gQkFCWUxPTi5TY2VuZS5GT0dNT0RFX0VYUDtcbiAgICAvLyB9KTtcblxuICAgIC8vIERvZXNuJ3QgYXBwZWFyIHRvIGJlIGEgZGV0YWNoIGZ1bmN0aW9uLi4uXG59XG5cbi8qKlxuICogUnVucyBvbmNlIHVzZXIgZW50ZXJzIFZSIG1vZGUuIFN0YXJ0cyB0cnlpbmcgdG8gaW5pdCBjb250cm9sbGVycyBhbmQgbmF2XG4gKiBzcGhlcmUuIFN0b3BzIHdoZW4gaXQgc3VjY2VlZHMuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydENoZWNraW5nRm9yQ29udHJvbGVycygpOiB2b2lkIHtcbiAgICAvLyBPbiBkaWZmZXJlbnQgZGV2aWNlcyAoZS5nLiwgT2N1bHVzIEdvKSwgdGhlIGNvbnRyb2xsZXJzIGRvbid0IHN0YXJ0IGJ5XG4gICAgLy8gZGVmYXVsdC4gVHJ5IGluaXRpYWxpemluZyB0aGVtIGV2ZXJ5IG9uY2UgaW4gYSB3aGlsZSBqdXN0IGluIGNhc2UuXG4gICAgLy8gaWYgKHN0YXJ0ZWRDaGVja2luZ0ZvckNvbnRyb2xsZXJzID09PSBmYWxzZSkge1xuICAgIC8vICAgICBzdGFydGVkQ2hlY2tpbmdGb3JDb250cm9sbGVycyA9IHRydWU7XG4gICAgLy8gICAgIHNldFRpbWVvdXQoa2VlcFRyeWluZ1RvUHJlcENvbnRyb2xsZXJzLCAzMDAwKTtcbiAgICAvLyB9XG59XG5cblxuLy8gZnVuY3Rpb24ga2VlcFRyeWluZ1RvUHJlcENvbnRyb2xsZXJzKCk6IHZvaWQge1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKFZhcnMudnJIZWxwZXIsIFZhcnMudnJIZWxwZXIuY3VycmVudFZSQ2FtZXJhLCBWYXJzLnZySGVscGVyLmN1cnJlbnRWUkNhbWVyYS5pbml0Q29udHJvbGxlcnMpO1xuLy8gICAgIC8vIGNvbnNvbGUubG9nKFwieW9cIik7XG4vLyAgICAgaWYgKChWYXJzLnZySGVscGVyICE9PSB1bmRlZmluZWQpICYmXG4vLyAgICAgICAgIChWYXJzLnZySGVscGVyLmN1cnJlbnRWUkNhbWVyYSAhPT0gdW5kZWZpbmVkKSAmJlxuLy8gICAgICAgICAoVmFycy52ckhlbHBlci5jdXJyZW50VlJDYW1lcmEuaW5pdENvbnRyb2xsZXJzKSAhPT0gdW5kZWZpbmVkKSB7XG5cblxuLy8gICAgICAgICAgICAgLy8gSXQgZG9lcyBnZXQgaGVyZS5cblxuLy8gICAgICAgICAgICAgLy8gVHJ5IGluaXRpYWxpemluZyB0aGUgY29udHJvbGxlcnMgaWYgbmVjZXNzYXJ5LlxuLy8gICAgICAgICAvLyBpZiAoY29udHJvbGxlckxvYWRlZCA9PT0gZmFsc2UpIHtcbi8vICAgICAgICAgLy8gICAgIFZhcnMuc2NlbmUuZ2V0TWVzaEJ5TmFtZShcInNreWJveC5iYWtlZFwiKS5pc1Zpc2libGUgPSBmYWxzZTtcbi8vICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKFwiVHJ5aW5nIHRvIGluaXRpYWxpemUgY29udHJvbGxlcnMuLi5cIik7XG4vLyAgICAgICAgIC8vICAgICBWYXJzLnZySGVscGVyLmN1cnJlbnRWUkNhbWVyYS5pbml0Q29udHJvbGxlcnMoKTtcbi8vICAgICAgICAgLy8gICAgIHNldFRpbWVvdXQoa2VlcFRyeWluZ1RvUHJlcENvbnRyb2xsZXJzLCAzMDAwKTtcbi8vICAgICAgICAgLy8gICAgIHJldHVybjtcbi8vICAgICAgICAgLy8gfVxuXG4vLyAgICAgICAgIC8vIEFsc28gaW5pdGlhbGl6ZSBpbnRlcmFjdGlvbnMgaWYgeW91IG5lZWQgdG8uLi5cbi8vICAgICAgICAgLy8gaWYgKFZhcnMudnJIZWxwZXIuX2ludGVyYWN0aW9uc0VuYWJsZWQgIT09IHRydWUpIHtcbi8vICAgICAgICAgICAgIC8vIFZhcnMudnJIZWxwZXIuZW5hYmxlSW50ZXJhY3Rpb25zKCk7XG4vLyAgICAgICAgICAgICBWUkNhbWVyYS5zZXR1cEdhemVUcmFja2VyKCk7XG4vLyAgICAgICAgICAgICAvLyBOb3RlIGVubyBtb3JlIHNldFRpbWVvdXQgaGVyZS4gQmVjYXVzZSB5b3UndmUgc3VjY2VlZGVkLlxuLy8gICAgICAgICAgICAgLy8gc2V0VGltZW91dChrZWVwVHJ5aW5nVG9QcmVwQ29udHJvbGxlcnMsIDMwMDApO1xuLy8gICAgICAgICAgICAgcmV0dXJuO1xuLy8gICAgICAgICAvLyB9XG4vLyAgICAgfVxuXG4vLyAgICAgc2V0VGltZW91dChrZWVwVHJ5aW5nVG9QcmVwQ29udHJvbGxlcnMsIDMwMDApO1xuLy8gfVxuXG4vKipcbiAqIFNldHMgdXAgdGhlIHRyaWdnZXIgYnV0dG9uLlxuICogQHBhcmFtICB7Kn0gd2ViVlJDb250cm9sbGVyIFRoZSB3ZWIgY29udHJvbGxlciBvYmplY3QuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIHNldHVwVHJpZ2dlcih3ZWJWUkNvbnRyb2xsZXI6IGFueSk6IHZvaWQge1xuICAgIC8vIE1vbml0b3IgZm9yIHRyaWdnZXJzLiBPbmx5IGFsbG93IG9uZSB0byBmaXJlIGV2ZXJ5IG9uY2UgaW4gYSB3aGlsZS5cbiAgICAvLyBXaGVuIGl0IGRvZXMsIHRlbGVwb3J0IHRvIHRoYXQgbG9jYXRpb24uXG4gICAgd2ViVlJDb250cm9sbGVyLm9uVHJpZ2dlclN0YXRlQ2hhbmdlZE9ic2VydmFibGUuYWRkKChzdGF0ZTogYW55KSA9PiB7XG4gICAgICAgIGlmICghc3RhdGVbXCJwcmVzc2VkXCJdKSB7XG4gICAgICAgICAgICAvLyBPbmx5IHRyaWdnZXIgaWYgaXQncyBwcmVzc2VkLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgICAgICBjb25zdCBjdXJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgaWYgKGN1clRpbWUgLSBsYXN0VHJpZ2dlclRpbWUgPiBWYXJzLlZSX0NPTlRST0xMRVJfVFJJR0dFUl9ERUxBWV9USU1FKSB7XG4gICAgICAgICAgICAvLyBFbm91Z2ggdGltZSBoYXMgcGFzc2VkLi4uXG4gICAgICAgICAgICBsYXN0VHJpZ2dlclRpbWUgPSBjdXJUaW1lO1xuICAgICAgICAgICAgTmF2aWdhdGlvbi5hY3RPblN0YXJlVHJpZ2dlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2V0cyB1cCB0aGUgVlIgY29udHJvbGxlciBwYWRzLlxuICogQHBhcmFtICB7Kn0gd2ViVlJDb250cm9sbGVyXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIHNldHVwUGFkKHdlYlZSQ29udHJvbGxlcjogYW55KTogdm9pZCB7XG4gICAgLy8gQWxzbyBhbGxvdyBuYXZpZ2F0aW9uIHZpYSB0aGUgcGFkIChub24gdGVsZXBvcnRpbmcpLlxuICAgIHdlYlZSQ29udHJvbGxlci5vblBhZFN0YXRlQ2hhbmdlZE9ic2VydmFibGUuYWRkKChzdGF0ZTogYW55KSA9PiB7XG4gICAgICAgIHBhZFByZXNzZWQgPSBzdGF0ZVtcInByZXNzZWRcIl07XG5cbiAgICAgICAgaWYgKChwYWRQcmVzc2VkKSAmJlxuICAgICAgICAgICAgKE1hdGguYWJzKHBhZE1vdmVTcGVlZEZhY3RvcikgPCBWYXJzLlZSX0NPTlRST0xMRVJfUEFEX1JBVElPX09GX01JRERMRV9GT1JfQ0FNRVJBX1JFU0VUKSAmJlxuICAgICAgICAgICAgKE1hdGguYWJzKHBhZFJvdGF0ZVNwZWVkRmFjdG9yKSA8IFZhcnMuVlJfQ09OVFJPTExFUl9QQURfUkFUSU9fT0ZfTUlERExFX0ZPUl9DQU1FUkFfUkVTRVQpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIldvdWxkIHJlc2V0IGNhbWVyYSB2aWV3IGlmIHlvdSBkaWRuJ3QgZ2V0IGFuIGVycm9yIGJlbG93Li4uXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB3ZWJWUkNvbnRyb2xsZXIub25QYWRWYWx1ZXNDaGFuZ2VkT2JzZXJ2YWJsZS5hZGQoKHN0YXRlOiBhbnkpID0+IHtcbiAgICAgICAgLy8gSWYgaXQncyBub3QgYSBwcmVzcyByaWdodCBpbiB0aGUgbWlkZGxlLCB0aGVuIHNhdmUgdGhlIHkgdmFsdWUgZm9yXG4gICAgICAgIC8vIG1vdmluZyBmb3dhcmQvYmFja3dhcmQuXG4gICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICBwYWRNb3ZlU3BlZWRGYWN0b3IgPSBzdGF0ZVtcInlcIl07XG5cbiAgICAgICAgLy8gQWxzbyBzYXZlIHRoZSB4IGZvciB0dXJuaW5nLiBCdXQgaGVyZSB5b3UgY2FuIG1ha2UgcGVvcGxlIHJlYWxseVxuICAgICAgICAvLyBzaWNrLCBzbyBvbmx5IHRyaWdnZXIgaWYgb24gb3V0ZXIgNHRocyBvZiBwYWQgKG5vIGFjY2lkZW50cykuXG4gICAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgICAgICBwYWRSb3RhdGVTcGVlZEZhY3RvciA9IHN0YXRlW1wieFwiXTtcblxuICAgICAgICAvLyBGaXJzdCBjaGVjayBpZiBpdCdzIHJpZ2h0IGluIHRoZSBtaWRkbGUuIFRoYXQncyByZXNldCBjYW1lcmEgem9uZSxcbiAgICAgICAgLy8gc28gY2FuY2VsLlxuICAgICAgICBpZiAoKE1hdGguYWJzKHBhZFJvdGF0ZVNwZWVkRmFjdG9yKSA8IFZhcnMuVlJfQ09OVFJPTExFUl9QQURfUkFUSU9fT0ZfTUlERExFX0ZPUl9DQU1FUkFfUkVTRVQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMocGFkTW92ZVNwZWVkRmFjdG9yKSA8IFZhcnMuVlJfQ09OVFJPTExFUl9QQURfUkFUSU9fT0ZfTUlERExFX0ZPUl9DQU1FUkFfUkVTRVQpKSB7XG5cbiAgICAgICAgICAgIHBhZE1vdmVTcGVlZEZhY3RvciA9IDA7XG4gICAgICAgICAgICBwYWRSb3RhdGVTcGVlZEZhY3RvciA9IDA7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVbmxlc3MgeW91J3JlIHByZXR0eSBmYXIgdG8gdGhlIGxlZnQgb3IgcmlnaHQsIGRvbid0IGNvdW50IGl0LlxuICAgICAgICBpZiAoTWF0aC5hYnMocGFkUm90YXRlU3BlZWRGYWN0b3IpIDwgMC41KSB7XG4gICAgICAgICAgICBwYWRSb3RhdGVTcGVlZEZhY3RvciA9IDAuMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFNjYWxlIHRoZSByb3RhdGlvbiBzcGVlZCBmYWN0b3JcbiAgICAgICAgICAgIHBhZFJvdGF0ZVNwZWVkRmFjdG9yID0gcGFkUm90YXRlU3BlZWRGYWN0b3IgKyAoKHBhZFJvdGF0ZVNwZWVkRmFjdG9yID4gMCkgPyAtMC41IDogMC41KTtcbiAgICAgICAgICAgIHBhZFJvdGF0ZVNwZWVkRmFjdG9yID0gMi4wICogcGFkUm90YXRlU3BlZWRGYWN0b3I7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIENoZWNrIHRoZSBwYWQgc3RhdGUgYXQgZXZlcnkgcmVuZGVyIGFuZCBhY3QgYWNjb3JkaW5nbHkuXG4gICAgVmFycy5zY2VuZS5yZWdpc3RlckJlZm9yZVJlbmRlcigoKSA9PiB7XG4gICAgICAgIGlmIChwYWRQcmVzc2VkKSB7XG4gICAgICAgICAgICBtb3ZlQ2FtZXJhKCk7XG4gICAgICAgICAgICByb3RhdGVDYW1lcmEoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIE1vdmVzIHRoZSBjYW1lcmEgc2xpZ2h0bHkgZm9yd2FyZC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gbW92ZUNhbWVyYSgpOiB2b2lkIHtcbiAgICAvLyBObyBwb2ludCBpbiBwcm9jZWVkaW5nIGlmIHlvdSBkb24ndCBoYXZlIGEgc3RhcmUgcG9pbnQuXG4gICAgaWYgKFBvaW50cy5jdXJTdGFyZVB0LmVxdWFscyhQb2ludHMucG9pbnRXYXlPZmZTY3JlZW4pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHZlY3RvciBmb3JtIHRoZSBzdGFyZSBwb2ludCB0byB0aGUgY2FtZXJhLiBUT0RPOiBUaGlzIGlzIGFsc29cbiAgICAvLyBjYWxjdWxhdGVkIGVsc2V3aGVyZS4gQ291bGQgcHV0IGl0IGluIGl0cyBvd24gZnVuY3Rpb24gb3IgZXZlbiBjYWNoZSBpdFxuICAgIC8vIGZvciBzcGVlZC5cbiAgICBjb25zdCBjYW1lcmFQb3MgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKTtcbiAgICBjb25zdCB2ZWNTdGFyZVB0Q2FtZXJhID0gUG9pbnRzLmN1clN0YXJlUHQuc3VidHJhY3QoY2FtZXJhUG9zKTtcbiAgICB2ZWNTdGFyZVB0Q2FtZXJhLm5vcm1hbGl6ZSgpO1xuICAgIGNvbnN0IGRlbHRhVmVjID0gdmVjU3RhcmVQdENhbWVyYS5zY2FsZShcbiAgICAgICAgcGFkTW92ZVNwZWVkRmFjdG9yICogVmFycy5QQURfTU9WRV9TUEVFRCAqIFZhcnMuc2NlbmUuZ2V0QW5pbWF0aW9uUmF0aW8oKSxcbiAgICApO1xuXG4gICAgQ29tbW9uQ2FtZXJhLnNldENhbWVyYVBvc2l0aW9uKGNhbWVyYVBvcy5zdWJ0cmFjdChkZWx0YVZlYykpO1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgdGhlIFZSIGNhbWVyYSBzbGlnaHRseS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gcm90YXRlQ2FtZXJhKCk6IHZvaWQge1xuICAgIGlmIChwYWRSb3RhdGVTcGVlZEZhY3RvciA9PT0gMCkge1xuICAgICAgICAvLyBXaHkgcHJvY2VlZCBpZiB0aGVyZSBpcyBubyByb3RhdGlvbj9cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vd1RpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBpZiAobm93VGltZSAtIGxhc3RQYWRSb3RhdGlvblRpbWUgPCBWYXJzLlZSX0NPTlRST0xMRVJfUEFEX1JPVEFUSU9OX0RFTEFZX1RJTUUpIHtcbiAgICAgICAgLy8gQXZvaWQgcmFwaWQvY29udGludW91cyByb3RhdGlvbnMuIEkgdGVzdGVkIHRoaXMuIEl0IG1ha2VzIHBlb3BsZVxuICAgICAgICAvLyB3YW50IHRvIHZvbWl0LlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGFzdFBhZFJvdGF0aW9uVGltZSA9IG5vd1RpbWU7XG5cbiAgICAvLyBHZXQgdGhlIGNhbWVyYSdzIGN1cnJlbnQgcm90YXRpb24uXG4gICAgY29uc3QgY3VyQW5nbGVzID0gVmFycy52ckhlbHBlci53ZWJWUkNhbWVyYS5yb3RhdGlvblF1YXRlcm5pb24udG9FdWxlckFuZ2xlcygpO1xuXG4gICAgLy8gUm90YXRlIGl0IHNsaWdodGx5IGFib3V0IHVwIGF4aXMuXG4gICAgLy8gY3VyQW5nbGVzLnkgKz0gMC4xICogcGFkUm90YXRlU3BlZWRGYWN0b3IgKiBWYXJzLlBBRF9NT1ZFX1NQRUVEICogVmFycy5zY2VuZS5nZXRBbmltYXRpb25SYXRpbygpO1xuICAgIC8vIGN1ckFuZ2xlcy55ID0gY3VyQW5nbGVzLnkgKyBNYXRoLnNpZ24ocGFkUm90YXRlU3BlZWRGYWN0b3IpICogMC4wNjI1ICogTWF0aC5QSTtcblxuICAgIC8vIFJvdGF0ZXMgNDUgZGVncmVlcyBmb3IgcmFwaWQgcmVvcmllbnRhdGlvbi5cbiAgICBjdXJBbmdsZXMueSA9IGN1ckFuZ2xlcy55ICsgTWF0aC5zaWduKHBhZFJvdGF0ZVNwZWVkRmFjdG9yKSAqIDAuMjUgKiBNYXRoLlBJO1xuXG4gICAgLy8gU2V0IGNhbWVyYSB0byB0aGlzIG5ldyByb3RhdGlvbi5cbiAgICBWYXJzLnZySGVscGVyLndlYlZSQ2FtZXJhLnJvdGF0aW9uUXVhdGVybmlvbiA9IEJBQllMT04uUXVhdGVybmlvbi5Gcm9tRXVsZXJWZWN0b3IoY3VyQW5nbGVzKTtcbn1cbiIsIi8vIFRoaXMgbW9kdWxlIGhhcyBmdW5jdGlvbnMgZm9yIHN0b3JpbmcgdmFyaW91cyBpbXBvcnRhbnQgcG9pbnRzIGluIHRoZVxuLy8gc2NlbmUuIE5vdGUgdGhhdCB0aGUgY2FtZXJhIGxvY2F0aW9uIGlzIGluIENvbW1vbkNhbWVyYSwgbm90IGhlcmUuXG5cbmltcG9ydCAqIGFzIENvbW1vbkNhbWVyYSBmcm9tIFwiLi4vQ2FtZXJhcy9Db21tb25DYW1lcmFcIjtcbmltcG9ydCAqIGFzIFZhcnMgZnJvbSBcIi4uL1ZhcnMvVmFyc1wiO1xuaW1wb3J0ICogYXMgTmF2aWdhdGlvbiBmcm9tIFwiLi9OYXZpZ2F0aW9uXCI7XG5pbXBvcnQgKiBhcyBQaWNrYWJsZXMgZnJvbSBcIi4vUGlja2FibGVzXCI7XG5pbXBvcnQgKiBhcyBNZW51M0QgZnJvbSBcIi4uL1VJL01lbnUzRC9NZW51M0RcIjtcblxuZGVjbGFyZSB2YXIgQkFCWUxPTjogYW55O1xuXG5leHBvcnQgbGV0IHBvaW50V2F5T2ZmU2NyZWVuID0gbmV3IEJBQllMT04uVmVjdG9yMygtMTAwMCwgMTAwMCwgMTAwMCk7XG5leHBvcnQgbGV0IGdyb3VuZFBvaW50QmVsb3dDYW1lcmEgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAsIDApO1xuZXhwb3J0IGxldCBncm91bmRQb2ludEJlbG93U3RhcmVQdCA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMCwgMCk7XG5leHBvcnQgbGV0IGN1clN0YXJlUHQgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIDAsIDApO1xuXG4vKipcbiAqIFNldHMgdGhlIGN1clN0YXJlUHQgdmFyaWFibGUgZXh0ZXJuYWxseS5cbiAqIEBwYXJhbSB7Kn0gcHRcbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEN1clN0YXJlUHQocHQ6IGFueSk6IHZvaWQge1xuICAgIGN1clN0YXJlUHQuY29weUZyb20ocHQpO1xufVxuXG4vKipcbiAqIFNldHMgdXAgdGhlIGtleSBwb2ludHMgZGV0ZWN0aW9uLiBTdGFyZSBwb2ludCwgcG9pbnQgYmVsb3cgdGhlIGNhbWVyYSwgZXRjLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKTogdm9pZCB7XG4gICAgLy8gSGlkZSBtZW51IGJ1dHRvbiBpZiBjbHNvZXIgdGhhbiB0aGlzXG4gICAgY29uc3QgQ0xPU0VfVE9fR1JPVU5EX0RJU1QgPSBWYXJzLkJVVFRPTl9TUEhFUkVfUkFESVVTICogMS41O1xuXG4gICAgLy8gQ29uc3RhbnRseSB1cGRhdGUgdGhlIHN0YXJlIHBvaW50IGluZm8uIEFsc28sIHBvc2l0aW9uIHRoZSB0cmFja2luZ1xuICAgIC8vIG1lc2guXG4gICAgVmFycy5zY2VuZS5yZWdpc3RlckJlZm9yZVJlbmRlcigoKSA9PiB7XG4gICAgICAgIC8vIEdldCB0aGUgc3RhcmUgcG9pbnQuIEhlcmUgYmVjYXVzZSBpdCBzaG91bGQgYmUgdXBkYXRlZCB3aXRoIGV2ZXJ5XG4gICAgICAgIC8vIGZyYW1lLlxuICAgICAgICBzZXRTdGFyZVBvaW50SW5mbygpO1xuICAgICAgICBjYW5jZWxTdGFyZUlmRmFyQXdheSgpO1xuICAgICAgICBWYXJzLnZyVmFycy5uYXZUYXJnZXRNZXNoLnBvc2l0aW9uLmNvcHlGcm9tKGN1clN0YXJlUHQpO1xuXG4gICAgICAgIC8vIEhpZGUgVmFycy52clZhcnMubmF2VGFyZ2V0TWVzaCBpZiBpdCdzIG9uIHBhZE5hdlNwaGVyZUFyb3VuZENhbWVyYS5cbiAgICAgICAgaWYgKFBpY2thYmxlcy5jdXJQaWNrZWRNZXNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIFZhcnMudnJWYXJzLm5hdlRhcmdldE1lc2guaXNWaXNpYmxlID0gUGlja2FibGVzLmN1clBpY2tlZE1lc2ggIT09IFBpY2thYmxlcy5wYWROYXZTcGhlcmVBcm91bmRDYW1lcmE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbHNvIHRoZSBwb2ludCBvbiB0aGUgZ3JvdW5kIGJlbG93IHRoZSBjYW1lcmEgc2hvdWxkIGJlIHVwZGF0ZWRcbiAgICAgICAgLy8gZXZlcnkgdHVybiBvZiB0aGUgcmVuZGVyIGxvb3AgKHRvIHBvc2l0aW9uIHRoZSBtZW51IGJ1dHRvbikuXG4gICAgICAgIGNvbnN0IGNhbVBvcyA9IENvbW1vbkNhbWVyYS5nZXRDYW1lcmFQb3NpdGlvbigpO1xuICAgICAgICBsZXQgcGlja2VkR3JvdW5kUHQgPSBncm91bmRQb2ludFBpY2tpbmdJbmZvKGNhbVBvcykucGlja2VkUG9pbnQ7XG4gICAgICAgIGlmIChwaWNrZWRHcm91bmRQdCkge1xuICAgICAgICAgICAgZ3JvdW5kUG9pbnRCZWxvd0NhbWVyYSA9IHBpY2tlZEdyb3VuZFB0O1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgcGlja2VkZ3JvdW5kUHQgaXMgY2xvc2UsIGhpZGUgdGhlIG5hdmlnYXRpb24gbWVudSBidXR0b24gKHRvXG4gICAgICAgICAgICAvLyBwcmV2ZW50IHVzZXIgZnJvbSBnZXR0aW5nIHRyYXBwZWQpLlxuICAgICAgICAgICAgY29uc3QgaGVpZ2h0T2ZmR3JvdW5kID0gY2FtUG9zLnkgLSBwaWNrZWRHcm91bmRQdC55O1xuICAgICAgICAgICAgaWYgKGhlaWdodE9mZkdyb3VuZCA8IENMT1NFX1RPX0dST1VORF9ESVNUKSB7XG4gICAgICAgICAgICAgICAgTWVudTNELm9wZW5NYWluTWVudUZsb29yQnV0dG9uLmJ1dHRvbi5pc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBNZW51M0Qub3Blbk1haW5NZW51Rmxvb3JCdXR0b24uY29udGFpbmluZ01lc2guaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIE1lbnUzRC5vcGVuTWFpbk1lbnVGbG9vckJ1dHRvbi5idXR0b24uaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBNZW51M0Qub3Blbk1haW5NZW51Rmxvb3JCdXR0b24uY29udGFpbmluZ01lc2guaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsc28gdGhlIHBvaW50IG9uIHRoZSBncm91bmQgYmVsb3cgdGhlIHN0YXJlIHBvaW50LlxuICAgICAgICBwaWNrZWRHcm91bmRQdCA9IGdyb3VuZFBvaW50UGlja2luZ0luZm8oY3VyU3RhcmVQdCkucGlja2VkUG9pbnQ7XG4gICAgICAgIGlmIChwaWNrZWRHcm91bmRQdCkgeyBncm91bmRQb2ludEJlbG93U3RhcmVQdCA9IHBpY2tlZEdyb3VuZFB0OyB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcG9pbnQgd2hlcmUgdGhlIHVzZXIgaXMgbG9va2luZyAob3IgcG9pbnRpbmcgd2l0aCBjb250cm9sbGVycykuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRTdGFyZVBvaW50SW5mbygpOiB2b2lkIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHJ1bnMgd2l0aCBldmVyIHR1cm4gb2YgdGhlIHJlbmRlciBsb29wLiBTZXQncyBpbmZvcm1hdGlvblxuICAgIC8vIGFib3V0IHdoYXQgeW91J3JlIGxvb2tpbmcvcG9pbnRpbmcgYXQuIEluZm8gc2F2ZWQgdG8gY3VyU3RhcmVQdFxuICAgIC8qKiBAdHlwZSB7Kn0gKi9cbiAgICBsZXQgcmF5OiBhbnk7XG5cbiAgICBpZiAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLk5vVlIpIHtcbiAgICAgICAgLy8gTm8gVlIgeWV0LiBTbyBpdCdzIG91dHNpZGUgdGhlIHJlYWxtIG9mIHRoZSBWUkhlbHBlci4gQ2FsY3VsYXRlXG4gICAgICAgIC8vIGl0IHVzaW5nIHRoZSBsb29raW5nIGRpcmVjdGlvbi5cblxuICAgICAgICAvLyBHZXQgYSByYXkgZXh0ZW5kaW5nIG91dCBpbiB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGFyZS5cbiAgICAgICAgcmF5ID0gVmFycy5zY2VuZS5hY3RpdmVDYW1lcmEuZ2V0Rm9yd2FyZFJheSgpO1xuICAgIH0gZWxzZSBpZiAoKFZhcnMudnJWYXJzLm5hdk1vZGUgPT09IE5hdmlnYXRpb24uTmF2TW9kZS5WUk5vQ29udHJvbGxlcnMpIHx8XG4gICAgICAgICAgICAgICAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSV2l0aENvbnRyb2xsZXJzKSkge1xuXG5cbiAgICAgICAgLy8gRmluZCB0aGUgdmFsaWQgZ2F6ZXRyYWNrZXIgbWVzaC5cbiAgICAgICAgLyoqIEB0eXBlIHsqfSAqL1xuICAgICAgICBsZXQgZ2F6ZVRyYWNrZXJNZXNoO1xuICAgICAgICBpZiAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSV2l0aENvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICBnYXplVHJhY2tlck1lc2ggPSBWYXJzLnZySGVscGVyLnJpZ2h0Q29udHJvbGxlckdhemVUcmFja2VyTWVzaDtcbiAgICAgICAgICAgIGlmICghZ2F6ZVRyYWNrZXJNZXNoKSB7IGdhemVUcmFja2VyTWVzaCA9IFZhcnMudnJIZWxwZXIubGVmdENvbnRyb2xsZXJHYXplVHJhY2tlck1lc2g7IH1cbiAgICAgICAgfSBlbHNlIGlmIChWYXJzLnZyVmFycy5uYXZNb2RlID09PSBOYXZpZ2F0aW9uLk5hdk1vZGUuVlJOb0NvbnRyb2xsZXJzKSB7XG4gICAgICAgICAgICBnYXplVHJhY2tlck1lc2ggPSBWYXJzLnZySGVscGVyLmdhemVUcmFja2VyTWVzaDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdhemVUcmFja2VyTWVzaCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlcnJvciFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWdhemVUcmFja2VyTWVzaC5pc1Zpc2libGUpIHtcbiAgICAgICAgICAgIHNldEN1clN0YXJlUHQocG9pbnRXYXlPZmZTY3JlZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0Q3VyU3RhcmVQdChnYXplVHJhY2tlck1lc2guYWJzb2x1dGVQb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zdHJ1Y3QgYSByYXkgZnJvbSB0aGUgY2FtZXJhIHRvIHRoZSBzdGFyZSBvYmpcbiAgICAgICAgLyoqIEB0eXBlIHsqfSAqL1xuICAgICAgICBjb25zdCBjYW1Qb3MgPSBDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKTtcbiAgICAgICAgcmF5ID0gbmV3IEJBQllMT04uUmF5KGNhbVBvcywgY3VyU3RhcmVQdC5zdWJ0cmFjdChjYW1Qb3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuZXhwZWN0ZWQgZXJyb3IuXCIpO1xuICAgIH1cblxuICAgIHNldFBpY2tQb2ludEFuZE9iakluU2NlbmUocmF5KTtcbn1cblxuLyoqXG4gKiBDYW5jZWwgdGhlIHN0YXJlIHBvaW50IGlmIGl0J3MgdmVyeSBmYXIgYXdheS5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gY2FuY2VsU3RhcmVJZkZhckF3YXkoKTogdm9pZCB7XG4gICAgaWYgKGN1clN0YXJlUHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXRDdXJTdGFyZVB0KHBvaW50V2F5T2ZmU2NyZWVuKTtcbiAgICAgICAgUGlja2FibGVzLnNldEN1clBpY2tlZE1lc2godW5kZWZpbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICAgICAgY29uc3QgZGlzdCA9IEJBQllMT04uVmVjdG9yMy5EaXN0YW5jZShcbiAgICAgICAgICAgIENvbW1vbkNhbWVyYS5nZXRDYW1lcmFQb3NpdGlvbigpLCBjdXJTdGFyZVB0LFxuICAgICAgICApO1xuICAgICAgICBpZiAoZGlzdCA+IDEwKSB7XG4gICAgICAgICAgICBzZXRDdXJTdGFyZVB0KHBvaW50V2F5T2ZmU2NyZWVuKTtcbiAgICAgICAgICAgIFBpY2thYmxlcy5zZXRDdXJQaWNrZWRNZXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogU2V0cyB0aGUgcGljayBwb2ludCBhbmQgb2JqZWN0IGN1cnJlbnRseSBsb29raW5nIGF0LlxuICogQHBhcmFtICB7Kn0gICAgICAgcmF5XHQgICAgICAgICAgVGhlIGxvb2tpbmcgcmF5LlxuICogQHBhcmFtICB7Ym9vbGVhbn0gW3VwZGF0ZVBvcz10cnVlXSBXaGV0aGVyIHRvIHVwZGF0ZSB0aGUgcG9zaXRpb24uXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIHNldFBpY2tQb2ludEFuZE9iakluU2NlbmUocmF5OiBhbnksIHVwZGF0ZVBvcyA9IHRydWUpOiB2b2lkIHtcbiAgICAvLyBEZXRlcm1pbmVzIHdoZXJlIHRoZSBzcGVjaWZpZWQgcmF5IGludGVyc2VjdHMgYSBwaWNrYWJsZSBvYmplY3QuXG4gICAgLyoqIEBjb25zdCB7Kn0gKi9cbiAgICBjb25zdCBwaWNraW5nSW5mbyA9IFZhcnMuc2NlbmUucGlja1dpdGhSYXkocmF5LCAobWVzaDogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBQaWNrYWJsZXMuY2hlY2tJZk1lc2hQaWNrYWJsZShtZXNoKTtcbiAgICB9KTtcblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IHBpY2tpbmdJbmZvRGlzdCA9IHBpY2tpbmdJbmZvLmRpc3RhbmNlO1xuXG4gICAgaWYgKChwaWNraW5nSW5mby5oaXQpICYmIChwaWNraW5nSW5mb0Rpc3QgPCBWYXJzLk1BWF9URUxFUE9SVF9ESVNUKSkge1xuICAgICAgICAvLyBJdCBkb2VzIGhpdCB0aGUgZmxvb3Igb3Igc29tZSBvdGhlciBwaWNrYWJsZSBvYmplY3QuIFJldHVybiB0aGVcbiAgICAgICAgLy8gcG9pbnQuXG4gICAgICAgIGlmICh1cGRhdGVQb3MpIHsgc2V0Q3VyU3RhcmVQdChwaWNraW5nSW5mby5waWNrZWRQb2ludCk7IH1cbiAgICAgICAgUGlja2FibGVzLnNldEN1clBpY2tlZE1lc2gocGlja2luZ0luZm8ucGlja2VkTWVzaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSXQgZG9lc24ndCBoaXQgdGhlIGZsb29yIG9yIGlzIHRvbyBmYXIgYXdheSwgc28gcmV0dXJuIG51bGwuXG4gICAgICAgIHNldEN1clN0YXJlUHQocG9pbnRXYXlPZmZTY3JlZW4pO1xuICAgICAgICBQaWNrYWJsZXMuc2V0Q3VyUGlja2VkTWVzaCh1bmRlZmluZWQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBwaWNraW5nIGluZm8gZm9yIHRoZSBwb2ludCBvbiB0aGUgZ3JvdW5kIGJlbG93IGEgc3BlY2lmaWVkIHBvaW50LlxuICogQHBhcmFtICAgeyp9ICAgICAgICAgICAgICBwdCAgVGhlIHNwZWNpZmllZCBwb2ludC5cbiAqIEByZXR1cm5zIE9iamVjdDxzdHJpbmcsKj4gVGhlIHBpY2tpbmcgaW5mbywgcHJvamVjdGVkIG9udG8gdGhlIGdyb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VuZFBvaW50UGlja2luZ0luZm8ocHQ6IGFueSk6IGFueSB7XG4gICAgLyoqIEBjb25zdCB7Kn0gKi9cbiAgICBjb25zdCByYXkgPSBuZXcgQkFCWUxPTi5SYXkoXG4gICAgICAgIHB0LCBuZXcgQkFCWUxPTi5WZWN0b3IzKDAsIC0xLCAwKSwgNTAsXG4gICAgKTtcblxuICAgIC8qKiBAY29uc3Qgeyp9ICovXG4gICAgY29uc3QgcGlja2luZ0luZm8gPSBWYXJzLnNjZW5lLnBpY2tXaXRoUmF5KHJheSwgKG1lc2g6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gKG1lc2guaWQgPT09IFZhcnMudnJWYXJzLmdyb3VuZE1lc2guaWQpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBpY2tpbmdJbmZvO1xufVxuIiwiLy8gRnVuY3Rpb25zIGZyb20gbG9hZGluZyBtb2xlY3VsZXMgZGlyZWN0bHkgZnJvbSBhIDNEbW9sLmpzIGluc3RhbmNlLiBTZWVcbi8vIFZSTUwudHMgZm9yIGFkZGl0aW9uYWwgZnVuY3Rpb25zIHJlbGF0ZWQgdG8gdGhlIG1lc2ggaXRzZWxmLlxuXG5pbXBvcnQgKiBhcyBNZW51M0QgZnJvbSBcIi4uLy4uL1VJL01lbnUzRC9NZW51M0RcIjtcbmltcG9ydCAqIGFzIFN0eWxlcyBmcm9tIFwiLi4vLi4vVUkvTWVudTNEL1N0eWxlc1wiO1xuaW1wb3J0ICogYXMgT3BlblBvcHVwIGZyb20gXCIuLi8uLi9VSS9PcGVuUG9wdXAvT3BlblBvcHVwXCI7XG5pbXBvcnQgKiBhcyBVcmxWYXJzIGZyb20gXCIuLi8uLi9WYXJzL1VybFZhcnNcIjtcbmltcG9ydCAqIGFzIExvYWQgZnJvbSBcIi4uL0xvYWRcIjtcbmltcG9ydCAqIGFzIFZSTUwgZnJvbSBcIi4vVlJNTFwiO1xuXG4vLyBVbmZvcnR1bmF0ZWx5LCBjbG9zdXJlIGNvbXBpbGVyIGJyZWFrcyB0aGlzLiBTbyBoYXJkIGNvZGUuXG4vLyBpbXBvcnQgKiBhcyBOYW5vS2lkRmlsZSBmcm9tIFwiLi9uYW5va2lkLnNkZlwiXG5cbmRlY2xhcmUgdmFyIGpRdWVyeTogYW55O1xuXG5leHBvcnQgbGV0IGF0b21pY0luZm8gPSB7fTtcblxuZXhwb3J0IGxldCBtb2RlbFVybCA9IFwibmFub2tpZC5zZGZcIjsgIC8vIE5hbm9LaWRGaWxlO1xuXG4vKipcbiAqIFNldHRlciBmb3IgbW9kZWxVcmwuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHVybCBUaGUgbmV3IHZhbHVlLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TW9kZWxVcmwodXJsOiBzdHJpbmcpOiB2b2lkIHsgbW9kZWxVcmwgPSB1cmw7IH1cblxuLyoqXG4gKiBMb2FkIGluIHRoZSBleHRyYSBtb2xlY3VsZSBtZXNoZXMuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cCgpOiB2b2lkIHtcbiAgICBhZnRlcjNETW9sSnNMb2FkZWQoKTtcbn1cblxuLyoqXG4gKiBSdW5zIGFmdGVyIHRoZSAzRG1vbC5qcyBsaWJyYXJ5IGlzIGxvYWRlZC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZnVuY3Rpb24gYWZ0ZXIzRE1vbEpzTG9hZGVkKCk6IHZvaWQge1xuICAgIFZSTUwuc2V0dXAoKCkgPT4ge1xuICAgICAgICBVcmxWYXJzLnJlYWRVcmxQYXJhbXMoKTtcblxuICAgICAgICAvLyBsZXQgcGRiVXJpID0gXCJodHRwczovL2ZpbGVzLnJjc2Iub3JnL3ZpZXcvMVhETi5wZGJcIjtcbiAgICAgICAgVlJNTC5sb2FkUERCVVJMKG1vZGVsVXJsLCAobWRsM0RNb2w6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gVXBkYXRlIFVSTCB3aXRoIGxvY2F0aW9uXG4gICAgICAgICAgICBVcmxWYXJzLnNldFVSTCgpO1xuXG4gICAgICAgICAgICBpZiAoIVVybFZhcnMuY2hlY2tXZWJydGNJblVybCgpKSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBub3QgbGVhZGVyIG1vZGUsIHNldCBzZXR1cCBtZW51LlxuXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFkZGl0aW9uYWwgc2VsZWN0aW9uIGluZm9ybWF0aW9uIGFib3V0IHRoZSBsb2FkZWQgbW9sZWN1bGUuXG4gICAgICAgICAgICAgICAgLy8gTGlrZSByZXNpZHVlIG5hbWUuXG4gICAgICAgICAgICAgICAgZ2V0QWRkaXRpb25hbFNlbHMobWRsM0RNb2wpO1xuXG4gICAgICAgICAgICAgICAgLy8gTm93IHRoYXQgdGhlIHBkYiBpcyBsb2FkZWQsIHlvdSBuZWVkIHRvIHVwZGF0ZSB0aGUgbWVudS5cbiAgICAgICAgICAgICAgICBTdHlsZXMudXBkYXRlTW9kZWxTcGVjaWZpY1NlbGVjdGlvbnNJbk1lbnUoTWVudTNELm1lbnVJbmYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOb3cgdGhhdCB0aGUgUERCIGlzIGxvYWRlZCwgeW91IGNhbiBzdGFydCBsb2FkaW5nIHN0eWxlcy5cbiAgICAgICAgICAgIFVybFZhcnMuc3RhcnRMb2FkaW5nU3R5bGVzKCk7XG5cbiAgICAgICAgICAgIC8vIENvbnRpbnVlLi4uXG4gICAgICAgICAgICBMb2FkLmFmdGVyTG9hZGluZygpO1xuXG4gICAgICAgICAgICAvLyBJZiBpdCdzIG5hbm9raWQsIG9wZW4gYSBwb3B1cCB0byBsZXQgdGhlbSBzcGVjaWZ5IGEgdXJsIG9yXG4gICAgICAgICAgICAvLyBwZGJpZC5cbiAgICAgICAgICAgIGlmICgobW9kZWxVcmwgPT09IFwibmFub2tpZC5zZGZcIikgJiYgKFVybFZhcnMuY2hlY2tXZWJydGNJblVybCgpID09PSBmYWxzZSkpe1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBHaXZlIHRoZW0gc29tZSB0aW1lIHRvIGFkbWlyZSBuYW5va2lkLi4uIDopXG4gICAgICAgICAgICAgICAgICAgIE9wZW5Qb3B1cC5vcGVuTW9kYWwoXCJMb2FkIE1vbGVjdWxlXCIsIFwicGFnZXMvbG9hZC5odG1sXCIpO1xuICAgICAgICAgICAgICAgIH0sIDMwMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYWRkaXRpb25hbCBwb3NzaWJsZSBzZWxlY3Rpb25zIGZyb20gdGhlIHByb3BlcnRpZXMgb2YgdGhlIGF0b21zXG4gKiB0aGVtc2VsdmVzIChsaWtlIHJlc2lkdWUgbmFtZXMpLlxuICogQHBhcmFtICB7Kn0gbWRsM0RNb2wgIEEgM2Rtb2xqcyBtb2xlY3VsZSBvYmplY3QuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmZ1bmN0aW9uIGdldEFkZGl0aW9uYWxTZWxzKG1kbDNETW9sOiBhbnkpOiB2b2lkIHtcbiAgICAvLyBHZXQgYWxsIHRoZSBhdG9tcy5cbiAgICAvKiogQHR5cGUge0FycmF5PE9iamVjdDxzdHJpbmcsKj4+fSAqL1xuICAgIGNvbnN0IGF0b21zID0gbWRsM0RNb2wuc2VsZWN0ZWRBdG9tcyh7fSk7XG5cbiAgICBhdG9taWNJbmZvID0ge1xuICAgICAgICBcIkF0b20gTmFtZVwiOiBbXSxcbiAgICAgICAgXCJDaGFpblwiOiBbXSxcbiAgICAgICAgXCJFbGVtZW50XCI6IFtdLFxuICAgICAgICBcIlJlc2lkdWUgSW5kZXhcIjogW10sXG4gICAgICAgIFwiUmVzaWR1ZSBOYW1lXCI6IFtdLFxuICAgICAgICBcIlNlY29uZGFyeSBTdHJ1Y3R1cmVcIjogW10sXG4gICAgfTtcblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGF0b21zTGVuID0gYXRvbXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXRvbXNMZW47IGkrKykge1xuICAgICAgICAvKiogQHR5cGUge09iamVjdDxzdHJpbmcsKj59ICovXG4gICAgICAgIGNvbnN0IGF0b20gPSBhdG9tc1tpXTtcbiAgICAgICAgYXRvbWljSW5mb1tcIkF0b20gTmFtZVwiXS5wdXNoKGF0b21bXCJhdG9tXCJdKTtcbiAgICAgICAgYXRvbWljSW5mb1tcIkNoYWluXCJdLnB1c2goYXRvbVtcImNoYWluXCJdKTtcbiAgICAgICAgYXRvbWljSW5mb1tcIkVsZW1lbnRcIl0ucHVzaChhdG9tW1wiZWxlbVwiXSk7XG4gICAgICAgIGF0b21pY0luZm9bXCJSZXNpZHVlIE5hbWVcIl0ucHVzaChhdG9tW1wicmVzblwiXSk7XG4gICAgICAgIGF0b21pY0luZm9bXCJSZXNpZHVlIEluZGV4XCJdLnB1c2goYXRvbVtcInJlc2lcIl0pO1xuICAgICAgICBhdG9taWNJbmZvW1wiU2Vjb25kYXJ5IFN0cnVjdHVyZVwiXS5wdXNoKGF0b21bXCJzc1wiXSk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2FudCBqdXN0IHVuaXF1ZSB2YWx1ZXMuXG4gICAgY29uc3QgbGJscyA9IE9iamVjdC5rZXlzKGF0b21pY0luZm8pO1xuICAgIGNvbnN0IGxlbiA9IGxibHMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgbGJsID0gbGJsc1tpXTtcbiAgICAgICAgYXRvbWljSW5mb1tsYmxdID0gdW5pcShhdG9taWNJbmZvW2xibF0pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIHVuaXF1ZSB2YWx1ZXMgaW4gYW4gYXJyYXkuXG4gKiBAcGFyYW0gIHtBcnJheTxzdHJpbmc+fSBhcnIgIFRoZSBhcnJheVxuICogQHJldHVybnMgQXJyYXk8Kj4gIFRoZSBhcnJheSwgd2l0aCB1bmlxdWUgdmFsdWVzLlxuICovXG5mdW5jdGlvbiB1bmlxKGFycjogc3RyaW5nW10pOiBhbnlbXSB7XG4gICAgLy8gc2VlXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTE2ODg2OTIvaG93LXRvLWNyZWF0ZS1hLWxpc3Qtb2YtdW5pcXVlLWl0ZW1zLWluLWphdmFzY3JpcHRcbiAgICBjb25zdCB1ID0ge307XG4gICAgY29uc3QgYSA9IFtdO1xuXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgY29uc3QgbGVuID0gYXJyLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGxlbjsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAoIXUuaGFzT3duUHJvcGVydHkoYXJyW2ldKSkge1xuICAgICAgICAgICAgYS5wdXNoKGFycltpXSk7XG4gICAgICAgICAgICB1W2FycltpXV0gPSAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhO1xufVxuIiwiLy8gRnVuY3Rpb25zIHRvIGhhbmRsZSBtb2xlY3VsZSBzaGFkb3dzLlxuXG5pbXBvcnQgKiBhcyBWYXJzIGZyb20gXCIuLi9WYXJzL1ZhcnNcIjtcbmltcG9ydCAqIGFzIFVybFZhcnMgZnJvbSBcIi4uL1ZhcnMvVXJsVmFyc1wiO1xuLy8gaW1wb3J0ICogYXMgT3B0aW1pemF0aW9ucyBmcm9tIFwiLi4vU2NlbmUvT3B0aW1pemF0aW9uc1wiO1xuXG5kZWNsYXJlIHZhciBCQUJZTE9OOiBhbnk7XG5cbmV4cG9ydCBsZXQgc2hhZG93R2VuZXJhdG9yOiBhbnk7XG5cbi8qKlxuICogU2V0dXAgdGhlIHNoYWRvdyBnZW5lcmF0b3IgdGhhdCBjYXN0cyBhIHNoYWRvdyBmcm9tIHRoZSBtb2xlY3VsZSBtZXNoZXMuXG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFNoYWRvd0dlbmVyYXRvcigpOiB2b2lkIHtcbiAgICAvLyBHZXQgdGhlIGxpZ2h0IHRoYXQgd2lsbCBjYXN0IHRoZSBzaGFkb3dzLlxuICAgIGNvbnN0IGxpZ2h0ID0gVmFycy5zY2VuZS5saWdodHNbMF07XG5cbiAgICAvKiogQHR5cGUge09iamVjdDxzdHJpbmcsbnVtYmVyPn0gKi9cbiAgICBjb25zdCBzaGFkb3dJbmYgPSBnZXRCbHVyRGFya25lc3NBbWJpZW50RnJvbUxpZ2h0TmFtZSgpO1xuICAgIC8vIHNoYWRvd0luZi5UID0gMDtcbiAgICAvLyBzaGFkb3dJbmYuYmx1ciA9IDI7XG5cbiAgICAvLyBTZXQgdXAgdGhlIHNoYWRvdyBnZW5lcmF0b3IuXG4gICAgLy8gQmVsb3cgZ2l2ZXMgZXJyb3Igb24gaXBob25lIHNvbWV0aW1lcy4uLiBBbmQgT2N1bHVzIEdvIGJyb3dzZXIuXG4gICAgLy8gaWYgKCFWYXJzLklPUykge1xuICAgIGlmIChVcmxWYXJzLmNoZWNrU2hhZG93SW5VcmwoKSkge1xuICAgICAgICBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgQkFCWUxPTi5TaGFkb3dHZW5lcmF0b3IoNDA5NiwgbGlnaHQpO1xuXG4gICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAvLyBTZXQgYWJvdmUgdG8gZmFsc2UgZm9yIGRlYnVnZ2luZyAoc2hhcnAgc2hhZG93KS5cbiAgICAgICAgICAgIC8vIHNoYWRvd0luZi5kYXJrbmVzcyA9IDAuODtcblxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUJsdXJFeHBvbmVudGlhbFNoYWRvd01hcCA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIElmIHVzaW5nIGtlcm5hbCwgZG8gYmVsb3cuXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlS2VybmVsQmx1ciA9IHRydWU7ICAvLyBWZXJ5IGdvb2Qgc2hhZG93cywgYnV0IG1vcmUgZXhwZW5zaXZlLlxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmJsdXJLZXJuZWwgPSBzaGFkb3dJbmYuYmx1cjsgIC8vIERlZ3JlZSBvZiBibHVyaW5lc3MuXG4gICAgICAgICAgICAvLyBzaGFkb3dHZW5lcmF0b3IuYmx1clNjYWxlID0gMTU7XG4gICAgICAgICAgICAvLyBzaGFkb3dHZW5lcmF0b3IuYmx1ckJveE9mZnNldCA9IDE1O1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc2hhZG93SW5mKTtcblxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLnNldERhcmtuZXNzKHNoYWRvd0luZi5kYXJrbmVzcyk7XG5cbiAgICAgICAgICAgIC8vIElmIG5vdCB1c2luZyBibHVyS2VybmFsLCBkbyBiZWxvdy4gSXQncyBhIGJpdCBmYXN0ZXIsIGJ1dFxuICAgICAgICAgICAgLy8gZG9lc24ndCBsb29rIGFzIGdvb2QuXG4gICAgICAgICAgICAvLyBzaGFkb3dHZW5lcmF0b3IuYmx1clNjYWxlID0gMTI7ICAvLyBHb29kIGZvciBzdXJmYWNlcyBhbmQgcmliYm9uLlxuICAgICAgICAgICAgLy8gc2hhZG93R2VuZXJhdG9yLmJsdXJCb3hPZmZzZXQgPSAxNTtcblxuICAgICAgICAgICAgLy8gT2xkIHBhcmFtZXRlcnMgbm90IHVzZWQ6XG4gICAgICAgICAgICAvLyBzaGFkb3dHZW5lcmF0b3IudXNlUG9pc3NvblNhbXBsaW5nID0gdHJ1ZTsgIC8vIEdvb2QgYnV0IHNsb3cuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gICAgIE9wdGltaXphdGlvbnMudXBkYXRlRW52aXJvbm1lbnRTaGFkb3dzKCk7XG4gICAgICAgIC8vIH0sIDEwMDApXG5cbiAgICAgICAgLy8gV2lsbCBtYWtlIGRlYnVnZ2luZyBlYXNpZXIuXG4gICAgICAgIC8vIHdpbmRvdy5zaGFkb3dHZW5lcmF0b3IgPSBzaGFkb3dHZW5lcmF0b3I7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImlPUywgc28gbm90IGdlbmVyYXRpbmcgc2hhZG93cy4uLiBjYXVzZXMgYW4gZXJyb3IuLi4gU2VlIGh0dHBzOi8vZm9ydW0uYmFieWxvbmpzLmNvbS90L2lzc3Vlcy1iZXR3ZWVuLXNoYWRvd2dlbmVyYXRvci1hbmQtaW9zLW9zeC83OTVcIik7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGJsdXIgYW5kIGRhcmtuZXNzIHRvIHVzZSBvbiBzaGFkb3dzIGFuZCBtb2xlY3VsZSBsaWdodGluZy5cbiAqIEByZXR1cm5zIE9iamVjdDxzdHJpbmcsbnVtYmVyPlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qmx1ckRhcmtuZXNzQW1iaWVudEZyb21MaWdodE5hbWUoKTogYW55IHtcbiAgICBjb25zdCBsaWdodCA9IFZhcnMuc2NlbmUubGlnaHRzWzBdO1xuXG4gICAgLy8gU2V0IHNvbWUgZGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBzaGFkb3dzLlxuICAgIGxldCBibHVyID0gNjQ7XG4gICAgbGV0IGRhcmtuZXNzID0gMC45NjI1OyAgLy8gTG93ZXIgbnVtYmVycyBhcmUgZGFya2VyLlxuICAgIGxldCBhbWJpZW50ID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gTm93IG92ZXJ3cml0ZSB0aG9zZSB2YWx1ZXMgaWYgcmVhc29uIHRvIGRvIHNvIGluIHRoZSBuYW1lIG9mIHRoZSBsaWdodC5cbiAgICBjb25zdCBibHVyTWF0Y2hlcyA9IGxpZ2h0Lm5hbWUubWF0Y2goL2JsdXJfKFswLTlcXC5dKykvZyk7XG4gICAgaWYgKGJsdXJNYXRjaGVzICE9PSBudWxsKSB7XG4gICAgICAgIGJsdXIgPSArYmx1ck1hdGNoZXNbMF0uc3Vic3RyKDUpO1xuICAgIH1cblxuICAgIC8qKiBAdHlwZSBBcnJheTxzdHJpbmc+ICovXG4gICAgY29uc3QgZGFya25lc3NNYXRjaGVzID0gbGlnaHQubmFtZS5tYXRjaCgvZGFya18oWzAtOVxcLl0rKS9nKTtcbiAgICBpZiAoZGFya25lc3NNYXRjaGVzICE9PSBudWxsKSB7XG4gICAgICAgIGRhcmtuZXNzID0gK2RhcmtuZXNzTWF0Y2hlc1swXS5zdWJzdHIoNSk7XG4gICAgfVxuXG4gICAgY29uc3QgYW1iaWVudE1hdGNoZXMgPSBsaWdodC5uYW1lLm1hdGNoKC9hbWJpZW50XyhbMC05XFwuXSspL2cpO1xuICAgIGlmIChhbWJpZW50TWF0Y2hlcyAhPT0gbnVsbCkge1xuICAgICAgICBhbWJpZW50ID0gK2FtYmllbnRNYXRjaGVzWzBdLnN1YnN0cig4KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2JsdXIsIGRhcmtuZXNzLCBhbWJpZW50fTtcbn1cblxuLyoqXG4gKiBTZXRzIHVwIHRoZSBzaGFkb3ctY2F0Y2hlciBtZXNoLlxuICogQHJldHVybnMgdm9pZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBTaGFkb3dDYXRjaGVycygpOiB2b2lkIHtcbiAgICAvLyBHbyB0aHJvdWdoIGFuZCBmaW5kIHRoZSBzaGRvdyBjYXRjaGVyc1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGxlbiA9IFZhcnMuc2NlbmUubWVzaGVzLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgICAgIGNvbnN0IG1lc2ggPSBWYXJzLnNjZW5lLm1lc2hlc1tpZHhdO1xuICAgICAgICBpZiAoKG1lc2gubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJzaGFkb3djYXRjaGVyXCIpICE9PSAtMSkgfHwgKFxuICAgICAgICAgICAgbWVzaC5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcInNoYWRvd19jYXRjaGVyXCIpICE9PSAtMSkpIHtcblxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgbWF0ZXJpYWxcbiAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwgPSBuZXcgQkFCWUxPTi5TaGFkb3dPbmx5TWF0ZXJpYWwoXCJzaGFkb3dfY2F0Y2hcIiArIGlkeC50b1N0cmluZygpLCBWYXJzLnNjZW5lKTtcbiAgICAgICAgICAgIG1lc2gubWF0ZXJpYWwuYWN0aXZlTGlnaHQgPSBWYXJzLnNjZW5lLmxpZ2h0c1swXTtcbiAgICAgICAgICAgIC8vIG1lc2gubWF0ZXJpYWwuYWxwaGEgPSAwLjE7XG5cbiAgICAgICAgICAgIC8vIEl0IGNhbiByZWNlaXZlIHNoYWRvd3MuXG4gICAgICAgICAgICBtZXNoLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIEZ1bmN0aW9ucyBmb3IgbGVhZGVyIG1vZGUsIHRoYXQgdGhlIGZvbGxvd2VyIChzdHVkZW50KSB1c2VzLlxuXG5pbXBvcnQgKiBhcyBDb21tb25DYW1lcmEgZnJvbSBcIi4uL0NhbWVyYXMvQ29tbW9uQ2FtZXJhXCI7XG5pbXBvcnQgKiBhcyBXZWJSVENCYXNlIGZyb20gXCIuL1dlYlJUQ0Jhc2VcIjtcbmltcG9ydCAqIGFzIFZhcnMgZnJvbSBcIi4uL1ZhcnMvVmFyc1wiO1xuaW1wb3J0ICogYXMgVmlzU3R5bGVzIGZyb20gXCIuLi9Nb2xzLzNETW9sL1Zpc1N0eWxlc1wiO1xuaW1wb3J0ICogYXMgUm90YXRpb25zIGZyb20gXCIuLi9VSS9NZW51M0QvUm90YXRpb25zXCI7XG5cbmRlY2xhcmUgdmFyIEJBQllMT046IGFueTtcblxubGV0IHBlZXJJZDogc3RyaW5nO1xuXG5leHBvcnQgY2xhc3MgU3R1ZGVudCBleHRlbmRzIFdlYlJUQ0Jhc2UuV2ViUlRDQmFzZSB7XG4gICAgcHJpdmF0ZSBkYXRhUmVjZWl2ZWRGdW5jOiBhbnk7XG4gICAgcHJpdmF0ZSBjb25uOiBhbnkgPSBudWxsOyAgLy8gVGhlIGNvbm5lY3Rpb24gKGp1c3Qgb25lKS5cblxuICAgIGNvbnN0cnVjdG9yKGRhdGFSZWNlaXZlZEZ1bmM6IGFueSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmRhdGFSZWNlaXZlZEZ1bmMgPSBkYXRhUmVjZWl2ZWRGdW5jO1xuICAgICAgICB0aGlzLnNldHVwV2ViUlRDQ2FsbGJhY2tzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSm9pbnMgYW4gZXhpc3Rpbmcgd2VicnRjIGNvbm5lY3Rpb24uXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBpZCAgVGhlIHBlZXIuanMgaWQuXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIHB1YmxpYyBqb2luRXhpc3RpbmdTZXNzaW9uKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgLy8gQ2xvc2Ugb2xkIGNvbm5lY3Rpb25cbiAgICAgICAgaWYgKHRoaXMuY29ubikge1xuICAgICAgICAgICAgdGhpcy5jb25uLmNsb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgY29ubmVjdGlvbiB0byBkZXN0aW5hdGlvbiBwZWVyIHNwZWNpZmllZCBpbiB0aGUgaW5wdXQgZmllbGRcbiAgICAgICAgdGhpcy5jb25uID0gdGhpcy5wZWVyLmNvbm5lY3QoaWQsIHtcbiAgICAgICAgICAgIHJlbGlhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldENvbm5lY3Rpb25DYWxsYmFja3MoKTtcblxuICAgICAgICB0aGlzLmNvbm4ub24oXCJvcGVuXCIsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChXZWJSVENCYXNlLkRFQlVHID09PSB0cnVlKSB7IGNvbnNvbGUubG9nKFwiQ29ubmVjdGVkIHRvOiBcIiArIHRoaXMuY29ubi5wZWVyKTsgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTYXZlIHBlZXJpZFxuICAgICAgICBwZWVySWQgPSBpZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCB0aGUgd2VicnRjIGNhbGxiYWNrcy5cbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXR1cFdlYlJUQ0NhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wZWVyLm9uKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25uID0gbnVsbDtcbiAgICAgICAgICAgIFdlYlJUQ0Jhc2Uud2ViUlRDU3RhbmRhcmRFcnJvck1zZygpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCB0aGUgY2FsbGJhY2tzIGZvciB3aGVuIGRhdGEgaXMgcmVjZWl2ZWQgb3IgdGhlIGNvbm5lY3Rpb24gaXNcbiAgICAgKiBjbG9zZWQuXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0Q29ubmVjdGlvbkNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgLy8gSGFuZGxlIGluY29taW5nIGRhdGEgKG1lc3NhZ2VzIG9ubHkgc2luY2UgdGhpcyBpcyB0aGUgc2lnbmFsXG4gICAgICAgIC8vIHNlbmRlcilcbiAgICAgICAgdGhpcy5jb25uLm9uKFwiZGF0YVwiLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoV2ViUlRDQmFzZS5ERUJVRyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVjZWl2ZWQ6XCIsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhUmVjZWl2ZWRGdW5jKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbm4ub24oXCJjbG9zZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICBXZWJSVENCYXNlLndlYlJUQ0Vycm9yTXNnKFwiTGVhZGVyIGNvbm5lY3Rpb24gY2xvc2VkLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5sZXQgdGFyZ2V0Q2FtZXJhUG9zaXRpb246IGFueSA9IG51bGw7XG5sZXQgdGFyZ2V0Q2FtZXJhUm90YXRpb25RdWF0ZXJuaW9uOiBhbnkgPSBudWxsO1xuXG4vKipcbiAqIFN0YXJ0IGZvbGxvd2luZyB0aGUgbGVhZGVyLiBSZWNlaXZlcyBpbmZvcm1hdGlvbiBmcm9tIHJlbW90ZSB1c2VyIHJlLlxuICogY2FtZXJhIHBvc2l0aW9uIGFuZCByb3RhdGlvbiwgYW5kIG1pcnJvcnMgdGhhdCBvbiB0aGUgcHJlc2VudCBjYW1lcmEuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGlkICBUaGUgcmVtb3RlIHdlYnJ0YyBpZC5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0Rm9sbG93aW5nKGlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0YXJnZXRDYW1lcmFQb3NpdGlvbiA9IG5ldyBGbG9hdDMyQXJyYXkoQ29tbW9uQ2FtZXJhLmdldENhbWVyYVBvc2l0aW9uKCkuYXNBcnJheSgpKTtcbiAgICB0YXJnZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb24gPSBuZXcgRmxvYXQzMkFycmF5KENvbW1vbkNhbWVyYS5nZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb24oKS5hc0FycmF5KCkpO1xuXG4gICAgY29uc3Qgc3R1ZCA9IG5ldyBTdHVkZW50KChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKFdlYlJUQ0Jhc2UuREVCVUcgPT09IHRydWUpIHsgY29uc29sZS5sb2coXCJzdHVkMSBnb3QgZGF0YVwiLCBkYXRhKTsgfVxuICAgICAgICBjb25zdCB0eXBlID0gZGF0YVtcInR5cGVcIl07XG4gICAgICAgIGNvbnN0IHZhbCA9IGRhdGFbXCJ2YWxcIl07XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImxvY3JvdFwiOlxuICAgICAgICAgICAgICAgIHRhcmdldENhbWVyYVBvc2l0aW9uID0gbmV3IEZsb2F0MzJBcnJheShbdmFsWzBdLCB2YWxbMV0sIHZhbFsyXV0pO1xuICAgICAgICAgICAgICAgIHRhcmdldENhbWVyYVJvdGF0aW9uUXVhdGVybmlvbiA9IG5ldyBGbG9hdDMyQXJyYXkoW3ZhbFszXSwgdmFsWzRdLCB2YWxbNV0sIHZhbFs2XV0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImluaXRpYWxVcmxcIjpcbiAgICAgICAgICAgICAgICAvLyBJZiBcIm5hbm9raWQuc2RmXCIgaW4gdXJsLCB5b3UgbmVlZCB0byByZWRpcmVjdC4uLlxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwibmFub2tpZC5zZGZcIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gcmVkaXJlY3QuXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdVcmwgPSB2YWwgKyBcIiZmPVwiICsgcGVlcklkO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvbGxvd2VycyBzaG91bGQgbmV2ZXIgaGF2ZSBzaGFkb3dzLCBiZWNhdXNlIHlvdSBuZXZlclxuICAgICAgICAgICAgICAgICAgICAvLyBrbm93IHdoYXQgZGV2aWNlIHlvdXIgc3R1ZGVudHMgd2lsbCBiZSB2aWV3aW5nIG9uLlxuICAgICAgICAgICAgICAgICAgICBuZXdVcmwgPSBuZXdVcmwucmVwbGFjZSgvc2g9dHJ1ZS9nLCBcInNoPWZhbHNlXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRvcC5sb2NhdGlvbi5ocmVmID0gbmV3VXJsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJ0b2dnbGVSZXBcIjpcbiAgICAgICAgICAgICAgICBWaXNTdHlsZXMudG9nZ2xlUmVwKFxuICAgICAgICAgICAgICAgICAgICB2YWxbXCJmaWx0ZXJzXCJdLFxuICAgICAgICAgICAgICAgICAgICB2YWxbXCJyZXBOYW1lXCJdLFxuICAgICAgICAgICAgICAgICAgICB2YWxbXCJjb2xvclNjaGVtZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJtb2xBeGlzUm90YXRpb25cIjpcbiAgICAgICAgICAgICAgICBSb3RhdGlvbnMuYXhpc1JvdGF0aW9uKHZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwibW9sVW5kb1JvdFwiOlxuICAgICAgICAgICAgICAgIFJvdGF0aW9ucy51bmRvUm90YXRlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgc3R1ZC5qb2luRXhpc3RpbmdTZXNzaW9uKGlkKTtcblxuICAgIC8vIFN0YXJ0IG1vdmluZyB0aGUgY2FtZXJhIGluIHN5bmNcbiAgICBWYXJzLnNjZW5lLnJlZ2lzdGVyQmVmb3JlUmVuZGVyKCgpID0+IHtcbiAgICAgICAgY29uc3QgY2FtZXJhTG9jID0gbmV3IEZsb2F0MzJBcnJheShDb21tb25DYW1lcmEuZ2V0Q2FtZXJhUG9zaXRpb24oKS5hc0FycmF5KCkpO1xuICAgICAgICBjb25zdCBuZXdQb3MgPSBtb3ZlVmVjVG93YXJkcyhcbiAgICAgICAgICAgIGNhbWVyYUxvYyxcbiAgICAgICAgICAgIHRhcmdldENhbWVyYVBvc2l0aW9uXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IG5ld1Bvc0FzVmVjID0gQkFCWUxPTi5WZWN0b3IzLkZyb21BcnJheShuZXdQb3MpO1xuICAgICAgICBDb21tb25DYW1lcmEuc2V0Q2FtZXJhUG9zaXRpb24obmV3UG9zQXNWZWMpO1xuXG4gICAgICAgIGNvbnN0IGNhbWVyYVJvdFF1YXQgPSBuZXcgRmxvYXQzMkFycmF5KENvbW1vbkNhbWVyYS5nZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb24oKS5hc0FycmF5KCkpO1xuICAgICAgICBjb25zdCBuZXdSb3QgPSBtb3ZlVmVjVG93YXJkcyhcbiAgICAgICAgICAgIGNhbWVyYVJvdFF1YXQsXG4gICAgICAgICAgICB0YXJnZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb25cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbmV3Um90QXNWZWMgPSBCQUJZTE9OLlF1YXRlcm5pb24uRnJvbUFycmF5KG5ld1JvdCk7XG4gICAgICAgIENvbW1vbkNhbWVyYS5zZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb24obmV3Um90QXNWZWMpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIE1vdmVzIGEgdmVjdG9yIHRvd2FyZHMgdGhlIHRhcmdldCB2ZWN0b3IuIEdldHMgYXBwbGllZCB0byBib3RoIHRoZSBjYW1lcmFcbiAqIHBvc2l0aW9uIGFuZCByb3RhdGlvbi5cbiAqIEBwYXJhbSAge2FueX0gY3VyVmVjICAgICBUaGUgY3VycmVudCB2ZWN0b3IuXG4gKiBAcGFyYW0gIHthbnl9IHRhcmdldFZlYyAgVGhlIHRhcmdldCB2ZWN0b3IuXG4gKi9cbmZ1bmN0aW9uIG1vdmVWZWNUb3dhcmRzKGN1clZlYzogYW55LCB0YXJnZXRWZWM6IGFueSkge1xuICAgIGNvbnN0IG51bUVudHJpZXMgPSBjdXJWZWMubGVuZ3RoO1xuXG4gICAgLy8gTm93IGdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiBjdXJWZWMgYW5kIHRoaXMgbmV3UG9zLlxuICAgIGNvbnN0IGRlbHRhUG9zID0gbmV3IEZsb2F0MzJBcnJheShudW1FbnRyaWVzKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUVudHJpZXM7IGkrKykgeyBkZWx0YVBvc1tpXSA9IHRhcmdldFZlY1tpXSAtIGN1clZlY1tpXTsgfVxuXG4gICAgY29uc3QgZmFjID0gMC4wMjtcbiAgICBjb25zdCBhbmltUmF0aW8gPSBWYXJzLnNjZW5lLmdldEFuaW1hdGlvblJhdGlvKCk7XG5cbiAgICAvLyBBIHZhcmlhYmxlIHRoYXQgd2lsbCBjb250YWluIHRoZSBuZXcgcG9zaXRpb25cbiAgICBjb25zdCBuZXdQb3MgPSBuZXcgRmxvYXQzMkFycmF5KG51bUVudHJpZXMpO1xuXG4gICAgLy8gU2NhbGUgdGhlIGRlbHRhIGFuZCBhZGQgaXQgdG8gdGhlIGN1clZlYy4gVGhhdCdzIHRoZSBuZXdQb3MuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1FbnRyaWVzOyBpKyspIHsgbmV3UG9zW2ldID0gIGN1clZlY1tpXSArIGFuaW1SYXRpbyAqIGZhYyAqIGRlbHRhUG9zW2ldOyB9XG5cbiAgICByZXR1cm4gbmV3UG9zO1xufVxuIiwiLy8gVGhlc2UgZnVuY3Rpb25zIGluY2x1ZGUgY2FtZXJhIGZ1bmN0aW9ucyBjb21tb24gdG8gYWxsIGtpbmRzIG9mIGNhbWVyYXMuXG5cbmltcG9ydCAqIGFzIE5hdmlnYXRpb24gZnJvbSBcIi4uL05hdmlnYXRpb24vTmF2aWdhdGlvblwiO1xuaW1wb3J0ICogYXMgUG9pbnRzIGZyb20gXCIuLi9OYXZpZ2F0aW9uL1BvaW50c1wiO1xuaW1wb3J0ICogYXMgVmFycyBmcm9tIFwiLi4vVmFycy9WYXJzXCI7XG5cbmRlY2xhcmUgdmFyIEJBQllMT046IGFueTtcblxuLyoqIEBjb25zdCB7Kn0gKi9cbmNvbnN0IGZvcndhcmRWZWMgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDEsIDAsIDApO1xuXG4vKiogQGNvbnN0IHsqfSAqL1xuY29uc3QgdXBWZWMgPSBuZXcgQkFCWUxPTi5WZWN0b3IzKDEsIDAsIDApO1xuXG4vLyBsZXQgYWN0aXZlQ2FtUG9zID0gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBsb2NhdGlvbiBvZiB0aGUgY2FtZXJhLiBJZiBWUiBjYW1lcmEsIGdldHMgdGhlIGxlZnQgZXllLlxuICogQHJldHVybnMgKiBUaGUgY2FtZXJhIGxvY2F0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FtZXJhUG9zaXRpb24oKTogYW55IHtcbiAgICAvLyBJZiBpdCdzIGEgVlIgY2FtZXJhLCB5b3UgbmVlZCB0byBtYWtlIGFuIGFkanVzdG1lbnQuXG5cbiAgICAvKiogQGNvbnN0IHsqfSAqL1xuICAgIGNvbnN0IGFjdGl2ZUNhbSA9IFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhO1xuXG4gICAgY29uc3QgYWN0aXZlQ2FtUG9zID0gYWN0aXZlQ2FtLnBvc2l0aW9uLmNsb25lKCk7XG5cbiAgICBpZiAoKFZhcnMudnJWYXJzLm5hdk1vZGUgPT09IE5hdmlnYXRpb24uTmF2TW9kZS5WUk5vQ29udHJvbGxlcnMpIHx8XG4gICAgICAgIChWYXJzLnZyVmFycy5uYXZNb2RlID09PSBOYXZpZ2F0aW9uLk5hdk1vZGUuVlJXaXRoQ29udHJvbGxlcnMpKSB7XG5cbiAgICAgICAgLy8gVlIgY2FtZXJhLCBzbyBnZXQgZXllIHBvc2l0aW9uLlxuICAgICAgICBpZiAoYWN0aXZlQ2FtLmxlZnRDYW1lcmEpIHtcbiAgICAgICAgICAgIGFjdGl2ZUNhbVBvcy5jb3B5RnJvbShhY3RpdmVDYW0ubGVmdENhbWVyYS5nbG9iYWxQb3NpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlByb2IgaGVyZVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhY3RpdmVDYW1Qb3M7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgY2FtZXJhIGxvY2F0aW9uLiBBY2NvdW50cyBmb3IgZGlmZmVyZW5jZSBiZXR3ZWVuIGV5ZSBhbmQgY2FtZXJhXG4gKiBwb3MgaWYgVlIgY2FtZXJhLlxuICogQHBhcmFtICB7Kn0gcHQgVGhlIG5ldyBsb2NhdGlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENhbWVyYVBvc2l0aW9uKHB0OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLk5vVlIpIHtcbiAgICAgICAgLy8gQSByZWd1bGFyIGNhbWVyYS4gSnVzdCBtb3ZlIGl0IHRoZXJlLlxuICAgICAgICBjb25zdCBhY3RpdmVDYW0gPSBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYTtcbiAgICAgICAgYWN0aXZlQ2FtLnBvc2l0aW9uLmNvcHlGcm9tKHB0KTtcbiAgICB9IGVsc2UgaWYgKChWYXJzLnZyVmFycy5uYXZNb2RlID09PSBOYXZpZ2F0aW9uLk5hdk1vZGUuVlJOb0NvbnRyb2xsZXJzKSB8fFxuICAgICAgICAgICAgICAgKFZhcnMudnJWYXJzLm5hdk1vZGUgPT09IE5hdmlnYXRpb24uTmF2TW9kZS5WUldpdGhDb250cm9sbGVycykpIHtcbiAgICAgICAgLy8gTm90IGV2ZXIgdGVzdGVkLi4uIG5vdCBzdXJlIGl0IHdvcmtzLi4uXG4gICAgICAgIGNvbnN0IGFjdGl2ZUNhbSA9IFZhcnMudnJIZWxwZXIud2ViVlJDYW1lcmE7XG5cbiAgICAgICAgLy8gQSBWUiBjYW1lcmEuIE5lZWQgdG8gYWNjb3VudCBmb3IgdGhlIGZhY3QgdGhhdCB0aGUgZXllIG1pZ2h0IG5vdCBiZVxuICAgICAgICAvLyBhdCB0aGUgc2FtZSBwbGFjZSBhcyB0aGUgY2FtZXJhLlxuICAgICAgICBhY3RpdmVDYW0ucG9zaXRpb24uY29weUZyb20oXG4gICAgICAgICAgICBwdC5zdWJ0cmFjdChcbiAgICAgICAgICAgICAgICBnZXRWZWNGcm9tRXllVG9DYW1lcmEoKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIHJvdGF0aW9uIHF1YXRlcm5pb24gb2YgdGhlIGN1cnJlbnQgY2FtZXJhLCB3aGV0aGVyIFVuaXZlcnNhbCxcbiAqIERldmljZU9yaWVudGF0aW9uLCBvciBWUi5cbiAqIEByZXR1cm5zICogVGhlIHF1YXRlcm5pb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYW1lcmFSb3RhdGlvblF1YXRlcm5pb24oKTogYW55IHtcbiAgICBpZiAoKFZhcnMudnJWYXJzLm5hdk1vZGUgPT09IE5hdmlnYXRpb24uTmF2TW9kZS5WUk5vQ29udHJvbGxlcnMpIHx8XG4gICAgICAgIChWYXJzLnZyVmFycy5uYXZNb2RlID09PSBOYXZpZ2F0aW9uLk5hdk1vZGUuVlJXaXRoQ29udHJvbGxlcnMpKSB7XG5cbiAgICAgICAgLy8gQ292ZXIgYWxsIGRldmljZXMgdXNpbmcgdGhlIGJlbG93Li4uIChBbmRyb2lkLCBDaHJvbWUsIENhcmJvYXJkKVxuICAgICAgICBjb25zdCBxdWF0ID0gVmFycy52ckhlbHBlci53ZWJWUkNhbWVyYS5kZXZpY2VSb3RhdGlvblF1YXRlcm5pb247XG4gICAgICAgIHJldHVybiAocXVhdC54ICE9PSAwKSA/IHF1YXQgOiBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5yb3RhdGlvblF1YXRlcm5pb247XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmVndWxhciAoVW5pdmVyc2FsKSBjYW1lcmEuXG4gICAgICAgIHJldHVybiBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5yb3RhdGlvblF1YXRlcm5pb247XG4gICAgfVxufVxuXG4vKipcbiAqIFNldHMgdGhlIHJvdGF0aW9uIHF1YXRlcm5pb24gb2YgdGhlIGNhbWVyYS4gQXMgY3VycmVudGx5IGltcGxlbWVudGVkLFxuICogYXNzdW1lcyBVbml2ZXJzYWwgY2FtZXJhIChpLmUuLCB0aGlzIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpblxuICogU3R1ZGVudCBtb2RlKS5cbiAqIEBwYXJhbSAgeyp9IHJvdFF1YSBUaGUgcm90YXRpb24gcXVhdGVybmlvbi5cbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENhbWVyYVJvdGF0aW9uUXVhdGVybmlvbihyb3RRdWE6IGFueSk6IHZvaWQge1xuICAgIGlmICgoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSTm9Db250cm9sbGVycykgfHxcbiAgICAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSV2l0aENvbnRyb2xsZXJzKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlBST0JMRU0hXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcXVhdGVybmlvblxuICAgICAgICBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5yb3RhdGlvblF1YXRlcm5pb24gPSByb3RRdWEuY2xvbmUoKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHJvdGF0aW9uIHZlY3RvciBhY2NvcmRpbmdseS4gU2VlXG4gICAgICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVnYW1lZGV2cy5jb20vdG9waWMvMTYxNjAtcmV0cmlldmluZy1yb3RhdGlvbi1hZnRlci1tZXNobG9va2F0L1xuICAgICAgICBWYXJzLnNjZW5lLmFjdGl2ZUNhbWVyYS5yb3RhdGlvbiA9IFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhLnJvdGF0aW9uUXVhdGVybmlvbi50b0V1bGVyQW5nbGVzKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGNhbWVyYSByb3RhdGlvbi5cbiAqIEByZXR1cm5zICogVGhlIHJvdGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FtZXJhUm90YXRpb25ZKCk6IGFueSB7XG4gICAgaWYgKChWYXJzLnZyVmFycy5uYXZNb2RlID09PSBOYXZpZ2F0aW9uLk5hdk1vZGUuVlJOb0NvbnRyb2xsZXJzKSB8fFxuICAgICAgICAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLlZSV2l0aENvbnRyb2xsZXJzKSkge1xuXG4gICAgICAgIC8vIENvbXBsaWNhdGVkIGluIHRoZSBjYXNlIG9mIGEgVlIgY2FtZXJhLlxuICAgICAgICBjb25zdCBncm91bmRQdFZlYyA9IFBvaW50cy5ncm91bmRQb2ludEJlbG93U3RhcmVQdC5zdWJ0cmFjdChQb2ludHMuZ3JvdW5kUG9pbnRCZWxvd0NhbWVyYSk7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgICAgIGxldCBhbmdsZSA9IEJBQllMT04uVmVjdG9yMy5HZXRBbmdsZUJldHdlZW5WZWN0b3JzKGdyb3VuZFB0VmVjLCBmb3J3YXJkVmVjLCB1cFZlYyk7XG5cbiAgICAgICAgaWYgKGdyb3VuZFB0VmVjLnogPCAwKSB7XG4gICAgICAgICAgICBhbmdsZSA9IC1hbmdsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYW5nbGUgaXMgYmV0d2VlbiAwIGFuZCAyICogTWF0aC5QSVxuICAgICAgICB3aGlsZSAoYW5nbGUgPCAwKSB7XG4gICAgICAgICAgICBhbmdsZSA9IGFuZ2xlICsgMiAqIE1hdGguUEk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGFuZ2xlID4gMiAqIE1hdGguUEkpIHtcbiAgICAgICAgICAgIGFuZ2xlID0gYW5nbGUgLSAyICogTWF0aC5QSTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFuZ2xlID0gYW5nbGUgKyBNYXRoLlBJICogMC41O1xuXG4gICAgICAgIHJldHVybiBhbmdsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGlzIG11Y2ggc2ltcGxpZXIgd2l0aCBhIG5vbi1WUiBjYW1lcmEuXG4gICAgICAgIGNvbnN0IGFjdGl2ZUNhbSA9IFZhcnMuc2NlbmUuYWN0aXZlQ2FtZXJhO1xuICAgICAgICBjb25zdCBhY3RpdmVDYW1Sb3QgPSBhY3RpdmVDYW0ucm90YXRpb24uY2xvbmUoKTtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNhbVJvdC55OyAgLy8gKyBNYXRoLlBJICogMC41O1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2ZWN0b3IgZnJvbSB0aGUgY2FtZXJhIGxvY2F0aW9uIHRvIHRoZSBleWUgbG9jYXRpb24uIEZvciBhIFZSXG4gKiBjYW1lcmEsIHRoZXNlIGNhbiBiZSBkaWZmZXJlbnQuXG4gKiBAcmV0dXJucyAqIFRoZSB2ZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZWNGcm9tRXllVG9DYW1lcmEoKTogYW55IHtcbiAgICBpZiAoVmFycy52clZhcnMubmF2TW9kZSA9PT0gTmF2aWdhdGlvbi5OYXZNb2RlLk5vVlIpIHtcbiAgICAgICAgLy8gTm90IGluIFZSIG1vZGU/IFRoZW4gdGhlcmUgaXMgbm8gZXllLlxuICAgICAgICByZXR1cm4gbmV3IEJBQllMT04uVmVjdG9yMygwLCAwLCAwKTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgc29tZSBWUiBjYW1lcmFzIGRvbid0IHRyYWNrIHBvc2l0aW9uLCBvbmx5IG9yaWVudGF0aW9uLlxuICAgIC8vIEdvb2dsZSBjYXJkYm9hcmQgaXMgYW4gZXhhbXBsZS5cbiAgICBjb25zdCBhY3RpdmVDYW0gPSBWYXJzLnZySGVscGVyLndlYlZSQ2FtZXJhO1xuICAgIGxldCBkZWx0YVZlYztcbiAgICBpZiAoYWN0aXZlQ2FtLmxlZnRDYW1lcmEpIHtcbiAgICAgICAgY29uc3QgbGVmdEV5ZVBvcyA9IGFjdGl2ZUNhbS5sZWZ0Q2FtZXJhLmdsb2JhbFBvc2l0aW9uO1xuICAgICAgICBkZWx0YVZlYyA9IGxlZnRFeWVQb3Muc3VidHJhY3QoYWN0aXZlQ2FtLnBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkZWx0YVZlYyA9IG5ldyBCQUJZTE9OLlZlY3RvcjMoMCwgMCwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlbHRhVmVjO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==