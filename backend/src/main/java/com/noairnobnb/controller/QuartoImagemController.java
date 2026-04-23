package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.response.QuartoResponse;
import com.noairnobnb.service.QuartoImagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/quartos/{quartoId}/imagens")
@Tag(name = "Quartos - imagens")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class QuartoImagemController {

  private final QuartoImagemService quartoImagemService;

  public QuartoImagemController(QuartoImagemService quartoImagemService) {
    this.quartoImagemService = quartoImagemService;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Enviar uma ou mais imagens (arquivos locais) para o quarto")
  public QuartoResponse upload(
      @PathVariable Long quartoId, @RequestParam("files") MultipartFile[] files) {
    return quartoImagemService.adicionarImagens(quartoId, files);
  }

  @DeleteMapping("/{imagemId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Remover uma imagem do quarto")
  public ResponseEntity<Void> remover(@PathVariable Long quartoId, @PathVariable Long imagemId) {
    quartoImagemService.removerImagem(quartoId, imagemId);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }
}
