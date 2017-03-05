// Initialize Firebase
var config = {
	apiKey: "AIzaSyCzjeRcu0xE8tXHP5Khfk5HAwh87x21A3A",
	authDomain: "trainschedule-b9839.firebaseapp.com",
	databaseURL: "https://trainschedule-b9839.firebaseio.com",
	storageBucket: "trainschedule-b9839.appspot.com",
	messagingSenderId: "294700576184"
};

firebase.initializeApp(config);

var dataRef = firebase.database();

// Intial values
var trainName = "";
var trainDestination = "";
var firstTrainTime = "";
var trainFrequency = 0;

dataRef.ref().on("child_added", function(childSnapshot) {

    var nextArrival;
    var minuteAway;

    $("tbody").append("<tr><td>"
     + childSnapshot.val().trainName + "</td><td>" 
     + childSnapshot.val().trainDestination + "</td><td>" 
     + childSnapshot.val().trainFrequency + "</td><td>" 
     + nextArrival + "</td><td>" 
     + minuteAway + "</td></tr>");

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

//On submit
$("#submit").on("click", function(event){
	event.preventDefault();

	//Get user inputs
	trainName = $("#train-name").val().trim();
	trainDestination = $("#train-destination").val().trim();
	firstTrainTime = $("#first-train-time").val().trim();
	trainFrequency = parseInt($("#train-frequency").val().trim());

	//Push to the database
	dataRef.ref().push({
		trainName: trainName,
		trainDestination: trainDestination,
		firstTrainTime: firstTrainTime,
		trainFrequency: trainFrequency
	});

});