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
	camera.position.z = 30;
	camera.position.y = 0;
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
	
	var sphereMaterial =
		  new THREE.MeshLambertMaterial(
		    {
		      color: 0xCC0000
		    });
	
	var sphere = new THREE.Mesh(

			  new THREE.SphereGeometry(
			    50,
			    16,
			    16),

			  sphereMaterial);

	scene.add(sphere);
	
	
///////////////
// start renderer
/////////////////

	animate();
	
// the end /////////////////////
