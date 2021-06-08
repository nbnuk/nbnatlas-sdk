
/**
    * @private
*/
export function rejectInvalidRequest(message) {
    return Promise.reject({
        status: "INVALID",
        message: message
    });
}

export * from  './error-messages'