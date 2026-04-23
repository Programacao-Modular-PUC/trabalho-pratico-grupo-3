package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Aluguel;
import com.noairnobnb.model.enums.AluguelStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AluguelRepository extends JpaRepository<Aluguel, Long> {
  List<Aluguel> findByClienteId(Long clienteId);
  List<Aluguel> findByQuartoId(Long quartoId);
  List<Aluguel> findByQuartoResidenciaId(Long residenciaId);

  boolean existsByClienteId(Long clienteId);

  @Query("""
      select (count(a) > 0) from Aluguel a
      where a.quarto.id = :quartoId
        and a.status in :status
        and a.dataHoraEntrada < :fim
        and a.dataHoraSaida > :inicio
      """)
  boolean existsConflitoPeriodo(
      @Param("quartoId") Long quartoId,
      @Param("inicio") LocalDateTime inicio,
      @Param("fim") LocalDateTime fim,
      @Param("status") List<AluguelStatus> status);

  @Query("""
      select (count(a) > 0) from Aluguel a
      where a.quarto.id = :quartoId
        and a.status in :status
        and a.dataHoraEntrada < :fim
        and a.dataHoraSaida > :inicio
        and (:ignorarId is null or a.id <> :ignorarId)
      """)
  boolean existsConflitoPeriodoIgnorando(
      @Param("quartoId") Long quartoId,
      @Param("inicio") LocalDateTime inicio,
      @Param("fim") LocalDateTime fim,
      @Param("status") List<AluguelStatus> status,
      @Param("ignorarId") Long ignorarAluguelId);

  @Query(
      """
      select distinct a from Aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario p
        left join fetch a.pagamento pay
      where a.id = :id
      """)
  Optional<Aluguel> findFetchedById(@Param("id") Long id);

  @Query(
      """
      select distinct a from Aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario p
        left join fetch a.pagamento pay
      """)
  Page<Aluguel> findAllFetched(Pageable pageable);

  @Query(
      """
      select distinct a from Aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario p
        left join fetch a.pagamento pay
      where p.id = :proprietarioId
      """)
  Page<Aluguel> findAllFetchedByProprietarioId(@Param("proprietarioId") Long proprietarioId, Pageable pageable);

  @Query(
      """
      select distinct a from Aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario p
        left join fetch a.pagamento pay
      where c.id = :clienteId
      """)
  Page<Aluguel> findAllFetchedByClienteId(@Param("clienteId") Long clienteId, Pageable pageable);

  @Query(
      """
      select distinct a from Aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario p
        left join fetch a.pagamento pay
      where q.id = :quartoId
      """)
  Page<Aluguel> findAllFetchedByQuartoId(@Param("quartoId") Long quartoId, Pageable pageable);

  boolean existsByQuarto_Id(Long quartoId);

  boolean existsByQuarto_Residencia_Id(Long residenciaId);

  @Query(
      """
      select distinct a from Aluguel a
        join fetch a.cliente c
        join fetch c.usuario
        join fetch a.quarto q
        join fetch q.residencia r
        join fetch r.proprietario p
        left join fetch a.pagamento pay
      where r.id = :residenciaId
      """)
  List<Aluguel> findAllFetchedByResidenciaId(@Param("residenciaId") Long residenciaId);

  @Query(
      """
      select a.dataHoraEntrada, a.dataHoraSaida from Aluguel a
      where a.quarto.id = :quartoId
        and a.status in :statuses
      """)
  List<Object[]> findIntervalosEntradaSaidaPorQuartoEStatusIn(
      @Param("quartoId") Long quartoId, @Param("statuses") List<AluguelStatus> statuses);
}

