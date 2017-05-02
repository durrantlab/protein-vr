import * as Timers from "../Timers";
import * as Core from "../../Core/Core";
import * as CameraChar from "../../CameraChar";

declare var BABYLON;

// Useful variables:
// Location of camera: PVRGlobals.camera.position
// The same is true of a mesh. mesh.position is the location of the mesh.
// Timers will be useful here. Let's talk about it if it's not clear from the
// examples below.

// DON'T MODIFY THIS FILE!!!

namespace BuiltInActions {
    export function fadeOutMesh(mesh: any, milliseconds: number = 2000) {
        /**
        Fade a mesh in the scene to transparent.

        :param any mesh: The mesh to fade.

        :param number milliseconds: The number of milliseconds (fade
                      duration).
        */

        // Note: For complex geometries, this will likely cause problems.
        // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

        mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;

        Timers.addTimer({
            name: "FadeOut" + Math.random().toString(),
            durationInMiliseconds: milliseconds, //milliseconds,
            interpValStart: 1.0,
            interpValEnd: 0.0,
            tickCallback: function(val) {
                this.material.alpha = val;
            }.bind(mesh),
            doneCallback: function() {
                this.material.alpha = 0;
                mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
            }.bind(mesh)
        });
    }

    export function fadeInMesh(mesh, milliseconds: number = 2000) {
        /**
        Fade a mesh in the scene from transparent to visible.

        :param any mesh: The mesh to fade in.

        :param number milliseconds: The number of milliseconds (fade
                      duration).
        */

        // Note: For complex geometries, this will likely cause problems.
        // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

        mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;

        Timers.addTimer({
            name: "FadeIn" + Math.random().toString(),
            durationInMiliseconds: milliseconds, //milliseconds,
            tickCallback: function(val) {
                this.material.alpha = val;
            }.bind(mesh),
            doneCallback: function() {
                this.material.alpha = 1.0;
                mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
            }.bind(mesh)
        });
    }

    // Other ideas for actions:
    // Screen flashes white (for scene transitions?)
    // Object moves from one location to another
    //    Straight line
    //    Random wanter (like a ligand)
    // Camera moves from one location to another
    // Change an object's material/shader.
}

export default BuiltInActions;
