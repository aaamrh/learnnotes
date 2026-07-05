
# 四大组件

| 组件                  | 干什么     | 最小理解           |
| ------------------- | ------- | -------------- |
| `Activity`          | 一个屏幕/页面 | 你看到的界面         |
| `Service`           | 后台任务    | 没界面，做播放、同步、定位等 |
| `BroadcastReceiver` | 接收广播事件  | 系统/应用发消息，它来响应  |
| `ContentProvider`   | 对外提供数据  | 别的组件通过统一接口查数据  |


| Android                  | 前端类比                                        | 作用           |
| ------------------------ | ------------------------------------------- | ------------ |
| `Activity`               | 页面组件 / Route Page                           | 一个页面         |
| `Service`                | 全局后台模块 / Web Worker / store service         | 不属于某个页面的长期逻辑 |
| `Intent`                 | action/message/event payload                | 传递“我要干什么”    |
| `startService(intent)`   | `dispatch(action)` / `worker.postMessage()` | 发命令让后台模块开始干活 |
| `onStartCommand(intent)` | action handler / `worker.onmessage`         | 后台模块收到命令     |
| `bindService()`          | `useStore()` / `connectService()`           | 页面连接后台模块     |
| `onBind()`               | 返回 store/API client/service handle          | 把可调用接口交给页面   |
## Acticity 

![[Pasted image 20260628200238.png]]
![[Pasted image 20260628200454.png]]


![[Pasted image 20260628205946.png]]

## Service服务 

![[Pasted image 20260628202554.png]]
## BroadcastReceiver广播接收器 
![[Pasted image 20260628204553.png]]


![[Pasted image 20260628204644.png]]

不同应用之间也能用广播

## Content Provider内容提供者






# Handler

| 前端                 | Android                                          |
| ------------------ | ------------------------------------------------ |
| Web Worker         | `Thread` / `HandlerThread`                       |
| `postMessage(...)` | `handler.post(...)` / `handler.sendMessage(...)` |
| `onmessage`        | `Handler` 处理任务                                   |
| 主线程 UI             | Android 主线程 UI                                   |

# NDK 编程

```
在 Android 里写 C / C++ 代码
然后让 Kotlin / Java 去调用它
```

```
NDK = Native Development Kit
```


`JNI` 是桥。

```
Kotlin / Java 代码
    ↓ JNI
C / C++ 代码
```