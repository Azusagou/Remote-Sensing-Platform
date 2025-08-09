import React, { ReactNode, useState } from 'react';
import { Layout, Menu, Dropdown } from 'antd';
import styled from 'styled-components';
import {
  BarChartOutlined,
  DownOutlined,
  UserOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  MessageOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;

const StyledLayout = styled(Layout)`
  height: 100vh;
  background: transparent;
`;

const StyledHeader = styled(Header)`
  background: var(--header-bg);
  backdrop-filter: saturate(120%) blur(10px);
  -webkit-backdrop-filter: saturate(120%) blur(10px);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--card-border);
  height: 60px;
`;

const Logo = styled.div`
  height: 60px;
  padding: 0 8px;
  color: var(--header-text);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.4px;
  display: flex;
  align-items: center;
  gap: 10px;
  img { height: 28px; }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .header-btn {
    color: var(--header-text);
    opacity: 0.85;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  .header-btn:hover {
    opacity: 1;
    border-color: var(--card-border);
    background: rgba(0,0,0,0.04);
  }
`;

const TopNavMenu = styled.div`
  display: flex;
  background: var(--menu-bg);
  backdrop-filter: saturate(120%) blur(10px);
  -webkit-backdrop-filter: saturate(120%) blur(10px);
  padding: 0 12px;
  align-items: center;
  height: 46px;
  border-bottom: 1px solid var(--card-border);

  .ant-menu {
    background: transparent;
    color: var(--menu-text);
    border: none;
    width: 100%;
  }
  .ant-menu-horizontal { line-height: 46px; }
  .ant-menu-horizontal > .ant-menu-submenu::after { display: none; }
  .ant-menu-item, .ant-menu-submenu-title { color: var(--menu-text) !important; }
  .ant-menu-item:hover, .ant-menu-submenu-title:hover { color: var(--primary) !important; }
  .ant-menu-item-selected {
    color: var(--primary) !important;
    border-bottom: 2px solid var(--primary) !important;
  }
`;

interface StyledContentProps {
  $isDataSearch: boolean;
}

const StyledContent = styled(Content)<StyledContentProps>`
  padding: ${props => (props.$isDataSearch ? '0' : '18px')};
  overflow: auto;
  height: calc(100vh - 106px);
`;

interface MainLayoutProps {
  children: ReactNode;
  onNavigate: (page: string, module?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate, isDarkMode, onToggleTheme }) => {
  const [currentPage, setCurrentPage] = useState('home');

  const handleModuleChange = (module: string) => {
    onNavigate('processing', module);
    setCurrentPage(module);
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    onNavigate(page);
  };

  const userMenu = (
    <Menu
      items={[
        { key: '1', label: '个人中心' },
        { key: '2', label: '设置' },
        { key: '3', label: '退出登录' },
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
          <button className="header-btn" type="button">
            <DatabaseOutlined /> 我的数据
          </button>
          <button className="header-btn" type="button">
            <FileTextOutlined /> 文档中心
          </button>
          <button className="header-btn" type="button">
            <MessageOutlined /> 使用反馈
          </button>
          <button className="header-btn" type="button" onClick={onToggleTheme} aria-label="切换主题">
            <BulbOutlined /> {isDarkMode ? '深色' : '浅色'}
          </button>
          <Dropdown overlay={userMenu} trigger={['click']}>
            <button className="header-btn" type="button">
              <UserOutlined /> 登录/注册 <DownOutlined style={{ fontSize: 12 }} />
            </button>
          </Dropdown>
        </HeaderRight>
      </StyledHeader>

      <TopNavMenu>
        <Menu mode="horizontal" selectedKeys={[currentPage]}>
          <Menu.Item key="home" onClick={() => handleNavigation('home')}>
            数据检索
          </Menu.Item>
          <Menu.Item key="data-analysis" onClick={() => handleNavigation('data-analysis')}>
            <BarChartOutlined /> <span>数据分析</span>
          </Menu.Item>
          <Menu.Item key="biomass-inversion" onClick={() => handleNavigation('biomass-inversion')}>
            <ExperimentOutlined /> <span>生物量反演</span>
          </Menu.Item>
          <Menu.Item key="model-training">模型训练</Menu.Item>
          <Menu.Item key="app-space">应用空间</Menu.Item>
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
        </Menu>
      </TopNavMenu>

      <StyledContent $isDataSearch={currentPage === 'home'}>
        {children}
      </StyledContent>
    </StyledLayout>
  );
};

export default MainLayout;