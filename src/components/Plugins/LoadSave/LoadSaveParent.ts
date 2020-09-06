// All load/save plugins must inherit this one. Provides a standard interface.
// I'm going to put a _ in front of the functions that should not be changed,
// just to keep things organized.
import {VueComponentParent} from "../../UI/Vue/Components/VueComponentParent";
import {store} from "../../Vars/VueX/VueXStore";
import {PluginParent} from "../PluginParent";

// interface IMakeUrl {
//     useShadows: boolean,
//     useHardwareScaling: boolean,
//     url: string,
//     environ: string,
//     styles?: string,  // st
// }

// st0=All--Protein--Cartoon--Spectrum&st1=All--Ligand--Stick--Element&cx=1.5257&cy=2.3093&cz=-0.7067&crx=0&cry=0&crz=0&crw=1&e=environs/night/&sh=false&hs=true


export class LoadSaveParent extends PluginParent {
    //// First, things that child classes should overwrite. ////

    public pluginTitle = "";
    public pluginSlug = "";

    // A variable that describes the type of plugin.
    public type: string = "loadSave";

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {
        // Child class should overwrite this.
        alert("User interface done.");
    }

    /**
     * Runs when the user starts the load process. Few parmeters. Most should
     * be accessed as class variables. Children classes should overwrite this
     * function. But they should call _startLoad(), which wrapps around this
     * function, not startLoad() directly.
     * @param  {*} [data=undefined]  Any data to pass to the load/save
     *                               process.
     * @returns void
     */
    public startLoad(data: any = undefined): void {
        alert("Starting load.");
    }

    /**
     * Runs when the user starts the save process. Few parmeters. Most should
     * be accessed as class variables. Children classes should overwrite this
     * function. But they should call _startSave(), which wrapps around this
     * function, not startSave() directly.
     * @param  {*} [data=undefined]  Any data to pass to the load/save
     *                               process.
     * @returns void
     */
    public startSave(data: any = undefined): void {
        alert("Starting save.");
    }

    /**
     * Gets the PanelComponent class.
     * @returns *  The class.
     */
    public vuePanelComponent(): VueComponentParent {
        // Children inherit. Returns the vue component.
        return null;
    }

    //// Now things that child classes should not overwrite. ////

    /**
     * Starts the load process. This wraps around the user-defined startLoad()
     * function, which children define directly. This is the function that
     * should be called (don't be conused by the _ prefix!).
     * @param  {*} [data=undefined]  Any data to pass to the load/save
     *                               process.
     * @returns void
     */
    public _startLoad(data: any = undefined): void {
        // @ts-ignore
        var shadows = store.state["shadowsHardwareScaling"]["useShadows"];
        localStorage.setItem('shadows', shadows.toString());

        // @ts-ignore
        var hardwareScaling = store.state["shadowsHardwareScaling"]["useHardwareScaling"];
        localStorage.setItem('hardwareScaling', hardwareScaling.toString());

        this.startLoad(data);
    }

    /**
     * Starts the save process. This wraps around the user-defined startSave()
     * function, which children define directly. This is the function that
     * should be called (don't be conused by the _ prefix!).
     * @param  {*} [data=undefined]  Any data to pass to the load/save
     *                               process.
     * @returns void
     */
    public _startSave(data: any = undefined): void {
        this.startSave(data);
    }

    /**
     * Javascript that runs whenever the user interface is loaded. The same
     * for all children that inherit this class.
     * @returns void
     */
    public _onUserInterfaceDone(): void {
        // Setup shadow checkbox. An option regardless of which input system
        // used. Get it from the localstorage.
        if (localStorage.getItem("shadows") !== null) {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "useShadows",
                val: localStorage.getItem("shadows") === "true"
            });
        }

        // Also hardware scaling. An option regardless of which input system
        // used.
        if (localStorage.getItem("hardwareScaling") !== null) {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "useHardwareScaling",
                val: localStorage.getItem("hardwareScaling") === "true"
            });
        } else {
            store.commit("setVar", {  // default
                moduleName: "shadowsHardwareScaling",
                varName: "useHardwareScaling",
                val: true
            });
        }

        if (window["webXRPolyfill"]["nativeWebXR"] !== true) {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "showHardwareScaling",
                val: true
            });
        }
    }

    /**
     * Makes a URL string from the input parameters.
     * @param  {*} params  The input parameters.
     * @returns string
     */
    public makeUrl(params: any): string {
        let curUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

        // Override shadows and hardware scaling, always.
        let hardwareScaling = store.state["shadowsHardwareScaling"]["useHardwareScaling"];
        let shadows = store.state["shadowsHardwareScaling"]["useShadows"];
        params["sh"] = shadows;
        params["hs"] = hardwareScaling;

        // If no environment is specified, get it from the VueX store.
        if (params["e"] === undefined) {
            let environ = store.state["selectEnvironment"]["environment"];

            // Save them so they are the same when you reload. Decided not to
            // save url for security reasons (could be proprietary).
            localStorage.setItem('environ', environ);

            params["e"] = environ;
        }

        let urlParams = Object.keys(params).map(
            k => k + "=" + encodeURIComponent(
                params[k].toString()
            )
        ).join("&");

        let newUrl = curUrl + "?" + urlParams;

        return newUrl;
    }

    /**
     * A common function used to load PDB and SDF text into the system.
     * @param  {string} fileContents          The contents of the file (PDB or
     *                                        SDF format).
     * @param  {string} [fileType=undefined]  The type of the file (pdb or
     *                                        sdf). Will be auto detected if
     *                                        not specified.
     * @param  {*}      [urlParams={}]        The url parameters also used to
     *                                        load the file.
     */
    public loadPdbOrSdfFromFile(fileContents: string, fileType: string = undefined, urlParams: any = {}) {
        if (fileType === undefined) {
            // Not specified, so try to figure it out from the file contents
            // themselves.
            if (fileContents.indexOf("\nATOM ") !== -1) {
                fileType = "pdb";
            } else if (fileContents.indexOf("\nHETATM ") !== -1) {
                fileType = "pdb";
            } else {
                fileType = "sdf";
            }
        }

        // here save data in dataToLoad to localstore to use on reload
        urlParams["s"] = "LOCALFILE";

        sessionStorage.setItem("fileContent", fileContents);
        sessionStorage.setItem("fileType", fileType);

        // Construct the redirect url and redirect.
        window.location.href = this.makeUrl(urlParams);
    }
}
