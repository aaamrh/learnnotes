# Vue

## vue2 VS vue3

> Vue 2 的响应式机制是基于 Object.defineProperty() 这个 API 实现的，此外，Vue 还使
> 用了 Proxy，这两者看起来都像是对数据的读写进行拦截，但是 defineProperty 是拦截具
> 体某个属性，Proxy 才是真正的“代理”。  

我们首先看 defineProperty 这个 API，defineProperty 的使用，要明确地写在代码里，下面是示例代码：
``` js
Object.defineProperty(obj, 'title', {
    get() {},
	set() {},
})
```

当项目里“读取 obj.title”和“修改 obj.title”的时候被 defineProperty 拦截，但 defineProperty 对不存在的属性无法拦截，所以 Vue 2 中所有数据必须要在 data 里声明。而且，如果 title 是一个数组的时候，对数组的操作，并不会改变 obj.title 的指向，虽然我们可以通过拦截.push 等操作实现部分功能，但是对数组的长度的修改等操作还是无法实现拦截，所以还需要额外的 $set 等 API  



而 Proxy 这个 API 就是真正的代理了，我们先看它的用法：

```js
new Proxy(obj, {
    get(key) { },
    set(key, value) { },
}
```

需要注意的是，虽然 Proxy 拦截 obj 这个数据，但 obj 具体是什么属性，Proxy 则不关心，统一都拦截了。而且 Proxy 还可以监听更多的数据格式，比如 Set、Map，这是 Vue2 做不到的。
当然，Proxy 存在一些兼容性问题，这也是为什么 Vue 3 不兼容 IE11 以下的浏览器的原因。

##  Vue3 特性

使用 `ref()` 包裹返回的就是响应式的数据： `let count = ref(1); count.value ++ `, 对于 ref 返回的响应式数据，我们需要修改 .value 才能生效, 而**在 <script setup> 标签内定义的变量和函数，都可以在模板中直接使用** 。



`computed `是单独引入使用

```js
import { ref,computed } from "vue";

...

let active = computed(() => {
	return todos.value.filter((v) => !v.done).length;
});
```



通过 JavaScript 的变量实现 CSS 的样式修改  

```vue
<script>
    function add() {
        count.value++
        color.value = Math.random()>0.5? "blue":"red"
    }
</script>
<style scoped>
    h1 {
    	color:v-bind(color);
    }
</style>
```



`reactive` 函数可以把一个对象变成响应式数据， reactive 就是基于 Proxy 实现的  



`watchEffect`

```vue
// 数据变化之后会把数据同步到 localStorage 之上
watchEffect(()=>{
	localStorage.setItem('todos',JSON.stringify(todos.value))
})
```



Vue 3 中还有另一个响应式实现的逻辑，就是利用对象的 get 和 set 函数来进行监听，这种响应式的实现方式，只能拦截某一个属性的修改，这也是 Vue 3 中 ref 这个 API 的实现  



**`defineEmit`**  

```vue
// 子组件
<template>
	省略代码
	<span @click="onRate(num)" @mouseover="mouseOver(num)" v-for='num in 5' :ke
</template>

<script setup>
    import { defineProps, defineEmits,computed, ref} from 'vue';

    let emits = defineEmits('update-rate') // 定义emits
    function onRate(num){
    	emits('update-rate',num) // 向父元素发射数据
    }
</script>

// 父组件
<template>
    <h1>你的评分是 {{score}}</h1>
    <Rate :value="score" @update-rate="update"></Rate>
</template>
<script setup>
    import {ref} from 'vue'
    import Rate from './components/Rate1.vue'

    let score = ref(3.5)
    function update(num){
    	score.value = num
    } 
</script>

```



**动画**

使用内置的`transition`组件

```vue
<transition name="fade">
	<h1 v-if="showTitle">你好 Vue 3</h1>
</transition>
```



**Vuex**

> 什么时候的数据用 Vuex 管理，什么时候数据要放在组件内部使用 ref 管理呢？  
>
> 答： 对于一个数据，如果只是组件内部使用就是用 ref 管理；如果我们需要跨组件，跨页面共享的时候，我们就需要把数据从 Vue 的组件内部抽离出来，放在 Vuex 中去管理  

```js
import { createStore } from 'vuex'
const store = createStore({
    state () {
        return {
        	count: 666
        }
    },
    mutations: {
        add (state) {
            state.count++
        }
    }
})

app.use(store)
```

``` vue
<template>
    <div @click="add"> {{count}} </div>
</template>
<script setup>
    import { computed } from 'vue'
    import { useStore } from 'vuex'

    let store = useStore()
    let count = computed(()=>store.state.count) // count 不是使用 ref 直接定义，而是使用计算属性返回了 store.state.count
    
    function add(){
        store.commit('add') // 要使用 store.commit(‘add’) 去触发Vuex中的 mutation 来修改状态
    }
</script>
```



**路由**

Hash => xx.com/#/app   hashChange监听变化

Router => xx.com/app   popstate 监听变化



**JSX**

`h`

```vue
<h1 v-if="num==1">{{title}}</h1>
<h2 v-if="num==2">{{title}}</h2>
<h3 v-if="num==3">{{title}}</h3>
<h4 v-if="num==4">{{title}}</h4>
<h5 v-if="num==5">{{title}}</h5>
<h6 v-if="num==6">{{title}}</h6>
```



```js
// Heading.jsx

import { defineComponent, h } from 'vue'
export default defineComponent({
    props: {
        level: {
            type: Number,
            required: true
        }
    },
    setup(props, { slots }) {
    	return () => h(  // h 函数内部也是调用 createVnode 来返回虚拟 DOM。
            'h' + props.level, // 标签名
            {}, // prop 或 attribute
            slots.default() // 子节点
    	)
    }
})
```

```vue
<template>
	<Heading :level="3">hello geekbang</Heading>
</template>
<script setup>
	import Heading from './components/Head.jsx'
</script>
```

> 手写的 h 函数，可以处理动态性更高的场景。但是如果是复杂的场景，h 函数写起来就显得非常繁琐，需要自己把所有的属性都转变成对象。并且组件嵌套的时候，对象也会变得非常复杂。不过，因为 h 函数也是返回虚拟 DOM 的，所以有没有更方便的方式去写 h 函数呢？答案是肯定的，这个方式就是 JSX  