function qrcode() {
    test("TITLETITLE", async (t) => {
        await t
            .click("#proteinvr-qr-code-tab")
            .click("#qr-code-file-name")
            .pressKey('ctrl+a delete')
            .typeText("#qr-code-file-name", "my-scene.png")
            .click("#save-qrcode")
            .expect(Selector("#status").innerText)
            .eql("QR download", "QRCode downloaded!", {timeout: 15000});
    });
}

qrcode();
