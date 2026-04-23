package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Cliente;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
  Optional<Cliente> findByUsuarioId(Long usuarioId);
  boolean existsByCpf(String cpf);
  boolean existsByEmail(String email);
}

