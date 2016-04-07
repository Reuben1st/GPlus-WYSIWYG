
var storage = chrome.storage.local;
var originalwidth = 30
var originalheight = 35
var originalwidthd = "percent"
var originalheightd = "percent"
var originalslider = 1

var minWidth = 400;
var minHeight= 170;

var GPlusBG = "#f5f5f5";
var white = "#FFFFFF";

var objects = ['autoopen','automove','autotrans','editorlock','width','widthd','height','heightd','slider']
var newwidth, newwidthd, newheight, newheightd, wWidth, pWidth, wHeight, pHeight, newslider
var wOpt, hOpt;

//minimum width is 260px or 260 / window width
//maximum width is 65% or 65 * window width
//minimum height is 135px or 135 / window height
//maximum height is 95% or 95 * window height

$(function(){
	var imgURL = chrome.extension.getURL("images/WYSIWYG.png");
	var community = chrome.extension.getURL("images/community.png");
	$('body').append('<a href="#" class="wysiwyg" title="WYSIWYG"><img src='+imgURL+' style="height:100%; width:100%; "  /></a>')
	$('#community').append('<a href="https://plus.google.com/communities/109567494358576439345" title="WYSIWYG Community" target="_blank"><img src='+community+' style="height:33px; width:323px; "  /></a>')
});

$('html').on("dblclick", "a.wysiwyg",function(e) {
	//$("#dialogpreview").dialog('option', 'position', 'center');
	e.preventDefault();
});

$('html').on("click", "a.wysiwyg",function(e) {
	var isOpen = $( "#dialogpreview" ).dialog( "isOpen" );
	if (isOpen)
	{
		//$("#dialogpreview").dialog("close");
		manualclose = true;
	}
	else
	{
		//$("#dialogpreview").dialog("open");
		manualclose = false;
	}
	
	e.preventDefault();
});

$('html').on('change','.width, .height',function(e) {
	wTest = checkerror("width")
	hTest = checkerror("height")
	
	if (wTest || hTest){return;}
	changedialog($(this))	
})
$('html').on('change','.editorlock',function(e) {
	Lock()
})
function Lock()
{
	val = $('.wysiwygLock').val()
	console.log(99)
	if (val == "Lock")
	{
		$("#wysiwyg").attr("contenteditable",false).css("background-color",GPlusBG).removeClass('editable')
		$(".wysiwygLock").val("Unlock")
		a = 1
	}
	else
	{
		$("#wysiwyg").attr("contenteditable","plaintext-only").css("background-color",white).addClass('editable')
		$(".wysiwygLock").val("Lock")
		a = 0
	}
	return a;
}
$('html').on('click','.wysiwygLock',function(e) {
	a = Lock()
	
	document.getElementById("editorlock").selectedIndex = a;
})

$('html').on('keyup','input.dimensions',function(e) {
	wTest = checkerror("width")
	hTest = checkerror("height")

	if (wTest || hTest){return;}
	changedialog($(this))
})

$('html').on('click', '#original',function(e) {
	document.getElementById("autoopen").checked = true;
	document.getElementById("automove").checked = true;
	document.getElementById("autotrans").checked = true;
	document.getElementById("editorlock").selectedIndex = 0; 
	$('#width').val(originalwidth)
	$('#height').val(originalheight)
	document.getElementById("widthd").selectedIndex = 1; 
	document.getElementById("heightd").selectedIndex = 1;
	$('.slider').slider('value', originalslider);
	$('#wysiwygDialog').css('opacity', originalslider);
	changedialog($("#width"))
	changedialog($("#height"))
});

$('html').on('click', '#current',function(e) {
	$('#width').val(Math.round($('#wysiwygDialog').width()))
	$('#height').val(Math.round($('#wysiwygDialog').height()))
	document.getElementById("widthd").selectedIndex = 0; 
	document.getElementById("heightd").selectedIndex = 0; 
});

