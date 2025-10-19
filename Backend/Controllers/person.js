const Person = require("../Models/person");
const { z } = require("zod");
const Store = require("../Models/store");
const { sendPersonReturnEmail } = require("../Utils/sendPersonFoundMail");

const personSchemaValidate = z.object({
    name: z
        .string({
            required_error: "Person Name is required",
            invalid_type_error: "Person Name must be a string",
        }),
    description: z
        .string({
            required_error: "Person Description is required",
            invalid_type_error: "Person Description must be a string",
        }),
    age: z
        .number({
            required_error: "Person Age is required",
            invalid_type_error: "Person Age must be a number",
        }),
    guardian: z.object({
        name: z
            .string({
                required_error: "Guardian Name is required",
                invalid_type_error: "Guardian Name must be a string",
            }),
        phoneNumber: z
            .string({
                required_error: "Guardian Phone Number is required",
                invalid_type_error: "Guardian Phone Number must be a string",
            }),
        relation: z
            .string({
                required_error: "Guardian Relation is required",
                invalid_type_error: "Guardian Relation must be a string",
            }),
        address: z.object({
            street: z
                .string({ required_error: "Guardian Street is required" }),
            city: z
                .string({ required_error: "Guardian City is required" }),
            state: z
                .string({ required_error: "Guardian State is required" }),
            postalCode: z
                .string({ required_error: "Guardian Postal Code is required" }),
        }),
    }).optional(),
    status: z.enum(['lost', 'found', 'returned'], {
        required_error: "Item Status is required",
        invalid_type_error: "Invalid Item Status",
    }),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
    reportedBy: z
        .string({ required_error: "User ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid User ObjectId" }),
});

const mongooseIdVerify = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ID" });


