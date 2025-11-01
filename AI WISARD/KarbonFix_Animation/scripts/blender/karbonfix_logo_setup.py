# Blender 3.x — KarbonFix Logo 3D Setup (Style A)
# - Importe un SVG si présent (assets/brand/karbonfix.svg),
# - Sinon crée un fallback "Karbon" + "Fix" en texte extrudé,
# - Assigne matériaux Chrome noir (Karbon) et Verre bleu émissif (Fix),
# - Monte une scène verticale 1080x1920 et rend un still test.

import bpy, json, os, math
from mathutils import Vector

# ----- Config projet -----
script_dir = os.path.dirname(os.path.abspath(__file__))
proj_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))
brand_json_path = os.path.join(proj_dir, "brand", "brand.json")
svg_default_path = os.path.join(proj_dir, "assets", "brand", "karbonfix.svg")
output_dir = os.path.join(proj_dir, "renders")
os.makedirs(output_dir, exist_ok=True)

# Defaults
cfg = {
    "blue": [0.184, 0.502, 1.0, 1.0],  # ~#2F80FF en sRGB
    "fps": 30,
    "style": "A",
    "emission_strength": 0.4,
    "extrude": 0.08,
    "bevel": 0.004,
}

# Charger brand.json si dispo
try:
    if os.path.exists(brand_json_path):
        with open(brand_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            hex_blue = data.get('colors', {}).get('primary_blue', None)
            if hex_blue:
                # Convertir HEX → linear RGB approx
                def hex_to_rgb(hexstr):
                    hexstr = hexstr.lstrip('#')
                    r = int(hexstr[0:2], 16)/255.0
                    g = int(hexstr[2:4], 16)/255.0
                    b = int(hexstr[4:6], 16)/255.0
                    return [r, g, b, 1.0]
                cfg["blue"] = hex_to_rgb(hex_blue)
            if '3d' in data:
                cfg["emission_strength"] = data['3d'].get('glass_emission_strength', cfg['emission_strength'])
except Exception as e:
    print("[KarbonFix] brand.json non lu:", e)

# ----- Nettoyage scène -----
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ----- Scène/render -----
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.render.resolution_x = 1080
scene.render.resolution_y = 1920
scene.render.fps = cfg['fps']
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'High Contrast'

# ----- Matériaux -----

def make_chrome_black():
    m = bpy.data.materials.new("Karbon_Chrome_Black"); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (0.04,0.04,0.05,1)
    bsdf.inputs['Metallic'].default_value = 0.8
    bsdf.inputs['Roughness'].default_value = 0.15
    bsdf.inputs['Clearcoat'].default_value = 0.25
    return m

def make_glass_blue():
    m = bpy.data.materials.new("Fix_Glass_Blue"); m.use_nodes = True
    nt = m.node_tree
    # Nodes
    out = nt.nodes.get('Material Output')
    princ = nt.nodes.get('Principled BSDF')
    emis = nt.nodes.new('ShaderNodeEmission')
    mix = nt.nodes.new('ShaderNodeMixShader')
    # Principled as glass
    princ.inputs['Transmission'].default_value = 1.0
    princ.inputs['IOR'].default_value = 1.45
    princ.inputs['Roughness'].default_value = 0.02
    princ.inputs['Base Color'].default_value = cfg['blue']
    # Emission
    emis.inputs['Color'].default_value = cfg['blue']
    emis.inputs['Strength'].default_value = cfg['emission_strength']
    # Links
    nt.links.new(princ.outputs['BSDF'], mix.inputs[1])
    nt.links.new(emis.outputs['Emission'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    mix.inputs['Fac'].default_value = 0.2
    return m

mat_chrome = make_chrome_black()
mat_glass = make_glass_blue()

# ----- Import SVG ou fallback Texte -----
objs = []

if os.path.exists(svg_default_path):
    bpy.ops.import_curve.svg(filepath=svg_default_path)
    for o in bpy.context.selected_objects:
        if o.type == 'CURVE':
            o.data.extrude = cfg['extrude']
            o.data.bevel_depth = cfg['bevel']
            o.data.fill_mode = 'BOTH'
            o.data.bevel_mode = 'ROUND'
            o.data.resolution_u = 12
            o.data.use_fill_caps = True
            # Matériaux selon nom
            n = o.name.lower()
            if any(k in n for k in ['karbon']):
                if len(o.data.materials) == 0: o.data.materials.append(mat_chrome)
                else: o.data.materials[0] = mat_chrome
            elif any(k in n for k in ['fix','f','x','i']):
                if len(o.data.materials) == 0: o.data.materials.append(mat_glass)
                else: o.data.materials[0] = mat_glass
        objs.append(o)
    print("[KarbonFix] SVG importé.")
else:
    print("[KarbonFix] SVG introuvable, création fallback texte…")
    # Karbon
    bpy.ops.object.text_add(location=(0,0,0))
    t1 = bpy.context.active_object; t1.name = 'Karbon_Text'
    t1.data.body = 'Karbon'
    t1.data.extrude = cfg['extrude']; t1.data.bevel_depth = cfg['bevel']; t1.data.bevel_resolution = 3
    t1.data.align_x = 'LEFT'
    # Fix (separé pour matériaux)
    bpy.ops.object.text_add(location=(1.0,0,0))
    t2 = bpy.context.active_object; t2.name = 'Fix_Text'
    t2.data.body = 'Fix'
    t2.data.extrude = cfg['extrude']; t2.data.bevel_depth = cfg['bevel']; t2.data.bevel_resolution = 3
    t2.data.align_x = 'LEFT'
    # Calculer largeur de "Karbon" pour positionner "Fix"
    bpy.context.view_layer.update()
    width = t1.dimensions.x
    spacing = 0.05
    t2.location.x = t1.location.x + width + spacing
    # Matériaux
    if len(t1.data.materials) == 0: t1.data.materials.append(mat_chrome)
    else: t1.data.materials[0] = mat_chrome
    if len(t2.data.materials) == 0: t2.data.materials.append(mat_glass)
    else: t2.data.materials[0] = mat_glass
    objs = [t1, t2]

# ----- Disposition -----
for o in objs:
    o.rotation_euler = (0, 0, 0)
    o.location.z = 0

# Centrer l’ensemble
bpy.ops.object.select_all(action='DESELECT')
for o in objs: o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.ops.object.join()
logo = bpy.context.active_object
logo.name = 'KarbonFix_Logo'
logo.location = Vector((0,0,0))

# ----- Caméra & Lumières -----
bpy.ops.object.camera_add(location=(0,-2.3,0.85), rotation=(math.radians(90-15), 0, 0))
cam = bpy.context.active_object
cam.data.lens = 85
scene.camera = cam

# Key light
bpy.ops.object.light_add(type='AREA', location=(1.2,-1.2,1.5))
key = bpy.context.active_object; key.data.energy = 1200; key.data.size = 0.8
# Rim light
bpy.ops.object.light_add(type='AREA', location=(-1.2,1.4,1.2))
rim = bpy.context.active_object; rim.data.energy = 900; rim.data.size = 0.6
# Floor
bpy.ops.mesh.primitive_plane_add(size=6, location=(0,0,-0.3))
floor = bpy.context.active_object
floor.data.materials.append(mat_chrome)

# Cadre logo
logo.scale = (0.6, 0.2, 0.6)
logo.location = Vector((0, 0, 0.0))

# ----- Rendu test -----
scene.render.filepath = os.path.join(output_dir, "logo3d_still.png")
scene.render.image_settings.file_format = 'PNG'
try:
    bpy.ops.render.render(write_still=True)
    print("[KarbonFix] Rendu enregistré dans:", scene.render.filepath)
except Exception as e:
    print("[KarbonFix] Échec rendu:", e)
