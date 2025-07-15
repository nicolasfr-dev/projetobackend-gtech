const { Model, DataTypes } = require('sequelize');

class CategoryModel extends Model {
  static init(sequelize) {
    super.init({
      nome: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      use_in_menu: { type: DataTypes.BOOLEAN, defaultValue: false },
    }, {
      sequelize,
      tableName: 'categorias',
    });
  }

  static associate(models) {
    this.belongsToMany(models.ProductModel, { foreignKey: 'category_id', through: 'produtos_categorias', as: 'products' });
  }
}

module.exports = CategoryModel;
