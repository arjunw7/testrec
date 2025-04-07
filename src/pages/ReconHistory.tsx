import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reconService } from '@/services/reconService';
import { format, subDays } from 'date-fns';
import debounce from 'lodash/debounce';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { SummaryTab } from '@/components/SummaryTab';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { WorkflowProvider } from '@/context/WorkflowContext';

interface ReconFile {
  id: string;
  file_type: string;
  storage_path: string;
  record_count: number;
}

interface ReconSummary {
  id: string;
  summary: any;
}

interface Recon {
  id: string;
  company_name: string;
  policy_name: string;
  insurer_name: string;
  is_exported: boolean;
  created_by_id: string;
  created_by_email: string;
  created_by_name: string;
  start_time: string;
  recon_time: string;
  export_time: string;
  time_to_recon: string;
  time_to_export: string;
  recon_files: ReconFile[];
  recon_summary: ReconSummary[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function ReconHistory() {
  const navigate = useNavigate();
  const [recons, setRecons] = useState<Recon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedRecon, setSelectedRecon] = useState<Recon | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeTab, setActiveTab] = useState('history');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500),
    []
  );

  const loadReconHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, count } = await reconService.getReconHistory(page, pageSize, debouncedSearchTerm);
      setRecons(data || []);
      setTotalRecords(count || 0);
    } catch (error) {
      console.error('Error loading recon history:', error);
      setError('Failed to load reconciliation history. Please try again.');
      setRecons([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearchTerm]);

  const loadAnalytics = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;
    
    try {
      setAnalyticsLoading(true);
      setError(null);
      const data = await reconService.getAnalytics(dateRange.from, dateRange.to);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data. Please try again.');
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadReconHistory();
  }, [loadReconHistory]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, loadAnalytics]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    debouncedSearch(value);
  };

  const handleDownload = async (file: ReconFile) => {
    try {
      setDownloadingFiles(prev => ({ ...prev, [file.id]: true }));
      const blob = await reconService.downloadFile(file.storage_path);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name || `${file.file_type}_data.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [file.id]: false }));
    }
  };

  const formatDuration = (duration: string | null | undefined): string => {
    if (!duration) return '-';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    
    const [_, hours, minutes, seconds] = match;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return '-';
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const hasSummary = (recon: Recon) => {
    return recon.recon_summary?.length > 0 && recon.recon_summary[0]?.summary;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        company={null}
        policy={null}
        onRestart={() => navigate('/')}
        onReconData={() => {}}
        onReset={() => {}}
        hasReconData={false}
        reconData={null}
      />

      <main className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company, policy, insurer, or user..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(parseInt(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company & Policy</TableHead>
                    <TableHead>Created By & Date</TableHead>
                    <TableHead>Status & Duration</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-muted-foreground">Loading history...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : recons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No reconciliations found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recons.map((recon) => (
                      <TableRow key={recon.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{recon.company_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {recon.policy_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {recon.insurer_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{recon.created_by_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">
                              {recon.created_by_email || 'No email'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(recon.start_time)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {recon.is_exported ? (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Exported</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-amber-600 text-sm">
                                  <XCircle className="h-4 w-4" />
                                  <span>Not Exported</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>Recon: {formatDuration(recon.time_to_recon)}</span>
                              </div>
                              {recon.is_exported && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  <span>Export: {formatDuration(recon.time_to_export)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {recon.recon_files?.map((file) => (
                              <button
                                key={file.id}
                                onClick={() => handleDownload(file)}
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                                disabled={downloadingFiles[file.id]}
                              >
                                {downloadingFiles[file.id] ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                {file.file_type} ({file.record_count} records)
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRecon(recon)}
                            className="gap-2"
                            disabled={!hasSummary(recon)}
                          >
                            Summary
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="mb-6">
              <DateRangePicker
                date={{ from: dateRange.from, to: dateRange.to }}
                onDateChange={setDateRange}
              />
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            ) : analytics ? (
              <AnalyticsDashboard data={analytics} />
            ) : null}
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={!!selectedRecon} onOpenChange={() => setSelectedRecon(null)}>
        <SheetContent className="w-full max-w-3xl sm:max-w-3xl flex flex-col h-full p-6">
          <SheetHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle>Reconciliation Summary</SheetTitle>
            </div>
            {selectedRecon && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>{selectedRecon.company_name}</div>
                <div>•</div>
                <div>{formatDateTime(selectedRecon.start_time)}</div>
              </div>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-2">
            {selectedRecon?.recon_summary?.[0]?.summary && (
              <WorkflowProvider>
                <div className="mt-4">
                  <SummaryTab reconData={selectedRecon.recon_summary[0].summary} />
                </div>
              </WorkflowProvider>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}