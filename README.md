<h1>XHTML <code>document.write()</code> Support</h1>

<p><em>Note: this code is very old and is no longer supported and really isn't needed since <code>application/xhtml+xml</code> is dead. This writeup and code is left here for historical reasons. Only <a href="http://westonruter.github.com/xhtml-document-write/example.xhtml">one example</a> still works due to changes in Google's API offerings. I've also stored the <a href="http://westonruter.github.com/xhtml-document-write/wordpress-comment-archive.html">old comments</a> I got on my blog post before I started redirecting here to GitHub.</em></p>

<hr>

<p><strong>Update 2008-10-10: </strong> Minor fix for "parse error" issue that arose in Firefox 3.0.3 (thanks <a href="http://regionaltraffic.co.uk/" rel="external nofollow">pinkduck</a>).</p>
<p><strong>Update 2008-06-05: </strong> Made modifications to <code>HTMLParser</code> to support more usages, <em>and</em> reverted the changes to it that turned the local variables into member properties since it wasn't necessary.</p>
<p><strong>Update 2008-06-04: </strong> Added discussion about supported usages.</p>

<p>Google's AJAX APIs provide some incredible tools which equip web developers to do some amazing things. I've lately been dazzled by the power and accuracy of their <a href="http://code.google.com/apis/ajaxlanguage/">AJAX Language API</a> and also of the performance and convenience afforded by their <a href="http://code.google.com/apis/ajaxlibs/">AJAX Libraries API</a>. The only issue I have with their APIs is that the fundamental <code>google.load()</code> function uses <code>document.write()</code> to output the necessary <code>script</code> elements to the DOM, which doesn't even appear to be necessary since <code>google.setOnLoadCallback()</code> executes after the scripts are loaded without using <code>document.write()</code> (but instead appended document with DOM methods). And the reason why using <code>document.write()</code> is bad, of course, is that it is not available when in XHTML.</p>

<p>Likewise, Google's AdSense program provides a great way for web authors to make get some compensation for their hard work. But it too relies on <code>document.write()</code> to output the necessary <code>iframe</code> element to display the advertisement. This has been <a href="http://en.wikipedia.org/wiki/AdSense#XHTML_Compatibility">well noted</a>, and a <a href="http://www.456bereastreet.com/archive/200409/content_negotiation_adsense_and_comments/">workaround</a> has been developed which utilizes the an <code>object</code> element. However, there is another solution which enables AdSense to work in XHTML without any HTML workaround, and which allows web authors to use the Google Ajax APIs in XHTML pages: simply define and implement <code>document.write()</code> yourself, as <a href="http://github.com/westonruter/xhtml-document-write/blob/master/xhtml-document-write.js">this script</a> does.</p>

<p>When I set out to do this, somehow I completely missed a <a href="http://ejohn.org/blog/xhtml-documentwrite-and-adsense/">solution</a> developed by <a href="http://ejohn.org/">John Resig</a> (one of my biggest JavaScript heroes). My solution, however, has a couple advantages as I see it. First, his solution uses some regular expression hacks to attempt to make the HTML markup well-formed enough for the browser's XML parser, but as he notes, it is not very robust. Secondly, John's solution relies on <code>innerHTML</code> which causes it to completely fail in Safari 2 (although this implementation also fails for an <a href="#xhtml-document-write-issue-safari-2">unknown reason</a>). I'm trying a different approach. Instead of using <code>innerHTML</code>, this implementation of <code>document.write()</code> parses the string argument of HTML markup into DOM nodes; if the DOM has not been completely loaded yet, it appends these DOM nodes to the document immediately after the requesting <code>script</code> element; otherwise, it appends the parsed nodes to the end of the <code>body</code>.</p>

