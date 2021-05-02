function exportModel(ext) {
    test("TITLETITLE", async (t) => {
        await t
            .click("#proteinvr-save-model-tab")
            .click("#pvr-model-file-name")
            .pressKey('ctrl+a delete')
            .typeText("#pvr-model-file-name", "my-scene." + ext)
            .click("#save-proteinvr-model")
            .expect(Selector("#status").innerText)
            .eql("Model exported", "Molecule exported!", {timeout: 15000});
    });
}

exportModel("gltf");
exportModel("glb");
exportModel("obj");
exportModel("stl");
exportModel("vrml");
