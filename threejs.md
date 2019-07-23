# Three.js

> 学习资料
> 模型查看工具： ParaView, Blender
> 模型下载网页： https://www.cc.gatech.edu/projects/large_models/

### **四大组件**
**1. 场景**
``` javascript
   THREE.Sence = function(){}
```

**2. 相机**

> [相机参数详细说明](http://www.hewebgl.com/article/getarticle/59)

``` javascript
    /* 透视相机：近视物体大，远视物体小 */
    THREE.PerspectiveCamera = function(fov, aspect, near, far){}

    camera = new THREE.PerspectiveCamera(45, width/height, 1, 10000)
    // !!! up和lookAt方向 必须垂直
    camera.up.x = 0;
    camera.up.y = 0;
    camera.up.z = 1;
    camera.lookAt({
        x:0,
        y:0,
        z:0
    })
    

    /* 正投影相机：远处物体和近处物体一样大 */

    /* 更新相机参数 */
    camera.fov = 100;
    camera.updateProjectionMatrix(); // Updates the camera projection matrix. Must be called after any change of parameters
   
```

**3. 渲染器**

``` javascript
    THREE.WebGLRenderer()

    renderer = new THREE.WebGLRenderer({
        antialias:true // 抗锯齿
    })

    /* 屏幕大小改变时，模型进行自适应 */
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
```

**4. 几何体**

```javascript
    // 几何体就是显示在场景中的对象
    // 点，颜色，面
    geometry.vertices = []
    geometry.colors = []
    geometry.faces = []

    geometry.vertices.push(
        new THREE.Vector3(1,1,1),
        new THREE.Vector3(0,0,10)
    )
```

------
```javascript
    // 初始化代码
    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000)
    var renderer = new THREE.WebGLRenderer();

    renderer.setClearColor('#FFFFFF'); // 场景背景颜色
    renderer.setSize(window.innerWidth, window.innerHeight) //setSize设置场景大小

    document.body.appendChild(renderer.domElement)

    // 几何对象
    var geometry = new THREE.CubeGeometry(2,2,2)
    // 定义材质
    var material = new THREE.MeshBasicMaterial({color:'red'})

    var cube = new THREE.Mesh(geometry, material)

    // 设置对象的位置
    cube.position = new THREE.Vector3(0,0,0);

    scene.add(cube) // 向场景添加对象

    camera.position.z = 15;

    function render(){
        requestAnimationFrame(render);
        cube.rotation.x += 0.01;
        renderer.render(scene, camera)
    }

    render();   
```

### 点
```javascript
THREE.Vector3 = function(x,y,z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

var a = new THREE.Vector3(1,0,0)

```

### 线
```javascript
// 第三个参数是 链接点的方式
var line = new THREE.Line(geometry, material, THREE.LineSegments);
```

### 坐标
```javascript
var axisHelper = new THREE.AxisHelper(4);
scene.add(axisHelper)

// 将坐标系和立方体组合到一起
var objTotal = new THREE.Object3D();
objTotal.add(cube)
objTotal.add(axisHelper)
scene.add(objTotal);// 此时要注释掉 scene.add(axisHelper)， scene.add(cube)

// 它几乎和Object3D是相同的，其目的是使得组中对象在语法上的结构更加清晰
var group = new THREE.Group();
group.add( cube );
group.add( axisHelper );

scene.add( group );
```

### 材质
```javascript
/* 
    线材质 LineBasicMaterial = function(params){}

    color: 线条颜色 16进制，默认白色
    LineWidth: 线条宽度
    LineCap: 线条两端的外观，默认圆角
    LineJoin: 两个线条链接处的外观， 默认round
    VertexColors: 定义线条材质是否使用顶点颜色，boolean值
*/

 /**
  * 物体能够接受阴影的材质有：
  * MeshLambertMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshToonMaterial, RawShaderMaterial, ShadowMaterial
  * 
  * 
 */

```

------
### 光源
```javascript
THREE.Light = function(color){}

THREE.AmbientLight // 环境光, 就像阴天，不知道太阳在哪个方向，环境光的位置是没有意义的
THREE.AreaLight //区域光
THREE.DirectionalLight(hex, intensity·) //方向光，没有衰减的平行光
THREE.SpotLight // 聚光灯
THREE.PointLight // 点光源
```

### 纹理
    文理类:
    THREE.Texture(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy)

    属性:
        image: 图片类型
        mapping: 纹理被怎么映射到物体上
        wrapS: x轴回环方式
        wrapT: y轴回环方式
        offset: 偏移量

    纹理加载类 ImageUtils
        THREE.TextureLoader()

    回环效果
    THREE.RepeatWrapping = 1000 // 简单重复
    THREE.ClampToEdgeWrapping = 1001 // 边缘拉伸
    THREE.MirroredRepeatWrapping = 1002 // 镜像重复

```javascript
    var geometry = new THREE.PlaneGeometry(100,120);
    var material;

    var loader = new THREE.TextureLoader();

    loader.load('../images/1.jpg', 
        function(texture){
            console.log('load加载完后执行')
            material = new THREE.MeshBasicMaterial({
                map:texture
            })
            mesh = new THREE.Mesh(geometry, material)
            scene.add( mesh );
        },
        function(xhr){
            console.log((xhr.loaded/xhr.total * 100) + '% loaded');
        },
        function(xhr){
            console.log('errors')
        }
    ) 
    console.log('load加载完先执行')

    function change(){
        if(texture != null){
            texture.repeat.x = texture.repeat.y = para.repeat;
            texture.wrapS = texture.wrapT = para.wrap;
            // 更新属性后要调用 needsUpdate 
            texture.needsUpdate = true;
        }
    }
```
------
## **模型加载**
> 7-1, 8-1
```javascript

```

### OBJ模型详解
    OBJ模型行关键字
    - 顶点数据
        v  几何体顶点
        vt 贴图坐标点
        vn 顶点法线
        vp 参数空格顶点
    - 自由形态曲线
        deg 度
        bmat 基础矩阵
        step 步尺寸
        cstype 曲线或表面类型


### 鼠标选中物体
``` javascript
/* 
    Raycaster 是用来实现拾取的一个简单类 
    origin: 光线发射出去的地方
    direction: 归一化的方向向量
    near: 光线发射最近的距离
    far: 光线发射最远的距离 
*/
THREE.Raycaster = function(origin, direction, near, far){}

/* 
    通过摄像机和鼠标位置更新射线
    coords: 鼠标的位置，是一个归一化的设备坐标，必须在 -1 到 1 之间
    camera: 光线起源的位置
*/
setFromCamera:function(coords, camera)

/* 哪些对象和他相交 */
intersectObject: function(objects, recursive){}


```