const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebTOKEN')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route Post /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if(!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if(!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized'})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if(!match) return res.status(401).json({ message: 'Unauthorized'})

    const accessTOKEN = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m'}
    )
    const refreshTOKEN = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'}
    )

    //create secure cookie with refresh TOKEN
    res.cookie('jwt', refreshTOKEN, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: 'None', //corss-site cookie
        maxAge: 7 * 24 * 60 * 50 * 1000 //cookie expiry: set to match rT
    })

    res.json({ accessTOKEN })

    
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access TOKEN has expired
const refresh = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized'})

    const refreshTOKEN = cookies.jwt

    jwt.verify(
        refreshTOKEN,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            
            const foundUser = await User.findOne( { username: decoded.username })
            if(!foundUser) return res.status(401).json({ message: 'Unauthorized'})

                const accessTOKEN = jwt.sign(
                    {
                        "UserInfo": {
                            "username": foundUser.username,
                            "roles": foundUser.roles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '1m'}
                )
                res.json( { accessTOKEN })
        })
    )
}

// @desc Logout
// @route Post /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies
    console.log(cookies)
    if(!cookies?.jwt) {
        console.log('no cookies')
        return res.sendStatus(204) //No content
    }
    const options = {
        httpOnly: true,
        sameSite: 'None',
        secure: process.env.NODE_ENV === 'production', // Use 'secure' in production
    };
    res.clearCookie('jwt', options)
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
}