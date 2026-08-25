import { FileText } from 'lucide-react';
import LegalPage from './LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos e Condições"
      icon={FileText}
      updatedAt="agosto de 2026"
      intro="Estes Termos regem o uso do site e a compra de produtos do Ateliê da Nay. Ao criar uma conta ou realizar um pedido, você concorda com as condições descritas abaixo."
      sections={[
        {
          id: 'produtos-personalizados',
          title: 'Produtos personalizados',
          body: (
            <p>
              Todos os produtos são confeccionados sob encomenda, de acordo com as informações de personalização
              fornecidas por você no momento da compra — nomes, datas, textos, escolhas de cor e modelo, entre outras.
              É sua responsabilidade conferir atentamente essas informações antes de finalizar o pedido: uma vez que a
              produção começa, não é mais possível alterá-las.
            </p>
          ),
        },
        {
          id: 'pedidos-e-pagamento',
          title: 'Pedidos e pagamento',
          body: (
            <p>
              Ao finalizar um pedido, você recebe a confirmação e as instruções de pagamento diretamente pelo nosso
              WhatsApp ou e-mail. A produção só começa depois que o pagamento é confirmado.
            </p>
          ),
        },
        {
          id: 'prazos',
          title: 'Prazos de produção e entrega',
          body: (
            <p>
              Por serem itens artesanais e feitos sob medida, o prazo de produção é informado no momento da compra ou
              do contato e pode variar conforme a demanda e a complexidade do pedido. Os prazos de entrega dos
              Correios ou transportadoras são estimados por elas e estão fora do nosso controle.
            </p>
          ),
        },
        {
          id: 'conta',
          title: 'Conta e cadastro',
          body: (
            <p>
              O cadastro é obrigatório para finalizar uma compra. Você é responsável por manter a confidencialidade
              da sua senha e por todas as atividades realizadas na sua conta.
            </p>
          ),
        },
      ]}
    />
  );
}
