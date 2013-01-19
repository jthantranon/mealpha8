function MEGlass(context) {
	/////////////
	// initialize
	/////////////
	this.checkCSS();
	
	////////////
	// variables
	////////////
	this.context = context || 'body';
	this.template = '\
			<div class="glassHeader">\
		        <div class="centerWrap">\
		            <div class="glassCenter">\
		                <div class="innertube"><img src="img/glass/topBorderCenter.png" width="100%" height="10"></div>\
		            </div>\
		        </div> \
		        <div class="glassLeft">\
		            <div class="innertube"><img src="img/glass/topBorderLeft.png" width="10" height="10"></div>\
		        </div>  \
		        <div class="glassRight">\
		            <div class="innertube"><img src="img/glass/topBorderRight.png" width="10" height="10"></div>\
		        </div>   \
			</div>\
		  <div class="glassTitle">The Title</div>\
		  <div class="glassTabWrapper">\
		      <div class="glassTabsLeft"></div>\
		      <div class="glassTabsRightWrapper">\
		          <div class="glassTabsRight"></div>\
		      </div>\
		  </div>\
		    <div class="glassContent">\
		    </div>';
	
	////////////////////////
	// initialization events
	////////////////////////
	
	$('.glassWrapper').livequery(function(){
		var context = $(this).children('.glassContent');
		$(this).resizable({alsoResize:context});
	});
	
	$('.glassWrapper').livequery(function(){
		$(this).draggable({handle:'.glassTabWrapper'});
	});
	
	
} // end constructor


MEGlass.prototype.checkCSS = function() {
	if(!$('link[href="css/meglass.css"]').length) {
		$('head').append('<link href="css/meglass.css" rel="stylesheet" type="text/css">');
	};
};



MEGlass.prototype.create = function(args){
	if(args && args.id) {
		
		var context = args.context || this.context;
		var content = args.content || "";
		var xpos = args.xpos || 100;
		var ypos = args.ypos || 100;
		var title = args.title || "New Window";
		var name = args.name || "Anon";
		var id = args.id;
		
		// set ID for template
		var wrapperStart = '<div class="glassWrapper" id="' + id + '">';
		var wrapperEnd = '</div>';
		
		// apply template
		var tmpl = wrapperStart + this.template + wrapperEnd;
		$(context).append(tmpl);
		
		// set title
		//alert($('#'+id).children('.glassTitle').text());
		$('#'+id).children('.glassTitle').text(title);
		
		// add content
		$('#'+id).children('.glassContent').empty();
		$('#'+id).children('.glassContent').html(content);
		
		// set starting location
		$('#'+id).css({"left":xpos,"top":ypos});
		
		// set name
		$('#'+id).attr('data-name',name);
		
	} else {
		console.log("error MEGlass.create() - incorrect arguments provided");
	};
};

MEGlass.prototype.title = function(id,newTitle) {
	if(id && newTitle) {
		$('#'+id).children('.glassTitle').text(newTitle);
		
	} else {
		console.log("error MEGlass.title() - incorrect arguments provided");
	};
	
}


MEGlass.prototype.append = function(id,content) {
	$('#'+id).children('.glassContent').append(content);	
}

MEGlass.prototype.clear = function(id) {
	$('#'+id).children('.glassContent').empty();
}

MEGlass.prototype.remove = function(id,context) {
	$('#'+id).children(context).empty();
}

MEGlass.prototype.replace = function(id,context,content) {
	$('#'+id).children(context).empty();
	$('#'+id).children(context).append(content);	
}


/////////////////////////////////////////
// testing and examples
/////////////////////////////////////////
//
//// make a new glassmaking shop
//myglass = new MEGlass();
//
//// do stuff with it
//myglass.create({id:500, title:"Wasp", context:'body'});
//myglass.create({id:550});
//myglass.title(550,"This Bomb Shiznitz");
//myglass.append(500,"<h1>Content:</h1><p>There is none</p>");
//myglass.append(550,"<h1>Content:</h1><p>550 Content...</p>");
//myglass.append(500,"<h1>Moar Content:</h1><p>New 500 Content...</p>");