# 技术文档

该文档用于项目维护

#### 项目技术框架

本前端使用React框架，可视化部分使用的是阿里Antv-G6框架

后端使用的是python Flask框架



#### 文件目录

##### 前端项目：

src目录下：

```
behavior:	
components:	核心组件
item:		
locales:		
pages:		各类页面
plugins:	引入相关插件	
shape:		图的基础元素的定义
types:		类的定义
util:		各类js工具函数，数据处理函数
```



##### 后端项目：

// ZJX





#### 页面布局

下图表明了网页中各个部分与代码中组件的对应关系

![](C:\Users\giraffezjx\Desktop\wfd-demo\public\img\components.png)



#### 代码处理

对应文件：`wfd-demo\src\util\codeAnalyse.js`







#### 数据处理

对应文件：`wfd-demo\src\util\dumpAnalyse.js`

readFileAsText(file)：读取dump文件中的内容

analyseDumpFiles(files)：解析dump文件内容，取出有数据传输的cycle，并记录文件名（文件名包含了接口信息），cycle和文件名都记录在result中

result_calc_rate(result)：对result中的记录按cycle进行排序，并计算传输速率，默认窗口为30

calcPortTransferRate(cycle_id, dump_file_name, window_size)：输入cycle值、文件名、窗口大小，计算当前cycle当前接口的传输速率






