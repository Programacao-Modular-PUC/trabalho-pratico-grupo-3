package com.noairnobnb.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.noairnobnb.exception.CapacidadeExcedidaException;
import com.noairnobnb.exception.RecursoNaoPermitidoException;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.enums.TipoQuarto;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HospedagemCotacaoFactoryTest {

  private HospedagemCotacaoFactory sut;

  @BeforeEach
  void setUp() {
    sut = new HospedagemCotacaoFactory();
  }

  @Test
  void individual_bercoSolicitado_lancaRecursoNaoPermitido() {
    var q = quartoIndividual();

    assertThatThrownBy(() -> sut.criar(q, null, true))
        .isInstanceOf(RecursoNaoPermitidoException.class)
        .hasMessageContaining("Berço não é permitido");
  }

  @Test
  void individual_hospedesAcimaCapacidade_lancaCapacidadeExcedida() {
    var q = quartoIndividual();
    q.setNumCamasSolteiro(1);

    assertThatThrownBy(() -> sut.criar(q, 2, false))
        .isInstanceOf(CapacidadeExcedidaException.class)
        .hasMessageContaining("capacidade");
  }

  @Test
  void casal_bercoSemPermissao_lancaRecursoNaoPermitido() {
    var q = quartoCasal();
    q.setPermiteBerco(false);

    assertThatThrownBy(() -> sut.criar(q, 2, true))
        .isInstanceOf(RecursoNaoPermitidoException.class)
        .hasMessageContaining("berço");
  }

  @Test
  void casal_bercoPermitido_retornaCotacaoComBerco() {
    var q = quartoCasal();
    q.setPermiteBerco(true);

    var cot = sut.criar(q, 2, true);

    assertThat(cot.solicitaBerco()).isTrue();
    assertThat(cot.numeroHospedes()).isEqualTo(2);
  }

  @Test
  void casal_tresHospedes_lancaCapacidadeExcedida() {
    var q = quartoCasal();

    assertThatThrownBy(() -> sut.criar(q, 3, false))
        .isInstanceOf(CapacidadeExcedidaException.class)
        .hasMessageContaining("2 hóspedes");
  }

  @Test
  void familia_hospedesAcimaCapacidade_lancaCapacidadeExcedida() {
    var q = quartoFamilia();

    assertThatThrownBy(() -> sut.criar(q, 10, false))
        .isInstanceOf(CapacidadeExcedidaException.class)
        .hasMessageContaining("entre 1 e");
  }

  @Test
  void familia_bercoSolicitado_lancaRecursoNaoPermitido() {
    var q = quartoFamilia();

    assertThatThrownBy(() -> sut.criar(q, 2, true))
        .isInstanceOf(RecursoNaoPermitidoException.class)
        .hasMessageContaining("família");
  }

  @Test
  void familia_hospedesDentroCapacidade_ok() {
    var q = quartoFamilia();

    var cot = sut.criar(q, 3, false);

    assertThat(cot.numeroHospedes()).isEqualTo(3);
    assertThat(cot.solicitaBerco()).isFalse();
  }

  private static Quarto quartoIndividual() {
    var q = new Quarto();
    q.setTipoQuarto(TipoQuarto.INDIVIDUAL);
    q.setValorBaseDiaria(new BigDecimal("100.00"));
    q.setNumCamasSolteiro(1);
    return q;
  }

  private static Quarto quartoCasal() {
    var q = new Quarto();
    q.setTipoQuarto(TipoQuarto.CASAL);
    q.setValorBaseDiaria(new BigDecimal("150.00"));
    return q;
  }

  private static Quarto quartoFamilia() {
    var q = new Quarto();
    q.setTipoQuarto(TipoQuarto.FAMILIA);
    q.setValorBaseDiaria(new BigDecimal("200.00"));
    q.setFamCamasSolteiro(2);
    q.setFamCamaCasalComum(1);
    q.setFamAmbientesDistintos(1);
    return q;
  }
}
