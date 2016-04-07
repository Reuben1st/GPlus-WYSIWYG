var CtrL = false;
//var MouseD = false;
var Area = false;
var LastClick, LastPostID, BoxID, iframeID;
var Locked = false;
var SelectionMade = false;
var showButtons, SBLock;
var GPlusBG = "#f5f5f5";
var white = "#FFFFFF";

$(document).keydown(function(event){
	if (event.which=="17")
	{
		CtrL = true;$('#wysiwygCheck').prop("checked", true);
	}
	else
	{
		CtrL = false;$('#wysiwygCheck').prop("checked", false);
	}
});

$(document).keyup(function(){

if (event.which=="17"){CtrL = false;$('#wysiwygCheck').prop("checked", false);}

});

$('html').on("mouseenter focus", 'div[guidedhelpid="'+postSharebutton+'"]',function(e) {
	a = $(this).closest('div[guidedhelpid="'+postSharebox+'"]').find('.editable')
	str = a.html().replace(/<\/wysiwyg>(\u200B)/gi,"</wysiwyg>")
	a.html(str)
});

$('html').on("mousedown, mouseup", ".editable",function(e) {
	Area = true;
	LastClick = $(this).attr("id")
	LastClick = LastClick.replace(/([:.])/gi,"\\$1")
	LastClick = "#" + LastClick
	if (LastClick != "#wysiwyg"){LastPostID = LastClick;BoxID = $(this);}

	if (CtrL)
	{
		//MouseD = true;
		sel = window.getSelection();
		if (sel.type == "Range"){ReplaceText(false,false)}else{CtrL = false;$('#wysiwygCheck').prop("checked", false);}
		
	}
})
$(document).on("change","#wysiwygCheck", function() {
	//checked = $(this).attr("checked")
	if ($('#wysiwygCheck').is(':checked')){CtrL = true;}else{CtrL = false;}
	
});


//let users set default

//need custom editor for
//https://plus.google.com/u/0/share?
function shareboxLock(a)
{
	current = $(".wysiwygLock").val()
	
	if (a)
	{
		if ($(iframeID).attr('aria-hidden')=='true'){return}
		SBLock = true;
		$("#wysiwyg").attr("contenteditable",false).css("background-color",GPlusBG).removeClass('editable')
		$('#wysiwygDialog').find('.wysiwygButton').hide()
	}
	else
	{
		if ($(iframeID).attr('aria-hidden')!='true'){return;}
		SBLock = false;
		if (current == "Lock"){$("#wysiwyg").attr("contenteditable","plaintext-only").css("background-color",white).addClass('editable')}
		$('#wysiwygDialog').find('.wysiwygButton').show()
	}

}

function Lock(a)
{
	Val = a.val()
	if (Val == "Lock") 
	{
		$("#wysiwyg").attr("contenteditable",false).css("background-color",GPlusBG).removeClass('editable')
		$(".wysiwygLock").val("Unlock")
		Locked = true
		BlockClick()
		
	}
	else
	{
		if (!SBLock)
		{
			$("#wysiwyg").attr("contenteditable","plaintext-only").css("background-color",white).addClass('editable')
			$(".wysiwygLock").val("Lock")
			Locked = false
			BlockClick()
		}
	}

}

function Sel(a,iframe)
{
	if (iframe)
	{
		findBox = $('div[guidedhelpid="'+divIframe+'"]').find('iframe').contents()
		Value = a.val()
		if (Value == "Hide")
		{
			findBox.find(".R").css('border', 'none')
			findBox.find(".wysiwygSel").val("Show")
		}
		else
		{
			findBox.find(".R").css('border', '1px outset #3297fd')
			findBox.find(".wysiwygSel").val("Hide")
		}
		parent.Sel(parent.$('#wysiwygDialog').find('input[wysiwyge="sel"]'),false)
	}
	else
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
}

