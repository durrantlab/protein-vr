<map version="1.0.1">
<!-- To view this file, download free mind mapping software FreeMind from http://freemind.sourceforge.net -->
<node CREATED="1504667951657" ID="ID_144990880" MODIFIED="1510183575753" TEXT="Start">
<font NAME="SansSerif" SIZE="15"/>
<node CREATED="1504668007990" ID="ID_430045033" MODIFIED="1510183735027" POSITION="right">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      UserVars.setup
    </p>
    <p>
      <font size="1">Variables from a file </font>
    </p>
    <p>
      <font size="1">DefaultUserVarsSet</font>
    </p>
  </body>
</html>
</richcontent>
<node CREATED="1504668019469" HGAP="14" ID="ID_1965710874" MODIFIED="1510183940973" VSHIFT="118">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      SettingsPanel.allowUserToModifySettings
    </p>
    <p>
      <font size="1">After user closes dialog </font>
    </p>
    <p>
      <font size="1">UserSettingsSpecifiedDialogClosed </font>
    </p>
  </body>
</html>
</richcontent>
<node CREATED="1504669014466" HGAP="15" ID="ID_108490188" MODIFIED="1510199117470" VSHIFT="130">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Camera.setup
    </p>
    <p>
      <font size="1">CameraSetup</font>
    </p>
  </body>
</html>
</richcontent>
<arrowlink COLOR="#b0b0b0" DESTINATION="ID_273882872" ENDARROW="None" ENDINCLINATION="270;135;" ID="Arrow_ID_129228375" STARTARROW="Default" STARTINCLINATION="-223;207;"/>
</node>
<node CREATED="1504996440007" HGAP="213" ID="ID_237529592" MODIFIED="1504996458592" TEXT="Loading Panel while Video frames finish" VSHIFT="-42">
<node CREATED="1505091289762" HGAP="32" ID="ID_185312058" MODIFIED="1505091296525" TEXT="Make child spheres, using shaders from before" VSHIFT="42"/>
</node>
</node>
</node>
<node CREATED="1504668040068" ID="ID_628519935" MODIFIED="1510186084944" POSITION="left">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      SceneSetup.loadBabylonFile
    </p>
    <p>
      <font size="1">Loading babylon.babylon file (creates scene) </font>
    </p>
    <p>
      <font size="1">BabylonSceneLoaded </font>
    </p>
  </body>
</html>
</richcontent>
<node CREATED="1504668141830" HGAP="279" ID="ID_273882872" MODIFIED="1510186188673" VSHIFT="145">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      PVRJsonSetup.afterSceneLoaded
    </p>
    <p>
      <font size="1">Loads from ProteinVR JSON after scene loaded. </font>
    </p>
    <p>
      <font size="1">(Guide spheres, clickable files). This should be fast. </font>
    </p>
    <p>
      <font size="1">DataJsonLoadingDone </font>
    </p>
  </body>
</html>
</richcontent>
<linktarget COLOR="#b0b0b0" DESTINATION="ID_273882872" ENDARROW="None" ENDINCLINATION="270;135;" ID="Arrow_ID_129228375" SOURCE="ID_108490188" STARTARROW="Default" STARTINCLINATION="-223;207;"/>
<linktarget COLOR="#b0b0b0" DESTINATION="ID_273882872" ENDARROW="None" ENDINCLINATION="-55;80;" ID="Arrow_ID_893832478" SOURCE="ID_1251581907" STARTARROW="None" STARTINCLINATION="54;-26;"/>
</node>
<node CREATED="1504672615584" HGAP="27" ID="ID_1167622801" MODIFIED="1510187113910" VSHIFT="-3">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      SphereCollection.loadInitialAssets
    </p>
    <p>
      <font size="1">The scene needs to be loaded, and </font>
    </p>
    <p>
      <font size="1">cameraPositionsAndTextures needs to be defined. </font>
    </p>
  </body>
</html>
</richcontent>
</node>
</node>
<node CREATED="1504668110762" HGAP="24" ID="ID_1251581907" MODIFIED="1510186411940" POSITION="left" VSHIFT="35">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      PVRJsonSetup.loadJSON
    </p>
    <p>
      <font size="1">Loads JSON describing ProteinVR stuff. </font>
    </p>
    <p>
      <font size="1">Creates the initial Sphere objects, </font>
    </p>
    <p>
      <font size="1">without loading meshes or textures.</font>
    </p>
    <p>
      <font size="1">(Camera paths.) </font>
    </p>
    <p>
      <font size="1">DataJsonLoadingStarted </font>
    </p>
  </body>
</html>
</richcontent>
<arrowlink COLOR="#b0b0b0" DESTINATION="ID_273882872" ENDARROW="None" ENDINCLINATION="-55;80;" ID="Arrow_ID_893832478" STARTARROW="None" STARTINCLINATION="54;-26;"/>
</node>
</node>
</map>
