const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  async generateToken(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }
    
    if (!(await bcrypt.compare(password, user.senha))) {
      return res.status(400).json({ error: 'Credenciais inválidas.' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    
    return res.status(200).json({ token });
  }
}

module.exports = new AuthController();
