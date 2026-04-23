package com.noairnobnb.repository;

import com.noairnobnb.model.entity.Reserva;
import com.noairnobnb.model.enums.ReservaStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
  List<Reserva> findByClienteId(Long clienteId);
  List<Reserva> findByQuartoId(Long quartoId);

  boolean existsByClienteId(Long clienteId);

  @Query("""
      select (count(r) > 0) from Reserva r
      where r.quarto.id = :quartoId
        and r.status = :status
        and r.dataHoraEntrada < :fim
        and r.dataHoraSaida > :inicio
      """)
  boolean existsConflitoPeriodo(
      @Param("quartoId") Long quartoId,
      @Param("inicio") LocalDateTime inicio,
      @Param("fim") LocalDateTime fim,
      @Param("status") ReservaStatus status);

  @Query("""
      select (count(r) > 0) from Reserva r
      where r.quarto.id = :quartoId
        and r.status = :status
        and r.dataHoraEntrada < :fim
        and r.dataHoraSaida > :inicio
        and (:ignorarId is null or r.id <> :ignorarId)
      """)
  boolean existsConflitoPeriodoIgnorando(
      @Param("quartoId") Long quartoId,
      @Param("inicio") LocalDateTime inicio,
      @Param("fim") LocalDateTime fim,
      @Param("status") ReservaStatus status,
      @Param("ignorarId") Long ignorarReservaId);

  @Query(
      """
      select distinct r from Reserva r
        join fetch r.cliente c
        join fetch c.usuario
        join fetch r.quarto q
        join fetch q.residencia res
        join fetch res.proprietario p
      where r.id = :id
      """)
  Optional<Reserva> findFetchedById(@Param("id") Long id);

  @Query(
      """
      select distinct r from Reserva r
        join fetch r.cliente c
        join fetch c.usuario
        join fetch r.quarto q
        join fetch q.residencia res
        join fetch res.proprietario p
      where p.id = :proprietarioId
      """)
  Page<Reserva> findAllFetchedByProprietarioId(@Param("proprietarioId") Long proprietarioId, Pageable pageable);

  @Query(
      """
      select distinct r from Reserva r
        join fetch r.cliente c
        join fetch c.usuario
        join fetch r.quarto q
        join fetch q.residencia res
        join fetch res.proprietario p
      where r.cliente.id = :clienteId
      """)
  Page<Reserva> findAllFetchedByClienteId(@Param("clienteId") Long clienteId, Pageable pageable);

  @Query(
      """
      select distinct r from Reserva r
        join fetch r.cliente c
        join fetch c.usuario
        join fetch r.quarto q
        join fetch q.residencia res
        join fetch res.proprietario p
      where r.quarto.id = :quartoId
      """)
  Page<Reserva> findAllFetchedByQuartoId(@Param("quartoId") Long quartoId, Pageable pageable);

  @Query(
      """
      select distinct r from Reserva r
        join fetch r.cliente c
        join fetch c.usuario
        join fetch r.quarto q
        join fetch q.residencia res
        join fetch res.proprietario p
      """)
  Page<Reserva> findAllFetched(Pageable pageable);

  boolean existsByQuarto_Id(Long quartoId);

  boolean existsByQuarto_Residencia_Id(Long residenciaId);

  @Query(
      """
      select distinct r from Reserva r
        join fetch r.cliente c
        join fetch c.usuario
        join fetch r.quarto q
        join fetch q.residencia res
        join fetch res.proprietario p
      where res.id = :residenciaId
      """)
  List<Reserva> findAllFetchedByResidenciaId(@Param("residenciaId") Long residenciaId);

  @Query(
      """
      select r.dataHoraEntrada, r.dataHoraSaida from Reserva r
      where r.quarto.id = :quartoId
        and r.status = :status
      """)
  List<Object[]> findIntervalosEntradaSaidaPorQuartoEStatus(
      @Param("quartoId") Long quartoId, @Param("status") ReservaStatus status);
}

