const Category = require('../models/CategoryModel');

class CategoryController {
  async search(req, res) {
    try {
      const { limit = 12, page = 1, fields, use_in_menu } = req.query;
      const options = { where: {} };
      
      if (limit !== '-1') {
        options.limit = parseInt(limit);
        options.offset = (page - 1) * limit;
      }
      
      if (fields) options.attributes = fields.split(',');
      if (use_in_menu) options.where.use_in_menu = use_in_menu === 'true';

      const { count, rows } = await Category.findAndCountAll(options);

      return res.status(200).json({
        data: rows, total: count,
        limit: limit === '-1' ? count : parseInt(limit),
        page: limit === '-1' ? 1 : parseInt(page),
      });

    } catch (error) {
      return res.status(400).json({ error: 'Falha na busca.', details: error.message });
    }
  }

  async getById(req, res) {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
    return res.status(200).json(category);
  }

  async create(req, res) {
    try {
      await Category.create(req.body);
      return res.status(201).send();
    } catch (error) {
      return res.status(400).json({ error: 'Falha ao criar categoria.' });
    }
  }

  async update(req, res) {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
    await category.update(req.body);
    return res.status(204).send();
  }

  async delete(req, res) {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });
    await category.destroy();
    return res.status(204).send();
  }
}

module.exports = new CategoryController();