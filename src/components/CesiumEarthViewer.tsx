import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, Tooltip, Slider, message } from 'antd';
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
  TerrainProvider,
  CesiumTerrainProvider,
  Cesium3DTileStyle,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  Ion
} from 'cesium';
import {
  MAP_TYPES,
  MAP_LABELS,
  MAP_CONFIGS,
  TERRAIN_CONFIG
} from '../config/map.config';

// 设置Cesium Ion访问令牌
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY4NTk2MX0.XcKpgANiY19MC4bdFUXMVEBToBmBLGjhgGxCPEz5FNg';

// 确保Cesium资源路径正确
if (window.CESIUM_BASE_URL === undefined) {
  window.CESIUM_BASE_URL = '/cesium/';
}
console.log("设置Cesium基础URL:", window.CESIUM_BASE_URL);

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

const LayerControlPanel = styled.div`
  position: absolute;
  left: 20px;
  top: 500px;
  z-index: 1000;
  background-color: rgba(30, 34, 34, 0.8);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  h4 {
    margin: 0;
    font-size: 12px;
    color: #ccc;
  }
  
  .layer-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #ccc;
  }
`;

const PickedPositionPanel = styled.div`
  position: absolute;
  left: 20px;
  bottom: 80px;
  z-index: 1000;
  background-color: rgba(30, 34, 34, 0.8);
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  h4 {
    margin: 0;
    font-size: 12px;
    color: #ccc;
  }
  
  .coordinate-item {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }
  
  .coordinate-label {
    color: #ccc;
  }
  
  .coordinate-value {
    color: #fff;
    font-weight: bold;
  }
`;

interface CesiumEarthViewerProps {
  toggleSidePanel?: () => void;
  sidePanelVisible?: boolean;
}

