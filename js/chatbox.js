$(document).ready(function(e){
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
	$(".chatInputMsg").livequery(function(e){
		// entering a message
		$(this).keyup(function(event){
			if (event.which == 13) {
				event.preventDefault();
				context = this;
				//SendScaleM($("#chatChannel").val(), context);
				if ($(this).val().charAt(0) == "/") {
					chatLoopback($(this).val());
					Broadcast("command");
				} else {
					if ($('.chatChannel').val() == "Loopback") {
						chatLoopback($(this).val());
					}
					if ($('.chatChannel').val() == "Global") {
						Broadcast($('.chatChannel').val());
					}
					if ($('.chatChannel').val() == "Local") {
						Broadcast($('.chatChannel').val());
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
	
	
	
	function Broadcast(scale){
		content = $("#chatInputMsg1").val();
		//$("#chatInputMsg1").val('').focus();
		scale = scale.toLowerCase();
		$.ajax({
			type: 'POST',
			url: '/edenop/chanrouter/'+scale,
			data: {'content':content},
			success: function(data){}
		});
	}
	
	
	
	
	
	
	
	
});
