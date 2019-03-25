### 使用说明
```javascript

    //第一步
    var $ = go.GraphObject.make;
    myDiagram = $(go.Diagram, "myDiagramDiv");  

    //第二步 创建数据数据
    var nodeDataArray = [
        {key:"Alpha", color:'red'},
        {key:"Beta"},
        {key:'C', isGroup:true},                             // 分组
        {key:'D', color:'pink', group:'C' },
        {key:'E', color:'orange', group:'C' }
    ];
    var linkDataArray = [
        {to:"Beta", from:"Alpha", color:'green'},
        {to:"C", from:"Beta"}
    ];

    // 第三步: 实例化
    // GoJS model有三种，Model, GraphLinksModel, TreeModel
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray)


    /*
        图形样式： templates
        nodes样式：nodeTemplate(s)
        link样式： linkTemplate(s)
    */
    myDiagram.nodeTemplate = $(go.Node, "Auto",
        $(go.Shape, "RoundedRectangle", 
            {fill:'white'},
            new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, 'text',
            {margin:10},    // Node 属性
            new go.Binding('text', 'key')
        )
    )
    myDiagram.linkTemplate = $(go.Link,
        $(go.Shape,
            { strokeWidth:3 },
            new go.Binding("stroke", "color")
        ),  //  链接线形状  
        $(go.Shape, {toArrow:"Standard", stroke:null},
            new go.Binding("fill", "color")
        )   // 箭头形状
    )

    // 布局
    myDiagram.layout = $(go.CircularLayout);
```
### Parts && Panels
   - Part
      - Panel1
        - GraphObj (Shape, TextBlock, Picture)
        - GraphObj
      - Panel2  
    
    Nodes,Links,Groups and Adornments are all GoJS Parts


```javascript
    // GraphObjects
    $(go.<GraphObj type>,
        "optional type-specific property",
        {k:v}
    )

    /* Panel  
    由GraphObj组成, Parts(Nodes,Links,Groups,Adornments)是Panel的子类。

    Panel类型决定了元素的构成: Position, Vertical/Horizontal, Spot, Auto。
    */

    // Position Panels
    myDiagram.add(
        $(go.Part, "Position",
            $(go.Shape, "RoundedRectangle",{fill: "white"}),
            $(go.TextBlock, "some Text", { opsition: new go.Point(50,20) })
        )
    )

    // Vertical Panels
    myDiagram.add(
        $(go.Part, "Vertical",
            $(go.Shape, "RoundedRectangle",{fill: "white"}),
            $(go.TextBlock, "some Text", { 
                background:"lightgray",
                alignment: go.Spot.Right,
                stretch: go.GraphObject.Fill,
                textAlign: "right"
             })
        )
    )

    // Horizontal Panels
    myDiagram.add(
        $(go.Part, "Horizontal",
            $(go.Shape, "RoundedRectangle",{fill: "white"}),
            $(go.TextBlock, "some Text", { 
                background:"lightgray",
                alignment: go.Spot.Bottom,
                stretch: go.GraphObject.Fill,
                verticalAlignment: go.Spot.Bottom
             })
        )
    )
 
    // Spot/Auto Panels
    myDiagram.add(
        $(go.Part, "Spot",
            $(go.Shape, "RoundedRectangle",{fill: "white"}),
            $(go.TextBlock, "some Text", { 
                //aligment: go.Spot.topLeft
                aligment: new go.Spot(1, 0.5, -20, 20),// 后两个是文字的位置
                alignmentFocue: go.Spot.TopLeft
            })
        )
    )

    myDiagram.add(
        $(go.Part, "Auto",  // 至少有两个元素
            {desiredSize: new go.Size(250, 250)},
            $(go.Shape, "RoundedRectangle",{fill: "white"}),
            $(go.TextBlock, "some Text", { 
                //aligment: go.Spot.topLeft
                aligment: new go.Spot(1, 0.5, -20, 20),// 后两个是文字的位置
                alignmentFocue: go.Spot.TopLeft
            })
        )
    )
``` 
----
#### Vertical Panels :
 
![vertical panels](/images/vertical.png)

----

    Modifying Models:
        Model.addNoteData Model.removeNodeData Model.findNodeDataForKey
        Set data property: Model.set(<data obj>, <target property>, <property value>)  
     
    Saving/Loading Models:
        get model JSON: Model.tiJson() 
        load Model from JSON: Model.fromJson(<JSON str>)

```javascript
var file = myDiagram.model.toJson()
myDiagram.model = go.Model.fromJson(file)
```