$('html').on('click', '#save',function(e) {
	wTest = checkerror("width")
	hTest = checkerror("height")
	
	if (wTest || hTest){return;}
	
	var Obj = {};
	$('.data').each(function(e) {
		name = $(this).attr('name')
		switch(name)
		{
			case "autoopen": case "automove": case "autotrans": value = $(this).prop('checked'); break;
			case "slider": value = $('.slider').slider("option", "value");; break;
			default: value = $(this).val(); break;
		}

		Obj[name] = value;
		storage.set(Obj);
	})
	$("#savemsg").fadeIn(500).fadeOut(1500)
});


storage.get(objects,function(item){
	if (item.autoopen == undefined){checkbox = true}else{checkbox = item.autoopen}
	document.getElementById("autoopen").checked = checkbox;
	if (item.automove == undefined){checkboxm = true}else{checkboxm = item.automove}
	document.getElementById("automove").checked = checkboxm;
	if (item.autotrans == undefined){checkboxtrans = true}else{checkboxtrans = item.autotrans}
	document.getElementById("autotrans").checked = checkboxtrans;
	if (item.editorlock == undefined){unlockstatus = true}else{unlockstatus = item.editorlock == "unlock"}
	
	if (unlockstatus){a=0}else{a=1}
	document.getElementById("editorlock").selectedIndex = a; 
	
	if (item.width == undefined){newwidth = originalwidth}else{newwidth = item.width}
	if (item.widthd == undefined){newwidthd = originalwidthd}else{newwidthd = item.widthd}
	if (item.height == undefined){newheight = originalheight}else{newheight = item.height}
	if (item.heightd == undefined){newheightd = originalheightd}else{newheightd = item.heightd}
	if (item.slider == undefined){newslider = originalslider}else{newslider = item.slider}
	load()
})

function getDimensions(a)
{
	if (a)
	{
		w = $('#width').val()
		wd = $('#widthd').val()
		h = $('#height').val()
		hd = $('#heightd').val()
	}
	else
	{
		w = newwidth
		wd = newwidthd
		h = newheight
		hd = newheightd
	}
	if (wd == "percent")
	{	
		wWidth = $(window).width();
		pWidth = wWidth * w / 100 ; 
		wOpt = 1
	}
	else
	{
		pWidth = w
		wOpt = 0
	}
	
	if (hd == "percent")
	{	
		wHeight = $(window).height();
		pHeight = wHeight * h / 100 ; 
		hOpt = 1
	}
	else
	{
		pHeight = h
		hOpt = 0
	}

	if (pHeight < minHeight){pHeight = minHeight;}
	if (pWidth < minWidth){pWidth = minWidth;}
	
	$('#wysiwygDialog').outerHeight(pHeight);
	$('#wysiwygDialog').outerWidth(pWidth);

	dialogResize()

}

function load()
{
	
	getDimensions(false)
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
	
	$("#defaultoptions").append('<table><tr><td>Default Width: </td><td><input id="width" name="width" value="'+newwidth+'" class="dimensions data" /></td><td><select id="widthd" name="widthd" class="width data"><option value="pixel">px</option><option value="percent">%</option></select></td><td><div id="widtherror"></div></td></tr><tr><td>Default Height: </td><td><input id="height" name="height" value="'+newheight+'" class="dimensions data"/></td><td><select id="heightd" name="heightd" class="height data"><option value="pixel">px</option><option value="percent">%</option></select></td><td><div id="heighterror"></div></td></tr><tr><td>Transparency:</td></tr><tr><td colspan=3><div class="slider data" name="slider" id="slider1"></div></td></tr><tr><td><button value="current" name="current" id="current">Set Current</button></td><td><button value="original" name="original" id="original">Set Original</button></td><td><button value="save" name="save" id="save">Save</button></td></tr><tr><td colspan=2><div id="savemsg">Settings saved.</div></td></tr></table>')
	//transparent option
	
	
	$("#savemsg").hide()
	//ver = chrome.app.getDetails().version;
	//$("#version").html(ver)
	document.getElementById("widthd").selectedIndex = wOpt; 
	document.getElementById("heightd").selectedIndex = hOpt; 
	
	$('.slider').slider
	({ 
		addClass: 'data',
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
		}			
	});
	
	$("#slider1").slider({
		slide: function(event, ui) { 
			$("#slider2").slider("value", ui.value );
			$('#wysiwygDialog').css('opacity', ui.value)
		}
	});

	$("#slider2").slider({
		slide: function(event, ui) { 
			$("#slider1").slider("value", ui.value );
			$('#wysiwygDialog').css('opacity', ui.value)
		}
	});

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
	
	getDimensions(true)
	
});

