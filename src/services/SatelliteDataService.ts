// 卫星数据服务
// 处理与卫星数据API的交互

// 卫星数据源接口
export interface SatelliteDataSource {
  id: string;
  name: string;
  description: string;
  provider: string;
  apiEndpoint: string;
  supportsFilters: {
    cloudCover: boolean;
    dateRange: boolean;
    boundingBox: boolean;
    resolution: boolean;
  };
}

// 卫星数据项接口
export interface SatelliteDataItem {
  id: string;
  name: string;
  description: string;
  satellite: string;
  sensor: string;
  acquisitionDate: string;
  cloudCover: number;
  resolution: string;
  provider: string;
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  thumbnailUrl: string;
  downloadUrl: string;
  metadata: Record<string, any>;
}

// 搜索参数接口
export interface SearchParams {
  satellites: string[];
  startDate?: string;
  endDate?: string;
  cloudCoverMax?: number;
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  region?: string;
  administrativeArea?: string;
  limit?: number;
  offset?: number;
}

// 可用的卫星数据源
export const availableSatelliteDataSources: SatelliteDataSource[] = [
  {
    id: 'landsat',
    name: 'Landsat',
    description: '美国陆地卫星系列',
    provider: 'USGS/NASA',
    apiEndpoint: 'https://api.example.com/landsat',
    supportsFilters: {
      cloudCover: true,
      dateRange: true,
      boundingBox: true,
      resolution: true
    }
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    description: '欧洲哨兵卫星系列',
    provider: 'ESA',
    apiEndpoint: 'https://api.example.com/sentinel',
    supportsFilters: {
      cloudCover: true,
      dateRange: true,
      boundingBox: true,
      resolution: true
    }
  },
  {
    id: 'modis',
    name: 'MODIS',
    description: '中分辨率成像光谱仪',
    provider: 'NASA',
    apiEndpoint: 'https://api.example.com/modis',
    supportsFilters: {
      cloudCover: false,
      dateRange: true,
      boundingBox: true,
      resolution: true
    }
  },
  {
    id: 'gaofen',
    name: '高分卫星',
    description: '中国高分辨率对地观测系统',
    provider: 'CNSA',
    apiEndpoint: 'https://api.example.com/gaofen',
    supportsFilters: {
      cloudCover: true,
      dateRange: true,
      boundingBox: true,
      resolution: true
    }
  }
];

// 模拟搜索结果数据
const mockSearchResults: SatelliteDataItem[] = [
  {
    id: 'landsat8_20220510',
    name: 'Landsat 8 OLI/TIRS C2 L2',
    description: 'Landsat 8 OLI/TIRS Collection 2 Level-2',
    satellite: 'Landsat 8',
    sensor: 'OLI/TIRS',
    acquisitionDate: '2022-05-10T10:30:00Z',
    cloudCover: 12.5,
    resolution: '30m',
    provider: 'USGS/NASA',
    boundingBox: {
      north: 40.5,
      south: 39.5,
      east: 117.5,
      west: 116.5
    },
    thumbnailUrl: 'https://via.placeholder.com/200x200?text=Landsat8',
    downloadUrl: 'https://api.example.com/download/landsat8_20220510',
    metadata: {
      path: 123,
      row: 45,
      sunAzimuth: 135.2,
      sunElevation: 65.8
    }
  },
  {
    id: 'sentinel2_20220612',
    name: 'Sentinel-2 MSI L2A',
    description: 'Sentinel-2 MultiSpectral Instrument Level-2A',
    satellite: 'Sentinel-2A',
    sensor: 'MSI',
    acquisitionDate: '2022-06-12T09:45:00Z',
    cloudCover: 5.2,
    resolution: '10m',
    provider: 'ESA',
    boundingBox: {
      north: 40.6,
      south: 39.4,
      east: 117.6,
      west: 116.4
    },
    thumbnailUrl: 'https://via.placeholder.com/200x200?text=Sentinel2',
    downloadUrl: 'https://api.example.com/download/sentinel2_20220612',
    metadata: {
      tileId: 'T50TMK',
      orbitNumber: 65,
      relativeOrbit: 123
    }
  },
  {
    id: 'gf2_20220715',
    name: 'GF-2 PMS',
    description: 'GF-2 Panchromatic/Multispectral',
    satellite: 'GF-2',
    sensor: 'PMS',
    acquisitionDate: '2022-07-15T11:20:00Z',
    cloudCover: 1.5,
    resolution: '1m/4m',
    provider: 'CNSA',
    boundingBox: {
      north: 40.55,
      south: 39.45,
      east: 117.55,
      west: 116.45
    },
    thumbnailUrl: 'https://via.placeholder.com/200x200?text=GF-2',
    downloadUrl: 'https://api.example.com/download/gf2_20220715',
    metadata: {
      sensorMode: 'PMS1',
      incidenceAngle: 5.3
    }
  }
];

// 搜索卫星数据
export const searchSatelliteData = async (params: SearchParams): Promise<SatelliteDataItem[]> => {
  console.log('搜索参数:', params);
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 在实际应用中，这里应该调用真实的API
  // 现在我们返回模拟数据
  return mockSearchResults.filter(item => {
    // 过滤卫星类型
    if (params.satellites && params.satellites.length > 0) {
      const satelliteType = item.satellite.toLowerCase();
      if (!params.satellites.some(s => satelliteType.includes(s.toLowerCase()))) {
        return false;
      }
    }
    
    // 过滤日期范围
    if (params.startDate && new Date(item.acquisitionDate) < new Date(params.startDate)) {
      return false;
    }
    if (params.endDate && new Date(item.acquisitionDate) > new Date(params.endDate)) {
      return false;
    }
    
    // 过滤云量
    if (params.cloudCoverMax !== undefined && item.cloudCover > params.cloudCoverMax) {
      return false;
    }
    
    return true;
  });
};

// 获取卫星数据详情
export const getSatelliteDataDetail = async (id: string): Promise<SatelliteDataItem | null> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockSearchResults.find(item => item.id === id) || null;
};

// 下载卫星数据
export const downloadSatelliteData = async (id: string): Promise<string> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const item = mockSearchResults.find(item => item.id === id);
  if (!item) {
    throw new Error('数据不存在');
  }
  
  return item.downloadUrl;
};

// 获取行政区域列表
export const getAdministrativeAreas = async (): Promise<{id: string, name: string}[]> => {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    { id: 'beijing', name: '北京市' },
    { id: 'shanghai', name: '上海市' },
    { id: 'guangdong', name: '广东省' },
    { id: 'jiangsu', name: '江苏省' },
    { id: 'zhejiang', name: '浙江省' },
    { id: 'shandong', name: '山东省' },
    { id: 'hubei', name: '湖北省' },
    { id: 'sichuan', name: '四川省' }
  ];
}; 