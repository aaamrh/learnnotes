
var htmlstr,
    doc = document,
    nodeBody = doc.body ;

var myDiagram, myPaletteParts, myPaletteModel;

var btnPre = doc.getElementsByClassName('pre')[0];
var btnNext = doc.getElementsByClassName('next')[0];
var btnSave = doc.getElementById('SaveButton');
var btnLoad = doc.getElementById('LoadButton');

var uploadForm = doc.getElementById('uploadForm'),
    btnClear = doc.getElementsByClassName('j-clear')[0],
    btnCover = doc.getElementsByClassName('j-cover-module')[0],
    btnExec = doc.getElementsByClassName('j-exec')[0],
    btnUpload = doc.getElementsByClassName('j-upload')[0],
    btnRestart = doc.getElementsByClassName('j-restart')[0],
    btnTestPic = doc.getElementsByClassName('j-test-pic')[0];

var loading = doc.getElementsByClassName('m-loader')[0];

var formFiles = {};            // 存放所有input框选择的文件
var formData = new FormData(); // ajax上传表单的数据
var fileInput = null;          // 选择文件的input节点

var btnFalse = doc.getElementsByClassName('j-do')[0];
var undo = doc.getElementsByClassName('j-undo')[0];

// 人工检查的变量
var imgs = [],
  errImgs = [],
  errsList = doc.getElementsByClassName('errs')[0],
  manualCorrection = doc.getElementsByClassName('manual-correction')[0],
  checkPic = doc.getElementsByClassName('check-pic')[0];

// <img /> 当前显示的图片
checkPic.currentImg = null;


/** 点击清空myDiagram */
var DiagramTools = (function () {
  return {
    clearDiagram: function () {
      if (!myDiagram) {
        return
      };
      myDiagram.clear();
    },
  }
})();


btnClear.onclick = function () {
  console.log(DiagramTools.clearDiagram())
};

btnSave.onclick = save;
btnLoad.onclick = load;


function html2node(str) {
  var container = doc.createElement('div');
  container.innerHTML = str;
  return container.children[0];
}
/**
 * 初始化面板
 * ! 函数中重要的注释说明：搜索 NOTICE:
 * 
 * @method initGojs
 */
