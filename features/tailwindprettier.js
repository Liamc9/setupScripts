// features/tailwindprettier.js
const fs = require("fs");
const path = require("path");
const { executeCommand } = require("../utils");

// Get the project directory from command-line arguments
const appDirectory = process.argv[2];
if (!appDirectory) {
  console.error("Please provide the path to your React app directory.");
  process.exit(1);
}

(async function setupTailwindAndPrettier() {
  console.log("\n--- Adding Tailwind CSS and Prettier with Tailwind Plugin ---");

  // Install Tailwind CSS and PostCSS dependencies
  await executeCommand("npm install tailwindcss postcss autoprefixer", {
    cwd: appDirectory,
  });
  await executeCommand("npx tailwindcss init -p", { cwd: appDirectory });

  // Modify `tailwind.config.js`
  const tailwindConfigPath = path.join(appDirectory, "tailwind.config.js");
  const tailwindConfigContent = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
  fs.writeFileSync(tailwindConfigPath, tailwindConfigContent.trim());
  console.log(`Modified: ${tailwindConfigPath}`);

  // Update `index.css`
  const indexCssPath = path.join(appDirectory, "src", "index.css");
  const indexCssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  background-color: white;
  height: 100%;
  margin: 0;
  padding: 0;
  overscroll-behavior-y: none;
}

#root {
  min-height: 100%;
}
`;
  fs.writeFileSync(indexCssPath, indexCssContent.trim());
  console.log(`Modified: ${indexCssPath}`);

  // Install Prettier and Tailwind CSS Prettier Plugin
  await executeCommand(
    "npm install -D prettier prettier-plugin-tailwindcss --legacy-peer-deps",
    {
      cwd: appDirectory,
    }
  );

  // Create `.prettierrc.json`
  const prettierConfigPath = path.join(appDirectory, ".prettierrc.json");
  const prettierConfigContent = `
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
`;
  fs.writeFileSync(prettierConfigPath, prettierConfigContent.trim());
  console.log(`Created: ${prettierConfigPath}`);

  console.log("Tailwind CSS and Prettier with Tailwind plugin have been added!");
})();
