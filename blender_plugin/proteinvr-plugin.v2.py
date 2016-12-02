import bpy
from bpy.props import *

##### Plugin information #####
bl_info = {
    "name" : "Tetrahedron Maker",
    "author" : "J Random Hacker <jrhacker@example.com>",
    "version" : (1, 0, 0),
    "blender" : (2, 5, 7),
    "location" : "View 3D > Edit Mode > Tool Shelf",
    "description" : "Generate a tetrahedron mesh",
    "warning" : "",
    "wiki_url" : "",
    "tracker_url" : "",
    "category" : "Add Mesh",
}

##### Setup scene and object variables #####
def nothing(self, context): return

class Properties:
    def intProp(self, txt, min=-100, max=100, default=33, update=nothing):
        return IntProperty(
            name=txt,
            min = min, max = max,
            default = default,
            description = "An integer between " + str(min) + " and " + str(max),
            update=update
        )
    
    def floatProp(self, txt, min=-100.0, max=100.0, default=33.0, update=nothing):
        return FloatProperty(
            name=txt,
            min = min, max = max,
            default = default,
            description = "A float between " + str(min) + " and " + str(max),
            update=update
        )
    
    def boolProp(self, txt, default=True, update=nothing):
        return BoolProperty(
            name=txt,
            default = default,
            description = "True or false",
            update=update
        )
    
    def strProp(self, txt, default="", update=nothing):
        return StringProperty(
            name=txt,
            default = default,
            description = "Text",
            update=update
        )
    
    def enumProp(self, txt, items=[("moose", "Moose", ""), ("dog", "Dog", "")], update=nothing):
        return EnumProperty(
            name=txt,
            #default = items[0],
            description = "Select Option",
            update=update,
            items=items
        )
    
    

##### Class for drawing UI elements #####
class UI:
    row_context = None
    parent = None
    
    def use_layout_row(self):
        self.row_context = self.parent.layout
    
    def use_box_row(self, label_txt):
        box = self.parent.layout.box()
        box.label(label_txt)
        self.row_context = box
        
    def new_row(self):
        row = self.row_context.row(align=True)
        row.alignment = "EXPAND"
        return row

    def label(self, txt="Label Text"):
        row = self.new_row()
        row.label(text=txt)
    
    def object_property(self, property_name="location"):
        row = self.new_row()
        row.prop(self.parent.obj, property_name)
    
    def scene_property(self, property_name="location"):
        row = self.new_row()
        row.prop(self.parent.scene, property_name)        
    
    def ops_button(self, rel_data_path="object.modifier_add", button_label="Add Modifier!"):
        # Note that rel_data_path does not include bpy.ops.
        # So instead of bpy.ops.object.modifier_add, just object.modifier_add
        row = self.new_row()
        row.operator(rel_data_path, text=button_label) #, icon='FILESEL')
    
    def ops_action_button(self, rel_data_path="object.select_all", button_label="Invert Selection!", action="INVERT"):
        row = self.new_row()
        row.operator(rel_data_path, text=button_label).action = action
        

##### The Panel #####
class ProteinVRPanel(bpy.types.Panel):
    bl_label = "ProteinVR"
    bl_idname = "MATERIALS_PT_proteinvr"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'TOOLS'
    
    # obj is the last object selected. So obj.name, for example, returns it's name.
    # draw is called frequently, so this basically automatically updates.
    obj = None
    scene = None
    
    prop_funcs = Properties()
    ui = UI()
    
    ### Start functions ###
    @classmethod
    def start(self):
        # Set up scene and object properties.
        bpy.types.Object.is_collidable = self.prop_funcs.boolProp("Camera collision enabled?", False, update=self.check_use_imposter_valid)
        bpy.types.Object.use_imposter = self.prop_funcs.boolProp("Use an imposter mesh?", False, update=self.check_use_imposter_valid)
        
        bpy.types.Object.use_lod = self.prop_funcs.boolProp("Use Level of Detail?", True)
        bpy.types.Object.is_billboard = self.prop_funcs.boolProp("Is this a billboard?", False)
        bpy.types.Object.use_shadow_map = self.prop_funcs.boolProp("Use shadow map?", False)
        bpy.types.Object.gpu_animation = self.prop_funcs.enumProp("GPU animation", items=[("none", "None", ""), ("undulate", "Undulate", ""), ("bobbing", "Bobbing", ""), ("jiggling", "Jiggling", "")])
        
        #bpy.types.Object.gpu_animation = self.prop_funcs.enumProp("GPU animation", items=[("none", "None", ""), ("undulate", "Undulate", ""), ("bobbing", "Bobbing", ""), ("jiggling", "Jiggling", "")])

    def check_use_imposter_valid(self, context):
        obj = context.object
        if obj['is_collidable'] == False:
            obj['use_imposter'] = False

    def draw(self, context):
        self.obj = context.object
        self.scene = bpy.context.scene
        self.ui.parent = self

        # Start layout
        self.ui.use_layout_row()
        self.ui.label("Object (Name: " + self.obj.name + ")")
        
        self.ui.use_box_row("Collisions")
        self.ui.object_property(property_name="is_collidable")
        self.ui.object_property(property_name="use_imposter")
        
        self.ui.use_box_row("Optimizations")
        self.ui.object_property(property_name="use_lod")
        self.ui.object_property(property_name="is_billboard")
        self.ui.object_property(property_name="use_shadow_map")
        self.ui.object_property(property_name="gpu_animation")
        

##### Custom operators #####
# Can be called from the parameter
class runScript(bpy.types.Operator):
    bl_idname = "object.run_script"
    bl_label = "Invokes a Script"
    bl_options = {"UNDO"}

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        print('Yay!')

        return {'FINISHED'}

##### Registration functions #####

def register():
    ProteinVRPanel.start()
    bpy.utils.register_class(ProteinVRPanel)

def unregister():
    bpy.utils.unregister_class(__name__)

if __name__ == "__main__":
    register()