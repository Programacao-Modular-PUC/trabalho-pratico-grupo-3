package com.noairnobnb.service.pricing;

import com.noairnobnb.config.NoAirNoBnbProperties;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoCamaCasal;
import com.noairnobnb.model.enums.TipoQuarto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Aplica a regra de preço do tipo de quarto (individual, casal, família) sobre o valor
 * base, antes de extras (ar / hidromassagem) — requisito Sprint 2.
 */
@Component
@Order(1)
public class RegrasEspecificasTipoQuartoDiariaStrategy implements DiariaPricingStrategy {
  private final NoAirNoBnbProperties props;

  public RegrasEspecificasTipoQuartoDiariaStrategy(NoAirNoBnbProperties props) {
    this.props = props;
  }

  @Override
  public BigDecimal apply(DiariaValorContext context, BigDecimal currentValorDiaria) {
    var q = context.quarto();
    var base = context.valorBaseDiaria();
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      return individual(base, q);
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      return casal(base, q, context);
    }
    if (q.getTipoQuarto() == TipoQuarto.FAMILIA) {
      return familia(base, q, context);
    }
    return currentValorDiaria;
  }

  private static BigDecimal individual(BigDecimal base, Quarto q) {
    int camas = QuartoCapacidadeHospedes.camasSolteiroEfetivo(q);
    var adicBed = nvlZero(q.getAdicionalDiariaPorCamaExtra());
    var somaCama = adicBed.multiply(BigDecimal.valueOf(Math.max(0, camas - 1)));
    return base.add(somaCama).setScale(2, RoundingMode.HALF_UP);
  }

  private static BigDecimal casal(BigDecimal base, Quarto q, DiariaValorContext context) {
    var cot = context.cotacaoOuPadrao();
    var tipoCama = q.getTipoCamaCasal() != null ? q.getTipoCamaCasal() : TipoCamaCasal.COMUM;
    var conforto =
        tipoCama == TipoCamaCasal.COMUM
            ? nvlZero(q.getAdicionalConfortoCamaComum())
            : nvlZero(q.getAdicionalConfortoQueenKing());
    var sub = base.add(conforto);
    if (cot.solicitaBerco() && Boolean.TRUE.equals(q.getPermiteBerco())) {
      sub = sub.add(nvlZero(q.getTaxaDiariaBerco()));
    }
    return sub.setScale(2, RoundingMode.HALF_UP);
  }

  private BigDecimal familia(BigDecimal base, Quarto q, DiariaValorContext context) {
    int cap = Math.max(1, QuartoCapacidadeHospedes.capacidadeFamilia(q));
    int hPedido = context.cotacaoOuPadrao().numeroHospedes() != null
        ? context.cotacaoOuPadrao().numeroHospedes()
        : 1;
    int h = Math.min(Math.max(1, hPedido), cap);
    var fam = props.business().pricing().familia();
    var k = fam.percentualAcrescimoSobreBasePorHospedeAcimaDoPrimeiro();
    var fatorHospedes = BigDecimal.ONE.add(k.multiply(BigDecimal.valueOf(h - 1)));
    var partePessoas = base.multiply(fatorHospedes);
    int amb = nvlZeroInt(q.getFamAmbientesDistintos());
    var taxaAmb = fam.taxaDiariaPorAmbiente();
    var parteAmb = taxaAmb.multiply(BigDecimal.valueOf(amb));
    var bruto = partePessoas.add(parteAmb);
    if (h < 3) {
      return bruto.setScale(2, RoundingMode.HALF_UP);
    }
    var descontoPasso = fam.descontoProgressivoPorHospedeGrupo();
    var descontoMax = fam.descontoGrupoMaximo();
    var desconto = descontoPasso.multiply(BigDecimal.valueOf(h - 2));
    if (desconto.compareTo(descontoMax) > 0) {
      desconto = descontoMax;
    }
    var mult = BigDecimal.ONE.subtract(desconto);
    return bruto.multiply(mult).setScale(2, RoundingMode.HALF_UP);
  }

  private static BigDecimal nvlZero(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }

  private static int nvlZeroInt(Integer v) {
    return v == null || v < 0 ? 0 : v;
  }
}
