# Auditoría técnica del Proyecto 3

**Fecha:** 20 de octubre de 2026  
**Versión revisada:** 3.0.0  
**Objetivo:** generación de ensamblador MIPS32 desde el TAC del Proyecto 2.

## Dictamen

La implementación cubre el pipeline obligatorio y el caso que originó la revisión quedó corregido: una entrada válida o un archivo propio ejecuta el modo `mips`; si frontend y TAC terminan correctamente, la UI genera ensamblador y habilita su descarga. Si existe un error previo, MIPS queda en `skipped` y no se produce artefacto.

El ensamblador no fue validado únicamente por inspección textual. Se ensamblaron y ejecutaron **15 programas positivos** con el JAR oficial MARS 4.5. Incluyen enteros, floats, cadenas, condiciones, ciclos, funciones, llamadas anidadas, recursión, arreglos, objetos, métodos, closures, `switch` y el programa integral.

## Problemas corregidos

| Severidad | Hallazgo inicial | Corrección |
| --- | --- | --- |
| Crítica | Entrada válida, archivo propio y casos normales se analizaban solo hasta semántica | `App.tsx` usa el pipeline `mips` salvo en la demostración TAC explícita |
| Crítica | Backend omitía llamadas, arreglos, objetos, fields, closures y más opcodes | Backend completo en `src/mips/generator.ts` |
| Crítica | Variables se emitían como etiquetas inexistentes y no había stack frames | Resolución por `ActivationRecord`, `.data` y frames en `$sp/$fp` |
| Alta | UI declaraba MIPS listo si existía cualquier instrucción aunque hubiera diagnósticos | Estados `not-requested/skipped/completed/failed` y exportación solo en `completed` |
| Alta | Llamadas anidadas limpiaban argumentos de llamadas exteriores | Cada `CALL` consume solo sus N argumentos superiores |
| Alta | Al terminar una función anidada se perdía el contexto de la función exterior | Pila de contextos de generación para frames y epílogos |
| Alta | Valores función y closures se confundían | Seguimiento diferenciado de puntero crudo y objeto closure |
| Alta | CLI rechazaba `--mode mips` | Modo MIPS, `--out` y códigos de salida integrados |
| Media | No existía optimización de mirilla | `peepholeOptimize` conservador con métricas |
| Media | Paquetes y metadatos seguían identificando Proyecto 2 | Versión 3.0.0, repositorio, producto y UI actualizados |
| Media | Dependencias V0/Next y dos lockfiles incompatibles | Eliminación de restos V0 y lockfile npm único |
| Media | Vite dependía de `__dirname` en ESM | Resolución con `fileURLToPath(import.meta.url)` |
| Media | No existían pruebas o ejemplos MIPS | Suite MIPS y carpeta `examples/mips` |

## Evidencia reproducible

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run cli:mips
```

Resultado verificado:

- TypeScript aprobado;
- 176 pruebas aprobadas en 13 archivos;
- build Vite aprobado;
- auditoría npm de dependencias de producción: 0 vulnerabilidades;
- MARS 4.5: 15 programas ensamblados y ejecutados.

## Salidas observadas en MARS

| Caso | Salida |
| --- | --- |
| aritmética | `14` |
| funciones y pila | `42` |
| arreglos/foreach | `6` |
| cadenas/booleanos | `Hola MIPS`, `true` |
| floats | `4.0` |
| factorial recursivo | `120` |
| closure | `1` |
| programa integral de clase/método | `2`, `6`, `12` |

## Restricciones del enunciado

| Restricción | Estado | Evidencia |
| --- | --- | --- |
| Lenguaje fuente Compiscript | Cumple | gramática y ejemplos `.cps` |
| Generador obligatorio de lexer/parser | Cumple | ANTLR4TS y `src/generated` |
| Ensamblador desde TAC | Cumple | `generateMips(tac)` sin dependencia del CST |
| GUI amigable | Cumple | IDE React/Monaco y panel MIPS |
| Selector de archivo en GUI | Cumple | menú Archivo, input `.cps` |
| Resultados en GUI | Cumple | diagnósticos, TAC, frames y MIPS |
| Casos de prueba propios | Cumple | `examples/mips` y `src/__tests__/mips.test.ts` |
| Recuperación y múltiples errores | Cumple | listeners, estrategia ANTLR y visitors acumulativos |
| No TAC/MIPS con errores previos | Cumple | estados `skipped` y pruebas negativas |
| Mirilla | Cumple | optimizador local y métricas |
| Ensamblador válido/ejecutable externamente | Cumple | ejecución real en MARS 4.5 |
| No ejecución interna obligatoria | Cumple | runner externo opcional; la UI no simula MIPS |

## Aspectos manuales

La conformación del grupo y la distribución de contribuciones solo pueden comprobarse con el historial del repositorio y la plataforma académica. El workflow de release requiere runners por sistema operativo; su definición está actualizada, pero la firma de binarios y la publicación de un tag son acciones externas.
