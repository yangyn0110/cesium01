//最终确定的api  后期改变也是在这上面进行更改
function GeoEngine(viewer) {
    this.viewer = viewer;


    //总体关于节点统一一个东西 ： 获取到的节点 以选择模型时 返回的构件为准  并给没给节点添加一个parentModel属性 方便找回父对象
    //所以在primity方式下 返回的pick  和真实节点的关系 node = pick['node']
    //在3dtileset的方式下 返回3DTileFeature
    this.manageEntitySelectedNodes = [];
    this.managePromitySelectedNodes = [];
    this.managePointLinePlanSelect = [];
}

/*获取模型或节点的Id*/
GeoEngine.prototype.getObjectId = function (model) {
    //目前 项目中主要用到primity方式加载的glb模型和3dtile的加载模型方式
    //所以目前考虑这两种模型以及这两种模型节点id的获取  今后若有其他情况暂时先返回undefined 再进行添加
    if (!Cesium.defined(model)) {
        return;
    }
    if (model instanceof Cesium.Model || model instanceof Cesium.Entity) {//如果是primity的加载模型
        return model.id;
    } else if (model instanceof Cesium.Cesium3DTileset) {//3dtileset没有id属性 所以这里暂时先不做处理
        return undefined;
    } else if (model['node'] instanceof Cesium.ModelNode) {//节点  因为目前的node是以点选的pick为准  这是不太准确的  官网上的node= pick['node']; 所以这里暂时 去model['node']
        var node = model['node'];
        return node.id;
    } else if (model instanceof Cesium.Cesium3DTileFeature) {//暂时也未知
        return undefined;
    } else {//别的情况 目前不考虑  有了 再添加
        return null;
    }
}
/*获取模型或节点的name*/
GeoEngine.prototype.getObjectName = function (model) {
    if (!Cesium.defined(model)) {
        return;
    }
    if (model instanceof Cesium.Model || model instanceof Cesium.Entity) {//如果是primity的加载模型
        return model.name;
    } else if (model instanceof Cesium.Cesium3DTileset) {//3dtileset没有id属性 所以这里暂时先不做处理
        return undefined;
    } else if (model['node'] instanceof Cesium.ModelNode) {//节点  因为目前的node是以点选的pick为准  这是不太准确的  官网上的node= pick['node']; 所以这里暂时 去model['node']
        var node = model['node'];
        return node.name;
    } else if (model instanceof Cesium.Cesium3DTileFeature) {//暂时也未知
        return undefined;
    } else {//别的情况 目前不考虑  有了 再添加
        return null;
    }
}
/*获取模型下的所有节点
 */
GeoEngine.prototype.getPrimityNodes = function (primity) {//这个方法  应该是getPrimityOr3dtileNodes
    //目前返回模型的节点  要和点击时 选中的构件保持一致  并添加一个parentModel属性 方便找到父模型
    //目前 项目中主要用到primity方式加载的glb模型和3dtile的加载模型方式
    //所以目前考虑这两种模型节点的获取  今后若有其他情况 再进行添加
    //首先判断 模型类型
    if (!Cesium.defined(primity)) {
        return;
    }
    if (primity instanceof Cesium.Model) {//如果是primity的加载方式
        var nodes = primity._nodeCommands;

        var arr_nodes = [];
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i].command['_owner'];

            arr_nodes.push(node);
            node.parentModel = primity;
        }
        return arr_nodes;
    } else if (primity instanceof Cesium.Cesium3DTileset) {
        //目前还没 弄清楚这块怎么获取 所以先空下
//		Cesium3DTileFeature
    }
}

/*设置节点或模型的显隐---用于单个模型或节点*/
GeoEngine.prototype.setNodeOrModelVisible = function (singleModel, visible) {
    Cesium.Check.typeOf.object('singleModel', singleModel);
    if ('node' in singleModel && singleModel['node'] instanceof Cesium.ModelNode) {//如果是primity的pick
        var realNode = singleModel['node'];
        realNode.show = visible;
    } else if (singleModel instanceof Cesium.Cesium3DTileFeature) {//3dtileFeature
        singleModel.show = visible;
    } else if (singleModel instanceof Cesium.Model || singleModel instanceof Cesium.Entity || singleModel instanceof Cesium.Cesium3DTileset) {
        singleModel.show = visible;
    } else {//其他情况以后遇到再说
        return false;
    }

}
/*设置多个节点或模型的显隐*/
GeoEngine.prototype.setNodesOrModelsVisible = function (models, visible) {
    Cesium.Check.typeOf.object('models', models);
    for (var i = 0; i < models.length; i++) {
        var singleModel = models[i];
        if ('node' in singleModel && singleModel['node'] instanceof Cesium.ModelNode) {//如果是primity的pick
            var realNode = singleModel['node'];
            realNode.show = visible;
        } else if (singleModel instanceof Cesium.Cesium3DTileFeature) {//3dtileFeature
            singleModel.show = visible;
        } else if (singleModel instanceof Cesium.Model || singleModel instanceof Cesium.Entity || singleModel instanceof Cesium.Cesium3DTileset) {
            singleModel.show = visible;
        } else {//其他情况以后遇到再说
            return false;
        }
    }
}