function initGojs() {
  if (window.goSamples) goSamples();
  var objGo = go.GraphObject.make;
  myDiagram = objGo(go.Diagram, "myDiagramDiv", {
    allowDrop: true,
    "draggingTool.dragsLink": true, // 是否允许拖拽连接线
    "linkingTool.isUnconnectedLinkValid": false,
    "linkingTool.portGravity": 20,
    "relinkingTool.isUnconnectedLinkValid": false,
    "relinkingTool.portGravity": 20,
    "relinkingTool.fromHandleArchetype": objGo(
      go.Shape,
      "Diamond", {
        segmentIndex: 0,
        cursor: "pointer",
        desiredSize: new go.Size(8, 8),
        fill: "tomato",
        stroke: "darkred"
      }
    ),
    "relinkingTool.toHandleArchetype": objGo(
      go.Shape,
      "Diamond", {
        segmentIndex: -1,
        cursor: "pointer",
        desiredSize: new go.Size(8, 8),
        fill: "darkred",
        stroke: "tomato"
      }
    ),
    "linkReshapingTool.handleArchetype": objGo(
      go.Shape,
      "Diamond", {
        desiredSize: new go.Size(7, 7),
        fill: "lightblue",
        stroke: "deepskyblue"
      }
    ),
    "undoManager.isEnabled": true
  });

  /**
   * !!! NOTICE:
   * '训练模型' 模式下当前的训练类型：品规训练、批次训练等
   * @prop testType { str } 
   */
  nodeBody.testType = '';


  //用例获取选中的节点或线
  var nodeOrLinkList = myDiagram.selection;
  nodeOrLinkList.each(function (nodeOrLink) {
    console.log(nodeOrLink.data);
  });
  //获取第一个选中的节点或线
  var nodeOrLink = myDiagram.selection.first();

  function makePort(name, spot, output, input) {
    // the port is basically just a small transparent square
    return objGo(go.Shape, "Circle", {
      fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
      stroke: null,
      desiredSize: new go.Size(7, 7),
      alignment: spot,
      alignmentFocus: spot,
      portId: name,
      fromSpot: spot,
      toSpot: spot,
      fromLinkable: output,
      toLinkable: input,
      cursor: "pointer"
    });
  }

  var nodeSelectionAdornmentTemplate = objGo(
    go.Adornment,
    "Auto",
    objGo(go.Shape, {
      fill: null,
      stroke: "deepskyblue",
      strokeWidth: 1.5,
      strokeDashArray: [4, 2]
    }),
    objGo(go.Placeholder)
  );

  var nodeResizeAdornmentTemplate = objGo(
    go.Adornment,
    "Spot", {
      locationSpot: go.Spot.Right
    },
    objGo(go.Placeholder),
    objGo(go.Shape, {
      alignment: go.Spot.TopLeft,
      cursor: "nw-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.Top,
      cursor: "n-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.TopRight,
      cursor: "ne-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.Left,
      cursor: "w-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.Right,
      cursor: "e-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.BottomLeft,
      cursor: "se-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.Bottom,
      cursor: "s-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    }),
    objGo(go.Shape, {
      alignment: go.Spot.BottomRight,
      cursor: "sw-resize",
      desiredSize: new go.Size(6, 6),
      fill: "lightblue",
      stroke: "deepskyblue"
    })
  );

  // var nodeRotateAdornmentTemplate = objGo(
  //   go.Adornment, {
  //     locationSpot: go.Spot.Center,
  //     locationObjectName: "CIRCLE"
  //   },
  //   objGo(go.Shape, "Circle", {
  //     name: "CIRCLE",
  //     cursor: "pointer",
  //     desiredSize: new go.Size(7, 7),
  //     fill: "lightblue",
  //     stroke: "deepskyblue"
  //   }),
  //   objGo(go.Shape, {
  //     geometryString: "M3.5 7 L3.5 30",
  //     isGeometryPositioned: true,
  //     stroke: "deepskyblue",
  //     strokeWidth: 1.5,
  //     strokeDashArray: [4, 2]
  //   })
  // );

  /**
   *  Pane Template
   */
  var defaultTemplate = objGo(
    // myDiagram.nodeTemplate = objGo(
    go.Node,
    "Spot", {
      locationSpot: go.Spot.Center,
    },
    new go.Binding(
      "location",
      "loc",
      go.Point.parse
    ).makeTwoWay(go.Point.stringify), {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    }, {
      resizable: false,
      resizeObjectName: "PANEL",
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate
    },
    new go.Binding("angle").makeTwoWay(),

    objGo(
      go.Panel,
      "Vertical", {
        name: "PANEL",
        background: "#0565af",
        padding: 1
      },
      // new go.Binding("desiredSize ", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
      objGo(
        go.Picture, {
          name: "img",
          source: "",
          width: 50,
          height: 50,
          background: "#fcfcfc",
          portId: "", // the default port: if no spot on link data, use closest side
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
          scale: 3,
        },
        new go.Binding('width', 'imgWidth'),
        new go.Binding('height', 'imgHeight'),
        new go.Binding('visible', 'picShow'),
        new go.Binding("source"),

      ),
      objGo(
        go.TextBlock, {
          name: 'tag',
          font: "400 12pt sans-serif",
          margin: new go.Margin(10, 0, 10, 0),
          maxSize: new go.Size(160, NaN),
          editable: true,
          stroke: 'white',

        },
        new go.Binding("text").makeTwoWay(),
        new go.Binding('visible', 'tagShow'),
      ),
      objGo("Button", {
          name: "uploadBtn",
          click: selectFile,
          visible: false
        },
        objGo(go.TextBlock, "选择文件"),
        new go.Binding('visible', 'btnShow'),
      ),

      new go.Binding('background', 'contentFill'),
    ),

    makePort("T", go.Spot.Top, false, true),
    makePort("L", go.Spot.Left, true, true),
    makePort("R", go.Spot.Right, true, true),
    makePort("B", go.Spot.Bottom, true, false), {
      mouseEnter: function (e, node) {
        showSmallPorts(node, true);
      },
      mouseLeave: function (e, node) {
        showSmallPorts(node, false);
      }
    }
  );

  var buttonTemplate = objGo(go.Node, "Auto", {
      locationSpot: go.Spot.Center
    },
    new go.Binding(
      "location",
      "loc",
      go.Point.parse
    ).makeTwoWay(go.Point.stringify), {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    },
    objGo(go.Shape, "Rectangle", {
      fill: "#ffc000"
    }),
    objGo(go.Panel, "Vertical", {
        margin: 3
      },
      objGo(go.TextBlock, {
          editable: true,
          font: "bold 12pt sans-serif",
          margin: 10

        },
        new go.Binding('text', 'btn-opt').makeTwoWay(),
      ),
      objGo("Button", {
          margin: 10,
          click: btnOpt,
        },
        objGo(go.TextBlock, "点击这里")
      ),
    ),
    makePort("T", go.Spot.Top, false, true),
    makePort("L", go.Spot.Left, true, true),
    makePort("R", go.Spot.Right, true, true),
    makePort("B", go.Spot.Bottom, true, false), {
      // handle mouse enter/leave events to show/hide the ports
      mouseEnter: function (e, node) {
        showSmallPorts(node, true);
      },
      mouseLeave: function (e, node) {
        showSmallPorts(node, false);
      }
    }
  );

  var processTemplate = objGo(
    go.Node,
    "Spot", {
      defaultStretch: go.GraphObject.Horizontal,
      locationSpot: go.Spot.Center,
    },
    new go.Binding(
      "location",
      "loc",
      go.Point.parse
    ).makeTwoWay(go.Point.stringify), {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    }, {
      resizable: false,
      resizeObjectName: "PANEL",
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate
    },
    new go.Binding("angle").makeTwoWay(),

    objGo(
      go.Panel,
      "Vertical", {
        name: "PANEL",
        background: "#0565af",
        padding: 1
      },
      // new go.Binding("desiredSize ", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
      objGo(go.Picture, {
          name: "img",
          source: "",
          width: 50,
          height: 50,
          background: "#fcfcfc",
          portId: "", // the default port: if no spot on link data, use closest side
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
          scale: 3,
          //scale: 2
        },
        new go.Binding('width', 'imgWidth'),
        new go.Binding('height', 'imgHeight'),
        new go.Binding('visible', 'picShow'),
      ),
      objGo(
        go.TextBlock, {
          name: 'tag',
          font: "400 12pt sans-serif",
          margin: new go.Margin(10, 0, 10, 0),
          editable: true,
          stroke: 'white',
          height: 40,
          alignment: go.Spot.Center
        },
        new go.Binding("text").makeTwoWay(),
        new go.Binding('visible', 'tagShow'),
      ),

      new go.Binding('background', 'contentFill'),
    ),

    // four small named ports, one on each side:
    makePort("T", go.Spot.Top, false, true),
    makePort("L", go.Spot.Left, true, true),
    makePort("R", go.Spot.Right, true, true),
    makePort("B", go.Spot.Bottom, true, false), {
      // handle mouse enter/leave events to show/hide the ports
      mouseEnter: function (e, node) {
        showSmallPorts(node, true);
      },
      mouseLeave: function (e, node) {
        showSmallPorts(node, false);
      }
    }
  )
  // 结果
  var resultTemplate = objGo(
    go.Node, "Vertical",
    new go.Binding(
      "location",
      "loc",
      go.Point.parse
    ).makeTwoWay(go.Point.stringify), {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    }, 
    new go.Binding("angle").makeTwoWay(), {
      defaultStretch: go.GraphObject.Horizontal,
      locationSpot: go.Spot.Center,

    },

    objGo(go.Panel, "Auto",

      objGo(go.Shape, "Rectangle", {
          fill: "#0565af",
          minSize: new go.Size(150, 60),
          stroke: '#0565af',
          strokeWidth: 1,
          portId: '',
          fromLinkable: true,
          toLinkable: true,
        },

      ),
      objGo(go.TextBlock, {
        margin: new go.Margin(2, 2, 0, 2),
        stroke: '#fff',
        text: "训练状态",
        textAlign: "center",
        font: "bold 12pt sans-serif"
      }, ),
      makePort("T", go.Spot.Top, false, true),
      makePort("L", go.Spot.Left, true, true),
      makePort("R", go.Spot.Right, true, true),
      makePort("B", go.Spot.Bottom, true, false), {
        // handle mouse enter/leave events to show/hide the ports
        mouseEnter: function (e, node) {
          showSmallPorts(node, true);
        },
        mouseLeave: function (e, node) {
          showSmallPorts(node, false);
        }
      }
    ),
    objGo(go.Panel, "Auto",
      objGo(go.Shape, "Rectangle", {
        fill: "#fff",
        minSize: new go.Size(150, 60),
        stroke: '#5089b0',
      }, ),
      // new go.Binding("fill", "role", function(r) { return r[0] === 'b' ? "lightgray" : "white"; })),
      objGo(go.TextBlock, {
          name: 'result',
          margin: new go.Margin(2, 2, 0, 2),
          textAlign: "center",
          text: '未开始训练',
          font: "400 12pt sans-serif",
        },
        new go.Binding("text").makeTwoWay()
      )
    ),
  )
  var chartTemplate = objGo(go.Node, "Spot", {
      locationSpot: go.Spot.Center,
      defaultStretch: go.GraphObject.Horizontal,
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), {
      selectable: true,
      selectionAdornmentTemplate: nodeSelectionAdornmentTemplate
    }, {
      resizable: true,
      resizeObjectName: "PANEL",
      resizeAdornmentTemplate: nodeResizeAdornmentTemplate
    },
    // the main object is a Panel that surrounds a TextBlock with a Shape
    objGo(go.Panel, "Auto", {
        name: "PANEL",
        margin: 10,
      },
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
      objGo(go.Shape, "Rectangle", {
          portId: "", // the default port: if no spot on link data, use closest side
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
          fill: "white", // default color
          strokeWidth: 2
        },
        new go.Binding("figure", 'chartFigure'),
        new go.Binding("fill", "chartFill")),
      objGo(go.TextBlock, {
          font: "400 12pt sans-serif",
          margin: 8,
          // maxSize: new go.Size(160, NaN),
          wrap: go.TextBlock.WrapFit,
          editable: true
        },
        new go.Binding("text", 'chartText').makeTwoWay(),
        new go.Binding("stroke", 'color')
      ),
    ),
    // four small named ports, one on each side:
    makePort("T", go.Spot.Top, false, true),
    makePort("L", go.Spot.Left, true, true),
    makePort("R", go.Spot.Right, true, true),
    makePort("B", go.Spot.Bottom, true, false), { // handle mouse enter/leave events to show/hide the ports
      mouseEnter: function (e, node) {
        showSmallPorts(node, true);
      },
      mouseLeave: function (e, node) {
        showSmallPorts(node, false);
      }
    }
  );

  // bind template
  var templmap = new go.Map("string", go.Node);
  templmap.add('default', defaultTemplate);
  templmap.add('default-nobtn', processTemplate);
  templmap.add('chart', chartTemplate);
  templmap.add('result', resultTemplate);
  templmap.add('button', buttonTemplate);
  myDiagram.nodeTemplateMap = templmap;


  function showSmallPorts(node, show) {
    node.ports.each(function (port) {
      if (port.portId !== "") {
        // don't change the default port, which is the big shape
        port.fill = show ? "rgba(0,0,0,.3)" : null;
      }
    });
  }

  var linkSelectionAdornmentTemplate = objGo(
    go.Adornment,
    "Link",
    objGo(
      go.Shape,
      // isPanelMain declares that this Shape shares the Link.geometry
      {
        isPanelMain: true,
        fill: null,
        stroke: "deepskyblue",
        strokeWidth: 0
      }
    )
  );

  myDiagram.linkTemplate = objGo(
    go.Link, // the whole link panel
    {
      selectable: true,
      selectionAdornmentTemplate: linkSelectionAdornmentTemplate
    }, {
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true
    }, {
      routing: go.Link.AvoidsNodes,
      curve: go.Link.JumpOver,
      corner: 5,
      toShortLength: 4
    },
    new go.Binding("points").makeTwoWay(),
    objGo(
      go.Shape, // the link path shape
      {
        isPanelMain: true,
        strokeWidth: 2
      }
    ),
    objGo(
      go.Shape, // the arrowhead
      {
        toArrow: "Standard",
        stroke: null
      }
    ),
    objGo(
      go.Panel,
      "Auto", {
        name: "result",
        visible: true
      },
      // new go.Binding("visible", "isSelected").ofObject(),
      objGo(
        go.Shape,
        "RoundedRectangle", // the link shape
        {
          fill: "#F8F8F8",
          stroke: null,
        }
      ),
      objGo(
        go.TextBlock, {
          name: "result",
          textAlign: "center",
          font: "10pt sans-serif",
          stroke: "#919191",
          minSize: new go.Size(10, NaN),
          editable: true,
        },
        new go.Binding("text").makeTwoWay()
      )
    ),
  );


  jQuery("#accordion").accordion({
    activate: function (event, ui) {
      myPaletteModel.requestUpdate();
      myPaletteParts.requestUpdate();
      // myPaletteTall.requestUpdate();
    }
  });

  /** 副面版初始化 */
  myPaletteParts =
    objGo(go.Palette, "myPaletteParts", {
      nodeTemplateMap: templmap,
      scale: .75,
      layout: objGo(go.GridLayout)
    });

  myPaletteModel =
    objGo(go.Palette, "myPaletteModel", {
      nodeTemplateMap: templmap,
      layout: objGo(go.GridLayout),
      scale: 1,
    });


  myPaletteParts.model = new go.GraphLinksModel([{
      type: "PART",
      name: 'uploadFile',
      text: "步骤",
      fill: "#00AD5F",
      shapeStroke: '#5089b0',
      category: "default",
      btnShow: true
    },
    {
      category: 'default-nobtn',
      text: "图片训练结果",
      type: "PART",
    },
    {
      type: "PART",
      text: "未开始训练",
      category: "result",
    },
    {
      result: "step",
      chartText: "请输入品规号",
      chartFigure: "RoundedRectangle",
      category: "chart"
    },
    {
      type: "PART",
      result: "DB",
      chartText: "Database",
      chartFigure: "Database",
      chartFill: "lightgray",
      category: "chart",
    },
    {
      result: "step",
      chartText: "Diamond",
      chartFigure: "Diamond",
      chartFill: "#1091d2",
      category: "chart",
      color: '#fff'
    },
    {
      "btn-opt": "生成检查图",
      category: "button"
    }
  ]);


  myPaletteModel.model = new go.GraphLinksModel(
    [{
        type: 'MODEL',
        name: 'classes',
        result: "ZWY",
        chartFigure: "RoundedRectangle",
        category: "chart",
        // chartFill: "lightyellow",
        chartText: "品规训练"
      },
      {
        type: 'MODEL',
        name: 'batch',
        result: "ZWY",
        chartFigure: "RoundedRectangle",
        category: "chart",
        // chartFill: "lightyellow",
        chartText: "批次训练"
      },
    ]
  );

  myDiagram.addDiagramListener('ExternalObjectsDropped', function (ev) {
    var target = ev.object;
    // ev.diagram.nodes.each(function(node){console.log(node.data)})
    // // console.log(ev.diagram.nodes)
    // if(ev.diagram.nodes.first().data.name === 'zwy'){
    //     myDiagram.model = go.Model.fromJson(hook['zwy']);
    //     loadDiagramProperties();
    // }
  })

  myDiagram.addModelChangedListener(function (ev) {
    // ev.isTransactionFinished = true;
    if (!ev.isTransactionFinished) return;
    var target = ev.object;
    if (target === null) return;

    target.changes.each(function (e) {

      if (e.modelChange !== "nodeDataArray") return;

      if (e.change === go.ChangedEvent.Insert) {
        // console.log(ev.propertyName + " added node with key: " + e.newValue.key);
        // console.log(e.newValue);

        /** 
         * NOTICE: 思路说明：
         * * e.newValue.type === 'PART' 在插入数据时插入个 type，
         * * 搜索：myPaletteParts.model = new go.GraphLinksModel
         * 
         * .type的作用：
         *    为了能够在 将myPaletteParts中的元素拖入到 myDiagram 中时，
         *    判断当前是 "训练模型"还是 "构建模型"。
         *    如果是 "训练模型"，会根据对应的模型的 json 生成相应的树状图
         * 
         * json数据在 static/js/modelData.js中
         */

        if (e.newValue.type === 'PART') {nodeBody.testType = ''}

        if (e.newValue.type === 'MODEL') {
          var o = myDiagram.model.copy;

          switch (e.newValue.name) {
            case 'batch':
              o = go.Model.fromJson(JSON.stringify(modelData['zwy']['batch']));
              nodeBody.testType = 'batch';
              uploadForm.action = '/upload_classes_pics/';
              break;

            case 'classes':
              o = go.Model.fromJson(JSON.stringify(modelData['zwy']['classes']));
              nodeBody.testType = 'classes';
              uploadForm.action = '/upload_batch_pics/';
              break;
            default:
              return;
          }

          myDiagram.model = o;
          loadDiagramProperties();

          // 先清空form中的input
          uploadForm.innerHTML = '';
          
          //  遍历节点，插入input
          myDiagram.nodes.each(function (node) {
            if (node.data.name === 'uploadFile') {
              switch (node.data.text) {
                case '上传训练图':
                  htmlstr = '<input style="display:none;" type="file" name="file" />';
                  break;
                case '上传标注文件':
                  htmlstr = '<input style="display:none;" type="file" name="json-file" />';
                  break;
              }
              // var htmlstr  = '<input style="display:none;" type="file" multiple name="file" />';
              var input = html2node(htmlstr);
              input.id = 'id' + node.data.key;
              uploadForm.appendChild(input);
            }
          })
        }
      } else if (e.change === go.ChangedEvent.Remove) {
        console.log(ev.propertyName + " removed node with key: " + e.oldValue.key);
      }
    });
  });


  myDiagram.addDiagramListener("Modified", function (e) {
    var button = doc.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    var idx = doc.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) doc.title += "*";
    } else {
      if (idx >= 0)
        doc.title = doc.title.substr(0, idx);
    }
  });


  myDiagram.addDiagramListener("ChangedSelection", function (ev) {});
  // ***  Func init() END ***
}

