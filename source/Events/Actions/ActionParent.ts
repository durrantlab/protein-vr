import Core from "../../Core/Core";

abstract class ActionParent {
    public parameters: any;

    constructor(params: any) {
        this.parameters = params;
    }

    public abstract do(): any;

    public scene() {
        return Core.scene;
    }
}

export default ActionParent;