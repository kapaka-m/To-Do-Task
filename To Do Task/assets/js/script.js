'use strict';

// KAPAKA Todo App - JavaScript Code
// Developed by KAPAKA

class KAPAKATodo {
  constructor() {
    this.init();
    this.bindEvents();
  }

  init() {
    // DOM elements
    this.headerTime = document.querySelector("[data-header-time]");
    this.menuTogglers = document.querySelectorAll("[data-menu-toggler]");
    this.menu = document.querySelector("[data-menu]");
    this.themeBtns = document.querySelectorAll("[data-theme-btn]");
    this.modalTogglers = document.querySelectorAll("[data-modal-toggler]");
    this.welcomeNote = document.querySelector("[data-welcome-note]");
    this.taskList = document.querySelector("[data-task-list]");
    this.taskInput = document.querySelector("[data-task-input]");
    this.modal = document.querySelector("[data-info-modal]");
    this.notification = document.getElementById("notification");

    this.taskItems = document.querySelectorAll("[data-task-item]");
    this.taskRemovers = document.querySelectorAll("[data-task-remove]");

    // Initialize date
    this.updateDate();

    // Initialize tasks from localStorage if available
    this.loadTasks();
  }

  bindEvents() {
    // Menu togglers
    this.menuTogglers.forEach(toggler => {
      toggler.addEventListener("click", () => this.toggleMenu());
    });

    // Modal togglers
    this.modalTogglers.forEach(toggler => {
      toggler.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleModal();
      });
    });

    // Theme buttons
    this.themeBtns.forEach(btn => {
      btn.addEventListener("click", () => this.changeTheme(btn));
    });

    // Task input event
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask();
      }
    });

    // Existing task removers
    this.taskRemovers.forEach(remover => {
      remover.addEventListener("click", () => this.removeTask(remover));
    });

    // Window load event
    window.addEventListener("load", () => {
      document.body.classList.add("loaded");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest('.dropdown-wrapper') && this.menu.classList.contains('active')) {
        this.toggleMenu();
      }
    });
  }

  updateDate() {
    const date = new Date();
    const weekDayName = this.getWeekDayName(date.getDay());
    const monthName = this.getMonthName(date.getMonth());
    const monthOfDay = date.getDate();

    this.headerTime.textContent = `${weekDayName}, ${monthName} ${monthOfDay}`;
  }

  getWeekDayName(dayNumber) {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayNumber] || "Not a valid day";
  }

  getMonthName(monthNumber) {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    return months[monthNumber] || "Not a valid month";
  }

  toggleMenu() {
    this.menu.classList.toggle("active");
  }

  toggleModal() {
    this.modal.classList.toggle("active");

    if (this.menu.classList.contains("active")) {
      this.menu.classList.remove("active");
    }
  }

  changeTheme(btn) {
    const hueValue = btn.dataset.hue;
    document.documentElement.style.setProperty("--hue", hueValue);

    this.themeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Save theme preference
    localStorage.setItem("kapaka-theme", hueValue);
  }

  showNotification(message) {
    this.notification.textContent = message;
    this.notification.classList.add("show");

    setTimeout(() => {
      this.notification.classList.remove("show");
    }, 3000);
  }

  createTaskNode(taskText) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");
    taskItem.setAttribute("data-task-item", "");

    taskItem.innerHTML = `
                    <button class="item-icon" data-task-remove="complete">
                        <span class="check-icon"></span>
                    </button>
                    <p class="item-text">${taskText}</p>
                    <button class="item-action-btn" aria-label="Remove task" data-task-remove>
                        <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
                    </button>
                `;

    // Add event listeners to the new task
    const removeButtons = taskItem.querySelectorAll("[data-task-remove]");
    removeButtons.forEach(btn => {
      btn.addEventListener("click", () => this.removeTask(btn));
    });

    return taskItem;
  }

  addTask() {
    const taskText = this.taskInput.value.trim();

    if (!taskText) {
      this.showNotification("يرجى كتابة شيء ما!");
      return;
    }

    const taskNode = this.createTaskNode(taskText);

    if (this.taskList.childElementCount > 0) {
      this.taskList.insertBefore(taskNode, this.taskList.firstChild);
    } else {
      this.taskList.appendChild(taskNode);
    }

    this.taskInput.value = "";
    this.welcomeNote.classList.add("hide");

    // Save tasks to localStorage
    this.saveTasks();
  }

  removeTask(remover) {
    const taskItem = remover.closest("[data-task-item]");

    if (remover.dataset.taskRemove === "complete") {
      taskItem.classList.add("complete");

      // Play sound (simulated)
      this.playCompleteSound();

      setTimeout(() => {
        taskItem.remove();
        this.checkWelcomeNote();
        this.saveTasks();
      }, 250);
    } else {
      taskItem.remove();
      this.checkWelcomeNote();
      this.saveTasks();
    }
  }

  playCompleteSound() {
    // Simulated sound effect
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log("Audio context not supported");
    }
  }

  checkWelcomeNote() {
    if (this.taskList.childElementCount === 0) {
      this.welcomeNote.classList.remove("hide");
    }
  }

  saveTasks() {
    const tasks = [];
    this.taskList.querySelectorAll("[data-task-item]").forEach(item => {
      const text = item.querySelector(".item-text").textContent;
      const isComplete = item.classList.contains("complete");
      tasks.push({ text, complete: isComplete });
    });

    localStorage.setItem("kapaka-tasks", JSON.stringify(tasks));
  }

  loadTasks() {
    const savedTasks = localStorage.getItem("kapaka-tasks");
    const savedTheme = localStorage.getItem("kapaka-theme");

    if (savedTheme) {
      document.documentElement.style.setProperty("--hue", savedTheme);
      this.themeBtns.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.hue === savedTheme);
      });
    }

    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);

      if (tasks.length > 0) {
        this.welcomeNote.classList.add("hide");

        tasks.forEach(task => {
          const taskNode = this.createTaskNode(task.text);
          if (task.complete) {
            taskNode.classList.add("complete");
          }
          this.taskList.appendChild(taskNode);
        });
      }
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new KAPAKATodo();
});