var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ShaderParent"], function (require, exports, ShaderParent_1) {
    "use strict";
    var AnimationType;
    (function (AnimationType) {
        AnimationType[AnimationType["None"] = 0] = "None";
        AnimationType[AnimationType["RandomlyUndulateAlongNormals"] = 1] = "RandomlyUndulateAlongNormals";
        AnimationType[AnimationType["Worm"] = 2] = "Worm";
        AnimationType[AnimationType["WaveAlongVertical"] = 3] = "WaveAlongVertical";
        AnimationType[AnimationType["WaveBobbing"] = 4] = "WaveBobbing";
    })(AnimationType || (AnimationType = {}));
    exports.AnimationType = AnimationType;
    /**
     * The class for generating the vertex shader.
     */
    var VertexShaderCode = (function (_super) {
        __extends(VertexShaderCode, _super);
        /**
         * The constructor. super() calls the parents constructor to be called.
         */
        function VertexShaderCode() {
            _super.call(this);
            /**
             * The type of vertex-shader animation.
             */
            this.animationType = AnimationType.None;
            this.Animation = new Animation(this);
        }
        /**
         * Get the vertex code.
         * @return {string} The code.
         */
        VertexShaderCode.prototype.getCode = function () {
            switch (this.animationType) {
                case AnimationType.None:
                    this.useSimplexNoise = false;
                    break;
                case AnimationType.WaveAlongVertical:
                    this.useSimplexNoise = false;
                    break;
                case AnimationType.WaveBobbing:
                    this.useSimplexNoise = false;
                    break;
                default:
                    this.useSimplexNoise = true;
            }
            return "\n        #ifdef GL_ES\n        precision highp float;\n        #endif\n\n        // Notes:\n\n        // \"Attributes\"\" define properties of the vertex. Select the ones you want to\n        // use.\n\n        // \"Uniforms\"\" variables are defined by the CPU. They don't change. They are\n        // defined in the shader config.json file.\n\n        // \"Varying\"\" variables are created by the vertex shader (see below) and\n        // passed to the fragment shader. They typically start with the letter v.\n\n        // The 3d position of the vertex\n        attribute vec3 position;\n\n        // The normal vector\n        attribute vec3 normal;\n\n        // The 2d uv values\n        attribute vec2 uv;\n\n        // A matrix to project 3D coordinates in world to 2D\n        // coordinates on screen\n        uniform mat4 worldViewProjection;\n\n        " + this.Animation.animationVars() + "\n\n        " + this.simplexNoiseVars() + "\n\n        // The 3d position\n        varying vec3 vPosition;\n\n        // The normal\n        varying vec3 vNormal;\n\n        // The uv value\n        varying vec2 vUV;\n\n        " + this.randomNumber() + "\n\n        " + this.simplexNoise() + "\n\n        void main(void) { // This is run for every vertex.\n            // Get aniamted position (no different than position if there is no animation).\n            " + this.Animation.getAnimation() + "\n\n            // It must at least return gl_Position, the 2D location of this 3D vertex\n            // on the screen.\n            gl_Position = worldViewProjection * vec4(v, 1.0);\n\n            // Pass some variables to the fragment shader.\n            // The 3d position of the vertex.\n            vPosition = v; // position;\n\n            // The normal of the vertex.\n            vNormal = normal;\n\n            // The uv value of the vertex.\n            vUV = uv;\n        }";
        };
        /**
         * Generate the code for simplex noise.
         * @return {string} The code.
         */
        VertexShaderCode.prototype.simplexNoiseVars = function () {
            if (!this.useSimplexNoise) {
                return '';
            }
            this.inputVarsNeeded.push("animationNoiseTurbulenceFactor");
            return "\n            // If random noise is used, how noisy should it be?\n            uniform float animationNoiseTurbulenceFactor;\n        ";
        };
        return VertexShaderCode;
    }(ShaderParent_1.default));
    /**
     * A class for controlling vertex animations.
     */
    var Animation = (function () {
        /**
         * The constructor.
         * @param  {VertexShaderCode}  parent  The associated vertex shader code
         *                                         class.
         */
        function Animation(parent) {
            this.parent = parent;
        }
        /**
         * Get the animation shader code.
         * @return {string} The code.
         */
        Animation.prototype.getAnimation = function () {
            switch (this.parent.animationType) {
                case AnimationType.None:
                    return this.noAnimation();
                case AnimationType.RandomlyUndulateAlongNormals:
                    return this.randomlyUndulateAlongNormals();
                case AnimationType.Worm:
                    return this.wormAnimation();
                case AnimationType.WaveAlongVertical:
                    return this.waveAlongVerticalAnimation();
                case AnimationType.WaveBobbing:
                    return this.waveBobbingAnimation();
            }
        };
        /**
         * Generate the shader code for the animation variables.
         * @return {string} The code.
         */
        Animation.prototype.animationVars = function () {
            if (this.parent.animationType === AnimationType.None) {
                return "";
            }
            this.parent.inputVarsNeeded.push("time");
            this.parent.inputVarsNeeded.push("animationSpeed");
            this.parent.inputVarsNeeded.push("animationStrength");
            var code = "\n            // You can also get the current time from the CPU. Good if you plan to animate\n            // the vertices.\n            uniform float time;\n            uniform float animationSpeed;\n            uniform float animationStrength;\n        ";
            if (this.parent.animationType === AnimationType.WaveBobbing) {
                this.parent.inputVarsNeeded.push("animationOrigin");
                code += "\n                uniform vec3 animationOrigin;\n            ";
            }
            return code;
        };
        /**
         * Code if there is no animation.
         * @return {string} The code.
         */
        Animation.prototype.noAnimation = function () {
            return "vec3 v = position;";
        };
        /**
         * Generate the shader code for the randomly undulating normals animation.
         * @return {string} The code.
         */
        Animation.prototype.randomlyUndulateAlongNormals = function () {
            return this.animationTemplate("\n            float noiseHere = snoise(vec2(animationNoiseTurbulenceFactor) * position.xy);  // random seed tied to uv value.\n\n            // pulsating\n            v += animationStrength * normal * sin(noiseHere * realTime);\n        ");
        };
        /**
         * Generate the shader code for the worm animation.
         * @return {string} The code.
         */
        Animation.prototype.wormAnimation = function () {
            return this.animationTemplate("\n            float noiseHere = snoise(vec2(animationNoiseTurbulenceFactor) * position.xy);  // random seed tied to uv value.\n\n            // Worming\n            v += animationStrength * sin(vec3(2.0) * position + vec3(realTime + noiseHere));\n        ");
        };
        /**
         * Generate the shader code for the wave along vertical animation.
         * @return {string} The code.
         */
        Animation.prototype.waveAlongVerticalAnimation = function () {
            return this.animationTemplate("\n            // Along vertical only.\n            v.y += animationStrength * (sin(realTime + v.x) + cos(realTime + v.z)); // sin(vec3(2.0) * position + vec3(realTime + noiseHere));\n        ");
        };
        /**
         * Generate the shader code for the wave bobbing animation.
         * @return {string} The code.
         */
        Animation.prototype.waveBobbingAnimation = function () {
            return this.animationTemplate("\n            // Along vertical only.\n            v.y += animationStrength * (sin(realTime + animationOrigin.x) + cos(realTime + animationOrigin.z));\n        ");
        };
        /**
         * Generate the template code for the animation.
         * @param  {string} equation The animation equation.
         * @return {string}          The code.
         */
        Animation.prototype.animationTemplate = function (equation) {
            return "\n            // Animate the vertex if you want. The vertex position is now\n            // stored in v. I believe this is necessary because position is read\n            // only.\n            vec3 v = position;\n\n            // Modify that position here. Notice that you can use position if\n            // you're reading from it. Also noticed that time is in there.\n            float realTime = 0.001 * animationSpeed * time;  // because it's passed in milliseconds.\n\n            " + equation + "\n        ";
        };
        return Animation;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = VertexShaderCode;
});
