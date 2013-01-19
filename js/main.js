$(document).ready(function() {
	// Initialize Glass
	Glass = new MEGlass();
	
	
	
	function cMetaSheet(){
		$.getJSON('/edenop/loadcmeta', function(cmeta) {
			var glassargs = {context:'body',content:'',xpos:document.documentElement.clientWidth-320,ypos:5,title:'MetaSheet',name:'MetaSheet',id:'MetaSheet'};
			Glass.create(glassargs);
			EngraveMetaGlass(cmeta);
			$('#MetaSheet').droppable({
				drop: function (event, ui) {
					Drop(ui.draggable.data('metakind'),ui.draggable.data('metaid'),'Meta',cmeta.metaid);}
			});
		});
	}
	
	function cLocaSheet(){
		$.getJSON('/edenop/location', function(cloc) {
			var glassargs = {context:'body',content:'',xpos:5,ypos:5,title:'LocationSheet',name:'LocationSheet',id:'LocaSheet'};
			Glass.create(glassargs);
			EngraveLocaGlass(cloc);
			$('#LocaSheet').droppable({
				drop: function (event, ui) {
					Drop(ui.draggable.data('metakind'),ui.draggable.data('metaid'),'Location',cloc.metaid);}
			});
		});
	}
	
	//myglass = new MEGlass();
	
	//var glassargs = {context:'body',content:'test',xpos:50,ypos:50,title:'Testtt',name:'Hah',id:'9430'};
	//myglass.create(glassargs);
	//myglass.title(9430,'New Title');
	//myglass.append(9430,'test');

	//myglass.remove(id,selector)
	
	// Settings for jQ Dialog Boxes
	var ViewPlace = { position: { at: 'middle top' }, autoOpen: false };
	var MetaSheetPlace = { width: 275, title: 'MetaSheet', position: { at: 'right top' }, dialogClass:'transparent90'};
	var LocSheetPlace = { width: 275, title: 'MetaLocation', position: { at: 'left top' }, dialogClass:'transparent90'};
	var draggableArguments={
		     revert: false,
		     helper: 'clone',
		     appendTo: '#wholepage',
		     containment: 'DOM',
		     zIndex: 1500,
		     cancel: false,
	};
	
	//////////////
	/// INITIALIZE SIMPLE UI ELEMENTS
	/////////////
	$('#wholepage').hide();
	SessionHandler();
	function SessionHandler() {
		$.getJSON('/edenop/loadcmeta', function(cmeta) {
			if (cmeta == 'nometa'){
				Amb('No MetaUser, please register.',8);
				$('.ui-dialog, #wholepage').hide();
				$('#Register').dialog('open');
			}
			else {
				InitializeMetaEden(cmeta);
			}
		});
	}
	
	function InitializeMetaEden(cmeta) {
		Amb('Welcome to MetaEden! Enjoy your stay!',5);
		$('#wholepage').show();
		OpenSesh(); 			// Init Channel API
		//GlassLocSheet(); 		// Load Static UX
		//GlassMetaSheet();
		BindKPMove();			// Misc
		cMetaSheet();
		cLocaSheet();
	}
	
	// Disabled for now. Potential feature.
	function LoadPopUpItems(){
		$.getJSON('/edenop/fetchpuis', function(sobs) {
			for (var i = 0; i < sobs.length; i++) {
				GlassFactory(sobs[i]);
			}
		});
	}
	
	///////
	//// Static Glass
	//////
	function GlassLocSheet(){
		$('body').append("<div id='GlassLocSheet'></div>");
		var Anchor = $('#GlassLocSheet');
		Anchor.dialog(LocSheetPlace);
		$.getJSON('/edenop/location', function(cloc) {
			Anchor.empty();
			SheetLocation(Anchor,cloc);
			Anchor.droppable({
				drop: function (event, ui) {
					Drop(ui.draggable.data('metakind'),ui.draggable.data('metaid'),'Location',cloc.metaid);
				}
			});
		});
	}
	
	function GlassMetaSheet(){
		$('body').append("<div id='GlassMetaSheet'></div>");
		var Anchor = $('#GlassMetaSheet');
		Anchor.dialog(MetaSheetPlace);
		$.getJSON('/edenop/loadcmeta', function(cmeta) {
			Anchor.empty();
			SheetMeta(Anchor,cmeta);
			Anchor.droppable({
				drop: function (event, ui) {
					Drop(ui.draggable.data('metakind'),ui.draggable.data('metaid'),'Meta',cmeta.metaid);}
			});
		});
	}
	
	function Drop(metakind,metaid,dkind,did){
		if (metakind == 'Meta' || metakind == 'Location'){alert("You can't pick up "+metakind+" types... yet.");
		} else {
			$.ajax({
				type: 'POST',
				url: '/edenop/drop/' + metakind + '/' + metaid + '/' + dkind + '/' + did,
				data: null,
				success: function(data){
					//GlassLocSheet(); 		// Load Static UX
					//GlassMetaSheet();
				}
			});
		}
	}
	
	///////
	//// Dynamic Glass
	//////
	
	//// Fetches selectedObject (sob) for GlassFactory() from Kind/ID (KID)
	function GlassBlueprint(metakind,metaid,title,glassopt){
		$.getJSON('/edenop/load/'+metakind+'/'+metaid, function(sob) {
			GlassFactory(sob,title,glassopt);
		});
	}
	
	function GlassFactory(sob,title,glassopt){
		var metakind = sob.metakind;
		var metaid = sob.metaid;
		var name = sob.name;
		var Anchor;

		$('body').append("<div id='Glass"+metakind+metaid+"'></div>");
		Anchor = $('#Glass'+sob.metakind+sob.metaid);
		Anchor.empty();
		if (title){
			if(typeof glassopt === 'undefined'){
				Anchor.dialog({title: title});
			} else {
				Anchor.dialog({title: title},glassopt);
			}
		} else {
			Anchor.dialog({title: name});
		}
		
		if (metakind == 'Item'){
			//GAG(sob,'This is definitely a '+metakind+'<br>');
			SheetItem(Anchor,sob,'databits');
		} else if (metakind =='Meta'){
			//GAG(sob,'This is definitely a '+metakind+'<br>');
			SheetMeta(Anchor,sob,'masterid');
		} else if (metakind =='Location'){
			//GAG(sob,'This is definitely a '+metakind+'<br>');
			SheetLocation(Anchor,sob);
		} else {
			GAG(Anchor,sob,'This is probably a '+metakind+'<br>');
			SheetUniCon(Anchor,sob);
		}
	}
	
	///  Glass Append Functions START///
	////// G - Generic / L - Label / A - Action / LO - Label Only / O - Object //////
	
	function NGAG(tGlass,appendage){
		Glass.append(tGlass,appendage+'<br>');
	}
	
	function GAG(Anchor,sob,appendage){
		Anchor.append(appendage+'<br>');
	}
	
	function GAL(Anchor,sob,label,appendage){
		Anchor.append(
				"<label>"+label+": "+"</label><br>"+
				"<span>" + appendage + "</span><br>"
				);
	}
	
	function NGAL(tGlass,label,appendage){
		Glass.append(tGlass, "<label>"+label+"</label><br>"+
			"<span>" + appendage + "</span><br>");
	}
	
	function GALO(Anchor,sob,label){
		Anchor.append(
				"<label>"+label+": "+"</label><br>"
				);
	}
	
	function NGALO(tGlass,label){
		Glass.append(tGlass,
				"<label>"+label+"</label><br>"
				);
	}
	
	function GAA(Anchor,sob,action){
		Anchor.append(
				"<input type='button' id='btnaction"+sob.metakind+sob.metaid+action + "' class='action' value='" + action + 
				"' data-name='"+sob.name+"' data-metakind='"+sob.metakind+"' data-metaid='"+sob.metaid+"'" + " data-action='"+action+"'" +
				">"
				);
	}
	
	$('body').on('click','.action',function(){
		var metakind = $(this).data('metakind');
		var metaid = $(this).data('metaid');
		var action = $(this).data('action');
		var item = $(this).data('name');
		MetaAction(action,item,metakind,metaid);
	});
	
	function GAO(Anchor,sob,obj){
		Anchor.append(
				"<input type='button' id='btnobj"+obj.metakind+obj.metaid + "' class='obj dragit' value='" + obj.name + "' title='"+obj.kid+
				"' data-name='"+obj.name+"' data-metakind='"+obj.metakind+"' data-metaid='"+obj.metaid+"'" + " data-obj='"+obj.metakind+obj.metaid+"'" +
				">"
				);
		$('.dragit').draggable(draggableArguments);
	}
	
	function NGAO(tGlass,obj){
		Glass.append(tGlass,
				"<input type='button' id='btnobj"+obj.metakind+obj.metaid + "' class='obj dragit' value='" + obj.name + "' title='"+obj.kid+
				"' data-name='"+obj.name+"' data-metakind='"+obj.metakind+"' data-metaid='"+obj.metaid+"'" + " data-obj='"+obj.metakind+obj.metaid+"'" +
				">"
				);
		$('.dragit').draggable(draggableArguments);
	}
	
	$(document).on('click','.obj',function(){
		GlassBlueprint($(this).data('metakind'),$(this).data('metaid'));
	});
	
	function GAP(Anchor,sob,percent){
		Anchor.append(
			"<div class='meter orange nostripes'>" +
			"<span style='width:"+percent+"%'></span>" +
			"</div>"
		);
		
	}
	
	/// Append Functions END ///
	
	/// Sheet Constructors LEVEL 1
	function SheetUniCon(Anchor,sob){
		GAL(Anchor,sob,'Name',sob.name);
		GAL(Anchor,sob,'Info',sob.info);
		GAL(Anchor,sob,'MetaKID',sob.kid);
		//GAL(Anchor,sob,'MetaKind/ID',sob.metakind+sob.metaid);
		GAL(Anchor,sob,'Location',sob.xyz);
	}
	
	/// Sheet Constructors LEVEL 2
	function SheetMeta(Anchor,sob,params){
		$.getJSON('/edenop/fetchinventory', function(inventory) {
			SheetUniCon(Anchor,sob);
			GAL(Anchor,sob,'MasterID',sob.masterid);
			GAL(Anchor,sob,'DataBits',sob.databits);
			GAP(Anchor,sob,30);
			GALO(Anchor,sob,'Inventory');
			$.each(inventory, function() {
				GAO(Anchor,sob,this);
			});
		});
	}
	
	function EngraveMetaGlass(cmeta){
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
		});
	}
	
	function EngraveLocaGlass(cloca){
		var args = {
					Name:cloca.name,
					Info:cloca.info,
					KID:cloca.kid,
					Location:cloca.xyz,
		};
		
		$.getJSON('/edenop/fetchlocalmetas', function(localmetas) {
			$.getJSON('/edenop/fetchlocalitems', function(localitems) {
				ShowExits('LocaSheet',cloca);
				$.each(args, function(k,v){
					NGAL('LocaSheet',k,v);
				});
				NGALO('LocaSheet','MetaUsers Here');
				$.each(localmetas, function() {
					NGAO('LocaSheet',this);
				});
				NGAG('LocaSheet','');
				NGALO('LocaSheet','Items Here');
				$.each(localitems, function() {
					NGAO('LocaSheet',this);
				});
				NGAG('LocaSheet','');
			});
		});
		
	}
	
	function SheetItem(Anchor,sob,params){
		SheetUniCon(Anchor,sob);
		if (sob.regtype == 'Mine'){
			GAL(Anchor,sob,'DataBits',sob.databits);
		}
		
		if (sob.actions){
			GALO(Anchor,sob,'Actions');
			for (var i = 0; i < sob.actions.length; i++) {
				GAA(Anchor,sob,sob.actions[i]);				
			}
		}
	}
	
	function SheetLocation(Anchor,sob){
		ShowExits(Anchor,sob);
		SheetUniCon(Anchor,sob);
		
		UsersHere(Anchor,sob);
		ItemsHere(Anchor,sob);
	}
	
	/// Sheet Constructors LEVEL 3
	
	function UsersHere(Anchor,sob){
		$.getJSON('/edenop/fetchlocalmetas', function(localmetas) {
			GALO(Anchor,sob,'MetaUsers Here');
			$.each(localmetas, function() {
				GAO(Anchor,sob,this);
			});
			GAG(Anchor,sob,'');
		});
		
	}	function ItemsHere(Anchor,sob){
		$.getJSON('/edenop/fetchlocalitems', function(localitems) {
			GALO(Anchor,sob,'Items Here');
			$.each(localitems, function() {
				GAO(Anchor,sob,this);
			});
			GAG(Anchor,sob,'');
		});
	}
	
	function ShowExits(tGlass,loca){
		Glass.append(tGlass,
				"<label>Exits: </label><br />" +
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
	
	$('body').on('click','.move',function() {
		dir = this.id;
		$.ajax({
			type: 'POST',
			url: '/action/move/' + dir,
			data: null,
			success: function(data){
				GlassLocSheet();
			}
		});
	});
	
	
	
	//////
	//////
	
	function Amb(msg,time,fade){
		$.ambiance({message: msg,
					timeout: time,
					fade: fade});
	}
	
	
	
	
	
	/// Handles NumPad/Numeric Movment Unbinding for typing in fields. 
	$(document)
	.on('focusin','input,textarea',function(){$(document).unbind('keypress');})
	.on('focusout','input,textarea',function(){BindKPMove();});
	
	function CreateIcon(mobj,target){
		$('body').append("<div id='"+mobj.metakind+mobj.metaid+"'></div>");
		$(target).append(
				"<input class='dragie viewable' type='button' name='" + mobj.metaid + "' metakind='"+mobj.metakind+"' id='" + mobj.metaid + "' value='"+mobj.name+"'" +
				"data-ytlink='"+mobj.ytlink+"' data-itype='"+mobj.itype+"' data-name='"+mobj.name+"' data-metakind='"+mobj.metakind+"' data-metaid='"+mobj.metaid+"'" +
				"data-masterid='"+mobj.masterid+"' data-info='"+mobj.info+"' data-xloc='"+mobj.xloc+"' data-yloc='"+mobj.yloc+"' data-zloc='"+mobj.zloc+"' data-lattice='"+mobj.lattice+"'/>"
				);
		$('#'+mobj.metakind+mobj.metaid).dialog({ width: 275, title: mobj.name, dialogClass:'transparent90'}, ViewPlace);
		$('#'+mobj.metaid).attr('value',mobj.name);
	}
	
	function OpenObj(metakind,metaid){
		$.getJSON('/edenop/load/' + metakind + '/' + metaid, function(sobj) {
			var id = sobj.metakind+sobj.metaid;
			$('#'+id).dialog('open');
			$('#'+id).html(
					"<form id='form"+id+"' data-metakind='"+sobj.metakind+"' data-metaid='"+sobj.metaid+"'>" +
						"<label>Name: </label><br /><span id='"+id+"name' name='name' class='editable' data-value=''>"+sobj.name+"</span><br>" +
						"<label>MetaID: </label><br />" + sobj.metaid + "<br>" +
						"<label>MasterID: </label><br />" + sobj.masterid + "<br>" +
						"<label>Info: </label><br /><span id='"+id+"info' name='info' class='editable' data-value=''>"+sobj.info+"</span><br>" +
						"<label>Location: </label><br />" + sobj.xloc + "." + sobj.yloc + "." + sobj.zloc + ":" + sobj.lattice + "<br>" +
						"<label>Send Message: </label><br /><input type='textfield' id='newpm"+sobj.metakind+sobj.metaid+"' name='content'>" +
						"<input type='button' id='btnnewpm"+sobj.metakind+sobj.metaid+"' class='newpm' value='send'><br>" +
						"<input type='button' id='btncommit"+id+"' class='btncommit' value='Save Changes' data-metakind='"+sobj.metakind+"' data-metaid='"+sobj.metaid+"' hidden>" +
						"<input type='button' id='btncancel"+id+"' class='btncancel' value='Cancel' data-metakind='"+sobj.metakind+"' data-metaid='"+sobj.metaid+"' hidden>" +
						"<label>Actions: </label><br />" + sobj.actions + 
						"<br>" +
					"</form>"
					);
			
			if (sobj.actions){
				for (var i = 0; i < sobj.actions.length; i++) {
					$('#'+id).append(
							"<input type='button' id='btnaction"+sobj.metakind+sobj.metaid+sobj.actions[i] + "' class='action' value='" + sobj.actions[i] + 
							"' data-name='"+sobj.name+"' data-metakind='"+sobj.metakind+"' data-metaid='"+sobj.metaid+"'" + " data-action='"+sobj.actions[i]+"'" +
							"><br>"
							);
				}
			}

			$('#'+id+'name').data('value',sobj.name);
			$('#'+id+'info').data('value',sobj.info);
		});
	}
	
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
						GlassLocSheet();
					}
				});
			}
		});
	}

	
	
	function RefreshAll() {
		$.getJSON('/resolution/hasmeta', function(cmeta) {
			//MetaSheet();
			GlassLocSheet();
		});
	}
	
	function YouTube(ytlink){
		$('#MetaTube').YouTubePopup('destroy');
		$('#MetaTube').YouTubePopup({ youtubeId: ytlink, draggable: true, modal: false }).click();
	}
	
	
	
	
	////
	//REGISTRATION CHECK
	////
	
	var doclosed = {autoOpen: false};
	
	$('#Register')
	.dialog({ autoOpen: false, modal: true, title: 'Create MetaUser!', position: { my: 'middle middle', at: 'middle middle', of: document }, dialogClass:'transparent90', width: 250});
	
	
	
	$('#regsubmit').click(function() {
		var regData = $('#regform').serialize();
		$.ajax({
		type: 'POST',
		url: '/unicon/spawn/meta',
		data: {'name': $('#regname').val(),'info': $('#reginfo').val()},
		success: function(data){
			$('#Register').dialog('close');
			InitializeMetaEden()
			}
		})
	});
	
	////
	//Initialize/Bind Buttons
	////
	
	
	$('#BtnToggleUC').toggle(
		function(){$('#UniCon').dialog('open');},
		function(){$('#UniCon').dialog('close');}
	);
	
	$('#BtnOpenYTI').toggle(
			function(){$('#YTLinken').dialog('open');},
			function(){$('#YTLinken').dialog('close');}
	);
	
	$("#BtnRefresh").click(function(){ Amb('Refreshed!');
		RefreshAll();
	});
	$('#BtnDebugger').click(function(){ Amb('The Debugger is currently sleeping.');
		Amb($.parseyturl('http://www.youtube.com/watch?v=BbizTBYs-rQ'));
	});
	
	function ResetMenus(){
		$('#ucformbutton, #ucselect, #ucnav, #ucform').hide();
		$('#uniconwin').dialog('close');
	}
	
	////
	// Create Dialogs & Apply Droppables
	////
	
	$('#UniCon')
		.dialog({ autoOpen: false, title: 'UniCon', dialogClass:'transparent90' });
	
	
