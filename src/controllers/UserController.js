const User = require('../models/UserModel.js');

class UserController {
  async list(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'nome', 'sobrenome', 'email']
      });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao listar usuários.' });
    }
  }

  async getById(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'nome', 'sobrenome', 'email']
      });

      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao buscar usuário.' });
    }
  }

  async create(req, res) {
    const { nome, sobrenome, email, senha, confirmacaoSenha } = req.body;

    if (senha !== confirmacaoSenha)
      return res.status(400).json({ error: 'As senhas não conferem.' });

    if (await User.findOne({ where: { email } }))
      return res.status(400).json({ error: 'Este email já está em uso.' });

    try {
      await User.create({ nome, sobrenome, email, senha });
      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao criar usuário.', details: error.message });
    }
  }

  async update(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      const { nome, sobrenome, email } = req.body;
      await user.update({ nome, sobrenome, email });

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