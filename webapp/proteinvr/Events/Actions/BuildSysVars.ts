// NOTE USED ANYWHERE???

import parent from "./ActionParent";

class BuildSysVars extends parent {
    constructor(params){
        super(params);
    }

    public do(){
        let userVars :object = {
            "device": null,
            "animations": null
        };
        let device = prompt("What device are you using?\nDesktop\nLaptop\nVRHeadset", "all lowercase please");

        userVars['device'] = device;
        
        userVars['animations'] = confirm("Would you like animations in your experince?");

        userVars['textureDetail'] = parseInt(prompt("On a scale of 1-5 how detailed would you like the textures to be?"), 10);
        
        userVars['audio'] = confirm("Would you like audio in your experience?");

        userVars['fog'] = confirm("You down with F.O.G?");

        userVars['visibility'] = parseInt(prompt("Enter your desired visibility level on a scale of 1-5") ,10); 
    }
}

export default BuildSysVars