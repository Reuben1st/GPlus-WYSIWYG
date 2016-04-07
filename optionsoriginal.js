
var storage = chrome.storage.local;
var originalwidth = 30
var originalheight = 35
var originalwidthd = "percent"
var originalheightd = "percent"
var originalslider = 1

//minimum width is 260px or 260 / window width
//maximum width is 65% or 65 * window width
//minimum height is 135px or 135 / window height
//maximum height is 95% or 95 * window height
$(function(){


	$('html').on("dblclick", "a.wysiwyg",function(e) {
		$("#dialogpreview").dialog('option', 'position', 'center');
		event.preventDefault();
	});
	
	$('html').on("click", "a.wysiwyg",function(e) {
		var isOpen = $( "#dialogpreview" ).dialog( "isOpen" );
		if (isOpen)
		{
			$("#dialogpreview").dialog("close");
			manualclose = true;
		}
		else
		{
			$("#dialogpreview").dialog("open");
			manualclose = false;
		}
		
		event.preventDefault();
	});

	$('html').on('change','select',function(e) {
		wTest = checkerror("width")
		hTest = checkerror("height")
		
		if (wTest || hTest){return;}
		changedialog($(this))	
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
		$('#width').val(originalwidth)
		$('#height').val(originalheight)
		document.getElementById("widthd").selectedIndex = 1; 
		document.getElementById("heightd").selectedIndex = 1;
		$('.slider').slider('value', originalslider);
		$('.ui-dialog').css('opacity', originalslider);
		changedialog($("#width"))
		changedialog($("#height"))
	});
	
	$('html').on('click', '#current',function(e) {
		$('#width').val(Math.round($('.ui-dialog').width()))
		$('#height').val(Math.round($('.ui-dialog').height()))
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
			
			if (name == "autoopen" || name == "automove")
			{
				value = $(this).prop('checked')
			}
			else if (name == "slider")
			{
				value = $('.slider').slider("option", "value");
			}
			else
			{
				value = $(this).attr('value')
			}
			Obj[name] = value;
			storage.set(Obj);
		})
		$("#savemsg").fadeIn(500).fadeOut(1500)
	});
	
	var objects = ['autoopen','automove','width','widthd','height','heightd','slider']
	var newwidth, newwidthd, newheight, newheightd, wWidth, pWidth, wHeight, pHeight, newslider
	storage.get(objects,function(item){
		if (item.autoopen == undefined){checkbox = true}else{checkbox = item.autoopen}
		document.getElementById("autoopen").checked = checkbox;
		if (item.automove == undefined){checkboxm = true}else{checkboxm = item.automove}
		document.getElementById("automove").checked = checkboxm;
		
		if (item.width == undefined){newwidth = originalwidth}else{newwidth = item.width}
		if (item.widthd == undefined){newwidthd = originalwidthd}else{newwidthd = item.widthd}
		if (item.height == undefined){newheight = originalheight}else{newheight = item.height}
		if (item.heightd == undefined){newheightd = originalheightd}else{newheightd = item.heightd}
		if (item.slider == undefined){newslider = originalslider}else{newslider = item.slider}
		load()
	})
		
	function load()
	{
		if (newwidthd == "percent")
		{	
			wWidth = $(window).width();
			pWidth = wWidth * newwidth / 100 ; 
			wOpt = 1
		}
		else
		{
			pWidth = newwidth
			wOpt = 0
		}
		
		if (newheightd == "percent")
		{	
			wHeight = $(window).height();
			pHeight = wHeight * newheight / 100 ; 
			hOpt = 1
		}
		else
		{
			pHeight = newheight
			hOpt = 0
		}

		$('#dialogpreview').dialog({
			title: "G+ WYSIWYG",
			buttons: [{ text: "Preview"},{ text: "Clear" }],
			autoOpen: true,
			open: function() {
				$('.ui-dialog-titlebar').append('<div id="wysiwyg_stats">Words: <span id="wysiwyg_words">0</span> Chars: <span id="wysiwyg_chars">0</span></div>');
				$(".ui-button-text-only").attr('title', 'This button is disabled on this page.');
				$('.antifocus').focus()},
			beforeClose: function( event, ui ) {$('#wysiwyg_stats').remove()},
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
		$(".ui-dialog-buttonset").prepend('<div id="slider2" class="slider" style="width:90%;"></div>')	

		$("#defaultoptions").append('<table><tr><td>Default Width: </td><td><input id="width" name="width" value="'+newwidth+'" class="dimensions data" /></td><td><select id="widthd" name="widthd" class="width data"><option value="pixel">px</option><option value="percent">%</option></select></td><td><div id="widtherror"></div></td></tr><tr><td>Default Height: </td><td><input id="height" name="height" value="'+newheight+'" class="dimensions data"/></td><td><select id="heightd" name="heightd" class="height data"><option value="pixel">px</option><option value="percent">%</option></select></td><td><div id="heighterror"></div></td></tr><tr><td>Transparency:</td></tr><tr><td colspan=3><div class="slider data" name="slider" id="slider1"></div></td></tr><tr><td><button value="current" name="current" id="current">Set Current</button></td><td><button value="original" name="original" id="original">Set Original</button></td><td><button value="save" name="save" id="save">Save</button></td></tr><tr><td colspan=2><div id="savemsg">Settings saved.</div></td></tr></table>')
		$("#savemsg").hide()
		ver = chrome.app.getDetails().version;
		$("#version").html(ver)
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
				$('.ui-dialog').css('opacity', newslider);
				$('.antifocus').focus();
			}
		});
		
		$("#slider1").slider({
			slide: function(event, ui) { 
				$("#slider2").slider("value", ui.value );
				$('.ui-dialog').css('opacity', ui.value);
				$('.antifocus').focus();
			}
		});

		$("#slider2").slider({
			slide: function(event, ui) { 
				$("#slider1").slider("value", ui.value );
				$('.ui-dialog').css('opacity', ui.value);
				$('.antifocus').focus();
			}
		});
	
	}
	
	
	var imgURL = chrome.extension.getURL("images/WYSIWYG.png");
	var community = chrome.extension.getURL("images/community.png");
	$('body').append('<a href="#" class="wysiwyg" title="WYSIWYG"><img src='+imgURL+' style="height:100%; width:100%; "  /></a>')
	$('#community').append('<a href="https://plus.google.com/communities/109567494358576439345" title="WYSIWYG Community" target="_blank"><img src='+community+' style="height:33px; width:323px; "  /></a>')
});

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
		$('#dialogpreview').dialog('option', input, val);
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
			if (v < 260){error("width","min",260); return true;}
			if (v > pWidthMax){error("width","max",pWidthMax); return true;}
		}
		else
		{
			pWidthMin = (Math.round(260 / wWidth * 100)); 
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
			if (h < 135){error("height","min",135); return true;}
			if (h > pHeightMax){error("height","max",pHeightMax); return true;}
		}
		else
		{
			pHeightMin = (Math.round(135/ wHeight * 100)); 
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
