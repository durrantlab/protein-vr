import parent from "./TriggerConditionalParent";

declare var BABYLON;
// declare var jQuery;

class GameStart extends parent {
    public canvasJQuery = undefined;
    public $ = undefined;
    constructor(params: any, jQuery?: any){
        super(params);
        this.$ = jQuery;
    }

    public check() :boolean{
        let gameBegun = false;

        // let $ = this.parameters["jQuery"];
        // this.canvasJQuery = jQuery("#renderCanvas");

        // function start() :boolean{
        //     return true;
        // }
    
        // gameBegun = this.canvasJQuery.ready(setTimeout(start, 10000));
        console.log("entering check function!")
        // this.$(window).load(function(){
        this.$(window).load(function(){
            console.log("Beginning timeout! " + Date.now()/1000);
            // setTimeout(function(){
            //     console.log("Timeout ended at " + Date.now()/1000 + "!");
            //     gameBegun = true;
            // }, 1000)
            gameBegun = true;
        });
        console.log("Check function return value: " + gameBegun);
        return gameBegun;
    }

    public asyncSetup() :any{
        return {
            "target": "document", 
            "event": "ready"
        };
    }
}

export default GameStart;