function ajax(opts) {
  var xhr = null,
    url = opts.url,
    method = opts.method,
    sendData = opts.data || null,
    async = opts.async ? opts.async : true,
    progress = opts.progress ? opts.progress : false,
    nei = doc.getElementById('nei');  // 进度条里面的

  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest()
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  if (method == "GET") {
    xhr.open(method, url, async);
    xhr.send(null)
  } else if (method == "POST") {
    xhr.open(method, url, async);

    /* NOTICE: 使用JS上传文件夹时，不可加这句话，否则后台接受不到到文件  */
    // xhr.setRequestHeader("Content-Type","multipart/form-data");

    if(progress){
      xhr.upload.onprogress = function (ev) {
        // console.log(ev);
        if (ev.lengthComputable) {
          var percent = 100 * ev.loaded / ev.total;
          
          nei.style.width = percent + '%';
          // doc.getElementById('percent').innerHTML=Math.floor(percent)+'%';
          setTimeout(function(){nei.style.width = 0 + '%'}, 1000);
          if(percent === 100){
            alert('文件上传完成，正在生成检查图');
            nei.style.width = '0%';
          }
            
        }
      }
    }
    
    xhr.send(sendData);
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      opts.success(xhr.responseText);
    }
  }
}

doc.body.onload = initGojs;

