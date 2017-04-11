# Information about the plugin.
bl_info = {
    "name": "ProteinVR",
    "author": "Jacob protein",
    "version": (1, 0),
    "blender": (2, 75, 0),
    # "location": "View3D > Add > Mesh > New Object",
    "description": "Sets the name for proteinVR",
    "warning": "",
    "wiki_url": "",
    "category": "proteinVR",
}

import random  # To use random numbers.
import bpy     # To interface with Blender.
import json    # To work with json.
import sys
import os

# Get properties (basically variable types) for the plugin parameters.
from bpy.props import (StringProperty,
                       BoolProperty,
                       IntProperty,
                       FloatProperty,
                       FloatVectorProperty,
                       EnumProperty,
                       PointerProperty,
                       )
from bpy.types import (Panel,
                       Operator,
                       AddonPreferences,
                       PropertyGroup,
                       )

# A variable to store global infomation.
global data_str
data_str = ""

class OBJECT_OT_update_name(bpy.types.Operator):
    """This class represents the "action" when the button is clicked."""

    bl_label = "Update Object Name"
    bl_idname = "proteinvr.update_name"
    bl_description = ("Update the name of the object to reflect " +
                     "user-defined parameters.")

    def execute(self, context):
        """What to run when the button is clicked.
        
            Args:
                context: the context.
        """

        bpy.context.scene.objects.active.name = data_str
        return {'FINISHED'}

class OBJECT_OT_bake_shadows(bpy.types.Operator):
    """This class represents the "action" when the button is clicked."""

    bl_label = "Bake a Shadow Map"
    bl_idname = "proteinvr.bake_shadows"
    bl_description = ("Bake shadows to an image.")

    def remove_material(self, active_obj):
        # Save that objects current material, and then remove it.
        # This assumes one material per object.
        try:  # Maybe there isn't a material'
            material_of_active = active_obj.material_slots[0].material
        except:
            material_of_active = None

        # Remove that material.
        active_obj.active_material_index = 0
        bpy.ops.object.material_slot_remove()

        return material_of_active


    def execute(self, context):
        """What to run when the button is clicked.
        
            Args:
                context: the context.
        """

        # First, make sure you're in cycles.
        context.scene.render.engine = 'CYCLES'

        # Make sure you're in object mode
        bpy.ops.object.mode_set(mode='OBJECT')

        # Get the active object.
        active_obj = context.object

        # Check to make sure the object is UV unwrapped
        if len(active_obj.data.uv_layers) == 0:
            self.report({'ERROR'}, "Error! The object needs to be UV unwrapped!")
        
        # Bake the texture.
        elif len(active_obj.data.uv_textures) > 1:
            self.report({'ERROR'}, "Error! There must be only 1 uv map! Currently there are " + str(len(active_obj.data.uv_textures)) + ".")

        else:  # No errors, so proceed
            # Get the original material and remove it
            orig_material = self.remove_material(active_obj)

            # Create a new image to render the shadows to
            image_name = "tmptmp" + str(random.random())
            image = bpy.ops.image.new(
                name   = image_name,
                width  = 512,
                height = 512,
                color  = (1.0, 1.0, 1.0, 1.0),
                alpha  = False
            )

            # Create a new material, pure white diffuse.
            mat_name = "tmptmp" + str(random.random())
            mat = bpy.data.materials.new(name=mat_name)
            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links
            output = nodes['Material Output']
            diffuse = nodes['Diffuse BSDF']
            diffuse.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1.0)  # pure white

            # You need to add a texture node
            texture_node = nodes.new(type='ShaderNodeTexImage') 
            texture_node.select = True
            texture_node.image = bpy.data.images[image_name]
            mat.node_tree.nodes.active = texture_node

            # Add this material to the current object
            active_obj.data.materials.append(mat)

            # Bake the shadow map
            oldCyclesSamples = context.scene.cycles.samples
            context.scene.cycles.samples = 200
            uv_textures = active_obj.data.uv_textures
            uv_textures.active = active_obj.data.uv_textures[0]  # Assuming just one uv map
            bpy.ops.object.bake(type='COMBINED', use_selected_to_active=False)
            context.scene.cycles.samples = oldCyclesSamples

            # Save that shadow map
            img = bpy.data.images[image_name]
            filepath =  "/var/tmp/shadow.jpg" if bpy.data.filepath == '' else os.path.dirname(bpy.data.filepath) + os.sep + "shadow.jpg"
            img.filepath_raw = bpy.path.abspath(filepath)
            img.file_format = 'JPEG'
            img.save()

            # Remove the temporary material
            self.remove_material(active_obj)
            active_obj.data.materials.append(orig_material)

            self.report({'ERROR'}, "Shadow map saved to " + filepath + ".\nNow blur the image and convert to black and white in a program like PhotoShop.")

        return {'FINISHED'}