//	$('#WorkBench').dialog({ width: 350, height: 150, title: 'WorkBench', position: {my: 'middle middle', at: 'middle middle', of: document}, overflow: scroll })
//		.droppable({ drop: function (event, ui){
//			if (ui.draggable.data('itype') === 'YouTube'){
//					parsedlink = $.parseyturl(ui.draggable.data("ytlink"));
//					Amb(parsedlink);
//					Amb(ui.draggable.data("itype"));
//					YouTube(parsedlink);
//				} else {
//					Amb("You can't load this type of object... yet.");
//					OpenObj(ui.draggable.data('metakind'),ui.draggable.data('metaid'));
//				}
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
	
	function MetaAction(action,sitem,metakind,metaid){
		$.ajax({
			type: 'POST',
			url: '/action/router/' + action,
			data: {'sitem':sitem,'metakind':metakind,'metaid':metaid},
			success: function(data){
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
				GlassMetaSheet();
			} else {
				GlassFactory(pack);
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
			
//			$('#MetaVision').append("[" + pack.scopename + "] <b>" + pack.name + "</b> - " + pack.content + "<br>").scrollTop($(this).height()+99999);
		} else if (pack.type === 'announcement') {
//			$('#MetaVision').append("[System] <b>" + pack.content + '<br>').scrollTop($(this).height()+99999);
			newChatBoxMsg(pack);
		} else if (pack.type === 'refresh') {
			if (pack.scope === 'location') {
				GlassLocSheet();
			} else if (pack.scope === 'meta') {
				GlassMetaSheet();
			}
		} else if (pack.type === 'move') {
//			$('#MetaVision').append(pack.content + "<br>").scrollTop($(this).height()+99999);
			newChatBoxMsg(pack);
		} else if (pack.type === 'action') {
//			$('#MetaVision').append(pack.content + "<br>").scrollTop($(this).height()+99999);
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
		// Scope Loop (For sounds, etc.)
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
			Amb('NoScope',.1);
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
				outmsg = '<p><span class="channelAnnounce"><img src="img/icons/connect1.png" width="20" height="20" />' + pack.content + '</span></p>';
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
				outmsg = '<p><span class="channelMove"><img src="img/icons/moving1.png" width="20" height="20" />' + pack.content + '</span></p>';
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
				outmsg = '<p><span class="channelUserArrive"><img src="img/icons/arriving.png" width="20" height="20" />' + pack.content + '</span></p>';
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
				outmsg = '<p><span class="channelUserLeave"><img src="img/icons/leaving.png" width="20" height="20" />' + pack.content + '</span></p>';
			}
			$(context).append(outmsg);
			$(context).animate({ scrollTop: $(context).prop("scrollHeight") - $(context).height() }, 100);
			$('.tabWrapper').fadeTo(250, .5).fadeTo(500, 0);
			break;
		
			
		
			
//		} else if (pack.type === 'usermove') {
//			newChatBoxMsg(pack);
//		} else if (pack.type === 'userenter') {
//			newChatBoxMsg(pack);
//		} else if (pack.type === 'userleave') {
			
		default:
			// don't do shit...
		}
		
		
		
		
		
	};
	
	/////////////////////////////
	/// UI PANELS - METASHEET
	/////////////////////////////
	
//	function MetaSheet(){
//		$.getJSON('/edenop/loadcmeta', function(cmeta) {
//			$('#MetaSheet')
//			.dialog({ width: 275, title: 'MetaSheet', position: { at: 'right top' }, dialogClass:'transparent90'})
//			.droppable({
//				drop: function (event, ui) {
//				Drop(ui.draggable.attr('metakind'),ui.draggable.attr('name'),'Meta',cmeta.metaid);}
//			});
//		MetaInfo(cmeta);
//		MetaInventory();
//		});
//	}
	
	function MetaInfo(cmeta){
		$('#MetaInfo')
		.empty()
		.append("<label>Name: </label><br />" + cmeta.name + "<br>" +
				"<label>MetaID: </label><br />" + cmeta.metaid + "<br>" +
				"<label>MasterID: </label><br />" + cmeta.masterid + "<br>" +
				"<label>Info: </label><br />" + cmeta.info + "<br>" +
				"<label>Location: </label><br />" + cmeta.xloc + "." + cmeta.yloc + "." + cmeta.zloc + ":" + cmeta.lattice + "<br>");
	}
	
	function MetaInventory(){
		$('#MetaInventory')
			.empty()
			.append("<label>Your Inventory: </label><br />");
			$.getJSON('/edenop/fetchinventory', function(localmetas) {
				$.each(localmetas, function() {
					CreateIcon(this,'#MetaInventory');
				});
				$('.dragie').draggable(draggableArguments);
			});
		}
	
	
	
	/////////////////////////////
	/// UI PANELS - LOCATION SHEET
	/////////////////////////////	
	
	function LocationSheet(){
		$.getJSON('/edenop/loadcmeta', function(cmeta) {
			$.getJSON('/edenop/location', function(locdata) {
				$('#LocationSheet')
					.dialog({ title: 'MetaLocation', position: {at: 'left top'}, width: 300, dialogClass:'transparent90'})
					.droppable({
						drop: function (event, ui) {
							Drop(ui.draggable.attr('metakind'),ui.draggable.attr('name'),'Location',locdata.metaid);
						}
					});
				LocationInfo(locdata);
				$('#LocationMetas, #LocationItems')
				.empty();
				LocationMetas();
				LocationItems();
			});
		});
	}
	
	function LocationInfo(locdata){
		$('#LocationInfo')
		.empty()
		.append(
				"<label>Name: </label><br />" + locdata.name + '<br>' +
				"<label>Info: </label><br />" + locdata.info + '<br>' +
				"<label>Coordinates: </label><br />" + locdata.xloc + '.' +  locdata.yloc + '.' + locdata.zloc + ':' + locdata.lattice + '<br>' +
				"<label>Exits: </label><br />" +
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

		
	}
	
	
	
	function LocationMetas(){
		$('#LocationMetas')
			.empty()
			.append("<label>MetaUsers Here: </label><br />");
			$.getJSON('/edenop/fetchlocalmetas', function(localmetas) {
				$.each(localmetas, function() {
					CreateIcon(this,'#LocationMetas');
				});
			$('.dragie').draggable(draggableArguments);
		});
	}
	
	function LocationItems(){
		$('#LocationItems')
		.empty()
		.append("<label>Items Here: </label><br />");
		$.getJSON('/edenop/fetchlocalitems', function(localitems) {
			$.each(localitems, function() {
				CreateIcon(this,'#LocationItems');
			});
			$('.dragie').draggable(draggableArguments);
		});
	}
	

	
	/////////////////////////////
	/// METAVISION & MESSAGING
	/////////////////////////////  
	
//	$('#MetaVision')
//		.dialog({ autoOpen: false, title: 'MetaVision', height: 250, width: 550, overflow: scroll, dialogClass:'transparent90' }, MetaVisionPlace);
//	
//	$('#MetaVision')
//		.after(
//			"<label>Broadcast Message: </label><br />" +
//			"<textarea type='text' id='mvprompt' class='typingfield' name='content' rows='1' cols='80' style='vertical-align:text-top'></textarea>" +
//			"<input type='button' id='btnmsgglobal' class='bsendmsg' value='Global'>" +
//			"<input type='button' id='btnmsglocal' class='bsendmsg' value='Local'>")
//		.dialog();
//			
//	$('#btnmsglocal').parent().on('click','#btnmsglocal',function (){
//		Broadcast('local');
//	});
//	$('#btnmsgglobal').parent().on('click','#btnmsgglobal',function (){
//		Broadcast('global');
//	});
//	$('#mvprompt').parent().on('keypress','#mvprompt',function(e) {
//	    if(e.which == 13) {Broadcast('local');}
//	});
	
	
	
	//////////////
	/// YOUTUBE STUFF
	/////////////
	$('#YouTubeGen').dialog({ width: 550, title: 'Drop A YouTube Link', position: {my: 'bottom middle', at: 'left bottom', of: document}, height: 150, overflow: scroll }).dialog('close');
	
	$('#YTLinken')
		.dialog({ autoOpen: false, title: 'YT Linken', position: {at: 'middle middle'}, height: 100, width: 550});
	
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
            var regData = $("#ytser").serialize();
    		$.ajax({
    			type: 'POST',
    			url: '/unicon/create/ytitem',
    			data: regData,
    			success: function(data){
    				MetaInventory();
    				$("#ytlink").val('');
    			}
    		});
		}
	}
	
	$('#ytsubmit').click(function(){
		thisytid = $.parseyturl($("#ytlink").val());
		createYTItem(thisytid);
		
	});
	
	
	
	

	/////////////////////////////
	/// NOT YET ADDED
	/////////////////////////////
	
