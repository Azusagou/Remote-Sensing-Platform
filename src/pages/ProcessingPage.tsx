import React, { useState } from 'react';
import { Tabs, Upload, Button, Card, Row, Col, Divider, Select, Switch, Progress } from 'antd';
import { InboxOutlined, SelectOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { TabPane } = Tabs;
const { Dragger } = Upload;
const { Option } = Select;

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 180px);
`;

const ImagePreviewArea = styled.div`
  width: 100%;
  height: 400px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const SelectionBox = styled.div<{ left: number; top: number; width: number; height: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px dashed #1890ff;
  background-color: rgba(24, 144, 255, 0.2);
  pointer-events: none;
`;

const ToolbarContainer = styled.div`
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const ResultCard = styled(Card)`
  margin-top: 16px;
  height: 400px;
  overflow: auto;
`;

const ResultImagePreview = styled.div`
  width: 100%;
  height: 340px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const StatsContainer = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-top: 16px;
`;

const ChangeDetectionContainer = styled.div`
  display: flex;
  gap: 16px;
  
  .upload-area {
    flex: 1;
  }
`;

interface SelectionArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ProcessingPageProps {
  module: string;
}

const ProcessingPage: React.FC<ProcessingPageProps> = ({ module }) => {
  // 根据传入的module参数设置激活的选项卡
  const getTabKey = () => {
    switch (module) {
      case 'target-classification':
        return '1';
      case 'target-detection':
        return '2';
      case 'semantic-segmentation':
        return '3';
      case 'change-detection':
        return '4';
      default:
        return '1';
    }
  };

  const [activeTab, setActiveTab] = useState(getTabKey());
  
  // 当module属性变化时更新activeTab
  React.useEffect(() => {
    setActiveTab(getTabKey());
  }, [module]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // 处理图片上传
  const handleImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 处理变化检测中的图片上传
  const handleBeforeImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBeforeImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleAfterImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAfterImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 处理选择区域开始
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    setSelectionArea({
      left: x,
      top: y,
      width: 0,
      height: 0
    });
  };

  // 处理选择区域移动
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionArea) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionArea({
      left: Math.min(startPoint.x, x),
      top: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y)
    });
  };

  // 处理选择区域结束
  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
  };

  // 处理开始选择区域
  const handleStartSelection = () => {
    setIsSelecting(true);
  };

  // 处理处理图像
  const handleProcessImage = () => {
    // 模拟处理进度
    setProcessingProgress(0);
    setProcessingCompleted(false);
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessingCompleted(true);
          // 设置示例结果图片
          setResultImageUrl(imageUrl);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // 处理下载结果
  const handleDownloadResult = () => {
    if (!resultImageUrl) return;
    
    const link = document.createElement('a');
    link.href = resultImageUrl;
    link.download = '处理结果.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '//jsonplaceholder.typicode.com/posts/',
    onChange: handleImageUpload,
    showUploadList: false,
    accept: 'image/*'
  };

  const beforeUploadProps = {
    ...uploadProps,
    onChange: handleBeforeImageUpload
  };

  const afterUploadProps = {
    ...uploadProps,
    onChange: handleAfterImageUpload
  };

  return (
    <Container>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="目标分类" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="上传图像" bordered={false}>
                {!imageUrl ? (
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                    <p className="ant-upload-hint">支持单个或批量上传</p>
                  </Dragger>
                ) : (
                  <>
                    <ImagePreviewArea
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img src={imageUrl} alt="Preview" />
                      {selectionArea && (
                        <SelectionBox
                          left={selectionArea.left}
                          top={selectionArea.top}
                          width={selectionArea.width}
                          height={selectionArea.height}
                        />
                      )}
                    </ImagePreviewArea>
                    <ToolbarContainer>
                      <div>
                        <Button icon={<SelectOutlined />} onClick={handleStartSelection} style={{ marginRight: 8 }}>
                          选择区域
                        </Button>
                        <Button icon={<EyeOutlined />} style={{ marginRight: 8 }}>
                          重置视图
                        </Button>
                      </div>
                      <div>
                        <Select defaultValue="resnet50" style={{ width: 120, marginRight: 8 }}>
                          <Option value="resnet50">ResNet50</Option>
                          <Option value="vgg16">VGG16</Option>
                          <Option value="efficientnet">EfficientNet</Option>
                        </Select>
                        <Button type="primary" onClick={handleProcessImage}>
                          开始处理
                        </Button>
                      </div>
                    </ToolbarContainer>
                  </>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="处理结果" bordered={false}>
                {!processingCompleted ? (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    {processingProgress > 0 ? (
                      <>
                        <Progress type="circle" percent={processingProgress} />
                        <p style={{ marginTop: 16 }}>正在处理中，请稍候...</p>
                      </>
                    ) : (
                      <p>请先上传图像并点击"开始处理"</p>
                    )}
                  </div>
                ) : (
                  <>
                    <ResultImagePreview>
                      <img src={resultImageUrl!} alt="Result" />
                    </ResultImagePreview>
                    <ToolbarContainer>
                      <div>
                        <p>处理完成！</p>
                      </div>
                      <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadResult}>
                        下载结果
                      </Button>
                    </ToolbarContainer>
                    <StatsContainer>
                      <h4>分类结果：</h4>
                      <p>类别：建筑物 (89%)</p>
                      <p>类别：道路 (6%)</p>
                      <p>类别：水域 (3%)</p>
                      <p>类别：植被 (2%)</p>
                    </StatsContainer>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="目标检测" key="2">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="上传图像" bordered={false}>
                {!imageUrl ? (
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                    <p className="ant-upload-hint">支持单个或批量上传</p>
                  </Dragger>
                ) : (
                  <>
                    <ImagePreviewArea>
                      <img src={imageUrl} alt="Preview" />
                    </ImagePreviewArea>
                    <ToolbarContainer>
                      <div>
                        <Button icon={<EyeOutlined />} style={{ marginRight: 8 }}>
                          重置视图
                        </Button>
                      </div>
                      <div>
                        <Select defaultValue="yolo" style={{ width: 120, marginRight: 8 }}>
                          <Option value="yolo">YOLO v5</Option>
                          <Option value="faster_rcnn">Faster R-CNN</Option>
                          <Option value="ssd">SSD</Option>
                        </Select>
                        <Button type="primary" onClick={handleProcessImage}>
                          开始检测
                        </Button>
                      </div>
                    </ToolbarContainer>
                  </>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="检测结果" bordered={false}>
                {!processingCompleted ? (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    {processingProgress > 0 ? (
                      <>
                        <Progress type="circle" percent={processingProgress} />
                        <p style={{ marginTop: 16 }}>正在检测中，请稍候...</p>
                      </>
                    ) : (
                      <p>请先上传图像并点击"开始检测"</p>
                    )}
                  </div>
                ) : (
                  <>
                    <ResultImagePreview>
                      <img src={resultImageUrl!} alt="Result" />
                    </ResultImagePreview>
                    <ToolbarContainer>
                      <div>
                        <p>检测完成！发现 28 个目标</p>
                      </div>
                      <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadResult}>
                        下载结果
                      </Button>
                    </ToolbarContainer>
                    <StatsContainer>
                      <h4>检测结果：</h4>
                      <p>建筑物：15个</p>
                      <p>道路：5个</p>
                      <p>车辆：8个</p>
                    </StatsContainer>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="语义分割" key="3">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="上传图像" bordered={false}>
                {!imageUrl ? (
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                    <p className="ant-upload-hint">支持单个或批量上传</p>
                  </Dragger>
                ) : (
                  <>
                    <ImagePreviewArea>
                      <img src={imageUrl} alt="Preview" />
                    </ImagePreviewArea>
                    <ToolbarContainer>
                      <div>
                        <Button icon={<EyeOutlined />} style={{ marginRight: 8 }}>
                          重置视图
                        </Button>
                      </div>
                      <div>
                        <Select defaultValue="unet" style={{ width: 120, marginRight: 8 }}>
                          <Option value="unet">U-Net</Option>
                          <Option value="deeplab">DeepLab v3+</Option>
                          <Option value="pspnet">PSPNet</Option>
                        </Select>
                        <Button type="primary" onClick={handleProcessImage}>
                          开始分割
                        </Button>
                      </div>
                    </ToolbarContainer>
                  </>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="分割结果" bordered={false}>
                {!processingCompleted ? (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    {processingProgress > 0 ? (
                      <>
                        <Progress type="circle" percent={processingProgress} />
                        <p style={{ marginTop: 16 }}>正在分割中，请稍候...</p>
                      </>
                    ) : (
                      <p>请先上传图像并点击"开始分割"</p>
                    )}
                  </div>
                ) : (
                  <>
                    <ResultImagePreview>
                      <img src={resultImageUrl!} alt="Result" />
                    </ResultImagePreview>
                    <ToolbarContainer>
                      <div>
                        <p>分割完成！</p>
                      </div>
                      <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadResult}>
                        下载结果
                      </Button>
                    </ToolbarContainer>
                    <StatsContainer>
                      <h4>分割结果：</h4>
                      <p>建筑物：45%</p>
                      <p>道路：15%</p>
                      <p>水域：5%</p>
                      <p>植被：35%</p>
                    </StatsContainer>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="变化检测" key="4">
          <Row gutter={16}>
            <Col span={24}>
              <Card title="上传前后时相图像" bordered={false}>
                <ChangeDetectionContainer>
                  <div className="upload-area">
                    <h4>变化前图像</h4>
                    {!beforeImageUrl ? (
                      <Dragger {...beforeUploadProps} style={{ height: 250 }}>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">上传变化前图像</p>
                      </Dragger>
                    ) : (
                      <ImagePreviewArea style={{ height: 250 }}>
                        <img src={beforeImageUrl} alt="Before" />
                      </ImagePreviewArea>
                    )}
                  </div>
                  <div className="upload-area">
                    <h4>变化后图像</h4>
                    {!afterImageUrl ? (
                      <Dragger {...afterUploadProps} style={{ height: 250 }}>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">上传变化后图像</p>
                      </Dragger>
                    ) : (
                      <ImagePreviewArea style={{ height: 250 }}>
                        <img src={afterImageUrl} alt="After" />
                      </ImagePreviewArea>
                    )}
                  </div>
                </ChangeDetectionContainer>
                {(beforeImageUrl && afterImageUrl) && (
                  <ToolbarContainer>
                    <div>
                      <Button icon={<EyeOutlined />} style={{ marginRight: 8 }}>
                        重置视图
                      </Button>
                    </div>
                    <div>
                      <Select defaultValue="change_detection" style={{ width: 160, marginRight: 8 }}>
                        <Option value="change_detection">变化检测网络</Option>
                        <Option value="siamese">Siamese网络</Option>
                      </Select>
                      <Button type="primary" onClick={handleProcessImage}>
                        开始检测变化
                      </Button>
                    </div>
                  </ToolbarContainer>
                )}
              </Card>
            </Col>
          </Row>
          
          {processingProgress > 0 && (
            <Card title="检测结果" bordered={false} style={{ marginTop: 16 }}>
              {!processingCompleted ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <Progress type="circle" percent={processingProgress} />
                  <p style={{ marginTop: 16 }}>正在检测变化，请稍候...</p>
                </div>
              ) : (
                <Row gutter={16}>
                  <Col span={16}>
                    <ResultImagePreview>
                      <img src={beforeImageUrl!} alt="Change Result" />
                    </ResultImagePreview>
                  </Col>
                  <Col span={8}>
                    <StatsContainer style={{ height: '100%' }}>
                      <h4>变化检测结果：</h4>
                      <p>总变化面积：1024平方米</p>
                      <p>新增建筑物：5栋</p>
                      <p>拆除建筑物：2栋</p>
                      <p>道路变化：200米</p>
                      <p>植被减少：800平方米</p>
                      <Divider />
                      <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadResult} block>
                        下载变化结果
                      </Button>
                    </StatsContainer>
                  </Col>
                </Row>
              )}
            </Card>
          )}
        </TabPane>
      </Tabs>
    </Container>
  );
};

export default ProcessingPage; 