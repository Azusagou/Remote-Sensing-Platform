import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ProcessingPage from './pages/ProcessingPage';
import DataAnalysisPage from './pages/DataAnalysisPage';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import './App.css';

// 重要：导入 antd 样式
import 'antd/dist/antd.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentModule, setCurrentModule] = useState<string>('target-classification');

  const renderContent = () => {
    switch (currentPage) {
      case 'processing':
        return <ProcessingPage module={currentModule} />;
      case 'data-analysis':
        return <DataAnalysisPage />;
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
      <MainLayout onNavigate={handleNavigation}>
        {renderContent()}
      </MainLayout>
    </ConfigProvider>
  );
};

export default App; 