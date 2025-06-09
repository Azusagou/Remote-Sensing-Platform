import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, Button, Modal, message } from 'antd';
import { UploadOutlined, ZoomInOutlined, ZoomOutOutlined, BorderOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import { RcFile } from 'antd/lib/upload';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PreviewContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageWrapper = styled.div<{ scale: number }>`
  position: relative;
  transform: scale(${props => props.scale});
  transform-origin: center;
  transition: transform 0.3s ease;
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 500px;
  display: block;
`;

const ResizableBox = styled.div<{ x: number; y: number; width: number; height: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px solid #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  cursor: move;
  box-sizing: border-box;
`;

const ResizeHandle = styled.div<{ position: string }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border: 2px solid #1890ff;
  
  ${props => {
    switch (props.position) {
      case 'top-left':
        return `
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        `;
      case 'top-right':
        return `
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        `;
      case 'bottom-left':
        return `
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        `;
      case 'bottom-right':
        return `
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        `;
      case 'top':
        return `
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          cursor: ns-resize;
        `;
      case 'right':
        return `
          top: 50%;
          right: -5px;
          transform: translateY(-50%);
          cursor: ew-resize;
        `;
      case 'bottom':
        return `
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          cursor: ns-resize;
        `;
      case 'left':
        return `
          top: 50%;
          left: -5px;
          transform: translateY(-50%);
          cursor: ew-resize;
        `;
      default:
        return '';
    }
  }}
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const PlaceholderText = styled.p`
  color: #666;
  font-size: 16px;
`;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageUploader: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [box, setBox] = useState<Box | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  // 放大功能
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  // 缩小功能
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // 预览功能
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  // 处理文件变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    // 当有新文件上传时，立即生成预览
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      getBase64(newFileList[0].originFileObj as RcFile).then(url => {
        setImageUrl(url);
        setBox(null); // 清除之前的框
      });
    } else if (newFileList.length === 0) {
      setImageUrl('');
      setBox(null);
    }
  };

  // 将文件转换为Base64
  const getBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 当图片加载完成时，初始化选择框
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({
      width: img.offsetWidth,
      height: img.offsetHeight
    });
  };

  // 初始化选择框
  const initializeBox = () => {
    if (!imageRef.current || !imageSize.width || !imageSize.height) return;
    
    // 默认框为图像中心的一个矩形，宽高为图像尺寸的一半
    const boxWidth = imageSize.width * 0.5;
    const boxHeight = imageSize.height * 0.5;
    
    setBox({
      x: (imageSize.width - boxWidth) / 2,
      y: (imageSize.height - boxHeight) / 2,
      width: boxWidth,
      height: boxHeight
    });
  };

  // 添加选择框
  const handleAddBox = () => {
    if (box) {
      setBox(null); // 如果已有框，则移除
    } else {
      initializeBox(); // 初始化新框
    }
  };

  // 鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, action: string, direction?: string) => {
    e.stopPropagation();
    if (!imageRef.current || !box) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    setStartPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    if (action === 'move') {
      setIsDragging(true);
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeDirection(direction || '');
    }
  };

  // 鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !box) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - startPoint.x;
    const deltaY = currentY - startPoint.y;
    
    if (isDragging) {
      // 移动框
      setBox({
        ...box,
        x: Math.max(0, Math.min(box.x + deltaX, imageSize.width - box.width)),
        y: Math.max(0, Math.min(box.y + deltaY, imageSize.height - box.height))
      });
      setStartPoint({ x: currentX, y: currentY });
    } else if (isResizing) {
      // 调整大小
      let newBox = { ...box };
      
      switch (resizeDirection) {
        case 'top-left':
          newBox = {
            x: Math.max(0, Math.min(box.x + deltaX, box.x + box.width - 20)),
            y: Math.max(0, Math.min(box.y + deltaY, box.y + box.height - 20)),
            width: Math.max(20, box.width - deltaX),
            height: Math.max(20, box.height - deltaY)
          };
          break;
        case 'top-right':
          newBox = {
            x: box.x,
            y: Math.max(0, Math.min(box.y + deltaY, box.y + box.height - 20)),
            width: Math.max(20, Math.min(box.width + deltaX, imageSize.width - box.x)),
            height: Math.max(20, box.height - deltaY)
          };
          break;
        case 'bottom-left':
          newBox = {
            x: Math.max(0, Math.min(box.x + deltaX, box.x + box.width - 20)),
            y: box.y,
            width: Math.max(20, box.width - deltaX),
            height: Math.max(20, Math.min(box.height + deltaY, imageSize.height - box.y))
          };
          break;
        case 'bottom-right':
          newBox = {
            x: box.x,
            y: box.y,
            width: Math.max(20, Math.min(box.width + deltaX, imageSize.width - box.x)),
            height: Math.max(20, Math.min(box.height + deltaY, imageSize.height - box.y))
          };
          break;
        case 'top':
          newBox = {
            x: box.x,
            y: Math.max(0, Math.min(box.y + deltaY, box.y + box.height - 20)),
            width: box.width,
            height: Math.max(20, box.height - deltaY)
          };
          break;
        case 'right':
          newBox = {
            x: box.x,
            y: box.y,
            width: Math.max(20, Math.min(box.width + deltaX, imageSize.width - box.x)),
            height: box.height
          };
          break;
        case 'bottom':
          newBox = {
            x: box.x,
            y: box.y,
            width: box.width,
            height: Math.max(20, Math.min(box.height + deltaY, imageSize.height - box.y))
          };
          break;
        case 'left':
          newBox = {
            x: Math.max(0, Math.min(box.x + deltaX, box.x + box.width - 20)),
            y: box.y,
            width: Math.max(20, box.width - deltaX),
            height: box.height
          };
          break;
      }
      
      setBox(newBox);
      setStartPoint({ x: currentX, y: currentY });
    }
  };

  // 鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // 处理选中区域
  const handleProcessRegion = () => {
    if (!box) {
      message.warning('请先创建选择框并调整到需要处理的区域');
      return;
    }

    message.success('已选择区域，准备进行模型处理');
    console.log('处理区域:', box);
    
    // 这里可以添加调用模型处理的逻辑
  };

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '//jsonplaceholder.typicode.com/posts/', // 使用假 API 地址，实际中应替换为真实上传地址
    beforeUpload: file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return Upload.LIST_IGNORE;
      }
      return isImage;
    },
    onChange: handleChange,
    onPreview: handlePreview,
    fileList,
    listType: "picture",
    maxCount: 1,
    customRequest: ({ file, onSuccess }) => {
      // 模拟上传成功
      setTimeout(() => {
        if (onSuccess) {
          onSuccess("ok");
        }
      }, 0);
    }
  };

  return (
    <Container>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>上传图像</Button>
      </Upload>
      
      <PreviewContainer
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageUrl ? (
          <ImageWrapper 
            ref={imageRef}
            scale={scale}
          >
            <StyledImage 
              ref={imageElementRef}
              src={imageUrl} 
              alt="预览图像"
              onLoad={handleImageLoad}
            />
            {box && (
              <ResizableBox
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                <ResizeHandle 
                  position="top-left" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'top-left')} 
                />
                <ResizeHandle 
                  position="top-right" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'top-right')} 
                />
                <ResizeHandle 
                  position="bottom-left" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom-left')} 
                />
                <ResizeHandle 
                  position="bottom-right" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom-right')} 
                />
                <ResizeHandle 
                  position="top" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'top')} 
                />
                <ResizeHandle 
                  position="right" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'right')} 
                />
                <ResizeHandle 
                  position="bottom" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'bottom')} 
                />
                <ResizeHandle 
                  position="left" 
                  onMouseDown={(e) => handleMouseDown(e, 'resize', 'left')} 
                />
              </ResizableBox>
            )}
          </ImageWrapper>
        ) : (
          <PlaceholderText>请上传图像进行预览和分析</PlaceholderText>
        )}
      </PreviewContainer>

      <ControlPanel>
        <Button 
          icon={<ZoomInOutlined />} 
          onClick={handleZoomIn}
          disabled={!imageUrl}
        >
          放大
        </Button>
        <Button 
          icon={<ZoomOutOutlined />} 
          onClick={handleZoomOut}
          disabled={!imageUrl}
        >
          缩小
        </Button>
        <Button
          icon={<BorderOutlined />}
          onClick={handleAddBox}
          disabled={!imageUrl}
        >
          {box ? '移除选择框' : '添加选择框'}
        </Button>
        <Button 
          type="primary" 
          onClick={handleProcessRegion}
          disabled={!box || !imageUrl}
        >
          处理选中区域
        </Button>
      </ControlPanel>

      <Modal
        open={previewVisible}
        title="图像预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Container>
  );
};

export default ImageUploader; 