----
### Templates (nodeTemplateMap, linkTemplateMap, groupTemplateMap)
> see **templates.htm** for details

    <template map>.add(<key>, <Part>)  

    myDiagram.nodeTemplateMap.add("Square",
        $(go.Node, "Auto",
            $(go.Shape,"Rectangle",
                {fill:"color", height:100, width:100},
                new go.Binding("fill","color")
            ),
            $(go.TextBlock, {margin:2},
                new go.Binding("text","key")
            )
        )
    )

    // Conversion function
    myDiagram.nodeTemplateMap = (
        $(go.Node, "Auto",
            $(go.Shape,"Rectangle",
                {fill:"color", height:100, width:100},
                new go.Binding("fill","color", function(c){
                    if(c==0) return 'red';
                    if(c==1) return 'blue';
                })
            ),
            $(go.TextBlock, {margin:2},
                new go.Binding("text","key")
            )
        )
    )

    myDiagram.model = new go.GraphLinksModel(
        [
            {key:"A", color:0},
            {key:"B ", color:1},
            {key:"C", color:2}
        ]
    )
---

### **GraphObj properties**
```javascript

$(go.TextBlock, "Group",{
    text:'Example',
    font:'黑体',
    stroke:'purple',
    editable: true
}),

$(go.Shape, "Rectangle", 
    {
        fill:"white",
        figure:'Ellipse',
        stroke:'purple',
        strokeWidth:10,
        desiredSize: new go.Size(30,30)
    }
),

$(go.Picture, "http://placebear.com/300/200", 
    {
        desiredSize: new bo.Size(100,100),
        margin :new go.Margin(1,2,3,4)
    }
)

```

### **Parts properties**
```javascript
$(go.Node, "Vertical",
    {
        selectable:true,
        deletable:true,
        resizeable:true,
        rotateable:true.
        resizeObjectName:"PANEL"
    }
)
```
---
## **Layout**
```javascript

var myDiagram =
    $(go.Diagram, "myDiagramDiv", {
        "undoManager.isEnabled": true, 
        initialContentAlignment: go.Spot.Center,
        layout: $(go.TreeLayout,
        {
            angle: 90,
            layerSpacing: 35,
        })
    });
```

### Grid Layout
```javascript

myDiagram.nodeTemplate = $(go.Node,"Auto",
    {locationSpot:go.Spot.Center},    //  A
    $(go.Shape,"RoundedRectangle",{fill:'white'}),
    $(go.TextBlock,'text',
        new go.Binding("text",'key')
    )
    
)

myDiagram.model =$(go.GraphLinksModel,
    {
        nodeDataArray:[
            {key:'A'},
            {key:'B'},
            {key:'C'},
            {key:'D'},
            {key:'E'},
            {key:'F'},
            {key:'G'},
            {key:'H'}
        ],
        linkDataArray:[
            {from:'A', to:"B"},
            {from:'A', to:"C"},
            {from:'B', to:"C"},
            {from:'C', to:"E"},
            {from:'E', to:"F"},
            {from:'F', to:"G"},
            {from:'F', to:"H"},
        ]
    }
)
myDiagram.layout = 
    $(go.TreeLayout,
        {
            wrappingColumn:3,
            wrappingWidth:NaN,
            cellSize: new go.Size(NaN,NaN),
            spacing: new go.Size(10, 10),
            alignment: go.GridLayout.Location,   //  A
            sorting: go.GridLayout.Reverse,      //  .Ascending
            comparer:function(a,b){              //  根据字母排序
                    if(a.data.key < b.data.key) return -1;
                    if(a.data.key > b.data.key) return 1;
                    return 0;
                }
        }
    );

```
----

### Tree Layout
```javascript
myDiagram.layout = 
    $(go.TreeLayout,
        {
            angle: 90,
            layerSpacing: 20,
            nodeSpacing: 100,
            alignment: go.TreeLayout.AlignmentStart,
            sorting: go.TreeLayout.SortingAscending,
            comparer: function(a,b){
                a = a.node;
                b = b.node;
                if(a.data.key < b.data.key) return -1;
                if(a.data.key > b.data.key) return 1;
                return 0;
            },
            treeStyle: go.TreeLayout.StyleRootOnly,
            alternateAngle: 90  
        }
    );
```

### CircularLayout
```javascript
myDiagram.layout = 
    $(go.CircularLayout,
        {
            spacing: 70,
            radius: 150,
            startAngle: 90,
            sweepAngle: 180,
            aspectRatio:.5,      //   > 1 是立椭圆，< 1 是横椭圆
            direction:go.CircularLayout.Clockwise,
            sorting:go.CircularLayout.Forwards
        }
    );
```

---
## Tools 

### **Resize Tool**
```javascript
myDiagram.nodeTemplate = $(go.Node, "Vertical",
    {
        resizable: true,
        resizeObjectName:"SHAPE",
        resizeCellSize: new go.Size(1,1),
        resizeAdornmentTemplate:$(go.Adornment,"Spot",
            $(go.Placeholder),
            $(go.Shape,{
                alignment:go.Spot.Right,
                stroke:"red", fill:'yellow',desiredSize: new go.Size(9,9), cursor:"col-resize"
            }),
            $(go.Shape,{
                alignment:go.Spot.Bottom,
                stroke:"red", fill:'yellow',desiredSize: new go.Size(9,9), cursor:"row-resize"
            })

        )
    },
    $(go.Shape, "RoundedRectangle", {fill:'green', name:"SHAPE",minSize: new go.Size(20,20), maxSize: new go.Size(100,300)}),
    $(go.TextBlock, {margin:8},
        new go.Binding("text", 'key')
    )
    
    
)
```
---
### Rotated Tool
```javascript

myDiagram.nodeTemplate = $(go.Node, "Vertical",
    {
        rotatable: true,
        locationSpot: go.Spot.Center,
        rotateObjectName: 'Shape'
    },
    $(go.Shape, "RoundedRectangle", {fill:'green', name:'Shape'}),
    $(go.TextBlock, {margin:8},
        new go.Binding("text", 'key')
    )
    
    
)
myDiagram.toolManager.rotatingTool.snapAngleEpsilon = 45; 
```

