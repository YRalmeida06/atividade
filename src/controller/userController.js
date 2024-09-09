const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const connection = require('../config/userConfig.js');

// Schemas de validação
const userSchema = z.object({
nome: z.string().min(1),
email: z.string().email(),
senha: z.string().min(8),
papel: z.enum(['administrador', 'autor', 'leitor']).optional()
});

const loginSchema = z.object({
email: z.string().email(),
senha: z.string().min(8)
});

const createUser = async (req, res) => {
try {
const { nome, email, senha, papel = 'leitor' } = userSchema.parse(req.body);
const hashedPassword = await bcrypt.hash(senha, 10);

connection.query(
'INSERT INTO usuarios (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
[nome, email, hashedPassword, papel],
(err, results) => {
if (err) {
console.error('Erro ao criar usuário:', err);
return res.status(500).json({ error: 'Erro interno do servidor' });
}
res.status(201).json({ id: results.insertId, nome, email, papel });
}
);
} catch (error) {
res.status(400).json({ error: error.message });
}
};

const loginUser = async (req, res) => {
try {
const { email, senha } = loginSchema.parse(req.body);

connection.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
if (err) {
console.error('Erro ao buscar usuário:', err);
return res.status(500).json({ error: 'Erro interno do servidor' });
}

if (results.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });

const user = results[0];
const isMatch = await bcrypt.compare(senha, user.senha);

if (!isMatch) return res.status(401).json({ error: 'Credenciais inválidas' });

const token = jwt.sign({ id: user.id, papel: user.papel }, 'secreta', { expiresIn: '1h' });
res.json({ token });
});
} catch (error) {
res.status(400).json({ error: error.message });
}
};


module.exports = { createUser, loginUser };
