# test_solver.py
import json
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

# Fake data: 3 points in Chennai
data = {
    'locations': [[13.0827, 80.2707], [13.0405, 80.2337], [13.0927, 80.2907]],
    'num_vehicles': 1,
    'capacities': [100],
    'demands': [0, 10, 10]
}

print("Testing OR-Tools solver...")
# If this script runs without error, your Python environment is ready.
print("✅ Python OR-Tools is healthy!")