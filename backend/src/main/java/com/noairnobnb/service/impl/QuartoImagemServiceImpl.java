package com.noairnobnb.service.impl;

import com.noairnobnb.config.UploadProperties;
import com.noairnobnb.dto.media.ImagemArquivo;
import com.noairnobnb.dto.response.QuartoResponse;
import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.QuartoMapper;
import com.noairnobnb.model.entity.Quarto;
import com.noairnobnb.model.entity.QuartoImagem;
import com.noairnobnb.repository.ProprietarioRepository;
import com.noairnobnb.repository.QuartoImagemRepository;
import com.noairnobnb.repository.QuartoRepository;
import com.noairnobnb.service.QuartoImagemService;
import com.noairnobnb.util.SecurityUtils;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class QuartoImagemServiceImpl implements QuartoImagemService {

  private final QuartoRepository quartoRepository;
  private final QuartoImagemRepository quartoImagemRepository;
  private final ProprietarioRepository proprietarioRepository;
  private final QuartoMapper quartoMapper;
  private final UploadProperties uploadProperties;

  public QuartoImagemServiceImpl(
      QuartoRepository quartoRepository,
      QuartoImagemRepository quartoImagemRepository,
      ProprietarioRepository proprietarioRepository,
      QuartoMapper quartoMapper,
      UploadProperties uploadProperties) {
    this.quartoRepository = quartoRepository;
    this.quartoImagemRepository = quartoImagemRepository;
    this.proprietarioRepository = proprietarioRepository;
    this.quartoMapper = quartoMapper;
    this.uploadProperties = uploadProperties;
  }

  @Override
  @Transactional
  public QuartoResponse adicionarImagens(Long quartoId, MultipartFile[] arquivos) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    long novos = arquivos == null ? 0 : Arrays.stream(arquivos).filter(f -> f != null && !f.isEmpty()).count();
    if (novos == 0) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "ARQUIVOS_VAZIOS", "Envie ao menos um arquivo de imagem");
    }
    var quarto =
        quartoRepository
            .findFetchedById(quartoId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QUARTO_NAO_ENCONTRADO", "Quarto não encontrado"));
    assertEscrita(quarto);

    long existentes = quartoImagemRepository.countByQuarto_Id(quartoId);
    int max = uploadProperties.getMaxImagensPorQuarto();
    if (existentes + novos > max) {
      throw new BusinessException(
          HttpStatus.BAD_REQUEST,
          "LIMITE_IMAGENS",
          "Limite de " + max + " imagens por quarto. Já existem " + existentes + ".");
    }

    int ordem =
        (int)
            quartoImagemRepository.findByQuarto_IdOrderByOrdemAsc(quartoId).stream()
                .mapToInt(QuartoImagem::getOrdem)
                .max()
                .orElse(-1)
            + 1;

    for (MultipartFile file : arquivos) {
      if (file == null || file.isEmpty()) {
        continue;
      }
      validarImagem(file);
      String ext = extensaoPara(file.getContentType());
      String nome = UUID.randomUUID().toString().toLowerCase(Locale.ROOT) + "." + ext;
      Path dir = diretorioQuarto(quartoId);
      try {
        Files.createDirectories(dir);
        Path destino = dir.resolve(nome);
        file.transferTo(destino);
      } catch (IOException e) {
        throw new BusinessException(
            HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FALHOU", "Não foi possível gravar o arquivo: " + e.getMessage());
      }

      var img = new QuartoImagem();
      img.setQuarto(quarto);
      img.setNomeArquivo(nome);
      img.setOrdem(ordem++);
      img.setContentType(file.getContentType());
      quartoImagemRepository.save(img);
    }

    return quartoMapper.toResponse(
        quartoRepository.findFetchedById(quartoId).orElseThrow());
  }

  @Override
  @Transactional
  public void removerImagem(Long quartoId, Long imagemId) {
    SecurityUtils.requireAny("ADMIN", "PROPRIETARIO");
    var img =
        quartoImagemRepository
            .findByIdAndQuarto_Id(imagemId, quartoId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "IMAGEM_NAO_ENCONTRADA", "Imagem não encontrada"));
    assertEscrita(img.getQuarto());
    try {
      Files.deleteIfExists(arquivoPath(quartoId, img.getNomeArquivo()));
    } catch (IOException ignored) {
      // disco inconsistente - segue removendo metadados
    }
    quartoImagemRepository.delete(img);
  }

  @Override
  @Transactional
  public void removerTodasDoQuarto(Long quartoId) {
    var lista = quartoImagemRepository.findByQuarto_IdOrderByOrdemAsc(quartoId);
    for (var img : lista) {
      try {
        Files.deleteIfExists(arquivoPath(quartoId, img.getNomeArquivo()));
      } catch (IOException ignored) {
        // ignore
      }
    }
    quartoImagemRepository.deleteByQuarto_Id(quartoId);
  }

  @Override
  @Transactional(readOnly = true)
  public ImagemArquivo carregarImagemPublica(Long imagemId) {
    var imagem =
        quartoImagemRepository
            .findById(imagemId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "IMAGEM_NAO_ENCONTRADA", "Imagem não encontrada"));
    Long quartoId = imagem.getQuarto().getId();
    Path path = arquivoPath(quartoId, imagem.getNomeArquivo());
    try {
      return new ImagemArquivo(Files.readAllBytes(path), imagem.getContentType());
    } catch (IOException e) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "ARQUIVO_AUSENTE", "Arquivo de imagem não encontrado no servidor");
    }
  }

  private void assertEscrita(Quarto quarto) {
    if (SecurityUtils.hasAny("ADMIN")) {
      return;
    }
    if (SecurityUtils.hasAny("PROPRIETARIO")) {
      var principal = SecurityUtils.requireUser();
      var prop =
          proprietarioRepository
              .findByUsuarioId(principal.getUserId())
              .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "PROPRIETARIO_NAO_ENCONTRADO", "Proprietário não encontrado"));
      if (!quarto.getResidencia().getProprietario().getId().equals(prop.getId())) {
        throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
      }
      return;
    }
    throw new BusinessException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Acesso negado");
  }

  private void validarImagem(MultipartFile file) {
    String ct = file.getContentType();
    if (ct == null || extensaoPara(ct) == null) {
      throw new BusinessException(
          HttpStatus.BAD_REQUEST, "TIPO_INVALIDO", "Use apenas imagens JPEG, PNG, WebP ou GIF");
    }
    if (file.getSize() > uploadProperties.getMaxBytesPorArquivo()) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "ARQUIVO_GRANDE", "Arquivo excede o tamanho máximo permitido");
    }
  }

  private static String extensaoPara(String contentType) {
    if (contentType == null) return null;
    return switch (contentType.toLowerCase(Locale.ROOT)) {
      case "image/jpeg", "image/jpg" -> "jpg";
      case "image/png" -> "png";
      case "image/webp" -> "webp";
      case "image/gif" -> "gif";
      default -> null;
    };
  }

  private Path diretorioQuarto(Long quartoId) {
    return Path.of(uploadProperties.getRoot()).resolve("quarto-imagens").resolve(String.valueOf(quartoId));
  }

  private Path arquivoPath(Long quartoId, String nomeArquivo) {
    return diretorioQuarto(quartoId).resolve(nomeArquivo);
  }
}
