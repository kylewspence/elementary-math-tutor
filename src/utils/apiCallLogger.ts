/**
 * API Call Logger and Monitoring System
 * 
 * This module provides comprehensive logging and monitoring of API calls
 * to help identify optimization opportunities and track usage patterns.
 */

interface ApiCallLog {
    id: string;
    timestamp: Date;
    endpoint: string;
    method: string;
    operation: string;
    level?: number;
    duration?: number;
    success: boolean;
    error?: string;
    cached: boolean;
    stackTrace?: string;
}

class ApiCallLogger {
    private logs: ApiCallLog[] = [];
    private callCount = 0;
    private displayElement: HTMLElement | null = null;

    constructor() {
        this.createLoggerDisplay();
        this.logToConsole('📊 API Call Logger initialized');
    }

    /**
     * Creates a visual logger display in the top-right corner
     */
    private createLoggerDisplay() {
        // Remove existing logger if it exists
        const existing = document.getElementById('api-call-logger');
        if (existing) {
            existing.remove();
        }

        // Create logger display
        this.displayElement = document.createElement('div');
        this.displayElement.id = 'api-call-logger';
        this.displayElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            border: 1px solid #333;
        `;

        // Add to document
        document.body.appendChild(this.displayElement);
        this.updateDisplay();
    }

    /**
     * Logs an API call start
     */
    logCallStart(endpoint: string, method: string, operation: string, level?: number): string {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.callCount++;

        const logEntry: ApiCallLog = {
            id: callId,
            timestamp: new Date(),
            endpoint,
            method,
            operation,
            level,
            success: false,
            cached: false,
            stackTrace: new Error().stack
        };

        this.logs.push(logEntry);
        this.logToConsole(`📡 API CALL #${this.callCount} START: ${operation} (${endpoint})`);
        this.updateDisplay();

        return callId;
    }

    /**
     * Logs an API call completion
     */
    logCallEnd(callId: string, success: boolean, error?: string, cached = false) {
        const logEntry = this.logs.find(log => log.id === callId);
        if (logEntry) {
            logEntry.duration = Date.now() - logEntry.timestamp.getTime();
            logEntry.success = success;
            logEntry.error = error;
            logEntry.cached = cached;

            const status = success ? '✅' : '❌';
            const cacheStatus = cached ? '🔄 CACHED' : '🌐 NETWORK';
            this.logToConsole(`${status} API CALL #${this.callCount} END: ${logEntry.operation} (${logEntry.duration}ms) ${cacheStatus}`);

            if (error) {
                this.logToConsole(`❌ ERROR: ${error}`);
            }
        }
        this.updateDisplay();
    }

    /**
     * Gets call statistics
     */
    getStats() {
        const totalCalls = this.logs.length;
        const successfulCalls = this.logs.filter(log => log.success).length;
        const cachedCalls = this.logs.filter(log => log.cached).length;
        const networkCalls = totalCalls - cachedCalls;
        const averageDuration = this.logs
            .filter(log => log.duration)
            .reduce((sum, log) => sum + (log.duration || 0), 0) / totalCalls;

        return {
            totalCalls,
            successfulCalls,
            failedCalls: totalCalls - successfulCalls,
            cachedCalls,
            networkCalls,
            averageDuration: Math.round(averageDuration),
            successRate: Math.round((successfulCalls / totalCalls) * 100)
        };
    }

