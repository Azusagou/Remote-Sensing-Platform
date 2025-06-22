// 移除天地图token
// export const TIANDITU_TOKEN = 't0x3BzPzXS9SVly0Q99u4zgFcXeZ';

// 地图类型定义
export const MAP_TYPES = {
  OSM: 'osm',                     // OpenStreetMap
  ARCGIS: 'arcgis',               // ArcGIS底图
  GOOGLE_XYZ: 'google-xyz'        // 谷歌XYZ图层
} as const;

// 地图标签
export const MAP_LABELS = {
  [MAP_TYPES.OSM]: 'OpenStreetMap',
  [MAP_TYPES.ARCGIS]: 'ArcGIS影像',
  [MAP_TYPES.GOOGLE_XYZ]: '谷歌地图'
} as const;

// 地图配置信息
export interface MapConfig {
  url: string;
  subdomains?: string;
  maximumLevel: number;
  available: boolean; // 是否可用
}

// 地图配置
export const MAP_CONFIGS: Record<string, MapConfig> = {
  // OpenStreetMap配置 - 开源可用
  [MAP_TYPES.OSM]: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maximumLevel: 19,
    available: true
  },
  
  // ArcGIS影像配置 - 开源可用
  [MAP_TYPES.ARCGIS]: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maximumLevel: 19,
    available: true
  },
  
  // 谷歌XYZ图层 - 使用更可靠的谷歌地图代理服务
  [MAP_TYPES.GOOGLE_XYZ]: {
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    maximumLevel: 20,
    available: true
  }
};

// 地形服务配置
export const TERRAIN_CONFIG = {
  // 禁用地形服务
  worldTerrain: false,
  // 不使用备用地形
  url: '',
  requestWaterMask: false,
  requestVertexNormals: false,
  credit: '',
  // Cesium Ion资产ID，如果使用Cesium Ion托管的地形
  ionAssetId: null
}; 