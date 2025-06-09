import React, { useState } from 'react';
import styled from 'styled-components';
import { Collapse, Checkbox, Button, Input, Select, Tag, Tooltip, Typography, Space, Divider, Radio, DatePicker, Slider, InputNumber, Tree } from 'antd';
import { SearchOutlined, DownloadOutlined, FilterOutlined, CalendarOutlined, CloudDownloadOutlined, EnvironmentOutlined, ReloadOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import type { AntTreeNodeProps } from 'antd/es/tree/Tree';

const { Panel } = Collapse;
const { Option } = Select;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const SatelliteDataPanelContainer = styled.div`
  width: 320px;
  height: 100%;
  background-color: #1e2222;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s;
  
  &.collapsed {
    width: 0;
  }
`;

const PanelHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a2a2a;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
    background-color: #1e2222;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 3px;
  }
`;

const SearchBar = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  
  .ant-input {
    background-color: #333;
    border-color: #444;
    color: #fff;
  }
  
  .ant-input-prefix {
    color: #888;
  }
  
  .ant-input::placeholder {
    color: #888;
  }
  
  .ant-collapse {
    background: transparent;
    border: none;
  }
  
  .ant-collapse-header {
    color: #ccc !important;
    padding: 8px 0 !important;
  }
  
  .ant-collapse-content {
    background-color: transparent;
    border-top: 1px solid #333;
  }
  
  .ant-collapse-item {
    border-bottom: none !important;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 16px;
  
  .ant-checkbox-wrapper {
    color: #ccc;
  }
  
  .ant-checkbox-inner {
    background-color: #333;
    border-color: #555;
  }
  
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #1890ff;
    border-color: #1890ff;
  }
  
  .ant-select {
    width: 100%;
  }
  
  .ant-select-selector {
    background-color: #333 !important;
    border-color: #444 !important;
    color: #fff;
  }
  
  .ant-select-selection-item {
    color: #fff;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  
  .tab {
    flex: 1;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    color: #ccc;
    
    &.active {
      color: #1890ff;
      border-bottom: 2px solid #1890ff;
    }
    
    &:hover {
      background-color: #2a2a2a;
    }
  }
`;

const SectionTitle = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
  border-bottom: 1px solid #333;
`;

const DataTypeSection = styled.div`
  padding: 8px 16px;
  
  .data-type-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
    color: #ccc;
    
    .ant-checkbox-wrapper {
      display: flex;
      align-items: center;
    }
    
    .icon {
      margin-right: 8px;
      width: 16px;
      height: 16px;
      display: inline-block;
    }
  }

  .ant-tree {
    background-color: transparent;
    color: #ccc;
  }

  .ant-tree-treenode {
    padding: 4px 0;
  }

  .ant-tree-node-content-wrapper {
    color: #ccc;
  }

  .ant-tree-node-content-wrapper:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .ant-tree-checkbox .ant-tree-checkbox-inner {
    background-color: #333;
    border-color: #555;
  }

  .ant-tree-checkbox-checked .ant-tree-checkbox-inner {
    background-color: #1890ff;
    border-color: #1890ff;
  }
`;

const SearchAreaSection = styled.div`
  padding: 8px 16px;
  
  .search-option {
    display: flex;
    align-items: center;
    margin: 12px 0;
    
    .ant-radio-wrapper {
      color: #ccc;
    }
    
    .ant-radio-inner {
      background-color: #333;
      border-color: #555;
    }
    
    .ant-radio-checked .ant-radio-inner {
      border-color: #1890ff;
    }
    
    .ant-radio-inner::after {
      background-color: #1890ff;
    }
  }
  
  .search-input {
    margin-top: 8px;
    
    .ant-input {
      background-color: #333;
      border-color: #444;
      color: #fff;
    }
  }
  
  .area-button {
    width: 100%;
    margin-top: 8px;
    background-color: #333;
    border-color: #444;
    color: #ccc;
    
    &:hover {
      background-color: #444;
      border-color: #555;
      color: #fff;
    }
  }
`;

const TimeSection = styled.div`
  padding: 8px 16px;
  
  .ant-picker {
    background-color: #333;
    border-color: #444;
    color: #fff;
    width: 100%;
  }
  
  .ant-picker-input > input {
    color: #ccc;
  }
  
  .ant-picker-separator {
    color: #888;
  }
  
  .ant-picker-suffix {
    color: #888;
  }
