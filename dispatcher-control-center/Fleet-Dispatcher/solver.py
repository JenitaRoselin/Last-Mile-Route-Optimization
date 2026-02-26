# # # import sys
# # # import json
# # # from ortools.constraint_solver import routing_enums_pb2
# # # from ortools.constraint_solver import pywrapcp

# # # def solve():
# # #     # Read data from Node.js (passed via stdin)
# # #     input_data = json.loads(sys.stdin.read())
    
# # #     locations = input_data['locations'] # [[lat, lng], ...]
# # #     num_vehicles = input_data['num_vehicles']
# # #     capacities = input_data['capacities']
# # #     demands = input_data['demands']

# # #     # Create the routing model
# # #     manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, 0)
# # #     routing = pywrapcp.RoutingModel(manager)

# # #     # 1. Create Distance Callback (Simplified Euclidean for local)
# # #     def distance_callback(from_index, to_index):
# # #         from_node = manager.IndexToNode(from_index)
# # #         to_node = manager.IndexToNode(to_index)
# # #         # Basic distance math
# # #         return int(((locations[from_node][0] - locations[to_node][0])**2 + 
# # #                     (locations[from_node][1] - locations[to_node][1])**2)**0.5 * 10000)

# # #     transit_callback_index = routing.RegisterTransitCallback(distance_callback)
# # #     routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

# # #     # 2. Add Capacity Constraints
# # #     def demand_callback(from_index):
# # #         return demands[manager.IndexToNode(from_index)]

# # #     demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
# # #     routing.AddDimensionWithVehicleCapacity(
# # #         demand_callback_index, 0, capacities, True, 'Capacity')

# # #     # 3. Solve
# # #     search_parameters = pywrapcp.DefaultRoutingSearchParameters()
# # #     search_parameters.first_solution_strategy = (
# # #         routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

# # #     solution = routing.SolveWithParameters(search_parameters)

# # #     # 4. Format Output
# # #     if solution:
# # #         output = []
# # #         for vehicle_id in range(num_vehicles):
# # #             index = routing.Start(vehicle_id)
# # #             route = []
# # #             while not routing.IsEnd(index):
# # #                 route.append(manager.IndexToNode(index))
# # #                 index = solution.Value(routing.NextVar(index))
# # #             output.append({"vehicle": vehicle_id, "route": route})
# # #         print(json.dumps(output))

# # # if __name__ == '__main__':
# # #     solve()

# # import sys
# # import json
# # from ortools.constraint_solver import routing_enums_pb2
# # from ortools.constraint_solver import pywrapcp

# # def solve():
# #     try:
# #         # Read data from Node.js
# #         line = sys.stdin.read()
# #         if not line:
# #             return
# #         input_data = json.loads(line)
# #     except Exception as e:
# #         print(json.dumps({"error": str(e)}))
# #         return
    
# #     locations = input_data['locations']
# #     num_vehicles = int(input_data['num_vehicles'])
# #     capacities = [int(c) for c in input_data['capacities']]6
# #     demands = [int(d) for d in input_data['demands']]

# #     # The first 'num_vehicles' in the locations list are the current driver positions.
# #     # We tell OR-Tools that vehicle 0 starts at index 0, vehicle 1 at index 1, etc.
# #     starts = list(range(num_vehicles))
# #     ends = list(range(num_vehicles))

# #     manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, starts, ends)
# #     routing = pywrapcp.RoutingModel(manager)

# #     # Distance Callback with Chennai 'Circuity Factor' (1.3x for real road turns)
# #     def distance_callback(from_index, to_index):
# #         from_node = manager.IndexToNode(from_index)
# #         to_node = manager.IndexToNode(to_index)
# #         dist = ((locations[from_node][0] - locations[to_node][0])**2 + 
# #                 (locations[from_node][1] - locations[to_node][1])**2)**0.5
# #         return int(dist * 130000) # Scaling for integer solver

# #     transit_callback_index = routing.RegisterTransitCallback(distance_callback)
# #     routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

# #     # Capacity Constraints
# #     def demand_callback(from_index):
# #         return demands[manager.IndexToNode(from_index)]

# #     demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
# #     routing.AddDimensionWithVehicleCapacity(
# #         demand_callback_index, 0, capacities, True, 'Capacity')

# #     # Solver Parameters
# #     search_parameters = pywrapcp.DefaultRoutingSearchParameters()
# #     search_parameters.first_solution_strategy = (
# #         routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

# #     solution = routing.SolveWithParameters(search_parameters)

