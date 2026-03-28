const statusText = document.getElementById("status");

// Simulate latency (ping)
async function getLatency() {
  const start = Date.now();
  try {
    await fetch("https://www.google.com", { mode: "no-cors" });
    return Date.now() - start;
  } catch {
    return 999;
  }
}

// Notification
function notify(message) {
  if (Notification.permission === "granted") {
    new Notification("Network Alert", { body: message });
  } else {
    Notification.requestPermission();
  }
}

async function checkNetwork() {
  if (!navigator.onLine) {
    statusText.innerText = "❌ No Internet Connection\n👉 Check router or mobile data";
    notify("No Internet Connection");
    return;
  }

  const connection = navigator.connection;
  let speed = connection ? connection.downlink : 2;
  let type = connection ? connection.effectiveType : "unknown";

  const latency = await getLatency();

  // -------- Health Score --------
  let score = 100;

  if (speed < 1) score -= 40;
  if (latency > 150) score -= 30;

  let health = "";
  let healthClass = "";

  if (score > 80) {
    health = "🟢 Excellent";
    healthClass = "good";
  } else if (score > 50) {
    health = "🟡 Moderate";
    healthClass = "medium";
  } else {
    health = "🔴 Poor";
    healthClass = "bad";
  }

  // -------- Decision Logic --------
  let message = "";

  if (speed < 1 && latency > 150) {
    message = "⚠️ Network Congestion Detected\n(Multiple users may be connected)";
    notify("Network congestion detected!");
  }
  else if (latency > 150) {
    message = "🐢 High Latency\n👉 Video calls may lag";
  }
  else if (speed < 1) {
    message = "🐢 Slow Network\n👉 Avoid streaming";
  }
  else {
    message = "✅ Good Network\n👉 You’re good to go";
  }

  // -------- Final Output --------
  statusText.innerText =
    `${message}
📶 Type: ${type}
⚡ Speed: ${speed} Mbps
⏱ Latency: ${latency} ms
📊 Health: ${health}`;
}

// Run every 5 sec
setInterval(checkNetwork, 5000);

// Instant events
window.addEventListener("offline", () => {
  statusText.innerText = "❌ No Internet Connection";
  notify("You are offline!");
});

window.addEventListener("online", () => {
  statusText.innerText = "✅ Back Online";
});

// Initial run
checkNetwork();