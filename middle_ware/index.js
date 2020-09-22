var Campground = require("../models/campground"),
	Comment = require("../models/comment");

var midwareObj = {}

midwareObj.checkOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCG){
			if (err || !foundCG) {
				req.flash("error", "Campground not found!");
				res.redirect("back");
			} else {
				if (foundCG.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be loggedin to do that!");
		res.redirect("back");
	}
}

midwareObj.checkCmtOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundCT){
			if (err || !foundCT) {
				req.flash("error", "Comment not found!");
				res.redirect("back");
			} else {
				if (foundCT.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be loggedin to do that!");
		res.redirect("back");
	}
}


midwareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "You need to be loggedin to do that!");
    res.redirect("/login");
}

module.exports = midwareObj;