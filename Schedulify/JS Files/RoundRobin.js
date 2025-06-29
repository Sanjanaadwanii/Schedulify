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
    <br><br>
  `;
  container.appendChild(row);
}

function resetAll() {
  document.getElementById("process-inputs").innerHTML = "";
  document.getElementById("gantt-chart").innerHTML = "";
  document.querySelector("#process-table tbody").innerHTML = "";
  document.getElementById("averages").innerHTML = "";
  document.getElementById("quantum").value = "";
  processCount = 0;
}

async function runRoundRobin() {
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

  const quantum = parseInt(document.getElementById("quantum")?.value);
  if (isNaN(quantum) || quantum <= 0) {
    alert("Please enter a valid quantum value.");
    return;
  }

  let processes = [];
  for (let i = 1; i <= processCount; i++) {
    const arrival = parseInt(document.getElementById(`arrival-${i}`).value);
    const burst = parseInt(document.getElementById(`burst-${i}`).value);

    if (isNaN(arrival) || isNaN(burst)) {
      alert(`Please enter valid input for Process ${i}`);
      return;
    }

    processes.push({
      pid: `P${i}`,
      arrival,
      burst,
      remaining: burst,
      completed: false,
      start: -1
    });
  }

  let time = 0;
  let completed = 0;
  let totalWT = 0, totalTAT = 0;
  let queue = [];

  while (completed < processes.length) {
    processes
      .filter(p => p.arrival === time)
      .forEach(p => {
        if (!queue.includes(p)) queue.push(p);
      });

    if (queue.length === 0) {
      updateQueues("Idle", []);
      time++;
      await delay(300);
      continue;
    }

    const current = queue.shift();
    if (current.start === -1) current.start = time;

    const execTime = Math.min(quantum, current.remaining);
    updateQueues(current.pid, queue.map(p => p.pid));

    const block = document.createElement("div");
    block.className = "gantt-block";
    block.setAttribute("data-pid", current.pid);
    block.setAttribute("data-time", `${time} - ${time + execTime}`);
    block.innerHTML = `${current.pid}`;
    chart.appendChild(block);
    await delay(600);

    time += execTime;
    current.remaining -= execTime;

    // Add newly arrived during execution
    processes
      .filter(p => p.arrival > time - execTime && p.arrival <= time && !p.completed && !queue.includes(p))
      .forEach(p => queue.push(p));

    if (current.remaining > 0) {
      queue.push(current);
    } else {
      current.completion = time;
      current.turnaround = current.completion - current.arrival;
      current.waiting = current.turnaround - current.burst;
      current.completed = true;

      totalWT += current.waiting;
      totalTAT += current.turnaround;
      completed++;
    }
  }

  processes.forEach(proc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${proc.pid}</td>
      <td>${proc.arrival}</td>
      <td>${proc.burst}</td>
      <td>-</td>
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

function delay(ms) {
  const speed = parseFloat(document.getElementById("speed")?.value || 1);
  return new Promise(resolve => setTimeout(resolve, ms / speed));
}

