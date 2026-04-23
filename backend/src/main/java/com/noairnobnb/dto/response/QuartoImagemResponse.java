package com.noairnobnb.dto.response;

/** Referência pública a uma imagem enviada (servida em GET /api/media/quarto-imagens/{id}). */
public record QuartoImagemResponse(Long id, String url) {}
