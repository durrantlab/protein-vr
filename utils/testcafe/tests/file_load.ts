function fileLoad(txt: string, filename: string, environ: string = undefined, shadows: boolean = false) {
    const environSelect = Selector('#environments-load-local-file');
    const environOption = environSelect.find('option');

    test(txt + "_TITLETITLE", async (t) => {
        await t
            .click("#load-local-file-tab")
            .setFilesToUpload(
                "#load-local-file-file-input",
                filename
            )

        if (environ !== undefined) {
            await t
                .click(environSelect)
                .click(environOption.withText(environ));
        }

        if (shadows) {
            await t
                .click("#molecular-shadows-load-local-file");
        }

        await t
            .click("#load-local-file-scene")
            .expect(Selector("#status").innerText)
            .eql("Mol Loaded", "Molecule loaded!", {timeout: 15000});
    });
}

fileLoad("nanokid.sdf", "../../src/components/Mols/3DMol/nanokid.sdf", "Nighttime", true);
fileLoad("3NIR.pdb", "./3NIR.pdb", "Daytime", false);
fileLoad("1xdn.pvr", "../../src/components/Mols/3DMol/1xdn.pvr", undefined, false);
