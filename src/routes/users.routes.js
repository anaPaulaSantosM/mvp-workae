const express = require('express');
const router = express.Router();

const pool = require('../database/connection');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Nodemailer para envio de e-mails
const nodemailer = require('nodemailer');


// Rota para redefinir a senha com token
router.post('/reset-password', async (req, res) => {
    console.log('Rota /reset-password chamada');

    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hash, userId]
        );

        return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
});


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD // senha de app
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('ERRO SMTP VERIFY:', error);
    } else {
        console.log('SMTP pronto para enviar e-mails');
    }
});


// Configuração do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../../public/img/fotos');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

// Buscar perfil do candidato por user_id
router.get('/perfil/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(`
            SELECT p.*, u.email
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = $1
        `, [user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Perfil não encontrado.' });
        }

        const perfil = result.rows[0];

        // Ajusta nomes dos campos para o frontend
        const perfilFront = {
            ...perfil,
            'cursos-extras': perfil.cursos_extras,
            'erro-aprendizado': perfil.erro_aprendizado,
            'nao-sabe': perfil.nao_sabe,
            'lugar': perfil.lugar_sonho,
            'porque-contratar': perfil.porque_contratar
        };
        if (typeof perfilFront.idiomas === 'string') {
            perfilFront.idiomas = perfilFront.idiomas
                .replace(/[{}\"]/g, '')
                .split(',')
                .map(i => i.trim());
        }
        res.json(perfilFront);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
});

// Cadastro de usuário (e-mail e senha)
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hash]
        );
        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            res.status(409).json({ error: 'E-mail já cadastrado.' });
        } else {
            res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
        }
    }
});

// Recuperação de senha
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    console.log('Forgot password chamado com email:', email);

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        console.log('Resultado do usuário:', result.rows.length);

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
            });
        }

        console.log('Gerando token');

        const resetToken = jwt.sign(
            { id: result.rows[0].id, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const resetLink = `http://localhost:3334/reset-password.html?token=${resetToken}`;

        console.log('Preparando envio de e-mail');
        console.log('SMTP USER:', process.env.EMAIL);
        console.log('SMTP PASS EXISTE?', !!process.env.PASSWORD);

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Redefinição de senha - Workae',
            html: `
                <p>Olá,<br>
                Clique no link para redefinir sua senha:<br>
                <a href="${resetLink}">${resetLink}</a></p>
            `
        });

        console.log('E-mail enviado com sucesso');

        return res.status(200).json({
            message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
        });

    } catch (err) {
        console.error('ERRO REAL NO FORGOT PASSWORD');
        console.error(err);
        return res.status(500).json({
            error: 'Erro ao processar solicitação',
            message: err.message
        });
    }
});


// Login de usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'workae_secret', { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error(err); // Adiciona o log do erro
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

// Cadastro/atualização do perfil do candidato
router.post('/cadastrar-perfil-candidato', upload.single('foto'), async (req, res) => {
    const {
        user_id,
        nome,
        idade,
        cidade,
        estado,
        formacao,
        idiomas,
        telefone,
        'cursos-extras': cursos_extras,
        projetos,
        hobbies,
        'erro-aprendizado': erro_aprendizado,
        'nao-sabe': nao_sabe,
        superacao,
        inspiracao,
        motivacao,
        musica,
        lugar,
        'porque-contratar': porque_contratar
    } = req.body;

    let foto;
    // Busca a foto atual no banco ANTES de tudo
    const resultFoto = await pool.query('SELECT foto FROM profiles WHERE user_id = $1', [user_id]);
    const fotoAtual = resultFoto.rows.length > 0 ? resultFoto.rows[0].foto : null;
    if (req.file && req.file.filename) {
        foto = req.file.filename;
    } else {
        foto = fotoAtual;
    }
    if (!user_id) return res.status(400).json({ error: 'Usuário não autenticado.' });
    try {
        // Upsert do perfil
        const result = await pool.query(
            `INSERT INTO profiles (
                user_id, foto, nome, idade, cidade, estado, formacao, idiomas, telefone, cursos_extras, projetos, hobbies,
                erro_aprendizado, nao_sabe, superacao, inspiracao, motivacao, musica, lugar_sonho, porque_contratar
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            )
            ON CONFLICT (user_id) DO UPDATE SET
                foto = EXCLUDED.foto,
                nome = EXCLUDED.nome,
                idade = EXCLUDED.idade,
                cidade = EXCLUDED.cidade,
                estado = EXCLUDED.estado,
                formacao = EXCLUDED.formacao,
                idiomas = EXCLUDED.idiomas,
                telefone = EXCLUDED.telefone,
                cursos_extras = EXCLUDED.cursos_extras,
                projetos = EXCLUDED.projetos,
                hobbies = EXCLUDED.hobbies,
                erro_aprendizado = EXCLUDED.erro_aprendizado,
                nao_sabe = EXCLUDED.nao_sabe,
                superacao = EXCLUDED.superacao,
                inspiracao = EXCLUDED.inspiracao,
                motivacao = EXCLUDED.motivacao,
                musica = EXCLUDED.musica,
                lugar_sonho = EXCLUDED.lugar_sonho,
                porque_contratar = EXCLUDED.porque_contratar
            RETURNING *;`,
            [
                user_id,
                foto,
                nome,
                idade,
                cidade,
                estado,
                formacao,
                idiomas,
                telefone,
                cursos_extras,
                projetos,
                hobbies,
                erro_aprendizado,
                nao_sabe,
                superacao,
                inspiracao,
                motivacao,
                musica,
                lugar,
                porque_contratar
            ]

        );
        res.status(200).json({ profile: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar perfil.' });
    }
});

module.exports = router;