/*设置节点的显隐  ---过时了*/
GeoEngine.prototype.setNodeVisible = function (node, visible) {
    /*注意因为目前节点的获取 都是以点击时的pick为准 并不是真正的官网上的节点 所以 node = pick['node']*/
    Cesium.Check.typeOf.object('node', node);

    if ('node' in node && node['node'] instanceof Cesium.ModelNode) {//如果是primity的pick
        var realNode = node['node'];
        realNode.show = visible;
    } else if (node instanceof Cesium.Cesium3DTileFeature) {//3dtileFeature
        node.show = visible;
    } else {//其他情况以后遇到再说
        return false;
    }

}
/*设置多个节点的显隐*/
GeoEngine.prototype.setNodesVisible = function (nodes, visible) {
    Cesium.Check.typeOf.object('nodes', nodes);

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if ('node' in node && node['node'] instanceof Cesium.ModelNode) {//如果是primity的pick
            var realNode = node['node'];
            realNode.show = visible;
        } else if (node instanceof Cesium.Cesium3DTileFeature) {//3dtileFeature
            node.show = visible;
        } else {//其他情况以后遇到再说
            return false;
        }
    }
}

/*设置单个模型的显隐--- 过时了*/
GeoEngine.prototype.setModelVisible = function (model, visible) {
    Cesium.Check.typeOf.object('model', model);

    model.show = visible;

}
/*设置多个模型的显隐  -- 过时了*/
GeoEngine.prototype.setModelsVisible = function (models, visible) {
    Cesium.Check.typeOf.object('models', models);

    for (var i = 0; i < models.length; i++) {
        var model = models[i];
        model.show = visible;
    }
}

/*设置多个模型和节点的颜色*///------------已整理
GeoEngine.prototype.setNodesOrModelColor = function (arr, color, method) {
    var instance = this;
    var viewer = this.viewer;
    if (arr.length <= 0) {
        return;
    }
    for (var i = 0; i < arr.length; i++) {
        var model = arr[i];
        instance.setNodeOrModelColor(model, color, method);
    }
}

