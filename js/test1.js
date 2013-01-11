////////////////////////
// world setup variables
////////////////////////

	var 
		HEIGHT = $(window).height(),
		WIDTH = $(window).width(),
		VIEWANGLE = 45,
		ASPECT = WIDTH/HEIGHT,
		NEAR = 0.1,
		FAR = 10000,
		USEFLYCONTROLS = false;
		
	var $container = $('body');
	
	var renderer = new THREE.WebGLRenderer();
	var camera =
		new THREE.PerspectiveCamera(
			VIEWANGLE,
			ASPECT,
			NEAR,
			FAR);
	
	var scene = new THREE.Scene();
	
//////////////////
// construct scene
//////////////////
	
	scene.add(camera);
	camera.position.z = 50;
	camera.position.y = 25;
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
        // update
//        var date = new Date();
//        var time = date.getTime();
//        var timeDiff = time - lastTime;
//        var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
//        three.cube.rotation.y += angleChange;
//        lastTime = time;
 
        // render
		controls.update(clock.getDelta());
        renderer.render(scene, camera);
 
        // request new frame
        requestAnimFrame(function(){
            animate();
        });
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
	
	
/////////////////////////
// add stuff to the scene
/////////////////////////
	
	material2 = new THREE.MeshLambertMaterial(
		{
		  color: 0xFFFFFF,
		  map: THREE.ImageUtils.loadTexture( 'img/diagonalPattern.png' ),
		});
	material2.side = THREE.DoubleSide;
	
	texture = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture( 'img/grid.png' ),
		side: THREE.DoubleSide
	});
	
	loader = new THREE.JSONLoader();
	
	loader.load( "obj/meDome.json", function( geometry ) {
        mesh = new THREE.Mesh( geometry, material2 );
        mesh.scale.set(10, 10, 10);
        mesh.position.y = 0;
        mesh.position.x = 0;
		mesh.position.z = 0;
		scene.add( mesh );
    });
	
	loader.load( "obj/mePlane.json", function( geometry ) {
		alert("wtd");
		
		groundMat = new THREE.MeshLambertMaterial({
			map: texture
		});
	
		groundMesh = new THREE.Mesh( geometry, texture );
		groundMesh.scale.set(12, 12, 12);
		groundMesh.position.y = -35;
		scene.add(groundMesh);	
	});
	
	// lights
	//ambientLight = new THREE.AmbientLight(0xEEEEEE);
	pointLight = new THREE.PointLight();
	pointLight.intensity = (1);
	pointLight.distance = (5000);
	pointLight.position.set( 0, 25, 0 );
	scene.add(pointLight);
		
//	// read in args or set defaults
//	var gridX = 1000;
//	var gridY = 1000;
//	var sizeX = 10;
//	var sizeY = 10;
//	var spacing = 5;
//	var finalGrid = [];
//	
//	// define the single item
//	var singlePlaneGeometry; // make a plane using sizes
//	var singlePlaneMat; // make a material for this;
//	var singlePlaneMesh; // put them together for a mesh
//	
//	// TODO: do we need to make a grid plane?
//	// if so, make that here
//	
//	// make a loop to make the grid of single items
//	var startingPos = [0,0];
//	var cubeMat = new THREE.MeshBasicMaterial({
//		color: 0xFF0000
//	});
//	
//	var cubeGeo = new THREE.CubeGeometry(sizeX,sizeY,10);
//	
//	var cubeMesh = new THREE.Mesh(cubeGeo,cubeMat);
//	scene.add(cubeMesh);
//			
//	for (var i = 0; i < 1; i++) {
//		var cubeMesh = new THREE.Mesh(cubeGeo,cubeMat);
//		cubeMesh.position.set(startingPos[0],startingPos[1]);
//		finalGrid.push(cubeMesh);
//		scene.add(cubeMesh);
//		startingPos[0] += sizeX + spacing;
//		console.log("cube #" + i + " made...");
//	}
	
	
///////////////
// start renderer
/////////////////

	animate();
	
// the end /////////////////////