const handleReportLost = async (req, res) => {
    try {
        const { name, description, age, guardian, location } = req.body;
        const reportedBy = req.user._id.toString();
        if (!reportedBy) {
            return res.status(401).json({
                success: false,
                message: "Invalid Request",
            });
        }

        const validate = personSchemaValidate.safeParse({
            name,
            description,
            age: Number(age),
            guardian: JSON.parse(guardian),
            location: JSON.parse(location),
            status: "lost",
            reportedBy,
        });

        if (validate.success) {
            const images = req.files.map((file) =>{
                return {
                    url: file.path
                }
            });
            const person = new Person({
                name,
                description,
                age: Number(age),
                guardian: JSON.parse(guardian),
                location: JSON.parse(location),
                images,
                status: "lost",
                reportedBy,
            });
            await person.save();

            return res.status(201).json({
                success: true,
                message: "Person Added Successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err) => err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Reporting Person", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleReportFound = async (req, res) => {
    try {
        const { name, description, age, centre } = req.body;
        const reportedBy = req.user._id.toString();
        const centerDetails = await Store.findById(JSON.parse(centre));
        if (!reportedBy || !centerDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid Request",
            });
        }

        const validate = personSchemaValidate.safeParse({
            name,
            description,
            age: Number(age),
            location: { longitude: centerDetails.longitude, latitude: centerDetails.latitude},
            status: "found",
            reportedBy,
        });

        if (validate.success) {
            const images = req.files.map((file) =>{
                return {
                    url: file.path
                }
            });
            const person = new Person({
                name,
                description,
                age: Number(age),
                centre: JSON.parse(centre),
                location: { longitude: centerDetails.longitude, latitude: centerDetails.latitude},
                images,
                status: "found",
                reportedBy,
            });
            await person.save();

            return res.status(201).json({
                success: true,
                message: "Report Submitted Succesfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err) => err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Reporting Person", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleUpdatePersonStatus = async (req, res) => {
    try {
        const id = req.params.id;

        const personId = mongooseIdVerify.safeParse(id).success ? id : null;
        if (!personId) {
            return res.status(404).json({
                success: false,
                message: "Person not Found.",
            });
        }

        const { 
            status="returned", 
            guardian
        } = req.body;
        const originalPerson = await Person.findById(personId).populate('reportedBy');
        if (!originalPerson) {
            return res.status(404).json({
                success: false,
                message: "Person not found.",
            });
        }

        if (status === 'returned' && originalPerson.status === 'found') {
            if (!guardian) {
                return res.status(400).json({
                    success: false,
                    message: "Guardian details are required when marking a found person as returned to home.",
                });
            }
        }

        let updateFields = {
            status,
            returnedOn: status === 'returned' ? new Date() : undefined,
            returnedToGuardian: true
        };

        if (status === 'returned' && originalPerson.status === 'found') {
            updateFields = {
                ...updateFields,
                guardian
            };
        }

        const person = await Person.findByIdAndUpdate(
            personId,
            { $set: updateFields },
            { new: true }
        ).populate('reportedBy');

        if(originalPerson.status=='lost'){
            await sendPersonReturnEmail(person.reportedBy.email, person);
        }
        

        return res.status(200).json({
            success: true,
            message: "Person Status Updated Successfully",
            person,
        });

    } catch (error) {
        console.error("Error Updating Person Status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
};

const handleDeletePerson = async (req, res) => {
    try {
        const user = req.user;
        const personId = req.params.id;

        if (!personId) {
            return res.status(409).json({
                success: false,
                message: "Invalid Person Id.",
            });
        }

        const person = await Person.findById(personId);

        if (!person) {
            return res.status(409).json({
                success: false,
                message: "Person not Found.",
            });
        }

        if (user.role !== 'admin' && person.reportedBy.toString() !== user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access.",
            });
        }

        await Person.findByIdAndDelete(personId);

        return res.status(200).json({
            success: true,
            message: "Person Record Deleted Successfully.",
        });

    } catch (error) {
        console.error("Error Deleting Person", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetPersons = async (req, res) => {
    try {
        const persons = await Person.find({})
            .populate("reportedBy")
            .sort({ 'dateReported': -1 });

        if (!persons || persons.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No persons found.",
                persons: [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Persons Fetched Successfully",
            persons,
        });

    } catch (error) {
        console.error("Error Fetching Persons", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetPersonsOfUser = async (req, res) => {
    try {
        const user = req.user._id;
        const persons = await Person.find({ reportedBy: user })
            .populate('reportedBy')
            .populate({
                path: 'centre',
                match: { someConditionField: { $exists: true } }
            })
            .sort({ 'dateReported': -1 });

        if (!persons || persons.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No persons found.",
                persons: [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Persons Fetched Successfully",
            persons,
        });

    } catch (error) {
        console.error("Error Fetching Persons", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetPersonById = async (req, res) => {
    try {
        const personId = mongooseIdVerify.safeParse(req.params.id).success ? req.params.id : null;
        if (!personId) {
            return res.status(404).json({
                success: false,
                message: "Invalid Person Id.",
                person: null,
            });
        }
        const person = await Person.findById(personId).populate("reportedBy centre")

        if (!person) {
            return res.status(404).json({
                success: false,
                message: "Person not Found.",
                person: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Person Fetched Successfully",
            person,
        });

    } catch (error) {
        console.error("Error Fetching Person", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleGetPersonByQuery = async (req, res) => {
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
                    { 'guardian.name': searchRegex },
                    { 'guardian.phoneNumber': searchRegex },
                    { 'guardian.relation': searchRegex },
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
                age: 1,
                status: 1,
                images: 1,
                guardian: 1,
                dateReported: 1,
                returnedOn: 1,
                returnedToGuardian: 1,
                reportedBy: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phoneNumber: 1
                }
            }
        });

        const [persons, totalPersonsArray] = await Promise.all([
            Person.aggregate(pipeline),
            Person.aggregate([
                ...countPipeline,
                { $count: 'total' }
            ])
        ]);

        const totalPersons = totalPersonsArray.length > 0 ? totalPersonsArray[0].total : 0;
        const totalPages = Math.ceil(totalPersons / pageSize);

        return res.status(200).json({
            success: true,
            message: persons.length ? "Persons Fetched Successfully" : "No Persons Found",
            persons,
            totalPersons,
            currentPage: pageNumber,
            totalPages,
            filters: {
                search,
                status,
                limit: pageSize
            }
        });

    } catch (error) {
        console.error("Error Getting Persons:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again!",
            error: error.message
        });
    }
};

module.exports = {
    handleReportFound,
    handleReportLost,
    handleUpdatePersonStatus,
    handleDeletePerson,
    handleGetPersons,
    handleGetPersonsOfUser,
    handleGetPersonById,
    handleGetPersonByQuery
};