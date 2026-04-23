package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.UsuarioResponse;
import com.noairnobnb.model.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
  @Mapping(
      target = "roles",
      expression =
          "java(usuario.getRoles().stream().map(r -> r.getName().name()).collect(java.util.stream.Collectors.toSet()))")
  UsuarioResponse toResponse(Usuario usuario);
}