<p>I've incorporated John Resig's own <a href="http://ejohn.org/blog/pure-javascript-html-parser/">HTML Parser</a> (via Erik Arvidsson), but I've made a couple key modifications to make it play nice with <code>document.write()</code>. I turned <code>HTMLParser</code> into a class <del>with member properties</del> in order to save the end state of the parser after all of the buffer has been processed. To this class I added a <code>parse(moreHTML)</code> method which allows additional markup to be passed into the parser for handling so that it can continue parsing from where it had finished from the previous buffer. And by removing the last <code>parseEndTag()</code> cleanup call (for <code>document.write()</code> is anything but clean), it then became possible for multiple <code>document.write()</code> calls to be made with arguments consisting of chopped up HTML fragments like just a start tag or end tag, which is exactly what AdSense does and is a common usage of the method.</p>


<h2>Browser Support</h2>
<p>This <code>document.write()</code> implementation is known to work at least in <strong>Firefox 2/3</strong>, <strong>Opera 9.26</strong>, and <strong>Safari 3</strong>. It will work in Internet Explorer, of course, since the document must be served as <code>text/html</code> to be viewed and so it will already have <code>document.write()</code>. <span id='xhtml-document-write-issue-safari-2'>For some unknown reason, this currently does <em>not</em> work in <strong>Safari 2</strong>:  the error “<samp>TypeError - Undefined value</samp>” is raised on the line of HTML where a <code>script</code> element loads <code>xhtml-document-write.js</code>. Any help would be much appreciated. As a workaround in the mean time, simply serve documents as <code>text/html</code> for Safari 2 browsers.</span></p>

<h2>Supported Usages</h2>
<p>There are three common usages of <code>document.write()</code> in the wild of HTML, and the first two are currently supported:</p>
<ol>
<li>
    <p>Outputting a well-formed HTML code fragment:</p>
    <pre><code class='js'>document.write('&lt;p>Hello &lt;i>World&lt;/i>!&lt;/p>');</code></pre>
    <p>This usage is <strong>fully supported</strong> by this implementation.</p>
</li>
<li>
    <p>Outputting a well-formed HTML code fragment spread out over multiple <em>sequential</em> function calls:</p>
<pre><code class='js'>document.write('&lt;p>');
document.write('Hello &lt;i>World&lt;/i>!');
document.write('&lt;/p>');</code></pre>
    <p>This usage is <strong>also supported</strong><!-- but will instead result in a <code>p</code> element and a text node being inserted after the <code>script</code> element. The third function call which closes the <code>p</code> element results in no action (thus the two AdSense calls, one to open an <code>iframe</code> element and the second to close it, works since the <code>iframe</code> element is empty anyway). This usage I am planning on implementing fully.--></p>
</li>
<li>
    <p><code>script</code> elements with function calls outputting HTML fragments interspersed by arbitrary HTML elements:</p>
<pre><code class='html'>&lt;script type="text/javascript">document.write('&lt;b>');&lt;/script>
Hello &lt;i>World&lt;/i>!
&lt;script type="text/javascript">document.write('&lt;/b>');&lt;/script></code></pre>
    <p>This is <strong>not supported</strong>. Instead of outputting “<b>Hello <i>World</i>!</b>”, this implementation would output one empty <code>b</code>
    element, followed by just “Hello <i>World</i>!” This usage is more difficult to support although I have an idea of how
    to do it, but I may not end up implementing it unless there is demand for it.</p>
</li>
</ol>
<p>One restriction, of course, to the use of this implementation is that the entire document must be well-formed XHTML without regard for the markup output by the calls to <code>document.write()</code>; thus you cannot do something like this (via <a href="http://ln.hixie.ch/?count=1&amp;start=1091626816">Ian Hixie</a>):</p>
<pre class='xml'><code>&lt;foo>
 &lt;script type="text/javascript" xmlns="http://www.w3.org/xhtml/1999"/>&lt;[!CDATA[
  document.write('&lt;bar>');
 ]]&gt;&lt;/script>
 &lt;/bar>
&lt;/foo>
</code></pre>

<hr>
<p>Developed by <a href="https://plus.google.com/113853198722136596993" rel="author">Weston Ruter</a> (<a href="https://twitter.com/westonruter">@westonruter</a>).</p>

