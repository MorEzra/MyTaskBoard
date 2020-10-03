(function () {
    //define buttons
    let saveTaskBTN = document.getElementById("saveTaskBTN");
    saveTaskBTN.addEventListener("click", onCreateTaskClicked);

    let initPaperBTN = document.getElementById("initPaperBTN");
    initPaperBTN.addEventListener("click", onResetPaperClicked);

    // * FOR PERSONAL USE * - a button which clears all the notes from board
    let initNotesAreaBTN = document.getElementById("initNotesAreaBTN");
    initNotesAreaBTN.addEventListener("click", onDeleteNotesClicked);

    //display existing tasks when browser starts
    let taskArray = loadTasksFromModel();
    if (taskArray == "") {
        console.log("storage is empty");
    } else {
        showAllNotesOnUI(taskArray);
    }

    //I define input fields as global for various usage, wait and see
    let dateInput = document.getElementById("date");
    let timeInput = document.getElementById("time");
    let taskInput = document.getElementById("task");

    //define functions
    function onCreateTaskClicked() {
        let task = taskInput.value;
        let date = dateInput.value;
        let time = timeInput.value;

        // VALIDATION #1
        let areFieldsFilled = checkIfFieldsAreFilled(task, date);
        if (!areFieldsFilled) {
            alert("please fill all the required fields");
            return;
        }

        // VALIDATION #2
        let didDateOrTimePassed = checkIfDateOrTimePassed(date, time);
        if (didDateOrTimePassed) {
            alert("you can't use past time");
            return;
        }

        // I use this function here to reverse the date format to dd/mm/yyyy from the beginning (on UI)
        let reversedDate = reverseDateFormat(date);
        
        let taskDetails = gatherTaskDetails(task, reversedDate, time);

        taskArray.push(taskDetails);
        updateModel(taskArray);

        addNoteToUI(taskDetails);

        // * FOR PERSONAL USE * VALIDATION #3
        // I enable the Delete-all-notes BTN only if there are notes on board
        checkIfActivateDeleteAllNotesBTN(taskArray);

        onResetPaperClicked();
    }

    function addNoteToUI(taskDetails) {
        let notesContainer = document.getElementById("notesContainer");

        let note = createNoteOnUI(notesContainer);
        addTextToNoteUI(taskDetails, note);
        addDateAndTimeToNoteUI(taskDetails, note);
        addXGlyphToNoteUI(taskDetails, note);
    }

    function loadTasksFromModel() {
        let strTaskArray = localStorage.getItem("task");
        let taskArray;

        if (strTaskArray == null) {
            taskArray = new Array();
        } else {
            taskArray = JSON.parse(strTaskArray);
        }
        checkIfActivateDeleteAllNotesBTN(taskArray);
        return taskArray;
    }

    function showAllNotesOnUI(taskArray) {
        for (let index = 0; index < taskArray.length; index++) {
            let note = createNoteOnUI(notesContainer);
            addTextToNoteUI(taskArray[index], note);
            addDateAndTimeToNoteUI(taskArray[index], note);
            addXGlyphToNoteUI(taskArray[index], note);
        }
    }

    function createNoteOnUI(notesContainer) {
        let note = document.createElement("div");
        note.setAttribute("class", "note");
        notesContainer.appendChild(note);
        return note;
    }

    function addTextToNoteUI(taskArray, note) {
        let textArea = document.createElement("span");
        textArea.setAttribute("class", "textArea");
        textArea.innerHTML = taskArray.task;
        note.appendChild(textArea);
    }

    // let reversedDate = reverseDateFormat(date);

    function reverseDateFormat(date) {
        let splitDateString = date.split("-");

        let year = splitDateString[0];
        let month = splitDateString[1];
        let day = splitDateString[2];

        let reversedDate = day + "/" + month + "/" + year;

        return reversedDate;
    }

    function addDateAndTimeToNoteUI(taskArray, note) {
        let dateTimeArea = document.createElement("span");
        dateTimeArea.setAttribute("class", "dateArea");
        dateTimeArea.innerHTML = taskArray.date + "<br>" + taskArray.time;
        note.appendChild(dateTimeArea);
    }

    function addXGlyphToNoteUI(taskArray, note) {
        let xGlyphIcon = document.createElement("span");
        xGlyphIcon.setAttribute("class", "glyphicon glyphicon-remove");
        xGlyphIcon.setAttribute("id", taskArray.id);
        xGlyphIcon.addEventListener("click", onDeleteTaskClicked);
        note.appendChild(xGlyphIcon);
    }

    function checkIfFieldsAreFilled(task, date) {
        initFieldsStyle();

        if (task.trim() == "") {
            taskInput.style.border = "2px solid #f0646e";
            return false;
        }

        if (date == "") {
            dateInput.style.border = "2px solid #f0646e";
            return false;
        }
        return true;
    }

    function checkIfDateOrTimePassed(date, time) {
        initFieldsStyle();

        let today = new Date().setHours(0, 0, 0, 0);
        let selectedDate = new Date(date).setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            dateInput.style.border = "2px solid #f0646e";
            return true;
        }

        // I define the time validation along with the date validation because it's not a required field
        // UNLESS the user filled the time field
        if (selectedDate == today && time != "") {
            let validTime = isValidTime(time);
            if (!validTime) {
                timeInput.style.border = "2px solid #f0646e";
                return true;
            }
        }
        return false;
    }

    function isValidTime(time) {
        let today = new Date();
        let currentTime = today.toLocaleTimeString('en-GB');

        if (time < currentTime) {
            return false;
        }
        return true;
    }

    function gatherTaskDetails(task, date, time) {
        let taskDetails = {
            id: getValidId(),
            task: task,
            date: date,
            time: time
        }
        return taskDetails;
    }

    function getValidId() {
        let taskArray = loadTasksFromModel();
        let idNum = 0;

        if (taskArray != "") {
            let latestIdNum = taskArray[taskArray.length - 1].id;
            idNum = latestIdNum + 1;
        }
        return idNum;
    }

    function onDeleteTaskClicked() {
        let taskArray = loadTasksFromModel();

        let currentId = this.id;
        removeTaskFromModel(taskArray, currentId);

        updateModel(taskArray);

        //update UI
        this.parentNode.remove();

        // I want the storage to be totally clean, and not hold an empty array in it
        clearStorage(taskArray);

    }

    function removeTaskFromModel(taskArray, currentId) {
        for (let index = 0; index < taskArray.length; index++) {
            if (taskArray[index].id == currentId) {
                taskArray.splice(index, 1);
            }
        }
    }

    // I define an arrow function because this function has only 1 line
    let updateModel = (taskArray) =>
        localStorage.setItem("task", JSON.stringify(taskArray));

    //define INIT functions
    function initFieldsStyle() {
        taskInput.style.border = "";
        dateInput.style.border = "";
        timeInput.style.border = "";
    }

    function initFieldsValue() {
        taskInput.value = "";
        dateInput.value = "";
        timeInput.value = "";
    }

    function clearStorage(taskArray) {
        if (taskArray.length == 0) {
            localStorage.clear();
        }
        checkIfActivateDeleteAllNotesBTN(taskArray);
    }

    function onResetPaperClicked() {
        // I put this function first because i want the red borders to be cleared even if the fields are empty
        // in a case which the user sent empty tasks first and got red borders alert
        initFieldsStyle();
        if (taskInput.value == "" && dateInput.value == "" && timeInput.value == "") {
            alert("the input fields are already clear");
            return;
        } else {
            initFieldsValue();
        }
    }

    //I want the Delete-all-notes BTN to be disabled when there are no notes
    function checkIfActivateDeleteAllNotesBTN(taskArray) {
        if (taskArray == "") {
            initNotesAreaBTN.disabled = true;
            initNotesAreaBTN.style.backgroundColor = "gray";
        } else {
            initNotesAreaBTN.disabled = false;
            initNotesAreaBTN.style.backgroundColor = "#209093";
        }
    }


    // >> EXTRAS AREA - OPTIONS FOR PERSONAL USE <<
    function onDeleteNotesClicked(taskArray) {
        if (taskArray == "") {
            alert("the task board is already clear");
            return;
        }
        let confirmNotesDelete = isConfirmed();
        if (confirmNotesDelete) {
            clearNotesFromUI();
            clearNotesFromModel();
        }
    }

    function isConfirmed() {
        return confirm("are you sure you want do delete all the notes?");
    }

    function clearNotesFromUI() {
        let notesContainer = document.getElementById("notesContainer");
        notesContainer.innerHTML = "";
    }

    function clearNotesFromModel() {
        taskArray = new Array();
        localStorage.setItem("task", JSON.stringify(taskArray));

        clearStorage(taskArray);
    }
})();