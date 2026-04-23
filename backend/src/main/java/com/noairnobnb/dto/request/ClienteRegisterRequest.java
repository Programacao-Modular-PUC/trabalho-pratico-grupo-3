package com.noairnobnb.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ClienteRegisterRequest(
    @NotBlank @Size(min = 2, max = 120) String nome,
    @NotBlank @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos") String cpf,
    @NotBlank @Size(min = 5, max = 255) String endereco,
    @NotBlank @Size(min = 8, max = 30) String telefone,
    @NotBlank @Email @Size(max = 190) String email,
    @NotBlank @Size(min = 8, max = 100) String senha
) {}

