package com.noairnobnb.config;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

/**
 * Bases H2 (ficheiro) antigas: {@code hibernate.hbm2ddl.auto=update} por vezes
 * não cria colunas novas, e listagens de reservas/aluguéis (e telas
 * agregadoras) devolvem 500.
 *
 * <p>Bases muito antigas: {@code CHECK} em {@code quartos.tipo_quarto} só
 * permitia {@code INDIVIDUAL} e {@code CASAL} — o valor {@code FAMILIA} falha
 * (SQLState 22030 no H2).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Profile("!test")
public class Sprint2SchemaPatcher implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(Sprint2SchemaPatcher.class);

  private final DataSource dataSource;
  private final JdbcTemplate jdbc;

  public Sprint2SchemaPatcher(DataSource dataSource, JdbcTemplate jdbc) {
    this.dataSource = dataSource;
    this.jdbc = jdbc;
  }

  @Override
  public void run(@NonNull ApplicationArguments args) {
    try (Connection c = dataSource.getConnection()) {
      String name = c.getMetaData().getDatabaseProductName();
      if (name == null) {
        return;
      }
      if (name.equalsIgnoreCase("H2")) {
        relaxH2QuartoTipoQuartoCheck();
        h2GarantirTipoQuartoVarchar();
        patchH2();
      } else if (name.toLowerCase().contains("mysql")) {
        relaxMysqlQuartoTipoQuarto();
        patchMysql();
      } else {
        log.debug("Sprint2SchemaPatcher: motor '{}' ignorado", name);
      }
    } catch (SQLException e) {
      log.warn("Sprint2SchemaPatcher: não foi possível detetar o motor: {}", e.getMessage());
    }
  }

  /**
   * H2: remove CHECKs na tabela QUARTOS que limitam o enum a dois valores, para
   * permitir FAMILIA. Validação continua feita no domínio JPA.
   */
  private void relaxH2QuartoTipoQuartoCheck() {
    var queries =
        List.of(
            "select tc.constraint_name from information_schema.table_constraints tc "
                + "where tc.constraint_type = 'CHECK' and upper(tc.table_name) = 'QUARTOS'",
            "select constraint_name from information_schema.check_constraints "
                + "where upper(table_name) = 'QUARTOS'",
            "select constraint_name from information_schema.check_constraints "
                + "where table_name = 'QUARTOS' or table_name = 'quartos'",
            "select tc.constraint_name from information_schema.table_constraints tc "
                + "where upper(tc.table_name) = 'QUARTOS' and tc.constraint_type = 'CHECK' "
                + "and tc.table_schema in ('PUBLIC', 'public')",
            "select tc.constraint_name from information_schema.table_constraints tc "
                + "where tc.constraint_type = 'CHECK' and lower(tc.table_name) = 'quartos'",
            "select constraint_name from information_schema.table_constraints "
                + "where table_schema = 'PUBLIC' and upper(table_name) = 'QUARTOS' and constraint_type = 'CHECK'");
    Set<String> toDrop = new HashSet<>();
    for (String q : queries) {
      try {
        toDrop.addAll(jdbc.query(q, (rs, i) -> rs.getString(1)));
      } catch (Exception e) {
        log.debug("Sprint2SchemaPatcher: query constraints H2: {} — {}", q, e.getMessage());
      }
    }
    for (String n : toDrop) {
      if (n == null || n.isEmpty()) {
        continue;
      }
      if (tryDropH2QuartoCheckConstraint(n)) {
        log.info("Sprint2SchemaPatcher: removida constraint H2 (quartos): {}", n);
      }
    }
  }

  /**
   * H2: esquemas antigos afinam o tipo a um conjunto (CHECK implícita). Soltar
   * constraints via metadata nem sempre encontra o nome; redefinir a coluna
   * apaga a verificação e aceita FAMILIA.
   */
  private void h2GarantirTipoQuartoVarchar() {
    for (String sql :
        new String[] {
          "alter table quartos alter column tipo_quarto set data type varchar(32) not null",
          "alter table quartos alter column tipo_quarto set data type varchar(32)",
          "alter table \"PUBLIC\".\"QUARTOS\" alter column \"TIPO_QUARTO\" set data type varchar(32) not null",
          "alter table public.quartos alter column tipo_quarto set data type varchar(32) not null"
        }) {
      try {
        jdbc.execute(sql);
        log.info("Sprint2SchemaPatcher: tipo_quarto ajustado para VARCHAR(32) (H2): {}", sql);
        return;
      } catch (Exception e) {
        log.debug("Sprint2SchemaPatcher: h2GarantirTipoQuartoVarchar: {} — {}", sql, e.getMessage());
      }
    }
    log.warn(
        "Sprint2SchemaPatcher: não relaxou quartos.tipo_quarto no H2 (FAMILIA pode falhar). Apague o ficheiro H2"
            + " em ./data/ ou altere o check manualmente na consola H2.");
  }

  private boolean tryDropH2QuartoCheckConstraint(String name) {
    for (String sql :
        new String[] {
          "alter table quartos drop constraint " + name,
          "alter table public.quartos drop constraint " + name,
          "alter table \"PUBLIC\".\"QUARTOS\" drop constraint \"" + name + "\""
        }) {
      try {
        jdbc.execute(sql);
        return true;
      } catch (Exception ignored) {
        // tenta a próxima variante
      }
    }
    return false;
  }

  private void relaxMysqlQuartoTipoQuarto() {
    try {
      jdbc.execute("alter table `quartos` modify column `tipo_quarto` varchar(32) not null");
      log.info("Sprint2SchemaPatcher: coluna quartos.tipo_quarto ajustada para VARCHAR(32) (MySQL)");
    } catch (Exception e) {
      log.debug("Sprint2SchemaPatcher: MySQL tipo_quarto: {}", e.getMessage());
    }
  }

  private void patchH2() {
    for (String sql :
        new String[] {
          "alter table if exists reservas add column if not exists numero_hospedes integer",
          "alter table if exists reservas add column if not exists solicita_berco boolean not null default false",
          "alter table if exists aluguels add column if not exists numero_hospedes integer",
          "alter table if exists aluguels add column if not exists solicita_berco boolean not null default false"
        }) {
      try {
        jdbc.execute(sql);
        log.info("Sprint2SchemaPatcher: {}", sql);
      } catch (Exception ex) {
        log.warn("Sprint2SchemaPatcher: {} — {}", sql, ex.getMessage());
      }
    }
  }

  private void patchMysql() {
    addIfMissing("reservas", "numero_hospedes", "int null");
    addIfMissing("reservas", "solicita_berco", "tinyint(1) not null default 0");
    addIfMissing("aluguels", "numero_hospedes", "int null");
    addIfMissing("aluguels", "solicita_berco", "tinyint(1) not null default 0");
  }

  private void addIfMissing(String table, String column, String colDef) {
    Integer n =
        jdbc.queryForObject(
            "select count(*) from information_schema.columns "
                + "where table_schema = (select database()) and table_name = ? and column_name = ?",
            Integer.class,
            table,
            column);
    if (n != null && n > 0) {
      return;
    }
    var sql = "alter table `" + table + "` add column `" + column + "` " + colDef;
    log.info("Sprint2SchemaPatcher: {}", sql);
    jdbc.execute(sql);
  }
}
