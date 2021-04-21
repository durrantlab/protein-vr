export abstract class URLParamsParent {
    run(allParams: Map<string, any>) {
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

    protected abstract getRelevantParams(allParams: Map<string, any>): any[][];
    protected abstract actOnParam(paramName: string, paramVal: any): void;
}
