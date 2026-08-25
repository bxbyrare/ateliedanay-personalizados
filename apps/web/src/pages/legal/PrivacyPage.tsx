import { ShieldCheck } from 'lucide-react';
import LegalPage from './LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      icon={ShieldCheck}
      updatedAt="agosto de 2026"
      intro="Esta política explica quais dados o Ateliê da Nay coleta, para que usamos essas informações e como você pode exercer seus direitos, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)."
      sections={[
        {
          id: 'dados-coletados',
          title: 'Quais dados coletamos',
          body: (
            <ul>
              <li>Dados de cadastro: nome, e-mail, telefone e, opcionalmente, CPF.</li>
              <li>Dados de entrega: os endereços que você cadastra para o envio dos pedidos.</li>
              <li>Dados do pedido: produtos escolhidos, valores e as informações de personalização que você preenche.</li>
              <li>Dados de acesso: cookies estritamente necessários para manter sua sessão logada e proteger o site contra fraude — não usamos cookies de rastreamento publicitário.</li>
              <li>Se você entrar com sua conta Google, recebemos apenas seu nome e e-mail — nenhuma outra informação da sua conta Google é acessada.</li>
            </ul>
          ),
        },
        {
          id: 'uso-dos-dados',
          title: 'Para que usamos seus dados',
          body: (
            <ul>
              <li>Processar, produzir e entregar seus pedidos.</li>
              <li>Autenticar seu acesso e manter sua conta segura.</li>
              <li>Entrar em contato sobre o andamento de um pedido.</li>
              <li>Cumprir obrigações legais e fiscais.</li>
            </ul>
          ),
        },
        {
          id: 'compartilhamento',
          title: 'Compartilhamento de dados',
          body: (
            <p>
              Seus dados não são vendidos. Compartilhamos apenas o necessário com transportadoras e Correios para
              realizar a entrega, e com provedores de infraestrutura (hospedagem e banco de dados) que processam os
              dados em nosso nome, sob as mesmas obrigações de segurança.
            </p>
          ),
        },
        {
          id: 'seguranca',
          title: 'Segurança',
          body: (
            <p>
              Senhas são armazenadas de forma criptografada e nunca em texto puro. O acesso à conta é protegido
              contra tentativas repetidas de login, e todo o tráfego do site é criptografado (HTTPS).
            </p>
          ),
        },
        {
          id: 'seus-direitos',
          title: 'Seus direitos',
          body: (
            <p>
              Você pode acessar, corrigir ou solicitar a exclusão dos seus dados a qualquer momento, entrando em
              contato pelos canais abaixo. Dados necessários para cumprir obrigações fiscais — como notas de pedidos
              já concluídos — podem ser mantidos pelo prazo exigido por lei mesmo após a exclusão da conta.
            </p>
          ),
        },
      ]}
    />
  );
}
