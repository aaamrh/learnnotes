/*
 * @ Author: marh
 * @ Create Data: 2018-10-10
 * @ Updated Date: 2019-07-09
 * @ Version: 1.2.0
 * 
 * 添加了 genKey(),  用于生成 id
*/

// import './utils.css'
export const utils = (function(){
    return {
      assert: function(value, desc){
          let li = document.createElement('li');
          li.className = value ? "pass" : "fail";
          li.innerHTML = desc;
          document.getElementById('j-assert').appendChild(li);
      },
      html2node: function(str) {
          let container = document.createElement('div');
          container.innerHTML = str;
          return container.children[0];
      },
      addClass: function (node, className){
          let current = node.className || "";
          if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
            node.className = current ? ( current + " " + className ) : className;
          }
        },
      delClass: function (node, className){
          let current = node.className || "";
          node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
      },
      extend: function(father, child){
          for(let attr in father){
            child[attr] = father[attr]
          }
      },
      bindEvent: function(obj, ev, fn){  
          obj.events = obj.events || {};
          obj.events[ev] = obj.events[ev] || [];
    
          obj.events[ev].push(fn);
    
          if(obj.addEventListener){
            obj.addEventListener(events, fn, false)
          }else{
            obj.attachEvent('on'+events, fn)
          }
      },
      fireEvent: function(obj, events){    
          for(let i=0; i<obj.listener[events].length; i++){
            obj.listener[events][i]()
          }
      },
      isEmptyObj: function(o){
          let str = JSON.stringify(o)
          return str == '{}'
      },
      genKey : function (prefix){
        let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let len = 6;
        let result = prefix || '';
      
        for(let i=0; i<len; i++){
          result += str[ Math.floor(Math.random()*str.length) ]
        }
      
        return result;
      },
      genDateStr: function(){
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
  
        if (month < 10) { month = "0" + month }
        if (day < 10) { day = "0" + day }
        if (hour < 10) { hour = "0" + hour }
        if (minute < 10) { minute = "0" + minute }
        if (second < 10) { second = "0" + second }
  
        return "" + year + month + day + hour + minute + second;
      },
      switchLoading: function(){
        var htmlstr = ' \
          <div class="m-loading">\
            <img src="../src/imgs/loading.png" alt="加载中...">\
          </div>\
        ';
      
        var node = document.getElementsByClassName('m-loading')[0];
      
        node ? document.body.removeChild(node) : document.body.appendChild( _utils.html2node(htmlstr));
      
        /* loading样式 只需找一个loading 图片
          .m-loading{
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, .6);
          }
      
          .m-loading img{
            position: absolute;
            animation: loading 1s linear infinite;
            top: 50%;
            margin-top: calc(-64px / 2);
            margin-left: calc(-64px / 2);
            height: 64px;
            width: 64px;
          }
          @keyframes loading{
            from{transform: rotate(0deg);}
            to{transform: rotate(360deg);}
          }
        */
      }
    }
})();

// export default utils;