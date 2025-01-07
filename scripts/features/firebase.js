// features/firebase.js
const { executeCommand } = require("../utils");

// Get the project directory from command-line arguments
const appDirectory = process.argv[2];
if (!appDirectory) {
  console.error("Please provide the path to your React app directory.");
  process.exit(1);
}

(async function addFirebaseConfig() {
  console.log("\n--- Adding Firebase ---");

  executeCommand("npm install firebase", { cwd: appDirectory });
})();
