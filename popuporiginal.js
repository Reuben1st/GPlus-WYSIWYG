var storage = chrome.storage.local;
var delay = 120;
$(function() 
{
	$('#copyConfirm').hide().css({'top': $("#WYSIWYG_editable").offset().top, 'left': $("#WYSIWYG_editable").offset().left, 'width':'100%', 'text-align':'center'})
	var newsave
	storage.get("save",function(item){
		if (item.save == undefined){newsave = ""}else{newsave = item.save}
		load()
	})
	
	function load()
	{
		$("#WYSIWYG_editable").html(newsave)
	}
	
	$("#WYSIWYG_editable").scroll(function () 
	{ 
		$("#wysiwyg").scrollTop($("#WYSIWYG_editable").scrollTop());
	});
	$("#wysiwyg").scroll(function () 
	{ 
		$("#WYSIWYG_editable").scrollTop($("#wysiwyg").scrollTop());
	});	
});

$('html').on("DOMSubtreeModified", "#WYSIWYG_editable",debouncer(function(e) {
	a = $(this).html()
	b = /<a.+?>(.+?)<\/a>/gi
	if (a.match(b))
	{
		$("#WYSIWYG_editable").html(a.replace(b,"$1"))
	}
	
	CheckPreview($(this).html())
},delay));

function debouncer(fn, time) {
	var t = 0;
	return function() {
		var ctx = this, args = arguments;

		clearTimeout(t);
		t = setTimeout(function() {
			
			fn.apply(ctx, args);
			clearTimeout(t)
		}, time); 
	};
}

$('html').on("click", "button#clear",function(e) {
	$("#WYSIWYG_editable").html("")
});

$('html').on("click", "button#copy",function(e) {
	$("#WYSIWYG_editable").focus()
	document.execCommand('selectAll',false,null);
	document.execCommand('copy')
	$("#copyConfirm").fadeIn(500).fadeOut(1500)
});

function savePreview()
{
	var Obj = {};
	Obj["save"] = $("#WYSIWYG_editable").html();
	storage.set(Obj);
}
function updatePreview(update,from)
{
	update = update.replace(/&blank/gi,"_blank")
	savePreview()
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
	$('#wysiwyg').html(update);	
}

function strip(html)
{
	var tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent||tmp.innerText;
}

		var vidTmp, videostring 
		var italics = /([^a-z0-9]|\b)[_]([^ ]|[^ ].*?[^ ])[_]((?![^ ])|\W)/gi
		var bold = /([^a-z0-9]|\B)[*]([^ ]|[^ ].*?[^ ])[*]((?![^ ])|[^\w*]|_)/gi
		var strike = /([^a-z0-9]|\B)[-]([^ ]|[^ ].*?[^ ])[-]((?![^ ])|[^\w-]|_)/gi
		var FormatArray = [italics,bold,strike]

			//step 1 - starts with http/https/www. until first whitespace etc.
		var step1regex = /((\s|^|\b|[>;_*-])(((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;'}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/gi
		var S1regex = /((\s|^|\b|[>;_*-])(((ht|f)tps?:\/\/(www.)?|www.|\b)([\.\w:@-]+)(\.)[a-z0-9]{2,}[\/=a-z0-9\?:&\(\.\*%@#;$+|{~\[\]_\\-]*([\)!:;'}]([=\[\]\w|\*.]|&amp;)+(\\+)?)?)(?![^<]*<\/a>))/i
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

		var HTTPTemplate = '$1<a href="$2" class="ot-anchor" target=&blank><displayurl</a>';
		var youtubeTemplate = '<a href="<urlhere" class="ot-anchor" target=&blank><titlehere</a>';
		var emailTemplate = '$1<a href="mailto:$3" class="ot-anchor">$3</a>$8'
		vidTemplate = '<a class="ot-timestamp" target="&blank" href="<urlhere#t=<timehere"><displayhere</a>';
		
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
				//G+ sometimes merges two spaces E.g "m  _" would be "m&nbsp;_" &nbsp; will only be used if not followed by another character
			if (OldString.match(nbspRegex)){OldString = OldString.replace(nbspRegex,"$1 &nbsp;$2")}
				//G+ turns two spaces into "&nbsp;  " of "  &nbsp;"
			if (OldString.match(dbspRegex)){OldString = OldString.replace(dbspRegex,"&nbsp; ")}
			
			if (OldString == ""){updatePreview("","empty")}
			if (!OldString && !videourl){return;}
			var tagregex = /<span style="white-space: nowrap;" data-sbxm="1">(.)<span class=".+?"><span>(.+?)<\/span>.*?<\/span><\/span>/g;
			var tagTmp = OldString.match(tagregex)
			
			if (tagTmp)
			{
				tagCounter = 0
				tag = tagTmp[0].replace(tagregex,"$1$2")
				OldString = OldString.replace(tagregex,tag)
			}

			NewString = OldString;
			
			NS = NewString
			
			checkBR(NS);	
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
					LBRe = LBRe.replace(S1regex,"<R"+tht+"T />")
				}
				
				for (var ht = 0; ht < HTTP.length; ht++)
				{
					HTTPMatch = HTTP[ht].replace(S1regex,"$1")
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
						httpregex = /(\s|[_*-])?((ht|ft)tps?:\/\/.+)/i
						if (url.match(httpregex))
						{
							urlTmp = url.replace(httpregex,"$1$2")
						}
						else 
						{
							urlTmp = url.replace(/(\s|[_*-])?(.+)/i,"$1http://$2")
						}
						
						s5 = /(\s|[_*-])?(.+)((?!\S)|&amp;|[^\w@-])/i

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
			ahref = str.match(/(<a.+?<\/a>|<span.*?>.*?<\/span>)/gi)
			return ahref;
		}
		
		function tmpLinks(str,ahref)
		{
			if (!ahref){return str;}
			for (var x=0;x<ahref.length;x++)
			{
				str = str.replace(/(<a.+?<\/a>|<span.*?>.*?<\/span>)/i,"<REU"+x+"BEN />")
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
						//if start is more than end, then not inside tag therefore, no parent 
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