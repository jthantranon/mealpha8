//////////////
/// Custom
/////////////

(function($) {
  $.fn.parseyturl = function(url) {
	    if(url.indexOf('?') === -1)
	        return null;
	    var query = decodeURI(url).split('?')[1];
	    var params = query.split('&');      
	    for(var i=0,l = params.length;i<l;i++)
	        if(params[i].indexOf('v=') === 0)
	            return params[i].replace('v=','');
	    return null;
	};
  $.parseyturl = $.fn.parseyturl; // Rename for easier calling.
 })(jQuery);

//////////////
/// Other
/////////////

var _init = $.ui.dialog.prototype._init;
		$.ui.dialog.prototype._init = function() {
			_init.apply(this, arguments);
			
			var dialog_element = this;
			var dialog_id = this.uiDialogTitlebar.next().attr('id');
			
			this.uiDialogTitlebar.append('<a href="#" id="' + dialog_id + 
			'-minbutton" class="ui-dialog-titlebar-minimize ui-corner-all">'+
			'<span class="ui-icon ui-icon-minusthick"></span></a>');
			
			$('#dialog_window_minimized_container').append(
				'<div class="dialog_window_minimized ui-widget ui-state-default ui-corner-all" id="' + 
				dialog_id + '_minimized">' + this.uiDialogTitlebar.find('.ui-dialog-title').text() + 
				'<span class="ui-icon ui-icon-newwin"></div>');
				
			$('#' + dialog_id + '-minbutton').hover(function() {
				$(this).addClass('ui-state-hover');
			}, function() {
				$(this).removeClass('ui-state-hover');
			}).click(function() {
				dialog_element.close();
				$('#' + dialog_id + '_minimized').show();
			});
			
			$('#' + dialog_id + '_minimized').click(function() {
				$(this).hide();
				dialog_element.open();
			});
		};


/*!
 * Ambiance - Notification Plugin for jQuery
 * Version 1.0.1
 * @requires jQuery v1.7.2
 *
 * Copyright (c) 2012 Richard Hsu
 * Documentation: http://www.github.com/richardhsu/jquery.ambiance
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
 
(function($) {
  $.fn.ambiance = function(options) {
  
    var defaults = {
      title: "",
      message: "",
      type: "default",
      permanent: false,
      timeout: 2,
      fade: true,
      width: 300
    };
    
    var options = $.extend(defaults, options);
    var note_area = $("#ambiance-notification");

    // Construct the new notification.
    var note = $(window.document.createElement('div'))
                .addClass("ambiance")
                .addClass("ambiance-" + options['type']);
                
    note.css({width: options['width']});

    
    // Deal with adding the close feature or not.
    if (!options['permanent']) {
      note.prepend($(window.document.createElement('a'))
                    .addClass("ambiance-close")
                    .attr("href", "#_")
                    .html("&times;"));
    }
    
    // Deal with adding the title if given.
    if (options['title'] !== "") {
      note.append($(window.document.createElement('div'))
                   .addClass("ambiance-title")
                   .append(options['title']));
    }
    
    // Append the message (this can also be HTML or even an object!).
    note.append(options['message']);
    
    // Add the notification to the notification area.
    note_area.append(note);
    
    // Deal with non-permanent note.
    if (!options['permanent']) {
      if (options['timeout'] != 0) {
        if (options['fade']) {
          note.delay(options['timeout'] * 1000).fadeOut('slow');
          note.queue(function() { $(this).remove(); });
        } else {
          note.delay(options['timeout'] * 1000)
              .queue(function() { $(this).remove(); });
        }
      }
    }  
  };
  $.ambiance = $.fn.ambiance; // Rename for easier calling.
})(jQuery);

$(document).ready(function() { 
  // Deal with adding the notification area to the page.
  if ($("#ambiance-notification").length == 0) {
    var note_area = $(window.document.createElement('div'))
                     .attr("id", "ambiance-notification");
    $('body').append(note_area);
  }
});

// Deal with close event on a note.
$(document).on("click", ".ambiance-close", function () {
  $(this).parent().remove();
  return false;
});

/*!
 * jQuery YouTube Popup Player Plugin v2.2
 * http://lab.abhinayrathore.com/jquery_youtube/
 * Last Updated: Aug 30 2012
 */
