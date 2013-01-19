function MENav(context) {
	/////////////
	// initialize
	/////////////
	this.checkCSS();
	
	////////////
	// variables
	////////////
	this.context = context || 'body';
	this.template = '\
		<div class="navigationWrapper">\
		<ul class="navigationList">\
			<li id="navNorth">n</li>\
		    <li id="navNortheast">ne</li>\
		    <li id="navEast">e</li>\
		    <li id="navSoutheast">se</li>\
		    <li id="navSouth">s</li>\
		    <li id="navSouthwest">sw</li>\
		    <li id="navWest">w</li>\
		    <li id="navNorthwest">nw</li>\
		    <li id="navUp">u</li>\
		    <li id="navDown">d</li>\
		</ul>\
		<p class="navLocation">Locacione</p>\
		<p class="navCoords">500.500.500:0</p>\
		</div>';
	
	////////////////////////
	// initialization events
	////////////////////////
	
	$(window).on('resize',function() {
		  this.repos();
	});
	
//	$('.navigationList li').livequery('click', function(){
//		dir = this.id;
//			$.ajax({
//				type: 'POST',
//				url: '/action/move/' + dir,
//				data: null,
//				success: function(data){
//					GlassLocSheet();
//			}
//		});	
//	});	
	
} // end constructor


MENav.prototype.checkCSS = function() {
	if(!$('link[href="css/menav.css"]').length) {
		$('head').append('<link href="css/menav.css" rel="stylesheet" type="text/css">');
	};
};



MENav.prototype.create = function(context){
	
	var context = context || this.context;
	var xpos = ($(window).width() / 2) - 210;	
		
	// apply template
	$(context).append(this.template);
	
	// set left offset
	$('.navigationWrapper').css({left:xpos});
	
};


MENav.prototype.repos = function() {
	var xpos = ($(window).width() / 2) - 210;		
	$('.navigationWrapper').css({left:xpos});
}

MENav.prototype.hide = function(id,context,content) {
	$('.navigationList').fadeOut();
}

MENav.prototype.show = function(id,context,content) {
	$('.navigationList').fadeIn();	
}

MENav.prototype.remove = function(id,context,content) {
	$('.navigationList').remove();	
}


/////////////////////////////////////////
// testing and examples
/////////////////////////////////////////
//
mynav = new MENav();
mynav.create();