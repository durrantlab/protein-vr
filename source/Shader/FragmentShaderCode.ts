import parent from "./ShaderParent";

enum TextureBlendingType {
    ConstantBlend,
    SimplexBlend,
    HeightBasedBlend
}

class FragmentShaderCode extends parent {
    public _hasGlossyEffect: boolean = true;
    public _hasDiffuseEffect: boolean = true;
    public _isShadeless: boolean = false;
    public _requiresLightAndCameraPos: boolean = true;
    public numTextures: number = 1;
    public textureBlendingType: TextureBlendingType = TextureBlendingType.ConstantBlend;
    public useShadowMap: boolean = false;

    public Material: Material;
    public Texture: Texture;

    constructor() {
        super();
        this.Material = new Material(this);
        this.Texture = new Texture(this);
    }

    set hasGlossyEffect(val: boolean) {
        this._hasGlossyEffect = val;
        this.Material.updateDependentVars();
    }

    set hasDiffuseEffect(val: boolean) {
        this._hasDiffuseEffect = val;
        this.Material.updateDependentVars();
    }

    set isShadeless(val: boolean) {
        this._isShadeless = val;
        this.Material.updateDependentVars();
    }

    public getCode(): string {
        // Figure out if you need to include simplex.
        let texBT: TextureBlendingType = this.textureBlendingType;
        if (texBT === TextureBlendingType.ConstantBlend) {
            this.useSimplexNoise = false;
        } else if (texBT === TextureBlendingType.SimplexBlend) {
            this.useSimplexNoise = true;
        } else if (texBT === TextureBlendingType.HeightBasedBlend) {
            this.useSimplexNoise = true;
        }

        this.Material.updateDependentVars();

        return `
            #ifdef GL_ES
            precision highp float;
            #endif

            /********** Variables **********/
            // Notes:

            // "uniform"" variables are specified by the CPU and don't change over time.
            // They are defined in the shader config.json file. "varying"" variables are
            // those that were set by the vertex shader.

            ${this.Texture.getTextureVars()}
            ${this.Texture.getHeightBasedBlendingVars()}
            ${this.Texture.shadowMapVars()}
            ${this.simplexNoiseVars()}

            // Get a matrix to change 3D positions into world positions. (?)
            uniform mat4 world;

            ${this.Material.lightAndCameraVars()}
            ${this.Material.glossyVars()}
            ${this.Material.diffuseVars()}

            // The 3d position
            varying vec3 vPosition;

            // The normal
            varying vec3 vNormal;

            // The uv value
            varying vec2 vUV;

            // Set some global variables used in various functions
            vec3 vPositionW;
            vec3 vNormalW;

            ${this.randomNumber()}
            ${this.simplexNoise()}
            
            /********** The main function. **********/

            // In the fragment shader, the main code is executed for each pixel (not
            // just each vector).
            void main(void) {
                // At the very least, this must return gl_FragColor (the color of
                // the pixel)

                // Get the color
                ${this.Texture.getTextureCode()}
                ${this.Texture.getShadowMapCode()}

                // Modify that color according to the material.
                ${this.Material.getMaterialCode()}
            }`;

    }

    public simplexNoiseVars() {
        if (!this.useSimplexNoise) {
            return '';
        }

        this.inputVarsNeeded.push("noiseTurbulence");
        this.inputVarsNeeded.push("noiseAmplitude");

        return `
            // If random noise is used, how noisy should it be?
            uniform float noiseTurbulence;
            uniform float noiseAmplitude;
        `;
    }
}

class Material {
    private parent: FragmentShaderCode;

    constructor(parent: FragmentShaderCode) {
        this.parent = parent;
    }

    public lightAndCameraVars() {
        if (!this.parent._requiresLightAndCameraPos) {
            return "";
        }

        this.parent.inputVarsNeeded.push("cameraPosition");
        this.parent.inputVarsNeeded.push("lightPosition");

        return `
            // Good to know the camera position for a glossy effect
            uniform vec3 cameraPosition;
            uniform vec3 lightPosition;
        `;
    }

    public glossyVars() {
        if (!this.parent._hasGlossyEffect) {
            return "";
        }

        this.parent.inputVarsNeeded.push("specularVal");

        return `
            // Mateirals properties
            uniform float specularVal;
        `;
    }

