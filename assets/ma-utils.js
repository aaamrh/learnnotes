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
          } 
    }
})();

// export default utils;