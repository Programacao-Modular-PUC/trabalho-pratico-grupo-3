package com.noairnobnb.service;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.exception.CapacidadeExcedidaException;
import com.noairnobnb.exception.RecursoNaoPermitidoException;
import com.noairnobnb.model.HospedagemCotacao;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.service.pricing.QuartoCapacidadeHospedes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class HospedagemCotacaoFactory {

  public HospedagemCotacao criar(Quarto q, Integer numeroHospedes, Boolean solicitaBerco) {
    boolean berco = solicitaBerco != null && solicitaBerco;
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      if (berco) {
        throw new RecursoNaoPermitidoException("Berço não é permitido em quarto individual");
      }
      if (numeroHospedes != null && numeroHospedes > QuartoCapacidadeHospedes.camasSolteiroEfetivo(q)) {
        throw new CapacidadeExcedidaException(
            "Número de hóspedes excede a capacidade do quarto individual (máx. "
                + QuartoCapacidadeHospedes.camasSolteiroEfetivo(q)
                + ")");
      }
      return new HospedagemCotacao(null, false);
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      int h = (numeroHospedes != null && numeroHospedes > 0) ? numeroHospedes : 2;
      if (h > 2) {
        throw new CapacidadeExcedidaException("Quarto casal comporta no máximo 2 hóspedes");
      }
      if (berco && !Boolean.TRUE.equals(q.getPermiteBerco())) {
        throw new RecursoNaoPermitidoException("Este quarto não oferece berço");
      }
      return new HospedagemCotacao(h, berco);
    }
    if (q.getTipoQuarto() == TipoQuarto.FAMILIA) {
      if (berco) {
        throw new RecursoNaoPermitidoException("Berço não é permitido em quarto família");
      }
      if (numeroHospedes == null) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "HOSPEDES_FAMILIA_OBRIGATORIO", "Informe o número de hóspedes (quarto família).");
      }
      int cap = QuartoCapacidadeHospedes.capacidadeFamilia(q);
      if (cap < 1) {
        throw new BusinessException(
            HttpStatus.BAD_REQUEST, "FAMILIA_CONFIG_INVALIDA", "Quarto família sem capacidade configurada. Ajuste o cadastro do quarto.");
      }
      if (numeroHospedes < 1 || numeroHospedes > cap) {
        throw new CapacidadeExcedidaException("Número de hóspedes deve ser entre 1 e " + cap + " para este quarto.");
      }
      return new HospedagemCotacao(numeroHospedes, false);
    }
    return HospedagemCotacao.padraoParaQuarto(q);
  }

  public HospedagemCotacao paraAluguelExistente(Quarto q, Integer numeroHospedes, boolean solicitaBerco) {
    if (q.getTipoQuarto() == TipoQuarto.INDIVIDUAL) {
      return new HospedagemCotacao(null, false);
    }
    if (q.getTipoQuarto() == TipoQuarto.CASAL) {
      int h = (numeroHospedes != null && numeroHospedes > 0) ? numeroHospedes : 2;
      return new HospedagemCotacao(h, solicitaBerco);
    }
    if (q.getTipoQuarto() == TipoQuarto.FAMILIA) {
      int h = (numeroHospedes != null) ? numeroHospedes : 1;
      return new HospedagemCotacao(h, false);
    }
    return HospedagemCotacao.padraoParaQuarto(q);
  }
}
