class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something Went Wrong",
        errors=[],
        statck = ""
    ){
        super(message)
        this.statusCode=statusCode
        this.message=message
        this.data = null
        this.success = false;
        this.errors = errors

        if(statck){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}


// Example usage:
// // Creating an instance of ApiError
// const apiError = new ApiError(404, "Resource not found", [], "Sample stack trace");

// // Using the created instance in an error response
// console.error(`HTTP ${apiError.statusCode} Error: ${apiError.message}`);
// console.error(`Stack Trace: ${apiError.stack}`);
// console.error(`Errors: ${apiError.errors}`);
