// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for items
const item = require('../models/item')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { item: { title: '', text: 'foo' } } -> { item: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second a rgument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /items
router.get('/items', (req, res, next) => {
  
  // Option 1 get user's items
  item.find({}).populate('comments')
    .then(items => res.status(200).json({items: items}))
    .catch(next)
  
  // // Option 2 get user's items
  // // must import User model and User model must have virtual for items
  // User.findById(req.user.id) 
    // .populate('items')
    // .then(user => res.status(200).json({ items: user.items }))
    // .catch(next)
})
//==============================================================================================================
// router.get('/userItems', (req, res, next) => {
  
//   // Option 1 get user's items
//   item.find({}).populate('comments')
//     .then(items => res.status(200).json({items: items}))
//     .catch(next)
  
//   // // Option 2 get user's items
//   // // must import User model and User model must have virtual for items
//   // User.findById(req.user.id) 
//     // .populate('items')
//     // .then(user => res.status(200).json({ items: user.items }))
//     // .catch(next)
// })

// SHOW
// GET /items/5a7db6c74d55bc51bdf39793
router.get('/items/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  item.findById(req.params.id).populate('comments')
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "item" JSON
    .then(item => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, item)
    
      res.status(200).json({ item: item.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /items
router.post('/items', requireToken, (req, res, next) => {
  // set owner of new item to be current user
  req.body.item.owner = req.user.id

  item.create(req.body.item)
    // respond to succesful `create` with status 201 and JSON of new "item"
    .then(item => {
      res.status(201).json({ item: item })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /items/5a7db6c74d55bc51bdf39793
router.patch('/items/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.item.owner

  item.findById(req.params.id)
    .then(handle404)
    .then(item => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, item)

      // pass the result of Mongoose's `.update` to the next `.then`
      return item.update(req.body.item)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.status(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /items/5a7db6c74d55bc51bdf39793
router.delete('/items/:id', requireToken,(req, res, next) => {
   
  item.findById(req.params.id)
    .then(handle404)
    .then(item => {
      
      // throw an error if current user doesn't own `item`
      requireOwnership(req, item)
      // delete the item ONLY IF the above didn't throw
      item.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.get('/khalid', requireToken, (req, res, next) => {
  res.json({'khalooodi': req.user});
  next();
})

module.exports = router
