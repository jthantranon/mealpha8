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
	self.container = $('#threedee');
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
	self.camera.name = "default camera";
	self.scene.add(self.camera);
	
	// default projector and mouse events
	self.projector = new THREE.Projector();
	self.mouse = { x: 1000, y: 1000 };
	
	
	// default light	
	self.light = new THREE.PointLight(0xFFFFFF);
	self.light.position.x = 10;
	self.light.position.y = 50;
	self.light.position.z = 130;
	self.light.name = "default light";
	
	self.scene.add(self.light);
	
	// controls
	//self.controls = new THREE.TrackballControls(self.camera);
	//self.controls.enabled = false;
	
	// drag plane
	var dragPlaneMat = new THREE.MeshNormalMaterial();
	var dragPlaneGeo = new THREE.PlaneGeometry( 2000, 2000, 8, 8 );
	self.dragPlane = new THREE.Mesh(dragPlaneGeo, dragPlaneMat);
	self.dragPlane.visible  = false;
	self.dragPlane.rotation.x = -90 * Math.PI / 180;
	
	self.dragGroup = new THREE.Object3D();
	self.dragGroup.add(self.dragPlane);	
	self.scene.add( self.dragGroup );

	
	// GLOBALS
	var INTERSECTED;
	var INTERSECTEDPLACE;
	var PREVIOUSPLACE;
	var INTERSECTEDITEM;
	var PREVIOUSITEM;
	var ISMOUSEDOWN = false;
	var DRAGEVENT = false;
	var DRAGITEM;
