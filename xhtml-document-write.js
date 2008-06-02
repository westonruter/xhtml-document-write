/* 
 * XHTML documment.write() Support (v1.1.2) - Parses string argument into DOM nodes
 *  appends them to the document immediately after the last loaded SCRIPT element
 *  or if the document has been loaded then it appends all new nodes to the BODY.
 *  <http://shepherd-interactive.googlecode.com/svn/trunk/xhtml-document-write/demo.xhtml>
 *  by Weston Ruter, Shepherd Interactive <http://www.shepherd-interactive.com/>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * $Id$
 * Copyright 2008, Shepherd Interactive. All rights reserved.
 *
 */


try {
	document.write('');
	if(window.opera && document.documentElement.namespaceURI) //Opera doesn't seem to complain, so make it complain
		throw Error();
}
catch(e){
	(function(){
	//Keep track of when the document has been loaded
	var isDOMLoaded = false;
	function markLoaded(){
		isDOMLoaded = true;
	}
	if(document.addEventListener)
		document.addEventListener('DOMContentLoaded', markLoaded, false);
	if(window.addEventListener)
		window.addEventListener('load', markLoaded, false);
	if(window.attachEvent)
		window.attachEvent('onload', markLoaded);
		
	var htmlns = 'http://www.w3.org/1999/xhtml';
	
	//Providing a rudamentary HTML parser if John Resig's is not provided
	var _HTMLParser;
	if(!window.HTMLParser){ //Safari 3: strangely HTMLParser is undefined, but window.HTMLParser is not
		_HTMLParser = function(html, handler){
			if(/^\s*<\//.test(html)) //temporary hack to get AdSense to work while getting full HTMLParser to work
				return;
			var elMatches = html.match(/<(\w+)([^>]*?)\/?>(?:\s*<\/\1>)?\s*$/i);
			if(!elMatches){
				throw Error("In order to use this document.write() XHTML implementation with elements other than SCRIPT and LINK, you must include John Resig's HTML Parser library. String provided: " + html);
			}
			var tagName = elMatches[1];
			var attrMatches = elMatches[2].match(/(\w+)=('|")(.*?)\2/g);
			var attrs = [];
			if(attrMatches){
				for(var i = 0; i < attrMatches.length; i++){
					var attrParts = attrMatches[i].match(/(.+?)=('|")(.*?)\2/);
					attrs.push({name:attrParts[1], value:attrParts[3]})
				}
			}
			if(handler.start)
				handler.start(tagName, attrs);
		}
	}
	else {
		_HTMLParser = window.HTMLParser;
	}
	

	
	document.write = function(htmlStr){
		var head = document.getElementsByTagNameNS(htmlns, 'head')[0];
		var body = document.getElementsByTagNameNS(htmlns, 'body')[0];
		
		//Find where new elements will be placed
		var parentNode = body ? body : head;
		var refNode = null;
		if(!isDOMLoaded){
			var scripts = document.getElementsByTagNameNS(htmlns, 'script');
			refNode = scripts[scripts.length-1];
			parentNode = refNode.parentNode;
		}
		
		_HTMLParser(htmlStr, {
			start:function(tag, attrs, unary){
				var el = document.createElementNS(htmlns, tag);
				for(var i = 0; i < attrs.length; i++)
					el.setAttribute(attrs[i].name, attrs[i].value);
				//console.info(el.namespaceURI + ' ' + el.src + ' ' + el.type)
				parentNode.appendChild(el); //(tag == 'script' ? head : parentNode)
				if(!unary)
					parentNode = el;
			},
			end:function(tag){
				parentNode = parentNode.parentNode;
			},
			chars:function(text){
				parentNode.appendChild(document.createTextNode(text));
			},
			comment:function(text){
				parentNode.appendChild(document.creatCommentNode(text));
			}
		});
	}
	
	})();
}