# #     # Format Output: Return the list of delivery point indices for each driver
# #     if solution:
# #         output = []
# #         for vehicle_id in range(num_vehicles):
# #             index = routing.Start(vehicle_id)
# #             route = []
# #             while not routing.IsEnd(index):
# #                 node = manager.IndexToNode(index)
# #                 # We only want to return the delivery points (indices > num_vehicles)
# #                 if node >= num_vehicles:
# #                     route.append(node - num_vehicles) 
# #                 index = solution.Value(routing.NextVar(index))
# #             output.append({"vehicle_index": vehicle_id, "route_indices": route})
# #         print(json.dumps(output))
# #     else:
# #         print(json.dumps({"error": "No solution found"}))

# # if __name__ == '__main__':
# #     solve()

# import sys
# import json
# from ortools.constraint_solver import routing_enums_pb2
# from ortools.constraint_solver import pywrapcp

# def solve():
#     try:
#         input_data = json.loads(sys.stdin.read())
        
#         # --- DATA SANITIZATION ---
#         locations = input_data['locations']
#         num_vehicles = int(input_data['num_vehicles'])
#         # Force capacities and demands to be pure integers
#         capacities = [int(c) for c in input_data['capacities']]
#         demands = [int(d) for d in input_data['demands']]
        
#         # The number of locations MUST be num_vehicles (starts) + len(delivery_points)
#         # We define starts and ends as the first N indices
#         starts = list(range(num_vehicles))
#         ends = list(range(num_vehicles))

#         manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, starts, ends)
#         routing = pywrapcp.RoutingModel(manager)

#         # --- CALLBACKS ---
#         # Use haversine distance and provided vehicle speed (km/h) to compute travel time in minutes
#         vehicle_speed_kmh = float(input_data.get('vehicle_speed_kmh', 30))

#         def haversine(lat1, lon1, lat2, lon2):
#             from math import radians, sin, cos, sqrt, atan2
#             R = 6371.0
#             dlat = radians(lat2 - lat1)
#             dlon = radians(lon2 - lon1)
#             a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
#             c = 2 * atan2(sqrt(a), sqrt(1 - a))
#             return R * c

#         def travel_time_callback(from_index, to_index):
#             from_node = manager.IndexToNode(from_index)
#             to_node = manager.IndexToNode(to_index)
#             dist_km = haversine(locations[from_node][0], locations[from_node][1], locations[to_node][0], locations[to_node][1])
#             # travel time in minutes
#             minutes = (dist_km / vehicle_speed_kmh) * 60.0
#             return int(minutes)

#         transit_callback_index = routing.RegisterTransitCallback(travel_time_callback)
#         routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

#         def demand_callback(from_index):
#             node = manager.IndexToNode(from_index)
#             if node < len(demands):
#                 return demands[node]
#             return 0

#         demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
#         routing.AddDimensionWithVehicleCapacity(
#             demand_callback_index, 0, capacities, True, 'Capacity')

#         # Time windows handling
#         time_windows = input_data.get('time_windows', None)
#         if time_windows:
#             # Add Time dimension (units: minutes)
#             horizon = 24 * 60
#             time = 'Time'
#             routing.AddDimension(
#                 transit_callback_index,
#                 horizon,  # allow waiting slack up to horizon
#                 horizon,  # maximum cumulative time
#                 True,     # start cumul to zero
#                 time)
#             time_dimension = routing.GetDimensionOrDie(time)
#             # Apply time windows per location
#             for node_idx, tw in enumerate(time_windows):
#                 if tw is None:
#                     continue
#                 earliest = int(tw[0])
#                 latest = int(tw[1])
#                 index = manager.NodeToIndex(node_idx)
#                 time_dimension.CumulVar(index).SetRange(earliest, latest)

#         # --- SOLVER ---
#         search_parameters = pywrapcp.DefaultRoutingSearchParameters()
#         search_parameters.first_solution_strategy = (
#             routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

#         solution = routing.SolveWithParameters(search_parameters)

#         if solution:
#             output = []
#             # Get the Time dimension if it exists
#             has_time_dim = time_windows is not None
#             time_dimension = routing.GetDimensionOrDie('Time') if has_time_dim else None
            
