package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.ClienteResponse;
import com.noairnobnb.model.entity.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClienteMapper {
  @Mapping(target = "usuarioId", source = "usuario.id")
  ClienteResponse toResponse(Cliente cliente);
}