/** 
 * =========================================
 * 
 * 处理训练页面中按钮的点击事件
 * 
 * =========================================
 */

/**
 * 将 myDiagram 中的模型保存成json
 * @method save
 */
function save() {
  saveDiagramProperties(); // 保存json的时候先执行这个方法
  doc.getElementById(
    "mySavedModel"
  ).value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}

/** 
 * 将 json 加载成模型
 * @method load
 */
function load() {
  typeof (doc.getElementById("mySavedModel").value)
  myDiagram.model = go.Model.fromJson(
    doc.getElementById("mySavedModel").value
  );
  loadDiagramProperties(); // do this after the Model.modelData has been brought into memory
}

function saveDiagramProperties() {
  myDiagram.model.modelData.position = go.Point.stringify(
    myDiagram.position
  );
}

function loadDiagramProperties(e) {
  // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
  var pos = myDiagram.model.modelData.position;
  if (pos) myDiagram.initialPosition = go.Point.parse(pos);
}


/**
 * defaultTemplate 中按钮的点击选择文件
 * 例如: 上传训练图，上传标志文件
 */
function selectFile(ev, obj) {
  // ev.diagram.nodes.first().data
  var node = obj.part;
  var data = node.data;

  console.log('%c func selectFile', 'background:#5089b0; color:#fff;')
  var id = 'id' + data.key;

  fileInput = doc.getElementById(id);
  fileInput.click();

  switch(data.text){
    case '上传训练图':
    {
      fileInput.addEventListener('change', function () {
        formFiles[fileInput.name] = fileInput.files[0];
        imgs = [];
        for (var i = 0, len = this.files.length; i < len; i++) {
          imgs.push(this.files[i].name);
        }
        // 上传标注照片文件夹后，将图片名字放进 manual-correction 中的 data-imgs
        manualCorrection.setAttribute('data-imgs', imgs);
        myDiagram.findNodeForKey(data.key).findObject('img').source = 'http://maruihua.oss-cn-beijing.aliyuncs.com/bg.png';
      });
    }
    break;

    case '上传标注文件':
    {
      fileInput.addEventListener('change', function () {
        formFiles[fileInput.name] = fileInput.files[0];
        myDiagram.findNodeForKey(data.key).findObject('img').source = 'http://maruihua.oss-cn-beijing.aliyuncs.com/data.svg';
      });
    }
    break;

  }
  console.log('%c Func selectFile END', 'background:#5089b0; color:#fff;')
}


