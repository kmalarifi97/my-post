const mongoose = require('mongoose')
const Schema =mongoose.Schema;



const commentSchema = new  mongoose.Schema({
    
      comment: {
        type: String,
        required: true
      },
     
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item',
        required: true
      }
     
    }, {
      timestamps: true
    })


    // router.post('/comment', requireToken, (req, res, next) => {
    //   // set owner of new item to be current user
    //   req.body.comment.owner = req.user.id
    
    //   comment.create(req.body.comment)
    //     // respond to succesful `create` with status 201 and JSON of new "item"
    //     .then(comment => {
    //       res.status(201).json({ comment: comment.toObject() })
    //     })
    //     // if an error occurs, pass it off to our error handler
    //     // the error handler needs the error message and the `res` object so that it
    //     // can send an error message back to the client
    //     .catch(next)
    // })
    
    module.exports = mongoose.model('comment', commentSchema)
    

