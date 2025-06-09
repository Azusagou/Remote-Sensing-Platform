// 移除天地图token
// export const TIANDITU_TOKEN = 't0x3BzPzXS9SVly0Q99u4zgFcXeZ';

export const MAP_TYPES = {
  OSM: 'osm',
  GOOGLE_SATELLITE: 'google-satellite',
  ARCGIS_IMAGERY: 'arcgis-imagery'
} as const;

export const MAP_LABELS = {
  [MAP_TYPES.OSM]: 'OpenStreetMap',
  [MAP_TYPES.GOOGLE_SATELLITE]: '谷歌卫星影像',
  [MAP_TYPES.ARCGIS_IMAGERY]: 'ArcGIS影像'
} as const;

// OpenStreetMap配置
export const OSM_CONFIG = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: 'abc',
  maximumLevel: 19
};

// 谷歌卫星影像配置
export const GOOGLE_SATELLITE_CONFIG = {
  url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  subdomains: '0123',
  maximumLevel: 20
};

// ArcGIS影像配置
export const ARCGIS_IMAGERY_CONFIG = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  maximumLevel: 19
};

// 地形服务配置
export const TERRAIN_CONFIG = {
  url: 'https://data.marsgis.cn/terrain',
  requestWaterMask: true,
  requestVertexNormals: true
}; 