/**
	author: xuan
	version: 1.0.0 
*/
(function(global){
    var toStr = Object.prototype.toString;
 	function typeName(o) {
		return toStr.call(o).slice(8, -1);
 	}
	var scriptDom = {
	/**
	 * 延时执行队列js脚本
	*/
	add:function(url,depend){
		if(arguments.length==0) return;
		var queue=[],
			url = url,
			self = this,
			i = 0; 
		if(arguments.length==1){
			depend = url;
			url = "";
		}
		//并行加载 回调
		if(arguments.length==2 && typeName(url) == "Array" ){
			for (l = url.length; i < l; i++) {
				queue.push({durl:url[i],load:false})
			};
			this.parallel(queue,depend);
			return queue;
		}
		//串行加载 回调
		if(typeName(depend)== "Array" && depend.length){
			for (l = depend.length; i < l; i++) {
				queue.push({durl:depend[i],load:false})
			};
			this.execution(queue,url)
		}
		return queue;
	},
	/**
	 * 并行执行队列js脚本回调
	*/
	parallel:function(queue,back){
		var len = queue.length,
			i = 0,
			s = 0,
			self = this;
		for (; i < len; i++) {
			(function(o){
				self.loadJs(o.durl,function(){
					//o.load = true,
					// for (var j = 0; j < len; j++) {
					// 	if(queue[j].load == false){
					// 		return ;
					// 	}
					// }
					if(++s == len){
						if(typeName(back) == "Function"){
							back()
						}else{
							scriptDom.loadJs(back)
						}
					}
				})
			})(queue[i])
		};
	},
	/**
	 * 延时执行队列js脚本
	*/
	delay:function (time,url) {
		//彻底离开渲染流
		setTimeout(function(){
			scriptDom.loadJs(url)	
		},time)
	},
	/**
	 * 执行队列js脚本
	*/
	execution:function(queue,back) {
		var jsObject = queue.shift(),
			self = this;
        if(jsObject === "loding") {
            jsObject = queue.shift()
        }
       if(jsObject){
            queue.unshift("loding");
            this.loadJs(jsObject.durl,function(){
                self.execution(queue,back);
                jsObject.load = true;
            })
       }
      	if(queue.length<=0 && back) {
      		back();
      		return;	
      }
	},
	/**
	 * 加载js脚本
	*/
	loadJs: function(url, callback, options) {
		setTimeout(function(){
			var default_options = {
					"charset":"",
					"type":"text/javascript"
				},
				custom = options || {};
				custom = scriptDom.mix(default_options,custom,true)
				var head = document.getElementsByTagName('head')[0] || document.documentElement,
					script = document.createElement('script'),
					done = false;
				if (custom.charset) {
					script.charset = options.charset;
				}
	            if ( "async" in custom ){
		        	script.async = custom["async"] || "";
	            }
				script.onerror = script.onload = script.onreadystatechange = function() {
					if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
						done = true;
						if (callback) {
							callback();
						}
						script.onerror = script.onload = script.onreadystatechange = null;
						//head.removeChild(script);
					}
				};
				script.src = url;
				head.insertBefore(script, head.firstChild);
		},0)
		},
		/**
		 * 加载jsonp脚本
		 */
		loadJsonp : (function(){
			var seq = new Date() * 1;
			return function (url , callback , options){
				options = options || {};
				var funName = "KS" + seq++,
					callbackReplacer = options.callbackReplacer || "callback";
				window[funName] = function (data){
					if (callback) {
						callback(data);
					}
					window[funName] = null;		
				};
				
				url += (/\?/.test( url ) ? "&" : "?") + callbackReplacer +"=" + funName;
				scriptDom.loadJs(url , options.oncomplete , options);
			};
		}()),
		/**
		 * 加载css样式表
		 * @param { String } url Css文件路径
		 */
		loadCss: function(url) {
			var head = document.getElementsByTagName('head')[0] || document.documentElement,
			css = document.createElement('link');
			css.rel = 'stylesheet';
			css.type = 'text/css';
			css.href = url;
			head.insertBefore(css, head.firstChild);
		},
		mix:function(target, source ,override) {
	        var i;
	        for (i in source) {
	            if (override || !(i in target)) {
	                target[i] = source[i];
	            }
	        }
	        return target;
   		}
}	
global.scriptDom = scriptDom
})(window)