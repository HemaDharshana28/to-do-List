import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data) => {
    try {
      const res = await api.post('/tasks', data);
      const newTask = res.data.data.task;
      setTasks(prev => [newTask, ...prev]);
      await fetchStats();
      toast.success('Task created!');
      return newTask;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create task';
      toast.error(message);
      throw err;
    }
  }, [fetchStats]);

  const updateTask = useCallback(async (id, data) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);
      const updated = res.data.data.task;
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      await fetchStats();
      toast.success('Task updated!');
      return updated;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update task';
      toast.error(message);
      throw err;
    }
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      await fetchStats();
      toast.success('Task deleted');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      throw err;
    }
  }, [fetchStats]);

  const bulkAction = useCallback(async (action, ids, extra = {}) => {
    try {
      const res = await api.post('/tasks/bulk', { action, ids, ...extra });
      if (action === 'delete') {
        setTasks(prev => prev.filter(t => !ids.includes(t.id)));
      } else if (action === 'status') {
        setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: extra.status } : t));
      }
      await fetchStats();
      toast.success(res.data.message);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to perform bulk action';
      toast.error(message);
      throw err;
    }
  }, [fetchStats]);

  return { tasks, stats, loading, statsLoading, error, fetchTasks, fetchStats, createTask, updateTask, deleteTask, bulkAction, setTasks };
};
