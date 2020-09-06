import * as Parent from "../LoadSaveParent";
import { PanelComponent, setAssociatedPlugin } from "./PanelComponent";
import * as VRML from "../../../Mols/3DMol/VRML";
import { store } from "../../../Vars/VueX/VueXStore";
import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";

var FileSaver = require("file-saver");

export class SaveSceneFile extends Parent.LoadSaveParent {
    public pluginTitle = "Scene<div class='emoji'>💾</div>";
    public pluginSlug = "proteinvr-save-scene";

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {}

    /**
     * Runs when the user starts the save process. Most parameters should be
     * accessed as class variables.
     * @param  {*} [pvrSceneFileName=undefined]  The name of the file to save.
     * @returns void
     */
    public startSave(pvrSceneFileName: any = undefined): void {
        // see
        // https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
        // TODO: Shouldn't this be in UrlVars.ts? See urlParams, actually.
        let params = location.search.substring(1);
        let urlParamData = JSON.parse(
            '{"' + params.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function (key, value) {
                return key === "" ? value : decodeURIComponent(value);
            }
        );

        // Get the remote file to embed in the json.
        let url = urlParamData["s"];

        if (url === "LOCALFILE") {
            // No remote url to load. So look at data in memory.

            // First, make sure you can proceed.
            if (
                (store.state["proteinvrLoadScenePanel"]["fileContent"] === undefined) ||
                (store.state["proteinvrLoadScenePanel"]["fileType"] === undefined)
            ) {

                store.commit("setVar", {
                    moduleName: "loadSaveModal",
                    varName: "showLoadSaveModal",
                    val: false
                });

                SimpleModalComponent.openSimpleModal({
                    title: "Error Saving PVR File",
                    content: "Couldn't save PVR file due to an unrecoverable error. Sorry for the inconvenience! Please restart the ProteinVR app if you need to save your scene.",
                    hasCloseBtn: true,
                    unclosable: false
                }, false);
            } else {
                this.savePVRFile(
                    pvrSceneFileName,
                    store.state["proteinvrLoadScenePanel"]["fileContent"],
                    store.state["proteinvrLoadScenePanel"]["fileType"],
                    urlParamData
                );
            }
        } else {
            // So there is an available url. Load the data from the remote
            // source.
            jQuery.ajax(url, {
                /**
                 * When the url data is retrieved.
                 * @param  {string} data  The remote data.
                 * @returns void
                 */
                "success": (fileContent: string): void => {
                    let fileType = urlParamData["s"].split(".").pop().toLowerCase();
                    this.savePVRFile(pvrSceneFileName, fileContent, fileType, urlParamData);
                },

                /**
                 * If there's an error...
                 * @param  {*}       hdr
                 * @param  {*}       status
                 * @param  {string}  err
                 */
                "error": (hdr: any, status: any, err: any) => {
                    // TODO: need to test below...
                    VRML.showLoadMoleculeError(hdr, status, err, url);
                },
            });
        }
    }

    /**
     * Function that saves a PVR file of the current scene.
     * @param  {string} pvrSceneFileName  The file name.
     * @param  {string} fileContent       The contents of the loaded molecule
     *                                    (PDB or SDF).
     * @param  {string} fileType          The type of file. pdb or sdf.
     * @param  {*}      urlParamData      URL parameters to also save to the
     *                                    file.
     */
    private savePVRFile(pvrSceneFileName: string, fileContent: string, fileType: string, urlParamData: any) {
        urlParamData["scene"] = {
            "file": fileContent,
            "type": fileType
        }

        // s is the url. Good to remove that.
        delete urlParamData["s"];

        var blob = new Blob(
            // [window.location.href.split("?", 2)[1]],
            [JSON.stringify(urlParamData)],
            { type: "text/plain;charset=utf-8" }
        );
        FileSaver["saveAs"](blob, pvrSceneFileName);
    }

    /**
     * Gets the PanelComponent class.
     * @returns *  The class.
     */
    public vuePanelComponent(): any {
        setAssociatedPlugin(this);
        return PanelComponent;
    }
}
