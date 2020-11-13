// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

export abstract class PluginParent {
    // A variable that describes the type of plugin.
    abstract type: string = "undefined";
}
