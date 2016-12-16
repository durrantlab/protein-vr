import Core from "../../Core/Core";

abstract class ActionParent {
    /**
     * The class that all other actions inherit.
     */

    /**
     * The parameters associated with this action.
     */
    public parameters: any;

    constructor(params: any) {
        /**
         * The class constructor.
         * @param  {any}    params Any required parameters.
         */

        this.parameters = params;
    }

    /**
     * Perform the action.
     */
    public abstract do(): void;

    public scene(): any {
        /**
         * A function that returns the current BABYLON scene. Here for
         *     convenience.
         * @return {any} The BABYLON scene.
         */

        return Core.scene;
    }
}

export default ActionParent;
