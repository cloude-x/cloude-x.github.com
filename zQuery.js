        //获取元素
        //包含选择器 --> #div1 ul .box（#div1下的ul下的.box）
        //复合选择器 --> div.box（既是div又是.box）
        function getEle(str, aParent) {
            var arr = str.match(/\S+/g);//（包含选择器）按任意空格截取得['#div1','ul','li',...]
            var aParent = aParent || [document];
            var aChild = [];
            if (str == 'document') return aChild = [document];//当传入的是document时，不能在document下获取document
            for (var i = 0; i < arr.length; i++) {
                aChild = getByStr(aParent, arr[i]);//从父级里面找到子
                aParent = aChild;//找到的子变成父，继续找
            }
            return aChild;
        }
        function getByStr(aParent, str) {
            var aChild = [];
            for (var j = 0; j < aParent.length; j++) {//在每一个父里面找子
                switch (str.charAt(0)) {//判断传入的子是什么类型的选择器
                    case '#'://ID选择器
                        var obj = document.getElementById(str.substring(1));//获取#后面的
                        obj && aChild.push(obj);//正确获取就丢到数组内
                        break;
                    case '.'://class
                        var aEl = getByClass(aParent[j], str.substring(1));
                        for (var i = 0; i < aEl.length; i++) {//因为获取到的aEl不是真正的数组，所以不能直接等于
                            aChild.push(aEl[i]);
                        }
                        break;
                    default://tagname
                        if (/\w+\.\w+/.test(str)) {//div.box（复合选择器）
                            var arr = str.split('.');
                            var aEl = aParent[j].getElementsByTagName(arr[0]);
                            var re = new RegExp('\\b' + arr[1] + '\\b');
                            for (var i = 0; i < aEl.length; i++) {
                                if (re.test(aEl[i].className)) {
                                    aChild.push(aEl[i]);
                                }
                            }
                        } else if (/\w+\[\w+=\w+\]/.test(str)) {//div[title=test]属性选择器
                            var arr = str.split(/\[|\]|=/g);
                            var aEl = aParent[j].getElementsByTagName(arr[0]);
                            for (var i = 0; i < aEl.length; i++) {
                                if (aEl[i].getAttribute(arr[1]) == arr[2]) {
                                    aChild.push(aEl[i]);
                                }
                            }
                        } else if (/\w+\:\w+(\(.\))?/.test(str)) {//div:first\div:eq(n)伪类选择器
                            var arr = str.split(/\:|\(|\)/g);
                            var aEl = aParent[j].getElementsByTagName(arr[0]);
                            if (aEl.length == 0) return;
                            switch (arr[1]) {
                                case 'first':
                                    aChild.push(aEl[0]);
                                    break;
                                case 'last':
                                    aChild.push(aEl[aEl.length - 1]);
                                    break;
                                case 'odd':
                                    for (var i = 0; i < aEl.length; i++) {
                                        if (i % 2 == 1) {
                                            aChild.push(aEl[i]);
                                        }
                                    }
                                    break;
                                case 'even':
                                    for (var i = 0; i < aEl.length; i += 2) {
                                        aChild.push(aEl[i]);
                                    }
                                    break;
                                case 'eq':
                                    aEl[arr[2]] && aChild.push(aEl[arr[2]]);
                                    break;
                                case 'lt':
                                    for (var i = 0; i < arr[2]; i++) {
                                        aChild.push(aEl[i]);
                                    }
                                    break;
                                case 'gt':
                                    if (parseInt(arr[2]) < 0) return;
                                    for (var i = parseInt(arr[2]) + 1; i < aEl.length; i++) {
                                        aChild.push(aEl[i]);
                                    }
                                    break;
                            }
                        } else {
                            var aEl = aParent[j].getElementsByTagName(str);
                            for (var i = 0; i < aEl.length; i++) {
                                aChild.push(aEl[i]);
                            }
                        }

                }
            }
            return aChild;
        }
        //抓取class
        function getByClass(oParent, sClass) {
            if (oParent.getElementsByClassName) {
                return oParent.getElementsByClassName(sClass);
            }
            var aEl = oParent.getElementsByTagName('*');
            var re = new RegExp('\\b' + sClass + '\\b');
            var aResult = [];
            for (var i = 0; i < aEl.length; i++) {
                if (re.test(aEl.className)) {
                    aResult.push(aEl[i]);
                }
            }
            return aResult;
        }
        //获取非行间样式
        function getStyle(obj, attr) {
            return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
        }
        //封装ready
        function ready(fn) {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', fn, false);
            } else {
                document.attachEvent('onreadystatechange', function () {
                    if (document.readyState == 'complete') {
                        fn();
                    }
                });
            }
        }

        //事件绑定
        function addEvent(obj, sEvt, fn) {
            if (obj.addEventListener) {
                obj.addEventListener(sEvt, function (ev) {
                    if (fn.call(obj, ev) == false) {//如果函数执行完 return 出来的是false
                        ev.cancelBubble = true;//阻止冒泡
                        ev.preventDefault();//阻止默认
                    }
                });
            } else {
                obj.attachEvent('on' + sEvt, function () {
                    if (fn.call(obj, event) == false) {
                        event.cancelable = true;//阻止冒泡
                        return false;//阻止默认
                    }
                });
            }
        }
        //解除事件绑定
        function removeEvent(obj, sEvt, fn) {
            if (obj.removeEventListener) {
                obj.removeEventListener(sEvt, fn, false);
            } else if (obj.detachEvent) {
                obj.detachEvent('on' + sEvt, fn);
            }
        }
        //move框架
        function move(obj, json, optional) {
            optional = optional || {};
            optional.duration = optional.duration || 700;
            optional.easing = optional.easing || 'ease-out';
            optional.fn = optional.fn || null;
            var start = {};
            var dis = {};
            for (var key in json) {
                start[key] = parseFloat(getStyle(obj, key));
                alert(start[key]);
                dis[key] = parseFloat(json[key]) - start[key];
            }
            var n = 0;
            var count = Math.round(optional.duration / 30);
            clearInterval(obj.timer);
            obj.timer = setInterval(function () {
                n++;
                for (var key in json) {
                    switch (optional.easing) {
                        case 'linear':
                            var a = n / count;
                            var cur = start[key] + dis[key] * a;
                            break;
                        case 'ease-in':
                            var a = n / count;
                            var cur = start[key] + dis[key] * a * a * a;
                            break;
                        case 'ease-out':
                            var a = 1 - n / count;
                            var cur = start[key] + dis[key] * (1 - a * a * a);
                            break;
                    }
                    if (key == 'opacity') {
                        obj.style.opacity = cur;
                        //alert(cur*100);
                        obj.style.filter = 'alpha(opacity=' + cur * 100 + ')';
                    } else {
                        obj.style[key] = cur + 'px';
                    }
                }
                if (n == count) {
                    clearInterval(obj.timer);
                    optional.fn && optional.fn();
                }
            }, 30);
        }
        //ajax
        function ajax(optional){
            optional = optional || {};
            if(!optional.url) return;
            optional.data = optional.data || {};
            optional.type = optional.type || 'get';
            optional.timeout = optional.timeout || 0;
            optional.success = optional.success || null;
            optional.error = optional.error || null;
            var arr = [];
            for(var key in optional.data){
                arr.push(key + '=' + encodeURIComponent(optional.data[key]));
            }
            optional.data.t = Math.random();
            var str = arr.join('&');
            if(window.XMLHttpRequest){
                var oAjax = new XMLHttpRequest();
            }else{
                var oAjax = new ActiveXObject('Microsoft.XMLHTTP');
            }
            if(optional.type == 'get'){
                oAjax.open('get',optional.url + '?' + str,true);
                oAjax.send();
            }else{
                oAjax.open('post',optional.url,true);
                oAjax.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
                oAjax.send(str);
            }
            oAjax.onreadystatechange = function(){
                if(oAjax.readyState == 4){
                    clearTimeout(timer);
                    if(oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304){
                        optional.success && optional.success(oAjax.responseText);
                    }else{
                        optional.error && optional.error(oAjax.status);
                    }
                }
            }
            if(optional.timeout){
                var timer = setTimeout(function(){
                    alert('请求超时!');
                    oAjax.abort();
                },optional.timeout)
            }
        }
        //jsonp
        function jsonp(optional){
            optional = optional || {};
            if(!optional.url) return;
            if(!optional.data) return;
            optional.cbKey = optional.cbKey || 'cb';
            optional.timeout = optional.timeout || 0;
            optional.success = optional.success || null;
            optional.error = optional.error || null;
            var cbValue = 'jsonp' + Math.random();
            optional.data[optional.cbKey] = cbValue.replace('.','');
            window[optional.data[optional.cbKey]] = function(json){
                optional.success && optional.success(json);
                clearTimeout(timer);
                window[optional.data[optional.cbKey]] = null;
                document.getElementsByTagName('head')[0].removeChild(oSc);
            }
            var arr = [];
            for(var key in optional.data){
                arr.push(key + '=' + encodeURIComponent(optional.data[key]));
            }
            var oSc = document.createElement('script');
            oSc.src = optional.url + '?' + arr.join('&');
            document.getElementsByTagName('head')[0].appendChild(oSc);
            if(optional.timeout){
                var timer = setTimeout(function(){
                    optional.error && optional.error();
                    window[optional.data[optional.cbKey]] = function(){};
                    document.getElementsByTagName('head')[0].removeChild(oSc);
                },optional.timeout);
            }
        }
        //定义构造函数
        function zQuery(args) {
            this.elements = [];
            switch (typeof args) {
                case 'function':
                    ready(args);
                    break;
                case 'string':
                    this.elements = getEle(args);
                    break;
                case 'object'://需要再包装一下的时候（this、再getEle获取元素的时候。。。）
                    if ('length' in args) {
                        this.elements = args;//className、tagName有length
                    } else {
                        this.elements.push(args);//id没有length
                    }
                    break;
            }
        }
        //$函数
        function $(args) {
            return new zQuery(args);
        }
        //原型绑定方法
        //CSS 样式设置/获取
        zQuery.prototype.css = function (ar1, value) {
            if (arguments.length == 2) {//点对点设置
                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].style[ar1] = value;
                }
            } else {
                if (typeof ar1 == 'string') {//查询
                    return getStyle(this.elements[0], ar1);
                } else if (typeof ar1 == 'object') {
                    for (var i = 0; i < this.elements.length; i++) {
                        for (var key in ar1) {
                            this.elements[i].style[key] = ar1[key];
                        }
                    }
                }
            }
            return this; //返回引用该方法的对象
        };
        //attr 属性设置/获取
        zQuery.prototype.attr = function (ar1, value) {
            if (arguments.length == 2) {
                for (var i = 0; i < this.elements.length; i++) {
                    this.elements[i].setAttribute(ar1, value);
                }
            } else {
                if (typeof ar1 == 'string') {
                    return this.elements[0].getAttribute(ar1);
                } else if (typeof ar1 == 'object') {
                    for (var i = 0; i < this.elements.length; i++) {
                        for (var key in ar1) {
                            this.elements[i].setAttribute(key, ar1[key]);
                        }
                    }
                }
            }
            return this;
        };
        //基本事件
        'click/mouseover/mouseout/contextmenu'.replace(/\w+/g, function (sEvt) {
            zQuery.prototype[sEvt] = function (fn) {
                for (var i = 0; i < this.elements.length; i++) {
                    addEvent(this.elements[i], sEvt, fn);
                }
            }
            return this;
        });
        //toggle
        zQuery.prototype.toggle = function () {
            var args = arguments;//arguments和this一样有使用范围问题
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].count = 0;
                addEvent(this.elements[i], 'click', function (ev) {
                    if (args[this.count % args.length].call(this, ev) == false) {//为了阻止默认
                        //alert(0);
                        this.count++;
                        return false;
                    } else {
                        //alert(1)
                        this.count++;
                    }
                })
            }
            return this;
        };
        //mouseenter事件 没有冒泡
        zQuery.prototype.mouseenter = function (fn) {
            for (var i = 0; i < this.elements.length; i++) {
                addEvent(this.elements[i], 'mouseover', function (ev) {
                    var oFrom = ev.fromElement || ev.relatedTarget;
                    if (oFrom && this.contains(oFrom)) return;//动作来自自己或者自己的子级时不执行
                    fn && fn();
                });
            }
            return this;
        };
        zQuery.prototype.mouseleave = function (fn) {
            for (var i = 0; i < this.elements.length; i++) {
                addEvent(this.elements[i], 'mouseout', function (ev) {
                    var oTo = ev.toElement || ev.relatedTarget;
                    if (oTo && this.contains(oTo)) return;
                    fn && fn();
                });
            }
            return this;
        };
        //hover
        zQuery.prototype.hover = function (fn1, fn2) {
            this.mouseenter(fn1);
            this.mouseleave(fn2);
            return this;
        };
        //eq 用的包装后的方法，即只能使用库的方法
        zQuery.prototype.eq = function (n) {
            return $(this.elements[n]);
        };
        //get 的是原生
        zQuery.prototype.get = function (n) {
            return this.elements[n];
        };
        //show方法
        zQuery.prototype.show = function () {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].style.display = 'block';
            }
            return this;
        };
        //hide方法
        zQuery.prototype.hide = function () {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].style.display = 'none';
            }
            return this;
        };
        //find获取元素
        zQuery.prototype.find = function (str) {
            return $(getEle(str, this.elements));//以this.elements为父级，找传入的str标签，找到的是数组，需要把它放到this.elements中去（这就是包装一下）
        };
        //index方法 获取当前选取元素的下标（找的是兄弟同级中的）
        zQuery.prototype.index = function () {
            var oParent = this.elements[0].parentNode;
            var aChild = oParent.children;//同级的所有兄弟元素
            for (var i = 0; i < aChild.length; i++) {
                if (aChild[i] == this.elements[this.elements.length - 1]) {//一堆的时候找的是最后一个
                    return i;
                }
            }
        };
        //addClass 添加类名
        zQuery.prototype.addClass = function (sClass) {
            var re = new RegExp('\\b' + sClass + '\\b');
            for (var i = 0; i < this.elements.length; i++) {
                if (!re.test(this.elements[i].className)) {
                    this.elements[i].className = this.elements[i].className + ' ' + sClass;
                }
                this.elements[i].className = this.elements[i].className.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');//整理
            }
            return this;
        };
        //removeClass 删除类名
        zQuery.prototype.removeClass = function (sClass) {
            var re = new RegExp('\\b' + sClass + '\\b');
            for (var i = 0; i < this.elements.length; i++) {
                if (re.test(this.elements[i].className)) {
                    this.elements[i].className = this.elements[i].className.replace(re, '');
                }
                this.elements[i].className = this.elements[i].className.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
                if (!this.elements[i].className) {
                    this.elements[i].removeAttribute('class');//如果没有类名，就删除class名称
                }
            }
            return this;
        };
        //hasClass 判断是否有此类名
        zQuery.prototype.hasClass = function (sClass) {
            var re = new RegExp('\\b' + sClass + '\\b');
            var bl = false;
            for (var i = 0; i < this.elements.length; i++) {
                if (re.test(this.elements[i].className)) {
                    bl = true;//直接return的话，只要找到一个下面的就不会再执行
                }
            }
            if (bl) {//循环完以后再return
                return true;
            } else {
                return false;
            }
        };
        //toggleClass 切换class
        zQuery.prototype.toggleClass = function (sClass) {
            for (var i = 0; i < this.elements.length; i++) {
                if ($(this.elements[i]).hasClass(sClass)) {
                    $(this.elements[i]).removeClass(sClass);
                } else {
                    $(this.elements[i]).addClass(sClass);
                }
            }
            return this;
        };
        //each 遍历 用法：function（index,items）{}
        zQuery.prototype.each = function (fn) {
            for (var i = 0; i < this.elements.length; i++) {
                fn.call(this.elements[i], i, this.elements[i]);//items每一个都是原生的
            }
        };
        //自定义函数
        $.fn = zQuery.prototype;
        zQuery.prototype.extend = function (json) {
            for (var key in json) {
                zQuery.prototype[key] = json[key];
            }
        };
        //运动
        zQuery.prototype.animate = function (json, optional) {
            for (var i = 0; i < this.elements.length; i++) {
                move(this.elements[i], json, optional);
            }
            return this;
        };
        //事件绑定方法
        zQuery.prototype.on = function (sEvt, fn) {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].addEventListener) {// 标准浏览器
                    this.elements[i].addEventListener(sEvt, fn, false);
                } else if (this.elements[i].detachEvent) {// IE浏览器
                    this.elements[i].attachEvent("on" + sEvt, fn);
                }
            }
            return this;
        };
        //解除绑定方法
        zQuery.prototype.off = function (sEvt, fn) {
            for (var i = 0; i < this.elements.length; i++) {
                removeEvent(this.elements[i], sEvt, fn);
            }
            return this;
        };
        $.ajax = ajax;
        $.jsonp = jsonp;
