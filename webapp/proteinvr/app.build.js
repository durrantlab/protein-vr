({
    appDir: "../",
    baseUrl: "proteinvr",
    dir: "../../webapp-compiled",
    mainConfigFile: "./RequireConfig.js",
    modules: [
        {
            name: "../js/almond",
            include: ["RequireConfig"]
        }
    ],
    paths: {
        // jquery: "../js/jquery.min",
        bootstrap: "../js/bootstrap-3.3.7/dist/js/bootstrap.min"
    },
    optimize: "none",
    wrap: true,
    removeCombined: true
})
