/* 
 * XHTML documment.write() Support (v1.0) - Parses provided (X)HTML string for
 *  external scripts and stylesheets and appends them to the document via DOM methods.
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
}
catch(e){
	(function(){
	var head = document.getElementsByTagName('head')[0];
	document.write = function(str){
		var elMatches = str.match(/<(script|link)([^>]*?)\/?>(?:\s*<\/\1>)?\s*$/i);
		if(!elMatches)
			throw Error("document.write() compatibility function for XHTML currently only allows external SCRIPT and LINK elements. You provided: " + str);
		var el = document.createElement(elMatches[1]);
		var attrMatches = elMatches[2].match(/(\w+)=('|")(.*?)\2/g);
		for(var i = 0; i < attrMatches.length; i++){
			var attrParts = attrMatches[i].match(/(.+?)=('|")(.*?)\2/);
			el.setAttribute(attrParts[1], attrParts[3]);
		}
		head.appendChild(el);
	}
	})();
}