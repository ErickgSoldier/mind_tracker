# Mind Tracker Pro

O Mind Tracker Pro é um aplicativo Web / PWA projetado para acompanhamento de saúde mental e rastreio de gatilhos emocionais, construído com arquitetura moderna e preparado para produção (Vercel + Railway).

## Tecnologias

- **Frontend:** Vue 3 (Composition API), Vite, Pinia (Gerenciamento de Estado)
- **Backend:** Node.js, Express
- **Banco de Dados:** PostgreSQL (via Prisma ORM)
- **Offline-First:** IndexedDB (Pinia offline queue via `idb`) + Workbox Service Worker.

## Instalação e Desenvolvimento Local

1. **Configuração de Banco de Dados:** Você precisará de um banco PostgreSQL.
2. **Backend:**
   ```bash
   cd backend
   npm install
   # Crie um arquivo .env na pasta backend com DATABASE_URL
   npx prisma db push
   npm run dev
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   # Opcional: Crie um .env na pasta frontend configurando VITE_API_URL
   npm run dev
   ```

## Deploy (Produção)

Este projeto está pronto para CI/CD moderno, dividindo Frontend (Vercel) e Backend (Railway).

### 1. Banco de Dados e Backend (Railway)
- Crie um novo projeto no [Railway](https://railway.app).
- Adicione o plugin **PostgreSQL** ao projeto.
- Conecte seu repositório do Github ao Railway (deploy da sub-pasta `backend`).
- Nas variáveis do repositório no Railway, defina:
  - `DATABASE_URL` (use a URL gerada pelo plugin Postgres).
  - `FRONTEND_URL` (A URL de produção do seu frontend, ex: `https://mindtracker.vercel.app`).
- O Railway injeta a variável `PORT` e roda automaticamente o script `npm start` que invoca `node dist/index.js` (O build ocorre usando `tsc` via `npm run build` durante a construção da imagem).

> **Atenção:** Como o Railway faz o deploy da raiz e nossos projetos estão em pastas separadas, certifique-se de definir a `Root Directory` como `backend` nas configurações do Railway.

### 2. Frontend (Vercel)
- Crie um novo projeto no [Vercel](https://vercel.com).
- Conecte seu repositório do Github.
- Em "Build and Output Settings":
  - **Root Directory:** selecione `frontend`
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- Em "Environment Variables", defina:
  - `VITE_API_URL`: Aponte para a URL da sua API gerada no Railway (Ex: `https://mind-api.up.railway.app/api`).
- O arquivo `vercel.json` garante o mapeamento (rewrites) correto do Vue Router.

## PWA Instalável (Mobile)

O frontend utiliza `vite-plugin-pwa`. Quando em produção:
1. Abra a URL do Vercel no Chrome do seu Android.
2. Clique no banner "Adicionar à Tela Inicial" ou acesse o menu do Chrome > Instalar Aplicativo.
3. O aplicativo rodará em tela cheia (Standalone) e suporta atalhos de longo toque no ícone (`shortcuts`).
4. **Offline First**: A API e os assets fazem cache no background usando estratégias NetworkFirst e CacheFirst. Modificações offline serão salvas no IndexedDB e re-sincronizadas quando o aparelho recuperar conexão.
