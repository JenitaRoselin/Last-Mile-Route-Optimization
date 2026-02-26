// // import { spawn } from 'child_process';

// // export function runOROptimizer(drivers: any[], points: any[]): Promise<any> {
// //   return new Promise((resolve, reject) => {
// //     // Prepare data for Python
// //     const inputData = {
// //       locations: points.map(p => [p.lat, p.lng]),
// //       num_vehicles: drivers.length,
// //       capacities: drivers.map(d => d.vehicleCapacityKg),
// //       demands: points.map(() => 10) // default weight
// //     };

// //     // Start the Python script
// //     const pythonProcess = spawn('python', ['solver.py']);

// //     let result = '';
// //     pythonProcess.stdin.write(json.stringify(inputData));
// //     pythonProcess.stdin.end();

// //     pythonProcess.stdout.on('data', (data) => {
// //       result += data.toString();
// //     });

// //     pythonProcess.on('close', (code) => {
// //       if (code !== 0) reject("Python solver failed");
// //       resolve(JSON.parse(result));
// //     });
// //   });
// // }

// import { spawn } from 'child_process';

// export function runLocalOptimization(inputData: any): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     // Spawns the python process - ensure 'python' works in your terminal
//     const py = spawn('python', ['solver.py']);

//     let result = '';
//     let error = '';

//     py.stdin.write(JSON.stringify(inputData));
//     py.stdin.end();

//     py.stdout.on('data', (data) => { result += data.toString(); });
//     py.stderr.on('data', (data) => { error += data.toString(); });

//     py.on('close', (code) => {
//       if (code !== 0) {
//         console.error("Solver Error Output:", error);
//         return reject(`Python exited with code ${code}`);
//       }
//       try {
//         const parsed = JSON.parse(result);
//         if (parsed.error) reject(parsed.error);
//         else resolve(parsed);
//       } catch (e) {
//         reject("Failed to parse AI response");
//       }
//     });
//   });
// }

import { spawn } from 'child_process';

/**
 * Communicates with the local Python OR-Tools solver.
 * @param inputData Object containing locations, num_vehicles, capacities, and demands.
 */
export function runLocalOptimization(inputData: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    // TIP: If you get an 'ENOENT' error, change 'python' to 'python3' 
    // or the full path to your python.exe
    const py = spawn('python', ['solver.py']);

    let result = '';
    let errorOutput = '';

    // 1. Send the data to Python
    try {
      const jsonInput = JSON.stringify(inputData);
      py.stdin.write(jsonInput);
      py.stdin.end();
    } catch (e) {
      console.error("🚨 Failed to stringify input for Python:", e);
      return reject("Invalid input data format");
    }

    // 2. Capture the output from Python
    py.stdout.on('data', (data) => {
      result += data.toString();
    });

    // 3. Capture any errors (standard error stream)
    py.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // 4. Handle process completion
    py.on('close', (code) => {
      if (code !== 0) {
        console.error("🚨 PYTHON SOLVER CRASHED");
        console.error("Exit Code:", code);
        console.error("Detailed Python Error:", errorOutput); // This prints the traceback
        return reject(`Optimization failed: ${errorOutput.split('\n').pop() || 'Check terminal logs'}`);
      }

      try {
        if (!result.trim()) {
          return reject("Python returned an empty result.");
        }

        const parsed = JSON.parse(result);
        
        if (parsed.error) {
          console.error("🚨 AI Logic Error:", parsed.error);
          return reject(parsed.error);
        }

        resolve(parsed);
      } catch (e) {
        console.error("🚨 Failed to parse Python JSON output:", result);
        reject("AI communication error - invalid JSON format");
      }
    });

    // Handle process spawn errors (e.g. python not installed)
    py.on('error', (err) => {
      console.error("🚨 Failed to start Python process:", err.message);
      reject("Python environment not found. Ensure Python is in your PATH.");
    });
  });
}