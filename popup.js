/*
	WYSIWYG by Reuben Tan


*/
var delay = 120;
var storage = chrome.storage.local;
var objects = ['save','lock']
var StorePreview, LastClick;
var BoxID;
var Locked;

$(function() 
{
	$('#copyConfirm').hide().css({'top': $('#WYSIWYG_editable').offset().top, 'left': ($('#WYSIWYG_editable').width()/4)-$('#copyConfirm').outerWidth(), 'width':'100%', 'text-align':'center'})
	
	storage.get(objects,function(item){
		if (item.save == undefined){StorePreview = ""}else{StorePreview = item.save}
		if (item.lock == undefined){;Locked = false}else{;Locked = item.lock}
		load()
	})
	
	
	function load()
	{
		$("#WYSIWYG_editable").html(StorePreview)
		WYSIWYG($("#WYSIWYG_editable"),"first start")
		RemoveSelection()

		if (Locked){$(".wysiwygLock").val("Lock");}else{$(".wysiwygLock").val("Unlock")}
		Lock($(".wysiwygLock"))
		$('#wysiwyg .proflinkWrapper').attr("contenteditable",false)

		//if (!Locked) $('#wysiwyg .proflinkWrapper').addClass("RClick")
		BlockClick()
	}

	$("#WYSIWYG_editable").scroll(function () 
	{ 
		$("#wysiwyg").scrollTop($("#WYSIWYG_editable").scrollTop());
	});
	$("#wysiwyg").scroll(function () 
	{ 
		$("#WYSIWYG_editable").scrollTop($("#wysiwyg").scrollTop());
	});	
	
	BoxID = $('#WYSIWYG_editable')
})


$('html').on("click", ".wysiwygButton, .wysiwygMenuButton, #wysiwygClose",function(e) {
	type = $(this).attr("wysiwygE");
	switch(type)
	{
		case "sel": Sel($(this)); break;
		case "lock": Lock($(this));break
		case "remsel": RemoveSelection();break;
		case "copy": copy();break;
		default: FormatSelection(type); break;
	}
	e.preventDefault();

});

function copy()
{
	var randomstring = Math.random().toString(36).slice(-8);
	var Obj = {};
	
	$("#wysiwygcopy").focus()
	$('#wysiwygcopy').val('<wysiwygcopy id="'+randomstring+'"></wysiwygcopy>'+$("#WYSIWYG_editable").html())
	copydata = $('#wysiwygcopy').val()

	Obj["pastedata"] = copydata;
	console.log(4,Obj)
	storage.set(Obj);
	var comparedata
	storage.get("pastedata",function(item){comparedata = item.pastedata})
	console.log(comparedata)
	document.execCommand('selectAll',false,null);
	document.execCommand('copy')
	$("#WYSIWYG_editable").focus()
	document.execCommand('selectAll',false,null);
	$("#copyConfirm").fadeIn(500).fadeOut(1500)
}

