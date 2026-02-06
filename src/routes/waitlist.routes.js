const router = require('express').Router();
const db = require('../database/connection');

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    await db.query(
      'INSERT INTO waitlist_emails (email) VALUES ($1)',
      [email.toLowerCase()]
    );

    return res.status(201).json({
      message: 'Email cadastrado com sucesso!'
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    return res.status(500).json({
      error: 'Erro ao salvar email'
    });
  }
});

module.exports = router;
