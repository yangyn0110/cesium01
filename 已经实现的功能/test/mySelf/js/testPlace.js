/**
 * 批量模型摆放
 */

    var GeoModelPlacement = (function(){
        function _( primities, viewer) {

            var instance = this;
            Cesium.Check.typeOf.object('primities', primities);
            if (primities.length <= 0) {
                return;
            }
            //整体思路 重点是算出：摆放时的方向  向上  向右  向前 这三个方向   以及旋转时候的heading pitch roo
            //上方向根据企业的位置可以得出   右方向根据相机的右方向得出（视图矩阵的逆矩阵可以得出） 前方向由上方向和右方向的叉积得出
            //剩下的 就是简单的 组织逻辑
            this.QYInfo = {orientation:{}};
            var primities = primities;
            var viewer = viewer, scene = viewer.scene;
            camera = viewer.scene.camera;
            this.start_place = false;
            this.start = function (){
                this.start_place = true;
            }
            this.stop = function (){
                this.start_place = false;
                return this.QYInfo;
            }

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
            var qiYP_strat = new Cesium.Cartesian3;
            qiYP.clone(qiYP_strat);
            getQiYInfo(modelMatrix_start, qiYP_strat, scene, instance);
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


            function getQiYInfo(matrix,qiYP, scene, obj){
                var hpr = modelMatrixToHPR(modelMatrix,scene);

                var LLH = wordToLLH(qiYP);
                obj.QYInfo.orientation.heading = (hpr.heading*180)/Math.PI;
                obj.QYInfo.orientation.pitch = (hpr.pitch*180)/Math.PI;
                obj.QYInfo.orientation.roll = (hpr.roll*180)/Math.PI;
                obj.QYInfo.orientation.x =LLH.lng;
                obj.QYInfo.orientation.y = LLH.lat;
                obj.QYInfo.orientation.z = LLH.alt;

            }

            viewer.clock.onTick.addEventListener(function (clock) {
                if (!flags.bUpdate && !instance.start_place) {
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
                    if (bRotate && instance.start_place) {
                        hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

                        modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(qiYP, hpr);
                        for (var i = 0; i < primities.length; i++) {
                            var primity = primities[i];
                            primity.modelMatrix = modelMatrix;
                        }
                        //

                        getQiYInfo(modelMatrix, qiYP, scene, instance);

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
                if (bMove && instance.start_place) {
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
                    getQiYInfo(modelMatrix, qiYP, scene, instance);

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
                        if(!instance.start_place){return;}
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
                        getQiYInfo(modelMatrix, qiYP, scene, instance);
                        return undefined;
                    }
                    case 188: {
                        if(!instance.start_place){return;}
                        //左括号是减速
                        rotate_delta *= 0.8;
                        speed *= 0.8;
                        break;
                    }

                    case 190: {
                        if(!instance.start_place){return;}
                        //加速  -- 右括号
                        rotate_delta *= 1.2;
                        speed *= 1.2;
                        break;
                    }
                    case 32: {
                        if(!instance.start_place){return;}
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
                        getQiYInfo(modelMatrix_start, qiYP_strat, scene, instance);
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


        }

        return _;
    })();


