define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function _sphereArrayToNameArray(arr) {
        let asNameArray = [];
        for (let i = 0; i < arr.length; i++) {
            asNameArray.push([arr[i].textureFileName, arr[i]]);
        }
        return asNameArray;
    }
    function _sphereArrayToDict(arr) {
        let asDict = {};
        let keys = [];
        for (let i = 0; i < arr.length; i++) {
            asDict[arr[i].textureFileName] = arr[i];
            keys.push(arr[i].textureFileName);
        }
        return {
            dict: asDict,
            keys: keys
        };
    }
    function unionArraysOfSpheres(arr1, arr2) {
        let arrsWithNames = [
            _sphereArrayToNameArray(arr1),
            _sphereArrayToNameArray(arr2)
        ];
        let unionSphereNames = [];
        let union = [];
        for (let j = 0; j < arrsWithNames.length; j++) {
            let arrWithNames = arrsWithNames[j];
            for (let i = 0; i < arrWithNames.length; i++) {
                let name = arrWithNames[i][0];
                let sphere = arrWithNames[i][1];
                if (unionSphereNames.indexOf(name) === -1) {
                    unionSphereNames.push(name);
                    union.push(sphere);
                }
            }
        }
        return union;
    }
    exports.unionArraysOfSpheres = unionArraysOfSpheres;
    function intersectionArraysOfSpheres(arr1, arr2) {
        let arr1AsDict = _sphereArrayToDict(arr1);
        let arr2AsDict = _sphereArrayToDict(arr2);
        let intersection = [];
        for (let i = 0; i < arr1AsDict.keys.length; i++) {
            let arr1Key = arr1AsDict.keys[i];
            if (arr2AsDict.keys.indexOf(arr1Key) !== -1) {
                intersection.push(arr1AsDict[arr1Key]);
            }
        }
        return intersection;
    }
    exports.intersectionArraysOfSpheres = intersectionArraysOfSpheres;
    function difference(arr1, arr2) {
        let arr1AsDict = _sphereArrayToDict(arr1);
        let arr2AsDict = _sphereArrayToDict(arr2);
        let inFirstOnly = [];
        let inSecondOnly = [];
        for (let i = 0; i < arr1AsDict.keys.length; i++) {
            let arr1Key = arr1AsDict.keys[i];
            if (arr2AsDict.keys.indexOf(arr1Key) === -1) {
                inFirstOnly.push(arr1AsDict.dict[arr1Key]);
            }
        }
        for (let i = 0; i < arr2AsDict.keys.length; i++) {
            let arr2Key = arr2AsDict.keys[i];
            if (arr1AsDict.keys.indexOf(arr2Key) === -1) {
                inSecondOnly.push(arr2AsDict.dict[arr2Key]);
            }
        }
        return {
            inFirstOnly: inFirstOnly,
            inSecondOnly: inSecondOnly
        };
    }
    exports.difference = difference;
});
