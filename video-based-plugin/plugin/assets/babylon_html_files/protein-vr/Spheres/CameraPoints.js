define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CameraPoints {
        constructor() {
            /*
            A class that keeps track of and processes the valid locations where the
            camera can reside (i.e., at the centers of viewer spheres.)
            */
            this.data = [];
        }
        push(d) {
            /*
            Add a point to the list of camera points.
    
            :param CameraPointData d: The data point to add.
            */
            this.data.push(d);
        }
        _getValBasedOnCriteria(d, criteria = "distance") {
            /*
            Each camera data point contains several values (distance, angle,
            score). This function retrieves a specific kind of value from a data
            point.
    
            :param CameraPointData d: The data point to get data from.
    
            :param string criteria: The name of the kind of data to get. Defaults
                          to "distance"
    
            :returns: The corresponding value.
            :rtype: :class:`number`
            */
            let val;
            switch (criteria) {
                case "distance":
                    return d.distance;
                case "angle":
                    return d.angle;
                case "score":
                    return d.score;
                default:
                    debugger;
            }
        }
        sort(criteria = "distance") {
            /*
            Sorts the data points by a given criteria.
    
            :param string criteria: The criteria to use. "distance", "angle", or
                          "score". Defaults to "distance".
            */
            this.data.sort(function (a, b) {
                let aVal = this.This._getValBasedOnCriteria(a, this.criteria);
                let bVal = this.This._getValBasedOnCriteria(b, this.criteria);
                if (aVal < bVal) {
                    return -1;
                }
                else if (aVal > bVal) {
                    return 1;
                }
                else {
                    return 0;
                }
            }.bind({
                criteria: criteria,
                This: this
            }));
        }
        removeFirst() {
            /*
            Remove the first item presently in the list of data points. This
            function is generally only useful if you've sorted the data points
            first.
            */
            this.data.shift();
        }
        firstPoint() {
            /*
            Get the first item presently in the list of data points. This function
            is generally only useful if you've sorted the data points first.
    
            :returns: The first camera point.
            :rtype: :class:`CameraPointData`
            */
            return this.data[0];
        }
        firstFewPoints(num) {
            /*
            Get the first several items presently in the list of data points. This
            function is generally only useful if you've sorted the data points
            first.
    
            :param int num: The number of top points to return.
    
            :returns: A CameraPoints containing the top points.
            :rtype: :class:`CameraPoints`
            */
            let newCameraPoints = new CameraPoints();
            for (let i = 0; i < num; i++) {
                newCameraPoints.push(this.data[i]);
            }
            return newCameraPoints;
        }
        copy() {
            return this.firstFewPoints(this.length());
        }
        length() {
            /*
            Get the number of points in the current list.
    
            :returns: the number of points.
            :rtype: :class:`int`
            */
            return this.data.length;
        }
        get(index) {
            /*
            Get a specific data point from the list.
    
            :param int index: The index of the data point.
    
            :returns: The data point.
            :rtype: :class:`CameraPointData`
            */
            return this.data[index];
        }
        lessThanCutoff(cutoff, criteria = "distance") {
            /*
            Get a list of all points that have values less than some cutoff.
    
            :param number cutoff: The cutoff to use.
    
            :param string criteria: The criteria to use. "distance", "angle", or
                          "score". Defaults to "distance".
    
            :param int num: The number of top points to return.
    
            :returns: A CameraPoints containing the points that meet the criteria.
            :rtype: :class:`CameraPoints`
            */
            let newCameraPoints = new CameraPoints();
            for (let dIndex = 0; dIndex < this.data.length; dIndex++) {
                let d = this.data[dIndex];
                let val = this._getValBasedOnCriteria(d, criteria);
                if (val <= cutoff) {
                    newCameraPoints.push(d);
                }
            }
            return newCameraPoints;
        }
        addAnglesInPlace(pivotPoint, vec1) {
            /*
            Calculate angles between each of the points in this list and another
            point, with a third central ("pivot") point specified..
    
            :param BABYLON.Vector3 pivotPoint: The central point of the three
                                   points that form the angle.
    
            :param BABYLON.Vector3 vec1: The third vector used to calculate the angle.
            */
            let BABYLON = Globals.get("BABYLON");
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                let vec2 = d.position.subtract(pivotPoint).normalize();
                let angle = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
                this.data[i].angle = angle;
            }
        }
        addScoresInPlace(maxAngle, maxDistance) {
            /*
            Calculate scores for each of the points in this. Points right in front
            of the camera are given higher values, so both distance and angle play
            roles.
    
            :param number maxAngle: The maximum acceptable angle.
    
            :param number maxDistance: The maximum acceptable distance.
            */
            // Combination of angle (should be close to 0) and distance (should be
            // close to 0). But need to be normalized.
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                // Note that lower scores are better.
                let score = 0.5 * ((d.angle / maxAngle) + (d.distance / maxDistance));
                this.data[i].score = score;
            }
        }
        removePointsInSameGeneralDirection(pivotPt) {
            /*
            Get a list of data points without those points that are off more or
            less the same direction relative to the camera. No need for two arrows
            pointing in the same direction.
    
            :param BABYLON.Vector3 pivotPt: Probably the camera location.
    
            :returns: A CameraPoints containing the points that meet the criteria.
            :rtype: :class:`CameraPoints`
            */
            // This removes any points in the same general direction, keeping the
            // one that is closest.
            let BABYLON = Globals.get("BABYLON");
            for (let dIndex1 = 0; dIndex1 < this.data.length - 1; dIndex1++) {
                if (this.data[dIndex1] !== null) {
                    let pt1 = this.data[dIndex1].position;
                    let vec1 = pt1.subtract(pivotPt).normalize();
                    for (let dIndex2 = dIndex1 + 1; dIndex2 < this.data.length; dIndex2++) {
                        if (this.data[dIndex2] !== null) {
                            let pt2 = this.data[dIndex2].position;
                            let vec2 = pt2.subtract(pivotPt).normalize();
                            let angleBetweenVecs = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
                            if (angleBetweenVecs < 0.785398) {
                                let dist1 = this.data[dIndex1].distance;
                                let dist2 = this.data[dIndex2].distance;
                                // Note that the below alters the data in the source list.
                                // So don't use that list anymore. (Just use what this
                                // function returns...)
                                if (dist1 <= dist2) {
                                    this.data[dIndex2] = null;
                                }
                                else {
                                    this.data[dIndex1] = null;
                                }
                            }
                        }
                    }
                }
            }
            // Now keep only ones that are not null
            let newCameraPoints = new CameraPoints();
            for (let dIndex = 0; dIndex < this.data.length; dIndex++) {
                let d = this.data[dIndex];
                if (d !== null) {
                    newCameraPoints.push(d);
                }
            }
            // Return the kept ones.
            return newCameraPoints;
        }
        toString() {
            /*
            Return a string repreesentation of this CameraPoints object. For
            debugging.
    
            :returns: A string representation.
            :rtype: :class:`string`
            */
            let response = "";
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                response = response + "Pt" + i.toString() + "; ";
                response = response + "distance: " + d.distance.toFixed(2) + "; ";
                response = response + "position: " + d.position.toString(2) + "; ";
                response = response + "associatedViewerSphere: " + d.associatedViewerSphere.textureFileName + "; ";
                if (d.angle !== undefined) {
                    response = response + "angle: " + d.angle.toFixed(2) + "; ";
                }
                if (d.score !== undefined) {
                    response = response + "score: " + d.score.toFixed(2) + "; ";
                }
                response = response + "\n";
            }
            return response;
        }
        associatedSphereTextureNamesInOrder() {
            /*
            Returns a list of the texture names associated with the points viewer
            spheres, in the proper sorted order. Just for debugging purposes.
    
            :returns: The list of texture names.
            :rtype: :class:`string[]`
            */
            // for debugging purposes
            let names = [];
            for (let i = 0; i < this.data.length; i++) {
                names.push(this.data[i].associatedViewerSphere.textureFileName);
            }
            return names;
        }
    }
    exports.CameraPoints = CameraPoints;
});
