// setup-functions.js

const fs = require('fs');
const path = require('path');
const { executeCommand } = require('./utils');
const { exec } = require('child_process');

// Get the project path from the command-line arguments
const projectPath = process.argv[2];

// Check if project path is provided
if (!projectPath) {
  console.error("Please provide a path to the project directory.");
  process.exit(1);
}

// Resolve the functions directory path
const functionsDir = path.join(projectPath, 'functions');

// Ensure the functions directory exists
if (!fs.existsSync(functionsDir)) {
  console.error(`The functions directory does not exist at: ${functionsDir}`);
  process.exit(1);
}

// Define the template functions directory path
const templateFunctionsDir = path.join(__dirname, "../template/functions");

// Define the source paths for .env and index.js in the template
const templateEnvPath = path.join(templateFunctionsDir, ".env");
const templateIndexJsPath = path.join(templateFunctionsDir, "index.js");

// Define the destination paths for .env and index.js in the functions directory
const envFilePath = path.join(functionsDir, ".env");
const indexFilePath = path.join(functionsDir, "index.js");

const copyFile = (source, destination) => {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copied ${source} to ${destination}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${destination}:`, error);
    process.exit(1);
  }
};

// Step 1: Copy .env file from template to functions directory, overwriting if exists
console.log("\n--- Copying .env file from template ---");
if (fs.existsSync(templateEnvPath)) {
  copyFile(templateEnvPath, envFilePath);
} else {
  console.error(`Template .env file does not exist at: ${templateEnvPath}`);
  process.exit(1);
}

// Step 2: Copy index.js file from template to functions directory, overwriting if exists
console.log("\n--- Copying index.js file from template ---");
if (fs.existsSync(templateIndexJsPath)) {
  copyFile(templateIndexJsPath, indexFilePath);
} else {
  console.error(`Template index.js file does not exist at: ${templateIndexJsPath}`);
  process.exit(1);
}

// Step 3: Install npm packages in the project directory
console.log("\n--- Installing packages in the project directory ---");
executeCommand(`npm install react-firebase-hooks`, { cwd: projectPath });
executeCommand(`npm install stripe`, { cwd: projectPath });
executeCommand(`npm install dotenv`, { cwd: projectPath });
executeCommand(`npm install cors`, { cwd: projectPath });
executeCommand(`npm install liamc9npm@latest`, { cwd: projectPath });
executeCommand(`npm install styled-components`, { cwd: projectPath });
executeCommand(`npm install react-toastify`, { cwd: projectPath });
executeCommand(`npm install swiper`, { cwd: projectPath});
executeCommand(`npm install dragula`, { cwd: projectPath });
executeCommand(`npm install react-router-dom`, { cwd: projectPath });


// Step 4: Install npm packages in the functions directory
console.log("\n--- Installing packages in the functions directory ---");
executeCommand(`npm install stripe`, { cwd: functionsDir });
executeCommand(`npm install dotenv`, { cwd: functionsDir });
executeCommand(`npm install cors`, { cwd: functionsDir });

// Step 5: Run features/stripe.js after installations
console.log("\n--- Running features/stripe.js ---");
const stripeScriptPath = path.join(__dirname, "features", "stripe.js");
executeCommand(`node "${stripeScriptPath}" "${projectPath}"`, { cwd: __dirname });

// Final message
console.log("\nSetup complete.");
