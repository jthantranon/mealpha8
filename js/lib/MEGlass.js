function MEGlass(context) {
	
	
	var self = this;
	/////////////
	// initialize
	/////////////
	this.checkCSS();
	this.checkMinContainer();
	
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
		  <div class="glassReflection"></div>\
		  <div class="glassMinButton"></div>\
		<div class="glassCloseButton"></div>\
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
	
	$('.glassMinButton').livequery('click',function(){
		var context = $(this).parent();
		var id = $(context).attr('id');
		self.minimize(id);		
	});
	
	$('.glassMinBar').livequery('click',function(){
		var id = $(this).attr('id');
		$(this).remove();
		self.maximize(id);		
	});
	
	
} // end constructor


MEGlass.prototype.checkCSS = function() {
	if(!$('link[href="css/meglass.css"]').length) {
		$('head').append('<link href="css/meglass.css" rel="stylesheet" type="text/css">');
	};
};

MEGlass.prototype.checkMinContainer = function() {
	var mycontext = 'body';
	var mytemplate = '<div class="glassMinContainer"></div>';
	
	if(!$('.glassMinContainer').length) {
		$(mycontext).append(mytemplate);
	};
};


MEGlass.prototype.create = function(args){
	if(args && args.id) {
		
		var context = args.context || "body";
		var content = args.content || "";
		var xpos = args.xpos || 100;
		var ypos = args.ypos || 100;
		var title = args.title || "Unknown Glass";
		var name = args.name || args.id + "Glass";
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
	
};


MEGlass.prototype.append = function(id,content) {
	$('#'+id).children('.glassContent').append(content);	
};

MEGlass.prototype.clear = function(id) {
	$('#'+id).children('.glassContent').empty();
};

MEGlass.prototype.remove = function(id,context) {
	$('#'+id).children(context).empty();
};

MEGlass.prototype.destroy = function(id) {
	$('#'+id).remove();
};

MEGlass.prototype.replace = function(id,context,content) {
	$('#'+id).children(context).empty();
	$('#'+id).children(context).append(content);	
};

MEGlass.prototype.reattr = function(id,context,content) {
	$('#'+id).find(context).empty();
	$('#'+id).find(context).append(content);	
};

MEGlass.prototype.destroy = function(id) {
	$('#'+id).remove();	
};

MEGlass.prototype.hide = function(id) {
	$('#'+id).hide();
};

MEGlass.prototype.show = function(id) {
	$('#'+id).show();
};

MEGlass.prototype.minimize = function(id) {
	$('#'+id).hide();
	var minTitle = $('#'+id).children('.glassTitle').text();
	$('.glassMinContainer').append('<div class="glassMinBar" id="' + id +'">' + minTitle + '<div class="glassMaxButton"></div></div>');
};

MEGlass.prototype.maximize = function(id) {
	$('#'+id).show();	
};

function gAppend(id,appendage){
	var thereturn = $('#'+id).children('.glassContent').append(appendage); 
	return thereturn;
};

function gAppendC(id,container,appendage){
	var thereturn = $('#'+id+container).append(appendage); 
	return thereturn;
};

function attrAppend(id,appendage){
	var thereturn = $('#mIcon'+id).attr(appendage); 
	return thereturn;
}

MEGlass.prototype.aBreak = function(id){
	gAppend(id,"<br>");
};

MEGlass.prototype.aObj = function(id,tMedo) {
	gAppend(id,"<input type='button' id='mIcon"+tMedo.kid+"'>");
	attrAppend(tMedo.kid,{class:'obj mIcon',value:tMedo.name,title:tMedo.kid,'data-name':tMedo.name,'data-metakind':tMedo.metakind,'data-metaid':tMedo.metaid});
	$('.mIcon').draggable({revert: false,helper: 'clone',appendTo: '#wholepage',containment: 'DOM',zIndex: 1500,cancel: false});
	if (tMedo.ytlink){attrAppend(tMedo.kid,{'data-ytlink':tMedo.ytlink});}
};

MEGlass.prototype.aMeta = function(id,tMedo) {
	gAppendC(id,'MetasHere',"<input type='button' id='mIcon"+tMedo.kid+"'>");
	attrAppend(tMedo.kid,{class:'obj mIcon',value:tMedo.name,title:tMedo.kid,'data-name':tMedo.name,'data-metakind':tMedo.metakind,'data-metaid':tMedo.metaid});
	$('.mIcon').draggable({revert: false,helper: 'clone',appendTo: '#wholepage',containment: 'DOM',zIndex: 1500,cancel: false});
	if (tMedo.ytlink){attrAppend(tMedo.kid,{'data-ytlink':tMedo.ytlink});}
};

MEGlass.prototype.rObj = function(id,tKID) {
	$('#'+id).find('#mIcon'+tKID).remove();
};

MEGlass.prototype.aContainer = function(id,container,contID){
	gAppend(id,
			"<div><h1>"+container+"</h1><span id='"+id+contID+"'></span>");
};

MEGlass.prototype.aData = function(id,label,appendage){
	gAppend(id,
			"<div><h1>"+label+"</h1>"+
			"<p class='"+label+"' id='"+id+label+"'>" + appendage + "</p></div>");
};

MEGlass.prototype.aField = function(id,label,fieldID,fieldName){
	gAppend(id,
			"<h1>"+label+"</h1>"+
			"<input id='"+fieldID+"' name='"+fieldName+"' type='text'><br>");
};

MEGlass.prototype.aSubmitButton = function(id,btnText,fieldID){
	gAppend(id,
			"<input value='"+btnText+"' id='"+fieldID+"' type='button' class='button'>");
};

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