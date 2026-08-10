export function formatJsonResponse(data: any): string {
    return JSON.stringify(data, null, 2);
}

export function formatJsonError(errorType: string, message: string, retryable: boolean = false, recommendedAction?: string): string {
    return JSON.stringify({
        errorType,
        message,
        retryable,
        ...(recommendedAction ? { recommendedAction } : {})
    }, null, 2);
}
