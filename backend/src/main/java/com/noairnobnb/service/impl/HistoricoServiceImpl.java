package com.noairnobnb.service.impl;

import com.noairnobnb.dto.response.HistoricoLinhaResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.repository.AluguelRepository;
import com.noairnobnb.repository.ClienteRepository;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.QuartoRepository;
import com.noairnobnb.repository.ReservaRepository;
import com.noairnobnb.repository.ResidenciaRepository;
import com.noairnobnb.service.HistoricoService;
import com.noairnobnb.util.SecurityUtils;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HistoricoServiceImpl implements HistoricoService {
  private final ReservaRepository reservaRepository;
  private final AluguelRepository aluguelRepository;
  private final ClienteRepository clienteRepository;
  private final ProprietarioRepository proprietarioRepository;
  private final QuartoRepository quartoRepository;
  private final ResidenciaRepository residenciaRepository;

  public HistoricoServiceImpl(
      ReservaRepository reservaRepository,
      AluguelRepository aluguelRepository,
      ClienteRepository clienteRepository,
      ProprietarioRepository proprietarioRepository,
      QuartoRepository quartoRepository,
      ResidenciaRepository residenciaRepository) {
    this.reservaRepository = reservaRepository;
    this.aluguelRepository = aluguelRepository;
    this.clienteRepository = clienteRepository;
    this.proprietarioRepository = proprietarioRepository;
    this.quartoRepository = quartoRepository;
    this.residenciaRepository = residenciaRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<HistoricoLinhaResponse> porCliente(Long clienteId) {
    SecurityUtils.requireAny("ADMIN", "CLIENTE");
    if (SecurityUtils.hasAny("CLIENTE")) {
      var principal = SecurityUtils.requireUser();
      var me =
          clienteRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "CLIENTE_NAO_ENCONTRADO", "Cliente não encontrado"));
      if (!me.getId().equals(clienteId)) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    var pageable = PageRequest.of(0, 500, Sort.by(Sort.Direction.DESC, "createdAt"));
    var reservas = reservaRepository.findAllFetchedByClienteId(clienteId, pageable).getContent();
    var alugueis = aluguelRepository.findAllFetchedByClienteId(clienteId, pageable).getContent();
    var linhas = new ArrayList<HistoricoLinhaResponse>();
    reservas.forEach(
        r ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "RESERVA",
                    r.getId(),
                    r.getStatus().name(),
                    r.getDataHoraEntrada(),
                    r.getDataHoraSaida(),
                    r.getValorPrevisto(),
                    r.getQuarto().getId(),
                    resumoResidencia(r.getQuarto().getResidencia().getEndereco(), r.getQuarto().getResidencia().getNumero()),
                    r.getCreatedAt())));
    alugueis.forEach(
        a ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "ALUGUEL",
                    a.getId(),
                    a.getStatus().name(),
                    a.getDataHoraEntrada(),
                    a.getDataHoraSaida(),
                    a.getValorTotal(),
                    a.getQuarto().getId(),
                    resumoResidencia(a.getQuarto().getResidencia().getEndereco(), a.getQuarto().getResidencia().getNumero()),
                    a.getCreatedAt())));
    linhas.sort(Comparator.comparing(HistoricoLinhaResponse::registradoEm).reversed());
    return linhas;
  }

  @Override
  @Transactional(readOnly = true)
  public List<HistoricoLinhaResponse> porQuarto(Long quartoId) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    var q =
        quartoRepository
            .findFetchedById(quartoId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!q.getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    var pageable = PageRequest.of(0, 500, Sort.by(Sort.Direction.DESC, "createdAt"));
    var reservas = reservaRepository.findAllFetchedByQuartoId(quartoId, pageable).getContent();
    var alugueis = aluguelRepository.findAllFetchedByQuartoId(quartoId, pageable).getContent();
    var linhas = new ArrayList<HistoricoLinhaResponse>();
    reservas.forEach(
        r ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "RESERVA",
                    r.getId(),
                    r.getStatus().name(),
                    r.getDataHoraEntrada(),
                    r.getDataHoraSaida(),
                    r.getValorPrevisto(),
                    r.getQuarto().getId(),
                    resumoResidencia(r.getQuarto().getResidencia().getEndereco(), r.getQuarto().getResidencia().getNumero()),
                    r.getCreatedAt())));
    alugueis.forEach(
        a ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "ALUGUEL",
                    a.getId(),
                    a.getStatus().name(),
                    a.getDataHoraEntrada(),
                    a.getDataHoraSaida(),
                    a.getValorTotal(),
                    a.getQuarto().getId(),
                    resumoResidencia(a.getQuarto().getResidencia().getEndereco(), a.getQuarto().getResidencia().getNumero()),
                    a.getCreatedAt())));
    linhas.sort(Comparator.comparing(HistoricoLinhaResponse::registradoEm).reversed());
    return linhas;
  }

  @Override
  @Transactional(readOnly = true)
  public List<HistoricoLinhaResponse> porResidencia(Long residenciaId) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    var res =
        residenciaRepository
            .findFetchedById(residenciaId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "RESIDENCIA_NAO_ENCONTRADA", "Residência não encontrada"));
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!res.getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
    }
    var reservas = reservaRepository.findAllFetchedByResidenciaId(residenciaId);
    var alugueis = aluguelRepository.findAllFetchedByResidenciaId(residenciaId);
    var linhas = new ArrayList<HistoricoLinhaResponse>();
    reservas.forEach(
        r ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "RESERVA",
                    r.getId(),
                    r.getStatus().name(),
                    r.getDataHoraEntrada(),
                    r.getDataHoraSaida(),
                    r.getValorPrevisto(),
                    r.getQuarto().getId(),
                    resumoResidencia(r.getQuarto().getResidencia().getEndereco(), r.getQuarto().getResidencia().getNumero()),
                    r.getCreatedAt())));
    alugueis.forEach(
        a ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "ALUGUEL",
                    a.getId(),
                    a.getStatus().name(),
                    a.getDataHoraEntrada(),
                    a.getDataHoraSaida(),
                    a.getValorTotal(),
                    a.getQuarto().getId(),
                    resumoResidencia(a.getQuarto().getResidencia().getEndereco(), a.getQuarto().getResidencia().getNumero()),
                    a.getCreatedAt())));
    linhas.sort(Comparator.comparing(HistoricoLinhaResponse::registradoEm).reversed());
    return linhas;
  }

  @Override
  @Transactional(readOnly = true)
  public List<HistoricoLinhaResponse> recentes(Pageable pageable) {
    SecurityUtils.requireAny("ADMIN");
    var pg = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));
    var reservas = reservaRepository.findAllFetched(pg).getContent();
    var alugueis = aluguelRepository.findAllFetched(pg).getContent();
    var linhas = new ArrayList<HistoricoLinhaResponse>();
    reservas.forEach(
        r ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "RESERVA",
                    r.getId(),
                    r.getStatus().name(),
                    r.getDataHoraEntrada(),
                    r.getDataHoraSaida(),
                    r.getValorPrevisto(),
                    r.getQuarto().getId(),
                    resumoResidencia(r.getQuarto().getResidencia().getEndereco(), r.getQuarto().getResidencia().getNumero()),
                    r.getCreatedAt())));
    alugueis.forEach(
        a ->
            linhas.add(
                new HistoricoLinhaResponse(
                    "ALUGUEL",
                    a.getId(),
                    a.getStatus().name(),
                    a.getDataHoraEntrada(),
                    a.getDataHoraSaida(),
                    a.getValorTotal(),
                    a.getQuarto().getId(),
                    resumoResidencia(a.getQuarto().getResidencia().getEndereco(), a.getQuarto().getResidencia().getNumero()),
                    a.getCreatedAt())));
    linhas.sort(Comparator.comparing(HistoricoLinhaResponse::registradoEm).reversed());
    return linhas.stream().limit(Math.min(100, pageable.getPageSize() * 2L)).toList();
  }

  private static String resumoResidencia(String endereco, String numero) {
    return endereco + ", " + numero;
  }
}
