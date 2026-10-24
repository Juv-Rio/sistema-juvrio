'use client';

/**
 * Tela de carregamento da JUV-RIO.
 *
 * Requer public/sigla_juv.png com FUNDO TRANSPARENTE.
 * O alpha do PNG é usado como máscara real (mask-image), então:
 *   - o que é transparente desaparece;
 *   - o que é opaco (letras + traços de pincel) permanece;
 *   - a varredura de luz fica contida dentro das letras, sem truque de blend.
 *
 * Camadas (de baixo para cima):
 *   1. Fundo: a mesma arte, desfocada, ocupando a tela.
 *   2. Sigla mascarada por alpha, com um gradiente interno varrendo.
 */
export default function CarregandoJuvrio({
  mensagem = 'Carregando',
}: {
  mensagem?: string;
}) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#F0F7FF] flex flex-col items-center justify-center gap-10">

      {/* 1) FUNDO DESFOCADO */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <img
          src="/sigla_juv.png"
          alt=""
          aria-hidden
          className="h-full w-full scale-125 object-contain blur-3xl"
        />
      </div>

      {/* 2) SIGLA MASCARADA + VARREDURA */}
      <div className="relative z-10 h-40 w-40 sm:h-48 sm:w-48">
        <div className="animate-respirar h-full w-full">
          <div className="sigla-mascarada h-full w-full" />
        </div>
      </div>

      {/* 3) MENSAGEM */}
      <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.45em] text-sky-500/70">
        {mensagem}
      </p>

    </div>
  );
}