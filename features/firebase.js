// features/firebase.js
const fs = require("fs");
const path = require("path");
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

  // Create `firebase-config.js` in `src` folder
  const srcDirectory = path.join(appDirectory, "src");
  const firebaseConfigPath = path.join(srcDirectory, "firebase-config.js");
  const firebaseConfigContent = `
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  // TODO: Add your Firebase configuration here
};

// Initialize Firebase and export services
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
`;
  fs.writeFileSync(firebaseConfigPath, firebaseConfigContent.trim());
  console.log(`Created: ${firebaseConfigPath}`);

  console.log("Firebase has been added!");
  console.log("Don't forget to add your Firebase configuration in 'firebase-config.js'.");
})();
