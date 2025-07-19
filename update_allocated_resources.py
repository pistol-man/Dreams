import json
import math

def update_allocated_resources():
    # Read the JSON file
    with open('dataset/Mum_predictions.json', 'r') as file:
        data = json.load(file)
    
    # Update each entry
    for entry in data:
        # Calculate 10% of current allocated values
        entry['Allocated_Fire_Brigade_Vehicles'] = str(max(1, math.floor(int(entry['Allocated_Fire_Brigade_Vehicles']) * 0.1)))
        entry['Allocated_Ambulances'] = str(max(1, math.floor(int(entry['Allocated_Ambulances']) * 0.1)))
        entry['Allocated_Police_Personnel'] = str(max(1, math.floor(int(entry['Allocated_Police_Personnel']) * 0.1)))
        entry['Allocated_Paramedics'] = str(max(1, math.floor(int(entry['Allocated_Paramedics']) * 0.1)))
        entry['Allocated_Doctors'] = str(max(1, math.floor(int(entry['Allocated_Doctors']) * 0.1)))
    
    # Write back to file
    with open('dataset/Mum_predictions.json', 'w') as file:
        json.dump(data, file, indent=4)
    
    print("Updated allocated resources to 10% of current values (minimum 1)")

if __name__ == "__main__":
    update_allocated_resources() 