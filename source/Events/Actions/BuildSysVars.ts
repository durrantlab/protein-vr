import parent from "./ActionParent";

class BuildSysVars extends parent {
    constructor(params){
        super(params);
    }

    public do(){
        let systemVars :object = {
            "device": null,
            "animations": null
        };
        let device = prompt("What device are you using?\nDesktop\nLaptop\nVRHeadset", "all lowercase please");

        systemVars['device'] = device;
        
        systemVars['animations'] = confirm("Would you like animations in your experince?");

        systemVars['textureDetail'] = parseInt(prompt("On a scale of 1-5 how detailed would you like the textures to be?"), 10);
        
        systemVars['audio'] = confirm("Would you like audio in your experience?");

        systemVars['fog'] = confirm("You down with F.O.G?");

        systemVars['visibility'] = parseInt(prompt("Enter your desired visibility level on a scale of 1-5") ,10); 
        
    }
}

export default BuildSysVars