//Requiring models to be used in middleware
const User = require('../models/user');
const Post = require('../models/forumpost');
const Comment = require('../models/comment');


module.exports = {
    //async error handler. All controllers which use async/await are passed 
    //through this error handler that catches any errors should an asynchronous call back fail.
    asyncErrorHandler: (fn) =>
        (req,res,next) =>{
            Promise.resolve(fn(req,res,next))
            .catch(next);
        },

        //ensures that the user is logged in before a session is created 
        //if they aren't logged in and they try and access a route
        // an error message appears.
        isLoggedIn: (req,res,next)=>{
            if(req.isAuthenticated()){
                return next();
            }
            req.flash("error", "Please Login First!");
            res.redirect("/login");
        },

        //checks that the current logged in user is an admin based on a booolean 
        //value stored in the users collection. Ensures that 
        //someone who isnt an admin cannot access routes that they
        //dont have permission to access.
        isAdmin: async (req,res,next)=>{
            if(req.isAuthenticated() && req.user.isAdmin){
                return next();
            }
                res.redirect('unauthorized');
            },

        //checks that the current logged in user is a paid subscriber. 
        //If they are they can access routes such as the forum or player 
        //profiles. If they aren't the upgrade page with a payment 
        //gateway will be rendered in the view.
        
        isPaidSubscriber: async (req,res,next)=>{
        if(req.isAuthenticated() && req.user.hasPaid === true || req.user.isAdmin){
          return next();
        }
         res.redirect('upgrade');
        
        },

        //checks that the user has paid. 
        //It ensures that the user cannot bypass the payment process.
        //A boolean attribute is automatically set to false when the 
        //registration form is submitted. The payment controller then
        //sets the value to true once the payment has been processed.
        //A denied page is rendered if the user tries to skip the payment.
        hasPaid: async (req,res,next) =>{
            if((req.isAuthenticated()  
            && req.user.hasPaid === true) || (req.isAuthenticated() 
            && req.user.hasPaid === false)
             || (req.isAuthenticated() && req.user.isAdmin)){
                return next();
            }
            res.redirect("denied");
        },

        //used exclusively in the user account update route
        //checks that the password being entered by the user
        // when updating their details is correct. It provides 
        // an extra level of security when a user
        //tries to update their details.
        isValidPassword: async (req,res,next)=>{
            const {user} = await User.authenticate()(req.user.username, req.body.currentPassword);
            if(user){
                // add user to res.locals
                res.locals.user = user;
                next();
            }else{
                req.flash("error","Incorrect Password!");
                return res.redirect('/');
            }
        },

            //used exclusively in the user account update route
            //takes the new password and confirmation password 
            //from the body and first checks that both have been entered
            //if not an error is displayed. if both are present it 
            //sets the password to the new password. It also checks that 
            //the new and confirmation passwords match otherwise an 
            //error message appears.
            changePassword: async (req,res,next)=>{
             const {
                 newPassword,
                 confirmationPassword
             } = req.body;

             if(newPassword && !confirmationPassword){
                 req.flash("error", "Missing password confirmation!");
                 return res.redirect('/');
             }
             else if(newPassword && confirmationPassword){
                 const {user} = res.locals;
                 if(newPassword === confirmationPassword){
                     await user.setPassword(newPassword);
                     next();
                 }else{
                     req.flash("error",'New passwords must match!');
                     return res.redirect('/');
                 }
             }else{
                 next();
             }
            },

            //used in the forum routes. It checks if any of the forum posts
            //belong to the current logged in user. If a post does belong to 
            // the current logged in user they can edit and delete it. If not 
            //they are redirected back to the previous page. Also allows 
            //admin permission to edit/delete any post.
            checkPostOwnership: async (req,res,next)=>{
            let foundPost = await Post.findById(req.params.id);
                if((req.isAuthenticated() && foundPost.postAuthor.id.equals(req.user._id)
                || (req.isAuthenticated( )&& req.user.isAdmin))){
                next();
            }else{
                res.redirect('back');
            }
            },

            //used in the forum routes. It checks if any of the comments 
            //in a post belong to the current logged in user. If a comment 
            //does belong to the current logged in user they can edit/delete
            //the comment. If not they are redirected back to the previous page.
            //also allows admin to edit/delete any comment in any post. 
            checkCommentOwnership: async (req,res,next)=>{
                let foundComment = await Comment.findById(req.params.comment_id);
                if((req.isAuthenticated() && foundComment.commentAuthor.id.equals(req.user._id)
                || (req.isAuthenticated( )&& req.user.isAdmin))){
                next();
            }else{
                res.redirect('back');
            }
            },
        

        
        

        

};


