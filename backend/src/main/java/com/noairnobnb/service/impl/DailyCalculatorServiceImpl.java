package com.noairnobnb.service.impl;

import com.noairnobnb.config.NoAirNoBnbProperties;
import com.noairnobnb.exception.DataInvalidaException;
import com.noairnobnb.service.DailyCalculatorService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.springframework.stereotype.Service;

@Service
public class DailyCalculatorServiceImpl implements DailyCalculatorService {
  private final int diariaHour;

  public DailyCalculatorServiceImpl(NoAirNoBnbProperties props) {
    int in = props.business().diaria().checkinHour();
    int out = props.business().diaria().checkoutHour();
    if (in != out) {
      throw new IllegalStateException("Regra de diária exige checkin-hour == checkout-hour (12h).");
    }
    if (in < 0 || in > 23) {
      throw new IllegalStateException("checkin-hour inválido.");
    }
    this.diariaHour = in;
  }

  @Override
  public int calcularNumeroDiarias(LocalDateTime dataHoraEntrada, LocalDateTime dataHoraSaida) {
    if (dataHoraEntrada == null || dataHoraSaida == null) {
      throw new DataInvalidaException("Datas são obrigatórias");
    }
    if (!dataHoraSaida.isAfter(dataHoraEntrada)) {
      throw new DataInvalidaException("dataHoraSaida deve ser posterior a dataHoraEntrada");
    }

    var diffDias =
        java.time.temporal.ChronoUnit.DAYS.between(
            dataHoraEntrada.toLocalDate(), dataHoraSaida.toLocalDate());

    var ciDepois = isDepoisMeioDia(dataHoraEntrada);
    var coDepois = isDepoisMeioDia(dataHoraSaida);

    if (diffDias <= 1) {
      if (diffDias == 0) {
        return 1;
      }
      // diffDias == 1 (dia de calendário consecutivo)
      if (ciDepois && !coDepois) {
        return 1;
      }
      if (!ciDepois && coDepois) {
        return 2;
      }
      if (ciDepois && coDepois) {
        return 2;
      }
      // Entrada antes/às 12h e saída antes/às 12h no dia seguinte
      return 1;
    }

    var inicio = alinharInicio(dataHoraEntrada);
    var fim = alinharFim(dataHoraSaida);

    if (!fim.isAfter(inicio)) {
      return 1;
    }

    var minutes = Duration.between(inicio, fim).toMinutes();
    var dias = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(24L * 60L), 0, RoundingMode.CEILING);
    var n = dias.intValueExact();
    if (n <= 0) {
      throw new DataInvalidaException("Número de diárias inválido");
    }
    return n;
  }

  private LocalDateTime alinharInicio(LocalDateTime entrada) {
    var boundary = entrada.toLocalDate().atTime(LocalTime.of(diariaHour, 0));
    return entrada.isAfter(boundary) ? boundary : boundary.minusDays(1);
  }

  private LocalDateTime alinharFim(LocalDateTime saida) {
    var boundary = saida.toLocalDate().atTime(LocalTime.of(diariaHour, 0));
    return saida.isAfter(boundary) ? boundary.plusDays(1) : boundary;
  }

  private boolean isDepoisMeioDia(LocalDateTime dt) {
    var boundary = dt.toLocalDate().atTime(LocalTime.of(diariaHour, 0));
    return dt.isAfter(boundary);
  }
}
