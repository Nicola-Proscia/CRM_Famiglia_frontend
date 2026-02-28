import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { FamilyMember, ExtraIncome } from '@/types';
import { membersApi } from '@/api/members.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { MemberDialog } from './MemberDialog';
import { ExtraIncomeDialog } from './ExtraIncomeDialog';

export function MembersPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Member dialog
  const [memberDialog, setMemberDialog] = useState<{ open: boolean; member?: FamilyMember }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; member?: FamilyMember }>({ open: false });
  const [deleting, setDeleting] = useState(false);

  // ExtraIncome dialog
  const [incomeDialog, setIncomeDialog] = useState<{
    open: boolean;
    memberId?: string;
    income?: ExtraIncome;
  }>({ open: false });
  const [deleteIncomeDialog, setDeleteIncomeDialog] = useState<{
    open: boolean;
    memberId?: string;
    income?: ExtraIncome;
  }>({ open: false });

  const load = async () => {
    setLoading(true);
    try {
      setMembers(await membersApi.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeleteMember = async () => {
    if (!deleteDialog.member) return;
    setDeleting(true);
    try {
      await membersApi.delete(deleteDialog.member.id);
      setDeleteDialog({ open: false });
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteIncome = async () => {
    if (!deleteIncomeDialog.memberId || !deleteIncomeDialog.income) return;
    setDeleting(true);
    try {
      await membersApi.deleteExtraIncome(deleteIncomeDialog.memberId, deleteIncomeDialog.income.id);
      setDeleteIncomeDialog({ open: false });
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const totalIncome = members.reduce(
    (sum, m) => sum + m.salary + m.extraIncomes.reduce((s, e) => s + e.amount, 0),
    0
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Membri Famiglia"
        description={`${members.length} membri · Reddito totale: ${formatCurrency(totalIncome)}/mese`}
        actions={
          <Button onClick={() => setMemberDialog({ open: true })}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi membro
          </Button>
        }
      />

      <div className="space-y-4">
        {members.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nessun membro aggiunto. Clicca "Aggiungi membro" per iniziare.
            </CardContent>
          </Card>
        )}

        {members.map((member) => {
          const expanded = expandedId === member.id;
          const totalExtra = member.extraIncomes.reduce((s, e) => s + e.amount, 0);

          return (
            <Card key={member.id}>
              <CardContent className="p-0">
                {/* Header row */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setExpandedId(expanded ? null : member.id)}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{member.name}</span>
                      {member.role && (
                        <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Stipendio: {formatCurrency(member.salary)}/mese
                      {totalExtra > 0 && ` · Extra: ${formatCurrency(totalExtra)}/mese`}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(member.salary + totalExtra)}
                    </p>
                    <p className="text-xs text-muted-foreground">totale/mese</p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMemberDialog({ open: true, member })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteDialog({ open: true, member })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Extra incomes */}
                {expanded && (
                  <div className="border-t bg-slate-50/50 px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Entrate extra</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIncomeDialog({ open: true, memberId: member.id })}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Aggiungi
                      </Button>
                    </div>

                    {member.extraIncomes.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Nessuna entrata extra</p>
                    ) : (
                      <div className="space-y-2">
                        {member.extraIncomes.map((income) => (
                          <div
                            key={income.id}
                            className="flex items-center justify-between bg-white rounded-md px-3 py-2 border"
                          >
                            <span className="text-sm">{income.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-green-600">
                                {formatCurrency(income.amount)}/mese
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  setIncomeDialog({ open: true, memberId: member.id, income })
                                }
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() =>
                                  setDeleteIncomeDialog({ open: true, memberId: member.id, income })
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
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

      {/* Member CRUD dialog */}
      <MemberDialog
        open={memberDialog.open}
        member={memberDialog.member}
        onOpenChange={(open) => setMemberDialog({ open })}
        onSuccess={() => { setMemberDialog({ open: false }); load(); }}
      />

      {/* Delete member */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Elimina membro"
        description={`Sei sicuro di voler eliminare ${deleteDialog.member?.name}? Questa azione è irreversibile.`}
        onConfirm={handleDeleteMember}
        isLoading={deleting}
      />

      {/* ExtraIncome CRUD dialog */}
      <ExtraIncomeDialog
        open={incomeDialog.open}
        memberId={incomeDialog.memberId}
        income={incomeDialog.income}
        onOpenChange={(open) => setIncomeDialog({ open })}
        onSuccess={() => { setIncomeDialog({ open: false }); load(); }}
      />

      {/* Delete income */}
      <ConfirmDialog
        open={deleteIncomeDialog.open}
        onOpenChange={(open) => setDeleteIncomeDialog({ open })}
        title="Elimina entrata extra"
        description={`Sei sicuro di voler eliminare "${deleteIncomeDialog.income?.name}"?`}
        onConfirm={handleDeleteIncome}
        isLoading={deleting}
      />
    </div>
  );
}
