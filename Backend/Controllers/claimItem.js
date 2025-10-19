const Item = require("../Models/item");
const User = require("../Models/user");
const ClaimItem = require("../Models/claimItem");
const { z } = require("zod");
const mongoose = require("mongoose");
const { sendClaimVerificationEmail } = require("../Utils/claimVerifyMail");

const claimSchemaValidate = z.object({
    item: z
        .string({ required_error: "Item is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Item Id" }),
    claimBy: z
        .string({ required_error: "Person Claimed not Found" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid User ObjectId" }),
    status: z.enum(['pending', 'accepted', 'rejected']).optional(),
    claimVerified: z.boolean().optional(),
    dateReported: z.date().optional(),
});

const handleClaimItem = async (req, res) => {
    try {
        const { item } = req.body;
        const claimBy = req.user._id.toString();
        
        const validate = claimSchemaValidate.safeParse({ item, claimBy });
        
        const user = await User.findById(claimBy);
        const itemClaimed = await Item.findOne({_id: item, status:'found'});
        
        if (!user || !itemClaimed) {
            return res.status(401).json({
                success: false,
                message: "Invalid Claim Request",
            });
        }

        const existingClaim = await ClaimItem.findOne({
            item: itemClaimed._id,
            claimBy: claimBy,
            status: "pending",
        });

        if (existingClaim) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a claim request for this item",
            });
        }

        if (validate.success) {
            const claim = new ClaimItem({
                item: itemClaimed._id,
                claimBy,
                dateReported: new Date(),
            });

            await claim.save();

            return res.status(201).json({
                success: true,
                message: "Claim Request Submitted Successfully, We Will mail you once request is processed",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err) => err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Processing Claim Request", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
};



const handleClaimVerification = async (req, res) => {
    try {
        const { claimId, status } = req.body;
        if (!claimId || !status) {
            return res.status(401).json({
                success: false,
                message: "Invalid Request",
            });
        }

        const claim = await ClaimItem.findById(claimId);
        if (!claim) {
            return res.status(401).json({
                success: false,
                message: "Invalid Claim Request",
            });
        }

        const claimBy = claim.claimBy;
        const itemClaimed = await Item.findById(claim.item);
        const originalOwner = await User.findById(claimBy);

        claim.status = status;

        if (status.toLowerCase() === "accepted") {
            await ClaimItem.updateMany(
                { item: claim.item, _id: { $ne: claimId } },
                { $set: { status: "rejected" } }
            );

            itemClaimed.returnedOn = new Date();
            itemClaimed.status = "returned";
            itemClaimed.returnedTo = claimBy;
            itemClaimed.returnedToOwner = true;

            await sendClaimVerificationEmail(originalOwner.email, {
                ownerName: originalOwner.firstName,
                itemName: itemClaimed.name,
                description: itemClaimed.description
            });
        }

        await claim.save();
        await itemClaimed.save();

        return res.status(200).json({
            success: true,
            message: "Claim Processed Successfully",
        });

    } catch (error) {
        console.error("Error Processing Claim Request", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}


const handleGetAClaim = async (req, res) => {
    try {
      const claim = await ClaimItem.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
        {
          $lookup: {
            from: 'items',
            localField: 'item',
            foreignField: '_id',
            as: 'item',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'item.category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'claimBy',
            foreignField: '_id',
            as: 'claimBy',
          },
        },
        { $unwind: '$item' },
        { $unwind: '$category' },
        { $unwind: '$claimBy' },
      ]);
  
      if (!claim || claim.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Claim not Found',
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Claim Fetched Successfully',
        claim: claim[0],
      });
    } catch (error) {
      console.error('Error Fetching Claim', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Issue, Please try again!',
      });
    }
  };

  const handleGetClaims = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const pipeline = [
            {
                $lookup: {
                    from: "users", 
                    localField: "claimBy",
                    foreignField: "_id",
                    as: "claimBy"
                }
            },
            {
                $unwind: "$claimBy"
            },
            {
                $lookup: {
                    from: "items", 
                    localField: "item",
                    foreignField: "_id",
                    as: "item"
                }
            },
            {
                $unwind: "$item"
            }
        ];

        if (status) {
            const statusArray = status.split('.').map(s => s.trim().toLowerCase());
            pipeline.push({
                $match: {
                    status: { 
                        $in: statusArray
                    }
                }
            });
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { 'status': searchRegex },
                        { 'claimBy.firstName': searchRegex },
                        { 'claimBy.lastName': searchRegex },
                        { 'claimBy.email': searchRegex },
                        { 'item.name': searchRegex },
                        { 'item.description': searchRegex }
                    ]
                }
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

        const claims = await ClaimItem.aggregate(pipeline);

        const totalClaimsArray = await ClaimItem.aggregate([
            ...countPipeline,
            { $count: 'total' }
        ]);
        
        const totalClaims = totalClaimsArray.length > 0 ? totalClaimsArray[0].total : 0;

        if (!claims || claims.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Claim Requests Found",
                claims: [],
                totalClaims: 0,
                currentPage: pageNumber,
                totalPages: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: "Claim Requests Fetched Successfully",
            claims,
            totalClaims,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalClaims / pageSize)
        });

    } catch (error) {
        console.error("Error Getting Claim Requests", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
            error: error.message
        });
    }
};

const handleUserClaims = async (req, res) => {
    try {
        const claims = await ClaimItem.find({ claimBy: req.user._id }).sort({ dateReported: -1 });
        if (!claims || claims.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No Claim Requests Found",
                claims: [],
            });
        }
        return res.status(200).json({
            success: true,
            message: "Claim Requests Fetched Successfully",
            claims,
        })
    } catch (error) {
        console.error("Error Getting Claim Requests", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}



module.exports = { handleClaimItem,handleGetAClaim, handleClaimVerification, handleGetClaims, handleUserClaims };