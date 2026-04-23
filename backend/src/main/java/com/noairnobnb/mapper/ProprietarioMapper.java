package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.ProprietarioResponse;
import com.noairnobnb.model.entity.Proprietario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProprietarioMapper {
  @Mapping(target = "usuarioId", source = "usuario.id")
  ProprietarioResponse toResponse(Proprietario proprietario);
}

