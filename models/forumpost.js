//forumpost model. Provides a structure for how a forum postt document
//should be structured in the forumposts collection in the database.
const mongoose = require('mongoose');
const Comment = require('./comment');


const forumPostSchema = new mongoose.Schema({
  postImage: String,
  postTitle: String,
  postDescription: String,
  postAuthor: {
    id:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  

});

// forumPostSchema.pre('remove', async (next)=> {
//   await Comment.remove(
//     {"_id": {	$in: this.comments}}).exec();
//   next();
// });


module.exports = mongoose.model( 'ForumPost', forumPostSchema);