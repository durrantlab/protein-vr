import { PanelComponent } from "./PanelComponent";
import { ShadowsHardwareScalingComponent } from "./ShadowsHardwareScalingComponent";
import { PanelFooterComponent } from "./PanelFooterComponent";
import { ReplaceWarningComponent } from "./ReplaceWarningComponent";
import { SelectEnvironmentComponent  } from "./SelectEnvironmentComponent";

/**
 * Gets all the LoadSave components (classes, not objects).
 * @returns *  An array of all the classss.
 */
export function getLoadSaveCommonComponents(): any[]  {
    // There are a few Vue components that are common to lots of load/save
    // components.
    return [
        PanelComponent,
        ShadowsHardwareScalingComponent,
        // LoadSaveModalComponent,
        PanelFooterComponent,
        ReplaceWarningComponent,
        SelectEnvironmentComponent
    ]
}
