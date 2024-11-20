const express = require('express')
const router = express.Router()
const authContorller = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')


router.route('/')
    .post(loginLimiter, authContorller.login)


router.route('/refresh')
    .get(authContorller.refresh)

router.route('/logout')
    .post(authContorller.logout)

module.exports = router
