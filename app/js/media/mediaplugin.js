
var MediaLibraryPlugin = function(app) {
	
	var mediaLibraries = null,
		mediaPopup = new InfoWindow(),
		contentToProcess = [];
	
	MediaLibrary.getMediaLibraries(function(data) {
		mediaLibraries = data;
		addMedia();		
	});
	
	// process chapters, add image icon to verses
	function addMedia() {
			
		if (mediaLibraries == null) {
			return;
		}		
		
		while (contentToProcess.length > 0) {
			var content = contentToProcess.pop();
			
			if (content.data('has-media') != undefined) {
				continue;
			}
			
			// add images to verses	
			content.find('.verse').each(function() {
				var verse = $(this),
					verseid = verse.attr('data-id');
				
				// make sure we're just doing the first verse	
				verse = verse.parent().find('.' + verseid).first();
					
				if (!verse.hasClass('has-media')) {
					// check all libraries
					for (var i=0, il=mediaLibraries.length; i<il; i++) {
						var mediaLibrary = mediaLibraries[i],
							iconClassName = mediaLibrary.iconClassName,
							mediaForVerse = mediaLibrary.data ? mediaLibrary.data[verseid] : undefined;
										
						// add media
						if (typeof mediaForVerse != 'undefined') {	
							
							// check if it's alrady been added
							if (verse.closest('.chapter').find('.' + verseid).find('.' + iconClassName).length == 0) {
						
								var icon = $('<span class="inline-icon ' + iconClassName + '"></span>'),
									verseNumber = verse.find('.verse-num');
									
								if (verseNumber.length > 0) {
									verseNumber.after(icon);							
								} else {							
									icon.prependTo(verse);
								}
							}
						}	
					} // libries loop			
				
					verse.addClass('has-media');
				}
				
			}); // verse loop
			
				
			for (var i=0, il=mediaLibraries.length; i<il; i++) {
			
				var mediaLibrary = mediaLibraries[i];
				
				(function(mediaLibrary) {
		
					// handle clicks
					content.on('click', '.' + mediaLibrary.iconClassName, function(e) {
				
						// clear it out!
						mediaPopup.body.html('');				
				
						var 
							icon = $(this),
							verse = icon.closest('.verse'),
							verseid = verse.attr('data-id'),
							reference = new bible.Reference(verseid).toString(),
							mediaForVerse = mediaLibrary.data[verseid];
							
						switch (mediaLibrary.type) {
							
							case 'image':
															
								var imagesHtmlArray = $.map(mediaForVerse, function(item, index) {
									var url = 'content/media/' + mediaLibrary.folder + '/' + item;
										return '<li><a href="' + url + '" target="_blank"><img src="' + url + '" /></a></li>';
									}),					
									html = imagesHtmlArray.join('');
		
								mediaPopup.body.append('<strong>' + reference.toString() + '</strong>');	
								mediaPopup.body.append($('<ul class="inline-image-library-thumbs">' + html + '</ul>'));
								
								break;
							
							case 'video':
								var url = 'content/media/' + mediaLibrary.folder + '/' + mediaForVerse;																
								//mediaPopup.body.append('<video src="' + url + '" type="video/mp4" controls autoplay style="width:100%; height: auto;"></video>');
								
								mediaPopup.body.append('<strong>' + reference.toString() + '</strong>');	
								mediaPopup.body.append($('<ul class="inline-video-library-thumbs">' + 
									'<li><a href="' + url + '"><img src="css/images/video.svg" "></a></li>' +
								  '</ul>'));

								
								break;																
								
						}
			
						//mediaPopup.center().show();
						mediaPopup.position( icon ).show();
					});
				})(mediaLibrary);
			}
			
			content.data('has-media', true);
			
		} // while	
		
	}
	
	/*
	mediaPopup.body.on('click', '.inline-image-library-thumbs a', function() {
		var link = $(this);
		
		if (link.parent().siblings().length == 0) {
			mediaPopup.hide();
		}
		
	});
	*/
	
	mediaPopup.body.on('click', '.inline-image-library-thumbs a', sofia.globals.mediaImageClick);	
	mediaPopup.body.on('click', '.inline-video-library-thumbs a', sofia.globals.mediaVideoClick);		
	
	
	var ext = {};
	ext = $.extend(true, ext, EventEmitter);	
	ext.on('message', function(e) {
		if (e.data.messagetype == 'textload') {
			//store
			contentToProcess.push(e.data.content);			
			// run 
			addMedia();
		}			
	});	
	
	return ext;
}

sofia.plugins.push('MediaLibraryPlugin');

