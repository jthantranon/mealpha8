////////////////////////
// world setup variables
////////////////////////

	var 
		HEIGHT = $(window).height(),
		WIDTH = $(window).width(),
		VIEWANGLE = 45,
		ASPECT = WIDTH/HEIGHT,
		NEAR = 0.1,
		FAR = 3000,
		USEFLYCONTROLS = false;
		
	var $container = $('body');
	
	var transitCamera = false;
	var camDestination;
	
	var renderer = new THREE.WebGLRenderer();
	var camera =
		new THREE.PerspectiveCamera(
			VIEWANGLE,
			ASPECT,
			NEAR,
			FAR);
	
	var camera2 =
		new THREE.PerspectiveCamera(
			VIEWANGLE,
			ASPECT,
			NEAR,
			FAR);
	
	var scene = new THREE.Scene();
	var glowscene = new THREE.Scene();
	
	var mouse = { x: 0, y: 0 };
	var INTERSECTED;
	
	$(document).mousemove(function(e){
		mouse.x = (e.pageX / $(window).width()) * 2 - 1 ;
		mouse.y = -(e.pageY / $(window).height()) * 2 + 1;
	}); 
	
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	
	projector = new THREE.Projector();
	
//////////////////
// shadow settings
//////////////////
	
	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 700, 2000 );
	light.castShadow = true;

	light.shadowCameraNear = 200;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 45;

	light.shadowBias = -0.00011;
	light.shadowDarkness = 0.5;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	scene.add( light );
	
	var light2 = new THREE.SpotLight( 0xffffff, 1.5 );
	light2.position.set( 0, 700, 2000 );
	light2.castShadow = true;

	light2.shadowCameraNear = 200;
	light2.shadowCameraFar = camera.far;
	light2.shadowCameraFov = 45;

	light2.shadowBias = -0.00011;
	light2.shadowDarkness = 0.5;

	light2.shadowMapWidth = 2048;
	light2.shadowMapHeight = 2048;

	glowscene.add( light2 );
	
//////////////////
// construct scene
//////////////////
	
	scene.add(camera);
	glowscene.add(camera2);
	camera.position.z = 30;
	camera.position.y = 30;
	camera2.position.z = 30;
	camera2.position.y = 30;
	renderer.setSize(WIDTH,HEIGHT);
	$container.append(renderer.domElement);
	clock = new THREE.Clock();
	
///////////////////	
// requestAnimFrame	
///////////////////

	// shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
              	window.mozRequestAnimationFrame    || 
              	window.oRequestAnimationFrame      || 
              	window.msRequestAnimationFrame     || 
              	function( callback ){
                	window.setTimeout(callback, 1000 / 60);
              	};
    })();
	
/////////////////
// animation loop
/////////////////

	function animate(){
		// request new frame
        requestAnimFrame(function(){
            animate();
        });
        // update
//        var date = new Date();
//        var time = date.getTime();
//        var timeDiff = time - lastTime;
//        var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
//        three.cube.rotation.y += angleChange;
//        lastTime = time;
		
		
//        if (transitCamera) {
//        	transitionCamera(camDestination);
//        	// move the camera
//        }
//
//		// find intersections
//		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
//		projector.unprojectVector( vector, camera );
//
//		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
//
//		var intersects = ray.intersectObjects( scene.children );
//
//		if ( intersects.length > 0 ) {
//
//			if ( INTERSECTED != intersects[ 0 ].object ) {
//				
//				console.log("mouseover occured");
//				$('#cubeID').empty().text(intersects[ 0 ].object.name);
//
//				//if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
//
//				INTERSECTED = intersects[ 0 ].object;
//				
//				//INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
//				if (INTERSECTED.name) {INTERSECTED.material.emissive.setHex( 0x888888 );}
//
//			}
//
//		} else {
//
//			//if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
//
//			INTERSECTED = null;
//
//		}
		
		
		
        // render
		//controls.noRotate = true;
		controls.update(clock.getDelta());
        renderer.render(scene, camera);
		//glowcomposer.render();
	    //finalcomposer.render();
        
        //mycomposer.render();

        
 
        
    }

