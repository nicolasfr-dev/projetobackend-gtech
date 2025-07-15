const { Router } = require('express');
const userController = require('../controllers/UserController.js');
const authController = require('../controllers/AuthController.js');
const authMiddleware = require('../middleware/auth.js');

const router = Router();
router.get('/', userController.list);
router.post('/token', authController.generateToken);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

module.exports = router;
