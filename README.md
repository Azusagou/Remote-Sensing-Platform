# 多模态遥感基础模型应用软件平台

## 项目简介
本项目是一个基于 React + TypeScript 的多模态遥感基础模型应用平台，集成了地球可视化、卫星数据处理、数据分析等功能，适用于遥感数据的展示与分析。

## 主要功能
- 地球三维可视化（基于 Cesium）
- 遥感影像上传与处理
- 卫星数据检索与下载
  - 支持多源卫星数据（Landsat、Sentinel等）
  - 多种检索方式（行政区域、坐标范围、绘制区域）
  - 多条件过滤（时间范围、云量等）
- 数据分析与可视化
- 友好的页面布局与导航

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

## 参与开发
1. Fork 或 Clone 本仓库
2. 按上述方法安装依赖并启动开发环境
3. 提交代码建议使用分支和 Pull Request

---
如有问题欢迎提 Issue 或联系维护者。 
