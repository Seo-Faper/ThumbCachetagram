"use strict";(self.webpackChunkthumbcachetagram=self.webpackChunkthumbcachetagram||[]).push([[3047],{595:e=>{function n(e){!function(e){function n(e,n){return"___"+e.toUpperCase()+n+"___"}Object.defineProperties(e.languages["markup-templating"]={},{buildPlaceholders:{value:function(t,a,r,o){if(t.language===a){var c=t.tokenStack=[];t.code=t.code.replace(r,(function(e){if("function"===typeof o&&!o(e))return e;for(var r,u=c.length;-1!==t.code.indexOf(r=n(a,u));)++u;return c[u]=e,r})),t.grammar=e.languages.markup}}},tokenizePlaceholders:{value:function(t,a){if(t.language===a&&t.tokenStack){t.grammar=e.languages[a];var r=0,o=Object.keys(t.tokenStack);!function c(u){for(var i=0;i<u.length&&!(r>=o.length);i++){var s=u[i];if("string"===typeof s||s.content&&"string"===typeof s.content){var g=o[r],l=t.tokenStack[g],p="string"===typeof s?s:s.content,f=n(a,g),k=p.indexOf(f);if(k>-1){++r;var h=p.substring(0,k),m=new e.Token(a,e.tokenize(l,t.grammar),"language-"+a,l),d=p.substring(k+f.length),y=[];h&&y.push.apply(y,c([h])),y.push(m),d&&y.push.apply(y,c([d])),"string"===typeof s?u.splice.apply(u,[i,1].concat(y)):s.content=y}}else s.content&&c(s.content)}return u}(t.tokens)}}}})}(e)}e.exports=n,n.displayName="markupTemplating",n.aliases=[]}}]);
//# sourceMappingURL=react-syntax-highlighter_languages_refractor_markupTemplating.2032999f.chunk.js.map