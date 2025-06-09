import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, Tooltip, Slider, Badge } from 'antd';
import { 
  ZoomInOutlined, 
  ZoomOutOutlined, 
  EnvironmentOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  RotateLeftOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CompassOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';

// 修复Leaflet默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  
  .leaflet-container {
    width: 100%;
    height: 100%;
    background: #000;
  }
`;

const ControlPanel = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const LocationLabel = styled.div`
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ScaleBar = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const LayerPanel = styled.div`
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ZoomSlider = styled(Slider)`
  height: 150px;
  margin: 10px 0;
  
  .ant-slider-track {
    background-color: #1890ff;
  }
  
  .ant-slider-handle {
    border: solid 2px #1890ff;
  }
`;

const SidePanelToggle = styled(Button)`
  position: absolute;
  left: 20px;
  top: 70px;
  z-index: 1000;
  background-color: rgba(24, 144, 255, 0.8);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &:hover, &:focus {
    background-color: rgba(24, 144, 255, 1);
    color: white;
  }
`;

const BaseMapSelector = styled.div`
  position: absolute;
  left: 20px;
  top: 120px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  h4 {
    margin: 0;
    font-size: 12px;
  }
  
  .base-map-option {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 3px;
    border-radius: 2px;
    
    &:hover {
      background-color: #f0f0f0;
    }
    
    &.active {
      background-color: #e6f7ff;
      color: #1890ff;
    }
  }
`;

interface MapControlsProps {
  setZoom: (zoom: number) => void;
  zoom: number;
  onPanUp: () => void;
  onPanDown: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
}

// 用于控制地图的组件
const MapControls: React.FC<MapControlsProps> = ({ 
  setZoom, 
  zoom, 
  onPanUp, 
  onPanDown, 
  onPanLeft, 
  onPanRight 
}) => {
  const map = useMap();
  
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  
  // 更新map.on事件监听器
  useEffect(() => {
    const onMove = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (zoom) {
        setZoom(zoom);
      }
    };
    
    map.on('move', onMove);
    
    return () => {
      map.off('move', onMove);
    };
  }, [map, setZoom]);
  
  return null;
};

interface EarthViewerProps {
  toggleSidePanel?: () => void;
  sidePanelVisible?: boolean;
}

const EarthViewer: React.FC<EarthViewerProps> = ({ toggleSidePanel, sidePanelVisible }) => {
  const [zoom, setZoom] = useState(3);
  const [coordinates, setCoordinates] = useState({ lng: 116.3912, lat: 39.9073 });
  const [baseMap, setBaseMap] = useState<string>('street');
  const mapRef = useRef<LeafletMap | null>(null);
  
  // 处理地图类型切换
  const handleMapTypeChange = (type: string) => {
    setBaseMap(type);
  };
  
  // 处理放大缩小
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 1, 18));
  };
  
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 1, 1));
  };
  
  // 重置视图
  const handleReset = () => {
    setZoom(3);
    setCoordinates({ lng: 116.3912, lat: 39.9073 });
    if (mapRef.current) {
      mapRef.current.setView([39.9073, 116.3912], 3);
    }
  };
  
  // 全屏显示
  const handleFullscreen = () => {
    const container = document.querySelector('.leaflet-container');
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
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      mapRef.current.panTo([center.lat + 1, center.lng]);
    }
  };
  
  const handlePanDown = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      mapRef.current.panTo([center.lat - 1, center.lng]);
    }
  };
  
  const handlePanLeft = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      mapRef.current.panTo([center.lat, center.lng - 1]);
    }
  };
  
  const handlePanRight = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      mapRef.current.panTo([center.lat, center.lng + 1]);
    }
  };
  
  // 更新地图位置
  useEffect(() => {
    const updateCoords = () => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        setCoordinates({ lat: center.lat, lng: center.lng });
      }
    };
    
    if (mapRef.current) {
      mapRef.current.on('move', updateCoords);
      return () => {
        mapRef.current?.off('move', updateCoords);
      };
    }
  }, [mapRef.current]);
  
  // 根据选择的底图类型返回对应的TileLayer
  const renderBaseMap = () => {
    switch (baseMap) {
      case 'satellite':
        return (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        );
      case 'terrain':
        return (
          <TileLayer
            url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.jpg"
            subdomains="abcd"
          />
        );
      case 'street':
      default:
        return (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        );
    }
  };
  
  return (
    <ViewerContainer>
      {toggleSidePanel && (
        <SidePanelToggle
          type="primary"
          icon={sidePanelVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={toggleSidePanel}
        />
      )}
      
      <MapWrapper>
        <MapContainer 
          center={[coordinates.lat, coordinates.lng]} 
          zoom={zoom} 
          zoomControl={false}
          attributionControl={false}
          ref={(map) => {mapRef.current = map}}
        >
          {renderBaseMap()}
          <MapControls 
            setZoom={setZoom} 
            zoom={zoom} 
            onPanUp={handlePanUp}
            onPanDown={handlePanDown}
            onPanLeft={handlePanLeft}
            onPanRight={handlePanRight}
          />
          <Marker position={[39.9042, 116.4074]}>
            <Popup>
              北京市中心
            </Popup>
          </Marker>
        </MapContainer>
      </MapWrapper>
      
      <ControlPanel>
        <Tooltip title="放大">
          <Button type="primary" shape="circle" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </Tooltip>
        <Tooltip title="缩小">
          <Button type="primary" shape="circle" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
        </Tooltip>
        <ZoomSlider 
          vertical 
          min={1} 
          max={18} 
          value={zoom} 
          onChange={(value) => setZoom(value as number)} 
        />
        <Tooltip title="重置视图">
          <Button type="primary" shape="circle" icon={<ReloadOutlined />} onClick={handleReset} />
        </Tooltip>
        <Tooltip title="全屏">
          <Button type="primary" shape="circle" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
        </Tooltip>
      </ControlPanel>
      
      <NavigationControl>
        <Button type="primary" shape="circle" onClick={handlePanUp}>↑</Button>
        <div style={{ display: 'flex', gap: '5px' }}>
          <Button type="primary" shape="circle" onClick={handlePanLeft}>←</Button>
          <Button type="primary" shape="circle" icon={<CompassOutlined />} onClick={handleReset} />
          <Button type="primary" shape="circle" onClick={handlePanRight}>→</Button>
        </div>
        <Button type="primary" shape="circle" onClick={handlePanDown}>↓</Button>
      </NavigationControl>
      
      <LocationLabel>
        <InfoCircleOutlined />
        经度: {coordinates.lng.toFixed(4)} 纬度: {coordinates.lat.toFixed(4)} 缩放: {zoom}倍
      </LocationLabel>
      
      <ScaleBar>
        <span>{zoom < 7 ? '1000km' : zoom < 10 ? '100km' : zoom < 13 ? '10km' : zoom < 16 ? '1km' : '100m'}</span>
      </ScaleBar>
      
      <LayerPanel>
        <Badge count={3} size="small">
          图层
        </Badge>
      </LayerPanel>
      
      <BaseMapSelector>
        <h4>底图类型</h4>
        <div 
          className={`base-map-option ${baseMap === 'street' ? 'active' : ''}`} 
          onClick={() => handleMapTypeChange('street')}
        >
          <GlobalOutlined /> 标准地图
        </div>
        <div 
          className={`base-map-option ${baseMap === 'satellite' ? 'active' : ''}`} 
          onClick={() => handleMapTypeChange('satellite')}
        >
          <GlobalOutlined /> 卫星影像
        </div>
        <div 
          className={`base-map-option ${baseMap === 'terrain' ? 'active' : ''}`} 
          onClick={() => handleMapTypeChange('terrain')}
        >
          <GlobalOutlined /> 地形图
        </div>
      </BaseMapSelector>
    </ViewerContainer>
  );
};

export default EarthViewer; 