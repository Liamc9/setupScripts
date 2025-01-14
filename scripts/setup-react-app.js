// setup-react-app.js

const path = require("path");
const fs = require("fs");
const { askQuestion, executeCommand } = require("./utils");

// Main async function
(async function main() {
  // Get the project name
  const projectName = process.argv[2];
  if (!projectName) {
    console.error("Please provide a project name.");
    process.exit(1);
  }

  const allProjectsDir = path.join(process.cwd(), "../../all_projects");
  const appDirectory = path.join(allProjectsDir, projectName);

  // Check if the project directory already exists
  if (fs.existsSync(appDirectory)) {
    console.error("A project with this name already exists.");
    process.exit(1);
  }

  // Initial prompts for feature selection
  console.log("\n--- Feature Selection ---");

  // Prompt for features
  const tailwindPrettierAnswer = await askQuestion(
    "Do you want to add Tailwind CSS and Prettier with Tailwind CSS plugin? (yes/no): "
  );
  const addTailwindPrettier = tailwindPrettierAnswer.toLowerCase().startsWith("y");

  const firebaseAnswer = await askQuestion("Do you want to add Firebase? (yes/no): ");
  const addFirebase = firebaseAnswer.toLowerCase().startsWith("y");

  const gitHubAnswer = await askQuestion(
    "Do you want to set up GitHub integration? (yes/no): "
  );
  const addGitHub = gitHubAnswer.toLowerCase().startsWith("y");

  // Step 1: Create a simple React app
  console.log("\n--- Setting up a simple React app ---");
  if (!fs.existsSync(allProjectsDir)) {
    fs.mkdirSync(allProjectsDir);
    console.log(`Created directory: ${allProjectsDir}`);
  }

  executeCommand(`npx create-react-app ${projectName}`, { cwd: allProjectsDir });

  // Step 2: Replace the src folder with the template src
  console.log("\n--- Replacing the src folder with template src ---");
  const templateSrc = path.join(__dirname, "../template/src");
  const projectSrc = path.join(appDirectory, "src");

  // Check if template src exists
  if (!fs.existsSync(templateSrc)) {
    console.error(`Template src folder does not exist at ${templateSrc}`);
    process.exit(1);
  }

  // Delete the entire src folder
  if (fs.existsSync(projectSrc)) {
    fs.rmSync(projectSrc, { recursive: true, force: true });
    console.log(`Deleted directory: ${projectSrc}`);
  }

  // Copy the template src folder to the new project
  fs.cpSync(templateSrc, projectSrc, { recursive: true });
  console.log(`Copied ${templateSrc} to ${projectSrc}`);

  console.log("\nSimple React app setup complete!");

  // Implement selected features
  const featureScriptsDir = path.join(__dirname, "features");

  if (addTailwindPrettier) {
    executeCommand(`node tailwindprettier.js "${appDirectory}"`, { cwd: featureScriptsDir });
  }

  if (addFirebase) {
    executeCommand(`node firebase.js "${appDirectory}"`, { cwd: featureScriptsDir });
  }

  if (addGitHub) {
    executeCommand(`node github.js "${appDirectory}"`, { cwd: featureScriptsDir });
  }

  console.log("\nAll selected features have been added to your app!");
  console.log(
    `\nNavigate to your project directory:\ncd ${path.relative(
      process.cwd(),
      appDirectory
    )}`
  );
})();
