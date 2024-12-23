import requests
import time
import json

# Server URL
SERVER_URL = "http://localhost:3000"

# Function to measure operation time for a given trust chain length
def measure_operation(trust_chain_length):
    issued_to = "0xabA54d2Cc3338eB194d284961C634230e222a913"  # Replace with valid address
    parent_cert_id = "ROOT_CA_CERTIFICATE"

    times = []
    for i in range(trust_chain_length):
        # Issue intermediate certificates
        start_time = time.time()
        response = requests.post(
            f"{SERVER_URL}/issueCertificate",
            json={"issuedTo": issued_to, "parentCertId": parent_cert_id},
        )
        end_time = time.time()

        if response.status_code != 200:
            print(f"Failed at trust chain length {i + 1}: {response.json()}")
            break

        elapsed_time = end_time - start_time
        times.append(elapsed_time)
        parent_cert_id = response.json().get("intermediateCertId")  # Update parent cert

    # Ensure the times list matches the desired trust chain length
    return times[:trust_chain_length]

# Collect data for 10 points (scaling trust chain length by 100 each time)
results = {}
num_points = 1000
base_length = 1

for i in range(1, num_points + 1):
    length = base_length * i
    print(f"Measuring for trust chain length: {length}")
    results[length] = measure_operation(length)

# Save data to file
with open("performance_data.json", "w") as f:
    json.dump(results, f, indent=2)

print("Performance data saved to 'performance_data.json'")
