const User = require('../models/User');

class UserController {
  async getById(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'nome', 'sobrenome', 'email']
      });

      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      
      const response = { id: user.id, firstname: user.nome, surname: user.sobrenome, email: user.email };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao buscar usuário.' });
    }
  }

  async create(req, res) {
    const { email, password, confirmPassword, firstname, surname } = req.body;
    
    if (password !== confirmPassword) return res.status(400).json({ error: 'As senhas não conferem.' });
    if (await User.findOne({ where: { email } })) return res.status(400).json({ error: 'Este email já está em uso.' });
    
    try {
      await User.create({ email, senha: password, nome: firstname, sobrenome: surname });
      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao criar usuário.', details: error.message });
    }
  }

  async update(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      
      const { firstname, surname, email } = req.body;
      await user.update({ nome: firstname, sobrenome: surname, email });

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao atualizar usuário.' });
    }
  }

  async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
      
      await user.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao deletar usuário.' });
    }
  }
}

module.exports = new UserController();
