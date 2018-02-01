function test_0131(viewer, api){


    var qiY = {
        //企业的偏移
        location : {
            dx:-39471063.06588903,
            dy:-2583884.7750844555,
            dz:15.246235152552565
        },
			// location:{
			// 	dx:0,
			// 	dy:0,
			// 	dz:0
			// },
        //企业的位置信息
        orientation:{
            //经纬高 偏转角（单位是角度）
            lng: -123.0744619,
            lat:44.0503706,
            alt:0,
            heading:90,
            pitch:0,
            roll:0
        }
    }
    var str = 'models/';
    var loading = document.getElementById('loading');
    var modelsUrl =  [str+'汕头苏埃通道-solid-2018-01.glb', str+'苏埃通道盾构段.管片拼装模型-西线.glb',str+'苏埃通道盾构段.管片拼装模型-东线.glb'];
    var ttt = api.addPrimities( qiY['orientation']['lng'], qiY['orientation']['lat'], qiY['orientation']['alt']
        ,qiY['orientation']['heading'], qiY['orientation']['pitch'], qiY['orientation']['roll'],
        qiY['location']['dx'], qiY['location']['dy'],
        qiY['location']['dz'],modelsUrl,
        onload);

    function onload(models){
        loading.style.display = 'none';
        api.removeModel(models[0]);
        // api.addModel(models[0]);
        viewer.camera.flyTo({ //设置视角
            destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 100)
        });
    }

    var point = viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 100),
        point : {
            pixelSize : 30,
            color : Cesium.Color.YELLOW
        }
    });

    var box =  viewer.entities.add({
        name : 'Red box with black outline',
        position: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 100),
        box : {
            dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
            material : Cesium.Color.RED.withAlpha(0.5),

        }
    });
    api.removeModel(box);
    window.setTimeout(function(){
        api.addModel(box);
    },6000)


}