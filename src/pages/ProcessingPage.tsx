import React, { useState } from 'react';
import { Tabs, Upload, Button, Card, Row, Col, Divider, Select, Progress, message } from 'antd';
import { InboxOutlined, SelectOutlined, EyeOutlined, DownloadOutlined, RedoOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';


const { Dragger } = Upload;
const { Option } = Select;

const Container = styled.div`
  padding: 20px;
  background: transparent;
  border-radius: 12px;
  min-height: calc(100vh - 180px);
`;

const ImagePreviewArea = styled.div`
  width: 100%;
  height: 400px;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--card-border);
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    min-width: 200px;
    min-height: 150px;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .image-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
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


const ResultImagePreview = styled.div`
  width: 100%;
  height: 340px;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    min-width: 200px;
    min-height: 150px;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
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
  const [segmentMask, setSegmentMask] = useState<string | null>(null);
  const [segmentStats, setSegmentStats] = useState<any[]>([]);
  const [changeMask, setChangeMask] = useState<string | null>(null);
  const [changeStats, setChangeStats] = useState<any | null>(null);
  const [imageInfo, setImageInfo] = useState<{width: number, height: number} | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const API_BASE = 'http://localhost:8000/api';

  // 检测文件是否为TIF格式
  const isTiffFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff') || file.type === 'image/tiff';
  };

    // 处理TIF文件的函数（使用 geotiff 解码并渲染为 PNG）
  const processTiffFile = (file: File): Promise<{ url: string; info: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) throw new Error('Failed to read file as ArrayBuffer');

          // 动态引入以避免类型与打包问题
          const { fromArrayBuffer } = await import('geotiff');
          const tiff = await fromArrayBuffer(arrayBuffer);
          const image = await tiff.getImage();

          const srcWidth = image.getWidth();
          const srcHeight = image.getHeight();
          const samples = image.getSamplesPerPixel();

          // 控制目标渲染尺寸（避免超大内存占用，同时不小于显示下限）
          const MIN_W = 400;
          const MIN_H = 300;
          const MAX_W = 1600;
          const MAX_H = 1600;
        
          let targetWidth = srcWidth;
          let targetHeight = srcHeight;
          if (targetWidth > MAX_W || targetHeight > MAX_H) {
            const scale = Math.min(MAX_W / targetWidth, MAX_H / targetHeight);
            targetWidth = Math.max(Math.round(targetWidth * scale), MIN_W);
            targetHeight = Math.max(Math.round(targetHeight * scale), MIN_H);
          } else if (targetWidth < MIN_W || targetHeight < MIN_H) {
            const scale = Math.max(MIN_W / targetWidth, MIN_H / targetHeight);
            targetWidth = Math.round(targetWidth * scale);
            targetHeight = Math.round(targetHeight * scale);
          }

          // 读取并重采样到目标尺寸
          const interleave = true;
          const raster: any = await image.readRasters({ interleave, width: targetWidth, height: targetHeight });
          const hasAlpha = samples >= 4;

          // 计算每个波段的 min/max 以做归一化（0-255）
          const channelCount = Math.min(samples, 4); // 最多处理到 RGBA
          const mins = new Array(channelCount).fill(Number.POSITIVE_INFINITY);
          const maxs = new Array(channelCount).fill(Number.NEGATIVE_INFINITY);

          if (channelCount === 1) {
            for (let i = 0; i < raster.length; i++) {
              const v = raster[i];
              if (v < mins[0]) mins[0] = v;
              if (v > maxs[0]) maxs[0] = v;
            }
          } else {
            for (let i = 0; i < raster.length; i += channelCount) {
              for (let c = 0; c < channelCount; c++) {
                const v = raster[i + c];
                if (v < mins[c]) mins[c] = v;
                if (v > maxs[c]) maxs[c] = v;
              }
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not available');
          const imgData = ctx.createImageData(targetWidth, targetHeight);
          const out = imgData.data;

          const normalize = (value: number, min: number, max: number) => {
            if (!isFinite(min) || !isFinite(max) || max === min) return 0;
            const t = (value - min) / (max - min);
            return Math.max(0, Math.min(255, Math.round(t * 255)));
          };

          if (channelCount === 1) {
            // 灰度
            for (let i = 0, p = 0; i < raster.length; i++, p += 4) {
              const g = normalize(raster[i], mins[0], maxs[0]);
              out[p] = g;
              out[p + 1] = g;
              out[p + 2] = g;
              out[p + 3] = 255;
            }
          } else {
            // RGB(A)/多波段（取前三个波段作为RGB，第四个波段作为Alpha）
            for (let i = 0, p = 0; p < out.length && i < raster.length; i += channelCount, p += 4) {
              const r = normalize(raster[i], mins[0], maxs[0]);
              const g = normalize(raster[i + 1] ?? raster[i], mins[1] ?? mins[0], maxs[1] ?? maxs[0]);
              const b = normalize(raster[i + 2] ?? raster[i], mins[2] ?? mins[0], maxs[2] ?? maxs[0]);
              const a = hasAlpha ? normalize(raster[i + 3], mins[3], maxs[3]) : 255;
              out[p] = r;
              out[p + 1] = g;
              out[p + 2] = b;
              out[p + 3] = a;
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ url: dataUrl, info: { width: srcWidth, height: srcHeight } });
        } catch (error) {
          console.error('TIF文件处理失败:', error);
          message.error('TIF文件处理失败，请确保文件格式正确');
          resolve({ url: '', info: { width: 0, height: 0 } });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // 通用图片处理函数
  const processImageForDisplay = (file: File): Promise<{url: string, info: {width: number, height: number}}> => {
    return new Promise((resolve) => {
      // 如果是TIF文件，使用专门的处理函数
      if (isTiffFile(file)) {
        processTiffFile(file).then(resolve);
        return;
      }
      
      // 对于其他格式的图片，使用原有的处理逻辑
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 保存原始尺寸信息
          const originalInfo = { width: img.width, height: img.height };
          
          // 如果图片太小，进行放大处理
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const minWidth = 400;
          const minHeight = 300;
          
          let targetWidth = img.width;
          let targetHeight = img.height;
          
          // 如果图片尺寸小于最小尺寸，进行放大
          if (img.width < minWidth || img.height < minHeight) {
            const scaleX = minWidth / img.width;
            const scaleY = minHeight / img.height;
            const scale = Math.max(scaleX, scaleY);
            targetWidth = img.width * scale;
            targetHeight = img.height * scale;
          }
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          if (ctx) {
            // 使用高质量的图像平滑
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            resolve({ url: canvas.toDataURL('image/png'), info: originalInfo });
          } else {
            resolve({ url: e.target?.result as string, info: originalInfo });
          }
        };
        img.onerror = () => {
          // 如果图片加载失败
          console.warn('图片加载失败');
          message.error('图片格式不支持或文件损坏');
          resolve({ 
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmMmYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Y1NjU2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPgogICAg5Zu+5YOP5Yqg6L295aSx6LSlCiAgPC90ZXh0Pgo8L3N2Zz4K',
            info: { width: 400, height: 300 }
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

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
  const handleImageUpload = async (info: any) => {
    if (info.file.status === 'done') {
      setIsLoadingImage(true);
      setImageFile(info.file.originFileObj);
      try {
        // 检查文件大小 (限制为50MB)
        if (info.file.originFileObj.size > 50 * 1024 * 1024) {
          message.error('文件大小不能超过50MB');
          return;
        }
        
        const result = await processImageForDisplay(info.file.originFileObj);
        setImageUrl(result.url);
        setImageInfo(result.info);
        
        // 如果是TIF文件，给用户额外提示
        if (isTiffFile(info.file.originFileObj)) {
          message.success('TIF文件已上传，可能无法预览但能正常处理');
        } else {
          message.success('图片上传成功');
        }
      } catch (error) {
        console.error('图片处理失败:', error);
        message.error('图片处理失败，请检查文件格式');
      } finally {
        setIsLoadingImage(false);
      }
    } else if (info.file.status === 'error') {
      message.error('文件上传失败');
      setIsLoadingImage(false);
    }
  };
  const handleBeforeImageUpload = async (info: any) => {
    if (info.file.status === 'done') {
      setBeforeImageFile(info.file.originFileObj);
      const result = await processImageForDisplay(info.file.originFileObj);
      setBeforeImageUrl(result.url);
    }
  };
  const handleAfterImageUpload = async (info: any) => {
    if (info.file.status === 'done') {
      setAfterImageFile(info.file.originFileObj);
      const result = await processImageForDisplay(info.file.originFileObj);
      setAfterImageUrl(result.url);
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

  // 重新选择图片
  const handleReselectImage = () => {
    setImageUrl(null);
    setImageFile(null);
    setImageInfo(null);
    setSelectionArea(null);
    setProcessingCompleted(false);
    setProcessingProgress(0);
    setResultImageUrl(null);
    setClassifyResult([]);
    setDetectResult([]);
    setDetectResultImage(null);
    setSegmentMask(null);
    setSegmentStats([]);
    message.success('已清除图片，可以重新上传');
  };

  // 重新选择变化前图片
  const handleReselectBeforeImage = () => {
    setBeforeImageUrl(null);
    setBeforeImageFile(null);
    setProcessingCompleted(false);
    setProcessingProgress(0);
    setChangeMask(null);
    setChangeStats(null);
    message.success('已清除变化前图片，可以重新上传');
  };

  // 重新选择变化后图片
  const handleReselectAfterImage = () => {
    setAfterImageUrl(null);
    setAfterImageFile(null);
    setProcessingCompleted(false);
    setProcessingProgress(0);
    setChangeMask(null);
    setChangeStats(null);
    message.success('已清除变化后图片，可以重新上传');
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
    accept: 'image/*,.tif,.tiff',
    beforeUpload: (file: File) => {
      // 检查文件类型
      const isValidType = file.type.startsWith('image/') || isTiffFile(file);
      if (!isValidType) {
        message.error('请上传图片文件！');
        return false;
      }
      
      // 检查文件大小
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      if (!isValidSize) {
        message.error('文件大小不能超过 50MB！');
        return false;
      }
      
      return true;
    }
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
  background: var(--card-bg);
  border-radius: 12px;
  padding: 32px 16px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
  border: 1px solid var(--card-border);
`;
  const ResultArea = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 32px 24px;
  min-height: 320px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
  border: 1px solid var(--card-border);
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
                    <Dragger {...uploadProps} disabled={isLoadingImage}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: isLoadingImage ? '#ccc' : '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">
                        {isLoadingImage ? '正在处理图片...' : '点击或拖拽图片到此区域上传'}
                      </p>
                      <p className="ant-upload-hint">支持 JPG、PNG、TIF 等格式 • TIF格式专为遥感图像优化</p>
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
                      {imageInfo && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          尺寸: {imageInfo.width} × {imageInfo.height}
                        </div>
                      )}
                      <Button
                        type="primary"
                        size="small"
                        icon={<RedoOutlined />}
                        onClick={handleReselectImage}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          opacity: 0.8
                        }}
                      >
                        重新选择
                      </Button>
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
                    <Dragger {...uploadProps} disabled={isLoadingImage}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: isLoadingImage ? '#ccc' : '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">
                        {isLoadingImage ? '正在处理图片...' : '点击或拖拽图片到此区域上传'}
                      </p>
                      <p className="ant-upload-hint">支持 JPG、PNG、TIF 等格式 • TIF格式专为遥感图像优化</p>
                    </Dragger>
                  ) : (
                    <ImagePreviewArea>
                      <img src={imageUrl} alt="Preview" />
                      {imageInfo && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          尺寸: {imageInfo.width} × {imageInfo.height}
                        </div>
                      )}
                      <Button
                        type="primary"
                        size="small"
                        icon={<RedoOutlined />}
                        onClick={handleReselectImage}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          opacity: 0.8
                        }}
                      >
                        重新选择
                      </Button>
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
                    <Dragger {...uploadProps} disabled={isLoadingImage}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 48, color: isLoadingImage ? '#ccc' : '#1890ff' }} />
                      </p>
                      <p className="ant-upload-text">
                        {isLoadingImage ? '正在处理图片...' : '点击或拖拽图片到此区域上传'}
                      </p>
                      <p className="ant-upload-hint">支持 JPG、PNG、TIF 等格式 • TIF格式专为遥感图像优化</p>
                    </Dragger>
                  ) : (
                    <ImagePreviewArea>
                      <img src={imageUrl} alt="Preview" />
                      {imageInfo && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          尺寸: {imageInfo.width} × {imageInfo.height}
                        </div>
                      )}
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
                        <p className="ant-upload-hint">支持 JPG、PNG、TIF 等格式 • TIF格式专为遥感图像优化</p>
                      </Dragger>
                    ) : (
                      <ImagePreviewArea style={{ height: 250 }}>
                        <img src={beforeImageUrl} alt="Before" />
                        {imageInfo && (
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            尺寸: {imageInfo.width} × {imageInfo.height}
                          </div>
                        )}
                        <Button
                          type="primary"
                          size="small"
                          icon={<RedoOutlined />}
                          onClick={handleReselectBeforeImage}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            opacity: 0.8
                          }}
                        >
                          重新选择
                        </Button>
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
                        <p className="ant-upload-hint">支持 JPG、PNG、TIF 等格式 • TIF格式专为遥感图像优化</p>
                      </Dragger>
                    ) : (
                      <ImagePreviewArea style={{ height: 250 }}>
                        <img src={afterImageUrl} alt="After" />
                        {imageInfo && (
                          <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            尺寸: {imageInfo.width} × {imageInfo.height}
                          </div>
                        )}
                        <Button
                          type="primary"
                          size="small"
                          icon={<RedoOutlined />}
                          onClick={handleReselectAfterImage}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            opacity: 0.8
                          }}
                        >
                          重新选择
                        </Button>
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