function placeCaretAtEnd(el) 
{
	el.focus();
	range = document.createRange();
	range.selectNodeContents(el);
	range.collapse(false);
	selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function debouncer(fn,time) 
{
	var t;
	return function(){
		var ctx = this, args = arguments;
		clearTimeout(t);
		t = setTimeout(function() 
		{
			fn.apply(ctx, args);
			clearTimeout(t)
		}, time);
	};
}

var falsePositive = false; 
$(document).on("DOMSubtreeModified", ".editable",debouncer(function(){
	id = $(this).attr("id")
	if (id == "wysiwyg")
	{
		if (!$(this).is(":focus")){return;}
		if (falsePositive){falsePositive = false; return;}
		falsePositive = true
		UpdateFormat($(this).html(),true)
		falsePositive = false

	}
	else
	{	

		if (!$(this).is(":focus") && !$(':focus').is('input')){return;}
		if (falsePositive){falsePositive = false; return;}

		falsePositive = true
		WYSIWYG($(this),"Share")
		
		$('#wysiwyg .proflinkWrapper').attr("contenteditable",false)
		BlockClick()
		falsePositive = false
	}
		
},delay));


$('html').on("paste", '.editable',function(e) {
	//disable paste by default
	//var randomstring = Math.random().toString(36).slice(-8);
	//string will prepend to text area and must match on paste also saved to storage
	data = e.originalEvent.clipboardData.getData("text/plain")
	
	$('#wysiwygcaret').remove()
	sel = window.getSelection();
	if (sel.rangeCount)
	{
		range = sel.getRangeAt(0);          
		range.deleteContents();
		var paste = document.createElement("pastecaret");
		paste.id = "wysiwygpaste";
		range.insertNode(paste);			
	}
	var DangerousHTML = ['script', 'iframe', 'frame', 'applet', 'object', 'embed', 'form']
	for (var x = 0; x < DangerousHTML.length; x++)
	{
		DangerReg = new RegExp('<'+DangerousHTML[x]+'(\\s|\\S)*?>(\\s|\\S)*?<\/'+DangerousHTML[x]+'>',"gi")
		if (DangerReg.test(data)){alert("G+ WYSIWYG: Your clipboard contained a(n) <" +DangerousHTML[x]+ "> HTML tag which can be potentially dangerous for you. It has been removed before it can do any harm.")}
		data = data.replace(DangerReg,"")
	}
	$('#wysiwygpaste').append(data).after('<wysiwygcaret id="wysiwygpastecaret"></wysiwygcaret>')
	
	data = ReverseWYSIWYG($("#wysiwygpaste").html())
	if (LastClick == "#wysiwyg")
	{
		data = data.replace(/<button .+?oid="([0-9]+?)".+?>.+?>(\+|@).+?>(.+?)<\/button>/gi,'<span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a href="https://plus.google.com/$1" class="proflink" oid="$1" target="&blank">$3</a></span>')
		data = data.replace(/<button .+?email="(.+?)".+?>.+?<\/button>/gi,'<a class="ot-hashtag" href="https://plus.google.com/s/%23$1" target="&blank">#$1</a>')
	}

	$("#wysiwygpaste").replaceWith(data);

	if ($("#wysiwygpastecaret")[0])
	{
		placeCaretAtEnd($("#wysiwygpastecaret").get(0))
		$("#wysiwygpastecaret").remove()
	}

	e.preventDefault();
	
	
})

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
	if (isOpen())
	{
		closeDialog()
		manualclose = true;
	}
	else
	{
		openDialog()
		manualclose = false;
	}
	
	event.preventDefault();
});

	function WYSIWYG(a,from)
	{

		videourl = false;


		if (from == "Updateformat"){a = $(LastClick)}
		var OldString = a.html()
		if (OldString)
		{		
			OldString = OldString.replace(/(<caret id="wysiwygcaret"><\/caret>)((<\/a>)?(<\/span>))/gi,"$2 $1")
			OldString = OldString.replace(/(<caret id="wysiwygcaret"><\/caret>)(<\/a>)/gi,"$2 $1")
			OldString = OldString.replace(/\u200B/gi,"")
			OldString = OldString.replace(/(\S)&nbsp;(\S)/gi,"$1 $2")
			CheckPreview(OldString,videourl)
		}
	}

	var isEven = function(someNumber){
		return (someNumber%2 == 0) ? true : false;
	};

