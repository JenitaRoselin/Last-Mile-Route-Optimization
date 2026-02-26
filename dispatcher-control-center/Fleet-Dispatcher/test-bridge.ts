import { spawn } from 'child_process';

const testData = {
  locations: [[13.08, 80.27], [13.04, 80.23]],
  num_vehicles: 1,
  capacities: [100],
  demands: [0, 10]
};

console.log("Checking Bridge...");

// We use 'python' or 'python3' depending on your installation
const py = spawn('python', ['solver.py']);

py.stdin.write(JSON.stringify(testData));
py.stdin.end();

py.stdout.on('data', (data) => {
  console.log("✅ Node received from Python:", data.toString());
});

py.stderr.on('data', (data) => {
  console.error("❌ Python Error:", data.toString());
});