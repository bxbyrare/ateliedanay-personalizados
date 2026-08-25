# 🎁 Ateliê da Nay Personalizados

> E-commerce completo de mimos e lembrancinhas personalizadas — do catálogo ao painel administrativo — desenvolvido para um negócio real com identidade visual e regras de venda próprias.

---

### 📌 Sobre o projeto

**Ateliê da Nay Personalizados** é uma loja virtual criada para uma cliente real do ramo de personalização (canecas, quadros, convites, chaveiros e afins). O sistema cobre a jornada completa de venda: catálogo público, cadastro e login do cliente, carrinho, checkout com endereço de entrega e um **painel administrativo** para a própria dona da loja cadastrar produtos, categorias e campos de personalização — sem depender de ninguém para atualizar o catálogo.

O projeto foi construído como um monorepo com frontend e backend separados, mas publicados como **um único serviço em produção**, e com uma camada de segurança pensada desde o início (cookies httpOnly, CSRF, rate limiting, bloqueio de conta, sanitização de conteúdo admin) — já que se trata de uma loja que vai processar dados e pedidos reais de clientes.

### 🛠️ Tecnologias utilizadas

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

### ✨ Funcionalidades

- 🛍️ Catálogo público com categorias, busca e produtos com campos de personalização dinâmicos (texto, número, data, lista de opções)
- 🔐 Cadastro/login por e-mail e senha, com **"Continuar com Google"** opcional (Google Identity Services)
- 🛒 Carrinho de visitante que migra automaticamente para a conta do cliente ao fazer login/cadastro
- 📦 Checkout com cadastro de endereço — conta é **obrigatória** antes de finalizar um pedido
- 👤 Painel "Minha Conta" (Painel, Pedidos, Endereços, Detalhes da Conta, Favoritos)
- 🧑‍💼 **Painel administrativo** próprio (`/admin`): criação e edição de produtos com upload de imagens, editor de campos de personalização e gestão de categorias
- 🛡️ Segurança de base em todo o backend: cookies httpOnly, proteção CSRF, rate limiting por rota, bloqueio de conta após tentativas de login inválidas, sanitização de HTML admin-autorado, validação de upload pelo conteúdo real do arquivo

### 🎯 Objetivo

Entregar para uma cliente real uma loja virtual completa e independente — que ela mesma consiga operar sozinha pelo painel administrativo, sem depender de terceiros para cadastrar produtos ou atualizar o catálogo — mantendo um padrão de segurança e arquitetura equivalente ao de um e-commerce em produção, não de um protótipo.

### 📚 Aprendizados

Durante o desenvolvimento foram aplicados conceitos como:

- Arquitetura de monorepo (pnpm workspaces) com pacote de tipos/validações compartilhado entre front e back
- Autenticação própria com cookies httpOnly + refresh, somada a login social (OAuth do Google)
- Modelagem de dados com Prisma/PostgreSQL para catálogo, pedidos, endereços e personalização de produtos
- Hardening de API Node/Express (CSRF, rate limiting, sanitização, validação de upload por conteúdo)
- Deploy de monorepo como serviço único, com a API servindo o build estático do frontend

---

<div align="center">

Desenvolvido por **bxbyrare**.

</div>

---

## Documentação técnica

### Stack

Monorepo (pnpm workspaces) com dois apps e um pacote compartilhado:

- **`apps/web`** — React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **`apps/api`** — Node.js + Express + TypeScript + Prisma (PostgreSQL)
- **`packages/shared`** — schemas de validação (Zod) e tipos TypeScript compartilhados entre frontend e backend

Em produção, a API serve o build estático do frontend a partir do mesmo processo/porta — um único serviço, sem necessidade de dois deploys separados.

### Rodando localmente

