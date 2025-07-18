import os
import google.generativeai as genai
from datetime import datetime, timedelta
import argparse
import csv
import re

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyDNUTxxNUsAO90bYfERr-44Nanop3ddreI'))

def generate_citywise_women_safety_calls(date):
    prompt = f"""Generate exactly 20 realistic and significant women safety-related distress call records for India on {date} in CSV format with the following columns:
date,call_category,city,latitude,longitude,response_time_hr,severity_scale,incident_subtype,incident_radius_km,description,police_action_required,pincode

Strict Requirements:
1. Use exactly 5 entries each for these cities: Mumbai, Delhi, Bangalore, Chennai
2. call_category must be one of: Harassment, Violence, Exploitation, Emergency, Counseling, Health
3. latitude and longitude must be realistic and represent different local areas (not just city center)
4. response_time_hr: realistic float (e.g., 0.5 to 12.0 hours)
5. severity_scale: integer 1–10 (10 = most severe)
6. incident_subtype: real-world issues (e.g., stalking, domestic violence, cyberbullying, abduction, panic attack, trafficking)
7. incident_radius_km: float (e.g., 0.5–5.0 km)
8. description: one-sentence summary of the call situation
9. police_action_required: True or False
10. pincode: 6-digit Indian postal code matching the incident location (mandatory)
11. Ensure all 20 entries have unique, non-redundant locations and descriptions

Example:
{date},Violence,Mumbai,19.1075,72.8654,2.0,9,Domestic Violence,1.5,"Woman assaulted by husband in Andheri, rushed to hospital",True,400053"""

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)

        content = response.text.strip()
        calls = [line for line in content.split('\n') if line.startswith(date)]

        if len(calls) != 20:
            print(f"Warning: Got {len(calls)} records instead of 20 for {date}")

        return calls[:20]

    except Exception as e:
        print(f"Error generating women safety call data for {date}: {str(e)}")
        return []

def validate_date(date_str):
    try:
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
        if parsed_date > datetime(2025, 1, 1):
            print("Warning: Dates after January 2025 may use synthetic data")
        return True
    except ValueError:
        return False

def clean_call_data(parts):
    if len(parts) != 12:
        return None

    description = parts[9].strip()
    description = re.sub(r'^"|"$', '', description.strip())
    if ',' in description:
        description = f'"{description}"'

    police_flag = parts[10].strip().capitalize()
    if police_flag not in ['True', 'False']:
        police_flag = 'False'

    pincode = parts[11].strip()
    if not pincode.isdigit() or len(pincode) != 6:
        return None  # skip invalid pincode entries

    cleaned_parts = parts[:9] + [description, police_flag, pincode]
    return cleaned_parts

def write_to_csv(records, filename="women_safety_calls.csv"):
    header = ["date", "call_category", "city", "latitude", "longitude", "response_time_hr", 
              "severity_scale", "incident_subtype", "incident_radius_km", 
              "description", "police_action_required", "pincode"]

    file_exists = os.path.isfile(filename)

    with open(filename, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(header)

        for record in records:
            parts = record.split(',', 11)
            cleaned = clean_call_data(parts)
            if cleaned:
                writer.writerow(cleaned)

def main():
    parser = argparse.ArgumentParser(
        description='Generate women safety call records for a date range using Gemini AI',
        epilog='Example: python women_safety.py 2024-06-15 2024-06-20'
    )
    parser.add_argument('start_date', nargs='?', help='Start date in YYYY-MM-DD format', default=None)
    parser.add_argument('end_date', nargs='?', help='End date in YYYY-MM-DD format', default=None)
    args = parser.parse_args()

    start_date = args.start_date
    while not start_date or not validate_date(start_date):
        if start_date:
            print("Invalid start date format. Please use YYYY-MM-DD.")
        start_date = input("Enter start date (YYYY-MM-DD): ").strip()

    end_date = args.end_date
    while not end_date or not validate_date(end_date):
        if end_date:
            print("Invalid end date format. Please use YYYY-MM-DD.")
        end_date = input("Enter end date (YYYY-MM-DD): ").strip()

    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
    end_dt = datetime.strptime(end_date, '%Y-%m-%d')

    if start_dt > end_dt:
        print("Error: Start date cannot be after end date.")
        return

    print(f"\nFetching women safety calls from {start_date} to {end_date} using Gemini AI...")

    current_date = start_dt
    total_calls = 0
    category_counts = {}

    while current_date <= end_dt:
        date_str = current_date.strftime('%Y-%m-%d')
        print(f"\nProcessing date: {date_str}")
        calls = generate_citywise_women_safety_calls(date_str)

        if not calls:
            print(f"No call data could be generated for {date_str}.")
        else:
            write_to_csv(calls)
            for call in calls:
                parts = call.split(',', 11)
                cleaned = clean_call_data(parts)
                if cleaned:
                    print(','.join(cleaned))
                    category = cleaned[1]
                    category_counts[category] = category_counts.get(category, 0) + 1
                    total_calls += 1

        current_date += timedelta(days=1)

    print("\nSummary Statistics:")
    print(f"Total calls generated: {total_calls}")
    for cat, count in category_counts.items():
        print(f"{cat}: {count}")
    print("\nData saved to women_safety_calls.csv")

if __name__ == "__main__":
    main()
