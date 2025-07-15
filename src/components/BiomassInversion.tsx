import React, { useState, useRef, useEffect } from 'react';
import type { UploadChangeParam } from 'antd/lib/upload';
import type { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { Moment } from 'moment';
import styled from 'styled-components';
import { Tabs, Card, DatePicker, Input, Button, message, Upload, Progress, Select, Checkbox, Slider, Modal, Image, Tooltip } from 'antd';
import { UploadOutlined, DownloadOutlined, PlayCircleOutlined, BarChartOutlined, AlertOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import moment from 'moment';
import { Tooltip as AntdTooltip } from 'antd';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 样式定义
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ParameterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const StyledUpload = styled(Upload)`
  width: 100%;
`;

const UploadCard = styled(Card)`
  height: 100%;
`;

const UploadContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
`;

const VisualizationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 5px;
  max-height: 95vh;
  overflow: hidden;
`;

const MapContainer = styled.div`
  width: 75%;
  height: 90vh;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: crosshair;
`;

const InteractiveMap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PixelInfo = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  display: none;
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
`;

const ConsistencyCheck = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
`;

const AlertBanner = styled.div`
  padding: 12px;
  background: #fff2e8;
  border: 1px solid #ffbb96;
  border-radius: 4px;
  margin-bottom: 16px;
`;

// 新增布局样式
const ResultLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 120px);
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
`;
const MainImageArea = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
`;
const MainImage = styled.img`
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0001;
  background: #f5f5f5;
`;
const RightPanel = styled.div`
  flex: 1;
  min-width: 320px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;
const TightCard = styled(Card)`
  margin: 0;
  padding: 0;
  .ant-card-body { padding: 16px; }
`;

// 模拟热力图数据生成函数
const generateHeatmapData = () => {
  const data = [];
  const size = 1000;
  for (let y = 0; y < size; y += 20) {
    for (let x = 0; x < size; x += 20) {
      const value = Math.random() * 544.2 + 29.6; // 生成29.6-573.8之间的随机值
      data.push([x, y, value]);
    }
  }
  return data;
};

const StatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 800px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 500px;
`;

const AlertSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const StatusText = styled.p`
  color: #666;
  text-align: center;
  padding: 24px;
`;

// 模拟颜色映射函数
const getColorMap = () => {
  return {
    0: '#008000',    // 绿色
    25: '#7CFC00',   // 淡绿色
    50: '#FFFF00',   // 黄色
    75: '#FFA500',   // 橙色
    100: '#FF0000'   // 红色
  };
};

// 从CSV数据生成统计数据
const generateCDFDataFromCSV = () => {
  // 模拟解析biomass_statistics_7.csv中的区间分布数据
  const intervalData = [
    {start: 29.6, end: 50, percentage: 0.0079},
    {start: 50, end: 100, percentage: 0.0660},
    {start: 100, end: 150, percentage: 1.1780},
    {start: 150, end: 200, percentage: 3.6488},
    {start: 200, end: 250, percentage: 17.4916},
    {start: 250, end: 300, percentage: 61.2517},
    {start: 300, end: 350, percentage: 13.7279},
    {start: 350, end: 400, percentage: 1.7406},
    {start: 400, end: 450, percentage: 0.5787},
    {start: 450, end: 500, percentage: 0.2468},
    {start: 500, end: 550, percentage: 0.0576},
    {start: 550, end: 600, percentage: 0.0045}
  ];

  // 计算累积分布
  let cumulativePercentage = 0;
  const cdfData: { biomass: number; percentage: number }[] = [];
  intervalData.forEach(interval => {
    cumulativePercentage += interval.percentage;
    cdfData.push({
      biomass: interval.end,
      percentage: parseFloat(cumulativePercentage.toFixed(2))
    });
  });
  return cdfData;
};

// 模拟坐标系检测函数
const detectCoordinateSystem = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // 模拟检测过程
    setTimeout(() => {
      const systems = ['EPSG:4326', 'EPSG:3857', 'EPSG:32650', 'EPSG:32651'];
      const randomSystem = systems[Math.floor(Math.random() * systems.length)];
      resolve(randomSystem);
    }, 1000);
  });
};

