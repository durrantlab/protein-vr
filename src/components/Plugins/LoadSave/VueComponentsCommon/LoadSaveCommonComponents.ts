import { PanelComponent } from "./PanelComponent";
import { ShadowsHardwareScalingComponent } from "./ShadowsHardwareScalingComponent";
// import { LoadSaveModalComponent } from "./LoadSaveModalComponent";
import { PanelFooterComponent } from "./PanelFooterComponent";
import { ReplaceWarningComponent } from "./ReplaceWarningComponent";
// import { LoadSaveParent } from "../Parent";

export function getLoadSaveCommonComponents(): any[]  {
    // There are a few Vue components that are common to lots of load/save components.

    return [
        PanelComponent,
        ShadowsHardwareScalingComponent,
        // LoadSaveModalComponent,
        PanelFooterComponent,
        ReplaceWarningComponent
    ]
}
