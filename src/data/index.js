const Sequelize = require('sequelize');
const dbConfig = require('../config/database.js');

const UserModel = require('../models/UserModel.js');
const CategoryModel = require('../models/CategoryModel.js');
const ProductModel = require('../models/ProductModel.js');
const ProductImage = require('../models/ProductImage.js');
const ProductOptions = require('../models/ProductOptions.js');

const models = [UserModel, CategoryModel, ProductModel, ProductImage, ProductOptions];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models.forEach(model => {
      if (typeof model.init === 'function') {
        model.init(this.connection);
      }
    });
    
    models.forEach(model => {
      if (typeof model.associate === 'function') {
        model.associate(this.connection.models);
      }
    });
  }
}

module.exports = new Database();
