import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { apiClient } from '@/api';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  History, 
  Undo2, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK';
  entityType: 'ALLOCATION' | 'RULE' | 'MOVEMENT';
  entityId: string;
  oldValues: any;
  newValues: any;
  description: string;
  canRollback: boolean;
  ipAddress?: string;
  userAgent?: string;
}

const auditColumns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Data/Ora" />,
    cell: ({ row }) => {
      const timestamp = new Date(row.getValue('timestamp'));
      return (
        <div className="text-sm">
          <div className="font-medium">
            {format(timestamp, 'dd/MM/yyyy', { locale: it })}
          </div>
          <div className="text-muted-foreground">
            {format(timestamp, 'HH:mm:ss', { locale: it })}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'action',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Azione" />,
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      const variant = {
        'CREATE': 'default',
        'UPDATE': 'secondary',
        'DELETE': 'destructive',
        'ROLLBACK': 'outline'
      }[action] as any;
      
      const actionLabels = {
        'CREATE': 'CREAZIONE',
        'UPDATE': 'MODIFICA',
        'DELETE': 'ELIMINAZIONE',
        'ROLLBACK': 'RIPRISTINO'
      };
      
      return <Badge variant={variant}>{actionLabels[action as keyof typeof actionLabels] || action}</Badge>;
    },
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Utente" />,
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
    cell: ({ row }) => {
      const type = row.getValue('entityType') as string;
      return <Badge variant="outline">{type}</Badge>;
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.getValue('description')}>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Azioni',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="flex items-center gap-2">
          <AuditDetailsDialog entry={entry} />
          {entry.canRollback && (
            <RollbackDialog entry={entry} />
          )}
        </div>
      );
    },
  },
];

// Componente per visualizzare i dettagli di un audit log
function AuditDetailsDialog({ entry }: { entry: AuditLogEntry }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Dettagli Modifica - {entry.action === 'CREATE' ? 'CREAZIONE' : 
                                 entry.action === 'UPDATE' ? 'MODIFICA' : 
                                 entry.action === 'DELETE' ? 'ELIMINAZIONE' : 
                                 entry.action === 'ROLLBACK' ? 'RIPRISTINO' : entry.action}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Dettagli completi della modifica effettuata il {format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: it })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Informazioni generali */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Utente</label>
              <p className="text-sm text-muted-foreground">{entry.userName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo Entità</label>
              <p className="text-sm text-muted-foreground">{entry.entityType}</p>
            </div>
            <div>
              <label className="text-sm font-medium">ID Entità</label>
              <p className="text-sm text-muted-foreground font-mono">{entry.entityId}</p>
            </div>
            <div>
              <label className="text-sm font-medium">IP Address</label>
              <p className="text-sm text-muted-foreground">{entry.ipAddress || 'N/A'}</p>
            </div>
          </div>

          {/* Valori precedenti e nuovi */}
          {entry.action === 'UPDATE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-red-600">Valori Precedenti</label>
                <pre className="text-xs bg-red-50 p-2 rounded border max-h-32 overflow-y-auto">
                  {JSON.stringify(entry.oldValues, null, 2)}
                </pre>
              </div>
              <div>
                <label className="text-sm font-medium text-green-600">Valori Nuovi</label>
                <pre className="text-xs bg-green-50 p-2 rounded border max-h-32 overflow-y-auto">
                  {JSON.stringify(entry.newValues, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Descrizione completa */}
          <div>
            <label className="text-sm font-medium">Descrizione</label>
            <p className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
              {entry.description}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction>Chiudi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Componente per il rollback
function RollbackDialog({ entry }: { entry: AuditLogEntry }) {
  const { toast } = useToast();
  const [isRollingBack, setIsRollingBack] = useState(false);

  const handleRollback = async () => {
    setIsRollingBack(true);
    try {
      await apiClient.post('/allocation/audit/rollback', {
        auditLogId: entry.id,
        entityType: entry.entityType,
        entityId: entry.entityId
      });
      
      toast({
        title: "Ripristino Completato",
        description: "La modifica è stata annullata con successo.",
      });
      
      // Refresh della tabella (implementato nel componente padre)
      window.location.reload();
    } catch (error) {
      toast({
        title: "Errore Ripristino",
        description: "Impossibile annullare la modifica. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
          <Undo2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Conferma Ripristino
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler annullare questa modifica? Questa azione ripristinerà i valori precedenti e creerà una nuova voce nel registro modifiche.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Attenzione:</strong> Il ripristino creerà una nuova modifica che riporta i valori precedenti. 
            Questa operazione non può essere annullata.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRollback}
            disabled={isRollingBack}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isRollingBack ? 'Ripristino in corso...' : 'Conferma Ripristino'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AuditTrail() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    recentActions: 0,
    rollbacksAvailable: 0
  });

  const {
    data,
    totalCount,
    page,
    pageSize,
    search,
    sorting,
    loading,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortingChange,
  } = useAdvancedTable<AuditLogEntry>({
    endpoint: '/api/allocation/audit',
    initialSorting: [{ id: 'timestamp', desc: true }]
  });

  // Carica statistiche
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/allocation/audit/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche audit:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Totale Modifiche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              Tutte le modifiche registrate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              Azioni Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentActions}</div>
            <p className="text-xs text-muted-foreground">
              Ultime 24 ore
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-orange-500" />
              Ripristini Disponibili
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.rollbacksAvailable}</div>
            <p className="text-xs text-muted-foreground">
              Modifiche ripristinabili
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabella Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Registro Modifiche - Storico Cambiamenti
          </CardTitle>
          <CardDescription>
            Tracciamento completo di tutte le modifiche effettuate nel sistema di allocazione. 
            Utilizza la ricerca per filtrare per utente, azione o descrizione.
            <br />
            <em className="text-amber-600">Nota: Attualmente visualizza dati di esempio per dimostrare le funzionalità.</em>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedDataTable
            columns={auditColumns}
            data={data}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            searchValue={search}
            sorting={sorting}
            loading={loading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onSearchChange={onSearchChange}
            onSortingChange={onSortingChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}