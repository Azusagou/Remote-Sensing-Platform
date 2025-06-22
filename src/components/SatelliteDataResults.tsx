import React, { useState } from 'react';
import styled from 'styled-components';
import { List, Card, Button, Tag, Tooltip, Modal, Spin, message, Tabs, Descriptions, Image, Space } from 'antd';
import { DownloadOutlined, EyeOutlined, InfoCircleOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { SatelliteDataItem } from '../services/SatelliteDataService';
import { downloadSatelliteData } from '../services/SatelliteDataService';

const { TabPane } = Tabs;

const ResultsContainer = styled.div`
  background-color: #1e2222;
  color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a2a2a;
`;

const ResultsTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 16px;
`;

const ResultsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
    background-color: #1e2222;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #444;
    border-radius: 3px;
  }
  
  .ant-list-item {
    border-bottom: 1px solid #333;
    padding: 16px 0;
  }
  
  .ant-card {
    background-color: #2a2a2a;
    border-color: #444;
    color: #ccc;
  }
  
  .ant-card-meta-title {
    color: #fff;
  }
  
  .ant-card-meta-description {
    color: #aaa;
  }
  
  .ant-empty-description {
    color: #aaa;
  }
`;

const ResultCard = styled(Card)`
  width: 100%;
  margin-bottom: 16px;
  
  .ant-card-body {
    padding: 12px;
  }
  
  .ant-card-meta-title {
    margin-bottom: 8px;
  }
`;

const ResultImage = styled.div`
  width: 100px;
  height: 100px;
  background-color: #333;
  margin-right: 16px;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
`;

const ResultMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  
  .meta-item {
    font-size: 12px;
    color: #aaa;
    display: flex;
    align-items: center;
    
    .label {
      margin-right: 4px;
      color: #888;
    }
  }
`;

const ResultActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  
  button {
    padding: 0 12px;
  }
`;

const StyledTag = styled(Tag)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

const DetailModal = styled(Modal)`
  .ant-modal-content {
    background-color: #2a2a2a;
    border-radius: 8px;
  }
  
  .ant-modal-header {
    background-color: #2a2a2a;
    border-bottom: 1px solid #444;
    border-radius: 8px 8px 0 0;
    
    .ant-modal-title {
      color: #fff;
    }
  }
  
  .ant-modal-body {
    padding: 24px;
    color: #ccc;
  }
  
  .ant-modal-footer {
    border-top: 1px solid #444;
    
    button {
      background-color: #333;
      border-color: #444;
      color: #ccc;
      
      &:hover {
        background-color: #444;
        border-color: #555;
        color: #fff;
      }
      
      &.ant-btn-primary {
        background-color: #1890ff;
        border-color: #1890ff;
        color: #fff;
        
        &:hover {
          background-color: #40a9ff;
          border-color: #40a9ff;
        }
      }
    }
  }
  
  .ant-tabs-nav {
    margin-bottom: 16px;
  }
  
  .ant-tabs-tab {
    color: #aaa;
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #1890ff;
    }
  }
  
  .ant-tabs-ink-bar {
    background-color: #1890ff;
  }
  
  .ant-descriptions-item-label {
    color: #888;
  }
  
  .ant-descriptions-item-content {
    color: #ccc;
  }
`;

const PreviewImage = styled(Image)`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  background-color: #333;
`;

interface SatelliteDataResultsProps {
  results: SatelliteDataItem[];
  loading: boolean;
  onPreview?: (item: SatelliteDataItem) => void;
  onSelect?: (item: SatelliteDataItem) => void;
}

const SatelliteDataResults: React.FC<SatelliteDataResultsProps> = ({ 
  results, 
  loading,
  onPreview,
  onSelect
}) => {
  const [detailItem, setDetailItem] = useState<SatelliteDataItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const showDetailModal = (item: SatelliteDataItem) => {
    setDetailItem(item);
    setDetailModalVisible(true);
  };
  
  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };
  
  const handlePreview = (item: SatelliteDataItem) => {
    if (onPreview) {
      onPreview(item);
    }
  };
  
  const handleSelect = (item: SatelliteDataItem) => {
    if (onSelect) {
      onSelect(item);
    }
  };
  
  const handleDownload = async (item: SatelliteDataItem) => {
    try {
      setDownloadingId(item.id);
      const downloadUrl = await downloadSatelliteData(item.id);
      
      // 在实际应用中，这里应该触发文件下载
      // 现在我们只是模拟下载过程
      message.success(`数据下载成功: ${item.name}`);
      
      // 创建一个临时链接并模拟点击下载
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${item.satellite}_${item.acquisitionDate.split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      message.error('下载失败: ' + (error as Error).message);
    } finally {
      setDownloadingId(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <ResultsContainer>
      <ResultsHeader>
        <ResultsTitle>检索结果 ({results.length})</ResultsTitle>
      </ResultsHeader>
      
      <ResultsContent>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <div style={{ marginTop: 16, color: '#aaa' }}>正在检索数据...</div>
          </div>
        ) : (
          <List
            dataSource={results}
            locale={{ emptyText: '没有找到符合条件的数据' }}
            renderItem={(item) => (
              <List.Item>
                <ResultCard>
                  <div style={{ display: 'flex' }}>
                    <ResultImage>
                      <img src={item.thumbnailUrl} alt={item.name} />
                    </ResultImage>
                    
                    <ResultInfo>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>
                        {item.name}
                      </div>
                      
                      <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>
                        {item.description}
                      </div>
                      
                      <ResultMeta>
                        <div className="meta-item">
                          <span className="label">卫星:</span> {item.satellite}
                        </div>
                        <div className="meta-item">
                          <span className="label">传感器:</span> {item.sensor}
                        </div>
                        <div className="meta-item">
                          <span className="label">分辨率:</span> {item.resolution}
                        </div>
                        <div className="meta-item">
                          <span className="label">云量:</span> {item.cloudCover}%
                        </div>
                        <div className="meta-item">
                          <span className="label">采集时间:</span> {formatDate(item.acquisitionDate)}
                        </div>
                      </ResultMeta>
                      
                      <ResultActions>
                        <Button 
                          size="small" 
                          icon={<EyeOutlined />} 
                          onClick={() => handlePreview(item)}
                        >
                          预览
                        </Button>
                        <Button 
                          size="small" 
                          icon={<InfoCircleOutlined />} 
                          onClick={() => showDetailModal(item)}
                        >
                          详情
                        </Button>
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={downloadingId === item.id ? <LoadingOutlined /> : <DownloadOutlined />} 
                          onClick={() => handleDownload(item)}
                          loading={downloadingId === item.id}
                          disabled={downloadingId === item.id}
                        >
                          下载
                        </Button>
                      </ResultActions>
                    </ResultInfo>
                  </div>
                </ResultCard>
              </List.Item>
            )}
          />
        )}
      </ResultsContent>
      
      {detailItem && (
        <DetailModal
          title={`数据详情 - ${detailItem.name}`}
          open={detailModalVisible}
          onCancel={handleCloseDetailModal}
          width={700}
          footer={[
            <Button key="close" onClick={handleCloseDetailModal}>
              关闭
            </Button>,
            <Button 
              key="download" 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(detailItem)}
            >
              下载数据
            </Button>,
          ]}
        >
          <Tabs defaultActiveKey="info">
            <TabPane tab="基本信息" key="info">
              <PreviewImage src={detailItem.thumbnailUrl} />
              
              <Descriptions column={2} style={{ marginTop: 16 }} bordered size="small">
                <Descriptions.Item label="卫星" span={1}>{detailItem.satellite}</Descriptions.Item>
                <Descriptions.Item label="传感器" span={1}>{detailItem.sensor}</Descriptions.Item>
                <Descriptions.Item label="分辨率" span={1}>{detailItem.resolution}</Descriptions.Item>
                <Descriptions.Item label="云量" span={1}>{detailItem.cloudCover}%</Descriptions.Item>
                <Descriptions.Item label="采集时间" span={2}>{formatDate(detailItem.acquisitionDate)}</Descriptions.Item>
                <Descriptions.Item label="数据提供方" span={2}>{detailItem.provider}</Descriptions.Item>
                <Descriptions.Item label="覆盖范围" span={2}>
                  北: {detailItem.boundingBox.north.toFixed(4)}°, 
                  南: {detailItem.boundingBox.south.toFixed(4)}°, 
                  东: {detailItem.boundingBox.east.toFixed(4)}°, 
                  西: {detailItem.boundingBox.west.toFixed(4)}°
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="元数据" key="metadata">
              <Descriptions column={1} bordered size="small">
                {Object.entries(detailItem.metadata).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </TabPane>
          </Tabs>
        </DetailModal>
      )}
    </ResultsContainer>
  );
};

export default SatelliteDataResults; 