function savePreview(old)
{
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

	$('#wysiwyg').html(update);

	if (LastClick == "#wysiwyg")
	{
		if (!$("#wysiwygpastecaret")[0] && $("#wysiwygcaret")[0]){
			placeCaretAtEnd($("#wysiwygcaret").get(0))
			$("#wysiwygcaret").remove();
		}

	}
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
		var italics = /([^a-z0-9]|\b)[_]([^ ]|[^ ].*?[^ ])[_]((?![^ ])|[^\w']|'c'($|\s))/gi
		var bold = /([^a-z0-9]|\B)[*]([^ ]|[^ ].*?[^ ])[*]((?![^ ])|[^\w*']|_|'c'($|\s))/gi
		var strike = /([^a-z0-9]|\B)[-]([^ ]|[^ ].*?[^ ])[-]((?![^ ])|[^\w'-]|_|'c'($|\s))/gi
		var FormatArray = [italics,bold,strike]
		var step1regex = /((\s|^|\b|[>;_*-])(((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/gi
		var S1regex = /(\s|^|\b|[;_*-])((((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/i
		var step2regex = /.+\.[A-Za-z0-9]{2,}@.*/gi;
		var step3regex = /([\s_*;-]|&nbsp;)?(.+\?[\w\/=&\[\]@#$%\*\(\+\|\\`\.;-]+(?![^<]*<\/a>))()()/gi;
		var step4regex = /([\s_*;-]|&nbsp;)?(.+\.[a-z0-9]{2,}\/[\w`@#$%\*\(\+\|\\\/{[\]~=-]*((&amp;)\w*)*([!\).:;'}]([\w`@#$%\*\(\+\|\\\/{[\]~=-]|&amp;)+)?(?![^<]*<\/a>))(.+)?/gi;
		var step5regex = /([\s_*;-]|&nbsp;)?(((ht|f)tps?:\/\/)(.+\.[a-z0-9]{2,}[#_-]*(\?\w+)?)(?![^<]*<\/a>))(.+)?/gi
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
			if (OldString.match(nbspRegex)){OldString = OldString.replace(nbspRegex,"$1 &nbsp;$2")}

			if (OldString.match(dbspRegex)){OldString = OldString.replace(dbspRegex,"&nbsp; ")}
			OldString = OldString.replace(/  /gi," &nbsp;")
			OldString = OldString.replace(/<\/button>&nbsp;/gi,"</button> ")
			if (OldString == ""){updatePreview("","empty")}
			if (!OldString && !videourl){return;}
			OldString = OldString.replace(/'/gi,"&#39;")
			OldString = OldString.replace(/<caret id="wysiwygcaret"><\/caret>/gi,"'c'")
			savePreview(OldString)

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
					if (a != b)
					{
						//console.log(0, NS)
					}
					else
					{
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
							TLBRe = LBRe
							urlT = TLBRe.split("<R"+ht+"T />")[0]

							for (var nht = 0; nht < ht; nht++)
							{
								urlT = urlT.replace("<R"+nht+"T />",links[nht])
							}

							before = urlT
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

							s5 = /([\s_*;-]+)?(.+\.[a-z]{2,3}#*(\?\w+)?)([\W_*-]+)?((?!\S)|&amp;|[^\w@-])/i
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

			for (var x=0;x<OtagCount.length;x++)
			{	
				type = /(<([ibs]))(>)/i.exec(str)
				str = str.replace(/(<[ibs])(>)/i,"$1"+x+"$2")
				
				OtagRegex = new RegExp("(<\/["+type[2]+"])(>)","i")
				str = str.replace(OtagRegex,"$1"+x+"$2")
			}
				
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

					p = str.indexOf("</"+t+">")
					px = x
			}

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
		
/*##################################################################################################################################

WYSIWYGE.js code below

##################################################################################################################################*/
var CtrL = false;
var LastClick;

var SelectionMade = false;


$(document).keydown(function(event){if (event.which=="17"){CtrL = true;}else{CtrL = false;}});

$(document).keyup(function(){

if (event.which=="17"){CtrL = false;$('#wysiwygCheck').prop("checked", false);}

});


$('html').on("mousedown, mouseup", ".editable",function(e) {
	LastClick = $(this).attr("id")
	LastClick = LastClick.replace(/([:.])/gi,"\\$1")
	LastClick = "#" + LastClick

	if (CtrL)
	{
		sel = window.getSelection();
		if (sel.type == "Range"){ReplaceText(false)}else{CtrL = false;}
	}
})


function Lock(a)
{
	var Obj = {};
	Val = a.val()
	if (Val == "Lock") 
	{
		$("#wysiwyg").attr("contenteditable",false).css("background-color","#f5f5f5")
		$(".wysiwygLock").val("Unlock")
		
		Locked = true
		BlockClick()
		
	}
	else
	{
		$("#wysiwyg").attr("contenteditable","plaintext-only").css("background-color","#FFFFFF")
		$(".wysiwygLock").val("Lock")
		Locked = false
		BlockClick()
	}
	Obj["lock"] = Locked;
	storage.set(Obj);

}

function Sel(a)
{
	Value = a.val()
	if (Value == "Hide")
	{
		$(".R").css('border', 'none')
		$(".wysiwygSel").val("Show")
	}
	else
	{
		$(".R").css('border', '1px outset #3297fd')
		$(".wysiwygSel").val("Hide")
	}
}

function Escape(str)
{
	str = str.replace(/([-\/\\^$*+?.()|[\]{}])/gi,"\$1")
	return str;
}

$('html').on("click", ".RClick",function(e) {
	e.preventDefault();
})

function BlockClick()
{
	if (Locked)
	{
		$("#wysiwyg .RClick").removeClass("RClick")	
	}
	else
	{
		
		$("#wysiwyg .proflinkWrapper").addClass("RClick")

		$("#wysiwyg .ot-anchor").each(function(){
			RType = $(this).attr("rtype")
			if (RType == "youtube")
			{
				$(this).attr("contenteditable",false).addClass("RClick")
			}
		})
	
	}
}

var RR = 0;
function ReplaceText(format)
{

	if (Locked){return;}

    var sel, range;
    var selectedText;

	SelectionMade = false
    sel = window.getSelection();
	
	if (sel.rangeCount)
	{

		if (sel.type == "Range")
		{
			SelectionMade = true;
			range = sel.getRangeAt(0);
			var container = document.createElement("div");
			for (var i = 0, len = sel.rangeCount; i < len; ++i) {
				container.appendChild(sel.getRangeAt(i).cloneContents());
			}
			selectedText = container.innerHTML;
			if (selectedText == ""){return;}
			range.deleteContents();
			wysiwygR = document.createElement("wysiwyg");
			wysiwygR.id = "R" + RR + "T";
			range.insertNode(wysiwygR);

			$(LastClick).find('#'+wysiwygR.id).append("<aRp>" + selectedText + "</aRp>");
			$(LastClick).find('#'+wysiwygR.id).addClass("R")
			RR = RR + 1
		}
	} 	

	str = $(LastClick).html()
	str = str.replace(/&nbsp;/gi," ")
	if (SelectionMade)
	{
		Inserted = $(LastClick).find('#'+wysiwygR.id).html()
		if (Inserted != undefined)
		{
			Fix = Inserted.replace(/(<wysiwyg id="(R[0-9]+?T?).+?><aRp>)/gi,"").replace(/<\/arp><\/wysiwyg>/gi,"")
			str = str.replace(Escape(Inserted),Fix)
			$(LastClick).html(str)
		}
	}

	
	$(LastClick).find(".R").each(function(e){
		id = $(this).attr("id")
		style = $(this).attr("style")
		Original = $(this)[0].outerHTML
		
		p = $(this).parent()
		inside = true
		OriginalP = p[0].localName
		arp = false;
		while (inside)
		{
			name = p[0].localName
			if (name == "arp"){arp = true}
			if (name == "div"){break;}
			if (!/\[(wysiwyg|arp|[a])\]/gi.test("["+p.parent()[0].localName+"]")){break;}
			p = p.parent()
		}

		if (!/\[(div|[ibs])\]/gi.test("["+OriginalP+"]"))
		{
			RepRegex = new RegExp('(<wysiwyg id="'+id+'".+?><aRp>)((\\S|\\s)+?)(<\/aRp><\/wysiwyg>)',"gi")
			Con = RepRegex.exec(p[0].outerHTML)
			Outer = p[0].outerHTML.replace(RepRegex,"$2")
			if (!arp){Outer = Con[1] + Outer + Con[4]}
			Outer = Replacer(Outer,style)
			str = str.replace(Escape(p[0].outerHTML),Outer)
		}
		else
		{
			Outer = Replacer(Original,style)
			str = str.replace(Escape(Original),Outer)
		}
	})
	Wrapper = str.match(/<span class="proflinkWrapper".*?>(<span class="proflinkPrefix">.<\/span>)?.+?<\/span>/gi)
	if (Wrapper != null)
	{
		for (var w=0;w<Wrapper.length;w++)
		{
			tmpW = Wrapper[w].replace(/ /gi,"&Rspace;")
			str = str.replace(Escape(Wrapper[w]),tmpW)
		}
	}
	atag = str.match(/<a href.+?>.+?<\/a>/gi)
	if (atag != null)
	{
		for (var a=0;a<atag.length;a++)
		{
			tmpA = atag[a].replace(/ /gi,"&Rspace;")
			str = str.replace(Escape(atag[a]),tmpA)
		}
	}
	str = str.replace(/<br>/gi," <br> ")

	str = str.replace(/(\S*)(<wysiwyg&Rspace;id="(R[0-9]+?T?).+?><aRp>)((\S|\s)+?)(<\/aRp><\/wysiwyg>)(\S*)/gi,"$2$1$4$7$6")
	str = str.replace(/ <br> /gi,"<br>").replace(/&Rspace;/gi," ")
	$(LastClick).html(str)
	str = $(LastClick).html()
	
	$(LastClick).find(".R").each(function(e){
		Dupe = $(this).html()
		Empty = $(this).text()
		Fix = Dupe.replace(/<wysiwyg id="(R[0-9]+?T?).+?><aRp>((\S|\s)+?)<\/aRp><\/wysiwyg>/gi,"$2")
		str = str.replace(Escape(Dupe),Fix)
		if (Empty == ""){str = str.replace('<wysiwyg id="'+$(this).attr("id")+'".+?>'+Dupe+'</wysiwyg>',"")}

	})
	$(LastClick).html(str)
	str = $(LastClick).html()
	str = str.replace(/<\/arp><\/wysiwyg>(([-_*]|\s)+)<wysiwyg id="R([0-9])+?T?".+?><aRp>/gi,"$1")
	str = str.replace(/<\/aRp><\/wysiwyg><wysiwyg id="(R[0-9]+?T?)".+?><aRp>/gi,"")
	str = str.replace(/(([-_*])+)(<wysiwyg id="R([0-9])+?T?".+?><aRp>)/gi,"$3$1")
	LineBreak = /((\s+?(&nbsp;)?)?<br>)(<\/arp><\/wysiwyg>)/gi
	str = str.replace(LineBreak,"$4$1")
	
	str = str.replace(/(<\/arp><\/wysiwyg>)/gi,"$1&#8203;")
	
	$(LastClick).html(str)
	CheckPreview($(LastClick).html())
	
	if (format){return;}
}

function Replacer(Outer,style)
{
	Outer = Outer.replace(/ /gi,"&Rspace;")
	if (/<br>/gi.test(Outer))
	{
		br = Outer.match(/<br>/gi)
		if (style == undefined){style = ""}
		for (var x=0;x<br.length;x++)
		{
			Outer = Outer.replace(/<br>/i,'</aRp></wysiwyg><brr><wysiwyg id="R'+RR+'T" class="R"'+style+'><arp>')
			RR = RR + 1
		}
		Outer = Outer.replace(/ /gi,"&Rspace;").replace(/<brr>/gi,"<br>")
	}
	return Outer;
}

RPlace = /(<wysiwyg id="(R[0-9]+?T?)".+?><aRp>)(((\S|\s)+?)<\/aRp><\/wysiwyg>)/gi
function RemoveSelection()
{
	str = BoxID.html()
	str = str.replace(RPlace,"$4")
	BoxID.html(str)
	WYSIWYG($("#WYSIWYG_editable"),"remove selection")
}
function FormatSelection(Type)
{
	if (Locked){return;}
	
	ReplaceText(true)
	str = $('#wysiwyg').html()
	str = str.replace(/<i><\/i>/gi,"")
	str = str.replace(/<b><\/b>/gi,"")
	str = str.replace(/<s><\/s>/gi,"")

	LineBreak = /((\s+?(&nbsp;)?)?<br>)(<\/arp><\/wysiwyg>)/gi
	str = str.replace(LineBreak,"$4$1")

	str = str.replace(/<wysiwyg id="(R[0-9]+?T?)".+?><aRp><\/aRp><\/wysiwyg>/gi,"")
	
	rPlace = /(<wysiwyg id="(R[0-9]+?T?)".+?><aRp>)(((\S|\s)+?)<\/aRp><\/wysiwyg>)/i

	if (!RPlace.test(str)){return;}

	var R = new Array();

	RT = str.match(RPlace)
	for (var x=0;x<RT.length;x++)
	{
		R[x] = str.match(rPlace)
		R[x] = R[x][0]
		str = str.replace(rPlace,"<R"+x+">")
	}

	Selection = str.match(/((\S|\s)*?)<R[0-9]*?>/gi)

	if (Selection == undefined){return;}

	for (var x=0;x<Selection.length;x++)
	{
		RRegex = new RegExp("<R"+x+">","gi")
		Hold = new Array();
		HSReg = /(<wysiwyg id="R([0-9])+?T?".+?><aRp>)((\S|\s)+)<\/aRp><\/wysiwyg>/gi

		Hold[x] = R[x].replace(HSReg,"$1")
		R[x] = R[x].replace(HSReg,"$3")
		SelTmp = Selection[x]
		ASel = /<[ibs]>(\S|\s)*?<R[0-9]+?>/gi

		if (ASel.test(SelTmp))
		{
			for (var y=0;y<3;y++)
			{
				switch(y)
				{
					case 0:	t = "i"; break;
					case 1: t = "b"; break;
					case 2: t = "s"; break;
				}
				SRegex = new RegExp("<"+t+">(\\S|\\s)*?<\/"+t+">","gi")
				SelTmp = SelTmp.replace(SRegex,"")
			}
		}

		var OtagPos = /(<([ibs]))(>)/gi
		Otag = SelTmp.match(OtagPos)
			if (OtagPos.test(SelTmp))
			{
				for (var xy=0;xy<Otag.length;xy++)
				{
					Otag[xy] = Otag[xy].replace(/<([ibs])>/gi,"$1")
					if (xy == 0){CloseTags = "</"+Otag[xy]+">"}else{CloseTags = "</"+Otag[xy]+">"+CloseTags}
					if (xy == 0){OpenTags = "<"+Otag[xy]+">"}else{OpenTags = OpenTags+"<"+Otag[xy]+">"}
				}
			}
			else
			{OpenTags = ""; CloseTags = "" }
			R[x] =  OpenTags + R[x] + CloseTags 
			R[x] = AddFormat(R[x],Type)
			str = str.replace(RRegex,CloseTags +Hold[x]+R[x]+"</aRp></wysiwyg>"+ OpenTags)
			OC = new RegExp(OpenTags+CloseTags,"gi")
			str = str.replace(OC,"")	
	}

	UpdateFormat(str,false)
	
	
}

function left(str,pos)
{
	return str.substr(0,pos);
}

function right(str,pos)
{
	return str.substr(0-pos,pos);
}
function AddFormat(str,t)
{

	str = Compress(str,false)
	
	if (t == "rem")
	{
		str = str.replace(/<(\/)?[ibs]>/gi,"")
		return str;
	}
	tmpStr = str
	
	AFRegex = new RegExp("(<"+t+">)(.+?)(<\/"+t+">)","gi")

	tmpStr = tmpStr.replace(AFRegex,"$3$2$1")
	tmpStr = tmpStr.replace(/<br>/gi,"<\/"+t+"><br><"+t+">")
	Q = "ibs".replace(t,"")

	FixRegex = new RegExp("<"+t+">((\\s|\\S)+?)<\/"+t+">","gi")
	FiRegex = new RegExp("<"+t+">((\\s|\\S)+?)<\/"+t+">","i")
	ll = tmpStr.match(FixRegex)
	var ki = 0;
	while (FiRegex.test(tmpStr)==true ) 
	{
		Re = FiRegex.exec(tmpStr)
		ub = Q.replace(/(.)./i,"$1")
		eN = Q.replace(/.(.)/i,"$1")
		
		bu = new RegExp("<"+ub+">(.+?)<\/"+ub+">","gi")
		Ne = new RegExp("<"+eN+">(.+?)<\/"+eN+">","gi")
		
		TagRem = Re[1].replace(bu,"<"+ub+ub+">$1</"+ub+ub+">").replace(Ne,"<"+eN+eN+">$1</"+eN+eN+">")
		
		CheckNebu = new RegExp(".*?<\/("+Q+")>.*","gi")
		CountNebu = TagRem.match(CheckNebu)
		O = ""; C = ""
		if (CheckNebu.test(TagRem))
		{
			for (var x=0;x<CountNebu.length;x++)
			{
				if (x==0)
				{
					O = CountNebu.replace(CheckNebu,"<$1>")
					C = CountNebu.replace(CheckNebu,"</$1>")
				}
				else
				{
					O = CountNebu.replace(CheckNebu,"<$1>") + O
					C = C + CountNebu.replace(CheckNebu,"<$1>")
				}
			}
		}
			
			OC = C + "<"+t+t+">" + O
			tmpStr = tmpStr.replace(FiRegex,OC + TagRem + "</"+t+t+">")
		ki++
		if (ki>=ll.length){break;}
	}

	tmpStr = tmpStr.replace(/<(\/)?ii>/gi,"<$1i>")
	tmpStr = tmpStr.replace(/<(\/)?bb>/gi,"<$1b>")
	tmpStr = tmpStr.replace(/<(\/)?ss>/gi,"<$1s>")
	

	tmpStr = "<"+t+">"+tmpStr+"</"+t+">"
	RemRegex = new RegExp("<"+t+"><\/"+t+">","gi")
	tmpStr = tmpStr.replace(RemRegex,"")
	R1Regex = new RegExp("(<"+t+">)( +)","gi")
	R2Regex = new RegExp("( +)(<\/"+t+">)","gi")
	tmpStr = tmpStr.replace(R1Regex,"$2$1").replace(R2Regex,"$2$1")
	T = "ibs".replace(t,"")
	TRegex = new RegExp("(<"+t+">)((<(\/?)["+T+"]>){1,2})(<\/"+t+">)","gi")
	tmpStr = tmpStr.replace(TRegex,"$2$1$5")
	del = new RegExp("(<[ibs]>){3}(<\/[ibs]>){3}","gi")
	tmpStr = tmpStr.replace(del,"")
	del = new RegExp("(<[ibs]>){2}(<\/[ibs]>){2}","gi")
	tmpStr = tmpStr.replace(del,"")
	tmpStr = tmpStr.replace(/((<[is]>)+?)(<\/[b]>)/gi,"$3$1")
	tmpStr = tmpStr.replace(/((<[bs]>)+?)(<\/[i]>)/gi,"$3$1")
	tmpStr = tmpStr.replace(/((<[ib]>)+?)(<\/[s]>)/gi,"$3$1")
	

	return tmpStr;
}

function FixFormat(str)
{	
	
	str = Compress(str,false)

	for (var x=0;x<3;x++)
	{
		switch(x)
		{
			case 0:	t = "i"; A = "_"; break;
			case 1: t = "b"; A = "*"; break;
			case 2: t = "s"; A = "-"; break;
		}

		ERegex = new RegExp("<"+t+">(\\S|\\s)+?<\/"+t+">","gi")
		Etag = str.match(ERegex)
		if (Etag != null)
		{
			for (var z=0;z<Etag.length;z++)
			{
				eRegex = new RegExp("<"+t+">(\\S|\\s)+?<\/"+t+">","i")
				FixRegex = new RegExp("([^"+A+"])(\\"+A+"+)([ _-]+)","gi")
				str = str.replace(eRegex,"<E"+z+"R>")

				if (FixRegex.test(Etag[z]))
				{
					Etag[z] = Etag[z].replace(FixRegex,"$1$2"+A+"$3"+A)
				}
			}
			for (var z=0;z<Etag.length;z++)
			{
				str = str.replace("<E"+z+"R>",Etag[z])
			}
		}
	}
	return ReverseFormat(str);
}



function ReverseFormat(str)
{
	str = Compress(str,true)
	aReg = /((<[is]>)+\s*)(<span class=.+?<\/a><\/span>\s*)/gi
	str = str.replace(aReg,"$3$1")
	str = str.replace(/((<[is]>)+)(\s*)/gi,"$3$1")

	BReg = /(\s*)<(span class="proflinkWrapper.+?<\/a><\/span>)((<\/[is]>)+)?/gi
	bReg = /(\s*)<(span class="proflinkWrapper.+?<\/a><\/span>)((<\/[is]>)+)?/i
	
	spanCount = str.match(BReg)
	if (spanCount !=null)
	{
		for (var xy=0;xy<spanCount.length;xy++)
		{
			b = str.match(bReg)
			tmpStr = b[0].replace(bReg,"$3$1<s$2")
			str = str.replace(Escape(b[0]),tmpStr)
		}
	}
	str = str.replace(/<sspan/gi,"<span")
	cReg = /((<[ibs]>)+\s*)(<a .+?<\/a>\s*)/gi
	str = str.replace(cReg,"$3$1")
	str = str.replace(/((<[is]>)+)(\s*)/gi,"$3$1")
	DReg = /(\s*)<(a .+?<\/a>)((<\/[ibs]>)+)?/gi
	dReg = /(\s*)<(a .+?<\/a>)((<\/[ibs]>)+)?/i
	
	aCount = str.match(DReg)
	if (aCount !=null)
	{
		for (var yx=0;yx<aCount.length;yx++)
		{
			d = str.match(dReg)
			tmpStr = d[0].replace(dReg,"$3$1<R$2")
			str = str.replace(Escape(d[0]),tmpStr)
		}
	}
	str = str.replace(/<Ra/gi,"<a")
	str = str.replace(/<i>(<s><\/s>)?(<b><\/b>)?<\/i>/gi,"")
	str = str.replace(/<s>(<i><\/i>)?(<b><\/b>)?<\/s>/gi,"")
	str = str.replace(/<b>(<i><\/i>)?(<s><\/s>)?<\/b>/gi,"")

	for (var x=0;x<3;x++)
	{
		switch(x)
		{
			case 0:	t = "i"; A = "_"; break;
			case 1: t = "b"; A = "*"; break;
			case 2: t = "s"; A = "-"; break;
		}

		ReverseRegex = new RegExp("(<"+t+">)([ ]+)","gi")
		str = str.replace(ReverseRegex,"$2$1")
		ReverseRegex = new RegExp("([ ]+)(<\/"+t+">)","gi")
		str = str.replace(ReverseRegex,"$2$1")
		ReverseRegex = new RegExp("([^a-z0-9]|\\B)<"+t+">([^ ]|[^ ](\\S|\\s)*?[^ ])<\/"+t+">((?![^ ])|[^\\w*]|_|)","gi")
		str = str.replace(ReverseRegex,"$1"+A+"$2"+A+"$4")

	}

	str = str.replace(/<\/a>( &nbsp;)+/gi,"</a>")
	str = str.replace(/(\/<\/a>)(([*_-])+)/gi,"$1 &nbsp;$2")

	check1 = /<[ibs]>/.test(str)
	check2 = /<\/[ibs]>/.test(str)
	if (check1 || check2)
	{
		console.error("Failed to reverse.")
	}
	
	return str; 
}
function Organiser(str)
{
	str = str.replace(/<i><\/i>/gi,"")
	str = str.replace(/<b><\/b>/gi,"")
	str = str.replace(/<s><\/s>/gi,"")
	str = str.replace(/<i>((\s)+?)<\/i>/gi,"$1")
	str = str.replace(/<b>((\s)+?)<\/b>/gi,"$1")
	str = str.replace(/<s>((\s)+?)<\/s>/gi,"$1")
	str = str.replace(/( +)((<\/[ibs]>)+)/gi,"$2$1")
	str = str.replace(/(<\/[ibs]>)?((<[ibs]>)+)( )+/gi,"$1$4$2")
	str = str.replace(/( +)(<\/aRp><\/wysiwyg>)/gi,"$2$1")
	str = str.replace(/(\w*?)((<[ibs]>)+)/gi,"$2$1")
	str = str.replace(/(\s+?)((<\/[ibs]>)+)/gi,"$2$1")
	str = str.replace(/(\w)&nbsp;((<\/[ibs]>)+)/gi,"$1 $2")
	return str;
}

function Compress(str,F)
{
	str = Organiser(str)
	str = str.replace(/<\/i>(((<\/[bs]>){1,2})?(<\/arp><\/wysiwyg>)?( +| +<wysiwyg id="R([0-9])+?T?".+?><aRp>)((<[bs]>){1,2})?)<i>/gi,"$1")
	str = str.replace(/<\/b>(((<\/[is]>){1,2})?(<\/arp><\/wysiwyg>)?( +| +<wysiwyg id="R([0-9])+?T?".+?><aRp>)((<[is]>){1,2})?)<b>/gi,"$1")
	str = str.replace(/<\/s>(((<\/[ib]>){1,2})?(<\/arp><\/wysiwyg>)?( +| +<wysiwyg id="R([0-9])+?T?".+?><aRp>)((<[ib]>){1,2})?)<s>/gi,"$1")

	var container = document.createElement("DIV");
	container.innerHTML = str;
	
	str = container.innerHTML;
	str = Organiser(str)
	if (F)
	{
		
		MoreComp = /(<[ibs]>(<[ibs]>)+)(.+?)(<\/[ibs]>(<\/[ibs]>)*)( +)(<[ibs]>(<[ibs]>)*)/i
		All = /(<[ibs]>(<[ibs]>)+)(.+?)(<\/[ibs]>(<\/[ibs]>)*)( +)(<[ibs]>(<[ibs]>)*)/gi
		
		var ki = 0;
		ll = str.match(All)
		while (MoreComp.test(str)==true ) 
		{		
			MC = MoreComp.exec(str)
			NStr = MC[0]
			Rem = /<(\/)?([ibs])>/gi
			Rem1 = MC[1].replace(Rem,"$2")
			Rem4 = MC[4].replace(Rem,"$2")
			Rem7 = MC[7].replace(Rem,"$2")
			z = new RegExp("["+Rem4+"]","gi")
			
			if (z.test(Rem1))
			{
				a = new RegExp("["+Rem7+"]","gi")
				Rem4a = Rem4.replace(a,"")
				b = new RegExp("["+Rem4a+"]","gi")
				Rem4b = Rem4.replace(b,"")
				c = new RegExp("["+Rem4b+"]","gi")
				Rem7 = Rem7.replace(c,"")
				d = new RegExp("["+Rem4a+"]","gi")
				Rem1 = Rem1.replace(d,"")
				Rem1 = Rem1 + Rem4a
				Rem1 = Rem1.replace(/([ibs])/gi,"<$1>")
				Rem4 = Rem4a.replace(/([ibs])/gi,"</$1>")
				Rem7 = Rem7.replace(/([ibs])/gi,"<$1>")
				NStr = NStr.replace(MoreComp,Rem1+"$3"+Rem4+"$6"+Rem7)
			}
			NStr = NStr.replace(/([ibs])>/gi,"$1$1>")
			
			str = str.replace(MC[0],NStr)
			ki++
			if (ki>=ll.length){break;}
		}
		
		str = str.replace(/[ibs]([ibs]>)/gi,"$1")

		container.innerHTML = str;
		str = container.innerHTML;
	}

	str = str.replace(/<i>(\u200B*)<\/i>/gi,"$1")
	str = str.replace(/<b>(\u200B*)<\/b>/gi,"$1")
	str = str.replace(/<s>(\u200B*)<\/s>/gi,"$1")
	str = str.replace(/(\u200B)/gi,"")
	str = str.replace(/<\/wysiwyg>/gi,"</wysiwyg>&#8203;")
	return str;
}

function ReverseWYSIWYG(str)
{
	var tmpWYSIWYG = document.createElement("DIV");
	tmpWYSIWYG.id = 'tmpWYSIWYG';
	tmpWYSIWYG.innerHTML = str;
	$('body').append(tmpWYSIWYG)

	$("#tmpWYSIWYG .proflinkWrapper").each(function(){
		a = $(this)
		oID = a.children("a").attr("oid")
		prefix = a.children(".proflinkPrefix")[0].innerText
		profile = a.children("a")[0].innerText
		BTemplate = '<button contenteditable="false" tabindex="-1" class="CfgfKe sk" oid="'+oID+'" data-token-entity="@'+oID+'" data-token-displayname="'+profile+'" data-sbxm="1"><span class="jP">'+prefix+'</span>'+profile+'</button>'
		a.replaceWith(BTemplate)
	})
	$("#tmpWYSIWYG .ot-hashtag").each(function(){
		a = $(this)
		aTmp = a[0].innerText.replace("#","")
		HashTemplate = '<button contenteditable="false" tabindex="-1" class="CfgfKe sk" email="'+aTmp+'" data-token-entity="#'+aTmp+'" data-token-displayname="'+aTmp+'" data-sbxm="1"><span class="jP">#</span>'+aTmp+'</button>'
		a.replaceWith(HashTemplate)
	})
	$("#tmpWYSIWYG").find(" .ot-anchor, .ot-timestamp").each(function(){
		a = $(this)
		RType = a.attr("rtype")
		if (RType == "youtube")
		{
			a.replaceWith(a.attr("href"))
		}
		else
		{
			a.replaceWith(a[0].innerText)
		}
	})
	str = $("#tmpWYSIWYG").html()
	$("#tmpWYSIWYG").remove();
	return str;
}

function UpdateFormat(str,bypass)
{
	if (str == undefined){str = $(LastClick).html()}
	Fixed = FixFormat(str)

	Fixed = Fixed.replace(/  /gi," &nbsp;")
	Fixed = Fixed.replace(/<wysiwyg id="(R[0-9]+?T?)".+?><aRp><\/aRp><\/wysiwyg>/gi,"")
	Fixed = Fixed.replace(/(<wysiwyg id="R[0-9]+?)T(".+?>)/gi,"$1$2")
	Fixed = ReverseWYSIWYG(Fixed)

	BoxID.html(Fixed)

	if (LastClick == "#wysiwyg" && bypass)
	{
		//$('#wysiwygcaret').remove()
		if (!$('#wysiwygpastecaret')[0] && !$('#wysiwygcaret')[0])
		{
			sel = window.getSelection();
			if (sel.rangeCount)
			{
				range = sel.getRangeAt(0);          
				range.deleteContents();
				var caret = document.createElement("caret");
				caret.id = "wysiwygcaret";
				range.insertNode(caret);			
			}
		}
		WYSIWYG($(LastClick),"Updateformat")
	}
	else
	{
		WYSIWYG(BoxID,"updateformat")
	}
	if (SelectionMade){document.getSelection().removeAllRanges();SelectionMade = false;}
}
