import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { RenovationProject, RenovationItem } from '@/types';
import { renovationApi } from '@/api/renovation.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, RENOVATION_STATUS_LABELS, RENOVATION_STATUS_COLORS } from '@/lib/formatters';
import { ProjectDialog } from './ProjectDialog';
import { RenovationItemDialog } from './RenovationItemDialog';
import { cn } from '@/lib/utils';

export function RenovationPage() {
  const [projects, setProjects] = useState<RenovationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [projectDialog, setProjectDialog] = useState<{ open: boolean; project?: RenovationProject }>({ open: false });
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<{ open: boolean; project?: RenovationProject }>({ open: false });

  const [itemDialog, setItemDialog] = useState<{ open: boolean; projectId?: string; item?: RenovationItem }>({ open: false });
  const [deleteItemDialog, setDeleteItemDialog] = useState<{ open: boolean; projectId?: string; item?: RenovationItem }>({ open: false });

  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setProjects(await renovationApi.getAllProjects()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteProject = async () => {
    if (!deleteProjectDialog.project) return;
    setDeleting(true);
    try {
      await renovationApi.deleteProject(deleteProjectDialog.project.id);
      setDeleteProjectDialog({ open: false });
      await load();
    } finally { setDeleting(false); }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemDialog.projectId || !deleteItemDialog.item) return;
    setDeleting(true);
    try {
      await renovationApi.deleteItem(deleteItemDialog.projectId, deleteItemDialog.item.id);
      setDeleteItemDialog({ open: false });
      await load();
    } finally { setDeleting(false); }
  };

  const totalCost = projects.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.totalPrice, 0), 0);
  const totalPaid = projects.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.paidAmount, 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Ristrutturazione"
        description={`${projects.length} progetti · Totale: ${formatCurrency(totalCost)} · Pagato: ${formatCurrency(totalPaid)}`}
        actions={
          <Button onClick={() => setProjectDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo progetto
          </Button>
        }
      />

      <div className="space-y-4">
        {projects.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nessun progetto di ristrutturazione. Clicca "Nuovo progetto" per iniziare.
            </CardContent>
          </Card>
        )}

        {projects.map((project) => {
          const expanded = expandedId === project.id;
          const projTotal = project.items.reduce((s, i) => s + i.totalPrice, 0);
          const projPaid = project.items.reduce((s, i) => s + i.paidAmount, 0);
          const projRemaining = projTotal - projPaid;
          const pct = projTotal > 0 ? (projPaid / projTotal) * 100 : 0;

          return (
            <Card key={project.id}>
              <CardContent className="p-0">
                {/* Project header */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setExpandedId(expanded ? null : project.id)}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{project.name}</span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          RENOVATION_STATUS_COLORS[project.status]
                        )}
                      >
                        {RENOVATION_STATUS_LABELS[project.status]}
                      </span>
                    </div>
                    {project.company && (
                      <p className="text-xs text-muted-foreground mt-0.5">{project.company}</p>
                    )}
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5 flex-shrink-0">
                    <p className="text-sm font-semibold">{formatCurrency(projTotal)}</p>
                    <p className="text-xs text-green-600 hidden sm:block">{formatCurrency(projPaid)} pagato</p>
                    {projRemaining > 0 && (
                      <p className="text-xs text-amber-600 hidden sm:block">{formatCurrency(projRemaining)} rimanente</p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setProjectDialog({ open: true, project })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteProjectDialog({ open: true, project })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Items */}
                {expanded && (
                  <div className="border-t bg-slate-50/50 px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Elementi ({project.items.length})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setItemDialog({ open: true, projectId: project.id })}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Aggiungi
                      </Button>
                    </div>

                    {project.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Nessun elemento aggiunto</p>
                    ) : (
                      <div className="space-y-2">
                        {project.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-md border px-3 py-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{item.name}</p>
                                {item.company && (
                                  <p className="text-xs text-muted-foreground">{item.company}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-semibold">{formatCurrency(item.totalPrice)}</p>
                                  <p className="text-xs text-green-600">{formatCurrency(item.paidAmount)} pagato</p>
                                  {item.remaining > 0 && (
                                    <p className="text-xs text-amber-600">{formatCurrency(item.remaining)} rimanente</p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      setItemDialog({ open: true, projectId: project.id, item })
                                    }
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      setDeleteItemDialog({ open: true, projectId: project.id, item })
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ProjectDialog
        open={projectDialog.open}
        project={projectDialog.project}
        onOpenChange={(open) => setProjectDialog({ open })}
        onSuccess={() => { setProjectDialog({ open: false }); load(); }}
      />

      <ConfirmDialog
        open={deleteProjectDialog.open}
        onOpenChange={(open) => setDeleteProjectDialog({ open })}
        title="Elimina progetto"
        description={`Sei sicuro di voler eliminare "${deleteProjectDialog.project?.name}" e tutti i suoi elementi?`}
        onConfirm={handleDeleteProject}
        isLoading={deleting}
      />

      <RenovationItemDialog
        open={itemDialog.open}
        projectId={itemDialog.projectId}
        item={itemDialog.item}
        onOpenChange={(open) => setItemDialog({ open })}
        onSuccess={() => { setItemDialog({ open: false }); load(); }}
      />

      <ConfirmDialog
        open={deleteItemDialog.open}
        onOpenChange={(open) => setDeleteItemDialog({ open })}
        title="Elimina elemento"
        description={`Sei sicuro di voler eliminare "${deleteItemDialog.item?.name}"?`}
        onConfirm={handleDeleteItem}
        isLoading={deleting}
      />
    </div>
  );
}
