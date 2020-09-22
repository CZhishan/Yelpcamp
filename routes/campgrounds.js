var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"), 
	midware = require("../middle_ware");

// Index
router.get("/", function(req, res){
    // Get all campgrounds from DB
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({"name": regex}, function(err, foundCG) {
        	if(err) {
                console.log(err);
            } else {
				if (foundCG.length < 1) {
					return res.render("campgrounds/index",{campgrounds: foundCG, "error": "No campgrounds match, please try again!"});
				} else {
					res.render("campgrounds/index",{campgrounds: foundCG});
				}
               
            }
		});
	} else {		
		Campground.find({}, function(err, allCampgrounds){
		   if(err){
			   console.log(err);
		   } else {
			  res.render("campgrounds/index",{campgrounds:allCampgrounds});
		   }
		});
	}
});

// Create
router.post("/", midware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampgrd = {name: name, image: image, price: price, description: desc, author: author};
    // Create a new campground and save to DB
    Campground.create(newCampgrd, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// New
router.get("/new", midware.isLoggedIn, function(req, res){	
	res.render("campgrounds/new");
});


// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
			req.flash("error", "Campground not found!");
            console.log(err);
			res.redirect("back");
        } else {
            //console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// Edit campground
router.get("/:id/edit", midware.checkOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCG){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/edit", {campground: foundCG});
		}
	});
	
});

// Update campground route
router.put("/:id", midware.checkOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, foundCG){
		if (err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// Destroy campground route
router.delete("/:id", midware.checkOwnership, async(req, res) => {
  try {
    let foundCampground = await Campground.findById(req.params.id);
    await foundCampground.remove();
    res.redirect("/campgrounds");
  } catch (error) {
    console.log(error.message);
    res.redirect("/campgrounds");
  }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;