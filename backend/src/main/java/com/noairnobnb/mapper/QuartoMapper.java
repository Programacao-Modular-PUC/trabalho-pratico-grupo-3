package com.noairnobnb.mapper;

import com.noairnobnb.dto.response.QuartoImagemResponse;
import com.noairnobnb.dto.response.QuartoResponse;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.entity.QuartoImagem;
import java.util.Comparator;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuartoMapper {
  @Mapping(target = "residenciaId", source = "residencia.id")
  @Mapping(target = "residenciaEndereco", source = "residencia.endereco")
  @Mapping(target = "residenciaNumero", source = "residencia.numero")
  @Mapping(target = "proprietarioId", source = "residencia.proprietario.id")
  @Mapping(target = "proprietarioNome", source = "residencia.proprietario.nome")
  @Mapping(
      target = "capacidadeMaximaHospedes",
      expression = "java(com.noairnobnb.service.pricing.QuartoCapacidadeHospedes.capacidadeEfetiva(quarto))")
  @Mapping(target = "imagens", expression = "java(mapImagens(quarto))")
  QuartoResponse toResponse(Quarto quarto);

  default List<QuartoImagemResponse> mapImagens(Quarto quarto) {
    if (quarto.getImagens() == null || quarto.getImagens().isEmpty()) {
      return List.of();
    }
    return quarto.getImagens().stream()
        .sorted(Comparator.comparingInt(QuartoImagem::getOrdem))
        .map(
            img ->
                new QuartoImagemResponse(
                    img.getId(), "/api/media/quarto-imagens/" + img.getId()))
        .toList();
  }
}

