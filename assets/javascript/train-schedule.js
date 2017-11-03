// Initialize Firebase
var config = {
	apiKey: "AIzaSyA94U2kl0qCCqFDMvu0T9LjiYc_sebgSyU",
	authDomain: "sdtrainschedule.firebaseapp.com",
	databaseURL: "https://sdtrainschedule.firebaseio.com",
	storageBucket: "sdtrainschedule.appspot.com",
	messagingSenderId: "789539558017"
};
firebase.initializeApp(config);
var dataRef = firebase.database();

// Initial values
var trainName = "";
var trainDestination = "";
var firstTrainTime = "";
var trainFrequency = 0;

//Function to display current date, day and time.
function displayTime() {
	var day = moment().format("dddd, MMMM Do");
	var time = moment().format("hh:mm:ss");
	var period = moment().format("A");
	$(".current-time").html("<span class='day'>"
		+ day + "</span><br><span class='time'>"
		+ time + "</span><span> "
		+ period + "</span>");
}

//Delete the train details from database and the table.
function deleteTrain() {
	var trainNameDelete = $(this).attr("data-name");
	var query = dataRef.ref().orderByChild('trainName').equalTo(trainNameDelete);
	query.on('child_added', function (snapshot) {
		snapshot.ref.remove();
	});
	$(this).parent().prevAll().parent().remove(); //deleting row
}

//Edit train details in the form for updating.
function editTrain() {
	// Change  the form to edit train
	$("#update").show();
	$("#submit").hide();
	$(".add-update-panel").text("Update train details");
	$("#train-form").removeClass("panel-warning");
	$("#train-form").addClass("panel-danger");

	//Get the location of data to be edited.
	var trainNameEdit = $(this).attr("data-name");
	var query = dataRef.ref().orderByChild('trainName').equalTo(trainNameEdit);

	//Assign attribute for 'update button' in the form for future reference 
	$("#update").attr("data-name", trainNameEdit);

	// Retrieve corresponding value from database and display on form to edit.
	query.on('child_added', function (snapshot) {

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

//Display schedule by calculating the data from database
function timedSchedule() {
	$("tbody").empty();

	// Firebase watcher + initial loader.
	dataRef.ref().on("child_added", function (childSnapshot) {

		//Retrieving records from database and assigning to variables
		trainName = childSnapshot.val().trainName;
		trainDestination = childSnapshot.val().trainDestination;
		firstTrainTime = childSnapshot.val().firstTrainTime;
		trainFrequency = childSnapshot.val().trainFrequency;

		var tFrequency = parseInt(trainFrequency);

		// First Time (pushed back 1 year to make sure it comes before current time)
		var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
		var currentTime = moment();

		// Difference between the times & Time apart (remainder)
		var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
		var tRemainder = diffTime % tFrequency;

		// Minute Until Train
		nextTrainInMinute = tFrequency - tRemainder;

		// Next Train
		var nextTrain = moment().add(nextTrainInMinute, "minutes");
		nextTrainArrival = moment(nextTrain).format("hh:mm");

		// Buttons for delete and edit
		var deleteButton = "<span data-name ='" + trainName + "' class='label label-success delete'>Delete</span>";
		var editButton = "<span data-name ='" + trainName + "' class='label label-success edit'>Update</span>";

		$("tbody").append("<tr><td class='camel-case'>"
			+ trainName + "</td><td class='camel-case'>"
			+ trainDestination + "</td><td>"
			+ trainFrequency + "</td><td>"
			+ nextTrainArrival + "</td><td>"
			+ nextTrainInMinute + "</td><td>"
			+ editButton + "</td><td>"
			+ deleteButton + "</td></tr>");

	}, function (errorObject) {
		console.log("Errors handled: " + errorObject.code);
	});
}

// Real time input field validation.
$("input").on("input", function () {
	var is_value = $(this).val();
	if (is_value) {
		$(this).next().hide();
	} else {
		$(this).next().show().text("This field is required");
	}
});

// Real time time format validation.
$("#first-train-time").on("input", function () {
	var is_time = $(this).val();
	var valid = moment(is_time, "HH:mm", true).isValid();
	if (!valid)
		$(this).next().show().text("Enter time in valid format");
});

//On submitting the form update on table and database.
$("#submit").on("click", function (event) {
	event.preventDefault();

	//Get user inputs.
	trainName = $("#train-name").val().trim();
	trainDestination = $("#train-destination").val().trim();
	firstTrainTime = $("#first-train-time").val().trim();
	trainFrequency = parseInt($("#train-frequency").val().trim());

	// All input field filled Push entries to the database.
	if (trainName && trainDestination && firstTrainTime && trainFrequency) {

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

		//Update table
		timedSchedule();

		//Throw error message for empty field.
	} else {

		if (!trainName)
			$("#train-name").next().show().text("This field is required");
		if (!trainDestination)
			$("#train-destination").next().show().text("This field is required");
		if (!firstTrainTime)
			$("#train-train-time").next().show().text("This field is required");
		if (!trainFrequency)
			$("#train-frequency").next().show().text("This field is required");
	}
});

//When click on update button get values from the form and update on database.
$("#update").on("click", function (event) {
	event.preventDefault();

	// Get values from the form
	var trainNameUpdated = $("#train-name").val().trim();
	var trainDestinationUpdated = $("#train-destination").val().trim();
	var firstTrainTimeUpdated = $("#first-train-time").val().trim();
	var trainFrequencyUpdated = parseInt($("#train-frequency").val().trim());

	// Get location of the data to be updated, Update database with new user inputs.
	var trainNameToUpdate = $(this).attr("data-name");
	var query = dataRef.ref().orderByChild('trainName').equalTo(trainNameToUpdate);

	query.on('child_added', function (snapshot) {

		snapshot.ref.update({
			trainName: trainNameUpdated,
			trainDestination: trainDestinationUpdated,
			firstTrainTime: firstTrainTimeUpdated,
			trainFrequency: trainFrequencyUpdated
		});
	});

	//Clear input field after submission
	$('#form-train')[0].reset();

	//Update table
	timedSchedule();

	// Change  the form to add train
	$("#update").hide();
	$("#submit").show();
	$(".add-update-panel").text("Add train");
	$("#train-form").removeClass("panel-danger");
	$("#train-form").addClass("panel-warning");
});

//Prevent submitting form on pressing enter key
$(window).keydown(function (event) {
	if (event.keyCode == 13) {
		event.preventDefault();
		return false;
	}
});

// When click on delete button call function to delete train.
$(document).on("click", ".delete", deleteTrain);

// When click on update button call function to edit train details.
$(document).on("click", ".edit", editTrain);

// Display Current time & date.
setInterval(displayTime, 1000);

// Display first set of data from database
timedSchedule();

//Update schedule table at every 15 seconds
setInterval(timedSchedule, 1000 * 15);
