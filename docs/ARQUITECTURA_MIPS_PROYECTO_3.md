# Arquitectura MIPS32 del Proyecto 3

## Objetivo

La quinta fase del compilador transforma el código de tres direcciones del Proyecto 2 en ensamblador MIPS32 aceptado por MARS 4.5. No vuelve a recorrer el CST ni repite decisiones semánticas: su única entrada es `TacGenerationResult` y sus metadatos de tipos, frames y layouts.

```text
AnalyzeResult
  └─ tac: TacGenerationResult (completed)
       ├─ instructions[]
       ├─ activationRecords[]
       └─ classLayouts[]
            ↓
       MipsGenerator
            ├─ selección de instrucciones
            ├─ asignación local de registros
            ├─ resolución de almacenamiento
            ├─ runtime auxiliar
            ├─ mirilla
            └─ validación de etiquetas
                 ↓
       MipsGenerationResult
```

## Contrato de fase

`MipsGenerationResult.status` puede ser:

- `not-requested`: el usuario solicitó una fase anterior;
- `skipped`: TAC no existe porque hubo errores léxicos, sintácticos o semánticos;
- `completed`: el ensamblador se generó sin errores del backend;
- `failed`: TAC era válido, pero la traducción encontró una referencia, layout, opcode o etiqueta inválida.

La UI solo habilita **Descargar .asm** en `completed`. De este modo, tener texto parcial no se confunde con tener ensamblador ejecutable.

## Modelo de almacenamiento

### Global

Los slots del frame global se convierten en etiquetas `.word` del segmento `.data`. Las constantes de cadena se internan como `.asciiz` y las flotantes como `.float` alineado.

### Funciones

Cada invocación crea un registro de activación real sobre la pila:

```text
direcciones altas
├─ argumentos del llamador
├─ $ra guardado
├─ $fp anterior
├─ $s7 anterior (entorno del closure)
├─ parámetros y variables locales
└─ temporales TAC          ← $fp, $sp
direcciones bajas
```

El prólogo alinea el tamaño del frame, mueve `$fp` y copia los argumentos hacia los offsets definidos en `ActivationRecord`. El epílogo restaura `$s7`, `$ra`, `$fp`, libera la pila y retorna con `jr $ra`.

Los parámetros se apilan de izquierda a derecha. Una llamada consume solo la cantidad declarada por su `CALL`; esto preserva argumentos externos durante llamadas anidadas como `obj.método(f(x))`.

## Asignación de registros

`RegisterAllocator.getReg()` administra `$t0` a `$t7`. Como TAC limita cada instrucción a pocos operandos, los registros se liberan al cambiar de cuádruplo y los valores persistentes viven en slots. `$t8` y `$t9` se reservan para soporte de llamadas, comparaciones y punteros de función.

El resultado informa:

- asignaciones totales;
- máximo simultáneo;
- spills.

La estrategia actual no requiere spills en el conjunto TAC implementado; si se agota el pool, el backend falla de forma explícita en lugar de emitir ensamblador silenciosamente incorrecto.

## Selección de instrucciones

| TAC | MIPS32 |
| --- | --- |
| `MOV` | `li`/`la`/`lw` seguido de `sw` |
| `ADD`, `SUB`, `MUL` | `addu`, `subu`, `mul` |
| `DIV`, `MOD` | `div` con `mflo` o `mfhi` |
| comparaciones | `seq`, `sne`, `slt`, `sle`, `sgt`, `sge` |
| saltos | `j`, `beq`, `bne` con delay slot explícito |
| `PARAM`, `CALL` | push en `$sp`, `jal`/`jalr`, limpieza de argumentos |
| `RETURN` | `$v0` o `$f0` y salto al epílogo |
| `NEW_ARRAY`, `NEW_OBJECT` | syscall 9 (`sbrk`) |
| `PRINT` | syscalls 1, 2 y 4 |

Las operaciones flotantes usan registros `$f2`, `$f4`, `$f6`, `$f12` y `$f0`. La promoción `integer → float` usa `mtc1` y `cvt.s.w`.

## Arreglos, objetos y closures

Un arreglo reserva `(longitud + 1) * 4` bytes. El primer word conserva la longitud; el elemento `i` se encuentra en `4 * (i + 1)`.

Un objeto reserva al menos `ClassLayout.instanceSize`. `GET_FIELD` y `SET_FIELD` usan el offset resuelto durante TAC. Un método se materializa como dirección de etiqueta y se invoca con `jalr`; el receptor se pasa como primer parámetro.

Un closure reserva un bloque cuyo word 0 es el puntero de función. Las capturas comienzan en el word 1. Al invocarlo, `$s7` apunta al entorno; `LOAD_CAPTURE` y `STORE_CAPTURE` acceden a sus offsets. El frame guarda/restaura `$s7`, lo que permite anidamiento y recursión.

## Runtime de cadenas

El generador incluye rutinas solo cuando se usan:

- `__rt_concat`: calcula longitudes, solicita heap y copia ambas cadenas;
- `__rt_streq`: compara bytes hasta encontrar una diferencia o el terminador cero.

Los booleanos se imprimen como `true`/`false` y `null` como texto, no como enteros opacos.

## Optimización de mirilla

No existe una fase independiente de optimización. `peepholeOptimize` procesa una ventana local y elimina:

1. `move $r, $r`;
2. `addiu $sp, $sp, 0`;
3. saltos incondicionales a la etiqueta inmediatamente siguiente;
4. `nop` consecutivos redundantes.

El resultado conserva ensamblador previo y posterior, además del contador de eliminaciones.

## Validación

Antes de marcar el resultado como completo se verifica que las etiquetas referidas por `j`, `jal`, ramas y `la` estén definidas. La suite cubre el backend de forma unitaria y la auditoría ejecuta los artefactos en MARS 4.5 real.

```powershell
npm.cmd run cli -- examples/mips/07_recursion.cps --mode mips --out factorial.asm
java -jar Mars4_5.jar nc ae1 factorial.asm
# salida: 120
```

## Límites conscientes

`try/catch` mantiene sus marcadores TAC, pero Compiscript no define un ABI de excepciones MIPS ni instrucciones TAC de `throw`; por ello no se implementa unwinding de pila. El flujo normal dentro de `try` se traduce y el bloque `catch` permanece como rama estructural del TAC. Esta limitación no introduce una ejecución interna ni una fase fuera del alcance solicitado.