Pré-requisitos: Node.js 20+, [pnpm](https://pnpm.io) e um PostgreSQL acessível (local ou remoto).

```bash
pnpm install
```

Copie os arquivos de exemplo de variáveis de ambiente e preencha os valores:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Rode as migrations e (opcionalmente) popule o banco com uma categoria/produto de exemplo e a conta admin:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Suba os dois serviços em terminais separados:

```bash
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000 (proxy automático de /api e /uploads para a API)
```

### Variáveis de ambiente

#### `apps/api/.env`

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Connection string do PostgreSQL |
| `CORS_ORIGIN` | sim | Origem(ns) do frontend permitidas (separadas por vírgula) |
| `JWT_ACCESS_SECRET` / `CSRF_SECRET` | sim | Segredos aleatórios de 64+ bytes — gerar com `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `COOKIE_DOMAIN` | não | Domínio dos cookies de sessão (vazio = localhost) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | não | Cria a primeira conta admin ao rodar `prisma:seed` |
| `GOOGLE_CLIENT_ID` | não | Habilita "Continuar com Google" (ver seção abaixo) |

#### `apps/web/.env`

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | não | Deixe vazio — a API é chamada na mesma origem (produção) ou via proxy do Vite (dev). Só preencher em um deploy separado do frontend/backend. |
| `VITE_GOOGLE_CLIENT_ID` | não | Mesmo valor de `GOOGLE_CLIENT_ID` da API. O botão do Google só aparece se estiver preenchido. |

### Login com Google

O botão "Continuar com Google" só pede o essencial (`openid email profile` — e-mail e nome) para autenticar o cliente sem cadastro manual. Para habilitar:

1. Crie um projeto e uma credencial OAuth do tipo **Web application** em [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Em "Authorized JavaScript origins", adicione o domínio de produção (ex.: `https://ateliedanay.shardweb.app`) e, se for testar localmente, `http://localhost:3000`.
3. Copie o **Client ID** gerado e defina-o em `GOOGLE_CLIENT_ID` (API) e `VITE_GOOGLE_CLIENT_ID` (web) — precisam ser o mesmo valor.

Sem essas variáveis configuradas, o site funciona normalmente e o botão simplesmente não aparece.

### Deploy (ShardCloud)

O repositório já inclui um arquivo [`.shardcloud`](./.shardcloud) na raiz com a configuração de build/start, então basta conectar o repositório GitHub na ShardCloud. Se o painel pedir para você indicar manualmente um "arquivo principal", aponte para **[`server.js`](./server.js)**, na raiz do repositório — ele apenas inicia a API já compilada, que por sua vez também serve o frontend buildado.

Configuração usada (`.shardcloud`):

```
LANGUAGE=node
MEMORY=2048
CUSTOM_COMMAND=corepack enable && pnpm install --frozen-lockfile --network-concurrency=4 && npm run build && npm start
```

`MEMORY` precisa cobrir o momento mais pesado do processo — que aqui é o build (TypeScript + Vite + geração do client do Prisma), não o consumo do servidor já rodando. **1024 MB não é suficiente**: o `pnpm install` chega a morrer com `OUT_OF_MEMORY` no meio do download dos pacotes. Use pelo menos 2048 MB.

Variáveis de ambiente a configurar no painel da ShardCloud (aba de variáveis do app, não em um arquivo `.env` — o `.env` não é versionado): todas as listadas na tabela de `apps/api/.env` acima, mais `NODE_ENV=production` e, se a ShardCloud não injetar uma automaticamente, `PORT`.

### Estrutura do projeto

```
apps/
  api/            # Express + Prisma
    prisma/       # schema.prisma e migrations
    src/
      modules/    # auth, users, addresses, categories, products, cart, orders, wishlist, uploads, payments
  web/
    src/
      api/        # cliente HTTP (fetch com CSRF/refresh automático)
      state/      # contexto de autenticação e carrinho
      pages/      # páginas públicas, conta do cliente e painel admin
packages/
  shared/         # schemas Zod e tipos usados por api e web
server.js         # entrypoint de produção (importa apps/api/dist/server.js)
```

### Pendências conhecidas

- Gateway de pagamento ainda não integrado (pedidos ficam com status "aguardando pagamento"; a abstração já existe em `apps/api/src/modules/payments`, faltando plugar um provedor real).
- Fotos reais dos produtos e da mascote da marca ainda não foram cadastradas — o catálogo pode ser populado pelo próprio painel admin em `/admin/produtos`.
