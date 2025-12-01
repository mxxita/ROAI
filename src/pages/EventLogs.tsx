import { useState, useRef } from 'react';
import { Upload, Sparkles, FileText, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { generateSampleData } from '@/data/generator';
import { discoverProcess, checkConformance, analyzeUsers } from '@/lib/process-mining';
import { STATIC_DEMO_MODEL, STATIC_DEMO_EVENTLOG, STATIC_DEMO_USERS, STATIC_DEMO_STATS, STATIC_DEMO_CONFORMANCE } from '@/data/static-demo';
import { XESParser } from '@/lib/parsers/xes-parser';
import { CSVParser } from '@/lib/parsers/csv-parser';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export default function EventLogs() {
  const { eventLog, setEventLog, setProcessModel, setConformance, setUsers, setGlobalStats } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processEventLog = async (log: any) => {
    setLoadingMessage('Discovering process model...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const model = discoverProcess(log);
    setProcessModel(model);

    setLoadingMessage('Checking conformance...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const conformance = checkConformance(log, model);
    setConformance(conformance);

    setLoadingMessage('Analyzing users...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const { users, stats } = analyzeUsers(log, conformance);
    setUsers(users);
    setGlobalStats(stats);
  };

  const handleLoadStaticDemo = async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage('Loading static demo visualization...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load the static demo data directly
      setEventLog(STATIC_DEMO_EVENTLOG);
      setProcessModel(STATIC_DEMO_MODEL);
      setConformance(STATIC_DEMO_CONFORMANCE);
      setUsers(STATIC_DEMO_USERS);
      setGlobalStats(STATIC_DEMO_STATS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load static demo');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSample = async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage('Generating sample data...');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const log = generateSampleData();
      setEventLog(log);

      await processEventLog(log);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setLoadingMessage(`Parsing ${file.name}...`);

    try {
      let log;

      if (file.name.endsWith('.xes')) {
        const parser = new XESParser();
        log = await parser.parseFile(file);
      } else if (file.name.endsWith('.csv')) {
        const parser = new CSVParser();
        log = await parser.parseFile(file);
      } else {
        throw new Error('Unsupported file format. Please upload a .xes or .csv file.');
      }

      setEventLog(log);
      await processEventLog(log);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message={loadingMessage} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState
          title="Upload Failed"
          message={error}
          retry={() => {
            setError(null);
          }}
        />
      </div>
    );
  }

  if (!eventLog) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">Event Logs</h1>
        <p className="text-muted mb-8">Upload or generate process event data</p>

        <div className="max-w-2xl mx-auto mt-16">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xes,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Area */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-surface-3 rounded-lg p-12 text-center hover:border-accent-blue hover:bg-accent-blue/5 transition-colors cursor-pointer"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted" />
                <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
                <p className="text-sm text-muted mb-4">
                  Supports XES and CSV formats
                </p>
                <div className="flex gap-2 justify-center">
                  <Badge variant="blue">
                    <FileText className="w-3 h-3 mr-1" />
                    .xes
                  </Badge>
                  <Badge variant="blue">
                    <FileText className="w-3 h-3 mr-1" />
                    .csv
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Requirements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">File Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent-blue" />
                  XES Format
                </h4>
                <p className="text-sm text-muted">
                  Standard XML-based event log format. Must contain traces with events including:
                  <code className="ml-1 px-1 py-0.5 bg-surface-2 rounded text-xs">concept:name</code>,
                  <code className="ml-1 px-1 py-0.5 bg-surface-2 rounded text-xs">time:timestamp</code>, and
                  <code className="ml-1 px-1 py-0.5 bg-surface-2 rounded text-xs">org:resource</code>
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent-blue" />
                  CSV Format
                </h4>
                <p className="text-sm text-muted mb-2">
                  Must include headers with columns for case ID, activity name, timestamp, and optionally user/resource.
                  Common column names are automatically detected:
                </p>
                <ul className="text-xs text-muted space-y-1 ml-4">
                  <li>• <strong>Case:</strong> case, caseid, case_id, id</li>
                  <li>• <strong>Activity:</strong> activity, event, task, concept:name</li>
                  <li>• <strong>Timestamp:</strong> time, timestamp, datetime, time:timestamp</li>
                  <li>• <strong>User:</strong> user, resource, org:resource, actor</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <div className="text-center">
            <p className="text-sm text-muted mb-4">Or explore with demo data</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleLoadStaticDemo} variant="default">
                <Zap className="w-4 h-4 mr-2" />
                Load Static Demo
              </Button>
              <Button onClick={handleGenerateSample} variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Random Data
              </Button>
            </div>
            <p className="text-xs text-muted mt-3">
              Static Demo shows a realistic loan application process with 22 activities
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Event Logs</h1>
          <p className="text-muted">Process event data overview</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xes,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={handleUploadClick}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New File
          </Button>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eventLog.events.length.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Unique Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eventLog.metadata.caseCount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eventLog.metadata.activityCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eventLog.metadata.userCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Log Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Log Information</CardTitle>
          <CardDescription>Metadata about the loaded event log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted mb-1">Dataset Name</p>
              <p className="font-medium">{eventLog.metadata.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Uploaded At</p>
              <p className="font-medium">{eventLog.metadata.uploadedAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Start Date</p>
              <p className="font-medium">{eventLog.metadata.startDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">End Date</p>
              <p className="font-medium">{eventLog.metadata.endDate.toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Table Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Event Log Preview</CardTitle>
          <CardDescription>Showing first 20 events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3">
                  <th className="text-left py-3 px-4 font-medium text-muted">Case ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Activity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-muted">User</th>
                </tr>
              </thead>
              <tbody>
                {eventLog.events.slice(0, 20).map((event) => (
                  <tr key={event.id} className="border-b border-surface-3/50 hover:bg-surface-2">
                    <td className="py-3 px-4 font-mono text-xs">{event.case_id}</td>
                    <td className="py-3 px-4">
                      <Badge variant="blue">{event.activity}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted tabular-nums">
                      {event.timestamp.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{event.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
