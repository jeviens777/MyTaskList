import 'react-native-gesture-handler';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [priority, setPriority] = useState('Medium');
  const [darkMode, setDarkMode] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const theme = darkMode ? dark : light;

  // 🎯 PRIORITY COLOR (TEXT ONLY)
  const getPriorityColor = (p) => {
    if (p === 'High') return '#fa5252';   // merah
    if (p === 'Medium') return '#fab005'; // kuning
    if (p === 'Low') return '#40c057';    // hijau
  };

  const animateAdd = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const animateCheck = () => {
    scaleAnim.setValue(0.8);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const addTask = () => {
    if (task.trim() === '') {
      Alert.alert('Error', 'Task tidak boleh kosong!');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: task,
      done: false,
      priority: priority,
    };

    setTasks([...tasks, newTask]);
    setTask('');
    animateAdd();
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(item => item.id !== id));
  };

  const toggleDone = (id) => {
    animateCheck();
    setTasks(tasks.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const filteredTasks = tasks.filter(item => {
    if (filter === 'ACTIVE') return !item.done;
    if (filter === 'DONE') return item.done;
    return true;
  });

  const doneCount = tasks.filter(t => t.done).length;

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => deleteTask(id)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
      <Text style={styles.swipeText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      friction={2}
      overshootRight={false}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.card },
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}
      >
        <View style={styles.leftSection}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                { borderColor: theme.primary },
                item.done && { backgroundColor: theme.primary }
              ]}
              onPress={() => toggleDone(item.id)}
            >
              {item.done && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={[
            styles.taskText,
            { color: theme.text },
            item.done && styles.done
          ]}>
            {item.title}
          </Text>
        </View>

        {/* PRIORITY TEXT ONLY COLOR */}
        <Text style={{
          color: getPriorityColor(item.priority),
          fontWeight: 'bold'
        }}>
          {item.priority}
        </Text>
      </Animated.View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: theme.bg }]}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>
              MyTaskList
            </Text>

            <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
              <Ionicons
                name={darkMode ? 'sunny' : 'moon'}
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          {/* COUNTER */}
          <Text style={{ color: theme.text }}>
            {doneCount} selesai dari {tasks.length}
          </Text>

          {/* INPUT */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Tambah task..."
            placeholderTextColor="#999"
            value={task}
            onChangeText={setTask}
          />

          {/* PRIORITY BUTTON (TEXT ONLY COLOR) */}
          <View style={styles.priorityContainer}>
            {['High', 'Medium', 'Low'].map(p => (
              <TouchableOpacity
                key={p}
                style={styles.priorityBtn}
                onPress={() => setPriority(p)}
              >
                <Text style={{
                  color: getPriorityColor(p),
                  fontWeight: 'bold',
                  textDecorationLine: priority === p ? 'underline' : 'none'
                }}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ADD BUTTON */}
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addText}>Tambah Task</Text>
          </TouchableOpacity>

          {/* FILTER */}
          <View style={styles.filterContainer}>
            {['ALL', 'ACTIVE', 'DONE'].map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)}>
                <Text style={{
                  color: filter === f ? theme.primary : '#999',
                  fontWeight: filter === f ? 'bold' : 'normal'
                }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LIST */}
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: '#999', marginTop: 50 }}>
                Belum ada task 😴
              </Text>
            }
          />

        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// THEME
const light = {
  bg: '#f1f3f5',
  card: '#fff',
  text: '#000',
  primary: '#2b8a3e'
};

const dark = {
  bg: '#121212',
  card: '#1e1e1e',
  text: '#fff',
  primary: '#69db7c'
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10
  },

  title: { fontSize: 26, fontWeight: 'bold' },

  input: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 10
  },

  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2b8a3e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10
  },

  addText: { color: '#fff', fontWeight: 'bold' },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },

  taskText: { fontSize: 16 },

  done: {
    textDecorationLine: 'line-through',
    color: '#888'
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15
  },

  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },

  priorityBtn: {
    padding: 8,
    borderRadius: 8
  },

  swipeDelete: {
    backgroundColor: '#fa5252',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderRadius: 12,
    marginBottom: 15
  },

  swipeText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});