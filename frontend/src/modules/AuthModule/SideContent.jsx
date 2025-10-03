import { Space, Layout, Divider, Typography } from 'antd';

import logo from '@/style/images/fluxia-logo.svg';

import useLanguage from '@/locale/useLanguage';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();
  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <div style={{ width: '100%' }}>
        <img
          src={logo}
          alt="Fluxia ERP CRM"
          style={{ margin: '0 auto 40px', display: 'block' }}
        />
        <div className="space30"></div>
        <Title level={3}>
          {translate('Gerencie sua empresa de forma inteligente')}
        </Title>
        <p>
          {translate('Fluxia oferece uma solução completa para gestão empresarial, integrando ERP e CRM em uma única plataforma moderna e eficiente.')}
        </p>
        <Divider />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="left">
              <Text strong>{translate('Endereço')}</Text>
              <br />
              <Text>{translate('São Paulo, Brasil')}</Text>
            </div>
          </div>
          <div>
            <Text strong>{translate('Telefone')}</Text>
            <br />
            <Text>+55 11 9999-9999</Text>
          </div>
        </div>
      </div>
    </Content>
  );
}