// var viewer = this.cesiumViewer;
/*设置模型或节点的颜色*///------------已整理
GeoEngine.prototype.setNodeOrModelColor = function (model, color, method) {
    var instance = this;
    var viewer = this.viewer;
    if (!Cesium.defined(model)) {
        return;
    }
    var type = undefined;
    if (!method) {
        method = Cesium.ColorBlendMode.MIX;
    } else {
        if (method.toLocaleLowerCase() == 'replace') {//Replace  Highlight  highlight
            method = Cesium.ColorBlendMode.REPLACE;
        } else if (method.toLocaleLowerCase() == 'highlight') {
            method = Cesium.ColorBlendMode.HIGHLIGHT;
        } else {
            method = Cesium.ColorBlendMode.MIX;
        }
    }


    if (!true) {//如果颜色未定义 就让模型恢复到初始颜色
    } else {
        //'255,255,255,0.5'
        if (color) {
            var color = color.split(',');
            var color_set = {
                red: parseFloat(color[0]) / 255,
                green: parseFloat(color[1]) / 255,
                blue: parseFloat(color[2]) / 255,
                alpha: parseFloat(color[3]) ? parseFloat(color[3]) : 1.0
            };
        } else {
            var color_set = undefined;
        }
        //给模型颜色 附上着色方式

        //开始判断模型类型
        //先判断是整体模型  还是一个节点
        if (model instanceof Cesium.Entity) {//证明是entity方式加载进来的整体模型  可能是一个模型  也可能是点线面
            var entity_type = getEntityProperyName(model);
            if (entity_type == 'model') {
                if (color_set) {
                    model[entity_type].colorBlendMode = method;
                    model[entity_type].color = color_set;
                } else {
                    model[entity_type].color = Cesium.Color.WHITE;
                    model[entity_type].colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
                    model[entity_type].colorBlendAmount = 0.5
                }

            } else {
                setColorToEntityType(model);
            }
        } else if (model instanceof Cesium.Cesium3DTileset) {//3dtileset的方式
            if (color_set) {
                model.style = new Cesium.Cesium3DTileStyle({
                    color: 'vec4(' + color_set["red"] + ',' + color_set["green"] + ',' + color_set["blue"] + ',' + color_set["alpha"] + ')',
                });
            } else {
                model.style = new Cesium.Cesium3DTileStyle({color: 'vec4(1.0,1.0,1.0,1.0)'});
            }
        } else if (model instanceof Cesium.Model) {//promity方式加载进来的
            if (color_set) {
                model.colorBlendMode = method;
                model.color = color_set;
            } else {
                model.color = Cesium.Color.WHITE;
                model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
                model.colorBlendAmount = 0.5
            }

        } else {//目前  据我所知 cesium就这几种加载整体模型的方式  暂时认为下面的方式就是节点
            if (model instanceof Cesium.Cesium3DTileFeature) {//点击的是3dtile的一个构件
                if (color_set) {
                    model.color = color_set;
                } else {
                    model.color = Cesium.Color.WHITE
                }

            } else {
                var primities = viewer.scene.primitives._primitives;

                if (model.id instanceof Cesium.Entity) {

                    var entity = model.id;
                    //这里应该添加一步判断  如果是点线面的话  就按模型类型添加颜色
                    var entity_type = getEntityProperyName(entity);
                    if (entity_type == 'model') {

                        var NodeName = model.mesh._materials[0]['_name'];
                        for (var i = 0; i < primities.length; i++) {
                            if (primities[i].id && primities[i].id === entity) {
                                var primity = primities[i];
                                var material = primity.getMaterial(NodeName);
                                var ifExist = flagExist(material, instance.manageEntitySelectedNodes);
                                if (ifExist) {//不存在 证明没点击过  就给他设置一个初始属性
                                    var start_diffuse = material.getValue('diffuse');
                                    var start_shininess = material.getValue('shininess');
                                    var x = start_diffuse.x, y = start_diffuse.y, z = start_diffuse.z,
                                        w = start_diffuse.w;
                                    var s_diffuse = {"x": x, "y": y, "z": z, "w": w};
                                    model.s_diffuse = s_diffuse;
                                    model.s_shininess = start_shininess;
                                }

                                if (color_set) {

                                    material.setValue('diffuse', new Cesium.Cartesian4(color_set["red"], color_set["green"], color_set["blue"], 1));  // vec4
                                    material.setValue('shininess', 128);
                                } else {
                                    //这里要把节点颜色 单单在这个函数里做不到 所以对于节点颜色的还原 暂时先不处理
                                    material.setValue('diffuse', model.s_diffuse);  // vec4
                                    material.setValue('shininess', model.s_shininess);
                                }

                                break;
                            }
                        }
                    } else {
                        setColorToEntityType(entity);
                    }
                } else {
                    //这里对promity的节点进行设置颜色
                    var NodeName = model.mesh._materials[0]['_name'];
                    var primity = model['primitive'];
                    var material = primity.getMaterial(NodeName);
                    var ifExist = flagExist(material, instance.managePromitySelectedNodes);
                    if (ifExist) {//不存在 证明没点击过  就给他设置一个初始属性
                        var start_diffuse = material.getValue('diffuse');
                        var start_shininess = material.getValue('shininess');
                        var x = start_diffuse.x, y = start_diffuse.y, z = start_diffuse.z, w = start_diffuse.w;
                        var s_diffuse = {"x": x, "y": y, "z": z, "w": w};
                        model.s_diffuse = s_diffuse;
                        model.s_shininess = start_shininess;
                    }
                    if (color_set) {
                        material.setValue('diffuse', new Cesium.Cartesian4(color_set["red"], color_set["green"], color_set["blue"], 1));  // vec4
                    } else {

                        material.setValue('diffuse', model.s_diffuse);  // vec4
                        material.setValue('shininess', model.s_shininess);
                    }
                }
            }
        }
    }

    //判断数组里面是否存在 如果存在 就返回false  不存在就返回true  并添加到数组里面
    function flagExist(v, arr) {
        if (arr.length <= 0) {
            arr.push(v);
            return true;
        }
        for (var i = 0; i < arr.length; i++) {
            var value = arr[i];
            if (value == v) {//证明存在
                return false;
            }
        }
        arr.push(v);
        return true;
    }

    function getEntityProperyName(entity) {
        if (!Cesium.defined(entity)) {
            return
        }
        if (!(entity instanceof Cesium.Entity)) {
            return;
        }
        var propertyNames = entity.propertyNames;
        var model = entity;
        for (var i = 0; i < propertyNames.length; i++) {
            if (model[propertyNames[i]]) {
                var entity_type = propertyNames[i];
                return entity_type;
                break;
            }
        }
    }

    //根据entity的类型 进行着色
    function setColorToEntityType(entity) {
        //这里的参数必须是entity类型
        if (!Cesium.defined(entity)) {
            return
        }
        if ((entity instanceof Cesium.Entity)) {

            var propertyNames = entity.propertyNames;
            var model = entity;
            for (var i = 0; i < propertyNames.length; i++) {
                if (model[propertyNames[i]]) {
                    var entity_type = propertyNames[i];
                    var ifExist = flagExist(model, instance.managePointLinePlanSelect);
                    if(ifExist){//不存在 证明是第一次 点击 该点线 或面
                        if("color" in model[entity_type]){
                            var start_color = model[entity_type].color._value;
                            var red = start_color.red, blue=start_color.blue, green = start_color.green, alpha = start_color.alpha;
                            model.start_c = {red:red, blue:blue,green:green,alpha:alpha};
                        }else if('material' in model[entity_type]){
                            var start_color = model[entity_type].material.color._value;
                            var red = start_color.red, blue=start_color.blue, green = start_color.green, alpha = start_color.alpha;
                            model.start_c = {red:red, blue:blue,green:green,alpha:alpha};

                        }
                    }
                    if (entity_type == 'billboard' || entity_type == 'point') {//直接设置color为一类
                        if (color_set) {

                            model[entity_type].color = color_set;
                        } else {

                            model[entity_type].color = model.start_c;

                        }

                    } else if (entity_type == 'box' || entity_type == 'corridor' || entity_type == 'cylinder' ||
                        entity_type == 'ellipse' || entity_type == 'ellipsoid' || entity_type == 'path' || entity_type == 'plane'
                        || entity_type == 'polygon' || entity_type == 'polyline' || entity_type == 'polylineVolume' || entity_type == "rectangle"
                        || entity_type == 'wall'
                    ) {//设置材质为一类
                        if (color_set) {
                            model[entity_type].material = new Cesium.ColorMaterialProperty(color_set);
                        }else{
                            model[entity_type].material = new Cesium.ColorMaterialProperty(model.start_c);
                        }
                    }
                    break;
                }
            }
        }
    }
}

