package com.noairnobnb.controller;

import com.noairnobnb.dto.request.AuthLoginRequest;
import com.noairnobnb.dto.request.ClienteRegisterRequest;
import com.noairnobnb.dto.response.AuthLoginResponse;
import com.noairnobnb.dto.response.UsuarioResponse;
import com.noairnobnb.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public AuthLoginResponse login(@Valid @RequestBody AuthLoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/register/cliente")
  public UsuarioResponse registerCliente(@Valid @RequestBody ClienteRegisterRequest request) {
    return authService.registerCliente(request);
  }

  @GetMapping("/me")
  public UsuarioResponse me() {
    return authService.me();
  }
}
