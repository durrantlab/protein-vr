# Plugins

## General

All plugins must extend the `PluginParent.PluginParent` class.

## LoadSave

These plugins are a bit more complex because they also have associated Vue
components.

1. They must extend `LoadSave.LoadSaveParent.LoadSaveParent`, which extends
   `PluginParent.PluginParent`.
