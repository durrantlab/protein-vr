import * as Core from "../../Core/Core";
declare var PVRGlobals;

abstract class ActionParent {
    /**
    The class that all other actions inherit.
    */

    /**
    The parameters associated with this action.
    */
    public parameters: any;

    constructor(params: any) {
        /**
        The class constructor.

        :param any params: Any required parameters.
        */

        this.parameters = params;
    }

    /**
    Perform the action.
    */
    public abstract do(): void;
}

export default ActionParent;
