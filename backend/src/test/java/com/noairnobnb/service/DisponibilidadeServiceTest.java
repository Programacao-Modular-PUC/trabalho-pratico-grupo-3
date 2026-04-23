package com.noairnobnb.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.model.enums.ReservaStatus;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.service.impl.DisponibilidadeServiceImpl;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class DisponibilidadeServiceTest {

  @Mock private ReservaRepository reservaRepository;
  @Mock private AluguelRepository aluguelRepository;

  private DisponibilidadeService sut;

  private final LocalDateTime inicio = LocalDateTime.of(2026, 5, 1, 10, 0);
  private final LocalDateTime fim = LocalDateTime.of(2026, 5, 5, 10, 0);

  @BeforeEach
  void setUp() {
    sut = new DisponibilidadeServiceImpl(reservaRepository, aluguelRepository);
  }

  @Test
  void assertPeriodoLivreParaAluguel_reservaAtivaConflitante_lancaReservaConflito() {
    when(reservaRepository.existsConflitoPeriodoIgnorando(eq(7L), eq(inicio), eq(fim), eq(ReservaStatus.ATIVA), isNull()))
        .thenReturn(true);

    assertThatThrownBy(() -> sut.assertPeriodoLivreParaAluguel(7L, inicio, fim, null))
        .isInstanceOf(BusinessException.class)
        .hasFieldOrPropertyWithValue("code", "RESERVA_CONFLITO")
        .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);

    verify(aluguelRepository, never()).existsConflitoPeriodoIgnorando(any(), any(), any(), any(), any());
  }

  @Test
  void assertPeriodoLivreParaAluguel_aluguelConflitante_lancaAluguelConflito() {
    when(reservaRepository.existsConflitoPeriodoIgnorando(eq(7L), eq(inicio), eq(fim), eq(ReservaStatus.ATIVA), isNull()))
        .thenReturn(false);
    when(aluguelRepository.existsConflitoPeriodoIgnorando(eq(7L), eq(inicio), eq(fim), any(), isNull()))
        .thenReturn(true);

    assertThatThrownBy(() -> sut.assertPeriodoLivreParaAluguel(7L, inicio, fim, null))
        .isInstanceOf(BusinessException.class)
        .hasFieldOrPropertyWithValue("code", "ALUGUEL_CONFLITO")
        .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
  }

  @Test
  void assertPeriodoLivreParaReserva_aluguelConflitante_lancaAluguelConflito() {
    when(reservaRepository.existsConflitoPeriodoIgnorando(eq(7L), eq(inicio), eq(fim), eq(ReservaStatus.ATIVA), isNull()))
        .thenReturn(false);
    when(aluguelRepository.existsConflitoPeriodoIgnorando(eq(7L), eq(inicio), eq(fim), any(), isNull()))
        .thenReturn(true);

    assertThatThrownBy(() -> sut.assertPeriodoLivreParaReserva(7L, inicio, fim, null))
        .isInstanceOf(BusinessException.class)
        .hasFieldOrPropertyWithValue("code", "ALUGUEL_CONFLITO");
  }

  @Test
  void assertPeriodoLivreParaReserva_reservaConflitante_lancaReservaConflito() {
    when(reservaRepository.existsConflitoPeriodoIgnorando(eq(7L), eq(inicio), eq(fim), eq(ReservaStatus.ATIVA), isNull()))
        .thenReturn(true);

    assertThatThrownBy(() -> sut.assertPeriodoLivreParaReserva(7L, inicio, fim, null))
        .isInstanceOf(BusinessException.class)
        .hasFieldOrPropertyWithValue("code", "RESERVA_CONFLITO");

    verify(aluguelRepository, never()).existsConflitoPeriodoIgnorando(any(), any(), any(), any(), any());
  }

  @Test
  void assertPeriodoLivre_periodoInvalido_lancaBadRequest() {
    assertThatThrownBy(() -> sut.assertPeriodoLivreParaAluguel(1L, inicio, inicio, null))
        .isInstanceOf(BusinessException.class)
        .hasFieldOrPropertyWithValue("code", "PERIODO_INVALIDO")
        .hasFieldOrPropertyWithValue("status", HttpStatus.BAD_REQUEST);
  }
}