    /**
     * Updates the visual display
     */
    private updateDisplay() {
        if (!this.displayElement) return;

        const stats = this.getStats();
        const recentCalls = this.logs.slice(-5).reverse();

        this.displayElement.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #4ade80;">
                📊 API Call Monitor
            </div>
            <div style="margin-bottom: 8px; font-size: 11px;">
                <div>Total: ${stats.totalCalls} | Success: ${stats.successRate}%</div>
                <div>Network: ${stats.networkCalls} | Cached: ${stats.cachedCalls}</div>
                <div>Avg Duration: ${stats.averageDuration}ms</div>
            </div>
            <div style="border-top: 1px solid #333; padding-top: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px; color: #fbbf24;">Recent Calls:</div>
                ${recentCalls.map(call => `
                    <div style="margin-bottom: 2px; font-size: 10px;">
                        ${call.success ? '✅' : '❌'} ${call.operation}${call.level !== undefined ? ` L${call.level}` : ''}
                        ${call.cached ? ' 🔄' : ' 🌐'} ${call.duration ? `${call.duration}ms` : '...'}
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #333; font-size: 10px; color: #9ca3af;">
                Click to toggle details
            </div>
        `;

        // Add click handler for detailed view
        this.displayElement.onclick = () => this.showDetailedLog();
    }

    /**
     * Shows detailed log in console
     */
    private showDetailedLog() {
        console.group('📊 Detailed API Call Log');
        console.table(this.logs.map(log => ({
            Operation: log.operation,
            Level: log.level,
            Success: log.success,
            Duration: log.duration ? `${log.duration}ms` : 'N/A',
            Cached: log.cached,
            Timestamp: log.timestamp.toLocaleTimeString(),
            Error: log.error || 'None'
        })));
        console.groupEnd();

        // Show optimization suggestions
        this.showOptimizationSuggestions();
    }

    /**
     * Analyzes calls and suggests optimizations
     */
    private showOptimizationSuggestions() {
        const stats = this.getStats();
        const suggestions: string[] = [];

        if (stats.cachedCalls / stats.totalCalls < 0.5) {
            suggestions.push('🔄 Consider implementing more aggressive caching');
        }

        if (stats.networkCalls > 4) {
            suggestions.push('🌐 Multiple network calls detected - consider batching');
        }

        if (stats.averageDuration > 1000) {
            suggestions.push('⏱️ High average response time - check network/server performance');
        }

        const duplicateOperations = this.findDuplicateOperations();
        if (duplicateOperations.length > 0) {
            suggestions.push(`🔁 Duplicate operations detected: ${duplicateOperations.join(', ')}`);
        }

        if (suggestions.length > 0) {
            console.group('💡 Optimization Suggestions');
            suggestions.forEach(suggestion => console.log(suggestion));
            console.groupEnd();
        }
    }

    /**
     * Finds duplicate operations that could be cached
     */
    private findDuplicateOperations(): string[] {
        const operationCounts: { [key: string]: number } = {};

        this.logs.forEach(log => {
            const key = `${log.operation}_${log.level}`;
            operationCounts[key] = (operationCounts[key] || 0) + 1;
        });

        return Object.entries(operationCounts)
            .filter(([_, count]) => count > 1)
            .map(([operation, count]) => `${operation} (${count}x)`);
    }

    /**
     * Logs to console with timestamp
     */
    private logToConsole(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
    }

    /**
     * Clears all logs
     */
    clearLogs() {
        this.logs = [];
        this.callCount = 0;
        this.updateDisplay();
        this.logToConsole('🧹 API call logs cleared');
    }

    /**
     * Exports logs as JSON
     */
    exportLogs() {
        const data = {
            exportTime: new Date().toISOString(),
            stats: this.getStats(),
            logs: this.logs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-calls-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global instance
export const apiCallLogger = new ApiCallLogger();

// Utility functions
export const logApiCallStart = (endpoint: string, method: string, operation: string, level?: number) =>
    apiCallLogger.logCallStart(endpoint, method, operation, level);

export const logApiCallEnd = (callId: string, success: boolean, error?: string, cached = false) =>
    apiCallLogger.logCallEnd(callId, success, error, cached);

export const getApiCallStats = () => apiCallLogger.getStats();

export const clearApiCallLogs = () => apiCallLogger.clearLogs();

export const exportApiCallLogs = () => apiCallLogger.exportLogs(); 