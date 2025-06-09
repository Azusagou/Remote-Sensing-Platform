import React, { ReactNode, useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Tabs } from 'antd';
import styled from 'styled-components';
import {
  GlobalOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  DownOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  AimOutlined,
  BlockOutlined,
  DiffOutlined,
  RadarChartOutlined,
  PartitionOutlined,
  TagOutlined,
  PictureOutlined,
  LineChartOutlined,
  FileImageOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  RobotOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { SubMenu } = Menu;

const StyledLayout = styled(Layout)`
  height: 100vh;
  background-color: #000;
`;

const StyledHeader = styled(Header)`
  background: #1e2222;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  height: 60px;
  line-height: 60px;
`;

const Logo = styled.div`
  height: 60px;
  padding: 12px;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    height: 36px;
    margin-right: 10px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  
  .header-btn {
    color: #ccc;
    margin-left: 20px;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #fff;
    }
    
    .anticon {
      margin-right: 5px;
    }
  }
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  margin-right: 24px;
  color: white;
`;

const TopNavMenu = styled.div`
  display: flex;
  background: #3b4146;
  padding: 0 16px;
  align-items: center;
  height: 48px;
  
  .ant-menu {
    background: #3b4146;
    color: white;
    border: none;
    width: 100%;
  }
  
  .ant-menu-submenu-title {
    color: white;
  }
  
  .ant-menu-submenu-active, .ant-menu-submenu-selected {
    color: #1890ff;
    background-color: #2b3035;
  }
  
  .ant-menu-item:hover, .ant-menu-submenu-title:hover {
    color: #1890ff !important;
  }
  
  .ant-menu-submenu-popup .ant-menu {
    background: #fff;
  }
  
  .ant-menu-horizontal {
    line-height: 48px;
  }
  
  .ant-menu-horizontal > .ant-menu-submenu::after {
    display: none;
  }
  
  .ant-menu-item-selected {
    color: #1890ff !important;
    border-bottom: 2px solid #1890ff !important;
  }
  
  .ant-menu-item {
    border-bottom: 2px solid transparent;
  }
`;

interface StyledContentProps {
  $isDataSearch: boolean;
}

const StyledContent = styled(Content)<StyledContentProps>`
  padding: ${props => props.$isDataSearch ? '0' : '16px'};
  overflow: auto;
  height: calc(100vh - 108px);
`;

interface MainLayoutProps {
  children: ReactNode;
  onNavigate: (page: string, module?: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate }) => {
  const [activeModule, setActiveModule] = useState('target-classification');
  const [currentPage, setCurrentPage] = useState('home');
  
  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    onNavigate('processing', module);
    setCurrentPage('processing');
  };
  
  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    onNavigate(page);
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: '个人中心',
        },
        {
          key: '2',
          label: '设置',
        },
        {
          key: '3',
          label: '退出登录',
        },
      ]}
    />
  );

  return (
    <StyledLayout>
      <StyledHeader>
        <HeaderLeft>
          <Logo>
            <img src="/logo.svg" alt="Logo" />
            多模态遥感基础模型应用软件平台
          </Logo>
        </HeaderLeft>
        <HeaderRight>
          <a className="header-btn">
            <DatabaseOutlined />
            我的数据
          </a>
          <a className="header-btn">
            <FileTextOutlined />
            文档中心
          </a>
          <a className="header-btn">
            <MessageOutlined />
            使用反馈
          </a>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <a onClick={e => e.preventDefault()} className="header-btn">
              <UserOutlined />
              登录/注册
              <DownOutlined style={{ fontSize: '12px', marginLeft: '5px' }} />
            </a>
          </Dropdown>
        </HeaderRight>
      </StyledHeader>
      
      <TopNavMenu>
        <Menu mode="horizontal" selectedKeys={[currentPage === 'home' ? 'data-search' : currentPage === 'data-analysis' ? 'data-analysis' : activeModule]}>
          <Menu.Item key="data-search" onClick={() => handleNavigation('home')}>
            数据检索
          </Menu.Item>
          <Menu.Item key="target-classification" onClick={() => handleModuleChange('target-classification')}>
            目标分类
          </Menu.Item>
          <Menu.Item key="target-detection" onClick={() => handleModuleChange('target-detection')}>
            目标检测
          </Menu.Item>
          <Menu.Item key="semantic-segmentation" onClick={() => handleModuleChange('semantic-segmentation')}>
            语义分割
          </Menu.Item>
          <Menu.Item key="change-detection" onClick={() => handleModuleChange('change-detection')}>
            变化检测
          </Menu.Item>
          <Menu.Item key="processing" onClick={() => handleNavigation('processing')}>
            处理分析
          </Menu.Item>
          <Menu.Item key="data-analysis" onClick={() => handleNavigation('data-analysis')}>
            数据分析
          </Menu.Item>
          <Menu.Item key="model-training">
            模型训练
          </Menu.Item>
          <Menu.Item key="app-space">
            应用空间
          </Menu.Item>
        </Menu>
      </TopNavMenu>
      
      <StyledContent $isDataSearch={currentPage === 'home'}>
        {children}
      </StyledContent>
    </StyledLayout>
  );
};

export default MainLayout; 