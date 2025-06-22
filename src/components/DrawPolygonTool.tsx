import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, Tooltip, message } from 'antd';
import { DeleteOutlined, CheckOutlined, CloseOutlined, AimOutlined } from '@ant-design/icons';
import { Coordinate, Polygon } from '../services/GeoService';

// 为Cesium声明全局类型
declare global {
  interface Window {
    Cesium: any;
  }
}

const DrawToolContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(30, 34, 34, 0.9);
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const DrawInstructions = styled.div`
  color: #fff;
  font-size: 14px;
  margin-right: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const CoordinateDisplay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(30, 34, 34, 0.9);
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const PointList = styled.div`
  position: absolute;
  top: 80px;
  left: 20px;
  background-color: rgba(30, 34, 34, 0.9);
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-height: 200px;
  overflow-y: auto;
  width: 200px;
`;

const PointItem = styled.div`
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeletePointButton = styled(Button)`
  padding: 0;
  height: 20px;
  width: 20px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface DrawPolygonToolProps {
  cesiumViewer: any; // Cesium Viewer 实例
  onComplete: (polygon: Polygon) => void;
  onCancel: () => void;
}

const DrawPolygonTool: React.FC<DrawPolygonToolProps> = ({ cesiumViewer, onComplete, onCancel }) => {
  const [drawing, setDrawing] = useState(true);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Coordinate | null>(null);
  const polylineEntity = useRef<any>(null);
  const polygonEntity = useRef<any>(null);
  const previewLineEntity = useRef<any>(null);
  const clickHandler = useRef<any>(null);
  const moveHandler = useRef<any>(null);
  const [initialized, setInitialized] = useState(false);
  
  // 初始化绘制工具
  useEffect(() => {
    if (!cesiumViewer || !window.Cesium) {
      console.error('Cesium实例或全局Cesium对象未加载');
      message.error('地图组件未正确加载，请刷新页面重试');
      return;
    }
    
    try {
      console.log('初始化绘制工具');
      
      // 设置鼠标样式
      cesiumViewer.canvas.style.cursor = 'crosshair';
      
      // 添加点击事件处理
      const handler = new window.Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
      
      handler.setInputAction((event: any) => {
        const cartesian = cesiumViewer.camera.pickEllipsoid(
          event.position,
          cesiumViewer.scene.globe.ellipsoid
        );
        
        if (cartesian) {
          const cartographic = window.Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = window.Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = window.Cesium.Math.toDegrees(cartographic.latitude);
          
          addPoint({ lng: longitude, lat: latitude });
        }
      }, window.Cesium.ScreenSpaceEventType.LEFT_CLICK);
      
      clickHandler.current = handler;
      
      // 添加鼠标移动事件处理
      const moveHandlerInstance = new window.Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
      
      moveHandlerInstance.setInputAction((event: any) => {
        const cartesian = cesiumViewer.camera.pickEllipsoid(
          event.endPosition,
          cesiumViewer.scene.globe.ellipsoid
        );
        
        if (cartesian) {
          const cartographic = window.Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = window.Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = window.Cesium.Math.toDegrees(cartographic.latitude);
          
          setCurrentPosition({ lng: longitude, lat: latitude });
          
          // 更新预览线
          updatePreviewLine({ lng: longitude, lat: latitude });
        }
      }, window.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      
      moveHandler.current = moveHandlerInstance;
      
      setInitialized(true);
      message.success('绘制工具已准备就绪，请在地图上点击添加点');
      
      // 清理函数
      return () => {
        console.log('清理绘制工具');
        if (clickHandler.current) {
          clickHandler.current.destroy();
        }
        
        if (moveHandler.current) {
          moveHandler.current.destroy();
        }
        
        cesiumViewer.canvas.style.cursor = 'default';
        
        // 清除所有实体
        entities.forEach(entity => {
          cesiumViewer.entities.remove(entity);
        });
        
        if (polylineEntity.current) {
          cesiumViewer.entities.remove(polylineEntity.current);
        }
        
        if (polygonEntity.current) {
          cesiumViewer.entities.remove(polygonEntity.current);
        }
        
        if (previewLineEntity.current) {
          cesiumViewer.entities.remove(previewLineEntity.current);
        }
      };
    } catch (error) {
      console.error('初始化绘制工具失败:', error);
      message.error('初始化绘制工具失败，请刷新页面重试');
      onCancel();
    }
  }, [cesiumViewer]);
  
  // 添加点
  const addPoint = (coordinate: Coordinate) => {
    if (!cesiumViewer || !window.Cesium) {
      message.error('地图组件未正确加载');
      return;
    }
    
    try {
      // 添加点实体
      const pointEntity = cesiumViewer.entities.add({
        position: window.Cesium.Cartesian3.fromDegrees(coordinate.lng, coordinate.lat),
        point: {
          pixelSize: 10,
          color: window.Cesium.Color.BLUE,
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: `点 ${points.length + 1}`,
          font: '12px sans-serif',
          fillColor: window.Cesium.Color.WHITE,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new window.Cesium.Cartesian2(0, -10)
        }
      });
      
      setEntities(prev => [...prev, pointEntity]);
      setPoints(prev => [...prev, coordinate]);
      
      // 更新线条和多边形
      updatePolyline([...points, coordinate]);
      updatePolygon([...points, coordinate]);
      
      // 飞行到该点
      cesiumViewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(
          coordinate.lng, 
          coordinate.lat, 
          cesiumViewer.camera.positionCartographic.height
        ),
        duration: 0.5
      });
      
      // 成功提示
      if (points.length === 0) {
        message.success('开始绘制多边形，请继续添加点');
      }
    } catch (error) {
      console.error('添加点失败:', error);
      message.error('添加点失败');
    }
  };
  
  // 更新预览线
  const updatePreviewLine = (currentCoord: Coordinate) => {
    if (points.length === 0 || !cesiumViewer || !window.Cesium) return;
    
    try {
      // 移除旧的预览线
      if (previewLineEntity.current) {
        cesiumViewer.entities.remove(previewLineEntity.current);
      }
      
      // 创建从最后一个点到当前鼠标位置的线
      const lastPoint = points[points.length - 1];
      
      previewLineEntity.current = cesiumViewer.entities.add({
        polyline: {
          positions: [
            window.Cesium.Cartesian3.fromDegrees(lastPoint.lng, lastPoint.lat),
            window.Cesium.Cartesian3.fromDegrees(currentCoord.lng, currentCoord.lat)
          ],
          width: 2,
          material: new window.Cesium.PolylineDashMaterialProperty({
            color: window.Cesium.Color.YELLOW
          }),
          clampToGround: true
        }
      });
      
      // 如果有超过2个点，也显示闭合线
      if (points.length > 1) {
        // 移除旧的预览线
        if (previewLineEntity.current) {
          cesiumViewer.entities.remove(previewLineEntity.current);
        }
        
        // 创建从最后一个点到当前鼠标位置的线，以及从当前鼠标位置到第一个点的线
        const firstPoint = points[0];
        
        previewLineEntity.current = cesiumViewer.entities.add({
          polyline: {
            positions: [
              window.Cesium.Cartesian3.fromDegrees(lastPoint.lng, lastPoint.lat),
              window.Cesium.Cartesian3.fromDegrees(currentCoord.lng, currentCoord.lat),
              window.Cesium.Cartesian3.fromDegrees(firstPoint.lng, firstPoint.lat)
            ],
            width: 2,
            material: new window.Cesium.PolylineDashMaterialProperty({
              color: window.Cesium.Color.YELLOW
            }),
            clampToGround: true
          }
        });
      }
    } catch (error) {
      console.error('更新预览线失败:', error);
    }
  };
  
  // 更新线条
  const updatePolyline = (coordinates: Coordinate[]) => {
    if (coordinates.length < 2 || !cesiumViewer || !window.Cesium) return;
    
    try {
      // 移除旧的线条
      if (polylineEntity.current) {
        cesiumViewer.entities.remove(polylineEntity.current);
      }
      
      // 创建新的线条
      const positions = coordinates.map(coord => 
        window.Cesium.Cartesian3.fromDegrees(coord.lng, coord.lat)
      );
      
      // 如果有超过2个点，闭合多边形
      if (coordinates.length > 2) {
        positions.push(window.Cesium.Cartesian3.fromDegrees(
          coordinates[0].lng, 
          coordinates[0].lat
        ));
      }
      
      polylineEntity.current = cesiumViewer.entities.add({
        polyline: {
          positions,
          width: 3,
          material: window.Cesium.Color.BLUE,
          clampToGround: true
        }
      });
    } catch (error) {
      console.error('更新线条失败:', error);
    }
  };
  
  // 更新多边形
  const updatePolygon = (coordinates: Coordinate[]) => {
    if (coordinates.length < 3 || !cesiumViewer || !window.Cesium) return;
    
    try {
      // 移除旧的多边形
      if (polygonEntity.current) {
        cesiumViewer.entities.remove(polygonEntity.current);
      }
      
      // 创建新的多边形
      const positions = coordinates.map(coord => 
        window.Cesium.Cartesian3.fromDegrees(coord.lng, coord.lat)
      );
      
      polygonEntity.current = cesiumViewer.entities.add({
        polygon: {
          hierarchy: new window.Cesium.PolygonHierarchy(positions),
          material: window.Cesium.Color.BLUE.withAlpha(0.3),
          outline: true,
          outlineColor: window.Cesium.Color.BLUE,
          outlineWidth: 2
        }
      });
      
      // 计算面积
      if (coordinates.length > 2) {
        const area = calculatePolygonArea(coordinates);
        message.info(`多边形面积: ${area.toFixed(2)} 平方公里`);
      }
    } catch (error) {
      console.error('更新多边形失败:', error);
    }
  };
  
  // 计算多边形面积
  const calculatePolygonArea = (coordinates: Coordinate[]): number => {
    if (coordinates.length < 3 || !window.Cesium) return 0;
    
    try {
      // 使用Cesium的计算方法
      const positions = coordinates.map(coord => 
        window.Cesium.Cartesian3.fromDegrees(coord.lng, coord.lat)
      );
      
      // 闭合多边形
      positions.push(positions[0]);
      
      // 使用球面多边形计算面积
      const polygon = new window.Cesium.PolygonGeometry({
        polygonHierarchy: new window.Cesium.PolygonHierarchy(positions),
        perPositionHeight: true
      });
      
      try {
        // 尝试计算面积（平方米）
        const geometry = window.Cesium.PolygonGeometry.createGeometry(polygon);
        const area = window.Cesium.PolygonPipeline.computeArea(geometry.attributes.position.values);
        
        // 转换为平方公里
        return area / 1000000;
      } catch (error) {
        console.error('计算面积失败:', error);
        return 0;
      }
    } catch (error) {
      console.error('计算面积失败:', error);
      return 0;
    }
  };
  
  // 删除指定点
  const deletePoint = (index: number) => {
    if (!cesiumViewer) return;
    
    try {
      // 移除实体
      if (entities[index]) {
        cesiumViewer.entities.remove(entities[index]);
      }
      
      // 更新状态
      const newPoints = [...points];
      newPoints.splice(index, 1);
      
      const newEntities = [...entities];
      newEntities.splice(index, 1);
      
      setPoints(newPoints);
      setEntities(newEntities);
      
      // 更新线条和多边形
      if (newPoints.length > 0) {
        updatePolyline(newPoints);
        updatePolygon(newPoints);
        
        // 重新标记点的序号
        newEntities.forEach((entity, idx) => {
          entity.label.text = `点 ${idx + 1}`;
        });
      } else {
        // 如果没有点了，清除线条和多边形
        if (polylineEntity.current) {
          cesiumViewer.entities.remove(polylineEntity.current);
          polylineEntity.current = null;
        }
        
        if (polygonEntity.current) {
          cesiumViewer.entities.remove(polygonEntity.current);
          polygonEntity.current = null;
        }
      }
    } catch (error) {
      console.error('删除点失败:', error);
      message.error('删除点失败');
    }
  };
  
  // 清除所有点
  const clearPoints = () => {
    if (!cesiumViewer) return;
    
    try {
      // 移除所有实体
      entities.forEach(entity => {
        cesiumViewer.entities.remove(entity);
      });
      
      if (polylineEntity.current) {
        cesiumViewer.entities.remove(polylineEntity.current);
      }
      
      if (polygonEntity.current) {
        cesiumViewer.entities.remove(polygonEntity.current);
      }
      
      if (previewLineEntity.current) {
        cesiumViewer.entities.remove(previewLineEntity.current);
      }
      
      setEntities([]);
      setPoints([]);
      polylineEntity.current = null;
      polygonEntity.current = null;
      previewLineEntity.current = null;
      
      message.info('已清除所有点');
    } catch (error) {
      console.error('清除点失败:', error);
      message.error('清除点失败');
    }
  };
  
  // 完成绘制
  const handleComplete = () => {
    if (points.length < 3) {
      message.warning('请至少绘制3个点形成一个多边形');
      return;
    }
    
    try {
      // 构建闭合多边形
      const polygon: Polygon = {
        coordinates: [...points]
      };
      
      // 计算面积
      const area = calculatePolygonArea(points);
      message.success(`绘制完成，多边形面积: ${area.toFixed(2)} 平方公里`);
      
      // 调用完成回调
      onComplete(polygon);
      
      // 清除绘制状态
      setDrawing(false);
      
      // 移除点击处理器
      if (clickHandler.current) {
        clickHandler.current.destroy();
        clickHandler.current = null;
      }
      
      if (moveHandler.current) {
        moveHandler.current.destroy();
        moveHandler.current = null;
      }
      
      // 恢复鼠标样式
      if (cesiumViewer) {
        cesiumViewer.canvas.style.cursor = 'default';
      }
    } catch (error) {
      console.error('完成绘制失败:', error);
      message.error('完成绘制失败');
    }
  };
  
  // 取消绘制
  const handleCancel = () => {
    try {
      clearPoints();
      onCancel();
      
      // 移除点击处理器
      if (clickHandler.current) {
        clickHandler.current.destroy();
        clickHandler.current = null;
      }
      
      if (moveHandler.current) {
        moveHandler.current.destroy();
        moveHandler.current = null;
      }
      
      // 恢复鼠标样式
      if (cesiumViewer) {
        cesiumViewer.canvas.style.cursor = 'default';
      }
    } catch (error) {
      console.error('取消绘制失败:', error);
      message.error('取消绘制失败');
    }
  };
  
  if (!initialized) {
    return (
      <DrawToolContainer>
        <DrawInstructions>
          正在初始化绘制工具...
        </DrawInstructions>
      </DrawToolContainer>
    );
  }
  
  return (
    <>
      <DrawToolContainer>
        <DrawInstructions>
          <AimOutlined /> 在地图上点击绘制多边形区域 ({points.length} 个点)
        </DrawInstructions>
        
        <ActionButtons>
          <Tooltip title="清除所有点">
            <Button 
              icon={<DeleteOutlined />} 
              onClick={clearPoints}
              disabled={points.length === 0}
            />
          </Tooltip>
          
          <Tooltip title="完成绘制">
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={handleComplete}
              disabled={points.length < 3}
            />
          </Tooltip>
          
          <Tooltip title="取消绘制">
            <Button 
              danger 
              icon={<CloseOutlined />} 
              onClick={handleCancel}
            />
          </Tooltip>
        </ActionButtons>
      </DrawToolContainer>
      
      {currentPosition && (
        <CoordinateDisplay>
          经度: {currentPosition.lng.toFixed(6)}, 纬度: {currentPosition.lat.toFixed(6)}
        </CoordinateDisplay>
      )}
      
      {points.length > 0 && (
        <PointList>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>已添加的点:</div>
          {points.map((point, index) => (
            <PointItem key={index}>
              <div>点 {index + 1}: ({point.lng.toFixed(4)}, {point.lat.toFixed(4)})</div>
              <DeletePointButton 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => deletePoint(index)}
                size="small"
              />
            </PointItem>
          ))}
        </PointList>
      )}
    </>
  );
};

export default DrawPolygonTool; 