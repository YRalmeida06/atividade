const express = require('express');
const { createUser, loginUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/usuarios/registro', createUser);
router.post('/usuarios/login', loginUser);


module.exports = router;
