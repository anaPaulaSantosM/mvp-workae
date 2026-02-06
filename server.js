const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const waitlistRoutes = require('./src/routes/waitlist.routes');

const app = express();

// middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// servir frontend
app.use(express.static(path.join(__dirname, 'frontend')));
// servir imagens de fotos de perfil
app.use('/img/fotos', express.static(path.join(__dirname, 'public/img/fotos')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// rotas da API
app.use('/api/waitlist', waitlistRoutes);
const usersRoutes = require('./src/routes/users.routes');
app.use('/api/users', usersRoutes);
// Também expõe as rotas de redefinição de senha na raiz da API para compatibilidade
app.use('/api', usersRoutes);

// fallback explícito para /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


// Exporta o app como handler para Vercel Serverless Functions
module.exports = app;
