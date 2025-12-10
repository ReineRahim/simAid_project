/**
 * Simple useScenarioSteps Hook
 * 
 * This hook demonstrates:
 * - Custom React hooks
 * - State management
 * - API integration
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { scenarioStepService } from '../services/scenarioStepService';

/**
 * React hook for managing scenario step data.
 *
 * Handles:
 * - Fetching all scenario steps
 * - Creating, updating, and deleting steps
 * - Local state management (list, loading, and error)
 *
 * @returns {object} Hook API
 * @property {Array<object>} steps - List of scenario steps
 * @property {boolean} loading - Whether a step-related API request is in progress
 * @property {string|null} error - Error message, if any
 * @property {Function} fetchSteps - Fetch all scenario steps
 * @property {Function} createStep - Create a new scenario step
 * @property {Function} updateStep - Update an existing scenario step
 * @property {Function} deleteStep - Delete a scenario step
 * @property {Function} clearError - Clear the current error message
 *
 * @example
 * const { steps, fetchSteps, createStep } = useScenarioSteps();
 *
 * useEffect(() => {
 *   fetchSteps();
 * }, [fetchSteps]);
 */
export function useScenarioSteps() {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all scenario steps from the API.
     * Normalizes array response and updates state.
     * 
     * @returns {Promise<void>}
     */
    const fetchSteps = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await scenarioStepService.getAll();
            setSteps(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Create a new scenario step and prepend it to the local list.
     *
     * @param {object} stepData - Step creation payload
     * @returns {Promise<object>} The created step object
     * @throws {Error} if creation fails
     */
    const createStep = useCallback(async (stepData) => {
        setLoading(true);
        setError(null);

        try {
            const newStep = await scenarioStepService.create(stepData);
            setSteps(prev => [newStep, ...prev]);
            return newStep;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update an existing scenario step and merge changes into local state.
     *
     * @param {number|string} id - Step identifier
     * @param {object} stepData - Updated step fields
     * @returns {Promise<object>} The updated step object
     * @throws {Error} if update fails
     */
    const updateStep = useCallback(async (id, stepData) => {
        setLoading(true);
        setError(null);

        try {
            const updatedStep = await scenarioStepService.update(id, stepData);
            setSteps(prev => prev.map(s => s.id === id ? updatedStep : s));
            return updatedStep;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a scenario step by ID and remove it from local state.
     *
     * @param {number|string} id - Step identifier
     * @returns {Promise<void>}
     * @throws {Error} if deletion fails
     */
    const deleteStep = useCallback(async (id) => {
        setLoading(true);
        setError(null);

        try {
            await scenarioStepService.delete(id);
            setSteps(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /** Clear the current error message. */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Automatically fetch steps when the hook mounts
    useEffect(() => {
        fetchSteps();
    }, [fetchSteps]);

    return {
        steps,
        loading,
        error,
        fetchSteps,
        createStep,
        updateStep,
        deleteStep,
        clearError
    };
}
