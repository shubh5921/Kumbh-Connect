const Person = require("../Models/person");
const Item = require("../Models/item");

const handleGetRecentActivities = async (req, res) => {
    try {
        const recentItems = await Item.find().sort({ dateReported: -1 }).limit(8).populate("reportedBy");
        const recentPeople = await Person.find().sort({ dateReported: -1 }).limit(3);

        return res.status(200).json({
            success: true, 
            recentItems, 
            recentPeople 
        });
    } catch (error) {
        console.error("Error fetching recent activities", error);
        res.status(500).json({ success: false, message: "Internal Server Issue, Please try again!" });
    }
};

module.exports = {handleGetRecentActivities};