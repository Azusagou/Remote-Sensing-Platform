import React, { useEffect, useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ProcessingPage from './pages/ProcessingPage';
import DataAnalysisPage from './pages/DataAnalysisPage';
import BiomassInversionPage from './pages/BiomassInversionPage';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import './App.css';

// 重要：导入 antd 样式
import 'antd/dist/antd.css';

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #f5f7fb;
    --bg-muted: #eef1f6;
    --text: #0f1222;
    --text-secondary: #5b6178;
    --card-bg: #ffffff;
    --card-border: #e9edf3;
    --primary: #1677ff;
    --header-bg: rgba(255, 255, 255, 0.7);
    --header-text: #0f1222;
    --menu-bg: rgba(255,255,255,0.55);
    --menu-text: #1f2430;
    --shadow: 0 10px 30px rgba(17, 23, 41, 0.08);
  }

  [data-theme='dark'] {
    --bg: #0f1115;
    --bg-muted: #16191f;
    --text: #e6e8ee;
    --text-secondary: #a6adbb;
    --card-bg: #141821;
    --card-border: #202532;
    --primary: #3b82f6;
    --header-bg: rgba(20, 24, 33, 0.7);
    --header-text: #e6e8ee;
    --menu-bg: rgba(20,24,33,0.55);
    --menu-text: #e6e8ee;
    --shadow: 0 12px 36px rgba(0,0,0,0.35);
  }

  html, body, #root {
    height: 100%;
  }

  body {
    background: radial-gradient(1200px 800px at 10% -10%, var(--bg-muted), transparent 60%),
                radial-gradient(1000px 700px at 110% 10%, var(--bg-muted), transparent 50%),
                linear-gradient(180deg, var(--bg), var(--bg));
    color: var(--text);
  }

  .ant-layout, .ant-layout-content {
    background: transparent !important;
  }

  .ant-card {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow);
    border-radius: 14px !important;
    color: var(--text) !important;
  }

  /* Component surfaces & controls */
  .ant-dropdown-menu, .ant-menu-submenu-popup .ant-menu, .ant-select-dropdown, .ant-picker-panel-container,
  .ant-modal-content, .ant-tooltip-inner, .ant-upload-drag, .ant-input, .ant-input-affix-wrapper,
  .ant-select-selector, .ant-picker, .ant-tabs-content-holder {
    background: var(--card-bg) !important;
    color: var(--text) !important;
    border-color: var(--card-border) !important;
  }
  .ant-dropdown-menu, .ant-menu-submenu-popup .ant-menu, .ant-select-dropdown { 
    border: 1px solid var(--card-border) !important; 
    box-shadow: var(--shadow);
  }
  .ant-input, .ant-input-affix-wrapper, .ant-select-selector, .ant-picker { 
    border: 1px solid var(--card-border) !important; 
  }
  .ant-input::placeholder { color: var(--text-secondary); }
  .ant-select-item { color: var(--text); }
  .ant-select-item-option-active, .ant-select-item-option-selected { background: var(--bg-muted) !important; }
  .ant-tooltip-inner { background: rgba(0,0,0,0.85) !important; color: #fff !important; }
  .ant-upload-drag { border-color: var(--card-border) !important; }
  .ant-upload-drag:hover { border-color: var(--primary) !important; }
  .ant-menu { background: transparent !important; }
  .ant-menu-item, .ant-menu-submenu-title { color: var(--menu-text) !important; }
  .ant-menu-item-selected { color: var(--primary) !important; }

  /* Typography defaults */
  h1, h2, h3, h4, h5, h6, label, .ant-typography, .ant-card-head-title { color: var(--text) !important; }
  p, small, .text-secondary { color: var(--text-secondary) !important; }

  /* Inputs & pickers text */
  .ant-input, .ant-input-affix-wrapper input, .ant-picker-input > input, .ant-select-selection-item, .ant-select-selection-placeholder {
    color: var(--text) !important;
    background: var(--card-bg) !important;
  }
  .ant-picker, .ant-picker-panel-container { color: var(--text) !important; }
  .ant-picker-input > input::placeholder { color: var(--text-secondary) !important; }
  .ant-form-item .ant-form-item-label > label { color: var(--text) !important; }

  /* Upload text */
  .ant-upload .ant-upload-text { color: var(--text) !important; }
  .ant-upload .ant-upload-hint { color: var(--text-secondary) !important; }

  /* Tabs */
  .ant-tabs-tab-btn { color: var(--text) !important; }
  .ant-tabs-ink-bar { background: var(--primary) !important; }

  /* Breadcrumb */
  .ant-breadcrumb, .ant-breadcrumb a, .ant-breadcrumb-separator { color: var(--text-secondary) !important; }

  /* Buttons */
  .ant-btn-default { background: var(--card-bg); border-color: var(--card-border); color: var(--text); }
  .ant-btn-default:hover { background: var(--bg-muted); border-color: var(--primary); color: var(--text); }

  /* Icons */
  .anticon { color: var(--text-secondary); }

  /* Picker & Select arrows */
  .ant-picker-suffix, .ant-select-arrow { color: var(--text-secondary) !important; }

  /* Form labels */
  .ant-form-item-label > label { color: var(--text) !important; }

  /* Textarea */
  .ant-input-textarea .ant-input { background: var(--card-bg) !important; color: var(--text) !important; }

  /* Override common inline gray text */
  [data-theme='dark'] *[style*="color: #666"],
  [data-theme='dark'] *[style*="color:#666"],
  [data-theme='dark'] *[style*="color: rgb(102, 102, 102)"] {
    color: var(--text-secondary) !important;
  }

  .ant-btn-primary {
    background: var(--primary);
    border-color: var(--primary);
  }

  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: rgba(120, 126, 154, 0.35); border-radius: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
`;

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentModule, setCurrentModule] = useState<string>('target-classification');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const renderContent = () => {
    switch (currentPage) {
      case 'processing':
        return <ProcessingPage module={currentModule} />;
      case 'data-analysis':
        return <DataAnalysisPage />;
      case 'biomass-inversion':
        return <BiomassInversionPage />;
      case 'home':
      default:
        return <Home />;
    }
  };

  // 页面导航处理
  const handleNavigation = (page: string, module?: string) => {
    console.log('Navigation to:', page, 'Module:', module);
    setCurrentPage(page);
    if (module) {
      setCurrentModule(module);
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <GlobalStyle />
      <MainLayout onNavigate={handleNavigation} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(v => !v)}>
        {renderContent()}
      </MainLayout>
    </ConfigProvider>
  );
};

export default App;