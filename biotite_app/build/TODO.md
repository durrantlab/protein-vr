TO DO
=====

Pending
-------

Test with other VR headsets (in the proteinatorium)
    Check on iPhones and things too.

Would be good to have second light that doesn't cast shadow.

https://doc.babylonjs.com/how_to/interactions

STill getting stuck in nav sphere sometimes.

Good to also generate low-res scene? Maybe with flag in url?

Use new voice system from bugmebot. It's better. But doesn't work on phones... ???

Option to make VR scenes discoverable.

Can't simplify gltf. Colors now work, but number of vertexes doesn't chang.e

Download option. That way you can run it even without internet connection.

Other selection types (hydrophobic).

Setup scenes for presentations.

fix protein VR on Google cardboard
* Note that this doesn't happen in the playground.
* Also, doesn't matter whether you closure compile externals.js.
* Also, doesn't seem to be gazetracker or registerbeforerenders.
* When you catch the error at render(), it never recovers. So it's not that
  something hasn't loaded yet.
* Try recreating in playground, but loading same scene. Perhaps its a problem
  with the scene? You've tried very hard to eliminate functions. I think now
  you should try to rebuild from the ground up, to id the error.

Why does VR camera not match camera from babylon in initial orientation?

Help menu too? Button on front?
    Dedicate to Karen Curto.
    Troubleshooting
        Chrome: Go to chrome://flags, turn on WebVR. Even if it works, it could work better...

Slight ticjk up after 90%

Done or Ignore
--------------

Need skyboxes.

Click (no VR) on Android: I think it works, but need to check consistency.
Phone ran out of power.

Can you detect max fps and adjust accordingly?

Need to be able to go forward and backward even if not pointing at an object.
    Disable teleportation on larger sphere.
    Also hide tracker mesh if touching sphere.

Need to make sure always over ground, even when simpler navigation.

Need indication of loading in the beginning.

Would be good to be able to turn off menu system. In scene_info.json.

Store scene proportions way too big. Scale down by half?

Redo optimization. Include get rid of surfaces.

Manifest system back? Good for caching.

Oculus Go controller pad doesn't work.
    Oculus Go prob: https://forum.babylonjs.com/t/oculus-go-createdefaultvrexperience-and-onpadstatechangedobservable/1944

Remnind me to fix trigger issue

Make "Sorry, I didn't understand" go away. Because people might be having a
conversation.

Need way to turn with clicker. Oculus Go turning head alot makes people sick.

Not respecting blender camera any more.

Need to get it working on phones

1. Check if it still turns blue when you click it (not sure).

Closure compiler. Need to check in VR modes.

Combine babylonjs js into one file, host locally.

Code could be refactored a bit...

Optimizations working? FPS seems still to be high on phone.

Why two Vars.ts?

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
