### conda 常用命令

``` 
	conda update -n base conda        //update最新版本的conda
	conda create -n xxxx python=3.5   //创建python3.5的xxxx虚拟环境
	conda activate xxxx               //开启xxxx环境
	Linux，OS X：source activate XXX    //开启xxxx环境
	Windows：activate XXX               //开启xxxx环境
	conda deactivate                  //关闭环境
	conda env list                    //显示所有的虚拟环境
	conda info --envs                 //检查到目前为止已经安装了哪些环境
	
	// 更新，卸载安装包：
	conda list         #查看已经安装的文件包
	conda update xxx   #更新xxx文件包
	conda uninstall xxx   #卸载xxx文件包
	
	// 删除虚拟环境
	conda remove -n xxxx --all
	
	//清理（conda瘦身）
	conda clean -p      //删除没有用的包
	conda clean -t      //tar打包
	
```

### TensorFlow基础知识
#### 数据类型
``` python
	// list
	[1, 1.2, "hello", (1,2), 类]
```