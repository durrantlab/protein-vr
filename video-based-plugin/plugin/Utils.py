import bpy

def switch_mode(mode):
    try:
        bpy.ops.object.mode_set(mode=mode, toggle=False)
    except:
        pass

def select_and_active(obj):
    for obj in bpy.data.objects:
        obj.select = False
    obj.select = True
    bpy.context.scene.objects.active = obj

class ObjNames():
    def save_object_names(self):
        self.existing_object_names = self.obj_names()

    def object_names_different(self):
        return list(self.obj_names() - self.existing_object_names)

    def obj_names(self):
        return set([obj.name for obj in bpy.data.objects])