    public diffuseVars() {
        if (!this.parent._hasDiffuseEffect) {
            return "";
        }

        this.parent.inputVarsNeeded.push("diffuseVal");

        return `
            // Mateirals properties
            uniform float diffuseVal;
        `;
    }


    public updateDependentVars() {
        if (this.parent._isShadeless) {
            // If shadeless, no glossy, diffuse, light and camera position.
            this.parent._hasGlossyEffect = false;
            this.parent._hasDiffuseEffect = false;
            this.parent._requiresLightAndCameraPos = false;
        } else if ((this.parent._hasDiffuseEffect) || (this.parent._hasGlossyEffect)) {
            // Either diffuse or specular, either ay...
            this.parent._isShadeless = false;
            this.parent._requiresLightAndCameraPos = true;
        } else {
            // Neither diffuse not specular.
            this.parent._isShadeless = true;
            this.parent._requiresLightAndCameraPos = false;
        }
    }

    public getMaterialCode(): string {
        let code: string = '';

        if ((this.parent._hasGlossyEffect) || (this.parent._hasDiffuseEffect)) {
            code += `
                vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));  // World values
                vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
                vec3 lightVectorW = normalize(lightPosition - vPositionW);  // The position of a light and other related variables.
            `;
        }

        if (this.parent._hasDiffuseEffect) {
            code += `
                // The diffuse component depends only on the direction of the light
                // and the normal of the mesh.

                float diffuseComponent = diffuseVal * max(0., dot(vNormalW, lightVectorW));
            `;
        }

        if (this.parent._hasGlossyEffect) {
            code += `
                // To calculate the specular component, you need to know what
                // direction you're viewing the object from, the direction of the
                // light hitting the object, and the normal of the object at that
                // location.

                vec3 viewDirectionW = normalize(cameraPosition - vPositionW);  // The direction

                // Factor ranges from 0 to 1, 0 = no specularity, 1 = full
                // specularity.

                vec3 angleW = normalize(viewDirectionW + lightVectorW);
                float specComp = max(0., dot(vNormalW, angleW));
                specComp = pow(specComp, max(1., 64.)) * 2.;

                float specularComponent = specularVal * specComp;
            `;
        }

        code += "gl_FragColor = vec4(color";

        if (this.parent._hasDiffuseEffect) {
            code += " * diffuseComponent";
        }

        if (this.parent._hasGlossyEffect) {
            code += " + vec3(specularComponent)"
        }

        code += ", 1.);";

        return code;
    }
}

class Texture {
    public parent: FragmentShaderCode;

    constructor(parent: FragmentShaderCode) {
        this.parent = parent;
    }

    public getTextureVars(): string {
        let numTexs: number = this.parent.numTextures;
        let useTextureBlendWeights: boolean = (this.parent.textureBlendingType !== TextureBlendingType.HeightBasedBlend);
        if (numTexs <= 1) {
            // Regardless of the texture mixing method, if there's only one
            // texture no weights are needed.
            useTextureBlendWeights = false;
        }

        let code: string = `
            // sampled2Ds are used to read texture colors.
        `;

        for (let i = 0; i < numTexs; i++) {
            let indxStr: string = (i + 1).toString();
            code += `
                uniform sampler2D textureSampler${indxStr};
                uniform float textureRepeat${indxStr};
            `;

            this.parent.inputVarsNeeded.push("textureSampler" + indxStr);
            this.parent.inputVarsNeeded.push("textureRepeat" + indxStr);

            if (useTextureBlendWeights) {
                code += `
                    uniform float textureBlendWeight${indxStr}; 
                `;

                this.parent.inputVarsNeeded.push("textureBlendWeight" + indxStr);
            }
        }

        return code;
    }

    public getHeightBasedBlendingVars(): string {
        if (this.parent.textureBlendingType !== TextureBlendingType.HeightBasedBlend) {
            return "";
        }

        let code = `
            // If based on the y value (height)...
            uniform float minHeight;
            uniform float maxHeight;
        `;

        this.parent.inputVarsNeeded.push("minHeight");
        this.parent.inputVarsNeeded.push("maxHeight");

        if (this.parent.numTextures >= 3) {
            code += `
                uniform float transitionHeight; // for when there are three textures. For two textures,
            `;
    
            this.parent.inputVarsNeeded.push("transitionHeight");
        }

        return code;
    }

