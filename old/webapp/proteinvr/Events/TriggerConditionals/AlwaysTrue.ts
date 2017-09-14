import parent from "./TriggerConditionalParent";

declare var BABYLON;

interface CheckInterface {
    // triggerMesh: any;
    // cutOffDistance: number;
}

class AlwaysTrue extends parent {
    /**
    A condition that is immediately true. Good for starting game triggers, for
    example.
    */

    constructor(params: CheckInterface) {
        /**
        The class constructor. super() calls the parent class' constructor.

        :param any params:  Any required parameters. To make sure the
                   correct ones are supplied, use an interface.
        */

        super(params);
    }

    public checkIfTriggered(): boolean {
        /**
        Check if the conditions of this trigger are satisfied.

        :param any params: General function parameters.

        :returns: true if the conditions are satisfied, false otherwise.
        :rtype: :any:`bool`
        */

        return true;

    }
}

// Other ideas for conditionals:
// Game start.
// Game end.
// Keypress
// speech?

export default AlwaysTrue;
