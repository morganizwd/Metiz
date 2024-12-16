const express = require('express');
const MetizController = require('../controllers/metizController');
const authenticateToken = require('../middleware/authenticateToken');
const OrderController = require('../controllers/orderController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/metiz');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + file.originalname;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/orders', authenticateToken, OrderController.getMetizOrders);
router.post('/registration', upload.single('photo'), MetizController.registration);
router.post('/login', MetizController.login);
router.get('/auth', authenticateToken, MetizController.auth);
router.get('/', MetizController.findAll);
router.get('/:id', MetizController.findOne);
router.put('/:id', authenticateToken, upload.single('photo'), MetizController.update);
router.delete('/:id', authenticateToken, MetizController.delete);

module.exports = router;