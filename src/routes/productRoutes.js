const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
