package com.noairnobnb.service.pricing;

import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoQuarto;

public final class QuartoCapacidadeHospedes {

  private QuartoCapacidadeHospedes() {}

  public static int camasSolteiroEfetivo(Quarto q) {
    int n = q.getNumCamasSolteiro() != null ? q.getNumCamasSolteiro() : 1;
    return Math.max(1, n);
  }

  /** Capacidade máxima de adultos no quarto família (1 por cama de solteiro, 2 por cama de casal). */
  public static int capacidadeFamilia(Quarto q) {
    int s = n(q.getFamCamasSolteiro());
    int cc = n(q.getFamCamaCasalComum());
    int cg = n(q.getFamCamaCasalGrande());
    return s + 2 * (cc + cg);
  }

  public static int capacidadeEfetiva(Quarto q) {
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      return camasSolteiroEfetivo(q);
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      return 2;
    }
    return Math.max(1, capacidadeFamilia(q));
  }

  private static int n(Integer v) {
    return v == null || v < 0 ? 0 : v;
  }
}
