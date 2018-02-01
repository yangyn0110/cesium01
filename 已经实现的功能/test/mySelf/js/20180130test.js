
function test_20180130(viewer, api, callback){
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
		//var modelsUrl = ['Cesium_Air.glb'];
		var ttt = api.addPrimities(qiY['orientation']['lng'], qiY['orientation']['lat'], qiY['orientation']['alt']
		,qiY['orientation']['heading'], qiY['orientation']['pitch'], qiY['orientation']['roll'], 
		qiY['location']['dx'], qiY['location']['dy'],
			qiY['location']['dz'],modelsUrl,
			onload);
			
		var loadModels = document.getElementById('loadModels');
		var urlDom = document.getElementById('loadModel_content');	
	
		var setModelColor = document.getElementById('setModelColor');
		var addModel = document.getElementById('addModel');
		var setModelVisible = document.getElementById('setModelVisible');
		var showModelNodes = document.getElementById('showModelNodes');
		var showModelNodes_dom = document.getElementById('showModelNodes_dom');
		var testPlace = document.getElementById('testPlace');
		var count = 0;
		document.getElementById('chid_show').addEventListener('mousedown',function(){
			showModelNodes_dom.style.display = 'block';
		},false);
		document.getElementById('chid_no').addEventListener('mousedown',function(){
			showModelNodes_dom.style.display = 'none';
		},false);
		
		
		

		var click_placeCount = 0;
		var loading = document.getElementById('loading');
		function onload(models) {
            loadModels.style.display ='block';
            callback(models);
            //模型摆放
            var placeTest =  new GeoModelPlacement(models, viewer);
			//


			loading.style.display = 'none';
            testPlace.addEventListener('mousedown',testPlaceEvent(placeTest,click_placeCount),false);


			//添加dom
			for(var i=0;i<models.length;i++){
				var model_name = models[i]._cacheKey;
				model_name = model_name.split("/");
				model_name = model_name[model_name.length-1];
				var li = document.createElement('li');
				li.innerHTML = model_name;
				li.model = models[i];
				li.style.color = 'black';
				urlDom.appendChild(li);
				li.addEventListener("mousedown",onmousedown(li),false);
				
				//设置对应模型颜色
				var p_c = document.createElement('p');
				p_c.innerHTML = "设置颜色："+model_name;
				p_c.model = models[i];
				setModelColor.appendChild(p_c);
				p_c.addEventListener('mousedown',setModelColorEvent(p_c), false);
				
				//隐藏对应的模型
				var p_vis = document.createElement('p');	
				p_vis.innerHTML = "隐藏模型："+model_name;
				p_vis.model = models[i];
				setModelVisible.appendChild(p_vis);
				p_vis.addEventListener('mousedown',setModelVisibleEvent(p_vis), false);
				//显示对应模型
				var p_s = document.createElement('p');	
				p_s.innerHTML = "隐藏模型："+model_name;
				p_s.model = models[i];
				setModelShow.appendChild(p_s);
				p_s.addEventListener('mousedown',setModelShowEvent(p_s), false);

				
				
				//显示模型下面的节点
				var div_showNodes = document.createElement('div');
				div_showNodes.innerHTML = "显示节点："+model_name;
				div_showNodes.model = models[i];
				showModelNodes.appendChild(div_showNodes);
				div_showNodes.addEventListener('mousedown',showModelNodesEvent(div_showNodes), false);
			
			



			}
			//测试模型摆放
			function testPlaceEvent(obj, count) {
				return function () {
					count++;
					if(count%2 == 0){
						obj.stop();
						count = 0
                        testPlace.innerHTML = "开始摆放";
					}else {
						obj.start();
						testPlace.innerHTML = "结束摆放";
					}
                }
            }
			//定位到对应模型
			function onmousedown(dom){
				return function(){
					var model = dom.model;
					api.zoomToPrimity(model);
				}
			}
			//设置颜色
			function setModelColorEvent(dom){
				return function(){
					var model = dom.model;
					api.setNodesOrModelColor(models);
					api.setNodeOrModelColor(model,'255,0,0','mix');
					
				}
			}
			
			function setModelVisibleEvent(dom){
				return function(){
					var model = dom.model;
					api.setNodeOrModelVisible(model, false)
				}
			}
			
			function setModelShowEvent(dom){
				return function(){
					var model = dom.model;
					api.setNodeOrModelVisible(model, true)
				}
			}
	
			function showModelNodesEvent(dom){
				return function(){
					count++;
					var model = dom.model;
					var nodes= api.getPrimityNodes(model);
					
					//先删除showModelNodes_dom下面的孩子
					var chid = showModelNodes_dom.children;
					if(chid){
						for(var i=0;i<chid.length;i++){
							showModelNodes_dom.removeChild(chid[i]);
						}
						
					}
					var ul = document.createElement('ul');
					showModelNodes_dom.appendChild(ul);
					for(var i=0;i<nodes.length;i++){
						var node = nodes[i];
					
						var li = document.createElement('li');
						li.innerHTML = "节点："+node['node']["_name"];
						ul.appendChild(li);
						li.node = node;
						li.addEventListener("mousedown",clickNodeEvent(li,model),false);
					}
					
					if(count % 2 == 0 ){
						showModelNodes_dom.style.background = 'rgba(0,0,0,0.3)';
					}else{
						showModelNodes_dom.style.background = 'pink';
					}
				}
			}
			function clickNodeEvent(dom, model){
				return function(){
					var node = dom.node;

					var nodes = api.getPrimityNodes(model);
					//设置节点颜色
					api.setNodesOrModelColor(nodes);
					api.setNodeOrModelColor(node,'255,255,0');
					api.setPositionNode(node);
				}
			}
			var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(function(movement){
				var pick = api.testObjectSelected(movement.position.x, movement.position.y);

				if(!pick){return;}
				api.setNodeOrModelVisible(pick,false);
	
			},Cesium.ScreenSpaceEventType.LEFT_CLICK);
			
			viewer.camera.flyTo({ //设置视角
				destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 10000)
			});
	
		}
		}
		