/*相机定位到制定构件*/
/*相机定位到模型的具体节点*///------------已整理
GeoEngine.prototype.setPositionNode = function (node) {
    //目前主要适用与promity模型的节点
    Cesium.Check.typeOf.object('node', node);
    var viewer = this.viewer;

    if (node instanceof Cesium.Cesium3DTileFeature) {

    } else if ('node' in node && node['node'] instanceof Cesium.ModelNode) {
        var model = node.parentModel;
        if (!model) {
            return;
        }
        var madelMatrix = model.modelMatrix;

        var node_name = node['node']['_name'];
        var gltf = model.gltf;
        var gltfNodes = gltf.nodes;
        var gltfMeshes = gltf.meshes;
        var node = model.getNode(node_name);
        var min = new Cesium.Cartesian3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        var max = new Cesium.Cartesian3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        var n = gltfNodes[node.id];
        var meshId = n.mesh;
        if (Cesium.defined(meshId)) {
            var mesh = gltfMeshes[meshId];

            var modelMesh = model.getMesh(mesh.name);
            var materials = modelMesh.materials;
            var materialsLength = materials.length;
            for (var j = 0; j < materialsLength; ++j) {
                material = materials[j];
            }

            var primitives = mesh.primitives;
            var primitivesLength = primitives.length;
            for (var i = 0; i < primitivesLength; ++i) {
                var positionAccessor = primitives[i].attributes.POSITION;
                if (Cesium.defined(positionAccessor)) {
                    var accessor = gltf.accessors[positionAccessor];
                    var extensions = accessor.extensions;
                    var accessorMin = accessor.min;
                    var accessorMax = accessor.max;
                    // If this accessor is quantized, we should use the decoded min and max
                    if (Cesium.defined(extensions)) {
                        var quantizedAttributes = extensions.WEB3D_quantized_attributes;
                        if (Cesium.defined(quantizedAttributes)) {
                            accessorMin = quantizedAttributes.decodedMin;
                            accessorMax = quantizedAttributes.decodedMax;
                        }
                    }

                    var aMin = Cesium.Cartesian3.fromArray(accessorMin, 0);
                    var aMax = Cesium.Cartesian3.fromArray(accessorMax, 0);
                    if (Cesium.defined(min) && Cesium.defined(max)) {
                        Cesium.Matrix4.multiplyByPoint(node.matrix, aMin, aMin);
                        Cesium.Matrix4.multiplyByPoint(node.matrix, aMax, aMax);
                        Cesium.Cartesian3.minimumByComponent(min, aMin, min);
                        Cesium.Cartesian3.maximumByComponent(max, aMax, max);
                    }
                }
            }
        }

        var boundingSphere = Cesium.BoundingSphere.fromCornerPoints(min, max);
        if (model._upAxis === Cesium.Axis.Y) {
            Cesium.BoundingSphere.transformWithoutScale(boundingSphere, Cesium.Axis.Y_UP_TO_Z_UP, boundingSphere);
        } else if (model._upAxis === Cesium.Axis.X) {
            Cesium.BoundingSphere.transformWithoutScale(boundingSphere, Cesium.Axis.X_UP_TO_Z_UP, boundingSphere);
        }

        var center = boundingSphere.center;
        var radius = boundingSphere.radius;
        var realP = new Cesium.Cartesian3;
        Cesium.Matrix4.multiplyByPoint(madelMatrix, center, realP);


        var llh = wordToLLH(realP);
        viewer.camera.flyTo({ //设置视角
            destination: Cesium.Cartesian3.fromDegrees(llh.lng, llh.lat, llh.alt + 50)
        });
    }


    function wordToLLH(wordP) {
        Cesium.Check.typeOf.object('wordP', wordP);
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian3 = wordP;
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {
            lng: lng,
            lat: lat,
            alt: alt
        }
    }

}

/*相机定位到对应的模型*///一整理
GeoEngine.prototype.zoomToPrimity = function (primity) {
    //目前主要针对的是primity方式加载的模型
    Cesium.Check.typeOf.object('primity', primity);
    var instance = this;
    var viewer = instance.viewer;
    if (primity instanceof Cesium.Cesium3DTileset) {
        //3dtleset的情况 等模型好了 具体研究  目前不考虑
        return false;
    } else if (primity instanceof Cesium.Model) {
        var modelMatrix = primity.modelMatrix;
        var boundingSpere = primity._boundingSphere;
        var center = boundingSpere.center;
        //这里先设成死的 后期传参
        var offser = primity.offset;
        var realOffset = new Cesium.Cartesian3;
        Cesium.Cartesian3.add(center, offser, realOffset);
        var position = new Cesium.Cartesian3;
        Cesium.Matrix4.multiplyByPoint(modelMatrix, realOffset, position);


        var llh = wordToLLH(position);
        viewer.camera.flyTo({ //设置视角
            destination: Cesium.Cartesian3.fromDegrees(llh.lng, llh.lat, llh.alt + 500)
        });
    }


    //世界坐标转经纬度
    function wordToLLH(wordP) {
        Cesium.Check.typeOf.object('wordP', wordP);
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian3 = wordP;
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {
            lng: lng,
            lat: lat,
            alt: alt
        }
    }


}

