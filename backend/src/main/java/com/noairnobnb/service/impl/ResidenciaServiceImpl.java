package com.noairnobnb.service.impl;

import com.noairnobnb.dto.request.ResidenciaCreateRequest;
import com.noairnobnb.dto.request.ResidenciaUpdateRequest;
import com.noairnobnb.dto.response.PageResponse;
import com.noairnobnb.dto.response.ResidenciaResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.ResidenciaMapper;
import com.noairnobnb.model.entity.Proprietario;
import com.noairnobnb.model.entity.Residencia;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.repository.ResidenciaRepository;
import com.noairnobnb.service.ResidenciaService;
import com.noairnobnb.util.PageUtils;
import com.noairnobnb.util.SecurityUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResidenciaServiceImpl implements ResidenciaService {
  private final ResidenciaRepository residenciaRepository;
  private final ProprietarioRepository proprietarioRepository;
  private final ReservaRepository reservaRepository;
  private final AluguelRepository aluguelRepository;
  private final ResidenciaMapper residenciaMapper;

  public ResidenciaServiceImpl(
      ResidenciaRepository residenciaRepository,
      ProprietarioRepository proprietarioRepository,
      ReservaRepository reservaRepository,
      AluguelRepository aluguelRepository,
      ResidenciaMapper residenciaMapper) {
    this.residenciaRepository = residenciaRepository;
    this.proprietarioRepository = proprietarioRepository;
    this.reservaRepository = reservaRepository;
    this.aluguelRepository = aluguelRepository;
    this.residenciaMapper = residenciaMapper;
  }

  @Override
  @Transactional
  public ResidenciaResponse criar(ResidenciaCreateRequest request) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    var proprietario = resolveProprietarioParaCriacao(request);
    var r = new Residencia();
    r.setProprietario(proprietario);
    aplicarDados(r, request);
    residenciaRepository.save(r);
    return residenciaMapper.toResponse(residenciaRepository.findFetchedById(r.getId()).orElse(r));
  }

  private Proprietario resolveProprietarioParaCriacao(ResidenciaCreateRequest request) {
    if (SecurityUtils.hasAny("ADMIN")) {
      if (request.proprietarioId() == null) {
        throw new BusinessException(HttpStatus.BAD_REQUEST, "PROPRIETARIO_ID_OBRIGATORIO", "Informe proprietarioId ao criar como ADMIN");
      }
      return proprietarioRepository
          .findById(request.proprietarioId())
          .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
    }
    var principal = SecurityUtils.requireUser();
    return proprietarioRepository
        .findByUsuarioId(principal.getUserId())
        .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
  }

  private static void aplicarDados(Residencia r, ResidenciaCreateRequest req) {
    r.setEndereco(req.endereco().trim());
    r.setNumero(req.numero().trim());
    r.setBairro(req.bairro().trim());
    r.setCep(req.cep().trim());
    r.setTelefone(req.telefone().trim());
    r.setEmail(req.email().trim().toLowerCase());
  }

  private static void aplicarUpdate(Residencia r, ResidenciaUpdateRequest req) {
    r.setEndereco(req.endereco().trim());
    r.setNumero(req.numero().trim());
    r.setBairro(req.bairro().trim());
    r.setCep(req.cep().trim());
    r.setTelefone(req.telefone().trim());
    r.setEmail(req.email().trim().toLowerCase());
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ResidenciaResponse> listar(Pageable pageable) {
    SecurityUtils.requireAny("ADMIN");
    return PageUtils.map(residenciaRepository.findAllFetched(pageable), residenciaMapper::toResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public ResidenciaResponse buscarPorId(Long id) {
    var r =
        residenciaRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESIDENCIA_NAO_ENCONTRADA", "Residência não encontrada"));
    if (!SecurityUtils.isAuthenticated()) {
      return residenciaMapper.toResponse(r);
    }
    assertAcessoLeitura(r);
    return residenciaMapper.toResponse(r);
  }

  @Override
  @Transactional
  public ResidenciaResponse atualizar(Long id, ResidenciaUpdateRequest request) {
    var r =
        residenciaRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESIDENCIA_NAO_ENCONTRADA", "Residência não encontrada"));
    assertAcessoEscrita(r);
    aplicarUpdate(r, request);
    residenciaRepository.save(r);
    return residenciaMapper.toResponse(residenciaRepository.findFetchedById(id).orElse(r));
  }

  @Override
  @Transactional
  public void excluir(Long id) {
    var r =
        residenciaRepository
            .findFetchedById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESIDENCIA_NAO_ENCONTRADA", "Residência não encontrada"));
    assertAcessoEscrita(r);
    if (reservaRepository.existsByQuarto_Residencia_Id(id) || aluguelRepository.existsByQuarto_Residencia_Id(id)) {
      throw new BusinessException(HttpStatus.CONFLICT, "RESIDENCIA_EM_USO", "Existem reservas ou aluguéis vinculados a quartos desta residência");
    }
    residenciaRepository.delete(r);
  }

  @Override
  @Transactional(readOnly = true)
  public PageResponse<ResidenciaResponse> listarPorProprietario(Long proprietarioId, Pageable pageable) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var me =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!me.getId().equals(proprietarioId)) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    return PageUtils.map(
        residenciaRepository.findAllFetchedByProprietarioId(proprietarioId, pageable), residenciaMapper::toResponse);
  }

  private void assertAcessoLeitura(Residencia r) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return;
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!r.getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return;
    }
    if (SecurityUtils.hasAny("CLIENTE")) {
      return;
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  private void assertAcessoEscrita(Residencia r) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return;
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!r.getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return;
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }
}
