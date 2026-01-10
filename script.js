const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks(){
  list.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label class="task-label">
        <input type="checkbox" class="check-task" ${task.completed ? "checked" : ""} data-index="${index}" />
        <span class="task-text ${task.completed ? "completed" : ""}">${task.text}</span>
      </label>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;
    list.appendChild(li);
  });
}

form.addEventListener("submit", function (e){
  e.preventDefault();
  const taskText = input.value.trim();
  if (taskText !== "") {
    tasks.push({ text: taskText, completed: false });
    input.value = "";
    saveAndRender();
  }
});
list.addEventListener("click", function (e) {
  const index = e.target.dataset.index;
  if (e.target.classList.contains("delete-btn")) {
    tasks.splice(index, 1);
    saveAndRender();
  }

  if (e.target.classList.contains("check-task")) {
    tasks[index].completed = e.target.checked;
    saveAndRender();
  }
});

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

renderTasks();