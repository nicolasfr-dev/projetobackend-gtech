const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class UserModel extends Model {
  static init(sequelize) {
    super.init({
      nome: { type: DataTypes.STRING, allowNull: false },
      sobrenome: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      senha: { type: DataTypes.STRING, allowNull: false },
    }, {
      sequelize,
      tableName: 'usuarios',
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('senha')) {
            user.senha = await bcrypt.hash(user.senha, 10);
          }
        },
      },
    });
  }
}

module.exports = UserModel;
