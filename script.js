/*=============== CONSTANTS ===============*/

const STORAGE_KEY = "tasks";
const SELECTORS = {
  inputTask: ".input_tasks",
  addTaskBtn: ".add_btn",
  tasksCont: ".tasks_wrapper",
  progressContainer: ".progress_container",
  tooltip: ".tooltip",
};

/*=============== STATE MANAGEMENT ===============*/

const state = {
  tasks: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [],
  editingTaskId: null,
};

/*=============== DOM ELEMENTS ===============*/

const elements = {};

/*=============== INITIALIZE ELEMENTS ===============*/

initializeElements();
function initializeElements() {
  Object.entries(SELECTORS).forEach(([key, selector]) => {
    elements[key] = document.querySelector(selector);
  });
}


/*=============== EVENT LISTENER ===============*/


function setupEventListeners() {
  elements.addTaskBtn.addEventListener("click", handleAddTask);
  elements.inputTask.addEventListener("keydown", handleKeyPress);
  elements.tasksCont.addEventListener("click", handleTaskContainerClick);
}
function handleKeyPress(event) {
  if (event.key === "Enter") {
    handleAddTask();
  }
  elements.tooltip.classList.remove("visible");
}
function handleTaskContainerClick(event) {
  const target = event.target;
  const taskElement = target.closest(".task");
  if (!taskElement) return;
  const taskIndex = Array.from(taskElement.parentElement.children).indexOf(
    taskElement
  );
  if (target.closest(".delete_btn")) {
    deleteTask(taskIndex);
  } else if (target.closest(".edit_btn")) {
    const taskId = target.closest(".edit_btn").dataset.taskId;
    editTask(taskIndex, taskId);
  } else if (target.closest(".tick_container")) {
    toggleTaskCompletion(taskIndex);
  }
}
/*=============== TASK OPERTIONS ===============*/

function handleAddTask() {
  const taskName = elements.inputTask.value.trim();
  if (!taskName) {
    elements.tooltip.classList.add("visible");
    return;
  }
  const taskId = crypto.randomUUID();
  if (state.editingTaskId != null) {
    const editIndex = state.tasks.findIndex(
      (task) => task.id === state.editingTaskId
    );
    state.tasks[editIndex] = { name: taskName, isDone: false, id: taskId };
    state.editingTaskId = null;
  } else {
    state.tasks.push({ name: taskName, isDone: false, id: taskId });
  }
  elements.inputTask.value = "";
  updateUI();
}
function deleteTask(index) {
  state.tasks.splice(index, 1);
  updateUI();
}
function editTask(index, taskId) {
  const task = state.tasks.find((t) => t.id === taskId);

  if (!task) return;
  const tempTasks = state.editingTaskId
    ? state.tasks.filter((t) => t.id !== taskId)
    : state.tasks.filter((_, i) => i !== index);
  elements.inputTask.value = task.name;
  elements.inputTask.focus();
  state.editingTaskId = taskId;
  renderTasks(tempTasks);
  renderProgress();
}
function toggleTaskCompletion(index){
  state.tasks[index].isDone = !state.tasks[index].isDone
  updateUI()

  const completedTasks = state.tasks.filter(task => task.isDone).length
if(completedTasks === state.tasks.length){
  new JSConfetti().addConfetti({ confettiNumber: 500 });
}
}

/*=============== RENDERING ===============*/

function renderTasks(tasksToRender = state.tasks){
  if(tasksToRender.length === 0){
   elements.tasksCont.innerHTML = '<img alt="No tasks" loading="lazy" src="/Images/no_tasks_bg.png" class="no_tasks_img" />';
    return;
  }
  elements.tasksCont.innerHTML = tasksToRender.map(task => `
    <div class="task extra_white_glassMorphism">
    <div class="task_left_part">
        <div class="circle">
        <div class="tick_container">
            ${task.isDone ? '<i class="fa-solid tick_icon fa-check"></i>' : ''}
        </div>
        </div>
    </div>
    <div class="task_middle_part">
        <p class="task_name ${task.isDone ? 'taskDone' : ''}"></p>
    </div>
    <div class="task_right_part">
        <button data-task-id="${task.id}"  class="edit_btn ${task.isDone ? 'edit_btn_on_task_done' : ''} ">
        <i class="ri-pencil-fill icon_edit"></i>
        </button>
        <button class="delete_btn">
        <i class="ri-delete-bin-fill delete_icon"></i>
        </button>
    </div>
    </div>
` ).join('')

tasksToRender.forEach((task, i) => {
  document.querySelectorAll(".task .task_name")[i].innerText = task.name;
});

}
function renderProgress(){
  const totalTasks = state.tasks.length
  const completedTasks = state.tasks.filter(task => task.isDone).length
  const progressPercent = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;
  elements.progressContainer.innerHTML = `
    <div class="progress_bar_wrapper">
    <p class="title">Keep it Up!</p>
    <div class="progress_bar">
        <div style="width: ${progressPercent}%;" class="progress_done"></div>
    </div>
    </div>
    <div class="ratio_circle">
    <p class="ratio_txt">${completedTasks}/${totalTasks}</p>
    </div>
`;
}

/*=============== STORAGE ===============*/


function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

/*=============== UI UPDATES ===============*/

function updateUI(){
  renderTasks()
  renderProgress()
  saveToStorage()
}

/*=============== INITIALIZATION ===============*/

document.addEventListener("DOMContentLoaded",()=>{
  initializeElements()
  setupEventListeners()
  updateUI()
} )

