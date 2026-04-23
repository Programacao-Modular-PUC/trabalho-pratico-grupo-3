package com.noairnobnb.service;

import com.noairnobnb.dto.request.AuthLoginRequest;
import com.noairnobnb.dto.request.ClienteRegisterRequest;
import com.noairnobnb.dto.response.AuthLoginResponse;
import com.noairnobnb.dto.response.UsuarioResponse;

public interface AuthService {
  AuthLoginResponse login(AuthLoginRequest request);

  UsuarioResponse registerCliente(ClienteRegisterRequest request);

  UsuarioResponse me();
}
