

    function GeoEngine(cesiumViewer) {

        this.cesiumViewer = cesiumViewer;
        this.scene = cesiumViewer.scene;
        this.camera = cesiumViewer.camera;
        this.canvas = cesiumViewer.scene.canvas;

        var handler = new Cesium.ScreenSpaceEventHandler(this.canvas);

        if(cesiumViewer.infoBox && cesiumViewer.infoBox['_container'].style.display != 'none') {
            cesiumViewer.infoBox['_container'].style.display = 'none';
        }
        if(cesiumViewer.selectionIndicator && cesiumViewer.selectionIndicator['_container'].style.display != 'none') {
            cesiumViewer.selectionIndicator['_container'].style.display = 'none';
        }
        var keyEvent = {
            'LEFT_CLICK': Cesium.ScreenSpaceEventType.LEFT_CLICK, // 左键单机
            'LEFT_DOUBLE_CLICK': Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, // 左键双击
            'LEFT_DOWN': Cesium.ScreenSpaceEventType.LEFT_DOWN,
            'LEFT_UP': Cesium.ScreenSpaceEventType.LEFT_UP,
            'MIDDLE_CLICK ': Cesium.ScreenSpaceEventType.MIDDLE_CLICK,
            'MIDDLE_DOWN ': Cesium.ScreenSpaceEventType.MIDDLE_DOWN,
            'MIDDLE_UP': Cesium.ScreenSpaceEventType.MIDDLE_UP,
            'MOUSE_MOVE ': Cesium.ScreenSpaceEventType.MOUSE_MOVE,
            'PINCH_END ': Cesium.ScreenSpaceEventType.PINCH_END,
            // 'PINCH_MOVE ': Cesium.ScreenSpaceEventType.PINCH_MOVE,
            'PINCH_START  ': Cesium.ScreenSpaceEventType.PINCH_START,
            // 'RIGHT_CLICK ': Cesium.ScreenSpaceEventType.RIGHT_CLICK,
            'RIGHT_DOWN ': Cesium.ScreenSpaceEventType.RIGHT_DOWN,
            'RIGHT_UP  ': Cesium.ScreenSpaceEventType.RIGHT_UP,
            'WHEEL': Cesium.ScreenSpaceEventType.WHEEL
        };
        this.start = function() {
            // 不处理。
        }

        this.stop = function() {
            // 不处理。
        }

        this.getMatrix4 = function(l, w, h, heading, pitch, roll){
            var heading = heading * 180 / Math.PI;
            var pitch = pitch * 180 / Math.PI;
            var roll = roll * 180 / Math.PI;
            var p = Cesium.Cartesian3.fromDegrees(l, w, h);
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var m3 = new Cesium.Matrix3;
            Cesium.Matrix3.fromHeadingPitchRoll(hpr, m3);
            var m4 = new Cesium.Matrix4;
            Cesium.Matrix4.fromRotationTranslation(m3, p, m4);
            return m4;
        }

        /**
         * 增加折线。
         */
        this.addPolyline = function(name, locations, lineWidth, lineColor) {
            if(!lineWidth) lineWidth = 2;
            if(!lineColor) lineColor = "255,0,0";

            // 转换颜色。
            var ss = lineColor.split(',');
            var color = {};
            Cesium.Color.fromBytes(ss[0], ss[1], ss[2], 255, color);
            console.log(color);
            if(!locations){return}
            // 转换坐标。
            var degreesArrayHeights = [];
            for(var i = 0; i < locations.length; i++) {
                degreesArrayHeights.push(locations[i].x);
                degreesArrayHeights.push(locations[i].y);
                degreesArrayHeights.push(locations[i].z);
            }
            // 增加折线。
            var entity = this.cesiumViewer.entities.add({
                name : name,
                polyline : {
                    positions : Cesium.Cartesian3
                        .fromDegreesArrayHeights(degreesArrayHeights),
                    width : lineWidth,
                    material : new Cesium.PolylineOutlineMaterialProperty(
                        {
                            color : color
                        })
                }
            });
            entity.initColor = color;
            if (entity) {
                entity.objectType = "polyline";
            }
            return entity;
        }

        /**
         * 增加多边形。
         */
        this.addPolygon = function(name, locations) {
            // 转换坐标。
            if(!locations){return;}
            var degreesArrayHeights = [];
            for(var i = 0; i < locations.length; i++) {
                degreesArrayHeights.push(locations[i].x);
                degreesArrayHeights.push(locations[i].y);
                degreesArrayHeights.push(locations[i].z);
            }
            // 增加多边形。
            var entity = this.cesiumViewer.entities.add({
                name: name,
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(degreesArrayHeights),
                    height : 0,
                    perPositionHeight: true,
                    material : Cesium.Color.RED,// 使用红色，绿色，蓝色和alpha值指定的颜色，范围从0（无强度）到1.0（全强度）。
                    outline: true,
                    outlineColor: Cesium.Color.BLACK
                }
            });
            if (entity) {
                entity.objectType = "polygon";
            }
            return entity;
        }

        this.addPoint = function(name, location, radius, color, lineWidth, lineColor, label, fontName, fontSize) {
            if(!Cesium.defined(color)) color = "255,255,255";
            if(!Cesium.defined(name)){return;}
            if(!lineWidth) lineWidth = 0;
            if(lineWidth > 0 && !lineColor) lineColor = "255,0,0";

            // 转换填充颜色。
            var ss = color.split(',');
            var cesiumColor = {};
            Cesium.Color.fromBytes(ss[0], ss[1], ss[2], 255, cesiumColor);
            // 转换线颜色。
            var cesiumLineColor = null;
            if(lineColor) {
                var ss = lineColor.split(',');
                cesiumLineColor = {};
                Cesium.Color.fromBytes(ss[0], ss[1], ss[2], 255, cesiumLineColor);
            }
            // 增加点。
            var cesiumPoint = {
                color: cesiumColor,
                pixelSize: radius * 2
            };
            if(lineWidth > 0) {
                cesiumPoint.outlineWidth = lineWidth;
            }
            if(cesiumLineColor) {
                cesiumPoint.outlineColor = cesiumLineColor;
            }
            if(!fontName) {
                fontName = "monospace";
            }
            if(!fontSize) {
                fontSize = "11pt";
            }
            var entity = this.cesiumViewer.entities.add({ // 加点
                name: name,
                label: { // 文字标签
                    text: label,
                    font: fontSize + ' ' + fontName,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直方向以底部来计算标签的位置
                    pixelOffset: new Cesium.Cartesian2(0, -40) // 偏移量
                },
                position: Cesium.Cartesian3.fromDegrees(location.x, location.y, location.z),
                point: cesiumPoint
            });
            if (entity) {
                entity.objectType = "point";
            }
            return entity;
        }

        /**
         * 增加标记。
         */
        this.addMarker = function(name, location, imageUrl, imageWidth, imageHeight, text, fontName, fontSize) {

            if(!Cesium.defined(name)){return;}
            if(!imageUrl) {
                GeoUtils.throwError("未设置图片地址。");
            }
            if(!imageWidth) {
                imageWidth = "32";
            }
            if(!imageHeight) {
                imageHeight = "32";
            }
            if(!fontName) {
                fontName = "monospace";
            }
            if(!fontSize) {
                fontSize = "11pt";
            }

            var entity = this.cesiumViewer.entities.add({
                name: name,
                position: Cesium.Cartesian3.fromDegrees(location.x, location.y, location.z),
                point: null,
                label: { // 文字标签
                    text: text,
                    font: fontSize + ' ' + fontName,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直方向以底部来计算标签的位置
                    pixelOffset: new Cesium.Cartesian2(0, -40) // 偏移量
                },
                billboard: { // 图标
                    image: imageUrl,
                    width: imageWidth,
                    height: imageHeight
                },
            });
            if (entity) {
                entity.objectType = "marker";
            }
            return entity;
        }

        /**
         * 增加模型。
         *
         * @param {Object}
         *            url 模型地址。
         * @param {Object}
         *            orientation 模型方位。
         */
        this.addModel = function(name, url, orientation, scale) {
            if(!Cesium.defined(orientation) && !Cesium.defined(url)) return;

            var s = scale == undefined ? 1 : scale;
            var d = Cesium.Cartesian3.fromDegrees(orientation.x, orientation.y, orientation.z);
            var o = null;
            if(orientation.heading != undefined &&
                orientation.pitch != undefined &&
                orientation.roll != undefined) {
                o = {
                    heading: Cesium.Math.toRadians(orientation.heading), // 默认值
                    pitch: Cesium.Math.toRadians(orientation.pitch == undefined ? -90.0 : orientation.pitch), // 默认值
                    roll: Cesium.Math.toRadians(orientation.roll) // 默认值
                };
            }
            var entity
            if(o == null) {
                entity = this.cesiumViewer.entities.add({
                    position: d,
                    name: name,
                    model: {
                        uri: url,
                        scale: s
                    }
                });
            } else {
                var hpr = new Cesium.HeadingPitchRoll(o.heading, o.pitch, o.roll);
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(d, hpr);
                entity = this.cesiumViewer.entities.add({
                    position: d,
                    orientation: orientation,
                    name: name,
                    model: {
                        uri: url,
                        scale: scale
                    }
                });
            }
            if (entity) {
                entity.objectType = "model";
            }
            return entity;
        }

        this.add3DTilesetModel = function(name, url, orientation, scale) {
            if(!Cesium.defined(url)) return;
            var scene = this.cesiumViewer.scene;
            console.log(GeoUtils.jsonToStr(orientation));
            var tileset = scene.primitives.add(new Cesium.Cesium3DTileset({
                url : url,
                modelMatrix : this.getMatrix4(116.721854788,23.3692661,5,135,0,0)
            }));
            console.log(tileset.modelMatrix);
            tileset.objectType = "tileset";
// caller = this;
// tileset.readyPromise.then(function() {
// var boundingSphere = tileset.boundingSphere;
// caller.cesiumViewer.camera.viewBoundingSphere(boundingSphere, new
// Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius * 2));
// caller.cesiumViewer.camera.lookAtTransform(caller.getMatrix4(116.721854788,23.3692661,5,115,0,0));
// }).otherwise(function(error) {
// GeoUtils.throwError(error);
// });

            return tileset;
        }

        /**
         * 增加企业模型。
         */
        this.addPrimityModel = function(url, companyInfo, callback,caller) {
            if (!this.cesiumViewer) return;
            if(!url){return;}
            if (!companyInfo.location || !companyInfo.orientation) return;

            var orientation = companyInfo.orientation;
            var location = companyInfo.location;
            var x = orientation.x;
            var y = orientation.y;
            var z = orientation.z;
            var h = Cesium.Math.toRadians(orientation.heading);
            var p = Cesium.Math.toRadians(orientation.pitch);
            var r = Cesium.Math.toRadians(orientation.roll);
            var dx = location.x;
            var dy = location.y;
            var dz = location.z;

            var models = [];
            models.push(url);

            this.addPrimities(this.cesiumViewer, x, y, z, h, p, r, dx, dy, dz, models, callback, false, caller);
        }

        this.addPrimities = function(viewer,x,y,z,h,p,r,dx,dy,dz,models,onLoadCallback,bool,caller){
            if(!viewer){return;}
            if(!x && !y && !z && !h && !p && !r && !dx && !dy && !dz){return}
            if(!models && models.length <=0){return;}

            var position =  Cesium.Cartesian3.fromDegrees(x, y, z);
            h = Cesium.Math.toRadians(h);
            p = Cesium.Math.toRadians(p);
            r = Cesium.Math.toRadians(r);
            var hpr =  new Cesium.HeadingPitchRoll(h, p, r);
            var offset = new Cesium.Cartesian3(dx, dy, dz);
            var modelMatrix = getModelMtrix(position,hpr);
            var scene = viewer.scene;
            var models = models;
            var manageloadModes = [];
            var len_Models = models.length;
            var loadCount = 0;
            var bool = bool ? bool : undefined;
            main();
            function main(){
                for(var i=0;i<models.length;i++){
                    var url = models[i];
                    addPrimity(scene,url,i,modelMatrix,onLoadPrimity);
                }
            }


            function onLoadPrimity(model,i){
                loadCount++;
                manageloadModes[i] = model;
                removeNodeOffset(model);
                if(loadCount == len_Models){
                    //证明加载完毕
                    onLoadCallback(manageloadModes,caller);
                }

            }

            function removeNodeOffset(model){
                if(dx == 0 && dy == 0 && dz == 0){return;}
                var gltfNodes = model.gltf.nodes;
                for (var j = 0; j < gltfNodes.length; ++j) {
                    var n = gltfNodes[j];
                    if (Cesium.defined(n.mesh)) {
                        var node = model.getNode(n.name );
                        node.matrix = Cesium.Matrix4.multiplyByTranslation(node.matrix, offset, node.matrix);
                    }
                }
            }



            function addPrimity(scene, url,eq,matrix, callback){
                if(!scene){return };
                if(!url){return};
                Cesium.Check.typeOf.object('matrix', matrix);
                if(bool === '3dtile'){
                    var primity = scene.primitives.add(new Cesium.Cesium3DTileset({
                        url : url//模型文件相对路径
//		          	modelMatrix : matrix,
                    }));
                }else{
                    var primity = scene.primitives.add(Cesium.Model.fromGltf({
                        url : url,//模型文件相对路径
                        modelMatrix : matrix,
                    }));

                }
                primity.readyPromise.then(function(model){
                    model.offset = new Cesium.Cartesian3;
                    offset.clone(model.offset);
                    callback(model,eq);
                });

            }

            function getModelMtrix(p,hpr){
                Cesium.Check.typeOf.object('p', p);
                Cesium.Check.typeOf.object('hpr', hpr);
                var modelMatrix = new Cesium.Matrix4;
                modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(p, hpr)
                return modelMatrix;
            }
        }

        /**
         * 设置模型位置
         *
         * @param {object}
         *            orientation 模型方位.
         * @param {Object}
         *            entity 模型
         */
        this.setModelOrientation = function(entity, orientation) {
            if(!Cesium.defined(entity) && !Cesium.defined(orientation)) return;
            orientation.heading = orientation.heading == undefined ? 0 : orientation.heading;
            orientation.pitch = orientation.pitch == undefined ? 0 : orientation.pitch;
            orientation.roll = orientation.roll == undefined ? 0 : orientation.roll;
            var position = Cesium.Cartesian3.fromDegrees(orientation.x, orientation.y, orientation.z);
            var heading = Cesium.Math.toRadians(orientation.heading);
            var pitch = Cesium.Math.toRadians(orientation.pitch);
            var roll = Cesium.Math.toRadians(orientation.roll);
            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
            entity.position = position;
            entity.orientation = orientation;
        }

        /**
         * 设置模型的企业信息。
         */
        this.setModelsCompanyInfo = function(models, companyInfo) {
            if(!Cesium.defined(models)){return;}
            Cesium.Check.typeOf.object('models', models);
            if(models.length<=0){return;}
            if(!Cesium.defined(companyInfo)){return;}
            Cesium.Check.typeOf.object('companyInfo', companyInfo);

            if(!("orientation" in companyInfo)){return;}
            //思路：根据提供的新的企业信息，算出新的模型矩阵  应用到企业的模型上
            var position = Cesium.Cartesian3.fromDegrees(companyInfo['orientation'].x, companyInfo['orientation'].y, companyInfo['orientation'].z);
            var orientation = companyInfo['orientation'];
            var h = Cesium.Math.toRadians(orientation.heading);
            var p = Cesium.Math.toRadians(orientation.pitch);
            var r = Cesium.Math.toRadians(orientation.roll);
            var hpr =  new Cesium.HeadingPitchRoll(h, p, r);
            var newMatrix = getMatrix(position, hpr);
            main();

            function main(){
                for(var i=0;i<models.length;i++){
                    var primity = models[i];
                    console.log(primity);
                    primity.modelMatrix = newMatrix;
                }
            }
            function getMatrix(position, hpr){
                Cesium.Check.typeOf.object('position', position);
                Cesium.Check.typeOf.object('hpr', hpr);
                var modelMatrix = new Cesium.Matrix4;
                modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
                return modelMatrix;
            }
        }

        /**
         * 设置模型显隐
         *
         * @param {object}
         *            entity 模型
         * @param {Boolean}
         *            visible 模型是否显示
         */
        this.setModelVisible = function(entity, visible) {
            Cesium.Check.typeOf.object('entity', entity);
            var model = entity;
            model.show = visible;
        }
        /**
         * 设置多个模型显隐
         * 这个方式已经过时了  可以调用setNodesOrModelsVisible这个方法 既可以设置节点显隐 也可以设置模型显隐 会自行判断传入的是节点还是模型
         * @param {Array}
         *            entities 模型数组
         * @param {Boolean}
         *            visible 是否显隐
         */
        this.setModelsVisible = function(entities, visible) {
            Cesium.Check.typeOf.object('entities', entities);
            var models = entities;
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                model.show = visible;
            }
        }
        /**
         * 设置模型颜色
         *
         * @param {Object}
         *            entity 模型
         * @param {string}
         *            color 模型颜色
         */
        this.setModelColor = function(entity, color, method) {
            if (!entity.propertyNames) return;
            var propertyNames = entity.propertyNames;
            var len = propertyNames.length;
            for (var i = 0; i < len; i++) {
                if (propertyNames[i] in entity
                    && entity[propertyNames[i]]) {
                    var shape = propertyNames[i];
                    if (shape == 'line' || shape == 'point'
                        || shape == 'polyline') {
                        if (color == undefined || color == null) {
                            if(shape == 'point'){
                                var initColor = entity.point.initColor;
                                entity.point.color = initColor;
                            }else if(shape == 'polyline'){
                                var initColor = entity.initColor;
                                console.log(initColor);
                                entity.polyline.material = new Cesium.PolylineOutlineMaterialProperty(
                                    {
                                        color : initColor
                                    })
                            }

                        } else {
                            var color = color.split(',');
                            color = {
                                red : parseInt(color[0]) / 255,
                                green : parseInt(color[1]) / 255,
                                blue : parseInt(color[2]) / 255,
                                alpha : 1
                            };
                            if (shape == 'point') {
                                entity.point.color = color;
                            } else if (shape == 'line'
                                || shape == 'polyline') {
                                entity.polyline.material = color;
                            }

                        }
                    } else if (shape == 'model' || shape == 'entity') {
                        if (color == undefined || color == null) {
                            this.makeModelsColorRecovery([ entity ]);
                        } else {
                            // color--> '255,0,0';
                            var color = color.split(',');
                            color = {
                                red : parseInt(color[0]) / 255,
                                green : parseInt(color[1]) / 255,
                                blue : parseInt(color[2]) / 255,
                                alpha : 1
                            };

                            if (method == undefined || method == 'MIX'
                                || method == 'mix') {
                                entity.model.colorBlendMode = Cesium.ColorBlendMode['MIX'];
                                entity.model.colorBlendAmount = 0.5;
                            } else if (method == 'HIGHLIGHT'
                                || method == 'highlight') {
                                entity.model.colorBlendMode = Cesium.ColorBlendMode['HIGHLIGHT'];
                            } else {
                                entity.model.colorBlendMode = Cesium.ColorBlendMode['REPLACE'];
                            }
                            entity.model.color = color;
                        }
                    }

                } else {
                    continue;
                }
            }

        }

        /**
         * 设置多个模型颜色
         *
         * @extends {Array} entities 模型数组
         * @param {String}
         *            color 颜色
         */
        this.setModelsColor = function(entities, color) {
            if(color == undefined || color == null) {
                this.makeModelsColorRecovery(entities);
            } else {
                // color--> '255,0,0';
                for(var i = 0; i < entities.length; i++) {
                    entities[i].model.color = this.setModelColor(entities[i], color);
                }
            }
        }

        /*设置模型的颜色*/
        this.setPrimityColor = function(primity, color, method) {
            Cesium.Check.typeOf.object('primity', primity);
            if(color == undefined || color == null) {
                return;
            } else {
                //color--> '255,0,0';
                var color = color.split(',');
                color = {
                    red: parseInt(color[0]) / 255,
                    green: parseInt(color[1]) / 255,
                    blue: parseInt(color[2]) / 255,
                    alpha: 1
                };

                if(method == undefined || method == 'MIX' || method == 'mix') {
                    primity.colorBlendMode = Cesium.ColorBlendMode['MIX'];
                    primity.colorBlendAmount = 0.5;
                } else if(method == 'HIGHLIGHT' || method == 'highlight') {
                    primity.colorBlendMode = Cesium.ColorBlendMode['HIGHLIGHT'];
                } else {
                    primity.colorBlendMode = Cesium.ColorBlendMode['REPLACE'];
                }
                primity.color = color;
            }
        }
        /*设置多个模型的颜色*/

        this.setPrimitiesColor = function(primities, color, method) {
            Cesium.Check.typeOf.object('primities', primities);
            if(color == undefined || color == null) {
                return;
            } else {
                var color = color.split(',');
                //color--> '255,0,0';
                color = {
                    red: parseInt(color[0]) / 255,
                    green: parseInt(color[1]) / 255,
                    blue: parseInt(color[2]) / 255,
                    alpha: 1
                };
                for(var i = 0; i < primities.length; i++) {
                    var primity = primities[i];
                    if(method == undefined || method == 'MIX' || method == 'mix') {
                        primity.colorBlendMode = Cesium.ColorBlendMode['MIX'];
                        primity.colorBlendAmount = 0.5;
                    } else if(method == 'HIGHLIGHT' || method == 'highlight') {
                        primity.colorBlendMode = Cesium.ColorBlendMode['HIGHLIGHT'];
                    } else {
                        primity.colorBlendMode = Cesium.ColorBlendMode['REPLACE'];
                    }
                    primity.color = color;
                }

            }
        }

        /*设置节点颜色*///没变化
        /* "255,0,0" */
        this.setPrimityNodeColor = function(node, color) {
            Cesium.Check.typeOf.object('node', node);
            if(!Cesium.defined(color)) {
                return;
            }
            var c = color.split(',');
            var pick = node;
            var material = pick.mesh['_materials'][0];

            material.setValue('diffuse', new Cesium.Cartesian4(c[0], c[1], c[2], 1));

        }

        /*设置多个节点的颜色*/
        this.setPrimityNodesColor = function(nodes, color){
            Cesium.Check.typeOf.object('nodes', nodes);
            if(!Cesium.defined(color)) {
                return;
            }
            var c = color.split(',');
            for(var i=0;i<nodes.length;i++){
                var pick = nodes[i];
                var material = pick.mesh['_materials'][0];
                material.setValue('diffuse', new Cesium.Cartesian4(c[0], c[1], c[2], 1));
            }
        }


        /**
         * 移除模型
         *
         * @param {Object}
         *            entity 模型
         */
        this.removeModel = function(entity) {
            var viewer = this.cesiumViewer;
            var scene = viewer.scene;
            var model = entity;
            if(model instanceof  Cesium.Entity){
                viewer.entities.remove(model);
            }else{
                var PrimitiveCollection = scene.primitives;
                PrimitiveCollection.destroyPrimitives = false;

                if (PrimitiveCollection.contains(model)) {
                    PrimitiveCollection.remove(model);
                }
            }
        }
        /**
         * 移除多个模型
         *
         * @param {Array}
         *            entities 模型数组
         */
        this.removeModels = function(entities) {
            for(var i = 0; i < entities.length; i++) {
                var model = entities[i];
                this.removeModel(model);
            }
        }
        /**
         * 添加移除掉的模型
         *
         */
        this.addRemoveMode = function(model){
            var viewer = this.cesiumViewer;
            var scene = viewer.scene;
            if(model instanceof  Cesium.Entity){
                viewer.entities.add(model);
            }else{
                var PrimitiveCollection = scene.primitives;
                if (!(PrimitiveCollection.contains(model))) {
                    PrimitiveCollection.add(model);
                }
            }
        }
        /**
         * 添加多个被移除的模型
         */
        this.addRemoveModels = function(models){
            for(var i=0;i<models.length;i++){
                var model = models[i];
                this.addRemoveMode(model);
            }
        }
        /**
         * 获取模型下的节点---
         *
         * @param {Object}
         *            entity
         */
        this.getNodes = function(entity) {
            // console.log("获取节点");
            var instance = this;
            var entityId = entity.id;
            var privities = instance.scene.primitives['_primitives'];

            return new Promise(function(resolve, reject) {
                ((function promiseGetNodes() {
                    var ifComplete = false; // 是否完整获取到所有的privities
                    var oldL1 = 0;
                    var updateL1 = 0;
                    var t = new Date().getTime();
                    getAllPrivities();

                    function getAllPrivities() {
                        if(ifComplete == false) {
                            requestAnimationFrame(getAllPrivities);
                        } else {

                        }
                        // 获取完整privities的逻辑
                        var privities = instance.scene.primitives['_primitives'];
                        updateL1 = privities.length;
                        if(new Date().getTime() > t + 200) {
                            t = new Date().getTime();
                            // console.log('20毫秒了， 可以进行一次判断了');
                            if(updateL1 == oldL1 && updateL1 != 0) {
                                // console.log("完整了");
                                ifComplete = true;
                                for(var i = 0; i < privities.length; i++) {
                                    if(privities[i].id != undefined && privities[i].id.id == entityId) {
                                        var model = privities[i];
                                    }
                                }
                                var ifCompleteNode = false;
                                var old2 = 0;
                                var update2 = 0;
                                var t2 = new Date().getTime();
                                getAllNodeCommands(model);

                                function getAllNodeCommands(privitie) {
                                    if(ifCompleteNode == false) {
                                        requestAnimationFrame(function() {
                                            getAllNodeCommands(privitie)
                                        });
                                    } else {

                                    }
                                    // 获取完整node的逻辑
                                    var update2 = privitie._nodeCommands.length;
                                    if(new Date().getTime() > t2 + 100) {
                                        if(update2 == old2 && update2 != 0) {
                                            ifCompleteNode = true;
                                            var nodes = privitie._nodeCommands;
                                            for(var i = 0; i < nodes.length; i++) {
                                                nodes[i].name = nodes[i].command._owner.node._name;
                                            }
                                            resolve(nodes);

                                        } else {
                                            old2 = update2;
                                        }
                                    }
                                }
                            } else {
                                oldL1 = updateL1;
                            }
                        }
                    }

                })());
            });
            for(var i = 0; i < privities.length; i++) {
                if(privities[i].id != undefined && privities[i].id.id == entityId) {
                    var model = privities[i];
                    var g = privities[i]._nodeCommands;
                    return g;
                }
            }
            return null;
        }

        /*获取模型下的节点*/
        this.getPrimityNodes = function(primity) {
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
//				Cesium3DTileFeature
            }
        }

        /**
         * 设置构件显隐
         *
         * @param {object}
         *            node 节点
         * @param {Boolean}
         *            visible 节点可见性
         */
        this.setNodeVisible = function(node, visible) {
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
        /**
         * 设置多个构件显隐
         * 这个方法也过时了
         * @param {Array}
         *            nodes 节点集合
         *
         * @param {Boolean}
         *            visible 节点可见性
         */
        this.setNodesVisible = function(nodes, visible) {
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

        /*设置节点的显隐*/
        this.setPrimityNodeVisible = function(node, visible) {
            Cesium.Check.typeOf.object('node', node);
            if(!Cesium.defined(visible)) {
                return;
            }
            node.show = visible;
        }

        /*设置多个构件显隐*/
        this.setPrimityNodesVisible = function(nodes, visible) {
            Cesium.Check.typeOf.object('nodes', nodes);
            if(!Cesium.defined(visible)) {
                return;
            }
            for(var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                node.show = visible;
            }
        }

        /**
         * 设置节点颜色
         *
         * @param {Object}
         *            node 节点
         * @param {String}
         *            colorString 颜色字符串
         */
        this.setNodeColor = function(node, color) {
            if(color == undefined || color == null) {
                var initColor = this.getNodeInitColor(node);
                this.setNodeColor(node, initColor);
            } else {
                var c = color.split(',');
                var pick = node.command['_owner'];
                var material = pick.mesh['_materials'][0];
                // console.log(node.initColor);
                // console.log(material.getValue('diffuse'));
                material.setValue('diffuse', new Cesium.Cartesian4(c[0], c[1], c[2], 1));
            }
        }
        /**
         * 设置多个节点颜色
         *
         * @param {Array}
         *            nodes 节点集合
         * @param {String}
         *            colorString 颜色字符串
         */
        this.setNodesColor = function(nodes, color) {
            if(color == undefined || color == null) {
                for(var x = 0; x < nodes.length; x++) {
                    var initColor = this.getNodeInitColor(nodes[x]);
                    this.setNodeColor(nodes[x], initColor);
                }
            } else {
                var c = color.split(',');
                for(var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    var pick = node.command['_owner'];
                    var material = pick.mesh['_materials'][0];
                    material.setValue('diffuse', new Cesium.Cartesian4(c[0], c[1], c[2], 1));
                }
            }
        }

        //因为目前主要是  entity加载的模型的节点和primity加载的模型设置颜色后   恢复有困难
        //这里应该有个判断机制  如果是第一次点击这个节点  那么应该先给 该节点添加一个初始值得属性
        //以后每次点击 要做个判断 如果点击的还是这个节点 那么就不能改变这个节点的初始值
        //如果点击的这个节点 之前没有点击过 那就应该设置上初始值
        //综上所述  我只需设置两个数组进行管理点击entity的节点和primity节点
        this.manageEntitySelectedNodes = [];
        this.managePromitySelectedNodes = [];
        this.managePointLinePlanSelect = [];

        this.setNodeOrModelColor =  function (model, color, method) {
            var instance = this;
            var viewer = this.cesiumViewer;
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



        /**
         * 设置多个模型和节点的颜色
         */
        this.setNodesOrModelColor = function (arr, color, method) {
            var instance = this;
            var viewer = this.cesiumViewer;
            if (arr.length <= 0) {
                return;
            }
            for (var i = 0; i < arr.length; i++) {
                var model = arr[i];
                instance.setNodeOrModelColor(model, color, method);
            }
        }


        /**
         * 测试对象是否选中
         *
         * @param {sting}
         *            x,y 屏幕坐标
         * @param {Boolean}
         *            onlyModel 仅模型
         * @return {Object} modelInfo {objectType:'model/node',
		 *         parent:'null/model', obj:'model/node'}
         */
        this.testObjectSelected = function(x,y,isModel){
            var viewer = this.cesiumViewer;
            if(!Cesium.defined(viewer)){return;}
            if(!Cesium.defined(x) || !Cesium.defined(y)){return;}
            var pickType = undefined;
            var scene = viewer.scene;
            var movement = {x:x, y:y};
            if(isModel == undefined || isModel == false){
                pickType = 'node';
            }else{
                var pick = scene.pick(movement);
                if(!pick){return;}
                if('id' in pick){
                    var idValue = pick['id'];
                    if(idValue instanceof Cesium.Entity){
                        var obj = {};
                        obj.objectType = "model",
                            obj.parent = null;
                        obj.obj = idValue.obj;
                        return obj;
                    }else{
                        //判断是不是primity方式加进去的
                        var primity = pick['primitive'];
                        if(primity instanceof Cesium.Model){
                            var obj = {};
                            obj.objectType = "model",
                                obj.parent = null;
                            obj.obj = primity.obj;
                            return obj;
                        }
                    }
                }else{
                    //应该是3dtile
                    if('_batchId' in pick){
                        var cesium3dtileset = pick['content']['tileset'];
                        var obj = {};
                        obj.objectType = "model",
                            obj.parent = null;
                        obj.obj = cesium3dtileset.obj;
                        return obj;
                    }
                }

            }
            if(pickType == 'node'){
                var pick = scene.pick(movement);
                if(!pick){return null;}
                //先判断3dtile  再判断entity  在判断promity  最后判断点线面
                var obj = {};
                obj.objectTpye = 'node';
                obj.parent = this.testObjectSelected(x, y, true);
                obj.obj = pick;
                return obj;
            }
        }

        /**
         * 屏幕坐标转换为空间坐标
         *
         * @param {string}
         *            x , y 屏幕坐标
         * @return {Object} GeoLocation 空间位置
         */
        this.toMapLocaition = function(x, y) {
            var c3 = this.scene.pickPosition({
                x: x,
                y: y
            }, c3);
            return c3;
        }
        /**
         * 空间坐标转屏幕坐标
         *
         * @param {object}
         *            GeoLocation 空间坐标
         * @return {Object} {x:x,y:y} 屏幕坐标
         */
        this.toScreenPoint = function(GeoLocation) {
            var c2 = this.scene.cartesianToCanvasCoordinates(GeoLocation, c2);
            c2.x = parseInt(c2.x.toFixed(0));
            c2.y = parseInt(c2.y.toFixed(0));
            return c2;
        }
        /**
         * 获取相机信息
         *
         * @return {Object} GeoOrientation 相机方位信息
         */
        this.getCameraOrientationInfo = function() {
            var position = this.camera.position;
            var h = this.camera.heading;
            var p = this.camera.pitch;
            var r = this.camera.roll;
            return {
                x: position.x,
                y: position.y,
                z: position.z,
                heading: h,
                pitch: p,
                roll: r
            }

        }
        /**
         * 设置相机信息
         *
         * @param {Object}
         *            cameraInfo:GeoOrientation 相机信息
         *
         */
        this.setCameraInfo = function(GeoOrientation) {
            var instance = this;
            if(typeof GeoOrientation != 'object') {
                return;
            }

            this.cesiumViewer.trackedEntity = undefined;
            GeoOrientation.x = GeoOrientation.x == undefined ? instance.camera.position.x : GeoOrientation.x;
            GeoOrientation.y = GeoOrientation.y == undefined ? instance.camera.position.y : GeoOrientation.y;
            GeoOrientation.z = GeoOrientation.z == undefined ? instance.camera.position.z : GeoOrientation.z;
            var position = Cesium.Cartesian3.fromDegrees(GeoOrientation.x, GeoOrientation.y, GeoOrientation.z);
            GeoOrientation.heading = GeoOrientation.heading == undefined ? instance.camera.heading : GeoOrientation.heading;
            GeoOrientation.pitch = GeoOrientation.pitch == undefined ? instance.camera.pitch : GeoOrientation.pitch;
            GeoOrientation.roll = GeoOrientation.roll == undefined ? instance.camera.roll : GeoOrientation.roll;
            this.camera.setView({
                destination: position,
                orientation: {
                    heading: Cesium.Math.toRadians(GeoOrientation.heading), // east,
                                                                            // default
                                                                            // value
                                                                            // is
                                                                            // 0.0
                                                                            // (north)
                    pitch: Cesium.Math.toRadians(GeoOrientation.pitch), // default
                                                                        // value
                                                                        // (looking
                                                                        // down)
                    roll: GeoOrientation.roll // default value
                }
            });
        }

        /**
         * 缩放到实体。
         *
         * @param {Object}
         *            entity
         */
        this.zoomToEntity = function(entity) {
            this.cesiumViewer.zoomTo([entity]);
        }

        /**
         * 缩放到多个实体。
         *
         * @param {Object}
         *            entities
         */
        this.zoomToEntities = function(entities) {
            this.cesiumViewer.zoomTo(entities);
        }

        this.zoomToPrimity = function(primity){
            var viewer = this.cesiumViewer;

            Cesium.Check.typeOf.object('primity', primity);
            Cesium.Check.typeOf.object('viewer', viewer);

            var viewer = viewer;
            var modelMatrix = primity.modelMatrix;
            var  boundingSpere = primity._boundingSphere;
            var center = boundingSpere.center;
            //这里先设成死的 后期传参
            var offser = primity.offset;
            var realOffset =  new Cesium.Cartesian3;
            Cesium.Cartesian3.add(center, offser, realOffset);
            var position = new Cesium.Cartesian3;
            Cesium.Matrix4.multiplyByPoint(modelMatrix, realOffset, position);


            var llh = wordToLLH(position);
            viewer.camera.flyTo({ //设置视角
                destination: Cesium.Cartesian3.fromDegrees(llh.lng, llh.lat, llh.alt+500)
            });
            //世界坐标转经纬度
            function wordToLLH(wordP){
                Cesium.Check.typeOf.object('wordP', wordP);
                var ellipsoid=viewer.scene.globe.ellipsoid;
                var cartesian3=wordP;
                var cartographic=ellipsoid.cartesianToCartographic(cartesian3);
                var lat=Cesium.Math.toDegrees(cartographic.latitude);
                var lng=Cesium.Math.toDegrees(cartographic.longitude);
                var alt=cartographic.height;
                return {
                    lng:lng,
                    lat:lat,
                    alt:alt
                }
            }
        }

        this.zoomToNode = function(node) {

        }

        this.zoomToPrimityNode = function(node){
            var viewer = this.cesiumViewer;

            Cesium.Check.typeOf.object('node', node);
            Cesium.Check.typeOf.object('viewer', viewer);
            var model = node.parentModel;
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
                var materials = modelMesh.materials ;
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
                destination: Cesium.Cartesian3.fromDegrees(llh.lng, llh.lat, llh.alt+20)
            });
            function wordToLLH(wordP){
                Cesium.Check.typeOf.object('wordP', wordP);
                var ellipsoid=viewer.scene.globe.ellipsoid;
                var cartesian3=wordP;
                var cartographic=ellipsoid.cartesianToCartographic(cartesian3);
                var lat=Cesium.Math.toDegrees(cartographic.latitude);
                var lng=Cesium.Math.toDegrees(cartographic.longitude);
                var alt=cartographic.height;
                return {
                    lng:lng,
                    lat:lat,
                    alt:alt
                }
            }

        }


        /**
         * 飞行到某一个位置。
         */
        this.flyToLocation = function(x, y, z) {
            if (!z) z = 500;
            this.cesiumViewer.camera.flyTo({ //设置视角
                destination: Cesium.Cartesian3.fromDegrees(x, y, z)
            });
        }

        /**
         * 增加键盘事件监听
         *
         * @extends {Object} processor 处理对象
         * @param {String}
         *            methodName 方法名称 该方法只有一个event参数，为事件对象,是一个json对象，包含keyCode
         */
        this.addkeyEventListener = function(processor, methodName) {
            document.addEventListener('keydown', function(e) {
                processor[methodName]({
                    keyCode: e.keyCode
                });
            }, false);
        }
        /**
         * 增加鼠标事件监听
         *
         * @param {Object}
         *            processor 处理对象
         * @param {String}
         *            methodName 方法名称
         * @param {String}
         *            mouseType 鼠标事件类型[up/down/move]
         */
        this.addMouseEventListener = function(processor, methodName, mouseType) {
            var json = {
                x: '',
                y: '',
                mouseCode: ''
            };
            var mouseEvent;
            if(mouseType == 'down' || mouseType == undefined) {
                mouseEvent = {
                    // "LEFT_CLICK": Cesium.ScreenSpaceEventType.LEFT_CLICK,
                    'LEFT_DOUBLE_CLICK': Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
                    'LEFT_DOWN': Cesium.ScreenSpaceEventType.LEFT_DOWN,
                    // 'MIDDLE_CLICK': Cesium.ScreenSpaceEventType.MIDDLE_CLICK,
                    'MIDDLE_DOWN': Cesium.ScreenSpaceEventType.MIDDLE_DOWN,
                    // "RIGHT_CLICK": Cesium.ScreenSpaceEventType.RIGHT_CLICK,
                    'RIGHT_DOWN': Cesium.ScreenSpaceEventType.RIGHT_DOWN

                }
            } else if(mouseType == 'up') {
                mouseEvent = {
                    'LEFT_UP': Cesium.ScreenSpaceEventType.LEFT_UP,
                    'MIDDLE_UP': Cesium.ScreenSpaceEventType.MIDDLE_UP,
                    'RIGHT_UP': Cesium.ScreenSpaceEventType.RIGHT_UP
                }
            } else if(mouseType == 'move') {
                mouseEvent = {
                    'MOUSE_MOVE': Cesium.ScreenSpaceEventType.MOUSE_MOVE,
                    'WHEEL': Cesium.ScreenSpaceEventType.WHEEL

                }
            }

            for(var x in mouseEvent) {
                eventFun(mouseEvent[x]);
            }

            function eventFun(eventType) {
                if(eventType == Cesium.ScreenSpaceEventType.MOUSE_MOVE) {
                    handler.setInputAction(function(movement) {
                        var json1 = {
                            startX: '',
                            startY: '',
                            endX: '',
                            endY: '',
                            mouseCode: ""
                        };
                        var strP = movement.startPosition,
                            endP = movement.endPosition;
                        json1.startX = strP.x, json1.startY = strP.y, json1.endX = endP.x, json1.endY = endP.y;
                        json1.mouseCode = eventType;

                        processor[methodName](json1);
                    }, eventType);
                } else if(eventType == Cesium.ScreenSpaceEventType.WHEEL) {
                    handler.setInputAction(function(movement) {
                        var p = handler._primaryPosition;
                        json.mouseCode = eventType;
                        json.x = p.x;
                        json.y = p.y;
                        if(movement > 0) {
                            json.dir = 'up';
                        } else {
                            json.dir = 'down';
                        }
                        console.log(eventType);
                        processor[methodName](json);
                    }, eventType);
                } else {
                    handler.setInputAction(function(movement) {
                        if(movement == undefined) return;
                        json.x = movement.position.x;
                        json.y = movement.position.y;
                        if('dir' in json) {
                            delete json['dir'];
                        }
                        json.mouseCode = eventType;
                        processor[methodName](json);
                    }, eventType);
                }

            }
        }
        /**
         * 增加键盘鼠标监听事件
         *
         * @param {Object}
         *            processor 处理对象
         * @param {String}
         *            methodName 方法名称
         */
        this.addKeyAndMouseEventListener = function(processor, methodName) {
            if(typeof processor[methodName] != 'function') {
                return;
            }
            var json = {
                x: '',
                y: '',
                mouseCode: [],
                buttonType: ''
            };
            var mouseEventType = {
                'LEFT_CLICK': Cesium.ScreenSpaceEventType.LEFT_CLICK,
                'MIDDLE_CLICK': Cesium.ScreenSpaceEventType.MIDDLE_CLICK,
                'RIGHT_CLICK': Cesium.ScreenSpaceEventType.RIGHT_CLICK
            };
            var keyEventType = {
                'SHIFT': Cesium.KeyboardEventModifier.SHIFT,
                "CTRL": Cesium.KeyboardEventModifier.CTRL,
                'ALT': Cesium.KeyboardEventModifier.ALT
            };

            for(var x in mouseEventType) {
                var eventType = mouseEventType[x];
                for(var y in keyEventType) {
                    var keyType = keyEventType[y];
                    fun(eventType, keyType);
                }
            }

            function fun(eventType, keyType) {
                handler.setInputAction(function(e) {
                    return function(e) {
                        var mouse = undefined,
                            key = undefined;

                        var p = e.position;
                        if(eventType == Cesium.ScreenSpaceEventType.LEFT_CLICK) {
                            mouse = "左键"
                        } else if(eventType == Cesium.ScreenSpaceEventType.MIDDLE_CLICK) {
                            mouse = "中键"
                        } else if(eventType == Cesium.ScreenSpaceEventType.RIGHT_CLICK) {
                            mouse = '右键'
                        }

                        if(keyType == Cesium.KeyboardEventModifier.SHIFT) {
                            key = "shif键"
                        } else if(keyType == Cesium.KeyboardEventModifier.CTRL) {
                            key = "ctrl键"
                        } else if(keyType == Cesium.KeyboardEventModifier.ALT) {
                            key = "alt键"
                        }
                        json.x = p.x, json.y = p.y, json.mouseCode[0] = eventType, json.mouseCode[1] = keyType, json.buttonType = mouse + '+' + key;
                        processor[methodName](json);
                    }
                }(eventType, keyType), eventType, keyType);
            }
        }
        /**
         * 删除指定鼠标事件
         *
         * @param {Object}
         *            processor 事件处理对象
         * @param {String}
         *            methodName 事件名称
         *
         */
        this.removeMouseEventListener = function(processor, methodName) {
            var fun = processor[methodName];
            processor[methodName] = function() {};
            for(var x in keyEvent) {
                eventFun(keyEvent[x]);
            }
            processor[methodName] = fun;

            function eventFun(eventType) {

                handler.setInputAction(processor[methodName], eventType);
            }
        }
        /**
         * 清除所有鼠标事件
         *
         */
        this.clearMouseEventListener = function() {

            for(var x in keyEvent) {
                eventFun(keyEvent[x]);
            }

            function eventFun(eventType) {

                handler.removeInputAction(eventType);
            }
        }
        /**
         * 删除指定的键盘和鼠标事件
         *
         * @param {Object}
         *            processor 事件处理对象
         * @param {String}
         *            methodName 事件名称
         */
        this.removeKeyAndMouseEventListener = function(processor, methodName) {
            var mouseEventType = {
                'LEFT_CLICK': Cesium.ScreenSpaceEventType.LEFT_CLICK,
                'MIDDLE_CLICK': Cesium.ScreenSpaceEventType.MIDDLE_CLICK,
                'RIGHT_CLICK': Cesium.ScreenSpaceEventType.RIGHT_CLICK
            };
            var keyEventType = {

                'SHIFT': Cesium.KeyboardEventModifier.SHIFT,
                "CTRL": Cesium.KeyboardEventModifier.CTRL,
                'ALT': Cesium.KeyboardEventModifier.ALT
            };
            var fun;
            fun = processor[methodName];
            processor[methodName] = function() {};
            for(var x in mouseEventType) {
                for(var y in keyEventType) {
                    handler.setInputAction(processor[methodName], mouseEventType[x], keyEventType[y]);
                }
            }
            processor[methodName] = fun;
        }
        /**
         * 清除所有的鼠标和键盘事件
         */
        this.clearKeyAndMouseEventListener = function() {
            var mouseEventType = {
                'LEFT_CLICK': Cesium.ScreenSpaceEventType.LEFT_CLICK,
                'MIDDLE_CLICK': Cesium.ScreenSpaceEventType.MIDDLE_CLICK,
                'RIGHT_CLICK': Cesium.ScreenSpaceEventType.RIGHT_CLICK
            };
            var keyEventType = {
                'SHIFT': Cesium.KeyboardEventModifier.SHIFT,
                "CTRL": Cesium.KeyboardEventModifier.CTRL,
                'ALT': Cesium.KeyboardEventModifier.ALT
            };
            for(var x in mouseEventType) {
                for(var y in keyEventType) {
                    handler.removeInputAction(mouseEventType[x], keyEventType[y]);
                }
            }
        }
        /**
         * 模型颜色初始化
         *
         * @param {Object}
         *            entity
         */
        this.makeModelColorRecovery = function(entity) {
            if(entity.model.colorBlendAmount != 0 || entity.model.colorBlendAmount != undefined) {
                entity.model.colorBlendAmount = 0;
            }
            entity.model.color = undefined;
        }
        /**
         * 多个模型颜色初始化
         *
         * @param {Array}
         *            entities
         */
        this.makeModelsColorRecovery = function(entities) {
            var instance = this;
            for(var i = 0; i < entities.length; i++) {
                instance.makeModelColorRecovery(entities[i]);
            }
        }
        /**
         * 获取节点初始材质颜色
         *
         * @param {Object}
         *            node 节点
         * @return {String} colorString 颜色值
         */
        this.getNodeInitColor = function(node) {
            var privity = undefined;
            var pick = node.command['_owner'];
            var nodeId = pick.id.id;
            var id = pick.node.id;
            var privities = this.scene.primitives['_primitives'];
            for(var i = 0; i < privities.length; i++) {
                if(privities[i].id != undefined && privities[i].id['_id'] == nodeId) {
                    privity = privities[i];

                }
            }
            var gltf = privity["_cachedGltf"]['_gltf'];
            var materils = gltf.materials;
            var nodeMaterialId = pick['mesh']["_materials"][0]['_id'];
            var nodeInitColor = materils[nodeMaterialId]['values']['diffuse'];
            var str = nodeInitColor[0] + "," + nodeInitColor[1] + ',' + nodeInitColor[2] + ',' + nodeInitColor[3];
            return str;
        }
        /**
         * 设置模型半透(entity)
         *
         * @param {Object}
         *            entity 模型实体
         * @param {NNumber}
         *            alpha 透明度(默认为0.5)
         */
        this.setModelTranslucent = function(entity, alpha) {
//			var a = alpha ? alpha : 1;
//			if(entity.model == undefined){ return;}
//			if (entity.model.color == undefined) {
//				entity.model.color = {
//					red : 1,
//					green : 1,
//					blue : 1,
//					alpha : a
//				}
//			} else {
//				var color = entity.model.color['_value'];
//
//				entity.model.color = {
//					red : color['red'],
//					green : color['green'],
//					blue : color['blue'],
//					alpha : a
//				}
//			}
        }
        /**
         * 恢复模型半透
         *
         * @param {Object}
         *            entity 模型实体
         *
         */
        this.restoreModelTranslucent = function(entity) {
//			if(entity.model.color == undefined) return;
//			var color = entity.model.color['_value'];
//			if(color.alpha == 1) return;
//			color.alpha = 1;

        }
        /**
         * 设置节点构件半透
         *
         * @param {Object}
         *            node 节点构件
         * @param {Number}
         *            alpha 透明度(默认为0.5)
         */
        this.setNodeTranslucent = function(node, alpha) { // 有待继续完善
            var a = alpha == undefined ? 0.5 : alpha;
            var color = this.getNodeInitColor(node);
        }
        /**
         * 恢复节点构件半透
         *
         * @param {Object}
         *            node 节点构件
         */
        this.restoreNodeTranslucent = function(node) {

        }
        /**
         * 恢复相机初始视角
         */
        this.RestoreTheCameraInitialView = function() {
            var that = this;
            if(cesiumViewer.trackedEntity) {
                var entity = cesiumViewer.trackedEntity;
                cesiumViewer._needTrackedEntityUpdate = true;
                cesiumViewer._trackedEntityChanged.raiseEvent(entity);
            }else if(cesiumViewer.zoomTo()){
                cesiumViewer.zoomTo([that.initZoomEntity]);
            }else {
// var that = this;
// that.camera.setView({
// destination: {
// x: 1213901.049900249,
// y: 4737780.477885012,
// z: 4080467.3789271275
// }
// });
            }

        }

        /**
         * 获取相机的初始视角
         */
        function getCameraInitView(obj) {

        }
        /**
         * 添加地球半透
         *
         */

        function clearZoom(viewer) {
            viewer._zoomPromise = undefined;
            viewer._zoomTarget = undefined;
            viewer._zoomOptions = undefined;
        }
        this.flyTo = function(orientation) {
            var d = Cesium.Cartesian3.fromDegrees(orientation.x, orientation.y, orientation.z);
            var o = null;
            if(orientation.heading != undefined &&
                orientation.pitch != undefined &&
                orientation.roll != undefined) {
                o = {
                    heading: Cesium.Math.toRadians(orientation.heading), // 默认值
                    pitch: Cesium.Math.toRadians(orientation.pitch == undefined ? -90.0 : orientation.pitch), // 默认值
                    roll: Cesium.Math.toRadians(orientation.roll) // 默认值
                };
            }
            if(o == null) {
                this.camera.flyTo({
                    destination: d
                });
            } else {
                var hpr = new Cesium.HeadingPitchRoll(o.heading, o.pitch, o.roll);
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(d, hpr);
                this.camera.flyTo({
                    destination: d,
                    orientation: orientation
                });
            }
        }

        /**
         * 相机定位到模型的具体节点
         */
        this.setPositionNode =  function (node) {
            //目前主要适用与promity模型的节点
            Cesium.Check.typeOf.object('node', node);
            var viewer = this.cesiumViewer;

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

        /**
         * 设置多个节点或模型的显隐
         * 新拓展的方法  通过这个方法设置模型或节点的显隐  只用传进模型  内部会自行判断是节点 还是模型 从而设置显隐
         * models : 多个模型或节点
         * isible:显隐控制
         */
        this.setNodesOrModelsVisible = function(models,visible){
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

        /**
         * 设置节点或模型的显隐---用于单个模型或节点
         * singleModel :单个模型或节点
         */
        this.setNodeOrModelVisible = function(singleModel, visible){
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










    }

