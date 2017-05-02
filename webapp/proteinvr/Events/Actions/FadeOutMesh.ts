import * as Timers from "../Timers";

import parent from "./ActionParent";

declare var BABYLON;

// Useful variables:
// Location of camera: PVRGlobals.camera.position
// The same is true of a mesh. mesh.position is the location of the mesh.
// Timers will be useful here. Let's talk about it if it's not clear from the
// examples below.

interface DoInterface {
    mesh: any;
    milliseconds: number;
}

class FadeOutMesh extends parent {
    /**
    A class for fading out a given mesh.
    */

    constructor(params: DoInterface) {
        /**
        The constructor. super(params) passes params to the parent class'
            constructor.

        :param DoInterface params: The parameters for this class. Use an
                           interface to make sure the correct 
                           parameters are always used.
        */
        
        super(params);
    }

    public do(): void {
        /**
        Perform the action: Fade out.
        */

        // Note: For complex geometries, this will likely cause problems.
        // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

        let params = this.parameters;

        params.mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;

        Timers.addTimer({
            name: "FadeOut" + Math.random().toString(),
            durationInMiliseconds: params.milliseconds, //milliseconds,
            interpValStart: 1.0,
            interpValEnd: 0.0,
            tickCallback: function(val) {
                this.material.alpha = val;
                // this.customShader.alpha = val;
            }.bind(params.mesh),
            doneCallback: function() {
                this.material.alpha = 0;
                // this.customShader.alpha = 0;
                this.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
            }.bind(params.mesh)
        });
    }
}

export default FadeOutMesh;
