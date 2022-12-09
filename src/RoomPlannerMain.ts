//Corey Wunderlich 2022
//https://www.wundervisionenvisionthefuture.com/

import {
    Scene, Engine, HemisphericLight,
    Vector3, ArcRotateCamera, Vector4,
    Mesh, MeshBuilder, StandardMaterial,
    Texture, ActionManager, AssetsManager,
    Axis, Color3, PBRMaterial, PointerDragBehavior,
    InstancedMesh
} from "@babylonjs/core";

import "@babylonjs/loaders";

export class RoomPlannerMain {
    private _scene: Scene;
    private _engine: Engine;
    private _canvas: HTMLCanvasElement;
    private _camera: ArcRotateCamera;
    private _asset_pool: Map<string, Mesh>;
    private _assets_manager: AssetsManager;
    constructor(canvas_id: string) {
        this._canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
        if (this._canvas == null) { throw "Could not find canvas"; }


        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        window.addEventListener('resize', () => { this._engine.resize(); })

        const over_head: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);

        this._camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 1, 0), this._scene);
        this._camera.attachControl(this._canvas, true);


        var uvs = new Array(6);
        uvs[0] = new Vector4(0, 0, 0, 0);
        uvs[1] = new Vector4(0, 0, 0, 0);
        uvs[2] = new Vector4(0, 0, 0, 0);
        uvs[3] = new Vector4(0, 0, 0, 0);
        uvs[4] = new Vector4(0, 0, 0, 0);
        uvs[5] = new Vector4(0, 0, 1, 1);
        const box = MeshBuilder.CreateBox("box", { width: 40, height: 30, depth: 30, faceUV: uvs, sideOrientation: Mesh.BACKSIDE }, this._scene);
        const box_material = new StandardMaterial("mat", this._scene);
        const floor_texture = new Texture("./models/hardwood.jpg");
        floor_texture.uScale = 8;
        floor_texture.vScale = 8;
        box_material.diffuseTexture = floor_texture;
        box.material = box_material;
        box.position.y = 15;


        box.actionManager = new ActionManager(this._scene);

        // box.actionManager.registerAction(new ExecuteCodeAction( ActionManager.OnPickTrigger, function(e){
        //     console.log(e);
        // }));

        this._asset_pool = new Map<string, Mesh>();

        this._scene.onPointerDown = (e, pick_result) => {
            if (e.button == 0) {
                if (pick_result.pickedPoint != null && pick_result.pickedMesh?.name == "box") {
                    const base_asset: Mesh | undefined = this._asset_pool.get("clothedtable");
                    if (base_asset == undefined) { return; }

                    const new_mesh: InstancedMesh = base_asset.createInstance("table");//clone();
                    new_mesh.position.copyFrom(pick_result.pickedPoint);
                    const obj_drag_behavior = new PointerDragBehavior({ dragPlaneNormal: Axis.Y });
                    obj_drag_behavior.useObjectOrientationForDragging = false;

                    new_mesh.addBehavior(obj_drag_behavior);
                }
                //console.log(pickResult);
            }
        }



        this._assets_manager = new AssetsManager(this._scene);
        this._assets_manager.addMeshTask("tabletask", "", "./models/", "RoundTable.obj").onSuccess = (task) => {
            task.loadedMeshes[0].name = "table";
            task.loadedMeshes[0].material = new StandardMaterial('table', this._scene);
            const table_material = new StandardMaterial("table", this._scene);
            table_material.diffuseColor = new Color3(.7, .5, .5);
            task.loadedMeshes[0].material = table_material;
        }
        this._assets_manager.addMeshTask("flowertask", "", "./models/", "MagnoliaOBJ.obj").onSuccess = (task) => {
            let merged = Mesh.MergeMeshes(task.loadedMeshes as Mesh[], true, true);
            if (merged == null) { return; }

            const flower_material = new StandardMaterial("flowers", this._scene);
            flower_material.diffuseColor = new Color3(1, 1, 1);
            merged.material = flower_material;
            merged.scaling = new Vector3(0.01, 0.01, 0.01);
            merged.position.y = .95;
        }

        this._assets_manager.addMeshTask("tableclothtask", "", "./models/", "TableCloth.obj").onSuccess = (task) => {
            let merged = Mesh.MergeMeshes(task.loadedMeshes as Mesh[], true, true);
            if (merged == null) { return; }

            const table_cloth_material = new PBRMaterial("cloth", this._scene);
            table_cloth_material.albedoColor = new Color3(.1, 0, .5);
            table_cloth_material.roughness = 1;

            merged.material = table_cloth_material;
            merged.scaling = new Vector3(0.0255, 0.0273, 0.0255);
            let obj_drag_behavior = new PointerDragBehavior({ dragPlaneNormal: Axis.Y });
            obj_drag_behavior.useObjectOrientationForDragging = false;
            this._asset_pool.set("clothedtable", merged.clone());
            merged.setEnabled(false);
            merged.addBehavior(obj_drag_behavior);



            let table2 = merged.clone();
            obj_drag_behavior = new PointerDragBehavior({ dragPlaneNormal: Axis.Y });
            obj_drag_behavior.useObjectOrientationForDragging = false;
            const red_cloth_material = new PBRMaterial("redcloth", this._scene);
            red_cloth_material.albedoColor = new Color3(1, 0.5, .5);
            red_cloth_material.roughness = 1;
            table2.material = red_cloth_material;
            table2.position.x = 3;

            table2.addBehavior(obj_drag_behavior);
        }

        this._assets_manager.onFinish = (tasks) => {
            // run the main render loop
            this._engine.runRenderLoop(() => {
                this._scene.render();
            });
        }

        this._assets_manager.load();

    }

}