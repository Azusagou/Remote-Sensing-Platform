import React, { useState } from 'react';
import styled from 'styled-components';
import CesiumEarthViewer from '../components/CesiumEarthViewer';
import SatelliteDataPanel from '../components/SatelliteDataPanel';
import { Button, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const HomeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  background-color: #000;
`;

const MapContainer = styled.div`
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const CollapseButton = styled(Button)<{ $collapsed: boolean }>`
  position: absolute;
  left: ${props => props.$collapsed ? '20px' : '20px'};
  top: 20px;
  z-index: 1000;
  transition: left 0.3s;
  background-color: rgba(30, 34, 34, 0.8);
  border-color: #444;
  color: #fff;
  
  &:hover {
    background-color: rgba(80, 80, 80, 0.8);
    border-color: #555;
    color: #fff;
  }
`;

const RecommendDataButton = styled(Button)`
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
  background-color: rgba(30, 34, 34, 0.8);
  border-color: #444;
  color: #fff;
  
  &:hover {
    background-color: rgba(80, 80, 80, 0.8);
    border-color: #555;
    color: #fff;
  }
`;

const Home: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const handleDatasetSelect = (dataset: any) => {
    setSelectedDataset(dataset);
    console.log('选中数据集:', dataset);
  };
  
  return (
    <HomeContainer>
      <SatelliteDataPanel 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
        onSelectDataset={handleDatasetSelect}
      />
      
      <MapContainer>
        <CollapseButton
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          $collapsed={sidebarCollapsed}
        />
        <RecommendDataButton>
          推荐数据
        </RecommendDataButton>
        <CesiumEarthViewer />
      </MapContainer>
    </HomeContainer>
  );
};

export default Home; 