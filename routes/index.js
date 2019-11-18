
const express = require('express');
const router = express.Router();


//requiring all the controllers needed for 
//their matching routes. All Logic is abstracted 
//away from routes and resides in controllers.
const {
       getLanding,
       getTerms,
       getRegister,
       postRegister,
       getLogin,
       postLogin,
       getLogout,
       getHome,
       showMyDetails,
       editMyDetails,
       updateMyDetails,
       getUserDetails,
       editUserDetails,
       updateUserDetails,
       deleteUserDetails,
       getForumPosts,
       postForumPost,
       getPostForm,
       showPostInfo,
       showCommentForm,
       postNewComment,
       editPost,
       updatePost,
       destroyPost,
       editComment,
       updateComment,
       destroyComment,
       getPayment,
       getDenied,
       putPayment,
      } = require('../controllers/index');


      //Requiring all middleware that provides validation 
      //and authorization checks on the various routes.
      const { 
       asyncErrorHandler, 
       isLoggedIn,
       isAdmin,
       isPaidSubscriber,
       hasPaid,
       isValidPassword,
       changePassword,
       checkPostOwnership,
       checkCommentOwnership 
      } = require('../middleware');




//All of the HTTP routes required for the application reside here. 

//INITIAL ROUTES
/* GET landing page */
router.get('/landing', getLanding);

/* GET terms */
router.get('/terms', getTerms);

/* GET home page. */
router.get('/', hasPaid,isLoggedIn, getHome);




//USER ROUTES

/* GET /register */
router.get('/register',getRegister);
  
/* POST /register */
router.post('/register',asyncErrorHandler(postRegister));

/* GET /login */
router.get('/login', getLogin);

/* POST/login */
router.post('/login', postLogin);

/*GET /logout */
router.get('/logout', getLogout);



//PAYMENT ROUTES
/* GET /payment */
router.get('/payment', asyncErrorHandler(getPayment));

/* GET /nopayment */
router.get('/denied', getDenied);

/* PUT /payment */
router.put('/charge', asyncErrorHandler(putPayment));



//USER ACCOUNT ROUTES
/* GET /account */
router.get('/account/:id',hasPaid, isLoggedIn, asyncErrorHandler(showMyDetails));

/*EDIT /account/:id/edit */
router.get('/account/:id/edit', isLoggedIn,asyncErrorHandler(editMyDetails),
);

/*UPDATE /account/:id/update */
router.put('/account/:id',
 isLoggedIn,
 asyncErrorHandler(isValidPassword),
 asyncErrorHandler(changePassword),
asyncErrorHandler(updateMyDetails)
);



//ADMIN ROUTES

/* GET /users */
router.get('/admin',isLoggedIn,isAdmin,asyncErrorHandler(getUserDetails));

/*EDIT /users/:id/edit */
router.get('/admin/:id/edit',isLoggedIn,isAdmin,asyncErrorHandler(editUserDetails));

/*UPDATE /users/:id/update */
router.put('/admin/:id',isLoggedIn,isAdmin,asyncErrorHandler(updateUserDetails));

/* DESTROY /users/:id */
router.delete('/admin/:id',isLoggedIn,isAdmin,asyncErrorHandler(deleteUserDetails));




//FORUM ROUTES
/* GET /forum */
router.get('/forum', isLoggedIn, hasPaid,isPaidSubscriber,asyncErrorHandler(getForumPosts));

/* CREATE /forum */
router.post('/forum',isLoggedIn, hasPaid,isPaidSubscriber, asyncErrorHandler(postForumPost));

/* GET /forum/new */
router.get('/forum/new', isLoggedIn, hasPaid, isPaidSubscriber,asyncErrorHandler(getPostForm));

/* SHOW /forum/:id */
router.get('/forum/:id', isLoggedIn, hasPaid, isPaidSubscriber, showPostInfo);

/*EDIT /forum/:id/edit */
router.get('/forum/:id/edit', isLoggedIn,hasPaid,isPaidSubscriber,checkPostOwnership,asyncErrorHandler(editPost));

/*UPDATE /forum/:id */
router.put('/forum/:id', isLoggedIn, hasPaid,isPaidSubscriber,checkPostOwnership, asyncErrorHandler(updatePost));

/* DESTROY /forum/:id */
router.delete('/forum/:id', isLoggedIn, hasPaid, isPaidSubscriber, checkPostOwnership, destroyPost);







//COMMENTS ROUTES
/* GET /forum/:id/comments/new */
router.get('/forum/:id/comments/new', isLoggedIn, hasPaid, isPaidSubscriber, asyncErrorHandler(showCommentForm));

/* CREATE /forum/:id/comments */
router.post('/forum/:id/comments',isLoggedIn, hasPaid,isPaidSubscriber, postNewComment); 

/* EDIT /forum/:id/comments/:comment_id/edit */
router.get('/forum/:id/comments/:comment_id/edit', isLoggedIn, hasPaid, isPaidSubscriber, checkCommentOwnership,asyncErrorHandler(editComment));

/*UPDATE /forum/:id/comments/:comment_id */
router.put('/forum/:id/comments/:comment_id', isLoggedIn, hasPaid,isPaidSubscriber,checkCommentOwnership, asyncErrorHandler(updateComment));

/* DESTROY /forum/:id/comments/:comment_id */
router.delete('/forum/:id/comments/:comment_id', isLoggedIn, hasPaid, isPaidSubscriber,checkCommentOwnership,  asyncErrorHandler(destroyComment));


module.exports = router;
