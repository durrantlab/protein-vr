#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUV;

uniform sampler2D textureSampler1;
uniform sampler2D textureSampler2;
uniform sampler2D textureSampler3;
uniform float dist1;
uniform float dist2;
uniform float dist3;

void main(void) {
    // vec4 texel0, texel1, texel2, resultColor;

    // vec4 texel0 = texture2D(textureSampler1, vUV);
    // vec4 texel1 = texture2D(textureSampler2, vUV);
    // vec4 texel2 = texture2D(textureSampler3, vUV);

    // vec4 resultColor;
    // resultColor.x = (texel0.x + texel1.x + texel2.x)/3.0;
    // resultColor.y = (texel0.y + texel1.y + texel2.y)/3.0;
    // resultColor.z = (texel0.z + texel1.z + texel2.z)/3.0;

    // float w1 = 0.333333;
    // float w2 = 0.333333;
    // float w3 = 0.333333;

    // Subtract all distances from largest distance.
    // float weight1 = (dist3 - dist1) / dist3;
    // float weight2 = (dist3 - dist2) / dist3;
    // float weight3 = (dist3 - dist3) / dist3;
    // float sum = weight1 + weight2 + weight3;
    // weight1 = weight1 / sum;
    // weight2 = weight2 / sum;
    // weight3 = weight3 / sum;

    float sum = dist1 + dist2 + dist3;
    float weight1 = 1.0 - dist1 / sum;
    float weight2 = 1.0 - dist2 / sum;
    float weight3 = 1.0 - dist3 / sum;
    sum = weight1 + weight2 + weight3;
    weight1 = weight1 / sum;
    weight2 = weight2 / sum;
    weight3 = weight3 / sum;

    // Normalize by largest distance.
    // weight1 = weight1 / weight3;
    // weight2 = weight2 / weight3;
    // // No need to normalize weight3


    vec4 resultColor = texture2D(textureSampler1, vUV) * weight1 + texture2D(textureSampler2, vUV) * weight2 + texture2D(textureSampler3, vUV) * weight3;

    gl_FragColor = resultColor; //mix(texel0, texel1, 0.5); // texel2.a);

    // gl_FragColor = texture2D(textureSampler1, vUV);
}