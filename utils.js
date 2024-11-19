// utils.js

const { execSync } = require("child_process");
const readline = require("readline");

function executeCommand(command, options = {}) {
  options = { stdio: "inherit", ...options };
  try {
    console.log(`\nExecuting: ${command}`);
    execSync(command, options);
  } catch (error) {
    console.error(`\nError executing command: ${command}\n${error.message}`);
    process.exit(1);
  }
}

function askQuestion(query) {
  return new Promise((resolve) => {
    process.stdout.write(query);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.trim());
    });
  });
}

module.exports = {
  executeCommand,
  askQuestion,
};
