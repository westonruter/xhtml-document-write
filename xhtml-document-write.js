/* 
 * XHTML documment.write() Support (v1.5.1) - Parses string argument into DOM nodes
 *     appends them to the document immediately after the last loaded SCRIPT element,
 *     or to the BODY if the document has been loaded.
 *  by Weston Ruter, Shepherd Interactive <http://www.shepherd-interactive.com/>
 *  <http://weston.ruter.net/projects/xhtml-document-write/>
 * 
 * Copyright 2008, Shepherd Interactive. Licensed under GPL <http://creativecommons.org/licenses/GPL/2.0/>
 * Incorporates HTML Parser By John Resig <http://ejohn.org/files/htmlparser.js>
 * Original code by Erik Arvidsson, Mozilla Public License
 *
 * $Id$
 */

try {
	document.write('');
	//Opera doesn't seem to complain, so make it complain if XHTML
	if(window.opera && document.documentElement.namespaceURI)
		throw Error();
}
catch(e){
	(function(){
	var htmlns = 'http://www.w3.org/1999/xhtml';
	var win = window;
	var doc = document;
	
	//Keep track of when the document has been loaded
	var isDOMLoaded = false;
	function markLoaded(){
		isDOMLoaded = true;
	}
	if(doc.addEventListener)
		doc.addEventListener('DOMContentLoaded', markLoaded, false);
	if(win.addEventListener)
		win.addEventListener('load', markLoaded, false);
	if(win.attachEvent)
		win.attachEvent('onload', markLoaded);

	//Any script element IDs specified here will cause them to be ignored
	var scriptIgnoreIDs = makeMap("_firebugConsoleInjector,_firebugConsole");
	
	var parentNode;
	var lastScript;
	var parser;

	doc.write = function(str){
		//Find where new nodes will be placed
		var thisScript;
		if(!isDOMLoaded){
			//Get the last script element, the one that is calling document.write()
			var scripts = doc.getElementsByTagNameNS(htmlns, 'script');
			for(var i = scripts.length-1; i >= 0; i--){
				if(!scripts[i].id || !scriptIgnoreIDs[scripts[i].id]){
					thisScript = scripts[i];
					break;
				}
			}
			
			//Set where new nodes will be appended to
			if(!parentNode){
				parentNode = thisScript.parentNode;
			}
			
			//If we're in the same script element, then continue where left off, 
			//  but if calling from new script element, reset the parentNode.
			//  It will be better in the future to actually keep track of the 
			//  nodes in between the two script elements and to move them to be
			//  inside of any HTML fragment that had yet to be closed.
			if(thisScript != lastScript) {
				parentNode = thisScript.parentNode;
				parser = null; //destroy the parser
				lastScript = thisScript;
			}
		}
		else if(!parentNode) {
			parentNode = doc.getElementsByTagNameNS(htmlns, 'body')[0];
		}
		
		if(parser){
			parser.parse(str);
		}
		else {
			parser = new HTMLParser(str, {
				start:function(tag, attrs, unary){
					var el = doc.createElementNS(htmlns, tag);
					for(var i = 0; i < attrs.length; i++)
						el.setAttribute(attrs[i].name, attrs[i].value);
					
					parentNode.appendChild(el);
					if(!unary)
						parentNode = el;
				},
				end:function(tag){
					parentNode = parentNode.parentNode;
				},
				chars:function(text){
					if(text){
						parentNode.appendChild(doc.createTextNode(text));
					}
				},
				comment:function(text){
					parentNode.appendChild(doc.createComment(text));
				}
			});
		}
	};
	
	

	//-- Begin HTML Parser By John Resig (ejohn.org) ---------------------
	// Regular Expressions for parsing tags and attributes
	var startTag = /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/(\w+)[^>]*>/,
		attr = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
		
	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

	//document.write(): this HTMLParser function has been turned into an object which allows
	//  for incremental parsing via HTMLParser.parse(moreHTML). This conversion was done late
	//  at night so it surely has areas of stylistic and functional improvement
	var HTMLParser /*= this.HTMLParser*/ = function( html, handler ) {
		var index, chars, match, stack = [];//, last = html;
		stack.last = function(){
			return this[ this.length - 1 ];
		};
		
		//parse method added for document.write()
		this.parse = function(moreHTML){
			last = html = moreHTML;
		while ( html ) {
			chars = true;

			// Make sure we're not in a script or style element
			if ( !stack.last() || !special[ stack.last() ] ) {

				// Comment
				if ( html.indexOf("<!--") == 0 ) {
					index = html.indexOf("-->");
	
					if ( index >= 0 ) {
						if ( handler.comment )
							handler.comment( html.substring( 4, index ) );
						html = html.substring( index + 3 );
						chars = false;
					}
	
				// end tag
				} else if ( html.indexOf("</") == 0 ) {
					match = html.match( endTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						match[0].replace( endTag, parseEndTag );
						chars = false;
					}
	
				// start tag
				} else if ( html.indexOf("<") == 0 ) {
					match = html.match( startTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						match[0].replace( startTag, parseStartTag );
						chars = false;
					}
				}

				if ( chars ) {
					index = html.indexOf("<");
					
					var text = index < 0 ? html : html.substring( 0, index );
					html = index < 0 ? "" : html.substring( index );
					
					if ( handler.chars )
						handler.chars( text );
				}

			} else {
				html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
					text = text.replace(/<!--(.*?)-->/g, "$1")
						.replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

					if ( handler.chars )
						handler.chars( text );

					return "";
				});

				parseEndTag( "", stack.last() );
			}

			if ( html == last )
				throw "Parse Error: " + html;
			last = html;
		}
		};

		// Clean up any remaining tags
		//parseEndTag(); //for document.write(), do not do this!

		function parseStartTag( tag, tagName, rest, unary ) {
			if ( block[ tagName ] ) {
				while ( stack.last() && inline[ stack.last() ] ) {
					parseEndTag( "", stack.last() );
				}
			}

			if ( closeSelf[ tagName ] && stack.last() == tagName ) {
				parseEndTag( "", tagName );
			}

			unary = empty[ tagName ] || !!unary;

			if ( !unary )
				stack.push( tagName );
			
			if ( handler.start ) {
				var attrs = [];
	
				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";
					
					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});
	
				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}

		function parseEndTag( tag, tagName ) {
			// If no tag name is provided, clean shop
			if ( !tagName )
				var pos = 0;
				
			// Find the closest opened tag of the same type
			else
				for ( var pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break;
			
			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] );
				
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
		
		//This gets everything going
		this.parse(html);
	};

	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}
	//-- End HTML Parser By John Resig (ejohn.org) ---------------------
	
	})();
}