/*模型摆放的api  同样只考虑了promity的方式*/
//企业下的模型
//orientation
GeoEngine.prototype.placedEnterprisePrimities = function (primities) {
    var viewer = this.viewer;
    Cesium.Check.typeOf.object('primities', primities);
    if (primities.length <= 0) {
        return;
    }
    //整体思路 重点是算出：摆放时的方向  向上  向右  向前 这三个方向   以及旋转时候的heading pitch roo
    //上方向根据企业的位置可以得出   右方向根据相机的右方向得出（视图矩阵的逆矩阵可以得出） 前方向由上方向和右方向的叉积得出
    //剩下的 就是简单的 组织逻辑
    var QYInfo = {orientation:{}};
    var primities = primities;
    var viewer = viewer, scene = viewer.scene;
    camera = viewer.scene.camera;

    //三个方向
    var up = new Cesium.Cartesian3, rightDir = new Cesium.Cartesian3, at = new Cesium.Cartesian3;
    var moveDir = new Cesium.Cartesian3();

    var cameraPos = new Cesium.Cartesian3;
    //移动和旋转的速度
    var speed = 10, rotate_delta = 0.006;
    var modelMatrix = primities[0].modelMatrix;
    var modelMatrix_start = new Cesium.Matrix4;
    modelMatrix.clone(modelMatrix_start);
    var qiYP = new Cesium.Cartesian3;
    Cesium.Matrix4.getColumn(modelMatrix, 3, qiYP);


    //得出上方向
    Cesium.Cartesian3.normalize(qiYP, up);


    //得出旋转时候的heading pitch roll
    var hpr = modelMatrixToHPR(modelMatrix, scene);
    var heading = hpr.heading, pitch = hpr.pitch, roll = hpr.roll;


    var flags = {
        //记录是否在查看地图，也就是记录是否点击了鼠标或键盘
        looking: false,
        //记录键盘的前后上下左右
        moveForward: false,
        moveBackward: false,
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        shift: false,
        bUpdate: false
    };


    //获得键盘keydown事件
    document.addEventListener('keydown', function (e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags.bUpdate = true;
            flags[flagName] = true;
        }
    }, false);


    //获得键盘keyup事件
    document.addEventListener('keyup', function (e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags.bUpdate = false;
            flags[flagName] = false;
        }
    }, false);


    viewer.clock.onTick.addEventListener(function (clock) {
        if (!flags.bUpdate) {
            return;
        }


        var bMove = false;
        var bRotate = false;

        if (flags.shift) //如果点击shift的时候
        {
            if (flags.moveLeft) //A键
            {
                bRotate = true; //绕的的z轴逆时针转      0.02
                heading -= rotate_delta;

            } else if (flags.moveRight) //右键  绕z轴顺势针转
            {
                bRotate = true;
                heading += rotate_delta;
            } else if (flags.moveForward) //w键 绕y轴顺时针转
            {
                bRotate = true;
                roll -= rotate_delta;
            } else if (flags.moveBackward) //s键 绕y轴逆时针转
            {
                bRotate = true;
                roll += rotate_delta;

            } else if (flags.moveUp) //e键  绕x轴顺时针转
            {
                bRotate = true;
                pitch -= rotate_delta;
            } else if (flags.moveDown) //Q键  绕x 轴逆时针转
            {
                bRotate = true;
                pitch += rotate_delta;
            }
            if (bRotate) {
                hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

                modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(qiYP, hpr);
                for (var i = 0; i < primities.length; i++) {
                    var primity = primities[i];
                    primity.modelMatrix = modelMatrix;
                }
                //
                var hpr = modelMatrixToHPR(modelMatrix,scene);
                var LLH = wordToLLH(qiYP);
                QYInfo.orientation.heading = hpr.heading;
                QYInfo.orientation.pitch = hpr.pitch;
                QYInfo.orientation.roll = hpr.roll;
                QYInfo.orientation.lng =LLH.lng;
                QYInfo.orientation.lat = LLH.lat;
                QYInfo.orientation.alt = LLH;

            }
            return;
        }
        var viewMatrix = viewer.scene.camera.inverseViewMatrix;
        Cesium.Matrix4.getColumn(viewMatrix, 3, cameraPos);
        var axes4 = new Cesium.Cartesian4();
        Cesium.Matrix4.getColumn(viewMatrix, 0, axes4);
        rightDir = new Cesium.Cartesian3(axes4.x, axes4.y, axes4.z);
        Cesium.Cartesian3.normalize(rightDir, rightDir);

        at = new Cesium.Cartesian3();
        Cesium.Cartesian3.cross(up, rightDir, at);
        Cesium.Cartesian3.normalize(at, at);
        if (flags.moveLeft) //A键
        {
            bMove = true;
            rightDir.clone(moveDir);
            Cesium.Cartesian3.multiplyByScalar(moveDir, -1, moveDir);
        } else if (flags.moveRight) {
            bMove = true;
            rightDir.clone(moveDir);
        } else if (flags.moveForward) {
            bMove = true;
            at.clone(moveDir);
        } else if (flags.moveBackward) {
            bMove = true;
            at.clone(moveDir);
            Cesium.Cartesian3.multiplyByScalar(moveDir, -1, moveDir);
        } else if (flags.moveUp) {
            bMove = true;
            up.clone(moveDir);
        } else if (flags.moveDown) {
            bMove = true;
            up.clone(moveDir);
            Cesium.Cartesian3.multiplyByScalar(moveDir, -1, moveDir);
        }
        updateModelPosPose(bMove, bRotate, clock.currentTime);
    });

    function updateModelPosPose(bMove) {
        if (bMove) {
            modelMatrix = primities[0].modelMatrix;
            //获取当前的位置 加上移动速度 得出新的位置 和新的矩阵  从而移动模型
            var currentPosition = new Cesium.Cartesian3;
            Cesium.Matrix4.getTranslation(modelMatrix, currentPosition);
            var distance = new Cesium.Cartesian3, new_position = new Cesium.Cartesian3;
            Cesium.Cartesian3.multiplyByScalar(moveDir, speed, distance);
            Cesium.Cartesian3.add(currentPosition, distance, new_position);
            modelMatrix[12] = new_position.x, modelMatrix[13] = new_position.y, modelMatrix[14] = new_position.z;
            for (var i = 0; i < primities.length; i++) {
                var primity = primities[i];
                primity.modelMatrix = modelMatrix;
            }

            Cesium.Matrix4.getTranslation(modelMatrix, qiYP);


        }
    }


    function wordToLLH(wordP) {
        Cesium.Check.typeOf.object('wordP', wordP);
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian3 = wordP;
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {
            lng: lng,
            lat: lat,
            alt: alt
        }
    }


    //判断键盘的输入
    function getFlagForKeyCode(keyCode) {
        switch (keyCode) {
            case 16:
                return 'shift';
            case 'W'.charCodeAt(0):
                return 'moveForward';
            case 'S'.charCodeAt(0):
                return 'moveBackward';
            case 'Q'.charCodeAt(0):
                return 'moveDown';
            case 'E'.charCodeAt(0):
                return 'moveUp';
            case 'D'.charCodeAt(0):
                return 'moveRight';
            case 'A'.charCodeAt(0):
                return 'moveLeft';
            case 'R'.charCodeAt(0): {
                //当点击R键的时候 将模型的偏航角归零

                heading = 0;
                pitch = 0;
                roll = 0;
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var newMatrix = new Cesium.Matrix4;
                newMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(qiYP, hpr)
                for (var i = 0; i < primities.length; i++) {
                    var primity = primities[i];
                    primity.modelMatrix = newMatrix;
                }
                return undefined;
            }
            case 188: {
                //左括号是减速
                rotate_delta *= 0.8;
                speed *= 0.8;
                break;
            }

            case 190: {

                //加速  -- 右括号
                rotate_delta *= 1.2;
                speed *= 1.2;
                break;
            }
            case 32: {
                //吧模型的模型矩阵恢复为初始值
                for (var i = 0; i < primities.length; i++) {
                    var primity = primities[i];
                    primity.modelMatrix = modelMatrix_start;
                }
                var camera_flyTo = new Cesium.Cartesian3;
                Cesium.Matrix4.getTranslation(modelMatrix_start, camera_flyTo);
                var llh = wordToLLH(camera_flyTo);
                viewer.camera.flyTo({ //设置视角
                    destination: Cesium.Cartesian3.fromDegrees(llh.lng, llh.lat, llh.alt + 500)
                });
                //把相机定位到初始的位置
                break;
            }
            case 'L'.charCodeAt(0): {

                //addAxis(qiYP, up, rightDir, at);
                return undefined;
            }
            default:
                return undefined;
        }
    }


    function addAxis(position, up, right, at) {
        var upDir = new Cesium.Cartesian3, rightDir = new Cesium.Cartesian3, atDir = new Cesium.Cartesian3;
        var startP = new Cesium.Cartesian3;
        position.clone(startP), up.clone(upDir), right.clone(rightDir), at.clone(atDir);

        Cesium.Cartesian3.multiplyByScalar(upDir, 100, upDir);
        Cesium.Cartesian3.multiplyByScalar(rightDir, 100, rightDir);
        Cesium.Cartesian3.multiplyByScalar(atDir, 100, atDir);

        var endP_up = new Cesium.Cartesian3, endP_right = new Cesium.Cartesian3, endP_at = new Cesium.Cartesian3;
        Cesium.Cartesian3.add(startP, upDir, endP_up);
        Cesium.Cartesian3.add(startP, rightDir, endP_right);
        Cesium.Cartesian3.add(startP, atDir, endP_at);
        addLine(startP, endP_up, Cesium.Color.GREEN);
        addLine(startP, rightDir, Cesium.Color.GREEN);
        addLine(startP, endP_at, Cesium.Color.GREEN);

    }

    function addLine(sPos, ePos, linecolor) {
        var pts = [sPos, ePos];
        viewer.entities.add({
            polyline: {
                positions: pts,
                width: 10.0,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: linecolor,
                    glowPower: 0.25
                })
            }
        });
    }

    function modelMatrixToHPR(Matrix, scene) {
        Cesium.Check.typeOf.object('Matrix', Matrix);
        var heading, pitch, roll;
        var ellipsoid = scene.globe.ellipsoid;
        var modelMatrix = new Cesium.Matrix4;
        Matrix.clone(modelMatrix);

        var rotateMatrix = new Cesium.Matrix3;
        Cesium.Matrix4.getRotation(modelMatrix, rotateMatrix);
        var axes3 = new Cesium.Cartesian3;
        Cesium.Matrix3.getColumn(rotateMatrix, 1, axes3)

        var modelAt = new Cesium.Cartesian3(axes3.x, axes3.y, axes3.z);

        var modelUp = new Cesium.Cartesian3;
        Cesium.Matrix3.getColumn(rotateMatrix, 2, modelUp);


        var position = new Cesium.Cartesian3;
        Cesium.Matrix4.getTranslation(modelMatrix, position);
        //笛卡尔转经纬度
        var lla = ellipsoid.cartesianToCartographic(position);

        var ypr = new Cesium.Cartesian3();

        var hpr = Convert84LLAVecToHPR(lla, modelAt, modelUp, ypr);

        heading = Cesium.Math.toRadians(ypr.x);

        pitch = Cesium.Math.toRadians(ypr.y);
        roll = Cesium.Math.toRadians(ypr.z);

        return {
            'heading': heading,
            'pitch': pitch,
            'roll': roll
        }

    }

    function Convert84LLAVecToHPR(lla, at, up, ypr) {
        if (!lla) //模型的笛卡尔坐标
        {
            return false;
        }

        var matrix = new Cesium.Matrix4;
        computeLocalToWorldTransformFromLatLongHeight(matrix, lla.latitude, lla.longitude, lla.height);

        Cesium.Matrix4.inverse(matrix, matrix);

        var _at = new Cesium.Cartesian3();
        Cesium.Matrix4.multiplyByPointAsVector(matrix, at, _at);
        var _up = new Cesium.Cartesian3();
        Cesium.Matrix4.multiplyByPointAsVector(matrix, up, _up);
        Cesium.Cartesian3.normalize(_at, _at);
        Cesium.Cartesian3.normalize(_up, _up);

        ConvertPoseVecToAngle(_at, _up, ypr);
        return true;
    }

    function computeLocalToWorldTransformFromLatLongHeight(matrix, latitude, longitude, height, result) {
        var pos = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(longitude), Cesium.Math.toDegrees(latitude), height);

        var matrix_temp = new Cesium.Matrix4;
        Cesium.Transforms.northUpEastToFixedFrame(pos, Cesium.Ellipsoid.WGS84, matrix_temp);

        Cesium.Matrix4.setTranslation(matrix, pos, matrix);
        matrix[15] = 1;

        computeCoordinateFrame(matrix, latitude, longitude, matrix)
    }

    function computeCoordinateFrame(matrix, latitude, longitude, result) {
        // Compute up vector
        var up = new Cesium.Cartesian4(Math.cos(longitude) * Math.cos(latitude), Math.sin(longitude) * Math.cos(latitude), Math.sin(latitude), 0);

        // Compute east vector
        var east = new Cesium.Cartesian4(-Math.sin(longitude), Math.cos(longitude), 0, 0);

        // Compute north vector = outer product up x east
        var north = new Cesium.Cartesian4();
        Cesium.Cartesian3.cross(up, east, north, 0);

        // set matrix
        Cesium.Matrix4.setColumn(matrix, 0, east, result);
        Cesium.Matrix4.setColumn(matrix, 1, north, result);
        Cesium.Matrix4.setColumn(matrix, 2, up, result);
    }

    function ConvertPoseVecToAngle(at, up, ypr) {
        var _at = new Cesium.Cartesian3(at.x, at.y, at.z);
        var _up = new Cesium.Cartesian3(up.x, up.y, up.z);
        Cesium.Cartesian3.normalize(_at, _at);
        Cesium.Cartesian3.normalize(_up, _up);

        if (_at.z > 1)
            _at.z = 1;
        if (_at.z < -1)
            _at.z = -1;

        ypr.y = Math.asin(_at.z);

        _at.z = 0;

        var atLen = Cesium.Cartesian3.magnitude(_at);
        if (atLen <= 0.01) {
            ypr.z = 0;

            _up.z = 0;
            Cesium.Cartesian3.normalize(_up, _up);

            if (_up.y < -1)
                _up.y = -1;
            if (_up.y > 1)
                _up.y = 1;

            ypr.x = Math.acos(_up.y);
            if (_up.x < 0)
                ypr.x = -ypr.x;

            pitch = Cesium.Math.toDegrees(ypr.y);
            ypr.x = Cesium.Math.toDegrees(ypr.x);

            if (at.z > 0)
                ypr.x = ypr.x - 180.0;

            return;
        } else {
            Cesium.Cartesian3.normalize(_at, _at);
            if (_at.y < -1)
                _at.y = -1;
            if (_at.y > 1)
                _at.y = 1;

            ypr.x = Math.acos(_at.y);
            if (_at.x <= 0)
                ypr.x = -ypr.x;
        }

        var right1 = new Cesium.Cartesian3(0, 0, 1);
        Cesium.Cartesian3.cross(at, right1, right1);
        var right2 = new Cesium.Cartesian3();
        Cesium.Cartesian3.cross(at, up, right2);
        Cesium.Cartesian3.normalize(right1, right1);
        Cesium.Cartesian3.normalize(right2, right2);

        var aaa = Cesium.Cartesian3.dot(right1, right2);

        if (aaa > 1)
            aaa = 1;
        if (aaa < -1)
            aaa = -1;

        ypr.z = -Math.acos(aaa);
        var aa = new Cesium.Cartesian3();
        Cesium.Cartesian3.cross(right2, right1, aa);

        Cesium.Cartesian3.normalize(aa, aa);

        var aa_at = Cesium.Cartesian3.dot(aa, at);
        if (aa_at < 0) {
            ypr.z = -ypr.z;
        }

        ypr.x = Cesium.Math.toDegrees(ypr.x);

        ypr.y = Cesium.Math.toDegrees(ypr.y);

        ypr.z = Cesium.Math.toDegrees(ypr.z);

    }


};

