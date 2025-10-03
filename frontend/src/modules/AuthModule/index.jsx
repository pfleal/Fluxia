import { Layout, Col, Divider } from 'antd';

import SideContent from './SideContent';
import logo from '@/style/images/fluxia-icon.svg';

const { Content, Sider } = Layout;

const AuthModule = ({ authContent, AUTH_TITLE }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        style={{
          backgroundColor: '#f0f2f5',
          minHeight: '100vh',
        }}
        width={'50%'}
        breakpoint="lg"
        collapsedWidth="0"
      >
        <SideContent />
      </Sider>
      <Content
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            padding: '50px 0',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img src={logo} alt="Fluxia" style={{ height: '60px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {AUTH_TITLE}
            </h1>
          </div>
          <Divider />
          {authContent}
        </div>
      </Content>
    </Layout>
  );
};

export default AuthModule;
