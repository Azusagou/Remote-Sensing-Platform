import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, Tooltip, Slider } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  EnvironmentOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  CompassOutlined,
  GlobalOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  Viewer, 
  Entity, 
  PointGraphics, 
  CameraFlyTo, 
  Globe, 
  CesiumComponentRef,
  ImageryLayer
} from 'resium';
import {
  Cartesian3,
  createWorldTerrainAsync,
  createOsmBuildingsAsync,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  Color,
  UrlTemplateImageryProvider,
  ShadowMode,
  TerrainProvider
} from 'cesium';
import {
  MAP_TYPES,
  MAP_LABELS,
  OSM_CONFIG,
  GOOGLE_SATELLITE_CONFIG,
  ARCGIS_IMAGERY_CONFIG,
  TERRAIN_CONFIG
} from '../config/map.config';

// 确保Cesium资源路径正确
if (window.CESIUM_BASE_URL === undefined) {
  window.CESIUM_BASE_URL = '/cesium/';
}

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #000;
`;

const CesiumContainer = styled.div`
  width: 100%;
  height: 100%;
  
  .cesium-viewer {
    width: 100%;
    height: 100%;
  }
  
  .cesium-viewer-bottom {
    display: none;
  }
`;

const ControlPanel = styled.div`
  position: absolute;
  right: 20px;
  top: 200px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(30, 34, 34, 0.8);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  .ant-btn {
    background-color: rgba(60, 60, 60, 0.8);
    border-color: #444;
    color: #fff;
    
    &:hover {
      background-color: rgba(80, 80, 80, 0.8);
      border-color: #555;
    }
  }
`;

const NavigationControl = styled.div`
  position: absolute;
  right: 20px;
  bottom: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background-color: rgba(30, 34, 34, 0.8);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  .ant-btn {
    background-color: rgba(60, 60, 60, 0.8);
    border-color: #444;
    color: #fff;
    
    &:hover {
      background-color: rgba(80, 80, 80, 0.8);
      border-color: #555;
    }
  }
`;

const LocationLabel = styled.div`
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
  background-color: rgba(30, 34, 34, 0.8);
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const ZoomSlider = styled(Slider)`
  height: 150px;
  margin: 10px 0;
  
  .ant-slider-rail {
    background-color: #444;
  }
  
  .ant-slider-track {
    background-color: #1890ff;
  }
  
  .ant-slider-handle {
    border: solid 2px #1890ff;
    background-color: #fff;
  }
`;

const BaseMapSelector = styled.div`
  position: absolute;
  left: 20px;
  top: 80px;
  z-index: 1000;
  background-color: rgba(30, 34, 34, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  h4 {
    margin: 0;
    font-size: 12px;
    color: #ccc;
  }
  
  .base-map-option {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 3px;
    border-radius: 2px;
    color: #ccc;
    
    &:hover {
      background-color: rgba(80, 80, 80, 0.8);
    }
    
    &.active {
      background-color: rgba(24, 144, 255, 0.3);
      color: #1890ff;
    }
  }
`;

interface CesiumEarthViewerProps {
  toggleSidePanel?: () => void;
  sidePanelVisible?: boolean;
}

// 获取影像提供者
const getImageryProvider = (type: string) => {
  switch (type) {
    case MAP_TYPES.OSM:
      return [
        new UrlTemplateImageryProvider({
          url: OSM_CONFIG.url,
          subdomains: OSM_CONFIG.subdomains,
          maximumLevel: OSM_CONFIG.maximumLevel
        })
      ];

    case MAP_TYPES.GOOGLE_SATELLITE:
      return [
        new UrlTemplateImageryProvider({
          url: GOOGLE_SATELLITE_CONFIG.url,
          subdomains: GOOGLE_SATELLITE_CONFIG.subdomains,
          maximumLevel: GOOGLE_SATELLITE_CONFIG.maximumLevel
        })
      ];

    case MAP_TYPES.ARCGIS_IMAGERY:
      return [
        new UrlTemplateImageryProvider({
          url: ARCGIS_IMAGERY_CONFIG.url,
          maximumLevel: ARCGIS_IMAGERY_CONFIG.maximumLevel
        })
      ];

    default:
      return [
        new UrlTemplateImageryProvider({
          url: OSM_CONFIG.url,
          subdomains: OSM_CONFIG.subdomains
        })
      ];
  }
};

