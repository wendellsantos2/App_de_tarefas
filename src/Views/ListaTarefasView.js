import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SegmentedControlTab from 'react-native-segmented-control-tab';

import {
  getTarefas,
  adicionarTarefa,
  marcarTarefaConcluida,
  editarTarefa,
  removerTarefa,
} from '../Controllers/TarefaController';

const ListaTarefasView = () => {
  // Estados do componente
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [tarefaParaVisualizar, setTarefaParaVisualizar] = useState(null);
  const [editedTarefa, setEditedTarefa] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);

  // Carrega as tarefas iniciais quando o componente é montado
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tarefas = await getTarefas();
        setTarefas(tarefas);
      } catch (error) {
        console.error('Erro ao obter tarefas:', error);
      }
    };

    fetchData();
  }, []);

  // Filtra as tarefas com base no índice selecionado na Tab
  useEffect(() => {
    const filterTarefas = () => {
      switch (tabIndex) {
        case 0: // Pendente
          setTarefasFiltradas(tarefas.filter((tarefa) => !tarefa.concluida));
          break;
        case 1: // Concluído
          setTarefasFiltradas(tarefas.filter((tarefa) => tarefa.concluida));
          break;
        case 2: // Todos
        default:
          setTarefasFiltradas(tarefas);
      }
    };

    filterTarefas();
  }, [tabIndex, tarefas]);

  // Adiciona uma nova tarefa
  const adicionarNovaTarefa = async () => {
    if (novaTarefa.trim() !== '') {
      await adicionarTarefa(novaTarefa);
      const updatedTarefas = await getTarefas();
      setTarefas(updatedTarefas);
      setNovaTarefa('');
    }
  };

  // Marca uma tarefa como concluída
  const concluirTarefa = async (id) => {
    await marcarTarefaConcluida(id);
    const updatedTarefas = await getTarefas();
    setTarefas(updatedTarefas);

    Alert.alert('Tarefa concluída', 'A tarefa foi marcada como concluída.');
  };

  // Abre o modal para visualizar a tarefa
  const abrirModal = (tarefa) => {
    setTarefaParaVisualizar(tarefa);
    setModalVisible(true);
  };

  // Fecha o modal
  const fecharModal = () => {
    setModalVisible(false);
    setEditMode(false);
  };

  // Prepara a tarefa para edição
  const handleEditarTarefa = () => {
    setEditedTarefa(tarefaParaVisualizar.texto);
    setEditMode(true);
  };

  // Salva a edição da tarefa
  const salvarEdicaoTarefa = async () => {
    try {
      await editarTarefa(tarefaParaVisualizar.id, editedTarefa);
      const updatedTarefas = await getTarefas();
      setTarefas(updatedTarefas);
      setModalVisible(false);
      setEditedTarefa('');
      setEditMode(false);
      Alert.alert('Tarefa atualizada', 'A tarefa foi atualizada com sucesso.');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  // Exibe a confirmação para excluir a tarefa
  const handleExcluirTarefa = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => excluirTarefa() },
      ]
    );
  };

  // Exclui a tarefa
  const excluirTarefa = async () => {
    await removerTarefa(tarefaParaVisualizar.id);
    const updatedTarefas = await getTarefas();
    setTarefas(updatedTarefas);
    setModalVisible(false);
    Alert.alert('Tarefa removida', 'A tarefa foi removida com sucesso.');
  };

  // Constante para controlar o tamanho máximo do texto da tarefa exibido na lista
  const MAX_TASK_TEXT_LENGTH = 20;

  // Renderiza cada item da lista de tarefas
  const renderTarefa = ({ item }) => {
    // Função para exibir a confirmação de exclusão ao pressionar longamente a tarefa
    const showDeleteConfirmation = () => {
      setTarefaParaEditar(item.id);
      setModalVisible(true);
    };

    // Limita o texto da tarefa exibido na lista para não ocupar muito espaço
    const taskText =
      item.texto.length > MAX_TASK_TEXT_LENGTH
        ? item.texto.substring(0, MAX_TASK_TEXT_LENGTH) + '...'
        : item.texto;

    return (
      <>
        <TouchableOpacity
          onPress={() => concluirTarefa(item.id)}
          onLongPress={showDeleteConfirmation}
          style={styles.tarefa}
        >
          <View style={styles.checklistContainer}>
            {item.concluida ? (
              <Icon name="check" size={12} color="white" style={styles.checkmark} />
            ) : null}
          </View>
          <Text style={item.concluida ? styles.tarefaConcluida : styles.tarefaPendente}>
            {taskText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => abrirModal(item)}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2354/2354554.png',
              }}
            />
          </View>
        </TouchableOpacity>
      </>
    );
  };

  // Renderização do componente
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Tarefas</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={novaTarefa}
          onChangeText={setNovaTarefa}
          placeholder="Adicione uma nova tarefa"
        />
        <Button title="Adicionar" onPress={adicionarNovaTarefa} />
      </View>

      <SegmentedControlTab
        tabsContainerStyle={styles.segmentedControl}
        values={['Pendente', 'Concluído', 'Todos']}
        selectedIndex={tabIndex}
        onTabPress={(index) => setTabIndex(index)}
      />

      <FlatList
        data={tarefasFiltradas}
        renderItem={renderTarefa}
        keyExtractor={(item) => item.id.toString()}
      />

      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {editMode ? (
              <TextInput
                style={styles.editInput}
                value={editedTarefa}
                onChangeText={setEditedTarefa}
              />
            ) : (
              <Text style={styles.modalText}>{tarefaParaVisualizar?.texto}</Text>
            )}
            <View style={styles.modalButtons}>
              {!editMode && (
                <Button title="Editar" onPress={handleEditarTarefa} />
              )}
              {!editMode && (
                <Button title="Excluir" onPress={handleExcluirTarefa} />
              )}
              {editMode && (
                <Button title="Salvar" onPress={salvarEdicaoTarefa} />
              )}
              <Button title="Fechar" onPress={fecharModal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  segmentedControl: {
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  tarefa: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
  },
  tarefaPendente: {
    fontSize: 16,
    marginLeft: 8,
    color: 'red', // Estilo para tarefas pendentes (cor vermelha)
  },
  tarefaConcluida: {
    fontSize: 16,
    marginLeft: 8,
    textDecorationLine: 'line-through',
    color: 'green', // Estilo para tarefas concluídas (cor verde)
  },
  checklistContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageContainer: {
    flex: 1, // Use flex: 1 to occupy all available space
    justifyContent: 'flex-end', // Aligns the image to the right
    alignItems: 'flex-end', // Aligns the image vertically to the end
  },
  image: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
    position: 'absolute',
    marginEnd: 3,
    marginStart: 10
  },
});

export default ListaTarefasView;