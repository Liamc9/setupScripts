// features/github.js
const path = require("path");
const { executeCommand, askQuestion } = require("../utils");

// Get the project directory from command-line arguments
const appDirectory = process.argv[2];
if (!appDirectory) {
  console.error("Please provide the path to your React app directory.");
  process.exit(1);
}

(async function setupGitHub() {
  console.log("\n--- Setting Up GitHub Integration ---");

  const githubRepoUrl = await askQuestion(
    "Please enter your GitHub repository URL (or leave blank to skip): "
  );

  if (githubRepoUrl) {
    try {
      // Initialize git repository
      executeCommand("git init", { cwd: appDirectory });

      // Add remote origin
      executeCommand(`git remote add origin ${githubRepoUrl}`, { cwd: appDirectory });

      // Stage all files
      executeCommand("git add .", { cwd: appDirectory });

      // Commit with a default message
      executeCommand('git commit -m "Initial commit"', { cwd: appDirectory });

      // Push to GitHub
      executeCommand("git push -u origin master", { cwd: appDirectory });

      console.log("✅ GitHub integration has been set up and project files have been pushed to the repository!");
    } catch (error) {
      console.error("❌ An error occurred while setting up GitHub integration.");
      process.exit(1);
    }
  } else {
    console.log("ℹ️  GitHub repository URL not provided. Skipping GitHub integration.");
  }
})();
