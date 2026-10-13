package com.viagem.cadastro_viagem.business;

import com.viagem.cadastro_viagem.infrastructure.entitys.Viagem;
import com.viagem.cadastro_viagem.infrastructure.repository.ViagemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ViagemService {

    private final ViagemRepository repository;

    public ViagemService(ViagemRepository repository) {
        this.repository = repository;
    }

    public Viagem salvarViagem(Viagem viagem) {
        validarObjeto(viagem);

        // POST cadastra uma viagem nova; não deixa um ID enviado no JSON
        // transformar o cadastro em uma atualização acidental.
        viagem.setId(null);
        validarViagem(viagem);

        return repository.saveAndFlush(viagem);
    }

    public List<Viagem> listarViagens() {
        return repository.findAll();
    }

    public Viagem buscarViagemPorId(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("O ID deve ser um número positivo.");
        }

        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Viagem não encontrada para o ID " + id + "."));
    }

    public Viagem buscarViagemPorDestino(String destino) {
        validarDestino(destino);

        return repository.findByDestino(destino.trim())
                .orElseThrow(() -> new NoSuchElementException("Nenhuma viagem encontrada para esse destino."));
    }

    public List<Viagem> pesquisarPorDestino(String destino) {
        validarDestino(destino);
        return repository.findAllByDestinoContainingIgnoreCase(destino.trim());
    }

    public Viagem atualizarViagemPorId(Integer id, Viagem viagem) {
        validarObjeto(viagem);
        Viagem viagemExistente = buscarViagemPorId(id);

        Viagem viagemAtualizada = Viagem.builder()
                .id(viagemExistente.getId())
                .destino(viagem.getDestino() != null ? viagem.getDestino() : viagemExistente.getDestino())
                .dataIda(viagem.getDataIda() != null ? viagem.getDataIda() : viagemExistente.getDataIda())
                .dataVolta(viagem.getDataVolta() != null ? viagem.getDataVolta() : viagemExistente.getDataVolta())
                .preco(viagem.getPreco() != null ? viagem.getPreco() : viagemExistente.getPreco())
                .observacoes(viagem.getObservacoes() != null ? viagem.getObservacoes() : viagemExistente.getObservacoes())
                .build();

        validarViagem(viagemAtualizada);
        return repository.saveAndFlush(viagemAtualizada);
    }

    public void deletarViagemPorId(Integer id) {
        buscarViagemPorId(id);
        repository.deleteById(id);
    }

    public void deletarViagemPorDestino(String destino) {
        validarDestino(destino);
        repository.deleteByDestino(destino.trim());
    }

    private void validarObjeto(Viagem viagem) {
        if (viagem == null) {
            throw new IllegalArgumentException("Envie os dados da viagem no corpo da requisição.");
        }
    }

    private void validarViagem(Viagem viagem) {
        validarDestino(viagem.getDestino());
        viagem.setDestino(viagem.getDestino().trim());

        if (viagem.getDataIda() == null) {
            throw new IllegalArgumentException("A data de ida é obrigatória.");
        }

        if (viagem.getDataVolta() == null) {
            throw new IllegalArgumentException("A data de volta é obrigatória.");
        }

        if (viagem.getDataVolta().isBefore(viagem.getDataIda())) {
            throw new IllegalArgumentException("A data de volta não pode ser anterior à data de ida.");
        }

        if (viagem.getPreco() == null
                || !Double.isFinite(viagem.getPreco())
                || viagem.getPreco() < 0) {
            throw new IllegalArgumentException("O preço deve ser um número válido maior ou igual a zero.");
        }
    }

    private void validarDestino(String destino) {
        if (destino == null || destino.trim().isEmpty()) {
            throw new IllegalArgumentException("O destino é obrigatório.");
        }
    }
}