### **Relinking Tools**
```javascript
myDiagram.nodeTemplate = $(go.Node, "Auto",
            $(go.Shape, "RoundedRectangle", 
                {
                    fill:'green', 
                    portId:'',                  // ***
                    fromLinkable: true,         // ***
                    toLinkable: true            // ***
                },
            ),
            $(go.TextBlock, {margin:8, },
                new go.Binding("text", 'key')
            )
        )

            
        myDiagram.linkTemplate = 
            $(go.Link, 
            { relinkableFrom:true, relinkableTo:true},  // ***
            $(go.Shape),
            $(go.Shape, {toArrow:"Standard"})
        )

        myDiagram.model = $(go.GraphLinksModel,
            {
                nodeDataArray:[
                    {key:'A'},
                    {key:'B'},
                    {key:'C'},
                    {key:'D'},
                ],
                linkDataArray:[
                    {from:'A', to:"B"},
                ]
            }
        )

```


### LinkReshaping Tool
```javascript
myDiagram.linkTemplate = 
    $(go.Link, 
        {
            reshapable:true,
            routing:go.Link.Orthogonal, 
            resegmentable:true
        },
        $(go.Shape),
        $(go.Shape, {toArrow:"Standard"})
    )
``` 

### Palette
```javascript
myDiagram =
    $(go.Diagram, "myDiagramDiv",
        {   
            allowDrop: true, // must be true to accept drops from the Palette
        }
    )

myPalette =
    $(go.Palette, "myPaletteDiv",
        { 
            layout: $(go.GridLayout,
                {
                    alignment: go.GridLayout.Location,

                    // share the templates used by myDiagram
                    nodeTemplateMap: myDiagram.nodeTemplateMap,
                }
            )
        });

myDiagram.nodeTemplate =
    $(go.Node, "Vertical",
        { locationObjectName: "TB", locationSpot: go.Spot.Center },
        $(go.Shape,
            { width: 20, height: 20, fill: "white" },
            new go.Binding("fill", "color")
        ),
        $(go.TextBlock, { name: "TB" },
            new go.Binding("text", "color")
        )
    );

myPalette2.model.nodeDataArray = [
    { key: "IR", color: "indianred" }
];
```


### Button点击事件
``` javascript
    objGo("Button", 
            {
                click: uploadFile,
                visible: false
            },
            objGo(go.TextBlock, "上传图片"),
            new go.Binding('visible', 'btnShow'),
        ),

    function uploadFile(ev, obj){
        //  获取到对应的 节点
        var node = obj.part;
        var data = node.data;
    }


```


## Events
``` javascript
var nodes=myDiagram.nodes;

//遍历输出节点对象
nodes.each(function (node) { console.log(node.data.text); });


//  选中单个节点（不能批量选中）
myDiagram.select(node);


// 帮点对象单机事件
myDiagram.addDiagramListener("ObjectSingleClicked", function(e) {
//Select_Port = e.subject.part.data.key;    e.subject.part.data即获取到的data
    alert(e)
});


//获取节点对象	
var node=myDiagram.findNodeForKey('key');
//获取节点data	
var nodeData=myDiagram.model.findNodeDataForKey('key');


node.findNodesOutOf() //查找节点的下一级节点
node.findNodesInto()// 查找节点的上一级节点


// 通过节点的属性和属性值查找
//通过节点的样式找 => 节点样式是 nodeStyleOne
myDiagram.findNodesByExample({"category":"nodeStyleOne"})


// 也可以查找多个属性并存的节点，反正传的是一个对象 比如
var res=myDiagram.findNodesByExample({
    "category":"nodeStyleOne",
    "name":33
    //这样就是查找 category为  nodeStyleOne，name为33的节点
})

//找当前节点的下一连线
node.findLinksOutOf()
node.findLinksInto()   //  上一个连线

// 添加连线
myDiagram.model.addLinkData({ from: "Alpha", to: "Beta" });

// 查找 Panel(Nodes, Links, Groups) 内部的 GraphObject(TextBlock, Shape, Picture)并修改其信息。
myPalette.nodeTemplate =
    objGo(go.Node, "Vertical",
        ... ,
        objGo(go.Picture,
            { name:'img', source:'./2.png' },
            new go.Binding('source')
        )
    );

node.findObject('img').source = '2.png';

```