const User = require("../Models/user");
const Item = require("../Models/item");
const { z } = require("zod");
const mongoose = require("mongoose");
const { sendItemReturnEmail } = require("../Utils/itemReturnedMail");

const itemSchemaValidate = z.object({
    name: z
        .string({
            required_error: "Item Name is required",
            invalid_type_error: "Item Name must be a string",
        }),
    description: z
        .string({
            required_error: "Item Description is required",
            invalid_type_error: "Item Description must be a string",
        }),
    category: z
        .string({ required_error: "Category is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Category ObjectId" }),
    status: z.enum(['lost', 'found', 'returned'], {
        required_error: "Item Status is required",
        invalid_type_error: "Invalid Item Status",
    }),
    dateReported: z.date().optional(),
    returnedOn: z.date().optional(),
    returnedToOwner: z.boolean().optional(),
    reportedBy: z
        .string({ required_error: "User ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid User ObjectId" }),
    returnedTo: z
        .string({ required_error: "User ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid User ObjectId" })
        .optional(),
});

const mongooseIdVerify = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ID" });

const itemUpdateSchemaValidate = z.object({
    status: z.enum(['lost', 'found', 'returned'], {
        required_error: "Item Status is required",
        invalid_type_error: "Invalid Item Status",
    }),
    name: z
    .string({ required_error: "Name is required" }),
    description: z
    .string({ required_error: "Description is required" })
});


const handleAddItem = async (req, res) => {
    try {
      const { name, description, category, location, status } = req.body;
      const reportedBy = req.user._id.toString();
      const validate = itemSchemaValidate.safeParse({ name, description, category, status, reportedBy });
  
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Invalid Request",
        });
      }
  
      if (validate.success) {
        const images = req.files.map(file => ({
          url: file.path,
        }));
  
        const item = new Item({
          name,
          description,
          category,
          images,
          location: JSON.parse(location),
          status,
          reportedBy,
        });
  
        await item.save();
  
        if (status === 'lost') {
          const foundItems = await matchLostItem({ lostItemImagePaths: images.map(img => img.url) });
  
          if (foundItems.length > 0) {
            return res.status(200).json({
              success: true,
              message: "Item added successfully. Potential matches found.",
              matches: foundItems,
            });
          } else {
            return res.status(200).json({
              success: true,
              message: "Item added successfully. No matches found.",
            });
          }
        }
  
        return res.status(201).json({
          success: true,
          message: "Item added successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: validate.error.issues.map((err) => err.message).join(", "),
        });
      }
    } catch (error) {
      console.error("Error Adding Item", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Issue, Please try again!",
      });
    }
  };
  

const handleUpdateItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Item Id.",
            });
        }

        const { name, description, status } = req.body;
        const validate = itemUpdateSchemaValidate.safeParse({
            name,
            description,
            status,
        });

        if (validate.success) {
            const updateFields = {
                name,
                description,
                status,
            };

            const item = await Item.findByIdAndUpdate(itemId, { $set: updateFields }, { new: true });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Item Updated Successfully",
                item,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err) => err.message).join(", "),
            });
        }
    } catch (error) {
        console.error("Error Updating Item", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
};

const handleUpdateItemStatus = async (req, res) => {
    try {
        const id = req.params.id;
        
        const itemId = mongooseIdVerify.safeParse(id).success ? id : null;
        if (!itemId) {
            return res.status(404).json({
                success: false,
                message: "Item not Found.",
            });
        }
        
        const { returnedTo } = req.body;
        
        if (!returnedTo) {
            return res.status(400).json({
                success: false,
                message: "Person whom item is returned is required",
            });
        }
        
        const originalItem = await Item.findById(itemId).populate('reportedBy returnedTo');
        if (!originalItem) {
            return res.status(404).json({
                success: false,
                message: "Item not found.",
            });
        }

        const returnedOn = new Date();
        const updateFields = {
            status: 'returned',
            returnedTo,
            returnedOn,
            returnedToOwner: true
        };
        
        const item = await Item.findByIdAndUpdate(itemId, { $set: updateFields }, { new: true }).populate('reportedBy returnedTo');
        await sendItemReturnEmail(item.returnedTo.email ,item);
        
        return res.status(200).json({
            success: true,
            message: "Item Status Updated Successfully",
            item,
        });
        
    } catch (error) {
        console.error("Error Updating Item Status", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
};


const handleDeleteItem = async(req,res)=>{
    try {
        const user = req.user;
        const itemId = req.params.id;
        if(!itemId){
            return res.status(409).json({
                success:false,
                message:"Invalid Item Id.",
            })
        }

        const item = await Item.findById(itemId);

        if(!item){
            return res.status(409).json({
                success:false,
                message:"Item not Found.",
            })
        }

        if(user.role !== 'admin' && item.reportedBy.toString() !== user._id.toString()){
            return res.status(401).json({
                success:false,
                message:"Unauthorized Access.",
            })
        }

        await Item.findByIdAndDelete(itemId);
        
        return res.status(200).json({
            success:true,
            message:"Item Deleted Successfully.",
        }) 
        

    } catch (error) {
        console.error("Error Deleting Item",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}


const handleGetItems = async (req,res)=>{
    try {
        const items = await Item.find({}).populate("category reportedBy").sort({'dateReported': -1});

        if (!items || items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No items found.",
                items:[],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Items Fetched Successfully",
            items,
        });

    } catch (error) {
        console.error("Error Fetching Items",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetItemsByCategory = async(req,res)=>{
    try {
        const items = await Item.aggregate([
            {
                $addFields:{
                    "reportedBy": { "$toObjectId": "$reportedBy" }
                }
            },
            {
                $sort:{
                    "dateReported": -1
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "reportedBy",
                    foreignField: "_id",
                    as: "reportedBy"
                }
            },
            {
                $addFields:{
                    reportedBy:{
                          $arrayElemAt: ["$reportedBy",0]
                    }
                }
            },
            {
                $addFields:{
                    "returnedTo": { "$toObjectId": "$returnedTo" }
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "returnedTo",
                    foreignField: "_id",
                    as: "returnedTo"
                }
            },
            {
                $addFields:{
                    returnedTo:{
                          $arrayElemAt: ["$returnedTo",0]
                    }
                }
            },
            {
                $group:{
                    _id: "$category",
                    items: { 
                      $push:{  
                            _id:"$_id",
                            name: "$name", 
                            description: "$description", 
                            images: "$images", 
                            status: "$status", 
                            reportedBy: "$reportedBy", 
                            location: "$location", 
                            dateReported: "$dateReported", 
                            returnedTo: "$returnedTo",
                            returnedOn: "$returnedOn",
                            returnedToOwner: "$returnedToOwner",
                        } 
                    },
                    totalItems:{$sum:1}
                }
            },
            {
                $addFields:{
                    "_id": { "$toObjectId": "$_id" }
                }
            },
            {
                $lookup:{
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $addFields:{
                    categoryDetails:{
                          $arrayElemAt: ["$categoryDetails",0]
                    }
                }
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Items Fetched By Category Successfully",
            items,
        });        

    } catch (error) {
        console.error("Error Fetching Items By Category",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
} 


const handleGetItemsOfACategory = async(req,res)=>{
    try {
        const id = req.params.id;
        const _id = mongooseIdVerify.safeParse(id).success ? id : null;
        if(!_id){
            return res.status(400).json({
                success:true,
                message: "Category not Found!",
            });
        }

        const categoryId = new mongoose.Types.ObjectId(_id);

        const items = await Item.aggregate([
              {
                $match:{
                    category: categoryId,
                }
              },
              {
                $addFields:{
                    "reportedBy": { "$toObjectId": "$reportedBy" }
                }
            },
            {
                $sort:{
                    "dateReported": -1
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "reportedBy",
                    foreignField: "_id",
                    as: "reportedBy"
                }
            },
            {
                $addFields:{
                    reportedBy:{
                          $arrayElemAt: ["$reportedBy",0]
                    }
                }
            },
            {
                $addFields:{
                    "returnedTo": { "$toObjectId": "$returnedTo" }
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "returnedTo",
                    foreignField: "_id",
                    as: "returnedTo"
                }
            },
            {
                $addFields:{
                    returnedTo:{
                          $arrayElemAt: ["$returnedTo",0]
                    }
                }
            },
            {
                $group:{
                    _id: "$category",
                    items: { 
                      $push:{  
                            _id:"$_id",
                            name: "$name", 
                            description: "$description", 
                            images: "$images", 
                            status: "$status", 
                            reportedBy: "$reportedBy", 
                            location: "$location", 
                            dateReported: "$dateReported", 
                            returnedTo: "$returnedTo",
                            returnedOn: "$returnedOn",
                            returnedToOwner: "$returnedToOwner",
                        } 
                    },
                    totalItems:{$sum:1}
                }
            },
            {
                $addFields:{
                    "_id": { "$toObjectId": "$_id" }
                }
            },
            {
                $lookup:{
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            {
                $addFields:{
                    categoryDetails:{
                          $arrayElemAt: ["$categoryDetails",0]
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Items Fetched By Category Successfully",
            items:items[0]?.items,
            category:items[0]?.categoryDetails
        }); 
    } catch (error) {
        console.error("Error Fetching Category Items",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
} 

const handleGetItemofUser = async (req,res)=>{
    try {
        const user = req.user._id;
        const items = await Item.find({reportedBy: user}).populate("category reportedBy returnedTo").sort({'dateReported': -1});

        if (!items || items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No items found.",
                items:[],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Items Fetched Successfully",
            items,
        });

    } catch (error) {
        console.error("Error Fetching Items",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetItemById = async (req,res)=>{
    try {
        const itemId = mongooseIdVerify.safeParse(req.params.id).success ? req.params.id : null;
        if (!itemId) {
            return res.status(404).json({
                success: false,
                message: "Invalid Item Id.",
                item: null,
            });
        }
        const item = await Item.findById(itemId).populate("category reportedBy returnedTo");

        if (!item) {
            return res.status(404).json({
                success: true,
                message: "Item not Found.",
                items:null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item Fetched Successfully",
            item,
        });

    } catch (error) {
        console.error("Error Fetching Items",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetItemByQuery = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const pipeline = [
            {
                $lookup: {
                    from: "users", 
                    localField: "reportedBy",
                    foreignField: "_id",
                    as: "reportedBy"
                }
            },
            {
                $unwind: "$reportedBy"
            },
            {
                $lookup: {
                    from: "categories", 
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            }
        ];

        const matchConditions = [];

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            matchConditions.push({
                $or: [
                    { 'name': searchRegex },
                    { 'description': searchRegex },
                    { 'status': searchRegex },
                    { 'category.name': searchRegex },
                    { 'reportedBy.firstName': searchRegex },
                    { 'reportedBy.phoneNumber': searchRegex },
                    { 'reportedBy.email': searchRegex },
                ]
            });
        }

        if (status) {
            const statusArray = status.toLowerCase().split('.');
            matchConditions.push({ 
                'status': statusArray.length > 1 
                    ? { $in: statusArray }
                    : statusArray[0]
            });
        }

        if (matchConditions.length > 0) {
            pipeline.push({
                $match: matchConditions.length === 1 
                    ? matchConditions[0] 
                    : { $and: matchConditions }
            });
        }

        pipeline.push({
            $sort: { dateReported: -1 }
        });

        const countPipeline = [...pipeline];
        
        pipeline.push(
            { $skip: skip },
            { $limit: pageSize }
        );

        pipeline.push({
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                status: 1,
                images: 1,
                location: 1,
                dateReported: 1,
                dateFound: 1,
                dateReturned: 1,
                category: {
                    _id: 1,
                    name: 1
                },
                reportedBy: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phoneNumber: 1
                }
            }
        });

        const [items, totalItemsArray] = await Promise.all([
            Item.aggregate(pipeline),
            Item.aggregate([
                ...countPipeline,
                { $count: 'total' }
            ])
        ]);

        const totalItems = totalItemsArray.length > 0 ? totalItemsArray[0].total : 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        return res.status(200).json({
            success: true,
            message: items.length ? "Items Fetched Successfully" : "No Items Found",
            items,
            totalItems,
            currentPage: pageNumber,
            totalPages,
            filters: {
                search,
                status,
                limit: pageSize
            }
        });

    } catch (error) {
        console.error("Error Getting Items:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again!",
            error: error.message
        });
    }
};


module.exports = {handleAddItem,handleUpdateItem, handleDeleteItem, handleUpdateItemStatus, handleGetItems, handleGetItemsByCategory, handleGetItemsOfACategory, handleGetItemofUser, handleGetItemById, handleGetItemByQuery};