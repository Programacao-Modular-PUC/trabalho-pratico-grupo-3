package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.ReservaResponse;
import com.noairnobnb.model.entity.Reserva;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReservaMapper {
  @Mapping(target = "clienteId", source = "cliente.id")
  @Mapping(target = "clienteNome", source = "cliente.nome")
  @Mapping(target = "quartoId", source = "quarto.id")
  @Mapping(target = "tipoQuarto", source = "quarto.tipoQuarto")
  @Mapping(target = "residenciaId", source = "quarto.residencia.id")
  @Mapping(target = "residenciaEndereco", source = "quarto.residencia.endereco")
  ReservaResponse toResponse(Reserva reserva);
}

