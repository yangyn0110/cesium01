//剖切的实现

function test_p(viewer, api){
    var qiY = {
        //企业的偏移
        location : {
            dx:-39471063.06588903,
            dy:-2583884.7750844555,
            dz:15.246235152552565
        },
//			location:{
//				dx:0,
//				dy:0,
//				dz:0
//			},
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
    var modelsUrl =  [str+'汕头苏埃通道-solid-2018-01.glb', str+'苏埃通道盾构段.管片拼装模型-西线.glb',str+'苏埃通道盾构段.管片拼装模型-东线.glb'];
    // var modelsUrl = ['Cesium_Air.glb'];
    var ttt = api.addPrimities(qiY['orientation']['lng'], qiY['orientation']['lat'], qiY['orientation']['alt']
        ,qiY['orientation']['heading'], qiY['orientation']['pitch'], qiY['orientation']['roll'],
        qiY['location']['dx'], qiY['location']['dy'],
        qiY['location']['dz'],modelsUrl,onload);
    var loading = document.getElementById('loading');

    var single_model =  [str+"Cesium_Air.glb"];
    api.addPrimities(qiY['orientation']['lng'], qiY['orientation']['lat'], 200
        ,qiY['orientation']['heading'], qiY['orientation']['pitch'], qiY['orientation']['roll'],0,0,0,single_model,onload1);


    var dunGou = [str+"Cesium_Air.glb"];
    api.addPrimities(-123.0743619, qiY['orientation']['lat'],200
        ,qiY['orientation']['heading'], qiY['orientation']['pitch'], qiY['orientation']['roll'],0,0,0,dunGou,onload2);

    var m = undefined;
    var m1 = undefined;
    function onload2(model){
        m1 = model;
        console.log(m1);
    }
    function onload1(model){
        // model[0].scale = 0.001;
        m =model;
        // console.log(model);
        // loading.style.display = 'none';
        // viewer.camera.flyTo({ //设置视角
        //     destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 100)
        // });
        // var info = [
        //     {
        //         isCompany : false,
        //         models :m
        //     }
        // ];

        // new UpdatePlacement(info, viewer);

    }
    function onload(models){
        // api.setNodesOrModelsVisible(models, false);
        loading.style.display = 'none';
        viewer.camera.flyTo({ //设置视角
            destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 700)
        });

        console.log(m1);
        var info = [
            {
                isCompany : true,
                models :models
            },
            {
                isCompany : false,
                models:m
            },
            {

                isCompany : false,
                models :m1
            }
        ];

        var p =new UpdatePlacement(info, viewer);

        var test_pl = document.getElementById('test_pl');
        var count = 0;
        test_pl.addEventListener("mousedown",function(){
            count++;
            if(count%2  == 0){
              var data = p.stop();
              console.log(data);
            }else {
                p.start();
            }
        },false);
    }
}