/*
	WYSIWYG by Reuben Tan


*/

var ver = "1.0.4";
//guidedhelpid
var divIframe = 'gbifp'
var notiHover = 'gbniphid'
var shareHover = 'gbsbw'
var ShareBoxControl = 'shareboxcontrols'
var postSharebox = 'sharebox'
var postTextarea = 'sharebox_textarea'
var postSharebutton = 'sharebutton'
var photoLightbox = 'photos_lightbox_close'
var Commentactionblock = 'actionblock'
/*
var ShareCont = ".Je"
var CommentCont = ".qf"
var vidcontainer = ".Sd"
*/
var ViewSelector = ".Ima"
var delay = 120;

var storage = chrome.storage.local;
var originalwidth = 30
var originalheight = 35
var originalwidthd = "percent"
var originalheightd = "percent"
var originalslider = 1

var checkbox, checkboxm, checkboxtrans, unlockstatus, newwidth, newwidthd, newheight, newheightd, wWidth, pWidth, wHeight, pHeight, newslider
var storefrom, storeleft, storebox, storefocus, imgURLred, imgURLgreen
var FirstOpen = true;
var FirstStart = true;
var firstHover = false;
var external = false;
var manualclose = false;
var manualmove = false;
var WindowWidth = 0;
var WindowHeight = 0;
var minWidth = 400;
var minHeight= 170;
var objects = ['autoopen','automove','autotrans','width','widthd','height','heightd','slider','save']
var InIframe = false//(window.location != window.parent.location) ? true : false;
//var isOpen = ($('#wysiwygDialog').attr('status') == "open") ? true : false;
var ready;
$( document ).ready(function() {
	ready = true;

	if (InIframe){
		//location = window.parent.location
		/*
		try
		{
			location = window.parent.location
		}
		catch(e)
		{
			if (e.name == "SecurityError"){return;}
		}
		*/
		//console.log(5,location)
	}
	addIcon();
	createDialog();
	addButtons(false,"start");
	

});

function isOpen()
{
	return $('#wysiwygDialog').attr('status') == "open";
}

function createDialog()
{
	if (!external)
	{
				$('html').append('\
		<div id="wysiwygDialog" status=close>\
			<div id="wysiwygHeader">\
				G+ WYSIWYG  -  \
				<div id="wysiwyg_stats" style="display:inline;">\
					Words: <span id="wysiwyg_words">0</span> Chars: <span id="wysiwyg_chars">0</span>\
				</div>\
				<a href="#" id="wysiwygClose" wysiwygE="close">X</a>\
			</div>\
			<div id="wysiwyg" class="antifocus editable" tabindex="1" contenteditable="plaintext-only">\
			</div>\
			\
			<div id="wysiwygFooter">\
				<div class="wysiwygEEditor">\
					<div class="menuEContainer">\
						<div class="wysiwygEMainmenu">\
							<button class="wysiwygButton formButton" wysiwygE="b" title="Bold"><b>B</b></button>\
							<button class="wysiwygButton formButton" wysiwygE="i" title="Italics"><i>I</i></button>\
							<button class="wysiwygButton formButton" wysiwygE="s" title="Strikethrough"><s>S</s></button>\
						</div>\
						\
						<div class="wysiwygESecondmenu">\
							<input type="button" class="wysiwygButton wysiwygSel" value="Hide" wysiwygE="sel" title="Hide selection" style="width:55px;"/>\
							<button class="wysiwygButton" wysiwygE="rem" title="Remove formatting">Rem</button>\
							<input type="button" class="wysiwygButton wysiwygLock" value="Lock" wysiwygE="lock" title="Lock WYSIWYG editor" style="width:65px;"/>\
							<button class="wysiwygButton" wysiwygE="remsel" title="Unselect all">Unselect</button>\
						</div>\
					</div>\
				</div>\
				<br /><br /><input id="wysiwygCheck" type="checkbox" name="ctrl" value="Ctrl" title="Hold ctrl" onclick="wysiwygcheck();"/><label for="wysiwygCheck">Ctrl</label>\
				<div id="slider"></div>\
			</div>\
		</div>')

		
		$("#wysiwygDialog").resizable({ 
			handles: "n, e, s, w, ne, nw, se, sw", 
			resize: function( event, ui ) {dialogResize()},
			minWidth: minWidth,
			minHeight: minHeight
		});
		
		$("#wysiwygDialog").draggable({
			handle: "#wysiwygHeader",
			stop: function( event, ui ) {$( "#wysiwygDialog" ).css("position","fixed");manualmove=true;}
		});

		
		$('#wysiwygDialog').hide();
	}
}

function dialogResize()
{
	
	
	hb = $('#wysiwyg').outerHeight(true);
	ha = $('#wysiwyg').height();
	hd = $('#wysiwygDialog').outerHeight(true);
	hh = $('#wysiwygHeader').outerHeight(true);
	hf = $('#wysiwygFooter').outerHeight(true);
	wd = $('#wysiwygDialog').outerWidth();
	wh = wd-10;
	

	$('#wysiwyg').outerHeight(hd-(hh+hf+(hb-ha)+5))
	$('#wysiwyg').outerWidth(wh)
	$('#wysiwygHeader').outerWidth(wh)
	$('#wysiwygFooter').outerWidth(wh)
}



function openDialog()
{
	if (InIframe)
	{
		parent.openDialog();
		return;
	}
	$('#wysiwygDialog').fadeIn(700);
	$('#wysiwyg_red').hide();
	$('#wysiwyg_green').show();
	$('#wysiwygDialog').attr('status',"open")
	
}

function closeDialog()
{

	$('#wysiwygDialog').fadeOut(700);
	$('#wysiwyg_green').hide();
	$('#wysiwyg_red').show();
	$('#wysiwygDialog').attr('status',"close")
}

function addIcon()
{
	
	pathname = window.location.pathname
	if (pathname == "/u/0/share"){return;}
	getStore(1,1)
	imgURLred = chrome.extension.getURL("images/wysiwygred.png");
	imgURLgreen = chrome.extension.getURL("images/wysiwyggreen.png");
	
	if ($('#contentPane')[0]) 
	{ 
		if ($(".Ima")[0])
		{
			$(".Ima").append('<div id="wysiwyg_B" style="display:inline;"><a href="#" class="wysiwyg" title="WYSIWYG" style="height:44px;"><img src='+imgURLgreen+' id="wysiwyg_green" style=" display:none;"  /><img src='+imgURLred+' id="wysiwyg_red"  /></a></div>')
			$("#wysiwyg_B").height($(ViewSelector).height())
			$('.wysiwyg').css("padding-top",function() {return ($(ViewSelector).height()-29)/2;})
		}
		else
		{
			$("html").append('<div id="wysiwyg_B" class="wysiwygExternal"><a href="#" class="wysiwyg" title="WYSIWYG" style="height:44px;"><img src='+imgURLgreen+' id="wysiwyg_green" style=" display:none;"  /><img src='+imgURLred+' id="wysiwyg_red"  /></a></div>')
		}
		external = false;
	}

	else if(window.location.href.indexOf("plus.google.com/u/0/share?") > -1) {
		external = true;
		$("html").append('<div id="wysiwyg_B" class="wysiwygExternal"><a href="#" class="wysiwyg" title="WYSIWYG" style="height:44px;"><img src='+imgURLgreen+' id="wysiwyg_green" style=" display:none;"  /><img src='+imgURLred+' id="wysiwyg_red"  /></a></div>')
	};		
	
	//isOpen = $('#wysiwygDialog').attr('status') == "open"
	if (isOpen())
	{
		$('#wysiwyg_red').hide()
		$('#wysiwyg_green').show()
	}
	else
	{
		$('#wysiwyg_green').hide()
		$('#wysiwyg_red').show()
	}
	
	
}	

