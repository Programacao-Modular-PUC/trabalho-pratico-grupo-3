package com.noairnobnb.dto.response;

import java.time.LocalDate;
import java.util.List;

/** Dias em que o quarto está reservado ou em aluguel (sem identificar pessoas). */
public record OcupacaoCalendarioResponse(List<LocalDate> diasOcupados) {}
