import fetch from "node-fetch";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const serverUrl = process.env.SERVERURL;
const secret = process.env.SECRET;

let pingTimeoutId = null;

async function pingServer() {
  try {
    const response = await fetch(`${serverUrl}/ping?secret=${secret}`);
    const data = await response.text();
    console.log("Ping response:", data);
  } catch (error) {
    console.error("Error pinging server:", error);
  }
}

function scheduleDelayedPing() {
  // Clear any existing timeout before scheduling a new one
  if (pingTimeoutId) {
    clearTimeout(pingTimeoutId);
  }

  pingTimeoutId = setTimeout(() => {
    console.log("Executing delayed ping...");
    pingServer();
  }, 1 * 60 * 1000); // 5 minutes in milliseconds
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === `/ping?secret=${secret}`) {
    console.log("Received secret ping request, pinging server again...");
    // pingServer();
    console.log("Scheduling another ping in 5 minutes...");
    scheduleDelayedPing();
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Pinged server again and scheduled another ping");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Initial ping to start the process
pingServer();
scheduleDelayedPing();

process.on("SIGINT", () => {
  if (pingTimeoutId) {
    clearTimeout(pingTimeoutId);
  }
  console.log("Ping server shutting down...");
  process.exit(0);
});
