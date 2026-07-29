<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Registro Rápido</h2>
      
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Energia (1-10): {{ form.energia }}</label>
          <input type="range" min="1" max="10" v-model.number="form.energia" />
        </div>
        
        <div class="form-group">
          <label>Estresse (1-10): {{ form.estresse }}</label>
          <input type="range" min="1" max="10" v-model.number="form.estresse" />
        </div>
        
        <div class="form-group">
          <label>Tédio (1-10): {{ form.tedio }}</label>
          <input type="range" min="1" max="10" v-model.number="form.tedio" />
        </div>
        
        <div class="form-group">
          <label>Clareza Mental (1-10): {{ form.clareza_mental }}</label>
          <div style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 5px;">(1 = disperso, 10 = focado)</div>
          <input type="range" min="1" max="10" v-model.number="form.clareza_mental" />
        </div>
        
        <div class="form-group">
          <label>Intensidade do Impulso (1-10): {{ form.impulso }}</label>
          <div style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 5px;">Quão forte está o impulso?</div>
          <input type="range" min="1" max="10" v-model.number="form.impulso" />
        </div>
        
        <div class="form-group">
          <label>Cedeu ao impulso?</label>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn" :class="{'btn-danger': form.cedeu === true}" style="flex:1" @click="form.cedeu = true">Sim</button>
            <button type="button" class="btn" :class="{'btn-success': form.cedeu === false}" style="flex:1" @click="form.cedeu = false">Não</button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Observação (opcional)</label>
          <input type="text" class="form-control" v-model="form.observacao" placeholder="Ex: Dormi mal, Trânsito..." />
        </div>
        
        <button type="submit" class="btn btn-block" :disabled="form.cedeu === null">Salvar</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMindStore } from '../store';

const emit = defineEmits(['close']);
const store = useMindStore();

const form = ref({
  energia: 5,
  estresse: 5,
  tedio: 5,
  clareza_mental: 5,
  impulso: 1,
  cedeu: null as boolean | null,
  observacao: ''
});

const submit = async () => {
  if (form.value.cedeu === null) return;
  await store.addRecord({ ...form.value });
  emit('close');
};
</script>
