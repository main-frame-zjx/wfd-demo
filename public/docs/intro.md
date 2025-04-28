# 使用文档

该文档用于介绍如何使用该GPU数据流可视化项目



## 数据可视化网页

#### 操作步骤

- Step1：上传代码文件
- Step2：上传运行时数据
- Step3：生成结构图
- Step4：动态播放

#### Step1 上传代码文件

点击左侧工具栏 `上传文件`->`上传代码文件`

把所有用于分析GPU结构的代码放到一个**文件夹**中，然后选中该文件夹上传

![](C:\Users\giraffezjx\Desktop\wfd-demo\public\img\upload_code.png)

#### Step2 上传运行时数据



#### Step3 生成结构图



#### Step4 动态播放





#### Step5 登录并保存





## 右侧详细信息面板

#### 全局信息面板

唤起方式：点击画布的空白处

<img src="C:\Users\giraffezjx\Desktop\wfd-demo\public\img\global_detail.png" style="zoom:60%;" />



#### Module信息面板

唤起方式：点击结点

<img src="C:\Users\giraffezjx\Desktop\wfd-demo\public\img\module_detail.png" style="zoom:60%;" />

#### Port信息面板

唤起方式：点击边

<img src="C:\Users\giraffezjx\Desktop\wfd-demo\public\img\port_detail.png" style="zoom:60%;" />

## 代码分析

#### 代码格式要求

//ZJX

说明变量名要求

#### 数据上传说明

数据大小限制：



## 数据分析

#### 数据格式要求

文件名：“、、、”.model_vec (以model_vec为后缀)

内容要求：

class 、、、
、、、
、、、
endclass

、、、 、、、 0000011111（数据以cycle值结尾）

文件举例：

class xgfss_dsd_gsd_draw 
send [1]
clken [1]
free [1]
op [2]
data [127]
head [1]
tail [1]
endclass 

1 1 0 0 5007c801_00000000_00000000_00000000 1 0 @ 0000011111
1 1 0 0 00000000_088e8417_f0000000_00010000 0 0 @ 0000008074
1 1 0 0 00000000_088e8417_f0000000_00030002 0 0 @ 0000008075
1 1 0 0 00000000_088e8417_f0000000_00050004 0 0 @ 0000008076
1 1 0 0 00000000_088e8417_f0000000_00070006 0 0 @ 0000008077
1 1 0 0 00000000_088e8417_f0000000_00090008 0 0 @ 0000008078
1 1 0 0 00000000_088e8417_f0000000_000b000a 0 0 @ 0000008079



#### 数据上传说明

数据大小限制：