/*添加企业下的模型  --- 这里也是只考虑了promity的加载方式 后期3dtile肯定要更改代码*/
GeoEngine.prototype.addPrimities = function (x, y, z, h, p, r, dx, dy, dz, models, onLoadCallback, bool) {

    if (!x && !y && !z && !h && !p && !r && !dx && !dy && !dz) {
        return
    }
    if (!models && models.length <= 0) {
        return;
    }
    var viewer = this.viewer;
    var position = Cesium.Cartesian3.fromDegrees(x, y, z);
    h = Cesium.Math.toRadians(h);
    p = Cesium.Math.toRadians(p);
    r = Cesium.Math.toRadians(r);
    var hpr = new Cesium.HeadingPitchRoll(h, p, r);
    var offset = new Cesium.Cartesian3(dx, dy, dz);
    var modelMatrix = getModelMtrix(position, hpr);
    var scene = viewer.scene;
    var models = models;
    var manageloadModes = [];
    var len_Models = models.length;
    var loadCount = 0;
    var bool = bool ? bool : undefined;
    main();

    function main() {
        for (var i = 0; i < models.length; i++) {
            var url = models[i];
            addPrimity(scene, url, i, modelMatrix, onLoadPrimity);
        }
    }


    function onLoadPrimity(model, i) {
        loadCount++;
        manageloadModes[i] = model;
        removeNodeOffset(model);
        if (loadCount == len_Models) {
            //证明加载完毕
            onLoadCallback(manageloadModes);
        }

    }

    function removeNodeOffset(model) {
        if (dx == 0 && dy == 0 && dz == 0) {
            return;
        }
        var gltfNodes = model.gltf.nodes;
        for (var j = 0; j < gltfNodes.length; ++j) {
            var n = gltfNodes[j];
            if (Cesium.defined(n.mesh)) {
                var node = model.getNode(n.name);
                node.matrix = Cesium.Matrix4.multiplyByTranslation(node.matrix, offset, node.matrix);
            }
        }
    }


    function addPrimity(scene, url, eq, matrix, callback) {
        if (!scene) {
            return
        }
        ;
        if (!url) {
            return
        }
        ;
        Cesium.Check.typeOf.object('matrix', matrix);
        if (bool === '3dtile') {
            var primity = scene.primitives.add(new Cesium.Cesium3DTileset({
                url: url,//模型文件相对路径
//          	modelMatrix : matrix,
            }));
        } else {
            var primity = scene.primitives.add(Cesium.Model.fromGltf({
                url: url,//模型文件相对路径
                modelMatrix: matrix,
            }));

        }
        primity.readyPromise.then(function (model) {
            model.offset = new Cesium.Cartesian3;
            offset.clone(model.offset);
            callback(model, eq);
        });

    }

    function getModelMtrix(p, hpr) {
        Cesium.Check.typeOf.object('p', p);
        Cesium.Check.typeOf.object('hpr', hpr);
        var modelMatrix = new Cesium.Matrix4;
        modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(p, hpr)
        return modelMatrix;
    }
}

