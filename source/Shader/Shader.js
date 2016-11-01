define(["require", "exports", "./VertexShaderCode", "./FragmentShaderCode", "../Core/Core", '../Core/RenderLoop', "../CameraChar"], function (require, exports, VertexShaderCode_1, FragmentShaderCode_1, Core_1, RenderLoop_1, CameraChar_1) {
    "use strict";
    var Shaders;
    (function (Shaders) {
        Shaders.shadersLibrary = {};
        (function (AnimationType) {
            AnimationType[AnimationType["None"] = 0] = "None";
            AnimationType[AnimationType["RandomlyUndulateAlongNormals"] = 1] = "RandomlyUndulateAlongNormals";
            AnimationType[AnimationType["Worm"] = 2] = "Worm";
            AnimationType[AnimationType["WaveAlongVertical"] = 3] = "WaveAlongVertical";
            AnimationType[AnimationType["WaveBobbing"] = 4] = "WaveBobbing";
        })(Shaders.AnimationType || (Shaders.AnimationType = {}));
        var AnimationType = Shaders.AnimationType;
        (function (TextureBlendingType) {
            TextureBlendingType[TextureBlendingType["ConstantBlend"] = 0] = "ConstantBlend";
            TextureBlendingType[TextureBlendingType["SimplexBlend"] = 1] = "SimplexBlend";
            TextureBlendingType[TextureBlendingType["HeightBasedBlend"] = 2] = "HeightBasedBlend";
        })(Shaders.TextureBlendingType || (Shaders.TextureBlendingType = {}));
        var TextureBlendingType = Shaders.TextureBlendingType;
        function create(params) {
            var shdr = new Shader(params);
            Shaders.shadersLibrary[params["name"]] = shdr;
            window.shadersLibrary = Shaders.shadersLibrary;
        }
        Shaders.create = create;
        var Shader = (function () {
            function Shader(params) {
                this.vertexShaderCode = new VertexShaderCode_1.default();
                this.fragmentShaderCode = new FragmentShaderCode_1.default();
                this.startTime = new Date().getTime();
                this.name = "";
                this.parameters = {
                    "_animationType": AnimationType.None,
                    "_textureBlendingType": TextureBlendingType.ConstantBlend,
                    "_numTextures": 1,
                    "_useShadowMap": false,
                    "_hasGlossyEffect": true,
                    "_hasDiffuseEffect": true,
                    "_isShadeless": false,
                    "_hasTransparency": false,
                    "name": "",
                    "time": 0,
                    "animationSpeed": 1,
                    "animationStrength": 0.7,
                    "animationNoiseTurbulenceFactor": 1.,
                    "animationOrigin": new BABYLON.Vector3(0., 0., 0.),
                    "textureSampler1": BABYLON.Texture.CreateFromBase64String(this.tinyJpgEncoded(), "tiny", Core_1.default.scene),
                    "textureSampler2": BABYLON.Texture.CreateFromBase64String(this.tinyJpgEncoded(), "tiny", Core_1.default.scene),
                    "textureSampler3": BABYLON.Texture.CreateFromBase64String(this.tinyJpgEncoded(), "tiny", Core_1.default.scene),
                    "shadowMapSampler": BABYLON.Texture.CreateFromBase64String(this.tinyJpgEncoded(), "tiny", Core_1.default.scene),
                    "textureRepeat1": 1.0,
                    "textureRepeat2": 1.0,
                    "textureRepeat3": 1.0,
                    "textureBlendWeight1": 1.0,
                    "textureBlendWeight2": 1.0,
                    "textureBlendWeight3": 1.0,
                    "noiseTurbulence": 1.0,
                    "noiseAmplitude": 1.0,
                    "specularVal": 1.0,
                    "diffuseVal": 1.0,
                    "cameraPosition": new BABYLON.Vector3(0., 0., 0.),
                    "lightPosition": new BABYLON.Vector3(0., 10., 10.),
                    "alpha": 1.
                };
                // Overwrite default values with any user-specified one.
                this.addUserSpecifiedParameters(params);
                // Dispose of any old material (to prevent caching)
                // Avoid caching?
                try {
                    this.material.dispose(true);
                    this.material = null;
                }
                catch (e) { }
                // Set the parameters required before compilation.
                this.vertexShaderCode.animationType = this.parameters["_animationType"];
                this.fragmentShaderCode.textureBlendingType = this.parameters["_textureBlendingType"];
                this.fragmentShaderCode.numTextures = this.parameters["_numTextures"];
                this.fragmentShaderCode.useShadowMap = this.parameters["_useShadowMap"];
                this.fragmentShaderCode.hasGlossyEffect = this.parameters["_hasGlossyEffect"];
                this.fragmentShaderCode.hasDiffuseEffect = this.parameters["_hasDiffuseEffect"];
                this.fragmentShaderCode.isShadeless = this.parameters["_isShadeless"];
                this.fragmentShaderCode.hasTransparency = this.parameters["_hasTransparency"];
                // Before running compile, set parameters on this.VertexShaderCode and this.FragmentShaderCode
                this.VSCode = this.vertexShaderCode.getCode();
                this.FSCode = this.fragmentShaderCode.getCode();
                var uniq = Math.floor(100000 * Math.random()).toString();
                BABYLON.Effect.ShadersStore[("panGUI" + uniq + "VertexShader")] = this.VSCode;
                BABYLON.Effect.ShadersStore[("panGUI" + uniq + "FragmentShader")] = this.FSCode;
                //console.log(VSCode);
                //console.log("+++++++++++++");
                //console.log(FSCode);
                this.material = new BABYLON.ShaderMaterial("shader" + uniq, Core_1.default.scene, {
                    vertex: "panGUI" + uniq,
                    fragment: "panGUI" + uniq,
                }, {
                    needAlphaBlending: this.parameters["_hasTransparency"],
                    // needAlphaTesting: this.parameters["_hasTransparency"],
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
                });
                // Get the list of all the post-compile varaibales the current shader accepts.
                var inputsVarsNeeded = this.vertexShaderCode.inputVarsNeeded.concat(this.fragmentShaderCode.inputVarsNeeded);
                // Now set the variables that have to be set after the shader is compiled.
                for (var key in this.parameters) {
                    if (this.parameters.hasOwnProperty(key)) {
                        if (key.substr(0, 1) !== "_") {
                            if (inputsVarsNeeded.indexOf(key) !== -1) {
                                // So it's not one of the pre-compile parameters
                                this.setMaterialVal(key, this.parameters[key]);
                            }
                        }
                    }
                }
                // The alpha needs to be set through the setter because the
                // alphaMode might need to switch.
                this.alpha = this.parameters["alpha"];
                this.setupVarsConstantlyChanging(inputsVarsNeeded);
            }
            Shader.prototype.addUserSpecifiedParameters = function (params) {
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        this.parameters[key] = params[key];
                    }
                }
            };
            Shader.prototype.setupVarsConstantlyChanging = function (inputsVarsNeeded) {
                if (inputsVarsNeeded.indexOf("time") !== -1) {
                    RenderLoop_1.default.extraFunctionsToRunInLoop.push(function () {
                        this.updateTime();
                    }.bind(this));
                }
                if (inputsVarsNeeded.indexOf("cameraPosition") !== -1) {
                    RenderLoop_1.default.extraFunctionsToRunInLoop.push(function () {
                        this.cameraPosition = CameraChar_1.default.previousPos;
                    }.bind(this));
                }
            };
            /* private setDefaults(inputsVarsNeeded) {
    
                for (let i = 0; i < inputsVarsNeeded.length; i++) {
                    let varName = inputsVarsNeeded[i];
    
                    switch (varName) {
                        case "time":
                            this.time = this.defaults["time"];
    
                            // Update this shader's time with every turn of the render loop
    
                            break;
                        case "animationSpeed":
                            this.animationSpeed = this.defaults["animationSpeed"];
                            break;
                        case "animationStrength":
                            this.animationStrength = this.defaults["animationStrength"];
                            break;
                        case "animationNoiseTurbulenceFactor":
                            this.animationNoiseTurbulenceFactor = this.defaults["animationNoiseTurbulenceFactor"];
                            break;
                        case "animationOrigin":
                            this.animationOrigin = this.defaults["animationOrigin"];
                            break;
                        case "textureSampler1":
                            this.textureSampler1 = this.defaults["textureSampler1"];
                            break;
                        case "textureSampler2":
                            this.textureSampler2 = this.defaults["textureSampler2"];
                            break;
                        case "textureSampler3":
                            this.textureSampler3 = this.defaults["textureSampler3"];
                            break;
                        case "shadowMapSampler":
                            this.shadowMapSampler = this.defaults["shadowMapSampler"];
                            break;
                        case "textureRepeat1":
                            this.textureRepeat1 = this.defaults["textureRepeat1"];
                            break;
                        case "textureRepeat2":
                            this.textureRepeat2 = this.defaults["textureRepeat2"];
                            break;
                        case "textureRepeat3":
                            this.textureRepeat3 = this.defaults["textureRepeat3"];
                            break;
                        case "textureBlendWeight1":
                            this.textureBlendWeight1 = this.defaults["textureBlendWeight1"];
                            break;
                        case "textureBlendWeight2":
                            this.textureBlendWeight2 = this.defaults["textureBlendWeight2"];
                            break;
                        case "textureBlendWeight3":
                            this.textureBlendWeight3 = this.defaults["textureBlendWeight3"];
                            break;
                        case "noiseTurbulence":
                            this.noiseTurbulence = this.defaults["noiseTurbulence"];
                            break;
                        case "noiseAmplitude":
                            this.noiseAmplitude = this.defaults["noiseAmplitude"];
                            break;
                        case "specularVal":
                            this.specularVal = this.defaults["specularVal"];
                            break;
                        case "diffuseVal":
                            this.diffuseVal = this.defaults["diffuseVal"];
                            break;
                        case "cameraPosition":
                            // Update this shader's camera position with every turn of the render loop
                            RenderLoop.extraFunctionsToRunInLoop.push(function() {
                                this.cameraPosition = CameraChar.previousPos;
                            }.bind(this));
    
                            this.cameraPosition = this.defaults["cameraPosition"];
                            break;
                        case "lightPosition":
                            this.lightPosition = this.defaults["lightPosition"];
                            break;
                    }
    
                }
            } */
            // The below can be changed even after the shader is running, so make
            // them accessible.
            Shader.prototype.updateTime = function () {
                var now = new Date().getTime();
                this.time = now - this.startTime;
            };
            Shader.prototype.setMaterialVal = function (name, val) {
                if (typeof val === "number") {
                    this.setMaterialFloat(name, val);
                }
                else if (val.x !== undefined) {
                    this.setMaterialVec3(name, val);
                }
                else {
                    this.setMaterialTexture(name, val);
                }
            };
            Shader.prototype.setMaterialFloat = function (name, val) {
                this.material.setFloat(name, val);
            };
            Shader.prototype.setMaterialVec3 = function (name, val) {
                this.material.setVector3(name, val);
            };
            Shader.prototype.setMaterialTexture = function (name, val) {
                this.material.setTexture(name, val);
            };
            Object.defineProperty(Shader.prototype, "time", {
                set: function (val) {
                    this.setMaterialFloat("time", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "animationSpeed", {
                set: function (val) {
                    this.setMaterialFloat("animationSpeed", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "animationStrength", {
                set: function (val) {
                    this.setMaterialFloat("animationStrength", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "animationNoiseTurbulenceFactor", {
                set: function (val) {
                    this.setMaterialFloat("animationNoiseTurbulenceFactor", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "animationOrigin", {
                set: function (val) {
                    this.setMaterialVec3("animationOrigin", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureSampler1", {
                set: function (val) {
                    this.setMaterialTexture("textureSampler1", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureSampler2", {
                set: function (val) {
                    this.setMaterialTexture("textureSampler2", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureSampler3", {
                set: function (val) {
                    this.setMaterialTexture("textureSampler3", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "shadowMapSampler", {
                set: function (val) {
                    this.setMaterialTexture("shadowMapSampler", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureRepeat1", {
                set: function (val) {
                    this.setMaterialFloat("textureRepeat1", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureRepeat2", {
                set: function (val) {
                    this.setMaterialFloat("textureRepeat2", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureRepeat3", {
                set: function (val) {
                    this.setMaterialFloat("textureRepeat3", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureBlendWeight1", {
                set: function (val) {
                    this.setMaterialFloat("textureBlendWeight1", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureBlendWeight2", {
                set: function (val) {
                    this.setMaterialFloat("textureBlendWeight2", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "textureBlendWeight3", {
                set: function (val) {
                    this.setMaterialFloat("textureBlendWeight3", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "noiseTurbulence", {
                set: function (val) {
                    this.setMaterialFloat("noiseTurbulence", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "noiseAmplitude", {
                set: function (val) {
                    this.setMaterialFloat("noiseAmplitude", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "specularVal", {
                set: function (val) {
                    this.setMaterialFloat("specularVal", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "alpha", {
                set: function (val) {
                    if (val === 1.0) {
                        this.material.alphaMode = 0;
                    } /* else {
                        this.material.alphaMode = 2;
                    }*/
                    this.setMaterialFloat("alpha", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "diffuseVal", {
                set: function (val) {
                    this.setMaterialFloat("diffuseVal", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "cameraPosition", {
                set: function (val) {
                    this.setMaterialVec3("cameraPosition", val);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shader.prototype, "lightPosition", {
                set: function (val) {
                    this.setMaterialVec3("lightPosition", val);
                },
                enumerable: true,
                configurable: true
            });
            Shader.prototype.tinyJpgEncoded = function () {
                return "data:image/jpg;base64,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JgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQQNAAAAAAAEAAAAeDhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAThCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADSQAAAAYAAAAAAAAAAAAAAAQAAAAEAAAACgBVAG4AdABpAHQAbABlAGQALQAxAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAABAAAAABAAAAAAAAbnVsbAAAAAIAAAAGYm91bmRzT2JqYwAAAAEAAAAAAABSY3QxAAAABAAAAABUb3AgbG9uZwAAAAAAAAAATGVmdGxvbmcAAAAAAAAAAEJ0b21sb25nAAAABAAAAABSZ2h0bG9uZwAAAAQAAAAGc2xpY2VzVmxMcwAAAAFPYmpjAAAAAQAAAAAABXNsaWNlAAAAEgAAAAdzbGljZUlEbG9uZwAAAAAAAAAHZ3JvdXBJRGxvbmcAAAAAAAAABm9yaWdpbmVudW0AAAAMRVNsaWNlT3JpZ2luAAAADWF1dG9HZW5lcmF0ZWQAAAAAVHlwZWVudW0AAAAKRVNsaWNlVHlwZQAAAABJbWcgAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAAQAAAAAUmdodGxvbmcAAAAEAAAAA3VybFRFWFQAAAABAAAAAAAAbnVsbFRFWFQAAAABAAAAAAAATXNnZVRFWFQAAAABAAAAAAAGYWx0VGFnVEVYVAAAAAEAAAAAAA5jZWxsVGV4dElzSFRNTGJvb2wBAAAACGNlbGxUZXh0VEVYVAAAAAEAAAAAAAlob3J6QWxpZ25lbnVtAAAAD0VTbGljZUhvcnpBbGlnbgAAAAdkZWZhdWx0AAAACXZlcnRBbGlnbmVudW0AAAAPRVNsaWNlVmVydEFsaWduAAAAB2RlZmF1bHQAAAALYmdDb2xvclR5cGVlbnVtAAAAEUVTbGljZUJHQ29sb3JUeXBlAAAAAE5vbmUAAAAJdG9wT3V0c2V0bG9uZwAAAAAAAAAKbGVmdE91dHNldGxvbmcAAAAAAAAADGJvdHRvbU91dHNldGxvbmcAAAAAAAAAC3JpZ2h0T3V0c2V0bG9uZwAAAAAAOEJJTQQoAAAAAAAMAAAAAj/wAAAAAAAAOEJJTQQUAAAAAAAEAAAAAThCSU0EDAAAAAACMwAAAAEAAAAEAAAABAAAAAwAAAAwAAACFwAYAAH/2P/tAAxBZG9iZV9DTQAB/+4ADkFkb2JlAGSAAAAAAf/bAIQADAgICAkIDAkJDBELCgsRFQ8MDA8VGBMTFRMTGBEMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAENCwsNDg0QDg4QFA4ODhQUDg4ODhQRDAwMDAwREQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgABAAEAwEiAAIRAQMRAf/dAAQAAf/EAT8AAAEFAQEBAQEBAAAAAAAAAAMAAQIEBQYHCAkKCwEAAQUBAQEBAQEAAAAAAAAAAQACAwQFBgcICQoLEAABBAEDAgQCBQcGCAUDDDMBAAIRAwQhEjEFQVFhEyJxgTIGFJGhsUIjJBVSwWIzNHKC0UMHJZJT8OHxY3M1FqKygyZEk1RkRcKjdDYX0lXiZfKzhMPTdePzRieUpIW0lcTU5PSltcXV5fVWZnaGlqa2xtbm9jdHV2d3h5ent8fX5/cRAAICAQIEBAMEBQYHBwYFNQEAAhEDITESBEFRYXEiEwUygZEUobFCI8FS0fAzJGLhcoKSQ1MVY3M08SUGFqKygwcmNcLSRJNUoxdkRVU2dGXi8rOEw9N14/NGlKSFtJXE1OT0pbXF1eX1VmZ2hpamtsbW5vYnN0dXZ3eHl6e3x//aAAwDAQACEQMRAD8A9VSXyqkkp//ZADhCSU0EIQAAAAAAVQAAAAEBAAAADwBBAGQAbwBiAGUAIABQAGgAbwB0AG8AcwBoAG8AcAAAABMAQQBkAG8AYgBlACAAUABoAG8AdABvAHMAaABvAHAAIABDAFMANgAAAAEAOEJJTQQGAAAAAAAHAAYAAAABAQD/4Q0IaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE2LTEwLTAzVDA5OjQzOjU3LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE2LTEwLTAzVDA5OjQzOjU3LTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNi0xMC0wM1QwOTo0Mzo1Ny0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9qcGVnIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAxODAxMTc0MDcyMDY4MTE4MjJBRjc5QkE3Rjc1QzY2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAxODAxMTc0MDcyMDY4MTE4MjJBRjc5QkE3Rjc1QzY2IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MDE4MDExNzQwNzIwNjgxMTgyMkFGNzlCQTdGNzVDNjYiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJEaXNwbGF5Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTgwMTE3NDA3MjA2ODExODIyQUY3OUJBN0Y3NUM2NiIgc3RFdnQ6d2hlbj0iMjAxNi0xMC0wM1QwOTo0Mzo1Ny0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/iDOBJQ0NfUFJPRklMRQABAQAADNBhcHBsAhAAAG1udHJSR0IgWFlaIAfgAAYAHQASADsANmFjc3BBUFBMAAAAAEFQUEwAAAAAAAAAAAAAAAAAAAABAAD21gABAAAAANMtYXBwbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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";
            };
            return Shader;
        }());
    })(Shaders || (Shaders = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Shaders;
});
