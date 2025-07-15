const { Model, DataTypes } = require('sequelize');

class ProductOptions extends Model {
  static init(sequelize) {
    super.init({
      titulo: { type: DataTypes.STRING, allowNull: false },
      shape: { type: DataTypes.ENUM('quadrado', 'circulo'), defaultValue: 'quadrado' },
      radius: { type: DataTypes.STRING, defaultValue: '0' },
      type: { type: DataTypes.ENUM('texto', 'cor'), defaultValue: 'texto' },
      valores_do_produto: { type: DataTypes.JSON, allowNull: false },
    }, {
      sequelize,
      tableName: 'opcoes_produtos',
    });
  }

  static associate(models) {
    this.belongsTo(models.ProductModel, { foreignKey: 'product_id', as: 'product' });
  }
}

module.exports = ProductOptions;