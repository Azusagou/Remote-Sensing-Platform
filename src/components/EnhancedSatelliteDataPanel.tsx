import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tabs, Button, Spin, List, Card, Tag, Tooltip, message, Modal, Descriptions, Image, Radio, Input, Select, Checkbox, DatePicker, Slider, Tree } from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  EyeOutlined, 
  InfoCircleOutlined, 
  LoadingOutlined, 
  FilterOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  BorderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { SatelliteDataItem, SatelliteDataSource } from '../services/SatelliteDataService';
import { BoundingBox } from '../services/GeoService';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Moment } from 'moment';
import RegionService, { Region } from '../services/RegionService';
import type { DataNode } from 'antd/es/tree';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 自定义全局样式
const GlobalStyle = styled.div`
  .ant-select-selector {
    background-color: rgba(30, 34, 34, 0.7) !important;
    color: #fff !important;
    border-color: #444 !important;
  }
  
  .ant-select-selection-placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
  }
  
  .ant-select-arrow {
    color: #fff !important;
  }
  
  .ant-checkbox-wrapper {
    color: #fff !important;
  }
  
  .ant-radio-wrapper {
    color: #fff !important;
  }
  
  .ant-input, .ant-input-textarea {
    background-color: rgba(30, 34, 34, 0.7) !important;
    color: #fff !important;
    border-color: #444 !important;
  }
  
  .ant-input::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
  }
  
  .ant-picker {
    background-color: rgba(30, 34, 34, 0.7) !important;
    border-color: #444 !important;
  }
  
  .ant-picker-input > input {
    color: #fff !important;
  }
  
  .ant-picker-suffix {
    color: #fff !important;
  }
  
  .ant-picker-clear {
    background-color: rgba(30, 34, 34, 0.7) !important;
    color: #fff !important;
  }
  
  .ant-slider-rail {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
  
  .ant-slider-track {
    background-color: #1890ff !important;
  }
  
  .ant-slider-handle {
    border-color: #1890ff !important;
  }
  
  .ant-select-dropdown {
    background-color: rgba(30, 34, 34, 0.9) !important;
    color: #fff !important;
  }
  
  .ant-select-item {
    color: #fff !important;
  }
  
  .ant-select-item-option-selected {
    background-color: rgba(24, 144, 255, 0.2) !important;
  }
  
  .ant-select-item-option-active {
    background-color: rgba(24, 144, 255, 0.1) !important;
  }
  
  .ant-empty-description {
    color: #fff !important;
  }

  /* Antd Tree 深色主题适配 */
  .ant-tree {
    background: transparent !important;
    color: #fff !important;
  }
  .ant-tree-treenode {
    background: transparent !important;
  }
  .ant-tree-node-content-wrapper {
    color: #fff !important;
    background: transparent !important;
  }
  .ant-tree-checkbox .ant-tree-checkbox-inner {
    background-color: #333 !important;
    border-color: #555 !important;
  }
  .ant-tree-checkbox-checked .ant-tree-checkbox-inner {
    background-color: #1890ff !important;
    border-color: #1890ff !important;
  }
  .ant-tree-node-content-wrapper:hover {
    background: rgba(255,255,255,0.08) !important;
  }
`;

const PanelContainer = styled.div<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? '40px' : '320px'};
  height: 100%;
  transition: width 0.3s;
  overflow: hidden;
  background-color: rgba(30, 34, 34, 0.9);
  color: #fff;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #444;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
`;

const PanelTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
  background-color: rgba(0, 0, 0, 0.2);
`;

const FormSection = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #444;
`;

const FormItem = styled.div`
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
`;

const StyledButton = styled(Button)`
  flex: 1;
`;

const DataTypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DataTypeItem = styled.div`
  display: flex;
  align-items: center;
  margin-left: 24px;
`;

const RegionSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RegionLevel = styled.div`
  margin-bottom: 8px;
`;

const CollapseButton = styled(Button)<{ $collapsed: boolean }>`
  position: absolute;
  left: ${props => props.$collapsed ? '40px' : '320px'};
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

const CollapsedPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
`;

interface EnhancedSatelliteDataPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectDataset?: (dataset: SatelliteDataItem) => void;
  onBoundingBoxChange?: (boundingBox: BoundingBox) => void;
  onStartDrawing?: () => void;
  cesiumViewer?: any;
}

// Sentinel分组树形结构
const dataTypeTreeData: DataNode[] = [
  {
    title: 'Landsat',
    key: 'landsat',
    children: [
      { title: 'Landsat5 C2 L2', key: 'landsat5-c2-l2' },
      { title: 'Landsat7 C2 L2', key: 'landsat7-c2-l2' },
      { title: 'Landsat8 C2 L2', key: 'landsat8-c2-l2' },
      { title: 'Landsat9 C2 L1', key: 'landsat9-c2-l1' },
      { title: 'Landsat9 C2 L2', key: 'landsat9-c2-l2' },
    ],
  },
  {
    title: 'Sentinel',
    key: 'sentinel',
    children: [
      { title: 'Sentinel-1 SAR GRD', key: 'sentinel-1-sar-grd' },
      { title: 'Sentinel-2 L2A', key: 'sentinel-2-l2a' },
      { title: 'Sentinel-3 OLCI', key: 'sentinel-3-olci' },
      { title: 'Sentinel-5P OFFL', key: 'sentinel-5p-offl' },
    ],
  }
];

const EnhancedSatelliteDataPanel: React.FC<EnhancedSatelliteDataPanelProps> = ({
  collapsed,
  onToggleCollapse,
  onSelectDataset,
  onBoundingBoxChange,
  onStartDrawing,
  cesiumViewer
}) => {
  const [searchMethod, setSearchMethod] = useState<string>('region');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[Moment | null, Moment | null] | null>([null, null]);
  const [cloudCoverage, setCloudCoverage] = useState<number>(100);
  
  // 在组件内添加树形选择相关状态
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(['landsat', 'sentinel']);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['landsat', 'sentinel']);

  // 加载省份数据
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await RegionService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('加载省份数据失败:', error);
        message.error('加载省份数据失败');
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    
    loadProvinces();
  }, []);

  // 处理省份变化
  useEffect(() => {
    if (selectedProvinceCode) {
      const loadCities = async () => {
        setIsLoadingCities(true);
        try {
          const data = await RegionService.getCities(selectedProvinceCode);
          setCities(data);
        } catch (error) {
          console.error('加载城市数据失败:', error);
          message.error('加载城市数据失败');
        } finally {
          setIsLoadingCities(false);
        }
      };
      
      loadCities();
      setSelectedCityCode('');
      setSelectedDistrictCode('');
      setDistricts([]);
    }
  }, [selectedProvinceCode]);

  // 处理城市变化
  useEffect(() => {
    if (selectedCityCode) {
      const loadDistricts = async () => {
        setIsLoadingDistricts(true);
        try {
          const data = await RegionService.getDistricts(selectedCityCode);
          setDistricts(data);
        } catch (error) {
          console.error('加载区县数据失败:', error);
          message.error('加载区县数据失败');
        } finally {
          setIsLoadingDistricts(false);
        }
      };
      
      loadDistricts();
      setSelectedDistrictCode('');
    }
  }, [selectedCityCode]);

  // 处理搜索方法变化
  const handleSearchMethodChange = (e: any) => {
    setSearchMethod(e.target.value);
  };

  // 处理树形数据选择
  const handleTreeCheck = (checkedKeysValue: React.Key[] | { checked: React.Key[] }) => {
    // 兼容strict和非strict模式
    const keys = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
    setCheckedKeys(keys);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Moment | null, Moment | null] | null) => {
    setDateRange(dates);
  };

  // 处理搜索
  const handleSearch = () => {
    setIsSearching(true);
    
    // 这里应该是实际的搜索逻辑，现在只是模拟
    setTimeout(() => {
      setIsSearching(false);
      message.success('检索完成，已找到 63 条数据');
    }, 1500);
  };

  // 处理绘制区域
  const handleDrawArea = () => {
    if (onStartDrawing) {
      message.info('正在激活绘制工具，请在地图上点击添加多边形顶点');
      onStartDrawing();
    } else {
      message.error('绘制功能未正确初始化');
    }
  };

  // 重置表单
  const handleReset = () => {
    setSearchMethod('region');
    setSelectedProvinceCode('');
    setSelectedCityCode('');
    setSelectedDistrictCode('');
    setDateRange([null, null]);
    setCloudCoverage(100);
    setCheckedKeys(['landsat', 'sentinel']);
    setExpandedKeys(['landsat', 'sentinel']);
  };

  return (
    <GlobalStyle>
      <PanelContainer $collapsed={collapsed}>
        {collapsed ? (
          <CollapsedPanel>
            <Button 
              type="text" 
              icon={<SearchOutlined />} 
              style={{ color: '#fff', marginBottom: '10px' }}
            />
            <Button 
              type="text" 
              icon={<FilterOutlined />} 
              style={{ color: '#fff', marginBottom: '10px' }}
            />
            <Button 
              type="text" 
              icon={<CloudOutlined />} 
              style={{ color: '#fff', marginBottom: '10px' }}
            />
          </CollapsedPanel>
        ) : (
          <>
            <PanelHeader>
              <PanelTitle>卫星数据</PanelTitle>
            </PanelHeader>
            
            <PanelContent>
              <SectionTitle>数据类型</SectionTitle>
              <FormSection>
                <Tree
                  checkable
                  defaultExpandAll
                  expandedKeys={expandedKeys}
                  onExpand={setExpandedKeys}
                  checkedKeys={checkedKeys}
                  onCheck={handleTreeCheck}
                  treeData={dataTypeTreeData}
                  style={{ background: 'transparent', color: '#fff' }}
                />
              </FormSection>
              
              <SectionTitle>检索区域</SectionTitle>
              <FormSection>
                <FormItem>
                  <Radio.Group 
                    value={searchMethod} 
                    onChange={handleSearchMethodChange}
                    style={{ width: '100%' }}
                  >
                    <Radio value="region" style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>行政区</Radio>
                    <Radio value="coordinate" style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>坐标范围</Radio>
                    <Radio value="draw" style={{ color: '#fff', display: 'block' }}>绘制区域</Radio>
                  </Radio.Group>
                </FormItem>
                
                {searchMethod === 'region' && (
                  <RegionSelector>
                    <RegionLevel>
                      <FormLabel>省份/直辖市</FormLabel>
                      <Select
                        placeholder="请选择省份"
                        style={{ width: '100%' }}
                        value={selectedProvinceCode || undefined}
                        onChange={(value) => setSelectedProvinceCode(value)}
                        showSearch
                        loading={isLoadingProvinces}
                        filterOption={(input, option) =>
                          (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {provinces.map(province => (
                          <Option key={province.code} value={province.code}>{province.name}</Option>
                        ))}
                      </Select>
                    </RegionLevel>
                    
                    <RegionLevel>
                      <FormLabel>城市</FormLabel>
                      <Select
                        placeholder="请选择城市"
                        style={{ width: '100%' }}
                        value={selectedCityCode || undefined}
                        onChange={(value) => setSelectedCityCode(value)}
                        disabled={!selectedProvinceCode}
                        loading={isLoadingCities}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {cities.map(city => (
                          <Option key={city.code} value={city.code}>{city.name}</Option>
                        ))}
                      </Select>
                    </RegionLevel>
                    
                    <RegionLevel>
                      <FormLabel>区/县</FormLabel>
                      <Select
                        placeholder="请选择区/县"
                        style={{ width: '100%' }}
                        value={selectedDistrictCode || undefined}
                        onChange={(value) => setSelectedDistrictCode(value)}
                        disabled={!selectedCityCode}
                        loading={isLoadingDistricts}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {districts.map(district => (
                          <Option key={district.code} value={district.code}>{district.name}</Option>
                        ))}
                      </Select>
                    </RegionLevel>
                  </RegionSelector>
                )}
                
                {searchMethod === 'coordinate' && (
                  <FormItem>
                    <FormLabel>坐标输入</FormLabel>
                    <Input.TextArea 
                      placeholder="请输入坐标范围，例如：120.5,30.5,121.5,31.5" 
                      rows={3}
                    />
                  </FormItem>
                )}
                
                {searchMethod === 'draw' && (
                  <FormItem>
                    <Button 
                      type="primary" 
                      icon={<BorderOutlined />} 
                      onClick={handleDrawArea}
                      style={{ width: '100%' }}
                    >
                      开始绘制区域
                    </Button>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#ccc' }}>
                      点击按钮后，在地图上点击添加多边形顶点，至少需要3个点才能形成有效区域
                    </div>
                  </FormItem>
                )}
              </FormSection>
              
              <SectionTitle>采集时间</SectionTitle>
              <FormSection>
                <FormItem>
                  <RangePicker 
                    style={{ width: '100%' }}
                    onChange={handleDateRangeChange}
                  />
                </FormItem>
              </FormSection>
              
              <SectionTitle>云量</SectionTitle>
              <FormSection>
                <FormItem>
                  <FormLabel>
                    <span>云量阈值</span>
                    <span>{cloudCoverage}%</span>
                  </FormLabel>
                  <Slider 
                    min={0}
                    max={100}
                    value={cloudCoverage}
                    onChange={(value: number) => setCloudCoverage(value)}
                  />
                </FormItem>
              </FormSection>
              
              <FormSection>
                <ButtonGroup>
                  <StyledButton 
                    type="default" 
                    onClick={handleReset}
                  >
                    重置
                  </StyledButton>
                  <StyledButton 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                    loading={isSearching}
                  >
                    检索
                  </StyledButton>
                </ButtonGroup>
              </FormSection>
            </PanelContent>
          </>
        )}
      </PanelContainer>
      
      <CollapseButton
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapse}
        $collapsed={collapsed}
      />
    </GlobalStyle>
  );
};

export default EnhancedSatelliteDataPanel; 