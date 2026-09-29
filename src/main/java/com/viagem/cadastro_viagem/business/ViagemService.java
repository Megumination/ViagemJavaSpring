package com.viagem.cadastro_viagem.business;

import com.viagem.cadastro_viagem.infrastructure.entitys.Viagem;
import com.viagem.cadastro_viagem.infrastructure.repository.ViagemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ViagemService {

    private final ViagemRepository repository;

    public ViagemService(ViagemRepository repository) {
        this.repository = repository;
    }

    public Viagem salvarViagem(Viagem viagem) {
        return repository.saveAndFlush(viagem);
    }

    public List<Viagem> listarViagens() {
        return repository.findAll();
    }

    public Viagem buscarViagemPorId(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada"));
    }

    public Viagem buscarViagemPorDestino(String destino) {
        return repository.findByDestino(destino)
                .orElseThrow(() -> new RuntimeException("Destino não encontrado"));
    }

    public List<Viagem> pesquisarPorDestino(String destino) {
        return repository.findAllByDestinoContainingIgnoreCase(destino);
    }

    public Viagem atualizarViagemPorId(Integer id, Viagem viagem) {
        Viagem viagemEntity = buscarViagemPorId(id);

        Viagem viagemAtualizada = Viagem.builder()
                .id(viagemEntity.getId())
                .destino(viagem.getDestino() != null ? viagem.getDestino() : viagemEntity.getDestino())
                .dataIda(viagem.getDataIda() != null ? viagem.getDataIda() : viagemEntity.getDataIda())
                .dataVolta(viagem.getDataVolta() != null ? viagem.getDataVolta() : viagemEntity.getDataVolta())
                .preco(viagem.getPreco() != null ? viagem.getPreco() : viagemEntity.getPreco())
                .observacoes(viagem.getObservacoes() != null ? viagem.getObservacoes() : viagemEntity.getObservacoes())
                .build();

        return repository.saveAndFlush(viagemAtualizada);
    }

    public void deletarViagemPorId(Integer id) {
        buscarViagemPorId(id);
        repository.deleteById(id);
    }

    public void deletarViagemPorDestino(String destino) {
        repository.deleteByDestino(destino);
    }
}
