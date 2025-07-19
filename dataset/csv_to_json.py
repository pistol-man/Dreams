import csv
import json

# Input and output file paths
csv_file_path = 'gov_util_data2.csv'
json_file_path = 'gov_util_data2.json'

# Read CSV and convert to JSON
with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    data = list(csv_reader)

# Write JSON output
with open(json_file_path, mode='w', encoding='utf-8') as json_file:
    json.dump(data, json_file, indent=4)

print(f"Converted '{csv_file_path}' to '{json_file_path}'")
