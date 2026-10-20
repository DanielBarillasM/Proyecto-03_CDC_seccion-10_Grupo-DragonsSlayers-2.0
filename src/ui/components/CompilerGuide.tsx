import { Braces, CheckCircle2, Cpu, Database, GitBranch, ScanSearch, Split } from "lucide-react";
import type { ReactNode } from "react";

interface Phase {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const phases: Phase[] = [
  {
    number: "01",
    title: "Análisis léxico",
    description: "Convierte caracteres en tokens y localiza símbolos no reconocidos.",
    icon: <ScanSearch size={16} />
  },
  {
    number: "02",
    title: "Análisis sintáctico",
    description: "Valida la estructura con ANTLR y construye el árbol de parseo.",
    icon: <Braces size={16} />
  },
  {
    number: "03",
    title: "Análisis semántico",
    description: "Resuelve nombres, tipos, ámbitos, flujo, funciones y clases.",
    icon: <GitBranch size={16} />
  },
  {
    number: "04",
    title: "Código intermedio TAC",
    description: "Descompone operaciones, crea temporales y etiquetas, y asigna registros de activación.",
    icon: <Split size={16} />
  },
  {
    number: "05",
    title: "Ensamblador MIPS32",
    description: "Traduce TAC, administra pila y registros, aplica mirilla y produce un .asm para MARS.",
    icon: <Cpu size={16} />
  }
];

export function CompilerGuide() {
  return (
    <div className="flex flex-col gap-3 text-xs">
      <div>
        <h3 className="font-head text-sm">Del código a MIPS32</h3>
        <p className="text-muted-foreground">
          Ejecuta las fases en orden. TAC y MIPS solo se generan cuando las fases anteriores terminan sin errores.
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {phases.map((phase) => (
          <li key={phase.number} className="flex items-start gap-2 rounded border-2 bg-card p-2 shadow-sm">
            <span className="font-head text-muted-foreground">{phase.number}</span>
            <span className="mt-0.5">{phase.icon}</span>
            <span>
              <strong className="block font-head">{phase.title}</strong>
              <span className="text-muted-foreground">{phase.description}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-1 rounded border-2 bg-accent p-2">
        <div className="flex items-center gap-2 font-head">
          <Database size={14} /> Resultados
        </div>
        <p className="text-muted-foreground">
          Diagnósticos, símbolos, ámbitos, TAC, CFG, frames y ensamblador listo para MARS 4.5.
        </p>
        <span className="flex items-center gap-1 text-muted-foreground">
          <CheckCircle2 size={12} /> Ctrl + Enter ejecuta el análisis
        </span>
      </div>
    </div>
  );
}
