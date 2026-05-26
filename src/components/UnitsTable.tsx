"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { upsertUnit, deleteUnit } from "@/app/projects/actions";
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
} from "@/components/ui/alert-dialog";
import type { CrmProjectUnit } from "@/lib/types";

type Row = CrmProjectUnit & { _dirty?: boolean; _new?: boolean };

export function UnitsTable({
  projectId,
  initialUnits,
}: {
  projectId: string;
  initialUnits: CrmProjectUnit[];
}) {
  const [rows, setRows] = useState<Row[]>(initialUnits as Row[]);
  const [pending, start] = useTransition();

  const change = (idx: number, patch: Partial<Row>) => {
    setRows((prev) => {
      const v = [...prev];
      v[idx] = { ...v[idx], ...patch, _dirty: true };
      return v;
    });
  };

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        project_id: projectId,
        unit_number: "",
        type: "",
        bedrooms: 1,
        size_sqm: 50,
        terrace_sqm: null,
        block: "A",
        price_net: 0,
        price_gross: 0,
        hero_image_url: null,
        floorplan_url: null,
        sort_order: prev.length,
        _new: true,
        _dirty: true,
      } as Row,
    ]);
  }

  function saveRow(idx: number) {
    const r = rows[idx];
    start(async () => {
      const isNew = r._new;
      const { _dirty, _new, id, ...payload } = r;
      void _dirty;
      void _new;
      const res = await upsertUnit(projectId, isNew ? payload : { ...payload, id });
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Unit ${r.unit_number || ""} gespeichert`);
        setRows((prev) => {
          const v = [...prev];
          v[idx] = { ...v[idx], _dirty: false, _new: false };
          return v;
        });
      }
    });
  }

  function removeRow(idx: number) {
    const r = rows[idx];
    if (r._new) {
      setRows((prev) => prev.filter((_, j) => j !== idx));
      return;
    }
    start(async () => {
      const res = await deleteUnit(r.id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Unit gelöscht");
        setRows((prev) => prev.filter((_, j) => j !== idx));
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={addRow} variant="outline" size="sm">
          <Plus className="h-3 w-3" /> Unit hinzufügen
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="text-left p-2 w-16">Block</th>
                <th className="text-left p-2 w-24">Unit</th>
                <th className="text-left p-2">Typ</th>
                <th className="text-right p-2 w-16">BR</th>
                <th className="text-right p-2 w-24">m² Wohn</th>
                <th className="text-right p-2 w-24">m² Terrasse</th>
                <th className="text-right p-2 w-28">Netto €</th>
                <th className="text-right p-2 w-28">Brutto €</th>
                <th className="p-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted-foreground p-6 italic">
                    Noch keine Units.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id} className={`border-b ${r._dirty ? "bg-amber-50/50" : ""}`}>
                  <td className="p-1"><Input className="h-8 text-xs" value={r.block ?? ""} onChange={(e) => change(i, { block: e.target.value })} /></td>
                  <td className="p-1"><Input className="h-8 text-xs" value={r.unit_number ?? ""} onChange={(e) => change(i, { unit_number: e.target.value })} /></td>
                  <td className="p-1">
                    <Input className="h-8 text-xs" placeholder="Typ (Studio/1BR/2BR/Penthouse)" value={r.type ?? ""} onChange={(e) => change(i, { type: e.target.value })} />
                  </td>
                  <td className="p-1"><Input className="h-8 text-xs text-right" type="number" value={r.bedrooms ?? 0} onChange={(e) => change(i, { bedrooms: Number(e.target.value) })} /></td>
                  <td className="p-1"><Input className="h-8 text-xs text-right" type="number" step="0.1" value={r.size_sqm ?? 0} onChange={(e) => change(i, { size_sqm: Number(e.target.value) })} /></td>
                  <td className="p-1"><Input className="h-8 text-xs text-right" type="number" step="0.1" value={r.terrace_sqm ?? ""} onChange={(e) => change(i, { terrace_sqm: e.target.value ? Number(e.target.value) : null })} /></td>
                  <td className="p-1"><Input className="h-8 text-xs text-right" type="number" value={r.price_net ?? 0} onChange={(e) => change(i, { price_net: Number(e.target.value) })} /></td>
                  <td className="p-1"><Input className="h-8 text-xs text-right" type="number" value={r.price_gross ?? 0} onChange={(e) => change(i, { price_gross: Number(e.target.value) })} /></td>
                  <td className="p-1">
                    <div className="flex gap-1 justify-end">
                      {r._dirty && (
                        <Button size="icon" variant="ghost" disabled={pending} onClick={() => saveRow(i)} title="Speichern">
                          <Save className="h-3 w-3 text-coral" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button size="icon" variant="ghost" title="Löschen">
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unit löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {r.unit_number || "Diese Unit"} wird unwiderruflich aus der Datenbank entfernt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => removeRow(i)}>
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Tipp: Zeilen mit gelbem Hintergrund haben ungespeicherte Änderungen → ✓-Icon klicken.
      </p>
    </div>
  );
}
