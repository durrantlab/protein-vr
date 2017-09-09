export class Shader {
    private _scene: any;
    public material: any = undefined;

    constructor(scene, BABYLON) {
        this.material = new BABYLON.StandardMaterial("mat", scene);
        this.material.backFaceCulling = false;
        this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.material.specularColor = new BABYLON.Color3(0, 0, 0);
        this.material.diffuseTexture = null;
        this.material.emissiveTexture = null; // videoTexture;
    }

    public setTextures(texture) {
        this.material.emissiveTexture = texture;
    }
}