//requiring various packages and models needed 
//for the controllers logic to work
const User = require('../models/user');
const Post        = require('../models/forumpost');
const Comment     = require('../models/comment');
const passport = require('passport');
const keys = require('../config/keys.js');
const stripe = require('stripe')(keys.stripeSecretKey);
const util = require('util');
const moment = require('moment');




//exporting all controllers so they can be required by routes.
module.exports = {






  //INTITAL CONTROLLERS
  //GET landing page ... renders landing page view.
  getLanding(req, res, next){
    res.render('landing');
  },

  //GET terms page ... renders terms page view.
  getTerms(req,res,next){
    res.render('terms');
  },

  //GET home page ... renders home page view.
  getHome(req, res, next){
    res.render('index', { title: 'Home Page' });
  },










  //USER CONTROLLERS
  //GET /register ... renders the registration view.
  getRegister(req,res,next){
    res.render('register');
    },

  // POST /register ... sening a POST request to register 
  // a user, storing their details in the database.
    async postRegister(req,res,next){
      //new user object 
      const newUser = new User({
        //trim() ensures if a user mistakenly leaves whitespace
        //it is removed before saving to the database.
            username: req.body.username.trim(), 
            email: req.body.email.trim(),
            password: req.body.password,
            userFirstName: req.body.userFirstName.trim(),
            userLastName: req.body.userLastName.trim(),
            subscription: req.body.subscription,
            userAvatar: req.body.userAvatar.trim(),
            hasPaid: req.body.hasPaid = false
      });

   //creating user variable comprised of their details and password
    let user = await User.register(newUser, req.body.password); 
    
    //passing user variable into login method which includes logic to check
    //if they are a paid or free subscriber. If paid they are directed to the 
    //payment page. If not they are directed to the home page. Flash messages 
    //are used to notify the user they have been successful. 
    req.login(user,(err) =>{
      if(err) {
        req.flash("error", "User already exists with this email!");
        return res.redirect('/register');
        return next (err);
      }else{  
        if(user.subscription === "Paid"){
           res.redirect('/payment');
           req.flash("success", "You are now regsistered " + req.body.username);
           
        }  else{ 
         
      req.flash("success", "You are now regsistered " + req.body.username);
      res.redirect('/');
          
        }
    }
    });
  
  },

  //GET /login ... renders the login view
  getLogin(req,res,next){
    res.render('login');
   },

      //POST /login ... sends a POST request which uses passport js 
      //authenticate method to check a users username and password.
      //Upon success the home page is rendered and a success flash message
      //appears. Upon failure the login page is rendered again and a failure
      //flash message appears.
       postLogin(req,res,next){
       passport.authenticate('local',{ 
       successRedirect: '/',
       failureRedirect: '/login' ,
       failureFlash: "Sorry! Please try again.",
       successFlash: "You are now logged in " + req.body.username + "!"
       })(req,res,next);
 },
      // GET /logout ... provides logout functionality through passport js.
      //When the logout button is pressed the session is terminated and
      //the landing page view is rendered. 
          getLogout (req,res,next){
          req.logout();
          res.redirect('/landing');
  },









   //PAYMENT CONTROLLERS
        //GET payment page .. renders the payment page when
        //registering for a paid account
        async getPayment(req,res,next){
          res.render('payment', {stripePublishableKey: keys.stripePublishableKey});
        },

        //GET denied page ... renders a denied page if the user tries 
        //to skip the payment process.
        getDenied(req,res,next){
          res.render('denied');
          },
          
        //PUT payment ... submits the payment to stripe.js and also
        //sets the hasPaid atrribute to true in the users document.
        //renders a success message.
        async putPayment(req, res, next) {
          const user = await User.findById(req.user._id);
          const amount = 10000
          
          
            await stripe.customers.create({
              email: req.body.stripeEmail,
              source: req.body.stripeToken
            })
            .then(customer => 
              stripe.charges.create({
                amount,
                description: 'Subscription Payment',
                currency: 'GBP',
                customer: customer.id,
              }))
              user.hasPaid = true;
              await user.save();
             
              res.render('success', {
                title: 'Success'
              });
             
        },

  
  

  
  //USER ACCOUNT CONTROLLERS
  //SHOW my details ... renders the current logged in users account 
  //details 
  async showMyDetails(req,res,next){
   let currentUser = await User.findById(req.params.id);
    res.render('account/show', {currentUser, title: "Account"});
   },

  //EDIT my details ... renders the edit account details page with
  //the users details pre populated in the form 
  async editMyDetails(req,res,next){
    let currentUser = await User.findById(req.params.id);
     res.render('account/edit', {currentUser, title: "Edit Account"});
    },
 
   //UPDATE my details ... sends the form off via a post request to 
   //update the currently logged in users details. Also automatically
   //terminates the current session and logs the user in thus creating 
   //a new session and renders the home page with a success flash message.
   async updateMyDetails(req,res,next,err){
     const {
       username,
       email,
       userAvatar,
       userFirstName,
       userLastName,
     } = req.body;
     const {user} = res.locals;
     if(username) user.username = username;
     if(email) user.email = email;
     if(userAvatar) user.userAvatar = userAvatar;
     if(userFirstName) user.userFirstName= userFirstName;
     if(userLastName) user.userLastName = userLastName;

     await user.save();
     const login = util.promisify(req.login.bind(req));
     await login(user);
     req.flash("success", "Profile successfully updated!"); 
     res.redirect('/');
    
    },

 




    //ADMIN CONTROLLERS
    //GET user details ... renders all registered users details.
    //Excludes password.
    async getUserDetails(req, res, next){
      let users = await User.find({});
       res.render('admin/index', {users, title: 'Users'});
    },
 
      //EDIT user details ... renders a populated form of a particular
      //users details based on an associated id.
  async editUserDetails(req,res,next){
    let user = await User.findById(req.params.id);
     res.render('admin/edit', {user, title: "Users Edit"});
    },

   //UPDATE user details ... posts the update form and renders the admin
   //page showing the newly updated user
   async updateUserDetails(req,res,next){
    await User.findByIdAndUpdate(req.params.id, req.body.user);
    req.flash("success", "User details updated!");
    res.redirect('/admin');
  },

   //DESTROY user details ... allows an admin to delete a user.
   async deleteUserDetails(req,res,next){
    await User.findByIdAndRemove(req.params.id);
    req.flash("success", "User deleted!");
    res.redirect('/admin');
  },







//FORUM CONTROLLERS
// GET forum posts ... renders all forum posts
async getForumPosts(req, res, next){
  let posts = await Post.find({});
  res.render('forum/index', {posts, title: 'Forum' });
},

// POST new post ... allows a user or admin to create a new post
// in the forum
async postForumPost(req,res,next){

  const postImage = req.body.postImage;
  const postTitle = req.body.postTitle;
  const postDescription = req.body.postDescription;
  const postAuthor = {
    id: req.user._id,
    username: req.user.username
  }
  const newPost = {postImage, postTitle, postDescription, postAuthor};
  
  Post.create(newPost, function(err,newlyCreated){
    if(err){
      console.log(err);
    }else{
       res.redirect('/forum');
    }
  });
},

// GET forum form ... renders the form for creating a new post
async getPostForm(req, res, next){
  res.render('forum/new', { title: 'Create Post' });
},

//SHOW post info ... renders a page that shows more info about the post
// and the comments 

  showPostInfo(req,res,next){
   Post.findById(req.params.id).populate("comments").exec(function(err,foundPost){
    if(err){
      console.log(err);
    }else{
      res.render('forum/show', {foundPost,moment, title: "Post Info"});
    }
  });
   
  },

  //EDIT post ... renders the form for editing a post
     async editPost(req,res,next){
      let post = await Post.findById(req.params.id);
       res.render('forum/edit', {post, title: "Edit Post"});
      },

      //UPDATE post ... sends off a post request to update the post
   async updatePost(req,res,next){
    await Post.findByIdAndUpdate(req.params.id, req.body.post);
    req.flash("success", "Post updated!");
    res.redirect('/forum');
  },

  //DESTROY post
 //Deletes the forum post and also all comments 
 //associated with the post. Cascade delete is used.
   destroyPost(req,res,next){
    Post.findById(req.params.id, (err,post)=>{
      Comment.remove({
        "_id": {
          $in: post.comments
        }
      }, (err)=>{
        if(err) return next (err);
        post.remove();
       req.flash("success", "Post deleted!");
       res.redirect('/forum');
   });
  });
  },






  //COMMENTS CONTROLLERS
  //GET comment form ... renders a form for creating a new comment
  //on a post
  async showCommentForm(req,res,next){
    let post = await Post.findById(req.params.id);
   res.render('comment/new', {post,title: "Create Comment"});
  },

//POST new comment ... sends a post request to create a new comment.
  postNewComment(req,res,next){
    Post.findById(req.params.id, function(err, post){
      if(err){
        console.log(err);
        res.redirect('/forum');
      }else{
        Comment.create(req.body.comment, function(err, comment){
          if(err){
           console.log(err);
          }else{
            //add username, id and time to comment
            comment.commentAuthor.id = req.user._id;
            comment.commentAuthor.username = req.user.username;
            comment.commentAuthor.commentDate = moment().startOf('day').fromNow();
            //save comment
            comment.save();
             post.comments.push(comment);
             post.save();
             
            

             res.redirect('/forum/' + post._id);
          }
        });
      }
    });
  
  },

        //EDIT comment ... renders a form for editing a comment with
        //the existing the comment populated.
        async editComment(req,res,next){
          let foundComment = await Comment.findById(req.params.comment_id);
          let post         = await Post.findById(req.params.id);
           res.render('comment/edit', {foundComment,post,title: "Edit Comment"});
          },
      
         //UPDATE comment ... sends a post request to update the comment
         async updateComment(req,res,next){
          await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
          req.flash("success", "Comment Updated!");
          res.redirect('/forum/'+ req.params.id);
        },
      
         //DESTROY comment ... deletes a comment from the database.
         async destroyComment(req,res,next){
          await Comment.findByIdAndRemove(req.params.comment_id, req.body.comment);
          req.flash("success", "Comment deleted!");
          res.redirect('/forum/' + req.params.id);
        },






       
        //UPGRADE CONTROLLERS
        //GET upgrade subscription page ... renders a page that allows
        //the user to upgrade their account with a payment
        getUpgrade(req, res, next){
          res.render('upgrade', {stripePublishableKey:
          keys.stripePublishableKey, title: 'Upgrade' });
        },

        //GET unauthorized page ... renders a page that has an 
        //unauthorized message if a user tries to access
        //content they dont have permission to.
        getUnauthorized(req, res, next){
          res.render('unauthorized', { title: 'Unauthorized Content' });
        },

        
        //PUT upgrade ... sends the upgrade payment off to stripe
        // and the subscription field from Free to Paid and the hasPaid
        //value from false to true in the current users document.
        async putUpgrade(req, res, next) {
          const user = await User.findById(req.user._id);
          const amount = 10000
          
          
            await stripe.customers.create({
              email: req.body.stripeEmail,
              source: req.body.stripeToken
            })
            .then(customer => 
              stripe.charges.create({
                amount,
                description: 'Subscription Payment',
                currency: 'GBP',
                customer: customer.id,
              }))
              user.subscription = "Paid"
              user.hasPaid = true;
            
              await user.save();
              res.render('success', {
                title: 'Success'
              });
             
        },

}

 
