import Timers from "./Timers";

declare var BABYLON;

namespace BuiltInActions {
    export function fadeOutMesh(mesh, milliseconds: number = 2000) {
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
        // Note: For complex geometries, this will likely cause problems.
        // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

        mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
        
        Timers.addTimer({
            name: "FadeIn" + Math.random().toString(),
            durationInMiliseconds: milliseconds, //milliseconds,
            tickCallback: function(val) {
                this.material.alpha = val;
                console.log(val);
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