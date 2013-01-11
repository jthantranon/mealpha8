// handle dragging and intersections

// global tools
	// projector
	// raycaster
	// intersects array

// global mousedown state
self.isMouseDown = false;

$(document).on("mousedown", function(e){
	self.isMouseDown = true;
});

$(document).on("mouseup", function(e){
	self.isMouseDown = false;
});
	



		





// on mousemove event

	// figure out what object we are pointing too
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
			
			// a not shit object has been mousedover and all of the effects are applied
			// do your dragging thing now
			if(INTERSECTED.name == "MEItem" && self.isMouseDown) {
				// do some draggin shit
			}
			
			
			
			
			
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
		
	
	// filter out the container objects
	// reveal name/info about valid mouseovered object
	// apply effects based on hover state
	// check to see if this object is the same as the hovered object in the previous frame
		// apply mouseout effects if necessary

	// check to see if the mouse if pressed;
	// if it is pressed, check the currently hovered object
	// move the position of the currently selected object to above the currently hovered object
	// if mouse if not pressed, dont do anything to the objects