const CesiumEarthViewer: React.FC<CesiumEarthViewerProps> = ({ toggleSidePanel, sidePanelVisible }) => {
  console.log("渲染CesiumEarthViewer组件");
  const [zoom, setZoom] = useState(3);
  const [baseMap, setBaseMap] = useState<string>(MAP_TYPES.ARCGIS); // 默认使用谷歌地图
  const [coordinates, setCoordinates] = useState({ lng: 116.3912, lat: 39.9073, height: 10000000 });
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [terrainProvider, setTerrainProvider] = useState<TerrainProvider | null>(null);
  const [isTerrainLoaded, setIsTerrainLoaded] = useState(false);
  const [pickPosition, setPickPosition] = useState<{ lng: number; lat: number; height: number } | null>(null);
  const [isPickingMode, setIsPickingMode] = useState(false);
  
  // 图层控制状态
  const [layerVisibility, setLayerVisibility] = useState({
    atmosphere: true,
    fog: true
  });
  
  // 初始化地形
  useEffect(() => {
    const initTerrain = async () => {
      try {
        // 检查配置是否启用地形服务
        if (TERRAIN_CONFIG.worldTerrain) {
          console.log("加载Cesium World Terrain地形数据...");
          const terrain = await createWorldTerrainAsync();
          setTerrainProvider(terrain);
          setIsTerrainLoaded(true);
          console.log("Cesium World Terrain地形数据加载完成");
        } else if (TERRAIN_CONFIG.ionAssetId) {
          console.log("加载Cesium Ion地形数据...");
          const terrain = await CesiumTerrainProvider.fromIonAssetId(TERRAIN_CONFIG.ionAssetId, {
            requestVertexNormals: TERRAIN_CONFIG.requestVertexNormals,
            requestWaterMask: TERRAIN_CONFIG.requestWaterMask
          });
          setTerrainProvider(terrain);
          setIsTerrainLoaded(true);
          console.log("Cesium Ion地形数据加载完成");
        } else if (TERRAIN_CONFIG.url) {
          console.log("加载自定义地形数据...");
          // 使用正确的API创建地形提供器
          const terrain = await CesiumTerrainProvider.fromUrl(TERRAIN_CONFIG.url, {
            requestVertexNormals: TERRAIN_CONFIG.requestVertexNormals,
            requestWaterMask: TERRAIN_CONFIG.requestWaterMask
          });
          setTerrainProvider(terrain);
          setIsTerrainLoaded(true);
          console.log("自定义地形数据加载完成");
        } else {
      console.log("不加载地形数据，使用平面地球...");
      setTerrainProvider(null);
          setIsTerrainLoaded(true);
        }
        
        // 确保地图类型在地形加载后应用
        setTimeout(() => handleMapTypeChange(baseMap), 500);
      } catch (error) {
        console.error("地形数据加载失败:", error);
        // 出错时也设置加载完成，使用平面地球
        setTerrainProvider(null);
        setIsTerrainLoaded(true);
        message.error("地形数据加载失败，使用平面地球");
      }
    };
    
    initTerrain();
    
    return () => {};
  }, [baseMap]);
  
  // 处理地图类型切换
  const handleMapTypeChange = (type: string) => {
    // 增加判空，防止未加载时出错
    if (!isTerrainLoaded || !viewerRef.current || !viewerRef.current.cesiumElement) {
      message.warning('地球尚未加载完成，无法切换底图');
      return;
    }
    const viewer = viewerRef.current.cesiumElement;
    if (!viewer.imageryLayers || !viewer.scene || !viewer.scene.globe) {
      message.error('Cesium实例未完全初始化');
      return;
    }
    const layers = viewer.imageryLayers;
    // 清除现有图层
    layers.removeAll();
    // 添加新图层
    const config = MAP_CONFIGS[type] || MAP_CONFIGS[MAP_TYPES.OSM];
    const provider = new UrlTemplateImageryProvider({
      url: config.url,
      subdomains: config.subdomains,
      maximumLevel: config.maximumLevel
    });
    // 添加图层
    const layer = layers.addImageryProvider(provider);
    // 根据地图类型应用不同设置
    if (type === MAP_TYPES.ARCGIS) {
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      layer.brightness = 1.2;
      layer.contrast = 1.1;
    } else if (type === MAP_TYPES.GOOGLE_XYZ) {
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      layer.brightness = 1.1;
    } else {
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.depthTestAgainstTerrain = false;
    }
    setBaseMap(type);
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
      
      // 不再加载3D建筑
      console.log("不加载3D建筑...");
      
      // 设置初始地图图层
      const layers = viewer.imageryLayers;
      if (layers.length === 0) {
        // 应用默认地图源
        const config = MAP_CONFIGS[baseMap];
        if (config && config.available) {
          console.log("添加默认地图图层:", baseMap);
          const provider = new UrlTemplateImageryProvider({
            url: config.url,
            subdomains: config.subdomains,
            maximumLevel: config.maximumLevel
          });
          layers.addImageryProvider(provider);
        }
      }
      
      // 设置初始视图效果
      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.scene.fog.enabled = layerVisibility.fog;
      viewer.scene.skyAtmosphere.show = layerVisibility.atmosphere;
      viewer.scene.globe.showGroundAtmosphere = layerVisibility.atmosphere;
      
      return () => {
        cameraChangeListener();
      };
    }
  }, []);
  
  // 处理图层可见性切换
  const handleLayerToggle = (layer: string, visible: boolean) => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
    
    const viewer = viewerRef.current.cesiumElement;
    
    switch (layer) {
      case 'atmosphere':
        viewer.scene.globe.showGroundAtmosphere = visible;
        viewer.scene.skyAtmosphere.show = visible;
        break;
      case 'fog':
        viewer.scene.fog.enabled = visible;
        break;
    }
    
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: visible
    }));
  };
  
  // 处理坐标拾取
  const handlePickPosition = () => {
    if (!viewerRef.current || !viewerRef.current.cesiumElement) return;
    
    const viewer = viewerRef.current.cesiumElement;
    setIsPickingMode(true);
    message.info('点击地球表面拾取坐标');
    
    // 添加一次性点击事件
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      // 获取点击位置的笛卡尔坐标
      const cartesian = viewer.scene.pickPosition(movement.position);
      if (cartesian) {
        // 转换为经纬度坐标
        const cartographic = Cartographic.fromCartesian(cartesian);
        const lng = CesiumMath.toDegrees(cartographic.longitude);
        const lat = CesiumMath.toDegrees(cartographic.latitude);
        const height = cartographic.height;
        
        setPickPosition({ lng, lat, height });
        message.success(`已拾取坐标: ${lng.toFixed(6)}, ${lat.toFixed(6)}, 高度: ${height.toFixed(2)}米`);
      } else {
        message.error('无法获取该点坐标');
      }
      
      // 清理事件处理器
      handler.destroy();
      setIsPickingMode(false);
    }, ScreenSpaceEventType.LEFT_CLICK);
  };
  
  return (
    <ViewerContainer>
      <CesiumContainer>
        {/* 不再依赖terrainProvider是否存在，而是使用isTerrainLoaded状态 */}
        {isTerrainLoaded && (
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
            terrainShadows={ShadowMode.DISABLED}
            {...(terrainProvider ? { terrainProvider } : {})}
            shadows={true}
            scene3DOnly={true}
            requestRenderMode={true}
            maximumRenderTimeChange={0}
            contextOptions={{
              webgl: {
                alpha: false,
                antialias: true,
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false,
                powerPreference: "high-performance"
              }
            }}
            creditContainer={document.createElement('div')}
          >
            <Globe 
              enableLighting={true}
              depthTestAgainstTerrain={false}
              baseColor={Color.BLACK}
              showGroundAtmosphere={true}
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
        
        {!isTerrainLoaded && (
          <div style={{ color: 'white', textAlign: 'center', paddingTop: '40vh' }}>
            正在加载地球数据，请稍候...
          </div>
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
        <Tooltip title="坐标拾取" placement="left">
          <Button 
            shape="circle" 
            icon={<EnvironmentOutlined />} 
            onClick={handlePickPosition}
            type={isPickingMode ? "primary" : "default"}
          />
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
        地图级别: {zoom}级 比例尺: 1:{Math.round(1548936969 / Math.pow(2, zoom - 3))} 空间分辨率: {Math.round(14524 / Math.pow(2, zoom - 3))}米 
        坐标: {coordinates.lng.toFixed(6)},{coordinates.lat.toFixed(6)}
      </LocationLabel>
      
      <BaseMapSelector>
        <h4>底图类型</h4>
        {Object.entries(MAP_TYPES).map(([key, value]) => {
          // 只显示可用的地图源
          if (MAP_CONFIGS[value] && MAP_CONFIGS[value].available) {
            return (
              <div 
                key={value}
                className={`base-map-option ${baseMap === value ? 'active' : ''}`} 
                onClick={() => isTerrainLoaded && handleMapTypeChange(value)}
                style={{ cursor: isTerrainLoaded ? 'pointer' : 'not-allowed', opacity: isTerrainLoaded ? 1 : 0.5 }}
              >
                <GlobalOutlined /> {MAP_LABELS[value as keyof typeof MAP_LABELS]}
              </div>
            );
          }
          return null;
        })}
      </BaseMapSelector>
      
      <LayerControlPanel>
        <h4>图层控制</h4>
        <div className="layer-item">
          <Tooltip title="大气层">
            <Button 
              type={layerVisibility.atmosphere ? "primary" : "default"} 
              size="small" 
              icon={<EnvironmentOutlined />} 
              onClick={() => handleLayerToggle('atmosphere', !layerVisibility.atmosphere)}
            />
          </Tooltip>
          <span>大气层</span>
        </div>
        <div className="layer-item">
          <Tooltip title="雾效果">
            <Button 
              type={layerVisibility.fog ? "primary" : "default"} 
              size="small" 
              icon={<EnvironmentOutlined />} 
              onClick={() => handleLayerToggle('fog', !layerVisibility.fog)}
            />
          </Tooltip>
          <span>雾效果</span>
        </div>
      </LayerControlPanel>
      
      {pickPosition && (
        <PickedPositionPanel>
          <h4>拾取的坐标</h4>
          <div className="coordinate-item">
            <span className="coordinate-label">经度:</span>
            <span className="coordinate-value">{pickPosition.lng.toFixed(6)}</span>
          </div>
          <div className="coordinate-item">
            <span className="coordinate-label">纬度:</span>
            <span className="coordinate-value">{pickPosition.lat.toFixed(6)}</span>
          </div>
          <div className="coordinate-item">
            <span className="coordinate-label">高度:</span>
            <span className="coordinate-value">{pickPosition.height.toFixed(2)}米</span>
          </div>
        </PickedPositionPanel>
      )}
    </ViewerContainer>
  );
};

export default CesiumEarthViewer;