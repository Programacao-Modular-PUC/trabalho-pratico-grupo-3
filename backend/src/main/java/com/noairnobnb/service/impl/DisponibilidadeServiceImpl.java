package com.noairnobnb.service.impl;

import com.noairnobnb.exception.DataInvalidaException;
import com.noairnobnb.exception.QuartoIndisponivelException;
import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.ReservaStatus;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.service.DisponibilidadeService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DisponibilidadeServiceImpl implements DisponibilidadeService {
  private static final List<AluguelStatus> ALUGUEL_OCUPA =
      List.of(AluguelStatus.ATIVO, AluguelStatus.FINALIZADO);

  private final ReservaRepository reservaRepository;
  private final AluguelRepository aluguelRepository;

  public DisponibilidadeServiceImpl(ReservaRepository reservaRepository, AluguelRepository aluguelRepository) {
    this.reservaRepository = reservaRepository;
    this.aluguelRepository = aluguelRepository;
  }

  @Override
  public void assertPeriodoLivreParaReserva(
      Long quartoId, LocalDateTime inicio, LocalDateTime fim, Long ignorarReservaId) {
    validarPeriodoBasico(inicio, fim);

    if (reservaRepository.existsConflitoPeriodoIgnorando(
        quartoId, inicio, fim, ReservaStatus.ATIVA, ignorarReservaId)) {
      throw new QuartoIndisponivelException("Conflito de período com reserva ativa");
    }

    if (aluguelRepository.existsConflitoPeriodoIgnorando(quartoId, inicio, fim, ALUGUEL_OCUPA, null)) {
      throw new QuartoIndisponivelException("Conflito de período com aluguel");
    }
  }

  @Override
  public void assertPeriodoLivreParaAluguel(
      Long quartoId, LocalDateTime inicio, LocalDateTime fim, Long ignorarAluguelId) {
    validarPeriodoBasico(inicio, fim);

    if (reservaRepository.existsConflitoPeriodoIgnorando(quartoId, inicio, fim, ReservaStatus.ATIVA, null)) {
      throw new QuartoIndisponivelException("Conflito de período com reserva ativa");
    }

    if (aluguelRepository.existsConflitoPeriodoIgnorando(quartoId, inicio, fim, ALUGUEL_OCUPA, ignorarAluguelId)) {
      throw new QuartoIndisponivelException("Conflito de período com aluguel");
    }
  }

  private void validarPeriodoBasico(LocalDateTime inicio, LocalDateTime fim) {
    if (inicio == null || fim == null) {
      throw new DataInvalidaException("Datas são obrigatórias");
    }
    if (!fim.isAfter(inicio)) {
      throw new DataInvalidaException("dataHoraSaida deve ser posterior a dataHoraEntrada");
    }
  }
}