// 模拟区域一致性检查
const checkSpatialConsistency = (files: any[]): Promise<{
  isConsistent: boolean;
  consistentArea: any;
  message: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isConsistent = Math.random() > 0.3; // 70%概率一致
      resolve({
        isConsistent,
        consistentArea: isConsistent ? { x: 100, y: 100, width: 800, height: 600 } : null,
        message: isConsistent ? '区域一致性检查通过' : '检测到区域不一致，请检查数据'
      });
    }, 2000);
  });
};

// 将generateRGBPreview泛化为generatePreview
const generatePreview = (file: File, type: 'satellite' | 'temperature' | 'precipitation'): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 不同类型用不同的base64图片模拟
      if (type === 'satellite') {
        // RGB合成
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      } else if (type === 'temperature') {
        // 灰度图
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lQnQ1wAAAABJRU5ErkJggg==');
      } else {
        // 伪彩色
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/CfBwADhgJ/0QnQ1wAAAABJRU5ErkJggg==');
      }
    }, 1200);
  });
};

// 新增底图和色带资源
const basemapOptions = [
  { label: '天地图', value: 'tianditu', url: '/images/basemap_tianditu.png' },
  { label: 'OpenStreetMap', value: 'osm', url: '/images/basemap_osm.png' },
  { label: '谷歌地图', value: 'google', url: '/images/basemap_google.png' },
];
const colormapOptions = [
  { label: '绿-黄-红', value: 'green-yellow-red' },
  { label: '蓝-红', value: 'blue-red' },
  { label: '彩虹色', value: 'rainbow' },
];
const colormapLegends: Record<string, { color: string; value: string }[]> = {
  'green-yellow-red': [
    { color: '#008000', value: '高' },
    { color: '#FFFF00', value: '中' },
    { color: '#FF0000', value: '低' },
  ],
  'blue-red': [
    { color: '#0000FF', value: '高' },
    { color: '#FF0000', value: '低' },
  ],
  'rainbow': [
    { color: '#0000FF', value: '低' },
    { color: '#00FF00', value: '中' },
    { color: '#FFFF00', value: '较高' },
    { color: '#FF0000', value: '高' },
  ],
};

// 主图宽高常量调整
const MAIN_IMAGE_WIDTH = 800;
const MAIN_IMAGE_HEIGHT = 800;
const RIGHT_PANEL_WIDTH = 340;

