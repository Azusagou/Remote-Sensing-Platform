import React from 'react';
import styled from 'styled-components';
import { Breadcrumb, Card } from 'antd';
import DataAnalysis from '../components/DataAnalysis';

const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 180px);
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
`;

const DataAnalysisPage: React.FC = () => {
  return (
    <Container>
      <PageHeader>
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>数据分析</Breadcrumb.Item>
        </Breadcrumb>
        <Title>图像数据分析</Title>
        <Description>
          上传图像进行预览和分析，可通过拉框选择特定区域进行模型处理
        </Description>
      </PageHeader>
      
      <Card>
        <DataAnalysis />
      </Card>
    </Container>
  );
};

export default DataAnalysisPage; 