# Responsive Web Design

## **语法:**

    `@media mediatype and|not|only (media feature) { css... }`

## c**媒体属性(media feature):**

    width:          视口宽度
    height:         视口高度
    device-width:   设备宽度
    device-height:  设备高度
    orientation:    检查设备是处于横向还是纵向
    aspect-retio:   基于视口宽度和高度的宽高比
    color:          每种颜色的位数bits 如: min-color:16位, 8位
    device-aspect-ratio: 渲染表面的宽度，也就是设备的宽度.
    resolution:     检测屏幕或者打印机的分辨率，如: min-resolution:300dpi
    ... ...

## **IE条件注释**

``` html

    <!--[if IE 5]>仅IE5.5可见<![endif]-->
    <!--[if gt IE 5.5]>仅IE 5.5以上可见<![endif]-->
    <!--[if lt IE 5.5]>仅IE 5.5以下可见<![endif]-->
    <!--[if gte IE 5.5]>IE 5.5及以上可见<![endif]-->
    <!--[if lte IE 5.5]>IE 5.5及以下可见<![endif]-->
    <!--[if !IE 5.5]>非IE 5.5的IE可见<![endif]-->

```

## **可编辑的css**

``` html
<style>
body style{
    display:block;
    padding:0.6em 0.8em; 
    border:1px dashed #ccc; 
    background-color:#f5f5f5; 
    color:#000; 
    white-space:pre-wrap; 
    word-wrap:break-word;
}
</style>

<body>
    <style contentEditable>
        .a{  background-color: #fff; }
    </style>
</body>   

```

## **safari中flex布局时img宽高等比缩放自适应问题**

``` html
    <div class="flexBox">
        <img src="image.jpg" alt="img"/>
    </div>
```

```css
    .flexBox{
        display:flex;
        align-items:center; // 添加这行代码
    }
    
    .flexBox img{
        width:30%;
    }
```