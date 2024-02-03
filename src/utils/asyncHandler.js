// SINCE WE WILL USE THE async await function in many place therefore we use  a wrapper utility to be used everywhere with ease

const asyncHandler = (requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }

}

export {asyncHandler}

//const asyncHandler = ()=>{}
//const asyncHandler = (func)=>()=>{}
//const asyncHandler = (func)=> async()=>{}



// const asyncHandler = (func)=> async(req,res,next)=>{
//     try {
//         await func(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             mesage:err.message
//         })
//     }
// }




