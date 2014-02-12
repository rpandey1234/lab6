'use strict';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	$('.project a').click(addProjectDetails);

	$('#colorBtn').click(randomizeColors);
	$('#flickrButton').click(getFlickrPhoto);	
}

/*
 * Make an AJAX call to retrieve project details and add it in
 */
function addProjectDetails(e) {
	// Prevent following the link
	e.preventDefault();

	// Get the div ID, e.g., "project3"
	var projectID = $(this).closest('.project').attr('id');
	// get rid of 'project' from the front of the id 'project3'
	var idNumber = projectID.substr('project'.length);
	var detailsDiv = this;

	console.log("User clicked on project " + idNumber);
	$.get('/project/' + idNumber, function(data){
		console.log(data);
		var detailHtml = "<p>" + data['title'] + "</p>"
			+ "<p>" + data['date'] + "</p>"
			+ "<img class='detailsImage' src='" + data['image'] + "'></img>"
			+ "<p>" + data['summary'] + "</p>";
		$(detailsDiv).parent().find('.details').html(detailHtml);
	});
}

/*
 * Make an AJAX call to retrieve a color palette for the site
 * and apply it
 */
function randomizeColors(e) {
	console.log("User clicked on color button");
	$.get('/palette', function(data){
		console.log(data);
		var colors = data.colors.hex;
		$('body').css('background-color', colors[0]);
		$('.thumbnail').css('background-color', colors[1]);
		$('h1, h2, h3, h4, h5, h5').css('color', colors[2]);
		$('p').css('color', colors[3]);
		$('.project img').css('opacity', .75);
	});
}

function getFlickrPhoto(e) {
	var numPhotos = 50;
	console.log('get flickr');		
	var randIndex = Math.floor((Math.random()*numPhotos));
	var tag = $("#tagLabel").val();
	console.log(tag);
	if (tag === "") {
		$(".display-tag").text('Random');
		$.getJSON("http://api.flickr.com/services/rest/?",
	  {
	  	nojsoncallback: "1",
	  	method: "flickr.interestingness.getList",
	  	api_key: "3e45e1a7bb4219c06295fd0a6f451fc0",
	    format: "json",
	    per_page: "1",
	    tags: tag,
	    page: randIndex + ""
	  },
	  flickrCallback);	
	} else {
		$(".display-tag").text(tag);
		$.getJSON("http://api.flickr.com/services/rest/?",
		  {
		  	nojsoncallback: "1",
		  	method: "flickr.photos.search",
		  	api_key: "3e45e1a7bb4219c06295fd0a6f451fc0",
		    tags: tag,
		    tagmode: "any",
		    format: "json",
		    per_page: "1",
		    page: randIndex + "", 
		    sort: "interestingness-desc"
		  },
		  flickrCallback);
	}
	
}

function flickrCallback (rsp) {
	if (rsp.stat != "ok") { // If this executes, something broke!
	  return;
	}
	//should only have 1 photo, should do better error checking here
	var photo = rsp.photos.photo[0];
  var t_url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + "z.jpg";
  var p_url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
	
	$("#flickrPhoto img").attr("src", t_url);
	$("#flickrPhoto img").attr('onload', function() { 
		console.log('loaded new photo');
	});
	var title = "Untitled";
	if (photo.title !== "") {title = photo.title;}
	$("#flickrPhoto .desc").html("<a class='caption' target='_blank' href='" + p_url + "'>" + title + "</a>");
}