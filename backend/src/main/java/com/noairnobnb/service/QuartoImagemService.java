package com.noairnobnb.service;

import com.noairnobnb.dto.media.ImagemArquivo;
import com.noairnobnb.dto.response.QuartoResponse;
import org.springframework.web.multipart.MultipartFile;

public interface QuartoImagemService {

  QuartoResponse adicionarImagens(Long quartoId, MultipartFile[] arquivos);

  void removerImagem(Long quartoId, Long imagemId);

  /** Remove arquivos em disco e linhas no banco (antes de excluir o quarto). */
  void removerTodasDoQuarto(Long quartoId);

  /** Leitura pública (catálogo) - carrega metadados e bytes na mesma transação. */
  ImagemArquivo carregarImagemPublica(Long imagemId);
}
