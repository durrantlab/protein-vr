import Core from "../../Core/Core";

/**
 * The class that all other actions inherit.
 */
abstract class ActionParent {
    /**
     * The parameters associated with this action.
     */
    public parameters: any;

    /**
     * The class constructor.
     * @param  {any}    params Any required parameters.
     */
    constructor(params: any) {
        this.parameters = params;
    }

    /**
     * Perform the action.
     */
    public abstract do(): void;

    /**
     * A function that returns the current BABYLON scene. Here for
     *     convenience.
     * @return {any} The BABYLON scene.
     */
    public scene(): any {
        return Core.scene;
    }
}

export default ActionParent;
