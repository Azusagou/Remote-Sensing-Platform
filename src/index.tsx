import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 导入 antd 样式
import 'antd/dist/antd.css';
// 导入 Cesium 样式
import 'cesium/Build/Cesium/Widgets/widgets.css';

// 设置 Cesium 基础 URL
window.CESIUM_BASE_URL = '/cesium/';

console.log('Rendering App component...');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 