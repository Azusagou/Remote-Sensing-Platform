import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import CesiumEarthViewer from '../components/CesiumEarthViewer';
import EnhancedSatelliteDataPanel from '../components/EnhancedSatelliteDataPanel';
import DrawPolygonTool from '../components/DrawPolygonTool';
import { message } from 'antd';
import { SatelliteDataItem } from '../services/SatelliteDataService';
import { BoundingBox, Polygon, polygonToBoundingBox } from '../services/GeoService';

// 声明全局Cesium
declare global {
  interface Window {
    Cesium: any;
  }
}

const HomeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  background-color: #000;
`;

const MapContainer = styled.div<{ $sidebarWidth: string }>`
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
  margin-left: ${props => props.$sidebarWidth};
  transition: margin-left 0.3s;
`;

const Home: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<SatelliteDataItem | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const cesiumViewerRef = useRef<any>(null);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // 计算侧边栏宽度
  const sidebarWidth = sidebarCollapsed ? '40px' : '320px';
  
  // 初始化Cesium实例
  useEffect(() => {
    let checkCesium: any = null;
    let timeoutId: any = null;
    let unmounted = false;

    const initCesium = () => {
      if (!window.CESIUM_BASE_URL) {
        window.CESIUM_BASE_URL = process.env.PUBLIC_URL + "/cesium/";
        console.log("重新设置Cesium基础URL:", window.CESIUM_BASE_URL);
      }

      console.log("开始检查Cesium实例...");
      checkCesium = setInterval(() => {
        if (unmounted) return;
        const viewerElement = document.querySelector('.cesium-viewer');
        if (viewerElement) {
          const cesiumWidget = viewerElement.querySelector('.cesium-widget');
          if (cesiumWidget && (cesiumWidget as any).__cesiumWidget) {
            const widget = (cesiumWidget as any).__cesiumWidget;
            if (widget.viewer) {
              cesiumViewerRef.current = widget.viewer;
              setCesiumLoaded(true);
              clearInterval(checkCesium);
              console.log('Cesium实例已成功加载');
              return;
            }
          }
          if ((viewerElement as any).__cesium) {
            cesiumViewerRef.current = (viewerElement as any).__cesium;
            setCesiumLoaded(true);
            clearInterval(checkCesium);
            console.log('通过备用方法获取Cesium实例成功');
          }
        }
      }, 500);

      timeoutId = setTimeout(() => {
        if (unmounted) return;
        if (!cesiumLoaded) {
          clearInterval(checkCesium);
          console.error('Cesium实例加载超时');
          // message.error('地图加载失败，请刷新页面重试');
        }
      }, 10000);
    };

    initCesium();

    return () => {
      unmounted = true;
      if (checkCesium) clearInterval(checkCesium);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [cesiumLoaded]);
  
  // 切换侧边栏
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // 处理数据集选择
  const handleDatasetSelect = (dataset: SatelliteDataItem) => {
    setSelectedDataset(dataset);
    console.log('选中数据集:', dataset);
    
    // 如果有边界框，飞行到该区域
    if (dataset.boundingBox && cesiumViewerRef.current) {
      const { west, south, east, north } = dataset.boundingBox;
      cesiumViewerRef.current.camera.flyTo({
        destination: window.Cesium.Rectangle.fromDegrees(west, south, east, north)
      });
    }
  };
  
  // 处理开始绘制
  const handleStartDrawing = () => {
    if (!cesiumViewerRef.current) {
      message.error('地图尚未加载完成，请稍后再试');
      return;
    }
    
    setIsDrawing(true);
    message.info('请在地图上点击绘制多边形区域');
  };
  
  // 处理绘制完成
  const handleDrawComplete = (polygon: Polygon) => {
    setIsDrawing(false);
    
    // 计算边界框
    const bbox = polygonToBoundingBox(polygon);
    setBoundingBox(bbox);
    
    message.success('区域绘制完成');
  };
  
  // 处理绘制取消
  const handleDrawCancel = () => {
    setIsDrawing(false);
    message.info('已取消区域绘制');
  };
  
  // 处理边界框变化
  const handleBoundingBoxChange = (bbox: BoundingBox) => {
    setBoundingBox(bbox);
    
    // 如果有边界框，飞行到该区域
    if (bbox && cesiumViewerRef.current) {
      const { west, south, east, north } = bbox;
      cesiumViewerRef.current.camera.flyTo({
        destination: window.Cesium.Rectangle.fromDegrees(west, south, east, north)
      });
    }
  };
  
  return (
    <HomeContainer>
      <MapContainer $sidebarWidth={sidebarWidth}>
        <CesiumEarthViewer key="cesium-earth-viewer-instance" />
        
        {isDrawing && cesiumViewerRef.current && (
          <DrawPolygonTool 
            cesiumViewer={cesiumViewerRef.current} 
            onComplete={handleDrawComplete}
            onCancel={handleDrawCancel}
          />
        )}
      </MapContainer>
      
      <EnhancedSatelliteDataPanel 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
        onSelectDataset={handleDatasetSelect}
        onBoundingBoxChange={handleBoundingBoxChange}
        onStartDrawing={handleStartDrawing}
        cesiumViewer={cesiumViewerRef.current}
      />
    </HomeContainer>
  );
};

export default Home; 