function addButtons(a,from)
{
//add iframe css pos
		pathname = window.location.pathname
		//https://plus.google.com/u/0/share?
		console.log(pathname)
	if (pathname == "/u/0/share"){return;}
	//console.log("buttons",from)
	imgURLmenu = chrome.extension.getURL("images/wysiwygmenu.png");

	if (from == "box")
	{
		inject = '<div class="wysiwygEditor"><div class="wysiwygMainmenu tdButton"><button class="wysiwygButton formButton" wysiwygE="s" title="Strikethrough"><s>S</s></button><button class="wysiwygButton formButton" wysiwygE="i" title="Italics"><i>I</i></button><button class="wysiwygButton formButton" wysiwygE="b" title="Bold"><b>B</b></button></div></div>'
		inject1 = '<div class="wysiwygEditor"><div class="wysiwygSecondmenu tdButton" ><button class="wysiwygButton" wysiwygE="remsel" title="Unselect all">Unselect</button><button class="wysiwygButton" wysiwygE="rem" title="Remove formatting">Rem</button><input type="button" class="wysiwygButton wysiwygSel" value="Hide" wysiwygE="sel" title="Hide selection" style="width:55px;"/></div></div>'
	}
	else
	{
		inject = '<div class="wysiwygEditor"><div class="menuContainer"><div class="wysiwygSecondmenu" style="display:none;"><input type="button" class="wysiwygButton wysiwygSel" value="Hide" wysiwygE="sel" title="Hide selection" style="width:55px;"/><button class="wysiwygButton" wysiwygE="rem" title="Remove formatting">Rem</button><input type="button" class="wysiwygButton wysiwygLock" value="Lock" wysiwygE="lock" title="Lock WYSIWYG editor" style="width:65px;"/><button class="wysiwygButton" wysiwygE="remsel" title="Unselect all">Unselect</button></div><div class="wysiwygMainmenu"><button class="wysiwygButton formButton" wysiwygE="b" title="Bold"><b>B</b></button><button class="wysiwygButton formButton" wysiwygE="i" title="Italics"><i>I</i></button><button class="wysiwygButton formButton" wysiwygE="s" title="Strikethrough"><s>S</s></button></div></div><div class="buttonContainer"><a href="#"  class="wysiwygMenuButton" wysiwygE="menu" showing="main"><img src='+imgURLmenu+' class="wysiwyg_menu" title="Next menu"/></a></div></div>'
		inject1 = false
	}
	if (!a)
	{
		buttons = $('div[guidedhelpid="'+ShareBoxControl+'"]')
	}
	else
	{
		buttons = a.closest('div[guidedhelpid="'+postSharebox+'"]').find('div[guidedhelpid="'+ShareBoxControl+'"]')
	}
	b = buttons.find('td').next()
	if (!b.find('.wysiwygEditor')[0])
	{
		b.append(inject)
		if (inject1){buttons.find('tbody').append('<tr><td colspan="2">'+inject1+'</td></tr>')}
		//a.find('div[guidedhelpid="'+ShareBoxControl+'"]').find('td').next().append(inject)
	//$('.wysiwygSecondmenu').hide();
		
		if (showButtons == "second")
		{
			$('.wysiwygMainmenu').hide();
			$('.wysiwygSecondmenu').show();
		}
		else
		{
			$('.wysiwygSecondmenu').hide();
			$('.wysiwygMainmenu').show();
		}
	

	}
	/*
	if (!$('.wysiwygEditorD')[0])
	{
		$('.ui-dialog-buttonpane').prepend('<div id="wysiwygEditorD"><input type="button" class="wysiwygButton wysiwygSel" value="Hide" wysiwygE="sel"/></div>')
	}
	*/
	//<input type="button" id="Sel" value="Hide" onclick="Sel(true)" style="border-style:none; background-color:white;"/>
}



$('html').on("click", ".wysiwygButton, .wysiwygMenuButton, #wysiwygClose",function(e) {
	type = $(this).attr("wysiwygE");
	switch(type)
	{
		case "sel": Sel($(this),false); break;
		case "lock": Lock($(this));break
		case "menu": Menu();break;
		case "remsel": RemoveSelection(false);break;
		case "close": closeDialog();manualclose = true;break;
		default: FormatSelection(type,false); break;
	}
	event.preventDefault();

});
function getStore(w,h)
{
		//for when $(window) is triggered by dialog resize
	if (WindowWidth == w && WindowHeight == h){return;}
	storebox = ""
	WindowWidth = $(window).width()
	WindowHeight = $(window).height()
	storage.get(objects,function(item){
		if (item.autoopen == undefined){checkbox = true}else{checkbox = item.autoopen}
		if (item.automove == undefined){checkboxm = true}else{checkboxm = item.automove}
		if (item.autotrans == undefined){checkboxtrans = true}else{checkboxtrans = item.autotrans}

		if (item.editorlock == undefined){unlockstatus = "unlock"}else{unlockstatus = item.editorlock}
		if (item.width == undefined){newwidth = originalwidth}else{newwidth = item.width}
		if (item.widthd == undefined){newwidthd = originalwidthd}else{newwidthd = item.widthd}
		
		if (item.height == undefined){newheight = originalheight}else{newheight = item.height}
		if (item.heightd == undefined){newheightd = originalheightd}else{newheightd = item.heightd}
		if (item.slider == undefined){newslider = originalslider}else{newslider = item.slider}
		
		if (item.save == undefined){StorePreview = ""}else{StorePreview = item.save}

		load()
		//console.log($('.dialogWYSIWYG')[0])
		//$('.dialogWYSIWYG').css('opacity', 0.3);
	})
}

function load()
{
	console.log(555, newwidth, newheight)
	if (newwidthd == "percent")
	{	
		wWidth = $(window).width();
		pWidth = wWidth * newwidth / 100 ; 
	}
	else
	{
		pWidth = newwidth
	}
	
	if (newheightd == "percent")
	{	
		wHeight = $(window).height();
		pHeight = wHeight * newheight / 100 ; 
	}
	else
	{
		pHeight = newheight
	}

	if (pHeight < minHeight){pHeight = minHeight;}
	if (pWidth < minWidth){pWidth = minWidth;}
	
	console.log(pHeight,pWidth)
	$('#wysiwygDialog').outerHeight(pHeight);
	$('#wysiwygDialog').outerWidth(pWidth);

	dialogResize()
		console.log(66,unlockstatus)
		if (unlockstatus != "unlock")//unlocked
		{
			$(".wysiwygLock").val("Lock")
			Lock($(".wysiwygLock"))
		}
	
	if (!$('#slider').hasClass('ui-slider'))
	{
		$('#slider').slider({ 
			min: 0.3, 
			max: 1, 
			step: 0.01, 
			value: newslider,
			orientation: "horizontal",
			create: function( event, ui ) {
				$('#wysiwygDialog').css('opacity', newslider);
			},
			slide: function(e,ui){
				$('#wysiwygDialog').css('opacity', ui.value)
				
			},
			stop: function( event, ui ) {
				placeCaretAtEnd($("#wysiwyg").get(0))
				BoxID = $(LastClick)
				}			
		});
	}
	
		/*
	$('#wysiwyg_dialog').dialog({
		create: function (event) {$(event.target).parent().css('position', 'fixed');},
		dialogClass:'dialogWYSIWYG',
		resizeStop: function(event, ui) {
			var position = [(Math.floor(ui.position.left) - $(window).scrollLeft()),
							(Math.floor(ui.position.top) - $(window).scrollTop())];
			$(event.target).parent().css('position', 'fixed');
			$('#wysiwyg_dialog').dialog('option','position',position);
			},
		title: "G+ WYSIWYG",
		buttons: [{ text: "Preview", click: function() {updatePreview(StorePreview,"Preview");$('#wysiwyg').focus();}},{ text: "Clear", click: function() {$('#wysiwyg').html("");$('#wysiwyg_chars').html("0");$('#wysiwyg_words').html("0");$('#wysiwyg').focus();}}],
		autoOpen: false,
		open: function() {
			$('.ui-dialog-titlebar').append('<div id="wysiwyg_stats">Words: <span id="wysiwyg_words">0</span> Chars: <span id="wysiwyg_chars">0</span></div>');
			$("#wysiwyg_red").hide();
			$("#wysiwyg_green").show();
		},
		beforeClose: function( event, ui ) {
			$('#wysiwyg_stats').remove(); manualclose = true;
			$("#wysiwyg_green").hide();
			$("#wysiwyg_red").show();
		},
		show: {
			effect: 'fade',
			duration: 500
		},
		hide: {
			effect: 'fade',
			duration: 500
		},
		width: pWidth,
		height: pHeight,
		minWidth: 260,
		minHeight: 135
	}); 
	
	dialogposition("normal","")
	
	$(".ui-dialog-buttonset").prepend('<div id="slider" style="width:90%;"></div>')
	$('#slider').slider({ 
		min: 0.3, 
		max: 1, 
		step: 0.01, 
		value: newslider,
		orientation: "horizontal",
		create: function( event, ui ) {
			$('.dialogWYSIWYG').css('opacity', newslider);
		},
		slide: function(e,ui){
			$('.dialogWYSIWYG').css('opacity', ui.value)
		}                
	});
	*/
	
	
	
}

