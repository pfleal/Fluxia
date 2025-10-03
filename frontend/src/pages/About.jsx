import { Layout, Typography, Row, Col, Button, Space } from 'antd';
import { GithubOutlined, GlobalOutlined, MailOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function About() {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Content style={{ padding: '50px' }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Title level={1} style={{ color: '#1890ff' }}>
                Fluxia
              </Title>
              <Title level={3} style={{ color: '#666' }}>
                Sistema de Gestão Empresarial
              </Title>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                <Text strong>Fluxia</Text> é um sistema completo de ERP e CRM desenvolvido para otimizar a gestão empresarial. 
                Nossa plataforma oferece soluções integradas para controle financeiro, gestão de clientes, 
                emissão de faturas e relatórios analíticos.
              </Paragraph>

              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Website : <a href="https://www.fluxia.com.br">www.fluxia.com.br</a>{' '}
              </Paragraph>

              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                Código Fonte :{' '}
                <a href="https://github.com/fluxia/fluxia-erp-crm">
                  https://github.com/fluxia/fluxia-erp-crm
                </a>
              </Paragraph>

              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Space size="large">
                  <Button
                    type="primary"
                    icon={<MailOutlined />}
                    onClick={() => {
                      window.open(`https://www.fluxia.com.br/contato/`);
                    }}
                  >
                    Entre em Contato
                  </Button>
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
