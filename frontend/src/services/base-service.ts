import { z } from 'zod'

interface Component {
    forceUpdate(): void;
}

class BaseService {
    protected _listeners: Component[];
    private _notifyChangesTimeout?: NodeJS.Timeout;

    constructor() {
        this._listeners = [];
    }

    protected _notifyChanges() {
        if (this._notifyChangesTimeout) {
            clearTimeout(this._notifyChangesTimeout);
        }
        setTimeout(() => {
            for (let i = 0; i < this._listeners.length; i++) {
                this._listeners[i].forceUpdate();
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
     * Validates a service method response using a Zod schema
     * @param methodName - Name of the service method (for error messages)
     * @param response - The response data to validate
     * @param schema - Zod schema to validate against
     * @returns Validated and typed response data
     */
    protected _validateResponse<T>(methodName: string, response: unknown, schema: z.ZodType<T>): T {
        try {
            const validated = schema.parse(response);
            return validated;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error(`[Service Validation] Schema validation failed for ${methodName}:`, error.errors);
                console.error('Response data:', JSON.stringify(response, null, 2));
                throw new Error(`Service response validation failed for ${methodName}: ${error.message}`);
            }
            throw error;
        }
    }
}

export { BaseService };
