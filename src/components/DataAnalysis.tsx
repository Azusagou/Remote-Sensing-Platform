import React from 'react';
import styled from 'styled-components';
import ImageUploader from './ImageUploader';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 16px;
`;

const DataAnalysis: React.FC = () => {
  return (
    <Container>
      <section>
        <SectionTitle>图像数据上传与分析</SectionTitle>
        <ImageUploader />
      </section>
    </Container>
  );
};

export default DataAnalysis; 