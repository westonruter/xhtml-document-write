
open SRC, "xhtml-document-write.js";
$src = join '', <SRC>;
close SRC, "xhtml-document-write.js";

$header = $src;
$header =~ s{(?<=\*/).+$}{}s;
#$header = "";

open OUT, '>xhtml-document-write.min.js';

$minified = `java -jar custom_rhino.jar -c xhtml-document-write.js 2>&1`;

print OUT "$header\n\n$minified";


close OUT;