    public shadowMapVars() {
        if (!this.parent.useShadowMap) {
            return "";
        }

        this.parent.inputVarsNeeded.push("shadowMapSampler");

        return `
            uniform sampler2D shadowMapSampler;  
        `;
    }

    public getTextureCode(): string {
        let numTexs: number = this.parent.numTextures;
        let texBT: TextureBlendingType = this.parent.textureBlendingType;

        if (numTexs <= 1) {
            // If there's only 1 texture, this is easy. Regardless of the
            // mixing method, just return the color.
            return `
                vec3 color = texture2D(textureSampler1, vec2(textureRepeat1) * vUV).rgb;
            `
        }

        // So there are two or three textures

        let code: string = "";
        
        if (texBT === TextureBlendingType.ConstantBlend) {
            code += this.getConstantBlendWeights();
        } else if (texBT === TextureBlendingType.SimplexBlend) {
            code += this.getSimplexBlendWeights();
        } else if (texBT === TextureBlendingType.HeightBasedBlend) {
            code += this.getHeightBasedBlendWeights();
        }

        code += "\nvec3 color = ";

        for (let i = 0; i < numTexs; i++) {
            if (i > 0) { code += " + "; }
            let indxStr: string = (i + 1).toString();
            code += `modifiedWeights[${i.toString()}] * texture2D(textureSampler${indxStr}, vec2(textureRepeat${indxStr}) * vUV).rgb`
        }

        code += ";\n";
        return code;
    }

    public getShadowMapCode() {
        if (!this.parent.useShadowMap) {
            return "";
        }

        return `
            color = texture2D(shadowMapSampler, vUV).r * color;
        `;
    }
    
    private getConstantBlendWeights(): string {
        let numTexs: number = this.parent.numTextures;
        let N: string = numTexs.toString();

        let code = `
            // Normalize the weights
            vec${N} weights = vec${N}(`;
            
        for (let i = 0; i < numTexs; i++) {
            if (i > 0) { code += ", "; }
            code += "textureBlendWeight" + (i + 1).toString()
            this.parent.inputVarsNeeded.push("textureBlendWeight" + (i + 1).toString());
        }

        code += `);
            vec${N} modifiedWeights = normalize(weights); 
        `;

        return code;
    }

    private getSimplexBlendWeights(): string {
        let numTexs: number = this.parent.numTextures;

        let code = `
            // Adjust the weights per the simplex noise function.
        `;

        switch (numTexs) {
            case 2:
                return `
                    float randFac = clamp(snoise(noiseTurbulence * vUV), 0.0, 1.0);
                    vec2 weights = vec2(randFac, 1. - randFac);
                    weights = clamp(weights, 0.0, 1.0);
                    vec2 modifiedWeights = normalize(weights);
                `;
            case 3:
                return `
                    float randFac1 = snoise(noiseTurbulence * vUV);
                    float randFac2 = snoise(-noiseTurbulence * vUV);
                    vec3 weights = vec3(randFac1, randFac2, 0.66 * (1. - randFac2));
                    weights = clamp(weights, 0.0, 1.0);
                    vec3 modifiedWeights = normalize(weights);
                `;
        }
    }

    private getHeightBasedBlendWeights(): string {
        let numTexs: number = this.parent.numTextures;
        let N: string = numTexs.toString();

        let code = `
            // Adjust the weights based on the height of the mesh.

            float height = vPosition.z;
        `;

        switch (numTexs) {
            case 2:
                code += `
                    float w1 = smoothstep(minHeight, maxHeight, height);
                    vec2 weights = vec2(w1, 1.0 - w1);
                `;
                break;
            case 3:
                code += `
                    float w1 = smoothstep(transitionHeight, maxHeight, height);
                    float w2 = smoothstep(minHeight, transitionHeight, height) - smoothstep(transitionHeight, maxHeight, height);
                    float w3 = 1.0 - smoothstep(minHeight, transitionHeight, height);
                    vec3 weights = vec3(w1, w2, w3);
                `;
                break;
        }

        code += `
            // Now add random noise to that
            float noise = noiseAmplitude * (snoise(noiseTurbulence * vUV) - 0.5); // So goes from -0.5 to +0.5
            weights = clamp(weights + vec${N}(noise), 0.15, 1.0);
            vec${N} modifiedWeights = normalize(weights);
        `;

        return code;
    }

}

export default FragmentShaderCode;
export { TextureBlendingType }