import {VueComponentParent} from "../../VueComponentParent";
import {store} from "../../VueX/VueXStore";

// @ts-ignore
import templateHtml from "./CheckboxComponent.template.htm";
import { positionAll3DMolMeshInsideAnother } from "../../../../Mols/3DMol/PositionInScene";

export class FormCheckboxComponent extends VueComponentParent {
    public tag = "form-checkbox";
    public methods = {};

    public computed = {
        "isChecked": {
            get: function(): boolean {
                return this["checked"];
            },
            set: function(val: boolean): void {
                this.$emit('change', val);
            }
        }
    };

    public props = {
        "id": {"required": true},
        "label": {"required": true},
        "hidden": {"required": true},
        "helpMsg": {"required": true},
        "checked": {"default": false}
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
