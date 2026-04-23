package com.noairnobnb.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ResidenciaCreateRequest(
    @NotBlank @Size(min = 3, max = 200) String endereco,
    @NotBlank @Size(min = 1, max = 20) String numero,
    @NotBlank @Size(min = 2, max = 80) String bairro,
    @NotBlank @Size(min = 8, max = 12) String cep,
    @NotBlank @Size(min = 8, max = 30) String telefone,
    @NotBlank @Email @Size(max = 190) String email,
    /** Opcional: apenas ADMIN informa para criar residência em nome de um proprietário. */
    @Positive Long proprietarioId
) {}