const CesiumEarthViewer: React.FC<CesiumEarthViewerProps> = ({ toggleSidePanel, sidePanelVisible }) => {
  const [zoom, setZoom] = useState(3);
  const [baseMap, setBaseMap] = useState<string>(MAP_TYPES.GOOGLE_SATELLITE);
  const [coordinates, setCoordinates] = useState({ lng: 116.3912, lat: 39.9073, height: 10000000 });
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [terrainProvider, setTerrainProvider] = useState<TerrainProvider | null>(null);
  
  // 初始化地形
  useEffect(() => {
    const initTerrain = async () => {
      try {
        const terrain = await createWorldTerrainAsync();
        setTerrainProvider(terrain);
      } catch (error) {
        console.error('Failed to load terrain:', error);
      }
    };

    initTerrain();
  }, []);
  
  // 处理地图类型切换
  const handleMapTypeChange = (type: string) => {
    setBaseMap(type);
    
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      const layers = viewer.imageryLayers;
      
      // 清除现有图层
      layers.removeAll();
      
      // 添加新图层
      const providers = getImageryProvider(type);
      providers.forEach(provider => {
        layers.addImageryProvider(provider);
      });

      // 优化图层显示效果
      if (type === MAP_TYPES.GOOGLE_SATELLITE || type === MAP_TYPES.ARCGIS_IMAGERY) {
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        if (layers.length > 0) {
          const baseLayer = layers.get(0);
          baseLayer.brightness = 1.2;
          baseLayer.contrast = 1.1;
          baseLayer.gamma = 1.05;
        }
      } else {
        // OSM标准地图
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = true;
      }
    }
  };
  
  // 处理放大缩小
  const handleZoomIn = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      const cameraHeight = camera.positionCartographic.height;
      camera.zoomIn(cameraHeight * 0.2);
      updateZoomLevel();
    }
  };
  
  const handleZoomOut = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      const cameraHeight = camera.positionCartographic.height;
      camera.zoomOut(cameraHeight * 0.2);
      updateZoomLevel();
    }
  };
  
  // 更新缩放级别
  const updateZoomLevel = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      const height = camera.positionCartographic.height;
      // 将高度转换为近似的缩放级别
      const newZoom = Math.max(1, Math.min(18, Math.round(19 - Math.log2(height / 1000))));
      setZoom(newZoom);
    }
  };
  
  // 重置视图
  const handleReset = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromDegrees(116.3912, 39.9073, 10000000),
        orientation: {
          heading: 0,
          pitch: -CesiumMath.PI_OVER_TWO,
          roll: 0
        }
      });
    }
  };
  
  // 全屏显示
  const handleFullscreen = () => {
    const container = document.querySelector('.cesium-viewer');
    if (container && document.fullscreenEnabled) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`全屏模式错误: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };
  
  // 处理平移
  const handlePanUp = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      camera.moveUp(camera.positionCartographic.height * 0.1);
    }
  };
  
  const handlePanDown = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      camera.moveDown(camera.positionCartographic.height * 0.1);
    }
  };
  
  const handlePanLeft = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      camera.moveLeft(camera.positionCartographic.height * 0.1);
    }
  };
  
  const handlePanRight = () => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const camera = viewerRef.current.cesiumElement.camera;
      camera.moveRight(camera.positionCartographic.height * 0.1);
    }
  };
  
  // 监听相机变化
  useEffect(() => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      
      // 添加相机变化事件监听
      const cameraChangeListener = viewer.camera.changed.addEventListener(() => {
        const position = viewer.camera.positionCartographic;
        setCoordinates({
          lng: CesiumMath.toDegrees(position.longitude),
          lat: CesiumMath.toDegrees(position.latitude),
          height: position.height
        });
        updateZoomLevel();
      });
      
      // 初始化3D建筑
      createOsmBuildingsAsync().then(tileset => {
        viewer.scene.primitives.add(tileset);
      });
      
      return () => {
        cameraChangeListener();
      };
    }
  }, [viewerRef.current]);
  
  return (
    <ViewerContainer>
      <CesiumContainer>
        {terrainProvider && (
          <Viewer
            ref={viewerRef}
            full
            timeline={false}
            animation={false}
            homeButton={false}
            baseLayerPicker={false}
            geocoder={false}
            navigationHelpButton={false}
            sceneModePicker={false}
            fullscreenButton={false}
            terrainProvider={terrainProvider}
            terrainShadows={ShadowMode.ENABLED}
            shadows={true}
            scene3DOnly={true}
            requestRenderMode={true}
            maximumRenderTimeChange={0}
          >
            <Globe 
              enableLighting={true}
              depthTestAgainstTerrain={true}
              baseColor={Color.BLACK}
            />
            <Entity position={Cartesian3.fromDegrees(116.4074, 39.9042, 0)}>
              <PointGraphics pixelSize={10} color={Color.RED} />
            </Entity>
            <CameraFlyTo 
              duration={0}
              destination={Cartesian3.fromDegrees(116.3912, 39.9073, 10000000)}
              orientation={{
                heading: 0,
                pitch: -CesiumMath.PI_OVER_TWO,
                roll: 0
              }}
              once
            />
          </Viewer>
        )}
      </CesiumContainer>
      
      <ControlPanel>
        <Tooltip title="放大" placement="left">
          <Button shape="circle" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </Tooltip>
        <Tooltip title="缩小" placement="left">
          <Button shape="circle" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
        </Tooltip>
        <ZoomSlider 
          vertical 
          min={1} 
          max={18} 
          value={zoom} 
          onChange={(value: number) => {
            if (viewerRef.current && viewerRef.current.cesiumElement) {
              const camera = viewerRef.current.cesiumElement.camera;
              const height = 1000 * Math.pow(2, 19 - value);
              const cartographic = camera.positionCartographic;
              camera.flyTo({
                destination: Cartesian3.fromRadians(
                  cartographic.longitude,
                  cartographic.latitude,
                  height
                )
              });
            }
          }} 
        />
        <Tooltip title="重置视图" placement="left">
          <Button shape="circle" icon={<ReloadOutlined />} onClick={handleReset} />
        </Tooltip>
        <Tooltip title="全屏" placement="left">
          <Button shape="circle" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
        </Tooltip>
      </ControlPanel>
      
      <NavigationControl>
        <Button shape="circle" onClick={handlePanUp}>↑</Button>
        <div style={{ display: 'flex', gap: '5px' }}>
          <Button shape="circle" onClick={handlePanLeft}>←</Button>
          <Button shape="circle" icon={<CompassOutlined />} onClick={handleReset} />
          <Button shape="circle" onClick={handlePanRight}>→</Button>
        </div>
        <Button shape="circle" onClick={handlePanDown}>↓</Button>
      </NavigationControl>
      
      <LocationLabel>
        <InfoCircleOutlined />
        地图级别: 3级 比例尺: 1:{Math.round(1548936969 / Math.pow(2, zoom - 3))} 空间分辨率: {Math.round(14524 / Math.pow(2, zoom - 3))}米 
        坐标: {coordinates.lng.toFixed(6)},{coordinates.lat.toFixed(6)}
      </LocationLabel>
      
      <BaseMapSelector>
        <h4>底图类型</h4>
        {Object.entries(MAP_TYPES).map(([key, value]) => (
          <div 
            key={value}
            className={`base-map-option ${baseMap === value ? 'active' : ''}`} 
            onClick={() => handleMapTypeChange(value)}
          >
            <GlobalOutlined /> {MAP_LABELS[value as keyof typeof MAP_LABELS]}
          </div>
        ))}
      </BaseMapSelector>
    </ViewerContainer>
  );
};

export default CesiumEarthViewer; 