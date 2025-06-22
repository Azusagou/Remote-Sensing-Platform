// 地理工具服务
// 处理地理空间数据和操作

// 边界框接口
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 坐标点接口
export interface Coordinate {
  lat: number;
  lng: number;
}

// 多边形接口
export interface Polygon {
  coordinates: Coordinate[];
}

// 将多边形转换为边界框
export const polygonToBoundingBox = (polygon: Polygon): BoundingBox => {
  if (!polygon.coordinates || polygon.coordinates.length === 0) {
    throw new Error('多边形坐标不能为空');
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  polygon.coordinates.forEach(coord => {
    north = Math.max(north, coord.lat);
    south = Math.min(south, coord.lat);
    east = Math.max(east, coord.lng);
    west = Math.min(west, coord.lng);
  });

  return { north, south, east, west };
};

// 检查点是否在多边形内
export const isPointInPolygon = (point: Coordinate, polygon: Polygon): boolean => {
  const { lat, lng } = point;
  const coords = polygon.coordinates;
  
  if (coords.length < 3) {
    return false;
  }
  
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i].lng;
    const yi = coords[i].lat;
    const xj = coords[j].lng;
    const yj = coords[j].lat;
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
};

// 计算两点之间的距离（单位：米）
export const calculateDistance = (point1: Coordinate, point2: Coordinate): number => {
  const R = 6371e3; // 地球半径（米）
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// 计算多边形面积（单位：平方米）
export const calculatePolygonArea = (polygon: Polygon): number => {
  const coords = polygon.coordinates;
  
  if (coords.length < 3) {
    return 0;
  }
  
  // 使用球面坐标计算面积
  let area = 0;
  const R = 6371e3; // 地球半径（米）
  
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const φ1 = (coords[i].lat * Math.PI) / 180;
    const φ2 = (coords[j].lat * Math.PI) / 180;
    const λ1 = (coords[i].lng * Math.PI) / 180;
    const λ2 = (coords[j].lng * Math.PI) / 180;
    
    area += (λ2 - λ1) * (2 + Math.sin(φ1) + Math.sin(φ2));
  }
  
  area = Math.abs(area * R * R / 2);
  
  return area;
};

// GeoJSON 接口
export interface GeoJSON {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: any;
    };
    properties?: any;
  }>;
}

// 解析GeoJSON文件
export const parseGeoJSON = (geoJSON: GeoJSON): Polygon[] => {
  const polygons: Polygon[] = [];
  
  if (geoJSON && geoJSON.features) {
    geoJSON.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        // GeoJSON 多边形坐标是 [lng, lat] 格式，需要转换
        const coordinates: Coordinate[] = feature.geometry.coordinates[0].map(
          (coord: number[]) => ({ lng: coord[0], lat: coord[1] })
        );
        
        polygons.push({ coordinates });
      }
    });
  }
  
  return polygons;
};

// 获取中国行政区域边界
export const getAdministrativeBoundary = async (regionId: string): Promise<Polygon> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟返回北京市的边界多边形
  // 实际应用中应该从API或数据库获取
  return {
    coordinates: [
      { lat: 40.2, lng: 116.0 },
      { lat: 40.2, lng: 117.0 },
      { lat: 39.6, lng: 117.0 },
      { lat: 39.6, lng: 116.0 },
      { lat: 40.2, lng: 116.0 }
    ]
  };
}; 