class Spline {
    private pointArray: Point[]; // Size is n + 1.
    private splineSet: Array<SplineData>;

    constructor(pointArray: Point[]) {
        this.pointArray = pointArray;
        this.splineSet = this.setupSpline();
    }

    getSplineSet() {
        return this.splineSet;
    }

    get(input: number): number { // Returns the y-value of the spline.
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

    setupSpline(): Array<SplineData> { // Test with 1.005
        let arrayA = new Array<number>();
        for (let entry of this.pointArray) { // Iterate through the pointArray; make arrayA size of n + 1.
            arrayA.push(entry.getY());
        }

        let arrayB = new Array<number>(); // Make size n.
        let arrayD = new Array<number>(); // Make size n.

        let arrayH = new Array<number>(); // Make size n.
        for (var _i = 0; _i < this.pointArray.length - 1; _i++) {
            arrayH.push(this.pointArray[_i + 1].getX() - this.pointArray[_i].getX());
        }

        let arrayAlpha = new Array<number>(); // Make size n.
        for (var _i = 1; _i < this.pointArray.length - 1; _i++) {
            arrayAlpha[_i] = ((3/arrayH[_i]) * (arrayA[_i + 1] - arrayA[_i])) -
            ((3/arrayH[_i - 1]) * (arrayA[_i] - arrayA[_i - 1]));
        }

        let arrayC = new Array<number>(); // Make size n + 1.
        let arrayL = new Array<number>(); // Make size n + 1.
        let arrayMicro = new Array<number>(); // Make size n + 1.
        let arrayZ = new Array<number>(); // Make size n + 1.

        arrayL[0] = 1;
        arrayMicro[0] = 0;
        arrayZ[0] = 0;

        for (var _i = 1; _i < this.pointArray.length - 1; _i++) { // Step 7 of algorithm.
            arrayL[_i] = (2 * (this.pointArray[_i + 1].getX() - this.pointArray[_i - 1].getX())) -
            ((arrayH[_i - 1]) * arrayMicro[_i - 1]); // Part 1

            arrayMicro[_i] = arrayH[_i]/arrayL[_i]; // Part 2

            arrayZ[_i] = (arrayAlpha[_i] - (arrayH[_i - 1] * arrayZ[_i - 1])) / arrayL[_i]; // Part 3
        }

        arrayL[this.pointArray.length - 1] = 1; // Step 8
        arrayZ[this.pointArray.length - 1] = 0; // Step 8
        arrayC[this.pointArray.length - 1] = 0; // Step 8

        for (var j = this.pointArray.length - 2; j >= 0; j--) { // Step 9
            arrayC[j] = arrayZ[j] - (arrayMicro[j] * arrayC[j + 1]); // Part 1

            arrayB[j] = (((arrayA[j + 1] - arrayA[j])) / arrayH[j]) - (arrayH[j] * (arrayC[j + 1] + (2 * arrayC[j])) / 3); // Part 2

            arrayD[j] = (arrayC[j + 1] - arrayC[j]) / (3 * arrayH[j]); // Part 3
        }

        let output_set = new Array<SplineData>();

        for (var i = 0; i < this.pointArray.length; i++) {
            let aValue: number = arrayA[i];
            let bValue: number = arrayB[i];
            let cValue: number = arrayC[i];
            let dValue: number = arrayD[i];
            let xValue: number = this.pointArray[i].getX();

            output_set.push(new SplineData(aValue, bValue, cValue, dValue, xValue));
        }

        return output_set;
    }
}

class SplineData {
    private a: number;
    private b: number;
    private c: number;
    private d: number;
    private x: number;

    constructor(a: number, b: number, c: number, d: number, x: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.x = x;
    }

    getX(): number {
        return this.x;
    }

    getY(input: number): number {
        return this.a + (this.b * (input - this.x)) + (this.c * Math.pow((input - this.x), 2)) +
        (this.d * Math.pow((input - this.x), 3));
    }
}

class Point {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getX(): number {
        return this.x;
    }

    setX(newX: number): void {
        this.x = newX;
    }

    getY(): number {
        return this.y;
    }

    setY(newY: number): void {
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

export class MultiDimenSpline {
    private splines = [];
    constructor(xs: number[], ys: Array<number[]>) { // ([1,2,3], [[4, 5, 6], [7, 8, 9]])
        for (let y_col=0; y_col<ys[0].length; y_col++) {
            let pts_this_spline = [];
            for (let i=0; i<ys.length; i++) {
                let pt = new Point(xs[i], ys[i][y_col]);
                pts_this_spline.push(pt);
            }
            this.splines.push(new Spline(pts_this_spline))
        }
    }

    public get(input: number): number[] {
      let numberArray = new Array<number>();
      for (let entry of this.splines) {
        numberArray.push(entry.get(input));
      }

      return numberArray;
    }
}

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
