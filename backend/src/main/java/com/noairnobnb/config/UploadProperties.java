package com.noairnobnb.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "noairnobnb.upload")
public class UploadProperties {
  /** Diretório raiz para arquivos enviados (persistido fora do JAR). */
  private String root = "./uploads";

  /** Máximo de imagens por quarto. */
  private int maxImagensPorQuarto = 24;

  /** Tamanho máximo por arquivo (bytes). */
  private long maxBytesPorArquivo = 10 * 1024 * 1024L;

  public String getRoot() {
    return root;
  }

  public void setRoot(String root) {
    this.root = root;
  }

  public int getMaxImagensPorQuarto() {
    return maxImagensPorQuarto;
  }

  public void setMaxImagensPorQuarto(int maxImagensPorQuarto) {
    this.maxImagensPorQuarto = maxImagensPorQuarto;
  }

  public long getMaxBytesPorArquivo() {
    return maxBytesPorArquivo;
  }

  public void setMaxBytesPorArquivo(long maxBytesPorArquivo) {
    this.maxBytesPorArquivo = maxBytesPorArquivo;
  }
}
