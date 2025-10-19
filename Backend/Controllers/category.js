const Category = require("../Models/category");
const { z } = require("zod");

const categorySchemaValidate = z.object({
    name: z
        .string({
            required_error: "Category Name is required",
            invalid_type_error: "Category Name must be a string",
        }),
    description: z
        .string({
            required_error: "Category Description is required",
            invalid_type_error: "Category Description must be a string",
        }),
    image: z
        .string({required_error: "Image Url is required"})
        .regex(/^https?:\/\/(www\.)?[\w\-]+(\.[\w\-]+)+([\/\w\-.,@?^=%&:/~+#]*)?$/i,{message:"Invalid Image Url."}),
});


const handleAddCategory = async(req,res)=>{
    try {
        const {name, description, image} = req.body;

        const validate = categorySchemaValidate.safeParse({name, description, image});
        if(validate.success){

            const foundCategory = await Category.findOne({name:name}).sort({createdAt:-1});

            if(foundCategory){
                return res.status(409).json({
                    success:false,
                    message:"Category Already Exists with this name",
                })
            }

            const category = new Category({
                name,
                description,
                image,
            });

            await category.save();

            return res.status(201).json({
                success: true,
                message: "Category Added Successfully",
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err)=>err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Adding Category",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}


const handleUpdateCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;

        if(!categoryId){
            return res.status(409).json({
                success:false,
                message:"Invalid Category Id.",
            })
        }

        const {name, description, image} = req.body;

        const validate = categorySchemaValidate.safeParse({name, description, image});
        
        if(validate.success){            

            const category = await Category.findByIdAndUpdate(categoryId,{
                name,
                description,
                image,
            },{new:true});

            if(!category){
                return res.status(409).json({
                    success:false,
                    message:"Category not Found.",
                })
            }

            return res.status(200).json({
                success: true,
                message: "Category Updated Successfully",
                category
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err)=>err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Updating Category",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleDeleteCategory = async(req,res)=>{
    try {
        const categoryId = req.params.id;

        if(!categoryId){
            return res.status(409).json({
                success:false,
                message:"Invalid Category Id.",
            })
        }
        
        const category = await Category.findByIdAndDelete(categoryId);

        if(!category){
            return res.status(409).json({
                success:false,
                message:"Category not Found.",
            })
        }
        else{
            return res.status(200).json({
                success:true,
                message:"Category Deleted Successfully.",
            }) 
        }

    } catch (error) {
        console.error("Error Deleting Category",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetCategories = async (req,res)=>{
    try {
        const categories = await Category.find({}).sort({createdAt:-1});

        if (!categories || categories.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Categories found.",
                categories: [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Categories Fetched Successfully",
            categories,
        });

    } catch (error) {
        console.error("Error Fetching Categories",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

module.exports = {handleAddCategory,handleUpdateCategory, handleDeleteCategory, handleGetCategories};