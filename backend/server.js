const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();
const cors = require('cors')

// const proxy = require('http-proxy-middleware')


app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());


// add mongodb
const mongoose = require('mongoose');
let Workout = require('./workout.model');
const PORT = process.env.PORT || 4000;

// compress all routes
app.use(compression());

const path = require('path');
app.use(express.static(path.join(__dirname, '../build')));

// app.use(express.static('../build/'));
// app.get("*", (req,res)=> {
// 	res.sendFile('index.html', {root: '../build/'});
// });

// setup and get the default mongoose connection
const mongoDB = process.env.MONGODB_URI || process.env.DEV_DB_CONNECTION;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})



//****************************************************** setup api endpoints *************************************************************************
const routes = express.Router();


// endpoint to deliver all available workout items
// get workouts when result is available using find method
routes.route('/').get((req,res) => {
	Workout.find((err, workouts) => {
		if (err) {
			console.log(err);
		} else {
			res.json(workouts);
		}
	});
});

// endpoint to retrieve workout item
routes.route('/:id').get((req, res) => {
	let id = req.params.id;
	Workout.findById(id, (err, workout) => {
		res.json(workout);
	});
});

// Post endpoint route
routes.route('/add').post((req, res) => {
	let workout = new Workout(req.body);
	workout.save(workout)
		.then(workout => {
			res.status(200).json({'workout': 'workout added successfully'});
		})
		.catch(err => {
			res.status(400).send('adding new workout failed');
		});
});

// delete workout
routes.route('/delete/:id').delete((req, res, next) => {
	Workout.findByIdAndRemove(req.params.id, (err, workout) => {
		if (err) {
			return next(err);
		} else {
			res.status(200).json({
				msg: workout
			})
		}
	})
})

// update endpoint route
routes.route('/update/:id').post((req, res) => {
	Workout.findById(req.params.id, (err, workout) => {
		if (!workout) {
			res.status(404).send('data is not found');
		} else {
			workout.workout_title = req.body.workout_title;
			workout.workout_tags = req.body.workout_tags;
			workout.workout_description = req.body.workout_description;
			workout.workout_responsible = req.body.workout_responsible;
			workout.workout_difficulty = req.body.workout_difficulty;
			workout.workout_times_completed = req.body.workout_times_completed;
			workout.workout_completed_date = req.body.workout_completed_date;

			workout.save().then(workout => {
				res.json('Workout updated!');
			})
			.catch(err => {
				res.status(400).send('Update not possible');
			});
		}
	})
})

app.use('/workouts', routes);
app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// set up a route to redirect http to https
app.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);

    // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
    // res.redirect('https://example.com' + req.url);
})


app.listen(PORT, function() {
    console.log(`Server is running on Port: ${PORT}`);
});