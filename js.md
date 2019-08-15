* [JS半知半解](#JS半知半解)
  * [map()](#map())
  * [事件代理](#事件代理)
  * [快速删除node_modules](#快速删除node_modules)
  * [display和visibility,display与transition的冲突](#display和visibility,display与transition的冲突)
  * [模块（你不知道的javascript上卷）CH5.5](#模块（你不知道的javascript上卷）CH5.5)
  * [实时请求JSON数据](#实时请求JSON数据)
  * [去除字符串空格](#去除字符串空格)
  * [Ajax](#Ajax)
  * [JS快速解析URL](#JS快速解析URL)
  * [JS获取非行内样式](#JS获取非行内样式)
  * [this 和 prototype 的区别](#JS中this和prototype的区别)
  * [跳出嵌套for循环](#跳出嵌套for循环)
  * [原生js提交form表单](#原生js提交form表单)
  * [当图片丢失时传入默认图片](#当图片丢失时传入默认图片)
  * [子级影响父级的BUG](#子级影响父级的BUG)
  * [面向对象](#面向对象)
  * [组件开发之自定义事件](#组件开发之自定义事件)
* [你所不知道的Javascript (中)](#你所不知道的Javascript(中))
  * [CH2.值](#CH2.值)
    * [2.1.2数组](#2.1.2数组)
    * [2.1.2数组方法](#2.1.2数组方法)

* [我所不知道的Javascript](#我所不知道的Javascript)
  * [2.1.2	让页面处于编辑状态](#2.1.2让页面处于编辑状态)
  * [2.1.2	避免Switch](#2.1.2避免Switch)

* [学习ES6遇到的错误](#学习ES6遇到的错误)


* [H5](#H5)
  * [历史管理](#历史管理)


# JS半知半解
### **offsetleft**
此属性可以返回当前元素距离某个父辈元素左边缘的距离，当然这个父辈元素也是有讲究的。
1. 如果父辈元素中有定位的元素，那么就返回距离当前元素最近的定位元素边缘的距离。
2. 如果父辈元素中没有定位元素，那么就返回相对于body左边缘距离。
3. 
语法结构: `obj.offsetleft`

特别说明: `此属性是只读的，不能够赋值`
``` javascript

// Cookie: 默认是临时存储的
indexOf() // 方法可返回某个指定的字符串值在字符串中首次出现的位置。
substring() // 方法用于提取字符串中介于两个指定下标之间的字符。
decodeURIComponent() //  函数可对 encodeURIComponent() 函数编码的 URI 进行解码
decodeURIComponent(URIstring)
encodeURIComponent() // 函数可把字符串作为 URI 组件进行编码。

document.cookie = "username=marh";

alert(document.cookie)  // username=marh; age=23   字符串类型，用'; '分隔开'
// 如果我们想要长时间存放cookie：需要在设置这个cookie的时候同时设置一个过期的时间: document.cookie = "名称=值;expires=" + 时间，时间必须是 str 形式

var oDate = new Date()

oDate.setDate( oDate.getDate() + 30 );   // 30天后过期
oDate.toUTCString()

document.cookie = "username=marh; expires=" + oDate;

// 内容最好用编码存放，防止有些特殊符号不能显示，例如：\n换行。
encodeURI()
decodeURI( document.cookie )


// 删除cookie: 删除时不必指定 cookie 的值，过期时间设为负数
document.cookie = "username=; expires=" + -1


// HTML5 提供了两种在客户端存储数据的新方法：
// 	localStorage - 没有时间限制的数据存储
// 	sessionStorage - 针对一个 session 的数据存储

var obj = {
    toString: function() {
        return 'obj';
    },
    valueOf: function() {
        return 1;
    }
};

console.log( 1 + obj ); // 2
console.log( '1' + obj ); // 11

// 也很简单
var strtime = '2014-04-23 18:55:49:123';
var date = new Date(strtime); //传入一个时间格式，如果不传入就是获取现在的时间了，这样做不兼容火狐。
// 可以这样做
var date = new Date(strtime.replace(/-/g, '/'));

// 有三种方式获取，在后面会讲到三种方式的区别
time1 = date.getTime();
time2 = date.valueOf();
time3 = Date.parse(date);

/* 
三种获取的区别：
第一、第二种：会精确到毫秒
第三种：只能精确到秒，毫秒将用0来代替
比如上面代码输出的结果(一眼就能看出区别)：
1398250549123
1398250549123
1398250549000
*/

// 时间转时间戳：javascript获得时间戳的方法有四种，都是通过实例化时间对象 new Date() 来进一步获取当前的时间戳

var timestamp1 = Date.parse(new Date()); // 结果：1477808630000 不推荐这种办法，毫秒级别的数值被转化为000

console.log(timestamp1);

var timestamp2 = (new Date()).valueOf(); // 结果：1477808630404 通过valueOf()函数返回指定对象的原始值获得准确的时间戳值

console.log(timestamp2);

var timestamp3 = new Date().getTime(); // 结果：1477808630404 ，通过原型方法直接获得当前时间的毫秒值，准确

console.log(timestamp3);

var timetamp4 = Number(new Date()) ; //结果：1477808630404 ,将时间转化为一个number类型的数值，即时间戳

console.log(timetamp4);
  
```

### **map()**
	易犯错误:
	    通常情况下, map 方法中的 callback 函数只需要接受一个参数（很多时候，自定义的函数形参只有一个），就是正在被遍历的数组元素本身。
	    但这并不意味着 map 只给 callback 传了一个参数（会传递3个参数）。这个思维惯性可能会让我们犯一个很容易犯的错误。 
		// 下面的语句返回什么呢:
		["1", "2", "3"].map(parseInt);
		// 你可能觉的会是[1, 2, 3]
		// 但实际的结果是 [1, NaN, NaN]

		// 通常使用parseInt时,只需要传递一个参数.但实际上,parseInt可以有两个参数.第二个参数是进制数.可以通过语句"alert(parseInt.length)===2"来验证.
		// map方法在调用callback函数时,会给它传递三个参数:当前正在遍历的元素, 元素索引, 原数组本身.
		// 第三个参数parseInt会忽视, 但第二个参数不会,也就是说,parseInt把传过来的索引值当成进制数来使用.从而返回了NaN.
``` javascript
  /*
    //应该使用如下的用户函数returnInt
    function returnInt(element){
      return parseInt(element,10);
    }

    ["1", "2", "3"].map(returnInt);
    // 返回[1,2,3]
  */
```

### **事件代理**

``` javascript
var ev = ev || window.event;
var  target = ev.target || ev.srcElement;

// IE/Opera: window.event
// FF: event

// IE: window.event.srcElement
// FF: window.event.target

// 滚轮事件：
  // ie/chrome：onmousewheel
  // 	 event.wheelDelta   上：120 下：-120

  // FF: DOMMouseSroll, 必须用addEventListener 绑定
  // 	 event.detail  上：-3，下：3

  // 阻止事件的默认行为:
  // 	return false; // 阻止的是 obj.on事件名称=fn所触发的默认行为
  // 	preventDefault; // addEventListener绑定的事件需要通过event下面的preventDefault();

  /*
    去google一搜，全都是说return false = event.preventDefault() + stop.stopPropagation()。
    我去尝试了一下，发现完全不是这么回事。
    事件处理程序的返回值只对通过属性注册的处理程序才有意义。
    也就是说:如果我们是直接不通过addEventListener()函数来绑定事件的话，我们要禁止默认事件的话，用的就是return false。
    但是如果我们要用addEventListener()或者attachEvent()来绑定的话，就要用preventDefault()方法或者设置事件对象的returnValue属性。
  */


// 焦点事件：
		// onfocus
		// obblur

// clientX, clientY: 当一个事件发生的时候，鼠标到页面可视区的距离。

	
// 文档高宽及窗口事件	
// 可视区域尺寸
  document.documentElement.clientWidth
  document.documentElement.clientHeight

// 滚动距离
  chrome: document.body.scrollTop/scrollLeft;
  ie: document.documentElement.scrollTop/scrollLeft;

// 内容高度（元素内容的总高度）
  document.body.scrollHeight

// 文档高度
  document.documentElement.offsetHeight
  document.body.offsetHeight
   
// Event
	// onscroll:当滚动条滚动的时候触发
	// onresize:当页面窗口大小发生改变的时触发

// 键盘事件
  // onkeydown/onkeyup, ev.keycode
  // ctrlKey /altKey/shiftKey

// 拖拽功能 （牛刀小试 > JS BOM\EVENT）
// 	拖拽时，如果有文字被选中会产生问题。
// 		原因：当鼠标按下的时候，如果页面中有文字被选中，会触发浏览器中默认拖拽文字的效果
// 		解决：
//         标准下：阻止onmousedown的默认行为，return false；
//         非标准下：obj鼠标按下时设置 setCapture,抬起清除
obj.setCapture()  //设置全局捕获，当我们给一个元素设置全局捕获，这个元素就会监听后续 发生的所有事件，当有事件发生，就会被obj所触发。
// 将浏览器缩小，点击浏览器外也可以捕获。
// ie: 有该方法， 有效果
// ff: 有该方法， 但是没有效果
// chrome：没有该方法，会报错
obj.releaseCapture() // 释放全局捕获 

```
![scroll](https://github.com/aaamrh/learnnotes/blob/master/images/js/scroll.png)
![scroll](https://github.com/aaamrh/learnnotes/blob/master/images/js/scroll1.png)

### **快速删除node_modules**
	npm install rimraf -g
	rimraf node_modules

### **display和visibility,display与transition的冲突**
    display:none会引起页面的重绘事件，所以它是一个异步的延时事件，浏览器其实会先解析animate的代码，然后再执行display:none。
    可以用 visibility 来代替display, 还可以用添加 animation 来解决
    !!! 但元素现在可以点击吗？答案是不可以的。
    设为visibility:hidden后，元素现在是不可以选择的既然无法选择，即使绑定了click事件，也自然无法点击啦！

### **模块（你不知道的javascript上卷）CH5.5**

``` js
  // (1)模块
	function CoolModule(){
    var something = 'cool';'    var another = [1,2,3];
    
    function doSomething(){
      console.log(something);
    }
    function doAnother(){
      console.log(another.join(" ! "));
    }

    return{
      doSomething: doSomething,
      doAnother: doAnother
    }
	}
	var foo = CoolModule();

	foo.doSomething();   // cool
	foo.doAnother();     // 1 ! 2 ! 3 

	// 将(1)修改成单例模式：
	var foo = (function CoolModule(){
    var something = 'cool';
    var another = [1,2,3];
    
    function doSomething(){
      console.log(something);
    }
    function doAnother(){
      console.log(another.join(" ! "));
    }

    return{
      doSomething: doSomething,
      doAnother: doAnother
    }
	})();

	foo.doSomething();   // cool
	foo.doAnother();     // 1 ! 2 ! 3 

  // 通过在模块实力的内部保留对公共API对象的引用，可以从内部对模块实例进行修改，包括添加或删除方法和属性，以及修改他们的值

	var foo = (function CoolModule(id){
    function change(){
      publicAPI.identify = identify2;
    }
    function identify1(){
      console.log(id);
    }
    function identify2(){
      console.log(id.toUpperCase());
    }

    var publicAPI = {
      change: change,
      identify: identify1
    }
    return publicAPI;
	})('foo module');

	foo.identify();  // foo module
	foo.change();

```

### **实时请求JSON数据**
会涉及到浏览器缓存的问题导致JSON中数据修改后，页面内容没有改变。
因此在ajax发送请求前加上	`xmlHttpRequest.setRequestHeader("Cache-Control","no-cache");`

xmlhttp.open("GET", url); 
xmlhttp.setRequestHeader("Cache-Control","no-cache"); 
xmlhttp.send();


### **去除字符串空格**
``` js
// 去除所有空格:   
str   =   str.replace(/\s+/g,"");   
    
// 去除两头空格:   
str   =   str.replace(/^\s+|\s+$/g,"");

// 去除左空格：
str   =   str.replace( /^\s*/, '');

// 去除右空格：
str   =   str.replace(/(\s*$)/g, "");

```
### **Ajax**
``` javascript
// 设置请求头
if (window.XMLHttpRequest) {
  //  IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp = new XMLHttpRequest();
} else {
  // IE6, IE5 
  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

// 上传文件进度条
xmlhttp.upload.onprogress = function(event) {
  if (event.lengthComputable) {
    console.log(`上传进度为: ${event.loaded} of ${event.total} bytes`);
  }
};

// 请求错误处理
xmlhttp.onerror = function(){};

// 当一个HTTP请求正确加载出内容后返回时调用。
xmlhttp.onload = function(){}

// 当一个HTTP请求开始加载数据时调用
xmlhttp.onloadstart = function(){}

// 当内容加载完成，不管失败与否，都会调用该方法
xmlhttp.onloadend = function(){}

// 间歇调用该方法用来获取请求过程中的信息
xmlhttp.onprogress = function(){}

// 当时间超时时调用；只有通过设置XMLHttpRequest对象的timeout属性来发生超时时，这种情况才会发生
xmlhttp.ontimeout = function(){}

xmlhttp.onreadystatechange = function(){
  if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
    var data = xmlhttp.response;
    TYPENAME = JSON.parse(data);
  }
}
xmlhttp.open("GET","");
// 实时的读取JSON文件时，因为在浏览器中会有缓存，所以设置请求头
xmlhttp.setRequestHeader("Cache-Control","no-cache");
xmlhttp.send();


// 跨域请求 jsonP
  <scripts>
    function callback(data){ alert(data) }
  </scripts>

  <scripts src=`2.txt`></scripts>

// 文件2.txt: callback([1,2,3])


// 向后台传输数据（ POST方法发送数据）
var sendData = { 'name':'bob' };
xmlhttp.send( JSON.stringify(sendData) );

// Flask 获取前台ajax传输的数据
data_json=request.get_data().decode('utf-8')
data_dict=json.loads(data_json)

```


### **JS快速解析URL**
``` javascript
function parseURL(url) {
  var a = document.createElement('a');
  a.href = url;
  // var a = new URL(url);
  return {
    source: url,
    protocol: a.protocol.replace(':', ''), 
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (function() {
      var params = {},
      seg = a.search.replace(/^\?/, '').split('&'),
      len = seg.length,
      p;
      for (var i = 0; i < len; i++) {
        if (seg[i]) {
          p = seg[i].split('=');
          params[p[0]] = p[1];
        }
      }
      return params;
    })(),
    hash: a.hash.replace('#', ''),
    path: a.pathname.replace(/^([^\/])/, '/$1')
  };
}
 console.log(parseURL('https://test.com:8080/path/index.html?name=angle&age=18#top'));
 ```

### **JS获取非行内样式**

``` javascript
let style = window.getComputedStyle(element, [pseudoElt]);
// element
// 用于获取计算样式的Element。
// pseudoElt 可选
// 指定一个要匹配的伪元素的字符串。必须对普通元素省略（或null）。

// IE：
obj.currentStyle()

// 获取元素信息：比getComputedStyle常用，返回值会根据滚动条变化，可用来获取元素的长宽bottom,left,top,right等；
ele.getBoundingClientRect()

```
### **JS中this和prototype的区别**
``` javascript
var Foo = function(name){
  var age = 18;
  this.name = name;
  this.say = function(){
    console.log(this);
    console.log(age);         // 18
    console.log(this.name);
  }
}

Foo.prototype = {
  speak:function(){
    console.log(this);
    console.log(this.age);   // undefined
    console.log(this.name);
  }
}

var foo = new Foo('bob');
``` javascript
    区别1：
    利用 this 实现的公共方法中可以访问类的私有成员(用 var 声明的变量)，私有方法(用 function 直接定义的方法)； 
    利用原型扩展实现的方法中，无法调用私有成员和变量。 

    区别2：
    当访问对象的属性或者方法时，将按照搜索原型链的规则进行。先查找自身的静态属性、方法，继而查找构造上下文的可访问属性、方法，最后查找构造的原型链
    function Test() {
                this.text = function() {
                    alert("defined by this");
                } 
            } 
            Test.prototype.test = function() {
                alert("defined by prototype"); 
            } 
            var _o = new Test(); 
            _o.test();     //输出"defined by this"

    区别3：
    "this"与"prototype"定义的另一个不同点是属性的占用空间不同。使用"this"关键字，示例初始化时为每个实例开辟构造方法所包含的所有属性、方法所需的空间，而使用"prototype"定义，由于"prototype"实际上是指向父级的一种引用，仅仅是个数据的副本，因此在初始化及存储上都比"this"节约资源。


### **跳出嵌套for循环**
``` javascript
foo: for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 1; j++) {
             if (i == 3) {
                 break foo;
             }
        }
}
```

### **原生js提交form表单**
``` javascript
var formData = new FormData(document.getElementById("form"));
  formData.append("name", "Bob")

  ajax({
    url: "...",
    data: formData,
    method: 'POST',
    success: function (data) {}
  })  
```
### **当图片丢失时传入默认图片**
``` javascript
  // <img onerror="img_err(this)" />
  window.img_err = function (obj) {
    obj.src = "static/images/img-lost.jpg"
  }
```
### **子级影响父级的BUG**
``` javascript
  // js: 用onmouseenter、onmouseleave替代onmouseover、onmouseout 

  // 在制作放大镜的时候，IE浏览器中会出现闪烁的bug。 大部分浏览器已经支持，如果不是老浏览器可以直接用。
  // 兼容：
  function elContains(a, b){ // 判断是否嵌套
    return a.contains ?  a!=b && a.contains(b)
                        :  !!(a.compareDocumentPosision(b)&16)
  }
	
  oDiv.onmouseover = function(ev){
    var ev = ev || window.event;
    var target = ev.target || ev.srcElement;
		var a = this, b = ev.relatedTarget;

    if(!elContains(a,b) && a!=b){
      //  -----------
    }
  }
 
```

![点击事件过程](https://github.com/aaamrh/learnnotes/blob/master/images/js/点击事件过程.png)

### **面向对象**
```javascript
// 面向对象的一些属性和方法：
hasOwnPeoperty()  //看是不是对象自身下面的属性

    var arr = []
    arr.num = 10
    Array.prototype.num2 = 20
    arr.hasOwnPeoperty('num')    // true
    arr.hasOwnPeoperty('num2')   // false

// constructor： 查看对象的构造函数， 系统自带的用for in 遍历不到
// instanceof: 运算符
// -	对象与构造函数在原型链上是否有关系
toString()  // object上的方法。
// -	做类型判断 
Object.prototype.toString.call([1,2,3]) == '[objec Array]'

// 对象的复制
// 1.拷贝继承
function extend(o1, o2){
      for(var attr in o2){  // 方法的继承 for in 的形势 （拷贝继承）
        o1[attr] = o2[attr]  // 函数虽然是对象类型，但是只能被赋值，不能被修改
      }
    }
// 2.类式继承  [ 利用构造函数（类）继承的方式 ]
  function Aaa(){
    this.name = '小明';
    this.arr = [1,2,3]
  }
  Aaa.prototype.showName = function(){
    alert(this.name)
  }

  function Bbb(){}
  Bbb.prototype = new Aaa();   // 类式继承 面试：一句话完成继承。存在大量的问题
  
  var b1 = new Bbb();
  // 问题1
  // alert(b1.constructor)    // func Aaa()
  // 修正
  b1.constructor = Bbb

  // 问题2 
  b1.arr.push(4)

  var b2 = new Bbb();
  // b2.arr  // >  [1,2,3,4]  会受到影响

  // 修正 属性和方法继承的时候，要分开继承。
  var F = function(){}
  F.prototype = Aaa.prototype
  Bbb.prototype = new F();     // 此时不会继承属性， 属性用call继承
  Bbb.constructor = Bbb;
  //  function Bbb(){ Aaa.call(this) }


// 3.原型继承  [ 利用原型来实现对象继承 ]
  var a = { name:"小明" }
  var b = cloneObj(a)

  function cloneObj(obj){ 
    var F = function(){}   
    F.prototype = obj;
    return new F()
  }
```

### **组件开发之自定义事件**
``` javascript
  var oDiv = document.getElementById('div1');
  var oSpan = document.getElementById('span1');

  bindEvent(oDiv, 'click', function(){ alert(1) })
  bindEvent(oDiv, 'click', function(){ alert(2) })
  
  bindEvent(oSpan, 'show', function(){ alert(3) })
  bindEvent(oSpan, 'show', function(){ alert(4) })

  // fireEvent(oSpan, 'show')

  function bindEvent(obj, events, fn){
    // {
    //   show: [fn1, fn2],
    //   click: [fn3, fn4]
    // }

    obj.listener = obj.listener || {};                  
    obj.listener[events] = obj.listener[events] || [];
    obj.listener[events].push(fn)

    if(obj.addEventListener){
      obj.addEventListener(events, fn, false)
    }else{
      obj.attachEvent('on'+events, fn)
    }
  }

  function fireEvent(obj, events){    // 主动触发自定义事件
    for(var i=0; i<obj.listener[events].length; i++){
      obj.listener[events][i]()
    }
  }

```

# 你所不知道的Javascript(中)
## **CH2.值**
### **2.1.2数组**
	1.使用delete可以将单元从数组中删除，但是length属性不会发生变化
	2.如果字符串的键值能够被强制类型转换为十进制数字的话，他就会被当作数字索引来处理
		a["13"]=42;
		a.length         // -> 14
		
	3.
### **2.1.2数组方法**
``` javascript
  join()
  var arr = [1,2,3];
  console.log(arr.join());     // 1,2,3
  console.log(arr.join("-"));   // 1-2-3
  console.log(arr);          // [1, 2, 3]（原数组不变）
	
  push()     //返回修改后数组的长度
  pop()      //返回移除的项
  shift() 
  unshift()
  sort()
  reverse()
  concat()
  slice()
  splice()
  indexOf()和 lastIndexOf() //（ES5新增）
  forEach() //（ES5新增）
  map() //（ES5新增）
  filter() //（ES5新增）
  every() //（ES5新增）
  some() //（ES5新增）
  reduce()  //（ES5新增）
  reduceRight() //（ES5新增）
```

# 我所不知道的Javascript
### **2.1.2让页面处于编辑状态**
``` javascript
document.body.contentEditable='true'; //Chrome(Chromium)
document.designMode='on';  //Firefox(Gecko)
```

### **2.1.2避免Switch**
![switch优化](https://github.com/aaamrh/learnnotes/blob/master/images/js/scroll.png)
 

# 学习ES6遇到的错误
### 1.
``` javascript
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
```

### 2．
``` javascript
function f() { console.log('I am outside!'); }

(function () {
  if (false) {
    // 重复声明一次函数f
    function f() { console.log('I am inside!'); }
  }

  f();
}());
// 在 ES5 中运行，会得到"I am inside!"，因为在if内声明的函数f会被提升到函数头部，实际运行的代码如下。
// ES5 环境   IE8下等
function f() { console.log('I am outside!'); }

(function () {
  function f() { console.log('I am inside!'); }
  if (false) {}
  f();
}());
``` 

# H5
### **历史管理**
``` javascript
// onhashchange 改变hash值来管理
window.onhashchange = f(){}   // hash改变后出发  eg: 随机彩票
```