`;

const CloudCoverSection = styled.div`
  padding: 8px 16px;
  
  .slider-container {
    display: flex;
    align-items: center;
    
    .ant-slider {
      flex: 1;
      margin: 0 12px;
      
      .ant-slider-rail {
        background-color: #444;
      }
      
      .ant-slider-track {
        background-color: #1890ff;
      }
      
      .ant-slider-handle {
        border-color: #1890ff;
      }
    }
    
    .ant-input-number {
      width: 60px;
      background-color: #333;
      border-color: #444;
      
      .ant-input-number-input {
        color: #ccc;
      }
      
      .ant-input-number-handler-wrap {
        background-color: #333;
        border-color: #444;
      }
      
      .ant-input-number-handler-up-inner, 
      .ant-input-number-handler-down-inner {
        color: #888;
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid #333;
  
  button {
    flex: 1;
    margin: 0 4px;
  }
  
  .reset-btn {
    background-color: #333;
    border-color: #444;
    color: #ccc;
    
    &:hover {
      background-color: #444;
      border-color: #555;
      color: #fff;
    }
  }
  
  .search-btn {
    background-color: #1890ff;
    border-color: #1890ff;
    
    &:hover {
      background-color: #40a9ff;
      border-color: #40a9ff;
    }
  }
`;

// 数据类型树形结构
const dataTypeTreeData: DataNode[] = [
  {
    title: 'Landsat',
    key: 'landsat',
    children: [
      {
        title: 'Landsat5 C2 L2',
        key: 'landsat5-c2-l2',
      },
      {
        title: 'Landsat7 C2 L2',
        key: 'landsat7-c2-l2',
      },
      {
        title: 'Landsat8 C2 L2',
        key: 'landsat8-c2-l2',
      },
      {
        title: 'Landsat9 C2 L1',
        key: 'landsat9-c2-l1',
      },
      {
        title: 'Landsat9 C2 L2',
        key: 'landsat9-c2-l2',
      },
    ],
  },
  {
    title: 'Sentinel',
    key: 'sentinel',
    children: [
      {
        title: 'Sentinel-1 SAR GRD',
        key: 'sentinel-1-sar-grd',
      },
      {
        title: 'Sentinel-2 L2A',
        key: 'sentinel-2-l2a',
      },
      {
        title: 'Sentinel-3 OLCI',
        key: 'sentinel-3-olci',
      },
      {
        title: 'Sentinel-5P OFFL',
        key: 'sentinel-5p-offl',
      },
    ],
  },
];

// 模拟卫星数据
const satelliteDataSources = [
  {
    id: 1,
    name: 'Landsat 8',
    description: '美国陆地卫星8号，提供30米分辨率多光谱影像',
    resolution: '30m',
    provider: 'NASA/USGS',
    date: '2022-01-01',
    tags: ['多光谱', '陆地', '全球覆盖'],
    thumbnail: 'https://via.placeholder.com/80'
  },
  {
    id: 2,
    name: 'Sentinel-2',
    description: '欧空局哨兵2号，提供10-60米分辨率多光谱影像',
    resolution: '10m',
    provider: 'ESA',
    date: '2022-02-15',
    tags: ['多光谱', '陆地', '欧洲'],
    thumbnail: 'https://via.placeholder.com/80'
  },
  {
    id: 3,
    name: 'MODIS',
    description: '中分辨率成像光谱仪，提供全球每日覆盖',
    resolution: '250m-1km',
    provider: 'NASA',
    date: '2022-03-10',
    tags: ['全球每日', '环境监测'],
    thumbnail: 'https://via.placeholder.com/80'
  },
  {
    id: 4,
    name: 'GF-1',
    description: '中国高分一号，提供2米全色和8米多光谱影像',
    resolution: '2m/8m',
    provider: 'CNSA',
    date: '2022-01-20',
    tags: ['高分辨率', '中国'],
    thumbnail: 'https://via.placeholder.com/80'
  },
  {
    id: 5,
    name: 'GF-2',
    description: '中国高分二号，提供1米全色和4米多光谱影像',
    resolution: '1m/4m',
    provider: 'CNSA',
    date: '2022-02-05',
    tags: ['高分辨率', '中国'],
    thumbnail: 'https://via.placeholder.com/80'
  },
  {
    id: 6,
    name: 'Sentinel-1',
    description: '欧空局哨兵1号，提供C波段SAR雷达影像',
    resolution: '5-40m',
    provider: 'ESA',
    date: '2022-03-01',
    tags: ['SAR', '雷达', '全天候'],
    thumbnail: 'https://via.placeholder.com/80'
  }
];

interface SatelliteDataPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectDataset?: (dataset: any) => void;
}

const SatelliteDataPanel: React.FC<SatelliteDataPanelProps> = ({ 
  collapsed, 
  onToggleCollapse,
  onSelectDataset
}) => {
  const [activeTab, setActiveTab] = useState('satellite');
  const [searchMethod, setSearchMethod] = useState('region');
  const [cloudCover, setCloudCover] = useState(20);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['landsat', 'sentinel']);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(['landsat', 'sentinel']);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['landsat', 'sentinel']);

  // 处理树形数据选择
  const handleTreeCheck = (checkedKeysValue: React.Key[]) => {
    setCheckedKeys(checkedKeysValue);
    
    // 更新selectedDataTypes以保持兼容性
    const topLevelTypes = checkedKeysValue.filter(key => 
      key === 'landsat' || key === 'sentinel'
    );
    setSelectedDataTypes(topLevelTypes as string[]);
  };

  // 处理数据集选择
  const handleDatasetSelect = (id: number) => {
    setSelectedDataset(id);
    const dataset = satelliteDataSources.find(item => item.id === id);
    if (dataset && onSelectDataset) {
      onSelectDataset(dataset);
    }
  };

  // 自定义切换图标
  const renderSwitcherIcon = (props: AntTreeNodeProps) => {
    const { expanded } = props;
    return expanded ? <CaretDownOutlined /> : <CaretRightOutlined />;
  };

  return (
    <SatelliteDataPanelContainer className={collapsed ? 'collapsed' : ''}>
      <TabsContainer>
        <div 
          className={`tab ${activeTab === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveTab('satellite')}
        >
          卫星数据
        </div>
        <div 
          className={`tab ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => setActiveTab('product')}
        >
          数据产品
        </div>
        <div 
          className={`tab ${activeTab === 'service' ? 'active' : ''}`}
          onClick={() => setActiveTab('service')}
        >
          地图服务
        </div>
      </TabsContainer>

      <SectionTitle>数据类型</SectionTitle>
      <DataTypeSection>
        <Tree
          checkable
          checkStrictly
          defaultExpandAll
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          checkedKeys={checkedKeys}
          onCheck={(checked) => handleTreeCheck(checked as React.Key[])}
          treeData={dataTypeTreeData}
          switcherIcon={renderSwitcherIcon}
        />
      </DataTypeSection>

      <SectionTitle>检索区域</SectionTitle>
      <SearchAreaSection>
        <div className="search-option">
          <Radio 
            checked={searchMethod === 'region'} 
            onChange={() => setSearchMethod('region')}
          >
            <span style={{ marginLeft: '8px' }}>请输入要检索的区域</span>
          </Radio>
        </div>
        {searchMethod === 'region' && (
          <div className="search-input">
            <Input placeholder="输入区域名称" />
          </div>
        )}
        
        <div className="search-option">
          <Radio 
            checked={searchMethod === 'administrative'} 
            onChange={() => setSearchMethod('administrative')}
          >
            <span style={{ marginLeft: '8px' }}>请选择行政区</span>
          </Radio>
        </div>
        {searchMethod === 'administrative' && (
          <div className="search-input">
            <Select placeholder="选择行政区" style={{ width: '100%' }}>
              <Option value="beijing">北京市</Option>
              <Option value="shanghai">上海市</Option>
              <Option value="guangdong">广东省</Option>
            </Select>
          </div>
        )}
        
        <div className="search-option">
          <Radio 
            checked={searchMethod === 'draw'} 
            onChange={() => setSearchMethod('draw')}
          >
            <span style={{ marginLeft: '8px' }}>圈画区域</span>
          </Radio>
        </div>
        {searchMethod === 'draw' && (
          <Button className="area-button" icon={<EnvironmentOutlined />}>
            在地图上点击圈画区域
          </Button>
        )}
        
        <div className="search-option">
          <Radio 
            checked={searchMethod === 'upload'} 
            onChange={() => setSearchMethod('upload')}
          >
            <span style={{ marginLeft: '8px' }}>上传文件</span>
          </Radio>
        </div>
        {searchMethod === 'upload' && (
          <Button className="area-button" icon={<CloudDownloadOutlined />}>
            上传矢量文件进行检索
          </Button>
        )}
      </SearchAreaSection>

      <SectionTitle>采集时间</SectionTitle>
      <TimeSection>
        <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
      </TimeSection>

      <SectionTitle>云量</SectionTitle>
      <CloudCoverSection>
        <div className="slider-container">
          <Slider 
            min={0} 
            max={100} 
            value={cloudCover} 
            onChange={(value) => setCloudCover(value as number)} 
            style={{ flex: 1 }}
          />
          <InputNumber 
            min={0} 
            max={100} 
            value={cloudCover} 
            onChange={(value) => setCloudCover(value as number)} 
          />
          <span style={{ marginLeft: '4px' }}>%</span>
        </div>
      </CloudCoverSection>

      <ActionButtons>
        <Button className="reset-btn" icon={<ReloadOutlined />}>
          重置
        </Button>
        <Button className="search-btn" type="primary" icon={<SearchOutlined />}>
          检索
        </Button>
      </ActionButtons>
    </SatelliteDataPanelContainer>
  );
};

export default SatelliteDataPanel; 