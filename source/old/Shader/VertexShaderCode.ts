import parent from "./ShaderParent";

class VertexShaderCode extends parent {
    /**
    The class for generating the vertex shader.
    */

    /**
    The associated Animation object.
    */
    public Animation: Animation;

    /**
    The type of vertex-shader animation.
    */
    public animationType: string = "None";

    constructor() {
        /**
        The constructor. super() calls the parents constructor to be called.
        */

        super();
        this.Animation = new Animation(this);
    }

    public getCode(): string {
        /**
        Get the vertex code.

        :returns: The code.

        :rtype: :any:`str`
        */

        switch (this.animationType) {
            case "None":
                this.useSimplexNoise = false;
                break;
            case "WaveAlongVertical":
                this.useSimplexNoise = false;
                break;
            case "WaveBobbing":
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

    public simplexNoiseVars(): string {
        /**
        Generate the code for simplex noise.

        :returns: The code.

        :rtype: :any:`str`
        */

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
    /**
    A class for controlling vertex animations.
    */

    /**
    The associated vertex shader object.
    */
    public parent: VertexShaderCode;

    constructor(parent: VertexShaderCode) {
        /**
        The constructor.

        :param VertexShaderCode parent:  The associated vertex shader code
                                class.
        */

        this.parent = parent;
    }

    public getAnimation(): string {
        /**
        Get the animation shader code.

        :returns: The code.

        :rtype: :any:`str`
        */

        switch (this.parent.animationType) {
            case "None":
                return this.noAnimation();
            case "RandomlyUndulateAlongNormals":
                return this.randomlyUndulateAlongNormals();
            case "Worm":
                return this.wormAnimation();
            case "WaveAlongVertical":
                return this.waveAlongVerticalAnimation();
            case "WaveBobbing":
                return this.waveBobbingAnimation();
        }
    }

    public animationVars(): string {
        /**
        Generate the shader code for the animation variables.

        :returns: The code.

        :rtype: :any:`str`
        */

        if (this.parent.animationType === "None") {
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

        if (this.parent.animationType === "WaveBobbing") {
            this.parent.inputVarsNeeded.push("animationOrigin");

            code += `
                uniform vec3 animationOrigin;
            `;
        }

        return code;
    }

    private noAnimation(): string {
        /**
        Code if there is no animation.

        :returns: The code.

        :rtype: :any:`str`
        */

        return `vec3 v = position;`;
    }

    private randomlyUndulateAlongNormals(): string {
        /**
        Generate the shader code for the randomly undulating normals animation.

        :returns: The code.

        :rtype: :any:`str`
        */

        return this.animationTemplate(`
            float noiseHere = snoise(vec2(animationNoiseTurbulenceFactor) * position.xy);  // random seed tied to uv value.

            // pulsating
            v += animationStrength * normal * sin(noiseHere * realTime);
        `);
    }

    private wormAnimation(): string {
        /**
        Generate the shader code for the worm animation.

        :returns: The code.

        :rtype: :any:`str`
        */

        return this.animationTemplate(`
            float noiseHere = snoise(vec2(animationNoiseTurbulenceFactor) * position.xy);  // random seed tied to uv value.

            // Worming
            v += animationStrength * sin(vec3(2.0) * position + vec3(realTime + noiseHere));
        `);
    }

    private waveAlongVerticalAnimation(): string {
        /**
        Generate the shader code for the wave along vertical animation.

        :returns: The code.

        :rtype: :any:`str`
        */

        return this.animationTemplate(`
            // Along vertical only.
            v.y += animationStrength * (sin(realTime + v.x) + cos(realTime + v.z)); // sin(vec3(2.0) * position + vec3(realTime + noiseHere));
        `);
    }

    private waveBobbingAnimation(): string {
        /**
        Generate the shader code for the wave bobbing animation.

        :returns: The code.

        :rtype: :any:`str`
        */

        return this.animationTemplate(`
            // Along vertical only.
            v.y += animationStrength * (sin(realTime + animationOrigin.x) + cos(realTime + animationOrigin.z));
        `);
    }

    private animationTemplate(equation: string): string {
        /**
        Generate the template code for the animation.

        :param str equation: The animation equation.

        :returns: The code.
        
        :rtype: :any:`str`
        */
        
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