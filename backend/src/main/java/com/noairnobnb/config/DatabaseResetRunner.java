package com.noairnobnb.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Limpa todas as tabelas de negócio e usuários. O {@link SeedDataRunner} (ordem posterior) recria roles +
 * as 3 contas seed (admin, proprietário, cliente).
 *
 * <p>Ative só quando quiser zerar a base: {@code spring.profiles.active=db-reset} (ou adicione {@code
 * db-reset} aos perfis ativos).
 */
@Component
@Profile("db-reset")
@Order(1)
public class DatabaseResetRunner implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(DatabaseResetRunner.class);

  @PersistenceContext private EntityManager em;

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    log.warn("Perfil db-reset: limpando todas as tabelas antes do seed.");
    // Ordem: dependentes primeiro (FKs)
    em.createNativeQuery("DELETE FROM pagamentos").executeUpdate();
    em.createNativeQuery("DELETE FROM aluguels").executeUpdate();
    em.createNativeQuery("DELETE FROM reservas").executeUpdate();
    em.createNativeQuery("DELETE FROM quarto_imagens").executeUpdate();
    em.createNativeQuery("DELETE FROM quartos").executeUpdate();
    em.createNativeQuery("DELETE FROM residencias").executeUpdate();
    em.createNativeQuery("DELETE FROM clientes").executeUpdate();
    em.createNativeQuery("DELETE FROM proprietarios").executeUpdate();
    em.createNativeQuery("DELETE FROM usuario_roles").executeUpdate();
    em.createNativeQuery("DELETE FROM usuarios").executeUpdate();
    em.createNativeQuery("DELETE FROM roles").executeUpdate();
    log.warn("Limpeza concluída. O seed vai recriar roles e os 3 usuários de demonstração.");
  }
}
