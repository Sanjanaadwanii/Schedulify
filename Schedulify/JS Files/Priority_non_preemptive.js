let processCount = 0;

function addProcess() {
  processCount++;
  const container = document.getElementById("process-inputs");

  const row = document.createElement("div");
  row.classList.add("input-row");
  row.innerHTML = `
    <label>Process ${processCount}</label><br/>
    Arrival Time: <input type="number" id="arrival-${processCount}" min="0" required />
    Burst Time: <input type="number" id="burst-${processCount}" min="1" required />
    Priority (1 = highest): <input type="number" id="priority-${processCount}" min="1" required />
    <br><br>
  `;
  container.appendChild(row);
}

function resetAll() {
  document.getElementById("process-inputs").innerHTML = "";
  document.getElementById("gantt-chart").innerHTML = "";
  document.querySelector("#process-table tbody").innerHTML = "";
  document.getElementById("averages").innerHTML = "";
  processCount = 0;
}

async function runPriorityNonPreemptive() {
  const chart = document.getElementById("gantt-chart");
  const placeholder = document.getElementById("gantt-placeholder");
  if (placeholder) placeholder.style.display = "none";

  chart.innerHTML = "";
  const tableBody = document.querySelector("#process-table tbody");
  const avgBox = document.getElementById("averages");
  tableBody.innerHTML = "";
  avgBox.innerHTML = "";

  const runningDiv = document.getElementById("running-queue");
  const waitingDiv = document.getElementById("waiting-queue");

  runningDiv.innerHTML = "<span class='queue-item'>Empty</span>";
  waitingDiv.innerHTML = "<span class='queue-item'>Empty</span>";

  let processes = [];

  for (let i = 1; i <= processCount; i++) {
    const arrival = parseInt(document.getElementById(`arrival-${i}`).value);
    const burst = parseInt(document.getElementById(`burst-${i}`).value);
    const priority = parseInt(document.getElementById(`priority-${i}`).value);

    if (isNaN(arrival) || isNaN(burst) || isNaN(priority)) {
      alert(`Please enter valid input for Process ${i}`);
      return;
    }

    processes.push({
      pid: `P${i}`,
      arrival,
      burst,
      priority,
      completed: false
    });
  }

  let time = 0;
  let completed = 0;
  let totalWT = 0, totalTAT = 0;

  while (completed < processes.length) {
    let readyQueue = processes.filter(p => !p.completed && p.arrival <= time);
    readyQueue.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);

    if (readyQueue.length === 0) {
      updateQueues("Idle", []);
      time++;
      await delay(400);
      continue;
    }

    let current = readyQueue[0];
    let waitingQueue = readyQueue.slice(1);
    updateQueues(current.pid, waitingQueue.map(p => p.pid));

    current.start = time;
    current.completion = current.start + current.burst;
    current.turnaround = current.completion - current.arrival;
    current.waiting = current.turnaround - current.burst;

    totalWT += current.waiting;
    totalTAT += current.turnaround;

    const block = document.createElement("div");
    block.className = "gantt-block";
    block.setAttribute("data-pid", current.pid);
    block.setAttribute("data-time", `${current.start} - ${current.completion}`);
    block.innerHTML = `${current.pid}`;
    chart.appendChild(block);
    await delay(600);

    current.completed = true;
    completed++;
    time = current.completion;
  }

  processes.forEach(proc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${proc.pid}</td>
      <td>${proc.arrival}</td>
      <td>${proc.burst}</td>
      <td>${proc.priority}</td>
      <td>${proc.start}</td>
      <td>${proc.completion}</td>
      <td>${proc.waiting}</td>
      <td>${proc.turnaround}</td>
    `;
    tableBody.appendChild(row);
  });

  const avgWT = (totalWT / processes.length).toFixed(2);
  const avgTAT = (totalTAT / processes.length).toFixed(2);
  avgBox.innerHTML = `
    <strong>Average Waiting Time:</strong> ${avgWT}<br/>
    <strong>Average Turnaround Time:</strong> ${avgTAT}
  `;
}

// Queue animation helper
function updateQueues(running, waitingList) {
  const runningDiv = document.getElementById("running-queue");
  const waitingDiv = document.getElementById("waiting-queue");

  runningDiv.innerHTML = `<span class="queue-item">${running}</span>`;

  if (waitingList.length === 0) {
    waitingDiv.innerHTML = `<span class="queue-item">Empty</span>`;
  } else {
    waitingDiv.innerHTML = waitingList.map(pid => `<span class="queue-item">${pid}</span>`).join("");
  }
}

// Smooth delay
function delay(ms) {
  const speed = parseFloat(document.getElementById("speed")?.value || 1);
  return new Promise(resolve => setTimeout(resolve, ms / speed));
}