#             for vehicle_id in range(num_vehicles):
#                 index = routing.Start(vehicle_id)
#                 route = []
#                 arrival_minutes = []
#                 while not routing.IsEnd(index):
#                     node = manager.IndexToNode(index)
#                     # Only include delivery nodes (skip vehicle start positions)
#                     if node >= num_vehicles:
#                         # Map back to delivery array index
#                         delivery_idx = node - num_vehicles
#                         route.append(delivery_idx)
#                         # Get the cumulative time from the solver's Time dimension
#                         if has_time_dim and time_dimension:
#                             try:
#                                 cumul_time = solution.Value(time_dimension.CumulVar(index))
#                                 arrival_minutes.append(int(cumul_time))
#                             except Exception:
#                                 arrival_minutes.append(0)
#                         else:
#                             arrival_minutes.append(0)
#                     index = solution.Value(routing.NextVar(index))
#                 output.append({"vehicle_index": vehicle_id, "route_indices": route, "arrival_minutes": arrival_minutes})
#             print(json.dumps(output))
#         else:
#             print(json.dumps({"error": "No solution found"}))

#     except Exception as e:
#         print(json.dumps({"error": str(e)}))

# if __name__ == '__main__':
#     solve()

import sys
import json
import math
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve():
    try:
        # 1. Read input from Node.js stdin
        raw_input = sys.stdin.read()
        if not raw_input:
            return
        input_data = json.loads(raw_input)
        
        # --- DATA SANITIZATION ---
        locations = input_data['locations']
        num_vehicles = int(input_data['num_vehicles'])
        capacities = [int(c) for c in input_data['capacities']]
        demands = [int(d) for d in input_data['demands']]
        # Simulated average speed for urban Tamil Nadu (km/h)
        vehicle_speed_kmh = float(input_data.get('vehicle_speed_kmh', 30))
        
        # Starts and ends correspond to the first N indices (driver positions)
        starts = list(range(num_vehicles))
        ends = list(range(num_vehicles))

        manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, starts, ends)
        routing = pywrapcp.RoutingModel(manager)

        # --- TRAFFIC-AWARE HELPERS ---
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0  # Earth radius in km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = (math.sin(dlat / 2)**2 + 
                 math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        def time_callback(from_index, to_index):
            """Calculates travel time in minutes with Urban Circuity Factor."""
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            
            # Straight-line distance
            base_dist = haversine(
                locations[from_node][0], locations[from_node][1],
                locations[to_node][0], locations[to_node][1]
            )
            
            # PROOF OF CONCEPT: Urban Circuity Factor (1.3x) 
            # Accounts for real road distance vs straight line in Chennai/Urban areas
            actual_road_dist = base_dist * 1.3
            
            # Minutes = (Distance / Speed) * 60
            minutes = (actual_road_dist / vehicle_speed_kmh) * 60.0
            return int(minutes)

        transit_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # --- CONSTRAINTS ---
        # Capacity Constraint (Cargo weight)
        def demand_callback(from_index):
            node = manager.IndexToNode(from_index)
            return demands[node] if node < len(demands) else 0

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index, 0, capacities, True, 'Capacity')

        # Time Window Constraint (Deadlines/Due Time)
        horizon = 1440  # 24 hours in minutes
        routing.AddDimension(transit_callback_index, horizon, horizon, True, 'Time')
        time_dimension = routing.GetDimensionOrDie('Time')

        time_windows = input_data.get('time_windows', [])
        for node_idx, tw in enumerate(time_windows):
            if tw:
                index = manager.NodeToIndex(node_idx)
                # Ensure delivery happens within the [earliest, latest] window (Due Time)
                time_dimension.CumulVar(index).SetRange(int(tw[0]), int(tw[1]))

        # --- SEARCH PARAMETERS ---
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
        # Add a time limit to prevent the solver from hanging
        search_parameters.time_limit.seconds = 5

        # --- SOLVE ---
        solution = routing.SolveWithParameters(search_parameters)

        if solution:
            output = []
            for vehicle_id in range(num_vehicles):
                index = routing.Start(vehicle_id)
                route = []
                arrival_times = []
                while not routing.IsEnd(index):
                    node = manager.IndexToNode(index)
                    # Skip vehicle start positions (Indices < num_vehicles)
                    if node >= num_vehicles:
                        route.append(node - num_vehicles)
                        arrival_times.append(int(solution.Value(time_dimension.CumulVar(index))))
                    index = solution.Value(routing.NextVar(index))
                output.append({
                    "vehicle_index": vehicle_id, 
                    "route_indices": route, 
                    "arrival_minutes": arrival_times
                })
            print(json.dumps(output))
        else:
            print(json.dumps({"error": "No feasible solution found under current traffic/time constraints"}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    solve()
