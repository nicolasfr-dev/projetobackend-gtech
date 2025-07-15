const { Router } = require('express');
const productController = require('../controllers/ProductController.js');
const authMiddleware = require('../middleware/auth.js');

const router = Router();

router.get('/search', productController.search);
router.get('/:id', productController.getById);
router.post('/', authMiddleware, productController.create);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.delete);

module.exports = router;