//	self.intersects;
//	self.lattice;
//	self.grid;
//	self.places;
//	self.items;
	
	/////////////////
	// EVENT HANDLERS
	/////////////////
	$(document).mousemove(function(e){
		self.mouse.x = (e.pageX / $(window).width()) * 2 - 1 ;
		self.mouse.y = -(e.pageY / $(window).height()) * 2 + 1;
		$('#coords').html(self.mouse.x + "," + self.mouse.y);
		
		$('#place').html();
		
	});
	
		
	$(document).on("mousedown", function(e){
		ISMOUSEDOWN = true;
		if(INTERSECTEDITEM) {
			DRAGEVENT = true;
			DRAGITEM = INTERSECTEDITEM;
		}
		
	});
	
	
	$(document).on("mouseup", function(e){
		ISMOUSEDOWN = false;
		//self.controls.enabled = true;
		DRAGEVENT = false;
		DRAGITEM = null;
	});
			
		
	/////////////////
	// INITIALIZATION
	/////////////////
		
	self.lattice = addLattice();
	self.grid = addLatticeGrid();
	self.places = addPlaces();
	self.items = addItem();
	
	self.scene.add(self.lattice);
	self.scene.add(self.grid);
	self.scene.add(self.places);
	self.scene.add(self.items);
	
	animate();
	
	/////////////////
	// ANIMATION LOOP
	/////////////////
	// animation
	function animate() {
		requestAnimFrame(function(){
            animate();
        });
		
		placeHover();
		itemHover();
		itemDrag();
		//$('#place').text(getSceneMembers(self.places));
		//$('#sticky').text(self.items);
		
		

        self.renderer.render(self.scene, self.camera);
        //self.controls.update(self.clock.getDelta());
		
	};
		
	////////////////////////////
	// OBJECT CREATION FUNCTIONS
	////////////////////////////
	function addItem() {
		
		var itemGroup = new THREE.Object3D();
		var itemGeo = new THREE.CubeGeometry(10, 10, 2, 1, 1, 1);
		
		
		var itemPosX = 0;
		var itemPosY = 0;
		var itemPosZ = 0;
		
		for (var i=0; i<10; i++) {
			var itemMat = new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: .75
			});
			var itemMesh = new THREE.Mesh(itemGeo, itemMat);
			itemMesh.name = "MEItem_" + i ;
			itemMesh.position.x = itemPosX;
			itemMesh.position.y = itemPosY;
			itemMesh.position.z = itemPosZ;
			itemGroup.add(itemMesh);
			itemPosX += 20;
			
		}
		
		
		itemGroup.name = "MEItemGroup";
		
		
		return itemGroup;
	};

	
	function addLattice() {
		
		var latticeGeo = new THREE.CubeGeometry(100, 20, 100, 5, 1, 5);
		var latticeMat = new THREE.MeshLambertMaterial({
			color: 0xFFFFFF,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: .15
		});
		
		var latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
		latticeMesh.position.y = -20;
		latticeMesh.name = "MELattice";
		
		return latticeMesh;
	};
	
	
	
	function addLatticeGrid() {
		
		var latticeGeo = new THREE.CubeGeometry(100, 20, 100, 5, 1, 5);
		var latticeMat = new THREE.MeshBasicMaterial({
			color: 0x00FFFF,
			wireframe: true,
			transparent: true,
			side: THREE.DoubleSide,
			linewidth: 2,
			opacity: .15
		});
		
		var latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
		latticeMesh.position.y = -20;
		latticeMesh.name = "MELatticeGrid";
		
		return latticeMesh;
	};
	
	
	function addPlaces() {
		
		var placeGroup = new THREE.Object3D();	
		var placeGeo = new THREE.CubeGeometry(18, 1, 18, 1, 1, 1);
		var placeMat = new THREE.MeshLambertMaterial({
			color: 0xFF0000,
			side: THREE.DoubleSide,
			opacity: .15
		});
				
		var placeMesh = new THREE.Mesh(placeGeo, placeMat);
		placeMesh.position.x = -40;
		placeMesh.position.y = -10;
		placeMesh.position.z = -40;
		
		var startX = -40;
		var startY = -10;
		var startZ = -40;
		var startID = 1;
		
		for(var i=0; i<5; i++){
			for(var j=0; j<5; j++){
				var aPlaceMesh = new THREE.Mesh(
						placeGeo,
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
				placeGroup.add(aPlaceMesh);
				startX += 20;
				startID++;
			}
			startX = -40;
			startZ += 20;
		}
		
		placeGroup.name = "MEPlaceGroup";
				
		return placeGroup;		
	};
	
	////////////////
	// SCENE HELPERS
	////////////////
	function getSceneMembers(scene) {
		var results = [];
		
		var descendants = scene.getDescendants();
		for (var i=0; i<descendants.length; i++) {
			results.push(descendants[i].name);			
		}
		
		return results;
	}
	
	////////////////////////
	// INTERACTION FUNCTIONS
	////////////////////////
	function placeHover() {
		var vector = new THREE.Vector3( self.mouse.x, self.mouse.y, 1 );
		self.projector.unprojectVector( vector, self.camera );		
		self.ray = new THREE.Raycaster( self.camera.position, vector.subSelf( self.camera.position ).normalize() );
		self.intersects = self.ray.intersectObjects(self.places.getDescendants());
		
		
		// if there is an intersection, do some highlights
		if(self.intersects.length) {
			console.log("place intersection occured");
			INTERSECTEDPLACE = self.intersects[0].object;
			if (PREVIOUSPLACE) {
				if (PREVIOUSPLACE != INTERSECTEDPLACE) PREVIOUSPLACE.material.opacity = .15; 
			}
			INTERSECTEDPLACE.material.opacity = 1;
			$('#sticky').text(INTERSECTEDPLACE.name);
			PREVIOUSPLACE = INTERSECTEDPLACE;
			$('#place').text(PREVIOUSPLACE.name);
		
		// there is no intersections, so lets clear if there was a previous
		} else {
			if (PREVIOUSPLACE) PREVIOUSPLACE.material.opacity = .15;
			INTERSECTEDPLACE = null;
		}
			
	} // PLACEHOVER //
	//////////////////
	
	
	function itemHover() {
		var itemVector = new THREE.Vector3( self.mouse.x, self.mouse.y, 1 );
		var itemProjector = new THREE.Projector();
		itemProjector.unprojectVector( itemVector, self.camera );		
		var itemRay = new THREE.Raycaster( self.camera.position, itemVector.subSelf( self.camera.position ).normalize() );
		var itemIntersects = itemRay.intersectObjects(self.items.getDescendants());
		
		// if there is an intersection, do some highlights
		if(itemIntersects.length) {
			console.log("item intersection occured");
			INTERSECTEDITEM = itemIntersects[0].object;
			if (PREVIOUSITEM) {
				if (PREVIOUSITEM != INTERSECTEDITEM) PREVIOUSITEM.material.opacity = .75; 
			}
			INTERSECTEDITEM.material.opacity = 1;
			$('#select').text(INTERSECTEDITEM.name);
			PREVIOUSITEM = INTERSECTEDITEM;
			//$('#place').text(PREVIOUSPLACE.name);
		
		// there is no intersections, so lets clear if there was a previous
		} else {
			if (PREVIOUSITEM) PREVIOUSITEM.material.opacity = .75;
			INTERSECTEDITEM = null;
		}
			
	} // ITEMHOVER //
	/////////////////
	
	
	function itemDrag() {
		if (DRAGEVENT) {
			// see if it works
			console.log("drag conditions occured");
			//INTERSECTEDITEM.material.color.setHSV(Math.random(), 1,0.5);
			
			self.controls.enabled = false;
			
			// match up location with mouseovered place
			if (INTERSECTEDPLACE) {
				DRAGITEM.position.x = INTERSECTEDPLACE.position.x;
				DRAGITEM.position.y = 0;
				DRAGITEM.position.z = INTERSECTEDPLACE.position.z;
			} else {
			// drag along the drag plane
				var vector = new THREE.Vector3( self.mouse.x, self.mouse.y, 1 );
				self.projector.unprojectVector( vector, self.camera );

				var dragRay = new THREE.Raycaster( self.camera.position, vector.subSelf( self.camera.position ).normalize() );
				var dragPlaneIntersects = dragRay.intersectObjects(self.dragGroup.getDescendants());
				
				DRAGITEM.position.copy( dragPlaneIntersects[ 0 ].point );				
			}
			
			
			
		}
		if (!ISMOUSEDOWN) {
			//INTERSECTEDITEM.material.color.setHex(0xFFFFFF);
		}
	}
	
	
	
	
	return self;

};


///////////////////
// REQUESTANIMFRAME
///////////////////
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