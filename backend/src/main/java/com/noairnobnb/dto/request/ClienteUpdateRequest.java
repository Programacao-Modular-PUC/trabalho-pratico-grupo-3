package com.noairnobnb.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteUpdateRequest(
    @NotBlank @Size(min = 2, max = 120) String nome,
    @NotBlank @Size(min = 5, max = 255) String endereco,
    @NotBlank @Size(min = 8, max = 30) String telefone,
    @NotBlank @Email @Size(max = 190) String email
) {}