function Menu()
{
	Showing = $('.wysiwygMenuButton').attr("showing")
	var show = {"direction" : "right", "mode" : "show"};
	var hide = {"direction" : "right",  "mode" : "hide"};
	if (Showing == "main")
	{
		
		
		$('.wysiwygMainmenu').effect("slide", hide, 1000);
		$('.wysiwygSecondmenu').effect("slide", show, 1000);
		$('.wysiwygMenuButton').attr("showing","second")
		showButtons = "second"
	}
	else
	{
		$('.wysiwygSecondmenu').effect("slide", hide, 1000);
		$('.wysiwygMainmenu').effect("slide", show, 1000);
		$('.wysiwygMenuButton').attr("showing","main")
		showButtons = "first"
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

		//do not BlockClick anything except for youtube links  >>>> maybe block all
		$("#wysiwyg .ot-anchor").each(function(){
			RType = $(this).attr("rtype")
			if (RType == "youtube")//youtube
			{
				$(this).attr("contenteditable",false).addClass("RClick")
			}
		})
	
	}
}

var RR = 0;
function ReplaceText(format,iframe)
{

	if (Locked){return;}

    var sel, range;
    var selectedText;
	//var range = document.createRange();

	SelectionMade = false
	if (iframe)
	{
		sel = $(iframeID)[0].contentWindow.document.getSelection()
	}
	else
	{
      sel = window.getSelection();
	}
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
			}//else(SelectionMade = false)
		} 	

		str = $(LastClick).html()

		str = str.replace(/&nbsp;/gi," ")

		//-https://plus.go<wysiwyg id="R2T" class="R"><arp>o</arp></wysiwyg>gle.com/? -<br> 
//<wysiwyg id="R2T" class="R"><arp>-https://plus.google.com/?</arp></wysiwyg>? -<br>
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
		
		//for wrappers that get cut out
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
			//need to escape *
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

		//Sel(false)
		//if (LastClick == "#wysiwyg"){UpdateFormat($('#wysiwyg').html(),false)}

		//debounce overide
		if (InIframe)
		{
			parent.CheckPreview($(LastClick).html())
		}
		else
		{
			CheckPreview($(LastClick).html())
		}
		
		if (format){return;}
		//if (LastClick != "#wysiwyg"){UpdateFormat($('#wysiwyg').html(),false)}
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

//proflink has new class
//<span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a class="proflink aaTEdf" href="/100536257026267548175" oid="100536257026267548175">G+ WYSIWYG</a></span>

