package com.noairnobnb.dto.media;

/** Conteúdo binário + tipo MIME para resposta HTTP. */
public record ImagemArquivo(byte[] bytes, String contentType) {}
