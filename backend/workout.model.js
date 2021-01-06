const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Workout  = new Schema({
    workout_title: {
        type: String
    },
    workout_tags: {
        type: [String]
    },
    workout_description: {
        type: [String]
    },
    workout_responsible: {
    	type: String
    },
    workout_difficulty: {
    	type: String
    },
    workout_times_completed: {
    	type: Number
    },
    workout_completed_date: {
    	type: Date, default: (new Date()).toLocaleDateString("en", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
});

module.exports = mongoose.model('Workout', Workout);