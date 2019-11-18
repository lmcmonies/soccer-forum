//user model. Provides a structure for how a user document
//should be structured in the users collection in the database.
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new mongoose.Schema({
    hasPaid: {type:Boolean, default:false},
    isAdmin: {type: Boolean, default: false},
    userAvatar: String,
    userFirstName: String,
    userLastName: String,
    email: String

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);