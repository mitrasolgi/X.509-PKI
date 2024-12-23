import json
import matplotlib.pyplot as plt

# Load RESTful performance data
with open('performance_data.json', 'r') as f:
    restful_results = json.load(f)

# Load Smart Contract performance data
with open('smart_contract_performance.json', 'r') as f:
    smart_contract_results = json.load(f)

# Prepare RESTful data
rest_chain_lengths = list(map(int, restful_results.keys()))  # Extract chain lengths as integers
rest_chain_lengths.sort()  # Ensure sorted order
rest_times = [sum(restful_results[str(length)]) for length in rest_chain_lengths]  # Sum times for each length
print(f"Summed RESTful times (s): {rest_times}")
rest_times_seconds = [time for time in rest_times]  # Direct use, no conversion needed

# Prepare Smart Contract data
sc_chain_lengths = [entry["trustChainLength"] for entry in smart_contract_results]  # Extract chain lengths
sc_times = [entry["executionTime"] for entry in smart_contract_results]  # Extract execution times
sc_times_seconds = [time / 1000 for time in sc_times]  # Convert milliseconds to seconds

# Create the plot
plt.figure(figsize=(10, 6))

# Plot RESTful data
plt.plot(rest_chain_lengths, rest_times_seconds, marker='o', label="RESTful Service", color='r')

# Plot Smart Contract data
plt.plot(sc_chain_lengths, sc_times_seconds, marker='x', label="Smart Contract", color='b')

# Add labels, title, and legend
plt.xlabel('Trust Chain Length')
plt.ylabel('Execution Time (seconds)')
plt.title('Comparison of Execution Times: RESTful Service vs Smart Contract (in Seconds)')
plt.legend()
plt.grid(True)

# Save and show the plot
plt.savefig("trust_chain_performance_final_seconds.png")
plt.show()
