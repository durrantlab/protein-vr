import parent from "./ActionParent";

declare var BABYLON;
declare var PVRGlobals;

interface DoInterface {
    mesh: any;
    startFrame: number;
    endFrame: number;
    loop: boolean;
    callBack?: any;
}

class AnimateMesh extends parent {

    constructor(params) {  // : DoInterface
        /**
        The constructor. super(params) passes params to the parent class'
            constructor.

        :param DoInterface params: The parameters for this class. Use an
                           interface to make sure the correct 
                           parameters are always used.
        */
        
        super(params);
    }

    public do() {
        /**
        Perform the action: Start the animation.
        */

        if (!this.parameters["callBack"]) {
            this.parameters["callBack"] = function() {};
        }

        console.log(this.parameters["callBack"]);

        PVRGlobals.scene.beginAnimation(
            this.parameters["mesh"], this.parameters["startFrame"],
            this.parameters["endFrame"], this.parameters["loop"], 1.0,
            this.parameters["callBack"]
        )
    }
}

export default AnimateMesh;