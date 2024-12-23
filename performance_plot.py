import matplotlib.pyplot as plt
import numpy as np

# Sample data: Replace these values with actual execution times measured during tests
smart_contract_issuance_time = 141  # Smart contract certificate issuance time in milliseconds

rest_api_issuance_time = 83  # REST API certificate issuance time in milliseconds

# Data for plotting
labels = ['Issuance']
smart_contract_times = [smart_contract_issuance_time]
rest_api_times = [rest_api_issuance_time]

# X-axis positions
x = np.arange(len(labels))

# Width of bars
width = 0.35

# Create a bar plot
fig, ax = plt.subplots(figsize=(10, 6))

bars1 = ax.bar(x - width/2, smart_contract_times, width, label='Smart Contract', color='b')
bars2 = ax.bar(x + width/2, rest_api_times, width, label='REST API', color='g')

# Add text for labels, title and custom x-axis tick labels
ax.set_xlabel('Action')
ax.set_ylabel('Execution Time (ms)')
ax.set_title('Performance Comparison: Smart Contract vs REST API')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend()

# Display the plot
plt.tight_layout()
plt.show()
