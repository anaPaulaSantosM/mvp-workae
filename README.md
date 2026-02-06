# Deploy na Vercel

## Variáveis de Ambiente Necessárias

- `DATABASE_URL`: string de conexão do banco PostgreSQL
- Outras variáveis usadas no seu .env, se houver

Configure essas variáveis no painel da Vercel em Settings > Environment Variables.

## Estrutura do Projeto

- O frontend é servido da pasta `/frontend` (estático)
- A API (Express) está em `server.js` e é exportada como função serverless
- Imagens públicas estão em `/public/img` e `/public/img/fotos`

## Observações

- Uploads para disco local não são persistentes na Vercel (use storage externo se necessário)
- O backend não mantém conexões persistentes (serverless)
- Ajuste as URLs do frontend para consumir a API via `/api/`
