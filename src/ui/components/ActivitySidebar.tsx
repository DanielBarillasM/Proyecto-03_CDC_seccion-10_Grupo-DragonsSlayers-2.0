import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, FolderClosed } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExamplesExplorer } from "./ExamplesExplorer";
import { CompilerGuide } from "./CompilerGuide";
import type { AnalysisMode } from "../../lib/types";

interface ActivitySidebarProps {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
}

export function ActivitySidebar({ mode, onModeChange }: ActivitySidebarProps) {
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-1 border-b-2 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setExamplesOpen((value) => !value)}
          className="flex size-7 items-center justify-center rounded border-2 border-transparent hover:border-border hover:bg-accent"
          aria-label="Ejemplos"
          title="Ejemplos"
        >
          <FolderClosed size={16} />
        </button>
        <button
          type="button"
          onClick={() => setGuideOpen((value) => !value)}
          className="flex size-7 items-center justify-center rounded border-2 border-transparent hover:border-border hover:bg-accent"
          aria-label="Ruta de análisis"
          title="Ruta de análisis"
        >
          <BookOpen size={16} />
        </button>
      </div>

      <div role="region" aria-label="Ejemplos y ruta de análisis" tabIndex={0} className="min-h-0 flex-1 overflow-auto outline-none focus-visible:outline-2 focus-visible:outline-primary">
        <div className="flex flex-col gap-1 p-2">
          <Collapsible open={examplesOpen} onOpenChange={setExamplesOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-head text-xs uppercase tracking-wide hover:bg-accent">
              {examplesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Ejemplos
            </CollapsibleTrigger>
            <CollapsibleContent className="px-1 pt-1">
              <ExamplesExplorer value={mode} onChange={onModeChange} />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-head text-xs uppercase tracking-wide hover:bg-accent">
              {guideOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Ruta de análisis
            </CollapsibleTrigger>
            <CollapsibleContent className="px-1 pt-1">
              <CompilerGuide />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
