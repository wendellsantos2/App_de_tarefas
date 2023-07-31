// api.js

const API_URL = 'http://192.168.0.123:3000/tarefas';

// Função para obter a lista de tarefas da API
export const getTarefas = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Erro ao obter tarefas');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao obter tarefas:', error.message);
    return [];
  }
};

// Função para editar uma tarefa na API
export const editarTarefa = async (id, novoTexto) => {
  try {
    // Obter a lista de tarefas da API
    const tarefas = await getTarefas();
    // Encontrar a tarefa com o ID fornecido na lista de tarefas
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);

    if (tarefa) {
      // Atualizar o texto da tarefa com o novo texto
      tarefa.texto = novoTexto;

      // Enviar a requisição PUT para atualizar a tarefa na API
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarefa),
      });

      if (!response.ok) {
        throw new Error('Erro ao editar tarefa');
      }

      // Após editar a tarefa, retornar a lista atualizada de tarefas
      return getTarefas();
    }
  } catch (error) {
    console.error('Erro ao editar tarefa:', error.message);
    return [];
  }
};

// Função para adicionar uma nova tarefa na API
export const adicionarTarefa = async (texto) => {
  try {
    // Criar o objeto da nova tarefa
    const novaTarefa = {
      id: Date.now(),
      texto,
      concluida: false,
    };

    // Enviar a requisição POST para adicionar a nova tarefa na API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novaTarefa),
    });

    if (!response.ok) {
      throw new Error('Erro ao adicionar tarefa');
    }

    // Após adicionar a tarefa, retornar a lista atualizada de tarefas
    return getTarefas();
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error.message);
    return [];
  }
};

// Função para marcar ou desmarcar uma tarefa como concluída na API
export const marcarTarefaConcluida = async (id) => {
  try {
    // Obter a lista de tarefas da API
    const tarefas = await getTarefas();
    // Encontrar a tarefa com o ID fornecido na lista de tarefas
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);
    if (tarefa) {
      // Inverter o valor da propriedade "concluida" da tarefa
      tarefa.concluida = !tarefa.concluida;

      // Enviar a requisição PUT para atualizar a tarefa na API
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tarefa),
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar tarefa como concluída');
      }

      // Após marcar a tarefa como concluída, retornar a lista atualizada de tarefas
      return getTarefas();
    }
  } catch (error) {
    console.error('Erro ao marcar tarefa como concluída:', error.message);
    return [];
  }
};

// Função para remover uma tarefa da API
export const removerTarefa = async (id) => {
  try {
    // Enviar a requisição DELETE para remover a tarefa da API
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao remover tarefa');
    }

    // Após remover a tarefa, retornar a lista atualizada de tarefas
    return getTarefas();
  } catch (error) {
    console.error('Erro ao remover tarefa:', error.message);
    return [];
  }
};
