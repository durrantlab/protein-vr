abstract class ActionParent {
    public parameters: any;

    constructor(params: any) {
        this.parameters = params;
    }

    public abstract do(): any;
}

export default ActionParent;