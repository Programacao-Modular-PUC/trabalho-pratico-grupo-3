package com.noairnobnb.controller;

import com.noairnobnb.config.OpenApiConfig;
import com.noairnobnb.dto.request.ResidenciaCreateRequest;
import com.noairnobnb.dto.request.ResidenciaUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ResidenciaResponse;
import com.noairnobnb.service.ResidenciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/residencias")
@Tag(name = "Residências")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ResidenciaController {
  private final ResidenciaService residenciaService;

  public ResidenciaController(ResidenciaService residenciaService) {
    this.residenciaService = residenciaService;
  }

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Criar residência")
  public ResponseEntity<ResidenciaResponse> criar(@Valid @RequestBody ResidenciaCreateRequest request) {
    var body = residenciaService.criar(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Listar todas (ADMIN)")
  public PageResponse<ResidenciaResponse> listar(@PageableDefault(size = 20) Pageable pageable) {
    return residenciaService.listar(pageable);
  }

  @GetMapping("/proprietario/{proprietarioId}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Listar por proprietário")
  public PageResponse<ResidenciaResponse> listarPorProprietario(
      @PathVariable Long proprietarioId, @PageableDefault(size = 20) Pageable pageable) {
    return residenciaService.listarPorProprietario(proprietarioId, pageable);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Buscar por id (público GET)")
  public ResidenciaResponse buscar(@PathVariable Long id) {
    return residenciaService.buscarPorId(id);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Atualizar residência")
  public ResidenciaResponse atualizar(@PathVariable Long id, @Valid @RequestBody ResidenciaUpdateRequest request) {
    return residenciaService.atualizar(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','PROPRIETARIO')")
  @Operation(summary = "Excluir residência")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    residenciaService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
