require('dotenv').config();
require('./data');

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const cors = require('cors');

const userRoutes = require('./routes/UserRoutes.js');
const categoryRoutes = require('./routes/CategoryRoutes.js');
const productRoutes = require('./routes/ProductRoutes.js');

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    this.docs(); // ✅ Agora a documentação Swagger será ativada
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(express.json({ limit: '50mb' }));
  }

  routes() {
    this.server.use('/user', userRoutes);
    this.server.use('/category', categoryRoutes);
    this.server.use('/product', productRoutes);
  }

  docs() {
    this.server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
}

module.exports = new App().server;
