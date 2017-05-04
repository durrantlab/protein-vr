import * as Countdowns from "../Countdowns";

import parent from "./ActionParent";

declare var BABYLON;

// Useful variables:
// Location of camera: PVRGlobals.camera.position
// The same is true of a mesh. mesh.position is the location of the mesh.
// Timers will be useful here. Let's talk about it if it's not clear from the
// examples below.

interface DoInterface {
    action: any;
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
        setInterval(function() {
            params.action.do();
        }, params.milliseconds)
    }
}

export default FadeOutMesh;