RPlace = /(<wysiwyg id="(R[0-9]+?T?)".+?><aRp>)(((\S|\s)+?)<\/aRp><\/wysiwyg>)/gi
function RemoveSelection(iframe)
{
	str = BoxID.html()
	//str = $(LastPostID).html()
	//to remove span
	str = str.replace(RPlace,"$4")
	BoxID.html(str)
	if (iframe){parent.WYSIWYG(BoxID,"Remove")}else{WYSIWYG(BoxID,"Remove")}
	
	//$(LastPostID).html(str)

}
function FormatSelection(Type,iframe)
{
	if (Locked){return;}
	
	ReplaceText(true,iframe)
	//if (iframe)
	//{
	//	str = parent.$('#wysiwyg').html()
	//}
	//else
	//{
		str = $('#wysiwyg').html()
	//}

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
					//make sure tags do not overlap
				for (var xy=0;xy<Otag.length;xy++)
				{
					Otag[xy] = Otag[xy].replace(/<([ibs])>/gi,"$1")
					//close tags in same order
					if (xy == 0){CloseTags = "</"+Otag[xy]+">"}else{CloseTags = "</"+Otag[xy]+">"+CloseTags}
					//open tags in same order
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
	else if (t != "b")
		{
		//-test <span> test- can be formatted
		// _text <span>_ will become _text <span> _
		//check i > b > i    not yet fixed
		//<i><span>...</span></i>  = <span>...</span>    not yet fixed
		//_*<span>test</span> test1 <span>test2</span>*_ needs to work
		//
		/*
			spanLenS = left(str,"<i><b><s><span class=".length)
			spanLenE = right(str,"</span></i></b></s>".length)

			a = /(<span .+?<\/a><\/span>)/gi
			b = str.match(a)
			if (b != null)
			{
				console.log("b",b)
				console.log(str)
				c = b.length
				if (c > 1)
				{
					//treat separate spans
				}
				else
				{
					//no need to test separate spans
					
					//if (spanLenS == "<span class=")
					if (!/<b><span class=/gi.test(spanLenS) && !/<\/span><\/b>/gi.test(spanLenE))
					{
						if (left(str,"<span class=".length) == "<span class=")
						{
							//span start bold
							console.log(2)
							//explanation here
							Profwrap = /(<span .+?<\/a><\/span>)/i
							console.log(str)
							str = str.replace(Profwrap,"</"+t+">$1<"+t+">")
							console.log(str)
							
						}
						else if (right(str,"</span>".length) == "</span>")
							{
								//span end bold
								console.log(3)
							//explanation here
								a = /(<span .+?<\/a><\/span>(<\/[ibs]>)*)/gi
								b = str.match(a)
								c = b[b.length-1].length
								d = str.length - c
								formatted = "</"+t+">"+b[b.length-1]+"<"+t+">"
								str = left(str,d) + formatted
							}
					}
				}
			}
			*/
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

	/*
	impossible to make *test* without it being formatted
	//check for * _ - if trying to format // make for each linebreak
	//when <b>*</b> make contenteditable = false
	hasFormat = false
	for (var x=0;x<3;x++)
	{
		switch(x)
		{
			case 0:	t = "ii"; break;
			case 1: t = "bb"; break;
			case 2: t = "ss"; break;
		}

		testFormat = str.match(FormatArray[x])
		str = str.replace(FormatArray[x],"$1<"+t+">$2</"+t+">$3")
		if (testFormat){hasFormat = true}
	}
	str = str.replace(/<(\/)?ii>/gi,"___").replace(/<(\/)?bb>/gi,"***").replace(/<(\/)?ss>/gi,"---")
	console.log(3333333,str)
	*/
	/*
	<span class="proflinkWrapper"></a></span> test <i><span class="proflinkWrapper"></a></span> test</i>
	*/
	
	//unable to have italics or strike-through on buttons without bold
	//check if hashtags work the same
	

	
	//remove formats from buttons (mentions) if italics or strike
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
	//<a rel="nofollow" class="ot-hashtag aaTEdf" href="/s/%23test">#test</a>
		//<a class="ot-hashtag" href="https://plus.google.com/s/%23test" target="_blank">#test</a>
		//<a href="https://plus.google.com/" class="ot-anchor" target="_blank" rtype="normal">https://plus.google.com/</a>
	//remove all formats from hashtags if italics or strike
		//bold works but cannot be noticed
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

		//ReverseRegex = new RegExp("<"+t+">(.+?)<\/"+t+">","gi")
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
	// Remove unused tags
	str = str.replace(/<i><\/i>/gi,"")
	str = str.replace(/<b><\/b>/gi,"")
	str = str.replace(/<s><\/s>/gi,"")
		// Remove tag from whitespace
	str = str.replace(/<i>((\s)+?)<\/i>/gi,"$1")
	str = str.replace(/<b>((\s)+?)<\/b>/gi,"$1")
	str = str.replace(/<s>((\s)+?)<\/s>/gi,"$1")
		// Reverse space
	str = str.replace(/( +)((<\/[ibs]>)+)/gi,"$2$1")
	str = str.replace(/(<\/[ibs]>)?((<[ibs]>)+)( )+/gi,"$1$4$2")
	str = str.replace(/( +)(<\/aRp><\/wysiwyg>)/gi,"$2$1")
		//include inside tag
	str = str.replace(/(\w*?)((<[ibs]>)+)/gi,"$2$1")
	
		
		//Reverse whitespace
	str = str.replace(/(\s+?)((<\/[ibs]>)+)/gi,"$2$1")
	str = str.replace(/(\w)&nbsp;((<\/[ibs]>)+)/gi,"$1 $2")
	//str = str.replace(/&nbsp;/gi," ")
	
	//str = str.replace(/(<span id="R([0-9])+?T?".+?><aRp>)((<[ibs]>)+)/gi,"$3$1")
	return str;
}

/*
<span id="R0T" class="R" style="border: 1px outset rgb(50, 151, 253);"><arp><b>test2</b></arp></span> <b>test</b>


<span id="R1T" class="R" style="border: 1px outset rgb(50, 151, 253);"><arp>test3</arp></span> 
*/

function Compress(str,F)
{
	str = Organiser(str)
	
		// Compress 1 tag
	str = str.replace(/<\/i>(((<\/[bs]>){1,2})?(<\/arp><\/wysiwyg>)?( +| +<wysiwyg id="R([0-9])+?T?".+?><aRp>)((<[bs]>){1,2})?)<i>/gi,"$1")
	str = str.replace(/<\/b>(((<\/[is]>){1,2})?(<\/arp><\/wysiwyg>)?( +| +<wysiwyg id="R([0-9])+?T?".+?><aRp>)((<[is]>){1,2})?)<b>/gi,"$1")
	str = str.replace(/<\/s>(((<\/[ib]>){1,2})?(<\/arp><\/wysiwyg>)?( +| +<wysiwyg id="R([0-9])+?T?".+?><aRp>)((<[ib]>){1,2})?)<s>/gi,"$1")
	//str = str.replace(/<\/s>(((<\/[ib]>){1,2})?( +| +<span id="R([0-9])+?".+?><aRp>)((<[ib]>){1,2})?)<s>/gi,"$1")
	
	
	
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
			
			
			//if Rem4 match 1 then closes
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

		//just incase tags overlap
		container.innerHTML = str;
		str = container.innerHTML;
	}

	
		//zero-width space
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
		//BTemplate ='<button contenteditable="false" tabindex="-1" class="sk" oid="'+oID+'" data-token-entity="@'+oID+'" data-sbxm="1"><span class="jP">'+prefix+'</span>'+profile+'</button>'
		BTemplate = '<button contenteditable="false" tabindex="-1" class="CfgfKe sk" oid="'+oID+'" data-token-entity="@'+oID+'" data-token-displayname="'+profile+'" data-sbxm="1"><span class="jP">'+prefix+'</span>'+profile+'</button>'
		a.replaceWith(BTemplate)
	})
	
	//update to current class
	//<button contenteditable="false" tabindex="-1" class="CfgfKe sk" oid="101574317575204472478" data-token-entity="@101574317575204472478" data-token-displayname="Reuben Tan" data-sbxm="1"><span class="jP">+</span>Reuben Tan</button>&nbsp; <button contenteditable="false" tabindex="-1" class="CfgfKe sk" email="fun" data-token-entity="#fun" data-token-displayname="fun" data-sbxm="1"><span class="jP">#</span>fun</button> &nbsp;<br></div>
	//<span class="proflinkWrapper"><span class="proflinkPrefix">+</span><a class="proflink aaTEdf" href="/101574317575204472478" oid="101574317575204472478">Reuben Tan</a></span>&nbsp; <a rel="nofollow" class="ot-hashtag aaTEdf" href="/s/%23fun">#fun</a>
	
	//<button contenteditable="false" tabindex="-1" class="CfgfKe sk" email="tag" data-token-entity="#tag" data-token-displayname="tag" data-sbxm="1"><span class="jP">#</span>tag</button>
	$("#tmpWYSIWYG .ot-hashtag").each(function(){
		a = $(this)
		
		//<button .+? email="hashtag".+?<\/button>
		aTmp = a[0].innerText.replace("#","")
		//get full hashtag template
		//HashTemplate = '<button contenteditable="false" email="'+aTmp+'">#'+aTmp+'</button>'
		HashTemplate = '<button contenteditable="false" tabindex="-1" class="CfgfKe sk" email="'+aTmp+'" data-token-entity="#'+aTmp+'" data-token-displayname="'+aTmp+'" data-sbxm="1"><span class="jP">#</span>'+aTmp+'</button>'
		a.replaceWith(HashTemplate)
	})
	
	//<a class="ot-timestamp" target="_blank" rtype="timestamp" href="https://www.youtube.com/watch?v=rc1XYAJCZ80#t=h0m20s">0:20</a>

	//<a rel="nofollow" target="_blank" href="https://plus.google.com/" class="ot-anchor aaTEdf">https://plus.google.com/</a>
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
//console.log(788,$(LastClick).html())
	str = $("#tmpWYSIWYG").html()
	$("#tmpWYSIWYG").remove();
	return str;
}

