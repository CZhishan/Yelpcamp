var express = require("express"),
	router = express.Router({mergeParams: true}),
	Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	midware = require("../middle_ware");

// new comment
router.get("/new", midware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

// create new comment
router.post("/", midware.isLoggedIn, function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
			   req.flash("error", "Something went wrong");
               console.log(err);
           } else {
			   // add user infomation
			   comment.author.id = req.user._id;
			   comment.author.username = req.user.username;
			   // save comment
			   comment.save();
               campground.comments.push(comment);
               campground.save();
			   req.flash("success", "Successfully added your comment");
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

// Edit comment
router.get("/:comment_id/edit", midware.checkCmtOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCG){
		if (err || !foundCG) {
			req.flash("error", "Campground not found!");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundCT){
			if (err) {
				res.redirect("back");
			} else {
				res.render("comments/edit", {cg_id: req.params.id, comment: foundCT});
			}
		});
	});

});

// Update comment
router.put("/:comment_id", midware.checkCmtOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedCT) {
		if (err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// Destroy comment
router.delete("/:comment_id", midware.checkCmtOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err, foundCT){
		if (err) {
			res.redirect("back");
		} else {
			Campground.findByIdAndUpdate(req.params.id, {
				$pull: {comments: req.params.comment_id}
			}, function(err, foundCG){
				if (err){
					res.redirect("back");
				} else {
					req.flash("success", "Comment deleted");
					res.redirect("/campgrounds/" + req.params.id);
				}
			})
			
		}
	});
});

module.exports = router;