/** 
 * buttonTemplate 按钮的点击事件
 * 例如：生成检查图， 跳转到到标注页面
 */
function btnOpt(ev, obj) {
  console.log('%c' + 'func btnOpt, Button模板的点击事件', 'background:#5089b0; color:#fff;')
  // console.log(ev)
  // ev.diagram.nodes.first().data

  var node = obj.part;
  var data = node.data;
  console.log(node);
  console.log(data);

  for (var i in formFiles) {
    formData.append(i, formFiles[i]);
  }

  if (nodeBody.testType === '') return;

  switch (node.data['btn-opt']) {
    case "生成检查图":
      {
      loading.style.display = 'block'; 
      ajax({
        url: "/gen_check_pics/",
        data: formData,
        method: 'POST',
        progress: true,
        success: function (data) {
          loading.style.display = 'none'; 
            var data = JSON.parse(data);
            var msg;
            console.log(data);
            // 检查图生成失败
            if (data.msg === 'failed') { alert('检查图生成失败'); return; }
            imgs = data.check_pics;
            // 显示第一张检查图
            checkPic.currentImg = data.check_pics[0];
            checkPic.imgIndex = 0;
            checkPic.src = "check_imgs/" + imgs[checkPic.imgIndex];
          }
        })
      }
      break;

    case "跳转到标注页面":
      {
        window.open('http://www.robots.ox.ac.uk/~vgg/software/via/via-1.0.6.html', '_blank');
      }
      break;

    case "下载远程图片": 
      {
        // console.log('%c'+'下载远程图片', 'background:green; color:#fff;');
        if( nodeBody.contains(doc.getElementsByClassName('date-form')[0])){return;}
        var dateForm = doc.createElement('form');
        dateForm.className = 'date-form';
        
        htmlstr = '<div class="input">起始日期: <input class="j-start-date" type="date" name="first_date" /></div>\
          <div class="input">终止日期: <input class="j-deadline" type="date" name="second_date"/> </div>\
          <button type="button" class="confirm">下载</button> <button type="button" class="cancle">取消</button>';

        dateForm.innerHTML = htmlstr;

        var btnCancle = dateForm.getElementsByClassName('cancle')[0];
        var btnConfirm = dateForm.getElementsByClassName('confirm')[0];

        btnCancle.onclick = function(){
          dateForm.style.animation = 'nodeRemove .3s';
          setInterval(nodeBody.removeChild(dateForm), 1000);
        }

        btnConfirm.onclick = function(){
          var formData = new FormData(document.getElementsByClassName("date-form")[0]);
          console.log('btnConfirm');
          console.log(formData);
          var newwindow = window.open()
          ajax({
            url: "/get_real_class_top_side_pics/",
            data: formData,
            method: 'POST',
            success: function (data) {
              var data = JSON.parse(data);
              var msg;
              window.open(data.url, '_black');
              btnCancle.onclick();
            }
          })  
        }

        nodeBody.appendChild(dateForm);
        console.log('%c'+'下载远程图片 END', 'background:green; color:#fff;');
      }
      break;

    case "下载训练图":
      {
        ajax({
          url:'',
          method: 'POST',
          success: function(data){}
        })
      }
      break;

    case "开始训练":
      exec()
      break;

    default:
      break;
  }
  console.log('%c func btnOpt END', 'background:#5089b0; color:#fff;')
}