(function($,sr){
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;
 
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null; 
          };
 
          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);
 
          timeout = setTimeout(delayed, threshold || 100); 
      };
  }
	// smartresize 
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
 
})(jQuery,'smartresize');

$(window).smartresize(function(){
    var current_width = $(window).width();
	getStore($(window).width(), $(window).height())
	
});

function dialogposition(a,b)
{
	
	if (a == "retry"){dialogposition("box iframe","")}
	if (storebox == a && manualmove){return;}
	if (external || b == "wysiwyg"){return;}
	if (!$('#wysiwygDialog')[0]){return;}
	//isOpen = $('#wysiwygDialog').attr('status') == "open"
	if (a != "bypassN" && a != "bypassB")
	{
	
		pathname = window.location.pathname
		//"/","/communities/109567494358576439345","/+ReubenTan/posts",/explore
		//"/photos"
		//guidedhelpid="photos_lightbox_close"
		if (pathname.length > 1)
		{
			communities = left(pathname,"/communities".length) == "/communities"
			posts = right(pathname,"posts".length) == "posts"
			explore = right(pathname,"explore".length) == "explore"
		}
		if (pathname == "/"){c = "home"}else if (posts){c = "post"}else if (explore){c = "explore"}else if (communities){c = "communities"}
		
		/*
		guidedhelpid="sharebutton" 
		if save or share
	
	*/
		//Postmethod = $('div[guidedhelpid="sharebutton"]').text()
		
	
		if (a == "normal")
		{
			switch(c)
			{
				case "home": sharebox = $('div[guidedhelpid="'+postSharebox+'"]').parent();
					fromleft = sharebox.offset().left + sharebox.outerWidth();
					fromtop = (sharebox.offset().top);z=1337;break;
				case "post": fromleft = ($(window).width() - $('#wysiwygDialog').outerWidth())/2;
					fromtop = 60 + 44;z=1337;break;
				case "explore": fromleft = ($(window).width() - $('#wysiwygDialog').outerWidth()-10);
					fromtop = 60 + 44;z=1337;break;
				case "communities": fromleft = 5;
					fromtop = 60 + 44;z=800;break;
			}	
		}
		else
		{
			if (b == 480)
			{
				fromleft = $(window).width() - 525 - pWidth
			}
			else
			{
				sharebox = $('div[guidedhelpid="'+divIframe+'"]')
				fromleft = sharebox.offset().left - pWidth
				
				if ($('div[guidedhelpid="'+divIframe+'"]').css('min-width') == "400px"){fromleft = $(window).width() - 525 - pWidth}
			}
			fromtop = 60 + 44
			z=1337;
		}
	}

	if (manualmove && !isOpen()){return;}
	if (storebox == a && $('#wysiwygDialog').offset().left == fromleft && $('#wysiwygDialog').offset().top == fromtop && !isOpen()){return;}

	storebox = a
	/*
	if (a != "bypassN" && a != "bypassB")
	{
		if (a == "normal" || a == "normal1")
		{
			
			$('html').on("click", 'div[guidedhelpid="'+postSharebox+'"]',function(e) {
	console.log("left",$(this).parent().offset().left)
	console.log("top",$(this).parent().offset().top)
})
		
			sharebox = $('div[guidedhelpid="'+postSharebox+'"]').parent()

			
			
		}
		else
		{
			
		}
		console.log(fromleft)
		

	}
	*/

	if (!fromleft || !fromtop){return;}
	if (fromleft-($(window).width()-$('#wysiwygDialog').outerWidth()+10) >0 && !isOpen()){return;}
	if (fromleft < 0 && fromtop < 0 && !isOpen()){return;}
	
	//$("#wysiwygDialog").offset({ top: 0, left: 0})
	//$("#wysiwygDialog").offset({ top: fromtop, left: fromleft})
	
	if ($('div[guidedhelpid="'+photoLightbox+'"]')[0] != undefined && checkboxtrans){opacity = 0.5; if (newslider < opacity){opacity = newslider}}else{opacity = newslider}
	$("#wysiwygDialog").css({ top: fromtop, left: fromleft, "z-index": z, "opacity": opacity})
	
	$('#slider').slider({ 
		value: opacity		
	});
	
	/*
	switch(a)
	{
		case "normal1": case "bypassN": if (b){placeCaretAtEnd(b)}; break;
		case "box1": case "bypassB": if (b){b.focus()}; break;
	}
	*/
}


