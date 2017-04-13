/**
 * module to create/store/maintain system variables
 */ 

namespace SystemVars{
    export var systemVars :Object = {
        "device": undefined,
        "animations": undefined,
        "textureDetail": undefined,
        "audio": undefined,
        "fog": undefined,
        "visibility": undefined
    };

    /**
     * This function will assign values to the system variables based on user input.
     */
    export function setup() :void {

        SystemVars.systemVars['device'] = prompt("What device are you using?\nDesktop\nLaptop\nVRHeadset", "all lowercase please");
        
        SystemVars.systemVars['animations'] = confirm("Would you like animations in your experince?");

        SystemVars.systemVars['textureDetail'] = parseInt(prompt("On a scale of 1-5 how detailed would you like the textures to be?"), 10);
        
        SystemVars.systemVars['audio'] = confirm("Would you like audio in your experience?");

        SystemVars.systemVars['fog'] = confirm("You down with F.O.G?");

        SystemVars.systemVars['visibility'] = parseInt(prompt("Enter your desired visibility level on a scale of 1-5") ,10); 
   
    } 
}

export default SystemVars;