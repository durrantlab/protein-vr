// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

export abstract class URLParamsParent {
    /**
     * Gets the parameters relevant to the plugin and executes the plugin on
     * each of them.
     * @param  {*} allParams  All parameters.
     * @returns void
     */
    run(allParams: Map<string, any>): void {
        let relevantParams = this.getRelevantParams(allParams);
        const relevantParamsLen = relevantParams.length;
        for (let i = 0; i < relevantParamsLen; i++) {
            const relevantParamsItem = relevantParams[i];
            let paramName = relevantParamsItem[0];
            let paramVal = relevantParamsItem[1];
            this.actOnParam(paramName, paramVal);
        }
        // this.actOnParam("l2", "5,4,3,moosedog2");  // hardcoded for testing
    }

    /**
     * Gets the parameters relevant to this plugin.
     * @param  {*} allParams  All the parameters
     * @returns *  The parameters relevant to this plugin.
     */
    protected abstract getRelevantParams(allParams: Map<string, any>): any[][];

    /**
     * Acts on the parameter. This is where the plugin action happens.
     * @param  {string} paramName  The name of the parameter.
     * @param  {*}      paramVal   The value of the parameter.
     * @returns void
     */
    protected abstract actOnParam(paramName: string, paramVal: any): void;
}
