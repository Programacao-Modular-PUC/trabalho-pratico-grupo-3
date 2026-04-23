package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.ResidenciaResponse;
import com.noairnobnb.model.entity.Residencia;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResidenciaMapper {
  @Mapping(target = "proprietarioId", source = "proprietario.id")
  @Mapping(target = "proprietarioNome", source = "proprietario.nome")
  ResidenciaResponse toResponse(Residencia residencia);
}

