var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ShaderParent"], function (require, exports, ShaderParent_1) {
    "use strict";
    var TextureBlendingType;
    (function (TextureBlendingType) {
        TextureBlendingType[TextureBlendingType["ConstantBlend"] = 0] = "ConstantBlend";
        TextureBlendingType[TextureBlendingType["SimplexBlend"] = 1] = "SimplexBlend";
        TextureBlendingType[TextureBlendingType["HeightBasedBlend"] = 2] = "HeightBasedBlend";
    })(TextureBlendingType || (TextureBlendingType = {}));
    exports.TextureBlendingType = TextureBlendingType;
    /**
     * A class for generating a custom fragment shader.
     */
    var FragmentShaderCode = (function (_super) {
        __extends(FragmentShaderCode, _super);
        /**
         * The constructor. super() calls the parent constructor.
         */
        function FragmentShaderCode() {
            _super.call(this);
            /**
             * Whether or not this shader has a glossy effect.
             */
            this._hasGlossyEffect = true;
            /**
             * Whether or not this shader has a diffuse effect.
             */
            this._hasDiffuseEffect = true;
            /**
             * Whether or not this shader is shadeless.
             */
            this._isShadeless = false;
            /**
             * Whether or not this shader requires info about the light and camera
             * position.
             */
            this._requiresLightAndCameraPos = true;
            /**
             * Whether or not this shader can be transparent.
             */
            this._hasTransparency = false;
            /**
             * The number of textures associated with this shader.
             */
            this.numTextures = 1;
            /**
             * How to blend the textures of this shader.
             */
            this.textureBlendingType = TextureBlendingType.ConstantBlend;
            /**
             * Whether or not to use a shadow map.
             */
            this.useShadowMap = false;
            this.Material = new Material(this);
            this.Texture = new Texture(this);
        }
        Object.defineProperty(FragmentShaderCode.prototype, "hasGlossyEffect", {
            /**
             * Whether or not this fragment shader has a glossy effect on the
             *     material.
             * @param  {boolean} val  true if it does, false otherwise.
             */
            set: function (val) {
                this._hasGlossyEffect = val;
                this.Material.updateDependentVars();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FragmentShaderCode.prototype, "hasDiffuseEffect", {
            /**
             * Whether or not this fragment shader has a diffuse effect on the
             *     material.
             * @param  {boolean} val  true if it does, false otherwise.
             */
            set: function (val) {
                this._hasDiffuseEffect = val;
                this.Material.updateDependentVars();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FragmentShaderCode.prototype, "isShadeless", {
            /**
             * Whether or not this fragment shader produces a shadeless material.
             * @param  {boolean} val  true if it is shadeless, false otherwise.
             */
            set: function (val) {
                this._isShadeless = val;
                this.Material.updateDependentVars();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FragmentShaderCode.prototype, "hasTransparency", {
            /**
             * Whether or not this fragment shader has a transparent material.
             * @param  {boolean} val  true if it does, false otherwise.
             */
            set: function (val) {
                this._hasTransparency = val;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get the code for this fragment shader.
         * @return {string} The code.
         */
        FragmentShaderCode.prototype.getCode = function () {
            // Figure out if you need to include simplex.
            var texBT = this.textureBlendingType;
            if (texBT === TextureBlendingType.ConstantBlend) {
                this.useSimplexNoise = false;
            }
            else if (texBT === TextureBlendingType.SimplexBlend) {
                this.useSimplexNoise = true;
            }
            else if (texBT === TextureBlendingType.HeightBasedBlend) {
                this.useSimplexNoise = true;
            }
            this.Material.updateDependentVars();
            return "\n            #ifdef GL_ES\n            precision highp float;\n            #endif\n\n            /********** Variables **********/\n            // Notes:\n\n            // \"uniform\"\" variables are specified by the CPU and don't change over time.\n            // They are defined in the shader config.json file. \"varying\"\" variables are\n            // those that were set by the vertex shader.\n\n            " + this.Texture.getTextureVars() + "\n            " + this.Texture.getHeightBasedBlendingVars() + "\n            " + this.Texture.shadowMapVars() + "\n            " + this.simplexNoiseVars() + "\n\n            // Get a matrix to change 3D positions into world positions. (?)\n            uniform mat4 world;\n\n            " + this.Material.lightAndCameraVars() + "\n            " + this.Material.glossyVars() + "\n            " + this.Material.diffuseVars() + "\n            " + this.Material.transparencyVars() + "\n\n            // The 3d position\n            varying vec3 vPosition;\n\n            // The normal\n            varying vec3 vNormal;\n\n            // The uv value\n            varying vec2 vUV;\n\n            // Set some global variables used in various functions\n            vec3 vPositionW;\n            vec3 vNormalW;\n\n            " + this.randomNumber() + "\n            " + this.simplexNoise() + "\n\n            /********** The main function. **********/\n\n            // In the fragment shader, the main code is executed for each pixel (not\n            // just each vector).\n            void main(void) {\n                // At the very least, this must return gl_FragColor (the color of\n                // the pixel)\n\n                // Get the color\n                " + this.Texture.getTextureCode() + "\n                " + this.Texture.getShadowMapCode() + "\n\n                // Modify that color according to the material.\n                " + this.Material.getMaterialCode() + "\n            }";
        };
        /**
         * Get the shader code required for the simplex-noise variables.
         * @return {string} The code.
         */
        FragmentShaderCode.prototype.simplexNoiseVars = function () {
            if (!this.useSimplexNoise) {
                return '';
            }
            this.inputVarsNeeded.push("noiseTurbulence");
            this.inputVarsNeeded.push("noiseAmplitude");
            return "\n            // If random noise is used, how noisy should it be?\n            uniform float noiseTurbulence;\n            uniform float noiseAmplitude;\n        ";
        };
        return FragmentShaderCode;
    }(ShaderParent_1.default));
    /**
     * This class represents a material.
     */
    var Material = (function () {
        /**
         * The constructor.
         * @param  {FragmentShaderCode} parent  Save the associated
         *                                          FragmentShaderCode object.
         */
        function Material(parent) {
            this.parent = parent;
        }
        /**
         * Return the code for variables associated with light and camera
         *     locations.
         * @return {string} The code.
         */
        Material.prototype.lightAndCameraVars = function () {
            if (!this.parent._requiresLightAndCameraPos) {
                return "";
            }
            this.parent.inputVarsNeeded.push("cameraPosition");
            this.parent.inputVarsNeeded.push("lightPosition");
            return "\n            // Good to know the camera position for a glossy effect\n            uniform vec3 cameraPosition;\n            uniform vec3 lightPosition;\n        ";
        };
        /**
         * Return the code for variables associated with glossy materials.
         * @return {string} The code.
         */
        Material.prototype.glossyVars = function () {
            if (!this.parent._hasGlossyEffect) {
                return "";
            }
            this.parent.inputVarsNeeded.push("specularVal");
            return "\n            // Mateirals properties\n            uniform float specularVal;\n        ";
        };
        /**
         * Return the code for variables associated with diffuse materials.
         * @return {string} The code.
         */
        Material.prototype.diffuseVars = function () {
            if (!this.parent._hasDiffuseEffect) {
                return "";
            }
            this.parent.inputVarsNeeded.push("diffuseVal");
            return "\n            // Mateirals properties\n            uniform float diffuseVal;\n        ";
        };
        /**
         * Return the code for variables associated with transparent materials.
         * @return {string} The code.
         */
        Material.prototype.transparencyVars = function () {
            if (!this.parent._hasTransparency) {
                return "";
            }
            this.parent.inputVarsNeeded.push("alpha");
            return "\n            // Transparency properties\n            uniform float alpha;\n        ";
        };
        /**
         * A function to make sure different class variables are mutually
         * compatible.
         */
        Material.prototype.updateDependentVars = function () {
            if (this.parent._isShadeless) {
                // If shadeless, no glossy, diffuse, light and camera position.
                this.parent._hasGlossyEffect = false;
                this.parent._hasDiffuseEffect = false;
                this.parent._requiresLightAndCameraPos = false;
            }
            else if ((this.parent._hasDiffuseEffect) || (this.parent._hasGlossyEffect)) {
                // Either diffuse or specular, either ay...
                this.parent._isShadeless = false;
                this.parent._requiresLightAndCameraPos = true;
            }
            else {
                // Neither diffuse not specular.
                this.parent._isShadeless = true;
                this.parent._requiresLightAndCameraPos = false;
            }
        };
        /**
         * Get the code for the material.
         * @return {string} The code.
         */
        Material.prototype.getMaterialCode = function () {
            var code = '';
            if ((this.parent._hasGlossyEffect) || (this.parent._hasDiffuseEffect)) {
                code += "\n                vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));  // World values\n                vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));\n                vec3 lightVectorW = normalize(lightPosition - vPositionW);  // The position of a light and other related variables.\n            ";
            }
            if (this.parent._hasDiffuseEffect) {
                code += "\n                // The diffuse component depends only on the direction of the light\n                // and the normal of the mesh.\n\n                float diffuseComponent = diffuseVal * max(0., dot(vNormalW, lightVectorW));\n            ";
            }
            if (this.parent._hasGlossyEffect) {
                code += "\n                // To calculate the specular component, you need to know what\n                // direction you're viewing the object from, the direction of the\n                // light hitting the object, and the normal of the object at that\n                // location.\n\n                vec3 viewDirectionW = normalize(cameraPosition - vPositionW);  // The direction\n\n                // Factor ranges from 0 to 1, 0 = no specularity, 1 = full\n                // specularity.\n\n                vec3 angleW = normalize(viewDirectionW + lightVectorW);\n                float specComp = max(0., dot(vNormalW, angleW));\n                specComp = pow(specComp, max(1., 64.)) * 2.;\n\n                float specularComponent = specularVal * specComp;\n            ";
            }
            code += "gl_FragColor = vec4(color";
            if (this.parent._hasDiffuseEffect) {
                code += " * diffuseComponent";
            }
            if (this.parent._hasGlossyEffect) {
                code += " + vec3(specularComponent)";
            }
            if (this.parent._hasTransparency) {
                code += ", alpha);";
            }
            else {
                code += ", 1.);";
            }
            return code;
        };
        return Material;
    }());
    /**
     * A class describing a texture.
     */
    var Texture = (function () {
        /**
         * The constructor.
         * @param  {FragmentShaderCode} parent  Save the associated
         *                                          FragmentShaderCode object.
         */
        function Texture(parent) {
            this.parent = parent;
        }
        /**
         * Get the code for the texture variables.
         * @return {string} The code.
         */
        Texture.prototype.getTextureVars = function () {
            var numTexs = this.parent.numTextures;
            var useTextureBlendWeights = (this.parent.textureBlendingType !== TextureBlendingType.HeightBasedBlend);
            if (numTexs <= 1) {
                // Regardless of the texture mixing method, if there's only one
                // texture no weights are needed.
                useTextureBlendWeights = false;
            }
            var code = "\n            // sampled2Ds are used to read texture colors.\n        ";
            for (var i = 0; i < numTexs; i++) {
                var indxStr = (i + 1).toString();
                code += "\n                uniform sampler2D textureSampler" + indxStr + ";\n                uniform float textureRepeat" + indxStr + ";\n            ";
                this.parent.inputVarsNeeded.push("textureSampler" + indxStr);
                this.parent.inputVarsNeeded.push("textureRepeat" + indxStr);
                if (useTextureBlendWeights) {
                    code += "\n                    uniform float textureBlendWeight" + indxStr + ";\n                ";
                    this.parent.inputVarsNeeded.push("textureBlendWeight" + indxStr);
                }
            }
            return code;
        };
        /**
         * Get the code required if the texture changes according to height. Not
         *     yet implemented.
         * @return {string} The code.
         */
        Texture.prototype.getHeightBasedBlendingVars = function () {
            if (this.parent.textureBlendingType !== TextureBlendingType.HeightBasedBlend) {
                return "";
            }
            var code = "\n            // If based on the y value (height)...\n            uniform float minHeight;\n            uniform float maxHeight;\n        ";
            this.parent.inputVarsNeeded.push("minHeight");
            this.parent.inputVarsNeeded.push("maxHeight");
            if (this.parent.numTextures >= 3) {
                code += "\n                uniform float transitionHeight; // for when there are three textures. For two textures,\n            ";
                this.parent.inputVarsNeeded.push("transitionHeight");
            }
            return code;
        };
        /**
         * Get the code to deal with shadow maps.
         * @return {string} The code.
         */
        Texture.prototype.shadowMapVars = function () {
            if (!this.parent.useShadowMap) {
                return "";
            }
            this.parent.inputVarsNeeded.push("shadowMapSampler");
            return "\n            uniform sampler2D shadowMapSampler;\n        ";
        };
        /**
         * Get the overall code associated with the texture.
         * @return {string} The code.
         */
        Texture.prototype.getTextureCode = function () {
            var numTexs = this.parent.numTextures;
            var texBT = this.parent.textureBlendingType;
            if (numTexs <= 1) {
                // If there's only 1 texture, this is easy. Regardless of the
                // mixing method, just return the color.
                return "\n                vec3 color = texture2D(textureSampler1, vec2(textureRepeat1) * vUV).rgb;\n            ";
            }
            // So there are two or three textures
            var code = "";
            if (texBT === TextureBlendingType.ConstantBlend) {
                code += this.getConstantBlendWeights();
            }
            else if (texBT === TextureBlendingType.SimplexBlend) {
                code += this.getSimplexBlendWeights();
            }
            else if (texBT === TextureBlendingType.HeightBasedBlend) {
                code += this.getHeightBasedBlendWeights();
            }
            code += "\nvec3 color = ";
            for (var i = 0; i < numTexs; i++) {
                if (i > 0) {
                    code += " + ";
                }
                var indxStr = (i + 1).toString();
                code += "modifiedWeights[" + i.toString() + "] * texture2D(textureSampler" + indxStr + ", vec2(textureRepeat" + indxStr + ") * vUV).rgb";
            }
            code += ";\n";
            return code;
        };
        /**
         * Get code required for the shadow map.
         * @return {string} The code.
         */
        Texture.prototype.getShadowMapCode = function () {
            if (!this.parent.useShadowMap) {
                return "";
            }
            return "\n            color = texture2D(shadowMapSampler, vUV).r * color;\n        ";
        };
        /**
         * Get the code required if you're going to blend the textures evenly.
         * @return {string} The code.
         */
        Texture.prototype.getConstantBlendWeights = function () {
            var numTexs = this.parent.numTextures;
            var N = numTexs.toString();
            var code = "\n            // Normalize the weights\n            vec" + N + " weights = vec" + N + "(";
            for (var i = 0; i < numTexs; i++) {
                if (i > 0) {
                    code += ", ";
                }
                code += "textureBlendWeight" + (i + 1).toString();
                this.parent.inputVarsNeeded.push("textureBlendWeight" + (i + 1).toString());
            }
            code += ");\n            vec" + N + " modifiedWeights = normalize(weights);\n        ";
            return code;
        };
        /**
         * Get the code for blending textures according to simplex-noise weights.
         * @return {string} The code.
         */
        Texture.prototype.getSimplexBlendWeights = function () {
            var numTexs = this.parent.numTextures;
            var code = "\n            // Adjust the weights per the simplex noise function.\n        ";
            switch (numTexs) {
                case 2:
                    return "\n                    float randFac = clamp(snoise(noiseTurbulence * vUV), 0.0, 1.0);\n                    vec2 weights = vec2(randFac, 1. - randFac);\n                    weights = clamp(weights, 0.0, 1.0);\n                    vec2 modifiedWeights = normalize(weights);\n                ";
                case 3:
                    return "\n                    float randFac1 = snoise(noiseTurbulence * vUV);\n                    float randFac2 = snoise(-noiseTurbulence * vUV);\n                    vec3 weights = vec3(randFac1, randFac2, 0.66 * (1. - randFac2));\n                    weights = clamp(weights, 0.0, 1.0);\n                    vec3 modifiedWeights = normalize(weights);\n                ";
            }
        };
        /**
         * Get the code to blend textures by height.
         * @return {string} The code.
         */
        Texture.prototype.getHeightBasedBlendWeights = function () {
            var numTexs = this.parent.numTextures;
            var N = numTexs.toString();
            var code = "\n            // Adjust the weights based on the height of the mesh.\n\n            float height = vPosition.z;\n        ";
            switch (numTexs) {
                case 2:
                    code += "\n                    float w1 = smoothstep(minHeight, maxHeight, height);\n                    vec2 weights = vec2(w1, 1.0 - w1);\n                ";
                    break;
                case 3:
                    code += "\n                    float w1 = smoothstep(transitionHeight, maxHeight, height);\n                    float w2 = smoothstep(minHeight, transitionHeight, height) - smoothstep(transitionHeight, maxHeight, height);\n                    float w3 = 1.0 - smoothstep(minHeight, transitionHeight, height);\n                    vec3 weights = vec3(w1, w2, w3);\n                ";
                    break;
            }
            code += "\n            // Now add random noise to that\n            float noise = noiseAmplitude * (snoise(noiseTurbulence * vUV) - 0.5); // So goes from -0.5 to +0.5\n            weights = clamp(weights + vec" + N + "(noise), 0.15, 1.0);\n            vec" + N + " modifiedWeights = normalize(weights);\n        ";
            return code;
        };
        return Texture;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FragmentShaderCode;
});
