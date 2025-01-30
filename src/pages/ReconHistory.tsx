import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReconHistory, getFileUrl } from '@/lib/supabase';
import { formatDistanceToNow, format } from 'date-fns';
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
  Search,
  Download,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import { SummaryTab } from '@/components/SummaryTab';
import { Header } from '@/components/Header';

export function ReconHistory() {
  const navigate = useNavigate();
  const [recons, setRecons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecon, setSelectedRecon] = useState(null);

  useEffect(() => {
    loadReconHistory();
  }, []);

  const loadReconHistory = async () => {
    try {
      const data = await getReconHistory();
      setRecons(data);
    } catch (error) {
      console.error('Error loading recon history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecons = recons.filter(recon => 
    recon.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recon.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recon.insurer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (duration: string) => {
    if (!duration) return '-';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    
    const [_, hours, minutes, seconds] = match;
    return `${hours}h ${minutes}m ${seconds}s`;
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

      {/* Main Content */}
      <main className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, policy, or insurer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company & Policy</TableHead>
                <TableHead>Insurer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Time to Recon</TableHead>
                <TableHead>Time to Export</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground">Loading history...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRecons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">No reconciliations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecons.map((recon) => (
                  <TableRow key={recon.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{recon.company_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {recon.policy_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{recon.insurer_name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {format(new Date(recon.start_time), 'dd MMM yyyy')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(recon.start_time), 'hh:mm a')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{recon.created_by_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {recon.created_by_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(recon.time_to_recon)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(recon.time_to_export)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {recon.recon_files.map((file) => (
                          <a
                            key={file.id}
                            href={getFileUrl(file.storage_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            {file.file_type} ({file.record_count} records)
                          </a>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {recon.is_exported ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Exported</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <XCircle className="h-4 w-4" />
                          <span>Not Exported</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRecon(recon)}
                        className="gap-2"
                      >
                        View Summary
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Summary Sheet */}
      <Sheet open={!!selectedRecon} onOpenChange={() => setSelectedRecon(null)}>
        <SheetContent className="w-full max-w-3xl sm:max-w-3xl">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <SheetTitle>Reconciliation Summary</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecon(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedRecon && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>{selectedRecon.company_name}</div>
                <div>•</div>
                <div>{selectedRecon.policy_name}</div>
                <div>•</div>
                <div>{format(new Date(selectedRecon.start_time), 'dd MMM yyyy')}</div>
              </div>
            )}
          </SheetHeader>
          <div className="mt-6">
            {selectedRecon?.recon_summary && (
              <SummaryTab reconData={selectedRecon.recon_summary} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}