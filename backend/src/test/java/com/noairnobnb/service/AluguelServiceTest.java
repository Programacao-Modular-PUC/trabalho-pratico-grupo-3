package com.noairnobnb.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.noairnobnb.exception.BusinessException;
import com.noairnobnb.mapper.AluguelMapper;
import com.noairnobnb.model.entity.*;
import com.noairnobnb.model.enums.AluguelStatus;
import com.noairnobnb.model.enums.PagamentoStatus;
import com.noairnobnb.repository.*;
import com.noairnobnb.service.impl.AluguelServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class AluguelServiceTest {

    @Mock AluguelRepository aluguelRepository;
    @Mock ClienteRepository clienteRepository;
    @Mock ProprietarioRepository proprietarioRepository;
    @Mock QuartoRepository quartoRepository;
    @Mock PagamentoRepository pagamentoRepository;
    @Mock DisponibilidadeService disponibilidadeService;
    @Mock DailyCalculatorService dailyCalculatorService;
    @Mock HospedagemValorService hospedagemValorService;
    @Mock HospedagemCotacaoFactory hospedagemCotacaoFactory;
    @Mock PagamentoService pagamentoService;
    @Mock AluguelMapper aluguelMapper;

    private AluguelService sut;

    @BeforeEach
    void setUp() {
        sut = new AluguelServiceImpl(
            clienteRepository, proprietarioRepository, quartoRepository,
            aluguelRepository, pagamentoRepository, disponibilidadeService,
            dailyCalculatorService, hospedagemValorService,
            hospedagemCotacaoFactory, pagamentoService, aluguelMapper);
        autenticarAdmin();
    }

    @Test
    void cancelar_aluguelAtivo_mudaStatusParaCancelado() {
        var aluguel = aluguelAtivo();
        when(aluguelRepository.findFetchedById(1L)).thenReturn(Optional.of(aluguel));
        when(aluguelRepository.findFetchedById(aluguel.getId())).thenReturn(Optional.of(aluguel));

        sut.cancelar(1L);

        assertThat(aluguel.getStatus()).isEqualTo(AluguelStatus.CANCELADO);
        verify(aluguelRepository).save(aluguel);
    }

    @Test
    void cancelar_pagamentoPendente_cancelaPagamentoTambem() {
        var aluguel = aluguelAtivo();
        var pagamento = new Pagamento();
        pagamento.setStatus(PagamentoStatus.PENDENTE);
        when(aluguelRepository.findFetchedById(1L)).thenReturn(Optional.of(aluguel));
        when(aluguelRepository.findFetchedById(aluguel.getId())).thenReturn(Optional.of(aluguel));
        when(pagamentoRepository.findByAluguelId(1L)).thenReturn(Optional.of(pagamento));

        sut.cancelar(1L);

        assertThat(pagamento.getStatus()).isEqualTo(PagamentoStatus.CANCELADO);
    }

    @Test
    void cancelar_aluguelJaFinalizado_lancaBusinessException() {
        var aluguel = aluguelAtivo();
        aluguel.setStatus(AluguelStatus.FINALIZADO);
        when(aluguelRepository.findFetchedById(1L)).thenReturn(Optional.of(aluguel));

        assertThatThrownBy(() -> sut.cancelar(1L))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("code", "ALUGUEL_NAO_ATIVO");
    }

    // --- helpers ---

    private Aluguel aluguelAtivo() {
        var prop = new Proprietario();
        prop.setId(99L);
        var residencia = new Residencia();
        residencia.setProprietario(prop);
        var quarto = new Quarto();
        quarto.setId(5L);
        quarto.setResidencia(residencia);
        var cliente = new Cliente();
        cliente.setId(2L);

        var aluguel = new Aluguel();
        aluguel.setId(1L);
        aluguel.setStatus(AluguelStatus.ATIVO);
        aluguel.setQuarto(quarto);
        aluguel.setCliente(cliente);
        return aluguel;
    }

    private void autenticarAdmin() {
        var auth = new UsernamePasswordAuthenticationToken(
            "admin", null,
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}