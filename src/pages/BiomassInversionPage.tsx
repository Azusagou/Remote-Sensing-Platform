import React from 'react';
import styled from 'styled-components';
import { Breadcrumb, Card } from 'antd';
import BiomassInversion from '../components/BiomassInversion';

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

const BiomassInversionPage: React.FC = () => {
  return (
    <Container>
      <PageHeader>
        <Breadcrumb>
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>生物量反演</Breadcrumb.Item>
        </Breadcrumb>
        <Title>生物量反演分析</Title>
        <Description>
          上传卫星影像、温度和降水数据，进行生物量反演分析并查看结果可视化
        </Description>
      </PageHeader>
      
      <Card>
        <BiomassInversion />
      </Card>
    </Container>
  );
};

export default BiomassInversionPage;