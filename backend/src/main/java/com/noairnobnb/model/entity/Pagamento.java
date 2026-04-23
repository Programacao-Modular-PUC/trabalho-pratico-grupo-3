package com.noairnobnb.model.entity;

import com.noairnobnb.model.enums.FormaPagamento;
import com.noairnobnb.model.enums.PagamentoStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
public class Pagamento extends AuditableEntity {
  @OneToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "aluguel_id", nullable = false, unique = true)
  private Aluguel aluguel;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal valor;

  @Column
  private LocalDateTime dataPagamento;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PagamentoStatus status = PagamentoStatus.PENDENTE;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private FormaPagamento formaPagamento = FormaPagamento.PIX;

  public Aluguel getAluguel() {
    return aluguel;
  }

  public void setAluguel(Aluguel aluguel) {
    this.aluguel = aluguel;
  }

  public BigDecimal getValor() {
    return valor;
  }

  public void setValor(BigDecimal valor) {
    this.valor = valor;
  }

  public LocalDateTime getDataPagamento() {
    return dataPagamento;
  }

  public void setDataPagamento(LocalDateTime dataPagamento) {
    this.dataPagamento = dataPagamento;
  }

  public PagamentoStatus getStatus() {
    return status;
  }

  public void setStatus(PagamentoStatus status) {
    this.status = status;
  }

  public FormaPagamento getFormaPagamento() {
    return formaPagamento;
  }

  public void setFormaPagamento(FormaPagamento formaPagamento) {
    this.formaPagamento = formaPagamento;
  }
}

