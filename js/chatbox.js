$(document).ready(function(e){

	Glass = new MEGlass();
	
	var xmid = document.documentElement.clientWidth/2;
	var ymid = document.documentElement.clientHeight/2;
	
	////////////
	// variables
	////////////
	var chatlog = [];
	var shiftDown = false;
	var logIndex = 0;
	
	//////////
	// methods
	//////////
	chatLoopback = function(msg) {
		context = $(".messages");
		msgChan = $(".chatChannel").val();
		outmsg = '<p><span class="channelLoopback">['+ msgChan +']</span><b> Self:</b> ' + msg + '</p>';
		$(context).append(outmsg);
		$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
		$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
	};
	
	chatLocal = function(msg) {
		context = $(".messages");
		msgChan = $(".chatChannel").val();
		outmsg = '<p><span class="channelLoopback">['+ msgChan +']</span><b> Self:</b> ' + msg + '</p>';
		$(context).append(outmsg);
		$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
		$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
	};
	
	chatGlobal = function(msg) {
		context = $(".messages");
		msgChan = $(".chatChannel").val();
		outmsg = '<p><span class="channelLoopback">['+ msgChan +']</span><b> Self:</b> ' + msg + '</p>';
		$(context).append(outmsg);
		$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
		$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
	};
	
	//////////////////
	// Chat Box FadeIn
	//////////////////
	$('.chatWrapper').fadeTo(3000, 1);	
	
	
	///////////////////////
	// Image Hover Bindings
	///////////////////////
	$('.chatAnchor')
		.append('<span class="hover"></span>').each(function () {
			var $span = $('> span.hover', this).css('opacity', 0);
			$(this).hover(function () {
				$span.stop().fadeTo(250, 1);
			}, function () {
				$span.stop().fadeTo(500, 0);
			});
		});
	
	$('.chatSettings')
		.append('<span class="hover"></span>').each(function () {
			var $span = $('> span.hover', this).css('opacity', 0);
			$(this).hover(function () {
				$span.stop().fadeTo(250, 1);
			}, function () {
				$span.stop().fadeTo(500, 0);
			});
		});
	
	$('.chatBox')
		.append('<span class="hover"></span>').each(function () {
			var $span = $('> span.hover', this).css('opacity', 0);
			$(this).hover(function () {
				$span.stop().fadeTo(250, 1);
				$(this).children('.tabWrapper').fadeTo(250, .7);
			}, function () {
				$span.stop().fadeTo(500, 0);
				$(this).children('.tabWrapper').fadeTo(250, 0);
			});
		});	
	
	$('.chatWrapper, .chatBox, .chatMessages')
		.hover(function() {
			//myWorld.controls.enabled = false;
		}, function() {
			//myWorld.controls.enabled = true;
		});
	
	
	///////////////////////
	// Drag/Resize Bindings
	///////////////////////
	$('.chatWrapper').draggable({
		handle: '.chatAnchor, .tabs'
	});
	
	$('.chatBox').resizable({
		handles: 'ne',
		alsoResize: ".chatBox span.hover, .messages"
	});
	
	//////////////////////
	// Chat Input Bindings
	//////////////////////
	function UniCon(mkType,params){
		//alert(mkType+params);
		var randid = (Math.floor((Math.random()*1000000)+1)).toString();
		var id = 'CreateNew'+mkType+randid;
		Glass.create({xpos:xmid-150,ypos:ymid-75,title:'UniCon',id:id,gClass:id});
		Glass.aForm(id);
		Glass.aFormFieldD(id,'MedoType','medotype',mkType);
//		if (params.indexOf('actions') >= 0){
//			alert('actions here!');
//		}
		$.each(params,function(){
			if (this == 'actions'){ // can't put '===' or it'll not catch
				alert('actions here!');
			} else {
				Glass.aFormField(id,this,this);
			}
			
			//alert(id+' '+this);
		});
		Glass.aSubmitButton(id,'Create Medo',id+'ucSubmit');
		$('#'+id).on('click','#'+id+'ucSubmit',function() {
			$('#'+id+'Formmedotype').attr('disabled', false);
			var data = $('#'+id+'Form').serialize();
			$('#'+id+'Formmedotype').attr('disabled', true);
			alert(data);
			$.ajax({
			type: 'POST',
			url: '/unicon/aMedo',
			data: data,
			success: function(data){
//				Glass.destroy('RegiSheet');
//				InitializeMetaEden();
				}
			});
		});
		
	}
	
	$(".chatInputMsg").livequery(function(e){
		// entering a message
		$(this).keyup(function(event){
			var content = $(this).val();
			if (event.which == 13) {
				event.preventDefault();
				context = this;
				//var content = $("#chatInputMsg1").val();
				//SendScaleM($("#chatChannel").val(), context);
				if (content.charAt(0) == "/") {
					var cSplit = content.split(' ');
					var command = cSplit[0];
					chatLoopback('COMMAND RECIEVED:'+content);
					if (command === '/create'){
						//alert('create');
						var mkType = cSplit[1];
						var rawParams = cSplit[2];
						var params = rawParams.split(',');
						UniCon(mkType,params);
					} else {
						Broadcast("command",content);
					}
					
					
				} else {
					if ($('.chatChannel').val() == "Loopback") {
						chatLoopback($(this).val());
					}
					if ($('.chatChannel').val() == "Global") {
						Broadcast($('.chatChannel',content).val());
					}
					if ($('.chatChannel').val() == "Local") {
						Broadcast($('.chatChannel',content).val());
					}
				}
								
				
				// log chat and clear
				chatlog.unshift($(this).val());
				$(this).val("");
				logIndex = 0;
			}
		});
		
		// capturing shift hotkey
		$(this).keydown(function(event){
			if (event.which == 16) {
				shiftDown = true;
			}
		});
		
		// releasing shift hotkey
		$(this).keyup(function(event){
			if (event.which == 16) {
				shiftDown = false;
			}
		});
		
		// show history chat item if shift+uparrow
		$(this).keyup(function(event){
			if (event.which == 38) {
				if (shiftDown && (logIndex < chatlog.length)) {
					$(this).val(chatlog[logIndex]);
					logIndex++;
				}
			}
		});
		
		// show history chat item if shift+downarrow
		$(this).keyup(function(event){
			if (event.which == 40) {
				if (shiftDown && (logIndex > 0)) {
					logIndex--;
					$(this).val(chatlog[logIndex]);
				}
			}
		});
		
		// reset chat history cursor on focusout
		$(this).focusout(function(event){
			logIndex = 0;
		});
		
		//default message focus
		$(this).focusin(function(event){
			if($(this).val() == "enter message") {
				$(this).val("");
			}
		});
		
		$(this).focusout(function(event){
			if($(this).val() != "enter message") {
				$(this).val("enter message");
			}
		});
		
	});
	
	/////////////////////////
	// Chat Settings Bindings
	/////////////////////////
	$('.chatSettings').click(function(){
		alert("TODO: this will open chat settings");
	});
	
	////////////////////
	// Disable Selection
	////////////////////	
	$(".tabs").livequery(function(e){
		$(this).disableSelection();
	});
	
	
	
	
	function Broadcast(dest,content){
		var name = 'A Name. 5643';
		var info = 'Some info. 3242';
		dest = dest.toLowerCase();
		$.post('/edenop/chanrouter/'+dest,{name:name,info:info,content:content},
			function(data){
				//on success
			}
		);
	}
	
	
	
	
	
	
	
	
});
