define(["require", "exports"], function (require, exports) {
    class Spline {
        constructor(pointArray) {
            this.pointArray = pointArray;
            this.splineSet = this.setupSpline();
        }
        getSplineSet() {
            return this.splineSet;
        }
        get(input) {
            if (input >= this.pointArray[this.pointArray.length - 1].getX()) {
                return this.pointArray[this.pointArray.length - 1].getY();
            }
            for (var i = 0; i < this.splineSet.length; i++) {
                if (input >= this.splineSet[i].getX()) {
                    if (this.splineSet[i + 1] != undefined && input < this.splineSet[i + 1].getX()) {
                        return this.splineSet[i].getY(input);
                    }
                }
            }
        }
        setupSpline() {
            let arrayA = new Array();
            for (let entry of this.pointArray) {
                arrayA.push(entry.getY());
            }
            let arrayB = new Array(); // Make size n.
            let arrayD = new Array(); // Make size n.
            let arrayH = new Array(); // Make size n.
            for (var _i = 0; _i < this.pointArray.length - 1; _i++) {
                arrayH.push(this.pointArray[_i + 1].getX() - this.pointArray[_i].getX());
            }
            let arrayAlpha = new Array(); // Make size n.
            for (var _i = 1; _i < this.pointArray.length - 1; _i++) {
                arrayAlpha[_i] = ((3 / arrayH[_i]) * (arrayA[_i + 1] - arrayA[_i])) -
                    ((3 / arrayH[_i - 1]) * (arrayA[_i] - arrayA[_i - 1]));
            }
            let arrayC = new Array(); // Make size n + 1.
            let arrayL = new Array(); // Make size n + 1.
            let arrayMicro = new Array(); // Make size n + 1.
            let arrayZ = new Array(); // Make size n + 1.
            arrayL[0] = 1;
            arrayMicro[0] = 0;
            arrayZ[0] = 0;
            for (var _i = 1; _i < this.pointArray.length - 1; _i++) {
                arrayL[_i] = (2 * (this.pointArray[_i + 1].getX() - this.pointArray[_i - 1].getX())) -
                    ((arrayH[_i - 1]) * arrayMicro[_i - 1]); // Part 1
                arrayMicro[_i] = arrayH[_i] / arrayL[_i]; // Part 2
                arrayZ[_i] = (arrayAlpha[_i] - (arrayH[_i - 1] * arrayZ[_i - 1])) / arrayL[_i]; // Part 3
            }
            arrayL[this.pointArray.length - 1] = 1; // Step 8
            arrayZ[this.pointArray.length - 1] = 0; // Step 8
            arrayC[this.pointArray.length - 1] = 0; // Step 8
            for (var j = this.pointArray.length - 2; j >= 0; j--) {
                arrayC[j] = arrayZ[j] - (arrayMicro[j] * arrayC[j + 1]); // Part 1
                arrayB[j] = (((arrayA[j + 1] - arrayA[j])) / arrayH[j]) - (arrayH[j] * (arrayC[j + 1] + (2 * arrayC[j])) / 3); // Part 2
                arrayD[j] = (arrayC[j + 1] - arrayC[j]) / (3 * arrayH[j]); // Part 3
            }
            let output_set = new Array();
            for (var i = 0; i < this.pointArray.length; i++) {
                let aValue = arrayA[i];
                let bValue = arrayB[i];
                let cValue = arrayC[i];
                let dValue = arrayD[i];
                let xValue = this.pointArray[i].getX();
                output_set.push(new SplineData(aValue, bValue, cValue, dValue, xValue));
            }
            return output_set;
        }
    }
    class SplineData {
        constructor(a, b, c, d, x) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.x = x;
        }
        getX() {
            return this.x;
        }
        getY(input) {
            return this.a + (this.b * (input - this.x)) + (this.c * Math.pow((input - this.x), 2)) +
                (this.d * Math.pow((input - this.x), 3));
        }
    }
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        getX() {
            return this.x;
        }
        setX(newX) {
            this.x = newX;
        }
        getY() {
            return this.y;
        }
        setY(newY) {
            this.y = newY;
        }
    }
    // let point1 = new Point(1, 1);
    // let point2 = new Point(2, 2);
    // let point3 = new Point(3, 3);
    // let spline = new Spline([point1, point2, point3]);
    // for (let x = 1.1; x <= 3.1; x += 0.1) {
    //    console.log("x: " + x.toFixed(3) + " y: " + spline.get(x).toFixed(3));
    // }
    class MultiDimenSpline {
        constructor(xs, ys) {
            this.splines = [];
            for (let y_col = 0; y_col < ys[0].length; y_col++) {
                let pts_this_spline = [];
                for (let i = 0; i < ys.length; i++) {
                    let pt = new Point(xs[i], ys[i][y_col]);
                    pts_this_spline.push(pt);
                }
                this.splines.push(new Spline(pts_this_spline));
            }
        }
        get(input) {
            let numberArray = new Array();
            for (let entry of this.splines) {
                numberArray.push(entry.get(input));
            }
            return numberArray;
        }
    }
    exports.MultiDimenSpline = MultiDimenSpline;
});
// let xs = [1, 2, 3, 4, 5];
// let ys = [
//     [1, 2, 3],
//     [2, 3, 4],
//     [3, 4, 5],
//     [4, 5, 6],
//     [5, 6, 7]
// ]
// let spline2 = new MultiDimenSpline(xs, ys);
// for (let x = 1; x <= 5; x += 0.1) {
//    console.log("x: " + x.toFixed(3) + " ys: " + spline2.get(x));
// }
