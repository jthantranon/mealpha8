// OBJECTS

////////////////////
// World3D
////////////////////
function World3D() {
	var self = this;
	
	// default world variables
	self.viewHeight = $(window).height();
	self.viewWidth = $(window).width();
	self.viewAngle = 45;
	self.aspect = self.viewWidth/self.viewHeight;
	self.nearCull = 0.1;
	self.farCull = 3000;
	self.container = $('body');
	self.clock = new THREE.Clock();
	
	self.renderer = new THREE.WebGLRenderer();
	self.renderer.setSize(self.viewWidth,self.viewHeight);
	self.renderer.setClearColorHex( 0xEEEEEE, 1 );
	self.container.append(self.renderer.domElement);

	self.scene = new THREE.Scene();
		
	// default camera
	self.camera = new THREE.PerspectiveCamera(
			self.viewAngle,
			self.aspect,
			self.nearCull,
			self.farCull);
	
	self.camera.position.x = -100;
	self.camera.position.y = 100;
	self.camera.position.z = 200;
	self.camera.lookAt(new THREE.Vector3(0,0,0));
	self.scene.add(self.camera);
	
	// default projector and mouse events
	self.projector = new THREE.Projector();
	self.mouse = { x: 1000, y: 1000 };
	
	var INTERSECTED;
	
	$(document).mousemove(function(e){
		self.mouse.x = (e.pageX / $(window).width()) * 2 - 1 ;
		self.mouse.y = -(e.pageY / $(window).height()) * 2 + 1;
		$('#coords').html(self.mouse.x + "," + self.mouse.y);
		
		$('#place').html();
		
	}); 
	
	
	document.addEventListener( 'mousemove', self.onDocumentMouseMove, false );
	
	$(document).on("mousedown", function(e){
		self.onDocumentMouseDown(e);
	});
		
	self.onDocumentMouseMove = function() {
		$('#coords').text(self.mouse.x);
		
	};
	
	//////////////////////
	// DRAGGING CAPABILITY
	//////////////////////
	var isBeingDragged = false;
	var STICKYOBJECT;
	
	self.onDocumentMouseDown = function(event) {
		event.preventDefault();
		
		var vector = new THREE.Vector3( self.mouse.x, self.mouse.y, 0.5 );
		self.projector.unprojectVector( vector, self.camera );
		//alert("projection");

		var ray = new THREE.Raycaster( self.camera.position, vector.subSelf( self.camera.position ).normalize() );
		
		var intersects = ray.intersectObjects( self.scene.getDescendants() );
	
		if ( intersects.length > 0 ) {

			//controls.enabled = false;

			SELECTED = intersects[ 2 ].object;
			if (SELECTED.name == "MEItem") { 
				// do the dragging shit
				
				//alert(SELECTED.name);
				
				// make a new array of objects to stick to
				var stickyIntersects = ray.intersectObjects( self.scene.getDescendants() );
				
				if ( stickyIntersects.length > 0 ) {
					STICKYOBJECT = stickyIntersects[ 2 ].object;
					$('#sticky').text(INTERSECTED.name);
										
				}
				
				
				//isBeingDragged = true;
				
				
				
			}

			//var intersects = ray.intersectObject( plane );
			//offset.copy( intersects[ 0 ].point ).subSelf( plane.position );

			//container.style.cursor = 'move';

		}

	};
	
	// default light	
	self.light = new THREE.PointLight(0xFFFFFF);
	self.light.position.x = 10;
	self.light.position.y = 50;
	self.light.position.z = 130;
	
	self.scene.add(self.light);
	
	// controls
	//self.controls = new THREE.TrackballControls(self.camera);
	
	var INTERSECTED;
	
	// animation
	self.animate = function() {
		requestAnimFrame(function(){
            self.animate();
        });
		
		// find intersections
		var vector = new THREE.Vector3( self.mouse.x, self.mouse.y, 1 );
		self.projector.unprojectVector( vector, self.camera );

		self.ray = new THREE.Raycaster( self.camera.position, vector.subSelf( self.camera.position ).normalize() );
		

		self.intersects = self.ray.intersectObjects(self.scene.getDescendants());
		
		
		if(self.intersects.length) {
			var target = self.intersects[2].object;
			if(target.name != "MELattice" && target.name != "MELatticeGrid") {
				if(INTERSECTED) { if(target != INTERSECTED) { INTERSECTED.material.opacity = .15; } }
				//$('#place').empty().text(self.intersects[2].object.name);
				target.material.opacity = 1;
				INTERSECTED = self.intersects[2].object;
				$('#place').empty().text(INTERSECTED.name);
			} else if(INTERSECTED) { 
				INTERSECTED.material.opacity = .15;
				$('#place').empty().text("nothing, last: " + INTERSECTED.name);
				INTERSECTED = null;
			}
			
			//console.log(target);			
		} else {
			if(INTERSECTED) { 
				INTERSECTED.material.opacity = .15;
				$('#place').empty().text("nothing, last: " + INTERSECTED.name);
				INTERSECTED = null;
			}
			
		}
		
		// drag objects

        self.renderer.render(self.scene, self.camera);
        //self.controls.update(self.clock.getDelta());
		
	};
	
	// default object
	var sphereMaterial = new THREE.MeshNormalMaterial();
	
	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry(50,16,16),
		sphereMaterial);
	
	//self.scene.add(sphere);
	