function placeCaretAtEnd(el) {
	//http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
	el.focus();
	range = document.createRange();
	range.selectNodeContents(el);
	range.collapse(false);
	selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

/*
document.onmouseover = function(e) {
    console.log(e.target.id);
	id = e.target.id
	id = id.replace(/([:.])/gi,"\\$1")
	console.log($("#"+id))
}
*/



//shouldnt need this
/*
var PostID;
	//for editing a post and try to comment at the same time
$('html').on("DOMSubtreeModified", ".editable",function(e) {
	PostTheID($(this))
});

function PostTheID(dom)
{
	PostID = dom.attr("id").replace(/:/g,"\\:").replace(/\./g,"\\.")	
}
*/
function debouncer(fn,time) 
{
	var t;
	return function(){
		var ctx = this, args = arguments;
		//place caret at the end when dialog is opened
		FirstOpen = false //only for testing
		if (FirstOpen && LastPostID)
		{
			fn.apply(ctx, args);
		}
		else
		{
			clearTimeout(t);
			t = setTimeout(function() 
			{
				fn.apply(ctx, args);
				clearTimeout(t)
			}, time);
		}
	};
}

var falsePositive = false; 






	//main page share
$(document).on("DOMSubtreeModified", ".editable",debouncer(function(){
	//sync();
	id = $(this).attr("id")
	//console.log($(".V-fd").parent().html())
	//$("html").find('div[role="option"]').each(function(){console.log($(this))})
	//+posts
	//$(".t-C-z").each(function(){console.log($(this))})
	//console.log(window.getSelection())

	if (id == "wysiwyg")
	{
		if (!$(this).is(":focus")){return;}
		if (falsePositive){falsePositive = false; return;}
		falsePositive = true
		LastPostID = "#"+$(this).attr('id').replace(/([:.])/gi,"\\$1")
		UpdateFormat($(this).html(),true)
		falsePositive = false

	}
	else
	{	

		if (!$(this).is(":focus") && !$(':focus').is('input')){return;}
		if (falsePositive){falsePositive = false; return;}

		falsePositive = true
		LastPostID = "#"+$(this).attr('id').replace(/([:.])/gi,"\\$1")
		BoxID = $(this)
		WYSIWYG($(this),"Share")
		$('#wysiwyg .proflinkWrapper').attr("contenteditable",false)
		BlockClick()
		falsePositive = false
	}
		
},delay));

//share
$("html").on("focus mouseenter", 'a[guidedhelpid="'+shareHover+'"], a[guidedhelpid="'+notiHover+'"]',function(e) {
	iframeID = "#"+$('div[guidedhelpid="'+divIframe+'"]').find('iframe').attr("id")
	//aria-hidden="true"
	findBox = $('div[guidedhelpid="'+divIframe+'"]').find('iframe').contents()
	
	shareboxLock(true)
	if (checkboxm){if ($(iframeID).attr('aria-hidden')=='true'){dialogposition("box iframe",480)}else{dialogposition("box iframe","")}}
	//storefocus = $(this).attr("id")
	//dialogposition("box iframe","")
	
	
	findBox.off("mouseenter focus", '.editable, div[guidedhelpid="'+postTextarea+'"]')
	findBox.on("mouseenter focus", '.editable, div[guidedhelpid="'+postTextarea+'"]',function(e) {
		shareboxLock(true)
		BoxID = $(this)
		//console.log(!checkboxm , storefocus != $(this).attr("id"))
		if (!checkboxm){return;}
		if ($(iframeID).attr('aria-hidden')=='true'){dialogposition("box iframe focus",480)}else{dialogposition("box iframe focus","")}
		//storefocus = $(this).attr("id")

	})

	findBox.off("DOMSubtreeModified", '.editable')
	findBox.on("DOMSubtreeModified", '.editable',debouncer(function(e) {
		if (falsePositive){falsePositive = false; return;}
		falsePositive = true
		BoxID = $(this)
		WYSIWYG(BoxID,"box")
		falsePositive = false
	}))
	
	cssURL = chrome.extension.getURL("sharebox.css");
	findBox.find('head').append('<link rel="stylesheet" type="text/css" href="'+cssURL+'">')
	
	findBox.off("click", ".wysiwygButton")
	findBox.on("click", ".wysiwygButton",function(e) {
		type = $(this).attr("wysiwygE");
		switch(type)
		{
			case "sel": Sel($(this),true); break;
			//case "lock": parent.Lock($(this));break
			case "remsel": RemoveSelection(true);break;
			default: parent.FormatSelection(type,true); break;
		}
		e.preventDefault();
	})
	findBox.off("keydown", ".editable")
	findBox.on("keydown", ".editable",function(e) {
		if (e.which=="17")
		{
			if (!CtrL){parent.$('#wysiwygCheck').prop("checked", true);}
			CtrL = true;
		}
		else
		{
			if (CtrL){parent.$('#wysiwygCheck').prop("checked", false);}
			CtrL = false;
		}
	});

	findBox.off("keyup", ".editable")
	findBox.on("keyup", ".editable",function(e) {
		if (e.which=="17"){CtrL = false;parent.$('#wysiwygCheck').prop("checked", false);}
	});

	findBox.off("mouseenter focus", 'div[guidedhelpid="'+postSharebutton+'"]')
	findBox.on("mouseenter focus", 'div[guidedhelpid="'+postSharebutton+'"]',function(e) {
		a = $(this).closest('div[guidedhelpid="'+postSharebox+'"]').find('.editable')
		str = a.html().replace(/<\/wysiwyg>(\u200B)/gi,"</wysiwyg>")
		a.html(str)
	});
	
	findBox.off("mousedown, mouseup", ".editable")
	findBox.on("mousedown, mouseup", ".editable",function(e) {
		LastClick = $(this)
		BoxID = LastClick
		if (CtrL)
		{
			//MouseD = true;
			//sel = BoxID.contentWindow.window.getSelection();
			sel = $(iframeID)[0].contentWindow.document.getSelection()
			if (sel.type == "Range"){ReplaceText(false,true)}else{CtrL = false;parent.$('#wysiwygCheck').prop("checked", false);}
			
		}
	})
	/*
	if (!$('div[guidedhelpid="'+divIframe+'"]').find('iframe').contents().find('.wysiwygEditor')[0])
	{
		addButtons($('div[guidedhelpid="'+divIframe+'"]').find('iframe').contents());
	}
	*/
})


/*

$("html").on("mouseenter", 'div[guidedhelpid="'+divIframe+'"]',function(e) {
	$(this).find('iframe').contents().off("mousedown, mouseup", ".editable")
	$(this).find('iframe').contents().on("mousedown, mouseup", ".editable",function(e) {
		console.log("iframe")
		Area = true;
		LastClick = $(this).attr("id")
		LastClick = LastClick.replace(/([:.])/gi,"\\$1")
		LastClick = "#" + LastClick
		if (LastClick != "#wysiwyg"){LastPostID = LastClick}
		BoxID = $(this)
		if (CtrL)
		{
			//MouseD = true;
			sel = window.getSelection();
			if (sel.type == "Range"){ReplaceText(false)}else{CtrL = false;$('#wysiwygCheck').prop("checked", false);}
			
		}
	})
})
*/
/*need sharebox code
	//main page share
$('html').on("DOMSubtreeModified", ShareCont+","+CommentCont,debouncer(function(){
		WYSIWYG($(this),"Share")
},delay));


	//only works on plus.google.com domain due to same origin policy
$('html').on("DOMSubtreeModified", '#gbdw',function(e) {
		////this is for the sharebox when first opened
	$('html').off("DOMSubtreeModified", "#gbwc")
	$('html').on("DOMSubtreeModified", '#gbwc',function(e) {
		if (checkboxm){dialogposition("box","")}
		$(this).find('iframe').contents().off("DOMSubtreeModified", ShareCont)
		$(this).find('iframe').contents().on("DOMSubtreeModified", ShareCont,debouncer(function(e) {
					PostTheID($(this).find(".editable"));
					WYSIWYG($(this),"FirstIframe");
				},delay));
	});

	$("html").off("mouseenter","#gbwc");
	$("html").on("mouseenter", "#gbwc",function(e) {
		StoreTitle = $(this).find('iframe').attr("title")
		if (checkboxm){dialogposition("box","")}
	
		if (StoreTitle == "Notifications")
		{
			NotiOff = $(this).find('iframe[title="Notifications"]').contents()
			NotiOff.off("DOMSubtreeModified", "**");
			NotiOff.on("DOMSubtreeModified",CommentCont,debouncer(function(e) {
					NotiGBar($(this))
				},delay)
			);
		}
		else if (StoreTitle == "Share")
			{
				SharOff = $(this).find('iframe[title="Share"]').contents()
				
				SharOff.off("DOMSubtreeModified", "**");
				SharOff.on("DOMSubtreeModified", ShareCont,debouncer(function(e) {
						shareGBar($(this))
					},delay)
				);
			}
	});
});

function NotiGBar(dom)
{	
	PostTheID(dom.find(".editable"))
	WYSIWYG(dom,"Notifications")
}

function shareGBar(dom)
{
	PostTheID(dom.find(".editable"))
	WYSIWYG(dom,"'+postSharebox+'")
}
*/
var comp
function updatepaste(e,data,comp)
{
	
	
}

function htmlEncode(value){
  //http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
  return $('<div/>').text(value).html();
}

$('html').on("paste", '.editable',function(e) {
	
	data = e.originalEvent.clipboardData.getData("text/plain")
	storage.get("pastedata",function(item){
		comp = item.pastedata;
		console.log(3,comp != data)
		$('#wysiwygcaret').remove()
		if (comp != data)
		{
			sel = window.getSelection();
			if (sel.rangeCount)
			{
				range = sel.getRangeAt(0);          
				range.deleteContents();
				var wysiwygpastearea = document.createElement("wysiwygpastearea");
				wysiwygpastearea.id = "wysiwygpastearea";
				range.insertNode(wysiwygpastearea);
			}
			$('#wysiwygpastearea').text(data)
			$('#wysiwygpastearea').after('<wysiwygcaret id="wysiwygcaret"></wysiwygcaret>')
			$('#wysiwygpastearea').replaceWith(htmlEncode($('#wysiwygpastearea').text()))

			placeCaretAtEnd($("#wysiwygcaret").get(0))
			$("#wysiwygcaret").remove()
		
			return;
		}
		
		sel = window.getSelection();
		if (sel.rangeCount)
		{
			range = sel.getRangeAt(0);          
			range.deleteContents();
			var paste = document.createElement("pastecaret");
			paste.id = "wysiwygpaste";
			range.insertNode(paste);			
		}
		/*
		var DangerousHTML = ['script', 'iframe', 'frame', 'applet', 'object', 'embed', 'form']
		for (var x = 0; x < DangerousHTML.length; x++)
		{
			DangerReg = new RegExp('<'+DangerousHTML[x]+'(\\s|\\S)*?>(\\s|\\S)*?<\/'+DangerousHTML[x]+'>',"gi")
			if (DangerReg.test(data)){alert("G+ WYSIWYG: Your clipboard contained a(n) <" +DangerousHTML[x]+ "> HTML tag which can be potentially dangerous for you. It has been removed before it can do any harm.")}
			data = data.replace(DangerReg,"")
		}
		*/
		data = data.replace(/<wysiwygcopy id=".+?"><\/wysiwygcopy>/gi,"")
		$('#wysiwygpaste').append(data).after('<wysiwygcaret id="wysiwygcaret"></wysiwygcaret>')
		
		data = ReverseWYSIWYG($("#wysiwygpaste").html())
		if (LastClick == "#wysiwyg")
		{
			data = data.replace(/<button .+?oid="([0-9]+?)".+?>.+?>(\+|@).+?>(.+?)<\/button>/gi,'<span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a href="https://plus.google.com/$1" class="proflink" oid="$1" target="&blank">$3</a></span>')
			data = data.replace(/<button .+?email="(.+?)".+?>.+?<\/button>/gi,'<a class="ot-hashtag" href="https://plus.google.com/s/%23$1" target="&blank">#$1</a>')
		}

		$("#wysiwygpaste").replaceWith(data);
		
		placeCaretAtEnd($("#wysiwygcaret").get(0))
		$("#wysiwygcaret").remove()

	})
	e.preventDefault();
})

/*
$('html').on("mousedown", 'a[guidedhelpid="'+shareHover+'"], a[guidedhelpid="'+notiHover+'"]',function(e) {
	if (!checkboxm){return;}
	dialogposition("box",$(this).attr('id'))

})
*/
$('html').on("click", ".editable",function(e) {
	if ($(this).attr("id") == "wysiwyg"){return;}
	shareboxLock(false)
	BoxID = $(this)
	
})

$('html').on("mouseenter focus", '.editable, div[guidedhelpid="'+postTextarea+'"]',function(e) {
	shareboxLock(false)
	if (!checkboxm || $(this).attr("id") == "wysiwyg"){return;}
	BoxID = $(this)
	/*
	if (InIframe)
	{
		parent.dialogposition("box iframe","")
	}
	else
	{
*/
		dialogposition("normal",$(this).attr('id'))
		console.log("movemov")
	//}
	//storefocus = $(this).attr("id")

})


/*
$('html').on("mouseenter", "#gbg1, #gbg3",function(e) {
	if (!checkboxm){return;}
	dialogposition("box","")
});
*/
var wysiwygshow = true;
$('html').on("click", "#wysiwyg_button",function(e) {
	if (wysiwygshow)
	{
		wysiwygshow = false;
		$("#wysiwyg_container").hide()
		$('#wysiwyg_green').hide();
		$('#wysiwyg_red').show();
	}
	else
	{
		wysiwygshow = true;
		$("#wysiwyg_container").show()
		$('#wysiwyg_red').hide();
		$('#wysiwyg_green').show();
	}
});


$('html').on("click", "a.wysiwyg",function(e) {
	//isOpen = $('#wysiwygDialog').attr('status') == "open"
	if (isOpen())
	{
		//$("#wysiwyg_dialog").dialog("close");
		closeDialog()
		manualclose = true;
	}
	else
	{
		//$("#wysiwyg_dialog").dialog("open");
		openDialog()
		manualclose = false;
	}
	
	event.preventDefault();
});

	function WYSIWYG(a,from)
	{
		//if (ready && from != "box")
		console.log(88888,from)
		if (ready)
		{
			if (!$('#wysiwyg_B')[0]) addIcon();
			addButtons(a,from);
		}
		if (from == "Updateformat"){a = BoxID}
		//if (from == "Updateformat"){a = $(LastPostID)}
		//BoxID = a
		//still need boxid when going from parent to iframe

			sb = a.closest('div[guidedhelpid="'+postSharebox+'"]').find('div[itemtype="http://schema.org/VideoObject"]').find('a').attr('href')
			cb = a.closest('div[guidedhelpid="'+Commentactionblock+'"]').find('div[itemtype="http://schema.org/VideoObject"]').find('a').attr('href')

			if (sb == undefined && cb == undefined)
			{
				videourl = false;
			}
			else
			{
				if (sb != undefined){videourl=sb;}else if (cb != undefined){videourl=cb;}
			}


		if (from == "Updateformat"){a = $(LastClick)}
		/*var OldString = a.find(PostID+".editable").html()*/var OldString = a.html()
		if (OldString)
		{		
			
			OldString = OldString.replace(/(<caret id="wysiwygcaret"><\/caret>)((<\/a>)?(<\/span>))/gi,"$2 $1")
			OldString = OldString.replace(/(<caret id="wysiwygcaret"><\/caret>)(<\/a>)/gi,"$2 $1")

			OldString = OldString.replace(/\u200B/gi,"")
			OldString = OldString.replace(/(\S)&nbsp;(\S)/gi,"$1 $2")
			CheckPreview(OldString,videourl)

			if (!external)
			{
				//isOpen = $('#wysiwygDialog').attr("status") == "open";
				//console.log(isOpen)
				if (checkbox && !manualclose && !isOpen() && storefrom != from)
				{	
					openDialog()
					
					if (checkboxm)
					{
						if (from == "Share")
						{
							//if (checkboxm){cbm = "normal"}else{cbm = "bypassN"}
							dialogposition("normal","")
						}
						else
						{
							//if (checkboxm){cbm = "box"}else{cbm = "bypassB"}
							parent.dialogposition("box","")
						}
					}
				}
			}

			/*
			//remove
			if (external)
			{
				//var isOpen = $( "#wysiwyg_dialog" ).dialog( "isOpen" );
				var isOpen = false;
				if (checkbox && !manualclose && !isOpen && storefrom != from)
				{
					storefrom = from
					//$("#wysiwyg_dialog").dialog("open");
					
					//$(".ui-dialog").css('opacity',"0.5")
					var el = a//.find(LastPostID+".editable")
					if (from == "'+postSharebox+'" || from == "Notifications" || from == "FirstIframe")
					{
						
						if (checkboxm){a = "box1"}else{a = "bypassB"}
						if (FirstOpen){FirstOpen = false; a="box1";}
						dialogposition(a,el)
					}
					else
					{
						if (checkboxm){a = "normal1"}else{a = "bypassN"}
						if (FirstOpen){FirstOpen = false; a="normal1";}
						dialogposition("normal1",BoxID.get(0))
						//dialogposition("normal1",$(LastPostID).get(0))
					}
				}
			}
			*/
		}
	}

	if (!external)
	{
		//$('body').append('<div id="wysiwyg_dialog"><div id="wysiwyg" class="antifocus editable" tabindex="1" contenteditable="plaintext-only" >Thank you for using <i><b><span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a href="https://plus.google.com/100536257026267548175" class="proflink" oid="100536257026267548175" target="&blank">G+ WYSIWYG</a></span> v'+ver+'</b> - What You See Is What You Get by <b><span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a href="https://plus.google.com/101574317575204472478" class="proflink" oid="101574317575204472478" target="&blank">Reuben Tan</a></span></b> &nbsp;</i><br></div></div>');
	}

	var isEven = function(someNumber){
		return (someNumber%2 == 0) ? true : false;
	};

function savePreview(old)
{
	//old = Checktag(old,false)
	old = old.replace(/'c'/gi,"")
	if (old != "")
	{
		var Obj = {};
		Obj["save"] = old;
		storage.set(Obj);

	}
}

function updatePreview(update,from)
{
	if (from == "Preview"){storage.get("save",function(item){update = item.save})}
	update = update.replace(/&blank/gi,"_blank").replace(/- <span/gi,"-<span").replace(/<\/span> -/gi,"</span>-")
	var WC = strip(update)

	WCw = WC.split("&ReubeN")

	var Words = 0
	for (var x=0;x<WCw.length;x++)
	{
		w = WCw[x].match(/.+?(\s+|(?!\S))/g)
		if (w){Words = Words + (w.length)}
	}
	
	$('#wysiwyg_words').html(Words);
	
		//line breaks count as characters
	add = WC.match(/&ReubeN/g)
	if (add){add = add.length-1}
	
	update = update.replace(/&ReubeN/g,"<br>")

	WC = strip(update);

	if (Words == 0){
		$('#wysiwyg_chars').html("0");
	}
	else
	{
		$('#wysiwyg_chars').html(WC.length+add);
	}
	update = update.replace(/  /g," &nbsp;")
	
	update = update.replace(/<Rwysiwyg/gi,"<wysiwyg").replace(/wysiwygT>/gi,"wysiwyg>")
	update = update.replace(/(<wysiwyg id="R[0-9]+?)(".+?>)/gi,"$1T$2")
	update = update.replace(/(<wysiwyg)/gi,"&#8203;$1")
	update = update.replace(/(<\/arp><\/wysiwyg>)/gi,"$1&#8203;")
	update = update.replace(/'c'/gi,'<caret id="wysiwygcaret"><\/caret>')
	update = update.replace(/&#39;/gi,"'")
	//if (InIframe)
	//{
	//	parent.$('#wysiwyg').html(update);	
	//}
	//else
	//{
		$('#wysiwyg').html(update);
	//}
	
	if (LastClick == "#wysiwyg")
	{
		if ($("#wysiwygcaret")[0]){
			placeCaretAtEnd($("#wysiwygcaret").get(0))
			$("#wysiwygcaret").remove();
		}
	}
	
	//$('.proflinkWrapper').attr("contenteditable",false)
}

function strip(html)
{
	html = html.replace(/(\u200B)/gi,"")
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent||tmp.innerText;
}


		var hashregex = /\s?<button .+? email="([^"]+)?".+?<\/button>/g;
		var hashtagTemplate ='<a class="ot-hashtag" href="https://plus.google.com/s/%23<hashtaghere" target="&blank">#<hashtaghere</a>'
		var profileTemplate = '<span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a href="https://plus.google.com/<oidHere" class="proflink" oid="<oidHere" target="&blank"><nameHere</a></span>'
		var oidregex = /<button .+? oid="([0-9]+)".+?<\/button>/g;
		var nameregex = /\+<\/span>(.+?)<\/button>/g;
		
		var vidTmp, videostring 
		//[^ ] replaces \S because \S will include zero width spaces
		var italics = /([^a-z0-9]|\b)[_]([^ ]|[^ ].*?[^ ])[_]((?![^ ])|[^\w']|'c'($|\s))/gi
		var bold = /([^a-z0-9]|\B)[*]([^ ]|[^ ].*?[^ ])[*]((?![^ ])|[^\w*']|_|'c'($|\s))/gi
		var strike = /([^a-z0-9]|\B)[-]([^ ]|[^ ].*?[^ ])[-]((?![^ ])|[^\w'-]|_|'c'($|\s))/gi
		var FormatArray = [italics,bold,strike]

			//step 1 - starts with http/https/www. until first whitespace etc.
		var step1regex = /((\s|^|\b|[>;_*-])(((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_,!\\-]*([\)!:;}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/gi
	//	var step1regex = /((\s|^|\b|[>;_*-])(((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;'}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/gi
		var S1regex = /(\s|^|\b|[;_*-])((((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_,!\\-]*([\)!:;}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/i
		//var S1regex = /(\s|^|\b|[;_*-])((((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;'}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/i
		//var S1regex = /((\s|^|\b|[;_*-])(((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;'}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/i
			//step 2 - discard http://abc.com@abc etc.
		var step2regex = /.+\.[A-Za-z0-9]{2,}@.*/gi;
			//step 3 - match URL inputs (.com?abc .php?abc .aspx?abc) etc.
		var step3regex = /([\s_*;-]|&nbsp;)?(.+\?[\w\/=&\[\]@#$%\*\(\+\|\\`\.;-]+(?![^<]*<\/a>))()()/gi;
			//step 4 - match .com/ etc.
		var step4regex = /([\s_*;-]|&nbsp;)?(.+\.[a-z0-9]{2,}\/[\w`@#$%\*\(\+\|\\\/{[\]~=-]*((&amp;)\w*)*([!\).:;'}]([\w`@#$%\*\(\+\|\\\/{[\]~=-]|&amp;)+)?(?![^<]*<\/a>))(.+)?/gi;
			//step 5 - match .com etc. with http://
		//var step5regex = /([_*-])?(.+\.[a-z0-9]{2,}[#_-]*(\?\w+)?(?![^<]*<\/a>))(.+)?/gi;
		var step5regex = /([\s_*;-]|&nbsp;)?(((ht|f)tps?:\/\/)(.+\.[a-z0-9]{2,}[#_-]*(\?\w+)?)(?![^<]*<\/a>))(.+)?/gi
			//without http://
		var s5regex = /([\s_*;-]|&nbsp;)?(.+\.[a-z]{2,3}#*(\?\w+)?)([\W_*-])?((?!\S)|&amp;|[^\w@-])/gi
		
		var ftpregex = /(ftps?:\/\/).+/i
		var emailregex = /(([>;_\*-]+|\s|^))?(([\w-]+:)?[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-z]{2,4}))([_\*-]+)?/gi

		var HTTPTemplate = '$1<a href="$2" class="ot-anchor RClick" target="&blank" contenteditable="false" rtype="normal"><displayurl</a>';
		var youtubeTemplate = '<a href="<urlhere" class="ot-anchor" target="&blank" rtype="youtube"><titlehere</a>';
		var emailTemplate = '$1<a href="mailto:$3" class="ot-anchor" rtype="email">$3</a>$8'
		vidTemplate = '<a class="ot-timestamp" target="&blank" rtype="timestamp" href="<urlhere#t=<timehere"><displayhere</a>';
		
		var youtuberegex = /.+v=(([A-Za-z0-9_-]+)([&_=#;+%A-Za-z0-9\*-]+)?)/gi
		
		var links, lines, ahref;
		
		var NewString, HTTP, LBR
		var StoreString = "";

		
		function CheckPreview(OldString,videourl)
		{
		
			if (StoreString == OldString && !videourl){return;}
			StoreString = OldString

			nbspRegex = /([^\s>;])&nbsp;([^\sa-z0-9<&])/gi
			dbspRegex = /\s{2}&nbsp;|&nbsp;\s{2}/gi
				//G+ sometimes merges two spaces E.g "m  _" would be "m&nbsp;_" &nbsp; will only be used if not followed by another character - emails
			if (OldString.match(nbspRegex)){OldString = OldString.replace(nbspRegex,"$1 &nbsp;$2")}
				//G+ turns two spaces into "&nbsp;  " of "  &nbsp;"
			if (OldString.match(dbspRegex)){OldString = OldString.replace(dbspRegex,"&nbsp; ")}
			OldString = OldString.replace(/  /gi," &nbsp;")
			OldString = OldString.replace(/<\/button>&nbsp;/gi,"</button> ")
			if (OldString == ""){updatePreview("","empty")}
			if (!OldString && !videourl){return;}
			OldString = OldString.replace(/'/gi,"&#39;")
			OldString = OldString.replace(/<caret id="wysiwygcaret"><\/caret>/gi,"'c'")
			savePreview(OldString)

			//var tagregex = /<span .+?>(.)<span class=".+?"><span>(.+?)<\/span>.*?<\/span><\/span>/gi;
			var tagregex = /<span [^>]+?>(.)<span class=".+?"><span>(.+?)<\/span>.*?<\/span><\/span>/gi;
			var tagTmp = OldString.match(tagregex)

			if (tagTmp)
			{
				tagCounter = 0
				tag = tagTmp[0].replace(tagregex,"$1$2")
				OldString = OldString.replace(tagregex,tag)
			}

			NewString = OldString;
			NS = Checktag(NewString,videourl)
			NS = NS.replace(/<\/a><\/span><a/gi,"</a></span> <a")
			checkBR(NS);	
		}
		
		function Checktag(NS,videourl)
		{
				if (videourl) 
				{
					NS = youtubetime(NS,videourl)
				}
						
				var oidTmp = NS.match(oidregex)
				var nameTmp = NS.match(nameregex)
				
				if (oidTmp && nameTmp) {
					for (var n=0; n<oidTmp.length; n++)
					{
						oid = oidTmp[n].replace(oidregex,"$1")
						name = nameTmp[n].replace(nameregex,"$1")
						profileLink = profileTemplate.replace(/<oidHere/g,oid)
						profileLink = profileLink.replace("<nameHere",name)
						
						NS = NS.replace(oidTmp[n],profileLink)
					}
				}
				//need to allow * before/after span, temporally add space to "-"
				NS = NS.replace(/(<\/a><\/span>)(\w|-)/gi,"$1 $2").replace(/(\w|-)(<span)/gi,"$1 $2")
				
				var hashTmp = NS.match(hashregex)
				
				if (hashTmp) 
				{
					a = /\s<button/.test(hashTmp[0])
					b = / <button/.test(hashTmp[0])
					for (var h=0; h<hashTmp.length; h++)
					{
						hashtag = hashTmp[h].replace(hashregex,"$1")
						if (!(hashtag.match(italics)))
						{
							hashlink = hashtagTemplate.replace(/<hashtaghere/g,hashtag)
							NS = NS.replace(hashTmp[h],hashlink)
						}
						else
						(
							NS = NS.replace(hashTmp[h],"#"+hashtag)
						)
					}
						//zero width space - if a = b then is edit
					if (a != b)
					{
						//console.log(0, NS)
					}
					else
					{
						//console.log(1, NS)
						NS = NS.replace(/>&nbsp;</gi,"><").replace(/>&nbsp;&nbsp;</gi,">&nbsp;<")
					}

					NS = NS.replace(/>&nbsp;&nbsp;</gi,"> &nbsp&nbsp; <").replace(/>&nbsp;&nbsp; </gi,">&nbsp; <")
					NS = NS.replace(/(<\/a>)((?!<\/)[^ ])/gi,"$1 $2").replace(/([^\s\B>])(<a)/gi,"$1 $2")	
				
				}
				return NS;
		}
			
		function youtubetime(NS,url){
				timeregex = /([A-Za-z]+)?((([0-9]+):)?([0-9]{1,2}):([0-9]{2}))(<br>)?(?![^<]*<\/a>)/g
				newtimeregex = /((([0-9]+):)?([0-9]{1,2}):([0-9]{2}))/
				time = NS.match(timeregex)

				var ti = 0; var tt = 0

				while (timeregex.test(NS)==true ) 
				{
					timeindex = timeregex.lastIndex
					NewTime = NS.match(timeregex)[ti]
					
					if (!NewTime.match(/[A-Za-z](([0-9]+:)?[0-9]{1,2}:[0-9]{2})/)){
						dt = NewTime.replace(timeregex,"$2")
						h = NewTime.replace(timeregex,"$4")
						m = NewTime.replace(timeregex,"$5")
						s = NewTime.replace(timeregex,"$6")
						br = NewTime.replace(timeregex,"$7")
						
						if (h == NewTime){h = 0}
							timeTemplate = h + "h" + m + "m" + s +"s"
						
						startTime = vidTemplate.replace(/<urlhere/g,url)
						startTime = startTime.replace(/<timehere/g,timeTemplate)
						startTime = startTime.replace(/<displayhere/g,dt)
						NS = replaceatpos(NS,timeindex,NewTime,(startTime + br))				
					}else{ti = ti+1}
					if (tt>=time.length){break;}
					tt++
			}
			return NS;
		}
			
		function replaceatpos(replacestring,finish,arrmatch,replacestr){
			return replacestring.substring(0, finish-(arrmatch.length)) + replacestr + replacestring.substring(finish);
		}
		
		function checkBR(NS)
		{
			if (NS.substr(-4) != "<br>"){NS = NS+"<br>"}
			lines = new Array();
			LBR = NS.split("<br>")

				//ensure all line breaks are changed
			var NStmp = ""
			for (var tlb = 0; tlb < LBR.length-1; tlb++)
			{
				NStmp = NStmp + "<b"+tlb+"r />&ReubeN"
			}
			NS = NStmp
			
			for (var lb = 0; lb < LBR.length-1; lb++)
			{	
				if (LBR[lb])
				{
					checkLink(NS,LBR[lb],lb)
				}
				else
				{
					checkLink(NS,"",lb)
				}
			}
		}
		
		function checkLink(NS,LBRe,lb)
		{
			HTTP = LBRe.match(step1regex)
			if (HTTP)
			{			
				links = new Array();
				for (var tht = 0; tht < HTTP.length; tht++)
				{
					LBRe = LBRe.replace(S1regex,"$1<R"+tht+"T />")
				}

				for (var ht = 0; ht < HTTP.length; ht++)
				{
					HTTPMatch = HTTP[ht].replace(S1regex,"$2")
					//HTTPMatch = HTTP[ht].replace(S1regex,"$1")
					HTTPMatch = HTTPMatch.replace(/&nbsp;/gi," ")
					if (HTTPMatch.substr(0,1) == ">"){HTTPMatch = HTTPMatch.substring(1)}
					domain = HTTPMatch.replace(step1regex,"$7")

					youtubedomain = domain.match(/(\.)?youtube/gi);
						
					if (youtubedomain)
					{
						if (HTTPMatch.match(youtuberegex))
						{
							youtubeid = HTTPMatch.replace(youtuberegex,"$2");
							youtube(youtubeid,HTTPMatch,ht,NS,LBRe,lb,HTTP)
						}
						else
						{
							links[ht] = convertURL(HTTPMatch,LBRe,ht)
							URLarray(NS,LBRe,lb,HTTP)
						}
					}
					else if (HTTP[ht].match(emailregex) && !HTTP[ht].match(step2regex) && !HTTP[ht].match(ftpregex) && HTTP[ht].toLowerCase().substring(4,0) != "http")
					{
						links[ht] = convertEMAIL(HTTPMatch)
						URLarray(NS,LBRe,lb,HTTP)
					}
					else
					{
						links[ht] = convertURL(HTTPMatch,LBRe,ht)
						URLarray(NS,LBRe,lb,HTTP)
					}
				}
			}
			else
			{
				
				checkformat(NS,LBRe,lb)
			}
		}
		
		function youtube(youtubeid,url,rt,NS,LBRe,lb,HTTP)
		{
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://gdata.youtube.com/feeds/api/videos/"+youtubeid+"?v=2&alt=jsonc", true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var resp = JSON.parse(xhr.responseText);

					if (resp.data !== undefined)
					{
						yttitle = resp.data.title
						httpregex = /(\s|[_*;-])?((ht|ft)tps?:\/\/.+)/i
						if (url.match(httpregex))
						{
							urlTmp = url.replace(httpregex,"$1$2")
						}
						else 
						{
							urlTmp = url.replace(/(\s|[_*;-])?(.+)/i,"$1http://$2")
						}
						
						s5 = /(\s|[_*;-])?(.+)((?!\S)|&amp;|[^\w@-])/i

						NewURL = urlTmp.replace(s5,"$1"+youtubeTemplate+"$3")
						NewURL = NewURL.replace(/<urlhere/g,urlTmp)
						youtubelink = NewURL.replace(/<titlehere/g,yttitle)
						
						links[rt] = youtubelink

						URLarray(NS,LBRe,lb,HTTP);
					}else
					{
						links[rt] = convertURL(url,LBRe,rt)
						URLarray(NS,LBRe,lb,HTTP);
					}
				}
			}
			xhr.send();
		}

		function URLarray(NS,LBRe,lb,HTTP)
		{
			if (links.length == HTTP.length)
			{
				for (var nht = 0; nht < links.length; nht++)
				{
					if (!links[nht]){break;}
					LBRe = LBRe.replace("<R"+nht+"T />",links[nht])
				}
				lines[lb] = LBRe
				checkformat(NS,LBRe,lb)
			}
		}

		function convertURL(url,LBRe,ht)
		{				
			url = url.replace(/&lt;/,"<").replace(/&gt;/,">")
			if(!url.match(step2regex))
			{
				httpregex = /([\s_*;-]|&nbsp;)?((ht|ft)tps?:\/\/.+)/i
				if (url.match(httpregex))
				{
					urlTmp = url.replace(httpregex,"$1$2")
				}
				else 
				{
					urlTmp = url.replace(/([\s_*;-]|&nbsp;)?(.+)/i,"$1http://$2")
				}
				if (url.match(step3regex))
				{
				
						NewURL = urlTmp.replace(step3regex,HTTPTemplate+"$4")
						urlDsp = url.replace(step3regex,"$2")
				}
				else if (urlTmp.match(step4regex))
					{
						NewURL = urlTmp.replace(step4regex,HTTPTemplate+"$7")
						urlDsp = url.replace(step4regex,"$2")
					}
					else if (url.match(step5regex)){
							NewURL = urlTmp.replace(step5regex,HTTPTemplate+"$7")
							urlDsp = url.replace(step5regex,"$2")
						}
						else if (url.match(s5regex))
						{						
								//_test <R0T /> <R1T /> <R2T />
							TLBRe = LBRe
							urlT = TLBRe.split("<R"+ht+"T />")[0]

								//_test <R0T />
							for (var nht = 0; nht < ht; nht++)
							{
								urlT = urlT.replace("<R"+nht+"T />",links[nht])
							}
								//_test google.com_
							before = urlT
								//_test google.com_ plus.google.com_
							after = urlT+urlTmp

							for (var x=0;x<3;x++)
							{
								switch(x)
								{
									case 0:	t = "i"; break;
									case 1: t = "b"; break;
									case 2: t = "s"; break;
								}

								before = before.replace(FormatArray[x],"$1<"+t+">$2</"+t+">$3")
								after = after.replace(FormatArray[x],"$1<"+t+">$2</"+t+">$3")
							}
							
							beforeCount = before.match(/<[ibs]>/g)
							afterCount = after.match(/<[ibs]>/g)
							
							if (!beforeCount){beforeCount = -1}else{beforeCount = beforeCount.length}
							if (!afterCount){afterCount = -1}else(afterCount = afterCount.length)

								//does not have http or ftp and does not accept TLDs longer than 3 or contain numbers
							s5 = /([\s_*;-]+)?(.+\.[a-z]{2,3}#*(\?\w+)?)([\W_*-]+)?((?!\S)|&amp;|[^\w@-])/i
								//if before is less than after then the url has formatting
							if (beforeCount < afterCount)
							{				
								NewURL = urlTmp.replace(s5,HTTPTemplate+"$4$5")
								urlDsp = url.replace(s5,"$2")	
							}
							else if (url.match(/([\s_*;-])?(.+\.[a-z]{2,3}#*(\?\w+)?)((?!\S)|&amp;|[^\w@-])/i))
							{	
								NewURL = urlTmp.replace(/([\s_*;-])?(.+\.[a-z]{2,3}#*(\?\w+)?)((?!\S)|&amp;|[^\w@-])/i,HTTPTemplate+"$4")
								urlDsp = url.replace(s5regex,"$2")	
							}
								else
								{
									NewURL = "<displayurl"
									urlDsp = url
								}
						}
						else
						{
							NewURL = "<displayurl"
							urlDsp = url
						}
						
				NewURL = NewURL.replace(/<displayurl/,urlDsp)	
				return NewURL;
			}
			else
			{
				return url;
			}
		}
		
		function convertEMAIL(email){
			NewEmail =  email.replace(emailregex,emailTemplate)
			return NewEmail
		}
		
		function checkformat(NS,LBRe,lb)
		{
			LBRe = LBRe.replace(/<(wysiwyg id="(R[0-9]+?T?).+?><aRp>((\S|\s)+?)<\/aRp><\/wysiwyg)>/gi,"<R$1T>")
			a = aLinks(LBRe)
			LBRe = tmpLinks(LBRe,a)		
			LBRe = Format(LBRe)		
			LBRe = checkHash(LBRe)
			LBRe = repairLinks(LBRe,a)

			lines[lb] = LBRe
			BRarray(NS)
		}
		
		function aLinks(str)
		{
			ahref = str.match(/(<a .+?<\/a>|<span.*?>.*?<\/span>)/gi)
			return ahref;
		}
		
		function tmpLinks(str,ahref)
		{
			if (!ahref){return str;}
			for (var x=0;x<ahref.length;x++)
			{
				str = str.replace(/(<a .+?<\/a>|<span.*?>.*?<\/span>)/i,"<REU"+x+"BEN />")
			}
			return str;
		}
		
		function repairLinks(str,ahref)
		{
			if (!ahref){return str;}
			for (var x=0;x<ahref.length;x++)
			{
				str = str.replace("<REU"+x+"BEN />",ahref[x])
			}
			return str;
		}
		
		
		function Format(str)
		{
			if (!str){return str;}
			var hasFormat
			for (var x=0;x<3;x++)
			{
				switch(x)
				{
					case 0:	t = "i"; break;
					case 1: t = "b"; break;
					case 2: t = "s"; break;
				}

				testFormat = str.match(FormatArray[x])
				str = str.replace(FormatArray[x],"$1<"+t+">$2</"+t+">$3")
				if (testFormat){hasFormat = true}
			}
				//no text formating
			if (!hasFormat){return str;}

			var OtagPos = /(<([ibs]))(>)/gi
			OtagCount = str.match(OtagPos)
			
				//add numbers to show position
			for (var x=0;x<OtagCount.length;x++)
			{	
				type = /(<([ibs]))(>)/i.exec(str)
				str = str.replace(/(<[ibs])(>)/i,"$1"+x+"$2")
				
				OtagRegex = new RegExp("(<\/["+type[2]+"])(>)","i")
				str = str.replace(OtagRegex,"$1"+x+"$2")
			}
				
				//make sure tags do not overlap
			var GP, GPx, GPpos, p, px
			for (var x=0;x<OtagCount.length;x++)
			{
				type = /(<([ibs]))(>)/i.exec(OtagCount[x])
				t = type[2]+x
				sPos = str.indexOf("<"+t+">")
				ePos = str.indexOf("</"+t+">")
				if (x == 0)
				{
					GP = "</"+t+">"
					GPx = x
					GPpos = ePos
					p = GPpos
					px = GPx
				}
				else
				{
					GPpos = str.indexOf(GP)
						//if start is more than end, then it is not inside the tag therefore, no parent 
					if (sPos > GPpos)
					{
						GP = "</"+t+">"
						GPx = x
						GPpos = ePos;
						p = GPpos
						px = GPx
					}
					else if ( sPos > p)
					{
						p = GPpos
						px = GPx
					}
				}

					Fixer = new RegExp("(<[ibs]"+x+">.+?)((<\/[ibs]"+x+">)|(<\/[ibs]"+px+">))","i")
					str = str.replace(Fixer,"$1</"+t+">$2")

					Remover = new RegExp("(<\/"+t+">.*)<\/"+t+">","i")
					str = str.replace(Remover,"$1")
					
						//updated string
					p = str.indexOf("</"+t+">")
					px = x
			}
			
				//remove locating numbers
			str = str.replace(/(<\/?[ibs])[0-9]+(>)/gi,"$1$2")
			return str;
		}
		
		function checkHash(str)
		{
			var hashtagTmp ='$1<a class="ot-hashtag" href="https://plus.google.com/s/%23$2" target="&blank">#$2</a>'
			var hashReg = /(\s|^|>)#(\w+)/gi
			str = str.replace(hashReg,hashtagTmp)
			return str;
		}
		
		
		function BRarray(NS)
		{
			if (lines.length == (LBR.length-1))
			{
				previewstatus = true
				for (var nbr = 0; nbr < lines.length; nbr++)
				{
				
					if (lines[nbr] == undefined){previewstatus=false;break;}
					NS = NS.replace("<b"+nbr+"r />",lines[nbr])
				}
				
				if (previewstatus){updatePreview(NS,"BRArray");}
			}
		}