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

//Delete the train details from database and the table.
function deleteTrain(){
	var trainNameDelete = $(this).attr("data-name");
	var query = dataRef.ref().orderByChild('trainName').equalTo(trainNameDelete);

	query.on('child_added', function(snapshot) {
	    snapshot.ref.remove();
	});

	$(this).parent().prevAll().parent().remove(); //deleting row
}

//Edit train details in the form for updating.
function editTrain(){
	$("#update").show();
	$("#submit").hide();
	$(".add-update-panel").text("Update train details");
	$("#train-form").removeClass("panel-warning");
	$("#train-form").addClass("panel-danger");

	//Get the location of data to be edited.
	var trainNameEdit = $(this).attr("data-name");
	var query = dataRef.ref().orderByChild('trainName').equalTo(trainNameEdit);

	//Assign attribute for 'update button' in the form for future reference 
	$("#update").attr("data-name",trainNameEdit);

	// Retrive corresponding value from database and display on form to edit.
	query.on('child_added', function(snapshot) {

		var trainNameFromDB = snapshot.val().trainName;
    	var trainDestinationFromDB = snapshot.val().trainDestination;
		var startTimeFromDB = snapshot.val().firstTrainTime;	
		var frequencyFromDB = snapshot.val().trainFrequency;

		$("#train-name").val(trainNameFromDB);
		$("#train-destination").val(trainDestinationFromDB);
		$("#first-train-time").val(startTimeFromDB);
		$("#train-frequency").val(frequencyFromDB);

	});
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

	if(parseInt(differenceBetweenTime)<0){
		nextTrainInMinute = Math.abs(differenceBetweenTime);
		nextTrainArrival = startTimeConverted.format("hh:mm A");
	}

	console.log("Currentime : "+ moment().format("HH:mm")+" | Startime : "+startTimeConverted.format("HH:mm"));
	console.log("Difference : "+differenceBetweenTime+" minutes"+" | Remainder : "+remainderTime+" minutes");    
	console.log("Last arrival : "+lastArrival.format("HH:mm")+ " | Next arrival : "+nextArrival.format("HH:mm")+" | Minutes Away : "+minuteAway.format("HH:mm"));
	console.log("....................");

	var deleteButton = "<span data-name ='" + trainNameDB + "' class='label label-success delete'>Delete</span>";
	var editButton = "<span data-name ='" + trainNameDB + "' class='label label-success edit'>Update</span>";

	$("tbody").append("<tr><td class='camel-case'>"
		+ trainNameDB + "</td><td class='camel-case'>" 
		+ trainDestinationDB + "</td><td>" 
		+ frequencyDB + "</td><td>" 
		+ nextTrainArrival + "</td><td>" 
		+ nextTrainInMinute + "</td><td>"
		+ editButton + "</td><td>"
		+ deleteButton +"</td></tr>");

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

// Reatime time format validaton.
$("#first-train-time").on("input",function(){
	var is_time = $(this).val();
	var valid = moment(is_time, "HH:mm", true).isValid();
	if(!valid)
		$(this).next().show().text("Enter time in valid format");

});

//On submiting the form update on table and database.
$("#submit").on("click", function(event){
	event.preventDefault();

	//Get user inputs.
	trainName = $("#train-name").val().trim();
	trainDestination = $("#train-destination").val().trim();
	firstTrainTime = $("#first-train-time").val().trim();
	trainFrequency = parseInt($("#train-frequency").val().trim());

	// All input field filled Push entries to the database.
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

		//Clear input field after submission
		$('#form-train')[0].reset();

	//Throw error message for empty field.
	}else{

		if(!trainName)
			$("#train-name").next().show().text("This field is required");
		if(!trainDestination)
			$("#train-destination").next().show().text("This field is required");
		if(!firstTrainTime)
			$("#train-train-time").next().show().text("This field is required");
		if(!trainFrequency)
			$("#train-frequency").next().show().text("This field is required");
	}
});

//When click on update button get values from the form and update on database.
$("#update").on("click", function(event){

	// Get values from the form
	var trainNameUpdated = $("#train-name").val().trim();
	var trainDestinationUpdated = $("#train-destination").val().trim();
	var firstTrainTimeUpdated = $("#first-train-time").val().trim();
	var trainFrequencyUpdated = parseInt($("#train-frequency").val().trim());

	// Get location of the data to be updated, Update database with new user inputs.
	var trainNameToUpdate = $(this).attr("data-name");
	var query = dataRef.ref().orderByChild('trainName').equalTo(trainNameToUpdate);

	query.on('child_added', function(snapshot) {

		snapshot.ref.update({
	    	trainName: trainNameUpdated,
			trainDestination: trainDestinationUpdated,
			firstTrainTime: firstTrainTimeUpdated,
			trainFrequency: trainFrequencyUpdated
	    });
	});
});

// When click on delete button call function to delete train.
$(document).on("click",".delete",deleteTrain);

// When click on update button call function to edit train details.
$(document).on("click",".edit",editTrain);

// Display Current time & date.
setInterval(displayTime, 1000);