function placeCaretAtEnd(el) {
	el.focus();
	range = document.createRange();
	range.selectNodeContents(el);
	range.collapse(false);
	selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function dialogResize()
{
	
	
	hb = $('#wysiwyg').outerHeight();
	ha = $('#wysiwyg').height();
	hd = $('#wysiwygDialog').outerHeight();
	hh = $('#wysiwygHeader').outerHeight();
	hf = $('#wysiwygFooter').outerHeight();
	wd = $('#wysiwygDialog').outerWidth();
	wh = wd-10;

	$('#wysiwyg').outerHeight(hd-(hh+hf+(hb-ha)+5))
	$('#wysiwyg').outerWidth(wh)
	$('#wysiwygHeader').outerWidth(wh)
	$('#wysiwygFooter').outerWidth(wh)
}

function changedialog(t)
{
		input = t.attr('name')
		if (input == "widthd" || input == "heightd")
		{
			inputd = $("#"+input).val()
			if (input == "widthd"){tv = "#width"; input = "width"}else{tv = "#height"; input = "height"}
		}
		else
		{
			inputd = $("#"+input+"d").val()
			if (input == "width"){tv = "#width"}else{tv = "#height"}
		}
		
		if (inputd == "pixel")
		{
			val = $(tv).val()
		}
		else
		{
			if (input == "width")
			{
				w = $(window).width();
			}
			else
			{
				w = $(window).height();
				
			}
			val = $(tv).val() * w / 100
		}
		if (input == "height"){$('#wysiwygDialog').outerHeight(val)}
		if (input == "width"){$('#wysiwygDialog').outerWidth(val)}
		dialogResize()
}


function checkerror(d)
{
	wWidth = $(window).width();
	wHeight = $(window).height();

	if (d == "width")
	{
		v = $('#width').val()
		var isnum = /^\d+$/.test(v);
		if (!isnum){error("width","num",""); return true;}
		if ($('#widthd').val() == "pixel")
		{
			pWidthMax = (Math.round(wWidth * 0.65)); 
			if (v < minWidth){error("width","min",minWidth); return true;}
			if (v > pWidthMax){error("width","max",pWidthMax); return true;}
		}
		else
		{
			
			pWidthMin = (Math.round(minWidth / wWidth * 100)); 
			if (v < pWidthMin){error("width","minp",pWidthMin); return true;}
			if (v > 75){error("width","maxp",75); return true;}
		}
		$("#widtherror").html('')
		$("#widtherror").removeClass('ui-state-error')
		return false
	}
	else
	{
		h = $('#height').val()
		var isnum = /^\d+$/.test(h);
		if (!isnum){error("height","num",""); return true;}
		if ($('#heightd').val() == "pixel")
		{
			pHeightMax = (Math.round(wHeight * 0.95));
			if (h < minHeight){error("height","min",minHeight); return true;}
			if (h > pHeightMax){error("height","max",pHeightMax); return true;}
		}
		else
		{
			pHeightMin = (Math.round(minHeight/ wHeight * 100)); 
			if (h < pHeightMin){error("height","minp",pHeightMin); return true;}
			if (h > 95){error("height","maxp",95); return true;}
		}
		$("#heighterror").html('')
		$("#heighterror").removeClass('ui-state-error')
		return false;
	}
}

function error(dimension, type, val)
{
	switch(type)
	{
		case "min": a = " minimum "; b = "px"; break;
		case "max": a = " maximum "; b = "px"; break;
		case "minp": a = " minimum "; b = "%"; break;
		case "maxp": a = " maximum "; b = "%"; break;
	}
	if (type == "num")
	{
		$("#"+dimension+"error").html("Please enter a value.")
	}
	else
	{
		$("#"+dimension+"error").html("The"+a+dimension+" is "+val+b)
	}
	$("#"+dimension+"error").addClass('ui-state-error')
}