//	function PopulateModifyForm(jsonGET) {
//		$('.name').attr('value',jsonGET.name);
//		$('.info').attr('value',jsonGET.info);
//		$('#xloc').attr('value',jsonGET.xloc);
//		$('#yloc').attr('value',jsonGET.yloc);
//		$('#zloc').attr('value',jsonGET.zloc);
//		$('#lattice').attr('value',jsonGET.lattice);
//		$('.metaid').attr('value',jsonGET.metaid);
//		$('.primertype').attr('value',jsonGET.primertype);
//		$('.shardtype').attr('value',jsonGET.shardtype);
//		$('.fragtype').attr('value',jsonGET.fragtype);
//	}
//	
//	function PopulateCustomFields(jsonGET) {
//		$('#ucform').append('<br>');
//		for (field in jsonGET) {
//			var hide = ['location','bpclass','name','info','metaid','shardtype','primertype','fragtype','crystalclass','xloc','yloc','zloc','lattice','North','East','West','South','xpos','ypos'];
//			if (hide.indexOf(field) !== -1){continue;}
//				$('#ucform').append('<label for="'+ field + '">' + field + '</label>'
//					+  '<br><input type="text" name="' + field + '" id="' + field + '" value="'+ jsonGET[field] +'"><br />');
//		}
//	}
//	
//	function ModifyObject(metakind,metaid){
//		$.getJSON('/unicon/load/' + metakind + '/' + metaid, function(jsonGET) {
//			UCForm(metakind);
//			$('#compilebutton').attr({
//				action: 'modify',
//			});
//			$('#ucnav').show();
//			$('#dynamenu').hide();
//			$('#ucform').show();
//			$('#ucformbutton').show();
//			$('#compilebutton').show();
//			$('#ucstaticmenu').hide();
//			PopulateModifyForm(jsonGET);
//			$('#crystalclassspan').hide().attr('disabled','disabled');
//			$('.compilebutton').attr('metakind',jsonGET.metakind);
//			PopulateCustomFields(jsonGET)
//		});
//	}
//	
//	/////////////////////////////
//	/// MENU LOGIC
//	/////////////////////////////
//	
//	
//
//	
//	
//	$('.ucstaticbutton').click(function() {
//		action = $(this).attr('action');
//		$('#compilebutton').attr({
//			action: action,
//		});
//		if (action == 'create'){
//			$('#UniCon').show();
//			$('#destroybutton').hide();
//		}
//		else {
//			$('#UniCon').hide();
//			$('#destroybutton').show();
//		}
//		$('#ucstaticmenu').hide();
//		$('#ucselect').show();
//		$('#ucnav').show();
//	});
//	
//	$('#ucback').click(function() {
//		$('#ucstaticmenu').show();
//		$('#ucselect').hide();
//		$('#dynamenu').hide();
//		$('#ucform').hide();
//		$('#ucnav').hide();
//		$('#ucformbutton').hide();
//	});
//	
//	$('.dynamenu').click(function () {
//		$('#dynamenu').hide();
//		$('#ucform').show();
//		$('#ucformbutton').show();
//		$('#compilebutton').show();
//	});
//	
//	function UCForm(metakind){
//		$('.compilebutton').attr({
//			metakind: metakind,
//		});
//		
//		$('#ucselect').hide();
//		$('#dynamenu').show();
//		$('#ucform').empty();
//		$('#dynamenu').empty();
//		$('#ucform').html(
//				"<span class='metaid'><label>Meta ID</label><br />" +
//					"<input type='text' name='metaid' value='' class='metaid' id='metaid' disabled><br />" +
//					"<input type='text' name='metaid' value='' class='metaid' hidden></span>" +
//				"<span id='crystalclassspan'><label for='crystalclass'>"+metakind+" Class</label><br />" +
//					"<input type='text' name='crystalclass' id='crystalclass' class='crystalclass' value='' disabled><br />" +
//					"<input type='text' name='crystalclass' id='crystalclass' class='crystalclass' value='' hidden></span>" +
//				"<span id='blueprintclassspan' hidden><label>"+metakind+" Class</label><br />" +
//					"<input type='radio' name='bpclass' id='blueprintclass' class='blueprintclass' value='Original'>Original" +
//					"<input type='radio' name='bpclass' id='blueprintclass' class='blueprintclass' value='Copy'>Copy <br /></span>" +
//				"<label for='name'>"+metakind+" Name</label><br /><input type='text' name='name' class='name' id='name' value=''><br />"+
//				"<label for='info'>"+metakind+" Info</label><br /><input type='text' name='info' class='info' id='info' value=''><br />"+
//				"<label for='info'>"+metakind+" iType</label><br /><input type='text' name='info' class='info' id='info' value=''><br />"+
//				"<span class='crystaltype'><span class='primertype'><label>Primer Type</label><br />" +
//					"<input type='text' name='primertype' value='' class='primertype' id='primertype' disabled><br />" +
//					"<input type='text' name='primertype' value='' class='primertype' hidden></span>" +
//				"<span class='shardtype'><label>Shard Type</label><br />" +
//					"<input type='text' name='shardtype' value='' class='shardtype' id='shardtype' disabled><br />" +
//					"<input type='text' name='shardtype' value='' class='shardtype' hidden></span>" +
//				"<span class='fragtype'><label>Frag Type</label><br />" +
//					"<input type='text' name='fragtype' value='' class='fragtype' id='fragtype' disabled><br />" +
//					"<input type='text' name='fragtype' value='' class='fragtype' hidden></span></span>" +
//				"<span class='location'><label>Location Info</label><br />" +
//					"<textarea type='text' name='xloc' id='xloc' value='' rows='1' cols='4' maxlength='3' placeholder='xxx'></textarea>."+
//					"<textarea type='text' name='yloc' id='yloc' value='' rows='1' cols='4' maxlength='3' placeholder='yyy'></textarea>."+
//					"<textarea type='text' name='zloc' id='zloc' value='' rows='1' cols='4' maxlength='3' placeholder='zzz'></textarea>:"+
//					"<textarea type='text' name='lattice' id='lattice' value='' rows='1' cols=7' maxlength='3' placeholder='lattice'></textarea> "
//		);
//		
//	}
//	
//	$('.ucselect').click(function () {
//		var ucSelect = $(this).attr('name');
//		var ucKind = $(this).attr('metakind');
//		if (action == 'create'){
//			var metakind = $(this).attr('creates');
//		} else {
//			var metakind = $(this).attr('metakind');
//		}
//		
//		//alert(ucSelect+ucKind+metakind);
//		
//		UCForm(metakind);
//		if (action == 'create'){
//			$('.metaid').hide();
//		}
//		
//		function LoadDynaMenu(GetObjects) {
//			$.each(GetObjects, function() {
//				$('#dynamenu').append(
//						"<input type='button' name='" + this.metaid + "' metakind='"+this.metakind+"' id='" + this.metaid + "' class='button2 scrystal dynamenu' value='" + this.name + "' /> "
//				);
//				var thisID = this.metaid;
//			});
//		}
//		function CreatePresets(jsonGET) {
//			$('.primertype').attr('value',jsonGET.primertype);
//			$('.shardtype').attr('value',jsonGET.shardtype);
//			$('.fragtype').attr('value',jsonGET.fragtype);
//		}
//		if(ucSelect == 'UniCon'){
//			$('.crystalclass').attr('value', 'Primer');
//			$('#primertype').removeAttr('disabled');
//			$('.shardtype').hide();
//			$('.fragtype').hide();
//			$('.compilebutton').attr({
//				metakind: 'Crystal',
//				metaid: 'New',
//			});
//		}
//		else if (ucSelect == 'Primer'){
//			$.getJSON('/unicon/fetch/' + ucKind + '/' + ucSelect, function(GetObjects) {
//				LoadDynaMenu(GetObjects);
//				$('.scrystal').on('click',function() {
//					$.getJSON('/unicon/load/' + ucKind + '/' + $(this).attr('name'), function(jsonGET) {
//						if (action == 'create'){
//							CreatePresets(jsonGET);
//							$('.crystalclass').attr('value','Shard');
//							$('#shardtype').removeAttr('disabled');
//							$('.fragtype').hide();
//						}
//						else {
//							PopulateModifyForm(jsonGET);
//							$('.crystalclass').attr('value','Primer')
//							$('.primertype').removeAttr('disabled');
//							$('.shardtype').hide();
//							$('.fragtype').hide();
//						}
//					});
//				});
//			});
//		} else if (ucSelect == 'Shard') {
//			$.getJSON('/unicon/fetch/' + ucKind + '/' + ucSelect, function(GetObjects) {
//				LoadDynaMenu(GetObjects);
//				$('.scrystal').on('click',function() {
//					$.getJSON('/unicon/load/' + ucKind + '/' + $(this).attr('name'), function(jsonGET) {
//						if (action == 'create'){
//							CreatePresets(jsonGET);
//							$('.crystalclass').attr('value','Frag');
//							$('#fragtype').removeAttr('disabled');
//						}
//						else {
//							PopulateModifyForm(jsonGET);
//							$('.crystalclass').attr('value','Shard')
//							$('.shardtype').removeAttr('disabled');
//							$('.fragtype').hide();
//						}
//					});
//				});
//			});
//		} else if (ucSelect == 'Frag') {
//			$.getJSON('/unicon/fetch/' + ucKind + '/' + ucSelect, function(GetObjects) {
//				LoadDynaMenu(GetObjects);
//				$('.scrystal').on('click',function() {
//					$.getJSON('/unicon/load/' + ucKind + '/' + $(this).attr('name'), function(jsonGET) {
//						if (action == 'create'){
//							CreatePresets(jsonGET);
//							$('#crystalclassspan').hide().attr('disabled','disabled');
//							$('#blueprintclassspan').show();
//						}
//						else {
//							PopulateModifyForm(jsonGET);
//							$('.crystalclass').attr('value','Frag')
//							$('.fragtype').removeAttr('disabled');
//							$('#blueprintclass').hide();
//						}
//					});
//				});
//			});
//		} else if (ucSelect == 'Blueprint') {
//			$.getJSON('/unicon/fetch/' + ucSelect + '/', function(GetObjects) {
//				LoadDynaMenu(GetObjects);
//				$('.scrystal').on('click',function() {
//					$.getJSON('/unicon/load/' + ucSelect + '/' + $(this).attr('name'), function(jsonGET) {
//						if (action == 'create'){
//							CreatePresets(jsonGET);
//							$('#crystalclassspan').hide().attr('disabled','disabled');
//							$('#compilebutton').attr('value','Compile New Object').attr('metakind',jsonGET.primertype);
//							PopulateCustomFields(jsonGET)
//						}
//						else {
//							PopulateModifyForm(jsonGET);
//							$('#blueprintclassspan').show();
//							$('#crystalclassspan').hide().attr('disabled','disabled');
//							PopulateCustomFields(jsonGET)
//						}
//					});
//				});
//			});
//		} else if (ucSelect == 'Object') {
//			$.getJSON('/unicon/fetch/' + ucSelect + '/', function(GetObjects) {
//				LoadDynaMenu(GetObjects);
//				$('.scrystal').on('click',function() {
//					var ucKind = $(this).attr('metakind');
//					$('#destroybutton').attr('metakind',ucKind);
//					$.getJSON('/unicon/load/' + ucKind + '/' + $(this).attr('name'), function(jsonGET) {
//						if (action == 'create'){
//							CreatePresets(jsonGET);
//							PopulateModifyForm(jsonGET);
//							$('#crystalclassspan').hide().attr('disabled','disabled');
//							$('#compilebutton').hide();
//							$('#destroybutton').show();
//							$('#name').attr('disabled','disabled');
//							$('#info').attr('disabled','disabled');
//							PopulateCustomFields(jsonGET)
//						}
//						
//						else {
//							PopulateModifyForm(jsonGET);
//							$('#crystalclassspan').hide().attr('disabled','disabled');
//							$('.compilebutton').attr('metakind',jsonGET.metakind);
//							PopulateCustomFields(jsonGET)
//						}
//					});
//				});
//			});
//		}
//	});
//	
//
//	
//	$('#addfield').click(function() {
//		$("#ucform").append('<label for="' + $("#customField").val() + '">' + $("#customField").val() + '</label><br><input name="' + $("#customField").val() +'" id="' + $("#customField").val() + '" type="text"><br />');				
//	});
//	
//	$('#dynamenu').on('click','.dynamenu',function() {
//		metaid = $(this).attr('name');
//		$('.compilebutton').attr({
//			metaid: metaid,
//		});
//	});
//	
//	$('.compilebutton').click(function() {
//		var action = $(this).attr('action');
//		var metakind = $(this).attr('metakind');
//		var metaid = $(this).attr('metaid');
//		var formData = $('#ucform').serialize();
//		//alert(metakind);
//		$.ajax({
//			type: 'POST',
//			url: '/unicon/' + action + '/' + metakind + '/' + metaid,
//			data: formData,
//			success: function(data){
//				SessionHandler();
//			}
//		})
//	});
	

});


