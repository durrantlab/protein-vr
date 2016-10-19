import parent from "./ShaderParent";

enum AnimationType {
    None,
    RandomlyUndulateAlongNormals,
    Worm,
    WaveAlongVertical,
    WaveBobbing
}

class VertexShaderCode extends parent {

    public Animation: Animation;

    public animationType: AnimationType = AnimationType.None;

    constructor() {
        super();
        this.Animation = new Animation(this);
    }

    public getCode(): string {

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

        return `
        #ifdef GL_ES
        precision highp float;
        #endif

        // Notes:

        // "Attributes"" define properties of the vertex. Select the ones you want to
        // use.

        // "Uniforms"" variables are defined by the CPU. They don't change. They are
        // defined in the shader config.json file.

        // "Varying"" variables are created by the vertex shader (see below) and
        // passed to the fragment shader. They typically start with the letter v.

        // The 3d position of the vertex
        attribute vec3 position;

        // The normal vector
        attribute vec3 normal;

        // The 2d uv values
        attribute vec2 uv;

        // A matrix to project 3D coordinates in world to 2D
        // coordinates on screen
        uniform mat4 worldViewProjection;

        ${this.Animation.animationVars()}

        ${this.simplexNoiseVars()}

        // The 3d position
        varying vec3 vPosition;

        // The normal
        varying vec3 vNormal;

        // The uv value
        varying vec2 vUV;

        ${this.randomNumber()}

        ${this.simplexNoise()}

        void main(void) { // This is run for every vertex.
            // Get aniamted position (no different than position if there is no animation).
            ${this.Animation.getAnimation()}

            // It must at least return gl_Position, the 2D location of this 3D vertex
            // on the screen.
            gl_Position = worldViewProjection * vec4(v, 1.0);

            // Pass some variables to the fragment shader.
            // The 3d position of the vertex.
            vPosition = v; // position;

            // The normal of the vertex.
            vNormal = normal;

            // The uv value of the vertex.
            vUV = uv;
        }`;
    }

    public simplexNoiseVars() {
        if (!this.useSimplexNoise) {
            return '';
        }

        this.inputVarsNeeded.push("animationNoiseTurbulenceFactor");

        return `
            // If random noise is used, how noisy should it be?
            uniform float animationNoiseTurbulenceFactor;
        `;
    }
}

class Animation {
    public parent: VertexShaderCode;

    constructor(parent: VertexShaderCode) {
        this.parent = parent;
    }

    public getAnimation(): string {
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
    }

    public animationVars(): string {
        if (this.parent.animationType === AnimationType.None) {
            return "";
        }

        this.parent.inputVarsNeeded.push("time");
        this.parent.inputVarsNeeded.push("animationSpeed");
        this.parent.inputVarsNeeded.push("animationStrength");

        let code = `
            // You can also get the current time from the CPU. Good if you plan to animate
            // the vertices.
            uniform float time;
            uniform float animationSpeed;
            uniform float animationStrength;
        `;

        if (this.parent.animationType === AnimationType.WaveBobbing) {
            this.parent.inputVarsNeeded.push("animationOrigin");

            code += `
                uniform vec3 animationOrigin;
            `;
        }

        return code;
    }

    private noAnimation(): string {
        return `vec3 v = position;`;
    }

    private randomlyUndulateAlongNormals(): string {
        return this.animationTemplate(`
            float noiseHere = snoise(vec2(animationNoiseTurbulenceFactor) * position.xy);  // random seed tied to uv value.

            // pulsating
            v += animationStrength * normal * sin(noiseHere * realTime);
        `);
    }

    private wormAnimation(): string {
        return this.animationTemplate(`
            float noiseHere = snoise(vec2(animationNoiseTurbulenceFactor) * position.xy);  // random seed tied to uv value.

            // Worming
            v += animationStrength * sin(vec3(2.0) * position + vec3(realTime + noiseHere));
        `);
    }

    private waveAlongVerticalAnimation(): string {
        return this.animationTemplate(`
            // Along vertical only.
            v.y += animationStrength * (sin(realTime + v.x) + cos(realTime + v.z)); // sin(vec3(2.0) * position + vec3(realTime + noiseHere));
        `);
    }

    private waveBobbingAnimation(): string {
        return this.animationTemplate(`
            // Along vertical only.
            v.y += animationStrength * (sin(realTime + animationOrigin.x) + cos(realTime + animationOrigin.z));
        `);
    }

    private animationTemplate(equation: string): string {
        return `
            // Animate the vertex if you want. The vertex position is now
            // stored in v. I believe this is necessary because position is read
            // only.
            vec3 v = position;

            // Modify that position here. Notice that you can use position if
            // you're reading from it. Also noticed that time is in there.
            float realTime = 0.001 * animationSpeed * time;  // because it's passed in milliseconds.

            ${equation}
        `;
    }
}

export default VertexShaderCode;
export { AnimationType };