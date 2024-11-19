const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


// @Get all users
// @route GET /users
// @access private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json( {message: 'No users found'} );
    }
    res.json(users);
}) 

// @desc Create new user
// @route POST /users
// @access private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;
    // Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json( { message: 'All fields are required' });
    }
    //check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec();
    
    if(duplicate){
        return res.status(409).json({ message: 'Duplicate username '});
    }
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = {username, "password": hashedPwd, roles};
    
    //create and store new user
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({message: `New user ${username} created`});
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
}) 
// @desc update a user
// @route Pathc /users
// @access private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, password, roles, active } = req.body;
    // Confirm data
    if(!id || !username ||  !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json( { message: 'All fields are required' });
    }
    //check for duplicate
    
    const user = await User.findOne({ _id : id }).exec();
    
    if(!user){
        return res.status(409).json({ message: 'Uesr not found'});
    }
    
    const duplicate = await User.findOne({ username }).lean().exec()
    //allow updates to the original user
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json( { message: 'Duplcate username' } );
    }
    
    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password){
        user.password = await bcrypt.hash(password, 10);
    }
    
    const updateUser = await user.save();

    res.json ( {message: `${updateUser.username} updated`});
}) 
// @desc Delete a user
// @route DELETE /users
// @access private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if(!id){
        return res.status(400).json({ message: 'user ID required'});
    }

    const notes = await Note.findOne({ user: id }).lean().exec();
    if(notes?.length) {
        return res.status(400).json({ message: 'User has assigned ntoes'});
    }

    const user = await User.findById(id).exec();

    if(!user){
        return res.status(400).json({message: 'User not found'});
    }

    const result = await user.deleteOne();

    const reply = `Username ${result.username} with ID ${result._id} deleted`;

    res.json(reply);
}) 

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}