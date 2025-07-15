const { Router } = require('express');
const categoryController = require('../controllers/CategoryController.js');
const authMiddleware = require('../middleware/auth.js');

const router = Router();

router.get('/search', categoryController.search);
router.get('/:id', categoryController.getById);
router.post('/', authMiddleware, categoryController.create);
router.put('/:id', authMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, categoryController.delete);

module.exports = router;
