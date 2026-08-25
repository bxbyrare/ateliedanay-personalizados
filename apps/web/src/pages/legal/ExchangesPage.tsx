import { RefreshCw } from 'lucide-react';
import LegalPage from './LegalPage';

export default function ExchangesPage() {
  return (
    <LegalPage
      title="Trocas e Devoluções"
      icon={RefreshCw}
      updatedAt="agosto de 2026"
      intro="Como cada peça é feita sob medida especialmente para você, as regras de troca são um pouco diferentes das de um produto de prateleira — veja como funciona abaixo."
      sections={[
        {
          id: 'produtos-personalizados',
          title: 'Produtos personalizados',
          body: (
            <p>
              Por serem fabricados sob encomenda de acordo com as informações fornecidas por cada cliente — nomes,
              datas, textos, cores e outras escolhas — os produtos personalizados não têm troca por arrependimento
              após o início da produção, conforme previsto no Código de Defesa do Consumidor para bens feitos sob
              medida.
            </p>
          ),
        },
        {
          id: 'defeitos',
          title: 'Defeitos de fabricação',
          body: (
            <p>
              Se o produto chegar com defeito de fabricação ou divergente do que foi combinado, entre em contato em
              até 7 dias corridos após o recebimento, com fotos do produto e da embalagem. Vamos avaliar o caso e,
              confirmado o defeito, providenciar o reparo, a substituição ou o reembolso.
            </p>
          ),
        },
        {
          id: 'avarias',
          title: 'Avarias no transporte',
          body: (
            <p>
              Recomendamos conferir o produto na presença do entregador sempre que possível. Caso identifique avarias
              causadas pelo transporte, registre fotos do pacote e do produto e nos avise imediatamente para que
              possamos acionar a transportadora.
            </p>
          ),
        },
      ]}
    />
  );
}
