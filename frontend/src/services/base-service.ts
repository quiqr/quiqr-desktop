import { z } from 'zod'

interface Component {
    forceUpdate(): void;
}

abstract class BaseService<TSchemas extends Record<string, z.ZodType<any>>> {
    protected _listeners: Component[];
    private _notifyChangesTimeout?: NodeJS.Timeout;

    constructor() {
        this._listeners = [];
    }

    /**
     * Abstract method that subclasses must implement to provide their schema mapping
     * @returns Record of method names to their Zod schemas
     */
    protected abstract _getSchemas(): TSchemas;

    protected _notifyChanges() {
        if (this._notifyChangesTimeout) {
            clearTimeout(this._notifyChangesTimeout);
        }
        this._notifyChangesTimeout = setTimeout(() => {
            for (let i = 0; i < this._listeners.length; i++) {
                const listener = this._listeners[i];
                // Safety check: ensure the listener still has forceUpdate method
                if (listener && typeof listener.forceUpdate === 'function') {
                    listener.forceUpdate();
                } else {
                    console.warn('[BaseService] Invalid listener removed:', listener?.constructor?.name);
                    this._listeners.splice(i, 1);
                    i--; // Adjust index after removal
                }
            }
        }, 10); // throttle
    }

    registerListener(component: Component) {
        this._listeners.push(component);
    }

    unregisterListener(component: Component) {
        let index = this._listeners.indexOf(component);
        if (index >= 0)
            this._listeners.splice(index, 1);
    }

    /**
     * Validates a service method response using a Zod schema.
     * The return type is automatically inferred from the method name.
     * @param method - Name of the service method
     * @param response - The response data to validate
     * @returns Validated and typed response data
     */
    protected _validateResponse<M extends keyof TSchemas>(
        method: M,
        response: unknown
    ): z.infer<TSchemas[M]> {
        const schemas = this._getSchemas();
        const schema = schemas[method];

        // This means we need to create a new zod schema in types.ts
        if (!schema) {
            console.warn(`[Service Validation] No schema found for method: ${String(method)}`);
            return response as z.infer<TSchemas[M]>;
        }

        try {
            const validated = schema.parse(response);
            return validated as z.infer<TSchemas[M]>;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error(`[Service Validation] Schema validation failed for ${String(method)}:`, error.errors);
                console.error('Response data:', JSON.stringify(response, null, 2));
                throw new Error(`Service response validation failed for ${String(method)}: ${error.message}`);
            }
            throw error;
        }
    }
}

export { BaseService };
