"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { IMAGE_CATEGORIES, IMAGE_CATEGORY_KEYS, type ImageCategory } from "@/lib/constants";

export function ImageUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<ImageCategory>("hero");
  const [files, setFiles] = useState<File[]>([]);
  const [pending, start] = useTransition();

  function upload() {
    if (files.length === 0) {
      toast.error("Keine Datei gewählt");
      return;
    }
    start(async () => {
      let ok = 0;
      let fail = 0;
      for (const f of files) {
        const fd = new FormData();
        fd.set("project_id", projectId);
        fd.set("category", category);
        fd.set("file", f);
        try {
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (!r.ok) {
            const txt = await r.text();
            console.error("upload failed", txt);
            fail++;
          } else {
            ok++;
          }
        } catch (e) {
          console.error(e);
          fail++;
        }
      }
      if (ok) toast.success(`${ok} Bild${ok > 1 ? "er" : ""} hochgeladen`);
      if (fail) toast.error(`${fail} fehlgeschlagen`);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4 space-y-2">
            <Label>Kategorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ImageCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {IMAGE_CATEGORY_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {IMAGE_CATEGORIES[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-5 space-y-2">
            <Label>Datei(en) — JPG/PNG/WEBP, max 10MB</Label>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-coral file:text-white hover:file:bg-coral-600 file:cursor-pointer"
            />
          </div>
          <div className="md:col-span-3">
            <Button
              onClick={upload}
              disabled={pending || files.length === 0}
              className="w-full bg-coral hover:bg-coral-600 text-white"
            >
              <Upload className="h-4 w-4" />
              {pending ? "Lade hoch..." : `Upload (${files.length})`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
