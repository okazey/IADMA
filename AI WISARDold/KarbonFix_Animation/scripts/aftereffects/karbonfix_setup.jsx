// After Effects ExtendScript — KarbonFix Setup (1080x1920, Style A, morph)
// Crée une comp principale, des dossiers et des placeholders + marqueurs timeline.

(function(){
    app.beginUndoGroup("KarbonFix Setup");
    var proj = app.project || app.newProject();

    function ensureFolder(name){
        for (var i=1;i<=proj.items.length;i++){
            if (proj.items[i] instanceof FolderItem && proj.items[i].name===name) return proj.items[i];
        }
        return proj.items.addFolder(name);
    }

    var fFootage = ensureFolder("01_Footage");
    var fPrecomps = ensureFolder("02_Precomps");
    var fComps    = ensureFolder("03_Comps");
    var fRenders  = ensureFolder("04_Renders");
    var fBrand    = ensureFolder("Brand");

    var compName = "KF_Main_1080x1920_30fps_15s";
    var w=1080, h=1920, dur=15, fps=30;
    var comp = proj.items.addComp(compName, w, h, 1.0, dur, fps);
    comp.parentFolder = fComps;

    // BG
    var bg = comp.layers.addSolid([0,0,0], "BG_Black", w, h, 1.0);
    bg.guideLayer = false; bg.locked = false;

    // Placeholders
    var smoke = comp.layers.addSolid([0.1,0.1,0.1], "SMOKE_Particles (Trapcode/Stardust)", w, h, 1.0);
    var morph = comp.layers.addShape(); morph.name = "MORPH_Guide_Paths (paste SVG masks here)";
    var logo = comp.layers.addSolid([0,0,0], "LOGO_3D_PNG (import render and replace)", w, h, 1.0);
    logo.guideLayer = true; // à remplacer par le PNG rendu depuis Blender

    // Text placeholders
    function addTextLayer(txt, tStart, tEnd){
        var t = comp.layers.addText(txt);
        t.startTime = tStart; t.outPoint = tEnd; t.inPoint = tStart;
        var td = t.property("Source Text").value;
        td.fontSize = 84; td.justification = ParagraphJustification.CENTER_JUSTIFY;
        td.fillColor = [1,1,1]; t.property("Source Text").setValue(td);
        t.property("Position").setValue([w/2, h-180]);
        return t;
    }
    addTextLayer("Créativité", 1.2, 3.5);
    addTextLayer("Technologie", 3.5, 6.0);
    addTextLayer("Fiabilité", 6.0, 8.5);

    // Lockup slogan
    var slog = comp.layers.addText("KarbonFix — l’essence du digital");
    var sd = slog.property("Source Text").value; sd.fontSize=64; sd.justification=ParagraphJustification.CENTER_JUSTIFY; sd.fillColor=[1,1,1];
    slog.property("Source Text").setValue(sd);
    slog.property("Position").setValue([w/2, h-120]);
    slog.startTime = 11.5; slog.inPoint=11.5; slog.outPoint = dur;

    // Marqueurs timeline
    function addMarker(t, name){
        var m = new MarkerValue(name);
        comp.markerProperty.setValueAtTime(t, m);
    }
    addMarker(0.0,  "Prelueur");
    addMarker(1.2,  "Spray");
    addMarker(3.5,  "Note2");
    addMarker(6.0,  "Intensification");
    addMarker(8.5,  "Morph start");
    addMarker(11.5, "Lockup");

    alert("KarbonFix setup terminé. Importez votre PNG du logo 3D et collez les paths du logo dans le calque MORPH_Guide_Paths.\nPlugins conseillés: Trapcode Particular/Stardust.");
    app.endUndoGroup();
})();
