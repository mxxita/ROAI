import { ProcessEvent, EventLog } from '@/types';
import { generateId } from '../utils';

export class CSVParser {
  async parseFile(file: File): Promise<EventLog> {
    const text = await file.text();
    return this.parseCSV(text);
  }

  parseCSV(csvContent: string): EventLog {
    const lines = csvContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header
    const headers = this.parseCSVLine(lines[0]);

    // Detect column mappings (case-insensitive)
    const columnMap = this.detectColumns(headers);

    if (!columnMap.caseId || !columnMap.activity || !columnMap.timestamp) {
      throw new Error(
        `CSV must contain columns for case ID, activity, and timestamp. Found columns: ${headers.join(', ')}`
      );
    }

    const events: ProcessEvent[] = [];
    const errors: string[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);

        if (values.length !== headers.length) {
          errors.push(`Line ${i + 1}: Column count mismatch`);
          continue;
        }

        const caseId = values[columnMap.caseId];
        const activity = values[columnMap.activity];
        const timestampStr = values[columnMap.timestamp];
        const userId = columnMap.userId !== null ? values[columnMap.userId] : 'Unknown';

        if (!caseId || !activity || !timestampStr) {
          errors.push(`Line ${i + 1}: Missing required fields`);
          continue;
        }

        // Parse timestamp - support multiple formats
        let timestamp: Date;
        try {
          timestamp = new Date(timestampStr);
          if (isNaN(timestamp.getTime())) {
            // Try parsing as ISO date
            timestamp = new Date(timestampStr.replace(' ', 'T'));
            if (isNaN(timestamp.getTime())) {
              throw new Error('Invalid date');
            }
          }
        } catch (e) {
          errors.push(`Line ${i + 1}: Invalid timestamp "${timestampStr}"`);
          continue;
        }

        // Collect additional attributes
        const attributes: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          if (
            index !== columnMap.caseId &&
            index !== columnMap.activity &&
            index !== columnMap.timestamp &&
            index !== columnMap.userId
          ) {
            const value = values[index];
            if (value) {
              // Try to parse as number
              const numValue = parseFloat(value);
              attributes[header] = isNaN(numValue) ? value : numValue;
            }
          }
        });

        events.push({
          id: generateId(),
          case_id: caseId,
          activity: activity,
          timestamp: timestamp,
          user_id: userId,
          attributes,
        });
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (events.length === 0) {
      throw new Error(`No valid events parsed. Errors:\n${errors.slice(0, 5).join('\n')}`);
    }

    if (errors.length > 0) {
      console.warn(`Parsed with ${errors.length} errors:`, errors.slice(0, 10));
    }

    // Sort events by timestamp
    events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate metadata
    const uniqueCases = new Set(events.map((e) => e.case_id));
    const uniqueActivities = new Set(events.map((e) => e.activity));
    const uniqueUsers = new Set(events.map((e) => e.user_id));

    return {
      events,
      metadata: {
        name: 'Uploaded CSV Log',
        uploadedAt: new Date(),
        caseCount: uniqueCases.size,
        activityCount: uniqueActivities.size,
        userCount: uniqueUsers.size,
        startDate: events[0].timestamp,
        endDate: events[events.length - 1].timestamp,
      },
    };
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  private detectColumns(headers: string[]): {
    caseId: number | null;
    activity: number | null;
    timestamp: number | null;
    userId: number | null;
  } {
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

    const caseIdPatterns = ['case', 'caseid', 'case_id', 'case id', 'id'];
    const activityPatterns = ['activity', 'event', 'concept:name', 'task', 'step'];
    const timestampPatterns = ['time', 'timestamp', 'time:timestamp', 'datetime', 'date'];
    const userIdPatterns = ['user', 'userid', 'user_id', 'resource', 'org:resource', 'actor'];

    const findColumn = (patterns: string[]) => {
      for (const pattern of patterns) {
        const index = lowerHeaders.findIndex((h) => h.includes(pattern));
        if (index !== -1) return index;
      }
      return null;
    };

    return {
      caseId: findColumn(caseIdPatterns),
      activity: findColumn(activityPatterns),
      timestamp: findColumn(timestampPatterns),
      userId: findColumn(userIdPatterns),
    };
  }
}
