TO DO
=====

Pending
-------

Closure compiler. Need to check in VR modes.

Need to get it working on phones

Other selection types (hydrophobic).

Test with other VR headsets (in the proteinatorium)

Why two Vars.ts?

Code could be refactored a bit...

Would be good to have second light that doesn't cast shadow.

https://doc.babylonjs.com/how_to/interactions

Optimizations working? FPS seems still to be high on phone.

Done or Ignore
--------------

Additional 3D scenes (environments).

Lots of good callbacks you could implement:
https://github.com/TalAter/annyang/blob/master/docs/README.md

Speech being picked up by voice commands. Need to pause them while speaking.

Floor and menu buttons in response to rotating VR (left eye rotation?)

Make sure never below floor-button sphere. You get trapped otherwise. Could be
a constant for easy modification later.

Tactile feedback (togglable). Voice activation (togglable).

Always use good voice if available.

Need way of communicating available voice commands.

Would be cool to fade molecules in and out (rather than just disappear).

Click buttons sounds on the buttnons.

Positions protein based on box in scene (not external json).

Voice activation.

Floor button always on floor (even in VR).

When yo ushow or hide something, update shadows.

Mouse click should trigger action, but only if mouseup rapidly follows
mousedown (so no inbetween drags). This will likely be important for mobile.

Multiple triggers? Refractory period needed.

Look into general optimizations.
*     http://www.html5gamedevs.com/topic/23543-best-optimization-for-mobile/
*     https://doc.babylonjs.com/how_to/optimizing_your_scene
*     https://doc.babylonjs.com/how_to/how_to_use_sceneoptimizer
*    https://www.smashingmagazine.com/2016/07/babylon-js-building-sponza-a-cross-platform-webgl-game/
     * https://www.airtightinteractive.com/2015/01/building-a-60fps-webgl-game-on-mobile/
       https://blog.raananweber.com/2015/09/03/scene-optimization-in-babylon-js/

https://www.davrous.com/2016/02/05/discovering-sponza-by-babylon-js-and-sharing-tips-on-how-to-build-a-cross-platforms-webgl-game/

Faster picking? (octtree)?
    https://doc.babylonjs.com/how_to/optimizing_your_scene_with_octrees#optimizing-collisions-and-picking
    * mesh.createOrUpdateSubmeshesOctree(capacity, maxDepth) is used to optimize picking

Surfaces on both sides... but it looks bad. Might have to do it in blender?

Buttons need to work.

When you change height, also zoom to loc. But not all the way. Maybe just a
bit away from the target.