//	var testLattice = new MELattice();
//	self.scene.add(testLattice);
	
	
	/////////////////
	// start renderer
	/////////////////
	self.animate();
		
	
};

////////////////////
//MEItem
////////////////////
function MEItem() {
	var self = this;
	
	self.itemGeo = new THREE.CubeGeometry(10, 10, 2, 1, 1, 1);
	self.itemMat = new THREE.MeshLambertMaterial({
		color: 0xFFFFFF,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: .95
	});
	self.itemMesh = new THREE.Mesh(self.itemGeo, self.itemMat);
	self.itemMesh.name = "MEItem";
	
	return self.itemMesh;
};

////////////////////
// MELattice
////////////////////
function MELattice() {
	var self = this;
	
	self.latticeGeo = new THREE.CubeGeometry(100, 20, 100, 5, 1, 5);
	self.latticeMat = new THREE.MeshLambertMaterial({
		color: 0xFFFFFF,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: .15
	});
	self.latticeMesh = new THREE.Mesh(self.latticeGeo, self.latticeMat);
	self.latticeMesh.name = "MELattice";
	
	return self.latticeMesh;
};

////////////////////
// MELatticeGrid
////////////////////
function MELatticeGrid() {
	var self = this;
	
	self.latticeGeo = new THREE.CubeGeometry(100, 20, 100, 5, 1, 5);
	self.latticeMat = new THREE.MeshBasicMaterial({
		color: 0x00FFFF,
		wireframe: true,
		transparent: true,
		side: THREE.DoubleSide,
		linewidth: 2,
		opacity: .15
	});
	self.latticeMesh = new THREE.Mesh(self.latticeGeo, self.latticeMat);
	self.latticeMesh.name = "MELatticeGrid";
	
	return self.latticeMesh;
};

////////////////////
// MELatticePlaces
////////////////////
function MELatticePlaces() {
	var self = this;
	
	self.placeGroup = new THREE.Object3D();	
	self.placeGeo = new THREE.CubeGeometry(18, 1, 18, 1, 1, 1);
	self.placeMat = new THREE.MeshLambertMaterial({
		color: 0xFF0000,
		side: THREE.DoubleSide,
		opacity: .15
	});
	self.placeMesh = new THREE.Mesh(self.placeGeo, self.placeMat);
	self.placeMesh.position.x = -40;
	self.placeMesh.position.y = -10;
	self.placeMesh.position.z = -40;
	
	var startX = -40;
	var startY = -10;
	var startZ = -40;
	var startID = 1;
	
	for(var i=0; i<5; i++){
		for(var j=0; j<5; j++){
			var aPlaceMesh = new THREE.Mesh(
					self.placeGeo,
					new THREE.MeshLambertMaterial({
						color: 0xFF0000,
						side: THREE.DoubleSide,
						opacity: .15
					})
			);
			aPlaceMesh.position.x = startX;
			aPlaceMesh.position.y = startY;
			aPlaceMesh.position.z = startZ;
			aPlaceMesh.name = startID;
			self.placeGroup.add(aPlaceMesh);
			startX += 20;
			startID++;
		}
		startX = -40;
		startZ += 20;
	}
	
	//self.placeGroup.add(self.placeMesh);
	
	
	
	return self.placeGroup;
};

////////////////////
//
////////////////////
function MEPlaceEvents(){
	
}

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

function onDocumentMouseDown( event ) {

//	event.preventDefault();
//
//	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
//	projector.unprojectVector( vector, camera );
//
//	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
//
//	var intersects = ray.intersectObjects( objects );
//
//	if ( intersects.length > 0 ) {
//
//		controls.enabled = false;
//
//		SELECTED = intersects[ 0 ].object;
//
//		var intersects = ray.intersectObject( plane );
//		offset.copy( intersects[ 0 ].point ).subSelf( plane.position );
//
//		container.style.cursor = 'move';
//
//	}

}

function onDocumentMouseUp( event ) {

	event.preventDefault();

	controls.enabled = true;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );


	if ( SELECTED ) {

		var intersects = ray.intersectObject( plane );
		SELECTED.position.copy( intersects[ 0 ].point.subSelf( offset ) );
		return;

	}


	var intersects = ray.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

}