/*
function FormatEscape()
{
	$("#wysiwyg").children("i,b,s").each(function(){
		console.log("Escaper",$(this)[0].nodeName)
		name = $(this)[0].nodeName
		text = $(this)[0].innerText
		console.log("Escaper",text)
		if (name == "I")
		{
			if (text == "_")
			{
				$(this).attr("contenteditable",false).addClass("noEdit")
				console.log("italics")
			}
		}
		
		if (name == "B")
		{
		console.log(">"+text+"<")
			if (text == "*" || text == "*  ")
			{
				$(this).attr("contenteditable",false).addClass("noEdit")
				console.log("bold")
			}
		}
		if (name == "S")
		{
			if (text == "-")
			{
				$(this).attr("contenteditable",false).addClass("noEdit")
				console.log("strike")
			}
		}
	
	})

}
*/
function UpdateFormat(str,bypass)
{
	//if format button pushed without selection
	if (str == undefined){str = $(LastClick).html()}

	Fixed = FixFormat(str)

	Fixed = Fixed.replace(/  /gi," &nbsp;")
	Fixed = Fixed.replace(/<wysiwyg id="(R[0-9]+?T?)".+?><aRp><\/aRp><\/wysiwyg>/gi,"")
	Fixed = Fixed.replace(/(<wysiwyg id="R[0-9]+?)T(".+?>)/gi,"$1$2")

	/*
	prev = $(LastPostID).prev()
	if (Fixed != "")
	{
		if (prev.html() == "Share what's new...")
		{
			if (prev.attr("style") != "display: none;")
			{
				prev.attr("style","display: none;")
			}
		}
	}
	else
	{
		prev.removeAttr("style")
	}
	*/
	Fixed = ReverseWYSIWYG(Fixed)
	BoxID.html(Fixed)
	//$(LastPostID).html(Fixed)
	//ReverseWYSIWYG(BoxID.html())

	//if (InIframe)
	//{
	//	parent.WYSIWYG(BoxID,"updateformat iframe")
	//}
	//else 
	if (LastClick == "#wysiwyg" && bypass)
	{
		$('#wysiwygcaret').remove()
		sel = window.getSelection();
		if (sel.rangeCount)
		{
			range = sel.getRangeAt(0);          
			range.deleteContents();
			var caret = document.createElement("caret");
			caret.id = "wysiwygcaret";
			range.insertNode(caret);			
		}
		
		WYSIWYG($(LastClick),"Updateformat")
	}
	else
	{
		WYSIWYG(BoxID,"updateformat")
	}

//FormatEscape()
	//doRestore()
	if (SelectionMade){document.getSelection().removeAllRanges();SelectionMade = false;}

	//$("#AntiFocus").focus()
	//console.log(Finish - Start+"ms")
}
