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

  const allProjectsDir = path.join(process.cwd(), "../all_projects");
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

  // Remove unwanted files
  const filesToDelete = [
    "src/App.css",
    "src/App.test.js",
    "src/logo.svg",
    "src/reportWebVitals.js",
    "src/setupTests.js",
    "src/App.js",
  ];
  filesToDelete.forEach((file) => {
    const filePath = path.join(appDirectory, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  });

  // Create directories
  const routesDirectory = path.join(appDirectory, "src", "routes");
  if (!fs.existsSync(routesDirectory)) {
    fs.mkdirSync(routesDirectory);
    console.log(`Created directory: ${routesDirectory}`);
  }
  const componentsDirectory = path.join(appDirectory, "src", "components");
  if (!fs.existsSync(componentsDirectory)) {
    fs.mkdirSync(componentsDirectory);
    console.log(`Created directory: ${componentsDirectory}`);
  }
  const assetsDirectory = path.join(appDirectory, "src", "assets");
  if (!fs.existsSync(assetsDirectory)) {
    fs.mkdirSync(assetsDirectory);
    console.log(`Created directory: ${assetsDirectory}`);
  }

  // Modify `index.js`
  const indexJsPath = path.join(appDirectory, "src", "index.js");
  const indexJsContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <h1>Hello World</h1>
  </React.StrictMode>
);
`;
  fs.writeFileSync(indexJsPath, indexJsContent.trim());
  console.log(`Modified: ${indexJsPath}`);

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
