$(document).ready(function() {
	$.getJSON('/edenop/loadcmeta', function(currentmeta) {
  
		
		
	///
	/// Initialize Glass
	///
	Glass = new MEGlass();		
	mynav = new MENav();
	

	//////////////
	/// INITIALIZE LOGIN
	/////////////
	
	
	SessionHandler();
	
	function SessionHandler() {
		$.getJSON('/edenop/loadcmeta', function(cmeta) {
			if (cmeta == 'nometa'){
				Amb('No MetaUser, please register.',8);
				RegiSheet();
			}
			else {
				InitializeMetaEden();
			}
		});
	}
	

	
	function RegiSheet(){
		var id = 'RegiSheet';
		//var content =
		var glassargs = {context:'body',content:'',xpos:document.documentElement.clientWidth/2-150,ypos:document.documentElement.clientHeight/2-75,title:'Registration Sheet',name:'RegiSheet',id:id};
		Glass.create(glassargs);
		NGAF(id,'Meta Name','regname','regname');
		NGAF(id,'Meta Description','reginfo','reginfo');
		NGASB(id,'Register MetaUser','regsubmit');
		//GlassFactory(null,args)
	}
	
	
	
	function YTSheet(){
		var id = 'YTSheet';
		//var content =
		var glassargs = {context:'body',content:'',xpos:document.documentElement.clientWidth/2-150,ypos:document.documentElement.clientHeight/2-75,title:'YoutTube Item Maker',name:'YTSheet',id:id};
		Glass.create(glassargs);
		NGAF(id,'YouTube Link','ytlink','ytlink');
		NGASB(id,'Create YouTube Item','ytsubmit');
		//GlassFactory(null,args)
	}
	
	function InitializeMetaEden(refresh) {
		Amb('Welcome to MetaEden! Enjoy your stay!',5);
		$('#wholepage').show();
		OpenSesh(); 	// Initialize Channel API
		BindKPMove();	// Miscellaneous
		if (refresh){
			cMetaSheet('refresh');	// Load Static UX
			cLocaSheet('refresh');	// Load Static UX
		} else {
			cMetaSheet();	// Load Static UX
			cLocaSheet();	// Load Static UX
			mynav.create();
			mynav.refresh();
		}
		
	}
	
	// Disabled for now. Potential feature. Fetches item with attribute 'popup' and displays them.
	//LoadPopUpItems();
	function LoadPopUpItems(){
		$.getJSON('/edenop/fetchpuis', function(medos) {
			for (var i = 0; i < medos.length; i++) {
				GlassFactory(medos[i]);
			}
		});
	}
	
	function Amb(msg,time,fade){
		$.ambiance({message: msg,
					timeout: time,
					fade: fade});
	}
	
	var draggableArguments={
		     revert: false,
		     helper: 'clone',
		     appendTo: '#wholepage',
		     containment: 'DOM',
		     zIndex: 1500,
		     cancel: false,
	};
	

	
	function cMetaSheet(refresh){
		$.getJSON('/edenop/loadcmeta', function(cmeta) {
			var glassargs = {context:'body',content:'',xpos:document.documentElement.clientWidth-320,ypos:5,title:'MetaSheet',name:'MetaSheet',id:'MetaSheet'};
			if (refresh){
				Glass.clear('MetaSheet');
			} else {
				Glass.create(glassargs);
			}
			EngraveMetaSheet(cmeta);
			$('#MetaSheet').droppable({
				drop: function (event, ui) {
					MetaAction('Relo',ui.draggable.data('metakind'),ui.draggable.data('metaid'),'Meta',cmeta.metaid);}
			});
		});
	}
	
	function cLocaSheet(refresh){
		$.getJSON('/edenop/location', function(cloc) {
			var glassargs = {context:'body',content:'',xpos:5,ypos:5,title:'LocationSheet',name:'LocationSheet',id:'LocaSheet'};
			if (refresh){
				Glass.clear('LocaSheet');
			} else {
				Glass.create(glassargs);
			}
			EngraveLocaSheet(cloc);
			$('#LocaSheet').droppable({
				drop: function (event, ui) {
					MetaAction('Relo',ui.draggable.data('metakind'),ui.draggable.data('metaid'),'Location',cloc.metaid);}
			});
		});
	}
	
	function EngraveMetaSheet(cmeta){
		var args = {
					Name:cmeta.name,
					Info:cmeta.info,
					KID:cmeta.kid,
					Location:cmeta.xyz,
					MasterID:cmeta.masterid,
					DataBits:cmeta.databits
		};
		
		$.getJSON('/edenop/fetchinventory', function(inventory) {
			$.each(args, function(k,v){
				NGAL('MetaSheet',k,v);
			});
			NGALO('MetaSheet','Inventory');
			$.each(inventory, function() {
				NGAO('MetaSheet',this);
			});
			//alert($('#MetaSheet').find('#btnobjItem86').data('obj'));
		});
	}
	
	function EngraveLocaSheet(cloca){
		var args = {
					Name:cloca.name,
					Info:cloca.info,
					KID:cloca.kid,
					Location:cloca.xyz,
		};
		
		$.getJSON('/edenop/fetchlocalmetas', function(localmetas) {
			$.getJSON('/edenop/fetchlocalitems', function(localitems) {
				//ShowExits('LocaSheet',cloca);
				$.each(args, function(k,v){
					NGAL('LocaSheet',k,v);
				});
				NGALO('LocaSheet','MetaUsers Here');
				$.each(localmetas, function() { NGAO('LocaSheet',this); });
				NGAG('LocaSheet','');
				NGALO('LocaSheet','Items Here');
				$.each(localitems, function() { NGAO('LocaSheet',this); });
				NGAG('LocaSheet','');
			});
		});
	}
	
	
	
	///
	/// Phase Zero
	///
	
	function dMedoGlass(metakind,metaid,glassargs){
		$.getJSON('/edenop/load/'+metakind+'/'+metaid, function(medo) {
			GlassFactory(medo,glassargs);
		});
	}
	
	$('#BtnOpenYTI').toggle(
			function(){YTSheet();},
			function(){Glass.destroy('YTSheet');}
	);
	
	$(document).on('click','.obj',function(){
		var metakind = $(this).data('metakind');
		var metaid = $(this).data('metaid');
		if ($('#'+metakind+metaid).length){
			Glass.destroy(metakind+metaid);
		} else {
			dMedoGlass(metakind,metaid);
		}
	});
	
	$('body').on('click','#regsubmit',function() {
		$.ajax({
		type: 'POST',
		url: '/unicon/spawn/meta',
		data: {'regname': $('#regname').val(),'reginfo': $('#reginfo').val()},
		success: function(data){
			Glass.destroy('RegiSheet');
			InitializeMetaEden();
			}
		});
	});
	
	function GlassFactory(medo,glassargs){
		if (medo != null){
			glassargs = {context:'body',content:'',xpos:document.documentElement.clientWidth/2-150,ypos:document.documentElement.clientHeight/2-75,title:medo.name,name:medo.kid,id:medo.kid};
		}
		if (glassargs === 'refresh'){
			Glass.clear(medo.kid);
		} else {
			Glass.create(glassargs);
		}
		
		//Glass.empty(medo.kid);
		switch(medo.metakind){
			case 'Item': EngraveItemGlass(medo); break;
			case 'Meta': EngraveMetaGlass(medo); break;
			default: EngraveMedoGlass(medo); 
				NGAG(medo.kid,'This is probably a '+medo.metakind+'<br>');
		}
	}
	
	///
	/// Phase One
	///
	function EngraveMedoGlass(medo){
		NGAL(medo.kid,'Name',medo.name);
		NGAL(medo.kid,'Info',medo.info);
		NGAL(medo.kid,'MetaKID',medo.kid);
		NGAL(medo.kid,'Location',medo.xyz);
	}
	///
	/// Phase Two - Decorators
	///
	
	 // G - Generic / L - Label / A - Action / LO - Label Only / O - Object
	
	function EngraveMetaGlass(medo){
		$.getJSON('/edenop/fetchinventory', function(inventory) {
			EngraveMedoGlass(medo);
			NGAL(medo.kid,'MasterID',medo.masterid);
			NGAL(medo.kid,'DataBits',medo.databits);
			GAP(medo,30);
			NGALO(medo.kid,'Inventory');
			$.each(inventory, function() {
				NGAO(medo.kid,this);
			});
		});
	}
	
	function EngraveItemGlass(medo){
		EngraveMedoGlass(medo);
		if (medo.regtype == 'Mine'){
			NGAL(medo.kid,'DataBits',medo.databits);
		}
		
		if (medo.actions){
			NGALO(medo.kid,'Actions');
			for (var i = 0; i < medo.actions.length; i++) {
				NGAA(medo,medo.actions[i]);				
			}
		}
	}
	///
	/// Phase Three - Constructors
	///
	
	function NGASB(tGlass,value,fieldid){
		Glass.append(tGlass, 
			"<input value='"+value+"' id='"+fieldid+"' type='button' class='button'>");
	}
	
	function NGAF(tGlass,label,fieldid,fieldname){
		Glass.append(tGlass, "<h1>"+label+"</h1>"+
			"<input id='"+fieldid+"' name='"+fieldname+"' type='text'><br>");
	}
	
	function NGAA(medo,action){
		Glass.append(medo.kid,
				"<input type='button' id='btnaction"+medo.metakind+medo.metaid+action + "' class='action' value='" + action + 
				"' data-name='"+medo.name+"' data-metakind='"+medo.metakind+"' data-metaid='"+medo.metaid+"'" + " data-action='"+action+"'" +
				">"
				);
	}
	
	$('body').on('click','.action',function(){
		var metakind = $(this).data('metakind');
		var metaid = $(this).data('metaid');
		var action = $(this).data('action');
		var item = $(this).data('name');
		if (action == 'Watch'){
			parsedlink = $.parseyturl($('#btnobj'+metakind+metaid).data("ytlink"));
			YouTube(parsedlink);
		}
		MetaAction(action,metakind,metaid);
	});
	
	$('body').on('click','#ytsubmit',function(){
		thisytid = $.parseyturl($("#ytlink").val());
		createYTItem(thisytid);
		
	});
	
	function NGALO(tGlass,label){
		Glass.append(tGlass,
				"<h1>"+label+"</h1>"
				);
	}
	
	function NGAO(tGlass,obj){
		Glass.append(tGlass,
				"<input type='button' id='btnobj"+obj.metakind+obj.metaid + "' class='obj dragit' value='" + obj.name + "' title='"+obj.kid+
				"' data-name='"+obj.name+"' data-metakind='"+obj.metakind+"' data-metaid='"+obj.metaid+"'" + " data-obj='"+obj.metakind+obj.metaid+"'" +
				">"
				);
		$('.dragit').draggable(draggableArguments);
		if (obj.ytlink){
			$('#btnobj'+obj.kid).attr('data-ytlink',obj.ytlink);
		}
	}
	
	function NGAG(tGlass,appendage){
		Glass.append(tGlass,appendage);
	}
	
	function NGAL(tGlass,label,appendage){
		Glass.append(tGlass, "<div><h1>"+label+"</h1>"+
			"<p class='"+label+"' id='"+tGlass+label+"'>" + appendage + "</p></div>");
	}
	
	function GAP(medo,percent){
		medo.kid.append(
			"<div class='meter orange nostripes'>" +
			"<p style='width:"+percent+"%'></p>" +
			"</div>"
		);
		
	}
	
	function ShowExits(tGlass,loca){
		Glass.append(tGlass,
				"<h1>Exits: </h1>" +
				"<center>" +
				"<input class='move' id='nw' type='button' value='Northwest'>" +	
				"<input class='move' id='n' type='button' value='North'>" +
				"<input class='move' id='ne' type='button' value='Northeast'><br>" +
				"<input class='move' id='w' type='button' value='West'>" +
				"<input class='move' id='e' type='button' value='East'><br>" +
				"<input class='move' id='sw' type='button' value='Southwest'>" +
				"<input class='move' id='s' type='button' value='South'>" +
				"<input class='move' id='se' type='button' value='Southeast'><br>" +
				"<input class='move' id='u' type='button' value='Up'>" +
				"<input class='move' id='d' type='button' value='Down'><br>" +
				"</center>"
		);
		exits = loca.exits.split(',');
		var dirs = ["n","s","w","e","ne","se","sw","nw","u","d"];

		for (var i = 0; i < dirs.length; i++) {
			if ($.inArray(dirs[i],exits) !== -1){
			} else {$('#'+dirs[i]).hide();}
		}
	}
	
	$('.navigationList').on('click','li',function() {
		dir = $(this).text();
		$.ajax({
			type: 'POST',
			url: '/action/move/' + dir,
			data: null,
			success: function(data){
				cLocaSheet('refresh');
				Amb('take this out after installing bigbro');
			}
		});
	});
	
	
	
	//////
	//////

	/// Handles NumPad/Numeric Movment Unbinding for typing in fields. 
	$(document)
	.on('focusin','input,textarea',function(){$(document).unbind('keypress');})
	.on('focusout','input,textarea',function(){BindKPMove();});
	
	$('body').on('click','.newpm',function(){
		var metakind = $(this).parent().data('metakind');
		var metaid = $(this).parent().data('metaid');
		var content = $('#newpm'+metakind+metaid).val();
		$('#newpm'+metakind+metaid).val('');
		$('#'+metakind+metaid).dialog('close');
		$.ajax({
			type: 'POST',
			url: '/edenop/chanrouter/pm',
			data: {'metakind': metakind, 'metaid': metaid, 'content': content},
			success: function(data){
				pack = JSON.parse(data);
				//alert(JSON.stringify(pack));
				if ($("#pmwin"+pack.metakind+pack.metaid).length == 0){
					OpenPM(pack);
				} else {
					$("#pmwin"+pack.metakind+pack.metaid).append(pack.formatted+'<br>').scrollTop(99999);
				}
			}
		});
	});
	
	

	function SendNewPM(){
		var regData = $("#msg"+jsonGET.metaid).serialize();
		$("#msg"+jsonGET.metaid).val('').focus();
		$.ajax({
			type: 'POST',
			url: '/unicon/chanrouter/'+jsonGET.masterid,
			data: regData,
			success: function(data){
				SessionHandler();
				pack = JSON.parse(data);
				$('#MetaVision').append(pack.content +"<br>").scrollTop($('#MetaVision').height()+99999);
				if ($("#msg"+jsonGET.masterid).length == 0){
					CreateIM(jsonGET, pack.content);
				} else {
					$("#msg"+jsonGET.masterid).dialog({height: 220}).append(pack.content+'<br>').scrollTop(99999);}
				}
		});
	}
	
	function OpenPM(pack){
		//alert(JSON.stringify(pack));
		var id = pack.metakind+pack.metaid;
		$('#IMs').append("<div id='pmwin"+id+"'></div>");
		var title = "ComLink ( <span class='dragie' name='" + pack.metaid + "' metakind='"+pack.metakind+"' id='" + pack.metaid + "'>" +
		"<input type='button' name='" + pack.metaid + "' data-metakind='"+pack.metakind+"' data-metaid='"+pack.metaid+"' id='" + pack.metaid + "' class='viewable' value='" + pack.name + "' /></span> )";
		
		$("#pmwin"+id)
			.append(pack.formatted+'<br>')
			.dialog({ width: 550, height: 151, title: title, position: { my: 'bottom middle', at: 'middle middle', of: document }, overflow: scroll, dialogClass:'transparent75'});
		
		$("#pmwin"+id)
			.after(
				"<label>Send Message: </label><br />" +
				"<textarea type='text' id='pm"+pack.metakind+pack.metaid+"' name='content' rows='1' cols='105'></textarea><br>" +
				"<input type='button' id='btnsendpm"+pack.metakind+pack.metaid+"' class='sendpm' data-metakind='"+pack.metakind+"' data-metaid='"+pack.metaid+"' value='send'><br>")
			.dialog();
		
		function SendPM(){
			var metakind = pack.metakind;
			var metaid = pack.metaid;
			var content = $('#pm'+metakind+metaid).val();
			$('#pm'+metakind+metaid).val('').focus();
			$.ajax({
				type: 'POST',
				url: '/edenop/chanrouter/pm',
				data: {'metakind': metakind, 'metaid': metaid, 'content': content},
				success: function(data){
					pack = JSON.parse(data);
					//alert(JSON.stringify(pack));
					if ($("#pmwin"+pack.metakind+pack.metaid).length == 0){
						OpenPM(pack);
					} else {
						$("#pmwin"+pack.metakind+pack.metaid).append(pack.formatted+'<br>').scrollTop(99999);
					}
				}
			});
		}
		
		$("#btnsendpm"+id).click(function(){
			SendPM();
		});
		$("#pm"+id).keypress(function(e) {
		    if(e.which == 13) {
		    	SendPM();
		    }
		});
	}
	
	$(document).on('click','.editable',function(){
		var name = $(this).attr('name');
		var value = $(this).data('value');
		var eleid = $(this).attr('id');
		var id = $(this).parent().data('metakind')+$(this).parent().data('metaid');
		$(this).replaceWith("<input name='"+name+"' class='"+eleid+"' type='text' value=''>");
		$('.'+eleid).attr('value',value);
		$('#btncommit'+id).show();
		$('#btncancel'+id).show();
		
	});
	
	$(document).on('click','.btncommit',function(){
		var data = $('#form'+ $(this).data('metakind')+$(this).data('metaid')).serialize();
		var metakind = $(this).data('metakind');
		var metaid = $(this).data('metaid');
		$.ajax({
			type: 'POST',
			url: '/unicon/modify/' + $(this).data('metakind') + '/' + $(this).data('metaid'),
			data: data,
			success: function(data){
				OpenObj(metakind,metaid);
			}
		});
	});
	
	$(document).on('click','.btncancel',function(){
		var metakind = $(this).data('metakind');
		var metaid = $(this).data('metaid');
		OpenObj(metakind,metaid);
	});
	
	
	
	function BindKPMove(){
		$(document).keypress(function(e){
			var dir;
			if(e.which == '55') { dir = 'nw'; }
			else if(e.which == '56') { dir = 'n'; }
			else if(e.which == '57') { dir = 'ne'; }
			else if(e.which == '52') { dir = 'w'; }
			else if(e.which == '53') { dir = 'o'; }
			else if(e.which == '54') { dir = 'e'; }
			else if(e.which == '49') { dir = 'sw'; }
			else if(e.which == '50') { dir = 's'; }
			else if(e.which == '51') { dir = 'se'; }
			else if(e.which == '43' || e.which == '46') { dir = 'u'; }
			else if(e.which == '45' || e.which == '48') { dir = 'd'; }
			else {dir = '';}
			if (dir === ''){}
			else{
				$.ajax({
					type: 'POST',
					url: '/edenop/move/' + dir,
					data: null,
					success: function(data){
						cLocaSheet('refresh');
						mynav.refresh();
					}
				});
			}
		});
	}

	
	
	function RefreshAll() {
		$.getJSON('/resolution/hasmeta', function(cmeta) {
			cMetaSheet('refresh');
			cLocaSheet('refresh');
		});
	}
	
	function YouTube(ytlink){
		$('#MetaTube').YouTubePopup('destroy');
		$('#MetaTube').YouTubePopup({ youtubeId: ytlink, draggable: true, modal: false }).click();
	}
	
	
	
	
	////
	//REGISTRATION CHECK
	////

	
	
	
	$("#BtnRefresh").click(function(){ Amb('Refreshed!');
		RefreshAll();
	});
	
	
//	$('#WorkBench').dialog({ width: 350, height: 150, title: 'WorkBench', position: {my: 'middle middle', at: 'middle middle', of: document}, overflow: scroll })
//		.droppable({ drop: function (event, ui){
//
//					parsedlink = $.parseyturl(ui.draggable.data("ytlink"));
//					Amb(parsedlink);
//					Amb(ui.draggable.data("itype"));
//					YouTube(parsedlink);
//				
//			}
//		});
	
	
	//////////////
	/// CHANNEL API STUFF
	/////////////
	function Announce(type){
		$.ajax({
			type: 'POST',
			url: '/edenop/chanrouter/' + type,
			data: null,
			success: function(data){
			}
		});
	}
	
	function Drop(metakind,metaid,dkind,did){
		if (metakind == 'Meta' || metakind == 'Location'){alert("You can't pick up "+metakind+" types... yet.");
		} else {
			$.post('/edenop/drop/' + metakind + '/' + metaid + '/' + dkind + '/' + did, function(data){
				cLocaSheet('refresh'); 		// Load Static UX
				cMetaSheet('refresh');
			});
		}
	}
	
	function MetaAction(action,tKind,tID,rKind,rID){
		$.ajax({
			type: 'POST',
			url: '/action/router/' + action,
			data: {'tKind':tKind,'tID':tID,'rKind':rKind,'rID':rID},
			success: function(data){
				//$('#Item101').empty();
				//alert($('#Item101DataBits').text());
				if (action === 'Relo'){
					$.getJSON('/edenop/loadcmeta', function(cmeta) {
					$.getJSON('/edenop/load/'+tKind+'/'+tID, function(medo) {
						if (medo.cowner != cmeta.kid){
							Glass.rObj('MetaSheet',medo.kid)
						} else {
							Glass.rObj('LocaSheet',medo.kid)
						}
						if ((medo.cowner === cmeta.kid)&&(medo.cowner === rKind+rID)){
							Glass.aObj('MetaSheet',medo)
						}
						if (rKind === 'Location'){
							Glass.aObj('LocaSheet',medo)
						}
//						cLocaSheet('refresh');
//						cMetaSheet('refresh');
					});
					});
				}
				
				if (action === 'Mine Node'){
					$.getJSON('/edenop/loadcmeta', function(cmeta) {
					$.getJSON('/edenop/load/'+tKind+'/'+tID, function(medo) {
						Glass.reattr('MetaSheet','.DataBits',cmeta.databits);
						Glass.reattr(medo.kid,'.DataBits',medo.databits);
					});
					});
				}
			}
		});
	}
	
	function Broadcast(scale){
		content = $("#mvprompt").val();
		$("#mvprompt").val('').focus();
		$.ajax({
			type: 'POST',
			url: '/edenop/chanrouter/'+scale,
			data: {'content':content},
			success: function(data){}
		});
	}
	
	function OpenSesh(){
		var channel;
		var handler;
		var socket;
		$.getJSON('/edenop/openchannel', function(chantoken) {
	        onOpen = function() {
			    console.debug('onOpen: ' + chantoken);
			    Amb('Connection Established.',.5);
			    Announce('login');
			};

			onClose = function() {
			    console.debug('onClose');
			    Amb('Session Closed.',0,true);
			};
			
			onMessage = function(msg) {
			    console.debug('onMessage: ' + msg.data);
			    pack = JSON.parse(msg.data);
			    UpdateStatus(pack);
			};
			
			onError = function() {
			    console.debug('onError');
			};
			
			openChannel = function() {
			    //alert(chantoken);
			    channel = new goog.appengine.Channel(chantoken);
			    handler = {
				    'onopen': onOpen,
				    'onclose': onClose,
				    'onmessage': onMessage,
				    'onerror': onError
			    };
				socket = channel.open(handler);
				socket.onopen = onOpen;
				socket.onmessage = onMessage;
		};
			
			 setTimeout(openChannel, 50);
		});
	}
	function MetaSound(soundname){
		PingSound = document.getElementById('PingSound');
		PingSound.src = '/css/'+soundname+'.mp3';
		PingSound.play();
	}

	/////////////////////////////
	/// UPDATE CHANNEL
	/////////////////////////////
	function UpdateStatus(pack){
		// Type Loop (For printing/formatting)
		if  (pack.updater){
			if (pack.metasheetupdater){
				cMetaSheet('refresh');
			} else {
				RefreshAll();
			}
		} else if (pack.refresh){
			if (pack.type === 'cMetaUpdate'){
				if (pack.attr === 'databits'){
					//do stuff
					$.getJSON('/edenop/load/'+pack.metakind+'/'+pack.metaid, function(medo) {
						Glass.reattr('MetaSheet','.DataBits',medo.databits);
					});
				} else {
					cMetaSheet('refresh');
				}
			} else if (pack.type === 'cLocaUpdate'){
				if (pack.attr === 'itemshere'){
					$.getJSON('/edenop/load/'+pack.metakind+'/'+pack.metaid, function(medo) {
						Glass.aObj('LocaSheet',medo);
					});
				} else if (pack.attr === 'ihremove'){
					Glass.rObj('LocaSheet',pack.metakind+pack.metaid);
				} else {
					cLocaSheet('refresh');
				}
			} else if (pack.type === 'sMedoUpdate'){
				if (pack.attr === 'databits'){
					$.getJSON('/edenop/load/'+pack.metakind+'/'+pack.metaid, function(medo) {
						Glass.reattr(medo.kid,'.DataBits',medo.databits);
					});
				} else {
					$.getJSON('/edenop/load/'+pack.metakind+'/'+pack.metaid, function(medo) {
						//alert('this');
						//GlassFactory(medo,'refresh');
					});
				}
			}
		} else if (pack.type == 'msg') {
			$.ambiance({message: pack.content});
			MetaSound('chirp');
			PingSound = document.getElementById('PingSound');
			PingSound.src = '/css/chirp.mp3';
			PingSound.play();						
//			$('#MetaVision').append(pack.content + '<br>').scrollTop($(this).height()+99999);
			if ($("#msg"+pack.masterid).length == 0){
				CreateIM(pack, pack.content);
			} else {
				$("#msg"+pack.masterid).dialog({height: 220}).append(pack.content+'<br>').scrollTop($(this).height()+99999);
			}
		} else if (pack.type === 'broadcast') {
			//new message handler for fancy chat box
			newChatBoxMsg(pack);
		} else if (pack.type === 'announcement') {
			newChatBoxMsg(pack);
		} else if (pack.type === 'refresh') {
			if (pack.scope === 'location') {
				cLocaSheet('refresh');
			} else if (pack.scope === 'meta') {
				cMetaSheet('refresh');
			}
		} else if (pack.type === 'move') {
			newChatBoxMsg(pack);
		} else if (pack.type === 'action') {
			newChatBoxMsg(pack);
		} else if (pack.type === 'pm') {
			Amb('New PM Recieved!');
			Amb(pack.metakind+pack.masterid);
			if ($("#pmwin"+pack.metakind+pack.metaid).length == 0){
				OpenPM(pack);
			} else {
				$("#pmwin"+pack.metakind+pack.metaid).dialog({height: 220}).append(pack.formatted+'<br>').scrollTop($(this).height()+99999);
			}
		} else if (pack.type === 'userlogin') {
			newChatBoxMsg(pack);
		} else if (pack.type === 'usermove') {
			newChatBoxMsg(pack);
		} else if (pack.type === 'userenter') {
			newChatBoxMsg(pack);
		} else if (pack.type === 'userleave') {
			newChatBoxMsg(pack);
		} else {
			Amb('No Type');
		}

		///
		/// Scope Loop (For sounds, etc.)
		///
		if (pack.scope == 'local'){
			Amb(pack.content,5);
			MetaSound('beep');
		} else if (pack.scope == 'global'){
			Amb(pack.formatted,5);
			MetaSound('global');
		} else if (pack.scope == 'system'){
			Amb(pack.formatted,5);
			MetaSound('boop');
		} else {
			//Amb('NoScope',.1);
			//$('#MetaVision').append(pack.content + '<br>').scrollTop($(this).height()+99999);
			//$.ambiance({message: pack.content});
		}

	}
    
	/////////////////////////////////
	// NEW FANCY CHATBOX MSG RECIEVER
	/////////////////////////////////
	newChatBoxMsg = function(pack) {
		switch(pack.type)
		{
		case "broadcast":
			//do shit
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				outmsg = '<p><span class="channelLoopback">['+ pack.scope.charAt(0).toUpperCase() + pack.scope.slice(1) +']</span><b> ' + pack.name + ':</b> ' + pack.content + '</p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
			
		case "move":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				outmsg = '<p><span class="channelMove"><img src="img/icons/moving1.png" width="20" height="20" />' + pack.content + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
			
		case "action":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				outmsg = '<p><span class="channelMove"><img src="img/icons/moving1.png" width="20" height="20" />' + pack.content + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
			
		case "announcement":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				outmsg = '<p><span class="channelAnnounce"><img src="img/icons/connect1.png" width="20" height="20" />' + pack.content + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
			
		case "userlogin":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				outmsg = '<p><span class="channelAnnounce">' + pack.name +' <img class="iconTranslator" src="img/icons/connect1.png" data-icontype="userlogin" width="20" height="20" />MetaEden</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
		
		case "usermove":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				var content = pack.content.replace('You move ','');
				content = content.replace('.','');
				content = content.charAt(0).toUpperCase() + content.slice(1);
				outmsg = '<p><span class="channelMove"><img class="iconTranslator" src="img/icons/moving1.png" width="20" height="20" data-icontype="usermove" />' + content + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
		
		
		case "userenter":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				var destination = pack.destination.charAt(0).toUpperCase() + pack.destination.slice(1);
				outmsg = '<p><span class="channelUserArrive">'+pack.name+'<img class="iconTranslator" src="img/icons/arriving.png" width="20" height="20" data-icontype="userenter" />' + destination + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
		
			
		case "userleave":
			context = $(".messages");
			if (pack.type == 'action'){
				outmsg = '<p>' + pack.formatted + '</p>';
			} else {
				var destination = pack.destination.charAt(0).toUpperCase() + pack.destination.slice(1);
				outmsg = '<p><span class="channelUserLeave">'+pack.name+'<img class="iconTranslator" src="img/icons/leaving.png" width="20" height="20" data-icontype="userleave" />' + destination + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
		
			
		default:
			// don't do shit...
		}
		
	};
	
	// chatbox icon translator
	$('.iconTranslator').livequery('click', function(){
		var iconType = $(this).attr("data-iconType");
		switch(iconType) {
		
		case "userlogin":
			$(this).after(" has logged into ");
			$(this).remove();
			break;
			
		case "usermove":
			$(this).after("You move ");
			$(this).remove();
			break;
			
		case "userenter":
			$(this).after(" has arrived from the ");
			$(this).remove();
			break;
		
		case "userleave":
			$(this).after(" has moved ");
			$(this).remove();
			break;
								
		default:
			// don't do shit...
		}
				
	});
	
	//////////////
	/// YOUTUBE STUFF
	/////////////
//	$('#YouTubeGen').dialog({ width: 550, title: 'Drop A YouTube Link', position: {my: 'bottom middle', at: 'left bottom', of: document}, height: 150, overflow: scroll }).dialog('close');
//	
//	$('#YTLinken')
//		.dialog({ autoOpen: false, title: 'YT Linken', position: {at: 'middle middle'}, height: 100, width: 550});
	
    function createYTItem(id) {
		$.ajax({
            url: "http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=json",
            dataType: "jsonp",
            success: function (data) { pyt(data); }
		});
		
		function pyt(data) {
            var title = data.entry.title.$t;
            var description = data.entry.media$group.media$description.$t;
            var viewcount = data.entry.yt$statistics.viewCount;
            var author = data.entry.author[0].name.$t;
            $('#ytname').remove();
            $('#ytser').append("<input type='text' id='ytname' name='title' value='"+title+"' hidden></input>");
            $('#description').html('<b>Description</b>: ' + description);
            $('#extrainfo').html('<b>Author</b>: ' + author + '<br/><b>Views</b>: ' + viewcount);
            //getComments(data.entry.gd$comments.gd$feedLink.href + '&max-results=50&alt=json', 1);
            //var regData = $("#ytser").serialize();
    		$.ajax({
    			type: 'POST',
    			url: '/unicon/create/ytitem',
    			data: {'ytlink': $('#ytlink').val(),'title': title, 'info': description},
    			success: function(data){
    				cMetaSheet();
    				$("#ytlink").val('');
    			}
    		});
		}
	}
	
	


  
  });
});


