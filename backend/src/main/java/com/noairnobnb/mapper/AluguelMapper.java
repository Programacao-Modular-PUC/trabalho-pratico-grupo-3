package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.AluguelResponse;
import com.noairnobnb.model.entity.Aluguel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AluguelMapper {
  @Mapping(target = "clienteId", source = "cliente.id")
  @Mapping(target = "clienteNome", source = "cliente.nome")
  @Mapping(target = "quartoId", source = "quarto.id")
  @Mapping(target = "tipoQuarto", source = "quarto.tipoQuarto")
  @Mapping(target = "residenciaId", source = "quarto.residencia.id")
  @Mapping(target = "residenciaEndereco", source = "quarto.residencia.endereco")
  @Mapping(target = "pagamentoId", source = "pagamento.id")
  @Mapping(target = "pagamentoStatus", source = "pagamento.status")
  @Mapping(target = "formaPagamento", source = "pagamento.formaPagamento")
  AluguelResponse toResponse(Aluguel aluguel);
}

