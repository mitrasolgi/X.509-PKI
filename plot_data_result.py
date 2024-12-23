import json
import matplotlib.pyplot as plt

# Load performance data
with open("performance_data.json", "r") as f:
    data = json.load(f)

# Prepare data for plotting
x = list(data.keys())
y = [sum(times) for times in data.values()]  # Sum of all times per chain length

# Plot
plt.figure(figsize=(10, 6))
plt.plot(x, y, marker='o')
plt.xlabel("Trust Chain Length")
plt.ylabel("Time (seconds)")
plt.title("Trust Chain Length vs Time")
plt.grid()
plt.savefig("trust_chain_performance.png")
plt.show()
