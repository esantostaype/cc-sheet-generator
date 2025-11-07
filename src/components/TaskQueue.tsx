/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Card, CardContent, Chip, Box } from '@mui/joy';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { Spinner } from './Spinner'; // Asumiendo que tienes un componente Spinner

// Definir el tipo de socket para evitar errores de TypeScript
let socket: any;

// Interfaces para los datos de la tarea (deben coincidir con el modelo Prisma)
interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskAssignment {
  userId: string;
  taskId: string; // Cambiado a string para coincidir con el modelo de Task.id
  user: User;
}

interface TaskCategory {
  id: number;
  name: string;
  duration: number;
  tier: string;
}

interface TaskType {
  id: number;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate: string; // ISO string
  deadline: string; // ISO string
  category: TaskCategory;
  type: TaskType;
  brand: Brand;
  assignees: TaskAssignment[];
}

export const TaskQueue = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Conexión y escucha de Socket.IO
  useEffect(() => {
    // Inicializar la conexión de Socket.IO si no está ya inicializada
    if (!socket) {
      socket = io({
        path: '/api/socket_io',
        addTrailingSlash: false,
      });

      socket.on('connect', () => {
        console.log('Conectado a Socket.IO desde TaskQueue');
      });

      socket.on('disconnect', () => {
        console.log('Desconectado de Socket.IO desde TaskQueue');
      });
    }

    // Escuchar el evento 'task_update'
    const handleTaskUpdate = (updatedTask: Task) => {
      console.log('Tarea actualizada en tiempo real recibida:', updatedTask);
      setTasks((prevTasks) => {
        const existingTaskIndex = prevTasks.findIndex((t) => t.id === updatedTask.id);
        if (existingTaskIndex > -1) {
          // Si la tarea ya existe, actualízala
          const newTasks = [...prevTasks];
          newTasks[existingTaskIndex] = updatedTask;
          return newTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        } else {
          // Si es una tarea nueva, añádela
          return [...prevTasks, updatedTask].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        }
      });
      toast.info(`Tarea "${updatedTask.name}" actualizada en la cola.`);
    };

    socket.on('task_update', handleTaskUpdate);

    // Escuchar el evento 'task_deleted'
    const handleTaskDeleted = (deletedTask: { id: string }) => {
      console.log('Tarea eliminada en tiempo real recibida:', deletedTask.id);
      setTasks((prevTasks) => {
        const newTasks = prevTasks.filter((t) => t.id !== deletedTask.id);
        return newTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      });
      toast.info(`Tarea eliminada de la cola.`);
    };

    socket.on('task_deleted', handleTaskDeleted);


    // Limpiar los listeners al desmontar el componente
    return () => {
      socket.off('task_update', handleTaskUpdate);
      socket.off('task_deleted', handleTaskDeleted);
      // No desconectar el socket aquí, ya que otros componentes pueden estar usándolo
    };
  }, []);

  // Cargar tareas iniciales al montar el componente
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ data: Task[] }>('/api/tasks'); // La API devuelve un objeto con 'data'
        // Ordenar las tareas por fecha de inicio para una visualización coherente
        const sortedTasks = response.data.data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        setTasks(sortedTasks);
      } catch (error) {
        toast.error(`Error al cargar las tareas: ${error}`);
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Agrupar tareas por diseñador asignado
  const tasksByAssignee = tasks.reduce((acc, task) => {
    if (task.assignees && task.assignees.length > 0) {
      task.assignees.forEach(assignment => {
        const assigneeName = assignment.user.name;
        if (!acc[assigneeName]) {
          acc[assigneeName] = [];
        }
        acc[assigneeName].push(task);
      });
    } else {
      // Tareas sin asignados (pueden ser tareas pendientes de asignación automática o manual)
      if (!acc['Sin Asignar']) {
        acc['Sin Asignar'] = [];
      }
      acc['Sin Asignar'].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  if (loading) {
    return <Spinner isActive={loading} />;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Typography level="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Cola de Tareas de Diseño
      </Typography>

      {Object.keys(tasksByAssignee).length === 0 && (
        <Typography level="body-md" textAlign="center">
          No hay tareas en cola. ¡Crea una nueva tarea!
        </Typography>
      )}

      {Object.entries(tasksByAssignee).map(([assigneeName, assigneeTasks]) => (
        <Box key={assigneeName} sx={{ mb: 4 }}>
          <Typography sx={{ mb: 2 }}>
            Diseñador: {assigneeName}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assigneeTasks.map((task) => (
              <Card key={task.id} variant="outlined" sx={{ borderRadius: 'md' }}>
                <CardContent>
                  <Typography level="title-md" sx={{ mb: 1 }}>{task.name}</Typography>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    **Descripción:** {task.description || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Chip size="sm" variant="soft" color="primary">
                      {task.type.name}
                    </Chip>
                    <Chip size="sm" variant="soft" color="neutral">
                      {task.category.name} (Tier {task.category.tier})
                    </Chip>
                    <Chip size="sm" variant="soft" color={
                      task.priority === 'URGENT' ? 'danger' :
                      task.priority === 'HIGH' ? 'warning' :
                      task.priority === 'NORMAL' ? 'success' : 'neutral'
                    }>
                      Prioridad: {task.priority}
                    </Chip>
                    <Chip size="sm" variant="soft" color="success">
                      Estado: {task.status}
                    </Chip>
                    <Chip size="sm" variant="soft" color="neutral">
                      Brand: {task.brand.name}
                    </Chip>
                  </Box>
                  <Typography level="body-sm">
                    **Inicio:** {formatDate(task.startDate)}
                  </Typography>
                  <Typography level="body-sm">
                    **Deadline:** {formatDate(task.deadline)}
                  </Typography>
                  {task.assignees.length > 1 && (
                    <Typography level="body-sm">
                      **Asignados:** {task.assignees.map(a => a.user.name).join(', ')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ))}
    </div>
  );
};
