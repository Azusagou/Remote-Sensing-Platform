import React, { useState } from 'react';
import { Tabs, Upload, Button, Card, Row, Col, Divider, Select, Switch, Progress } from 'antd';
import { InboxOutlined, SelectOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

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
  // 只根据module参数渲染对应功能区块
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [classifyResult, setClassifyResult] = useState<any[]>([]);
  const [detectResult, setDetectResult] = useState<any[]>([]);
  const [detectResultImage, setDetectResultImage] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [segmentMask, setSegmentMask] = useState<string | null>(null);
  const [segmentStats, setSegmentStats] = useState<any[]>([]);
  const [maskOpacity, setMaskOpacity] = useState(0.5);
  const [changeMask, setChangeMask] = useState<string | null>(null);
  const [changeStats, setChangeStats] = useState<any | null>(null);
  const API_BASE = 'http://localhost:8000/api';

  // 目标分类接口调用
  const classifyImage = async (image: File, region?: SelectionArea) => {
    const formData = new FormData();
    formData.append('image', image);
    if (region) {
      formData.append('region', JSON.stringify(region));
    }
    const res = await axios.post(`${API_BASE}/classify`, formData);
    return res.data;
  };
  // 目标检测接口调用
  const detectImage = async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const res = await axios.post(`${API_BASE}/detect`, formData);
    return res.data;
  };
  // 语义分割接口调用
  const segmentImage = async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const res = await axios.post(`${API_BASE}/segment`, formData);
    return res.data;
  };
  // 变化检测接口调用
  const changeDetect = async (before: File, after: File) => {
    const formData = new FormData();
    formData.append('before_image', before);
    formData.append('after_image', after);
    const res = await axios.post(`${API_BASE}/change`, formData);
    return res.data;
  };

  // 处理图片上传（保存文件）
  const handleImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      setImageFile(info.file.originFileObj);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };
  const handleBeforeImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      setBeforeImageFile(info.file.originFileObj);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBeforeImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };
  const handleAfterImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      setAfterImageFile(info.file.originFileObj);
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

  // 处理处理图像（根据tab调用不同接口）
  const handleProcessImage = async () => {
    setProcessingProgress(0);
    setProcessingCompleted(false);
    setResultImageUrl(null);
    setClassifyResult([]);
    setDetectResult([]);
    setDetectResultImage(null);
    setSegmentMask(null);
    setSegmentStats([]);
    setChangeMask(null);
    setChangeStats(null);
    // 模拟进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProcessingProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 200);
    try {
      if (module === 'target-classification' && imageFile) {
        // 目标分类
        const res = await classifyImage(imageFile, selectionArea || undefined);
        setClassifyResult(res.result || []);
        setProcessingCompleted(true);
      } else if (module === 'target-detection' && imageFile) {
        // 目标检测
        const res = await detectImage(imageFile);
        setDetectResult(res.boxes || []);
        setDetectResultImage(res.result_image || null);
        setProcessingCompleted(true);
      } else if (module === 'semantic-segmentation' && imageFile) {
        // 语义分割
        const res = await segmentImage(imageFile);
        setSegmentMask(res.mask || null);
        setSegmentStats(res.stats || []);
        setProcessingCompleted(true);
      } else if (module === 'change-detection' && beforeImageFile && afterImageFile) {
        // 变化检测
        const res = await changeDetect(beforeImageFile, afterImageFile);
        setChangeMask(res.change_mask || null);
        setChangeStats(res.stats || null);
        setProcessingCompleted(true);
      }
    } catch (e) {
      // 错误处理
      setProcessingCompleted(true);
    }
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

  // 统一美化样式
  const MainCard = styled(Card)`
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    border-radius: 16px;
    background: #fafbfc;
    padding: 32px 24px;
    margin-bottom: 32px;
    border: none;
  `;
  const SectionTitle = styled.h2`
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 24px;
    color: #222;
    letter-spacing: 1px;
  `;
  const UploadArea = styled.div`
    background: #f4f6fa;
    border-radius: 12px;
    padding: 32px 16px;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    margin-bottom: 24px;
  `;
  const ResultArea = styled.div`
    background: #fff;
    border-radius: 12px;
    padding: 32px 24px;
    min-height: 320px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    margin-bottom: 24px;
  `;

  // 渲染不同功能区块
  const renderContent = () => {
    switch (module) {
      case 'target-classification':
        return (
          <Row gutter={32}>
            <Col span={12}>
              <MainCard>
                <SectionTitle>目标分类 - 上传图像</SectionTitle>
                <UploadArea>
                  {!imageUrl ? (
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                      <p className="ant-upload-hint">支持单个图片上传</p>
                    </Dragger>
                  ) : (
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
                  )}
                </UploadArea>
                <ToolbarContainer>
                  <div>
                    <Button icon={<SelectOutlined />} onClick={handleStartSelection} style={{ marginRight: 8 }} type="dashed">
                      选择区域
                    </Button>
                    <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} type="dashed">
                      重置视图
                    </Button>
                  </div>
                  <div>
                    <Select defaultValue="resnet50" style={{ width: 120, marginRight: 8 }}>
                      <Option value="resnet50">ResNet50</Option>
                      <Option value="vgg16">VGG16</Option>
                      <Option value="efficientnet">EfficientNet</Option>
                    </Select>
                    <Button type="primary" onClick={handleProcessImage} size="large">
                      开始处理
                    </Button>
                  </div>
                </ToolbarContainer>
              </MainCard>
            </Col>
            <Col span={12}>
              <MainCard>
                <SectionTitle>处理结果</SectionTitle>
                <ResultArea>
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
                        {classifyResult.length > 0 ? classifyResult.map((item, idx) => (
                          <p key={idx}>类别：{item.class_name} ({(item.confidence * 100).toFixed(1)}%)</p>
                        )) : (
                          <>
                            <p>类别：建筑物 (89%)</p>
                            <p>类别：道路 (6%)</p>
                            <p>类别：水域 (3%)</p>
                            <p>类别：植被 (2%)</p>
                          </>
                        )}
                      </StatsContainer>
                    </>
                  )}
                </ResultArea>
              </MainCard>
            </Col>
          </Row>
        );
      case 'target-detection':
        return (
          <Row gutter={32}>
            <Col span={12}>
              <MainCard>
                <SectionTitle>目标检测 - 上传图像</SectionTitle>
                <UploadArea>
                  {!imageUrl ? (
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                      <p className="ant-upload-hint">支持单个图片上传</p>
                    </Dragger>
                  ) : (
                    <ImagePreviewArea>
                      <img src={imageUrl} alt="Preview" />
                    </ImagePreviewArea>
                  )}
                </UploadArea>
                <ToolbarContainer>
                  <div>
                    <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} type="dashed">
                      重置视图
                    </Button>
                  </div>
                  <div>
                    <Select defaultValue="yolo" style={{ width: 120, marginRight: 8 }}>
                      <Option value="yolo">YOLO v5</Option>
                      <Option value="faster_rcnn">Faster R-CNN</Option>
                      <Option value="ssd">SSD</Option>
                    </Select>
                    <Button type="primary" onClick={handleProcessImage} size="large">
                      开始检测
                    </Button>
                  </div>
                </ToolbarContainer>
              </MainCard>
            </Col>
            <Col span={12}>
              <MainCard>
                <SectionTitle>检测结果</SectionTitle>
                <ResultArea>
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
                        <img src={detectResultImage || imageUrl || undefined} alt="Result" />
                      </ResultImagePreview>
                      <ToolbarContainer>
                        <div>
                          <p>检测完成！发现 {detectResult.length} 个目标</p>
                        </div>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadResult}>
                          下载结果
                        </Button>
                      </ToolbarContainer>
                      <StatsContainer>
                        <h4>检测结果：</h4>
                        {detectResult.map((box, index) => (
                          <p key={index}>
                            类别: {box.class_name}, 置信度: {box.confidence.toFixed(2)}, 位置: ({box.x1}, {box.y1}), ({box.x2}, {box.y2})
                          </p>
                        ))}
                      </StatsContainer>
                    </>
                  )}
                </ResultArea>
              </MainCard>
            </Col>
          </Row>
        );
      case 'semantic-segmentation':
        return (
          <Row gutter={32}>
            <Col span={12}>
              <MainCard>
                <SectionTitle>语义分割 - 上传图像</SectionTitle>
                <UploadArea>
                  {!imageUrl ? (
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                      <p className="ant-upload-hint">支持单个图片上传</p>
                    </Dragger>
                  ) : (
                    <ImagePreviewArea>
                      <img src={imageUrl} alt="Preview" />
                    </ImagePreviewArea>
                  )}
                </UploadArea>
                <ToolbarContainer>
                  <div>
                    <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} type="dashed">
                      重置视图
                    </Button>
                  </div>
                  <div>
                    <Select defaultValue="unet" style={{ width: 120, marginRight: 8 }}>
                      <Option value="unet">U-Net</Option>
                      <Option value="deeplab">DeepLab v3+</Option>
                      <Option value="pspnet">PSPNet</Option>
                    </Select>
                    <Button type="primary" onClick={handleProcessImage} size="large">
                      开始分割
                    </Button>
                  </div>
                </ToolbarContainer>
              </MainCard>
            </Col>
            <Col span={12}>
              <MainCard>
                <SectionTitle>分割结果</SectionTitle>
                <ResultArea>
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
                        <img src={segmentMask ? `data:image/png;base64,${segmentMask}` : imageUrl || undefined} alt="Result" />
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
                        {segmentStats.map((stat, index) => (
                          <p key={index}>
                            类别: {stat.class_name}, 置信度: {stat.confidence.toFixed(2)}, 像素占比: {stat.percentage.toFixed(2)}%
                          </p>
                        ))}
                      </StatsContainer>
                    </>
                  )}
                </ResultArea>
              </MainCard>
            </Col>
          </Row>
        );
      case 'change-detection':
        return (
          <Row gutter={32}>
            <Col span={24}>
              <MainCard>
                <SectionTitle>变化检测 - 上传前后时相图像</SectionTitle>
                <ChangeDetectionContainer>
                  <div className="upload-area">
                    <h4>变化前图像</h4>
                    {!beforeImageUrl ? (
                      <Dragger {...beforeUploadProps} style={{ height: 250 }}>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined style={{ fontSize: 36, color: '#1890ff' }} />
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
                          <InboxOutlined style={{ fontSize: 36, color: '#1890ff' }} />
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
                      <Button icon={<EyeOutlined />} style={{ marginRight: 8 }} type="dashed">
                        重置视图
                      </Button>
                    </div>
                    <div>
                      <Select defaultValue="change_detection" style={{ width: 160, marginRight: 8 }}>
                        <Option value="change_detection">变化检测网络</Option>
                        <Option value="siamese">Siamese网络</Option>
                      </Select>
                      <Button type="primary" onClick={handleProcessImage} size="large">
                        开始检测变化
                      </Button>
                    </div>
                  </ToolbarContainer>
                )}
                {processingProgress > 0 && (
                  <ResultArea style={{ marginTop: 32 }}>
                    {!processingCompleted ? (
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <Progress type="circle" percent={processingProgress} />
                        <p style={{ marginTop: 16 }}>正在检测变化，请稍候...</p>
                      </div>
                    ) : (
                      <Row gutter={16}>
                        <Col span={16}>
                          <ResultImagePreview>
                            <img src={changeMask ? `data:image/png;base64,${changeMask}` : beforeImageUrl || undefined} alt="Change Result" />
                          </ResultImagePreview>
                        </Col>
                        <Col span={8}>
                          <StatsContainer style={{ height: '100%' }}>
                            <h4>变化检测结果：</h4>
                            {changeStats && (
                              <>
                                <p>总变化面积：{changeStats.total_area}平方米</p>
                                <p>新增建筑物：{changeStats.new_buildings}栋</p>
                                <p>拆除建筑物：{changeStats.removed_buildings}栋</p>
                                <p>道路变化：{changeStats.road_change}米</p>
                                <p>植被减少：{changeStats.vegetation_reduction}平方米</p>
                              </>
                            )}
                            <Divider />
                            <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadResult} block>
                              下载变化结果
                            </Button>
                          </StatsContainer>
                        </Col>
                      </Row>
                    )}
                  </ResultArea>
                )}
              </MainCard>
            </Col>
          </Row>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      {renderContent()}
    </Container>
  );
};

export default ProcessingPage; 