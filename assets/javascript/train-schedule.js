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
var numRecords = 0;

//Function to display current date, day and time.
function displayTime(){
	var day = moment().format("dddd, MMMM Do");
	var time = moment().format("hh:mm:ss");
	var period = moment().format("A");
	$(".current-time").html("<span class='day'>" 
		+ day + "</span><br><span class='time'>" 
		+ time + "</span><span> " 
		+ period + "</span>");
}

// Firebase watcher + initial loader.
dataRef.ref().on("child_added", function(childSnapshot) {

	//Retriving records from database and assingning to variables
	var trainNameDB = childSnapshot.val().trainName;
    var trainDestinationDB = childSnapshot.val().trainDestination;
	var startTimeDB = childSnapshot.val().firstTrainTime;	
	var frequencyDB = childSnapshot.val().trainFrequency;
	var nextTrainArrival = "";
	var nextTrainInMinute = 0;

	var startTimeConverted = moment(startTimeDB,"HH:mm");
    var differenceBetweenTime = moment().diff(startTimeConverted, "minutes");

    var remainderTime = parseInt(differenceBetweenTime) % parseInt(frequencyDB);
    var remainderTimeDuration = moment.duration("00:"+remainderTime+":00");
    var frequencyDuration = moment.duration("00:"+parseInt(frequencyDB)+":00");

    var lastArrival = moment().subtract(remainderTimeDuration);
    var nextArrival = moment(lastArrival).add(frequencyDuration);

    var minutes = moment(nextArrival).diff(moment(), "minutes");
    var minuteAway = moment(minutes, "mm");

    nextTrainArrival = nextArrival.format("hh:mm A");
    nextTrainInMinute = minuteAway.format("mm");

    if(parseInt(startTimeConverted.format("HH"))>parseInt(moment().format("HH"))){

    	var minutes = Math.abs(differenceBetweenTime);
    	nextTrainInMinute = minutes;

    	console.log(minuteAway);
    	console.log("------------------------");

    }

    console.log("Currentime : "+ moment().format("HH:mm")+" | Startime : "+startTimeConverted.format("HH:mm"));
    console.log("Difference : "+differenceBetweenTime+" minutes"+" | Remainder : "+remainderTime+" minutes");    
    console.log("Last arrival : "+lastArrival.format("HH:mm")+ " | Next arrival : "+nextArrival.format("HH:mm")+" | Minutes Away : "+minuteAway.format("HH:mm"));
    console.log("...............................................");


    $("tbody").append("<tr><td class='camel-case'>"
     + trainNameDB + "</td><td class='camel-case'>" 
     + trainDestinationDB + "</td><td>" 
     + frequencyDB + "</td><td>" 
     + nextTrainArrival + "</td><td>" 
     + nextTrainInMinute + "</td></tr>");

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Realtime input field validation.
$("input").on("input",function(){
	var is_value = $(this).val();
	if(is_value){
		$(this).next().hide();
	}else{
		$(this).next().show().text("This field is required");
	}
});

// Reatime time input validaton.
$("#first-train-time").on("input",function(){
	var is_time = $(this).val();
	var valid = moment(is_time, "HH:mm", true).isValid();
	if(!valid)
		$(this).next().show().text("Enter time valid format");

});

//On submiting the form.
$("#submit").on("click", function(event){
	event.preventDefault();

	//Get user inputs.
	trainName = $("#train-name").val().trim();
	trainDestination = $("#train-destination").val().trim();
	firstTrainTime = $("#first-train-time").val().trim();
	trainFrequency = parseInt($("#train-frequency").val().trim());

	// All input all fied Push entries to the database.
	if(trainName && trainDestination && firstTrainTime && trainFrequency){
		
		dataRef.ref().push({
			trainName: trainName,
			trainDestination: trainDestination,
			firstTrainTime: firstTrainTime,
			trainFrequency: trainFrequency
		});

		// Hide empty field error message.
		$("#train-name").next().hide();
		$("#train-destination").next().hide();
		$("#first-train-time").next().hide();
		$("#train-frequency").next().hide();

	//Throw error message for empty field.
	}else if(!trainName){
		$("#train-name").next().show().text("This field is required");
	}else if(!trainDestination){
		$("#train-destination").next().show().text("This field is required");
	}else if(!firstTrainTime){
		$("#train-train-time").next().show().text("This field is required");
	}else if(!trainFrequency){
		$("#train-frequency").next().show().text("This field is required");
	}
});

// Display today time & date.
setInterval(displayTime, 1000);