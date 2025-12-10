/**
 * Simple useScenarios Hook
 * 
 * This hook demonstrates:
 * - Custom React hooks
 * - State management
 * - API integration
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { scenarioService } from '../services/scenarioService';

/**
 * Custom React hook for managing scenario data.
 *
 * Handles:
 * - Fetching scenarios (all or by level)
 * - Creating, updating, and deleting scenarios
 * - Local state management (list, loading, and error)
 * - Refreshing individual scenario progress in state
 *
 * @returns {object} Hook API
 * @property {Array<object>} scenarios - Array of loaded scenarios
 * @property {boolean} loading - Whether an API request is in progress
 * @property {string|null} error - Error message if an operation failed
 * @property {Function} fetchScenarios - Fetch all scenarios from the API
 * @property {Function} fetchScenariosByLevel - Fetch scenarios filtered by level ID
 * @property {Function} createScenario - Create a new scenario
 * @property {Function} updateScenario - Update an existing scenario
 * @property {Function} deleteScenario - Delete a scenario
 * @property {Function} refreshScenarioProgress - Update progress for a specific scenario in local state
 * @property {Function} clearError - Clear the current error message
 *
 * @example
 * const {
 *   scenarios, loading, error, fetchScenarios, createScenario
 * } = useScenarios();
 *
 * useEffect(() => {
 *   fetchScenarios();
 * }, [fetchScenarios]);
 */
export function useScenarios() {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Update a specific scenario’s progress within the current state.
     * Used when progress or completion status changes.
     *
     * @param {object} updatedScenario - Updated scenario object with `id` and progress data
     */
    const refreshScenarioProgress = useCallback((updatedScenario) => {
        if (!updatedScenario?.id) return;
        setScenarios(prev =>
            prev.map(s => s.id === updatedScenario.id ? { ...s, ...updatedScenario } : s)
        );
    }, []);

    /**
     * Fetch all scenarios from the backend.
     * Normalizes array response and handles loading/error states.
     * @returns {Promise<void>}
     */
    const fetchScenarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await scenarioService.getAll();
            setScenarios(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch all scenarios belonging to a specific level.
     * @param {number|string} levelId - The level’s identifier
     * @returns {Promise<void>}
     */
    const fetchScenariosByLevel = useCallback(async (levelId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await scenarioService.listByLevel(levelId);
            setScenarios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new scenario record.
     * Adds the new scenario to local state upon success.
     *
     * @param {object} scenarioData - Scenario creation payload
     * @returns {Promise<object>} Created scenario object
     * @throws {Error} if creation fails
     */
    const createScenario = useCallback(async (scenarioData) => {
        setLoading(true);
        setError(null);
        
        try {
            const newScenario = await scenarioService.create(scenarioData);
            setScenarios(prev => [newScenario, ...prev]);
            return newScenario;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update an existing scenario record.
     * Replaces the corresponding scenario in local state.
     *
     * @param {number|string} id - Scenario ID
     * @param {object} scenarioData - Updated scenario fields
     * @returns {Promise<object>} Updated scenario object
     * @throws {Error} if update fails
     */
    const updateScenario = useCallback(async (id, scenarioData) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedScenario = await scenarioService.update(id, scenarioData);
            setScenarios(prev => prev.map(s => s.id === id ? updatedScenario : s));
            return updatedScenario;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a scenario by its ID and remove it from the list.
     *
     * @param {number|string} id - Scenario ID
     * @returns {Promise<void>}
     * @throws {Error} if deletion fails
     */
    const deleteScenario = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            await scenarioService.delete(id);
            setScenarios(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /** Clear any existing error message from state. */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto-fetch scenarios when the hook mounts
    useEffect(() => {
        fetchScenarios();
    }, [fetchScenarios]);

    return {
        scenarios,
        loading,
        error,
        fetchScenarios,
        createScenario,
        updateScenario,
        deleteScenario,
        clearError,
        fetchScenariosByLevel,
        refreshScenarioProgress
    };
}
