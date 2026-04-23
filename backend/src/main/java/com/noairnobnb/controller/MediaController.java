package com.noairnobnb.controller;

import com.noairnobnb.service.QuartoImagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Mídia pública")
public class MediaController {

  private final QuartoImagemService quartoImagemService;

  public MediaController(QuartoImagemService quartoImagemService) {
    this.quartoImagemService = quartoImagemService;
  }

  @GetMapping("/api/media/quarto-imagens/{imagemId}")
  @Operation(summary = "Baixar imagem de quarto (catálogo)")
  public ResponseEntity<byte[]> quartoImagem(@PathVariable Long imagemId) {
    var arquivo = quartoImagemService.carregarImagemPublica(imagemId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(arquivo.contentType()))
        .body(arquivo.bytes());
  }
}