(function ($) {
    var YouTubeDialog = null;
    var methods = {
        //initialize plugin
        init: function (options) {
            options = $.extend({}, $.fn.YouTubePopup.defaults, options);

            // initialize YouTube Player Dialog
            if (YouTubeDialog == null) {
                YouTubeDialog = $('<div></div>').css({ display: 'none', padding: 0 });
                $('body').append(YouTubeDialog);
                YouTubeDialog.dialog({ autoOpen: false, resizable: false, draggable: options.draggable, modal: options.modal,
                    close: function () {
						YouTubeDialog.html(''); 
						$(".ui-dialog-titlebar").show();
					}
                });
            }

            return this.each(function () {
                var obj = $(this);
                var data = obj.data('YouTube');
                if (!data) { //check if event is already assigned
                    obj.data('YouTube', { target: obj, 'active': true });
                    $(obj).bind('click.YouTubePopup', function () {
                        var youtubeId = options.youtubeId;
                        if ($.trim(youtubeId) == '') youtubeId = obj.attr(options.idAttribute);
                        var videoTitle = $.trim(options.title);
						if (videoTitle == '') {
							if (options.useYouTubeTitle) setYouTubeTitle(youtubeId);
							else videoTitle = obj.attr('title');
						}

                        //Format YouTube URL
                        var YouTubeURL = "http://www.youtube.com/embed/" + youtubeId + "?rel=0&showsearch=0&autohide=" + options.autohide;
                        YouTubeURL += "&autoplay=" + options.autoplay + "&controls=" + options.controls + "&fs=" + options.fs + "&loop=" + options.loop;
                        YouTubeURL += "&showinfo=" + options.showinfo + "&color=" + options.color + "&theme=" + options.theme;

                        //Setup YouTube Dialog
                        YouTubeDialog.html(getYouTubePlayer(YouTubeURL, options.width, options.height));
                        YouTubeDialog.dialog({ 'width': 'auto', 'height': 'auto' }); //reset width and height
                        YouTubeDialog.dialog({ 'minWidth': options.width, 'minHeight': options.height, title: videoTitle });
                        YouTubeDialog.dialog('open');
						$(".ui-widget-overlay").fadeTo('fast', options.overlayOpacity); //set Overlay opacity
						if(options.hideTitleBar && options.modal){ //hide Title Bar (only if Modal is enabled)
							$(".ui-dialog-titlebar").hide(); //hide Title Bar
							$(".ui-widget-overlay").click(function () { YouTubeDialog.dialog("close"); }); //automatically assign Click event to overlay
						}
						if(options.clickOutsideClose && options.modal){ //assign clickOutsideClose event only if Modal option is enabled
							$(".ui-widget-overlay").click(function () { YouTubeDialog.dialog("close"); }); //assign Click event to overlay
						}
                        return false;
                    });
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                $(this).unbind(".YouTubePopup");
                $(this).removeData('YouTube');
            });
        }
    };

    function getYouTubePlayer(URL, width, height) {
        var YouTubePlayer = '<iframe title="YouTube video player" style="margin:0; padding:0;" width="' + width + '" ';
        YouTubePlayer += 'height="' + height + '" src="' + URL + '" frameborder="0" allowfullscreen></iframe>';
        return YouTubePlayer;
    }
	
	function setYouTubeTitle(id) {
		var url = "https://gdata.youtube.com/feeds/api/videos/" + id + "?v=2&alt=json";
		$.ajax({ url: url, dataType: 'jsonp', cache: true, success: function(data){ YouTubeDialog.dialog({ title: data.entry.title.$t }); } });
	}

    $.fn.YouTubePopup = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.YouTubePopup');
        }
    };

    //default configuration
    $.fn.YouTubePopup.defaults = {
		'youtubeId': '',
		'title': '',
		'useYouTubeTitle': true,
		'idAttribute': 'rel',
		'draggable': false,
		'modal': true,
		'width': 640,
		'height': 480,
		'hideTitleBar': false,
		'clickOutsideClose': false,
		'overlayOpacity': 0.5,
		'autohide': 2,
		'autoplay': 1,
		'color': 'red',
		'controls': 1,
		'fs': 1,
		'loop': 0,
		'showinfo': 0,
		'theme': 'light'
    };
})(jQuery);