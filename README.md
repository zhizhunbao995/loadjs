# loadjs
##加载你的js
```js
scriptDom("url.js",callback);
scriptDom.add("url.js",["1.js","2.js"]);//依赖加载
scriptDom.parallel(["1.js","2.js"],callback);
scriptDom.delay(1000,url.js);
```
