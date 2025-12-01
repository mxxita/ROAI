import { ProcessEvent, EventLog } from '@/types';
import { generateId } from '../utils';

export class XESParser {
  private parser: DOMParser;

  constructor() {
    this.parser = new DOMParser();
  }

  async parseFile(file: File): Promise<EventLog> {
    const text = await file.text();
    return this.parseXES(text);
  }

  parseXES(xmlContent: string): EventLog {
    const xmlDoc = this.parser.parseFromString(xmlContent, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XES file: XML parsing error');
    }

    const events: ProcessEvent[] = [];
    const traces = xmlDoc.querySelectorAll('trace');

    if (traces.length === 0) {
      throw new Error('No traces found in XES file');
    }

    traces.forEach((trace) => {
      const caseId = this.getAttributeValue(trace, 'concept:name') || generateId();
      const traceEvents = trace.querySelectorAll('event');

      traceEvents.forEach((event) => {
        const activityName = this.getAttributeValue(event, 'concept:name');
        const timestamp = this.getAttributeValue(event, 'time:timestamp');
        const userId = this.getAttributeValue(event, 'org:resource') ||
                      this.getAttributeValue(event, 'org:role') ||
                      'Unknown';

        if (!activityName || !timestamp) {
          console.warn('Event missing required attributes:', { activityName, timestamp });
          return;
        }

        // Parse timestamp
        let parsedDate: Date;
        try {
          parsedDate = new Date(timestamp);
          if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (e) {
          console.warn('Invalid timestamp:', timestamp);
          return;
        }

        // Collect additional attributes
        const attributes: Record<string, unknown> = {};
        const stringAttrs = event.querySelectorAll('string');
        const intAttrs = event.querySelectorAll('int');
        const floatAttrs = event.querySelectorAll('float');
        const boolAttrs = event.querySelectorAll('boolean');
        const dateAttrs = event.querySelectorAll('date');

        stringAttrs.forEach((attr) => {
          const key = attr.getAttribute('key');
          const value = attr.getAttribute('value');
          if (key && value && !['concept:name', 'org:resource', 'org:role'].includes(key)) {
            attributes[key] = value;
          }
        });

        intAttrs.forEach((attr) => {
          const key = attr.getAttribute('key');
          const value = attr.getAttribute('value');
          if (key && value) {
            attributes[key] = parseInt(value, 10);
          }
        });

        floatAttrs.forEach((attr) => {
          const key = attr.getAttribute('key');
          const value = attr.getAttribute('value');
          if (key && value) {
            attributes[key] = parseFloat(value);
          }
        });

        boolAttrs.forEach((attr) => {
          const key = attr.getAttribute('key');
          const value = attr.getAttribute('value');
          if (key && value) {
            attributes[key] = value.toLowerCase() === 'true';
          }
        });

        dateAttrs.forEach((attr) => {
          const key = attr.getAttribute('key');
          const value = attr.getAttribute('value');
          if (key && value && key !== 'time:timestamp') {
            attributes[key] = new Date(value);
          }
        });

        events.push({
          id: generateId(),
          case_id: caseId,
          activity: activityName,
          timestamp: parsedDate,
          user_id: userId,
          attributes,
        });
      });
    });

    if (events.length === 0) {
      throw new Error('No valid events found in XES file');
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
        name: 'Uploaded XES Log',
        uploadedAt: new Date(),
        caseCount: uniqueCases.size,
        activityCount: uniqueActivities.size,
        userCount: uniqueUsers.size,
        startDate: events[0].timestamp,
        endDate: events[events.length - 1].timestamp,
      },
    };
  }

  private getAttributeValue(element: Element, key: string): string | null {
    // Try all attribute types
    const selectors = [
      `string[key="${key}"]`,
      `date[key="${key}"]`,
      `int[key="${key}"]`,
      `float[key="${key}"]`,
      `boolean[key="${key}"]`,
    ];

    for (const selector of selectors) {
      const attr = element.querySelector(selector);
      if (attr) {
        return attr.getAttribute('value');
      }
    }

    return null;
  }
}