const BiomassInversion: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{
    satellite: any[],
    temperature: any[],
    precipitation: any[]
  }>({
    satellite: [],
    temperature: [],
    precipitation: []
  });
  const [taskDate, setTaskDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [inversionProgress, setInversionProgress] = useState<number>(0);
  const [isInverting, setIsInverting] = useState<boolean>(false);
  const [inversionComplete, setInversionComplete] = useState<boolean>(false);
  const [colorMap, setColorMap] = useState(getColorMap());
  const [threshold, setThreshold] = useState<number>(100);
  const [showAlertAreas, setShowAlertAreas] = useState<boolean>(true);
  const [binCount, setBinCount] = useState<number>(10);
  const [binType, setBinType] = useState<string>('equal');
  const [cdfData, setCdfData] = useState(generateCDFDataFromCSV());
  const [alertPercentage, setAlertPercentage] = useState<number>(0.07);

  // 新增状态
  const [coordinateSystems, setCoordinateSystems] = useState<{[key: string]: string}>({});
  const [isCheckingConsistency, setIsCheckingConsistency] = useState<boolean>(false);
  const [consistencyResult, setConsistencyResult] = useState<any>(null);
  const [previewImages, setPreviewImages] = useState<{[key: string]: string}>({});
  const [pixelInfo, setPixelInfo] = useState<{x: number, y: number, value: number, lat: number, lng: number} | null>(null);
  const [showPixelInfo, setShowPixelInfo] = useState<boolean>(false);
  const [mapScale, setMapScale] = useState<number>(1);
  const [mapPosition, setMapPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({x: 0, y: 0});

  // 可视化交互相关状态
  const [mainImageOpacity, setMainImageOpacity] = useState(0.95);
  const [showMainImage, setShowMainImage] = useState(true);
  const [showBasemap, setShowBasemap] = useState(false);
  const [basemap, setBasemap] = useState('tianditu');
  const [colormap, setColormap] = useState('green-yellow-red');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; lat: number; lng: number } | null>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const pixelInfoRef = useRef<HTMLDivElement>(null);

  // 文件上传配置
  const uploadProps: UploadProps = {
    accept: '.tif,.tiff',
    multiple: true,
    beforeUpload: async (file: RcFile) => {
      // 文件大小检查 (限制100MB)
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 100) {
        message.error('文件大小不能超过100MB');
        return false;
      }

      // 检测坐标系
      try {
        const coordinateSystem = await detectCoordinateSystem(file);
        setCoordinateSystems(prev => ({
          ...prev,
          [file.uid]: coordinateSystem
        }));

        // 预览类型判断
        let previewType: 'satellite' | 'temperature' | 'precipitation' = 'satellite';
        if (file.name.toLowerCase().includes('temp')) previewType = 'temperature';
        if (file.name.toLowerCase().includes('precip')) previewType = 'precipitation';
        // 通过上传入口类型进一步判断
        if (file.webkitRelativePath) {
          const path = file.webkitRelativePath.toLowerCase();
          if (path.includes('temp')) previewType = 'temperature';
          if (path.includes('precip')) previewType = 'precipitation';
        }
        // 生成预览
        const previewUrl = await generatePreview(file, previewType);
        setPreviewImages(prev => ({
          ...prev,
          [file.uid]: previewUrl
        }));

        message.info(`检测到坐标系: ${coordinateSystem}`);
      } catch (error) {
        message.warning('坐标系检测失败，将使用默认坐标系');
      }

      return true;
    },
    onChange: (info: UploadChangeParam<UploadFile>) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    }
  };

  // 处理不同类型文件上传
  const handleSatelliteUpload = ({ fileList }: any) => {
    setUploadedFiles(prev => ({ ...prev, satellite: fileList }));
  };

  const handleTemperatureUpload = ({ fileList }: any) => {
    setUploadedFiles(prev => ({ ...prev, temperature: fileList }));
  };

  const handlePrecipitationUpload = ({ fileList }: any) => {
    setUploadedFiles(prev => ({ ...prev, precipitation: fileList }));
  };

  // 处理日期变化
  const handleDateChange = (date: Moment | null) => {
    setTaskDate(date ? date.format('YYYY-MM-DD') : '');
  };

  // 检查区域一致性
  const checkConsistency = async () => {
    const allFiles = [
      ...uploadedFiles.satellite,
      ...uploadedFiles.temperature,
      ...uploadedFiles.precipitation
    ];

    if (allFiles.length < 3) {
      message.error('请至少上传3个文件以进行一致性检查');
      return;
    }

    setIsCheckingConsistency(true);
    try {
      const result = await checkSpatialConsistency(allFiles);
      setConsistencyResult(result);
      
      if (result.isConsistent) {
        message.success(result.message);
      } else {
        message.warning(result.message);
      }
    } catch (error) {
      message.error('一致性检查失败');
    } finally {
      setIsCheckingConsistency(false);
    }
  };

  // 开始反演处理
  const startInversion = () => {
    // 验证输入
    if (!taskDate) {
      message.error('请选择任务日期');
      return;
    }
    if (uploadedFiles.satellite.length === 0 || 
        uploadedFiles.temperature.length === 0 || 
        uploadedFiles.precipitation.length === 0) {
      message.error('请上传所有 required 数据文件');
      return;
    }

    if (!consistencyResult?.isConsistent) {
      message.error('请先通过区域一致性检查');
      return;
    }

    // 模拟反演过程
    setIsInverting(true);
    setInversionProgress(0);
    setInversionComplete(false);

    const interval = setInterval(() => {
      setInversionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsInverting(false);
          setInversionComplete(true);
          setActiveTab('visualization');
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  // 下载结果
  const downloadResult = () => {
    // 模拟下载
    message.success('结果文件开始下载');
  };

  // 地图交互处理
  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 模拟像素值获取
    const value = Math.random() * 544.2 + 29.6;
    const lat = 39.9042 + (y - rect.height / 2) * 0.001;
    const lng = 116.4074 + (x - rect.width / 2) * 0.001;

    setPixelInfo({ x, y, value, lat, lng });
    setShowPixelInfo(true);

    if (pixelInfoRef.current) {
      pixelInfoRef.current.style.left = `${e.clientX + 10}px`;
      pixelInfoRef.current.style.top = `${e.clientY - 10}px`;
      pixelInfoRef.current.style.display = 'block';
    }
  };

  const handleMapMouseLeave = () => {
    setShowPixelInfo(false);
    if (pixelInfoRef.current) {
      pixelInfoRef.current.style.display = 'none';
    }
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMapMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setMapPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setMapScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  // 生成CDF图表配置
  const getCDFChartOption = (): EChartsOption => {
    return {
      title: {
        text: '生物量累积分布曲线',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '生物量: {b} g/m²<br>累计百分比: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '生物量 (g/m²)',
        min: 29.6,
        max: 573.8,
        axisLabel: { formatter: '{value}' }
      },
      yAxis: {
        type: 'value',
        name: '累积百分比 (%)',
        min: 0,
        max: 100
      },
      series: [
        {
          data: cdfData.map(item => [item.biomass, item.percentage]),
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3
          },
          markPoint: {
            data: [
              { type: 'max', name: '最大值' }
            ]
          }
        },
        {
          type: 'line',
          data: [[threshold, 0], [threshold, 100]],
          lineStyle: {
            type: 'dashed',
            color: 'red',
            width: 2
          },
          symbol: 'none',
          tooltip: {
            formatter: `告警阈值: ${threshold} g/m²`
          }
        }
      ]
    };
  };

  // 渲染上传面板内容
  const renderUploadContent = () => (
    <UploadSection>
      <UploadContainer>
        {/* 卫星影像上传 */}
        <UploadCard title="Sentinel-2 卫星影像">
          <StyledUpload
            {...uploadProps}
            fileList={uploadedFiles.satellite}
            onChange={handleSatelliteUpload}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>点击上传或拖拽文件</Button>
          </StyledUpload>
          <p style={{ marginTop: 16, color: '#666' }}>
            支持 .tif 或 .tiff 格式，可上传多个文件
          </p>
          
          {/* RGB预览 */}
          {uploadedFiles.satellite.length > 0 && (
            <PreviewContainer>
              <h4>RGB预览:</h4>
              {uploadedFiles.satellite.map(file => (
                <div key={file.uid} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: '#666' }}>{file.name}</p>
                  {previewImages[file.uid] && (
                    <PreviewImage src={previewImages[file.uid]} alt="RGB预览" />
                  )}
                  {coordinateSystems[file.uid] && (
                    <p style={{ fontSize: 11, color: '#1890ff' }}>
                      坐标系: {coordinateSystems[file.uid]}
                    </p>
                  )}
                </div>
              ))}
            </PreviewContainer>
          )}
        </UploadCard>

        {/* 温度数据上传 */}
        <UploadCard title="平均温度数据">
          <StyledUpload
            {...uploadProps}
            fileList={uploadedFiles.temperature}
            onChange={handleTemperatureUpload}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>点击上传或拖拽文件</Button>
          </StyledUpload>
          <p style={{ marginTop: 16, color: '#666' }}>
            支持 .tif 或 .tiff 格式，可上传多个文件
          </p>
          {/* 预览 */}
          {uploadedFiles.temperature.length > 0 && (
            <PreviewContainer>
              <h4>预览:</h4>
              {uploadedFiles.temperature.map(file => (
                <div key={file.uid} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: '#666' }}>{file.name}</p>
                  {previewImages[file.uid] && (
                    <PreviewImage src={previewImages[file.uid]} alt="温度预览" />
                  )}
                  {coordinateSystems[file.uid] && (
                    <p style={{ fontSize: 11, color: '#1890ff' }}>
                      坐标系: {coordinateSystems[file.uid]}
                    </p>
                  )}
                </div>
              ))}
            </PreviewContainer>
          )}
        </UploadCard>

        {/* 降水数据上传 */}
        <UploadCard title="平均降水数据">
          <StyledUpload
            {...uploadProps}
            fileList={uploadedFiles.precipitation}
            onChange={handlePrecipitationUpload}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>点击上传或拖拽文件</Button>
          </StyledUpload>
          <p style={{ marginTop: 16, color: '#666' }}>
            支持 .tif 或 .tiff 格式，可上传多个文件
          </p>
          {/* 预览 */}
          {uploadedFiles.precipitation.length > 0 && (
            <PreviewContainer>
              <h4>预览:</h4>
              {uploadedFiles.precipitation.map(file => (
                <div key={file.uid} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: '#666' }}>{file.name}</p>
                  {previewImages[file.uid] && (
                    <PreviewImage src={previewImages[file.uid]} alt="降水预览" />
                  )}
                  {coordinateSystems[file.uid] && (
                    <p style={{ fontSize: 11, color: '#1890ff' }}>
                      坐标系: {coordinateSystems[file.uid]}
                    </p>
                  )}
                </div>
              ))}
            </PreviewContainer>
          )}
        </UploadCard>
      </UploadContainer>

      {/* 区域一致性检查 */}
      {Object.keys(uploadedFiles).some(key => uploadedFiles[key as keyof typeof uploadedFiles].length > 0) && (
        <ConsistencyCheck>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <InfoCircleOutlined style={{ color: '#52c41a' }} />
            <span>区域一致性检查</span>
            <Button 
              type="primary" 
              size="small"
              loading={isCheckingConsistency}
              onClick={checkConsistency}
            >
              {isCheckingConsistency ? '检查中...' : '开始检查'}
            </Button>
          </div>
          
          {consistencyResult && (
            <div style={{ marginTop: 8 }}>
              <p style={{ 
                color: consistencyResult.isConsistent ? '#52c41a' : '#faad14',
                margin: 0
              }}>
                {consistencyResult.message}
              </p>
              {consistencyResult.isConsistent && consistencyResult.consistentArea && (
                <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  一致区域: {consistencyResult.consistentArea.width} × {consistencyResult.consistentArea.height} 像素
                </p>
              )}
            </div>
          )}
        </ConsistencyCheck>
      )}

      <ParameterSection>
        <Card title="任务参数设置">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ width: 120 }}>任务日期:</span>
              <DatePicker
                format="YYYY-MM-DD"
                value={taskDate ? moment(taskDate) : null}
                onChange={(date: Moment | null) => handleDateChange(date)}
                style={{ width: 200 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ width: 120 }}>备注信息:</span>
              <TextArea
                rows={4}
                placeholder="请输入备注信息（选填）"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="large"
              onClick={startInversion}
              disabled={isInverting || !consistencyResult?.isConsistent}
              style={{ alignSelf: 'flex-end', marginTop: 16 }}
            >
              {isInverting ? '反演中...' : '开始生物量反演'}
            </Button>
          </div>

          {isInverting && (
            <div style={{ marginTop: 24 }}>
              <Progress percent={Math.round(inversionProgress)} status="active" />
              <p style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                正在进行生物量反演，请稍候...
              </p>
            </div>
          )}
        </Card>
      </ParameterSection>
    </UploadSection>
  );

  // 统计曲线区域直接展示图片，保留交互UI
  const renderStatisticsChart = () => (
    <TightCard title="生物量统计分布曲线" bordered={false}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AntdTooltip title="此图为统计分布结果示意，实际系统将根据数据动态生成">
          <img
            src="/images/biomass_distribution_7.png"
            alt="生物量统计分布图"
            style={{ width: '100%', maxWidth: 320, borderRadius: 6, border: '1px solid #eee', background: '#fff' }}
          />
        </AntdTooltip>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span>区间数量:</span>
          <Slider value={binCount} min={5} max={50} onChange={setBinCount} style={{ width: 100 }} />
          <span>{binCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>区间分布:</span>
          <Select value={binType} onChange={setBinType} style={{ width: 100 }}>
            <Option value="equal">等距</Option>
            <Option value="quantile">等分位</Option>
            <Option value="custom">自定义</Option>
          </Select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/biomass_statistics_7.csv" download>
            <Button icon={<DownloadOutlined />}>导出CSV</Button>
          </a>
          <a href="/images/biomass_distribution_7.png" download>
            <Button icon={<DownloadOutlined />}>导出图片</Button>
          </a>
        </div>
      </div>
    </TightCard>
  );

  // 主图交互事件
  const handleMainImgMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOrigin({ ...offset });
  };
  const handleMainImgMouseUp = () => setDragging(false);
  const handleMainImgMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setOffset({
        x: dragOrigin.x + (e.clientX - dragStart.x),
        y: dragOrigin.y + (e.clientY - dragStart.y),
      });
    } else if (mainImgRef.current) {
      // 模拟像素值和经纬度
      const rect = mainImgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - offset.x) / scale);
      const y = ((e.clientY - rect.top - offset.y) / scale);
      if (x >= 0 && y >= 0 && x <= rect.width / scale && y <= rect.height / scale) {
        // 模拟生物量值和经纬度
        const value = 175 + Math.random() * 180;
        const lat = 40 + y * 0.0005;
        const lng = 116 + x * 0.0005;
        setTooltip({ x: e.clientX, y: e.clientY, value, lat, lng });
      } else {
        setTooltip(null);
      }
    }
  };
  const handleMainImgMouseLeave = () => setTooltip(null);
  const handleMainImgWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.5, Math.min(3, scale + (e.deltaY < 0 ? 0.1 : -0.1)));
    setScale(newScale);
  };

  // 主图可视化区域
  const renderMainVisualization = () => (
    <div style={{ position: 'relative', width: MAIN_IMAGE_WIDTH, height: MAIN_IMAGE_HEIGHT, background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px #0001', margin: '0 auto' }}>
      {/* 底图 */}
      {showBasemap && (
        <img
          src={basemapOptions.find(b => b.value === basemap)?.url || ''}
          alt="底图"
          style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 1 }}
        />
      )}
      {/* 主图 */}
      {showMainImage && (
        <img
          ref={mainImgRef}
          src="/images/输出_伪彩色output_visualization_7.png"
          alt="生物量可视化结果"
          style={{
            position: 'absolute',
            left: offset.x,
            top: offset.y,
            width: MAIN_IMAGE_WIDTH,
            height: MAIN_IMAGE_HEIGHT,
            opacity: mainImageOpacity,
            zIndex: 2,
            cursor: dragging ? 'grabbing' : 'crosshair',
            transform: `scale(${scale})`,
            transition: dragging ? 'none' : 'transform 0.1s',
            userSelect: 'none',
          }}
          onMouseDown={handleMainImgMouseDown}
          onMouseUp={handleMainImgMouseUp}
          onMouseMove={handleMainImgMouseMove}
          onMouseLeave={handleMainImgMouseLeave}
          onWheel={handleMainImgWheel}
          draggable={false}
        />
      )}
      {/* Tooltip */}
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.x + 12, top: tooltip.y + 12, background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '8px 12px', borderRadius: 4, fontSize: 12, pointerEvents: 'none', zIndex: 10 }}>
          <div>生物量: {tooltip.value.toFixed(2)} g/m²</div>
          <div>经纬度: {tooltip.lat.toFixed(5)}, {tooltip.lng.toFixed(5)}</div>
        </div>
      )}
    </div>
  );

  // 新布局：主图+控制区纵向排列，右侧为统计卡片
  const renderVisualizationContent = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', gap: 20, marginTop: 24 }}>
      {/* 左侧：主图+控制区 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: MAIN_IMAGE_WIDTH }}>
        {renderMainVisualization()}
        {/* 色带图例 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 8 }}>
          {colormapLegends[colormap].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 24, height: 16, backgroundColor: item.color, borderRadius: 2, border: '1px solid #ccc' }}></div>
              <span style={{ fontSize: 12 }}>{item.value}</span>
            </div>
          ))}
        </div>
        {/* 可视化控制区：两行紧凑横向布局，宽度800px */}
        <TightCard title="可视化控制" bordered={false} style={{ width: MAIN_IMAGE_WIDTH, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, rowGap: 12, marginBottom: 8 }}>
            <Checkbox checked={showMainImage} onChange={e => setShowMainImage(e.target.checked)}>显示主图</Checkbox>
            <Checkbox checked={showBasemap} onChange={e => setShowBasemap(e.target.checked)}>显示底图</Checkbox>
            <span>色带:</span>
            <Select value={colormap} onChange={setColormap} style={{ width: 120 }}>
              {colormapOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
            </Select>
            <span>底图:</span>
            <Select value={basemap} onChange={setBasemap} style={{ width: 120 }} disabled={!showBasemap}>
              {basemapOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
            </Select>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, rowGap: 12 }}>
            <span>透明度:</span>
            <Slider value={Math.round(mainImageOpacity * 100)} min={10} max={100} onChange={v => setMainImageOpacity(v / 100)} style={{ width: 120 }} />
            <span>{Math.round(mainImageOpacity * 100)}%</span>
            <span>缩放:</span>
            <Button size="small" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>-</Button>
            <span>{(scale * 100).toFixed(0)}%</span>
            <Button size="small" onClick={() => setScale(Math.min(3, scale + 0.1))}>+</Button>
            <Button size="small" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>重置</Button>
          </div>
        </TightCard>
      </div>
      {/* 右侧：统计卡片区 */}
      <div style={{ width: RIGHT_PANEL_WIDTH, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {renderStatisticsChart()}
        <TightCard title="生物量统计分析" bordered={false}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ color: '#666', fontSize: 13 }}>平均值</div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>271.14 g/m²</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: 13 }}>中位数</div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>273.23 g/m²</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: 13 }}>标准差</div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>41.20</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: 13 }}>有效像素</div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>1,048,576</div>
            </div>
          </div>
        </TightCard>
        <TightCard title="生态阈值告警设置" bordered={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>告警阈值:</span>
              <Slider value={threshold} min={0} max={100} onChange={setThreshold} style={{ width: 100 }} />
              <span style={{ width: 60, textAlign: 'center' }}>{threshold} g/m²</span>
            </div>
            <div>
              <Checkbox checked={showAlertAreas} onChange={e => setShowAlertAreas(e.target.checked)}>
                显示低于阈值区域
              </Checkbox>
            </div>
            <div style={{ color: '#f5222d', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 24, marginTop: -4 }}>
              <AlertOutlined /> 低于阈值区域占比: {alertPercentage}%
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button>导出告警掩膜</Button>
              <Button type="primary">查看告警统计</Button>
            </div>
          </div>
        </TightCard>
        {inversionComplete && (
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadResult}
            style={{ marginTop: 8 }}
          >
            下载结果栅格
          </Button>
        )}
      </div>
    </div>
  );

  // 渲染统计分析面板内容
  const renderStatisticsContent = () => (
    <div style={{ borderRadius: '4px', border: '1px solid #e8e8e8', padding: '16px' }}>
      <Card title="生物量统计分析">
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <Card style={{ padding: '8px' }}>
              <p style={{ color: '#666', marginBottom: 4, fontSize: 13 }}>平均值</p>
              <p style={{ fontSize: 18, fontWeight: 'bold' }}>271.14 g/m²</p>
            </Card>
            <Card>
              <p style={{ color: '#666', marginBottom: 8 }}>中位数</p>
              <p style={{ fontSize: 20, fontWeight: 'bold' }}>273.23 g/m²</p>
            </Card>
            <Card>
              <p style={{ color: '#666', marginBottom: 8 }}>标准差</p>
              <p style={{ fontSize: 20, fontWeight: 'bold' }}>41.20</p>
            </Card>
            <Card>
              <p style={{ color: '#666', marginBottom: 8 }}>有效像素</p>
              <p style={{ fontSize: 20, fontWeight: 'bold' }}>1,048,576</p>
            </Card>
          </div>
        </div>
        <ControlGroup>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>区间数量:</span>
            <Slider
              value={binCount}
              min={5}
              max={50}
              onChange={setBinCount}
              style={{ width: 150 }}
            />
            <span>{binCount}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>区间分布:</span>
            <Select
              value={binType}
              onChange={setBinType}
              style={{ width: 120 }}
            >
              <Option value="equal">等距</Option>
              <Option value="quantile">等分位</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </div>

          <Button icon={<DownloadOutlined />}>导出CSV</Button>
          <Button icon={<DownloadOutlined />}>导出图片</Button>
        </ControlGroup>
      </Card>

      <AlertSettingsContainer>
        <Card title="生态阈值告警设置">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 120 }}>告警阈值:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <Slider
                  value={threshold}
                  min={0}
                  max={100}
                  onChange={setThreshold}
                />
                <span style={{ width: 60, textAlign: 'center' }}>{threshold} g/m²</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox
                checked={showAlertAreas}
                onChange={e => setShowAlertAreas(e.target.checked)}
              >
                显示低于阈值区域
              </Checkbox>
              <span style={{ color: '#f5222d', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertOutlined /> 低于阈值区域占比: {alertPercentage}%
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <Button>导出告警掩膜</Button>
              <Button type="primary">查看告警统计</Button>
            </div>
          </div>
        </Card>
      </AlertSettingsContainer>
    </div>
  );

  return (
    <Container>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <TabPane tab="数据上传与参数设置" key="upload">
          {renderUploadContent()}
        </TabPane>
        <TabPane tab="结果可视化与分析" key="visualization">
          {inversionComplete ? (
            renderVisualizationContent()
          ) : (
            <StatusText>请先完成生物量反演以查看结果</StatusText>
          )}
        </TabPane>
      </Tabs>
    </Container>
  );
};

export default BiomassInversion;