package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.PagamentoResponse;
import com.noairnobnb.model.entity.Pagamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PagamentoMapper {
  @Mapping(target = "aluguelId", source = "aluguel.id")
  @Mapping(target = "clienteId", source = "aluguel.cliente.id")
  @Mapping(target = "clienteNome", source = "aluguel.cliente.nome")
  @Mapping(target = "quartoId", source = "aluguel.quarto.id")
  @Mapping(target = "residenciaId", source = "aluguel.quarto.residencia.id")
  PagamentoResponse toResponse(Pagamento pagamento);
}

