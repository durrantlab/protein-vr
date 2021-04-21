// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

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
        PanelFooterComponent,
        ReplaceWarningComponent,
        SelectEnvironmentComponent
    ]
}