///////////
// controls
///////////

	// fly controls
	if (USEFLYCONTROLS){
		controls = new THREE.FlyControls(camera);
		controls.movementSpeed = 50;
		controls.rollSpeed = 0.5;
		controls.lookVertical = true;
	} else {
		controls = new THREE.TrackballControls(camera);
		//controls.movementSpeed = 50;
		//controls.rollSpeed = 0.5;
		//controls.lookVertical = true;
	}
	
////////////////////
// camera transition
////////////////////
	
	function transitionCamera(camDestination) {
		// get current camera loc
		currentCamLocX = camera.position.x;
		currentCamLocZ = camera.position.z;
		
		if (camDestination.position.x > currentCamLocX) {
			currentCamLocX += 1;			
		} else {
			currentCamLocX -= 1;
		}
		
		if (camDestination.position.z > currentCamLocZ) {
			currentCamLocZ += 1;			
		} else {
			currentCamLocZ -= 1;
		}
		camera.position.x = currentCamLocX;
		camera.position.z = currentCamLocZ;
	}
	
	
/////////////////////////
// add stuff to the scene
/////////////////////////
//	
	skyboxGeo = new THREE.CubeGeometry(5000, 5000, 5000, 20, 20, 20);
	skyboxMat = new THREE.MeshLambertMaterial({
		color: 0xFFFFFF,
		side: THREE.DoubleSide
	});
	skyboxMesh = new THREE.Mesh(skyboxGeo, skyboxMat);
	//scene.add(skyboxMesh);
	
	groundGeo = new THREE.PlaneGeometry(5000, 5000, 100, 100);
	groundMat = new THREE.MeshBasicMaterial({
		color: 0xCCCCCC,
		wireframe: true,
		wireframeLineWidth: 5
		
	});
	
	var sizeZ = 2;
	groundMesh = new THREE.Mesh(groundGeo, groundMat);
	groundMesh.rotation.x = 90*(3.14159265)/180;
	groundMesh.position.y = -(sizeZ/2);
	groundMesh.receiveShadow = true;
	scene.add(groundMesh);
	
	//renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = false;
	renderer.antialias = true;
	
//	theLight = new THREE.SpotLight(0xFFFFFF);
//	theLight.position.y = 30;
//	theLight.castShadow = true;
//	scene.add(theLight);
//	
	scene.fog = new THREE.FogExp2(0xFFFFFF, 0.0015);
	
	var startingLoc = [0,0];
	
	var gridUnits = 100;
	var sizeX = 80;
	var sizeY = 80;
	
	var spacing = 100;
	var zoneX = 1;
	var zoneY = 1;
	var zoneZ = 1;
	
	// get the starting location
	//startingLoc[0] = -(gridUnits*spacing)/2;
	//startingLoc[1] = -(gridUnits*spacing)/2;
	
	
	for (var i=0; i < gridUnits; i++) {
		
		
		for (var j=0; j < gridUnits; j++) {
			
			var sphereMaterial = 
				new THREE.MeshLambertMaterial({
					color: 0xFFFFFF
				});
			
			var sphere = new THREE.Mesh(
				new THREE.CubeGeometry(sizeX,sizeY,sizeZ),
				sphereMaterial);
			
			var gmap = THREE.ImageUtils.loadTexture('img/glowmap.png');
			
			var sphere2Material = 
				new THREE.MeshPhongMaterial({
					map: gmap,
					ambient: 0xffffff,
					color: 0xFFFFFF
				});
			
			var sphere2 = new THREE.Mesh(
					new THREE.CubeGeometry(sizeX,sizeY,sizeZ),
					sphere2Material);
			
			//alert(startingLoc[0]);
			//alert(startingLoc[1]);
			
			sphere.position.setX(startingLoc[0]);
			sphere.position.setZ(startingLoc[1]);			
			sphere.rotation.x = 90*(3.14159265)/180;
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			
			sphere2.position.setX(startingLoc[0]);
			sphere2.position.setZ(startingLoc[1]);			
			sphere2.rotation.x = 90*(3.14159265)/180;
			sphere2.castShadow = true;
			sphere2.receiveShadow = true;
			
			sphere.name = zoneX + "," + zoneY + "," + zoneZ;
			tQuery.data(sphere, "class", "zone");
			//alert(sphere.name);
			scene.add(sphere);
			
			glowscene.add(sphere2);
			
			zoneX++;
			startingLoc[0] += spacing;
		}
		
		startingLoc[1] += spacing;					
		startingLoc[0] = 0;
		zoneX = 1;
		zoneY++;
	}
	
	resizeObj = scene.getChildByName("2,2,1");
	//alert(JSON.stringify(resizeObj.position));
	//camera.position.x = resizeObj.position.x;
	//controls.target= resizeObj.position;
	
	
	function pad (str, max) {
		return str.length < max ? pad("0" + str, max) : str;
	}
	
	
	function onDocumentMouseDown( event ) {

//		event.preventDefault();
//
//		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
//		projector.unprojectVector( vector, camera );
//
//		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
//
//		var intersects = ray.intersectObjects( scene.children );

//		if ( intersects.length > 0 ) {
//			
//			if((intersects[0].object.name)){
//				//alert(intersects[0].object.name);
//				controls.target = intersects[0].object.position;
//				camDestination = intersects[0].object;
//				//camDestination.position.y = 30;
//				//transitCamera = true;
//			}
//			
//			
//
//			//intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
//
//			//var particle = new THREE.Particle( particleMaterial );
//			//particle.position = intersects[ 0 ].point;
//			//particle.scale.x = particle.scale.y = 8;
//			//scene.add( particle );
//
//		}

		/*
		// Parse all the faces
		for ( var i in intersects ) {

			intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

		}
		*/
	}
	
	
	
