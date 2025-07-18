import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const entry: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === 'Predicted_Severity_Scale' || header === 'Population_Density' || 
          header === 'latitude' || header === 'longitude') {
        entry[header] = parseFloat(value);
      } else {
        entry[header] = value;
      }
    });
    
    return entry;
  });
}
