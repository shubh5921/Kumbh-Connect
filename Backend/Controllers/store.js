const Store = require("../Models/store");
const { z } = require("zod");

const storeSchemaValidate = z.object({
    name: z
        .string({
            required_error: "Store Name is required",
            invalid_type_error: "Store Name must be a string",
        }),
    description: z
        .string({
            required_error: "Store Description is required",
            invalid_type_error: "Store Description must be a string",
        }),
    address: z
        .string({
            required_error: "Store Address is required",
            invalid_type_error: "Store Address must be a string",
        }),
    phone: z
        .string({
            required_error: "Store Phone is required",
            invalid_type_error: "Store Phone must be a string",
        }),
    hours: z
        .string({
            required_error: "Store Hours are required",
            invalid_type_error: "Store Hours must be a string",
        }),
    latitude: z
        .number({
            required_error: "Store Latitude is required",
            invalid_type_error: "Store Latitude must be a number",
        }),
    longitude: z
        .number({
            required_error: "Store Longitude is required",
            invalid_type_error: "Store Longitude must be a number",
        }),
});

const handleAddStore = async(req,res)=>{
    try {
        const {name, description, address, phone, hours, latitude, longitude} = req.body;

        const validate = storeSchemaValidate.safeParse({name, description, address, phone, hours, latitude, longitude});
        if(validate.success){

            const foundStore = await Store.findOne({name:name}).sort({createdAt:-1});

            if(foundStore){
                return res.status(409).json({
                    success:false,
                    message:"Store Already Exists with this name",
                })
            }

            const store = new Store({
                name,
                description,
                address,
                phone,
                hours,
                latitude,
                longitude,
            });

            await store.save();

            return res.status(201).json({
                success: true,
                message: "Store Added Successfully",
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err)=>err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Adding Store",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetStores = async (req,res)=>{
    try {
        const stores = await Store.find({}).sort({createdAt:-1});

        if (!stores || stores.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No Stores found.",
                stores:[],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stores Fetched Successfully",
            stores,
        });

    } catch (error) {
        console.error("Error Fetching Stores",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
            stores:[],
        });
    }
}

module.exports = {handleAddStore, handleGetStores};