# Schedulify – CPU Scheduling Visualizer 🔄

**Schedulify** is a modern, interactive web-based tool designed to visually demonstrate how CPU scheduling algorithms work. It provides animated Gantt charts, queue simulation, and metrics for better conceptual understanding of scheduling logic.

---

## 🔧 Features

- ✅ **Supports Major Algorithms**:
  - FCFS (First-Come-First-Serve)
  - SJF (Preemptive & Non-Preemptive)
  - Priority (Preemptive & Non-Preemptive)
  - Round Robin

- 🎞️ **Visual Gantt Chart Animations**
- ⏱️ **Live Running and Waiting Queue Visualization**
- 🧮 **Auto Calculation** of Waiting Time, Turnaround Time, and Averages
- 🎚️ **Speed Control Slider** for simulation
- 📱 **Fully Responsive Interface** using HTML, CSS, JavaScript
- 💡 (Pluggable C++ backend planned via WebAssembly)

---

## 🗂️ File Structure

Schedulify/
├── index.html # Homepage
├── fcfs.html, sjf_np.html # Individual algorithm pages
├── css/
│ └── responsive.css # Shared enhanced UI styling
├── js/
│ └── fcfs.js, sjf_np.js # Visual logic & simulation