/*设置企业参数*/
GeoEngine.prototype.setModelCompanyInfo = function (models, companyInfo) {

    if (!Cesium.defined(models)) {
        return;
    }
    Cesium.Check.typeOf.object('models', models);
    if (models.length <= 0) {
        return;
    }
    if (!Cesium.defined(companyInfo)) {
        return;
    }
    Cesium.Check.typeOf.object('companyInfo', companyInfo);

    if (!("orientation" in companyInfo)) {
        return;
    }
    //思路：根据提供的新的企业信息，算出新的模型矩阵  应用到企业的模型上
    var position = Cesium.Cartesian3.fromDegrees(companyInfo['orientation'].x, companyInfo['orientation'].y, companyInfo['orientation'].z);
    var orientation = companyInfo['orientation'];
    var h = Cesium.Math.toRadians(orientation.heading);
    var p = Cesium.Math.toRadians(orientation.pitch);
    var r = Cesium.Math.toRadians(orientation.roll);
    var hpr = new Cesium.HeadingPitchRoll(h, p, r);
    var newMatrix = getMatrix(position, hpr);
    main();

    function main() {
        for (var i = 0; i < models.length; i++) {
            var primity = models[i];
            console.log(primity);
            if (!('modelMatrix' in primity)) {
                return;
            }
            primity.modelMatrix = newMatrix;
        }
    }

    function getMatrix(position, hpr) {
        Cesium.Check.typeOf.object('position', position);
        Cesium.Check.typeOf.object('hpr', hpr);
        var modelMatrix = new Cesium.Matrix4;
        modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
        return modelMatrix;
    }
}


