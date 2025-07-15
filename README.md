# 多模态遥感基础模型应用软件平台

## 项目简介
本项目是一个基于 React + TypeScript 的多模态遥感基础模型应用平台，集成了地球可视化、卫星数据处理、数据分析与生物量反演可视化等功能，适用于遥感数据的展示、生态监测与分析。

## 主要功能亮点
- **地球三维可视化**（基于 Cesium）
- **遥感影像上传与处理**：支持多源卫星数据（Landsat、Sentinel等），自动检测坐标系与区域一致性。
- **卫星数据检索与下载**：多条件检索（行政区、坐标、绘制区域、时间、云量等）。
- **生物量反演与可视化分析**：
  - 支持卫星影像、温度、降水等多源数据上传，自动检测坐标系和区域一致性。
  - 任务参数设置（日期、备注），一键提交反演任务。
  - 反演结果以伪彩色图像（Green–Yellow–Red色带）可视化，支持多种色带选择。
  - 主图支持缩放、拖拽、透明度调节、底图切换、图层显隐。
  - 鼠标悬浮/点击主图可查看像素生物量值和经纬度（模拟）。
  - 统计分布曲线（直方图+密度曲线）直接展示后端生成图片，支持区间调节、分布方式选择、导出CSV/图片。
  - 统计分析卡片展示均值、中位数、标准差、有效像素等。
  - 生态阈值告警设置，支持阈值调节、低于阈值区域高亮与占比统计。
- **数据分析与可视化**：多种统计方式与交互体验。
- **友好的页面布局与导航**，适合大屏演示与实际业务。

## 技术栈
- React
- TypeScript
- Ant Design
- Cesium
- styled-components

## 环境要求
- Node.js >= 14.x
- npm >= 6.x

## 本地开发启动
```bash
# 安装依赖
npm install

# 启动开发环境
npm start
```
默认在 [http://localhost:3000](http://localhost:3000) 访问。

> **注意**：项目已配置.npmrc文件使用国内镜像源，可以加快依赖安装速度。如果安装依然很慢，可以尝试以下方法：
> - 删除package-lock.json文件后再安装：`rm package-lock.json && npm install`
> - 确保npm已配置为使用国内镜像源：`npm config set registry https://registry.npmmirror.com/`
> - 使用cnpm安装：`npm install -g cnpm --registry=https://registry.npmmirror.com/ && cnpm install`

## 项目打包
```bash
npm run build
```
打包后产物在 `build/` 目录，可用于部署。

## 目录结构说明
```
├── public/                # 静态资源与HTML模板
├── src/                   # 源码目录
│   ├── App.tsx            # 应用主组件
│   ├── index.tsx          # 应用入口
│   ├── pages/             # 页面级组件
│   ├── components/        # 可复用组件
│   │   ├── CesiumEarthViewer.tsx    # 地球可视化组件
│   │   ├── BiomassInversion.tsx     # 生物量反演主功能
│   │   ├── EnhancedSatelliteDataPanel.tsx  # 卫星数据检索面板
│   │   ├── DrawPolygonTool.tsx      # 区域绘制工具
│   │   └── ...            # 其他组件
│   ├── services/          # 服务层
│   │   ├── SatelliteDataService.ts  # 卫星数据服务
│   │   ├── GeoService.ts            # 地理空间服务
│   │   ├── RegionService.ts         # 行政区域服务
│   │   └── ...            # 其他服务
│   ├── layouts/           # 布局组件
│   ├── config/            # 配置文件
│   ├── types/             # 类型定义
│   └── ...                # 其他
├── package.json           # 项目依赖与脚本
├── tsconfig.json          # TypeScript 配置
├── .npmrc                 # npm镜像源配置
├── .gitignore             # Git忽略文件
└── README.md              # 项目说明文档
```

## 示例数据说明
- `/images/输出_伪彩色output_visualization_7.png`：生物量反演伪彩色主图。
- `/images/biomass_distribution_7.png`：生物量统计分布曲线（直方图+密度曲线）。
- `/biomass_statistics_7.csv`：生物量统计分析结果（均值、中位数、区间分布等）。

## 前端演示流程
1. 进入“生物量反演”页面，上传示例数据或自定义数据。
2. 设置参数，提交任务，查看可视化与统计分析结果。
3. 可体验主图交互、统计曲线导出、阈值告警等功能。

## 开发与部署建议
- 开发环境建议使用`craco`或`vite`，确保`historyApiFallback`配置正确，支持SPA路由刷新。
- 生产部署时，服务器需配置所有404重定向到`index.html`。
- 上传数据仅保存在前端内存，刷新页面会丢失，正式环境建议接入后端存储。

## 参与开发
1. Fork 或 Clone 本仓库
2. 按上述方法安装依赖并启动开发环境
3. 提交代码建议使用分支和 Pull Request

---
如有问题欢迎提 Issue 或联系维护者。 