class ProteinVRPanel(bpy.types.Panel):
    """A class to create a Panel in the Object properties window. Inherits
    bpy.types.Panel."""

    bl_label = "ProteinVR"
    bl_idname = "OBJECT_PT_proteinvr"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "object"

    def draw(self, context):
        """Draw the panel.

            Args:
                context: The context of the current panel.
        """

        # Save the layout, scene, and obj to variables for quick reference.
        layout = self.layout
        scene = context.scene
        obj = context.object

        # row = layout.row()
        # row.label(text="Hello world!", icon='WORLD_DATA')

        # row = layout.row()
        # row.label(text="Active object is: " + obj.name)

        # The first row in the panel.
        if True:
            row = layout.row()
            # The text input where the user can enter the object name.
            row.prop(obj, "vr_label", text = "Object label/name")

        # The second (split) row in the panel.
        if True:
            split = layout.split()
            # The checkbox where the user can specify whether or not the object
            # can collide with the camera/chracter.
            col = split.column()
            col.prop(obj, "is_colidable", text = "Collides with Player?")
    
            # The checkbox where the user can specify whether or not the object
            # can collide with the camera/chracter and is hidden (for simplifying
            # collisions with complex meshes).
            col = split.column()
            col.prop(obj, "is_hidden_colidable", text = "Hidden Collider?")
    
        # The third (split) row in the panel.
        if True:
            split = layout.split()
            # The checkbox where the user can specify whether or not an object is
            # the ground.
            col = split.column()
            col.prop(obj, "is_ground", text = "Is Ground?")

            # The checkbox where the user can specify whether or not an object
            # should be rendered as automatic LOD.
            col = split.column()
            col.prop(obj, "use_lod", text = "Auto LOD?")
    
        # The fourth (split) row in the panel.
        if True:
            split = layout.split()
            # The checkbox where the user can specify whether or not an object
            # should be a skybox.
            col = split.column()
            col.prop(obj, "is_skybox", text = "Is this a Skybox?")

            # The checkbox where the user can specify whether or not an object is
            # a billboard.
            col = split.column()
            col.prop(obj, "is_billboard", text = "Is this a Billboard?")
    
        # The fifth row in the panel.
        if True:
            row = layout.row()
            # The text label tht contains the json.
            row.label(text = self.get_data_str(obj), icon = 'WORLD_DATA')

        # The first row in the panel.
        if True:
            row = layout.row()
            # The text input where the user can enter the name of a custom shader.
            row.prop(obj, "custom_shader", text = "Custom Shader")

        # The sixth row in the panel.
        if True:
            row = layout.row()
            # The button to transfer the json to the name of the mesh.
            row.operator("proteinvr.update_name", text = "Save Data")

        # The seventh row in the panel.
        if True:
            row = layout.row()
            # The button to bake shadows
            row.operator("proteinvr.bake_shadows", text = "Bake a Shadow Map")

    def get_data_str(self, obj):
        """Convert the user-specified parameters into a modified json
        string.
        
            Args:
                obj: The object that includes the user-specified parameters.
            
            Returns:
                The modified json string (no "{"" or "}", no quotes).
        """

        global data_str

        # Make a json string.
        data_str = json.dumps({
            "n": obj.vr_label,
            "c": int(obj.is_colidable),
            "h": int(obj.is_hidden_colidable),
            "g": int(obj.is_ground),
            "l": int(obj.use_lod),
            "s": int(obj.is_skybox),
            "b": int(obj.is_billboard),
            "cs": obj.custom_shader,
        })

        # Modify the json string.
        data_str = str(
            data_str
        ).replace(" ", "").replace("{", "").replace("}", "").replace('"', '')

        return data_str

def register():
    """Set up the user-interface elements that the user can control."""

    bpy.types.Object.is_colidable = bpy.props.BoolProperty(
        name = "is_colidable",
        description = "Whether or not this object can collide with " + 
                      "the player.",
        default = False
    )

    bpy.types.Object.is_hidden_colidable = bpy.props.BoolProperty(
        name = "is_hidden_colidable",
        description = "Whether or not this object can collide with " + 
                      "the player and is invisible. Good for simplifying " +
                      "collision with more complex meshes.",
        default = False
    )

    bpy.types.Object.is_ground = BoolProperty(
        name="Enable or Disable",
        description="Whether or not this object is the ground.",
        default = False
    )

    bpy.types.Object.use_lod = BoolProperty(
        name="Enable or Disable",
        description="Whether or not to apply autoLOD to this object.",
        default = False
    )

    bpy.types.Object.is_skybox = BoolProperty(
        name="Enable or Disable",
        description="Is this a skybox?",
        default = False
    )

    bpy.types.Object.is_billboard = BoolProperty(
        name="Enable or Disable",
        description="Is this a billboard (always facing camera)?",
        default = False
    )

    bpy.types.Object.vr_label = StringProperty(
        name="Enable or Disable",
        description="A short object label.",
        default="d" + str(random.randint(0,100))
    )

    bpy.types.Object.custom_shader = StringProperty(
        name="Enable or Disable",
        description="The name of a custom shader to use. This custom shader is defined in the associated Typescript code, not in here in Blender. If empty, uses the Blender material.",
        default=""
    )

    bpy.utils.register_module(__name__)

def unregister():
    """Unregister the plugin if the user requests it."""

    bpy.utils.unregister_module(__name__)


if __name__ == "__main__":
    register()