/*获取选中的模型  --- 目前也是使用与promity*/
GeoEngine.prototype.testObjectSelected = function (x, y, isModel) {
    if (!Cesium.defined(x) || !Cesium.defined(y)) {
        return;
    }
    var pickType = undefined;
    var viewer = this.viewer;
    var scene = viewer.scene;
    var movement = {x: x, y: y};
    if (isModel == undefined) {
        pickType = 'node';
    } else {
        var pick = scene.pick(movement);
        if (!pick) {
            return;
        }
        if ('id' in pick) {
            var idValue = pick['id'];
            if (idValue instanceof Cesium.Entity) {
                return idValue;
            } else {
                //判断是不是primity方式加进去的
                var primity = pick['primitive'];
                if (primity instanceof Cesium.Model) {
                    return primity;
                }
            }
        } else {
            //应该是3dtile
            if ('_batchId' in pick) {
                var cesium3dtileset = pick['content']['tileset'];
                return cesium3dtileset;
            }
        }

    }
    if (pickType == 'node') {
        var pick = scene.pick(movement);

        if (!pick) {
            return null;
        }
        //先判断3dtile  再判断entity  在判断promity  最后判断点线面
        return pick;
    }
}

/*删除制定的模型*/
GeoEngine.prototype.removeModel = function (model) {

    var viewer = this.viewer;
    var scene = viewer.scene;
    if(model instanceof  Cesium.Entity){

    }else{

    }
    var PrimitiveCollection = scene.primitives;
    PrimitiveCollection.destroyPrimitives = false;

    if (PrimitiveCollection.contains(model)) {
        PrimitiveCollection.remove(model);
    }
}
/*添加制定模型*/
GeoEngine.prototype.addModel = function (model) {
    var viewer = this.viewer;
    var scene = viewer.scene;
    var PrimitiveCollection = scene.primitives;
    if (!(PrimitiveCollection.contains(model))) {
        PrimitiveCollection.add(model);
    }
}