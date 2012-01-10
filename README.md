MongooseJS models for NowJS clients
--------------------------------------

To enable:

<pre><code>
var now_mongoose = require('now-mongoose');
</code></pre>
 
To activate, when you're ready:
-------------------------------

<code>
everyone.now.MODEL_NAME = now_mongoose.model( MODEL_CLASS );
</code>

Parameters are:

* the MongooseJS model class you created using the mongoose.model() api

For example, let's say you have a mongoose model named Adventure which you want to expose to connected clients via a real-time API:

SERVER SIDE
<pre><code>
// connect to db
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/usefuldb');

// create server
var express = require('express');
var mongoose = require('mongoose');

var nowjs = require('now');
var everyone = nowjs.initialize(app);

var now_mongoose = require('now-mongoose');

var AdventureSchema = new mongoose.Schema({
		title: { type: String, required: true },
		description: { type: String, required: true },
		rsvps: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
	});

AdventureSchema.statics.rsvp = function(adventure_id, user_id, callback){
	this.findById( adventure_id, function(err,adventure){
		adventure.rsvps.push(user_id);
		adventure.save(function(err){
			callback(err,adventure);
		});
	});	
};

var Adventure = mongoose.model( 'Adventure', AdventureSchema );

everyone.now.Adventures = now_mongoose.model( Adventure )
</code></pre>

Now on the CLIENT SIDE, you can do this:
<pre><code>
now.Adventure.search(function(err,adventures){ console.log(adventures) });
> Retrieves all Adventures in the DB and returns them to the callback

now.Adventure.search( {title: 'International Skeeball'}, function(err,adventures){ console.log( adventures ); });
> Retrieves Adventures with the title 'International Skeeball' and returns them to the callback

now.Adventure.save(	{ 	title: 'Irish Coffee Marathon', 
						description: 'Beats the hell outta actually running'
					}, function(err,adventure){
							console.log( adventure )
						}
					);
> Creates a new Adventure with the given title and description and returns it to the callback

now.Adventure.save(	{ 	_id: '4efadce3223444adf',
						title: 'Irish Coffee Marathon of Doom'
					}, function(err,adventure){
							console.log( adventure )
						}
					);
> Updates the given Adventure with the parameters you pass, in this case an updated title

now.Adventure.get( '43edaff3243242a334423', 
					function(err, adventure){
						console.log( adventure ) 
					}
				);
> Retrieves the Adventure with the given id and returns it to the callback
</pre></code>

In addition, now-mongoose also exposes all static methods defined on your Mongoose model to the NowJS client, so using the example above, calling:
<pre><code>
var adventure_id = '43ee432429898432iadfsdf';
var user_id = '33334524543523242ff';
now.Adventure.rsvp( adventure_id, user_id, function( err, adventure ) );
</pre></code>
would work and return you the updated adventure after the new rsvp was saved for the given user id.

NOTE: Model instance level methods are more tricky and I haven't figured out how to proxy those yet, any suggestions welcome!