package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.QuartoCreateRequest;
import com.noairnobnb.dto.request.QuartoUpdateRequest;
import com.noairnobnb.dto.response.OcupacaoCalendarioResponse;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.QuartoResponse;
import com.noairnobnb.model.enums.TipoQuarto;
import com.noairnobnb.service.QuartoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quartos")
@Tag(name = "Quartos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class QuartoController {
  private final QuartoService quartoService;

  public QuartoController(QuartoService quartoService) {
    this.quartoService = quartoService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Criar quarto")
  public ResponseEntity<QuartoResponse> criar(@Valid @RequestBody QuartoCreateRequest request) {
    var body = quartoService.criar(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @GetMapping
  @Operation(summary = "Listar quartos (catálogo / filtros; público GET)")
  public PageResponse<QuartoResponse> listar(
      @PageableDefault(size = 20) Pageable pageable,
      @RequestParam(required = false) Long residenciaId,
      @RequestParam(required = false) TipoQuarto tipo,
      @RequestParam(required = false) Boolean possuiArCondicionado,
      @RequestParam(required = false) Boolean possuiHidromassagem,
      @RequestParam(required = false) LocalDateTime disponivelDe,
      @RequestParam(required = false) LocalDateTime disponivelAte) {
    return quartoService.listar(pageable, residenciaId, tipo, possuiArCondicionado, possuiHidromassagem, disponivelDe, disponivelAte);
  }

  @GetMapping("/residencia/{residenciaId}")
  @Operation(summary = "Listar quartos de uma residência (público GET)")
  public PageResponse<QuartoResponse> listarPorResidencia(
      @PathVariable Long residenciaId, @PageableDefault(size = 20) Pageable pageable) {
    return quartoService.listarPorResidencia(residenciaId, pageable);
  }

  @GetMapping("/{id}/ocupacao-calendario")
  @Operation(summary = "Dias em que o quarto está reservado ou alugado (público; sem dados pessoais)")
  public OcupacaoCalendarioResponse ocupacaoCalendario(@PathVariable Long id) {
    return quartoService.ocupacaoCalendario(id);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Buscar quarto por id (público GET)")
  public QuartoResponse buscar(@PathVariable Long id) {
    return quartoService.buscarPorId(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Atualizar quarto")
  public QuartoResponse atualizar(@PathVariable Long id, @Valid @RequestBody QuartoUpdateRequest request) {
    return quartoService.atualizar(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Excluir quarto")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    quartoService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
