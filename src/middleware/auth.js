const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('Nenhum token fornecido.');
    return res.status(401).json({ error: 'Token de autorização não fornecido.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    console.log('Token com formato inválido.');
    return res.status(401).json({ error: 'Token inválido.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    console.log('Token mal formatado.');
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verificado. UserID:', decoded.id);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    console.log('Erro ao verificar token:', err.message);
    console.log('Token recebido:', token);
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};