//////////////
// glow effect
//////////////
	
	// Prepare the glow composer's render target
	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
	renderTargetGlow = new THREE.WebGLRenderTarget( WIDTH, HEIGHT, renderTargetParameters );
	 
	// Prepare the blur shader passes
	hblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
	vblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );
	 
	var bluriness = 3;
	 
	hblur.uniforms[ "h" ].value = bluriness / WIDTH;
	vblur.uniforms[ "v" ].value = bluriness / HEIGHT;
	 
	// Prepare the glow scene render pass
	var renderModelGlow = new THREE.RenderPass( glowscene, camera);
	 
	// Create the glow composer
	glowcomposer = new THREE.EffectComposer( renderer, renderTargetGlow );
	 
	// Add all the glow passes
	glowcomposer.addPass( renderModelGlow );
	glowcomposer.addPass( hblur );
	glowcomposer.addPass( vblur );
	
	var finalshader = {
		    uniforms: {
		        tDiffuse: { type: "t", value: 0, texture: null }, // The base scene buffer
		        tGlow: { type: "t", value: 1, texture: null } // The glow scene buffer
		    },
		 
		    vertexShader: [
		        "varying vec2 vUv;",
		 
		        "void main() {",
		 
		            "vUv = vec2( uv.x, 1.0 - uv.y );",
		            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		 
		        "}"
		    ].join("n"),
		 
		    fragmentShader: [
		        "uniform sampler2D tDiffuse;",
		        "uniform sampler2D tGlow;",
		 
		        "varying vec2 vUv;",
		 
		        "void main() {",
		 
		            "vec4 texel = texture2D( tDiffuse, vUv );",
		            "vec4 glow = texture2D( tGlow, vUv );",
		            "gl_FragColor = texel + vec4(0.5, 0.75, 1.0, 1.0) * glow * 2.0;", // Blend the two buffers together (I colorized and intensified the glow at the same time)
		 
		        "}"
		    ].join("n")
		};
	
	// First we need to assign the glow composer's output render target to the tGlow sampler2D of our shader
	finalshader.uniforms[ "tGlow" ].texture = glowcomposer.renderTarget2;
	// Note that the tDiffuse sampler2D will be automatically filled by the EffectComposer
	 
	// Prepare the base scene render pass
	var renderModel = new THREE.RenderPass( scene, camera );
	 
	// Prepare the additive blending pass
	var finalPass = new THREE.ShaderPass( finalshader );
	finalPass.needsSwap = true;
	 
	// Make sure the additive blending is rendered to the screen (since it's the last pass)
	finalPass.renderToScreen = true;
	 
	// Prepare the composer's render target
	renderTarget = new THREE.WebGLRenderTarget( WIDTH, HEIGHT, renderTargetParameters );
	 
	// Create the composer
	finalcomposer = new THREE.EffectComposer( renderer, renderTarget );
	 
	// Add all passes
	//finalcomposer.addPass( renderModel );
	finalcomposer.addPass( finalPass );

///////////////
// post effects
///////////////
	
	
		
///////////////
// start renderer
/////////////////

	animate();
	
// the end /////////////////////
