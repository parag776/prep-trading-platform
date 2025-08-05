import axios from "axios";
import { toast } from "react-toastify";

export const handleErrorsInComponents = (err: unknown)=>{
    if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? "Unknown error, please try again later.";
        if(err.status===401){
            toast.error("please login before placing an order.")
        } else {
            toast.error(msg); // <- this is your `e.errors`
        }
    } else {
        toast.error("Unknown error, please try again later.");
    }
}