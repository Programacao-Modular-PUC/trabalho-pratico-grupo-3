package com.noairnobnb.dto.response;

public record AuthLoginResponse(
    String token,
    UsuarioResponse usuario
) {}

