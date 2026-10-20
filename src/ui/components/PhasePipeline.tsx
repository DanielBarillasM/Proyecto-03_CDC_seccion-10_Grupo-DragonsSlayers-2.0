import { CheckCircle2, MinusCircle, TriangleAlert, XCircle } from "lucide-react";
import type { AnalyzeResult } from "../../lib/types";

type PhaseState = "ok" | "warning" | "error" | "skipped" | "not-run" | "idle";

const STATE_STYLES: Record<PhaseState, string> = {
  ok: "border-green-900 bg-green-200 text-green-900",
  warning: "border-yellow-900 bg-yellow-200 text-yellow-900",
  error: "border-red-900 bg-red-200 text-red-900",
  skipped: "border-border bg-muted text-muted-foreground",
  "not-run": "border-border bg-muted text-muted-foreground",
  idle: "border-border bg-card text-muted-foreground"
};

export function PhasePipeline({ result }: { result: AnalyzeResult | null }) {
  if (!result) {
    return (
      <div className="flex items-center gap-1.5" aria-label="Estado de las fases de compilación">
        <PhaseStep label="Lexer" state="idle" detail="sin ejecutar" />
        <Arrow />
        <PhaseStep label="Parser" state="idle" detail="sin ejecutar" />
        <Arrow />
        <PhaseStep label="Semántica" state="idle" detail="sin ejecutar" />
        <Arrow />
        <PhaseStep label="TAC" state="idle" detail="sin ejecutar" />
        <Arrow />
        <PhaseStep label="MIPS / MARS" state="idle" detail="sin ejecutar" />
      </div>
    );
  }

  const { summary } = result;
  const isLexerMode = result.mode === "lexer";
  const isSemanticMode = result.mode === "semantic" || result.mode === "tac" || result.mode === "mips";
  const isTacMode = result.mode === "tac" || result.mode === "mips";
  const isMipsMode = result.mode === "mips";

  const lexerState: PhaseState = summary.lexicalErrorCount > 0 ? "error" : "ok";
  const parserState: PhaseState = isLexerMode
    ? "not-run"
    : summary.syntaxErrorCount > 0
      ? "error"
      : summary.lexicalErrorCount > 0
        ? "warning"
        : "ok";
  const semanticState: PhaseState = !isSemanticMode
    ? "not-run"
    : result.semantic.status === "skipped"
      ? "skipped"
      : summary.semanticErrorCount > 0
        ? "error"
        : summary.semanticWarningCount > 0
          ? "warning"
          : "ok";
  const tacState: PhaseState = !isTacMode
    ? "not-run"
    : result.tac.status === "skipped"
      ? "skipped"
      : result.tac.status === "failed"
        ? "error"
        : result.tac.status === "completed"
          ? "ok"
          : "not-run";
  const mipsState: PhaseState = !isMipsMode || result.mips.status === "not-requested"
    ? "not-run"
    : result.mips.status === "skipped"
      ? "skipped"
      : result.mips.status === "failed"
        ? "error"
        : result.mips.status === "completed"
          ? result.mips.diagnostics.some((diagnostic) => diagnostic.severity === "warning") ? "warning" : "ok"
          : "not-run";

  return (
    <div className="flex items-center gap-1.5" aria-label="Estado de las fases de compilación">
      <PhaseStep label="Lexer" state={lexerState} detail={`${summary.lexicalErrorCount} errores`} />
      <Arrow />
      <PhaseStep
        label="Parser"
        state={parserState}
        detail={isLexerMode ? "no solicitado" : `${summary.syntaxErrorCount} errores`}
      />
      <Arrow />
      <PhaseStep
        label="Semántica"
        state={semanticState}
        detail={
          !isSemanticMode
            ? "no solicitada"
            : result.semantic.status === "skipped"
              ? "omitida"
              : `${summary.semanticErrorCount} errores · ${summary.semanticWarningCount} warnings`
        }
      />
      <Arrow />
      <PhaseStep
        label="TAC"
        state={tacState}
        detail={
          !isTacMode
            ? "no solicitado"
            : result.tac.status === "completed"
              ? `${result.tac.metrics.instructionCount} instrucciones`
              : result.tac.status === "skipped"
                ? "omitido"
                : result.tac.status === "failed"
                  ? "falló"
                  : "sin ejecutar"
        }
      />
      <Arrow />
      <PhaseStep
        label="MIPS / MARS"
        state={mipsState}
        detail={
          !isMipsMode
            ? "no solicitado"
            : result.mips.status === "completed"
              ? `${result.mips.optimizedInstructionCount} instrucciones · listo para MARS`
              : result.mips.status === "skipped"
                ? "omitido por errores previos"
                : result.mips.status === "failed"
                  ? "falló la generación"
                  : "sin ejecutar"
        }
      />
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-muted-foreground" aria-hidden="true">
      →
    </span>
  );
}

function PhaseStep({ label, state, detail }: { label: string; state: PhaseState; detail: string }) {
  return (
    <div className={`flex items-center gap-1.5 rounded border-2 px-2 py-1 text-xs ${STATE_STYLES[state]}`}>
      {state === "ok" && <CheckCircle2 size={13} />}
      {state === "warning" && <TriangleAlert size={13} />}
      {state === "error" && <XCircle size={13} />}
      {(state === "skipped" || state === "not-run" || state === "idle") && <MinusCircle size={13} />}
      <span className="flex flex-col leading-none">
        <strong className="font-head">{label}</strong>
        <span className="text-[10px] opacity-80">{detail}</span>
      </span>
    </div>
  );
}
