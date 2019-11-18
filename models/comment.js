//comment moddel. provides a structure for how a comment document
//should be set up in the comment collection in the database. 
const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
   commentDate:{
      type:Date , default:Date.now
   },
   commentText: String,
   commentAuthor: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
     
   }
   


});

module.exports = mongoose.model("Comment", commentSchema);