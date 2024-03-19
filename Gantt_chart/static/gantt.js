let taskList = [];
let ganttChartInstance = null; // Variable to store the chart instance

function addTask () {
    const taskInput = document.querySelector(".js-task-input");
    const task = taskInput.value.trim();

    const startDateInput = document.querySelector(".js-start-date-input");
    const startDate = startDateInput.value;

    const dueDateInput = document.querySelector(".js-due-date-input");
    const dueDate = dueDateInput.value;

    if (task !== '' && startDate !== '' && dueDate !== '') {
        taskList.push({
           task: task,
           startDate: startDate,
           dueDate: dueDate 
        });
        saveTasks();
        taskInput.value = '';
        startDateInput.value = '';
        dueDateInput.value = '';
        loadTasks ();
        renderHorizontalBarChart();
    }

}


function saveTasks() {
    localStorage.setItem("projectTasks", JSON.stringify(taskList));
}


function loadTasks () {
    const savedProjectTasks = localStorage.getItem("projectTasks");
    if (savedProjectTasks) {
        taskList = JSON.parse(savedProjectTasks);
        taskList.sort((a, b) => new Date (a.dueDate) - new Date(b.dueDate));
        renderProjectTasks ();
        renderHorizontalBarChart()

    }
}

function renderProjectTasks() {
    const htmlOutputContainer = document.querySelector(".js-html-output");
    htmlOutputContainer.innerHTML = ''; // Clear previous HTML content
    for (let i = 0; i < taskList.length; i++) {
        const task = taskList[i].task;
        const startDate = taskList[i].startDate;
        const dueDate = taskList[i].dueDate;
        const htmlOutput = `
            <div class = "task-output"> ${task}</div>
            <div class = "start-date-output"> ${startDate}</div>
            <div class = "due-date-output"> ${dueDate}</div>
            <button onclick = "
                taskList.splice(${i}, 1);
                saveTasks();
                loadTasks ();
                renderHorizontalBarChart();
            " class = "delete-task-button">Delete</button>
        `;
        htmlOutputContainer.innerHTML += htmlOutput;
    }
}



// Function to load tasks and calculate duration and date distance
function loadTasksAndCalculateDuration() {
    const savedProjectTasks = localStorage.getItem("projectTasks");
    if (savedProjectTasks) {
        const taskList = JSON.parse(savedProjectTasks);
        const currentDate = new Date(); // Get the current date

        // Sort tasks based on due dates (urgency)
        taskList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const durationData = [];

        for (let i = 0; i < taskList.length; i++) {
            const taskName = taskList[i].task;
            const startDate = new Date(taskList[i].startDate);
            const dueDate = new Date(taskList[i].dueDate);

            // Calculate duration in days
            const durationInMs = dueDate - startDate;
            const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));

            // Calculate date distance in days left before activity begins
            const dateDistanceInMs = startDate - currentDate;
            const dateDistanceInDays = Math.ceil(dateDistanceInMs / (1000 * 60 * 60 * 24));

            durationData.push({
                task: taskName,
                duration: durationInDays,
                dateDistance: dateDistanceInDays
            });
        }

        return durationData;
    }

    return null; // Return null if data is not available
}


// Function to render the Gantt chart with stacked bars
function renderHorizontalBarChart() {
    // Destroy the previous chart instance if it exists
    if (ganttChartInstance) {
        ganttChartInstance.destroy();
    }

    const data = loadTasksAndCalculateDuration();
    if (data && data.length > 0) {
        const labels = data.map(item => item.task);
        const durations = data.map(item => item.duration);
        const dateDistances = data.map(item => item.dateDistance);
        const backgroundColors = [
            'rgba(255, 120, 160, 1)',
            'rgba(255, 170, 100, 1)',
            'rgba(255, 210, 50, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 132, 235, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)', 
            'rgba(255, 159, 200, 1)',
            'rgba(255, 205, 86, 1)', 
            'rgba(75, 192, 192, 1)', 
            'rgba(54, 162, 235, 1)', 
            'rgba(153, 102, 255, 1)', 
            'rgba(201, 203, 207, 1)' 
        ];
        

        const ganttChartCanvas = document.querySelector("#ganttChartCanvas");
        const ganttChartContainer = ganttChartCanvas.getContext('2d');

        ganttChartInstance = new Chart(ganttChartContainer, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Days to Start', // Label for date distance (base bar)
                    data: dateDistances,
                    backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent color for base bar
                    borderColor: 'rgba(0, 0, 0, 0)', // Transparent color for base bar
                    borderWidth: 0,
                    order: 1, // Ensure base bar is behind stacked bars
        
                }, {
                    label: 'Duration (Days)', // Label for duration (stacked bar)
                    data: durations,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    borderWidth: 1,
                    order: 2 // Ensure stacked bars are in front of base bar
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        stacked: true // Enable stacking on x-axis
                    },
                    y: {
                        stacked: true // Enable stacking on y-axis
                    }
                },
                plugins: {
                    title: {
                        display: false,
                        text: 'Gantt Chart'
                    }
                }
            }
        });
    } else {
        console.error('No data available to render the chart.');
    }
}



// Call the function to render the chart
window.addEventListener("load", loadTasks);